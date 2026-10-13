// Toast manager: Monsoon.toast('Saved', { tone: 'success' }) shows a toast in
// a polite live region. Toasts stack per position, pause while hovered or
// focused, and can be swiped away.
//
//   Monsoon.toast('Invite sent', {
//     description: 'Ana will get an email.', tone: 'success',
//     position: 'bottom-end', duration: 5000,
//     action: { label: 'Undo', onClick: () => {} },
//   });
//
// Returns { el, close(), update(message, options) }. A button can show one
// without code: <button data-m-toast="Saved" data-m-toast-tone="success">.
import { define, emit } from '../core.mjs';
import { h } from './combobox.mjs';

const ICONS = {
  success: '<circle cx="12" cy="12" r="10"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
  danger: '<circle cx="12" cy="12" r="10"/><path d="M12 7.5v5M12 16.5h.01"/>',
  warning: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
};
const svg = (paths) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
const regions = new Map();
const reduced = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/** The live region for a position such as "bottom-end" or "top-center". */
function region(position) {
  let r = regions.get(position);
  if (r && r.isConnected) return r;
  const [v, x] = position.split('-');
  r = h('section', {
    class: `toast toast-${v} toast-${x || 'end'} toast-stack`, 'aria-live': 'polite', 'aria-relevant': 'additions text', 'aria-label': 'Notifications', 'data-position': position,
  });
  const pause = (on) => r.toggleAttribute('data-paused', on);
  r.addEventListener('pointerenter', () => pause(true));
  r.addEventListener('pointerleave', () => pause(r.contains(document.activeElement)));
  r.addEventListener('focusin', () => pause(true));
  r.addEventListener('focusout', (e) => pause(r.contains(e.relatedTarget) || r.matches(':hover')));
  document.body.append(r);
  regions.set(position, r);
  return r;
}

/** Shows a toast. Options: title, description, tone, position, duration (0 keeps it), action, dismissible, max. */
export function toast(message, options = {}) {
  const o = typeof message === 'object' ? message : { ...options, title: message };
  const position = o.position || 'bottom-end';
  const r = region(position);
  const item = h('div', { class: 'toast-item', 'data-tone': o.tone || null, role: o.tone === 'danger' ? 'alert' : null });
  let remaining = o.duration === undefined ? (o.tone === 'danger' ? 8000 : 5000) : o.duration;
  let last = Date.now();
  let timer = 0;
  let closed = false;

  const fill = (opts) => {
    const body = h('div', { class: 'toast-content' },
      opts.title ? h('p', { class: 'toast-title' }, opts.title) : null,
      opts.description ? h('p', { class: 'toast-description' }, opts.description) : null);
    const kids = [body];
    if (ICONS[opts.tone]) {
      const icon = h('span', { class: 'toast-icon' });
      icon.innerHTML = svg(ICONS[opts.tone]);
      kids.unshift(icon);
    }
    if (opts.action) {
      kids.push(h('button', {
        type: 'button',
        class: 'btn btn-sm btn-outline toast-action',
        onclick: () => {
          if (opts.action.onClick) opts.action.onClick();
          close();
        },
      }, opts.action.label));
    }
    if (opts.dismissible !== false) {
      const x = h('button', { type: 'button', class: 'toast-close', 'aria-label': 'Dismiss notification', onclick: () => close() });
      x.innerHTML = svg('<path d="M18 6 6 18M6 6l12 12"/>');
      kids.push(x);
    }
    item.replaceChildren(...kids);
  };

  const tick = () => {
    clearTimeout(timer);
    if (closed || !remaining) return;
    const paused = r.hasAttribute('data-paused') || document.hidden;
    const now = Date.now();
    if (!paused) remaining -= now - last;
    last = now;
    if (remaining <= 0) close();
    else timer = setTimeout(tick, Math.min(remaining, 250));
  };

  function close() {
    if (closed) return;
    closed = true;
    clearTimeout(timer);
    emit(item, 'toast-close', { toast: item });
    if (reduced() || !item.animate) {
      item.remove();
      return;
    }
    const height = item.offsetHeight;
    item.setAttribute('data-leaving', '');
    item.animate([
      { opacity: 1, translate: item.style.translate || '0 0', marginBlockEnd: '0px', height: `${height}px` },
      { opacity: 0, translate: item.style.translate || '0 .5rem', marginBlockEnd: `-${r.style.gap || '10px'}`, height: '0px', paddingBlock: '0px' },
    ], { duration: 220, easing: 'cubic-bezier(.2,.8,.2,1)' }).onfinish = () => item.remove();
  }

  // Swipe sideways to dismiss.
  item.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 || e.target.closest('button, a')) return;
    const x0 = e.clientX;
    const t0 = Date.now();
    let dx = 0;
    const move = (ev) => {
      dx = ev.clientX - x0;
      item.style.translate = `${dx}px 0`;
      item.style.opacity = String(1 - Math.min(Math.abs(dx) / 240, 0.7));
    };
    const up = () => {
      removeEventListener('pointermove', move);
      removeEventListener('pointerup', up);
      if (Math.abs(dx) > 80 || Math.abs(dx) / (Date.now() - t0) > 0.6) {
        item.style.translate = `${Math.sign(dx) * 120}% 0`;
        item.style.opacity = '0';
        setTimeout(close, 150);
      } else {
        item.style.translate = '';
        item.style.opacity = '';
      }
    };
    addEventListener('pointermove', move);
    addEventListener('pointerup', up);
  });

  fill(o);
  if (position.startsWith('top')) r.prepend(item);
  else r.append(item);
  const items = [...r.querySelectorAll('.toast-item:not([data-leaving])')];
  const max = o.max || 5;
  if (items.length > max) {
    (position.startsWith('top') ? items.slice(max) : items.slice(0, items.length - max)).forEach((el) => el.monsoonClose && el.monsoonClose());
  }
  item.monsoonClose = close;
  tick();
  emit(item, 'toast', { toast: item });
  return {
    el: item,
    close,
    update(msg, next = {}) {
      const merged = typeof msg === 'object' ? { ...o, ...msg } : { ...o, ...next, title: msg };
      fill(merged);
      if (merged.tone) item.dataset.tone = merged.tone;
      if (next.duration !== undefined) {
        remaining = next.duration;
        last = Date.now();
        tick();
      }
    },
  };
}

define('toast', (el, opts) => {
  const onClick = () => toast(el.dataset.mToast || el.textContent.trim(), {
    tone: opts.tone,
    description: opts.description,
    position: opts.position,
    duration: opts.duration === undefined ? undefined : +opts.duration,
  });
  el.addEventListener('click', onClick);
  return () => el.removeEventListener('click', onClick);
});

// The browser bundle exposes Monsoon.toast(); its global is assigned after
// every module ran, so attach once the current script has finished.
if (typeof globalThis !== 'undefined') {
  const attach = () => {
    const g = globalThis.Monsoon || (globalThis.Monsoon = {});
    if (!g.toast) g.toast = toast;
  };
  if (typeof queueMicrotask === 'function') queueMicrotask(attach);
  else Promise.resolve().then(attach);
}
