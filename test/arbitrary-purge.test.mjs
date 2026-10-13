// The purge CLI compiles every arbitrary value class it finds into static
// rules, with the same parser as the runtime engine.
import { describe, it, expect, beforeAll } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { main, purgeCss } from '../bin/monsoon.mjs';
import { arbitraryCss } from '../src/arbitrary/index.mjs';
import { read } from './helpers.mjs';

const css = read('dist/monsoon.css');
let dir;

function capture() {
  const out = { log: [], error: [], write: [] };
  return { out, io: { log: (s) => out.log.push(s), error: (s) => out.error.push(s), write: (s) => out.write.push(s) } };
}

async function purge(args) {
  const { io, out } = capture();
  const cwd = process.cwd();
  process.chdir(dir);
  try {
    const code = await main(args, io);
    return { code, out };
  } finally {
    process.chdir(cwd);
  }
}

beforeAll(() => {
  dir = mkdtempSync(join(tmpdir(), 'monsoon-arb-'));
  mkdirSync(join(dir, 'src'), { recursive: true });
  writeFileSync(
    join(dir, 'src', 'index.html'),
    `<div class="p-4 bg-red md:w-[37px] bg-[#0ea5e9] hover:bg-[red] dark:text-[#eee] @md:grid-cols-[1fr_2fr]">
       <p class="[mask-type:luminance] bg-(--brand) h-[calc(100vh-4rem)] bg-[red;color:blue]">x</p>
     </div>`,
  );
  writeFileSync(join(dir, 'src', 'app.jsx'), 'export const A = () => <i className={cn("text-[13px]", on && "print:hidden")} />;');
});

describe('purge compiles arbitrary values', () => {
  it('appends static rules for every arbitrary class found', async () => {
    const outFile = join(dir, 'out.css');
    const { code, out } = await purge(['purge', 'src/**/*.{html,jsx}', '-o', outFile]);
    expect(code).toBe(0);
    const result = readFileSync(outFile, 'utf8');
    for (const s of [
      '.p-4{padding:1rem}',
      '.bg-red{background-color:color-mix(',
      '.bg-\\[\\#0ea5e9\\]{background-color:#0ea5e9}',
      '.hover\\:bg-\\[red\\]:hover{background-color:red}',
      '@media (min-width:768px){.md\\:w-\\[37px\\]{width:37px}}',
      '@container (min-width:28rem){.\\@md\\:grid-cols-\\[1fr_2fr\\]{grid-template-columns:1fr 2fr}}',
      '.\\[mask-type\\:luminance\\]{mask-type:luminance}',
      '.bg-\\(--brand\\){background-color:var(--brand)}',
      '.h-\\[calc\\(100vh-4rem\\)\\]{height:calc(100vh - 4rem)}',
      '.text-\\[13px\\]{font-size:13px}',
      '.dark\\:text-\\[\\#eee\\]:where(',
    ]) expect(result).toContain(s);
    expect(result).not.toContain('color:blue');
    expect(out.error.join('\n')).toMatch(/compiled 9 arbitrary value classes/);
  });

  it('puts arbitrary rules after the static utilities, base rules before variants', async () => {
    const { out } = await purge(['purge', 'src/index.html']);
    const text = out.write.join('');
    expect(text.indexOf('.p-4{')).toBeLessThan(text.indexOf('.bg-\\[\\#0ea5e9\\]'));
    expect(text.indexOf('.bg-\\[\\#0ea5e9\\]')).toBeLessThan(text.indexOf('.hover\\:bg-\\[red\\]'));
    expect(text.indexOf('.hover\\:bg-\\[red\\]')).toBeLessThan(text.indexOf('.md\\:w-\\[37px\\]'));
  });

  it('writes readable CSS with --no-minify', async () => {
    const { out } = await purge(['purge', 'src/index.html', '--no-minify']);
    const text = out.write.join('');
    expect(text).toContain('/* monsoon:arbitrary */');
    expect(text).toContain('.md\\:w-\\[37px\\] {\n    width: 37px;\n  }');
  });

  it('compiles arbitrary classes from --safelist and skips them with --no-arbitrary', async () => {
    const a = await purge(['purge', 'src/app.jsx', '--safelist', 'w-[99px]']);
    expect(a.out.write.join('')).toContain('.w-\\[99px\\]{width:99px}');
    const b = await purge(['purge', 'src/index.html', '--no-arbitrary']);
    expect(b.out.write.join('')).not.toContain('37px');
  });

  it('purgeCss takes the arbitrary list directly', () => {
    const { css: out, stats } = purgeCss(css, new Set(['p-4']), { arbitrary: ['w-[1px]', 'nope-[x]', 'w-[1px]'] });
    expect(stats.arbitrary).toBe(1);
    expect(out).toContain('.w-\\[1px\\]{width:1px}');
  });

  it('is the same CSS the runtime would write', () => {
    const { css: compiled } = arbitraryCss(['md:w-[37px]']);
    expect(compiled).toBe('@media (min-width: 768px){.md\\:w-\\[37px\\]{width:37px}}');
  });
});
