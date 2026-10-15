// Interactive parts of the Monsoon site, built with Voodoo.js
// (https://github.com/kwy404/Voodoo.js). Voodoo is loaded with data-manual:
// this module publishes reactive stores and helpers on V.config.globals, then
// calls V.start(). Pages declare their behavior in HTML (v-data, @click,
// v-model, v-effect). Plain JavaScript is used only where Voodoo cannot help:
// pointer dragging of preview handles, the clipboard and iframe documents.

const V = window.V;
const ROOT = document.body.dataset.root || './';
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const store = {
  get(k) {
    try {
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  set(k, v) {
    try {
      if (v == null) localStorage.removeItem(k);
      else localStorage.setItem(k, v);
    } catch {}
  },
};

// ---- Theme: system, light, dark ----

const THEME_KEY = 'voodoo:theme';
const NEXT = { system: 'light', light: 'dark', dark: 'system' };
const LABEL = { system: 'system', light: 'light', dark: 'dark' };
const media = matchMedia('(prefers-color-scheme: dark)');

function readTheme() {
  let t = store.get(THEME_KEY);
  try {
    t = JSON.parse(t);
  } catch {}
  return t === 'light' || t === 'dark' ? t : 'system';
}
const T = V.reactive({ mode: readTheme(), dark: false });

function applyTheme(mode) {
  const root = document.documentElement;
  if (mode === 'light' || mode === 'dark') {
    root.setAttribute('data-theme', mode);
    root.style.colorScheme = mode;
  } else {
    root.removeAttribute('data-theme');
    root.style.colorScheme = '';
  }
  T.mode = mode;
  T.dark = mode === 'dark' || (mode === 'system' && media.matches);
  for (const b of $$('[data-theme-toggle]')) {
    b.setAttribute('aria-label', `Theme: ${LABEL[mode]}. Switch to ${LABEL[NEXT[mode]]}`);
    b.title = `Theme: ${LABEL[mode]}`;
  }
}
function setTheme(mode) {
  store.set(THEME_KEY, mode === 'system' ? null : mode);
  applyTheme(mode);
}
applyTheme(T.mode);
const calm = matchMedia('(prefers-reduced-motion: reduce)');
// The new theme grows out of the button as a circle where view transitions exist.
function switchTheme(btn, mode) {
  if (!document.startViewTransition || calm.matches || !btn) return setTheme(mode);
  const r = btn.getBoundingClientRect();
  const x = r.left + r.width / 2;
  const y = r.top + r.height / 2;
  const root = document.documentElement;
  root.style.setProperty('--vt-x', `${x}px`);
  root.style.setProperty('--vt-y', `${y}px`);
  root.style.setProperty('--vt-r', `${Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))}px`);
  root.classList.add('vt-theme');
  const vt = document.startViewTransition(() => setTheme(mode));
  vt.finished.finally(() => root.classList.remove('vt-theme'));
}
document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-theme-toggle]');
  if (btn) switchTheme(btn, NEXT[T.mode]);
});
addEventListener('storage', (e) => {
  if (e.key === THEME_KEY) applyTheme(readTheme());
});
media.addEventListener('change', () => applyTheme(T.mode));

// ---- Shared stores ----

const S = V.reactive({ nav: false, stars: null, recent: [], loading: false, ready: 0, idx: 0, srcTick: 0 });
const PV = V.reactive({ resp: 1024, respC: 0 });
try {
  S.recent = JSON.parse(store.get('monsoon-recent') || '[]').slice(0, 6);
} catch {}

addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && S.nav) S.nav = false;
});
document.addEventListener('click', (e) => {
  if (S.nav && e.target.closest('.site-nav a')) S.nav = false;
});

// GitHub stars, cached for an hour. Only refreshed when the build could read them,
// so a repository that is briefly unavailable does not fill the console with errors.
(async () => {
  try {
    if (!document.querySelector('.gh-btn[data-stars]')) return;
    const cached = JSON.parse(sessionStorage.getItem('monsoon-stars') || 'null');
    if (cached && Date.now() - cached.t < 3600e3) {
      S.stars = cached.n;
      return;
    }
    const res = await fetch('https://api.github.com/repos/kwy404/monsoon');
    if (!res.ok) return;
    const n = (await res.json()).stargazers_count;
    S.stars = n;
    sessionStorage.setItem('monsoon-stars', JSON.stringify({ n, t: Date.now() }));
  } catch {}
})();
const fmtNum = (n) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : String(n));

// ---- Copy helpers ----

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;opacity:0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  }
}

/** Copies the article as Markdown-ish text. */
function copyPage() {
  const art = $('#article');
  if (!art) return;
  const out = [];
  const title = $('.doc-title', art)?.textContent.trim();
  if (title) out.push(`# ${title}`, '');
  const lead = $('.doc-lead', art)?.textContent.trim();
  if (lead) out.push(lead, '');
  const walk = (el) => {
    for (const n of el.children) {
      if (n.matches('.anchor, button, .pv-bar, .demo-bar, script, template, iframe, .window-bar, .search-dlg')) continue;
      const tag = n.tagName;
      if (tag === 'H2') out.push(`## ${n.textContent.replace(/^#/, '').trim()}`, '');
      else if (tag === 'H3') out.push(`### ${n.textContent.replace(/^#/, '').trim()}`, '');
      else if (tag === 'P') out.push(n.textContent.trim().replace(/\s+/g, ' '), '');
      else if (tag === 'PRE') out.push('```', n.textContent.replace(/\n$/, ''), '```', '');
      else if (tag === 'UL' || tag === 'OL') {
        $$(':scope > li', n).forEach((li, i) => out.push(`${tag === 'OL' ? `${i + 1}.` : '-'} ${li.textContent.trim().replace(/\s+/g, ' ')}`));
        out.push('');
      } else if (tag === 'TABLE') {
        const rows = $$('tr', n).map((tr) => `| ${$$('th,td', tr).map((c) => c.textContent.trim().replace(/\s+/g, ' ').replace(/\|/g, '\\|')).join(' | ')} |`);
        if (rows.length) rows.splice(1, 0, `|${' --- |'.repeat($$('th,td', n.rows[0]).length)}`);
        out.push(...rows, '');
      } else if (tag === 'DETAILS' && n.closest('.faq')) {
        out.push(`**${$('summary', n)?.textContent.trim()}**`, '', $('.faq-a', n)?.textContent.trim() || '', '');
      } else if (n.children.length) walk(n);
    }
  };
  walk($('.doc-body', art));
  out.push(`Source: ${location.href.split('#')[0]}`);
  copyText(out.join('\n').replace(/\n{3,}/g, '\n\n')).then(() => {
    const b = $('.copy-page');
    if (!b) return;
    const span = $('span', b);
    b.classList.add('is-done');
    span.textContent = 'Copied';
    setTimeout(() => {
      b.classList.remove('is-done');
      span.textContent = 'Copy page';
    }, 1600);
  });
}

// ---- Example theme: one seed and one corner style for every example ----

const EX_KEY = 'monsoon-example-theme';
const CORNERS = { sharp: 0.3, default: 1, round: 1.8 };
const RADII = { xs: 0.25, sm: 0.375, md: 0.5, lg: 0.625, xl: 0.75, '2xl': 1, '3xl': 1.25 };
const isColor = (c) => typeof c === 'string' && c.trim() !== '' && CSS.supports('color', c.trim());
function readEx() {
  try {
    const j = JSON.parse(store.get(EX_KEY) || '{}');
    return { seed: isColor(j.seed) ? j.seed : '', corners: CORNERS[j.corners] ? j.corners : 'default' };
  } catch {
    return { seed: '', corners: 'default' };
  }
}
const TH = V.reactive(readEx());
function setEx(patch) {
  Object.assign(TH, patch);
  store.set(EX_KEY, TH.seed || TH.corners !== 'default' ? JSON.stringify({ seed: TH.seed, corners: TH.corners }) : null);
}
/** The custom properties for a seed and corner style, as [name, value or ''] pairs. */
function exVars(seed, corners) {
  const k = CORNERS[corners] ?? 1;
  return [['--seed', seed || ''], ...Object.entries(RADII).map(([n, v]) => [`--m-radius-${n}`, k === 1 ? '' : `${+(v * k).toFixed(3)}rem`])];
}
function paintEx(style, seed, corners) {
  for (const [n, v] of exVars(seed, corners)) v ? style.setProperty(n, v) : style.removeProperty(n);
}
// Colors and corners glide to the new theme, unless the visitor asked for less motion.
function fadeEx(root) {
  if (calm.matches || !root) return;
  root.classList.add('ex-fade');
  clearTimeout(root._exFade);
  root._exFade = setTimeout(() => root.classList.remove('ex-fade'), 520);
}
let exLast = '';
V.effect(() => {
  const { seed, corners } = TH;
  const key = `${seed}|${corners}`;
  const changed = exLast && exLast !== key;
  exLast = key;
  for (const el of $$('.ex-target, .thumb-in')) {
    if (changed) fadeEx(el.closest('.demo-stage, .thumb') || el);
    paintEx(el.style, seed, corners);
  }
  for (const f of $$('iframe.pv-frame, iframe.bl-frame')) {
    whenReady(f, (doc) => {
      if (!doc?.body) return;
      if (changed) fadeEx(doc.documentElement);
      paintEx(doc.body.style, seed, corners);
    });
  }
});

// Theme popovers open under their button.
document.addEventListener(
  'toggle',
  (e) => {
    const pop = e.target;
    if (!(pop instanceof HTMLElement) || !pop.classList.contains('ex-pop')) return;
    if (e.newState !== 'open') return pop.removeAttribute('data-placed');
    const btn = document.querySelector(`[popovertarget="${pop.id}"]`);
    if (!btn) return;
    const r = btn.getBoundingClientRect();
    const w = pop.offsetWidth;
    const h = pop.offsetHeight;
    const left = Math.max(8, Math.min(innerWidth - w - 8, r.right - w));
    const below = r.bottom + 8;
    pop.style.left = `${left}px`;
    pop.style.top = `${below + h > innerHeight - 8 ? Math.max(8, r.top - h - 8) : below}px`;
    pop.setAttribute('data-placed', '');
  },
  true,
);
addEventListener('scroll', () => $$('.ex-pop[data-placed]').forEach((p) => p.hidePopover?.()), { passive: true });

// ---- Preview frames ----

const effective = (mode) => (mode === 'light' || mode === 'dark' ? mode : T.dark ? 'dark' : 'light');

// $el in a binding can be the scope root, so find the preview frame from either.
const asFrame = (el) => (el && el.tagName === 'IFRAME' ? el : el && el.querySelector ? el.querySelector('iframe.live-frame, iframe.pv-frame') : null);

function whenReady(frame, fn) {
  if (!frame) return;
  const doc = frame.contentDocument;
  // A srcdoc frame starts on an empty about:blank document; wait for the real one.
  const real = doc && (!frame.hasAttribute('srcdoc') || doc.URL === 'about:srcdoc');
  if (real && doc.readyState === 'complete' && doc.body) fn(doc);
  else frame.addEventListener('load', () => fn(frame.contentDocument), { once: true });
}

/** Sets the color scheme inside a preview frame; '' follows the site. */
function frameMode(el, mode) {
  const frame = asFrame(el);
  const want = effective(mode);
  whenReady(frame, (doc) => {
    if (!doc) return;
    doc.documentElement.setAttribute('data-theme', want);
    doc.documentElement.style.colorScheme = want;
  });
  return want;
}

let pgSave = 0;
/** Writes editor HTML into a frame without reloading it. */
function renderFrame(el, code, mode, _t, seed) {
  const frame = asFrame(el);
  const want = effective(mode);
  whenReady(frame, (doc) => {
    if (!doc) return;
    doc.body.innerHTML = code;
    doc.documentElement.setAttribute('data-theme', want);
    doc.documentElement.style.colorScheme = want;
    if (seed) doc.body.style.setProperty('--seed', seed);
    else doc.body.style.removeProperty('--seed');
  });
  if (frame && frame.closest('.pg')) {
    clearTimeout(pgSave);
    pgSave = setTimeout(() => store.set('monsoon-playground', code), 400);
  }
  return want;
}

// Auto height for previews, and the container width probe for the responsive demo.
function watchHeight(frame) {
  const fit = () => {
    const doc = frame.contentDocument;
    if (!doc || !doc.body) return;
    const cs = doc.defaultView.getComputedStyle(doc.body);
    const h = Math.ceil(doc.body.getBoundingClientRect().height + parseFloat(cs.marginTop) + parseFloat(cs.marginBottom));
    const k = Number(frame.dataset.scale || 1);
    const minh = Number(frame.dataset.minh || 90);
    frame.style.height = `${Math.max(minh, h)}px`;
    if (frame.dataset.cqProbe) {
      const cq = doc.querySelector('[data-cq]');
      if (cq) PV.respC = cq.clientWidth;
      frame.parentElement.style.height = `${Math.max(90, h) * k}px`;
    }
  };
  const start = () => {
    const doc = frame.contentDocument;
    if (!doc || !doc.body) return;
    // A tiny fallback for command buttons in browsers without invoker commands.
    if (!('command' in HTMLButtonElement.prototype)) {
      doc.addEventListener('click', (e) => {
        const b = e.target.closest('[commandfor]');
        if (!b) return;
        const t = doc.getElementById(b.getAttribute('commandfor'));
        const c = b.getAttribute('command');
        if (!t) return;
        if (c === 'show-modal') t.showModal?.();
        else if (c === 'close') t.close?.();
        else if (c === 'toggle-popover') t.togglePopover?.();
      });
    }
    doc.addEventListener('click', (e) => {
      const a = e.target.closest('a[href="#"]');
      if (a) e.preventDefault();
    });
    new ResizeObserver(fit).observe(doc.body);
    fit();
  };
  whenReady(frame, start);
}

// Width store for resizable previews.
function pvSet(id, w) {
  PV[id] = w;
  return w;
}
function pvLabel(id) {
  const w = PV[id];
  return w ? `${w}px` : 'Full';
}

// The responsive demo can ask for more width than the page has: it scales down.
function respStyle(w) {
  const frame = $('.resp-frame');
  const stage = frame?.parentElement;
  const want = w || 1024;
  if (!frame || !stage) return { width: `${want}px` };
  const avail = stage.clientWidth - 48;
  const iframe = $('iframe', frame);
  if (want > avail) {
    const k = avail / want;
    iframe.style.width = `${want}px`;
    iframe.style.transform = `scale(${k})`;
    iframe.dataset.scale = k;
    frame.style.height = `${iframe.offsetHeight * k}px`;
    return { width: `${avail}px` };
  }
  iframe.style.width = '';
  iframe.style.transform = '';
  iframe.dataset.scale = 1;
  frame.style.height = '';
  return { width: `${want}px` };
}
function bpClasses(w, cw) {
  const x = w || 1024;
  const c = cw || 0;
  const out = [];
  for (const [n, px] of [['sm', 640], ['md', 768], ['lg', 1024], ['xl', 1280], ['2xl', 1536]]) if (x >= px) out.push(`on-${n}`);
  for (const [n, px] of [['cxs', 320], ['csm', 384], ['cmd', 448], ['clg', 512], ['cxl', 576]]) if (c >= px) out.push(`on-${n}`);
  return out.join(' ');
}

// Pointer dragging and keyboard resizing of [data-handle].
function setupHandles() {
  document.addEventListener('pointerdown', (e) => {
    const h = e.target.closest('[data-handle]');
    if (!h) return;
    e.preventDefault();
    const id = h.dataset.handle;
    const box = h.closest('[data-pv]');
    const stage = box.parentElement;
    const min = Number(box.dataset.min || 280);
    const left = box.getBoundingClientRect().left;
    const max = () => Math.min(Number(box.dataset.max || 4000), stage.clientWidth - (id === 'resp' ? 48 : 40));
    h.setPointerCapture(e.pointerId);
    box.classList.add('is-drag');
    const move = (ev) => {
      const w = Math.round(Math.max(min, Math.min(max(), ev.clientX - left)));
      PV[id] = w;
      h.setAttribute('aria-valuenow', w);
    };
    const up = () => {
      box.classList.remove('is-drag');
      h.removeEventListener('pointermove', move);
      h.removeEventListener('pointerup', up);
      h.removeEventListener('pointercancel', up);
    };
    h.addEventListener('pointermove', move);
    h.addEventListener('pointerup', up);
    h.addEventListener('pointercancel', up);
  });
  document.addEventListener('keydown', (e) => {
    const h = e.target.closest?.('[data-handle]');
    if (!h || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
    e.preventDefault();
    const id = h.dataset.handle;
    const box = h.closest('[data-pv]');
    const cur = PV[id] || box.getBoundingClientRect().width;
    const step = e.shiftKey ? 64 : 16;
    const max = Math.min(Number(box.dataset.max || 4000), box.parentElement.clientWidth - 40);
    const min = Number(box.dataset.min || 280);
    let w = cur;
    if (e.key === 'ArrowLeft') w -= step;
    if (e.key === 'ArrowRight') w += step;
    if (e.key === 'Home') w = min;
    if (e.key === 'End') w = max;
    PV[id] = Math.round(Math.max(min, Math.min(max, w)));
    h.setAttribute('aria-valuenow', PV[id]);
  });
}

// ---- Editor highlighting ----

const escHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function tokens(src) {
  const out = [];
  const re = /<!--[\s\S]*?(?:-->|$)|<\/?[a-zA-Z][\w:-]*[^>]*>?|[^<]+|</g;
  let m;
  while ((m = re.exec(src))) {
    const t = m[0];
    if (t.startsWith('<!--')) out.push(['h-com', t]);
    else if (/^<\/?[a-zA-Z]/.test(t)) {
      const head = /^(<\/?)([\w:-]+)/.exec(t);
      out.push(['h-pun', head[1]], ['h-tag', head[2]]);
      let rest = t.slice(head[0].length);
      const end = /(\/?>)$/.exec(rest);
      if (end) rest = rest.slice(0, -end[1].length);
      const ar = /(\s+)|([^\s=]+)(\s*=\s*)?("[^"]*"?|'[^']*'?|[^\s"']+)?/g;
      let a;
      while ((a = ar.exec(rest)) && a[0]) {
        if (a[1]) out.push(['', a[1]]);
        else {
          out.push(['h-attr', a[2]]);
          if (a[3]) out.push(['h-pun', a[3]]);
          if (a[4]) out.push(['h-str', a[4]]);
        }
      }
      if (end) out.push(['h-pun', end[1]]);
    } else out.push(['', t]);
  }
  return out;
}

/** HTML syntax highlighting for the editors, one span per line for line numbers. */
function hl(src) {
  const lines = [''];
  for (const [cls, text] of tokens(String(src ?? ''))) {
    const parts = text.split('\n');
    parts.forEach((p, i) => {
      if (i > 0) lines.push('');
      if (p) lines[lines.length - 1] += cls ? `<span class="${cls}">${escHtml(p)}</span>` : escHtml(p);
    });
  }
  return lines.map((l) => `<span class="ln">${l}</span>`).join('\n') + '\n';
}
const lineCount = (code) => String(code || '').split('\n').length;

const presetsEl = document.getElementById('presets-data');
const presets = presetsEl ? JSON.parse(presetsEl.textContent) : [];

// ---- Playground ----

function b64encode(text) {
  return btoa(String.fromCharCode(...new TextEncoder().encode(text))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function b64decode(text) {
  const bin = atob(text.replace(/-/g, '+').replace(/_/g, '/'));
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
}
function pgStart() {
  const m = /[#&]code=([\w-]+)/.exec(location.hash);
  if (m) {
    try {
      return b64decode(m[1]);
    } catch {}
  }
  let handoff = null;
  try {
    handoff = sessionStorage.getItem('monsoon-pg');
    sessionStorage.removeItem('monsoon-pg');
  } catch {}
  return handoff || store.get('monsoon-playground') || presets[0]?.code || '';
}
function shareCode(code) {
  const url = `${location.href.split('#')[0]}#code=${b64encode(code)}`;
  copyText(url);
  history.replaceState(null, '', url);
}
function toPlayground(id) {
  const src = document.querySelector(`#${CSS.escape(id)} .pv-src`)?.textContent || '';
  try {
    sessionStorage.setItem('monsoon-pg', src);
  } catch {}
  location.href = `${ROOT}playground.html`;
}

// ---- Showcase sources ----

const srcCache = {};
function showSrc(slug) {
  if (srcCache[slug]) return srcCache[slug];
  srcCache[slug] = '<p class="search-empty">Loading the source</p>';
  fetch(`${ROOT}showcase/src/${slug}.html`)
    .then((r) => r.text())
    .then((html) => {
      srcCache[slug] = html;
      S.srcTick++;
    })
    .catch(() => {
      srcCache[slug] = '<p class="search-empty">The source could not be loaded.</p>';
      S.srcTick++;
    });
  return srcCache[slug];
}
async function copySource(href) {
  try {
    const text = await (await fetch(`${ROOT}${href}`)).text();
    copyText(text);
  } catch {}
}

// ---- Class index (class reference, generated CSS editor) ----

let index = null;
let indexPromise = null;
function loadIndex() {
  if (!indexPromise) {
    indexPromise = fetch(`${ROOT}classes.json`)
      .then((r) => r.json())
      .then((j) => {
        index = j;
        index.byName = new Map(j.rows.map((r) => [r[0], r]));
        S.idx++;
        return j;
      })
      .catch(() => null);
  }
  return indexPromise;
}

function ruleText(row) {
  const name = row[0];
  const sel = row[4] || `.${CSS.escape(name)}`;
  return { sel, decls: row[2] };
}
function cssOfClass(cls) {
  if (!index) return null;
  const row = index.byName.get(cls);
  if (row) {
    const r = ruleText(row);
    return [{ wrap: [], sel: r.sel, decls: r.decls }];
  }
  const i = cls.indexOf(':', cls.startsWith('@') ? 1 : 0);
  if (i > 0) {
    const v = cls.slice(0, i);
    const base = index.byName.get(cls.slice(i + 1));
    const vi = index.variants.indexOf(v);
    if (base && vi >= 0 && base[3].includes(vi) && index.templates[v]) {
      return index.templates[v].map((t) => ({ wrap: t.wrap, sel: t.sel.split('{c}').join(CSS.escape(cls)), decls: base[2] }));
    }
    if (base) return { missing: `${v}: is not generated for ${cls.slice(i + 1)}` };
  }
  if (index.comp[cls]) return { raw: index.comp[cls] };
  return null;
}
const sp = (c, t) => `<span class="${c}">${escHtml(t)}</span>`;
function prettyRule({ wrap, sel, decls }) {
  let ind = '';
  let out = '';
  for (const w of wrap) {
    out += `${ind}${sp('c-at', w)} ${sp('c-pun', '{')}\n`;
    ind += '  ';
  }
  out += `${ind}${sp('c-sel', sel)} ${sp('c-pun', '{')}\n`;
  for (const d of decls.split(/;\s*/).filter(Boolean)) {
    const k = d.indexOf(':');
    out += `${ind}  ${sp('c-prop', d.slice(0, k).trim())}${sp('c-pun', ':')} ${sp('c-val', d.slice(k + 1).trim())}${sp('c-pun', ';')}\n`;
  }
  for (let i = wrap.length; i >= 0; i--) out += `${'  '.repeat(i)}${sp('c-pun', '}')}\n`;
  return out;
}
function cssFor(text) {
  if (!index) {
    loadIndex();
    return sp('c-com', '/* loading the class index */');
  }
  const list = String(text || '').split(/\s+/).filter(Boolean);
  if (!list.length) return sp('c-com', '/* type a class, for example p-4 */');
  return list
    .map((c) => {
      const r = cssOfClass(c);
      if (!r) return sp('c-miss', `/* ${c} is not a Monsoon class */`) + '\n';
      if (r.missing) return sp('c-miss', `/* ${r.missing} */`) + '\n';
      if (r.raw) return `${sp('c-com', `/* ${c}, component */`)}\n${escHtml(r.raw)}\n`;
      return `${sp('c-com', `/* ${c} */`)}\n${r.map(prettyRule).join('')}`;
    })
    .join('\n');
}

// Class reference search.
let lastKey = '';
let lastMatches = [];
function matches(q, cat, vr) {
  if (!index) return [];
  const key = `${q}\u0000${cat}\u0000${vr}`;
  if (key === lastKey) return lastMatches;
  let query = String(q || '').trim().toLowerCase();
  let variant = vr || '';
  const colon = query.indexOf(':', query.startsWith('@') ? 1 : 0);
  if (colon > 0 && index.variants.includes(query.slice(0, colon))) {
    variant = variant || query.slice(0, colon);
    query = query.slice(colon + 1);
  }
  const vi = variant ? index.variants.indexOf(variant) : -1;
  const ci = cat && cat !== 'all' ? index.categories.indexOf(cat) : -1;
  const exact = [];
  const starts = [];
  const rest = [];
  for (const row of index.rows) {
    if (ci >= 0 && row[1] !== ci) continue;
    if (vi >= 0 && !row[3].includes(vi)) continue;
    if (query) {
      const n = row[0];
      if (n === query) exact.push(row);
      else if (n.startsWith(query)) starts.push(row);
      else if (n.includes(query) || row[2].includes(query)) rest.push(row);
      continue;
    }
    rest.push(row);
  }
  lastKey = key;
  lastMatches = exact.concat(starts, rest);
  return lastMatches;
}
const params = new URLSearchParams(location.search);

// ---- Filters on index pages ----

function filterRows(q, sel) {
  const root = document.querySelector(sel);
  if (!root) return;
  const query = String(q || '').trim().toLowerCase();
  for (const sec of root.querySelectorAll('.util-sec')) {
    let any = false;
    for (const tr of sec.querySelectorAll('tbody tr')) {
      const show = !query || tr.textContent.toLowerCase().includes(query);
      tr.hidden = !show;
      any ||= show;
    }
    sec.hidden = !any;
  }
}
function cmatch(q, g, group, text) {
  if (g !== 'all' && g !== group) return false;
  const query = String(q || '').trim().toLowerCase();
  return !query || query.split(/\s+/).every((w) => text.includes(w));
}
let cards = null;
/** How many component cards match the filter, in one group or in all of them. */
function countComps(q, g, group) {
  cards ||= $$('.comp-card[data-g]').map((c) => [c.dataset.g, c.dataset.t]);
  return cards.filter(([cg, t]) => (!group || cg === group) && cmatch(q, g, cg, t)).length;
}

// ---- Search ----

let search = null;
let searchPromise = null;
function loadSearch() {
  if (!searchPromise) {
    S.loading = true;
    searchPromise = fetch(`${ROOT}search-index.json`)
      .then((r) => r.json())
      .then((j) => {
        search = j;
        search.words = new Set();
        for (const e of j.entries) for (const w of e[2].toLowerCase().split(/[^a-z0-9]+/)) if (w.length > 2) search.words.add(w);
        S.loading = false;
        S.ready++;
      })
      .catch(() => {
        S.loading = false;
      });
  }
  return searchPromise;
}
function openSearch() {
  const d = document.getElementById('search');
  if (!d) return;
  loadSearch();
  if (!d.open) d.showModal();
  requestAnimationFrame(() => document.getElementById('search-input')?.focus());
}
function closeSearch() {
  document.getElementById('search')?.close();
}
// "/" opens search from anywhere, unless the visitor is typing.
addEventListener('keydown', (e) => {
  if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey || e.defaultPrevented) return;
  const t = e.target;
  if (t.closest?.('input, textarea, select, [contenteditable=""], [contenteditable="true"], dialog[open]')) return;
  e.preventDefault();
  openSearch();
});
const reEsc = (w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const highlight = (text, words) => {
  let html = escHtml(text);
  for (const w of words) {
    if (!w) continue;
    const re = new RegExp(`(${reEsc(w)})`, 'ig');
    html = html.replace(/(<[^>]*>)|([^<]+)/g, (m, tag, txt) => (tag ? tag : txt.replace(re, '<mark>$1</mark>')));
  }
  return html;
};

// Words people search for that the docs call something else.
const SYN = {
  modal: ['dialog'], popup: ['dialog', 'popover'], lightbox: ['dialog', 'viewer'], dropdown: ['menu', 'select'], toggle: ['switch'],
  switch: ['toggle'], notification: ['toast', 'alert'], snackbar: ['toast'], spinner: ['loading', 'loader'], loader: ['spinner', 'loading'],
  slider: ['range', 'carousel'], carousel: ['slider'], hint: ['tooltip'], navbar: ['navigation', 'nav'], menubar: ['navbar', 'menu'],
  sidebar: ['drawer', 'sheet'], offcanvas: ['drawer', 'sheet'], tag: ['badge', 'chip'], pill: ['badge', 'chip'], label: ['badge'],
  theme: ['theming', 'seed'], colors: ['color', 'palette', 'seed'], night: ['dark'], flexbox: ['flex'], font: ['typography', 'text'],
  upload: ['dropzone', 'file'], date: ['datepicker', 'calendar'], otp: ['one time code'], '2fa': ['two factor'], login: ['sign in'],
  signin: ['sign in'], autocomplete: ['combobox'], select2: ['combobox'], typeahead: ['combobox'], purge: ['purge cli'], install: ['installation'],
  accordion: ['collapse', 'accordion'], collapsible: ['collapse'], breadcrumb: ['breadcrumbs'], stepper: ['steps'], wizard: ['steps'],
  rating: ['rating', 'stars'], skeleton: ['skeleton', 'loading'], kbd: ['keyboard'], shadow: ['shadows', 'effects'], margin: ['spacing'], padding: ['spacing'],
};
const syn = (w) => [w, ...(SYN[w] || [])];

/** Optimal string alignment distance, stopping early once it passes max. */
function dist(a, b, max) {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev2 = null;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let low = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
      if (prev2 && i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) v = Math.min(v, prev2[j - 2] + 1);
      cur[j] = v;
      if (v < low) low = v;
    }
    if (low > max) return max + 1;
    prev2 = prev;
    prev = cur;
  }
  return prev[b.length];
}
const typoBudget = (w) => (w.length >= 8 ? 2 : w.length >= 4 ? 1 : 0);
/** True when w is a small typo of one of the title words, or of the start of one. */
function nearWord(w, title) {
  const max = typoBudget(w);
  if (!max) return false;
  for (const t of title.split(/[^a-z0-9]+/)) {
    if (t.length < 3) continue;
    if (dist(w, t, max) <= max) return true;
    if (w.length >= 5 && t.length > w.length && dist(w, t.slice(0, w.length), max) <= max) return true;
  }
  return false;
}
function wordScore(w, t, sub, text) {
  if (t === w) return 120;
  if (t.startsWith(w)) return 80;
  if (new RegExp(`\\b${reEsc(w)}`).test(t)) return 55;
  if (t.includes(w)) return 35;
  if (sub.includes(w)) return 14;
  if (text.includes(w)) return 6;
  return 0;
}

// Things search can do, not only pages it can open.
const ACTIONS = [
  { title: 'Switch to the dark theme', sub: 'Site theme', keys: 'dark theme night mode', run: () => switchTheme($('[data-theme-toggle]'), 'dark') },
  { title: 'Switch to the light theme', sub: 'Site theme', keys: 'light theme day mode', run: () => switchTheme($('[data-theme-toggle]'), 'light') },
  { title: 'Follow the system theme', sub: 'Site theme', keys: 'system theme auto mode', run: () => switchTheme($('[data-theme-toggle]'), 'system') },
  { title: 'Copy the CDN link tag', sub: '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/monsooncss">', keys: 'cdn link copy tag stylesheet install', run: () => copyText('<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/monsooncss">') },
  { title: 'Reset the example theme', sub: 'Default seed and corners', keys: 'reset example theme seed default', run: () => setEx({ seed: '', corners: 'default' }) },
];
const SCOPE = { components: ['component'], classes: ['utility', 'class'], docs: ['doc', 'section', 'guide', 'page'] };
const GROUP_ORDER = ['Actions', 'Getting started', 'Sections', 'Components', 'Utilities', 'Classes', 'Guides', 'Pages', 'Showcase'];
const EMPTY = { groups: [], total: 0, flat: [], counts: { all: 0, components: 0, classes: 0, docs: 0 } };
let baseCache = { key: '', all: [] };
const resCache = new Map();

function scoreAll(query) {
  const words = query.split(/\s+/).filter(Boolean);
  const scored = [];
  for (const [kind, group, title, url, sub, text] of search.entries) {
    const t = title.toLowerCase();
    const s = sub.toLowerCase();
    let score = 0;
    let ok = true;
    for (const w of words) {
      let best = 0;
      for (const [i, alt] of syn(w).entries()) best = Math.max(best, wordScore(alt, t, s, text) * (i ? 0.7 : 1));
      if (!best && nearWord(w, t)) best = 30;
      if (!best) {
        ok = false;
        break;
      }
      score += best;
    }
    // Pages and components beat the sections inside them for the same words.
    if (ok && score) scored.push({ kind, group, title, url, sub, score: kind === 'section' ? score * 0.8 : score });
  }
  const cls = [];
  if (words.length === 1 || /^[\w@:/.-]+$/.test(query)) {
    const qc = query.replace(/\s+/g, '-');
    const bare = qc.includes(':') ? qc.slice(qc.indexOf(':', qc.startsWith('@') ? 1 : 0) + 1) : qc;
    for (const [name, ci, decl] of search.classes) {
      let s = 0;
      if (name === bare) s = 90;
      else if (name.startsWith(bare)) s = 70 - Math.min(40, name.length - bare.length);
      else if (name.includes(bare)) s = 50;
      else if (bare.length > 3 && decl.toLowerCase().startsWith(bare)) s = 20;
      if (s) cls.push({ kind: 'class', group: 'Classes', title: name, url: `utilities/${search.cats[ci]}.html#cls-${name}`, sub: decl, score: s });
    }
    cls.sort((a, b) => b.score - a.score);
  }
  const acts = [];
  for (const a of ACTIONS) {
    if (words.every((w) => a.keys.split(' ').some((k) => k.startsWith(w)))) acts.push({ kind: 'action', group: 'Actions', title: a.title, url: `#act-${a.title}`, sub: a.sub, score: 60, run: a.run });
  }
  // A color name or value themes every example on the site.
  if (isColor(query) && !/^\d/.test(query) && !/^(inherit|initial|unset|revert|transparent|currentcolor)/.test(query)) {
    acts.unshift({ kind: 'action', group: 'Actions', title: `Theme every example with ${query}`, url: `#act-seed-${query}`, sub: `Sets --seed: ${query} on component previews and live results`, score: 200, color: query, run: () => setEx({ seed: query }) });
  }
  // One result per section name: the best scoring page wins.
  const seen = new Set();
  const unique = scored
    .sort((a, b) => b.score - a.score)
    .filter((x) => x.kind !== 'section' || (!seen.has(x.title.toLowerCase()) && seen.add(x.title.toLowerCase())));
  return [...acts, ...unique, ...cls.slice(0, 8)];
}

function results(q, scope = 'all') {
  const query = String(q || '').trim().toLowerCase();
  if (!query || !search) return EMPTY;
  const key = `${query}\u0000${S.ready}`;
  if (baseCache.key !== key) {
    const all = scoreAll(query);
    const capped = (pool) => GROUP_ORDER.reduce((n, name) => n + Math.min(pool.filter((x) => x.group === name).length, name === 'Classes' ? 8 : 6), 0);
    const counts = { all: capped(all) };
    for (const [k, kinds] of Object.entries(SCOPE)) counts[k] = capped(all.filter((x) => kinds.includes(x.kind)));
    baseCache = { key, all, counts };
    resCache.clear();
  }
  if (resCache.has(scope)) return resCache.get(scope);
  const words = query.split(/\s+/).filter(Boolean);
  const kinds = SCOPE[scope];
  const pool = kinds ? baseCache.all.filter((x) => kinds.includes(x.kind)) : baseCache.all;
  const groups = [];
  for (const name of GROUP_ORDER) {
    const items = pool
      .filter((x) => x.group === name)
      .sort((a, b) => b.score - a.score)
      .slice(0, name === 'Classes' ? 8 : 6);
    if (items.length) groups.push({ name, top: Math.max(...items.map((x) => x.score)), items });
  }
  groups.sort((a, b) => b.top - a.top);
  let i = 0;
  const flat = [];
  for (const g of groups)
    for (const it of g.items) {
      const item = { ...it, i: i++ };
      item.html = item.kind === 'action' ? escHtml(item.title) : highlight(item.title, words);
      flat.push(item);
    }
  for (const g of groups) g.items = flat.filter((x) => x.group === g.name);
  const value = { groups, total: flat.length, flat, counts: baseCache.counts };
  resCache.set(scope, value);
  return value;
}
/** The closest known word for a query with no results, for "Did you mean". */
function suggest(q) {
  const query = String(q || '').trim().toLowerCase();
  if (!search || !query || query.includes(' ') || query.length < 3) return '';
  let best = '';
  let bestD = 3;
  for (const w of search.words) {
    const d = dist(query, w, 2);
    if (d < bestD || (d === bestD && best && w.length < best.length)) {
      best = w;
      bestD = d;
    }
  }
  return bestD <= 2 && best !== query ? best : '';
}
function moveSel(q, sel, d, scope) {
  const n = results(q, scope).total;
  if (!n) return 0;
  const next = (sel + d + n) % n;
  requestAnimationFrame(() => document.getElementById(`sr-${next}`)?.scrollIntoView({ block: 'nearest' }));
  return next;
}
function relUrl(url) {
  return ROOT + url;
}
function remember(it) {
  const item = { title: it.title, url: it.url, group: it.group };
  const list = [item, ...S.recent.filter((r) => r.url !== it.url)].slice(0, 6);
  S.recent = list;
  store.set('monsoon-recent', JSON.stringify(list));
  return true;
}
function clearRecent() {
  S.recent = [];
  store.set('monsoon-recent', null);
}
/** Opens a result, or runs it when it is an action. */
function pick(it, e) {
  if (it.kind === 'action') {
    e?.preventDefault();
    closeSearch();
    it.run();
    return;
  }
  remember(it);
}
function goSel(q, sel, scope) {
  const it = results(q, scope).flat[sel];
  if (!it) return;
  if (it.kind === 'action') return pick(it);
  remember(it);
  closeSearch();
  location.href = relUrl(it.url);
}
const KIND_ICONS = {
  doc: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/></svg>',
  section: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18"/></svg>',
  guide: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/><path d="M4 19.5V21h16"/></svg>',
  component: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="m3 8 9 5 9-5M12 13v8"/></svg>',
  utility: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/></svg>',
  class: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m8 8-5 4 5 4M16 8l5 4-5 4"/></svg>',
  page: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/></svg>',
  action: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13 2 3 14h9l-1 8 10-12h-9z"/></svg>',
};
const kindIcon = (k, color) => (color ? `<span class="si-color" style="background:${escHtml(color).replace(/"/g, '')}"></span>` : KIND_ICONS[k] || KIND_ICONS.page);

// ---- Seed contrast (WCAG 2 from computed OKLCH or RGB colors) ----

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const toLinear = (v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
function oklabToLinear(L, a, b) {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s].map(clamp01);
}
const num = (s) => (s.endsWith('%') ? parseFloat(s) / 100 : parseFloat(s));
function linearRgb(color) {
  const m = /^(\w+)\(([^)]*)\)$/.exec(color.trim());
  if (!m) return null;
  const parts = m[2].replace(/\//g, ' ').replace(/,/g, ' ').trim().split(/\s+/);
  const fn = m[1];
  if (fn === 'rgb' || fn === 'rgba') return parts.slice(0, 3).map((p) => toLinear(clamp01(num(p) / (p.endsWith('%') ? 1 : 255))));
  if (fn === 'oklch') {
    const [L, C, H] = [num(parts[0]), num(parts[1]), parseFloat(parts[2]) || 0];
    const r = (H * Math.PI) / 180;
    return oklabToLinear(L, C * Math.cos(r), C * Math.sin(r));
  }
  if (fn === 'oklab') return oklabToLinear(num(parts[0]), num(parts[1]), num(parts[2]));
  if (fn === 'color' && parts[0] === 'srgb') return parts.slice(1, 4).map((p) => toLinear(clamp01(num(p))));
  return null;
}
const luminance = ([r, g, b]) => 0.2126 * r + 0.7152 * g + 0.0722 * b;
function contrast(a, b) {
  const x = linearRgb(a);
  const y = linearRgb(b);
  if (!x || !y) return NaN;
  const l1 = luminance(x);
  const l2 = luminance(y);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}
let probe = null;
function getProbe() {
  if (probe) return probe;
  probe = document.createElement('div');
  probe.setAttribute('aria-hidden', 'true');
  probe.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;visibility:hidden;pointer-events:none';
  const scheme = (mode) => `<div class="${mode}" data-mode="${mode}"><i data-k="primary" class="bg-primary text-primary-foreground"></i><i data-k="body" class="bg-background text-foreground"></i><i data-k="accent" class="bg-accent text-accent-foreground"></i><i data-k="surface" class="bg-surface text-muted-foreground"></i><i data-k="seed" style="color: oklch(from var(--seed) l c h)"></i></div>`;
  probe.innerHTML = scheme('light') + scheme('dark');
  document.body.appendChild(probe);
  return probe;
}
const valid = (color) => typeof color === 'string' && color.trim() !== '' && CSS.supports('color', color.trim());
let lastValid = '#3b5bdb';
const cache = new Map();
function measure(seed) {
  const s = valid(seed) ? seed.trim() : lastValid;
  if (cache.has(s)) return cache.get(s);
  const out = {};
  for (const box of getProbe().querySelectorAll('[data-mode]')) {
    box.style.setProperty('--seed', s);
    const r = {};
    for (const el of box.querySelectorAll('[data-k]')) {
      const cs = getComputedStyle(el);
      r[el.dataset.k] = el.dataset.k === 'seed' ? cs.color : contrast(cs.backgroundColor, cs.color);
    }
    out[box.dataset.mode] = r;
  }
  cache.set(s, out);
  return out;
}
const fixed = (n) => (Number.isFinite(n) ? `${n.toFixed(2)}:1` : 'n/a');

// ---- Page builder ----

const blData = (() => {
  try {
    return JSON.parse(document.getElementById('builder-data')?.textContent || 'null');
  } catch {
    return null;
  }
})();
const BL_KEY = 'monsoon-builder';
const blHtml = new Map((blData?.blocks || []).map((b) => [b.key, b]));
let blSeq = 0;
const blItem = (key) => ({ id: `b${Date.now().toString(36)}${blSeq++}`, key });
const B = V.reactive({
  list: (() => {
    try {
      return (JSON.parse(store.get(BL_KEY) || '[]') || []).filter((k) => blHtml.has(k)).map(blItem);
    } catch {
      return [];
    }
  })(),
  undo: [],
  fresh: '',
});
function blSave() {
  store.set(BL_KEY, B.list.length ? JSON.stringify(B.list.map((x) => x.key)) : null);
}
const blName = (key) => blHtml.get(key)?.label || key;
function blInsert(key, at = B.list.length) {
  if (!blHtml.has(key)) return;
  const it = blItem(key);
  const list = [...B.list];
  list.splice(Math.max(0, Math.min(at, list.length)), 0, it);
  B.list = list;
  B.undo = [];
  B.fresh = it.id;
  blSave();
}
const blAdd = (key) => blInsert(key);
function blStarter() {
  B.list = (blData?.starter || []).map(blItem);
  B.fresh = '';
  blSave();
}
function blMove(i, d) {
  const j = i + d;
  if (j < 0 || j >= B.list.length) return;
  const list = [...B.list];
  [list[i], list[j]] = [list[j], list[i]];
  B.list = list;
  B.fresh = list[j].id;
  blSave();
}
function blRemove(i) {
  B.list = B.list.filter((_, k) => k !== i);
  blSave();
}
function blClear() {
  B.undo = B.list.map((x) => x.key);
  B.list = [];
  blSave();
}
function blUndo() {
  B.list = B.undo.map(blItem);
  B.undo = [];
  blSave();
}
function blSorted(order) {
  if (!Array.isArray(order)) return;
  const byId = new Map(B.list.map((x) => [x.id, x]));
  const list = order.map((id) => byId.get(String(id))).filter(Boolean);
  if (list.length === B.list.length) {
    B.list = list;
    blSave();
  }
}

// Where a block dragged over the canvas lands: before the block under the pointer's middle.
let blAt = -1;
function blIndexAt(y) {
  const frame = $('.bl-frame');
  const doc = frame?.contentDocument;
  const canvas = frame?.closest('.bl-canvas');
  if (!doc || !canvas) return { at: B.list.length, top: 0 };
  const fr = frame.getBoundingClientRect();
  const cr = canvas.getBoundingClientRect();
  const parts = [...doc.querySelectorAll('[data-b]')];
  let at = parts.length;
  let line = parts.length ? parts[parts.length - 1].getBoundingClientRect().bottom : 0;
  for (const [i, el] of parts.entries()) {
    const r = el.getBoundingClientRect();
    if (y - fr.top < r.top + r.height / 2) {
      at = i;
      line = r.top;
      break;
    }
  }
  return { at, top: Math.max(0, Math.min(fr.height - 3, line)) + fr.top - cr.top };
}
document.addEventListener(
  'pointermove',
  (e) => {
    const canvas = $('.bl-canvas.v-drop-active');
    const line = $('.bl-line');
    if (!canvas || !line) return;
    const r = canvas.getBoundingClientRect();
    const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    if (!inside) {
      line.classList.remove('is-on');
      blAt = -1;
      return;
    }
    const { at, top } = blIndexAt(e.clientY);
    blAt = at;
    line.style.transform = `translateY(${top}px)`;
    line.classList.add('is-on');
  },
  { passive: true },
);
for (const ev of ['voodoo:drag-end', 'voodoo:drag-cancel']) document.addEventListener(ev, () => $('.bl-line')?.classList.remove('is-on'));
function blDrop(detail) {
  const key = typeof detail?.data === 'string' ? detail.data : detail?.item?.dataset?.key;
  blInsert(key, blAt >= 0 ? blAt : B.list.length);
  blAt = -1;
  $('.bl-line')?.classList.remove('is-on');
}

const BL_STYLE = '@media (prefers-reduced-motion:no-preference){.bl-in{animation:bl-in .55s cubic-bezier(.2,.8,.2,1)}@keyframes bl-in{from{opacity:0;transform:translateY(14px)}}}';
/** Writes the blocks into the canvas frame, then shows the block that was just added. */
function blRender(el, sig, mode) {
  const frame = asFrame(el);
  const want = effective(mode);
  whenReady(frame, (doc) => {
    if (!doc?.body) return;
    doc.documentElement.setAttribute('data-theme', want);
    doc.documentElement.style.colorScheme = want;
    if (!doc.getElementById('bl-style')) doc.head.insertAdjacentHTML('beforeend', `<style id="bl-style">${BL_STYLE}</style>`);
    if (doc.body.dataset.sig === sig) return;
    doc.body.dataset.sig = sig;
    doc.body.innerHTML = B.list.map((x) => `<div data-b="${x.id}">${blHtml.get(x.key)?.html || ''}</div>`).join('\n');
    paintEx(doc.body.style, TH.seed, TH.corners);
    const fresh = B.fresh && doc.querySelector(`[data-b="${B.fresh}"]`);
    if (fresh) {
      fresh.classList.add('bl-in');
      fresh.scrollIntoView({ block: 'nearest', behavior: calm.matches ? 'auto' : 'smooth' });
      setTimeout(() => {
        B.fresh = '';
      }, 900);
    }
  });
  return want;
}
function blPageHtml() {
  const vars = exVars(TH.seed, TH.corners).filter(([, v]) => v);
  const style = vars.length ? ` style="${vars.map(([n, v]) => `${n}: ${v}`).join('; ')}"` : '';
  const blocks = B.list.map((x) => blHtml.get(x.key)?.html || '').join('\n\n');
  return { style, blocks };
}
async function blCopy(btn) {
  const { style, blocks } = blPageHtml();
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>My page</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/monsooncss@${blData?.version || ''}">
</head>
<body class="antialiased bg-background text-foreground"${style}>
${blocks}
</body>
</html>
`;
  copied(btn, await copyText(html));
}
function blToPlayground() {
  const { style, blocks } = blPageHtml();
  try {
    sessionStorage.setItem('monsoon-pg', style ? `<div${style}>\n${blocks}\n</div>` : blocks);
  } catch {}
  location.href = `${ROOT}playground.html`;
}

// ---- Start ----

Object.assign(V.config.globals, {
  T,
  S,
  PV,
  presets,
  fmtNum,
  copyText,
  copyPage,
  frameMode,
  renderFrame,
  pvSet,
  pvLabel,
  respStyle,
  bpClasses,
  hl,
  lineCount,
  pgStart,
  shareCode,
  toPlayground,
  showSrc,
  copySource,
  cssFor,
  filterRows,
  cmatch,
  openSearch,
  closeSearch,
  results,
  moveSel,
  goSel,
  relUrl,
  remember,
  clearRecent,
  kindIcon,
  suggest,
  pick,
  countComps,
  TH,
  setEx,
  B,
  blAdd,
  blStarter,
  blMove,
  blRemove,
  blClear,
  blUndo,
  blSorted,
  blDrop,
  blRender,
  blName,
  blCopy,
  blToPlayground,
  startQuery: params.get('q') || '',
  startCat: params.get('cat') || 'all',
  total: (q, cat, vr, _i) => matches(q, cat, vr).length,
  search: (q, cat, vr, limit) =>
    matches(q, cat, vr)
      .slice(0, limit)
      .map((row) => ({
        n: row[0],
        c: index.categories[row[1]],
        css: prettyRule({ wrap: [], ...ruleText(row) }).replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').trim(),
        v: row[3].map((i) => index.variants[i]),
      })),
  safe(seed) {
    if (valid(seed)) lastValid = seed.trim();
    return lastValid;
  },
  ratio: (seed, mode, key) => fixed(measure(seed)[mode][key]),
  grade(seed, mode) {
    const r = measure(seed)[mode];
    const worst = Math.min(r.primary, r.body, r.accent, r.surface);
    if (!Number.isFinite(worst)) return 'n/a';
    return worst >= 7 ? 'AAA' : worst >= 4.5 ? 'AA' : 'Below AA';
  },
  lch(seed) {
    const c = measure(seed).light.seed;
    const m = /oklch\(([^)]*)\)/.exec(c || '');
    if (!m) return c || '';
    const [l, ch, h] = m[1].trim().split(/\s+/).map(parseFloat);
    return `oklch(${l.toFixed(2)} ${ch.toFixed(3)} ${Math.round(h || 0)})`;
  },
});

if (document.getElementById('ref-q') || document.querySelector('.hiw')) loadIndex().then(() => {
  lastKey = '';
});
for (const f of $$('iframe[data-autoheight]')) watchHeight(f);
setupHandles();
V.start();

// Keep the active sidebar link in view.
const active = $('.site-nav .side-link.is-active');
const scroller = $('.site-nav-scroll');
if (active && scroller) scroller.scrollTop = active.offsetTop - scroller.clientHeight / 2;

// Refit the responsive demo when the page resizes.
if ($('.resp-frame')) addEventListener('resize', () => Object.assign($('.resp-frame').style, respStyle(PV.resp)));
// Prefetch the search index when the browser is idle.
setTimeout(() => loadSearch(), 2500);

// Copy buttons: data-copy-from="#id" copies that element's text, data-copy-text
// copies the value, data-copy-src="#id" copies the example source kept in that
// block, and data-copy-comp="slug" copies a component's HTML from components-src.json.
function copied(b, ok) {
  const label = $(':scope > span:not(.ic-swap)', b);
  const before = label ? label.dataset.label || label.textContent : '';
  if (label) label.dataset.label = before;
  clearTimeout(b._copyT);
  b.classList.remove('is-copied', 'is-failed');
  void b.offsetWidth;
  b.classList.add(ok ? 'is-copied' : 'is-failed');
  if (label) label.textContent = ok ? 'Copied' : 'Press Ctrl C';
  b._copyT = setTimeout(() => {
    b.classList.remove('is-copied', 'is-failed');
    if (label) label.textContent = before;
  }, 1600);
}
const exampleSource = (sel) => {
  const box = document.querySelector(sel);
  const src = box && (box.matches('.pv-src') ? box : $(':scope > .pv-src', box));
  return src ? src.textContent.replace(/<\\\/script/gi, '</script').trim() : '';
};
let compSrc = null;
const loadCompSrc = () => (compSrc ||= fetch(`${ROOT}components-src.json`).then((r) => r.json()).catch(() => ((compSrc = null), {})));
document.addEventListener('pointerover', (e) => {
  if (!compSrc && e.target.closest?.('.comp-grid')) loadCompSrc();
}, { passive: true });
document.addEventListener('focusin', (e) => {
  if (!compSrc && e.target.closest?.('.comp-grid')) loadCompSrc();
});
async function copyComp(slug) {
  const text = loadCompSrc().then((m) => m[slug] || '');
  // A pending ClipboardItem keeps the user gesture while the file loads.
  if (window.ClipboardItem && navigator.clipboard?.write) {
    try {
      await navigator.clipboard.write([new ClipboardItem({ 'text/plain': text.then((t) => new Blob([t], { type: 'text/plain' })) })]);
      return Boolean(await text);
    } catch {}
  }
  const t = await text;
  return t ? copyText(t) : false;
}
document.addEventListener('click', async (e) => {
  const b = e.target.closest('[data-copy-from], [data-copy-text], [data-copy-src], [data-copy-comp]');
  if (!b) return;
  let ok;
  if (b.dataset.copyComp) {
    e.preventDefault();
    ok = await copyComp(b.dataset.copyComp);
  } else if (b.dataset.copySrc) ok = await copyText(exampleSource(b.dataset.copySrc));
  else {
    const src = b.dataset.copyFrom ? document.querySelector(b.dataset.copyFrom) : null;
    ok = await copyText(b.dataset.copyText ?? (src ? src.innerText.replace(/\n$/, '') : ''));
  }
  copied(b, ok);
});
