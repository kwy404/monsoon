// Sortable lists and kanban columns. Drag with a pointer, or with the
// keyboard: Space picks an item up, arrows move it, Space drops it and Escape
// puts it back. Lists that share data-m-sortable-group trade items.
//
//   <ul class="sortable" data-m-sortable data-m-sortable-group="board" aria-label="To do">
//     <li class="sortable-item">Write the brief</li>
//   </ul>
//
// Every direct child is an item. With a .sortable-handle inside, only the
// handle starts a pointer drag. Fires monsoon:sort with
// { item, from, to, oldIndex, newIndex }; call preventDefault() to undo.
import { define, emit } from '../core.mjs';
import { announce, clamp, expose, h, uid } from './combobox.mjs';

/** A copy of list with the entry at from moved to to. */
export function reorder(list, from, to) {
  const out = list.slice();
  out.splice(to, 0, ...out.splice(from, 1));
  return out;
}

/**
 * Where a dragged item lands among the other items, given their rects in
 * order and the pointer. Takes the closest rect, then before or after it
 * along the list axis.
 */
export function dropIndex(rects, point, axis = 'y', rtl = false) {
  if (!rects.length) return 0;
  let best = 0;
  let dist = Infinity;
  rects.forEach((r, i) => {
    const dx = Math.max(r.left - point.x, 0, point.x - (r.left + r.width));
    const dy = Math.max(r.top - point.y, 0, point.y - (r.top + r.height));
    if (dy * 1000 + dx < dist) [best, dist] = [i, dy * 1000 + dx];
  });
  const r = rects[best];
  const after = axis === 'y' ? point.y > r.top + r.height / 2 : (point.x > r.left + r.width / 2) !== rtl;
  return best + (after ? 1 : 0);
}

const lists = new Set();
// The keyboard grab is shared: a picked up item can move into another list.
let grab = null;
const itemsOf = (list) => [...list.children].filter((c) => !c.classList.contains('sortable-ghost') && !c.hidden);
const axisOf = (list) => {
  const cs = getComputedStyle(list);
  if (list.dataset.mSortableAxis) return list.dataset.mSortableAxis;
  return (cs.display.includes('flex') && !cs.flexDirection.startsWith('column')) || (cs.display.includes('grid') && cs.gridTemplateColumns.split(' ').length > 1) ? 'x' : 'y';
};
const nameOf = (list) => list.getAttribute('aria-label') || '';
const partners = (list) => [...lists].filter((l) => l === list || (list.dataset.mSortableGroup && l.dataset.mSortableGroup === list.dataset.mSortableGroup))
  .sort((a, b) => (a.compareDocumentPosition(b) & 4 ? -1 : 1));
const reduced = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Moves item to index in list, animating the items that shift (FLIP). */
function place(item, list, index) {
  const items = itemsOf(list).filter((i) => i !== item);
  const ref = items[index];
  if (item.parentElement === list && itemsOf(list).indexOf(item) === index) return false;
  const moving = [...new Set([...itemsOf(list), ...itemsOf(item.parentElement)])].filter((i) => i !== item);
  const before = new Map(moving.map((el) => [el, el.getBoundingClientRect()]));
  if (ref) list.insertBefore(item, ref);
  else if (items.length) items[items.length - 1].after(item);
  else list.append(item);
  if (!reduced() && item.animate) {
    for (const [el, r] of before) {
      const n = el.getBoundingClientRect();
      const dx = r.left - n.left;
      const dy = r.top - n.top;
      if (dx || dy) el.animate([{ translate: `${dx}px ${dy}px` }, { translate: '0 0' }], { duration: 180, easing: 'cubic-bezier(.2,.8,.2,1)' });
    }
  }
  return true;
}

const describe = (() => {
  let el;
  return () => {
    if (!el || !el.isConnected) {
      el = h('span', { class: 'sr-only', id: uid('sort-help') }, 'Press Space to pick up. Use the arrow keys to move, Space to drop and Escape to cancel.');
      document.body.append(el);
    }
    return el.id;
  };
})();

define('sortable', (list, opts) => {
  lists.add(list);
  list.setAttribute('role', list.getAttribute('role') || 'list');
  const prep = () => itemsOf(list).forEach((item) => {
    if (item.dataset.sortableReady) return;
    item.dataset.sortableReady = '';
    if (item.tabIndex < 0) item.tabIndex = 0;
    if (!item.getAttribute('role') && list.tagName !== 'UL' && list.tagName !== 'OL') item.setAttribute('role', 'listitem');
    item.setAttribute('aria-describedby', describe());
  });
  prep();
  const mo = new MutationObserver(prep);
  mo.observe(list, { childList: true });

  let drag = null;

  const finish = (item, from, oldIndex, cancel) => {
    const to = item.parentElement;
    const count = () => [from, to].forEach((l) => {
      const c = l.closest('.kanban-column')?.querySelector('.kanban-count');
      if (c) c.textContent = itemsOf(l).length;
    });
    const newIndex = itemsOf(to).indexOf(item);
    if (cancel || (to === from && newIndex === oldIndex)) {
      if (cancel) place(item, from, oldIndex);
      return false;
    }
    if (!emit(item, 'sort', { item, from, to, oldIndex, newIndex })) {
      place(item, from, oldIndex);
      return false;
    }
    count();
    return true;
  };

  const scrollParent = (el) => {
    for (let n = el; n && n !== document.body; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (/(auto|scroll)/.test(cs.overflowY + cs.overflowX) && (n.scrollHeight > n.clientHeight || n.scrollWidth > n.clientWidth)) return n;
    }
    return document.scrollingElement;
  };

  const autoScroll = () => {
    if (!drag || !drag.started) return;
    const { x, y } = drag.point;
    const target = scrollParent(drag.over || list);
    const r = target === document.scrollingElement ? { top: 0, left: 0, bottom: innerHeight, right: innerWidth } : target.getBoundingClientRect();
    const edge = 48;
    const speed = (d) => (d < edge ? Math.ceil((edge - d) / 4) : 0);
    const vy = speed(y - r.top) ? -speed(y - r.top) : speed(r.bottom - y);
    const vx = speed(x - r.left) ? -speed(x - r.left) : speed(r.right - x);
    if (vx || vy) {
      target.scrollBy(vx, vy);
      move();
    }
    drag.raf = requestAnimationFrame(autoScroll);
  };

  function move() {
    const { x, y } = drag.point;
    drag.ghost.style.translate = `${x - drag.dx}px ${y - drag.dy}px`;
    const under = document.elementFromPoint(x, y);
    const target = under && under.closest('[data-m-sortable]');
    if (!target || !partners(list).includes(target)) return;
    drag.over = target;
    const rects = itemsOf(target).filter((i) => i !== drag.item).map((i) => i.getBoundingClientRect());
    place(drag.item, target, dropIndex(rects, { x, y }, axisOf(target), getComputedStyle(target).direction === 'rtl'));
  }

  function start() {
    const { item } = drag;
    const r = item.getBoundingClientRect();
    drag.started = true;
    drag.dx = drag.point.x - r.left;
    drag.dy = drag.point.y - r.top;
    const ghost = item.cloneNode(true);
    ghost.removeAttribute('id');
    ghost.removeAttribute('data-m-sortable');
    ghost.removeAttribute('aria-describedby');
    ghost.setAttribute('aria-hidden', 'true');
    ghost.classList.add('sortable-ghost');
    ghost.style.width = `${r.width}px`;
    ghost.style.height = `${r.height}px`;
    if (ghost.showPopover) {
      ghost.popover = 'manual';
      item.after(ghost);
      ghost.showPopover();
    } else document.body.append(ghost);
    drag.ghost = ghost;
    item.setAttribute('data-dragging', '');
    document.documentElement.setAttribute('data-sorting', '');
    move();
    drag.raf = requestAnimationFrame(autoScroll);
  }

  function end(cancel) {
    if (!drag) return;
    const d = drag;
    drag = null;
    removeEventListener('pointermove', onMove);
    removeEventListener('pointerup', onUp);
    removeEventListener('pointercancel', onCancel);
    removeEventListener('keydown', onEsc, true);
    if (!d.started) return;
    cancelAnimationFrame(d.raf);
    d.item.removeAttribute('data-dragging');
    document.documentElement.removeAttribute('data-sorting');
    finish(d.item, d.from, d.oldIndex, cancel);
    const r = d.item.getBoundingClientRect();
    const g = d.ghost;
    if (g.animate && !reduced()) {
      g.animate([{ translate: g.style.translate }, { translate: `${r.left}px ${r.top}px` }], { duration: 160, easing: 'ease-out' }).onfinish = () => g.remove();
    } else g.remove();
  }

  const onMove = (e) => {
    drag.point = { x: e.clientX, y: e.clientY };
    if (!drag.started) {
      if (Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0) < 5) return;
      start();
    }
    e.preventDefault();
    move();
  };
  const onUp = () => end(false);
  const onCancel = () => end(true);
  const onEsc = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      end(true);
    }
  };

  const onDown = (e) => {
    if (e.button !== 0 || drag || grab || list.hasAttribute('data-disabled')) return;
    const item = e.target.closest('[data-m-sortable] > *');
    if (!item || item.parentElement !== list) return;
    const handle = item.querySelector('.sortable-handle');
    if (handle ? !e.target.closest('.sortable-handle') : e.target.closest('input, textarea, select, button, a, [contenteditable]')) return;
    if (e.pointerType === 'mouse') e.preventDefault();
    drag = { item, from: list, oldIndex: itemsOf(list).indexOf(item), x0: e.clientX, y0: e.clientY, point: { x: e.clientX, y: e.clientY } };
    addEventListener('pointermove', onMove, { passive: false });
    addEventListener('pointerup', onUp);
    addEventListener('pointercancel', onCancel);
    addEventListener('keydown', onEsc, true);
  };

  // Keyboard: only when the item itself has focus, so controls inside still work.
  const onKey = (e) => {
    const item = e.target;
    if (item.parentElement !== list) return;
    const key = e.key;
    if (!grab) {
      if (key !== ' ' && key !== 'Enter') return;
      e.preventDefault();
      grab = { item, from: list, oldIndex: itemsOf(list).indexOf(item) };
      item.setAttribute('aria-grabbed', 'true');
      item.setAttribute('data-grabbed', '');
      const n = itemsOf(list).length;
      announce(`Picked up ${item.textContent.trim()}. Position ${grab.oldIndex + 1} of ${n}${nameOf(list) ? ` in ${nameOf(list)}` : ''}.`);
      return;
    }
    const drop = (cancel) => {
      const g = grab;
      grab = null;
      g.item.removeAttribute('aria-grabbed');
      g.item.removeAttribute('data-grabbed');
      const ok = finish(g.item, g.from, g.oldIndex, cancel);
      g.item.focus();
      announce(cancel ? 'Move cancelled.' : ok ? `Dropped at position ${itemsOf(g.item.parentElement).indexOf(g.item) + 1}.` : 'Dropped.');
    };
    if (key === ' ' || key === 'Enter') {
      e.preventDefault();
      drop(false);
      return;
    }
    if (key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      drop(true);
      return;
    }
    const axis = axisOf(list);
    const rtl = getComputedStyle(list).direction === 'rtl';
    const along = axis === 'y' ? { ArrowUp: -1, ArrowDown: 1 } : { ArrowLeft: rtl ? 1 : -1, ArrowRight: rtl ? -1 : 1 };
    const across = axis === 'y' ? { ArrowLeft: rtl ? 1 : -1, ArrowRight: rtl ? -1 : 1 } : { ArrowUp: -1, ArrowDown: 1 };
    let target = list;
    let index = itemsOf(list).indexOf(item);
    if (key in along) index = clamp(index + along[key], 0, itemsOf(list).length - 1);
    else if (key in across) {
      const group = partners(list);
      target = group[group.indexOf(list) + across[key]];
      if (!target) return;
      index = Math.min(index, itemsOf(target).length);
    } else if (key === 'Home' || key === 'End') index = key === 'Home' ? 0 : itemsOf(list).length - 1;
    else return;
    e.preventDefault();
    grab.moving = true;
    place(item, target, index);
    item.focus();
    grab.moving = false;
    if (item.scrollIntoView) item.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    announce(`Position ${itemsOf(target).indexOf(item) + 1} of ${itemsOf(target).length}${target !== list && nameOf(target) ? ` in ${nameOf(target)}` : ''}.`);
  };
  const onBlur = (e) => {
    if (grab && !grab.moving && e.target === grab.item) {
      const g = grab;
      grab = null;
      g.item.removeAttribute('aria-grabbed');
      g.item.removeAttribute('data-grabbed');
      finish(g.item, g.from, g.oldIndex, false);
    }
  };

  list.addEventListener('pointerdown', onDown);
  list.addEventListener('keydown', onKey);
  list.addEventListener('focusout', onBlur);
  expose(list, 'sortable', {
    get items() { return itemsOf(list); },
    move: (item, index, to = list) => {
      const from = item.parentElement;
      const oldIndex = itemsOf(from).indexOf(item);
      place(item, to, index);
      return finish(item, from, oldIndex, false);
    },
  });
  return () => {
    lists.delete(list);
    mo.disconnect();
    end(true);
    list.removeEventListener('pointerdown', onDown);
  };
});
