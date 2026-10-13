// Fluid type and space, and the print:, screen:, rtl:, ltr: and
// forced-colors: variants.
import { describe, it, expect } from 'vitest';
import { generate } from '../src/generate.mjs';
import { fluid, fluidFontSizes, fluidSpacing, FLUID_FROM, FLUID_TO } from '../src/utilities/fluid.mjs';
import { DIR_UTILITY, FORCED_UTILITY } from '../src/variants.mjs';
import { read } from './helpers.mjs';

const min = read('dist/monsoon.min.css');
const built = generate();
const classes = new Map(built.classes.map((c) => [c.class, c]));

// Evaluates clamp(a rem, b rem + c vw, d rem) at a viewport width in rem.
function at(value, vwRem) {
  const m = value.match(/^clamp\(([\d.]+)rem, ([\d.-]+)rem \+ ([\d.]+)vw, ([\d.]+)rem\)$/);
  expect(m, value).toBeTruthy();
  const [lo, base, slope, hi] = m.slice(1).map(Number);
  return Math.min(hi, Math.max(lo, base + (slope * vwRem) / 100));
}

describe('fluid utilities', () => {
  it('interpolates from the mobile size to the desktop size', () => {
    const v = fluid(1, 2);
    expect(at(v, FLUID_FROM)).toBeCloseTo(1, 3);
    expect(at(v, FLUID_TO)).toBeCloseTo(2, 3);
    expect(at(v, (FLUID_FROM + FLUID_TO) / 2)).toBeCloseTo(1.5, 3);
    expect(at(v, 10)).toBe(1);
    expect(at(v, 200)).toBe(2);
  });

  it('mixes rem into the preferred value so browser zoom and font size still apply', () => {
    for (const [lo, hi] of Object.values(fluidSpacing)) expect(fluid(lo, hi)).toMatch(/rem \+ [\d.]+vw/);
  });

  it('generates text-fluid-sm to text-fluid-6xl with growing sizes', () => {
    const keys = ['sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl'];
    expect(Object.keys(fluidFontSizes)).toEqual(keys);
    let last = 0;
    for (const k of keys) {
      const c = classes.get(`text-fluid-${k}`);
      expect(c.category).toBe('typography');
      expect(c.css).toContain('font-size: clamp(');
      expect(c.css).toContain('line-height:');
      const [lo, hi] = fluidFontSizes[k];
      expect(hi).toBeGreaterThan(lo);
      expect(lo).toBeGreaterThan(last);
      last = lo;
    }
    expect(min).toContain('.text-fluid-6xl{font-size:clamp(2.25rem,1.663rem + 2.6087vw,3.75rem);line-height:1.05}');
  });

  it('generates fluid padding, margin and gap on one scale', () => {
    const props = { p: 'padding', px: 'padding-inline', py: 'padding-block', m: 'margin', gap: 'gap' };
    for (const [prefix, prop] of Object.entries(props)) {
      for (const [k, [lo, hi]] of Object.entries(fluidSpacing)) {
        const c = classes.get(`${prefix}-fluid-${k}`);
        expect(c, `${prefix}-fluid-${k}`).toBeTruthy();
        expect(c.css).toContain(`${prop}: ${fluid(lo, hi)};`);
      }
    }
    expect(min).toContain('.gap-fluid-md{gap:clamp(1rem,.6087rem + 1.7391vw,2rem)}');
  });

  it('lists 44 fluid classes in classes.json', () => {
    const data = JSON.parse(read('scripts/classes.json'));
    expect(data.classes.filter((c) => c.class.includes('-fluid-')).length).toBe(9 + 5 * 7);
  });
});

describe('media variants', () => {
  const lastBreakpoint = min.indexOf('@media (min-width:1536px)');

  it('adds print: and screen: to the breakpoint set, hidden and block included', () => {
    expect(min).toContain('@media print{.print\\:block{display:block}');
    expect(min).toContain('.print\\:hidden{display:none}');
    expect(min).toContain('@media screen{.screen\\:block{display:block}');
    expect(min).toContain('.screen\\:hidden{display:none}');
    const md = built.classes.filter((c) => c.variants.includes('md')).map((c) => c.class);
    for (const v of ['print', 'screen']) {
      expect(built.classes.filter((c) => c.variants.includes(v)).map((c) => c.class)).toEqual(md);
    }
  });

  it('emits media variants after the breakpoints so print:hidden beats md:block', () => {
    expect(lastBreakpoint).toBeGreaterThan(0);
    expect(min.indexOf('@media print{')).toBeGreaterThan(lastBreakpoint);
    expect(min.indexOf('@media (forced-colors:active){.forced-colors')).toBeGreaterThan(lastBreakpoint);
  });

  it('adds forced-colors: for display, borders, outlines and underlines', () => {
    expect(min).toContain('.forced-colors\\:border{');
    expect(min).toContain('.forced-colors\\:outline-2{');
    expect(min).toContain('.forced-colors\\:hidden{display:none}');
    expect(min).toContain('.forced-colors\\:forced-color-adjust-none{forced-color-adjust:none}');
    const names = built.classes.filter((c) => c.variants.includes('forced-colors')).map((c) => c.class);
    for (const n of names) expect(n).toMatch(FORCED_UTILITY);
    expect(names).not.toContain('bg-primary');
  });

  it('keeps motion-safe: and motion-reduce:', () => {
    expect(min).toContain('@media (prefers-reduced-motion:no-preference){.motion-safe\\:');
    expect(min).toContain('@media (prefers-reduced-motion:reduce){.motion-reduce\\:');
  });
});

describe('direction variants', () => {
  it('adds rtl: and ltr: that follow the nearest dir attribute', () => {
    expect(min).toContain('.rtl\\:ml-4:where([dir=rtl],[dir=rtl] *){margin-left:1rem}');
    expect(min).toContain('.ltr\\:ml-4:where([dir=ltr],[dir=ltr] *){margin-left:1rem}');
    expect(min).toContain('.rtl\\:text-right:where([dir=rtl],[dir=rtl] *){text-align:right}');
    expect(min).toContain('.rtl\\:-translate-x-1\\/2:where([dir=rtl],[dir=rtl] *){');
  });

  it('only applies to utilities that name a physical side', () => {
    const names = built.classes.filter((c) => c.variants.includes('rtl')).map((c) => c.class);
    expect(names.length).toBeGreaterThan(100);
    for (const n of names) expect(n).toMatch(DIR_UTILITY);
    for (const n of ['mt-4', 'p-4', 'bg-primary', 'ms-4', 'text-start']) expect(names).not.toContain(n);
    expect(built.classes.filter((c) => c.variants.includes('ltr')).map((c) => c.class)).toEqual(names);
  });
});
