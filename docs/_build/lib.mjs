// Shared helpers for the Monsoon docs build: escaping, a tiny inline markup,
// Shiki highlighting inside VS Code style frames, and the page layout.
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const BUILD = dirname(fileURLToPath(import.meta.url));
export const DOCS = join(BUILD, '..');
export const ROOT = join(DOCS, '..');
export const SITE = 'https://kwy404.github.io/monsoon/';
export const REPO = 'https://github.com/kwy404/monsoon';
export const NPM = 'https://www.npmjs.com/package/monsooncss';
export const CDN = 'https://cdn.jsdelivr.net/npm/monsooncss';
export const VOODOO = 'https://cdn.jsdelivr.net/npm/voodoojs@0.13.0/dist/voodoo.full.min.js';
export const LASTMOD = '2026-10-13';
export const VERSION = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')).version;
export const INDEX = JSON.parse(readFileSync(join(ROOT, 'scripts/classes.json'), 'utf8'));
export const BASE_COUNT = INDEX.classes.length;
export const VARIANT_COUNT = INDEX.classes.reduce((n, c) => n + c.variants.length, 0);
export const fmt = (n) => n.toLocaleString('en-US');

// ---- Shiki ----

const SHIKI = process.env.SHIKI_PATH || 'C:/Users/Hadouken Game Center/own/graphemely/node_modules/shiki/dist/index.mjs';
const { createHighlighter } = await import(pathToFileURL(SHIKI).href);
const LANGS = ['bash', 'html', 'css', 'js', 'json', 'php', 'python', 'erb', 'jinja'];
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
        .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, t, u) => `<a href="${u}">${t}</a>`);
    })
    .join('');
}

/** Plain text version of inline markup, for meta tags and JSON-LD. */
export const plain = (text) => String(text).replace(/`([^`]+)`/g, '$1').replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

export const slug = (s) => String(s).toLowerCase().replace(/<[^>]+>/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// ---- Code frames ----

const label = (text, bg, fg = '#ffffff', size = 7.2) =>
  `<svg class="file-icon" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><rect width="16" height="16" rx="3" fill="${bg}"/><text x="8" y="11.2" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="${size}" font-weight="700" fill="${fg}">${text}</text></svg>`;
const ICONS = {
  js: label('JS', '#f1dd35', '#1e1e1e'),
  json: label('{ }', '#cbcb41', '#1e1e1e', 6.4),
  html: label('&lt;/&gt;', '#e44d26', '#ffffff', 6),
  css: label('#', '#42a5f5'),
  php: label('php', '#777bb3', '#ffffff', 6),
  py: label('py', '#3572a5', '#ffffff', 6.6),
  erb: label('rb', '#cc342d', '#ffffff', 6.6),
  jinja: label('{%', '#b41717', '#ffffff', 6),
  terminal:
    '<svg class="file-icon" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><rect x=".5" y="1.5" width="15" height="13" rx="2.5" fill="none" stroke="currentColor"/><path d="m4 5.5 2.5 2.5L4 10.5M8 10.5h4" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
};
export function fileIcon(name) {
  const ext = /\.(\w+)$/.exec(name)?.[1] ?? name;
  const key = { mjs: 'js', cjs: 'js', htm: 'html', twig: 'html', python: 'py', rb: 'erb' }[ext] ?? ext;
  return ICONS[key] ?? ICONS.html;
}

export const copyButton = (id, what) =>
  `<button type="button" class="code-copy" v-cloak v-copy-from="#${id}" v-copy-label="Copied" aria-label="Copy ${esc(what)}">` +
  `<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M4 4V1.5A1.5 1.5 0 0 1 5.5 0h7A1.5 1.5 0 0 1 14 1.5v9a1.5 1.5 0 0 1-1.5 1.5H10v2.5A1.5 1.5 0 0 1 8.5 16h-7A1.5 1.5 0 0 1 0 14.5v-9A1.5 1.5 0 0 1 1.5 4H4Zm1.5 0h3A1.5 1.5 0 0 1 10 5.5v5h2.5V1.5h-7V4Zm-4 1.5v9h7v-9h-7Z"/></svg><span>Copy</span></button>`;

let counter = 0;
export const resetIds = () => {
  counter = 0;
};

const promptLines = (source) => ({
  line(node, line) {
    const text = source.split('\n')[line - 1] ?? '';
    if (text.trim() && !text.trim().startsWith('#')) this.addClassToHast(node, 'cmd');
  },
});

/** Highlighted <pre> only. */
export function pre(source, lang, { id, labelText = 'Code sample' } = {}) {
  const shell = lang === 'bash';
  const realId = id || `code-${++counter}`;
  const html = highlighter
    .codeToHtml(source.replace(/\n+$/, ''), {
      lang: LANGS.includes(lang) ? lang : 'text',
      themes: { light: 'light-plus', dark: 'dark-plus' },
      defaultColor: false,
      transformers: shell ? [promptLines(source)] : [],
    })
    .replace('<pre class="shiki', `<pre id="${realId}" class="${shell ? 'term ' : 'numbered '}shiki`)
    .replace(' tabindex="0"', ` tabindex="0" aria-label="${esc(labelText)}"`);
  return { id: realId, html };
}

/** A VS Code style editor window around a highlighted code sample. */
export function code(source, lang, title, { cls = '' } = {}) {
  if (lang === 'bash') return terminal(source, title);
  const { id, html } = pre(source, lang, { labelText: `${title} code` });
  return (
    `<figure class="window ${cls}" data-lang="${lang}">` +
    `<div class="window-bar"><span class="dots" aria-hidden="true"><i></i><i></i><i></i></span>` +
    `<span class="tab active">${fileIcon(title.includes('.') ? title : lang)}<span>${esc(title)}</span></span>${copyButton(id, `${title} code`)}</div>` +
    `${html}</figure>`
  );
}

/** A VS Code style integrated terminal around shell commands, with optional output. */
export function terminal(source, title = 'bash', output = '') {
  const { id, html } = pre(source, 'bash', { labelText: 'Terminal commands' });
  return (
    `<figure class="window" data-lang="bash">` +
    `<div class="window-bar"><span class="dots" aria-hidden="true"><i></i><i></i><i></i></span>` +
    `<span class="panel-tab">Terminal</span><span class="panel-shell">${ICONS.terminal}<span>${esc(title)}</span></span>` +
    `${copyButton(id, 'command')}</div>${html}${output ? `<pre class="term-out" aria-label="Command output"><code>${output}</code></pre>` : ''}</figure>`
  );
}

// ---- Icons ----

export function icon(name) {
  const svg = readFileSync(join(ROOT, 'assets/icons', `${name}.svg`), 'utf8')
    .replace(/<title>[^<]*<\/title>/, '')
    .replace('<svg ', '<svg aria-hidden="true" focusable="false" ')
    .trim();
  return svg;
}

const GH = '<svg viewBox="0 0 16 16" width="20" height="20" aria-hidden="true" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8Z"/></svg>';
export const githubIcon = GH;

// ---- Layout ----

export const guidesNav = [];

const NAV = [
  ['Playground', 'index.html#playground'],
  ['Components', 'components.html'],
  ['Classes', 'classes.html'],
  ['Guides', 'index.html#guides'],
];

function header(active) {
  const link = ([text, href]) => {
    const on = active === text;
    return `<a href="${href}" class="rounded-md px-3 py-2 text-sm font-medium transition-colors ${on ? 'text-foreground bg-muted' : 'text-muted-foreground hover:text-foreground'}"${on ? ' aria-current="page"' : ''}>${text}</a>`;
  };
  const mobileLink = ([text, href]) =>
    `<a href="${href}" class="block rounded-lg px-3 py-2.5 text-base font-medium text-foreground hover:bg-muted" @click="menu = false">${text}</a>`;
  return `
<a href="#main" class="skip-link fixed top-2 left-2 z-50 rounded-md bg-primary text-primary-foreground px-3 py-2 text-sm font-medium">Skip to content</a>
<header class="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md" v-data="{ menu: false }" @keydown.escape="menu = false">
  <div class="mx-auto max-w-7xl flex items-center justify-between gap-4 px-4 sm:px-6 h-16">
    <a href="index.html" class="flex items-center gap-2.5 font-bold tracking-tight text-lg" aria-label="Monsoon home">
      <img src="assets/favicon.svg" width="32" height="32" alt="" class="size-8">
      <span>Monsoon</span>
      <span class="hidden sm:inline-block rounded-full border bg-surface px-2 py-0.5 text-xs font-medium text-muted-foreground">v${VERSION}</span>
    </a>
    <nav class="hidden md:flex items-center gap-1" aria-label="Main">
      ${NAV.map(link).join('\n      ')}
    </nav>
    <div class="flex items-center gap-1">
      <a href="${REPO}" class="hidden sm:inline-flex items-center justify-center size-10 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" aria-label="Monsoon on GitHub">${GH}</a>
      <button type="button" class="theme-btn inline-flex items-center justify-center size-10 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" v-theme-toggle aria-label="Switch between light and dark theme">
        <svg class="moon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>
        <svg class="sun" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
      </button>
      <button type="button" class="md:hidden inline-flex items-center justify-center size-10 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted" @click="menu = !menu" :aria-expanded="menu ? 'true' : 'false'" aria-expanded="false" aria-controls="mobile-menu" aria-label="Open menu">
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
      </button>
    </div>
  </div>
  <nav id="mobile-menu" class="md:hidden border-t bg-background px-4 py-3 space-y-1" v-show="menu" v-cloak aria-label="Mobile">
    ${NAV.map(mobileLink).join('\n    ')}
    <a href="${REPO}" class="block rounded-lg px-3 py-2.5 text-base font-medium text-foreground hover:bg-muted">GitHub</a>
  </nav>
</header>`;
}

export const MORE = [
  ['graphemely', 'https://kwy404.github.io/graphemely/', 'Truncate, slice and count strings with emoji safely.'],
  ['edgegoat', 'https://kwy404.github.io/edgegoat/', 'Edge case test inputs for time zones, DST, unicode and numbers.'],
  ['vueleap', 'https://kwy404.github.io/vueleap/', 'Migrate Vue 2 to Vue 3 with one command.'],
  ['numberparrot', 'https://kwy404.github.io/numberparrot/', 'Parse localized number and currency strings.'],
  ['breakhound', 'https://kwy404.github.io/breakhound/', 'Find bugs in any JavaScript library automatically.'],
  ['Voodoo.js', 'https://github.com/kwy404/Voodoo.js', 'JSX and reactivity from a plain HTML file.'],
];

function footer() {
  const col = (title, links) => `
      <div>
        <h2 class="text-sm font-semibold text-foreground">${title}</h2>
        <ul class="mt-4 space-y-2.5 text-sm">
          ${links.map(([t, h]) => `<li><a href="${h}" class="text-muted-foreground hover:text-foreground transition-colors">${t}</a></li>`).join('\n          ')}
        </ul>
      </div>`;
  return `
<footer class="border-t bg-surface-2">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
    <div class="lg:col-span-2 space-y-4">
      <a href="index.html" class="inline-flex items-center gap-2.5 font-bold text-lg"><img src="assets/favicon.svg" width="32" height="32" alt="" class="size-8">Monsoon</a>
      <p class="text-sm text-muted-foreground max-w-sm">Utility-first CSS with no build step. One stylesheet from a CDN, a whole theme from one seed color, dark mode included.</p>
      <p class="text-sm text-muted-foreground">Interactive parts built with <a href="https://github.com/kwy404/Voodoo.js" class="font-medium text-foreground underline underline-offset-4 decoration-primary">Voodoo.js</a>.</p>
    </div>${col('Docs', [
      ['Quick start', 'index.html#quick-start'],
      ['Seed playground', 'index.html#playground'],
      ['Components', 'components.html'],
      ['Class reference', 'classes.html'],
      ['Purge CLI', 'index.html#purge'],
      ['Changelog', `${REPO}/blob/main/CHANGELOG.md`],
    ])}${col('Guides', guidesNav.slice(0, 6).map((g) => [g.short, `${g.slug}.html`]))}
    <div>
      <h2 class="text-sm font-semibold text-foreground">More from kwy404</h2>
      <ul class="mt-4 space-y-2.5 text-sm">
        ${MORE.map(([t, h, d]) => `<li><a href="${h}" class="text-muted-foreground hover:text-foreground transition-colors" title="${esc(d)}">${t}</a></li>`).join('\n        ')}
      </ul>
    </div>
  </div>
  <div class="border-t">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 py-6 flex flex-col sm:flex-row gap-3 sm:items-center justify-between text-sm text-muted-foreground">
      <p>MIT License. Made by <a href="https://github.com/kwy404" class="text-foreground hover:underline">Alexandre Kohler</a>.</p>
      <p class="flex gap-4"><a href="${REPO}" class="hover:text-foreground">GitHub</a><a href="${NPM}" class="hover:text-foreground">npm</a><a href="${REPO}/issues" class="hover:text-foreground">Issues</a></p>
    </div>
  </div>
</footer>`;
}

export function breadcrumbs(items) {
  return `<nav aria-label="Breadcrumb"><ol class="crumbs flex flex-wrap items-center text-sm text-muted-foreground">${items
    .map(([name, href], i) =>
      i === items.length - 1
        ? `<li aria-current="page" class="text-foreground font-medium">${esc(name)}</li>`
        : `<li><a href="${href}" class="hover:text-foreground">${esc(name)}</a></li>`,
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

/** FAQ accordion with Voodoo.js. */
export function faqList(faqs, { headingLevel = 3 } = {}) {
  const h = `h${headingLevel}`;
  return `<div class="divide-y rounded-2xl border bg-surface" v-accordion>
${faqs
  .map(
    ([q, a], i) => `  <div class="px-5" v-accordion-item${i === 0 ? '="open"' : ''}>
    <${h} class="text-base font-semibold"><button type="button" class="w-full py-4 text-left">${md(q)}</button></${h}>
    <div class="pb-5 text-muted-foreground leading-relaxed space-y-3"><p>${md(a)}</p></div>
  </div>`,
  )
  .join('\n')}
</div>`;
}

export function page({ path, title, description, body, active = '', jsonld = [], ogType = 'website', image = 'assets/og.png', imageAlt }) {
  const url = path === 'index.html' ? SITE : new URL(path, SITE).href;
  const img = new URL(image, SITE).href;
  const alt = imageAlt || 'Monsoon utility-first CSS framework with Mo the red panda mascot, one stylesheet from a CDN and a theme from one seed color';
  const ld = jsonld.length ? `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': jsonld }).replace(/</g, '\\u003c')}</script>` : '';
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${url}">
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
<link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
<link rel="stylesheet" href="monsoon.min.css">
<link rel="stylesheet" href="site.css">
<script>try{var t=localStorage.getItem('voodoo:theme');try{t=JSON.parse(t)}catch(e){}if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t)}catch(e){}</script>
<script src="${VOODOO}" data-manual defer></script>
<script type="module" src="site.js"></script>
${ld}
</head>
<body class="antialiased bg-background text-foreground">
${header(active)}
<main id="main">
${body}
</main>
${footer()}
</body>
</html>
`;
  return html.replace(/[ \t]+$/gm, '');
}

/** Section heading block used across pages. */
export function sectionHead(kicker, title, lead, { id, center = true } = {}) {
  return `<div class="${center ? 'mx-auto text-center' : ''} max-w-3xl mb-12">
  <p class="text-sm font-semibold uppercase tracking-widest text-primary">${kicker}</p>
  <h2${id ? ` id="${id}"` : ''} class="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-balance">${title}</h2>
  ${lead ? `<p class="mt-4 text-lg text-muted-foreground text-pretty">${lead}</p>` : ''}
</div>`;
}
