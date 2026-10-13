// Seed theming. Every semantic token is derived from one color, --seed, with
// OKLCH relative color syntax. The formulas live here as data so the build can
// write them as CSS and the tests can evaluate the very same expressions in JS.
//
// How the contrast guarantee works
// --------------------------------
// WCAG AA needs 4.5:1 between a fill and its text. In OKLCH the lightness L
// tracks perceived lightness, so a fill can take white text when L is low and
// near black text when L is high. Around L 0.55 to 0.62 neither choice is safe
// for every hue. So the primary color is first pushed out of that band:
//
//   s  = clamp(0, (l - T) * 100000, 1)            step: 0 below T, 1 above T
//   L' = (1 - s) * min(l, LO) + s * max(l, HI)     never between LO and HI
//
// and its foreground flips on the same threshold:
//
//   Lfg = clamp(FG_DARK, (T - L') * 100000, 1)     1 (white) or FG_DARK
//
// clamp() with a huge multiplier is a branch free "if" that works inside
// calc(). Dark mode is a number, --mode (0 or 1), so the same declarations
// serve both schemes and nested sections recompute them with the inherited
// mode. In dark mode the seed lightness is lifted to at least LIFT so that
// text-primary stays readable on the dark background.

export const T = 0.6;
export const LO = 0.52;
export const HI = 0.66;
export const LIFT = 0.7;
export const FG_DARK = 0.17;

export const DEFAULT_SEED = 'oklch(0.55 0.22 262)';

const step = (x) => `clamp(0, (${x} - ${T}) * 100000, 1)`;
const NUDGE = `calc((1 - ${step('l')}) * min(l, ${LO}) + ${step('l')} * max(l, ${HI}))`;
const FLIP = `clamp(${FG_DARK}, (${T} - l) * 100000, 1)`;
const mode = (light, dark) => {
  const d = +(dark - light).toFixed(4);
  return `calc(${light} ${d < 0 ? '-' : '+'} ${Math.abs(d)} * var(--mode))`;
};

// from: the custom property the relative color reads, or null for an absolute color.
// l, c, h: CSS channel expressions. l, c and h refer to the source channels.
export const tokens = [
  { name: '_seed', from: 'seed', l: `max(l, ${LIFT} * var(--mode))`, c: 'min(c, 0.25)', h: 'h', internal: true },
  { name: 'background', from: 'seed', l: mode(0.99, 0.16), c: 'min(c, 0.012)', h: 'h' },
  { name: 'foreground', from: 'seed', l: mode(0.21, 0.96), c: 'min(c, 0.02)', h: 'h' },
  { name: 'surface', from: 'seed', l: mode(1, 0.2), c: 'min(c, 0.008)', h: 'h' },
  { name: 'surface-2', from: 'seed', l: mode(0.97, 0.24), c: 'min(c, 0.012)', h: 'h' },
  { name: 'surface-3', from: 'seed', l: mode(0.94, 0.28), c: 'min(c, 0.016)', h: 'h' },
  { name: 'muted', from: 'seed', l: mode(0.955, 0.27), c: 'min(c, 0.015)', h: 'h' },
  { name: 'muted-foreground', from: 'seed', l: mode(0.47, 0.74), c: 'min(c, 0.03)', h: 'h' },
  { name: 'border', from: 'seed', l: mode(0.9, 0.33), c: 'min(c, 0.02)', h: 'h' },
  { name: 'primary', from: '_seed', l: NUDGE, c: 'c', h: 'h' },
  { name: 'primary-foreground', from: 'primary', l: FLIP, c: 'min(c, 0.03)', h: 'h' },
  { name: 'ring', from: 'primary', l: 'l', c: 'c', h: 'h' },
  { name: 'secondary', from: 'seed', l: mode(0.94, 0.3), c: 'min(c * 0.35, 0.05)', h: 'h' },
  { name: 'secondary-foreground', from: 'secondary', l: FLIP, c: 'min(c, 0.03)', h: 'h' },
  { name: 'accent', from: 'seed', l: 'clamp(0.74, l + 0.12, 0.88)', c: 'min(c, 0.16)', h: 'calc(h + 180)' },
  { name: 'accent-foreground', from: 'accent', l: FLIP, c: 'min(c, 0.03)', h: 'h' },
  { name: 'success', from: null, l: mode(0.52, 0.72), c: '0.15', h: '150' },
  { name: 'success-foreground', from: 'success', l: FLIP, c: 'min(c, 0.03)', h: 'h' },
  { name: 'warning', from: null, l: '0.8', c: '0.16', h: '80' },
  { name: 'warning-foreground', from: 'warning', l: FLIP, c: 'min(c, 0.03)', h: 'h' },
  { name: 'danger', from: null, l: mode(0.53, 0.7), c: '0.2', h: '27' },
  { name: 'danger-foreground', from: 'danger', l: FLIP, c: 'min(c, 0.03)', h: 'h' },
  { name: 'info', from: null, l: mode(0.53, 0.72), c: '0.14', h: '235' },
  { name: 'info-foreground', from: 'info', l: FLIP, c: 'min(c, 0.03)', h: 'h' },
];

// Public semantic color names (used for bg-*, text-*, border-* and friends).
export const semanticColors = tokens.filter((t) => !t.internal).map((t) => t.name);

export function tokenCss(t) {
  if (!t.from) return `oklch(${t.l} ${t.c} ${t.h})`;
  return `oklch(from var(--${t.from}) ${t.l} ${t.c} ${t.h})`;
}

// ---- JS mirror of the CSS formulas ----

const helpers = {
  clamp: (lo, v, hi) => Math.max(lo, Math.min(v, hi)),
  min: Math.min,
  max: Math.max,
};

export function compile(expr) {
  const js = expr.replace(/var\(--mode\)/g, 'mode').replace(/calc\(/g, '(');
  if (/[^\w\s.()+\-*/,]/.test(js)) throw new Error(`Unsupported expression: ${expr}`);
  // eslint-disable-next-line no-new-func
  return new Function('clamp', 'min', 'max', 'l', 'c', 'h', 'mode', `return (${js});`).bind(
    null,
    helpers.clamp,
    helpers.min,
    helpers.max,
  );
}

const compiled = new Map();
const fn = (expr) => {
  if (!compiled.has(expr)) compiled.set(expr, compile(expr));
  return compiled.get(expr);
};

// seed: [L, C, H] in OKLCH (L from 0 to 1). Returns { name: [L, C, H] }.
export function resolveTokens(seed, modeValue = 0) {
  const out = { seed };
  for (const t of tokens) {
    const [l, c, h] = t.from ? out[t.from] : [0, 0, 0];
    const L = fn(t.l)(l, c, h, modeValue);
    const C = fn(t.c)(l, c, h, modeValue);
    const H = (((fn(t.h)(l, c, h, modeValue) % 360) + 360) % 360);
    out[t.name] = [L, C, H];
  }
  return out;
}

// Static values for browsers without relative color syntax. Tokens whose
// lightness only depends on --mode keep following light and dark mode.
export function fallbackCss(t, defaultSeed) {
  if (t.name === 'primary' || t.name === 'ring') return 'var(--seed)';
  const usesSourceL = /(^|[^\w])l([^\w]|$)/.test(t.l);
  const resolved = resolveTokens(defaultSeed, 0);
  const [l, c, h] = t.from ? resolved[t.from] : [0, 0, 0];
  const C = +fn(t.c)(l, c, h, 0).toFixed(4);
  const H = +(((fn(t.h)(l, c, h, 0) % 360) + 360) % 360).toFixed(2);
  if (!usesSourceL) return `oklch(${t.l} ${C} ${H})`;
  const L = +resolved[t.name][0].toFixed(4);
  return `oklch(${L} ${C} ${H})`;
}
