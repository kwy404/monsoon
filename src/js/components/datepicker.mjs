// Date picker and date range picker: a popover calendar over native date
// inputs. One input picks a date, two inputs pick a range.
//
//   <div class="datepicker" data-m-datepicker><input type="date" class="input"></div>
//
// Options: data-m-datepicker-locale, -week-start (0 Sunday to 6 Saturday),
// -disabled ("sat,sun,2026-12-25"), -presets ("today,7d,30d,month").
// min and max come from the inputs. Month names, weekday names and the
// first day of the week follow the locale through Intl.
import { define, emit } from '../core.mjs';
import { expose, floating, h, notify, uid } from './combobox.mjs';

export const pad = (n) => String(n).padStart(2, '0');

/** A local date at midnight; works for years below 100 too. */
export function ymd(y, m, d) {
  const t = new Date(2000, 0, 1);
  t.setFullYear(y, m, d);
  return t;
}
export const toISO = (d) => `${String(d.getFullYear()).padStart(4, '0')}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export function parseISO(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || '');
  if (!m) return null;
  const d = ymd(+m[1], m[2] - 1, +m[3]);
  return d.getMonth() === m[2] - 1 ? d : null;
}
export const addDays = (d, n) => ymd(d.getFullYear(), d.getMonth(), d.getDate() + n);
/** Same day n months later, clamped to the last day of a shorter month. */
export function addMonths(d, n) {
  const y = d.getFullYear();
  const m = d.getMonth() + n;
  return ymd(y, m, Math.min(d.getDate(), ymd(y, m + 1, 0).getDate()));
}
export const compareDates = (a, b) => (toISO(a) < toISO(b) ? -1 : toISO(a) > toISO(b) ? 1 : 0);
export const sameDay = (a, b) => !!a && !!b && toISO(a) === toISO(b);

/** The 42 days (6 weeks) shown for a month, starting on weekStart (0 is Sunday). */
export function monthGrid(year, month, weekStart = 0) {
  const offset = (ymd(year, month, 1).getDay() - weekStart + 7) % 7;
  return Array.from({ length: 42 }, (_, i) => ymd(year, month, 1 - offset + i));
}

// Regions whose week starts on Sunday or Saturday (CLDR); the rest use Monday.
const SUN = 'AG AS BD BR BS BT BW BZ CA CN CO DM DO ET GT GU HK HN ID IL IN JM JP KE KH KR LA MH MM MO MT MX MZ NI NP PA PE PH PK PR PY SA SG SV TH TT TW UM US VE VI WS YE ZA ZW';
const SAT = 'AE AF BH DJ DZ EG IQ IR JO KW LY OM QA SD SY';
export const weekStartForRegion = (region = '') => (SUN.includes(region) && region ? 0 : SAT.includes(region) && region ? 6 : 1);

/** First day of the week for a locale: Intl week info where available, CLDR regions otherwise. */
export function weekStartFor(locale) {
  try {
    const l = new Intl.Locale(locale);
    const info = (l.getWeekInfo && l.getWeekInfo()) || l.weekInfo;
    if (info && info.firstDay) return info.firstDay % 7;
    return weekStartForRegion(l.maximize().region);
  } catch {
    return 1;
  }
}

export const monthNames = (locale) => {
  const f = new Intl.DateTimeFormat(locale, { month: 'long' });
  return Array.from({ length: 12 }, (_, m) => f.format(ymd(2000, m, 1)));
};
/** Weekday names in display order; 2000-01-02 was a Sunday. */
export const weekdayNames = (locale, weekStart = 0, style = 'short') => {
  const f = new Intl.DateTimeFormat(locale, { weekday: style });
  return Array.from({ length: 7 }, (_, i) => f.format(ymd(2000, 0, 2 + ((weekStart + i) % 7))));
};

const DAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
/** "sat,sun,2026-12-25" or "weekends" into weekday numbers and ISO dates. */
export function parseDisabled(spec = '') {
  const days = new Set();
  const dates = new Set();
  for (const t of spec.toLowerCase().split(/[\s,]+/).filter(Boolean)) {
    if (t === 'weekends') [0, 6].forEach((d) => days.add(d));
    else if (DAYS.includes(t.slice(0, 3)) && !/\d/.test(t)) days.add(DAYS.indexOf(t.slice(0, 3)));
    else dates.add(t);
  }
  return { days, dates };
}
export const isDateDisabled = (d, { min, max, rule } = {}) => (min && compareDates(d, min) < 0)
  || (max && compareDates(d, max) > 0)
  || (rule && (rule.days.has(d.getDay()) || rule.dates.has(toISO(d)))) || false;

/** Where a calendar key moves the focused day, null for other keys. */
export function moveDate(d, key, { weekStart = 0, shift = false, rtl = false } = {}) {
  const dow = (d.getDay() - weekStart + 7) % 7;
  switch (key) {
    case 'ArrowLeft': return addDays(d, rtl ? 1 : -1);
    case 'ArrowRight': return addDays(d, rtl ? -1 : 1);
    case 'ArrowUp': return addDays(d, -7);
    case 'ArrowDown': return addDays(d, 7);
    case 'Home': return addDays(d, -dow);
    case 'End': return addDays(d, 6 - dow);
    case 'PageUp': return addMonths(d, shift ? -12 : -1);
    case 'PageDown': return addMonths(d, shift ? 12 : 1);
    default: return null;
  }
}

export const PRESETS = {
  today: 'Today', yesterday: 'Yesterday', tomorrow: 'Tomorrow', '7d': 'Last 7 days', '30d': 'Last 30 days',
  '90d': 'Last 90 days', month: 'This month', 'last-month': 'Last month', year: 'This year',
};
/** [start, end] for a preset name, relative to today. "14d" means the last 14 days. */
export function presetRange(name, now = new Date()) {
  const t = ymd(now.getFullYear(), now.getMonth(), now.getDate());
  const y = t.getFullYear();
  const m = t.getMonth();
  const days = /^(\d+)d$/.exec(name);
  if (days) return [addDays(t, 1 - days[1]), t];
  switch (name) {
    case 'today': return [t, t];
    case 'yesterday': return [addDays(t, -1), addDays(t, -1)];
    case 'tomorrow': return [addDays(t, 1), addDays(t, 1)];
    case 'month': return [ymd(y, m, 1), ymd(y, m + 1, 0)];
    case 'last-month': return [ymd(y, m - 1, 1), ymd(y, m, 0)];
    case 'year': return [ymd(y, 0, 1), ymd(y, 11, 31)];
    default: return null;
  }
}

define('datepicker', (root, opts) => {
  const inputs = [...root.querySelectorAll('input')].slice(0, 2);
  if (!inputs.length) return;
  const range = inputs.length === 2;
  const lang = root.closest('[lang]');
  const locale = opts.locale || (lang && lang.lang) || navigator.language || 'en';
  const weekStart = opts.weekStart ? +opts.weekStart % 7 : weekStartFor(locale);
  const limits = { min: parseISO(inputs[0].min), max: parseISO(inputs[0].max), rule: parseDisabled(opts.disabled) };
  const off = (d) => isDateDisabled(d, limits);
  const now = new Date();
  const today = ymd(now.getFullYear(), now.getMonth(), now.getDate());
  const clampDate = (d) => (limits.min && compareDates(d, limits.min) < 0 ? limits.min : limits.max && compareDates(d, limits.max) > 0 ? limits.max : d);
  const full = new Intl.DateTimeFormat(locale, { dateStyle: 'full' });
  const title = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' });
  let start = parseISO(inputs[0].value);
  let end = range ? parseISO(inputs[1].value) : null;
  let view = start || today;
  let focus = view;
  let hover = null;
  let picking = false;

  const iconBtn = (label, icon, onclick) => h('button', { type: 'button', class: `btn btn-icon btn-sm datepicker-${icon}`, 'aria-label': label, onclick });
  const toggle = h('button', {
    type: 'button', class: 'datepicker-toggle', 'aria-label': range ? 'Choose dates' : 'Choose date', 'aria-haspopup': 'dialog', 'aria-expanded': 'false',
  });
  const months = monthNames(locale);
  const monthSel = h('select', { class: 'select select-sm', 'aria-label': 'Month' }, months.map((n, i) => h('option', { value: i }, n)));
  const yearSel = h('select', { class: 'select select-sm', 'aria-label': 'Year' });
  const live = h('div', { class: 'sr-only', 'aria-live': 'polite' });
  const head = h('tr', {}, weekdayNames(locale, weekStart, 'short').map((n, i) => h('th', { scope: 'col', abbr: weekdayNames(locale, weekStart, 'long')[i] }, n)));
  const cells = [];
  const body = h('tbody', {}, Array.from({ length: 6 }, () => h('tr', {}, Array.from({ length: 7 }, () => {
    const td = h('td', { role: 'gridcell' }, h('button', { type: 'button', class: 'datepicker-day', tabindex: '-1' }));
    cells.push(td);
    return td;
  }))));
  const gridId = uid('cal');
  const grid = h('table', { class: 'datepicker-grid', role: 'grid', 'aria-labelledby': gridId }, h('thead', {}, head), body);
  live.id = gridId;
  const presets = (opts.presets || '').split(/[\s,]+/).filter((p) => presetRange(p));
  const presetBtns = presets.map((p) => h('button', {
    type: 'button',
    class: 'datepicker-preset',
    'aria-pressed': 'false',
    'data-preset': p,
    onclick: () => {
      const [a, b] = presetRange(p);
      start = a;
      end = range ? b : null;
      view = focus = a;
      commit();
      pop.close();
    },
  }, PRESETS[p] || `Last ${p.slice(0, -1)} days`));
  const panel = h('div', { class: 'datepicker-panel', role: 'dialog', 'aria-label': range ? 'Choose dates' : 'Choose date' },
    presetBtns.length ? h('div', { class: 'datepicker-presets' }, presetBtns) : null,
    h('div', { class: 'datepicker-calendar' },
      h('div', { class: 'datepicker-header' },
        iconBtn('Previous month', 'prev', () => go(addMonths(focus, -1), false)),
        monthSel, yearSel,
        iconBtn('Next month', 'next', () => go(addMonths(focus, 1), false))),
      grid, live));
  if (range) inputs[0].after(h('span', { class: 'datepicker-separator', 'aria-hidden': 'true' }));
  root.append(toggle, panel);
  const pop = floating(panel, root, {
    onClose: () => {
      toggle.setAttribute('aria-expanded', 'false');
      picking = false;
      hover = null;
    },
  });

  const fillYears = () => {
    const y = view.getFullYear();
    const lo = Math.min(y, limits.min ? limits.min.getFullYear() : today.getFullYear() - 100);
    const hi = Math.max(y, limits.max ? limits.max.getFullYear() : today.getFullYear() + 20);
    if (yearSel.dataset.span === `${lo}:${hi}`) return;
    yearSel.dataset.span = `${lo}:${hi}`;
    yearSel.replaceChildren(...Array.from({ length: hi - lo + 1 }, (_, i) => h('option', { value: lo + i }, String(lo + i))));
  };

  function render() {
    fillYears();
    monthSel.value = view.getMonth();
    yearSel.value = view.getFullYear();
    let lo = start;
    let hi = range ? end || (picking && hover) || null : start;
    if (lo && hi && compareDates(hi, lo) < 0) [lo, hi] = [hi, lo];
    const days = monthGrid(view.getFullYear(), view.getMonth(), weekStart);
    cells.forEach((td, i) => {
      const d = days[i];
      const btn = td.firstChild;
      const iso = toISO(d);
      btn.textContent = d.getDate();
      btn.dataset.date = iso;
      btn.setAttribute('aria-label', full.format(d));
      btn.tabIndex = sameDay(d, focus) ? 0 : -1;
      if (off(d)) btn.setAttribute('aria-disabled', 'true');
      else btn.removeAttribute('aria-disabled');
      if (sameDay(d, today)) btn.setAttribute('aria-current', 'date');
      else btn.removeAttribute('aria-current');
      td.toggleAttribute('data-outside', d.getMonth() !== view.getMonth());
      const edge = sameDay(d, lo) || sameDay(d, hi);
      td.setAttribute('aria-selected', String(edge));
      td.toggleAttribute('data-range-start', range && !!hi && sameDay(d, lo));
      td.toggleAttribute('data-range-end', range && !!lo && sameDay(d, hi));
      td.toggleAttribute('data-in-range', range && !!lo && !!hi && compareDates(d, lo) > 0 && compareDates(d, hi) < 0);
    });
    live.textContent = title.format(view);
    const [prev, next] = panel.querySelectorAll('.datepicker-header .btn');
    prev.disabled = !!limits.min && compareDates(ymd(view.getFullYear(), view.getMonth(), 0), limits.min) < 0;
    next.disabled = !!limits.max && compareDates(ymd(view.getFullYear(), view.getMonth() + 1, 1), limits.max) > 0;
    presetBtns.forEach((b) => {
      const [a, z] = presetRange(b.dataset.preset);
      b.setAttribute('aria-pressed', String(sameDay(a, start) && (!range || sameDay(z, end))));
    });
  }

  function go(d, moveFocus = true) {
    focus = clampDate(d);
    view = focus;
    render();
    if (moveFocus) grid.querySelector('[tabindex="0"]').focus();
  }

  function commit() {
    inputs[0].value = start ? toISO(start) : '';
    if (range) inputs[1].value = end ? toISO(end) : '';
    inputs.forEach(notify);
    render();
    emit(root, 'change', range
      ? { start: inputs[0].value, end: inputs[1].value }
      : { value: inputs[0].value });
  }

  function pick(d) {
    if (off(d)) return;
    if (!range) {
      start = d;
      commit();
      pop.close();
      inputs[0].focus();
    } else if (!picking) {
      start = d;
      end = null;
      picking = true;
      go(d);
    } else {
      [start, end] = compareDates(d, start) < 0 ? [d, start] : [start, d];
      picking = false;
      commit();
      pop.close();
      inputs[1].focus();
    }
  }

  function open() {
    start = parseISO(inputs[0].value);
    end = range ? parseISO(inputs[1].value) : null;
    view = focus = clampDate(start || today);
    picking = false;
    pop.show();
    toggle.setAttribute('aria-expanded', 'true');
    go(focus);
    pop.place();
  }

  toggle.addEventListener('click', () => (pop.open ? pop.close() : open()));
  monthSel.addEventListener('change', () => go(ymd(view.getFullYear(), +monthSel.value, Math.min(focus.getDate(), ymd(view.getFullYear(), +monthSel.value + 1, 0).getDate())), false));
  yearSel.addEventListener('change', () => go(addMonths(focus, (+yearSel.value - view.getFullYear()) * 12), false));
  grid.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-date]');
    if (btn) pick(parseISO(btn.dataset.date));
  });
  grid.addEventListener('pointerover', (e) => {
    const btn = e.target.closest('button[data-date]');
    if (picking && btn) {
      hover = parseISO(btn.dataset.date);
      render();
    }
  });
  grid.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      pick(focus);
      return;
    }
    const next = moveDate(focus, e.key, { weekStart, shift: e.shiftKey, rtl: getComputedStyle(root).direction === 'rtl' });
    if (!next) return;
    e.preventDefault();
    if (picking) hover = clampDate(next);
    go(next);
  });
  panel.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    e.preventDefault();
    e.stopPropagation();
    pop.close();
    toggle.focus();
  });
  panel.addEventListener('focusout', () => setTimeout(() => {
    if (pop.open && !root.contains(document.activeElement)) pop.close();
  }));
  inputs.forEach((input) => {
    input.addEventListener('keydown', (e) => {
      if (e.altKey && e.key === 'ArrowDown') {
        e.preventDefault();
        open();
      }
    });
    input.addEventListener('change', (e) => {
      if (!e.isTrusted) return;
      start = parseISO(inputs[0].value);
      end = range ? parseISO(inputs[1].value) : null;
      if (pop.open) go(start || focus, false);
    });
  });
  render();

  expose(root, 'datepicker', {
    open,
    close: () => pop.close(),
    get value() { return range ? [inputs[0].value, inputs[1].value] : inputs[0].value; },
    set value(v) {
      const [a, b] = [].concat(v);
      start = parseISO(a);
      end = range ? parseISO(b) : null;
      commit();
    },
  });
  return () => pop.close();
});
