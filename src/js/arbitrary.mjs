// Monsoon arbitrary values at runtime: bg-[#0ea5e9], w-[37px], md:grid-cols-[1fr_2fr]
// and friends work with no build step. On load, and for every class change
// after that, the engine reads class attributes, compiles the arbitrary value
// classes it has not seen yet with the same parser the purge CLI uses, and
// writes the rules into one constructed stylesheet (a <style> element where
// adoptedStyleSheets is not available). Rules are kept in the order of the
// static stylesheet: plain classes first, then variants, breakpoints from
// small to large, then container and media variants.
//
// Production builds can drop this script: "monsooncss purge" writes the same
// rules into the purged stylesheet.
import { compileClass, ruleCss } from '../arbitrary/index.mjs';

const seen = new Map(); // class -> true when it produced rules, false otherwise
const ranks = []; // rank of every rule in the sheet, in sheet order
let sheet = null;
let styleEl = null;
let observer = null;

function ensureSheet(doc) {
  if (sheet) return sheet;
  try {
    if ('adoptedStyleSheets' in doc && typeof CSSStyleSheet === 'function') {
      sheet = new CSSStyleSheet();
      doc.adoptedStyleSheets = [...doc.adoptedStyleSheets, sheet];
      return sheet;
    }
  } catch {
    sheet = null;
  }
  styleEl = doc.createElement('style');
  styleEl.id = 'monsoon-arbitrary';
  (doc.head || doc.documentElement).appendChild(styleEl);
  sheet = styleEl.sheet;
  return sheet;
}

function insert(rank, text) {
  // After every rule of the same or a lower rank.
  let i = ranks.length;
  while (i > 0 && ranks[i - 1] > rank) i--;
  try {
    sheet.insertRule(text, i);
    ranks.splice(i, 0, rank);
    return true;
  } catch {
    // The browser does not support this rule (for example @scope); like an
    // unsupported block in a stylesheet, it is skipped.
    return false;
  }
}

/** Generates the rules for one class. Returns true when it is an arbitrary value class. */
export function add(cls, doc = document) {
  if (seen.has(cls)) return seen.get(cls);
  const compiled = compileClass(cls);
  seen.set(cls, Boolean(compiled));
  if (!compiled) return false;
  ensureSheet(doc);
  for (const r of compiled.rules) insert(compiled.rank, ruleCss(r));
  return true;
}

const CANDIDATE = /[[(]/;

function scanElement(el) {
  const list = el.classList;
  if (!list) return;
  for (let i = 0; i < list.length; i++) {
    const c = list[i];
    if (CANDIDATE.test(c) && !seen.has(c)) add(c, el.ownerDocument);
  }
}

/** Scans root and its descendants for arbitrary value classes. */
export function scan(root = document) {
  if (root.nodeType === 1) scanElement(root);
  if (root.querySelectorAll) for (const el of root.querySelectorAll('[class*="["],[class*="("]')) scanElement(el);
}

/** Starts the engine: scans the page and watches for new elements and class changes. */
export function start(doc = typeof document === 'undefined' ? null : document) {
  if (!doc || observer) return;
  observer = new MutationObserver((records) => {
    for (const r of records) {
      if (r.type === 'attributes') scanElement(r.target);
      else for (const n of r.addedNodes) if (n.nodeType === 1) scan(n);
    }
  });
  observer.observe(doc.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
  scan(doc);
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', () => scan(doc), { once: true });
}

/** Stops watching. Rules already generated stay in place. */
export function stop() {
  if (observer) observer.disconnect();
  observer = null;
}

/** The generated CSS, for debugging or for saving as a static file. */
export function css() {
  if (!sheet) return '';
  return Array.from(sheet.cssRules, (r) => r.cssText).join('\n');
}

/** Removes every generated rule and forgets the cache. */
export function reset() {
  stop();
  if (styleEl) styleEl.remove();
  else if (sheet && typeof document !== 'undefined' && document.adoptedStyleSheets) {
    document.adoptedStyleSheets = document.adoptedStyleSheets.filter((s) => s !== sheet);
  }
  sheet = null;
  styleEl = null;
  seen.clear();
  ranks.length = 0;
}

export const arbitrary = { start, stop, scan, add, css, reset };
