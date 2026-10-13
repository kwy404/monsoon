import { describe, it, expect, beforeAll } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { main, glob, globToRegExp, expandBraces, extractCandidates, purgeCss, listClasses } from '../bin/monsoon.mjs';
import { root, read } from './helpers.mjs';

const bin = join(root, 'bin', 'monsoon.mjs');
const css = read('dist/monsoon.css');

function capture() {
  const out = { log: [], error: [], write: [] };
  return {
    out,
    io: { log: (s) => out.log.push(s), error: (s) => out.error.push(s), write: (s) => out.write.push(s) },
  };
}

let dir;
beforeAll(() => {
  dir = mkdtempSync(join(tmpdir(), 'monsoon-'));
  mkdirSync(join(dir, 'src', 'pages'), { recursive: true });
  mkdirSync(join(dir, 'node_modules', 'x'), { recursive: true });
  writeFileSync(
    join(dir, 'src', 'index.html'),
    '<div class="p-4 md:grid-cols-3 hover:bg-primary w-1/2 @md:flex dark:bg-slate-800">x</div>',
  );
  writeFileSync(
    join(dir, 'src', 'pages', 'app.jsx'),
    'export const A = () => <b className={`text-primary ${on ? "group-hover:text-primary" : ""}`} />;',
  );
  writeFileSync(join(dir, 'src', 'pages', 'card.vue'), `<template><p :class="{ 'p-0.5': on }" class="group">v</p></template>`);
  writeFileSync(join(dir, 'src', 'notes.txt'), 'p-8 should not be scanned');
  writeFileSync(join(dir, 'node_modules', 'x', 'a.html'), '<i class="p-12"></i>');
});

describe('glob', () => {
  it('expands braces', () => {
    expect(expandBraces('src/**/*.{html,js}')).toEqual(['src/**/*.html', 'src/**/*.js']);
  });

  it('converts globs to regular expressions', () => {
    expect(globToRegExp('**/*.html').test('a/b/c.html')).toBe(true);
    expect(globToRegExp('**/*.html').test('c.html')).toBe(true);
    expect(globToRegExp('*.html').test('a/c.html')).toBe(false);
  });

  it('finds files and skips node_modules', () => {
    const files = glob(['src/**/*.{html,jsx,vue}'], dir).map((f) => f.replace(/\\/g, '/'));
    expect(files).toHaveLength(3);
    expect(files.some((f) => f.includes('node_modules'))).toBe(false);
    expect(glob(['**/*.html'], dir)).toHaveLength(1);
  });
});

describe('purge', () => {
  it('extracts class candidates from markup and code', () => {
    const c = extractCandidates('<a class="md:p-4 w-1/2">x</a> cn("flex", on && "gap-2")');
    for (const k of ['md:p-4', 'w-1/2', 'flex', 'gap-2']) expect(c.has(k)).toBe(true);
  });

  it('keeps used classes and drops unused ones', () => {
    const { css: out, stats } = purgeCss(css, new Set(['p-4', 'md:grid-cols-3', 'hover:bg-primary']));
    expect(out).toContain('.p-4{padding:1rem}');
    expect(out).toContain('.md\\:grid-cols-3{');
    expect(out).toContain('.hover\\:bg-primary:hover{');
    expect(out).not.toContain('.p-8{');
    expect(out).not.toContain('.bg-primary{');
    expect(out).toContain('--seed:');
    expect(out).toContain('@keyframes m-spin');
    expect(out).toContain('@layer base{');
    expect(stats.kept).toBe(3);
  });

  it('writes the output file through the CLI', async () => {
    const outFile = join(dir, 'public', 'monsoon.css');
    const { io, out } = capture();
    const cwd = process.cwd();
    process.chdir(dir);
    try {
      const code = await main(['purge', 'src/**/*.{html,php,js,jsx,tsx,vue}', '-o', outFile, '--safelist', 'mt-8'], io);
      expect(code).toBe(0);
    } finally {
      process.chdir(cwd);
    }
    const result = readFileSync(outFile, 'utf8');
    const wanted = [
      '.p-4{', '.md\\:grid-cols-3{', '.w-1\\/2{', '.\\@md\\:flex{', '.text-primary{',
      '.group:hover .group-hover\\:text-primary{', '.p-0\\.5{', '.mt-8{', '.dark\\:bg-slate-800:where(',
    ];
    for (const s of wanted) expect(result).toContain(s);
    expect(result).not.toContain('.p-8{');
    expect(result).not.toContain('.p-12{');
    expect(out.error.join('\n')).toMatch(/kept \d+ of \d+ utility rules/);
    expect(out.error.join('\n')).toMatch(/brotli/);
  });

  it('fails clearly when nothing matches', async () => {
    const { io, out } = capture();
    expect(await main(['purge', join(dir, 'nothing/**/*.html')], io)).toBe(1);
    expect(out.error[0]).toMatch(/No files matched/);
  });
});

describe('classes command', () => {
  it('lists base and variant classes', () => {
    const list = listClasses(css);
    for (const c of ['p-4', 'md:p-4', '2xl:p-4', '@md:flex', 'w-1/2', 'hover:bg-primary', 'dark:bg-slate-800']) {
      expect(list).toContain(c);
    }
    expect(list).not.toContain('group');
    expect(list).not.toContain('dark');
  });

  it('supports --filter and --json', async () => {
    const { io, out } = capture();
    expect(await main(['classes', '--filter', 'grid-cols-1', '--json'], io)).toBe(0);
    const parsed = JSON.parse(out.log[0]);
    expect(parsed).toContain('grid-cols-12');
    expect(parsed.every((c) => c.includes('grid-cols-1'))).toBe(true);
  });

  it('runs as an executable', () => {
    const r = spawnSync(process.execPath, [bin, '--help'], { encoding: 'utf8' });
    expect(r.status).toBe(0);
    expect(r.stdout).toContain('monsooncss purge');
    const c = spawnSync(process.execPath, [bin, 'classes'], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
    expect(c.status).toBe(0);
    expect(c.stdout.split(/\r?\n/)).toContain('md:p-4');
  });
});
