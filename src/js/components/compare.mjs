// Before and after compare: <div class="compare" data-m-compare> with a
// .compare-before and a .compare-after (images or any element) and an
// optional <input type="range" class="compare-range">. Without the script it
// shows a fixed half and half split. With it the divider follows pointer and
// touch drags, and the range input (visually hidden) gives keyboard and
// screen reader control: arrows, Page Up, Page Down, Home and End.
import { define, emit } from '../core.mjs';
import { capture, clamp, expose, h } from './dropzone.mjs';

/** Divider position in percent for a pointer coordinate inside a rect. */
export function positionFrom(rect, x, y, vertical = false) {
  const p = vertical ? (y - rect.top) / rect.height : (x - rect.left) / rect.width;
  return clamp(Math.round(p * 1000) / 10, 0, 100);
}

const instances = new WeakMap();
export const compare = expose('compare', instances);

define('compare', (el, o) => {
  const vertical = o.orientation === 'vertical' || el.classList.contains('compare-vertical');
  if (vertical) el.classList.add('compare-vertical');
  const created = [];
  let range = el.querySelector('.compare-range');
  if (!range) {
    range = h('input', { type: 'range', class: 'compare-range', 'aria-label': o.label || 'Comparison position' });
    created.push(range);
  }
  Object.assign(range, { min: 0, max: 100, step: Number(o.step) || 1 });
  let handle = el.querySelector('.compare-handle');
  if (!handle) {
    handle = h('span', { class: 'compare-handle', 'aria-hidden': 'true' }, h('span', { class: 'compare-knob' }));
    created.push(handle);
  }
  el.append(...created);
  if (vertical) range.setAttribute('aria-orientation', 'vertical');

  let pos = clamp(Number(o.position ?? range.getAttribute('value') ?? 50), 0, 100);
  const set = (p, notify = true) => {
    pos = clamp(+p, 0, 100);
    el.style.setProperty('--pos', `${pos}%`);
    range.value = pos;
    range.setAttribute('aria-valuetext', `${Math.round(pos)}% ${o.before || 'before'}, ${Math.round(100 - pos)}% ${o.after || 'after'}`);
    if (notify) emit(el, 'compare', { position: pos });
  };
  set(pos, false);
  el.dataset.enhanced = '';

  let active = null;
  const at = (e) => set(positionFrom(el.getBoundingClientRect(), e.clientX, e.clientY, vertical));
  const down = (e) => {
    if (e.button > 0) return;
    active = e.pointerId;
    capture(el, e.pointerId);
    el.dataset.active = '';
    at(e);
    range.focus({ preventScroll: true, focusVisible: false });
  };
  const move = (e) => {
    if (e.pointerId === active) at(e);
    else if (active === null && o.hover === 'true' && e.pointerType === 'mouse') at(e);
  };
  const up = (e) => {
    if (e.pointerId !== active) return;
    active = null;
    delete el.dataset.active;
  };
  const input = () => set(range.value);
  el.addEventListener('pointerdown', down);
  el.addEventListener('pointermove', move);
  el.addEventListener('pointerup', up);
  el.addEventListener('pointercancel', up);
  range.addEventListener('input', input);

  instances.set(el, { set, get position() { return pos; } });
  return () => {
    el.removeEventListener('pointerdown', down);
    el.removeEventListener('pointermove', move);
    el.removeEventListener('pointerup', up);
    el.removeEventListener('pointercancel', up);
    range.removeEventListener('input', input);
    created.forEach((n) => n.remove());
    delete el.dataset.enhanced;
    instances.delete(el);
  };
});
