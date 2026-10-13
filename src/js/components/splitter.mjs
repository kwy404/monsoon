// Resizable split panes: a separator between every two panes, dragged with a
// pointer or moved with the keyboard (arrows, Shift for bigger steps, Home,
// End, Enter collapses and restores).
//
//   <div class="splitter" data-m-splitter data-m-splitter-persist="editor">
//     <div class="splitter-pane">One</div>
//     <div class="splitter-pane">Two</div>
//   </div>
//
// Add .splitter-vertical to stack the panes. Options: -min (percent, or
// data-min on a pane), -persist (a localStorage key), -sizes ("30,70").
import { define, emit } from '../core.mjs';
import { clamp, expose, h, uid } from './combobox.mjs';

/**
 * Moves the boundary after pane i by delta percent, taking from the
 * neighbour and respecting each pane's minimum. Returns new sizes.
 */
export function resize(sizes, i, delta, mins = []) {
  const out = sizes.slice();
  const pair = out[i] + out[i + 1];
  const lo = mins[i] || 0;
  const hi = pair - (mins[i + 1] || 0);
  out[i] = clamp(out[i] + delta, lo, Math.max(lo, hi));
  out[i + 1] = +(pair - out[i]).toFixed(4);
  out[i] = +out[i].toFixed(4);
  return out;
}

/** Equal sizes, or the given ones scaled to 100. */
export function normalize(sizes, n) {
  const s = (sizes || []).slice(0, n).map(Number).filter((x) => x > 0);
  if (s.length !== n) return Array(n).fill(100 / n);
  const sum = s.reduce((a, b) => a + b, 0);
  return s.map((x) => (x / sum) * 100);
}

const store = {
  get(k) {
    try { return JSON.parse(localStorage.getItem(`monsoon-splitter:${k}`)); } catch { return null; }
  },
  set(k, v) {
    try { localStorage.setItem(`monsoon-splitter:${k}`, JSON.stringify(v)); } catch { /* storage may be off */ }
  },
};

define('splitter', (root, opts) => {
  const panes = [...root.children].filter((c) => !c.classList.contains('splitter-handle'));
  if (panes.length < 2) return;
  const vertical = root.classList.contains('splitter-vertical') || opts.orientation === 'vertical';
  const mins = panes.map((p) => +(p.dataset.min || opts.min || 10));
  let sizes = normalize((opts.persist && store.get(opts.persist)) || (opts.sizes && opts.sizes.split(',')), panes.length);
  const saved = [];
  const handles = panes.slice(0, -1).map((pane, i) => {
    pane.id = pane.id || uid('pane');
    const handle = h('div', {
      class: 'splitter-handle', role: 'separator', tabindex: '0', 'aria-controls': pane.id,
      'aria-orientation': vertical ? 'horizontal' : 'vertical', 'aria-valuemin': '0', 'aria-valuemax': '100',
      'aria-label': opts.label || 'Resize panes',
    });
    pane.after(handle);
    return handle;
  });

  const apply = (commit) => {
    panes.forEach((p, i) => { p.style.flex = `${sizes[i]} 1 0px`; });
    handles.forEach((hd, i) => {
      hd.setAttribute('aria-valuenow', Math.round(sizes[i]));
      hd.setAttribute('aria-valuemin', mins[i]);
      hd.setAttribute('aria-valuemax', Math.round(sizes[i] + sizes[i + 1] - mins[i + 1]));
    });
    if (!commit) return;
    if (opts.persist) store.set(opts.persist, sizes.map((s) => +s.toFixed(2)));
    emit(root, 'split', { sizes: sizes.slice() });
  };

  handles.forEach((hd, i) => {
    hd.addEventListener('keydown', (e) => {
      const step = e.shiftKey ? 10 : 2;
      const rtl = !vertical && getComputedStyle(root).direction === 'rtl';
      const d = vertical
        ? { ArrowUp: -step, ArrowDown: step }[e.key]
        : { ArrowLeft: rtl ? step : -step, ArrowRight: rtl ? -step : step }[e.key];
      let next = null;
      if (d) next = resize(sizes, i, d, mins);
      else if (e.key === 'Home') next = resize(sizes, i, -100, mins);
      else if (e.key === 'End') next = resize(sizes, i, 100, mins);
      else if (e.key === 'Enter') {
        if (saved[i] !== undefined && sizes[i] <= mins[i]) next = resize(sizes, i, saved[i] - sizes[i], mins);
        else {
          saved[i] = sizes[i];
          next = resize(sizes, i, -100, mins);
        }
      }
      if (!next) return;
      e.preventDefault();
      sizes = next;
      apply(true);
    });
    hd.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      e.preventDefault();
      hd.focus();
      hd.setAttribute('data-active', '');
      const box = root.getBoundingClientRect();
      const total = vertical ? box.height : box.width;
      const rtl = !vertical && getComputedStyle(root).direction === 'rtl';
      const from = vertical ? e.clientY : e.clientX;
      const base = sizes.slice();
      const move = (ev) => {
        const px = (vertical ? ev.clientY : ev.clientX) - from;
        sizes = resize(base, i, ((rtl ? -px : px) / (total || 1)) * 100, mins);
        apply(false);
      };
      const up = () => {
        hd.removeAttribute('data-active');
        removeEventListener('pointermove', move);
        removeEventListener('pointerup', up);
        apply(true);
      };
      addEventListener('pointermove', move);
      addEventListener('pointerup', up);
    });
    hd.addEventListener('dblclick', () => {
      sizes = normalize(null, panes.length);
      apply(true);
    });
  });
  apply(false);

  expose(root, 'splitter', {
    get sizes() { return sizes.slice(); },
    set sizes(v) {
      sizes = normalize(v, panes.length);
      apply(true);
    },
    reset() {
      sizes = normalize(null, panes.length);
      apply(true);
    },
  });
});
