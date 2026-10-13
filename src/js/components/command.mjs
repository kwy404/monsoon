// Command palette: filters the .command-palette-item entries as you type,
// moves the selection with the arrow keys and runs the item on Enter.
//
//   <dialog class="modal modal-top" id="palette">
//     <div class="command-palette" data-m-command data-m-command-hotkey="mod+k">...</div>
//   </dialog>
//
// An item matches its text and its data-keywords. Headings hide with their
// items. Options: -hotkey ("mod+k" is Ctrl K, or Cmd K on a Mac), -empty.
// Fires monsoon:command with { item, value }; preventDefault() keeps the
// palette open and skips the click.
import { define, emit } from '../core.mjs';
import { expose, fold, h, uid } from './combobox.mjs';

/** True when a keydown event matches a shortcut such as "mod+k" or "ctrl+shift+p". */
export function matchesHotkey(e, spec) {
  const parts = spec.toLowerCase().split('+');
  const key = parts.pop();
  const mac = typeof navigator !== 'undefined' && /mac|iphone|ipad/i.test(navigator.platform || navigator.userAgent);
  const want = {
    ctrl: parts.includes('ctrl') || (parts.includes('mod') && !mac),
    meta: parts.includes('meta') || parts.includes('cmd') || (parts.includes('mod') && mac),
    shift: parts.includes('shift'),
    alt: parts.includes('alt'),
  };
  return (e.key || '').toLowerCase() === key && e.ctrlKey === want.ctrl && e.metaKey === want.meta && e.shiftKey === want.shift && e.altKey === want.alt;
}

define('command', (root, opts) => {
  const input = root.querySelector('.command-palette-input, input');
  const list = root.querySelector('.command-palette-list');
  if (!input || !list) return;
  const dialog = root.closest('dialog');
  list.id = list.id || uid('commands');
  list.setAttribute('role', 'listbox');
  Object.entries({ role: 'combobox', 'aria-expanded': 'true', 'aria-controls': list.id, 'aria-autocomplete': 'list', autocomplete: 'off' })
    .forEach(([k, v]) => input.setAttribute(k, v));
  if (!input.getAttribute('aria-label')) input.setAttribute('aria-label', input.placeholder || 'Search commands');
  let empty = root.querySelector('.command-palette-empty');
  if (!empty) {
    empty = h('p', { class: 'command-palette-empty', role: 'presentation' }, opts.empty || 'No results found.');
    list.append(empty);
  }
  const items = () => [...list.querySelectorAll('.command-palette-item')];
  items().forEach((item) => {
    item.id = item.id || uid('cmd');
    item.setAttribute('role', 'option');
    item.tabIndex = -1;
  });
  const shown = () => items().filter((i) => !i.hidden);
  let active = null;

  const setActive = (item) => {
    items().forEach((i) => i.setAttribute('aria-selected', String(i === item)));
    active = item || null;
    if (item) {
      input.setAttribute('aria-activedescendant', item.id);
      if (item.scrollIntoView) item.scrollIntoView({ block: 'nearest' });
    } else input.removeAttribute('aria-activedescendant');
  };

  const filter = () => {
    const q = fold(input.value.trim());
    items().forEach((item) => {
      const shortcut = item.querySelector('.command-palette-shortcut');
      const text = fold(`${item.textContent.replace(shortcut ? shortcut.textContent : '', '')} ${item.dataset.keywords || ''}`);
      item.hidden = !!q && !q.split(/\s+/).every((w) => text.includes(w));
    });
    let heading = null;
    let any = false;
    for (const el of list.children) {
      if (el.classList.contains('command-palette-heading')) {
        if (heading) heading.hidden = !any;
        heading = el;
        any = false;
      } else if (el.classList.contains('command-palette-item') && !el.hidden) any = true;
      else if (el.querySelector && el.querySelector('.command-palette-item:not([hidden])')) any = true;
    }
    if (heading) heading.hidden = !any;
    empty.hidden = shown().length > 0;
    setActive(shown()[0]);
  };

  const run = (item) => {
    if (!item) return;
    if (!emit(item, 'command', { item, value: item.dataset.value || item.textContent.trim() })) return;
    if (dialog && dialog.open) dialog.close();
    item.click();
  };

  input.addEventListener('input', filter);
  input.addEventListener('keydown', (e) => {
    const all = shown();
    const i = all.indexOf(active);
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (all.length) setActive(all[(i + (e.key === 'ArrowDown' ? 1 : -1) + all.length) % all.length]);
    } else if ((e.key === 'Home' || e.key === 'End') && e.ctrlKey) {
      e.preventDefault();
      setActive(e.key === 'Home' ? all[0] : all[all.length - 1]);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      run(active);
    }
  });
  list.addEventListener('pointermove', (e) => {
    const item = e.target.closest('.command-palette-item');
    if (item && item !== active) setActive(item);
  });
  list.addEventListener('click', (e) => {
    const item = e.target.closest('.command-palette-item');
    if (item && e.isTrusted && !emit(item, 'command', { item, value: item.dataset.value || item.textContent.trim() })) e.preventDefault();
    else if (item && dialog && dialog.open) dialog.close();
  });
  const reset = () => {
    input.value = '';
    filter();
  };
  if (dialog) dialog.addEventListener('close', reset);

  const open = () => {
    if (!dialog) return input.focus();
    if (!dialog.open) dialog.showModal();
    reset();
    input.focus();
  };
  const onHotkey = (e) => {
    if (!opts.hotkey || !matchesHotkey(e, opts.hotkey)) return;
    e.preventDefault();
    if (dialog && dialog.open) dialog.close();
    else open();
  };
  document.addEventListener('keydown', onHotkey);
  filter();
  expose(root, 'command', { open, close: () => dialog && dialog.close(), filter: (q) => { input.value = q; filter(); } });
  return () => document.removeEventListener('keydown', onHotkey);
});
