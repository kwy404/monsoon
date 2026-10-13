// Dropzone: <div class="dropzone" data-m-dropzone><label class="dropzone-area">
// <input type="file" multiple> ...</label></div>. Without the script the label
// and native input still pick files; with it you get drag and drop, paste,
// validation, previews, progress, retry, reorder and a synced FileList.
// This module also holds the small helpers the other media components share.
import { define, emit } from '../core.mjs';

/* ---------- shared helpers ---------- */

export const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
const motionOk = () => typeof matchMedia !== 'function' || !matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Creates an element: h('button', { class: 'btn', type: 'button' }, 'Text', child). */
export function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'html') el.innerHTML = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? '' : v);
  }
  el.append(...children.filter((c) => c != null && c !== false));
  return el;
}

// Icons: 24px stroke paths, drawn with currentColor.
export const icon = (d) => `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg>`;
export const ICONS = {
  x: 'M18 6 6 18M6 6l12 12',
  retry: 'M3 12a9 9 0 0 1 15.5-6.2L21 8M21 3v5h-5M21 12a9 9 0 0 1-15.5 6.2L3 16M3 21v-5h5',
  grip: 'M9 6h.01M9 12h.01M9 18h.01M15 6h.01M15 12h.01M15 18h.01',
  play: 'M7 4v16l13-8z',
  pause: 'M8 5v14M16 5v14',
  file: 'M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5',
  music: 'M9 18V5l12-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM21 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  trash: 'M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6',
  download: 'M12 3v12M7 10l5 5 5-5M5 21h14',
  undo: 'M9 14 4 9l5-5M4 9h11a5 5 0 0 1 0 10h-3',
};

/** Pointer capture that tolerates synthetic or already released pointers. */
export function capture(el, id) {
  try { el.setPointerCapture(id); } catch { /* not an active pointer */ }
}

/** Live region for screen reader announcements, one per component root. */
export function announcer(root) {
  const live = h('span', { class: 'sr-only', role: 'status', 'aria-live': 'polite' });
  root.append(live);
  return (text) => { live.textContent = ''; setTimeout(() => { live.textContent = text; }, 30); };
}

/**
 * Publishes an instance getter on the browser global: Monsoon.dropzone(el).
 * The bundle assigns window.Monsoon after its modules run, so attach again
 * once the current script has finished.
 */
export function expose(name, map) {
  const get = (el) => map.get(typeof el === 'string' ? document.querySelector(el) : el);
  const attach = () => {
    const g = globalThis.Monsoon;
    if (g && typeof g === 'object' && !g[name]) try { g[name] = get; } catch { /* frozen namespace */ }
  };
  attach();
  if (typeof queueMicrotask === 'function') queueMicrotask(attach);
  return get;
}

/** Returns a copy of list with the item at from moved to to. */
export function moveItem(list, from, to) {
  const out = [...list];
  if (from < 0 || from >= out.length) return out;
  const [it] = out.splice(from, 1);
  out.splice(clamp(to, 0, out.length), 0, it);
  return out;
}

/** Index of the rect that contains the point, or -1. */
export function indexAt(rects, x, y) {
  return rects.findIndex((r) => x >= r.left && x <= r.right && y >= r.top && y <= r.bottom);
}

/** Animates siblings from their old rects to their new place (FLIP). */
function flip(els, before) {
  if (!motionOk()) return;
  els.forEach((el, i) => {
    const a = before[i];
    const b = el.getBoundingClientRect();
    const dx = a.left - b.left;
    const dy = a.top - b.top;
    if ((dx || dy) && el.animate) el.animate([{ transform: `translate(${dx}px,${dy}px)` }, { transform: 'none' }], { duration: 180, easing: 'cubic-bezier(.2,.8,.2,1)' });
  });
}

/** Moves one child of list by delta places, animated. Returns [from, to] or null. */
export function shift(list, el, delta, selector) {
  const items = [...list.querySelectorAll(`:scope > ${selector}`)];
  const from = items.indexOf(el);
  const to = clamp(from + delta, 0, items.length - 1);
  if (from < 0 || to === from) return null;
  const before = items.map((n) => n.getBoundingClientRect());
  if (to > from) items[to].after(el);
  else items[to].before(el);
  flip(items, before);
  return [from, to];
}

/**
 * Pointer driven reordering for mouse, pen and touch. Touch starts after a
 * long press on the item (so the page still scrolls) unless the handle opts
 * out of scrolling with touch-action: none.
 */
export function sortable(list, { item, handle = item, onEnd, longPress = false }) {
  let d = null;
  const kids = () => [...list.querySelectorAll(`:scope > ${item}`)];
  const swallow = (e) => { e.preventDefault(); e.stopPropagation(); };
  const begin = () => {
    d.active = true;
    d.el.dataset.dragging = '';
    list.dataset.sorting = '';
    capture(d.target, d.id);
  };
  const down = (e) => {
    const hEl = e.target.closest(handle);
    if (!hEl || !list.contains(hEl) || e.button > 0 || d) return;
    if (handle === item && e.target.closest('input, button, textarea, select')) return;
    const el = hEl.closest(item);
    const r = el.getBoundingClientRect();
    d = { el, id: e.pointerId, target: hEl, x: e.clientX, y: e.clientY, ox: r.left, oy: r.top, lx: r.left, ly: r.top, from: kids().indexOf(el), active: false, last: null };
    if (e.pointerType === 'touch' && longPress) d.timer = setTimeout(() => d && begin(), 320);
  };
  const move = (e) => {
    if (!d || e.pointerId !== d.id) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (!d.active) {
      if (Math.hypot(dx, dy) < 6) return;
      if (d.timer) return cancel(); // touch moved before the long press: let it scroll
      begin();
    }
    e.preventDefault();
    const others = kids().filter((n) => n !== d.el);
    const i = indexAt(others.map((n) => n.getBoundingClientRect()), e.clientX, e.clientY);
    const over = others[i];
    if (over && over !== d.last) {
      const all = kids();
      const before = all.map((n) => n.getBoundingClientRect());
      if (all.indexOf(over) > all.indexOf(d.el)) over.after(d.el);
      else over.before(d.el);
      d.el.style.translate = '';
      flip(all.filter((n) => n !== d.el), before.filter((_, k) => all[k] !== d.el));
      const r = d.el.getBoundingClientRect();
      d.lx = r.left;
      d.ly = r.top;
      d.last = over;
    } else if (!over) d.last = null;
    // Keep the item under the pointer wherever the list has moved it.
    d.el.style.translate = `${dx + d.ox - d.lx}px ${dy + d.oy - d.ly}px`;
  };
  const cancel = () => {
    if (!d) return;
    clearTimeout(d.timer);
    d.el.style.translate = '';
    delete d.el.dataset.dragging;
    delete list.dataset.sorting;
    d = null;
  };
  const up = (e) => {
    if (!d || e.pointerId !== d.id) return;
    const { el, from, active } = d;
    cancel();
    if (!active) return;
    addEventListener('click', swallow, { capture: true, once: true });
    setTimeout(() => removeEventListener('click', swallow, true), 0);
    const to = kids().indexOf(el);
    if (to !== from) onEnd(from, to, el);
  };
  const touchmove = (e) => { if (d && d.active) e.preventDefault(); };
  const ctx = (e) => { if (d && d.timer) e.preventDefault(); };
  list.addEventListener('pointerdown', down);
  list.addEventListener('pointermove', move);
  list.addEventListener('pointerup', up);
  list.addEventListener('pointercancel', cancel);
  list.addEventListener('touchmove', touchmove, { passive: false });
  list.addEventListener('contextmenu', ctx);
  const nodrag = (e) => { if (e.target.closest && e.target.closest(item)) e.preventDefault(); };
  list.addEventListener('dragstart', nodrag);
  return () => {
    list.removeEventListener('dragstart', nodrag);
    list.removeEventListener('pointerdown', down);
    list.removeEventListener('pointermove', move);
    list.removeEventListener('pointerup', up);
    list.removeEventListener('pointercancel', cancel);
    list.removeEventListener('touchmove', touchmove);
    list.removeEventListener('contextmenu', ctx);
  };
}

/** Drag and drop of files onto el: highlights with data-dragover. */
export function fileDrop(el, onFiles) {
  let depth = 0;
  const hasFiles = (e) => [...(e.dataTransfer?.types || [])].includes('Files');
  const set = (on) => { if (on) el.dataset.dragover = ''; else delete el.dataset.dragover; };
  const enter = (e) => { if (!hasFiles(e)) return; e.preventDefault(); depth++; set(true); };
  const over = (e) => { if (!hasFiles(e)) return; e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; };
  const leave = (e) => { if (!hasFiles(e)) return; if (--depth <= 0) { depth = 0; set(false); } };
  const drop = (e) => {
    if (e.defaultPrevented || !e.dataTransfer?.files?.length) return;
    e.preventDefault();
    depth = 0;
    set(false);
    onFiles([...e.dataTransfer.files]);
  };
  const paste = (e) => {
    const files = [...(e.clipboardData?.files || [])];
    if (e.defaultPrevented || !files.length) return;
    const active = document.activeElement;
    if (!(el.contains(active) || el.matches(':hover'))) return;
    e.preventDefault();
    onFiles(files);
  };
  const pairs = [['dragenter', enter], ['dragover', over], ['dragleave', leave], ['drop', drop]];
  for (const [t, f] of pairs) el.addEventListener(t, f);
  document.addEventListener('paste', paste);
  return () => {
    for (const [t, f] of pairs) el.removeEventListener(t, f);
    document.removeEventListener('paste', paste);
  };
}

/* ---------- file rules ---------- */

/** "5mb", "500 KB", "1.5gb" or a plain byte count. Empty means no limit. */
export function parseSize(value) {
  if (value == null || String(value).trim() === '') return Infinity;
  const m = String(value).trim().match(/^(\d+(?:\.\d+)?)\s*([kmgt]?)i?b?$/i);
  if (!m) return Infinity;
  const p = m[2] ? 'kmgt'.indexOf(m[2].toLowerCase()) + 1 : 0;
  return Math.round(parseFloat(m[1]) * 1024 ** p);
}

export function formatBytes(n) {
  if (!(n >= 1024)) return `${n || 0} B`;
  const units = ['KB', 'MB', 'GB', 'TB'];
  let i = -1;
  do { n /= 1024; i++; } while (n >= 1024 && i < units.length - 1);
  return `${n >= 100 ? Math.round(n) : Math.round(n * 10) / 10} ${units[i]}`;
}

const extOf = (name = '') => (name.includes('.') ? name.split('.').pop().toLowerCase() : '');

/** True when the file matches an accept list such as "image/*,.pdf". */
export function matchesAccept(file, accept) {
  if (!accept || !accept.trim()) return true;
  const type = (file.type || '').toLowerCase();
  const ext = `.${extOf(file.name)}`;
  return accept.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean).some((t) => {
    if (t.startsWith('.')) return ext === t;
    if (t.endsWith('/*')) return type.startsWith(t.slice(0, -1));
    return type === t;
  });
}

const KINDS = {
  pdf: ['pdf'],
  archive: ['zip', 'rar', '7z', 'tar', 'gz', 'tgz', 'bz2'],
  sheet: ['csv', 'xls', 'xlsx', 'ods', 'numbers', 'tsv'],
  slides: ['ppt', 'pptx', 'odp', 'key'],
  doc: ['doc', 'docx', 'odt', 'rtf', 'txt', 'md', 'pages'],
  code: ['js', 'mjs', 'ts', 'json', 'html', 'css', 'xml', 'yml', 'yaml', 'py', 'rb', 'php', 'go', 'rs', 'java', 'c', 'cpp', 'sh'],
};

/** Preview kind for a file: image, video, audio, pdf, archive, sheet, slides, doc, code or file. */
export function fileKind(file) {
  const type = file.type || '';
  const ext = extOf(file.name);
  for (const k of ['image', 'video', 'audio']) if (type.startsWith(`${k}/`)) return k;
  if (type === 'application/pdf') return 'pdf';
  for (const [k, list] of Object.entries(KINDS)) if (list.includes(ext)) return k;
  return 'file';
}

const sameFile = (a, b) => a.name === b.name && a.size === b.size && a.lastModified === b.lastModified;

/**
 * Splits incoming files into accepted ones and errors, given the files that
 * are already in the list. Rules: accept, minSize, maxSize, maxFiles, duplicates.
 */
export function validateFiles(incoming, { accept = '', maxSize = Infinity, minSize = 0, maxFiles = Infinity, existing = [] } = {}) {
  const accepted = [];
  const errors = [];
  const fail = (file, code, message) => errors.push({ file, code, message });
  for (const file of incoming) {
    const name = `"${file.name}"`;
    if ([...existing, ...accepted].some((f) => sameFile(f, file))) fail(file, 'duplicate', `${name} is already in the list.`);
    else if (!matchesAccept(file, accept)) fail(file, 'type', `${name} is not an accepted file type.`);
    else if (file.size > maxSize) fail(file, 'size', `${name} is ${formatBytes(file.size)}, the limit is ${formatBytes(maxSize)}.`);
    else if (file.size < minSize) fail(file, 'size', `${name} is smaller than ${formatBytes(minSize)}.`);
    else if (existing.length + accepted.length >= maxFiles) fail(file, 'count', `${name} was not added, the limit is ${maxFiles} ${maxFiles === 1 ? 'file' : 'files'}.`);
    else accepted.push(file);
  }
  return { accepted, errors };
}

/** Writes files into a native file input so a normal form submit sends them. */
export function setInputFiles(input, files) {
  try {
    const dt = new DataTransfer();
    for (const f of files) dt.items.add(f);
    input.files = dt.files;
    return true;
  } catch {
    return false; // no DataTransfer constructor (old browsers, test DOMs)
  }
}

const objectUrl = (file) => (typeof URL.createObjectURL === 'function' ? URL.createObjectURL(file) : '');
const revoke = (url) => { if (url && typeof URL.revokeObjectURL === 'function') URL.revokeObjectURL(url); };

/* ---------- component ---------- */

const instances = new WeakMap();
export const dropzone = expose('dropzone', instances);
let uid = 0;

define('dropzone', (el, o) => {
  const input = el.querySelector('input[type=file]');
  if (!input) return;
  const area = el.querySelector('.dropzone-area') || el;
  const host = area === el ? el.parentNode : el;
  const rules = () => ({
    accept: o.accept ?? input.accept,
    maxSize: parseSize(o.maxSize),
    minSize: o.minSize ? parseSize(o.minSize) : 0,
    maxFiles: input.multiple ? Number(o.maxFiles) || Infinity : 1,
  });
  const simulate = o.simulate !== 'false';
  const id = `dz${++uid}`;
  let items = [];

  const errorsEl = h('div', { class: 'dropzone-errors', role: 'alert', hidden: true });
  const list = h('ul', { class: 'dropzone-list', id: `${id}-list`, 'aria-label': 'Selected files', hidden: true });
  const count = h('span');
  const clearBtn = h('button', { type: 'button', class: 'btn btn-ghost btn-xs', onclick: () => clear() }, 'Remove all');
  const summary = h('div', { class: 'dropzone-summary', hidden: true }, count, clearBtn);
  const say = announcer(el);
  const parts = [errorsEl, list, summary];
  if (host === el) el.append(...parts);
  else area.after(...parts);
  el.dataset.enhanced = '';

  const showErrors = (errors) => {
    errorsEl.replaceChildren(...errors.map((e) => h('p', {}, e.message)));
    errorsEl.hidden = !errors.length;
    if (errors.length) emit(el, 'dropzone-error', { errors });
  };

  const sync = () => {
    setInputFiles(input, items.map((i) => i.file));
    const total = items.reduce((s, i) => s + i.file.size, 0);
    const done = items.filter((i) => i.status === 'done').length;
    count.textContent = `${items.length} ${items.length === 1 ? 'file' : 'files'}, ${formatBytes(total)}${done < items.length ? `, ${done} uploaded` : ''}`;
    list.hidden = summary.hidden = !items.length;
    el.toggleAttribute('data-has-files', items.length > 0);
  };

  const changed = () => {
    sync();
    emit(el, 'dropzone-change', { files: items.map((i) => i.file) });
  };

  const thumb = (it) => {
    const { kind, file } = it;
    if (kind === 'image' && it.url) return h('img', { src: it.url, alt: '', loading: 'lazy', decoding: 'async' });
    if (kind === 'video' && it.url) return h('video', { src: `${it.url}#t=0.1`, muted: true, playsinline: true, preload: 'metadata', 'aria-hidden': 'true' });
    if (kind === 'audio' && it.url) {
      let audio;
      const btn = h('button', { type: 'button', class: 'dropzone-play', 'aria-label': `Play ${file.name}`, html: icon(ICONS.play) });
      const set = (on) => { btn.innerHTML = icon(on ? ICONS.pause : ICONS.play); btn.setAttribute('aria-label', `${on ? 'Pause' : 'Play'} ${file.name}`); };
      btn.onclick = () => {
        audio ||= Object.assign(new Audio(it.url), { onended: () => set(false) });
        if (audio.paused) { audio.play(); set(true); } else { audio.pause(); set(false); }
      };
      it.stop = () => audio && audio.pause();
      return btn;
    }
    const ext = extOf(file.name).slice(0, 4).toUpperCase();
    return h('span', { class: 'dropzone-icon', html: icon(kind === 'audio' ? ICONS.music : ICONS.file) }, ext ? h('b', {}, ext) : null);
  };

  const render = (it) => {
    it.row.dataset.status = it.status;
    const pct = Math.round(it.progress * 100);
    it.bar.style.setProperty('--value', `${pct}%`);
    it.bar.setAttribute('aria-valuenow', pct);
    it.meta.textContent = it.status === 'error'
      ? it.error
      : `${formatBytes(it.file.size)}${it.status === 'uploading' ? `, ${pct}%` : it.status === 'done' ? ', done' : ''}`;
    it.retry.hidden = it.status !== 'error';
  };

  const build = (it) => {
    const name = it.file.name;
    it.bar = h('span', { class: 'dropzone-progress', role: 'progressbar', 'aria-label': `Upload of ${name}`, 'aria-valuemin': 0, 'aria-valuemax': 100 });
    it.meta = h('span', { class: 'dropzone-meta' });
    it.retry = h('button', { type: 'button', class: 'btn btn-icon btn-xs btn-square', 'aria-label': `Retry ${name}`, html: icon(ICONS.retry), onclick: () => upload(it) });
    const remove = h('button', { type: 'button', class: 'btn btn-icon btn-xs btn-square', 'aria-label': `Remove ${name}`, html: icon(ICONS.x), onclick: () => removeItem(it, true) });
    const handle = h('button', { type: 'button', class: 'dropzone-handle', 'aria-label': `Move ${name}, use the arrow keys`, html: icon(ICONS.grip) });
    handle.addEventListener('keydown', (e) => {
      const delta = { ArrowUp: -1, ArrowDown: 1 }[e.key];
      if (!delta) return;
      e.preventDefault();
      const moved = shift(list, it.row, delta, '.dropzone-item');
      if (moved) { reorder(...moved); handle.focus(); say(`${name} moved to position ${moved[1] + 1} of ${items.length}`); }
    });
    it.row = h('li', { class: 'dropzone-item', 'data-kind': it.kind },
      handle,
      h('span', { class: 'dropzone-thumb' }, thumb(it)),
      h('span', { class: 'dropzone-info' }, h('span', { class: 'dropzone-name', title: name }, name), it.meta, it.bar),
      it.retry, remove);
    return it.row;
  };

  const finish = (it, token, ok, value) => {
    if (it.token !== token) return;
    clearInterval(it.timer);
    it.status = ok ? 'done' : 'error';
    if (ok) it.progress = 1;
    else it.error = value || 'Upload failed';
    render(it);
    sync();
    emit(el, ok ? 'dropzone-complete' : 'dropzone-failed', { file: it.file, response: ok ? value : undefined, error: ok ? undefined : it.error });
    say(`${it.file.name} ${ok ? 'uploaded' : 'failed'}`);
  };

  const upload = (it) => {
    const token = (it.token = {});
    clearInterval(it.timer);
    it.status = 'uploading';
    it.progress = 0;
    it.error = '';
    render(it);
    sync();
    const handled = !emit(el, 'dropzone-upload', {
      file: it.file,
      progress: (f) => { if (it.token === token && it.status === 'uploading') { it.progress = clamp(+f || 0, 0, 1); render(it); } },
      done: (response) => finish(it, token, true, response),
      error: (message) => finish(it, token, false, message),
    });
    if (handled) return;
    if (!simulate) return finish(it, token, true);
    // Simulated progress: roughly one second per 2 MB, between 0.6 and 3 seconds.
    const steps = clamp(it.file.size / 2097152, 0.6, 3) * 1000 / 90;
    it.timer = setInterval(() => {
      it.progress = Math.min(1, it.progress + (0.5 + Math.random()) / steps);
      render(it);
      if (it.progress >= 1) finish(it, token, true);
    }, 90);
  };

  const add = (files) => {
    const r = rules();
    if (r.maxFiles === 1 && files.length) items.slice().forEach((it) => removeItem(it, false));
    const { accepted, errors } = validateFiles([...files], { ...r, existing: items.map((i) => i.file) });
    showErrors(errors);
    const added = accepted.map((file) => {
      const kind = fileKind(file);
      const it = { file, kind, status: 'queued', progress: 0, url: ['image', 'video', 'audio'].includes(kind) ? objectUrl(file) : '' };
      items.push(it);
      list.append(build(it));
      render(it);
      return it;
    });
    if (added.length) {
      changed();
      say(`${added.length} ${added.length === 1 ? 'file' : 'files'} added`);
      added.forEach(upload);
    } else sync();
    return added.map((i) => i.file);
  };

  const removeItem = (it, notify) => {
    const i = items.indexOf(it);
    if (i < 0) return;
    it.token = null;
    clearInterval(it.timer);
    if (it.stop) it.stop();
    revoke(it.url);
    items.splice(i, 1);
    const next = it.row.nextElementSibling || it.row.previousElementSibling;
    const focused = it.row.contains(document.activeElement);
    it.row.remove();
    if (focused) (next ? next.querySelector('[aria-label^="Remove"]') : input).focus();
    if (notify) { changed(); say(`${it.file.name} removed`); }
  };

  const clear = () => {
    items.slice().forEach((it) => removeItem(it, false));
    showErrors([]);
    changed();
    input.focus();
  };

  const reorder = (from, to) => {
    items = moveItem(items, from, to);
    changed();
    emit(el, 'dropzone-reorder', { from, to, files: items.map((i) => i.file) });
  };

  const onChange = () => {
    const files = [...input.files];
    // The native picker replaced the FileList: put the full list back first.
    sync();
    if (files.length) add(files);
  };
  input.addEventListener('change', onChange);
  const offDrop = fileDrop(el, add);
  const offSort = sortable(list, { item: '.dropzone-item', handle: '.dropzone-handle', onEnd: reorder });

  instances.set(el, {
    get files() { return items.map((i) => i.file); },
    add,
    remove: (i) => removeItem(typeof i === 'number' ? items[i] : items.find((it) => it.file === i), true),
    clear,
    retry: (i) => items[i] && upload(items[i]),
    validate: (files) => validateFiles(files, { ...rules(), existing: items.map((i) => i.file) }),
  });

  return () => {
    items.forEach((it) => { clearInterval(it.timer); revoke(it.url); });
    input.removeEventListener('change', onChange);
    offDrop();
    offSort();
    parts.forEach((p) => p.remove());
    delete el.dataset.enhanced;
    instances.delete(el);
  };
});
