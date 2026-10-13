// Image cropper: <div class="cropper" data-m-cropper><img src="..." alt="..."></div>.
// Without the script the image simply shows. With it: a movable, resizable
// crop box, aspect presets, zoom (slider, wheel, pinch), rotate, flip, a rule
// of thirds grid, keyboard control, live previews and canvas, Blob, data URL
// or File export. Monsoon.cropper(el).toBlob() returns the crop.
import { define, emit } from '../core.mjs';
import { announcer, capture, clamp, expose, fileDrop, h, icon } from './dropzone.mjs';

/* ---------- pure geometry, all in stage pixels ---------- */

/** "16:9", "4/3", "1.5", "free" (0) or "circle" (1). */
export function parseAspect(v) {
  if (v == null || v === '' || v === 'free') return 0;
  if (v === 'circle') return 1;
  const m = String(v).match(/^\s*(\d*\.?\d+)\s*[:/x]\s*(\d*\.?\d+)\s*$/);
  const n = m ? m[1] / m[2] : parseFloat(v);
  return n > 0 && Number.isFinite(n) ? n : 0;
}

/** Size of the image once turned by quarter turns. */
export const rotatedSize = (w, h, quarter) => (quarter % 2 ? { w: h, h: w } : { w, h });

/** Scale at which the turned image fits inside the stage, keeping pad pixels free. */
export function fitScale(nw, nh, quarter, sw, sh, pad = 0) {
  const r = rotatedSize(nw, nh, quarter);
  return Math.max(1e-6, Math.min((sw - 2 * pad) / r.w, (sh - 2 * pad) / r.h));
}

/** Image centre on one axis: centred when smaller than the stage, never leaving a gap when larger. */
export function clampCenter(c, size, stage) {
  return size <= stage ? stage / 2 : clamp(c, stage - size / 2, size / 2);
}

export function intersect(a, b) {
  const x = Math.max(a.x, b.x);
  const y = Math.max(a.y, b.y);
  return { x, y, w: Math.max(0, Math.min(a.x + a.w, b.x + b.w) - x), h: Math.max(0, Math.min(a.y + a.h, b.y + b.h) - y) };
}

/** Largest size of the given aspect that fits in w by h. */
function fitAspect(w, h, aspect) {
  return w / h > aspect ? { w: h * aspect, h } : { w, h: w / aspect };
}

/** Box of the aspect (0 is free) centred in bounds, covering fill of it. */
export function initialBox(bounds, aspect, fill = 0.8) {
  const s = aspect ? fitAspect(bounds.w * fill, bounds.h * fill, aspect) : { w: bounds.w * fill, h: bounds.h * fill };
  return { x: bounds.x + (bounds.w - s.w) / 2, y: bounds.y + (bounds.h - s.h) / 2, w: s.w, h: s.h };
}

/** Moves a box, kept inside bounds. */
export function moveBox(b, dx, dy, bounds) {
  return { ...b, x: clamp(b.x + dx, bounds.x, bounds.x + bounds.w - b.w), y: clamp(b.y + dy, bounds.y, bounds.y + bounds.h - b.h) };
}

/** Makes a box valid: at least min, with the aspect, inside bounds, as close to the input as possible. */
export function constrainBox(b, bounds, aspect = 0, min = 0) {
  let w = Math.min(Math.max(b.w, min), bounds.w);
  let h = Math.min(Math.max(b.h, min), bounds.h);
  if (aspect) ({ w, h } = fitAspect(w, h, aspect));
  const cx = b.x + b.w / 2;
  const cy = b.y + b.h / 2;
  return moveBox({ x: cx - w / 2, y: cy - h / 2, w, h }, 0, 0, bounds);
}

/** Same centre and roughly the same area, with a new aspect. */
export function reshapeBox(b, aspect, bounds, min = 0) {
  if (!aspect) return constrainBox(b, bounds, 0, min);
  const area = b.w * b.h;
  const w = Math.sqrt(area * aspect);
  const s = fitAspect(Math.min(w, bounds.w), Math.min(w / aspect, bounds.h), aspect);
  return constrainBox({ x: b.x + b.w / 2 - s.w / 2, y: b.y + b.h / 2 - s.h / 2, w: s.w, h: s.h }, bounds, aspect, min);
}

/**
 * Resizes a box by dragging one of its handles (n, ne, e, se, s, sw, w, nw)
 * by dx, dy. The opposite edge or corner stays put, an edge handle keeps the
 * other axis centred, and the result stays inside bounds with the aspect.
 */
export function resizeBox(b, handle, dx, dy, aspect, bounds, min = 0) {
  const W = handle.includes('w');
  const E = handle.includes('e');
  const N = handle.includes('n');
  const S = handle.includes('s');
  const right = b.x + b.w;
  const bottom = b.y + b.h;
  const bx2 = bounds.x + bounds.w;
  const by2 = bounds.y + bounds.h;
  let l = W ? clamp(b.x + dx, bounds.x, right - min) : b.x;
  let r = E ? clamp(right + dx, b.x + min, bx2) : right;
  let t = N ? clamp(b.y + dy, bounds.y, bottom - min) : b.y;
  let btm = S ? clamp(bottom + dy, b.y + min, by2) : bottom;
  if (!aspect) return { x: l, y: t, w: r - l, h: btm - t };
  let w = r - l;
  let h = btm - t;
  const horiz = W || E;
  const vert = N || S;
  if (horiz && !vert) h = w / aspect;
  else if (vert && !horiz) w = h * aspect;
  else if (w / h > aspect) h = w / aspect;
  else w = h * aspect;
  if (w < min) { w = min; h = w / aspect; }
  if (h < min) { h = min; w = h * aspect; }
  // Room from the anchor to the bounds on each axis.
  const cx = b.x + b.w / 2;
  const cy = b.y + b.h / 2;
  const roomW = W ? right - bounds.x : E ? bx2 - b.x : 2 * Math.min(cx - bounds.x, bx2 - cx);
  const roomH = N ? bottom - bounds.y : S ? by2 - b.y : 2 * Math.min(cy - bounds.y, by2 - cy);
  const k = Math.min(1, roomW / w, roomH / h);
  w *= k;
  h *= k;
  l = W ? right - w : E ? b.x : cx - w / 2;
  t = N ? bottom - h : S ? b.y : cy - h / 2;
  return { x: l, y: t, w, h };
}

/** New image centre after changing the scale from s to s2 around point (px, py). */
export function zoomAt(cx, cy, s, s2, px, py) {
  const k = s2 / s;
  return { x: px + (cx - px) * k, y: py + (cy - py) * k };
}

/** The crop in source pixels of the turned image, plus the transform. */
export function cropData(st) {
  const s = st.fit * st.zoom;
  const r = rotatedSize(st.nw, st.nh, st.quarter);
  const ix = st.cx - (r.w * s) / 2;
  const iy = st.cy - (r.h * s) / 2;
  const round = (v) => Math.round(v * 100) / 100;
  return {
    x: round((st.box.x - ix) / s),
    y: round((st.box.y - iy) / s),
    width: round(st.box.w / s),
    height: round(st.box.h / s),
    rotate: st.quarter * 90,
    flipX: st.fx < 0,
    flipY: st.fy < 0,
    zoom: round(st.zoom),
  };
}

/**
 * Output size in pixels for a crop of w by h source pixels. width or height
 * force a size (the other follows the crop shape); max caps the long side.
 */
export function outputSize(w, h, { width, height, max } = {}) {
  let ow = w;
  let oh = h;
  if (width && height) { ow = width; oh = height; } else if (width) { ow = width; oh = (width * h) / w; } else if (height) { oh = height; ow = (height * w) / h; }
  if (max && Math.max(ow, oh) > max) { const k = max / Math.max(ow, oh); ow *= k; oh *= k; }
  return { width: Math.max(1, Math.round(ow)), height: Math.max(1, Math.round(oh)) };
}

/** CSS transform that places a natural size image like the stage shows it. */
export const imageTransform = (st) => `translate(${st.cx}px,${st.cy}px) rotate(${st.quarter * 90}deg) scale(${st.fx * st.fit * st.zoom},${st.fy * st.fit * st.zoom}) translate(-50%,-50%)`;

/* ---------- component ---------- */

const PRESETS = { free: 'Free', '1:1': '1:1', '4:3': '4:3', '16:9': '16:9', '3:4': '3:4', circle: 'Circle' };
const HANDLES = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
const I = {
  rotate: 'M21 12a9 9 0 1 1-3-6.7L21 8M21 3v5h-5',
  flipX: 'M12 3v18M16 7l4 5-4 5zM8 7l-4 5 4 5z',
  flipY: 'M3 12h18M7 8l5-4 5 4zM7 16l5 4 5-4z',
  reset: 'M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5',
  zoomOut: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM21 21l-5-5M8 11h6',
  zoomIn: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM21 21l-5-5M8 11h6M11 8v6',
};
/** Matches of selector in the closest ancestor of el that has any. */
function nearest(el, selector) {
  for (let n = el.parentElement; n; n = n.parentElement) {
    const found = [...n.querySelectorAll(selector)];
    if (found.length) return found;
  }
  return [];
}

const instances = new WeakMap();
export const cropper = expose('cropper', instances);
let uid = 0;

/**
 * Enhances a .cropper element. Options: aspect, aspects (comma list of
 * presets, or "none"), preview (selector), maxZoom, toolbar ("false" hides it),
 * width, height, max (output size).
 */
export function createCropper(el, o = {}) {
  const img = el.querySelector('img');
  if (!img) return { destroy() {} };
  const id = `crop${++uid}`;
  const maxZoom = Number(o.maxZoom) || 8;
  const MIN = 24;
  const PAD = 12;
  let aspectName = o.aspect || 'free';
  const st = { sw: 0, sh: 0, nw: 0, nh: 0, quarter: 0, fx: 1, fy: 1, zoom: 1, fit: 1, cx: 0, cy: 0, box: { x: 0, y: 0, w: 0, h: 0 }, aspect: parseAspect(aspectName), ready: false };
  const scale = () => st.fit * st.zoom;
  const imageRect = () => {
    const r = rotatedSize(st.nw, st.nh, st.quarter);
    const w = r.w * scale();
    const hh = r.h * scale();
    return { x: st.cx - w / 2, y: st.cy - hh / 2, w, h: hh };
  };
  const bounds = () => intersect(imageRect(), { x: 0, y: 0, w: st.sw, h: st.sh });

  // DOM
  const view = h('img', { class: 'cropper-image', alt: '', draggable: 'false', 'aria-hidden': 'true' });
  const grid = h('span', { class: 'cropper-grid' });
  const box = h('div', {
    class: 'cropper-box',
    tabindex: 0,
    role: 'group',
    'aria-roledescription': 'crop area',
    'aria-label': 'Crop area. Arrow keys move it, Shift and arrow keys resize it, plus and minus zoom.',
  }, grid, ...HANDLES.map((d) => h('span', { class: 'cropper-handle', 'data-handle': d })));
  const stage = h('div', { class: 'cropper-stage' }, view, box);
  img.replaceWith(stage);
  stage.append(img);
  img.hidden = true;
  const say = announcer(el);

  const zoomRange = h('input', { type: 'range', class: 'range range-sm', min: 0, max: 1000, value: 0, 'aria-label': 'Zoom' });
  const iconBtn = (label, d, fn) => h('button', { type: 'button', class: 'btn btn-icon btn-sm btn-square', 'aria-label': label, title: label, html: icon(d), onclick: fn });
  const names = o.aspects === 'none' ? [] : (o.aspects || Object.keys(PRESETS).join(',')).split(',').map((s) => s.trim()).filter(Boolean);
  const presets = names.length > 1 ? h('div', { class: 'segmented segmented-sm', role: 'radiogroup', 'aria-label': 'Aspect ratio' },
    ...names.map((n) => h('label', { class: 'segmented-item' },
      h('input', { type: 'radio', name: `${id}-aspect`, value: n, checked: n === aspectName, onchange: () => setAspect(n) }),
      PRESETS[n] || n))) : null;
  let flipX;
  let flipY;
  const toolbar = o.toolbar === 'false' ? null : h('div', { class: 'cropper-toolbar' },
    presets,
    h('div', { class: 'cropper-zoom' }, iconBtn('Zoom out', I.zoomOut, () => zoomBy(1 / 1.25)), zoomRange, iconBtn('Zoom in', I.zoomIn, () => zoomBy(1.25))),
    h('div', { class: 'cropper-actions' },
      iconBtn('Rotate 90 degrees', I.rotate, () => api.rotate()),
      flipX = iconBtn('Flip horizontally', I.flipX, () => api.flip('x')),
      flipY = iconBtn('Flip vertically', I.flipY, () => api.flip('y')),
      iconBtn('Reset', I.reset, () => api.reset())));
  if (toolbar) el.append(toolbar);
  const previews = o.preview ? nearest(el, o.preview) : [];
  const previewImgs = previews.map((p) => {
    p.classList.add('cropper-preview');
    const pi = h('img', { alt: '', 'aria-hidden': 'true', draggable: 'false' });
    p.replaceChildren(pi);
    return pi;
  });
  el.dataset.enhanced = '';

  // Rendering, batched per frame.
  let frame = 0;
  let quiet = false;
  const paint = () => {
    frame = 0;
    if (!st.ready) return;
    const { box: b } = st;
    view.style.transform = imageTransform(st);
    box.style.transform = `translate(${b.x}px,${b.y}px)`;
    box.style.width = `${b.w}px`;
    box.style.height = `${b.h}px`;
    el.style.setProperty('--cropper-ratio', `${b.w / b.h}`);
    zoomRange.value = Math.round((Math.log(st.zoom) / Math.log(maxZoom)) * 1000);
    zoomRange.setAttribute('aria-valuetext', `${Math.round(st.zoom * 100)}%`);
    if (flipX) { flipX.setAttribute('aria-pressed', String(st.fx < 0)); flipY.setAttribute('aria-pressed', String(st.fy < 0)); }
    previews.forEach((p, i) => {
      p.style.setProperty('--cropper-ratio', `${b.w / b.h}`);
      const k = p.clientWidth / b.w;
      previewImgs[i].style.transform = `scale(${k}) translate(${-b.x}px,${-b.y}px) ${imageTransform(st)}`;
    });
    if (!quiet) emit(el, 'crop', cropData(st));
    quiet = false;
  };
  const commit = () => { if (!frame) frame = requestAnimationFrame(paint); };

  const setNatural = () => {
    st.nw = img.naturalWidth || img.width || 300;
    st.nh = img.naturalHeight || img.height || 150;
    view.src = img.currentSrc || img.src;
    previewImgs.forEach((p) => { p.src = view.src; });
    for (const v of [view, ...previewImgs]) { v.style.width = `${st.nw}px`; v.style.height = `${st.nh}px`; }
  };
  const layout = (reset) => {
    const r = stage.getBoundingClientRect();
    if (!r.width || !r.height || !st.nw) return;
    const fit = fitScale(st.nw, st.nh, st.quarter, r.width, r.height, PAD);
    if (reset || !st.ready) {
      Object.assign(st, { sw: r.width, sh: r.height, fit, cx: r.width / 2, cy: r.height / 2, zoom: 1 });
      st.box = initialBox(bounds(), st.aspect, o.fill ? +o.fill : 0.8);
      const wasReady = st.ready;
      st.ready = true;
      el.dataset.ready = '';
      if (!wasReady) emit(el, 'cropper-ready', cropData(st));
    } else {
      // Keep everything in place relative to the stage centre.
      const k = fit / st.fit;
      const mx = (v) => r.width / 2 + (v - st.sw / 2) * k;
      const my = (v) => r.height / 2 + (v - st.sh / 2) * k;
      const b = st.box;
      st.box = { x: mx(b.x), y: my(b.y), w: b.w * k, h: b.h * k };
      Object.assign(st, { cx: mx(st.cx), cy: my(st.cy), sw: r.width, sh: r.height, fit });
      settle();
    }
    commit();
  };
  const settle = () => {
    const ir = imageRect();
    st.cx = clampCenter(st.cx, ir.w, st.sw);
    st.cy = clampCenter(st.cy, ir.h, st.sh);
    st.box = constrainBox(st.box, bounds(), st.aspect, Math.min(MIN, bounds().w, bounds().h));
  };
  const zoomTo = (z, px, py) => {
    const nz = clamp(z, 1, maxZoom);
    if (px == null) { px = st.box.x + st.box.w / 2; py = st.box.y + st.box.h / 2; }
    const c = zoomAt(st.cx, st.cy, scale(), st.fit * nz, px, py);
    Object.assign(st, { zoom: nz, cx: c.x, cy: c.y });
    settle();
    commit();
  };
  const zoomBy = (k, px, py) => zoomTo(st.zoom * k, px, py);
  const setAspect = (name) => {
    aspectName = name;
    st.aspect = parseAspect(name);
    for (const n of [el, ...previews]) n.toggleAttribute('data-circle', name === 'circle');
    if (st.ready) st.box = reshapeBox(st.box, st.aspect, bounds(), MIN);
    const radio = el.querySelector(`input[value="${name}"]`);
    if (radio) radio.checked = true;
    commit();
  };
  setAspect(aspectName);

  // Pointer: handles resize, the box moves, the image pans, two fingers pinch.
  const pointers = new Map();
  let drag = null;
  const local = (e) => { const r = stage.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  const pinchInfo = () => {
    const [a, b] = [...pointers.values()];
    return { d: Math.hypot(a.x - b.x, a.y - b.y), x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  };
  const down = (e) => {
    if (!st.ready || e.button > 0) return;
    e.preventDefault();
    capture(stage, e.pointerId);
    pointers.set(e.pointerId, local(e));
    el.dataset.active = '';
    if (pointers.size === 2) {
      const p = pinchInfo();
      drag = { mode: 'pinch', d: p.d, zoom: st.zoom };
      return;
    }
    const handle = e.target.closest('.cropper-handle');
    const p = local(e);
    drag = { mode: handle ? handle.dataset.handle : e.target.closest('.cropper-box') ? 'move' : 'pan', x: p.x, y: p.y, box: { ...st.box }, cx: st.cx, cy: st.cy };
    if (drag.mode !== 'pan') box.focus({ preventScroll: true, focusVisible: false });
    el.dataset.drag = drag.mode;
  };
  const move = (e) => {
    if (!pointers.has(e.pointerId) || !drag) return;
    pointers.set(e.pointerId, local(e));
    if (drag.mode === 'pinch') {
      if (pointers.size < 2) return;
      const p = pinchInfo();
      zoomTo(drag.zoom * (p.d / drag.d), p.x, p.y);
      return;
    }
    const p = local(e);
    const dx = p.x - drag.x;
    const dy = p.y - drag.y;
    if (drag.mode === 'move') st.box = moveBox(drag.box, dx, dy, bounds());
    else if (drag.mode === 'pan') { st.cx = drag.cx + dx; st.cy = drag.cy + dy; settle(); } else st.box = resizeBox(drag.box, drag.mode, dx, dy, st.aspect, bounds(), MIN);
    commit();
  };
  const up = (e) => {
    pointers.delete(e.pointerId);
    if (pointers.size) return;
    drag = null;
    delete el.dataset.active;
    delete el.dataset.drag;
  };
  const wheel = (e) => {
    if (!st.ready) return;
    e.preventDefault();
    const p = local(e);
    zoomBy(Math.exp(-e.deltaY * (e.deltaMode ? 0.05 : 0.0015)), p.x, p.y);
  };
  const key = (e) => {
    const step = e.ctrlKey || e.altKey ? 10 : 1;
    const dir = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
    if (dir) {
      st.box = e.shiftKey
        ? resizeBox(st.box, 'se', dir[0] * step, dir[1] * step, st.aspect, bounds(), MIN)
        : moveBox(st.box, dir[0] * step, dir[1] * step, bounds());
    } else if (e.key === '+' || e.key === '=') zoomBy(1.1);
    else if (e.key === '-' || e.key === '_') zoomBy(1 / 1.1);
    else return;
    e.preventDefault();
    commit();
    const d = cropData(st);
    say(`Crop ${Math.round(d.width)} by ${Math.round(d.height)} at ${Math.round(d.x)}, ${Math.round(d.y)}, zoom ${Math.round(st.zoom * 100)}%`);
  };
  zoomRange.addEventListener('input', () => zoomTo(maxZoom ** (zoomRange.value / 1000)));
  stage.addEventListener('pointerdown', down);
  stage.addEventListener('pointermove', move);
  stage.addEventListener('pointerup', up);
  stage.addEventListener('pointercancel', up);
  stage.addEventListener('wheel', wheel, { passive: false });
  box.addEventListener('keydown', key);
  const offDrop = fileDrop(el, (files) => { const f = files.find((x) => x.type.startsWith('image/')); if (f) api.load(f); });

  let url = '';
  const onLoad = () => { setNatural(); layout(true); };
  img.addEventListener('load', onLoad);
  if (img.complete && img.naturalWidth) onLoad();
  const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(() => layout(false)) : null;
  if (ro) ro.observe(stage);

  const draw = ({ width, height, max, circle = st.aspect === 1 && aspectName === 'circle', background } = {}) => {
    const d = cropData(st);
    const size = outputSize(d.width, d.height, { width, height, max: max ?? (o.max ? +o.max : undefined) });
    const canvas = document.createElement('canvas');
    canvas.width = size.width;
    canvas.height = size.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;
    ctx.imageSmoothingQuality = 'high';
    if (background) { ctx.fillStyle = background; ctx.fillRect(0, 0, size.width, size.height); }
    if (circle) {
      ctx.beginPath();
      ctx.ellipse(size.width / 2, size.height / 2, size.width / 2, size.height / 2, 0, 0, Math.PI * 2);
      ctx.clip();
    }
    const b = st.box;
    ctx.scale(size.width / b.w, size.height / b.h);
    ctx.translate(st.cx - b.x, st.cy - b.y);
    ctx.rotate((st.quarter * Math.PI) / 2);
    ctx.scale(st.fx * scale(), st.fy * scale());
    ctx.drawImage(img, -st.nw / 2, -st.nh / 2, st.nw, st.nh);
    return canvas;
  };
  const jpegBg = (type, opts) => ({ ...opts, background: opts?.background ?? (/jpe?g/.test(type || '') ? 'white' : undefined) });

  const api = {
    get data() { return cropData(st); },
    get element() { return el; },
    getData: () => cropData(st),
    toCanvas: (opts) => draw(opts),
    toDataURL: (type = 'image/png', quality, opts) => draw(jpegBg(type, opts)).toDataURL(type, quality),
    toBlob: (type = 'image/png', quality, opts) => new Promise((res, rej) => draw(jpegBg(type, opts)).toBlob((b) => (b ? res(b) : rej(new Error('monsoon: export failed'))), type, quality)),
    toFile: async (name = 'crop.png', type = 'image/png', quality, opts) => new File([await api.toBlob(type, quality, opts)], name, { type }),
    setAspect,
    zoom: (z) => zoomTo(z),
    rotate: (turns = 1) => {
      st.quarter = (((st.quarter + turns) % 4) + 4) % 4;
      layout(true);
      say(`Rotated to ${st.quarter * 90} degrees`);
    },
    flip: (axis = 'x') => { if (axis === 'y') st.fy *= -1; else st.fx *= -1; commit(); },
    reset: () => { Object.assign(st, { quarter: 0, fx: 1, fy: 1 }); layout(true); },
    setBox: (b) => { st.box = constrainBox(b, bounds(), st.aspect, MIN); commit(); },
    load: (src) => new Promise((res, rej) => {
      if (url) URL.revokeObjectURL(url);
      url = typeof src === 'string' ? '' : URL.createObjectURL(src);
      Object.assign(st, { quarter: 0, fx: 1, fy: 1 });
      img.addEventListener('load', () => res(api), { once: true });
      img.addEventListener('error', rej, { once: true });
      img.src = url || src;
    }),
    destroy: () => {
      cancelAnimationFrame(frame);
      if (ro) ro.disconnect();
      offDrop();
      img.removeEventListener('load', onLoad);
      img.hidden = false;
      stage.replaceWith(img);
      if (toolbar) toolbar.remove();
      el.querySelector('.sr-only[role=status]')?.remove();
      delete el.dataset.enhanced;
      delete el.dataset.ready;
      if (url) URL.revokeObjectURL(url);
      instances.delete(el);
    },
  };
  // Silence the first paint's event until the image is ready.
  quiet = true;
  instances.set(el, api);
  return api;
}

define('cropper', (el, o) => createCropper(el, o).destroy);
