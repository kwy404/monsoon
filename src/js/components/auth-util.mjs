// Small helpers shared by the one time code and the sign in components
// (otp.mjs and auth-*.mjs). No component is defined here.

export const uid = (p) => `m-${p}-${Math.random().toString(36).slice(2, 8)}`;

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
    if (k === 'class') el.setAttribute('class', v);
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? '' : v);
  }
  el.append(...kids.flat().filter((k) => k != null && k !== false));
  return el;
}

/** Builds an SVG element tree from a markup string (trusted, internal markup only). */
export function svg(markup) {
  const t = document.createElement('template');
  t.innerHTML = markup.trim();
  return t.content.firstElementChild;
}

/** Fires native input and change events, so forms and frameworks see the new value. */
export const notify = (el) => {
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
};

/** True for a boolean data option: present and not "false". */
export const flag = (v) => v !== undefined && v !== 'false';

/** Writes text to the clipboard, with a textarea fallback for older browsers. */
export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = h('textarea', { style: 'position:fixed;opacity:0;pointer-events:none', 'aria-hidden': 'true' });
    ta.value = text;
    document.body.append(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch { ok = false; }
    ta.remove();
    return ok;
  }
}

/** Shows a short confirmation on a button (data-done for 1.5 s) and announces it. */
export function flash(button, label = 'Copied') {
  const text = button.getAttribute('aria-label');
  const iconOnly = !button.textContent.trim();
  button.setAttribute('data-done', '');
  if (iconOnly) button.setAttribute('aria-label', label);
  else announcer(button.parentElement || button)(label);
  clearTimeout(button._mDone);
  button._mDone = setTimeout(() => {
    button.removeAttribute('data-done');
    if (!iconOnly) return;
    if (text === null) button.removeAttribute('aria-label');
    else button.setAttribute('aria-label', text);
  }, 1500);
}

/** A polite live region next to el, created on first use. */
export function announcer(el) {
  let live = el.querySelector(':scope > [data-m-live]');
  if (!live) {
    live = h('span', { 'data-m-live': '', 'aria-live': 'polite', class: 'sr-only' });
    el.append(live);
  }
  return (text) => {
    live.textContent = '';
    setTimeout(() => { live.textContent = text; }, 30);
  };
}
