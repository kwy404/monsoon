// Signature pad: <div class="signature" data-m-signature> with an optional
// <input type="hidden" name="signature"> that receives the drawing and an
// optional .signature-fallback text input. Without the script the text input
// lets people type their name. With it: smooth, pressure and speed aware
// strokes, pen colors and width, undo, clear, PNG and SVG export, and strokes
// that survive resizing (they are stored relative to the pad width).
import { define, emit } from '../core.mjs';
import { capture, clamp, expose, h, icon, ICONS } from './dropzone.mjs';

/**
 * Width of each point of a stroke: thinner when the pen moves fast, thicker
 * with pressure, smoothed so it never jumps. Points are { x, y, t, p }.
 */
export function strokeWidths(points, base) {
  let w = base;
  return points.map((pt, i) => {
    const prev = points[i - 1];
    const v = prev ? Math.hypot(pt.x - prev.x, pt.y - prev.y) / Math.max(1, pt.t - prev.t) : 0;
    const pressure = pt.p > 0 && pt.p !== 0.5 ? 0.6 + pt.p * 0.8 : 1;
    const target = base * pressure * clamp(1.3 - v * 0.35, 0.5, 1.3);
    w = prev ? w * 0.7 + target * 0.3 : target;
    return w;
  });
}

const r2 = (n) => Math.round(n * 100) / 100;

/**
 * Segments of a smooth path through the points (quadratic curves between
 * midpoints), each with its own width. Coordinates are multiplied by scale.
 */
export function segments(stroke, scale = 1) {
  const pts = stroke.points.map((p) => ({ ...p, x: p.x * scale, y: p.y * scale }));
  const widths = strokeWidths(pts, stroke.width);
  if (pts.length === 1) return [{ d: `M${r2(pts[0].x)} ${r2(pts[0].y)}l0 0`, w: widths[0] }];
  const out = [];
  let from = pts[0];
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i];
    const last = i === pts.length - 1;
    const to = last ? a : { x: (a.x + pts[i + 1].x) / 2, y: (a.y + pts[i + 1].y) / 2 };
    const ctrl = last ? { x: (from.x + a.x) / 2, y: (from.y + a.y) / 2 } : a;
    out.push({ d: `M${r2(from.x)} ${r2(from.y)}Q${r2(ctrl.x)} ${r2(ctrl.y)} ${r2(to.x)} ${r2(to.y)}`, w: widths[i], from, ctrl, to });
    from = to;
  }
  return out;
}

/** SVG markup of the strokes, for a pad of width by height pixels. */
export function toSvg(strokes, width, height, { background } = {}) {
  const w = Math.round(width);
  const hh = Math.round(height);
  const body = strokes.map((s) => {
    const paths = segments(s, width).map((g) => `<path d="${g.d}" stroke-width="${r2(g.w)}"/>`).join('');
    return `<g stroke="${s.color}">${paths}</g>`;
  }).join('');
  const bg = background ? `<rect width="100%" height="100%" fill="${background}"/>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${hh}" viewBox="0 0 ${w} ${hh}" fill="none" stroke-linecap="round" stroke-linejoin="round">${bg}${body}</svg>`;
}

const instances = new WeakMap();
export const signature = expose('signature', instances);

/** Default swatches: theme ink, primary and info, as CSS colors. */
const DEFAULT_COLORS = 'var(--foreground),var(--primary),var(--info)';

define('signature', (el, o) => {
  const canvas = el.querySelector('canvas') || h('canvas', { class: 'signature-canvas' });
  canvas.classList.add('signature-canvas');
  const pad = el.querySelector('.signature-pad') || h('div', { class: 'signature-pad' });
  if (!pad.isConnected) el.prepend(pad);
  if (canvas.parentNode !== pad) pad.prepend(canvas);
  const hidden = o.input ? document.querySelector(o.input) : el.querySelector('input[type=hidden]');
  const typed = el.querySelector('.signature-fallback');
  const format = o.format === 'svg' ? 'svg' : 'png';
  Object.assign(canvas, { tabIndex: 0 });
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', o.label || `Signature pad. Draw with a mouse, pen or finger.${typed ? ' You can also type your name in the field below.' : ''} Control Z undoes the last stroke.`);
  const hint = h('span', { class: 'signature-hint', 'aria-hidden': 'true' }, o.placeholder || 'Sign here');
  pad.append(hint);

  const strokes = [];
  let colorKey = (o.colors || DEFAULT_COLORS).split(',')[0].trim();
  let width = clamp(Number(o.width) || 2.5, 0.5, 20);
  const ctx = canvas.getContext && canvas.getContext('2d');
  let cssW = 0;
  let cssH = 0;

  // CSS color values (tokens included) resolved through a probe element.
  const probe = h('span', { hidden: true });
  el.append(probe);
  const resolve = (c) => { probe.style.color = ''; probe.style.color = c; return getComputedStyle(probe).color || c; };

  const swatches = (o.colors || DEFAULT_COLORS).split(',').map((c) => c.trim()).filter(Boolean);
  const colorBtns = swatches.map((c, i) => h('button', {
    type: 'button',
    class: 'signature-swatch',
    style: `--swatch:${c}`,
    'aria-label': `Pen color ${i + 1}`,
    'aria-pressed': String(c === colorKey),
    onclick: () => { colorKey = c; colorBtns.forEach((b, k) => b.setAttribute('aria-pressed', String(swatches[k] === c))); },
  }));
  const widthInput = h('input', { type: 'range', class: 'range range-sm signature-width', min: 1, max: 8, step: 0.5, value: width, 'aria-label': 'Pen width' });
  widthInput.addEventListener('input', () => { width = +widthInput.value; });
  const undoBtn = h('button', { type: 'button', class: 'btn btn-ghost btn-sm', html: `${icon(ICONS.undo)}<span>Undo</span>`, onclick: () => undo() });
  const clearBtn = h('button', { type: 'button', class: 'btn btn-ghost btn-sm', onclick: () => clear() }, 'Clear');
  const toolbar = o.toolbar === 'false' ? null : h('div', { class: 'signature-toolbar' },
    h('div', { class: 'signature-colors', role: 'group', 'aria-label': 'Pen color' }, ...colorBtns),
    widthInput,
    h('div', { class: 'signature-actions' }, undoBtn, clearBtn));
  if (toolbar) pad.after(toolbar);
  el.dataset.enhanced = '';

  const drawStroke = (s) => {
    ctx.strokeStyle = resolve(s.color);
    ctx.lineCap = ctx.lineJoin = 'round';
    for (const g of segments(s, cssW)) {
      ctx.lineWidth = g.w;
      ctx.beginPath();
      if (!g.ctrl) { ctx.arc(s.points[0].x * cssW, s.points[0].y * cssW, g.w / 2, 0, Math.PI * 2); ctx.fillStyle = ctx.strokeStyle; ctx.fill(); continue; }
      ctx.moveTo(g.from.x, g.from.y);
      ctx.quadraticCurveTo(g.ctrl.x, g.ctrl.y, g.to.x, g.to.y);
      ctx.stroke();
    }
  };
  const redraw = () => {
    if (!ctx) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const dpr = canvas.width / (cssW || 1);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    strokes.forEach(drawStroke);
  };
  const size = () => {
    const r = canvas.getBoundingClientRect();
    if (!r.width) return;
    const dpr = Math.min(3, globalThis.devicePixelRatio || 1);
    cssW = r.width;
    cssH = r.height;
    canvas.width = Math.round(r.width * dpr);
    canvas.height = Math.round(r.height * dpr);
    redraw();
  };
  const state = () => {
    const empty = !strokes.length;
    el.toggleAttribute('data-empty', empty);
    undoBtn.disabled = clearBtn.disabled = empty;
    if (hidden) hidden.value = empty ? '' : format === 'svg' ? api.toSVG() : api.toDataURL();
  };
  const changed = () => {
    state();
    emit(el, 'signature-change', { empty: !strokes.length, strokes: strokes.length });
  };
  const undo = () => { if (strokes.pop()) { redraw(); changed(); } };
  const clear = () => { strokes.length = 0; redraw(); changed(); };

  let current = null;
  const point = (e) => {
    const r = canvas.getBoundingClientRect();
    return { x: (e.clientX - r.left) / cssW, y: (e.clientY - r.top) / cssW, t: e.timeStamp, p: e.pointerType === 'pen' ? e.pressure : 0.5 };
  };
  const down = (e) => {
    if (e.button > 0 || !cssW) return;
    e.preventDefault();
    capture(canvas, e.pointerId);
    canvas.focus({ preventScroll: true });
    current = { id: e.pointerId, color: colorKey, width, points: [point(e)] };
    strokes.push(current);
    if (typed && typed.value) typed.value = '';
    el.removeAttribute('data-empty');
    redraw();
  };
  const move = (e) => {
    if (!current || e.pointerId !== current.id) return;
    const events = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
    for (const ev of events.length ? events : [e]) {
      const p = point(ev);
      const last = current.points[current.points.length - 1];
      if (Math.hypot(p.x - last.x, p.y - last.y) * cssW > 1.5) current.points.push(p);
    }
    redraw();
  };
  const up = (e) => {
    if (!current || e.pointerId !== current.id) return;
    current = null;
    changed();
  };
  const key = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); undo(); }
  };
  canvas.addEventListener('pointerdown', down);
  canvas.addEventListener('pointermove', move);
  canvas.addEventListener('pointerup', up);
  canvas.addEventListener('pointercancel', up);
  canvas.addEventListener('keydown', key);
  const onTyped = () => { if (typed.value && strokes.length) clear(); };
  if (typed) typed.addEventListener('input', onTyped);
  const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(size) : null;
  if (ro) ro.observe(canvas);
  const scheme = typeof matchMedia === 'function' ? matchMedia('(prefers-color-scheme: dark)') : null;
  if (scheme) scheme.addEventListener('change', redraw);
  size();

  const exportCanvas = (scale = 1, background) => {
    const c = document.createElement('canvas');
    c.width = Math.round(cssW * scale);
    c.height = Math.round(cssH * scale);
    const x = c.getContext('2d');
    if (background) { x.fillStyle = background; x.fillRect(0, 0, c.width, c.height); }
    x.drawImage(canvas, 0, 0, c.width, c.height);
    return c;
  };
  const resolved = () => strokes.map((s) => ({ ...s, color: resolve(s.color) }));
  const api = {
    get empty() { return !strokes.length; },
    isEmpty: () => !strokes.length,
    undo,
    clear,
    setColor: (c) => { colorKey = c; },
    setWidth: (w) => { width = clamp(+w, 0.5, 20); widthInput.value = width; },
    toData: () => strokes.map(({ color, width: w, points }) => ({ color, width: w, points: points.map((p) => ({ ...p })) })),
    fromData: (data) => { strokes.splice(0, strokes.length, ...data.map((s) => ({ ...s }))); redraw(); changed(); },
    toCanvas: (opts = {}) => exportCanvas(opts.scale || 1, opts.background),
    toDataURL: (type = 'image/png', quality, opts = {}) => exportCanvas(opts.scale || 1, opts.background ?? (/jpe?g/.test(type) ? 'white' : undefined)).toDataURL(type, quality),
    toBlob: (type = 'image/png', quality, opts = {}) => new Promise((res) => exportCanvas(opts.scale || 1, opts.background).toBlob(res, type, quality)),
    toSVG: (opts = {}) => toSvg(resolved(), cssW, cssH, opts),
  };
  instances.set(el, api);
  state();

  return () => {
    canvas.removeEventListener('pointerdown', down);
    canvas.removeEventListener('pointermove', move);
    canvas.removeEventListener('pointerup', up);
    canvas.removeEventListener('pointercancel', up);
    canvas.removeEventListener('keydown', key);
    if (typed) typed.removeEventListener('input', onTyped);
    if (ro) ro.disconnect();
    if (scheme) scheme.removeEventListener('change', redraw);
    if (toolbar) toolbar.remove();
    hint.remove();
    probe.remove();
    delete el.dataset.enhanced;
    instances.delete(el);
  };
});
