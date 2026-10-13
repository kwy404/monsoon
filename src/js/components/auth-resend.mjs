// Resend with a countdown, for "Resend code" and "Resend link" buttons. While
// it counts down the button is disabled and reads "Resend code in 0:27".
//
//   <button type="button" class="btn btn-link" data-m-auth-resend data-m-auth-resend-seconds="30">Resend code</button>
//
// Options: -seconds (30 by default), -idle (start enabled, count after the
// first click), -done (announced when it can be used again).
// A click fires monsoon:auth-resend (cancelable: preventDefault() keeps the
// button enabled, for example when the request failed), then the countdown
// starts again. Fires monsoon:auth-resend-ready when it reaches zero.
import { define, emit } from '../core.mjs';
import { announcer, expose, flag, h } from './auth-util.mjs';

/** 75 -> "1:15", 9 -> "0:09", 3700 -> "1:01:40". */
export function formatCountdown(total) {
  const s = Math.max(0, Math.ceil(total));
  const hh = Math.floor(s / 3600);
  const mm = Math.floor((s % 3600) / 60);
  const ss = String(s % 60).padStart(2, '0');
  return hh ? `${hh}:${String(mm).padStart(2, '0')}:${ss}` : `${mm}:${ss}`;
}

export function resend(el, opts = {}) {
  const seconds = Math.max(1, Number.parseInt(opts.seconds, 10) || 30);
  const live = announcer(el.parentElement || el);
  const timer = h('span', { class: 'auth-countdown' });
  let until = 0;
  let id = 0;
  const isButton = el.tagName === 'BUTTON';
  const setDisabled = (d) => {
    if (isButton) el.disabled = d;
    else el.setAttribute('aria-disabled', String(d));
    el.toggleAttribute('data-counting', d);
  };
  const left = () => Math.max(0, (until - Date.now()) / 1000);
  const tick = () => {
    const rest = left();
    if (rest <= 0) {
      stop();
      if (opts.done !== '') live(opts.done || 'You can request a new code now.');
      emit(el, 'auth-resend-ready', {});
      return;
    }
    timer.textContent = `in ${formatCountdown(rest)}`;
    id = setTimeout(tick, (rest % 1 || 1) * 1000 + 20);
  };
  function stop() {
    clearTimeout(id);
    until = 0;
    timer.remove();
    setDisabled(false);
  }
  const start = (s = seconds) => {
    clearTimeout(id);
    until = Date.now() + s * 1000;
    setDisabled(true);
    el.append(timer);
    tick();
  };
  const onClick = (e) => {
    if (until) {
      e.preventDefault();
      return;
    }
    if (emit(el, 'auth-resend', { seconds })) start();
  };
  el.addEventListener('click', onClick);
  if (!flag(opts.idle)) start();

  const api = {
    get remaining() { return Math.ceil(left()); },
    get counting() { return Boolean(until); },
    start,
    stop,
    destroy() {
      el.removeEventListener('click', onClick);
      stop();
      if (el.monsoon) delete el.monsoon.authResend;
    },
  };
  return expose(el, 'authResend', api);
}

define('auth-resend', (el, opts) => resend(el, opts).destroy);
