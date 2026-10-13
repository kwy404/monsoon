// One time code. Without a script, the .otp-field inside .otp is one input
// that takes the whole code (typing, paste and SMS autofill all native).
// With data-m-otp, the script draws one .otp-input cell per character and the
// field stays in the form as the hidden carrier of the full value.
//
//   <div class="otp" data-m-otp data-m-otp-separator="3">
//     <input class="otp-field" name="code" maxlength="6" inputmode="numeric"
//            autocomplete="one-time-code" aria-label="Verification code">
//   </div>
//
// Options: -length (4 to 8, else the field's maxlength, else 6), -separator
// (a dash after cell k: "3", or "2,4"), -type ("numeric" or "alphanumeric"),
// -pattern (one character as a regular expression class), -masked, -autosubmit
// (submit the form when complete), -webotp (read the code with the WebOTP API),
// -name (name of the carrier when the markup has none).
// Events: monsoon:otp-change { value, complete }, monsoon:otp-complete { code }.
// Older markup with ready made .otp-input boxes keeps working.
import { define, emit } from '../core.mjs';
import { expose, flag, h, notify } from './auth-util.mjs';

export const OTP_TYPES = { numeric: '[0-9]', alphanumeric: '[a-z0-9]', alpha: '[a-z]' };

/** Keeps the characters that match pattern (spaces, dashes and the rest go), at most n of them. */
export const cleanCode = (text, pattern = '[0-9]', n = Infinity) => {
  const re = new RegExp(`^${pattern}$`, 'i');
  return [...String(text ?? '')].filter((c) => re.test(c)).slice(0, n);
};

/** What the user added to a cell: the new text around the old character. */
export function insertedText(before, after) {
  if (before && after.length > before.length) {
    if (after.startsWith(before)) return after.slice(before.length);
    if (after.endsWith(before)) return after.slice(0, after.length - before.length);
  }
  return after;
}

/** Cell count: an explicit option, then maxlength, clamped to 4..8, else 6. */
export function otpLength(option, maxLength) {
  const n = Number.parseInt(option, 10) || (maxLength > 0 && maxLength < 64 ? maxLength : 6);
  return Math.min(8, Math.max(4, n));
}

/** Cell indexes (1 based) a separator follows: "3" or "2,4", inside 1..n-1. */
export function separatorsAfter(option, n) {
  return new Set(String(option ?? '').split(/[\s,]+/).map(Number).filter((k) => Number.isInteger(k) && k > 0 && k < n));
}

export function otp(root, opts = {}) {
  const off = new AbortController();
  const on = (el, type, fn, o = {}) => el.addEventListener(type, fn, { ...o, signal: off.signal });
  const legacy = [...root.querySelectorAll('.otp-input')];
  let field = root.querySelector('.otp-field') || root.querySelector('input:not(.otp-input):not([type=hidden])');
  const type = OTP_TYPES[opts.type] ? opts.type : (field && field.inputMode === 'text' ? 'alphanumeric' : 'numeric');
  const pattern = opts.pattern || OTP_TYPES[type];
  const numeric = pattern === OTP_TYPES.numeric;
  const n = legacy.length || otpLength(opts.length, field ? field.maxLength : 0);
  const upper = !numeric;
  const created = [];
  const restore = [];
  const remember = (el, ...names) => restore.push([el, names.map((a) => [a, el.getAttribute(a)])]);

  if (!field) {
    field = h('input', { class: 'otp-field', type: 'text', name: opts.name, autocomplete: 'one-time-code', inputmode: numeric ? 'numeric' : 'text', maxlength: n });
    root.prepend(field);
    created.push(field);
  } else {
    remember(field, 'tabindex', 'aria-hidden');
    if (opts.name && !field.name) field.name = opts.name;
  }
  field.setAttribute('tabindex', '-1');
  field.setAttribute('aria-hidden', 'true');

  remember(root, 'role', 'aria-label', 'aria-labelledby');
  if (!root.hasAttribute('role')) root.setAttribute('role', 'group');
  if (!root.hasAttribute('aria-label') && !root.hasAttribute('aria-labelledby')) {
    const label = field.id && [...root.ownerDocument.querySelectorAll('label[for]')].find((l) => l.htmlFor === field.id);
    if (label) {
      label.id ||= `${field.id}-label`;
      root.setAttribute('aria-labelledby', label.id);
    } else root.setAttribute('aria-label', field.getAttribute('aria-label') || 'Verification code');
  }

  const unit = numeric ? 'Digit' : 'Character';
  const seps = separatorsAfter(opts.separator, n);
  const cells = legacy.length ? legacy : Array.from({ length: n }, () => h('input', { class: 'otp-input', type: 'text' }));
  cells.forEach((cell, i) => {
    if (legacy.length) remember(cell, 'maxlength', 'autocomplete', 'tabindex', 'aria-label', 'inputmode', 'style');
    cell.removeAttribute('maxlength');
    cell.setAttribute('autocomplete', 'one-time-code');
    cell.setAttribute('inputmode', numeric ? 'numeric' : 'text');
    cell.setAttribute('autocapitalize', upper ? 'characters' : 'off');
    cell.setAttribute('autocorrect', 'off');
    cell.setAttribute('spellcheck', 'false');
    cell.setAttribute('enterkeyhint', i === n - 1 ? 'done' : 'next');
    cell.setAttribute('aria-label', `${unit} ${i + 1} of ${n}`);
    cell.style.setProperty('--otp-i', i);
    const describedBy = field.getAttribute('aria-describedby');
    if (describedBy) cell.setAttribute('aria-describedby', describedBy);
    if (!legacy.length) {
      root.append(cell);
      created.push(cell);
      if (seps.has(i + 1)) {
        const sep = h('span', { class: 'otp-separator', 'aria-hidden': 'true' });
        root.append(sep);
        created.push(sep);
      }
    }
  });
  if (root.classList.contains('otp-masked') || flag(opts.masked)) {
    root.classList.add('otp-masked');
    const css = globalThis.CSS;
    if (!(css && css.supports && css.supports('-webkit-text-security', 'disc'))) cells.forEach((c) => { c.type = 'password'; });
  }
  root.setAttribute('data-otp-ready', '');

  const vals = cells.map((c) => cleanCode(c.value, pattern, 1)[0] || '');
  cleanCode(field.value, pattern, n).forEach((c, k) => { vals[k] = c; });
  let last = vals.join('');
  let wasComplete = last.length === n && vals.every(Boolean);
  let muted = false;
  let state = null;

  const norm = (c) => (upper ? c.toUpperCase() : c);
  const firstEmpty = () => {
    const k = vals.findIndex((v) => !v);
    return k < 0 ? n - 1 : k;
  };
  const render = () => cells.forEach((cell, i) => {
    if (cell.value !== vals[i]) cell.value = vals[i];
    cell.toggleAttribute('data-filled', Boolean(vals[i]));
  });
  const tabStop = (active) => cells.forEach((c, i) => { c.tabIndex = i === active ? 0 : -1; });
  const focusCell = (i) => {
    const cell = cells[Math.max(0, Math.min(n - 1, i))];
    if (cell.disabled) return;
    cell.focus();
    cell.select();
  };
  const setState = (s) => {
    state = s;
    root.removeAttribute('data-state');
    if (s) {
      void root.offsetWidth; // restart the shake when the error repeats
      root.setAttribute('data-state', s);
    }
    cells.forEach((c) => {
      if (s === 'error') c.setAttribute('aria-invalid', 'true');
      else c.removeAttribute('aria-invalid');
    });
  };
  const sync = (quiet = false) => {
    const value = vals.join('');
    const complete = vals.every(Boolean);
    if (field.value !== value) field.value = value;
    root.toggleAttribute('data-otp-complete', complete);
    if (value === last && complete === wasComplete) return;
    last = value;
    if (state) setState(null);
    if (!quiet) {
      muted = true;
      notify(field);
      muted = false;
      emit(root, 'otp-change', { value, complete });
    }
    if (complete && !wasComplete && !quiet) {
      emit(root, 'otp-complete', { code: value });
      emit(root, 'complete', { code: value });
      if (flag(opts.autosubmit) && field.form) {
        if (field.form.requestSubmit) field.form.requestSubmit();
        else field.form.submit();
      }
    }
    wasComplete = complete;
  };
  const distribute = (from, text, focus = true) => {
    const chars = cleanCode(text, pattern).map(norm);
    if (!chars.length) return false;
    const start = chars.length >= n ? 0 : from;
    if (start === 0 && chars.length >= n) vals.fill('');
    chars.slice(0, n - start).forEach((c, k) => { vals[start + k] = c; });
    render();
    sync();
    if (focus) focusCell(Math.min(start + chars.length, n - 1));
    return true;
  };

  cells.forEach((cell, i) => {
    on(cell, 'focus', () => {
      const gap = vals.findIndex((v) => !v);
      if (gap >= 0 && i > gap) {
        focusCell(gap);
        return;
      }
      tabStop(i);
      cell.select();
    });
    on(cell, 'click', () => cell.select());
    on(cell, 'input', () => {
      const before = vals[i];
      const after = cell.value;
      if (!after) {
        vals[i] = '';
        render();
        sync();
        return;
      }
      const added = insertedText(before, after);
      const chars = cleanCode(added, pattern);
      if (!chars.length) {
        cell.value = before;
        cell.select();
        return;
      }
      if (chars.length === 1) {
        vals[i] = norm(chars[0]);
        render();
        sync();
        if (i < n - 1) focusCell(i + 1);
        else cell.select();
        return;
      }
      distribute(i, added);
    });
    on(cell, 'keydown', (e) => {
      const rtl = getComputedStyle(root).direction === 'rtl';
      const back = rtl ? 'ArrowRight' : 'ArrowLeft';
      const fwd = rtl ? 'ArrowLeft' : 'ArrowRight';
      if (e.key === 'Backspace') {
        e.preventDefault();
        if (e.metaKey || e.ctrlKey) {
          for (let k = 0; k <= i; k++) vals[k] = '';
          render();
          sync();
          focusCell(0);
        } else if (vals[i]) {
          vals[i] = '';
          render();
          sync();
        } else if (i > 0) {
          vals[i - 1] = '';
          render();
          sync();
          focusCell(i - 1);
        }
      } else if (e.key === 'Delete') {
        e.preventDefault();
        vals[i] = '';
        render();
        sync();
      } else if (e.key === back) {
        e.preventDefault();
        focusCell(i - 1);
      } else if (e.key === fwd) {
        e.preventDefault();
        if (vals[i]) focusCell(i + 1);
      } else if (e.key === 'Home') {
        e.preventDefault();
        focusCell(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        focusCell(firstEmpty());
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
      }
    });
    on(cell, 'paste', (e) => {
      e.preventDefault();
      const data = e.clipboardData || globalThis.clipboardData;
      distribute(i, data ? data.getData('text') : '');
    });
  });

  // The carrier: autofill or a script may write the whole code into it.
  const fromField = () => {
    if (muted || field.value === vals.join('')) return;
    vals.fill('');
    distribute(0, field.value, root.contains(document.activeElement));
    if (!field.value) {
      render();
      sync();
    }
  };
  on(field, 'input', fromField);
  on(field, 'change', fromField);
  on(field, 'focus', () => focusCell(firstEmpty()));
  on(field, 'invalid', (e) => {
    e.preventDefault();
    setState('error');
    focusCell(firstEmpty());
  });
  if (field.form) {
    on(field.form, 'reset', () => setTimeout(() => {
      vals.fill('');
      render();
      sync(true);
      setState(null);
    }));
  }

  let webotp = null;
  if (flag(opts.webotp) && 'OTPCredential' in globalThis && navigator.credentials) {
    webotp = new AbortController();
    navigator.credentials.get({ otp: { transport: ['sms'] }, signal: webotp.signal })
      .then((cred) => { if (cred && cred.code) distribute(0, cred.code, false); })
      .catch(() => {});
  }

  const setDisabled = (d) => {
    cells.forEach((c) => { c.disabled = d; });
    root.toggleAttribute('data-disabled', d);
  };
  if (field.disabled || flag(opts.disabled)) setDisabled(true);

  render();
  sync(true);
  tabStop(firstEmpty());

  const api = {
    get value() { return vals.join(''); },
    set value(v) {
      vals.fill('');
      if (!distribute(0, v, false)) {
        render();
        sync();
      }
    },
    get complete() { return vals.every(Boolean); },
    get length() { return n; },
    get state() { return state; },
    get disabled() { return cells[0].disabled; },
    set disabled(d) { setDisabled(Boolean(d)); },
    focus() { focusCell(firstEmpty()); },
    clear() {
      vals.fill('');
      render();
      sync();
      focusCell(0);
    },
    /** Error look (a shake, unless reduced motion), then optionally clears the cells. */
    error(clear = false) {
      setState('error');
      if (clear) {
        setTimeout(() => {
          vals.fill('');
          render();
          sync();
          focusCell(0);
        }, 450);
      }
    },
    success() { setState('success'); },
    reset() { setState(null); },
    destroy() {
      off.abort();
      if (webotp) webotp.abort();
      created.forEach((el) => el.remove());
      for (const [el, attrs] of restore) {
        for (const [a, v] of attrs) {
          if (v === null) el.removeAttribute(a);
          else el.setAttribute(a, v);
        }
      }
      for (const a of ['data-otp-ready', 'data-otp-complete', 'data-state', 'data-disabled']) root.removeAttribute(a);
      if (root.monsoon) delete root.monsoon.otp;
    },
  };
  return expose(root, 'otp', api);
}

define('otp', (root, opts) => otp(root, opts).destroy);
