// @vitest-environment jsdom
import { describe, expect, it, beforeEach } from 'vitest';
import { enhance } from '../src/js/core.mjs';
import { filterItems, fold, highlight, matchRange } from '../src/js/components/combobox.mjs';
import {
  addMonths, isDateDisabled, monthGrid, moveDate, parseDisabled, parseISO, presetRange, toISO, weekdayNames, weekStartFor, weekStartForRegion, ymd,
} from '../src/js/components/datepicker.mjs';
import { splitTags } from '../src/js/components/tags-input.mjs';
import { dropIndex, reorder } from '../src/js/components/sortable.mjs';
import { formatter, keyValue, snap } from '../src/js/components/range-dual.mjs';
import { formatColor, hsvToRgb, oklchToRgb, parseColor, rgbToHsv, rgbToOklch, toHex } from '../src/js/components/color-picker.mjs';
import { compareValues, filterRows, paginate, sortRows, span, toNumber } from '../src/js/components/data-table.mjs';
import { aggregate } from '../src/js/components/tree.mjs';
import { normalize, resize } from '../src/js/components/splitter.mjs';
import { toast } from '../src/js/components/toast.mjs';
import { passwordScore } from '../src/js/components/password.mjs';
import '../src/js/components/counter.mjs';
import '../src/js/components/autosize.mjs';
import { matchesHotkey } from '../src/js/components/command.mjs';
import '../src/js/components/infinite-scroll.mjs';
import { describeLeft, timeLeft } from '../src/js/components/countdown.mjs';
import { imageFrom } from '../src/js/components/clipboard-image.mjs';
import { ratingAt, starFills } from '../src/js/components/rating-input.mjs';
import { nextIndex } from '../src/js/components/carousel-auto.mjs';
import { nextEnabled, typeAhead } from '../src/js/components/select.mjs';

const key = (el, k, o = {}) => el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true, ...o }));
const mount = (html) => {
  document.body.innerHTML = html;
  enhance(document);
  return document.body.firstElementChild;
};

describe('date math', () => {
  it('parses and formats ISO dates, rejecting impossible ones', () => {
    expect(toISO(parseISO('2026-02-28'))).toBe('2026-02-28');
    expect(parseISO('2026-02-30')).toBeNull();
    expect(parseISO('13/10/2026')).toBeNull();
    expect(toISO(ymd(99, 0, 1))).toBe('0099-01-01');
  });

  it('builds a six week month grid from any week start', () => {
    const sun = monthGrid(2026, 9, 0);
    expect(sun).toHaveLength(42);
    expect(toISO(sun[0])).toBe('2026-09-27');
    expect(sun[0].getDay()).toBe(0);
    const mon = monthGrid(2026, 9, 1);
    expect(toISO(mon[0])).toBe('2026-09-28');
    expect(mon[0].getDay()).toBe(1);
    const sat = monthGrid(2026, 9, 6);
    expect(toISO(sat[0])).toBe('2026-09-26');
    expect(toISO(monthGrid(2026, 1, 0)[0])).toBe('2026-02-01');
  });

  it('adds months and clamps to the shorter month', () => {
    expect(toISO(addMonths(parseISO('2026-01-31'), 1))).toBe('2026-02-28');
    expect(toISO(addMonths(parseISO('2024-01-31'), 1))).toBe('2024-02-29');
    expect(toISO(addMonths(parseISO('2026-03-15'), -12))).toBe('2025-03-15');
  });

  it('knows the first day of the week per locale and region', () => {
    expect(weekStartFor('en-US')).toBe(0);
    expect(weekStartFor('pt-BR')).toBe(0);
    expect(weekStartFor('de-DE')).toBe(1);
    expect(weekStartFor('en-GB')).toBe(1);
    expect(weekStartForRegion('EG')).toBe(6);
    expect(weekStartForRegion('FR')).toBe(1);
    expect(weekdayNames('en-US', 1, 'short')[0]).toBe('Mon');
    expect(weekdayNames('en-US', 0, 'short')[6]).toBe('Sat');
  });

  it('moves the focused day with calendar keys', () => {
    const d = parseISO('2026-10-14');
    const iso = (k, o) => toISO(moveDate(d, k, o));
    expect(iso('ArrowRight')).toBe('2026-10-15');
    expect(iso('ArrowRight', { rtl: true })).toBe('2026-10-13');
    expect(iso('ArrowUp')).toBe('2026-10-07');
    expect(iso('Home', { weekStart: 1 })).toBe('2026-10-12');
    expect(iso('End', { weekStart: 0 })).toBe('2026-10-17');
    expect(iso('PageDown')).toBe('2026-11-14');
    expect(iso('PageUp', { shift: true })).toBe('2025-10-14');
    expect(moveDate(d, 'x')).toBeNull();
  });

  it('computes presets and disabled dates', () => {
    const now = new Date(2026, 9, 13, 15);
    expect(presetRange('7d', now).map(toISO)).toEqual(['2026-10-07', '2026-10-13']);
    expect(presetRange('month', now).map(toISO)).toEqual(['2026-10-01', '2026-10-31']);
    expect(presetRange('last-month', now).map(toISO)).toEqual(['2026-09-01', '2026-09-30']);
    expect(presetRange('nope', now)).toBeNull();
    const rule = parseDisabled('sun, 2026-12-25');
    expect(isDateDisabled(parseISO('2026-10-18'), { rule })).toBe(true);
    expect(isDateDisabled(parseISO('2026-12-25'), { rule })).toBe(true);
    expect(isDateDisabled(parseISO('2026-10-19'), { rule, min: parseISO('2026-10-20') })).toBe(true);
    expect(isDateDisabled(parseISO('2026-10-21'), { rule, min: parseISO('2026-10-20') })).toBe(false);
  });
});

describe('date picker', () => {
  it('opens a labelled grid, moves with the keyboard and picks a date', async () => {
    await import('../src/js/components/datepicker.mjs');
    const root = mount('<div class="datepicker" data-m-datepicker data-m-datepicker-locale="en-US"><input type="date" class="input" value="2026-10-14" aria-label="Day"></div>');
    const toggle = root.querySelector('.datepicker-toggle');
    expect(toggle.getAttribute('aria-haspopup')).toBe('dialog');
    toggle.click();
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    const grid = root.querySelector('[role=grid]');
    expect(grid.querySelectorAll('[role=gridcell]')).toHaveLength(42);
    expect(root.querySelector('[aria-selected=true] button').dataset.date).toBe('2026-10-14');
    expect(document.activeElement.dataset.date).toBe('2026-10-14');
    key(document.activeElement, 'ArrowDown');
    expect(document.activeElement.dataset.date).toBe('2026-10-21');
    key(document.activeElement, 'PageDown');
    expect(document.activeElement.dataset.date).toBe('2026-11-21');
    let detail;
    root.addEventListener('monsoon:change', (e) => { detail = e.detail; });
    key(document.activeElement, 'Enter');
    expect(root.querySelector('input').value).toBe('2026-11-21');
    expect(detail).toEqual({ value: '2026-11-21' });
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
  });

  it('picks a range in two clicks, in either order', () => {
    const root = mount('<div class="datepicker" data-m-datepicker><input type="date" value="2026-10-01" aria-label="From"><input type="date" value="2026-10-05" aria-label="To"></div>');
    root.querySelector('.datepicker-toggle').click();
    root.querySelector('[data-date="2026-10-20"]').click();
    root.querySelector('[data-date="2026-10-12"]').click();
    expect([...root.querySelectorAll('input')].map((i) => i.value)).toEqual(['2026-10-12', '2026-10-20']);
    root.querySelector('.datepicker-toggle').click();
    expect(root.querySelector('[data-date="2026-10-15"]').parentElement.hasAttribute('data-in-range')).toBe(true);
  });
});

describe('combobox', () => {
  it('folds accents and finds ranges', () => {
    expect(fold('São Zürich')).toBe('sao zurich');
    expect(matchRange('São Paulo', 'sao')).toEqual([0, 3]);
    expect(matchRange('Lisbon', 'x')).toBeNull();
    const items = ['Lisbon', 'Berlin', 'Zürich', 'Linz'].map((l) => ({ value: l, label: l }));
    expect(filterItems(items, 'li').map((i) => i.label)).toEqual(['Lisbon', 'Linz', 'Berlin']);
    expect(filterItems(items, 'li', false).map((i) => i.label)).toEqual(['Lisbon', 'Berlin', 'Linz']);
    const frag = highlight('Berlin', [3, 5]);
    expect(frag.querySelector('mark').textContent).toBe('li');
  });

  it('filters a select as you type and picks with the keyboard', () => {
    const root = mount(`<div class="combobox" data-m-combobox><select aria-label="City">
      <option value="">Pick one</option><option value="lis">Lisbon</option><option value="ber">Berlin</option><option value="zrh">Zürich</option></select></div>`);
    const input = root.querySelector('[role=combobox]');
    const list = root.querySelector('[role=listbox]');
    expect(input.getAttribute('aria-controls')).toBe(list.id);
    expect(input.getAttribute('aria-label')).toBe('City');
    input.value = 'zu';
    input.dispatchEvent(new Event('input'));
    expect(input.getAttribute('aria-expanded')).toBe('true');
    expect([...list.querySelectorAll('[role=option]')].map((o) => o.textContent)).toEqual(['Zürich']);
    expect(input.getAttribute('aria-activedescendant')).toBe(list.querySelector('[role=option]').id);
    key(input, 'Enter');
    expect(root.querySelector('select').value).toBe('zrh');
    expect(input.value).toBe('Zürich');
    expect(input.getAttribute('aria-expanded')).toBe('false');
  });

  it('shows chips for a multiple select and removes the last with Backspace', () => {
    const root = mount('<div class="combobox" data-m-combobox><select multiple aria-label="Tags"><option value="a" selected>A</option><option value="b">B</option></select></div>');
    const input = root.querySelector('[role=combobox]');
    expect(root.querySelector('[role=listbox]').getAttribute('aria-multiselectable')).toBe('true');
    expect(root.querySelectorAll('.combobox-chip')).toHaveLength(1);
    key(input, 'ArrowDown');
    key(input, 'ArrowDown');
    key(input, 'Enter');
    expect([...root.querySelector('select').selectedOptions].map((o) => o.value)).toEqual(['a', 'b']);
    key(input, 'Backspace');
    expect([...root.querySelector('select').selectedOptions].map((o) => o.value)).toEqual(['a']);
  });
});

describe('tags input', () => {
  it('splits pasted lists', () => {
    expect(splitTags('a, b;c\nd\t e,,')).toEqual(['a', 'b', 'c', 'd', 'e']);
  });

  it('adds with Enter and comma, skips duplicates, honours max and removes with Backspace', async () => {
    await import('../src/js/components/tags-input.mjs');
    const root = mount('<div class="tags-input" data-m-tags-input data-m-tags-input-max="3"><input name="t" value="css" aria-label="Tags"></div>');
    const field = root.querySelector('.tags-input-field');
    const source = root.querySelector('input[name=t]');
    expect(source.hidden).toBe(true);
    expect(field.getAttribute('aria-label')).toBe('Tags');
    field.value = 'html';
    key(field, 'Enter');
    field.value = 'CSS';
    key(field, ',');
    expect(source.value).toBe('css, html');
    field.value = 'js';
    key(field, 'Enter');
    field.value = 'one more';
    key(field, 'Enter');
    expect(source.value).toBe('css, html, js');
    expect(root.hasAttribute('data-full')).toBe(true);
    field.value = '';
    key(field, 'Backspace');
    expect(source.value).toBe('css, html');
    expect(root.querySelector('.tags-input-remove').getAttribute('aria-label')).toBe('Remove css');
  });
});

describe('sortable', () => {
  it('reorders arrays', () => {
    expect(reorder(['a', 'b', 'c', 'd'], 0, 2)).toEqual(['b', 'c', 'a', 'd']);
    expect(reorder(['a', 'b', 'c'], 2, 0)).toEqual(['c', 'a', 'b']);
  });

  it('finds the drop index from item rects', () => {
    const rows = [0, 1, 2].map((i) => ({ left: 0, top: i * 50, width: 200, height: 40 }));
    expect(dropIndex(rows, { x: 10, y: 5 })).toBe(0);
    expect(dropIndex(rows, { x: 10, y: 35 })).toBe(1);
    expect(dropIndex(rows, { x: 10, y: 130 })).toBe(3);
    expect(dropIndex([], { x: 0, y: 0 })).toBe(0);
    const cols = [0, 1, 2].map((i) => ({ left: i * 100, top: 0, width: 80, height: 40 }));
    expect(dropIndex(cols, { x: 120, y: 10 }, 'x')).toBe(1);
    expect(dropIndex(cols, { x: 170, y: 10 }, 'x')).toBe(2);
    expect(dropIndex(cols, { x: 170, y: 10 }, 'x', true)).toBe(1);
  });

  it('moves with Space and the arrows, across lists, and Escape restores', async () => {
    await import('../src/js/components/sortable.mjs');
    document.body.innerHTML = `<ul data-m-sortable data-m-sortable-group="g" aria-label="A"><li>1</li><li>2</li><li>3</li></ul>
      <ul data-m-sortable data-m-sortable-group="g" aria-label="B"><li>x</li></ul>`;
    enhance(document);
    const [a, b] = document.querySelectorAll('ul');
    const text = (l) => [...l.children].map((c) => c.textContent).join('');
    const first = a.children[0];
    expect(first.tabIndex).toBe(0);
    expect(first.getAttribute('aria-describedby')).toBeTruthy();
    let sorted;
    document.addEventListener('monsoon:sort', (e) => { sorted = e.detail; }, { once: true });
    key(first, ' ');
    expect(first.getAttribute('aria-grabbed')).toBe('true');
    key(first, 'ArrowDown');
    key(first, 'ArrowDown');
    key(first, ' ');
    expect(text(a)).toBe('231');
    expect(sorted).toMatchObject({ oldIndex: 0, newIndex: 2, from: a, to: a });
    key(first, ' ');
    key(first, 'ArrowRight');
    expect(text(b)).toBe('x1');
    key(first, 'Escape');
    expect(text(a)).toBe('231');
    expect(text(b)).toBe('x');
  });
});

describe('dual range', () => {
  it('snaps values and maps slider keys', () => {
    expect(snap(13, 0, 100, 5)).toBe(15);
    expect(snap(0.30000000000000004, 0, 1, 0.1)).toBe(0.3);
    expect(snap(140, 0, 100, 10)).toBe(100);
    const o = { min: 0, max: 100, step: 5, page: 20 };
    expect(keyValue('ArrowRight', 50, o)).toBe(55);
    expect(keyValue('ArrowRight', 50, { ...o, rtl: true })).toBe(45);
    expect(keyValue('PageDown', 50, o)).toBe(30);
    expect(keyValue('End', 50, o)).toBe(100);
    expect(keyValue('a', 50, o)).toBeNull();
    expect(formatter('en-US', 'currency:USD')(1200)).toBe('$1,200');
    expect(formatter('en-US', 'percent')(25)).toBe('25%');
  });

  it('builds two sliders that never cross', async () => {
    await import('../src/js/components/range-dual.mjs');
    const root = mount(`<div data-m-range-dual data-m-range-dual-gap="10">
      <input type="range" min="0" max="100" step="5" value="20" aria-label="Min"><input type="range" min="0" max="100" step="5" value="60" aria-label="Max"></div>`);
    const [lo, hi] = root.querySelectorAll('[role=slider]');
    expect(lo.getAttribute('aria-label')).toBe('Min');
    expect(lo.getAttribute('aria-valuemax')).toBe('50');
    expect(hi.getAttribute('aria-valuemin')).toBe('30');
    key(lo, 'End');
    expect(lo.getAttribute('aria-valuenow')).toBe('50');
    expect(root.querySelectorAll('input')[0].value).toBe('50');
    key(hi, 'Home');
    expect(hi.getAttribute('aria-valuenow')).toBe('60');
    key(hi, 'ArrowRight');
    expect(hi.getAttribute('aria-valuenow')).toBe('65');
  });
});

describe('color conversions', () => {
  it('parses hex, rgb and oklch', () => {
    expect(parseColor('#f00')).toEqual({ r: 255, g: 0, b: 0, a: 1 });
    expect(parseColor('#00ff0080')).toEqual({ r: 0, g: 255, b: 0, a: 0.502 });
    expect(parseColor('rgb(10 20 30 / 50%)')).toEqual({ r: 10, g: 20, b: 30, a: 0.5 });
    expect(parseColor('rgba(10, 20, 30, 0.25)').a).toBe(0.25);
    expect(toHex(parseColor('oklch(62.8% 0.2577 29.23)'))).toBe('#ff0000');
    expect(parseColor('nonsense')).toBeNull();
  });

  it('round trips through hsv and oklch', () => {
    expect(rgbToHsv({ r: 255, g: 0, b: 0 })).toEqual({ h: 0, s: 1, v: 1 });
    expect(toHex(hsvToRgb({ h: 120, s: 1, v: 1 }))).toBe('#00ff00');
    expect(toHex(hsvToRgb(rgbToHsv({ r: 79, g: 70, b: 229 })))).toBe('#4f46e5');
    const red = rgbToOklch({ r: 255, g: 0, b: 0 });
    expect(red.l).toBeCloseTo(0.628, 3);
    expect(red.c).toBeCloseTo(0.2577, 3);
    expect(red.h).toBeCloseTo(29.23, 1);
    expect(rgbToOklch({ r: 255, g: 255, b: 255 }).l).toBeCloseTo(1, 4);
    expect(toHex(oklchToRgb(rgbToOklch({ r: 14, g: 165, b: 233 })))).toBe('#0ea5e9');
    const clipped = oklchToRgb({ l: 0.7, c: 0.5, h: 150 });
    expect(Math.max(clipped.r, clipped.g, clipped.b)).toBeLessThanOrEqual(255);
    expect(Math.min(clipped.r, clipped.g, clipped.b)).toBeGreaterThanOrEqual(0);
  });

  it('formats in every output format', () => {
    const c = { r: 255, g: 0, b: 0, a: 0.5 };
    expect(formatColor(c, 'hex')).toBe('#ff000080');
    expect(formatColor(c, 'rgb')).toBe('rgb(255 0 0 / 0.5)');
    expect(formatColor({ ...c, a: 1 }, 'oklch')).toBe('oklch(62.8% 0.258 29.2)');
  });

  it('enhances a color input with ARIA sliders', async () => {
    await import('../src/js/components/color-picker.mjs');
    const root = mount('<div data-m-color-picker data-m-color-picker-inline><input type="color" value="#ff0000" aria-label="Brand"></div>');
    const hue = root.querySelector('.color-picker-hue');
    expect(hue.getAttribute('role')).toBe('slider');
    expect(hue.getAttribute('aria-valuenow')).toBe('0');
    key(hue, 'ArrowRight', { shiftKey: true });
    expect(hue.getAttribute('aria-valuenow')).toBe('10');
    expect(root.querySelector('input').value).toBe('#ff2a00');
    const text = root.querySelector('.color-picker-text');
    text.value = 'rgb(0 0 255)';
    text.dispatchEvent(new Event('input'));
    text.dispatchEvent(new Event('change'));
    expect(root.querySelector('input').value).toBe('#0000ff');
  });
});

describe('data table', () => {
  it('reads numbers and compares like a person would', () => {
    expect(toNumber('$1,250.00')).toBe(1250);
    expect(toNumber('-12%')).toBe(-12);
    expect(toNumber('3.5 kg')).toBe(3.5);
    expect(toNumber('INV-1042')).toBeNull();
    expect(toNumber('2026-10-13')).toBeNull();
    expect(compareValues('$860.00', '$1,250.00')).toBeLessThan(0);
    expect(compareValues('item 9', 'item 10')).toBeLessThan(0);
    expect(compareValues('2026-09-02', '2026-10-01')).toBeLessThan(0);
  });

  it('sorts stably, filters and paginates', () => {
    const rows = [['b', '2'], ['a', '10'], ['c', '2']].map((cells) => ({ cells }));
    expect(sortRows(rows, 1, 1).map((r) => r.cells[0])).toEqual(['b', 'c', 'a']);
    expect(sortRows(rows, 1, -1).map((r) => r.cells[0])).toEqual(['a', 'b', 'c']);
    expect(sortRows(rows, 0, 0)).toEqual(rows);
    expect(filterRows(rows, 'A').map((r) => r.cells[0])).toEqual(['a']);
    expect(paginate(12, 3, 5)).toEqual({ page: 3, pages: 3, start: 10, end: 12 });
    expect(paginate(12, 9, 5).page).toBe(3);
    expect(paginate(0, 1, 5)).toEqual({ page: 1, pages: 1, start: 0, end: 0 });
    expect(paginate(7, 1, 0)).toEqual({ page: 1, pages: 1, start: 0, end: 7 });
    expect(span(4, 1)).toEqual([1, 2, 3, 4]);
  });

  it('sorts on header click, filters, pages and selects ranges with Shift', async () => {
    await import('../src/js/components/data-table.mjs');
    const rows = [['Ana', '$30'], ['Bo', '$5'], ['Cy', '$120'], ['Di', '$7']].map(([n, a]) => `<tr><td>${n}</td><td>${a}</td></tr>`).join('');
    const root = mount(`<div data-m-data-table data-m-data-table-page-size="2" data-m-data-table-select><table><thead><tr><th>Name</th><th>Amount</th></tr></thead><tbody>${rows}</tbody></table></div>`);
    const names = () => [...root.querySelectorAll('tbody tr')].map((tr) => tr.cells[1].textContent);
    expect(names()).toEqual(['Ana', 'Bo']);
    const amount = root.querySelectorAll('thead th')[2];
    amount.querySelector('.data-table-sort').click();
    expect(amount.getAttribute('aria-sort')).toBe('ascending');
    expect(names()).toEqual(['Bo', 'Di']);
    amount.querySelector('.data-table-sort').click();
    expect(amount.getAttribute('aria-sort')).toBe('descending');
    expect(names()).toEqual(['Cy', 'Ana']);
    root.querySelector('[aria-label="Next page"]').click();
    expect(names()).toEqual(['Di', 'Bo']);
    expect(root.querySelector('.data-table-page').textContent).toBe('Page 2 of 2');
    const filter = root.querySelector('input[type=search]');
    filter.value = 'cy';
    filter.dispatchEvent(new Event('input'));
    expect(names()).toEqual(['Cy']);
    filter.value = '';
    filter.dispatchEvent(new Event('input'));
    const size = root.querySelector('select[aria-label="Rows per page"]');
    size.value = '5';
    size.dispatchEvent(new Event('change'));
    const boxes = () => [...root.querySelectorAll('tbody .data-table-check')];
    boxes()[0].click();
    const last = boxes()[2];
    last.dispatchEvent(new MouseEvent('click', { bubbles: true, shiftKey: true }));
    expect(root.querySelectorAll('tbody tr[data-selected]')).toHaveLength(3);
    const all = root.querySelector('thead .data-table-check');
    expect(all.indeterminate).toBe(true);
    expect(root.querySelector('.data-table-status').textContent).toBe('3 selected');
  });
});

describe('tree', () => {
  it('aggregates tristate values', () => {
    expect(aggregate(['true', 'true'])).toBe('true');
    expect(aggregate(['false', 'false'])).toBe('false');
    expect(aggregate(['true', 'false'])).toBe('mixed');
    expect(aggregate(['mixed', 'true'])).toBe('mixed');
  });

  it('follows the tree pattern with the keyboard and tristate checks', async () => {
    await import('../src/js/components/tree.mjs');
    const tree = mount(`<ul data-m-tree data-m-tree-checkbox aria-label="Files">
      <li>src<ul><li data-checked>a.js</li><li>b.js</li></ul></li><li>README</li></ul>`);
    const [src, a, b, readme] = tree.querySelectorAll('li');
    expect(tree.getAttribute('role')).toBe('tree');
    expect(src.getAttribute('role')).toBe('treeitem');
    expect(src.getAttribute('aria-expanded')).toBe('false');
    expect(src.getAttribute('aria-checked')).toBe('mixed');
    expect(a.getAttribute('aria-level')).toBe('2');
    expect(src.tabIndex).toBe(0);
    src.focus();
    key(src, 'ArrowDown');
    expect(document.activeElement).toBe(readme);
    key(readme, 'ArrowUp');
    key(src, 'ArrowRight');
    expect(src.getAttribute('aria-expanded')).toBe('true');
    key(src, 'ArrowRight');
    expect(document.activeElement).toBe(a);
    key(a, 'ArrowLeft');
    expect(document.activeElement).toBe(src);
    key(src, ' ');
    expect([src, a, b].map((x) => x.getAttribute('aria-checked'))).toEqual(['true', 'true', 'true']);
    b.focus();
    key(b, 'Enter');
    expect(src.getAttribute('aria-checked')).toBe('mixed');
    key(b, 'r');
    expect(document.activeElement).toBe(readme);
    expect(tree.monsoon.tree.checked).toEqual(['a.js']);
  });
});

describe('splitter', () => {
  it('resizes neighbours within their minimums', () => {
    expect(resize([50, 50], 0, 10)).toEqual([60, 40]);
    expect(resize([50, 50], 0, 60, [10, 20])).toEqual([80, 20]);
    expect(resize([30, 30, 40], 1, -50, [10, 10, 10])).toEqual([30, 10, 60]);
    expect(normalize(['1', '3'], 2)).toEqual([25, 75]);
    expect(normalize(null, 4)).toEqual([25, 25, 25, 25]);
  });

  it('adds keyboard separators with values', async () => {
    await import('../src/js/components/splitter.mjs');
    const root = mount('<div class="splitter" data-m-splitter data-m-splitter-sizes="30,70"><div>A</div><div>B</div></div>');
    const handle = root.querySelector('[role=separator]');
    expect(handle.getAttribute('aria-orientation')).toBe('vertical');
    expect(handle.getAttribute('aria-valuenow')).toBe('30');
    expect(handle.getAttribute('aria-controls')).toBe(root.firstElementChild.id);
    key(handle, 'ArrowRight', { shiftKey: true });
    expect(handle.getAttribute('aria-valuenow')).toBe('40');
    key(handle, 'Home');
    expect(handle.getAttribute('aria-valuenow')).toBe('10');
  });
});

describe('toast manager', () => {
  beforeEach(() => { document.body.innerHTML = ''; });

  it('shows toasts in a live region, keeps a maximum and closes them', () => {
    const t = toast('Saved', { tone: 'success', description: 'All good', duration: 0 });
    const region = t.el.parentElement;
    expect(region.getAttribute('aria-live')).toBe('polite');
    expect(region.dataset.position).toBe('bottom-end');
    expect(t.el.querySelector('.toast-title').textContent).toBe('Saved');
    expect(t.el.dataset.tone).toBe('success');
    const danger = toast('Failed', { tone: 'danger', duration: 0 });
    expect(danger.el.getAttribute('role')).toBe('alert');
    for (let i = 0; i < 6; i++) toast(`n${i}`, { duration: 0, max: 3 });
    expect(region.querySelectorAll('.toast-item')).toHaveLength(3);
    const last = toast('Bye', { duration: 0, action: { label: 'Undo' } });
    last.el.querySelector('.toast-action').click();
    expect(last.el.isConnected).toBe(false);
    const top = toast('Top', { position: 'top-center', duration: 0 });
    expect(top.el.parentElement.className).toContain('toast-top');
  });
});

describe('small helpers', () => {
  it('scores passwords', () => {
    expect(passwordScore('abc')).toBe(0);
    expect(passwordScore('Password1!')).toBe(1);
    expect(passwordScore('aaaaaaaaaaaa')).toBe(0);
    expect(passwordScore('Tr0ub4dor&3')).toBe(3);
    expect(passwordScore('correct horse battery staple')).toBe(4);
  });

  it('reveals the password and rates it', async () => {
    await import('../src/js/components/password.mjs');
    const root = mount('<div data-m-password><div class="password-field"><input type="password" aria-label="Password"><button class="password-field-toggle" aria-pressed="false"></button></div><div class="password-strength"></div></div>');
    const input = root.querySelector('input');
    const toggle = root.querySelector('button');
    toggle.click();
    expect(input.type).toBe('text');
    expect(toggle.getAttribute('aria-pressed')).toBe('true');
    expect(toggle.getAttribute('aria-label')).toBe('Hide password');
    input.value = 'correct horse battery staple';
    input.dispatchEvent(new Event('input'));
    const meter = root.querySelector('.password-strength');
    expect(meter.dataset.score).toBe('4');
    expect(input.getAttribute('aria-describedby')).toBe(meter.querySelector('.password-strength-label').id);
  });

  it('steps a counter and disables at the limits', () => {
    const root = mount('<div data-m-counter><button>-</button><input type="number" value="9" min="0" max="10" step="1"><button>+</button></div>');
    const [down, up] = root.querySelectorAll('button');
    expect(up.disabled).toBe(false);
    up.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 0 }));
    expect(root.querySelector('input').value).toBe('10');
    expect(up.disabled).toBe(true);
    down.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 0 }));
    expect(root.querySelector('input').value).toBe('9');
  });

  it('matches hotkeys', () => {
    const e = (k, o = {}) => ({ key: k, ctrlKey: false, metaKey: false, shiftKey: false, altKey: false, ...o });
    expect(matchesHotkey(e('k', { ctrlKey: true }), 'ctrl+k')).toBe(true);
    expect(matchesHotkey(e('K', { ctrlKey: true }), 'mod+k')).toBe(true);
    expect(matchesHotkey(e('k', { ctrlKey: true, shiftKey: true }), 'ctrl+k')).toBe(false);
    expect(matchesHotkey(e('p', { ctrlKey: true, shiftKey: true }), 'ctrl+shift+p')).toBe(true);
  });

  it('filters the command palette and runs the item on Enter', async () => {
    await import('../src/js/components/command.mjs');
    const root = mount(`<div class="command-palette" data-m-command><input class="command-palette-input"><div class="command-palette-list">
      <p class="command-palette-heading">A</p><button class="command-palette-item">New file</button><button class="command-palette-item" data-keywords="night">Theme</button>
      <p class="command-palette-heading">B</p><button class="command-palette-item">Profile</button></div></div>`);
    const input = root.querySelector('input');
    const [h1, h2] = root.querySelectorAll('.command-palette-heading');
    expect(input.getAttribute('role')).toBe('combobox');
    input.value = 'night';
    input.dispatchEvent(new Event('input'));
    const visible = [...root.querySelectorAll('.command-palette-item:not([hidden])')].map((i) => i.textContent);
    expect(visible).toEqual(['Theme']);
    expect(h2.hidden).toBe(true);
    expect(h1.hidden).toBe(false);
    let ran = '';
    root.querySelectorAll('.command-palette-item')[1].addEventListener('click', () => { ran = 'theme'; });
    key(input, 'Enter');
    expect(ran).toBe('theme');
    input.value = 'zzz';
    input.dispatchEvent(new Event('input'));
    expect(root.querySelector('.command-palette-empty').hidden).toBe(false);
  });

  it('counts down', () => {
    const t = timeLeft(Date.UTC(2026, 0, 2, 3, 4, 5), Date.UTC(2026, 0, 1));
    expect(t).toMatchObject({ days: 1, hours: 3, minutes: 4, seconds: 5 });
    expect(timeLeft(0, 10).total).toBe(0);
    expect(describeLeft({ days: 1, hours: 0, minutes: 5, seconds: 0 })).toBe('1 day and 5 minutes left');
    expect(describeLeft({ days: 0, hours: 0, minutes: 0, seconds: 1 })).toBe('1 second left');
  });

  it('rates in half stars', async () => {
    expect(ratingAt(0.31, 5, 0.5)).toBe(2);
    expect(ratingAt(0.29, 5, 0.5)).toBe(1.5);
    expect(ratingAt(0, 5, 1)).toBe(1);
    expect(starFills(2.5, 5)).toEqual([1, 1, 0.5, 0, 0]);
    await import('../src/js/components/rating-input.mjs');
    const root = mount('<div data-m-rating-input><input type="number" max="5" step="0.5" value="3" aria-label="Rating"></div>');
    const slider = root.querySelector('[role=slider]');
    expect(slider.getAttribute('aria-valuetext')).toBe('3 of 5 stars');
    key(slider, 'ArrowRight');
    expect(root.querySelector('input').value).toBe('3.5');
    key(slider, 'End');
    expect(slider.getAttribute('aria-valuenow')).toBe('5');
    key(slider, '2');
    expect(slider.getAttribute('aria-valuenow')).toBe('2');
  });

  it('wraps carousel indexes and finds pasted images', () => {
    expect(nextIndex(2, 3)).toBe(0);
    expect(nextIndex(0, 3, -1)).toBe(2);
    const png = new File(['x'], 'shot.png', { type: 'image/png' });
    expect(imageFrom({ files: [new File(['t'], 'a.txt', { type: 'text/plain' }), png] })).toBe(png);
    expect(imageFrom({ files: [], items: [{ kind: 'file', type: 'image/jpeg', getAsFile: () => png }] })).toBe(png);
    expect(imageFrom(null)).toBeNull();
  });
});

describe('custom select', () => {
  const items = ['Apple', 'Avocado', 'Banana', 'Blueberry', 'Cherry'].map((label) => ({ label, disabled: label === 'Banana' }));

  it('skips disabled options and types ahead', () => {
    expect(nextEnabled(items, 1, 1)).toBe(3);
    expect(nextEnabled(items, 4, 1)).toBe(4);
    expect(typeAhead(items, 'b', 0)).toBe(3);
    expect(typeAhead(items, 'a', 0)).toBe(1);
    expect(typeAhead(items, 'aa', 1)).toBe(0);
    expect(typeAhead(items, 'ch', 0)).toBe(4);
    expect(typeAhead(items, 'z', 0)).toBe(-1);
  });

  it('enhances a select into a combobox and listbox in sync with the native one', async () => {
    await import('../src/js/components/select.mjs');
    document.body.innerHTML = `<form><label for="fruit">Fruit</label><select id="fruit" name="fruit" class="select select-sm" data-m-select>
      <option value="">Pick a fruit</option><optgroup label="Red"><option value="apple" data-description="Crisp">Apple</option><option value="cherry">Cherry</option></optgroup>
      <option value="banana" disabled>Banana</option><option value="kiwi">Kiwi</option></select></form>`;
    enhance(document);
    const select = document.getElementById('fruit');
    const trigger = document.querySelector('.select-menu-trigger');
    const list = document.querySelector('[role=listbox]');
    expect(select.hidden).toBe(true);
    expect(trigger.getAttribute('role')).toBe('combobox');
    expect(trigger.classList.contains('select-sm')).toBe(true);
    expect(document.getElementById(trigger.getAttribute('aria-labelledby')).textContent).toBe('Fruit');
    expect(trigger.getAttribute('aria-controls')).toBe(list.id);
    expect(trigger.textContent).toBe('Pick a fruit');
    expect(list.querySelector('[role=group]').getAttribute('aria-labelledby')).toBeTruthy();
    expect(list.querySelectorAll('[role=option]')).toHaveLength(4);
    expect(list.querySelector('[aria-disabled=true]').textContent).toBe('Banana');

    let changes = 0;
    select.addEventListener('change', () => changes++);
    key(trigger, 'ArrowDown');
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    const activeText = () => document.getElementById(trigger.getAttribute('aria-activedescendant')).textContent;
    expect(activeText()).toBe('AppleCrisp');
    key(trigger, 'ArrowDown');
    key(trigger, 'ArrowDown');
    expect(activeText()).toBe('Kiwi');
    key(trigger, 'Home');
    key(trigger, 'Enter');
    expect(select.value).toBe('apple');
    expect(changes).toBe(1);
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(trigger.textContent).toBe('Apple');

    key(trigger, 'k');
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(activeText()).toBe('Kiwi');
    key(trigger, 'Escape');
    expect(select.value).toBe('apple');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');

    select.value = 'cherry';
    select.dispatchEvent(new Event('change'));
    expect(trigger.textContent).toBe('Cherry');
    select.querySelector('[value=kiwi]').disabled = true;
    await new Promise((r) => setTimeout(r));
    expect(list.querySelectorAll('[aria-disabled=true]')).toHaveLength(2);
    select.disabled = true;
    await new Promise((r) => setTimeout(r));
    expect(trigger.getAttribute('aria-disabled')).toBe('true');
    expect(trigger.tabIndex).toBe(-1);
  });

  it('toggles options in a multiple select and shows chips', () => {
    document.body.innerHTML = '<select multiple data-m-select aria-label="People"><option value="a" selected>Ana</option><option value="b">Bo</option><option value="c">Cy</option></select>';
    enhance(document);
    const select = document.querySelector('select');
    const trigger = document.querySelector('.select-menu-trigger');
    expect(trigger.getAttribute('aria-label')).toBe('People');
    expect(document.querySelector('[role=listbox]').getAttribute('aria-multiselectable')).toBe('true');
    key(trigger, 'ArrowDown');
    key(trigger, 'ArrowDown');
    key(trigger, ' ');
    expect([...select.selectedOptions].map((o) => o.value)).toEqual(['a', 'b']);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(trigger.querySelectorAll('.select-menu-chip')).toHaveLength(2);
    key(trigger, 'Escape');
    key(trigger, 'Backspace');
    expect([...select.selectedOptions].map((o) => o.value)).toEqual(['a']);
    expect(document.querySelector('[aria-selected=true]').textContent).toBe('Ana');
  });

  it('adds a search box to long lists and filters it', () => {
    const opts = Array.from({ length: 12 }, (_, i) => `<option value="${i}">Option ${i}</option>`).join('');
    document.body.innerHTML = `<select data-m-select aria-label="Long">${opts}</select>`;
    enhance(document);
    const trigger = document.querySelector('.select-menu-trigger');
    key(trigger, 'Enter');
    const search = document.querySelector('.select-menu-search');
    expect(document.activeElement).toBe(search);
    search.value = '11';
    search.dispatchEvent(new Event('input'));
    expect([...document.querySelectorAll('.select-menu-option:not([hidden])')].map((o) => o.textContent)).toEqual(['Option 11']);
    key(search, 'Enter');
    expect(document.querySelector('select').value).toBe('11');
  });
});

describe('textarea autosize', () => {
  it('sets a height from the content where field-sizing is missing', () => {
    const el = mount('<textarea data-m-autosize>one</textarea>');
    expect(el.style.height).toMatch(/px$/);
  });
});
