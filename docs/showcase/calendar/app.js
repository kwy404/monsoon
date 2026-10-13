/*
 * Tidal, a calendar. Showcase app for Monsoon (styles) and Voodoo.js (behaviour).
 * Week, day, month and agenda views over events kept in localStorage.
 */
(function () {
  'use strict';

  var STORE_KEY = 'tidal:state:v1';
  var DAY = 86400000;
  var HOUR_PX = 48;
  var LOCALE = 'en-US';

  // ---------------------------------------------------------------- date helpers
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function iso(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function parse(s) { var p = String(s).split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function addDays(s, n) { var d = parse(s); d.setDate(d.getDate() + n); return iso(d); }
  function todayIso() { return iso(new Date()); }
  function startOfWeek(s) { var d = parse(s); d.setDate(d.getDate() - d.getDay()); return iso(d); }
  function startOfMonth(s) { var d = parse(s); d.setDate(1); return iso(d); }
  function addMonths(s, n) { var d = parse(s); d.setDate(1); d.setMonth(d.getMonth() + n); return iso(d); }
  function toMin(t) { var p = String(t || '0:0').split(':'); return (+p[0]) * 60 + (+p[1] || 0); }
  function fromMin(m) { m = Math.max(0, Math.min(1439, Math.round(m))); return pad(Math.floor(m / 60)) + ':' + pad(m % 60); }
  function fmtTime(t) {
    var m = toMin(t);
    var h = Math.floor(m / 60);
    var mm = m % 60;
    var ampm = h < 12 ? 'AM' : 'PM';
    var h12 = h % 12 === 0 ? 12 : h % 12;
    return h12 + (mm ? ':' + pad(mm) : '') + ' ' + ampm;
  }
  function fmtTimeShort(t) {
    var m = toMin(t);
    var h = Math.floor(m / 60);
    var mm = m % 60;
    var h12 = h % 12 === 0 ? 12 : h % 12;
    return h12 + (mm ? ':' + pad(mm) : '') + (h < 12 ? 'a' : 'p');
  }

  // ---------------------------------------------------------------- calendars and tones
  var CALENDARS = [
    { id: 'work', name: 'Work', tone: 'primary', on: true },
    { id: 'personal', name: 'Personal', tone: 'success', on: true },
    { id: 'family', name: 'Family', tone: 'warning', on: true },
    { id: 'fitness', name: 'Fitness', tone: 'danger', on: true },
    { id: 'social', name: 'Social', tone: 'info', on: true },
    { id: 'holidays', name: 'Holidays', tone: 'accent', on: true }
  ];
  var BLOCK = {
    primary: 'bg-primary/20 border-primary hover:bg-primary/30',
    success: 'bg-success/20 border-success hover:bg-success/30',
    warning: 'bg-warning/20 border-warning hover:bg-warning/30',
    danger: 'bg-danger/20 border-danger hover:bg-danger/30',
    accent: 'bg-accent/20 border-accent hover:bg-accent/30',
    info: 'bg-info/20 border-info hover:bg-info/30'
  };
  var SOLID = {
    primary: 'bg-primary text-primary-foreground', success: 'bg-success text-success-foreground',
    warning: 'bg-warning text-warning-foreground', danger: 'bg-danger text-danger-foreground',
    accent: 'bg-accent text-accent-foreground', info: 'bg-info text-info-foreground'
  };
  var DOT = { primary: 'bg-primary', success: 'bg-success', warning: 'bg-warning', danger: 'bg-danger', accent: 'bg-accent', info: 'bg-info' };
  var BADGE = { primary: 'badge-primary', success: 'badge-success', warning: 'badge-warning', danger: 'badge-danger', accent: 'badge-accent', info: 'badge-info' };
  var CHECK = { primary: 'checkbox-primary', success: 'checkbox-success', warning: 'checkbox-warning', danger: 'checkbox-danger', accent: 'checkbox-accent', info: 'checkbox-info' };

  // ---------------------------------------------------------------- seed events for the current week
  var seq = 0;
  function ev(dayOffset, title, start, end, cal, extra) {
    var base = startOfWeek(todayIso());
    var e = { id: 'e' + (++seq), title: title, date: addDays(base, dayOffset), start: start || '', end: end || '', allDay: !start, cal: cal, location: '', desc: '' };
    if (extra) for (var k in extra) e[k] = extra[k];
    return e;
  }
  function seedEvents() {
    seq = 0;
    var list = [];
    for (var d = 1; d <= 5; d++) list.push(ev(d, 'Team standup', '09:30', '09:45', 'work', { location: 'Video call' }));
    return list.concat([
      // previous week
      ev(-6, 'Quarterly review', '13:00', '14:30', 'work', { location: 'Room Aurora' }),
      ev(-4, 'Book club', '19:00', '20:30', 'social', { location: 'Fern and Page bookshop' }),
      ev(-2, 'Swim practice', '07:00', '08:00', 'fitness'),
      // this week
      ev(0, 'Brunch with parents', '11:00', '12:30', 'family', { location: 'Harborside Cafe' }),
      ev(0, 'Meal prep', '17:00', '18:30', 'personal'),
      ev(1, 'Q4 planning week', null, null, 'work'),
      ev(1, 'Sprint planning', '10:00', '11:30', 'work', { location: 'Room Atlas', desc: 'Bring your estimates for the onboarding epic. We will lock the sprint goal by 11:15.' }),
      ev(1, 'Lunch with Priya', '12:30', '13:30', 'social', { location: 'Little Saigon Kitchen' }),
      ev(1, 'Gym: upper body', '18:00', '19:00', 'fitness'),
      ev(2, 'Design review', '11:00', '12:00', 'work', { location: 'Room Atlas', desc: 'Pricing page and the new onboarding illustrations.' }),
      ev(2, '1:1 with Jordan', '11:30', '12:00', 'work', { location: 'Video call' }),
      ev(2, 'Dentist', '15:00', '15:45', 'personal', { location: 'Brightsmile Dental, 4th floor' }),
      ev(2, 'Yoga', '19:00', '20:00', 'fitness', { location: 'Studio Lotus' }),
      ev(3, 'Mom\'s birthday', null, null, 'family'),
      ev(3, 'Product demo', '14:00', '15:00', 'work', { desc: 'Live walkthrough of the 2.0 release for the sales team.' }),
      ev(3, 'Customer call with Larkspur', '14:30', '15:15', 'work', { location: 'Video call' }),
      ev(3, 'Pick up the kids', '16:30', '17:00', 'family'),
      ev(4, 'Focus time', '09:00', '12:00', 'work', { desc: 'No meetings. Writing the launch announcement.' }),
      ev(4, 'Community call', '18:00', '19:00', 'social'),
      ev(4, 'Dinner with Sam', '19:30', '21:30', 'social', { location: 'Olive and Thyme' }),
      ev(5, 'Run club', '07:00', '08:00', 'fitness', { location: 'Riverside park' }),
      ev(5, 'Payday', null, null, 'personal'),
      ev(5, 'Release retro', '15:00', '16:00', 'work'),
      ev(5, 'Movie night', '20:00', '22:00', 'family'),
      ev(6, 'Farmers market', '09:00', '10:30', 'family'),
      ev(6, 'Hike at Cedar Ridge', '11:00', '15:00', 'fitness', { location: 'North trailhead' }),
      // next week
      ev(8, 'Flight to Lisbon', '07:15', '10:40', 'personal', { location: 'Terminal 2, gate B14' }),
      ev(9, 'Conference day one', null, null, 'work'),
      ev(9, 'Keynote', '09:00', '10:30', 'work', { location: 'Main hall' }),
      ev(10, 'Harvest festival', null, null, 'holidays'),
      ev(11, 'Company offsite', null, null, 'work'),
      ev(12, 'Dinner with the design team', '19:00', '21:00', 'social'),
      ev(15, 'Piano lesson', '17:00', '18:00', 'personal'),
      ev(20, 'Founders day', null, null, 'holidays')
    ]);
  }

  // ---------------------------------------------------------------- persistence
  var saved = null;
  try { saved = JSON.parse(localStorage.getItem(STORE_KEY) || 'null'); } catch (e) { saved = null; }
  var narrow = window.matchMedia('(max-width: 767px)').matches;

  var S = V.data({
    events: saved && saved.events ? saved.events : seedEvents(),
    calendars: saved && saved.calendars ? saved.calendars : CALENDARS.map(function (c) { return Object.assign({}, c); }),
    view: saved && saved.view ? saved.view : (narrow ? 'day' : 'week'),
    cursor: todayIso(),
    mini: startOfMonth(todayIso()),
    search: '',
    navOpen: false,
    now: Date.now(),
    themeCurrent: 'system',
    draft: { id: null, title: '', date: todayIso(), start: '09:00', end: '10:00', allDay: false, cal: 'work', location: '', desc: '' },
    draftError: '',
    viewingId: null,
    toasts: [],
    hours: Array.from({ length: 24 }, function (x, i) { return i; }),
    weekdayNames: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],

    // ------------------------------------------------------------ formatting
    hourLabel: function (h) { return h === 0 ? '' : fmtTime(pad(h) + ':00'); },
    time: function (t) { return fmtTime(t); },
    timeShort: function (t) { return fmtTimeShort(t); },
    range: function (e) { return e.allDay ? 'All day' : fmtTime(e.start) + ' to ' + fmtTime(e.end); },
    dayNum: function (s) { return parse(s).getDate(); },
    weekday: function (s) { return parse(s).toLocaleDateString(LOCALE, { weekday: 'short' }); },
    longDate: function (s) { return parse(s).toLocaleDateString(LOCALE, { weekday: 'long', month: 'long', day: 'numeric' }); },
    fullDate: function (s) { return parse(s).toLocaleDateString(LOCALE, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }); },
    monthName: function (s) { return parse(s).toLocaleDateString(LOCALE, { month: 'long', year: 'numeric' }); },
    isToday: function (s) { return s === iso(new Date(S.now)); },
    isPast: function (s) { return s < iso(new Date(S.now)); },
    title: function () {
      if (S.search.trim()) return 'Search results';
      if (S.view === 'day') return S.fullDate(S.cursor);
      if (S.view === 'month') return S.monthName(S.cursor);
      if (S.view === 'agenda') return 'Next 30 days';
      var a = parse(startOfWeek(S.cursor));
      var b = parse(addDays(startOfWeek(S.cursor), 6));
      var am = a.toLocaleDateString(LOCALE, { month: 'short' });
      var bm = b.toLocaleDateString(LOCALE, { month: 'short' });
      if (a.getFullYear() !== b.getFullYear()) return am + ' ' + a.getDate() + ', ' + a.getFullYear() + ' to ' + bm + ' ' + b.getDate() + ', ' + b.getFullYear();
      if (am === bm) return am + ' ' + a.getDate() + ' to ' + b.getDate() + ', ' + b.getFullYear();
      return am + ' ' + a.getDate() + ' to ' + bm + ' ' + b.getDate() + ', ' + b.getFullYear();
    },

    shortTitle: function () {
      if (S.search.trim()) return 'Search';
      if (S.view === 'agenda') return 'Agenda';
      if (S.view === 'month') return parse(S.cursor).toLocaleDateString(LOCALE, { month: 'short', year: 'numeric' });
      if (S.view === 'day') return parse(S.cursor).toLocaleDateString(LOCALE, { weekday: 'short', month: 'short', day: 'numeric' });
      var a = parse(startOfWeek(S.cursor));
      var b = parse(addDays(startOfWeek(S.cursor), 6));
      return a.toLocaleDateString(LOCALE, { month: 'short', day: 'numeric' }) + ' to ' + (a.getMonth() === b.getMonth() ? b.getDate() : b.toLocaleDateString(LOCALE, { month: 'short', day: 'numeric' }));
    },

    // ------------------------------------------------------------ calendars
    cal: function (cid) {
      for (var i = 0; i < S.calendars.length; i++) if (S.calendars[i].id === cid) return S.calendars[i];
      return S.calendars[0];
    },
    block: function (e) { return BLOCK[S.cal(e.cal).tone] || BLOCK.primary; },
    solid: function (e) { return SOLID[S.cal(e.cal).tone] || SOLID.primary; },
    dot: function (tone) { return DOT[tone] || DOT.primary; },
    checkTone: function (tone) { return CHECK[tone] || CHECK.primary; },
    badgeTone: function (tone) { return BADGE[tone] || BADGE.primary; },
    calCount: function (c) { return S.events.filter(function (e) { return e.cal === c.id; }).length; },
    onlyCalendar: function (c) { S.calendars.forEach(function (x) { x.on = x === c; }); },

    // ------------------------------------------------------------ queries
    visibleEvents: function () {
      var q = S.search.trim().toLowerCase();
      return S.events.filter(function (e) {
        if (!S.cal(e.cal).on) return false;
        if (q && (e.title + ' ' + e.location + ' ' + e.desc).toLowerCase().indexOf(q) === -1) return false;
        return true;
      });
    },
    eventsOn: function (s) {
      return S.visibleEvents().filter(function (e) { return e.date === s; }).sort(sortEvents);
    },
    allDayOn: function (s) { return S.eventsOn(s).filter(function (e) { return e.allDay; }); },
    hasEvents: function (s) { return S.events.some(function (e) { return e.date === s && S.cal(e.cal).on; }); },
    days: function () {
      if (S.view === 'day') return [S.cursor];
      var start = startOfWeek(S.cursor);
      var out = [];
      for (var i = 0; i < 7; i++) out.push(addDays(start, i));
      return out;
    },
    // positioned timed events for one day column, with side by side layout for overlaps
    layout: function (s) {
      var list = S.eventsOn(s).filter(function (e) { return !e.allDay; });
      var items = list.map(function (e) {
        var a = toMin(e.start);
        var b = Math.max(a + 15, toMin(e.end));
        return { ev: e, a: a, b: b, col: 0, cols: 1 };
      });
      var cluster = [];
      var clusterEnd = -1;
      function flush() {
        var columns = [];
        cluster.forEach(function (it) {
          var placed = false;
          for (var c = 0; c < columns.length; c++) {
            if (columns[c] <= it.a) { it.col = c; columns[c] = it.b; placed = true; break; }
          }
          if (!placed) { it.col = columns.length; columns.push(it.b); }
        });
        cluster.forEach(function (it) { it.cols = columns.length; });
        cluster = [];
      }
      items.forEach(function (it) {
        if (cluster.length && it.a >= clusterEnd) flush();
        cluster.push(it);
        clusterEnd = Math.max(clusterEnd, it.b);
      });
      flush();
      return items.map(function (it) {
        var w = 100 / it.cols;
        return {
          ev: it.ev,
          key: it.ev.id,
          short: it.b - it.a < 40,
          tall: it.b - it.a >= 75,
          style: {
            top: (it.a / 60 * HOUR_PX + 1) + 'px',
            height: Math.max(18, (it.b - it.a) / 60 * HOUR_PX - 2) + 'px',
            left: 'calc(' + (it.col * w) + '% + 2px)',
            width: 'calc(' + w + '% - ' + (it.col === it.cols - 1 ? 6 : 3) + 'px)'
          }
        };
      });
    },
    nowTop: function () {
      var d = new Date(S.now);
      return ((d.getHours() * 60 + d.getMinutes()) / 60 * HOUR_PX) + 'px';
    },
    monthCells: function () {
      var first = startOfMonth(S.cursor);
      var start = startOfWeek(first);
      var month = parse(first).getMonth();
      var out = [];
      for (var i = 0; i < 42; i++) {
        var s = addDays(start, i);
        out.push({ date: s, inMonth: parse(s).getMonth() === month });
      }
      return out;
    },
    miniCells: function () {
      var start = startOfWeek(S.mini);
      var month = parse(S.mini).getMonth();
      var out = [];
      for (var i = 0; i < 42; i++) {
        var s = addDays(start, i);
        out.push({ date: s, inMonth: parse(s).getMonth() === month });
      }
      return out;
    },
    inRange: function (s) {
      if (S.view === 'day') return s === S.cursor;
      if (S.view === 'week') { var a = startOfWeek(S.cursor); return s >= a && s <= addDays(a, 6); }
      return false;
    },
    agenda: function () {
      var q = S.search.trim();
      var list = S.visibleEvents();
      if (!q) {
        var from = S.cursor;
        var to = addDays(S.cursor, 30);
        list = list.filter(function (e) { return e.date >= from && e.date <= to; });
      }
      list = list.slice().sort(function (a, b) { return a.date < b.date ? -1 : (a.date > b.date ? 1 : sortEvents(a, b)); });
      var groups = [];
      var current = null;
      list.forEach(function (e) {
        if (!current || current.date !== e.date) { current = { date: e.date, events: [] }; groups.push(current); }
        current.events.push(e);
      });
      return groups;
    },
    upcoming: function () {
      var t = iso(new Date(S.now));
      var nowMin = new Date(S.now).getHours() * 60 + new Date(S.now).getMinutes();
      return S.events.filter(function (e) { return S.cal(e.cal).on && e.date === t && !e.allDay && toMin(e.end) > nowMin; }).sort(sortEvents).slice(0, 3);
    },
    viewing: function () {
      for (var i = 0; i < S.events.length; i++) if (S.events[i].id === S.viewingId) return S.events[i];
      return null;
    },

    // ------------------------------------------------------------ navigation
    setView: function (v) { S.view = v; S.search = ''; scrollToMorning(); },
    goToday: function () { S.cursor = todayIso(); S.mini = startOfMonth(S.cursor); scrollToMorning(); },
    step: function (dir) {
      if (S.view === 'day') S.cursor = addDays(S.cursor, dir);
      else if (S.view === 'week') S.cursor = addDays(S.cursor, dir * 7);
      else if (S.view === 'month') S.cursor = addMonths(S.cursor, dir);
      else S.cursor = addDays(S.cursor, dir * 30);
      S.mini = startOfMonth(S.cursor);
    },
    miniStep: function (dir) { S.mini = addMonths(S.mini, dir); },
    pickDate: function (s) {
      S.cursor = s;
      if (S.view === 'month' && parse(s).getMonth() !== parse(S.mini).getMonth()) S.mini = startOfMonth(s);
      if (S.view === 'agenda' || S.view === 'month') S.view = S.view;
      S.navOpen = false;
      S.search = '';
    },
    openDay: function (s) { S.cursor = s; S.view = 'day'; S.mini = startOfMonth(s); scrollToMorning(); },

    // ------------------------------------------------------------ create, edit, delete
    newEvent: function (date, start, allDay) {
      var st = start || '09:00';
      S.draft = { id: null, title: '', date: date || S.cursor, start: st, end: fromMin(toMin(st) + 60), allDay: !!allDay, cal: 'work', location: '', desc: '' };
      S.draftError = '';
      S.navOpen = false;
      openDialog('event-form');
      focusLater('event-title');
    },
    slotClick: function (e, s) {
      if (Date.now() - lastDrop < 300) return;
      if (e.target.closest('[data-event]')) return;
      var col = e.currentTarget.getBoundingClientRect();
      var minutes = Math.floor((e.clientY - col.top) / HOUR_PX * 60 / 30) * 30;
      S.newEvent(s, fromMin(Math.min(minutes, 23 * 60)));
    },
    monthCellClick: function (e, s) {
      if (e.target.closest('[data-event]') || e.target.closest('button')) return;
      S.newEvent(s, '09:00');
    },
    open: function (e) {
      if (Date.now() - lastDrop < 300) return;
      S.viewingId = e.id;
      openDialog('event-view');
    },
    eventKey: function (k, e) { if (k.key === 'Enter') { k.preventDefault(); S.open(e); } },
    edit: function (e) {
      closeDialog('event-view');
      S.draft = { id: e.id, title: e.title, date: e.date, start: e.start || '09:00', end: e.end || '10:00', allDay: e.allDay, cal: e.cal, location: e.location, desc: e.desc };
      S.draftError = '';
      openDialog('event-form');
      focusLater('event-title');
    },
    save: function () {
      var d = S.draft;
      if (!d.title.trim()) { S.draftError = 'Give the event a title.'; focusLater('event-title'); return; }
      if (!d.date) { S.draftError = 'Pick a date.'; return; }
      if (!d.allDay && toMin(d.end) <= toMin(d.start)) { S.draftError = 'The event has to end after it starts.'; return; }
      var data = { title: d.title.trim(), date: d.date, start: d.allDay ? '' : d.start, end: d.allDay ? '' : d.end, allDay: d.allDay, cal: d.cal, location: d.location.trim(), desc: d.desc.trim() };
      if (d.id) {
        var e = findEvent(d.id);
        if (e) for (var k in data) e[k] = data[k];
        toast('Event updated');
      } else {
        data.id = 'e' + Date.now().toString(36);
        S.events.push(data);
        toast('Event created');
      }
      var c = S.cal(d.cal);
      if (!c.on) c.on = true;
      if (!S.inRange(d.date) && S.view !== 'month' && S.view !== 'agenda') S.cursor = d.date;
      closeDialog('event-form');
    },
    formKey: function (e) { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); S.save(); } },
    remove: function (e) {
      var i = S.events.indexOf(e);
      if (i === -1) return;
      var removed = S.events.splice(i, 1)[0];
      closeDialog('event-view');
      closeDialog('event-form');
      toast('Deleted "' + removed.title + '"', function () { S.events.push(removed); });
    },
    removeDraft: function () { var e = findEvent(S.draft.id); if (e) S.remove(e); },
    duplicate: function (e) {
      var copy = Object.assign({}, e, { id: 'e' + Date.now().toString(36), date: addDays(e.date, 7) });
      S.events.push(copy);
      closeDialog('event-view');
      toast('Copied to ' + S.longDate(copy.date));
    },
    setTheme: function (value) { V.theme.set(value); S.themeCurrent = value; },
    resetDemo: function () {
      try { localStorage.removeItem(STORE_KEY); } catch (e) { /* ignore */ }
      S.events = seedEvents();
      S.calendars = CALENDARS.map(function (c) { return Object.assign({}, c); });
      S.goToday();
      toast('Demo calendar restored');
    },

    // ------------------------------------------------------------ drag to move (week and day views)
    drop: function (detail, s) {
      var e = findEvent(detail.data);
      var colEl = detail.to;
      if (!e || !colEl || e.allDay) return;
      var rect = colEl.getBoundingClientRect();
      var top = pointer.y - grab.offset - rect.top;
      var dur = toMin(e.end) - toMin(e.start);
      var start = Math.round(top / HOUR_PX * 60 / 15) * 15;
      start = Math.max(0, Math.min(24 * 60 - dur, start));
      lastDrop = Date.now();
      if (e.date === s && fromMin(start) === e.start) return;
      e.date = s;
      e.start = fromMin(start);
      e.end = fromMin(start + dur);
      toast('Moved to ' + S.weekday(s) + ' ' + fmtTime(e.start));
    },

    closeDialog: function (id) { closeDialog(id); },
    runToast: function (t) { if (t.action) t.action(); S.dismissToast(t); },
    dismissToast: function (t) { var i = S.toasts.indexOf(t); if (i !== -1) S.toasts.splice(i, 1); }
  });

  function sortEvents(a, b) {
    if (a.allDay !== b.allDay) return a.allDay ? -1 : 1;
    var d = toMin(a.start) - toMin(b.start);
    return d || (toMin(b.end) - toMin(a.end));
  }
  function findEvent(eid) {
    for (var i = 0; i < S.events.length; i++) if (S.events[i].id === eid) return S.events[i];
    return null;
  }
  function openDialog(id) { var d = document.getElementById(id); if (d && !d.open) d.showModal(); }
  function closeDialog(id) { var d = document.getElementById(id); if (d && d.open) d.close(); }
  function focusLater(id) {
    V.nextTick(function () { var el = document.getElementById(id); if (el) el.focus(); });
  }
  function scrollToMorning() {
    var tries = 0;
    (function attempt() {
      var el = document.getElementById('time-scroller');
      if (!el || !el.clientHeight || el.closest('[v-cloak]')) { if (++tries < 60) setTimeout(attempt, 50); return; }
      var h = new Date().getHours();
      var target = S.inRange(todayIso()) && h >= 17 ? Math.min(h - 6, 14) : 8;
      el.scrollTop = target * HOUR_PX;
    })();
  }
  var toastSeq = 0;
  function toast(text, action) {
    var t = { id: ++toastSeq, text: text, action: action || null };
    S.toasts.push(t);
    if (S.toasts.length > 3) S.toasts.shift();
    setTimeout(function () { S.dismissToast(t); }, action ? 6000 : 3000);
  }

  // pointer tracking for drag to move
  var pointer = { y: 0 };
  var grab = { offset: 0 };
  var lastDrop = 0;
  document.addEventListener('pointerdown', function (e) {
    var el = e.target.closest && e.target.closest('[data-event]');
    if (el) grab.offset = e.clientY - el.getBoundingClientRect().top;
    pointer.y = e.clientY;
  }, true);
  window.addEventListener('pointermove', function (e) { pointer.y = e.clientY; }, { passive: true });

  try { S.themeCurrent = V.theme.current; } catch (e) { S.themeCurrent = 'system'; }

  setInterval(function () { S.now = Date.now(); }, 30000);

  var persistTimer = null;
  V.effect(function () {
    var snapshot = JSON.stringify({ events: S.events, calendars: S.calendars, view: S.view });
    clearTimeout(persistTimer);
    persistTimer = setTimeout(function () { try { localStorage.setItem(STORE_KEY, snapshot); } catch (e) { /* ignore */ } }, 250);
  });

  document.addEventListener('keydown', function (e) {
    var tag = (e.target && e.target.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.ctrlKey || e.metaKey || e.altKey) return;
    if (document.querySelector('dialog[open]')) return;
    if (e.target.closest && e.target.closest('[aria-grabbed="true"]')) return;
    var k = e.key.toLowerCase();
    if (k === 't') S.goToday();
    else if (k === 'd') S.setView('day');
    else if (k === 'w') S.setView('week');
    else if (k === 'm') S.setView('month');
    else if (k === 'a') S.setView('agenda');
    else if (k === 'n' || k === 'c') { e.preventDefault(); S.newEvent(S.cursor, '09:00'); }
    else if (k === 'arrowleft' || k === 'j') S.step(-1);
    else if (k === 'arrowright' || k === 'k') S.step(1);
    else if (k === '/') { e.preventDefault(); var s = document.getElementById('event-search'); if (s) s.focus(); }
  });

  scrollToMorning();
})();
