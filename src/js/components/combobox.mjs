// Combobox: filter as you type over a native <select> (single or multiple)
// or an <input list> with its <datalist>, following the WAI-ARIA combobox
// pattern with a listbox popup. Without the script the native control works.
//
//   <div class="combobox" data-m-combobox><select class="select">...</select></div>
//
// Options: data-m-combobox-placeholder, data-m-combobox-empty (no results
// text), data-m-combobox-async (ask for items with a monsoon:combobox-search
// event whose detail has { query, set(items) }).
//
// This module also exports the small helpers the other interactive
// components share (element builder, floating panel, text folding).
import { define, emit } from '../core.mjs';

export const uid = (p) => `m-${p}-${Math.random().toString(36).slice(2, 8)}`;
export const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

/**
 * Stores a component API on the element (el.monsoon.<name>) and publishes a
 * getter on the browser global: Monsoon.<name>(elementOrSelector).
 */
export const expose = (el, name, api) => {
  (el.monsoon || (el.monsoon = {}))[name] = api;
  const attach = () => {
    const g = globalThis.Monsoon;
    if (!g || typeof g !== 'object' || g[name]) return;
    try {
      g[name] = (t) => {
        const node = typeof t === 'string' ? document.querySelector(t) : t;
        return node && node.monsoon && node.monsoon[name];
      };
    } catch { /* frozen namespace */ }
  };
  attach();
  queueMicrotask(attach);
  return api;
};

/** Tiny element builder: h('button', { class: 'btn', onclick: fn }, 'Label'). */
export function h(tag, attrs = {}, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? '' : v);
  }
  el.append(...kids.flat().filter((k) => k != null && k !== false));
  return el;
}

/** Fires native input and change events, so forms and frameworks see the new value. */
export const notify = (el) => {
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
};

/** Lower case without accents, for forgiving matches: "Sao" finds "São". */
export const fold = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** [start, end] of query inside label, null when it does not match. */
export function matchRange(label, query) {
  if (!query) return [0, 0];
  const i = fold(label).indexOf(fold(query));
  return i < 0 ? null : [i, i + query.length];
}

/** Items whose label contains the query, prefix matches first, order kept otherwise. */
export function filterItems(items, query, prefixFirst = true) {
  const out = [];
  for (const item of items) {
    const range = matchRange(`${item.label}`, query) || (item.keywords && matchRange(item.keywords, query) && [0, 0]);
    if (range) out.push({ ...item, range });
  }
  return query && prefixFirst ? out.sort((a, b) => (a.range[0] === 0 && a.range[1] ? 0 : 1) - (b.range[0] === 0 && b.range[1] ? 0 : 1)) : out;
}

/** Label with the matched part wrapped in <mark>. */
export function highlight(label, range) {
  const frag = document.createDocumentFragment();
  if (!range || range[0] === range[1]) {
    frag.append(label);
    return frag;
  }
  frag.append(label.slice(0, range[0]), h('mark', {}, label.slice(range[0], range[1])), label.slice(range[1]));
  return frag;
}

const POPOVER = typeof HTMLElement !== 'undefined' && 'showPopover' in HTMLElement.prototype;

/**
 * A panel placed under (or above) its anchor in the top layer, so no
 * overflow container clips it. Closes on outside pointer down.
 */
export function floating(panel, anchor, { onClose, matchWidth, fit } = {}) {
  if (POPOVER) panel.popover = 'manual';
  else panel.hidden = true;
  let open = false;
  const place = () => {
    if (!open) return;
    const r = anchor.getBoundingClientRect();
    if (matchWidth) panel.style.minWidth = `${r.width}px`;
    if (fit) panel.style.maxHeight = '';
    const w = panel.offsetWidth;
    let ht = panel.offsetHeight;
    const vw = document.documentElement.clientWidth || innerWidth;
    const below = innerHeight - r.bottom - 14;
    const above = r.top - 14;
    // Flip above when it does not fit below and there is more room above;
    // with fit, shrink to the room left (the panel scrolls inside).
    const up = ht > below && above > below;
    if (fit && ht > (up ? above : below)) {
      panel.style.maxHeight = `${Math.max(120, up ? above : below)}px`;
      ht = panel.offsetHeight;
    }
    const top = up ? r.top - ht - 6 : r.bottom + 6;
    const rtl = getComputedStyle(anchor).direction === 'rtl';
    panel.style.top = `${Math.max(8, top)}px`;
    panel.toggleAttribute('data-above', up);
    panel.style.left = `${clamp(rtl ? r.right - w : r.left, 8, Math.max(8, vw - w - 8))}px`;
  };
  const outside = (e) => {
    if (!panel.contains(e.target) && !anchor.contains(e.target)) api.close();
  };
  const api = {
    get open() { return open; },
    show() {
      if (open) return;
      open = true;
      if (POPOVER) panel.showPopover();
      else panel.hidden = false;
      place();
      document.addEventListener('pointerdown', outside, true);
      addEventListener('scroll', place, true);
      addEventListener('resize', place);
    },
    close() {
      if (!open) return;
      open = false;
      if (POPOVER) panel.hidePopover();
      else panel.hidden = true;
      document.removeEventListener('pointerdown', outside, true);
      removeEventListener('scroll', place, true);
      removeEventListener('resize', place);
      if (onClose) onClose();
    },
    toggle() { (open ? api.close : api.show)(); },
    place,
  };
  return api;
}

/** A polite live region shared by every component, for short announcements. */
let liveRegion;
export function announce(text) {
  if (!liveRegion || !liveRegion.isConnected) {
    liveRegion = h('div', { class: 'sr-only', 'aria-live': 'assertive', 'aria-atomic': 'true' });
    document.body.append(liveRegion);
  }
  liveRegion.textContent = '';
  setTimeout(() => { liveRegion.textContent = text; }, 30);
}

const optionItems = (src) => [...src.querySelectorAll('option')]
  .filter((o) => o.value !== '' || src.tagName === 'DATALIST')
  .map((o) => ({
    value: o.value,
    label: o.label || o.textContent.trim() || o.value,
    disabled: o.disabled,
    group: o.parentElement.tagName === 'OPTGROUP' ? o.parentElement.label : '',
  }));

define('combobox', (root, opts) => {
  const select = root.querySelector('select');
  const field = select ? null : root.querySelector('input[list]');
  if (!select && !field) return;
  const datalist = field && document.getElementById(field.getAttribute('list'));
  const multiple = !!(select && select.multiple);
  const listId = uid('listbox');
  let items = optionItems(select || datalist || root);
  let view = [];
  let active = -1;
  let timer;

  const input = field || h('input', {
    type: 'text',
    class: multiple ? 'combobox-input' : 'input combobox-input',
    autocomplete: 'off',
    placeholder: opts.placeholder || (select.querySelector('option[value=""]') || {}).textContent || '',
  });
  if (field) field.removeAttribute('list');
  input.classList.add('combobox-input');
  Object.entries({ role: 'combobox', 'aria-autocomplete': 'list', 'aria-expanded': 'false', 'aria-controls': listId })
    .forEach(([k, v]) => input.setAttribute(k, v));

  const list = h('ul', { class: 'combobox-list', role: 'listbox', id: listId, 'aria-multiselectable': multiple ? 'true' : null });
  const chips = multiple ? h('div', { class: 'combobox-chips' }) : null;
  const control = multiple ? h('div', { class: 'input combobox-control' }, chips, input) : input;

  if (select) {
    const name = select.getAttribute('aria-label');
    if (name) input.setAttribute('aria-label', name);
    const label = select.labels && select.labels[0];
    if (label) {
      input.id = uid('combo');
      label.htmlFor = input.id;
    }
    if (select.disabled) input.disabled = true;
    select.hidden = true;
    select.tabIndex = -1;
    ['input-sm', 'input-lg', 'select-sm', 'select-lg'].forEach((c) => {
      if (select.classList.contains(c)) control.classList.add(`input-${c.split('-')[1]}`);
    });
    select.before(control);
    if (!multiple) {
      const toggle = h('button', { type: 'button', class: 'combobox-toggle', tabindex: '-1', 'aria-label': 'Show options' });
      toggle.addEventListener('click', () => {
        if (pop.open) pop.close();
        else open();
        input.focus();
      });
      control.after(toggle);
    }
  }
  root.append(list);
  const pop = floating(list, multiple ? control : input, {
    matchWidth: true,
    onClose: () => {
      input.setAttribute('aria-expanded', 'false');
      input.removeAttribute('aria-activedescendant');
    },
  });

  const selected = () => (select ? [...select.selectedOptions].map((o) => o.value).filter(Boolean) : [input.value]);
  const labelOf = (v) => (items.find((i) => i.value === v) || (select && [...select.options].find((o) => o.value === v)) || { label: v }).label;
  const syncText = () => {
    if (!multiple && select) input.value = select.value ? labelOf(select.value) : '';
  };

  const renderChips = () => {
    if (!multiple) return;
    chips.replaceChildren(...selected().map((v) => {
      const x = h('button', { type: 'button', class: 'chip-remove', 'aria-label': `Remove ${labelOf(v)}`, tabindex: '-1', onclick: (e) => { e.stopPropagation(); choose(v); input.focus(); } });
      x.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>';
      return h('span', { class: 'chip chip-sm chip-primary combobox-chip' }, labelOf(v), x);
    }));
  };

  const setActive = (i) => {
    const opts2 = list.querySelectorAll('[role=option]');
    opts2.forEach((o, n) => o.toggleAttribute('data-active', n === i));
    active = i;
    const el = opts2[i];
    if (el) {
      input.setAttribute('aria-activedescendant', el.id);
      if (el.scrollIntoView) el.scrollIntoView({ block: 'nearest' });
    } else input.removeAttribute('aria-activedescendant');
  };

  const render = (query, loading) => {
    view = loading ? [] : filterItems(items, query, !items.some((i) => i.group));
    const sel = selected();
    let group = '';
    const rows = [];
    view.forEach((item, i) => {
      if (item.group && item.group !== group) rows.push(h('li', { class: 'combobox-group', role: 'presentation' }, (group = item.group)));
      rows.push(h('li', {
        class: 'combobox-option',
        role: 'option',
        id: `${listId}-${i}`,
        'aria-selected': sel.includes(item.value) ? 'true' : 'false',
        'aria-disabled': item.disabled ? 'true' : null,
        onpointerdown: (e) => e.preventDefault(),
        onclick: () => !item.disabled && choose(item.value),
        onpointermove: () => active !== i && setActive(i),
      }, h('span', {}, highlight(item.label, item.range))));
    });
    if (!rows.length) rows.push(h('li', { class: 'combobox-empty', role: 'presentation' }, loading ? 'Searching' : opts.empty || 'No results'));
    list.replaceChildren(...rows);
    const first = query ? view.findIndex((i) => !i.disabled) : view.findIndex((i) => sel.includes(i.value));
    setActive(first);
    pop.place();
  };

  const open = (query = '') => {
    render(query);
    pop.show();
    input.setAttribute('aria-expanded', 'true');
  };

  function choose(value) {
    let item = items.find((i) => i.value === value);
    if (select) {
      let opt = [...select.options].find((o) => o.value === value);
      if (!opt && item) select.append((opt = new Option(item.label, value)));
      if (multiple) opt.selected = !opt.selected;
      else select.value = value;
      notify(select);
    } else {
      input.value = value;
      notify(input);
    }
    if (multiple) {
      renderChips();
      input.value = '';
      if (pop.open) render('');
    } else {
      syncText();
      pop.close();
    }
    item = item || { value, label: value };
    emit(root, 'change', { value: multiple ? selected() : value, label: item.label });
  }

  const search = (query) => {
    if (opts.async === undefined) return open(query);
    clearTimeout(timer);
    if (!pop.open) open(query);
    render(query, true);
    timer = setTimeout(() => {
      emit(root, 'combobox-search', {
        query,
        set: (next) => {
          items = next.map((i) => (typeof i === 'string' ? { value: i, label: i } : { label: i.value, ...i }));
          if (input.value === query) render(query);
        },
      });
    }, 180);
  };

  const onInput = () => search(input.value);
  const onKey = (e) => {
    const n = view.length;
    const step = (d) => {
      if (!n) return;
      let i = active;
      for (let k = 0; k < n; k++) {
        i = (i + d + n) % n;
        if (!view[i].disabled) break;
      }
      setActive(i);
    };
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!pop.open) open(multiple || field ? input.value : '');
      else if (e.altKey) pop.close();
      else step(e.key === 'ArrowDown' ? 1 : -1);
    } else if (e.key === 'Enter' && pop.open) {
      e.preventDefault();
      if (view[active] && !view[active].disabled) choose(view[active].value);
      else if (!select) pop.close();
    } else if (e.key === 'Escape' && pop.open) {
      e.preventDefault();
      e.stopPropagation();
      pop.close();
      syncText();
    } else if (e.key === 'Backspace' && multiple && !input.value) {
      const sel = selected();
      if (sel.length) choose(sel[sel.length - 1]);
    } else if (e.key === 'Tab') pop.close();
  };
  const onBlur = () => setTimeout(() => {
    if (root.contains(document.activeElement)) return;
    pop.close();
    syncText();
    if (multiple) input.value = '';
  });
  input.addEventListener('input', onInput);
  input.addEventListener('keydown', onKey);
  input.addEventListener('blur', onBlur);
  input.addEventListener('click', () => !pop.open && open(multiple || field ? input.value : ''));
  if (multiple) control.addEventListener('click', () => input.focus());
  syncText();
  renderChips();

  expose(root, 'combobox', {
    open: () => open(),
    close: () => pop.close(),
    get value() { return multiple ? selected() : select ? select.value : input.value; },
    set value(v) { [].concat(v).forEach(choose); },
    refresh() { items = optionItems(select || datalist); syncText(); renderChips(); },
  });
  return () => pop.close();
});
