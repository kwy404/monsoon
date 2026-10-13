// Color picker over a native <input type="color">: a saturation and
// brightness area, hue and alpha sliders, a hex, rgb or oklch text field,
// swatches and the eyedropper where the browser has one.
//
//   <div class="color-picker" data-m-color-picker data-m-color-picker-swatches="#4f46e5,#0ea5e9">
//     <input type="color" class="color-input" value="#4f46e5" aria-label="Brand color">
//   </div>
//
// Options: -format (hex, rgb or oklch; also what the input stores), -alpha
// ("false" hides the alpha slider), -inline (no trigger, the panel is shown in
// place), -swatches.
import { define, emit } from '../core.mjs';
import { clamp, expose, floating, h } from './combobox.mjs';

const round = (v, d = 0) => +v.toFixed(d);
const hex2 = (v) => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0');
const toLinear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const toGamma = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

/** Parses #rgb, #rgba, #rrggbb, #rrggbbaa, rgb()/rgba() and oklch() into { r, g, b, a } (0 to 255, alpha 0 to 1). */
export function parseColor(input) {
  const s = String(input).trim().toLowerCase();
  let m = /^#?([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/.exec(s);
  if (m) {
    let x = m[1];
    if (x.length < 5) x = [...x].map((c) => c + c).join('');
    const n = x.match(/../g).map((p) => parseInt(p, 16));
    return { r: n[0], g: n[1], b: n[2], a: n.length > 3 ? round(n[3] / 255, 3) : 1 };
  }
  const num = (v, scale) => (v.endsWith('%') ? (parseFloat(v) / 100) * scale : parseFloat(v));
  m = /^rgba?\(\s*([\d.]+%?)[\s,]+([\d.]+%?)[\s,]+([\d.]+%?)(?:\s*[,/]\s*([\d.]+%?))?\s*\)$/.exec(s);
  if (m) {
    const [r, g, b] = [m[1], m[2], m[3]].map((v) => clamp(num(v, 255), 0, 255));
    return { r, g, b, a: m[4] ? clamp(num(m[4], 1), 0, 1) : 1 };
  }
  m = /^oklch\(\s*([\d.]+%?)\s+([\d.]+%?)\s+([\d.]+)(?:deg)?(?:\s*\/\s*([\d.]+%?))?\s*\)$/.exec(s);
  if (m) {
    const rgb = oklchToRgb({ l: num(m[1], 1), c: num(m[2], 0.4), h: +m[3] });
    return { ...rgb, a: m[4] ? clamp(num(m[4], 1), 0, 1) : 1 };
  }
  return null;
}

export const toHex = ({ r, g, b, a = 1 }) => `#${hex2(r)}${hex2(g)}${hex2(b)}${a < 1 ? hex2(a * 255) : ''}`;

/** { r, g, b } 0 to 255 into hue 0 to 360, saturation and value 0 to 1. */
export function rgbToHsv({ r, g, b }) {
  [r, g, b] = [r / 255, g / 255, b / 255];
  const max = Math.max(r, g, b);
  const d = max - Math.min(r, g, b);
  let hue = 0;
  if (d) hue = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return { h: (hue * 60 + 360) % 360, s: max ? d / max : 0, v: max };
}
export function hsvToRgb({ h: hue, s, v }) {
  const f = (n) => {
    const k = (n + hue / 60) % 6;
    return (v - v * s * clamp(Math.min(k, 4 - k), 0, 1)) * 255;
  };
  return { r: f(5), g: f(3), b: f(1) };
}

/** sRGB into OKLCH (lightness 0 to 1, chroma, hue in degrees). */
export function rgbToOklch({ r, g, b }) {
  [r, g, b] = [r, g, b].map((c) => toLinear(c / 255));
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const c = Math.hypot(A, B);
  return { l: L, c, h: c < 1e-4 ? 0 : (Math.atan2(B, A) * 180 / Math.PI + 360) % 360 };
}

const oklchToLinear = ({ l: L, c, h: hue }) => {
  const A = c * Math.cos((hue * Math.PI) / 180);
  const B = c * Math.sin((hue * Math.PI) / 180);
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
};

/** OKLCH into sRGB; out of gamut colors keep lightness and hue and lose chroma. */
export function oklchToRgb(color) {
  const inGamut = (x) => x.every((v) => v >= -1e-4 && v <= 1.0001);
  let lin = oklchToLinear(color);
  if (!inGamut(lin)) {
    let lo = 0;
    let hi = color.c;
    for (let i = 0; i < 24; i++) {
      const mid = (lo + hi) / 2;
      if (inGamut(oklchToLinear({ ...color, c: mid }))) lo = mid;
      else hi = mid;
    }
    lin = oklchToLinear({ ...color, c: lo });
  }
  const [r, g, b] = lin.map((v) => clamp(toGamma(clamp(v, 0, 1)) * 255, 0, 255));
  return { r, g, b };
}

/** A color as text: hex, rgb or oklch. */
export function formatColor(color, format = 'hex') {
  const alpha = color.a < 1 ? ` / ${round(color.a, 2)}` : '';
  if (format === 'rgb') return `rgb(${[color.r, color.g, color.b].map((v) => Math.round(v)).join(' ')}${alpha})`;
  if (format === 'oklch') {
    const { l, c, h: hue } = rgbToOklch(color);
    return `oklch(${round(l * 100, 1)}% ${round(c, 3)} ${round(hue, 1)}${alpha})`;
  }
  return toHex(color);
}

define('color-picker', (root, opts) => {
  const input = root.querySelector('input');
  if (!input) return;
  const name = input.getAttribute('aria-label') || (input.labels && input.labels[0] && input.labels[0].textContent.trim()) || 'Color';
  const inline = opts.inline !== undefined;
  const alpha = opts.alpha !== 'false';
  let format = opts.format || 'hex';
  const start = parseColor(input.value) || { r: 79, g: 70, b: 229, a: 1 };
  let hsv = rgbToHsv(start);
  let a = start.a;
  const rgba = () => ({ ...hsvToRgb(hsv), a });

  const thumb = () => h('span', { class: 'color-picker-thumb' });
  const area = h('div', { class: 'color-picker-area', role: 'slider', tabindex: '0', 'aria-label': 'Saturation and brightness', 'aria-valuemin': '0', 'aria-valuemax': '100' }, thumb());
  const hue = h('div', { class: 'color-picker-hue', role: 'slider', tabindex: '0', 'aria-label': 'Hue', 'aria-valuemin': '0', 'aria-valuemax': '360' }, thumb());
  const alp = alpha ? h('div', { class: 'color-picker-alpha', role: 'slider', tabindex: '0', 'aria-label': 'Opacity', 'aria-valuemin': '0', 'aria-valuemax': '100' }, thumb()) : null;
  const preview = h('span', { class: 'color-picker-preview', 'aria-hidden': 'true' });
  const formatSel = h('select', { class: 'select select-sm color-picker-format', 'aria-label': 'Color format' },
    ['hex', 'rgb', 'oklch'].map((f) => h('option', { value: f }, f.toUpperCase())));
  const text = h('input', { type: 'text', class: 'input input-sm color-picker-text', 'aria-label': `${name} value`, spellcheck: 'false', autocomplete: 'off' });
  const dropper = typeof window !== 'undefined' && 'EyeDropper' in window
    ? h('button', { type: 'button', class: 'btn btn-icon btn-sm color-picker-eyedropper', 'aria-label': 'Pick a color from the screen' })
    : null;
  const swatches = (opts.swatches || '').split(/\s*,\s*(?![^(]*\))/).filter(parseColor);
  const panel = h('div', { class: 'color-picker-panel', role: inline ? 'group' : 'dialog', 'aria-label': name },
    area,
    h('div', { class: 'color-picker-row' }, dropper, h('div', { class: 'color-picker-sliders' }, hue, alp), preview),
    h('div', { class: 'color-picker-fields' }, formatSel, text),
    swatches.length ? h('div', { class: 'color-picker-swatches' }, swatches.map((s) => h('button', {
      type: 'button', class: 'color-picker-swatch', style: `--swatch: ${s}`, 'aria-label': s, title: s, 'data-color': s,
    }))) : null);
  const trigger = inline ? null : h('button', { type: 'button', class: 'color-picker-trigger', 'aria-haspopup': 'dialog', 'aria-expanded': 'false' },
    h('span', { class: 'color-picker-chip' }), h('span', { class: 'color-picker-value' }));
  const label = input.labels && input.labels[0];
  if (label && trigger) label.htmlFor = trigger.id = `${input.id || 'color'}-picker`;
  input.type = 'hidden';
  if (inline) root.setAttribute('data-inline', '');
  root.append(...[trigger, panel].filter(Boolean));
  const pop = trigger ? floating(panel, trigger, { onClose: () => trigger.setAttribute('aria-expanded', 'false') }) : null;

  const render = (fromText) => {
    const c = rgba();
    const solid = formatColor({ ...c, a: 1 }, 'rgb');
    const s = root.style;
    s.setProperty('--color-picker-hue', formatColor({ ...hsvToRgb({ h: hsv.h, s: 1, v: 1 }), a: 1 }, 'rgb'));
    s.setProperty('--color-picker-solid', solid);
    s.setProperty('--color-picker-color', formatColor(c, 'rgb'));
    s.setProperty('--color-picker-x', `${hsv.s * 100}%`);
    s.setProperty('--color-picker-y', `${(1 - hsv.v) * 100}%`);
    s.setProperty('--color-picker-h', `${(hsv.h / 360) * 100}%`);
    s.setProperty('--color-picker-a', `${a * 100}%`);
    area.setAttribute('aria-valuenow', Math.round(hsv.s * 100));
    area.setAttribute('aria-valuetext', `Saturation ${Math.round(hsv.s * 100)}%, brightness ${Math.round(hsv.v * 100)}%`);
    hue.setAttribute('aria-valuenow', Math.round(hsv.h));
    hue.setAttribute('aria-valuetext', `${Math.round(hsv.h)} degrees`);
    if (alp) {
      alp.setAttribute('aria-valuenow', Math.round(a * 100));
      alp.setAttribute('aria-valuetext', `${Math.round(a * 100)}%`);
    }
    const value = formatColor(c, format);
    if (!fromText) text.value = value;
    formatSel.value = format;
    if (trigger) {
      trigger.lastChild.textContent = value;
      trigger.setAttribute('aria-label', `${name}: ${value}`);
    }
    panel.querySelectorAll('.color-picker-swatch').forEach((b) => b.setAttribute('aria-pressed', String(toHex(parseColor(b.dataset.color)) === toHex(c))));
    input.value = value;
  };
  const change = (commit, fromText) => {
    render(fromText);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    if (commit) {
      input.dispatchEvent(new Event('change', { bubbles: true }));
      emit(root, 'change', { value: input.value, hex: toHex(rgba()), rgba: rgba() });
    }
  };
  const setColor = (c, commit = true) => {
    const next = rgbToHsv(c);
    hsv = next.s === 0 || next.v === 0 ? { ...next, h: hsv.h } : next;
    a = c.a == null ? 1 : c.a;
    change(commit);
  };

  // Pointer drag on the area and both sliders.
  const drag = (el, apply) => el.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    el.focus();
    const at = (ev) => {
      const r = el.getBoundingClientRect();
      apply(clamp((ev.clientX - r.left) / (r.width || 1), 0, 1), clamp((ev.clientY - r.top) / (r.height || 1), 0, 1));
      change(false);
    };
    const up = () => {
      removeEventListener('pointermove', at);
      removeEventListener('pointerup', up);
      change(true);
    };
    at(e);
    addEventListener('pointermove', at);
    addEventListener('pointerup', up);
  });
  drag(area, (x, y) => { hsv = { ...hsv, s: x, v: 1 - y }; });
  drag(hue, (x) => { hsv = { ...hsv, h: x * 360 }; });
  if (alp) drag(alp, (x) => { a = round(x, 2); });

  const keys = (el, apply) => el.addEventListener('keydown', (e) => {
    const big = e.shiftKey || e.key.startsWith('Page');
    const d = { ArrowRight: 1, ArrowUp: 1, PageUp: 1, ArrowLeft: -1, ArrowDown: -1, PageDown: -1 }[e.key];
    if (d === undefined && e.key !== 'Home' && e.key !== 'End') return;
    e.preventDefault();
    apply(e.key, (d || 0) * (big ? 10 : 1));
    change(true);
  });
  keys(area, (key, d) => {
    const v = d / 100;
    if (key === 'ArrowLeft' || key === 'ArrowRight') hsv = { ...hsv, s: clamp(hsv.s + v, 0, 1) };
    else if (key === 'Home' || key === 'End') hsv = { ...hsv, s: key === 'Home' ? 0 : 1 };
    else hsv = { ...hsv, v: clamp(hsv.v + v, 0, 1) };
  });
  keys(hue, (key, d) => { hsv = { ...hsv, h: key === 'Home' ? 0 : key === 'End' ? 360 : clamp(hsv.h + d, 0, 360) }; });
  if (alp) keys(alp, (key, d) => { a = key === 'Home' ? 0 : key === 'End' ? 1 : clamp(round(a + d / 100, 2), 0, 1); });

  text.addEventListener('input', () => {
    const c = parseColor(text.value);
    text.setAttribute('aria-invalid', String(!c));
    if (c) {
      const next = rgbToHsv(c);
      hsv = next.s === 0 ? { ...next, h: hsv.h } : next;
      a = c.a;
      change(false, true);
    }
  });
  text.addEventListener('change', () => {
    text.setAttribute('aria-invalid', 'false');
    change(true);
  });
  text.addEventListener('keydown', (e) => e.key === 'Enter' && (e.preventDefault(), change(true)));
  formatSel.addEventListener('change', () => {
    format = formatSel.value;
    change(true);
  });
  panel.addEventListener('click', (e) => {
    const sw = e.target.closest('.color-picker-swatch');
    if (sw) setColor(parseColor(sw.dataset.color));
  });
  if (dropper) {
    dropper.addEventListener('click', () => new window.EyeDropper().open()
      .then((r) => setColor({ ...parseColor(r.sRGBHex), a }))
      .catch(() => {}));
  }
  if (trigger) {
    trigger.addEventListener('click', () => {
      pop.toggle();
      trigger.setAttribute('aria-expanded', String(pop.open));
      if (pop.open) area.focus();
    });
    panel.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      e.stopPropagation();
      pop.close();
      trigger.focus();
    });
  }
  render();
  expose(root, 'colorPicker', {
    get value() { return input.value; },
    set value(v) {
      const c = parseColor(v);
      if (c) setColor(c);
    },
    get rgba() { return rgba(); },
    open: () => pop && pop.show(),
    close: () => pop && pop.close(),
  });
  return () => pop && pop.close();
});
