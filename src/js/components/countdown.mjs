// Countdown timer to a date: updates the --value of each .countdown-value
// (marked with data-unit="days", "hours", "minutes" or "seconds") every
// second and keeps an accessible label that changes once a minute.
//
//   <div class="countdown" role="timer" data-m-countdown="2026-12-31T23:59:59">
//     <div class="countdown-box"><span class="countdown-value" data-unit="days"></span>...</div>
//   </div>
//
// Fires monsoon:countdown-end when it reaches zero.
import { define, emit } from '../core.mjs';
import { expose } from './combobox.mjs';

export const UNITS = ['days', 'hours', 'minutes', 'seconds'];

/** Time left until target, split into days, hours, minutes and seconds. */
export function timeLeft(target, now = Date.now()) {
  const total = Math.max(0, target - now);
  const s = Math.floor(total / 1000);
  return { total, days: Math.floor(s / 86400), hours: Math.floor((s % 86400) / 3600), minutes: Math.floor((s % 3600) / 60), seconds: s % 60 };
}

/** "3 days, 4 hours and 5 minutes left" (seconds only under a minute). */
export function describeLeft(t) {
  const parts = ['days', 'hours', 'minutes'].filter((u) => t[u]).map((u) => `${t[u]} ${t[u] === 1 ? u.slice(0, -1) : u}`);
  if (!parts.length) parts.push(`${t.seconds} ${t.seconds === 1 ? 'second' : 'seconds'}`);
  const last = parts.pop();
  return `${parts.length ? `${parts.join(', ')} and ` : ''}${last} left`;
}

define('countdown', (el) => {
  const target = Date.parse(el.dataset.mCountdown);
  if (Number.isNaN(target)) return;
  const values = [...el.querySelectorAll('.countdown-value, [data-unit]')];
  const unitOf = (v, i) => v.dataset.unit || UNITS[UNITS.length - values.length + i];
  let timer;
  let label = '';
  const tick = () => {
    const t = timeLeft(target);
    const has = new Set(values.map(unitOf));
    if (!has.has('days')) t.hours += t.days * 24;
    values.forEach((v, i) => v.style.setProperty('--value', t[unitOf(v, i)]));
    const text = describeLeft({ ...t, seconds: t.total < 60000 ? t.seconds : 0 });
    if (text !== label && (t.seconds === 0 || !label || t.total < 60000)) {
      label = text;
      el.setAttribute('aria-label', text);
    }
    emit(el, 'tick', t);
    if (!t.total) {
      el.setAttribute('data-ended', '');
      emit(el, 'countdown-end', {});
      return;
    }
    timer = setTimeout(tick, 1000 - (Date.now() % 1000) + 5);
  };
  tick();
  expose(el, 'countdown', { get left() { return timeLeft(target); } });
  return () => clearTimeout(timer);
});
