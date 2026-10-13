// Dual thumb range slider over two native range inputs (they keep the values
// and still work without the script). Each thumb follows the WAI-ARIA slider
// pattern; the low thumb never passes the high one.
//
//   <div class="range-dual" data-m-range-dual data-m-range-dual-format="currency:USD">
//     <input type="range" min="0" max="1000" step="10" value="200" aria-label="Minimum price">
//     <input type="range" min="0" max="1000" step="10" value="800" aria-label="Maximum price">
//   </div>
//
// Options: -format ("currency:EUR", "percent", "unit:kilometer"), -gap (the
// smallest distance between the thumbs), -tooltips ("always").
import { define, emit } from '../core.mjs';
import { clamp, expose, h } from './combobox.mjs';

/** Rounds v to the nearest step from min, inside [min, max]. */
export function snap(v, min, max, step = 1) {
  const s = step > 0 ? step : 1;
  const n = Math.round((v - min) / s) * s + min;
  return clamp(+n.toFixed(10), min, max);
}

/** The value a slider key leads to, null for other keys. */
export function keyValue(key, value, { min, max, step = 1, page = step * 10, rtl = false }) {
  const map = {
    ArrowRight: rtl ? -step : step, ArrowUp: step, ArrowLeft: rtl ? step : -step, ArrowDown: -step, PageUp: page, PageDown: -page,
  };
  if (key === 'Home') return min;
  if (key === 'End') return max;
  return key in map ? snap(value + map[key], min, max, step) : null;
}

export function formatter(locale, format = '') {
  const [style, unit] = format.split(':');
  const o = style === 'currency' ? { style, currency: unit, maximumFractionDigits: 0 }
    : style === 'unit' ? { style, unit } : style === 'percent' ? { style, maximumFractionDigits: 0 } : {};
  const f = new Intl.NumberFormat(locale, o);
  return (v) => f.format(style === 'percent' ? v / 100 : v);
}

define('range-dual', (root, opts) => {
  const inputs = [...root.querySelectorAll('input[type=range]')].slice(0, 2);
  if (inputs.length < 2) return;
  const [a, b] = inputs;
  const min = +a.min || 0;
  const max = a.max === '' ? 100 : +a.max;
  const step = +a.step || 1;
  const gap = +opts.gap || 0;
  const lang = root.closest('[lang]');
  const fmt = formatter(opts.locale || (lang && lang.lang) || undefined, opts.format);
  if (opts.tooltips) root.dataset.tooltips = opts.tooltips;
  const pct = (v) => ((v - min) / (max - min || 1)) * 100;
  const fill = h('span', { class: 'range-dual-fill' });
  const track = h('span', { class: 'range-dual-track' }, fill);
  const thumbs = inputs.map((input) => {
    const tip = h('span', { class: 'range-dual-tooltip', 'aria-hidden': 'true' });
    const label = input.getAttribute('aria-label') || (input.labels && input.labels[0] && input.labels[0].textContent.trim());
    input.hidden = true;
    input.tabIndex = -1;
    return h('span', {
      class: 'range-dual-thumb', role: 'slider', tabindex: input.disabled ? '-1' : '0', 'aria-label': label, 'aria-orientation': 'horizontal', 'aria-disabled': input.disabled ? 'true' : null,
    }, tip);
  });
  root.append(track, ...thumbs);
  const values = [snap(+a.value, min, max, step), snap(+b.value, min, max, step)];
  if (values[0] > values[1]) values.reverse();

  const render = () => {
    root.style.setProperty('--range-start', pct(values[0]));
    root.style.setProperty('--range-end', pct(values[1]));
    thumbs.forEach((t, i) => {
      const lo = i ? values[0] + gap : min;
      const hi = i ? max : values[1] - gap;
      t.setAttribute('aria-valuemin', lo);
      t.setAttribute('aria-valuemax', hi);
      t.setAttribute('aria-valuenow', values[i]);
      t.style.setProperty('--range-at', pct(values[i]));
      t.setAttribute('aria-valuetext', fmt(values[i]));
      t.firstChild.textContent = fmt(values[i]);
    });
  };
  const set = (i, v, commit) => {
    const next = i ? clamp(snap(v, min, max, step), values[0] + gap, max) : clamp(snap(v, min, max, step), min, values[1] - gap);
    if (next !== values[i]) {
      values[i] = next;
      inputs[i].value = next;
      inputs[i].dispatchEvent(new Event('input', { bubbles: true }));
      render();
    }
    if (commit) {
      inputs.forEach((input) => input.dispatchEvent(new Event('change', { bubbles: true })));
      emit(root, 'change', { min: values[0], max: values[1] });
    }
  };

  thumbs.forEach((t, i) => t.addEventListener('keydown', (e) => {
    const rtl = getComputedStyle(root).direction === 'rtl';
    const v = keyValue(e.key, values[i], { min, max, step, page: Math.max(step, snap((max - min) / 10, 0, max - min, step)), rtl });
    if (v === null || inputs[i].disabled) return;
    e.preventDefault();
    set(i, v, true);
  }));

  let active = -1;
  const valueAt = (x) => {
    const r = track.getBoundingClientRect();
    let p = (x - r.left) / (r.width || 1);
    if (getComputedStyle(root).direction === 'rtl') p = 1 - p;
    return min + clamp(p, 0, 1) * (max - min);
  };
  const onMove = (e) => active >= 0 && set(active, valueAt(e.clientX));
  const onUp = () => {
    if (active < 0) return;
    thumbs[active].removeAttribute('data-active');
    set(active, values[active], true);
    active = -1;
    removeEventListener('pointermove', onMove);
    removeEventListener('pointerup', onUp);
  };
  root.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 || a.disabled) return;
    const v = valueAt(e.clientX);
    const hit = thumbs.indexOf(e.target.closest('.range-dual-thumb'));
    active = hit >= 0 ? hit : Math.abs(v - values[0]) < Math.abs(v - values[1]) || (v < values[0]) ? 0 : 1;
    if (values[0] === values[1]) active = v < values[0] ? 0 : 1;
    e.preventDefault();
    thumbs[active].focus();
    thumbs[active].setAttribute('data-active', '');
    if (hit < 0) set(active, v);
    addEventListener('pointermove', onMove);
    addEventListener('pointerup', onUp);
  });
  inputs.forEach((input, i) => input.addEventListener('change', (e) => {
    if (e.isTrusted) set(i, +input.value);
  }));
  render();
  expose(root, 'rangeDual', {
    get value() { return values.slice(); },
    set value([lo, hi]) {
      set(1, max);
      set(0, lo);
      set(1, hi, true);
    },
  });
  return onUp;
});
