// Custom select: turns a native <select> into a trigger and a listbox popup
// that follow the theme, following the WAI-ARIA select-only combobox pattern.
// The native select stays in the form (hidden): its value, its change events
// and the custom control stay in sync both ways.
//
//   <select class="select" data-m-select aria-label="Plan">
//     <option value="">Choose a plan</option>
//     <option value="team" data-description="Up to 20 seats">Team</option>
//   </select>
//
// On an option: data-description, data-icon (text or an inline <svg>),
// data-image (a URL) or data-color (a swatch). Optgroups become headings.
// Options: data-m-select-search (a filter box, on by default from 10
// options; "false" turns it off), -clearable, -placeholder. multiple shows
// the picks as chips. The select's size, tone and variant classes carry over.
import { define, emit } from '../core.mjs';
import { expose, floating, fold, h, notify, uid } from './combobox.mjs';

/** Index of the next enabled option from i in direction d, or i when there is none. */
export function nextEnabled(items, i, d) {
  for (let k = i + d; k >= 0 && k < items.length; k += d) if (!items[k].disabled) return k;
  return i;
}

/**
 * Type ahead: the first enabled option after from whose label starts with
 * the typed text. Repeating one letter cycles through its matches.
 */
export function typeAhead(items, text, from) {
  const t = fold(text);
  const same = t.length > 1 && [...t].every((c) => c === t[0]);
  const q = same ? t[0] : t;
  const n = items.length;
  for (let k = 1; k <= n; k++) {
    const i = (from + (same || t.length === 1 ? k : k - 1) + n) % n;
    if (!items[i].disabled && fold(items[i].label).startsWith(q)) return i;
  }
  return -1;
}

// Inline SVG icons from data-icon, without scripts, handlers or outside links.
const svgIcon = (markup) => {
  const doc = new DOMParser().parseFromString(markup, 'image/svg+xml');
  const svg = doc.documentElement;
  if (svg.nodeName !== 'svg') return null;
  svg.querySelectorAll('script, foreignObject').forEach((n) => n.remove());
  [svg, ...svg.querySelectorAll('*')].forEach((n) => [...n.attributes].forEach((a) => {
    if (/^on/i.test(a.name) || (/href$/i.test(a.name) && !a.value.startsWith('#'))) n.removeAttribute(a.name);
  }));
  svg.setAttribute('aria-hidden', 'true');
  return document.importNode(svg, true);
};
const media = (o) => {
  const d = o.dataset;
  if (d.color) return h('span', { class: 'select-menu-swatch', style: `--swatch: ${d.color}`, 'aria-hidden': 'true' });
  if (d.image) return h('img', { class: 'select-menu-image', src: d.image, alt: '' });
  if (!d.icon) return null;
  const icon = h('span', { class: 'select-menu-icon', 'aria-hidden': 'true' });
  if (d.icon.trim().startsWith('<svg')) {
    const svg = svgIcon(d.icon);
    if (svg) icon.append(svg);
  } else icon.textContent = d.icon;
  return icon;
};

// Look classes go on the trigger, layout utilities on the wrapper.
const LOOK = /^select(-|$)/;
const LAYOUT = /^(w-|max-w-|min-w-|flex-|grow|shrink|basis-|-?m[trblxyse]?-|col-|row-|self-|justify-self-|order-|hidden|block|inline)/;

define('select', (host) => {
  const select = host.tagName === 'SELECT' ? host : host.querySelector('select');
  if (!select || select.previousElementSibling?.classList.contains('select-menu')) return;
  const multiple = select.multiple;
  const read = (name) => select.dataset[`mSelect${name}`] ?? host.dataset[`mSelect${name}`];
  const listId = uid('select');
  let items = [];
  let active = -1;
  let typed = '';
  let typedAt = 0;

  const wrap = h('div', { class: ['select-menu', ...[...select.classList].filter((c) => LAYOUT.test(c) || /^select-(xs|sm|md|lg|xl)$/.test(c))].join(' '), 'data-multiple': multiple || null });
  const value = h('span', { class: 'select-menu-value' });
  const trigger = h('div', {
    class: `${[...select.classList].filter((c) => LOOK.test(c) && c !== 'select-custom').join(' ')} select-menu-trigger`,
    role: 'combobox', tabindex: '0', 'aria-haspopup': 'listbox', 'aria-expanded': 'false', 'aria-controls': listId,
  }, value);
  if (!trigger.classList.contains('select')) trigger.classList.add('select');
  const list = h('div', { class: 'select-menu-list', role: 'listbox', id: listId, 'aria-multiselectable': multiple ? 'true' : null });
  const searchOpt = read('Search');
  const search = h('input', { type: 'search', class: 'input input-sm select-menu-search', placeholder: 'Search', 'aria-label': 'Search options', autocomplete: 'off', 'aria-controls': listId, 'aria-autocomplete': 'list', role: 'combobox', 'aria-expanded': 'true' });
  const empty = h('div', { class: 'select-menu-empty', role: 'presentation', hidden: true }, 'No results');
  const popup = h('div', { class: 'select-menu-popup' }, list);
  const clearable = read('Clearable') !== undefined;
  const clear = clearable ? h('button', { type: 'button', class: 'select-menu-clear', 'aria-label': 'Clear selection', tabindex: '-1' }) : null;
  // The native select stays where it is (moving it would re-run the
  // component), hidden, right after the custom control.
  select.before(wrap);
  wrap.append(trigger, ...(clear ? [clear] : []), popup);
  select.hidden = true;
  select.tabIndex = -1;
  select.setAttribute('aria-hidden', 'true');

  // Accessible name: the select's labels or its aria-label.
  const labels = [...(select.labels || [])];
  if (labels.length) {
    trigger.setAttribute('aria-labelledby', labels.map((l) => (l.id = l.id || uid('label'))).join(' '));
    labels.forEach((l) => l.addEventListener('click', (e) => {
      e.preventDefault();
      trigger.focus();
    }));
  } else if (select.getAttribute('aria-label')) trigger.setAttribute('aria-label', select.getAttribute('aria-label'));
  ['aria-describedby', 'aria-invalid', 'aria-required'].forEach((a) => select.hasAttribute(a) && trigger.setAttribute(a, select.getAttribute(a)));
  if (select.required) trigger.setAttribute('aria-required', 'true');

  const placeholderOpt = () => [...select.options].find((o) => o.value === '' && (o.disabled || o.hidden || o.index === 0));
  const placeholder = () => read('Placeholder') || (placeholderOpt() || {}).textContent || (multiple ? 'Select options' : 'Select an option');

  // Options and groups, built from the native select.
  const build = () => {
    const ph = placeholderOpt();
    items = [];
    const rows = [];
    let group = null;
    for (const o of select.options) {
      if (o === ph && !multiple) continue;
      if (o.hidden) continue;
      const g = o.parentElement.tagName === 'OPTGROUP' ? o.parentElement : null;
      if (g !== group) {
        group = g;
        if (g) {
          const id = uid('group');
          rows.push(h('div', { role: 'group', 'aria-labelledby': id, class: 'select-menu-groupbox' }, h('div', { class: 'select-menu-group', id, role: 'presentation' }, g.label)));
        }
      }
      const disabled = o.disabled || (g && g.disabled);
      const desc = o.dataset.description;
      const el = h('div', {
        class: 'select-menu-option', role: 'option', id: `${listId}-${items.length}`, 'aria-selected': 'false', 'aria-disabled': disabled ? 'true' : null,
      }, media(o), h('span', { class: 'select-menu-text' }, h('span', { class: 'select-menu-label' }, o.label || o.textContent),
        desc ? h('span', { class: 'select-menu-description' }, desc) : null));
      const item = { option: o, el, label: o.label || o.textContent.trim(), disabled: !!disabled, keywords: `${o.textContent} ${desc || ''} ${o.value}` };
      items.push(item);
      if (g) rows[rows.length - 1].append(el);
      else rows.push(el);
    }
    list.replaceChildren(...rows, empty);
    const useSearch = searchOpt === undefined ? items.length >= 10 : searchOpt !== 'false';
    if (useSearch && !search.isConnected) popup.prepend(search);
    if (!useSearch && search.isConnected) search.remove();
    render();
  };

  // Trigger text or chips, selection marks, disabled state.
  const render = () => {
    const picked = items.filter((i) => i.option.selected && !(i.option.value === '' && !multiple));
    items.forEach((i) => i.el.setAttribute('aria-selected', String(i.option.selected)));
    if (multiple) {
      value.replaceChildren(...picked.map((i) => h('span', { class: 'chip chip-sm chip-primary select-menu-chip' }, i.label,
        h('span', {
          class: 'select-menu-chip-remove', 'aria-hidden': 'true',
          onpointerdown: (e) => { e.preventDefault(); e.stopPropagation(); },
          onclick: (e) => { e.stopPropagation(); toggle(items.indexOf(i)); },
        }))));
      if (!picked.length) value.append(h('span', { class: 'select-menu-placeholder' }, placeholder()));
    } else {
      const i = picked[0];
      value.replaceChildren(...(i ? [media(i.option), h('span', { class: 'select-menu-label' }, i.label)].filter(Boolean) : [h('span', { class: 'select-menu-placeholder' }, placeholder())]));
    }
    wrap.toggleAttribute('data-empty', !picked.length);
    const off = select.disabled;
    trigger.setAttribute('aria-disabled', String(off));
    trigger.tabIndex = off ? -1 : 0;
    if (clear) clear.hidden = !picked.length || off;
  };

  const setActive = (i, scroll = true) => {
    active = i;
    items.forEach((it, k) => it.el.toggleAttribute('data-active', k === i));
    const el = items[i] && items[i].el;
    const owner = search.isConnected && pop.open ? search : trigger;
    (owner === search ? trigger : search).removeAttribute('aria-activedescendant');
    if (el) {
      owner.setAttribute('aria-activedescendant', el.id);
      if (scroll && el.scrollIntoView) el.scrollIntoView({ block: 'nearest' });
    } else owner.removeAttribute('aria-activedescendant');
  };
  const shown = () => items.map((it, i) => (it.el.hidden ? null : i)).filter((i) => i !== null);
  const step = (d) => {
    const vis = shown().filter((i) => !items[i].disabled);
    if (!vis.length) return;
    const at = vis.indexOf(active);
    setActive(vis[at < 0 ? (d > 0 ? 0 : vis.length - 1) : Math.max(0, Math.min(vis.length - 1, at + d))]);
  };
  const edge = (last) => {
    const vis = shown().filter((i) => !items[i].disabled);
    if (vis.length) setActive(vis[last ? vis.length - 1 : 0]);
  };

  const pop = floating(popup, trigger, {
    matchWidth: true,
    fit: true,
    onClose: () => {
      trigger.setAttribute('aria-expanded', 'false');
      wrap.removeAttribute('data-open');
      trigger.removeAttribute('aria-activedescendant');
      items.forEach((it) => it.el.removeAttribute('data-active'));
    },
  });

  const filter = () => {
    const q = fold(search.value.trim());
    items.forEach((it) => { it.el.hidden = !!q && !fold(it.keywords).includes(q); });
    list.querySelectorAll('.select-menu-groupbox').forEach((g) => { g.hidden = !g.querySelector('.select-menu-option:not([hidden])'); });
    empty.hidden = items.some((it) => !it.el.hidden);
    const vis = shown().filter((i) => !items[i].disabled);
    setActive(vis.includes(active) ? active : vis.length ? vis[0] : -1);
    pop.place();
  };

  function open(at) {
    if (pop.open || select.disabled) return;
    search.value = '';
    items.forEach((it) => { it.el.hidden = false; });
    list.querySelectorAll('.select-menu-groupbox').forEach((g) => { g.hidden = false; });
    empty.hidden = !!items.length;
    pop.show();
    wrap.setAttribute('data-open', '');
    trigger.setAttribute('aria-expanded', 'true');
    const sel = items.findIndex((it) => it.option.selected && !it.disabled);
    if (at === 'first') edge(false);
    else if (at === 'last') edge(true);
    else if (typeof at === 'number' && at >= 0) setActive(at);
    else if (sel >= 0) setActive(sel);
    else edge(false);
    if (search.isConnected) search.focus({ preventScroll: true });
    pop.place();
  }
  function close(focus = true) {
    if (!pop.open) return;
    pop.close();
    if (focus) trigger.focus({ preventScroll: true });
  }

  function commit() {
    notify(select);
    render();
    emit(select, 'change', { value: multiple ? [...select.selectedOptions].map((o) => o.value) : select.value });
  }
  function choose(i) {
    const it = items[i];
    if (!it || it.disabled) return;
    if (multiple) return toggle(i);
    const changed = !it.option.selected;
    it.option.selected = true;
    close();
    if (changed) commit();
  }
  function toggle(i) {
    const it = items[i];
    if (!it || it.disabled) return;
    it.option.selected = !it.option.selected;
    commit();
    if (pop.open) setActive(i, false);
  }
  const clearAll = () => {
    if (multiple) [...select.options].forEach((o) => { o.selected = false; });
    else {
      const ph = placeholderOpt();
      if (ph) ph.selected = true;
      else select.selectedIndex = -1;
    }
    commit();
  };

  const onType = (key) => {
    const now = Date.now();
    typed = now - typedAt > 600 ? key : typed + key;
    typedAt = now;
    const from = active >= 0 ? active : Math.max(0, items.findIndex((it) => it.option.selected));
    const i = typeAhead(items, typed, from);
    if (i < 0) return;
    if (!pop.open) open(i);
    else setActive(i);
  };

  trigger.addEventListener('keydown', (e) => {
    if (select.disabled) return;
    const k = e.key;
    const isOpen = pop.open;
    if (k === 'Tab') {
      if (isOpen && !multiple && items[active]) choose(active);
      close(false);
      return;
    }
    if (!isOpen) {
      if (k === 'ArrowDown' || k === 'Enter' || k === ' ') open();
      else if (k === 'ArrowUp') open(e.altKey ? undefined : 'first');
      else if (k === 'Home') open('first');
      else if (k === 'End') open('last');
      else if (k === 'Backspace' && multiple) {
        const last = items.filter((it) => it.option.selected).pop();
        if (last) toggle(items.indexOf(last));
      } else if ((k === 'Delete' || k === 'Backspace') && clearable) clearAll();
      else if (k.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) onType(k);
      else return;
      e.preventDefault();
      return;
    }
    if (k === 'ArrowDown') step(1);
    else if (k === 'ArrowUp') (e.altKey ? choose(active) : step(-1));
    else if (k === 'Home') edge(false);
    else if (k === 'End') edge(true);
    else if (k === 'PageDown') step(10);
    else if (k === 'PageUp') step(-10);
    else if (k === 'Enter') choose(active);
    else if (k === ' ' && !(typed && Date.now() - typedAt < 600)) choose(active);
    else if (k === 'Escape') {
      e.stopPropagation();
      close();
    } else if (k.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) onType(k);
    else return;
    e.preventDefault();
  });
  search.addEventListener('input', filter);
  search.addEventListener('keydown', (e) => {
    const k = e.key;
    if (k === 'ArrowDown') step(1);
    else if (k === 'ArrowUp') step(-1);
    else if (k === 'PageDown') step(10);
    else if (k === 'PageUp') step(-10);
    else if (k === 'Enter') choose(active);
    else if (k === 'Escape') {
      e.stopPropagation();
      close();
    } else if (k === 'Tab') {
      e.preventDefault();
      close();
      return;
    } else return;
    e.preventDefault();
  });
  trigger.addEventListener('click', () => (pop.open ? close() : open()));
  trigger.addEventListener('blur', (e) => {
    if (pop.open && !wrap.contains(e.relatedTarget)) close(false);
  });
  search.addEventListener('blur', (e) => {
    if (pop.open && !wrap.contains(e.relatedTarget)) close(false);
  });
  list.addEventListener('pointerdown', (e) => e.preventDefault());
  list.addEventListener('click', (e) => {
    const el = e.target.closest('.select-menu-option');
    if (el) choose(items.findIndex((it) => it.el === el));
  });
  list.addEventListener('pointermove', (e) => {
    const el = e.target.closest('.select-menu-option');
    const i = el ? items.findIndex((it) => it.el === el) : -1;
    if (i >= 0 && i !== active && !items[i].disabled) setActive(i, false);
  });
  if (clear) {
    clear.addEventListener('click', () => {
      clearAll();
      trigger.focus();
    });
  }

  // Changes made to the native select from outside: events, new options,
  // disabled, and form resets.
  const onChange = () => render();
  select.addEventListener('change', onChange);
  trigger.addEventListener('focus', render);
  const mo = new MutationObserver(build);
  mo.observe(select, { childList: true, subtree: true, attributes: true, attributeFilter: ['disabled', 'label', 'selected', 'hidden'] });
  const form = select.form;
  const onReset = () => setTimeout(render);
  if (form) form.addEventListener('reset', onReset);
  build();

  const api = {
    open: () => open(),
    close: () => close(false),
    get value() { return multiple ? [...select.selectedOptions].map((o) => o.value) : select.value; },
    set value(v) {
      const want = [].concat(v).map(String);
      [...select.options].forEach((o) => { o.selected = want.includes(o.value); });
      commit();
    },
    refresh: build,
    get trigger() { return trigger; },
  };
  expose(select, 'select', api);
  expose(wrap, 'select', api);
  return () => {
    mo.disconnect();
    pop.close();
    if (form) form.removeEventListener('reset', onReset);
    select.removeEventListener('change', onChange);
    wrap.remove();
    select.hidden = false;
    select.removeAttribute('tabindex');
    select.removeAttribute('aria-hidden');
  };
});
