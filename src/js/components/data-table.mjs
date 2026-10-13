// Data table: sorting, a filter box, pagination, row selection and a column
// menu on top of an existing <table>. Without the script the table is plain.
//
//   <div class="data-table" data-m-data-table data-m-data-table-page-size="5" data-m-data-table-select>
//     <table class="table">...</table>
//   </div>
//
// A cell's data-sort overrides its text when sorting; a header with
// data-sortable="false" is not sortable. Options: -page-size (0 shows every
// row), -select (checkbox column, Shift selects a range), -filter="false",
// -columns="false".
import { define, emit } from '../core.mjs';
import { clamp, expose, floating, fold, h, uid } from './combobox.mjs';

const collator = typeof Intl !== 'undefined' ? new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' }) : null;

/** The number in "$1,250.00", "-12%" or "3.5 kg", null for other text. */
export function toNumber(s) {
  const t = String(s).trim();
  if (!/^[^\w\s-]{0,2}\s?-?[\d,\s]*\.?\d+\s?[^\d\s]{0,3}$/.test(t)) return null;
  const n = parseFloat(t.replace(/[^\d.-]/g, ''));
  return Number.isFinite(n) ? n : null;
}

/** Numbers compare as numbers, everything else with a numeric aware collator. */
export function compareValues(a, b) {
  const x = toNumber(a);
  const y = toNumber(b);
  if (x !== null && y !== null) return x - y;
  if (!a !== !b) return a ? -1 : 1;
  return collator ? collator.compare(a, b) : String(a).localeCompare(b);
}

/** A stable sorted copy; dir is 1 (ascending), -1 (descending) or 0 (original order). */
export function sortRows(rows, col, dir) {
  if (!dir || col < 0) return rows.slice();
  return rows.map((r, i) => [r, i])
    .sort((p, q) => dir * compareValues(p[0].cells[col], q[0].cells[col]) || p[1] - q[1])
    .map((p) => p[0]);
}

export const filterRows = (rows, query) => {
  const q = fold(query.trim());
  return q ? rows.filter((r) => (r.text || (r.text = fold(r.cells.join(' ')))).includes(q)) : rows.slice();
};

/** Page window for total rows; size 0 means a single page with every row. */
export function paginate(total, page, size) {
  if (!size) return { page: 1, pages: 1, start: 0, end: total };
  const pages = Math.max(1, Math.ceil(total / size));
  const p = clamp(page, 1, pages);
  return { page: p, pages, start: (p - 1) * size, end: Math.min(total, p * size) };
}

/** Indices from a to b inclusive, in either order. */
export const span = (a, b) => Array.from({ length: Math.abs(b - a) + 1 }, (_, i) => Math.min(a, b) + i);

const ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">';

define('data-table', (root, opts) => {
  const table = root.querySelector('table');
  if (!table || !table.tHead || !table.tBodies[0]) return;
  const headRow = table.tHead.rows[0];
  const tbody = table.tBodies[0];
  const select = opts.select !== undefined;
  const headers = [...headRow.cells];
  let rows = [];
  let query = '';
  let page = 1;
  let size = opts.pageSize === undefined ? 10 : +opts.pageSize;
  let col = -1;
  let dir = 0;
  let anchor = null;
  const hidden = new Set();
  let view = [];

  const check = (label) => h('input', { type: 'checkbox', class: 'checkbox checkbox-sm data-table-check', 'aria-label': label });
  const all = select ? check('Select all rows') : null;
  if (select) headRow.prepend(h('th', { class: 'data-table-select', scope: 'col' }, all));

  const readRows = () => {
    rows = [...tbody.rows].filter((tr) => !tr.classList.contains('data-table-empty')).map((tr) => {
      const prev = rows.find((r) => r.tr === tr);
      if (prev) return prev;
      const cells = [...tr.cells];
      if (select && !tr.querySelector('.data-table-check')) {
        tr.prepend(h('td', { class: 'data-table-select' }, check(`Select ${cells[0] ? cells[0].textContent.trim() : 'row'}`)));
      }
      hidden.forEach((i) => { if (cells[i]) cells[i].hidden = true; });
      return { tr, cells: cells.map((c) => (c.dataset.sort !== undefined ? c.dataset.sort : c.textContent.trim())), selected: false };
    });
  };
  readRows();

  headers.forEach((th, i) => {
    if (th.dataset.sortable === 'false') return;
    const btn = h('button', { type: 'button', class: 'data-table-sort' }, ...th.childNodes);
    btn.insertAdjacentHTML('beforeend', '<span class="data-table-sort-icon" aria-hidden="true"></span>');
    btn.addEventListener('click', () => {
      dir = col === i ? (dir === 1 ? -1 : dir === -1 ? 0 : 1) : 1;
      col = dir ? i : -1;
      render();
      emit(root, 'table-sort', { column: i, direction: dir === 1 ? 'ascending' : dir === -1 ? 'descending' : 'none' });
    });
    th.append(btn);
  });

  // Toolbar: filter, selection status and the column menu.
  const filter = opts.filter === 'false' ? null : h('input', { type: 'search', class: 'input input-sm', placeholder: opts.placeholder || 'Filter rows', 'aria-label': 'Filter rows' });
  const status = h('span', { class: 'data-table-status', 'aria-live': 'polite' });
  let menuBtn = null;
  let menu = null;
  if (opts.columns !== 'false') {
    menuBtn = h('button', { type: 'button', class: 'btn btn-outline btn-sm data-table-columns', 'aria-haspopup': 'true', 'aria-expanded': 'false' });
    menuBtn.innerHTML = `${ICON}<path d="M12 3v18M3 9h18M3 15h18"/><rect x="3" y="3" width="18" height="18" rx="2"/></svg>Columns`;
    menu = h('div', { class: 'data-table-menu', role: 'group', 'aria-label': 'Visible columns' }, headers.map((th, i) => {
      const box = h('input', { type: 'checkbox', class: 'checkbox checkbox-sm', checked: true });
      box.addEventListener('change', () => {
        if (box.checked) hidden.delete(i);
        else hidden.add(i);
        const off = select ? 1 : 0;
        [headRow, ...rows.map((r) => r.tr)].forEach((tr) => { if (tr.cells[i + off]) tr.cells[i + off].hidden = !box.checked; });
        const boxes = [...menu.querySelectorAll('input')];
        boxes.forEach((b) => { b.disabled = b.checked && boxes.filter((x) => x.checked).length === 1; });
        render();
      });
      return h('label', { class: 'data-table-menu-item' }, box, th.textContent.trim());
    }));
    const pop = floating(menu, menuBtn, { onClose: () => menuBtn.setAttribute('aria-expanded', 'false') });
    menuBtn.addEventListener('click', () => {
      pop.toggle();
      menuBtn.setAttribute('aria-expanded', String(pop.open));
    });
    menu.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        pop.close();
        menuBtn.focus();
      }
    });
  }
  const toolbar = h('div', { class: 'data-table-toolbar' },
    filter ? h('label', { class: 'search-field data-table-filter' }, filter) : null, status, menuBtn, menu);

  // Footer: range info, rows per page and the pager.
  const info = h('span', { class: 'data-table-info' });
  const pageText = h('span', { class: 'data-table-page', 'aria-live': 'polite' });
  const pagerBtn = (label, d) => {
    const b = h('button', { type: 'button', class: 'btn btn-outline btn-sm btn-square', 'aria-label': label, onclick: () => go(page + d) });
    b.innerHTML = `${ICON}<path d="${d < 0 ? 'm15 18-6-6 6-6' : 'm9 18 6-6-6-6'}"/></svg>`;
    return b;
  };
  const prev = pagerBtn('Previous page', -1);
  const next = pagerBtn('Next page', 1);
  const sizes = [...new Set([5, 10, 20, 50, size])].filter(Boolean).sort((x, y) => x - y);
  const sizeSel = h('select', { class: 'select select-sm', 'aria-label': 'Rows per page', id: uid('rows') }, sizes.map((n) => h('option', { value: n, selected: n === size }, String(n))));
  sizeSel.addEventListener('change', () => {
    size = +sizeSel.value;
    go(1);
  });
  const footer = h('div', { class: 'data-table-footer' }, info, size ? h('div', { class: 'data-table-pager' },
    h('label', { class: 'data-table-size', for: sizeSel.id }, 'Rows'), sizeSel, prev, pageText, next) : null);

  if (table.parentElement === root) {
    const scroll = h('div', { class: 'data-table-scroll' });
    table.before(scroll);
    scroll.append(table);
  }
  root.prepend(toolbar);
  root.append(footer);
  const empty = h('tr', { class: 'data-table-empty' }, h('td', {}, opts.empty || 'No matching rows'));

  function go(n) {
    page = n;
    render();
    emit(root, 'table-page', { page, size });
  }

  function render() {
    view = sortRows(filterRows(rows, query), col, dir);
    const p = paginate(view.length, page, size);
    page = p.page;
    const shown = view.slice(p.start, p.end);
    empty.firstChild.colSpan = headers.length - hidden.size + (select ? 1 : 0);
    tbody.replaceChildren(...(shown.length ? shown.map((r) => r.tr) : [empty]));
    headers.forEach((th, i) => {
      if (i === col && dir) th.setAttribute('aria-sort', dir === 1 ? 'ascending' : 'descending');
      else th.removeAttribute('aria-sort');
    });
    info.textContent = view.length ? `${p.start + 1} to ${p.end} of ${view.length}` : 'No results';
    pageText.textContent = `Page ${p.page} of ${p.pages}`;
    prev.disabled = p.page <= 1;
    next.disabled = p.page >= p.pages;
    syncSelection();
  }

  function syncSelection() {
    if (!select) return;
    rows.forEach((r) => {
      r.tr.querySelector('.data-table-check').checked = r.selected;
      r.tr.toggleAttribute('data-selected', r.selected);
    });
    const n = view.filter((r) => r.selected).length;
    all.checked = n > 0 && n === view.length;
    all.indeterminate = n > 0 && n < view.length;
    const total = rows.filter((r) => r.selected).length;
    status.textContent = total ? `${total} selected` : '';
  }

  const selectionChanged = () => {
    syncSelection();
    emit(root, 'table-select', { rows: rows.filter((r) => r.selected).map((r) => r.tr) });
  };

  if (select) {
    all.addEventListener('change', () => {
      view.forEach((r) => { r.selected = all.checked; });
      selectionChanged();
    });
    tbody.addEventListener('click', (e) => {
      const box = e.target.closest('.data-table-check');
      if (!box) return;
      const row = rows.find((r) => r.tr.contains(box));
      const i = view.indexOf(row);
      if (e.shiftKey && anchor && view.includes(anchor)) span(view.indexOf(anchor), i).forEach((k) => { view[k].selected = box.checked; });
      else row.selected = box.checked;
      anchor = row;
      selectionChanged();
    });
  }
  if (filter) {
    filter.addEventListener('input', () => {
      query = filter.value;
      page = 1;
      render();
      emit(root, 'table-filter', { query, count: view.length });
    });
  }
  render();

  expose(root, 'dataTable', {
    sort(column, direction = 'ascending') {
      col = column;
      dir = direction === 'descending' ? -1 : direction === 'none' ? 0 : 1;
      render();
    },
    filter(q) {
      query = q;
      if (filter) filter.value = q;
      page = 1;
      render();
    },
    page: go,
    get selected() { return rows.filter((r) => r.selected).map((r) => r.tr); },
    selectAll(on = true) {
      rows.forEach((r) => { r.selected = on; });
      selectionChanged();
    },
    refresh() {
      tbody.append(...rows.map((r) => r.tr).filter((tr) => !tr.isConnected));
      readRows();
      render();
    },
  });
});
