// Interactive parts of the Monsoon site, built with Voodoo.js
// (https://github.com/kwy404/Voodoo.js). Voodoo is loaded with data-manual, so
// this module publishes small helpers on V.config.globals before the first
// render and then starts the page. Theme toggle, menu, install tabs, copy
// buttons, accordions and both playgrounds are declared in the HTML.

const V = window.V;

// ---- Color math (WCAG 2 contrast from computed OKLCH or RGB colors) ----

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const toLinear = (v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);

function oklabToLinear(L, a, b) {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ].map(clamp01);
}

const num = (s) => (s.endsWith('%') ? parseFloat(s) / 100 : parseFloat(s));

/** Linear sRGB channels from a computed color string, or null. */
function linearRgb(color) {
  const m = /^(\w+)\(([^)]*)\)$/.exec(color.trim());
  if (!m) return null;
  const parts = m[2].replace(/\//g, ' ').replace(/,/g, ' ').trim().split(/\s+/);
  const fn = m[1];
  if (fn === 'rgb' || fn === 'rgba') return parts.slice(0, 3).map((p) => toLinear(clamp01(num(p) / (p.endsWith('%') ? 1 : 255))));
  if (fn === 'oklch') {
    const [L, C, H] = [num(parts[0]), num(parts[1]), parseFloat(parts[2]) || 0];
    const r = (H * Math.PI) / 180;
    return oklabToLinear(L, C * Math.cos(r), C * Math.sin(r));
  }
  if (fn === 'oklab') return oklabToLinear(num(parts[0]), num(parts[1]), num(parts[2]));
  if (fn === 'color' && parts[0] === 'srgb') return parts.slice(1, 4).map((p) => toLinear(clamp01(num(p))));
  return null;
}

const luminance = ([r, g, b]) => 0.2126 * r + 0.7152 * g + 0.0722 * b;
function contrast(a, b) {
  const x = linearRgb(a);
  const y = linearRgb(b);
  if (!x || !y) return NaN;
  const l1 = luminance(x);
  const l2 = luminance(y);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

// ---- Seed playground ----

let probe = null;
function getProbe() {
  if (probe) return probe;
  probe = document.createElement('div');
  probe.setAttribute('aria-hidden', 'true');
  probe.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;visibility:hidden;pointer-events:none';
  const scheme = (mode) =>
    `<div class="${mode}" data-mode="${mode}"><i data-k="primary" class="bg-primary text-primary-foreground"></i><i data-k="body" class="bg-background text-foreground"></i><i data-k="accent" class="bg-accent text-accent-foreground"></i><i data-k="surface" class="bg-surface text-muted-foreground"></i><i data-k="seed" style="color: oklch(from var(--seed) l c h)"></i></div>`;
  probe.innerHTML = scheme('light') + scheme('dark');
  document.body.appendChild(probe);
  return probe;
}

const valid = (color) => typeof color === 'string' && color.trim() !== '' && CSS.supports('color', color.trim());
let lastValid = '#3b5bdb';
const cache = new Map();

function measure(seed) {
  const s = valid(seed) ? seed.trim() : lastValid;
  if (cache.has(s)) return cache.get(s);
  const root = getProbe();
  const out = {};
  for (const box of root.querySelectorAll('[data-mode]')) {
    box.style.setProperty('--seed', s);
    const r = {};
    for (const el of box.querySelectorAll('[data-k]')) {
      const cs = getComputedStyle(el);
      r[el.dataset.k] = el.dataset.k === 'seed' ? cs.color : contrast(cs.backgroundColor, cs.color);
    }
    out[box.dataset.mode] = r;
  }
  cache.set(s, out);
  return out;
}

const fixed = (n) => (Number.isFinite(n) ? `${n.toFixed(2)}:1` : 'n/a');

const helpers = {
  /** Last valid seed, so typing a half finished color never blanks the panels. */
  safe(seed) {
    if (valid(seed)) lastValid = seed.trim();
    return lastValid;
  },
  ratio(seed, mode, key) {
    return fixed(measure(seed)[mode][key]);
  },
  grade(seed, mode) {
    const r = measure(seed)[mode];
    const worst = Math.min(r.primary, r.body, r.accent, r.surface);
    if (!Number.isFinite(worst)) return 'n/a';
    return worst >= 7 ? 'AAA' : worst >= 4.5 ? 'AA' : 'Below AA';
  },
  lch(seed) {
    const c = measure(seed).light.seed;
    const m = /oklch\(([^)]*)\)/.exec(c || '');
    if (!m) return c || '';
    const [l, ch, h] = m[1].trim().split(/\s+/).map(parseFloat);
    return `oklch(${l.toFixed(2)} ${ch.toFixed(3)} ${Math.round(h || 0)})`;
  },
};

// ---- Class playground ----

const presetsEl = document.getElementById('playground-presets');
const presets = presetsEl ? JSON.parse(presetsEl.textContent) : [];
const cssHref = new URL('monsoon.min.css', document.baseURI).href;

function frameDoc(code, dark) {
  return `<!doctype html><html class="${dark ? 'dark' : 'light'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="stylesheet" href="${cssHref}"></head><body class="p-6 antialiased bg-background text-foreground">${code}</body></html>`;
}

// ---- Class reference ----

let index = null;
const VARIANTS_FALLBACK = [];
let lastKey = '';
let lastMatches = [];

function rowCss(row) {
  const [name, , decls, , selector] = row;
  const sel = selector || `.${CSS.escape(name)}`;
  const body = decls.split(/;\s*/).filter(Boolean).map((d) => `  ${d.trim()};`).join('\n');
  return `${sel} {\n${body}\n}`;
}

function matches(q, cat, vr) {
  if (!index) return [];
  const key = `${q}\u0000${cat}\u0000${vr}`;
  if (key === lastKey) return lastMatches;
  let query = String(q || '').trim().toLowerCase();
  let variant = vr || '';
  // "hover:bg-primary" searches bg-primary among classes that support hover:
  const colon = query.indexOf(':');
  if (colon > 0 && index.variants.includes(query.slice(0, colon))) {
    variant = variant || query.slice(0, colon);
    query = query.slice(colon + 1);
  }
  const vbit = variant ? 1 << index.variants.indexOf(variant) : 0;
  const ci = cat && cat !== 'all' ? index.categories.indexOf(cat) : -1;
  const exact = [];
  const starts = [];
  const rest = [];
  for (const row of index.rows) {
    if (ci >= 0 && row[1] !== ci) continue;
    if (vbit && !(row[3] & vbit)) continue;
    if (query) {
      const n = row[0];
      if (n === query) exact.push(row);
      else if (n.startsWith(query)) starts.push(row);
      else if (n.includes(query) || row[2].includes(query)) rest.push(row);
      continue;
    }
    rest.push(row);
  }
  lastKey = key;
  lastMatches = exact.concat(starts, rest);
  return lastMatches;
}

Object.assign(helpers, {
  presets,
  frameDoc,
  startQuery: new URLSearchParams(location.search).get('q') || '',
  startCat: new URLSearchParams(location.search).get('cat') || 'all',
  total(q, cat, vr) {
    return matches(q, cat, vr).length;
  },
  search(q, cat, vr, limit) {
    return matches(q, cat, vr)
      .slice(0, limit)
      .map((row) => ({
        n: row[0],
        c: index.categories[row[1]],
        css: rowCss(row),
        v: index.variants.filter((_, i) => row[3] & (1 << i)),
      }));
  },
  copyClass(name) {
    navigator.clipboard?.writeText(name).catch(() => {});
  },
});

if (V) {
  if (document.getElementById('ref-q')) {
    try {
      const res = await fetch('classes.json');
      index = await res.json();
    } catch {
      index = { categories: [], variants: VARIANTS_FALLBACK, rows: [] };
    }
  }
  Object.assign(V.config.globals, helpers);
  V.start();
}
