// Password field: the reveal button switches the input between password and
// text, and an optional .password-strength meter scores what is typed.
//
//   <div class="field" data-m-password>
//     <div class="password-field">
//       <input type="password" class="input" aria-label="Password">
//       <button type="button" class="password-field-toggle" aria-pressed="false" aria-label="Show password"></button>
//     </div>
//     <div class="password-strength"></div>
//   </div>
//
// Fires monsoon:strength with { score, label } (score 0 to 4).
import { define, emit } from '../core.mjs';
import { expose, h, uid } from './combobox.mjs';

const COMMON = /password|passw0rd|123456|qwerty|letmein|monkey|dragon|abc123|iloveyou|admin|welcome|111111|000000/i;
const SEQUENCE = /0123|1234|2345|3456|4567|5678|6789|abcd|bcde|cdef|qwer|asdf|zxcv|(.)\1\1/i;
export const STRENGTH = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong'];

/** A 0 to 4 score from length, character variety and common patterns. */
export function passwordScore(pw = '') {
  if (pw.length < 6) return 0;
  const kinds = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z\d]/].filter((r) => r.test(pw)).length;
  let s = [8, 12, 16, 20].filter((n) => pw.length >= n).length + (kinds >= 2) + (kinds >= 3) + (kinds >= 4);
  if (SEQUENCE.test(pw)) s -= 2;
  if (COMMON.test(pw)) s = Math.min(s, 1);
  return Math.max(0, Math.min(4, Math.round(s * 0.7)));
}

define('password', (root, opts) => {
  const input = root.querySelector('input');
  if (!input) return;
  const toggle = root.querySelector('.password-field-toggle');
  const meter = root.querySelector('.password-strength') || (opts.meter && document.querySelector(opts.meter));
  if (toggle) {
    toggle.addEventListener('click', () => {
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      toggle.setAttribute('aria-pressed', String(show));
      toggle.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
    });
  }
  let label;
  if (meter) {
    if (!meter.querySelector('.password-strength-bar')) meter.append(...Array.from({ length: 4 }, () => h('span', { class: 'password-strength-bar' })));
    label = meter.querySelector('.password-strength-label') || h('span', { class: 'password-strength-label', 'aria-live': 'polite' });
    meter.append(label);
    label.id = label.id || uid('strength');
    const ids = input.getAttribute('aria-describedby');
    input.setAttribute('aria-describedby', ids ? `${ids} ${label.id}` : label.id);
  }
  let last = -1;
  const rate = () => {
    if (!meter) return;
    const score = input.value ? passwordScore(input.value) : -1;
    meter.dataset.score = score < 0 ? '' : score;
    label.textContent = score < 0 ? '' : STRENGTH[score];
    if (score !== last && score >= 0) emit(root, 'strength', { score, label: STRENGTH[score] });
    last = score;
  };
  input.addEventListener('input', rate);
  rate();
  expose(root, 'password', {
    get score() { return passwordScore(input.value); },
    reveal(show = true) {
      if ((input.type === 'text') !== show && toggle) toggle.click();
    },
  });
});
