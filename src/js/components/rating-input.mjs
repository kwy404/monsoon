// Interactive rating with half stars: a WAI-ARIA slider drawn as stars over a
// native number input, which keeps the value for the form.
//
//   <div class="rating-input" data-m-rating-input>
//     <input type="number" class="input" name="score" min="0" max="5" step="0.5" value="3.5" aria-label="Rating">
//   </div>
//
// The input's max sets the number of stars and its step the precision (0.5
// for half stars). Hover previews, click sets, clicking the current value
// clears. Arrows, Home, End and number keys work too.
import { define, emit } from '../core.mjs';
import { clamp, expose, h } from './combobox.mjs';

/** Value under a pointer at fraction (0 to 1) of the stars, rounded up to step. */
export const ratingAt = (fraction, max, step) => clamp(Math.ceil((clamp(fraction, 0, 1) * max) / step - 1e-9) * step, step, max);

/** How full each star is (0 to 1) for a value. */
export const starFills = (value, max) => Array.from({ length: max }, (_, i) => clamp(value - i, 0, 1));

define('rating-input', (root) => {
  const input = root.querySelector('input');
  if (!input) return;
  const max = Math.max(1, Math.round(+input.max || 5));
  const step = +input.step > 0 ? +input.step : 1;
  let value = clamp(+input.value || 0, 0, max);
  const name = input.getAttribute('aria-label') || (input.labels && input.labels[0] && input.labels[0].textContent.trim()) || 'Rating';
  const stars = h('span', {
    class: 'rating-input-stars', role: 'slider', tabindex: input.disabled ? '-1' : '0', 'aria-label': name,
    'aria-valuemin': '0', 'aria-valuemax': max, 'aria-disabled': input.disabled || input.readOnly ? 'true' : null,
  }, Array.from({ length: max }, () => h('span', { class: 'rating-input-star' })));
  const text = h('span', { class: 'rating-input-value', 'aria-hidden': 'true' });
  input.hidden = true;
  input.tabIndex = -1;
  root.append(stars, text);
  const fmt = (v) => (Number.isInteger(v) ? String(v) : v.toFixed(1));

  const paint = (v) => {
    starFills(v, max).forEach((f, i) => stars.children[i].style.setProperty('--fill', f));
    text.textContent = v ? fmt(v) : '';
  };
  const set = (v) => {
    value = clamp(Math.round(v / step) * step, 0, max);
    input.value = value;
    stars.setAttribute('aria-valuenow', value);
    stars.setAttribute('aria-valuetext', `${fmt(value)} of ${max} stars`);
    paint(value);
  };
  const commit = (v) => {
    set(v);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    emit(root, 'change', { value });
  };
  const locked = () => input.disabled || input.readOnly;
  const at = (e) => {
    const r = stars.getBoundingClientRect();
    let f = (e.clientX - r.left) / (r.width || 1);
    if (getComputedStyle(root).direction === 'rtl') f = 1 - f;
    return ratingAt(f, max, step);
  };
  stars.addEventListener('pointermove', (e) => {
    if (locked() || e.pointerType === 'touch') return;
    stars.setAttribute('data-hover', '');
    paint(at(e));
  });
  stars.addEventListener('pointerleave', () => {
    stars.removeAttribute('data-hover');
    paint(value);
  });
  stars.addEventListener('click', (e) => {
    if (locked()) return;
    const v = at(e);
    commit(v === value ? 0 : v);
  });
  stars.addEventListener('keydown', (e) => {
    if (locked()) return;
    const rtl = getComputedStyle(root).direction === 'rtl';
    const map = { ArrowRight: rtl ? -step : step, ArrowUp: step, ArrowLeft: rtl ? step : -step, ArrowDown: -step };
    let next = null;
    if (e.key in map) next = value + map[e.key];
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = max;
    else if (/^\d$/.test(e.key) && +e.key <= max) next = +e.key;
    if (next === null) return;
    e.preventDefault();
    commit(clamp(next, 0, max));
  });
  set(value);
  expose(root, 'ratingInput', {
    get value() { return value; },
    set value(v) { commit(v); },
  });
});
