// Image viewer: data-m-image-viewer on any element holding links to images
// (<a href="large.jpg"><img src="thumb.jpg" alt="..."></a>). Without the
// script each link opens its image. With it, a full screen <dialog> with zoom
// (buttons, wheel, pinch, double click or tap), pan, swipe, arrow keys,
// captions, a counter, thumbnails and a download button.
import { define, emit } from '../core.mjs';
import { zoomAt } from './cropper.mjs';
import { capture, clamp, expose, h, icon, ICONS } from './dropzone.mjs';

/** How far the image may move from the centre on one axis at a scale. */
export const panLimit = (base, scale, view) => Math.max(0, (base * scale - view) / 2);
export const clampPan = (t, base, scale, view) => { const m = panLimit(base, scale, view); return clamp(t, -m, m); };

/** File name for the download button. */
export function fileNameFrom(src = '') {
  const data = src.match(/^data:image\/([a-z+]+)/i);
  if (data) return `image.${data[1].replace('+xml', '').replace('jpeg', 'jpg')}`;
  return decodeURIComponent(src.split(/[?#]/)[0].split('/').pop() || '') || 'image';
}

/** The images of a group: source, alt text, caption, thumbnail and file name. */
export function collect(group, selector) {
  return [...group.querySelectorAll(selector)].map((el) => {
    const img = el.matches('img') ? el : el.querySelector('img');
    const src = el.dataset.src || el.getAttribute('href') || (img && (img.dataset.full || img.currentSrc || img.src)) || '';
    const alt = (img && img.alt) || el.getAttribute('aria-label') || '';
    return { el, src, alt, caption: el.dataset.caption ?? alt, thumb: (img && (img.currentSrc || img.src)) || src, name: el.dataset.download || fileNameFrom(src) };
  });
}

const I = {
  prev: 'M15 18l-6-6 6-6',
  next: 'M9 18l6-6-6-6',
  zoomIn: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM21 21l-5-5M8 11h6M11 8v6',
  zoomOut: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM21 21l-5-5M8 11h6',
};
const instances = new WeakMap();
export const imageViewer = expose('imageViewer', instances);

/** Options: selector, loop ("false" stops at the ends), maxZoom, thumbs ("false" hides them). */
export function createViewer(group, o = {}) {
  const selector = o.selector || 'a[href], [data-src]';
  const loop = o.loop !== 'false';
  const maxZoom = Number(o.maxZoom) || 5;
  let items = [];
  let index = 0;
  let s = 1;
  let tx = 0;
  let ty = 0;
  let dlg = null;
  let ui = {};

  const btn = (cls, label, d, fn) => h('button', { type: 'button', class: `viewer-btn ${cls}`, 'aria-label': label, title: label, html: icon(d), onclick: fn });

  const build = () => {
    ui.img = h('img', { class: 'viewer-image', alt: '', draggable: 'false' });
    ui.stage = h('div', { class: 'viewer-stage' }, ui.img);
    ui.counter = h('span', { class: 'viewer-counter', 'aria-live': 'polite' });
    ui.zoom = h('span', { class: 'viewer-zoom' }, '100%');
    ui.download = h('a', { class: 'viewer-btn', 'aria-label': 'Download', title: 'Download', html: icon(ICONS.download) });
    ui.close = btn('', 'Close', ICONS.x, () => dlg.close());
    ui.close.autofocus = true;
    ui.prev = btn('viewer-prev', 'Previous image', I.prev, () => step(-1));
    ui.next = btn('viewer-next', 'Next image', I.next, () => step(1));
    ui.caption = h('p', { class: 'viewer-caption' });
    ui.thumbs = h('div', { class: 'viewer-thumbs', role: 'group', 'aria-label': 'Images' });
    dlg = h('dialog', { class: 'viewer', 'aria-label': o.label || 'Image viewer' },
      h('div', { class: 'viewer-bar' }, ui.counter, h('div', { class: 'viewer-tools' },
        btn('', 'Zoom out', I.zoomOut, () => zoomTo(s / 1.5)), ui.zoom, btn('', 'Zoom in', I.zoomIn, () => zoomTo(s * 1.5)), ui.download, ui.close)),
      ui.stage, ui.prev, ui.next, ui.caption, ui.thumbs);
    document.body.append(dlg);
    ui.img.addEventListener('load', () => { delete ui.stage.dataset.loading; });
    ui.img.addEventListener('error', () => { delete ui.stage.dataset.loading; });
    dlg.addEventListener('keydown', onKey);
    dlg.addEventListener('close', () => { emit(group, 'viewer-close', { index }); });
    ui.stage.addEventListener('pointerdown', down);
    ui.stage.addEventListener('pointermove', move);
    ui.stage.addEventListener('pointerup', up);
    ui.stage.addEventListener('pointercancel', up);
    ui.stage.addEventListener('wheel', wheel, { passive: false });
  };

  // Transform
  const base = () => ({ w: ui.img.offsetWidth, h: ui.img.offsetHeight, vw: ui.stage.clientWidth, vh: ui.stage.clientHeight });
  const apply = () => {
    const b = base();
    tx = drag && drag.mode === 'swipe' ? tx : clampPan(tx, b.w, s, b.vw);
    ty = clampPan(ty, b.h, s, b.vh);
    ui.img.style.transform = `translate(${tx}px,${ty}px) scale(${s})`;
    ui.zoom.textContent = `${Math.round(s * 100)}%`;
    ui.stage.toggleAttribute('data-zoomed', s > 1);
  };
  const zoomTo = (ns, px = 0, py = 0) => {
    ns = clamp(ns, 1, maxZoom);
    const c = zoomAt(tx, ty, s, ns, px, py);
    s = ns;
    tx = c.x;
    ty = c.y;
    apply();
  };

  const show = (i) => {
    const n = items.length;
    if (!n) return;
    index = loop ? ((i % n) + n) % n : clamp(i, 0, n - 1);
    const it = items[index];
    s = 1;
    tx = ty = 0;
    ui.stage.dataset.loading = '';
    ui.img.src = it.src;
    ui.img.alt = it.alt;
    if (ui.img.complete) delete ui.stage.dataset.loading;
    apply();
    ui.caption.textContent = it.caption || '';
    ui.caption.hidden = !it.caption;
    ui.counter.textContent = `${index + 1} / ${n}`;
    ui.download.href = it.src;
    ui.download.download = it.name;
    const single = n < 2;
    ui.prev.hidden = ui.next.hidden = single;
    ui.prev.disabled = !loop && index === 0;
    ui.next.disabled = !loop && index === n - 1;
    ui.thumbs.hidden = single || o.thumbs === 'false';
    [...ui.thumbs.children].forEach((t, k) => t.setAttribute('aria-current', k === index ? 'true' : 'false'));
    const cur = ui.thumbs.children[index];
    if (cur && cur.scrollIntoView && dlg.open) cur.scrollIntoView({ block: 'nearest', inline: 'center' });
    for (const k of [index - 1, index + 1]) if (items[(k + n) % n]) new Image().src = items[(k + n) % n].src;
    emit(group, 'viewer-change', { index, item: it.el });
  };
  const step = (d) => show(index + d);

  const open = (i = 0) => {
    items = collect(group, selector);
    if (!items.length) return;
    if (!dlg) build();
    ui.thumbs.replaceChildren(...items.map((it, k) => h('button', { type: 'button', class: 'viewer-thumb', 'aria-label': `Image ${k + 1}${it.alt ? `: ${it.alt}` : ''}`, onclick: () => show(k) }, h('img', { src: it.thumb, alt: '', loading: 'lazy' }))));
    if (!dlg.open) dlg.showModal();
    show(i);
    emit(group, 'viewer-open', { index });
  };

  // Gestures: drag pans when zoomed and swipes otherwise, two fingers pinch,
  // a double tap toggles zoom, a tap on the backdrop closes.
  const pts = new Map();
  let drag = null;
  let lastTap = { t: 0, x: 0, y: 0 };
  const pos = (e) => { const r = ui.stage.getBoundingClientRect(); return { x: e.clientX - r.left - r.width / 2, y: e.clientY - r.top - r.height / 2 }; };
  const mid = () => { const [a, b] = [...pts.values()]; return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, d: Math.hypot(a.x - b.x, a.y - b.y) }; };
  const start = (p, target) => { drag = { mode: s > 1 ? 'pan' : 'swipe', x: p.x, y: p.y, tx, ty, moved: false, target }; };
  function down(e) {
    if (e.button > 0) return;
    capture(ui.stage, e.pointerId);
    pts.set(e.pointerId, pos(e));
    ui.stage.dataset.gesture = '';
    if (pts.size === 2) { const m = mid(); drag = { mode: 'pinch', ...m, s, tx, ty, moved: true }; } else start(pos(e), e.target);
  }
  function move(e) {
    if (!pts.has(e.pointerId) || !drag) return;
    const p = pos(e);
    pts.set(e.pointerId, p);
    if (drag.mode === 'pinch') {
      if (pts.size < 2) return;
      const m = mid();
      const ns = clamp(drag.s * (m.d / drag.d), 1, maxZoom);
      const c = zoomAt(drag.tx, drag.ty, drag.s, ns, drag.x, drag.y);
      s = ns;
      tx = c.x + m.x - drag.x;
      ty = c.y + m.y - drag.y;
      return apply();
    }
    const dx = p.x - drag.x;
    const dy = p.y - drag.y;
    if (Math.hypot(dx, dy) > 6) drag.moved = true;
    if (drag.mode === 'pan') { tx = drag.tx + dx; ty = drag.ty + dy; } else tx = dx;
    apply();
  }
  function up(e) {
    if (!pts.delete(e.pointerId) || !drag) return;
    if (pts.size === 1) return start([...pts.values()][0], null);
    if (pts.size) return;
    delete ui.stage.dataset.gesture;
    const g = drag;
    drag = null;
    const p = pos(e);
    if (g.mode === 'swipe' && g.moved) {
      const far = Math.abs(tx) > Math.min(80, ui.stage.clientWidth * 0.15);
      if (far && items.length > 1) return step(tx < 0 ? 1 : -1);
      return apply();
    }
    if (g.moved) return apply();
    const now = Date.now();
    if (now - lastTap.t < 320 && Math.hypot(p.x - lastTap.x, p.y - lastTap.y) < 30) {
      lastTap.t = 0;
      return s > 1 ? zoomTo(1) : zoomTo(2.5, p.x, p.y);
    }
    lastTap = { t: now, x: p.x, y: p.y };
    if (g.target === ui.stage && s === 1) dlg.close();
  }
  function wheel(e) {
    e.preventDefault();
    const p = pos(e);
    zoomTo(s * Math.exp(-e.deltaY * (e.deltaMode ? 0.05 : 0.002)), p.x, p.y);
  }
  function onKey(e) {
    const k = e.key;
    if (k === 'ArrowLeft' || k === 'ArrowRight') step(k === 'ArrowLeft' ? -1 : 1);
    else if (k === 'Home' || k === 'End') show(k === 'Home' ? 0 : items.length - 1);
    else if (k === '+' || k === '=') zoomTo(s * 1.5);
    else if (k === '-' || k === '_') zoomTo(s / 1.5);
    else if (k === '0') zoomTo(1);
    else return;
    e.preventDefault();
  }

  const onClick = (e) => {
    const a = e.target.closest(selector);
    if (!a || !group.contains(a) || e.defaultPrevented || e.button > 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    open(collect(group, selector).findIndex((it) => it.el === a));
  };
  group.addEventListener('click', onClick);
  group.dataset.enhanced = '';

  const api = {
    open,
    close: () => dlg && dlg.close(),
    next: () => step(1),
    prev: () => step(-1),
    zoom: (z) => zoomTo(z),
    get index() { return index; },
    get isOpen() { return !!(dlg && dlg.open); },
    destroy: () => {
      group.removeEventListener('click', onClick);
      if (dlg) dlg.remove();
      delete group.dataset.enhanced;
      instances.delete(group);
    },
  };
  instances.set(group, api);
  return api;
}

define('image-viewer', (el, o) => createViewer(el, o).destroy);
