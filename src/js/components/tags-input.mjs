// Tags input: chips over a plain text input that keeps a comma separated
// value, so the form still submits without the script.
//
//   <div class="tags-input" data-m-tags-input data-m-tags-input-max="5">
//     <input class="input" name="tags" value="design, css" aria-label="Tags">
//   </div>
//
// Enter or comma adds, Backspace on an empty field removes the last tag and a
// pasted list is split on commas, semicolons and new lines. Options: -max,
// -suggestions ("css,html,js" or the input's datalist), -separator.
import { define, emit } from '../core.mjs';
import { announce, expose, filterItems, floating, fold, h, highlight, notify, uid } from './combobox.mjs';

export const splitTags = (text, sep = ',') => text.split(new RegExp(`[${sep.replace(/[\]\\^-]/g, '\\$&')};\\n\\t]+`)).map((t) => t.trim()).filter(Boolean);

define('tags-input', (root, opts) => {
  const source = root.querySelector('input');
  if (!source) return;
  const sep = opts.separator || ',';
  const max = +opts.max || Infinity;
  const datalist = source.list;
  const suggestions = opts.suggestions ? splitTags(opts.suggestions) : datalist ? [...datalist.options].map((o) => o.value) : [];
  let tags = [];
  let view = [];
  let active = -1;
  const listId = uid('tags');
  const field = h('input', {
    type: 'text',
    class: 'tags-input-field',
    autocomplete: 'off',
    enterkeyhint: 'enter',
    placeholder: source.placeholder || null,
    'aria-label': source.getAttribute('aria-label') || null,
    'aria-describedby': source.getAttribute('aria-describedby'),
  });
  if (suggestions.length) {
    Object.entries({ role: 'combobox', 'aria-autocomplete': 'list', 'aria-expanded': 'false', 'aria-controls': listId })
      .forEach(([k, v]) => field.setAttribute(k, v));
  }
  const label = source.labels && source.labels[0];
  if (label) label.htmlFor = field.id = uid('tag-field');
  source.removeAttribute('list');
  source.hidden = true;
  source.tabIndex = -1;
  const chips = h('span', { class: 'tags-input-tags', role: 'list' });
  const list = h('ul', { class: 'combobox-list', role: 'listbox', id: listId });
  root.append(chips, field, list);
  const pop = floating(list, root, { matchWidth: true, onClose: () => field.setAttribute('aria-expanded', 'false') });
  root.addEventListener('click', (e) => e.target === root && field.focus());

  const sync = (silent) => {
    source.value = tags.join(sep === ',' ? ', ' : sep);
    chips.replaceChildren(...tags.map((t, i) => h('span', { class: 'tags-input-tag', role: 'listitem' }, t,
      h('button', {
        type: 'button',
        class: 'tags-input-remove',
        'aria-label': `Remove ${t}`,
        onclick: () => {
          remove(i);
          field.focus();
        },
      }))));
    root.toggleAttribute('data-full', tags.length >= max);
    field.disabled = source.disabled;
    if (silent) return;
    notify(source);
    emit(root, 'change', { tags: tags.slice() });
  };

  function add(text) {
    const tag = text.trim();
    if (!tag) return false;
    const dup = tags.findIndex((t) => fold(t) === fold(tag));
    if (dup >= 0) {
      const chip = chips.children[dup];
      chip.removeAttribute('data-flash');
      void chip.offsetWidth;
      chip.setAttribute('data-flash', '');
      return false;
    }
    if (tags.length >= max) {
      announce(`You can add up to ${max} tags`);
      return false;
    }
    if (!emit(root, 'tag-add', { tag })) return false;
    tags.push(tag);
    sync();
    announce(`Added ${tag}`);
    return true;
  }

  function remove(i) {
    const [tag] = tags.splice(i, 1);
    if (tag === undefined) return;
    sync();
    emit(root, 'tag-remove', { tag });
    announce(`Removed ${tag}`);
  }

  const setActive = (i) => {
    active = i;
    [...list.children].forEach((li, n) => li.toggleAttribute('data-active', n === i));
    if (list.children[i]) field.setAttribute('aria-activedescendant', list.children[i].id);
    else field.removeAttribute('aria-activedescendant');
  };
  const suggest = () => {
    if (!suggestions.length) return;
    const q = field.value.trim();
    view = filterItems(suggestions.filter((s) => !tags.some((t) => fold(t) === fold(s))).map((s) => ({ value: s, label: s })), q).slice(0, 8);
    if (!view.length || !q && document.activeElement !== field) {
      pop.close();
      return;
    }
    list.replaceChildren(...view.map((item, i) => h('li', {
      class: 'combobox-option',
      role: 'option',
      id: `${listId}-${i}`,
      'aria-selected': 'false',
      onpointerdown: (e) => e.preventDefault(),
      onclick: () => pick(item.value),
    }, h('span', {}, highlight(item.label, item.range)))));
    setActive(q ? 0 : -1);
    pop.show();
    field.setAttribute('aria-expanded', 'true');
  };
  const pick = (value) => {
    add(value);
    field.value = '';
    suggest();
  };
  const takeAll = (text) => {
    splitTags(text, sep).forEach(add);
    field.value = '';
  };

  field.addEventListener('keydown', (e) => {
    if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && view.length) {
      e.preventDefault();
      if (!pop.open) suggest();
      else setActive((active + (e.key === 'ArrowDown' ? 1 : -1) + view.length) % view.length);
    } else if (e.key === 'Enter' || e.key === sep) {
      if (e.key === 'Enter' && !field.value && !pop.open) return;
      e.preventDefault();
      if (pop.open && view[active]) pick(view[active].value);
      else {
        takeAll(field.value);
        suggest();
      }
    } else if (e.key === 'Backspace' && !field.value && field.selectionStart === 0) {
      remove(tags.length - 1);
    } else if (e.key === 'Escape' && pop.open) {
      e.stopPropagation();
      pop.close();
    }
  });
  field.addEventListener('input', () => {
    if (field.value.includes(sep)) {
      const parts = field.value.split(sep);
      const rest = parts.pop();
      takeAll(parts.join(sep));
      field.value = rest;
    }
    suggest();
  });
  field.addEventListener('focus', suggest);
  field.addEventListener('paste', (e) => {
    const text = (e.clipboardData || window.clipboardData).getData('text');
    if (!/[,;\n\t]/.test(text)) return;
    e.preventDefault();
    takeAll(field.value + text);
  });
  field.addEventListener('blur', () => {
    pop.close();
    if (opts.addOnBlur !== 'false') takeAll(field.value);
  });

  tags = splitTags(source.value, sep);
  sync(true);
  expose(root, 'tagsInput', {
    get tags() { return tags.slice(); },
    set tags(next) {
      tags = [...next];
      sync();
    },
    add,
    remove: (tag) => remove(tags.indexOf(tag)),
    clear() {
      tags = [];
      sync();
    },
  });
  return () => pop.close();
});
