// Shared helpers for the Monsoon docs build: paths, escaping, a tiny inline
// markup, Shiki highlighting inside VS Code style frames, icons and the two
// page shells (the landing shell and the documentation app shell).
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const BUILD = dirname(fileURLToPath(import.meta.url));
export const DOCS = join(BUILD, '..');
export const ROOT = join(DOCS, '..');
export const SITE = 'https://kwy404.github.io/monsoon/';
export const REPO = 'https://github.com/kwy404/monsoon';
export const NPM = 'https://www.npmjs.com/package/monsooncss';
export const CDN = 'https://cdn.jsdelivr.net/npm/monsooncss';
export const VOODOO = 'https://cdn.jsdelivr.net/npm/voodoojs@1.0.0/dist/voodoo.full.min.js';
export const VOODOO_REPO = 'https://github.com/kwy404/Voodoo.js';
export const AUTHOR_GH = 'https://github.com/kwy404';
export const AUTHOR_LI = 'https://www.linkedin.com/in/alexandre-silva-173687256/';
export const LASTMOD = '2026-10-13';
export const VERSION = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')).version;
export const INDEX = JSON.parse(readFileSync(join(ROOT, 'scripts/classes.json'), 'utf8'));
export const BASE_COUNT = INDEX.classes.length;
export const VARIANT_COUNT = INDEX.classes.reduce((n, c) => n + c.variants.length, 0);
export const fmt = (n) => n.toLocaleString('en-US');

// Values filled in by build.mjs before pages render.
export const STATE = {
  brotli: '',
  gzip: '',
  stars: null,
  components: [],
  groups: [],
  nav: [],
  flat: [],
  guides: [],
};

// ---- Relative links ----
// Pages live at different depths (index.html, components/btn.html), so every
// internal link goes through u(), which prefixes "../" as needed.

let PREFIX = '';
let CURRENT = 'index.html';
export function at(file) {
  CURRENT = file;
  PREFIX = '../'.repeat(file.split('/').length - 1);
}
export const current = () => CURRENT;
export const u = (p = '') => (/^(https?:|mailto:|#)/.test(p) ? p : PREFIX + p);

// ---- Shiki ----

const SHIKI = process.env.SHIKI_PATH || 'C:/Users/Hadouken Game Center/own/graphemely/node_modules/shiki/dist/index.mjs';
const { createHighlighter } = await import(pathToFileURL(SHIKI).href);
const LANGS = ['bash', 'html', 'css', 'js', 'ts', 'jsx', 'tsx', 'json', 'vue', 'svelte', 'astro', 'blade', 'php', 'python', 'ruby', 'erb', 'jinja', 'yaml', 'toml'];
export const highlighter = await createHighlighter({ themes: ['light-plus', 'dark-plus'], langs: LANGS });

// ---- Text ----

export const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Inline markup: `code`, **bold**, [text](url). Everything else is escaped. */
export function md(text) {
  const parts = String(text).split(/(`[^`]+`)/g);
  return parts
    .map((part) => {
      if (part.startsWith('`') && part.endsWith('`') && part.length > 1) return `<code>${esc(part.slice(1, -1))}</code>`;
      return esc(part)
        .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
        .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, t, href) => `<a href="${href}">${t}</a>`);
    })
    .join('');
}

/** Plain text version of inline markup, for meta tags, JSON-LD and search. */
export const plain = (text) =>
  String(text).replace(/`([^`]+)`/g, '$1').replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

export const slug = (s) =>
  String(s).toLowerCase().replace(/<[^>]+>/g, '').replace(/`/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// ---- Code frames ----

const label = (text, bg, fg = '#ffffff', size = 7.2) =>
  `<svg class="file-icon" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><rect width="16" height="16" rx="3" fill="${bg}"/><text x="8" y="11.2" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="${size}" font-weight="700" fill="${fg}">${text}</text></svg>`;
const ICONS = {
  js: label('JS', '#f1dd35', '#1e1e1e'),
  ts: label('TS', '#3178c6'),
  jsx: label('JSX', '#58c4dc', '#1e1e1e', 5.6),
  tsx: label('TSX', '#3178c6', '#ffffff', 5.6),
  json: label('JSON', '#cbcb41', '#1e1e1e', 4.6),
  html: label('&lt;/&gt;', '#e44d26', '#ffffff', 6),
  css: label('#', '#42a5f5'),
  vue: label('V', '#41b883'),
  svelte: label('S', '#ff3e00'),
  astro: label('A', '#bc52ee'),
  blade: label('B', '#f55247'),
  php: label('php', '#777bb3', '#ffffff', 6),
  py: label('py', '#3572a5', '#ffffff', 6.6),
  erb: label('rb', '#cc342d', '#ffffff', 6.6),
  jinja: label('dj', '#0c4b33', '#ffffff', 6.6),
  yaml: label('yml', '#cb171e', '#ffffff', 5.6),
  toml: label('tml', '#9c4221', '#ffffff', 5.6),
  terminal:
    '<svg class="file-icon" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><rect x=".5" y="1.5" width="15" height="13" rx="2.5" fill="none" stroke="currentColor"/><path d="m4 5.5 2.5 2.5L4 10.5M8 10.5h4" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
};
export function fileIcon(name) {
  if (/blade\.php$/.test(name)) return ICONS.blade;
  const ext = /\.(\w+)$/.exec(name)?.[1] ?? name;
  const key = { mjs: 'js', cjs: 'js', mts: 'ts', htm: 'html', twig: 'html', python: 'py', rb: 'erb', ruby: 'erb', yml: 'yaml' }[ext] ?? ext;
  return ICONS[key] ?? ICONS.html;
}
export const termIcon = () => ICONS.terminal;

const COPY_SVG =
  '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M4 4V1.5A1.5 1.5 0 0 1 5.5 0h7A1.5 1.5 0 0 1 14 1.5v9a1.5 1.5 0 0 1-1.5 1.5H10v2.5A1.5 1.5 0 0 1 8.5 16h-7A1.5 1.5 0 0 1 0 14.5v-9A1.5 1.5 0 0 1 1.5 4H4Zm1.5 0h3A1.5 1.5 0 0 1 10 5.5v5h2.5V1.5h-7V4Zm-4 1.5v9h7v-9h-7Z"/></svg>';
export const copyButton = (id, what) =>
  `<button type="button" class="code-copy" data-copy-from="#${id}" aria-label="Copy ${esc(what)}">${COPY_SVG}<span>Copy</span></button>`;

let counter = 0;
export const resetIds = () => {
  counter = 0;
};
export const uid = (p = 'u') => `${p}-${++counter}`;

const promptLines = (source) => ({
  line(node, line) {
    const text = source.split('\n')[line - 1] ?? '';
    if (text.trim() && !text.trim().startsWith('#')) this.addClassToHast(node, 'cmd');
  },
});

/** Highlighted <pre> only. v-pre keeps Voodoo away from braces in code. */
export function pre(source, lang, { id, labelText = 'Code sample', numbered = true } = {}) {
  const shell = lang === 'bash';
  const realId = id || `code-${++counter}`;
  const html = highlighter
    .codeToHtml(source.replace(/\n+$/, ''), {
      lang: LANGS.includes(lang) ? lang : 'text',
      themes: { light: 'light-plus', dark: 'dark-plus' },
      defaultColor: false,
      transformers: shell ? [promptLines(source)] : [],
    })
    .replace('<pre class="shiki', `<pre v-pre id="${realId}" class="${shell ? 'term ' : numbered ? 'numbered ' : ''}shiki`)
    .replace(' tabindex="0"', ` tabindex="0" aria-label="${esc(labelText)}"`);
  return { id: realId, html };
}

const bar = (inner) => `<div class="window-bar"><span class="dots" aria-hidden="true"><i></i><i></i><i></i></span>${inner}</div>`;
export const windowBar = bar;

/** A VS Code style editor window around a highlighted code sample. */
export function code(source, lang, title, { cls = '' } = {}) {
  if (lang === 'bash') return terminal(source, title);
  const { id, html } = pre(source, lang, { labelText: `${title} code` });
  return (
    `<figure class="window ${cls}" data-lang="${lang}">` +
    bar(`<span class="ed-tab active">${fileIcon(title.includes('.') ? title : lang)}<span>${esc(title)}</span></span>${copyButton(id, `${title} code`)}`) +
    `${html}</figure>`
  );
}

/** A VS Code style integrated terminal around shell commands, with optional output. */
export function terminal(source, title = 'bash', output = '') {
  const { id, html } = pre(source, 'bash', { labelText: 'Terminal commands' });
  return (
    `<figure class="window" data-lang="bash">` +
    bar(`<span class="panel-tab">Terminal</span><span class="panel-shell">${ICONS.terminal}<span>${esc(title)}</span></span>${copyButton(id, 'command')}`) +
    `${html}${output ? `<pre class="term-out" aria-label="Command output"><code>${output}</code></pre>` : ''}</figure>`
  );
}

// ---- Icons ----

export function icon(name) {
  return readFileSync(join(ROOT, 'assets/icons', `${name}.svg`), 'utf8')
    .replace(/<title>[^<]*<\/title>/, '')
    .replace('<svg ', '<svg aria-hidden="true" focusable="false" ')
    .trim();
}

const svg = (d, size = 18) =>
  `<svg viewBox="0 0 24 24" width="${size}" height="${size}" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
export const I = {
  github:
    '<svg viewBox="0 0 16 16" width="18" height="18" aria-hidden="true" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8Z"/></svg>',
  search: svg('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>'),
  sun: svg('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'),
  moon: svg('<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>'),
  system: svg('<rect x="2" y="4" width="20" height="13" rx="2"/><path d="M8 21h8M12 17v4"/>'),
  menu: svg('<path d="M4 7h16M4 12h16M4 17h16"/>', 20),
  close: svg('<path d="M18 6 6 18M6 6l12 12"/>', 20),
  chevron: svg('<path d="m9 6 6 6-6 6"/>', 14),
  arrowRight: svg('<path d="M5 12h14M13 6l6 6-6 6"/>', 16),
  arrowLeft: svg('<path d="M19 12H5M11 6l-6 6 6 6"/>', 16),
  star: '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" fill="currentColor"><path d="m12 2.5 2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z"/></svg>',
  copy: svg('<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>', 15),
  check: svg('<path d="m5 12 5 5L20 7"/>', 15),
  hash: svg('<path d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18"/>', 15),
  page: svg('<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/>', 15),
  box: svg('<path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="m3 8 9 5 9-5M12 13v8"/>', 15),
  code: svg('<path d="m8 8-5 4 5 4M16 8l5 4-5 4M14 4l-4 16"/>', 15),
  book: svg('<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z"/><path d="M4 19.5V21h16"/>', 15),
  rocket: svg('<path d="M5 15c-1.5 1.5-2 5-2 5s3.5-.5 5-2M9 11a12 12 0 0 1 11-8 12 12 0 0 1-8 11l-3 1-1-1z"/><circle cx="15" cy="9" r="1.5"/>', 15),
  layers: svg('<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>', 15),
  clock: svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', 15),
  external: svg('<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>', 14),
  monitor: svg('<rect x="2" y="4" width="20" height="13" rx="2"/><path d="M8 21h8M12 17v4"/>', 16),
  tablet: svg('<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M11 18h2"/>', 16),
  phone: svg('<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/>', 16),
  eye: svg('<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>', 15),
  linkedin: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="currentColor"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z"/></svg>',
};

export const logo = (size = 28) =>
  `<img src="${u('assets/favicon.svg')}" width="${size}" height="${size}" alt="" class="shrink-0">`;

const ICON_FALLBACK = {
  'no-build': 'no-build', cdn: 'cdn', purge: 'purge', accessibility: 'accessibility', 'dark-mode': 'dark-mode',
  'seed-theme': 'seed-theme', 'container-queries': 'container-queries', responsive: 'variants', palette: 'seed-theme',
  'css-variables': 'seed-theme', 'grid-layout': 'utility-classes', 'native-components': 'familiar-classes',
};
export const MISSING_ART = new Set();

/** Line art that swaps with the color scheme; falls back to a stock icon until the art exists. */
export function art(name, cls = '') {
  const has = existsSync(join(ROOT, 'assets/art/light', `${name}.svg`)) && existsSync(join(ROOT, 'assets/art/dark', `${name}.svg`));
  if (!has) {
    MISSING_ART.add(name);
    return `<span class="art art-missing ${cls}" aria-hidden="true">${icon(ICON_FALLBACK[name] || 'utility-classes')}</span>`;
  }
  return `<span class="art ${cls}" aria-hidden="true"><img class="art-light" src="${u(`assets/art/light/${name}.svg`)}" alt="" width="160" height="120" loading="lazy" decoding="async"><img class="art-dark" src="${u(`assets/art/dark/${name}.svg`)}" alt="" width="160" height="120" loading="lazy" decoding="async"></span>`;
}

// ---- Theme, header, search, footer ----

export const THEME_HEAD = `<meta name="color-scheme" content="light dark">
<script>try{var t=localStorage.getItem('voodoo:theme');try{t=JSON.parse(t)}catch(e){}if(t==='light'||t==='dark'){var r=document.documentElement;r.setAttribute('data-theme',t);r.style.colorScheme=t}}catch(e){}</script>`;

export const themeButton = (extra = '') =>
  `<button type="button" class="theme-btn icon-btn ${extra}" data-theme-toggle aria-label="Theme: system. Switch to light" title="Theme">
  <span class="ti ti-system">${I.system}</span><span class="ti ti-light">${I.sun}</span><span class="ti ti-dark">${I.moon}</span>
</button>`;

export const TOP_NAV = [
  ['Docs', 'docs/introduction.html', 'docs'],
  ['Components', 'components.html', 'components'],
  ['Utilities', 'utilities/layout.html', 'utilities'],
  ['Showcase', 'showcase.html', 'showcase'],
  ['Playground', 'playground.html', 'playground'],
  // Shown from xl up, where the bar has room for it; the sidebar and the landing page link it below.
  ['Why Monsoon', 'why.html', 'why', 'hidden xl:inline-block'],
];
export const GUIDE_FILES = new Set();

function isActiveTop(match) {
  const c = current();
  if (match === 'docs') return c.startsWith('docs/') || GUIDE_FILES.has(c) || c === 'classes.html';
  return c.startsWith(match);
}

function header() {
  const link = ([text, href, match, extra]) => {
    const on = isActiveTop(match);
    return `<a href="${u(href)}" class="top-link${extra ? ` ${extra}` : ''}${on ? ' is-active' : ''}"${on ? ' aria-current="true"' : ''}>${text}</a>`;
  };
  const stars = STATE.stars ? fmt(STATE.stars) : '';
  return `<a href="#main" class="skip-link">Skip to content</a>
<header class="topbar" v-data>
  <div class="topbar-in">
    <button type="button" class="icon-btn nav-toggle" @click="S.nav = true" aria-label="Open navigation" aria-controls="site-nav">${I.menu}</button>
    <a href="${u('index.html')}" class="brand" aria-label="Monsoon home">${logo(28)}<span>Monsoon</span></a>
    <a href="${REPO}/blob/main/CHANGELOG.md" class="ver-badge" title="Changelog">v${VERSION}</a>
    <nav class="top-nav" aria-label="Main">${TOP_NAV.map(link).join('')}</nav>
    <div class="top-right">
      <button type="button" class="search-btn" @click="openSearch()" v-hotkey="mod+k" aria-label="Search the documentation" aria-haspopup="dialog">
        ${I.search}<span class="search-btn-label">Search docs</span><span class="kbd-group" aria-hidden="true"><kbd>Ctrl</kbd><kbd>K</kbd></span>
      </button>
      <span class="author-top">Made by <a href="${AUTHOR_GH}" rel="me noopener">Alexandre Kohler</a><a href="${AUTHOR_LI}" class="author-ic" rel="me noopener" aria-label="Alexandre Kohler on LinkedIn">${I.linkedin}</a></span>
      <a href="${REPO}" class="gh-btn" aria-label="Monsoon on GitHub">${I.github}<span class="gh-stars"><span class="gh-star">${I.star}</span><span v-text="S.stars ? fmtNum(S.stars) : '${stars || 'Star'}'">${stars || 'Star'}</span></span></a>
      ${themeButton()}
    </div>
  </div>
</header>`;
}

function searchDialog() {
  return `<dialog id="search" class="search-dlg" aria-label="Search the documentation" v-data="{ q: '', sel: 0 }" @close="q = ''; sel = 0" @click.self="closeSearch()">
  <div class="search-panel">
    <div class="sd-field">
      ${I.search}
      <label for="search-input" class="sr-only">Search</label>
      <input id="search-input" type="text" v-model="q" @input="sel = 0" @keydown.down.prevent="sel = moveSel(q, sel, 1)" @keydown.up.prevent="sel = moveSel(q, sel, -1)" @keydown.enter.prevent="goSel(q, sel)" placeholder="Search docs, components, utilities and classes" autocomplete="off" spellcheck="false" role="combobox" aria-expanded="true" aria-controls="search-list" aria-autocomplete="list" :aria-activedescendant="q ? 'sr-' + sel : ''">
      <button type="button" class="esc-key" @click="closeSearch()" aria-label="Close search">esc</button>
    </div>
    <div class="search-body" id="search-list" role="listbox" aria-label="Results">
      <div v-show="!q">
        <div v-show="!S.recent.length" class="search-empty"><p class="font-medium text-foreground">No recent searches</p><p class="mt-1 text-sm">Try <button type="button" class="link-btn" @click="q = 'button'">button</button>, <button type="button" class="link-btn" @click="q = 'dark mode'">dark mode</button>, <button type="button" class="link-btn" @click="q = 'grid-cols'">grid-cols</button> or <button type="button" class="link-btn" @click="q = 'react'">react</button>.</p></div>
        <div v-show="S.recent.length">
          <div class="search-group"><span>Recent</span><button type="button" class="link-btn" @click="clearRecent()">Clear</button></div>
          <a v-for="r in S.recent" :key="r.url" :href="relUrl(r.url)" class="search-item" @click="remember(r)"><span class="si-icon">${I.clock}</span><span class="si-text"><span class="si-title" v-text="r.title"></span><span class="si-sub" v-text="r.group"></span></span></a>
        </div>
      </div>
      <div v-show="q">
        <p v-show="S.loading" class="search-empty">Loading the search index</p>
        <div v-show="!S.loading && !results(q).total" class="search-empty"><p class="font-medium text-foreground">No results for "<span v-text="q"></span>"</p><p class="mt-1 text-sm">Check the spelling, or search a class name such as px-4.</p></div>
        <section v-for="g in results(q).groups" :key="g.name">
          <div class="search-group"><span v-text="g.name"></span></div>
          <a v-for="it in g.items" :key="it.url" :id="'sr-' + it.i" :href="relUrl(it.url)" class="search-item" :class="{ 'is-sel': it.i === sel }" role="option" :aria-selected="it.i === sel ? 'true' : 'false'" @mousemove="sel = it.i" @click="remember(it)">
            <span class="si-icon" v-html="kindIcon(it.kind)"></span>
            <span class="si-text"><span class="si-title" v-html="it.html"></span><span class="si-sub" v-text="it.sub"></span></span>
            <span class="si-enter" aria-hidden="true">&#8629;</span>
          </a>
        </section>
      </div>
    </div>
    <div class="search-foot" aria-hidden="true">
      <span><kbd>&#8593;</kbd><kbd>&#8595;</kbd> navigate</span><span><kbd>&#8629;</kbd> open</span><span><kbd>esc</kbd> close</span>
      <span class="search-foot-brand">${logo(16)} Monsoon search</span>
    </div>
  </div>
</dialog>`;
}

export const MORE = [
  ['graphemely', 'https://kwy404.github.io/graphemely/', 'Truncate, slice and count strings with emoji safely.'],
  ['edgegoat', 'https://kwy404.github.io/edgegoat/', 'Edge case test inputs for time zones, DST, unicode and numbers.'],
  ['vueleap', 'https://kwy404.github.io/vueleap/', 'Migrate Vue 2 to Vue 3 with one command.'],
  ['numberparrot', 'https://kwy404.github.io/numberparrot/', 'Parse localized number and currency strings.'],
  ['breakhound', 'https://kwy404.github.io/breakhound/', 'Find bugs in any JavaScript library automatically.'],
  ['Voodoo.js', VOODOO_REPO, 'JSX and reactivity from a plain HTML file.'],
];

function footer() {
  const col = (title, links) => `
    <div>
      <h2 class="foot-title">${title}</h2>
      <ul class="foot-list">
        ${links.map(([t, h, d]) => `<li><a href="${u(h)}" class="foot-link"${d ? ` title="${esc(d)}"` : ''}>${t}</a></li>`).join('\n        ')}
      </ul>
    </div>`;
  return `
<footer class="site-foot">
  <div class="foot-in">
    <div class="foot-brand">
      <a href="${u('index.html')}" class="brand">${logo(30)}<span>Monsoon</span></a>
      <p class="text-sm text-muted-foreground max-w-xs">Utility-first CSS with no build step. One stylesheet from a CDN, a whole theme from one seed color, dark mode and native components included.</p>
      <p class="text-sm text-muted-foreground">Interactive parts built with <a href="${VOODOO_REPO}" class="font-medium text-foreground underline underline-offset-4">Voodoo.js</a>.</p>
      <img src="${u('assets/mascot.svg')}" class="mascot-foot art-light" width="84" height="84" alt="" loading="lazy"><img src="${u('assets/mascot-dark.svg')}" class="mascot-foot art-dark" width="84" height="84" alt="" loading="lazy">
    </div>${col('Docs', [
      ['Introduction', 'docs/introduction.html'],
      ['Install from a CDN', 'docs/installation-cdn.html'],
      ['Install with npm', 'docs/installation-npm.html'],
      ['Purge CLI', 'docs/purge-cli.html'],
      ['Theming with --seed', 'docs/theming.html'],
      ['Class reference', 'classes.html'],
    ])}${col('Build', [
      ['Components', 'components.html'],
      ['Utilities', 'utilities/layout.html'],
      ['Showcase', 'showcase.html'],
      ['Playground', 'playground.html'],
      ['Why Monsoon', 'why.html'],
      ['Changelog', `${REPO}/blob/main/CHANGELOG.md`],
      ['npm package', NPM],
    ])}${col('Guides', STATE.guides.slice(0, 6).map((g) => [g.short, `${g.slug}.html`]))}${col('More from kwy404', MORE)}
  </div>
  <div class="foot-bottom">
    <div class="foot-bottom-in">
      <p class="author-foot">MIT License. Made by Alexandre Kohler <a href="${AUTHOR_GH}" rel="me noopener">${I.github}<span>GitHub</span></a><a href="${AUTHOR_LI}" rel="me noopener">${I.linkedin}<span>LinkedIn</span></a></p>
      <p class="flex flex-wrap gap-4"><a href="${REPO}" class="hover:text-foreground">GitHub</a><a href="${NPM}" class="hover:text-foreground">npm</a><a href="${REPO}/issues" class="hover:text-foreground">Issues</a><a href="${u('sitemap.xml')}" class="hover:text-foreground">Sitemap</a></p>
    </div>
  </div>
</footer>`;
}

// ---- Breadcrumbs and JSON-LD ----

export function breadcrumbs(items) {
  return `<nav aria-label="Breadcrumb"><ol class="crumbs">${items
    .map(([name, href], i) =>
      i === items.length - 1 ? `<li aria-current="page">${esc(name)}</li>` : `<li><a href="${u(href)}">${esc(name)}</a></li>`,
    )
    .join('')}</ol></nav>`;
}

export const breadcrumbLd = (items) => ({
  '@type': 'BreadcrumbList',
  itemListElement: items.map(([name, href], i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name,
    item: href === 'index.html' ? SITE : new URL(href, SITE).href,
  })),
});

export const faqLd = (faqs) => ({
  '@type': 'FAQPage',
  mainEntity: faqs.map(([q, a]) => ({ '@type': 'Question', name: plain(q), acceptedAnswer: { '@type': 'Answer', text: plain(a) } })),
});

/** FAQ list with native details elements in an exclusive group. */
export function faqList(faqs, { headingLevel = 3, name = 'faq' } = {}) {
  return `<div class="faq">
${faqs
  .map(
    ([q, a], i) => `  <details name="${name}"${i === 0 ? ' open' : ''}>
    <summary><h${headingLevel} class="faq-q">${md(q)}</h${headingLevel}><span class="faq-icon" aria-hidden="true"></span></summary>
    <div class="faq-a"><p>${md(a)}</p></div>
  </details>`,
  )
  .join('\n')}
</div>`;
}

// ---- Sidebar, table of contents, prev and next ----

function sideLink(item, cur) {
  const on = item.href === cur;
  return `<li><a href="${u(item.href)}" class="side-link${on ? ' is-active' : ''}"${on ? ' aria-current="page"' : ''}><span>${esc(item.label)}</span>${item.badge ? `<span class="side-badge">${esc(item.badge)}</span>` : ''}</a></li>`;
}

function contains(g, cur) {
  return g.items.some((it) => it.href === cur || (it.items && contains(it, cur)));
}

function sideGroup(group, cur) {
  const open = group.open || contains(group, cur);
  const items = group.items.map((it) => (it.items ? `<li>${sideGroup(it, cur)}</li>` : sideLink(it, cur))).join('');
  return `<details class="side-group${group.sub ? ' is-sub' : ''}"${open ? ' open' : ''}><summary>${group.icon ? `<span class="side-ic">${group.icon}</span>` : ''}<span class="side-label">${esc(group.title)}</span>${group.count ? `<span class="side-count">${group.count}</span>` : ''}<span class="side-chev">${I.chevron}</span></summary><ul>${items}</ul></details>`;
}

/** The left navigation: a sticky column on wide docs pages, a drawer everywhere else. */
export function sidebar() {
  const cur = current();
  return `<aside id="site-nav" class="site-nav" :class="{ 'is-open': S.nav }" v-data aria-label="Documentation">
  <div class="site-nav-head">
    <a href="${u('index.html')}" class="brand">${logo(26)}<span>Monsoon</span></a>
    <button type="button" class="icon-btn" @click="S.nav = false" aria-label="Close navigation">${I.close}</button>
  </div>
  <nav class="site-nav-scroll" aria-label="Sections">
    <ul class="side-top">${TOP_NAV.map(([t, h, m]) => `<li><a href="${u(h)}" class="side-link${isActiveTop(m) ? ' is-current' : ''}">${t}</a></li>`).join('')}</ul>
    ${STATE.nav.map((g) => sideGroup(g, cur)).join('\n    ')}
  </nav>
</aside>
<div class="scrim" v-data :class="{ 'is-open': S.nav }" @click="S.nav = false" aria-hidden="true"></div>`;
}

export function tocNav(items) {
  if (!items.length) return '';
  return `<nav class="doc-toc" aria-label="On this page" v-data v-scrollspy v-scrollspy-class="is-active" v-scroll-offset="100">
  <p class="doc-toc-title">On this page</p>
  <ul>
    ${items.map(([id, text, depth = 2]) => `<li${depth > 2 ? ' class="toc-sub"' : ''}><a href="#${id}">${esc(text)}</a></li>`).join('\n    ')}
  </ul>
</nav>
<a href="#main" class="toc-top">Back to top</a>`;
}

export function prevNext() {
  const cur = current();
  const i = STATE.flat.findIndex((x) => x.href === cur);
  if (i < 0) return '';
  const card = (x, dir) =>
    x
      ? `<a href="${u(x.href)}" class="pn-card is-${dir}" rel="${dir}"><span class="pn-dir">${dir === 'next' ? `Next ${I.arrowRight}` : `${I.arrowLeft} Previous`}</span><span class="pn-title">${esc(x.label)}</span><span class="pn-sec">${esc(x.section)}</span></a>`
      : '<span></span>';
  return `<nav class="prev-next" aria-label="Previous and next page">${card(STATE.flat[i - 1], 'prev')}${card(STATE.flat[i + 1], 'next')}</nav>`;
}

/** The documentation app shell: sidebar, article, table of contents. */
export function docsShell({ crumbs, kicker = '', title, lead = '', body, toc = [], meta = '', aside = '', editPath = '' }) {
  return `<div class="docs-layout">
${sidebar()}
<main id="main" class="docs-main" tabindex="-1">
  <div class="docs-grid">
    <article class="docs-article" id="article">
      <header class="doc-head">
        <div class="doc-head-row">${breadcrumbs(crumbs)}<button type="button" class="copy-page" v-data @click="copyPage()" aria-label="Copy this page as Markdown">${I.copy}<span>Copy page</span></button></div>
        ${kicker ? `<p class="kicker">${esc(kicker)}</p>` : ''}
        <h1 class="doc-title">${title}</h1>
        ${lead ? `<p class="doc-lead">${lead}</p>` : ''}
        ${meta}
      </header>
      <div class="doc-body">
${body}
      </div>
      <footer class="doc-foot">
        ${prevNext()}
        <p class="doc-edit">${editPath ? `<a href="${REPO}/blob/main/${editPath}">Edit this page on GitHub</a><span aria-hidden="true">&middot;</span>` : ''}<span>Updated <time datetime="${LASTMOD}">October 13, 2026</time></span></p>
      </footer>
    </article>
    <aside class="docs-aside">
      ${tocNav(toc)}
      ${aside}
    </aside>
  </div>
</main>
</div>`;
}

// ---- Page ----

export function page({ path, title, description, body, layout = 'docs', jsonld = [], ogType = 'website', image = 'assets/og.png', imageAlt, head = '', noindex = false }) {
  const url = path === 'index.html' ? SITE : new URL(path, SITE).href;
  const img = new URL(image, SITE).href;
  const alt = imageAlt || 'Monsoon utility-first CSS framework with Mo the red panda mascot, one stylesheet from a CDN and a theme from one seed color';
  const ld = jsonld.length ? `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': jsonld }).replace(/</g, '\\u003c')}</script>` : '';
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${THEME_HEAD}
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
${noindex ? '<meta name="robots" content="noindex">' : `<link rel="canonical" href="${url}">`}
<meta name="author" content="Alexandre Kohler">
<meta name="theme-color" content="#3b5bdb">
<meta property="og:type" content="${ogType}">
<meta property="og:site_name" content="Monsoon">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${img}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(alt)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${img}">
<meta name="twitter:image:alt" content="${esc(alt)}">
<link rel="icon" href="${u('assets/favicon.svg')}" type="image/svg+xml">
<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
<link rel="stylesheet" href="${u('monsoon.min.css')}">
<link rel="stylesheet" href="${u('site.css')}">
<script src="${VOODOO}" data-manual defer></script>
<script type="module" src="${u('site.js')}"></script>
${head}${ld}
</head>
<body class="antialiased bg-background text-foreground layout-${layout}" data-root="${PREFIX || './'}">
${header()}
${layout === 'docs' ? body : `${sidebar()}\n<main id="main" tabindex="-1">\n${body}\n</main>`}
${footer()}
${searchDialog()}
</body>
</html>
`;
  return html.replace(/[ \t]+$/gm, '');
}
