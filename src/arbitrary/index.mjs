// Arbitrary values: one parser and one CSS generator, shared by the runtime
// engine (src/js/arbitrary.mjs, inside dist/monsoon.js) and by the purge CLI
// (bin/monsoon.mjs), so a class means exactly the same thing in both.
//
//   bg-[#0ea5e9]            a value in brackets, "_" is a space, "\_" an underscore
//   text-[length:13px]      an explicit type hint when the value is ambiguous
//   bg-(--brand)            a custom property: background-color: var(--brand)
//   [mask-type:luminance]   an arbitrary property
//   bg-[red]/50             an opacity modifier on a color
//   -mt-[3px]               a negative value
//   md:hover:w-[37px]       any of the variants of the static utilities, stacked
import { escapeClass } from './escape.mjs';
import { stateVariants, dirVariants, responsiveVariants, containerVariants, mediaVariants } from '../variants.mjs';
import { families, COLOR_FAMILIES, NEGATIVE, SELECTORS } from './families.mjs';

export { families };

// ---- Variants ----

const pc = (name, suffix) => ({ name, forms: [{ sel: (s) => `${s}${suffix}` }] });
// Extra variants that only make sense with arbitrary values. Pseudo elements
// are always written last in the selector, whatever their place in the class.
const PSEUDO_ELEMENTS = { before: '::before', after: '::after', placeholder: '::placeholder', selection: '::selection', marker: '::marker', file: '::file-selector-button', backdrop: '::backdrop', 'first-line': '::first-line', 'first-letter': '::first-letter' };
const extras = [
  ...['visited', 'checked', 'invalid', 'required', 'empty', 'target', 'indeterminate', 'placeholder-shown', 'read-only'].map((n) => pc(n, `:${n}`)),
  pc('open', '[open]'),
  { name: 'group-focus', forms: [{ sel: (s) => `.group:focus ${s}` }] },
  { name: 'peer-focus', forms: [{ sel: (s) => `.peer:focus ~ ${s}` }] },
];
// Same order as the static stylesheet, so later variants win: states, then
// direction, then breakpoints from small to large, then containers and media.
const ORDER = [...stateVariants, ...extras, ...dirVariants, ...responsiveVariants, ...containerVariants, ...mediaVariants];
const VARIANTS = new Map(ORDER.map((v, i) => [v.name, { ...v, rank: i + 1 }]));
for (const name of Object.keys(PSEUDO_ELEMENTS)) VARIANTS.set(name, { name, rank: VARIANTS.get('hover').rank, pseudo: PSEUDO_ELEMENTS[name] });

export const variantNames = () => [...VARIANTS.keys()];

// ---- Values ----

const HINTS = new Set(['color', 'length', 'size', 'position', 'percentage', 'number', 'image', 'url', 'family-name', 'weight', 'shadow', 'any']);
const HINT_KIND = { length: 'size', percentage: 'length', url: 'image', 'family-name': 'family', shadow: 'any' };
const COLOR_FN = /^(rgba?|hsla?|hwb|lab|lch|oklab|oklch|color|color-mix|light-dark)\(/i;
const IMAGE_FN = /^(url|image|image-set|cross-fade|(repeating-)?(linear|radial|conic)-gradient)\(/i;
const MATH_FN = /^(calc|min|max|clamp|round|mod|rem|abs|sign|sin|cos|tan|asin|acos|atan|atan2|pow|sqrt|hypot|log|exp)$/i;
const MAX_LENGTH = 300;

/** Top level tokens split on spaces, ignoring spaces inside parentheses and strings. */
function topLevel(v) {
  let depth = 0;
  let q = '';
  let n = 1;
  for (const ch of v) {
    if (q) q = ch === q ? '' : q;
    else if (ch === '"' || ch === "'") q = ch;
    else if (ch === '(') depth++;
    else if (ch === ')') depth--;
    else if (ch === ' ' && !depth) n++;
  }
  return n;
}

/** What a decoded value looks like: color, length, number, image, ident or any. */
export function kindOf(v) {
  if (topLevel(v) > 1) return 'any';
  if (/^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(v)) return 'color';
  if (COLOR_FN.test(v)) return 'color';
  if (IMAGE_FN.test(v)) return 'image';
  if (/^-?(\d+\.?\d*|\.\d+)$/.test(v)) return 'number';
  if (/^-?(\d+\.?\d*|\.\d+)(%|[a-z]+)$/i.test(v)) return 'length';
  const fn = /^([a-z-]+)\(/i.exec(v);
  if (fn && MATH_FN.test(fn[1])) return 'length';
  if (/^[a-z][a-z-]*$/i.test(v)) return 'ident';
  return 'any';
}

/** True when brackets, parentheses and quotes are balanced. */
function balanced(v) {
  const stack = [];
  let q = '';
  for (const ch of v) {
    if (q) {
      if (ch === q) q = '';
    } else if (ch === '"' || ch === "'") q = ch;
    else if (ch === '(' || ch === '[') stack.push(ch);
    else if (ch === ')' || ch === ']') {
      if (stack.pop() !== (ch === ')' ? '(' : '[')) return false;
    }
  }
  return !stack.length && !q;
}

/**
 * Rejects anything that could end a declaration or a rule, open an at-rule,
 * close a style element or hide in an escape: ; { } @ \ ! </ comments,
 * control characters and unbalanced brackets or quotes.
 */
export function safeValue(v) {
  if (!v || v.length > MAX_LENGTH) return false;
  // eslint-disable-next-line no-control-regex
  if (/[;{}@\\!<>\x00-\x1f\x7f]|\/\*|\*\//.test(v)) return false;
  if (/expression\s*\(|javascript:/i.test(v)) return false;
  return balanced(v);
}

/** Adds the spaces math functions need around + and -: calc(100vh-4rem). */
function spaceMath(v) {
  let out = '';
  const math = [];
  for (let i = 0; i < v.length; i++) {
    const ch = v[i];
    if (ch === '-' && v[i + 1] === '-') {
      const name = /^--[\w-]*/.exec(v.slice(i))[0];
      out += name;
      i += name.length - 1;
    } else if (ch === '(') {
      const fn = /([a-z-]*)$/i.exec(out)[1];
      math.push(fn ? MATH_FN.test(fn) : math[math.length - 1] || false);
      out += ch;
    } else if (ch === ')') {
      math.pop();
      out += ch;
    } else if ((ch === '+' || ch === '-') && math[math.length - 1] && /(\d[a-z%]*|\))$/i.test(out) && /^[\w.(]/.test(v.slice(i + 1))) {
      out += ` ${ch} `;
    } else out += ch;
  }
  return out;
}

/** Turns the raw text between the brackets into a CSS value, or null when unsafe. */
export function decodeValue(raw) {
  if (/\\(?!_)/.test(raw)) return null;
  const KEEP = '\u0001';
  let v = raw.replace(/\\_/g, KEEP).replace(/\burl\([^)]*\)/gi, (m) => m.replace(/_/g, KEEP));
  v = v.replace(/_/g, ' ').trim();
  if (!safeValue(v.replace(/\u0001/g, '_'))) return null;
  return spaceMath(v).replace(/\u0001/g, '_');
}

// ---- Classes ----

/** Splits on ":" outside brackets and parentheses. */
function splitVariants(cls) {
  const parts = [];
  let depth = 0;
  let q = '';
  let cur = '';
  for (const ch of cls) {
    if (q) q = ch === q ? '' : q;
    else if ((ch === '"' || ch === "'") && depth) q = ch;
    else if (ch === '[' || ch === '(') depth++;
    else if (ch === ']' || ch === ')') depth--;
    else if (ch === ':' && !depth) {
      parts.push(cur);
      cur = '';
      continue;
    }
    cur += ch;
  }
  parts.push(cur);
  return parts;
}

/** Index of the bracket or parenthesis that closes the one at start, or -1. */
function closing(s, start) {
  let depth = 0;
  let q = '';
  for (let i = start; i < s.length; i++) {
    const ch = s[i];
    if (q) q = ch === q ? '' : q;
    else if (ch === '"' || ch === "'") q = ch;
    else if (ch === '[' || ch === '(') depth++;
    else if (ch === ']' || ch === ')') {
      depth--;
      if (!depth) return i;
    }
  }
  return -1;
}

/**
 * Parses an arbitrary value class. Returns null for anything that is not one
 * (static classes included) or that fails the safety checks.
 * @returns {{ variants: string[], family: string|null, property: string|null, value: string, decls: string[][] } | null}
 */
export function parseClass(cls) {
  if (typeof cls !== 'string' || cls.length > MAX_LENGTH + 60 || !/[[(]/.test(cls)) return null;
  const parts = splitVariants(cls);
  const util = parts.pop();
  if (parts.some((p) => !VARIANTS.has(p))) return null;

  // Arbitrary property: [mask-type:luminance]
  if (util[0] === '[') {
    if (closing(util, 0) !== util.length - 1) return null;
    const body = util.slice(1, -1);
    const idx = body.indexOf(':');
    if (idx < 1) return null;
    const property = body.slice(0, idx);
    if (!/^(--[a-zA-Z0-9_-]+|-?[a-z]+(-[a-z]+)*)$/.test(property)) return null;
    const value = decodeValue(body.slice(idx + 1));
    if (value == null) return null;
    return { variants: parts, family: null, property, value, decls: [[property, value]] };
  }

  const m = /^(-?)([a-z][a-z0-9-]*?)-([[(])/.exec(util);
  if (!m) return null;
  const [, neg, family, open] = m;
  const build = families[family];
  if (!build || (neg && !NEGATIVE.has(family))) return null;
  const start = m[0].length - 1;
  const end = closing(util, start);
  if (end < 0) return null;
  const rest = util.slice(end + 1);
  let alpha = '';
  if (rest) {
    const mod = /^\/(\d{1,3}(\.\d+)?)$/.exec(rest);
    if (!mod || !COLOR_FAMILIES.has(family) || +mod[1] > 100) return null;
    alpha = mod[1];
  }
  let body = util.slice(start + 1, end);

  // Optional type hint: bg-[length:200px_100px], text-(color:--brand)
  let hint = '';
  const h = /^([a-z-]+):/.exec(body);
  if (h && HINTS.has(h[1])) {
    hint = h[1];
    body = body.slice(h[0].length);
  }

  let value;
  if (open === '(') {
    // Custom property shorthand: bg-(--brand)
    if (!/^--[a-zA-Z0-9_-]+$/.test(body)) return null;
    value = `var(${body})`;
  } else {
    value = decodeValue(body);
    if (value == null) return null;
    if (/^--[a-zA-Z0-9_-]+$/.test(value)) value = `var(${value})`;
  }

  let kind = hint ? HINT_KIND[hint] || hint : kindOf(value);
  if (alpha) {
    value = `color-mix(in oklab, ${value} ${alpha}%, transparent)`;
    kind = 'color';
  }
  if (neg) value = /^[\d.]/.test(value) ? `-${value}` : `calc(${value} * -1)`;
  const decls = build(value, kind);
  if (!decls || !decls.length) return null;
  return { variants: parts, family, property: null, value, decls };
}

/**
 * Compiles a class into rules. Returns null when it is not a valid arbitrary
 * value class.
 * @returns {{ cls: string, rank: number, rules: { at: string[], sel: string, decls: string[][] }[] } | null}
 */
export function compileClass(cls) {
  const parsed = parseClass(cls);
  if (!parsed) return null;
  let forms = [{ at: [], sel: `.${escapeClass(cls)}` }];
  let rank = 0;
  let pseudo = '';
  // The variant next to the utility applies first; the leftmost one is the outermost at-rule.
  for (const name of [...parsed.variants].reverse()) {
    const v = VARIANTS.get(name);
    rank = Math.max(rank, v.rank);
    if (v.pseudo) {
      pseudo = pseudo || v.pseudo;
      continue;
    }
    forms = forms.flatMap((f) => v.forms.map((form) => ({ at: form.at ? [form.at, ...f.at] : f.at, sel: form.sel(f.sel) })));
  }
  const wrap = SELECTORS[parsed.family] || ((s) => s);
  const rules = forms.map((f) => ({ at: f.at, sel: wrap(f.sel + pseudo), decls: parsed.decls }));
  return { cls, rank, rules };
}

/** One rule as CSS text, at-rules included: @media (min-width: 768px){.x{width:37px}} */
export function ruleCss({ at, sel, decls }) {
  const body = `${sel}{${decls.map(([p, v]) => `${p}:${v}`).join(';')}}`;
  return at.reduceRight((inner, a) => `${a}{${inner}}`, body);
}

/**
 * CSS for a list of classes. Invalid ones are skipped. Rules are sorted the
 * way the static stylesheet is: plain classes first, then variants in order.
 */
export function arbitraryCss(classes) {
  const compiled = [];
  const seen = new Set();
  for (const cls of classes) {
    if (seen.has(cls)) continue;
    seen.add(cls);
    const c = compileClass(cls);
    if (c) compiled.push(c);
  }
  compiled.sort((a, b) => a.rank - b.rank);
  return { css: compiled.flatMap((c) => c.rules.map(ruleCss)).join('\n'), classes: compiled.map((c) => c.cls) };
}

/**
 * Finds arbitrary value classes in any text: HTML, JSX, templates, strings in
 * code. Every candidate goes through parseClass, so false positives are dropped.
 */
export function scanArbitrary(text) {
  const out = new Set();
  const re = /(?:^|[\s"'`{,=(\[>])((?:@?[a-z][a-z0-9-]*:)*(?:-?[a-z][a-z0-9-]*-[[(]|\[[a-z-]))/gi;
  let m;
  while ((m = re.exec(text))) {
    const start = m.index + m[0].length - m[1].length;
    const open = start + m[1].length - (m[1].endsWith('[') || m[1].endsWith('(') ? 1 : 2);
    const end = closing(text, open);
    if (end < 0) continue;
    let stop = end + 1;
    const mod = /^\/\d{1,3}(\.\d+)?/.exec(text.slice(stop, stop + 8));
    if (mod) stop += mod[0].length;
    const cls = text.slice(start, stop);
    if (parseClass(cls)) out.add(cls);
    re.lastIndex = Math.max(re.lastIndex, start + 1);
  }
  return out;
}
