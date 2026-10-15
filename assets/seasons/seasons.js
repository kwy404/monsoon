/* Monsoon seasons: picks the special date for the visitor's local day and sets
   data-season on <html>. ?season=<id> forces one, ?season=off turns it off.
   A season switched off with the chip stays off (localStorage, per season). */
(function (w) {
  var IDS = ['newyear', 'carnival', 'easter', 'valentine', 'junina', 'halloween', 'christmas'];
  var NAMES = { newyear: 'New Year', carnival: 'Carnival', easter: 'Easter', valentine: "Valentine's", junina: 'Midsummer', halloween: 'Halloween', christmas: 'Christmas' };
  var KEY = 'monsoon-season-off:';

  // Easter Sunday, anonymous Gregorian algorithm.
  function easter(y) {
    var a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4;
    var f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
    var i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
    var n = h + l - 7 * m + 114;
    return new Date(y, Math.floor(n / 31) - 1, (n % 31) + 1);
  }
  function shift(d, n) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  }
  var br = function (lang) { return /^pt-br/i.test(lang || ''); };

  /** The season for a local date, or '' when there is none. */
  function detect(date, lang) {
    var y = date.getFullYear(), mo = date.getMonth() + 1, dd = date.getDate();
    var t = new Date(y, mo - 1, dd).getTime();
    var md = mo * 100 + dd;
    var within = function (a, b) { return t >= a.getTime() && t <= b.getTime(); };
    if (md >= 1230 || md <= 102) return 'newyear';
    // A single day wins over the longer windows around it.
    if (md === 214 || (br(lang) && md === 612)) return 'valentine';
    var e = easter(y), ash = shift(e, -46);
    if (within(shift(ash, -4), ash)) return 'carnival';
    if (within(shift(e, -2), e)) return 'easter';
    if (md >= 613 && md <= 629) return 'junina';
    if (md >= 1024 && md <= 1031) return 'halloween';
    if (md >= 1218 && md <= 1226) return 'christmas';
    return '';
  }
  function name(id, lang) {
    return id === 'junina' && br(lang) ? 'Festa Junina' : NAMES[id] || '';
  }
  /** Applies the query override and the stored choice: { id, on, forced }. */
  function resolve(search, date, lang, isOff) {
    var q = /[?&]season=([a-z]+)/.exec(search || '');
    if (q && q[1] === 'off') return { id: '', on: false, forced: true };
    if (q && IDS.indexOf(q[1]) >= 0) return { id: q[1], on: true, forced: true };
    var id = detect(date, lang);
    return { id: id, on: !!id && !isOff(id), forced: false };
  }
  function store(id, off) {
    try {
      if (off) w.localStorage.setItem(KEY + id, '1');
      else w.localStorage.removeItem(KEY + id);
    } catch (e) {}
  }
  function isOff(id) {
    try { return w.localStorage.getItem(KEY + id) === '1'; } catch (e) { return false; }
  }

  var api = { ids: IDS, easter: easter, detect: detect, name: name, resolve: resolve, state: null };
  api.set = function (on) {
    var s = api.state, root = w.document.documentElement;
    if (!s || !s.id) return;
    s.on = on;
    if (!s.forced) store(s.id, !on);
    if (on) root.setAttribute('data-season', s.id);
    else root.removeAttribute('data-season');
  };
  w.MonsoonSeasons = api;
  if (!w.document || !w.location) return;
  var lang = (w.navigator && w.navigator.language) || '';
  var s = resolve(w.location.search, new Date(), lang, isOff);
  s.name = name(s.id, lang);
  api.state = s;
  var root = w.document.documentElement;
  if (s.id) root.setAttribute('data-season-id', s.id);
  if (s.on) root.setAttribute('data-season', s.id);
})(window);
