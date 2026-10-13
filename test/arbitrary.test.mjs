// Arbitrary values: the shared parser and CSS generator in src/arbitrary/, and
// the bare color shorthand (bg-red, text-blue) in the static stylesheet.
import { describe, it, expect } from 'vitest';
import {
  parseClass, compileClass, ruleCss, arbitraryCss, scanArbitrary, kindOf, decodeValue, safeValue, families, variantNames,
} from '../src/arbitrary/index.mjs';
import { escapeClass, unescapeClass, selectorClasses } from '../bin/css.mjs';
import { generate } from '../src/generate.mjs';
import { variants } from '../src/variants.mjs';
import { palette } from '../src/palette.mjs';
import { read } from './helpers.mjs';

const decls = (cls) => parseClass(cls)?.decls;
const css = (cls) => compileClass(cls).rules.map(ruleCss).join('\n');
const built = generate();
const byName = new Map(built.classes.map((c) => [c.class, c]));
const statics = new Map(built.utilities.map((u) => [u.name, u]));

describe('parser', () => {
  const cases = [
    ['bg-[red]', [['background-color', 'red']]],
    ['bg-[#0ea5e9]', [['background-color', '#0ea5e9']]],
    ['bg-[oklch(0.7_0.15_200)]', [['background-color', 'oklch(0.7 0.15 200)']]],
    ['text-[13px]', [['font-size', '13px']]],
    ['text-[#eee]', [['color', '#eee']]],
    ['text-[large]', [['font-size', 'large']]],
    ['w-[37px]', [['width', '37px']]],
    ['h-[calc(100vh-4rem)]', [['height', 'calc(100vh - 4rem)']]],
    ['p-[3px_7px]', [['padding', '3px 7px']]],
    ['grid-cols-[200px_1fr]', [['grid-template-columns', '200px 1fr']]],
    ['grid-cols-[7]', [['grid-template-columns', 'repeat(7, minmax(0, 1fr))']]],
    ['rounded-[10px]', [['border-radius', '10px']]],
    ['top-[17%]', [['top', '17%']]],
    ['z-[999]', [['z-index', '999']]],
    ['font-[650]', [['font-weight', '650']]],
    ['font-[Inter,sans-serif]', [['font-family', 'Inter,sans-serif']]],
    ['leading-[1.1]', [['line-height', '1.1']]],
    ['tracking-[.02em]', [['letter-spacing', '.02em']]],
    ['opacity-[.35]', [['opacity', '.35']]],
    ['aspect-[4/3]', [['aspect-ratio', '4/3']]],
    ['border-[3px]', [['border-width', '3px']]],
    ['border-[thick]', [['border-width', 'thick']]],
    ['border-[red]', [['border-color', 'red']]],
    ['border-t-[#000]', [['border-top-color', '#000']]],
    ['border-x-[2px]', [['border-left-width', '2px'], ['border-right-width', '2px']]],
    ['bg-[url(/img.png)]', [['background-image', 'url(/img.png)']]],
    ['bg-[url(/my_photo.png)]', [['background-image', 'url(/my_photo.png)']]],
    ['bg-[linear-gradient(90deg,red,blue)]', [['background-image', 'linear-gradient(90deg,red,blue)']]],
    ['bg-[cover]', [['background-size', 'cover']]],
    ['bg-[center_top]', [['background-color', 'center top']]],
    ['bg-[position:center_top]', [['background-position', 'center top']]],
    ['bg-[length:200px_100px]', [['background-size', '200px 100px']]],
    ["content-['x']", [['content', "'x'"]]],
    ["content-['a_b']", [['content', "'a b'"]]],
    ['content-[a\\_b]', [['content', 'a_b']]],
    ['bg-(--brand)', [['background-color', 'var(--brand)']]],
    ['text-(length:--size)', [['font-size', 'var(--size)']]],
    ['w-[--sidebar]', [['width', 'var(--sidebar)']]],
    ['stroke-[2]', [['stroke-width', '2']]],
    ['stroke-[red]', [['stroke', 'red']]],
    ['decoration-[3px]', [['text-decoration-thickness', '3px']]],
    ['ring-offset-[3px]', [['--m-ring-offset-width', '3px']]],
    ['ring-[red]', [['--m-ring-color', 'red']]],
    ['shadow-[red]', [['--m-shadow-color', 'red']]],
    ['duration-[250]', [['transition-duration', '250ms']]],
    ['duration-[.4s]', [['transition-duration', '.4s']]],
    ['col-span-[5]', [['grid-column', 'span 5 / span 5']]],
    ['blur-[3px]', [['filter', 'blur(3px)']]],
    ['scale-x-[1.2]', [['scale', '1.2 1']]],
    ['-mt-[3px]', [['margin-top', '-3px']]],
    ['-translate-y-[var(--x)]', [['--m-ty', 'calc(var(--x) * -1)'], ['translate', 'var(--m-tx) var(--m-ty)']]],
    ['bg-[red]/50', [['background-color', 'color-mix(in oklab, red 50%, transparent)']]],
    ['[mask-type:luminance]', [['mask-type', 'luminance']]],
    ['[--gap:4px]', [['--gap', '4px']]],
  ];
  it.each(cases)('%s', (cls, expected) => {
    expect(decls(cls)).toEqual(expected);
  });

  it('parses variants, stacked and with brackets that contain colons', () => {
    expect(parseClass('md:hover:bg-[red]').variants).toEqual(['md', 'hover']);
    expect(parseClass('hover:[mask-type:luminance]').variants).toEqual(['hover']);
    expect(parseClass('@md:grid-cols-[1fr_2fr]').variants).toEqual(['@md']);
  });

  it('knows every static variant', () => {
    const names = variantNames();
    for (const v of variants) expect(names).toContain(v.name);
    for (const v of ['before', 'after', 'placeholder', 'open', 'checked']) expect(names).toContain(v);
  });

  it('classifies values', () => {
    expect(kindOf('#fff')).toBe('color');
    expect(kindOf('rgb(0 0 0/.2)')).toBe('color');
    expect(kindOf('12px')).toBe('length');
    expect(kindOf('calc(1px + 2px)')).toBe('length');
    expect(kindOf('1.5')).toBe('number');
    expect(kindOf('url(a.png)')).toBe('image');
    expect(kindOf('red')).toBe('ident');
    expect(kindOf('0 2px red')).toBe('any');
  });

  it('adds the spaces math needs, but leaves custom property names alone', () => {
    expect(decodeValue('calc(100%-var(--side-2))')).toBe('calc(100% - var(--side-2))');
    expect(decodeValue('min(10px+2vw,3rem)')).toBe('min(10px + 2vw,3rem)');
    expect(decodeValue('calc(-1*var(--x))')).toBe('calc(-1*var(--x))');
    expect(decodeValue('translate(-50%)')).toBe('translate(-50%)');
  });

  it('ignores static classes and unknown prefixes', () => {
    for (const c of ['p-4', 'bg-red', 'md:w-1/2', 'foo-[x]', 'bg-[]', 'bg-()', 'w-[1px]/50', '-w-[3px]', 'nope:bg-[red]', 'bg-(red)', 'bg-[red]x']) {
      expect(parseClass(c), c).toBeNull();
    }
  });
});

describe('safety', () => {
  const malicious = [
    'bg-[red;color:blue]', 'bg-[red}body{color:red]', 'bg-[red]{x}', 'w-[1px}]', 'bg-[@import_url(x)]',
    'content-[\'</style><script>alert(1)</script>\']', 'bg-[x</style>]', 'bg-[(]', 'bg-[red)]', 'w-[calc(1px]',
    "content-['x]", 'bg-[red_!important]', 'bg-[\\7d]', 'bg-[\\3b_color:red]', 'bg-[red/*x*/]',
    'bg-[expression(alert(1))]', 'bg-[url(javascript:alert(1))]', '[color:red;x:y]', '[Color:red]', '[x{y}:z]',
    '[color:red}]', 'w-[\u0000]', 'w-[a\nb]', `w-[${'1'.repeat(400)}px]`, 'hover:[@media_x:y]',
  ];
  it.each(malicious)('rejects %s', (cls) => {
    expect(parseClass(cls)).toBeNull();
    expect(compileClass(cls)).toBeNull();
  });

  it('never emits a rule that could break out', () => {
    const { css: out } = arbitraryCss(malicious);
    expect(out).toBe('');
  });

  it('safeValue checks balance and characters', () => {
    expect(safeValue('rgb(0 0 0)')).toBe(true);
    expect(safeValue("'a(b'")).toBe(true);
    expect(safeValue('a(b')).toBe(false);
    expect(safeValue('a]')).toBe(false);
    expect(safeValue('a;b')).toBe(false);
  });
});

describe('selector escaping', () => {
  const cases = [
    ['bg-[#0ea5e9]', '.bg-\\[\\#0ea5e9\\]'],
    ['md:w-[37px]', '.md\\:w-\\[37px\\]'],
    ['@md:grid-cols-[1fr_2fr]', '.\\@md\\:grid-cols-\\[1fr_2fr\\]'],
    ['w-[calc(100%-1rem)]', '.w-\\[calc\\(100\\%-1rem\\)\\]'],
    ["content-['x']", ".content-\\[\\'x\\'\\]"],
    ['bg-(--brand)', '.bg-\\(--brand\\)'],
    ['[mask-type:luminance]', '.\\[mask-type\\:luminance\\]'],
    ['bg-[red]/50', '.bg-\\[red\\]\\/50'],
    ['aspect-[4/3]', '.aspect-\\[4\\/3\\]'],
    ['opacity-[.35]', '.opacity-\\[\\.35\\]'],
  ];
  it.each(cases)('%s', (cls, sel) => {
    expect(`.${escapeClass(cls)}`).toBe(sel);
    expect(compileClass(cls).rules[0].sel).toBe(sel);
    expect(selectorClasses(sel)).toEqual([cls]);
    expect(unescapeClass(sel.slice(1))).toBe(cls);
  });
});

describe('generated CSS', () => {
  it('writes one rule per class', () => {
    expect(css('w-[37px]')).toBe('.w-\\[37px\\]{width:37px}');
    expect(css('shadow-[0_2px_8px_rgb(0_0_0/.2)]')).toBe(
      '.shadow-\\[0_2px_8px_rgb\\(0_0_0\\/\\.2\\)\\]{--m-shadow:0 2px 8px rgb(0 0 0/.2);box-shadow:var(--m-ring-offset-shadow), var(--m-ring-shadow), var(--m-shadow)}',
    );
    expect(css('translate-x-[12px]')).toBe('.translate-x-\\[12px\\]{--m-tx:12px;translate:var(--m-tx) var(--m-ty)}');
  });

  it('uses the selector wrappers of the static families', () => {
    expect(css('space-x-[3px]')).toBe(':where(.space-x-\\[3px\\] > :not(:last-child)){margin-inline-end:3px}');
    expect(css('placeholder-[red]')).toBe('.placeholder-\\[red\\]::placeholder{color:red}');
    expect(css('divide-[red]')).toBe(':where(.divide-\\[red\\] > :not(:last-child)){border-color:red}');
  });

  it('covers every family with a value that parses', () => {
    const sample = { aspect: '4/3', 'grid-cols': '1fr_2fr', content: "'x'", list: 'square', cursor: 'pointer', ease: 'linear', 'mix-blend': 'multiply', 'will-change': 'top', animate: 'spin_1s', transition: 'top', object: 'top', align: 'top' };
    expect(Object.keys(families).length).toBeGreaterThan(110);
    for (const f of Object.keys(families)) {
      const cls = `${f}-[${sample[f] || '3px'}]`;
      const c = compileClass(cls);
      expect(c, cls).not.toBeNull();
      for (const [p, v] of c.rules[0].decls) {
        expect(p).toMatch(/^(--|-webkit-)?[a-z-]+$/);
        expect(v).not.toMatch(/[;{}]/);
      }
    }
  });

  // Each family writes the same properties as the static classes with the same prefix.
  it('matches the static utilities of the same prefix', () => {
    const suffixes = ['px', '1', '2', '4', '0', '50', '10', '12', 'auto', 'md', 'primary', 'none', 'normal', 'pointer', 'linear', 'top', 'baseline', 'disc', 'multiply'];
    const checked = [];
    // object-[...] is a position (object-[25%_75%]) where the static object-cover is a fit, and
    // content-[...] is the content property where the static content-center is align-content.
    const differs = new Set(['object', 'content']);
    for (const [f, build] of Object.entries(families)) {
      if (differs.has(f)) continue;
      const suf = f === 'transition' ? 'colors' : suffixes.find((s) => statics.has(`${f}-${s}`));
      if (!suf) continue;
      const u = statics.get(`${f}-${suf}`);
      const props = u.decls.map(([p]) => p);
      // A numeric suffix is a size on the static scale, anything else is a keyword or a color.
      const value = /^(\d|px)/.test(suf) ? '1px' : u.decls[u.decls.length - 1][1];
      const mine = build(value, suf === 'primary' ? 'color' : kindOf(value)).map(([p]) => p);
      for (const p of mine) expect(props, `${f} vs ${u.name}`).toContain(p);
      checked.push(f);
    }
    expect(checked.length).toBeGreaterThan(80);
  });
});

describe('variants', () => {
  it('wraps breakpoints, containers and media in their at-rules', () => {
    expect(css('md:w-[37px]')).toBe('@media (min-width: 768px){.md\\:w-\\[37px\\]{width:37px}}');
    expect(css('@md:grid-cols-[1fr_2fr]')).toBe('@container (min-width: 28rem){.\\@md\\:grid-cols-\\[1fr_2fr\\]{grid-template-columns:1fr 2fr}}');
    expect(css('print:w-[1px]')).toBe('@media print{.print\\:w-\\[1px\\]{width:1px}}');
    expect(css('forced-colors:border-[2px]')).toContain('@media (forced-colors: active){');
    expect(css('motion-safe:duration-[1s]')).toContain('@media (prefers-reduced-motion: no-preference){');
  });

  it('applies state, group, peer and direction selectors', () => {
    expect(css('hover:bg-[red]')).toBe('.hover\\:bg-\\[red\\]:hover{background-color:red}');
    expect(css('group-hover:text-[red]')).toBe('.group:hover .group-hover\\:text-\\[red\\]{color:red}');
    expect(css('peer-checked:w-[1px]')).toBe('.peer:checked ~ .peer-checked\\:w-\\[1px\\]{width:1px}');
    expect(css('rtl:ml-[3px]')).toBe('.rtl\\:ml-\\[3px\\]:where([dir=rtl], [dir=rtl] *){margin-left:3px}');
    expect(css('ltr:ml-[3px]')).toContain(':where([dir=ltr], [dir=ltr] *)');
  });

  it('dark: uses the same three forms as the static dark variant', () => {
    const rules = compileClass('dark:text-[#eee]').rules;
    expect(rules).toHaveLength(3);
    const staticDark = read('dist/monsoon.min.css');
    expect(staticDark).toContain('@scope (.dark, [data-theme=dark]) to (.light, [data-theme=light])');
    expect(rules[1].at).toEqual(['@scope (.dark, [data-theme=dark]) to (.light, [data-theme=light])']);
    expect(rules[2].at).toEqual(['@media (prefers-color-scheme: dark)']);
    expect(rules[0].sel.startsWith('.dark\\:text-\\[\\#eee\\]:where(')).toBe(true);
  });

  it('stacks variants with the leftmost one outermost', () => {
    expect(css('md:hover:bg-[red]')).toBe('@media (min-width: 768px){.md\\:hover\\:bg-\\[red\\]:hover{background-color:red}}');
    expect(css('print:md:w-[1px]')).toBe('@media print{@media (min-width: 768px){.print\\:md\\:w-\\[1px\\]{width:1px}}}');
  });

  it('puts pseudo elements last', () => {
    expect(css("hover:before:content-['x']")).toBe(".hover\\:before\\:content-\\[\\'x\\'\\]:hover::before{content:'x'}");
    expect(css("before:hover:content-['x']")).toBe(".before\\:hover\\:content-\\[\\'x\\'\\]:hover::before{content:'x'}");
  });

  it('sorts rules like the static stylesheet: base, states, breakpoints, containers, media', () => {
    const { classes } = arbitraryCss(['print:w-[1px]', '@sm:w-[2px]', 'xl:w-[3px]', 'md:w-[4px]', 'hover:w-[5px]', 'w-[6px]']);
    expect(classes).toEqual(['w-[6px]', 'hover:w-[5px]', 'md:w-[4px]', 'xl:w-[3px]', '@sm:w-[2px]', 'print:w-[1px]']);
  });
});

describe('scanner', () => {
  it('finds arbitrary classes in markup and code', () => {
    const text = `<div class="md:w-[37px] bg-[red] p-4" data-x='content-["x"]'>{cn("text-[13px]", on && 'grid-cols-[200px_1fr]')}</div>
      <i class="[mask-type:luminance] bg-(--brand)/50 hover:bg-[oklch(0.7_0.15_200)]"></i> ['bg-[#fff]','p-2'] arr[i] fn(x) foo-[bar]`;
    expect([...scanArbitrary(text)].sort()).toEqual([
      '[mask-type:luminance]', 'bg-(--brand)/50', 'bg-[#fff]', 'bg-[red]', 'content-["x"]', 'grid-cols-[200px_1fr]',
      'hover:bg-[oklch(0.7_0.15_200)]', 'md:w-[37px]', 'text-[13px]',
    ]);
  });

  it('skips unsafe candidates', () => {
    expect([...scanArbitrary('<b class="bg-[red;x:y] w-[1px]">')]).toEqual(['w-[1px]']);
  });
});

describe('bare color shorthand', () => {
  const hues = Object.keys(palette);
  const prefixes = ['text', 'bg', 'border', 'ring', 'outline', 'decoration', 'fill', 'stroke', 'shadow', 'from', 'via', 'to'];

  it('exists for every hue and every color utility', () => {
    expect(hues).toHaveLength(22);
    for (const p of prefixes) for (const h of hues) expect(byName.has(`${p}-${h}`), `${p}-${h}`).toBe(true);
  });

  it('is step 500 in light mode and 400 in dark mode, following --mode', () => {
    const c = byName.get('bg-red');
    expect(c.css).toContain('background-color: color-mix(in oklab, var(--color-red-400) calc(var(--mode) * 100%), var(--color-red-500));');
    expect(byName.get('text-blue').css).toContain('color: color-mix(in oklab, var(--color-blue-400) calc(var(--mode) * 100%), var(--color-blue-500))');
    expect(byName.get('border-emerald').css).toContain('border-color: color-mix(');
  });

  it('gets hover: for text, bg and border only, to keep the bundle small', () => {
    expect(byName.get('bg-red').variants).toContain('hover');
    expect(byName.get('ring-red').variants).toEqual([]);
    expect(read('dist/monsoon.min.css')).toContain('.hover\\:bg-red:hover{background-color:color-mix(');
  });
});
