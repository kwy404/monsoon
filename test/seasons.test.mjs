// Date logic of the special dates script used by the docs site (assets/seasons/seasons.js).
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

function load(extra = {}) {
  const window = { ...extra };
  vm.runInNewContext(readFileSync(new URL('../assets/seasons/seasons.js', import.meta.url), 'utf8'), { window, Date, Math });
  return window.MonsoonSeasons;
}
const S = load();
const d = (y, m, day) => new Date(y, m - 1, day);
const iso = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

describe('seasons: Easter', () => {
  it('matches the known dates for 2024 to 2030', () => {
    const known = { 2024: '2024-03-31', 2025: '2025-04-20', 2026: '2026-04-05', 2027: '2027-03-28', 2028: '2028-04-16', 2029: '2029-04-01', 2030: '2030-04-21' };
    for (const [y, want] of Object.entries(known)) expect(iso(S.easter(Number(y)))).toBe(want);
  });
});

describe('seasons: windows', () => {
  const cases = [
    // New Year, across the turn of the year
    ['2026-12-29', 'en', ''], ['2026-12-30', 'en', 'newyear'], ['2027-01-01', 'en', 'newyear'], ['2027-01-02', 'en', 'newyear'], ['2027-01-03', 'en', ''],
    // Carnival 2027: Easter March 28, Ash Wednesday February 10, from Saturday February 6
    ['2027-02-05', 'en', ''], ['2027-02-06', 'en', 'carnival'], ['2027-02-09', 'en', 'carnival'], ['2027-02-10', 'en', 'carnival'], ['2027-02-11', 'en', ''],
    // Carnival 2030: Easter April 21, Ash Wednesday March 6, from Saturday March 2
    ['2030-03-01', 'en', ''], ['2030-03-02', 'en', 'carnival'], ['2030-03-06', 'en', 'carnival'], ['2030-03-07', 'en', ''],
    // Easter 2026: Good Friday April 3 to Sunday April 5
    ['2026-04-02', 'en', ''], ['2026-04-03', 'en', 'easter'], ['2026-04-05', 'en', 'easter'], ['2026-04-06', 'en', ''],
    // Valentine's: February 14, and June 12 for pt-BR
    ['2027-02-13', 'en', ''], ['2027-02-14', 'en', 'valentine'], ['2027-02-15', 'en', ''],
    ['2026-06-12', 'en', ''], ['2026-06-12', 'pt-BR', 'valentine'], ['2026-06-12', 'pt-PT', ''],
    // Festa Junina, Midsummer for everyone else
    ['2026-06-13', 'pt-BR', 'junina'], ['2026-06-13', 'en', 'junina'], ['2026-06-29', 'pt-br', 'junina'], ['2026-06-30', 'pt-BR', ''],
    // Halloween
    ['2026-10-23', 'en', ''], ['2026-10-24', 'en', 'halloween'], ['2026-10-31', 'en', 'halloween'], ['2026-11-01', 'en', ''],
    // Christmas
    ['2026-12-17', 'en', ''], ['2026-12-18', 'en', 'christmas'], ['2026-12-26', 'en', 'christmas'], ['2026-12-27', 'en', ''],
    // An ordinary day
    ['2026-10-15', 'en', ''],
  ];
  for (const [day, lang, want] of cases) {
    it(`${day} (${lang}) is ${want || 'no season'}`, () => {
      const [y, m, dd] = day.split('-').map(Number);
      expect(S.detect(d(y, m, dd), lang)).toBe(want);
    });
  }
  it('gives the single day of Valentine\'s priority when it falls inside Carnival', () => {
    // 2026: Ash Wednesday is February 18, so Carnival starts on Saturday February 14.
    expect(S.detect(d(2026, 2, 14), 'en')).toBe('valentine');
    expect(S.detect(d(2026, 2, 15), 'en')).toBe('carnival');
  });
  it('ignores the time of day', () => {
    expect(S.detect(new Date(2026, 9, 24, 0, 0, 1), 'en')).toBe('halloween');
    expect(S.detect(new Date(2026, 9, 31, 23, 59, 59), 'en')).toBe('halloween');
  });
});

describe('seasons: names', () => {
  it('calls June Festa Junina in pt-BR and Midsummer elsewhere', () => {
    expect(S.name('junina', 'pt-BR')).toBe('Festa Junina');
    expect(S.name('junina', 'en-US')).toBe('Midsummer');
    expect(S.name('halloween', 'en')).toBe('Halloween');
  });
});

describe('seasons: overrides and the stored choice', () => {
  const never = () => false;
  const always = () => true;
  const day = d(2026, 10, 15);
  it('forces a season with ?season=<id>', () => {
    expect(S.resolve('?season=christmas', day, 'en', never)).toEqual({ id: 'christmas', on: true, forced: true });
    expect(S.resolve('?a=1&season=junina', day, 'en', always)).toEqual({ id: 'junina', on: true, forced: true });
  });
  it('turns everything off with ?season=off', () => {
    expect(S.resolve('?season=off', d(2026, 10, 31), 'en', never)).toEqual({ id: '', on: false, forced: true });
  });
  it('ignores an unknown season', () => {
    expect(S.resolve('?season=summer', d(2026, 10, 31), 'en', never)).toEqual({ id: 'halloween', on: true, forced: false });
  });
  it('keeps a season switched off with the chip', () => {
    expect(S.resolve('', d(2026, 10, 31), 'en', always)).toEqual({ id: 'halloween', on: false, forced: false });
    expect(S.resolve('', day, 'en', never)).toEqual({ id: '', on: false, forced: false });
  });
});

describe('seasons: the page', () => {
  function page(search, store = {}) {
    const attrs = {};
    const root = { setAttribute: (k, v) => (attrs[k] = v), removeAttribute: (k) => delete attrs[k] };
    const api = load({
      document: { documentElement: root },
      location: { search },
      navigator: { language: 'en-US' },
      localStorage: { getItem: (k) => store[k] ?? null, setItem: (k, v) => (store[k] = v), removeItem: (k) => delete store[k] },
    });
    return { api, attrs, store };
  }
  it('sets data-season on the root element', () => {
    const { attrs } = page('?season=halloween');
    expect(attrs['data-season']).toBe('halloween');
    expect(attrs['data-season-id']).toBe('halloween');
  });
  it('sets nothing with ?season=off', () => {
    expect(page('?season=off').attrs).toEqual({});
  });
  it('switching off removes the attribute; a forced season is not stored', () => {
    const { api, attrs, store } = page('?season=easter');
    api.set(false);
    expect(attrs['data-season']).toBeUndefined();
    expect(store).toEqual({});
  });
  it('stays under 3 kB once minified', async () => {
    const { transformSync } = await import('esbuild');
    const code = transformSync(readFileSync(new URL('../assets/seasons/seasons.js', import.meta.url), 'utf8'), { minify: true }).code;
    expect(code.length).toBeLessThan(3072);
  });
});
