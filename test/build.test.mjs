import { describe, it, expect } from 'vitest';
import { transform } from 'lightningcss';
import { generate, collectUtilities } from '../src/generate.mjs';
import { parse, serialize, sizes } from '../bin/css.mjs';
import { read } from './helpers.mjs';

const pkg = JSON.parse(read('package.json'));
const built = generate({ version: pkg.version });
const min = read('dist/monsoon.min.css');

describe('build output', () => {
  it('matches the committed dist files', () => {
    expect(read('dist/monsoon.css')).toBe(built.css);
    expect(min).toBe(`${built.min}\n`);
  });

  const expected = [
    '.p-4{padding:1rem}',
    '.px-2\\.5{padding-inline:.625rem}',
    '.p-0\\.5{padding:.125rem}',
    '.w-1\\/2{width:50%}',
    '.-mt-4{margin-top:-1rem}',
    '.mx-auto{margin-inline:auto}',
    '.flex{display:flex}',
    '.hidden{display:none}',
    '.grid-cols-12{grid-template-columns:repeat(12,minmax(0,1fr))}',
    '.col-span-full{grid-column:1 / -1}',
    '.text-9xl{font-size:8rem;line-height:1}',
    '.font-black{font-weight:900}',
    '.truncate{',
    '.line-clamp-3{',
    '.bg-primary{background-color:var(--primary)}',
    '.text-primary-foreground{color:var(--primary-foreground)}',
    '.bg-blue-500{background-color:var(--color-blue-500)}',
    '.text-rose-950{color:var(--color-rose-950)}',
    '.bg-black\\/50{background-color:color-mix(in oklab,#000 50%,transparent)}',
    '.rounded-xl{border-radius:.75rem}',
    '.shadow-lg{',
    '.ring-2{',
    '.max-w-7xl{max-width:80rem}',
    '.max-w-prose{max-width:65ch}',
    '.h-dvh{height:100dvh}',
    '.aspect-video{aspect-ratio:16 / 9}',
    '.sr-only{',
    '.animate-spin{animation:m-spin 1s linear infinite}',
    '@keyframes m-spin',
    '.backdrop-blur-md{',
    ':where(.space-y-4>:not(:last-child)){margin-block-end:1rem}',
    '.hover\\:bg-primary:hover{',
    '.hover\\:bg-primary\\/90:hover{',
    '.focus-visible\\:ring-2:focus-visible{',
    '.active\\:scale-95:active{',
    '.disabled\\:opacity-50:disabled{',
    '.group:hover .group-hover\\:text-primary{',
    '.peer:checked~.peer-checked\\:bg-primary{',
    '.odd\\:bg-muted:nth-child(odd){',
    '.last\\:border-0:last-child{',
    '.dark\\:bg-slate-800:where(.dark,.dark *,[data-theme=dark],[data-theme=dark] *){',
    '.dark\\:bg-slate-800:where(:root:not(.light,[data-theme=light]) *){',
    '@media (prefers-reduced-motion:reduce){.motion-reduce\\:',
    '.motion-reduce\\:transition-none{transition-property:none}',
    '@media (min-width:768px){.container{max-width:768px}',
    '.md\\:grid-cols-3{',
    '.\\32 xl\\:p-4{padding:1rem}',
    '@container (min-width:28rem){',
    '.\\@md\\:flex{display:flex}',
    '.\\@container{container-type:inline-size}',
  ];

  it.each(expected)('contains %s', (needle) => {
    expect(min).toContain(needle);
  });

  it('defines the seed tokens with relative color syntax and a static fallback', () => {
    expect(min).toContain('--seed:oklch(.55 .22 262)');
    expect(min).toContain(':root,.theme,.dark,.light,[data-theme],[style*="--seed"]{--_seed:oklch(from var(--seed)');
    expect(min).toContain('@supports not (color:oklch(from red l c h))');
    expect(min).toContain('@media (prefers-color-scheme:dark){:root:not(.light,[data-theme=light]){--mode:1');
  });

  it('keeps the base reset in a cascade layer', () => {
    expect(min).toContain('@layer base{');
  });

  it('has no duplicate utilities and only well formed class names', () => {
    const names = collectUtilities().map((u) => u.name);
    expect(new Set(names).size).toBe(names.length);
    for (const n of names) expect(n).toMatch(/^-?@?[a-z0-9]([a-z0-9./-]*[a-z0-9])?$/);
  });
});

describe('css validity', () => {
  it('minified css parses without warnings', () => {
    const r = transform({ filename: 'monsoon.min.css', code: Buffer.from(min), errorRecovery: false });
    expect(r.warnings).toEqual([]);
  });

  it('readable css parses without warnings', () => {
    const r = transform({ filename: 'monsoon.css', code: Buffer.from(built.css), errorRecovery: false });
    expect(r.warnings).toEqual([]);
  });

  it('own parser round trips the minified file', () => {
    expect(serialize(parse(built.min), { minify: true })).toBe(built.min);
  });
});

describe('size budget', () => {
  it('stays under 80 kB brotli for the full minified file', async () => {
    const s = await sizes(min);
    expect(s.brotli).toBeLessThan(80 * 1024);
  });
});

describe('classes.json', () => {
  it('lists every base class with category, css and variants', () => {
    const data = JSON.parse(read('scripts/classes.json'));
    expect(data.count).toBe(data.classes.length);
    expect(data.classes.length).toBe(built.classes.length);
    const p4 = data.classes.find((c) => c.class === 'p-4');
    expect(p4.category).toBe('spacing');
    expect(p4.css).toContain('padding: 1rem;');
    expect(p4.variants).toEqual(expect.arrayContaining(['sm', 'md', 'lg', 'xl', '2xl', '@md']));
    const bg = data.classes.find((c) => c.class === 'bg-primary');
    expect(bg.variants).toEqual(expect.arrayContaining(['hover', 'focus', 'active']));
  });
});
