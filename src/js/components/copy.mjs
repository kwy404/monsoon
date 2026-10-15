// Copy to clipboard: <button data-m-copy="text to copy"> or
// <button data-m-copy data-m-copy-target="#id"> copies the target's text
// (the value of a field). data-m-copy-as="html" copies the target's markup
// instead, dedented, so a "Copy component" button can sit next to any
// example. Point it at a <template> to copy the markup exactly as written,
// before any script enhanced it.
//
// While the confirmation shows, the button has data-copied and its
// aria-label reads data-m-copy-done ("Copied" by default). An element inside
// the button with data-m-copy-label shows the same text.
//
// Monsoon.copy(text) is the same copy from code. It returns a promise that
// resolves once the text is on the clipboard, and also works on pages served
// over plain http, where the async clipboard API is missing.
import { define, emit } from '../core.mjs';

/** Removes the common indentation and the blank lines around a block of text. */
export function dedent(text) {
  const lines = String(text).replace(/\r\n?/g, '\n').replace(/\t/g, '  ').split('\n');
  while (lines.length && !lines[0].trim()) lines.shift();
  while (lines.length && !lines[lines.length - 1].trim()) lines.pop();
  const pad = Math.min(...lines.filter((l) => l.trim()).map((l) => l.match(/^ */)[0].length));
  return lines.map((l) => l.slice(Number.isFinite(pad) ? pad : 0).trimEnd()).join('\n');
}

/** The markup inside el (a template's content as written), without the copy state. */
export function markupOf(el) {
  if (!el) return '';
  if (el.tagName === 'TEMPLATE') return dedent(el.innerHTML);
  const clone = el.cloneNode(true);
  clone.querySelectorAll('[data-copied]').forEach((n) => n.removeAttribute('data-copied'));
  return dedent(clone.innerHTML);
}

function legacyCopy(text) {
  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  area.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;pointer-events:none';
  const active = document.activeElement;
  document.body.append(area);
  area.select();
  let ok = false;
  try { ok = document.execCommand('copy'); } catch { /* not supported */ }
  area.remove();
  if (active && active.focus) active.focus({ preventScroll: true });
  if (!ok) throw new Error('monsoon: the clipboard is not available');
}

/** Puts text on the clipboard and resolves with it. Rejects when the browser refuses. */
export async function copy(text) {
  const value = String(text ?? '');
  if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      return value;
    } catch { /* no permission or no focus: try the fallback */ }
  }
  legacyCopy(value);
  return value;
}

define('copy', (el, opts) => {
  const label = el.getAttribute('aria-label');
  const labelEl = el.querySelector('[data-m-copy-label]');
  const labelText = labelEl ? labelEl.textContent : '';
  let timer = 0;
  const reset = () => {
    clearTimeout(timer);
    delete el.dataset.copied;
    if (label === null) el.removeAttribute('aria-label');
    else el.setAttribute('aria-label', label);
    if (labelEl) labelEl.textContent = labelText;
  };
  const onClick = async () => {
    const target = opts.target ? document.querySelector(opts.target) : null;
    let text = el.dataset.mCopy;
    if (!text && target) text = opts.as === 'html' ? markupOf(target) : (target.value ?? target.textContent);
    text = text || '';
    try {
      await copy(text);
    } catch {
      emit(el, 'copy-error', { text });
      return;
    }
    // A second click restarts the confirmation instead of cutting it short.
    reset();
    const done = opts.done || 'Copied';
    el.dataset.copied = '';
    el.setAttribute('aria-label', done);
    if (labelEl) labelEl.textContent = done;
    emit(el, 'copy', { text });
    timer = setTimeout(reset, 1500);
  };
  el.addEventListener('click', onClick);
  return () => {
    el.removeEventListener('click', onClick);
    reset();
  };
});

// The browser bundle exposes Monsoon.copy(); its global is assigned after
// every module ran, so attach once the current script has finished.
if (typeof globalThis !== 'undefined') {
  const attach = () => {
    const g = globalThis.Monsoon;
    if (g && typeof g === 'object' && !g.copy) {
      try { g.copy = copy; } catch { /* frozen namespace */ }
    }
  };
  if (typeof queueMicrotask === 'function') queueMicrotask(attach);
  else Promise.resolve().then(attach);
}
