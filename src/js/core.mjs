// Monsoon interactive layer: optional behavior for the few components that
// cannot be done in CSS alone (file drop, image crop, sortable lists, ...).
// Each component module calls define() once. Elements are enhanced from
// data attributes, on load and whenever matching markup is added later.

const registry = new Map();
const instances = new WeakMap();
let observer = null;

/**
 * Registers a component.
 * @param {string} name Component name, also the data attribute: data-m-<name>.
 * @param {(el: HTMLElement, options: Record<string, string>) => (void | (() => void))} setup
 *   Enhances one element. May return a cleanup function.
 */
export function define(name, setup) {
  if (registry.has(name)) throw new Error(`monsoon: component "${name}" is already defined`);
  registry.set(name, setup);
  if (typeof document !== 'undefined' && document.readyState !== 'loading') {
    enhance(document, [name]);
  }
}

/** Options from data-m-<name>-<option> attributes, in camelCase. */
export function readOptions(el, name) {
  const prefix = `m${name.replace(/(^|-)(\w)/g, (_, __, c) => c.toUpperCase())}`;
  const out = {};
  for (const [key, value] of Object.entries(el.dataset)) {
    if (key.startsWith(prefix) && key !== prefix) {
      const opt = key.slice(prefix.length);
      out[opt.charAt(0).toLowerCase() + opt.slice(1)] = value;
    }
  }
  return out;
}

/** Enhances every matching element under root (defaults to the document). */
export function enhance(root = document, names = [...registry.keys()]) {
  for (const name of names) {
    const setup = registry.get(name);
    const selector = `[data-m-${name}]`;
    const els = [];
    if (root.nodeType === 1 && root.matches(selector)) els.push(root);
    if (root.querySelectorAll) els.push(...root.querySelectorAll(selector));
    for (const el of els) {
      let map = instances.get(el);
      if (!map) instances.set(el, (map = new Map()));
      if (map.has(name)) continue;
      const cleanup = setup(el, readOptions(el, name));
      map.set(name, typeof cleanup === 'function' ? cleanup : () => {});
    }
  }
}

/** Runs the cleanup of every component on el and its descendants. */
export function destroy(root) {
  const els = [root, ...(root.querySelectorAll ? root.querySelectorAll('*') : [])];
  for (const el of els) {
    const map = instances.get(el);
    if (!map) continue;
    for (const cleanup of map.values()) cleanup();
    instances.delete(el);
  }
}

/** Starts automatic enhancement. Called by the bundle on load. */
export function start() {
  if (typeof document === 'undefined' || observer) return;
  const run = () => {
    enhance(document);
    observer = new MutationObserver((records) => {
      for (const r of records) {
        for (const node of r.addedNodes) if (node.nodeType === 1) enhance(node);
        for (const node of r.removedNodes) if (node.nodeType === 1) destroy(node);
      }
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, { once: true });
  else run();
}

/** Dispatches a bubbling, namespaced event: monsoon:<name>. */
export function emit(el, name, detail) {
  return el.dispatchEvent(new CustomEvent(`monsoon:${name}`, { bubbles: true, cancelable: true, detail }));
}

export const components = () => [...registry.keys()];
