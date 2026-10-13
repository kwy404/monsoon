// Media gallery: <div class="gallery" data-m-media-gallery><ul class="gallery-list">
// <li class="gallery-item"><a href="large.jpg"><img ...></a><label class="gallery-check">
// <input type="checkbox" name="media" value="1"></label></li>...</ul></div>.
// Without the script the links open the images and the checkboxes submit.
// With it: a selection bar, shift click ranges, select all, delete, drag (or
// Alt and arrow keys) to reorder, and the image viewer on click.
import { define, emit } from '../core.mjs';
import { createViewer } from './image-viewer.mjs';
import { ICONS, announcer, expose, h, icon, shift, sortable } from './dropzone.mjs';

/** Sets every index between anchor and index (both included) to value. */
export function selectRange(checked, anchor, index, value) {
  const out = [...checked];
  const [a, b] = anchor <= index ? [anchor, index] : [index, anchor];
  for (let i = Math.max(0, a); i <= b && i < out.length; i++) out[i] = value;
  return out;
}

const ITEM = '.gallery-item';
const instances = new WeakMap();
export const mediaGallery = expose('mediaGallery', instances);

define('media-gallery', (el, o) => {
  const list = el.querySelector('.gallery-list') || el;
  const items = () => [...list.querySelectorAll(`:scope > ${ITEM}`)];
  const box = (it) => it.querySelector('input[type=checkbox]');
  const value = (it) => (box(it) ? box(it).value : it.dataset.id);
  const say = announcer(el);
  let anchor = -1;

  const count = h('span', { class: 'gallery-count' });
  const allBtn = h('button', { type: 'button', class: 'btn btn-ghost btn-sm', onclick: () => setAll(true) }, 'Select all');
  const noneBtn = h('button', { type: 'button', class: 'btn btn-ghost btn-sm', onclick: () => setAll(false) }, 'Clear');
  const delBtn = h('button', { type: 'button', class: 'btn btn-soft btn-danger btn-sm', html: `${icon(ICONS.trash)}<span>Delete</span>`, onclick: () => remove() });
  const bar = h('div', { class: 'gallery-bar', role: 'toolbar', 'aria-label': 'Selection' }, count, h('div', { class: 'gallery-actions' }, allBtn, noneBtn, delBtn));
  el.prepend(bar);
  el.dataset.enhanced = '';

  const selected = () => items().filter((it) => box(it) && box(it).checked);
  const update = (notify = true) => {
    const all = items();
    const n = selected().length;
    count.textContent = n ? `${n} selected` : `${all.length} ${all.length === 1 ? 'item' : 'items'}`;
    noneBtn.hidden = !n;
    delBtn.disabled = !n;
    allBtn.hidden = n === all.length;
    el.toggleAttribute('data-selecting', n > 0);
    if (notify) emit(el, 'gallery-select', { items: selected(), values: selected().map(value) });
  };
  const setAll = (on) => {
    items().forEach((it) => { if (box(it)) box(it).checked = on; });
    anchor = -1;
    update();
    say(on ? 'All items selected' : 'Selection cleared');
  };
  const select = (it, on, range) => {
    const all = items();
    const i = all.indexOf(it);
    if (range && anchor >= 0) {
      const next = selectRange(all.map((x) => box(x) && box(x).checked), anchor, i, on);
      all.forEach((x, k) => { if (box(x)) box(x).checked = next[k]; });
    } else if (box(it)) box(it).checked = on;
    anchor = i;
    update();
  };
  const remove = () => {
    const sel = selected();
    if (!sel.length || !emit(el, 'gallery-delete', { items: sel, values: sel.map(value) })) return;
    const focusNext = items().find((it, k, all) => !sel.includes(it) && k > all.indexOf(sel[0])) || items().find((it) => !sel.includes(it));
    sel.forEach((it) => it.remove());
    anchor = -1;
    update();
    say(`${sel.length} ${sel.length === 1 ? 'item' : 'items'} deleted`);
    (focusNext ? focusNext.querySelector('a, input') : allBtn).focus();
  };

  // Capture phase so a click that selects never reaches the viewer.
  const onClick = (e) => {
    const it = e.target.closest(ITEM);
    if (!it || !list.contains(it)) return;
    const cb = box(it);
    if (cb && e.target === cb) return select(it, cb.checked, e.shiftKey);
    if (cb && e.target.closest('a') && (el.hasAttribute('data-selecting') || e.ctrlKey || e.metaKey || e.shiftKey)) {
      e.preventDefault();
      select(it, !cb.checked, e.shiftKey);
    }
  };
  const onKey = (e) => {
    const it = e.target.closest(ITEM);
    if (e.key === 'Escape' && el.hasAttribute('data-selecting')) { e.preventDefault(); return setAll(false); }
    if ((e.key === 'Delete' || (e.key === 'Backspace' && e.target.type !== 'text')) && selected().length && it) { e.preventDefault(); return remove(); }
    const delta = { ArrowLeft: -1, ArrowUp: -1, ArrowRight: 1, ArrowDown: 1 }[e.key];
    if (!it || !e.altKey || !delta) return;
    e.preventDefault();
    const active = document.activeElement;
    const moved = shift(list, it, delta, ITEM);
    active.focus();
    if (moved) { reorder(...moved); say(`Moved to position ${moved[1] + 1} of ${items().length}`); }
  };
  const reorder = (from, to) => emit(el, 'gallery-reorder', { from, to, order: items().map(value) });

  list.addEventListener('click', onClick, true);
  el.addEventListener('keydown', onKey);
  const offSort = sortable(list, { item: ITEM, longPress: true, onEnd: reorder });
  const viewer = o.viewer === 'false' ? null : createViewer(list, { selector: `${ITEM} a[href]`, loop: o.loop, thumbs: o.thumbs });
  update(false);

  instances.set(el, {
    get selected() { return selected(); },
    get values() { return selected().map(value); },
    selectAll: () => setAll(true),
    clear: () => setAll(false),
    delete: remove,
    viewer,
  });

  return () => {
    list.removeEventListener('click', onClick, true);
    el.removeEventListener('keydown', onKey);
    offSort();
    if (viewer) viewer.destroy();
    bar.remove();
    delete el.dataset.enhanced;
    instances.delete(el);
  };
});
