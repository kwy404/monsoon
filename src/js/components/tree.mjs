// Tree view over nested lists, following the WAI-ARIA tree pattern: arrows
// move, Right expands, Left collapses or goes to the parent, Home and End,
// type ahead, * expands siblings, Enter or Space selects (or checks).
//
//   <ul class="tree" data-m-tree aria-label="Files">
//     <li data-open>src<ul><li>index.js</li></ul></li>
//   </ul>
//
// data-open starts a branch expanded. data-m-tree-checkbox adds tristate
// checkboxes: checking a branch checks everything below it and a branch with
// some checked children shows as mixed.
import { define, emit } from '../core.mjs';
import { expose, h } from './combobox.mjs';

/** Tristate value of a branch from its children's states. */
export function aggregate(states) {
  if (!states.length) return 'false';
  if (states.every((s) => s === 'true')) return 'true';
  if (states.every((s) => s === 'false')) return 'false';
  return 'mixed';
}

const groupOf = (li) => [...li.children].find((c) => c.tagName === 'UL' || c.tagName === 'OL');
const parentItem = (li) => li.parentElement.closest('[role=treeitem]');

define('tree', (tree, opts) => {
  const checkable = opts.checkbox !== undefined;
  const multi = tree.getAttribute('aria-multiselectable') === 'true';
  tree.setAttribute('role', 'tree');
  if (checkable) tree.setAttribute('aria-multiselectable', 'true');

  const setup = (list, level) => {
    for (const li of [...list.children].filter((c) => c.tagName === 'LI')) {
      const group = groupOf(li);
      li.setAttribute('role', 'treeitem');
      li.setAttribute('aria-level', level);
      li.tabIndex = -1;
      if (!li.querySelector(':scope > .tree-row')) {
        const label = [...li.childNodes].filter((n) => n !== group);
        const row = h('span', { class: 'tree-row' },
          h('span', { class: 'tree-toggle', 'aria-hidden': 'true' }),
          checkable ? h('span', { class: 'tree-check', 'aria-hidden': 'true' }) : null,
          h('span', { class: 'tree-label' }, ...label.filter((n) => n.nodeType !== 3 || n.textContent.trim())));
        li.prepend(row);
      }
      if (checkable && !li.hasAttribute('aria-checked')) li.setAttribute('aria-checked', li.hasAttribute('data-checked') ? 'true' : 'false');
      if (group) {
        group.setAttribute('role', 'group');
        if (!li.hasAttribute('aria-expanded')) li.setAttribute('aria-expanded', String(li.hasAttribute('data-open')));
        setup(group, level + 1);
      }
    }
  };
  setup(tree, 1);

  const all = () => [...tree.querySelectorAll('[role=treeitem]')];
  const visible = () => all().filter((li) => {
    for (let p = parentItem(li); p; p = parentItem(p)) if (p.getAttribute('aria-expanded') !== 'true') return false;
    return true;
  });
  const text = (li) => li.querySelector(':scope > .tree-row .tree-label').textContent.trim();
  const value = (li) => li.dataset.value || text(li);

  const focusItem = (li) => {
    if (!li) return;
    all().forEach((x) => { x.tabIndex = x === li ? 0 : -1; });
    li.focus();
  };
  const expand = (li, open) => {
    if (!groupOf(li) || (li.getAttribute('aria-expanded') === 'true') === open) return;
    li.setAttribute('aria-expanded', String(open));
    emit(li, 'tree-toggle', { item: li, expanded: open, value: value(li) });
  };
  const select = (li) => {
    if (multi) li.setAttribute('aria-selected', String(li.getAttribute('aria-selected') !== 'true'));
    else {
      all().forEach((x) => x.removeAttribute('aria-selected'));
      li.setAttribute('aria-selected', 'true');
    }
    emit(li, 'tree-select', { item: li, value: value(li) });
  };

  // Tristate: set a branch and everything below it, then fix the ancestors.
  const refreshUp = (li) => {
    for (let p = parentItem(li); p; p = parentItem(p)) {
      p.setAttribute('aria-checked', aggregate([...groupOf(p).children].filter((c) => c.getAttribute('role') === 'treeitem').map((c) => c.getAttribute('aria-checked'))));
    }
  };
  const toggleCheck = (li) => {
    const next = li.getAttribute('aria-checked') === 'true' ? 'false' : 'true';
    [li, ...li.querySelectorAll('[role=treeitem]')].forEach((x) => x.setAttribute('aria-checked', next));
    refreshUp(li);
    emit(li, 'tree-check', { item: li, checked: all().filter((x) => x.getAttribute('aria-checked') === 'true' && !groupOf(x)).map(value) });
  };
  const leaves = all().filter((li) => !groupOf(li));
  if (checkable) leaves.forEach(refreshUp);
  const activate = (li) => (checkable ? toggleCheck(li) : select(li));

  const start = tree.querySelector('[aria-selected=true]') || all()[0];
  if (start) start.tabIndex = 0;

  let typed = '';
  let typedAt = 0;
  tree.addEventListener('keydown', (e) => {
    const li = e.target.closest('[role=treeitem]');
    if (!li || e.altKey || e.ctrlKey || e.metaKey) return;
    const items = visible();
    const i = items.indexOf(li);
    const open = li.getAttribute('aria-expanded');
    const rtl = getComputedStyle(tree).direction === 'rtl';
    const key = rtl && e.key === 'ArrowLeft' ? 'ArrowRight' : rtl && e.key === 'ArrowRight' ? 'ArrowLeft' : e.key;
    let handled = true;
    if (key === 'ArrowDown') focusItem(items[i + 1]);
    else if (key === 'ArrowUp') focusItem(items[i - 1]);
    else if (key === 'Home') focusItem(items[0]);
    else if (key === 'End') focusItem(items[items.length - 1]);
    else if (key === 'ArrowRight') {
      if (open === 'false') expand(li, true);
      else if (open === 'true') focusItem(items[i + 1]);
    } else if (key === 'ArrowLeft') {
      if (open === 'true') expand(li, false);
      else focusItem(parentItem(li));
    } else if (key === 'Enter' || key === ' ') activate(li);
    else if (key === '*') [...li.parentElement.children].forEach((s) => s.getAttribute('role') === 'treeitem' && expand(s, true));
    else if (key.length === 1 && /\S/.test(key)) {
      typed = Date.now() - typedAt > 600 ? key.toLowerCase() : typed + key.toLowerCase();
      typedAt = Date.now();
      const order = [...items.slice(i + 1), ...items.slice(0, i + 1)];
      focusItem(order.find((x) => text(x).toLowerCase().startsWith(typed)) || order.find((x) => text(x).toLowerCase().startsWith(typed[0])));
    } else handled = false;
    if (handled) {
      e.preventDefault();
      e.stopPropagation();
    }
  });
  tree.addEventListener('click', (e) => {
    const row = e.target.closest('.tree-row');
    if (!row || !tree.contains(row)) return;
    const li = row.parentElement;
    focusItem(li);
    if (e.target.closest('.tree-toggle')) expand(li, li.getAttribute('aria-expanded') !== 'true');
    else if (checkable && !e.target.closest('.tree-check') && groupOf(li)) expand(li, li.getAttribute('aria-expanded') !== 'true');
    else {
      activate(li);
      if (!checkable && groupOf(li)) expand(li, li.getAttribute('aria-expanded') !== 'true');
    }
  });

  expose(tree, 'tree', {
    expand: (li) => expand(li, true),
    collapse: (li) => expand(li, false),
    expandAll: () => all().forEach((li) => expand(li, true)),
    collapseAll: () => all().forEach((li) => expand(li, false)),
    get checked() { return all().filter((x) => x.getAttribute('aria-checked') === 'true' && !groupOf(x)).map(value); },
    get selected() { return all().filter((x) => x.getAttribute('aria-selected') === 'true').map(value); },
  });
});
