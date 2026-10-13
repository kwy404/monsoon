// Light and dark mode: the dark: variant must follow the same rule as the
// tokens. An element is dark when its nearest themed ancestor (itself
// included) is .dark or [data-theme=dark], light when it is .light or
// [data-theme=light], and follows the OS when there is none.
//
// The selectors the build writes are checked with a small matcher (classes,
// attributes, *, :root, :is, :where, :not and the descendant combinator) on
// every nesting of themed sections up to five levels deep.
import { describe, it, expect } from 'vitest';
import { DARK, LIGHT, DARK_SELF, DARK_SCOPE, DARK_OS, stateVariants } from '../src/variants.mjs';
import { THEME_SCOPE, SECTION, tokensCss } from '../src/base.mjs';
import { resolveTokens } from '../src/theme.mjs';
import { contrast, hexToRgb, srgbToOklch } from '../src/color.mjs';
import { read } from './helpers.mjs';

// ---- A tiny selector matcher ----

function splitTop(text, sep) {
  const out = [];
  let depth = 0;
  let cur = '';
  for (const ch of text) {
    if (ch === '(' || ch === '[') depth++;
    if (ch === ')' || ch === ']') depth--;
    if (depth === 0 && sep.test(ch)) {
      if (cur.trim()) out.push(cur.trim());
      cur = '';
    } else cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

const parsed = new Map();
function list(text) {
  if (!parsed.has(text)) parsed.set(text, splitTop(text, /,/).map((complex) => splitTop(complex, /\s/)));
  return parsed.get(text);
}

function closing(text, open) {
  let depth = 0;
  for (let i = open; i < text.length; i++) {
    if (text[i] === '(') depth++;
    if (text[i] === ')' && --depth === 0) return i;
  }
  throw new Error(`Unbalanced: ${text}`);
}

function matchCompound(compound, el) {
  let i = 0;
  while (i < compound.length) {
    const rest = compound.slice(i);
    let m;
    if (rest[0] === '*') i += 1;
    else if ((m = /^\.([\w-]+)/.exec(rest))) {
      if (!el.classes.has(m[1])) return false;
      i += m[0].length;
    } else if ((m = /^\[([\w-]+)=([\w-]+)\]/.exec(rest))) {
      if (el.attrs[m[1]] !== m[2]) return false;
      i += m[0].length;
    } else if (rest.startsWith(':root')) {
      if (el.parent) return false;
      i += 5;
    } else if ((m = /^:(is|where|not)\(/.exec(rest))) {
      const end = closing(compound, i + m[0].length - 1);
      const inner = matchList(compound.slice(i + m[0].length, end), el);
      if (m[1] === 'not' ? inner : !inner) return false;
      i = end + 1;
    } else throw new Error(`Unsupported selector part: ${rest}`);
  }
  return true;
}

function matchComplex(parts, idx, el) {
  if (!matchCompound(parts[idx], el)) return false;
  if (idx === 0) return true;
  for (let a = el.parent; a; a = a.parent) if (matchComplex(parts, idx - 1, a)) return true;
  return false;
}

function matchList(text, el) {
  return list(text).some((parts) => matchComplex(parts, parts.length - 1, el));
}

// ---- Trees ----

const KINDS = {
  D: { classes: ['dark'] },
  d: { attrs: { 'data-theme': 'dark' } },
  L: { classes: ['light'] },
  l: { attrs: { 'data-theme': 'light' } },
  B: { attrs: { 'data-theme': 'brand' } },
  T: { classes: ['theme'] },
  '-': {},
};

function chain(codes) {
  let parent = null;
  const nodes = [];
  for (const code of codes) {
    const k = KINDS[code];
    const el = { code, parent, classes: new Set(k.classes || []), attrs: { ...(k.attrs || {}) } };
    nodes.push(el);
    parent = el;
  }
  return nodes;
}

const themeOf = (el) =>
  el.classes.has('dark') || el.attrs['data-theme'] === 'dark'
    ? 1
    : el.classes.has('light') || el.attrs['data-theme'] === 'light'
      ? 0
      : null;

function expectedDark(el, os) {
  for (let e = el; e; e = e.parent) {
    const t = themeOf(e);
    if (t !== null) return t === 1;
  }
  return os;
}

// @scope (root) to (limit) { .x }: .x is implicitly ":scope .x", so the
// subject is a strict descendant of a scoping root with no limit element on
// the way down, the subject included.
function inScope(el, rootSel, limitSel) {
  for (let r = el.parent; r; r = r.parent) {
    if (!matchList(rootSel, r)) continue;
    let limited = false;
    for (let e = el; e !== r; e = e.parent) if (matchList(limitSel, e)) limited = true;
    if (!limited) return true;
  }
  return false;
}

const [, scopeRoot, scopeLimit] = /^@scope \((.*)\) to \((.*)\)$/.exec(DARK_SCOPE);

function* sequences(alphabet, max) {
  yield '';
  let level = [''];
  for (let n = 1; n <= max; n++) {
    const next = [];
    for (const s of level) for (const a of alphabet) next.push(s + a);
    yield* next;
    level = next;
  }
}

// The root is the first element of every chain.
const chains = [...sequences('DLdl-B', 5)].filter(Boolean);

describe('dark: variant selectors', () => {
  it('are wired into the dark variant in this order: selector, @scope, media', () => {
    const dark = stateVariants.find((v) => v.name === 'dark');
    expect(dark.forms.map((f) => f.at)).toEqual([undefined, DARK_SCOPE, '@media (prefers-color-scheme: dark)']);
    expect(dark.forms[0].sel('.x')).toBe(`.x${DARK_SELF}`);
    expect(dark.forms[1].sel('.x')).toBe('.x');
    expect(dark.forms[2].sel('.x')).toBe(`.x${DARK_OS}`);
    expect(scopeRoot).toBe(DARK);
    expect(scopeLimit).toBe(LIGHT);
  });

  it('match exactly the nearest themed ancestor rule (all nestings up to 5 deep, both OS schemes)', () => {
    let checked = 0;
    for (const codes of chains) {
      for (const el of chain(codes)) {
        for (const os of [false, true]) {
          const got = matchList(DARK_SELF, el) || inScope(el, scopeRoot, scopeLimit) || (os && matchList(DARK_OS, el));
          expect(got, `${codes} at ${el.code}, OS ${os ? 'dark' : 'light'}`).toBe(expectedDark(el, os));
          checked++;
        }
      }
    }
    expect(checked).toBeGreaterThan(10000);
  });

  it('never match a light element without @scope, and are exact unless dark sits inside light inside dark', () => {
    for (const codes of chains) {
      for (const el of chain(codes)) {
        for (const os of [false, true]) {
          const got = matchList(DARK_SELF, el) || (os && matchList(DARK_OS, el));
          const want = expectedDark(el, os);
          if (got) expect(want, `${codes} at ${el.code}`).toBe(true);
          const themed = [];
          for (let e = el; e; e = e.parent) if (themeOf(e) !== null) themed.unshift(themeOf(e));
          const alternates = /10+1/.test(themed.join(''));
          if (!alternates) expect(got, `${codes} at ${el.code}`).toBe(want);
        }
      }
    }
  });

  it('cover the cases that used to be wrong', () => {
    const leaf = (codes, os) => {
      const nodes = chain(codes);
      const el = nodes[nodes.length - 1];
      return matchList(DARK_SELF, el) || inScope(el, scopeRoot, scopeLimit) || (os && matchList(DARK_OS, el));
    };
    // A light section inside a page that is dark by OS preference.
    expect(leaf('-L-', true)).toBe(false);
    expect(leaf('-l-', true)).toBe(false);
    // A light section inside a dark ancestor.
    expect(leaf('DL-', false)).toBe(false);
    expect(leaf('dl', false)).toBe(false);
    // A dark section inside a light section inside a dark page.
    expect(leaf('DLD-', false)).toBe(true);
    // The root itself follows the OS when it has no theme.
    expect(leaf('-', true)).toBe(true);
    expect(leaf('L', true)).toBe(false);
    // data-theme values other than dark and light are not themes.
    expect(leaf('B-', true)).toBe(true);
    expect(leaf('DB-', false)).toBe(true);
  });

  it('are what the build writes for every dark: utility', () => {
    const css = read('dist/monsoon.css');
    expect(css).toContain(`.dark\\:bg-slate-800${DARK_SELF} {`);
    expect(css).toContain(`${DARK_SCOPE} {\n  .dark\\:text-white {`);
    expect(css).toContain(`.dark\\:bg-slate-800${DARK_OS} {`);
    const self = css.split(DARK_SELF).length - 1;
    const os = css.split(DARK_OS).length - 1;
    expect(self).toBeGreaterThan(100);
    expect(os).toBe(self);
    expect(css.split(DARK_SCOPE).length - 1).toBe(1);
  });
});

describe('themed sections', () => {
  const css = tokensCss();

  it('recompute the tokens on every themed element', () => {
    const scope = THEME_SCOPE.split(/,\s*/);
    for (const sel of [...DARK.split(/,\s*/), ...LIGHT.split(/,\s*/)]) {
      expect(scope.some((s) => s === sel || (s === '[data-theme]' && sel.startsWith('[data-theme')))).toBe(true);
    }
  });

  it('set --mode and color-scheme for both class and attribute forms', () => {
    expect(css).toContain('.dark, [data-theme=dark] { --mode: 1; color-scheme: dark; }');
    expect(css).toContain('.light, [data-theme=light] { --mode: 0; color-scheme: light; }');
    expect(css).toMatch(/@media \(prefers-color-scheme: dark\) \{\s*:root:not\(\.light, \[data-theme=light\]\) \{ --mode: 1; color-scheme: dark; \}/);
  });

  it('paint their own text and background at zero specificity, but not the root', () => {
    // Only :where() groups, so the specificity is zero.
    expect(SECTION.replace(/:where\((?:[^()]|\([^()]*\))*\)/g, '')).toBe('');
    expect(css).toContain(`${SECTION} {\n  color: var(--foreground);\n  background-color: var(--background);\n}`);
    const section = (codes) => {
      const nodes = chain(codes);
      return matchList(SECTION, nodes[nodes.length - 1]);
    };
    expect(section('D')).toBe(false);
    expect(section('-D')).toBe(true);
    expect(section('-l')).toBe(true);
    expect(section('-B')).toBe(false);
    expect(section('-T')).toBe(false);
  });
});

describe('token contrast in both modes (WCAG AA, 4.5:1)', () => {
  const hex = (h) => srgbToOklch(hexToRgb(h));
  const pairs = [
    ['foreground', 'background'],
    ['primary', 'primary-foreground'],
    ['muted-foreground', 'background'],
    ['muted-foreground', 'muted'],
    ['secondary', 'secondary-foreground'],
    ['accent', 'accent-foreground'],
    ['success', 'success-foreground'],
    ['warning', 'warning-foreground'],
    ['danger', 'danger-foreground'],
    ['info', 'info-foreground'],
  ];
  const seeds = [
    [0.55, 0.22, 262],
    hex('#3b5bdb'),
    hex('#e11d48'),
    hex('#ffd700'),
    hex('#16a34a'),
    hex('#000000'),
    hex('#ffffff'),
    [0.6, 0.15, 150],
  ];
  // Every sRGB color on a 7 step grid, so seeds stay inside the gamut a hex
  // or rgb() seed can describe.
  const N = 6;
  for (let r = 0; r <= N; r++) {
    for (let g = 0; g <= N; g++) for (let b = 0; b <= N; b++) seeds.push(srgbToOklch([r / N, g / N, b / N]));
  }

  for (const mode of [0, 1]) {
    it(`holds in ${mode ? 'dark' : 'light'} mode for every seed`, () => {
      for (const seed of seeds) {
        const t = resolveTokens(seed, mode);
        for (const [a, b] of pairs) {
          const ratio = contrast(t[a], t[b]);
          expect(ratio, `${a} on ${b}, seed ${seed.map((v) => +v.toFixed(3)).join(' ')}`).toBeGreaterThanOrEqual(4.5);
        }
      }
    });
  }
});
