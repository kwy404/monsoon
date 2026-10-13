// New password with a strength meter, a rule checklist and a reveal toggle.
//
//   <div class="field" data-m-auth-password data-m-auth-password-min="12">
//     <div class="password-field">
//       <input type="password" class="input" autocomplete="new-password">
//       <button type="button" class="password-field-toggle" aria-pressed="false" aria-label="Show password"></button>
//     </div>
//     <div class="auth-strength"><span class="auth-strength-bar"></span> x4 <span class="auth-strength-label"></span></div>
//     <ul class="auth-rules"><li class="auth-rule" data-rule="length">At least 12 characters</li> ...</ul>
//   </div>
//
// Rules: length, lower, upper, number, symbol, common (not a common password,
// a keyboard or number run, a repeated character or a -context word).
// Options: -min (12), -context (comma separated words to avoid, like the
// user name). Fires monsoon:auth-password with { score, label, rules, valid }.
import { define, emit } from '../core.mjs';
import { expose, h, uid } from './auth-util.mjs';

export const STRENGTH_LABELS = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong'];

// The most used passwords (lower case, without trailing digits and symbols).
const COMMON = new Set(('password passw0rd p@ssword p@ssw0rd qwerty qwertyuiop azerty letmein welcome admin administrator '
  + 'iloveyou monkey dragon football baseball soccer master shadow sunshine princess superman batman trustno1 '
  + 'whatever freedom starwars hello charlie donald michael jennifer jordan hunter ranger buster thomas tigger '
  + 'robert soccer killer pepper ginger summer winter spring autumn secret changeme default guest login test '
  + 'abc123 abcdef 123456 1234567 12345678 123456789 1234567890 111111 000000 654321 666666 121212 123123 '
  + 'qazwsx zaq12wsx 1q2w3e4r 1qaz2wsx asdfgh zxcvbn senha amor futebol contraseña motdepasse passwort').split(' '));
const RUNS = ['0123456789', 'abcdefghijklmnopqrstuvwxyz', 'qwertyuiop', 'asdfghjkl', 'zxcvbnm', '1qaz2wsx3edc'];

/** True when pw contains a run of 4 characters from a keyboard row or a sequence, either way. */
export function hasRun(pw, len = 4) {
  const s = pw.toLowerCase();
  for (const run of RUNS) {
    const both = [run, [...run].reverse().join('')];
    for (const r of both) for (let i = 0; i + len <= r.length; i++) if (s.includes(r.slice(i, i + len))) return true;
  }
  return false;
}

/** True for a well known password, a run, 4 repeats of one character or a context word. */
export function isCommon(pw, context = []) {
  const s = pw.toLowerCase();
  const core = s.replace(/[^\p{L}\p{N}@]+$/u, '').replace(/\d+$/, '');
  if (COMMON.has(s) || COMMON.has(core)) return true;
  if (/(.)\1{3}/u.test(s) || hasRun(s)) return true;
  return context.some((w) => w && w.length >= 3 && s.includes(w.toLowerCase()));
}

/** Rule results, a 0 to 4 score and its label. */
export function checkPassword(pw = '', { min = 12, context = [] } = {}) {
  const rules = {
    length: [...pw].length >= min,
    lower: /\p{Ll}/u.test(pw),
    upper: /\p{Lu}/u.test(pw),
    number: /\p{N}/u.test(pw),
    symbol: /[^\p{L}\p{N}\s]/u.test(pw),
    common: pw.length > 0 && !isCommon(pw, context),
  };
  const met = Object.values(rules).filter(Boolean).length;
  let score = 0;
  if (pw.length >= 6) {
    score = met <= 2 ? 1 : met <= 4 ? 2 : met === 5 ? 3 : 4;
    if (rules.common && [...pw].length >= min + 8) score = Math.max(score, 3);
    if (!rules.length) score = Math.min(score, 2);
    if (!rules.common) score = Math.min(score, 1);
  }
  return { rules, score, label: pw ? STRENGTH_LABELS[score] : '', valid: Object.values(rules).every(Boolean) };
}

export function passwordStrength(root, opts = {}) {
  const input = root.querySelector('input[type=password], input[data-password]') || root.querySelector('input');
  if (!input) return { destroy() {} };
  input.setAttribute('data-password', '');
  const toggle = root.querySelector('.password-field-toggle, [data-password-toggle]');
  const meter = root.querySelector('.auth-strength');
  const label = meter && meter.querySelector('.auth-strength-label');
  const list = root.querySelector('.auth-rules');
  const items = [...root.querySelectorAll('[data-rule]')];
  const min = Number.parseInt(opts.min, 10) || 12;
  const context = String(opts.context || '').split(',').map((s) => s.trim()).filter(Boolean);
  const ids = [];
  if (label) {
    label.id ||= uid('strength');
    label.setAttribute('aria-live', 'polite');
    ids.push(label.id);
  }
  if (list) {
    list.id ||= uid('rules');
    ids.push(list.id);
  }
  const before = input.getAttribute('aria-describedby');
  if (ids.length) input.setAttribute('aria-describedby', [before, ...ids].filter(Boolean).join(' '));
  const marks = items.map((li) => {
    const sr = h('span', { class: 'sr-only' });
    li.append(sr);
    return sr;
  });

  let last = null;
  const update = (quiet) => {
    const r = checkPassword(input.value, { min, context });
    items.forEach((li, i) => {
      const ok = Boolean(r.rules[li.dataset.rule]);
      li.toggleAttribute('data-met', ok);
      marks[i].textContent = ok ? ' (done)' : '';
    });
    if (meter) {
      if (input.value) meter.dataset.score = r.score;
      else delete meter.dataset.score;
    }
    if (label) label.textContent = r.label;
    const key = `${r.score}|${r.valid}`;
    if (key !== last && quiet !== true) emit(root, 'auth-password', r);
    last = key;
    return r;
  };
  const onToggle = () => {
    const show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    toggle.setAttribute('aria-pressed', String(show));
    toggle.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
    input.focus();
  };
  const onInput = () => update();
  input.addEventListener('input', onInput);
  if (toggle) toggle.addEventListener('click', onToggle);
  update(true);

  const api = {
    check: () => update(),
    get score() { return checkPassword(input.value, { min, context }).score; },
    destroy() {
      input.removeEventListener('input', onInput);
      if (toggle) toggle.removeEventListener('click', onToggle);
      marks.forEach((m) => m.remove());
      if (before === null) input.removeAttribute('aria-describedby');
      else input.setAttribute('aria-describedby', before);
      if (root.monsoon) delete root.monsoon.authPassword;
    },
  };
  return expose(root, 'authPassword', api);
}

define('auth-password', (root, opts) => passwordStrength(root, opts).destroy);
