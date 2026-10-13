// Copy to clipboard: <button data-m-copy="text to copy"> or
// <button data-m-copy data-m-copy-target="#id"> copies the target's text.
import { define, emit } from '../core.mjs';

define('copy', (el, opts) => {
  const label = el.getAttribute('aria-label');
  const onClick = async () => {
    const target = opts.target ? document.querySelector(opts.target) : null;
    const text = el.dataset.mCopy || (target ? (target.value ?? target.textContent) : '');
    try {
      await navigator.clipboard.writeText(text);
      el.dataset.copied = '';
      el.setAttribute('aria-label', opts.done || 'Copied');
      emit(el, 'copy', { text });
      setTimeout(() => {
        delete el.dataset.copied;
        if (label === null) el.removeAttribute('aria-label');
        else el.setAttribute('aria-label', label);
      }, 1500);
    } catch {
      emit(el, 'copy-error', { text });
    }
  };
  el.addEventListener('click', onClick);
  return () => el.removeEventListener('click', onClick);
});
