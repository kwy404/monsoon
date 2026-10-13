// Backup codes panel: copy every unused code, download them as a .txt file,
// print them, and keep the continue button disabled until "I saved them"
// is checked. Parts are marked with data-codes-action:
//
//   <div class="backup-codes" data-m-auth-codes data-m-auth-codes-filename="example-recovery-codes.txt">
//     <ol class="backup-codes-grid"><li class="backup-code"><code>7KQ2-M9XA</code></li> ...</ol>
//     <button data-codes-action="copy">Copy all</button>
//     <button data-codes-action="download">Download</button>
//     <button data-codes-action="print">Print</button>
//     <input type="checkbox" data-codes-action="confirm">
//     <button data-codes-action="continue" disabled>Continue</button>
//   </div>
//
// Options: -filename, -title (first line of the file). Fires
// monsoon:auth-codes with { action, codes } after copy, download and print.
import { define, emit } from '../core.mjs';
import { copyText, expose, flash } from './auth-util.mjs';

/** The unused codes, in order, from .backup-code items (used ones are skipped). */
export function readCodes(root) {
  return [...root.querySelectorAll('.backup-code')]
    .filter((li) => !li.classList.contains('backup-code-used'))
    .map((li) => (li.querySelector('code') || li).textContent.trim())
    .filter(Boolean);
}

/** Plain text file contents: a title, the date, the codes and a short note. */
export function codesText(codes, { title = 'Recovery codes', date = new Date() } = {}) {
  const day = date.toISOString().slice(0, 10);
  return [
    title,
    `Saved on ${day}`,
    '',
    ...codes.map((c, i) => `${String(i + 1).padStart(2, ' ')}. ${c}`),
    '',
    'Each code works once. Keep this file somewhere safe and private.',
    '',
  ].join('\n');
}

export function codesPanel(root, opts = {}) {
  const part = (name) => root.querySelector(`[data-codes-action="${name}"]`);
  const confirm = part('confirm');
  const next = part('continue');
  const title = opts.title || 'Recovery codes';
  const sync = () => {
    if (!confirm || !next) return;
    if (next.tagName === 'BUTTON') next.disabled = !confirm.checked;
    else next.setAttribute('aria-disabled', String(!confirm.checked));
  };
  const actions = {
    async copy(button) {
      const codes = readCodes(root);
      if (await copyText(codes.join('\n')) && button) flash(button, 'Codes copied');
      emit(root, 'auth-codes', { action: 'copy', codes });
    },
    download(button) {
      const codes = readCodes(root);
      const blob = new Blob([codesText(codes, { title })], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = opts.filename || 'recovery-codes.txt';
      document.body.append(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      if (button) flash(button, 'Codes downloaded');
      emit(root, 'auth-codes', { action: 'download', codes });
    },
    print() {
      const codes = readCodes(root);
      const frame = document.createElement('iframe');
      frame.setAttribute('aria-hidden', 'true');
      frame.style.cssText = 'position:fixed;width:0;height:0;border:0;opacity:0';
      document.body.append(frame);
      const doc = frame.contentDocument;
      const esc = (s) => s.replace(/[&<>]/g, (c) => `&#${c.charCodeAt(0)};`);
      doc.open();
      doc.write(`<!doctype html><title>${esc(title)}</title><style>body{font:14px system-ui,sans-serif;margin:2.5rem}ol{display:grid;grid-template-columns:1fr 1fr;gap:.75rem 2rem;padding-left:1.5rem}code{font:600 16px ui-monospace,monospace;letter-spacing:.06em}p{color:#555}</style><h1>${esc(title)}</h1><p>Each code works once. Keep this page somewhere safe and private.</p><ol>${codes.map((c) => `<li><code>${esc(c)}</code></li>`).join('')}</ol>`);
      doc.close();
      const done = () => setTimeout(() => frame.remove(), 500);
      try {
        frame.contentWindow.addEventListener('afterprint', done);
        frame.contentWindow.focus();
        frame.contentWindow.print();
      } catch {
        done();
      }
      emit(root, 'auth-codes', { action: 'print', codes });
    },
  };
  const onClick = (e) => {
    const button = e.target.closest('[data-codes-action]');
    if (!button || !root.contains(button)) return;
    const fn = actions[button.dataset.codesAction];
    if (fn) fn(button);
  };
  root.addEventListener('click', onClick);
  if (confirm) confirm.addEventListener('change', sync);
  sync();

  const api = {
    get codes() { return readCodes(root); },
    copy: () => actions.copy(part('copy')),
    download: () => actions.download(part('download')),
    print: () => actions.print(),
    destroy() {
      root.removeEventListener('click', onClick);
      if (confirm) confirm.removeEventListener('change', sync);
      if (root.monsoon) delete root.monsoon.authCodes;
    },
  };
  return expose(root, 'authCodes', api);
}

define('auth-codes', (root, opts) => codesPanel(root, opts).destroy);
