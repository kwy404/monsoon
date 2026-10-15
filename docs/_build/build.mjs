// Builds the Monsoon documentation site into docs/.
//
//   npm run build && node docs/_build/build.mjs
//
// Reads dist/monsoon.min.css, scripts/classes.json and the component manifests
// in src/components/*.json at build time, renders every page with Shiki
// highlighted code (VS Code Light+ and Dark+), and writes the search index,
// sitemap.xml and robots.txt. Missing or half written manifests and content
// modules are skipped with a log line. Set SHIKI_PATH to point at another copy
// of shiki/dist/index.mjs if the default path does not exist on your machine.
import { writeFileSync, copyFileSync, mkdirSync, readFileSync, existsSync, rmSync, cpSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import {
  DOCS, ROOT, SITE, LASTMOD, STATE, INDEX, GUIDE_FILES, MISSING_ART, VERSION, at, resetIds, highlighter, plain, pre, I, fmt, esc,
} from './lib.mjs';
import { loadManifests, componentCss, categories, variantTemplates, sizeOf } from './data.mjs';
import { pageText } from './blocks.mjs';

const t0 = Date.now();
const log = (...a) => console.log(...a);

// ---- Assets ----

mkdirSync(join(DOCS, 'assets'), { recursive: true });
copyFileSync(join(ROOT, 'dist/monsoon.min.css'), join(DOCS, 'monsoon.min.css'));
for (const f of ['favicon.svg', 'mascot.svg', 'mascot-dark.svg', 'og.png', 'mascot-head.svg']) {
  if (existsSync(join(ROOT, 'assets', f))) copyFileSync(join(ROOT, 'assets', f), join(DOCS, 'assets', f));
}
if (existsSync(join(ROOT, 'assets/art'))) cpSync(join(ROOT, 'assets/art'), join(DOCS, 'assets/art'), { recursive: true });
// Special dates: draw the seasonal art, copy it, and ship seasons.js minified.
{
  const { writeSeasonArt } = await import('./seasons-art.mjs');
  writeSeasonArt(ROOT);
  rmSync(join(DOCS, 'assets/seasons'), { recursive: true, force: true });
  cpSync(join(ROOT, 'assets/seasons'), join(DOCS, 'assets/seasons'), { recursive: true, filter: (src) => !src.endsWith('.js') });
  const source = readFileSync(join(ROOT, 'assets/seasons/seasons.js'), 'utf8');
  let out = source;
  try {
    out = (await import('esbuild')).transformSync(source, { minify: true, target: 'es2017' }).code;
  } catch (e) {
    log(`  seasons.js copied without minifying (${e.message.split('\n')[0]})`);
  }
  writeFileSync(join(DOCS, 'seasons.js'), out);
}

// ---- Data ----

const size = await sizeOf(join(ROOT, 'dist/monsoon.min.css'));
STATE.brotli = size.brotli;
STATE.gzip = size.gzip;

try {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 4000);
  const res = await fetch('https://api.github.com/repos/kwy404/monsoon', { signal: ctl.signal, headers: { 'User-Agent': 'monsoon-docs-build' } });
  clearTimeout(timer);
  if (res.ok) STATE.stars = (await res.json()).stargazers_count;
} catch {
  log('  GitHub star count not available at build time, the page fetches it');
}

log(`data ready in ${((Date.now() - t0) / 1000).toFixed(1)} s, reading component manifests`);
const groups = loadManifests(log);
STATE.groups = groups;
STATE.components = groups.flatMap((g) => g.components.map((c) => ({ ...c, file: g.file.replace('.json', '.css') })));
STATE.compCss = componentCss();
const cats = categories();
// Fluid type and spacing live in typography and spacing; they also get a page of their own.
const fluid = INDEX.classes.filter((c) => /(^|-)fluid-/.test(c.class));
if (fluid.length) cats.set('fluid', fluid);
const templates = variantTemplates(readFileSync(join(ROOT, 'dist/monsoon.css'), 'utf8'));

async function optional(rel, name) {
  const path = join(DOCS, '_build', rel);
  if (!existsSync(path)) {
    log(`  ${rel} not found, skipped`);
    return [];
  }
  try {
    const mod = await import(`${pathToFileURL(path).href}?t=${Date.now()}`);
    const list = mod[name];
    if (!Array.isArray(list)) throw new Error(`no ${name} export`);
    return list.filter((g) => g && g.slug && g.title && Array.isArray(g.sections));
  } catch (e) {
    log(`  ${rel} could not be loaded (${e.message}), skipped`);
    return [];
  }
}
const gettingStarted = await optional('content/getting-started.mjs', 'gettingStarted');
const installGuides = await optional('content/install-guides.mjs', 'installGuides');

(await import('./content/augment.mjs')).augment(gettingStarted, INDEX);

// The optional interactive layer: copy the scripts and document them.
const JS_FILE = join(ROOT, 'dist/monsoon.js');
STATE.hasJs = existsSync(JS_FILE);
if (STATE.hasJs) {
  copyFileSync(JS_FILE, join(DOCS, 'monsoon.js'));
  if (existsSync(join(ROOT, 'dist/monsoon.esm.js'))) copyFileSync(join(ROOT, 'dist/monsoon.esm.js'), join(DOCS, 'monsoon.esm.js'));
}
// The arbitrary value engine on its own, for the pages that demo arbitrary values.
const ARB_FILE = join(ROOT, 'dist/monsoon-arbitrary.js');
if (existsSync(ARB_FILE)) copyFileSync(ARB_FILE, join(DOCS, 'monsoon-arbitrary.js'));
{
  const { needsJs } = await import('./pages/components.mjs');
  const { interactivePage } = await import('./content/interactive.mjs');
  const jsSize = STATE.hasJs ? (await sizeOf(JS_FILE)).gzip : '';
  const page = interactivePage({ comps: STATE.components.filter(needsJs), size: jsSize, version: VERSION });
  const at = gettingStarted.findIndex((g) => g.slug === 'purge-cli');
  gettingStarted.splice(at >= 0 ? at + 1 : gettingStarted.length, 0, page);
}
{
  const { arbitraryPage } = await import('./content/arbitrary.mjs');
  const arbSize = existsSync(ARB_FILE) ? (await sizeOf(ARB_FILE)).brotli : '';
  const jsBrotli = STATE.hasJs ? (await sizeOf(JS_FILE)).brotli : '';
  const page = arbitraryPage({ size: arbSize, jsSize: jsBrotli, version: VERSION });
  const at = gettingStarted.findIndex((g) => g.slug === 'variants');
  gettingStarted.splice(at >= 0 ? at + 1 : gettingStarted.length, 0, page);
}

// Showcase templates written as standalone pages in _build/showcase.
const SHOW_DIR = join(DOCS, '_build/showcase');
let showcase = [];
if (existsSync(join(SHOW_DIR, 'index.json'))) {
  try {
    showcase = JSON.parse(readFileSync(join(SHOW_DIR, 'index.json'), 'utf8'))
      .filter((s) => existsSync(join(SHOW_DIR, `${s.slug}.html`)))
      .map((s) => {
        const source = readFileSync(join(SHOW_DIR, `${s.slug}.html`), 'utf8');
        return { ...s, source, lines: source.split('\n').length };
      });
  } catch (e) {
    log(`  showcase index could not be read (${e.message})`);
  }
} else log('  showcase templates not found, skipped');

// Showcase apps written by others into docs/showcase/<slug>/, listed in docs/showcase/apps.json.
let apps = [];
const APPS = process.env.MONSOON_APPS_JSON || join(DOCS, 'showcase/apps.json');
if (existsSync(APPS)) {
  try {
    const raw = JSON.parse(readFileSync(APPS, 'utf8'));
    const norm = (p) => {
      if (!p) return '';
      let x = String(p).replace(/^\.?\//, '');
      if (!x.startsWith('showcase/')) x = `showcase/${x}`;
      return x.endsWith('/') ? `${x}index.html` : x;
    };
    apps = (Array.isArray(raw) ? raw : raw.apps || [])
      .filter((a) => a && a.slug)
      .map((a) => {
        const href = norm(a.path || `${a.slug}/index.html`);
        const thumb = norm(a.thumbnail || a.thumb || '');
        const source = existsSync(join(DOCS, href)) ? readFileSync(join(DOCS, href), 'utf8') : '';
        return { ...a, title: a.title || a.name, description: a.description || '', href, thumb: thumb && existsSync(join(DOCS, thumb)) ? thumb : '', app: true, srcId: `app-${a.slug}`, file: 'index.html', source, lines: source.split('\n').length, tags: a.tags || ['app', 'no build'] };
      })
      .filter((a) => {
        if (!a.source) log(`  showcase app ${a.slug} has no page yet, skipped`);
        return a.source;
      });
  } catch (e) {
    log(`  showcase apps.json could not be read (${e.message})`);
  }
}
const gallery = [...apps, ...showcase];

// Real purge output for the landing page terminals.
function runPurge() {
  const out = join(tmpdir(), 'monsoon-docs-purge.css');
  const start = Date.now();
  try {
    const run = spawnSync(process.execPath, [join(ROOT, 'bin/monsoon.mjs'), 'purge', 'demo/**/*.html', '-o', out], { cwd: ROOT, encoding: 'utf8' });
    if (run.status !== 0) throw new Error(run.stderr || 'purge failed');
    const text = `${run.stdout || ''}${run.stderr || ''}`;
    const ms = Date.now() - start;
    const plainOut = text.trim().split(out.replace(/\\/g, '/')).join('public/monsoon.css').split(out).join('public/monsoon.css');
    const purged = /([\d.]+ kB) brotli/.exec(plainOut)?.[1] || '';
    const lines = text
      .trim()
      .split('\n')
      .map((l) => esc(l.split(out.replace(/\\/g, '/')).join('public/monsoon.css').split(out).join('public/monsoon.css')))
      .map((l) => (/brotli/.test(l) ? l.replace(/([\d.]+ kB brotli)/, '<span class="t-ok">$1</span>') : `<span class="t-dim">${l}</span>`));
    lines.push(`<span class="t-ok">done</span> <span class="t-dim">in ${(ms / 1000).toFixed(1)} s, size report included</span>`);
    return { lines, plain: plainOut, purged };
  } catch (e) {
    log(`  purge run failed: ${e.message.split('\n')[0]}`);
    return { lines: ['<span class="t-dim">monsooncss purge: scanned 1 file</span>', '<span class="t-ok">done</span>'], plain: 'monsooncss purge: scanned 1 file', purged: 'a few kB' };
  }
}
const purge = runPurge();
const SUBS = { '%BASE%': fmt(INDEX.classes.length), '%VARIANTS%': fmt(INDEX.classes.reduce((n, c) => n + c.variants.length, 0)), '%BROTLI%': size.brotli, '%GZIP%': size.gzip, '%RAW%': size.raw, '%PURGED%': purge.purged, '%PURGE_OUT%': purge.plain };
const subst = (v) => (typeof v === 'string' ? v.replace(/%[A-Z_]+%/g, (m) => SUBS[m] ?? m) : Array.isArray(v) ? v.map(subst) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, subst(x)])) : v);
const guides = subst((await import('./pages/guides-content.mjs')).guides);
STATE.guides = guides;
for (const g of guides) GUIDE_FILES.add(`${g.slug}.html`);
log(`content and purge ready in ${((Date.now() - t0) / 1000).toFixed(1)} s`);

// ---- Navigation ----

const { CAT_INFO, utilityPage } = await import('./pages/utilities.mjs');
const docHref = (s) => `docs/${s}.html`;
const startItems = gettingStarted.map((g) => ({ label: g.nav || g.title, href: docHref(g.slug) }));
const installIdx = startItems.findIndex((x) => x.href === 'docs/installation-npm.html');
if (installGuides.length) {
  startItems.splice(installIdx >= 0 ? installIdx + 1 : startItems.length, 0, {
    title: 'Install by framework',
    sub: true,
    count: installGuides.length,
    items: installGuides.map((g) => ({ label: g.nav || g.stack || g.title, href: docHref(g.slug) })),
  });
}
STATE.nav = [
  { title: 'Getting started', icon: I.rocket, open: true, items: startItems },
  {
    title: 'Components',
    icon: I.box,
    count: STATE.components.length,
    items: [
      { label: 'Overview', href: 'components.html' },
      ...groups.map((g) => ({ title: g.title, sub: true, count: g.components.length, items: g.components.map((c) => ({ label: c.name, href: `components/${c.slug}.html` })) })),
    ],
  },
  { title: 'Utilities', icon: I.layers, count: cats.size, items: [...cats.keys()].map((c) => ({ label: (CAT_INFO[c] || [c])[0], href: `utilities/${c}.html`, badge: fmt(cats.get(c).length) })) },
  { title: 'Reference', icon: I.code, items: [{ label: 'Why Monsoon', href: 'why.html' }, { label: 'Class reference', href: 'classes.html' }, { label: 'Playground', href: 'playground.html' }, { label: 'Page builder', href: 'builder.html' }, { label: 'Showcase', href: 'showcase.html' }] },
  { title: 'Guides', icon: I.book, items: guides.map((g) => ({ label: g.short, href: `${g.slug}.html` })) },
];
const flatten = (items, section) => items.flatMap((it) => (it.items ? flatten(it.items, it.sub ? it.title : section) : [{ ...it, section }]));
STATE.flat = STATE.nav.flatMap((g) => flatten(g.items, g.title)).filter((x, i, a) => a.findIndex((y) => y.href === x.href) === i);

// ---- Pages ----

const { home } = await import('./pages/home.mjs');
const { componentPage, componentsIndex } = await import('./pages/components.mjs');
const { classesPage, compactIndex } = await import('./pages/classes.mjs');
const { contentPage } = await import('./pages/docs.mjs');
const { showcasePage, playgroundPage, notFound } = await import('./pages/misc.mjs');
const { whyPage } = await import('./pages/why.mjs');
const { builderPage } = await import('./pages/builder.mjs');
const { builderBlocks } = await import('./content/builder-blocks.mjs');
const { reasons } = await import('./content/why.mjs');
const { needsJs: usesJs } = await import('./pages/components.mjs');
const why = reasons({
  components: STATE.components.length,
  noJs: STATE.components.filter((c) => !usesJs(c)).length,
  installGuides: installGuides.length,
  brotli: size.brotli,
  version: VERSION,
  classes: INDEX.classes.length,
});

// Generated folders are rebuilt from scratch so removed pages do not linger.
for (const dir of ['components', 'utilities', 'docs', 'showcase/src']) rmSync(join(DOCS, dir), { recursive: true, force: true });
// docs/showcase also holds app folders written by others: only our own template files are replaced.
for (const dir of ['components', 'utilities', 'docs', 'showcase/src']) mkdirSync(join(DOCS, dir), { recursive: true });

const pages = [];
const add = (file, render, priority = '0.6') => pages.push([file, render, priority]);

add('index.html', () => home({ purge, showcase: gallery, guides, why }), '1.0');
add('why.html', () => whyPage(why), '0.9');
add('components.html', () => componentsIndex(groups), '0.9');
add('classes.html', classesPage, '0.8');
add('showcase.html', () => showcasePage(gallery), '0.8');
add('playground.html', playgroundPage, '0.7');
add('builder.html', builderPage, '0.7');
const startCrumb = (g) => [['Docs', 'docs/introduction.html'], ['Getting started', 'docs/introduction.html'], [g.nav || g.title, docHref(g.slug)]];
for (const g of gettingStarted) add(docHref(g.slug), () => contentPage(g, { file: docHref(g.slug), kind: 'start', crumbs: startCrumb(g) }), '0.8');
for (const g of installGuides)
  add(docHref(g.slug), () => contentPage(g, {
    file: docHref(g.slug),
    kind: 'install',
    crumbs: [['Docs', 'docs/introduction.html'], ['Installation', 'docs/installation-npm.html'], [g.nav || g.stack, docHref(g.slug)]],
  }), '0.7');
for (const g of guides)
  add(`${g.slug}.html`, () => contentPage(g, {
    file: `${g.slug}.html`,
    kind: 'guide',
    crumbs: [['Docs', 'docs/introduction.html'], ['Guides', `${guides[0].slug}.html`], [g.short, `${g.slug}.html`]],
    related: (g.related || []).map((r) => guides.find((x) => x.slug === r)).filter(Boolean).map((r) => ({ href: `${r.slug}.html`, kicker: r.kicker, title: r.title, desc: r.blurb })),
  }), '0.7');
for (const c of STATE.components) add(`components/${c.slug}.html`, () => componentPage(c, STATE.components), '0.6');
for (const [cat, list] of cats) add(`utilities/${cat}.html`, () => utilityPage(cat, list, cats), '0.6');

for (const [file, render] of pages) {
  at(file);
  resetIds();
  mkdirSync(dirname(join(DOCS, file)), { recursive: true });
  const ts = Date.now();
  writeFileSync(join(DOCS, file), render());
  if (Date.now() - ts > 1500) log(`  slow page ${file}: ${((Date.now() - ts) / 1000).toFixed(1)} s`);
}
// Articles removed in October 2026 keep their address and send readers to the closest page.
const MOVED = {
  'utility-first-css-without-a-build-step.html': ['docs/introduction.html', 'Introduction'],
  'no-build-css-framework.html': ['docs/introduction.html', 'Introduction'],
  'css-framework-from-a-cdn.html': ['docs/installation-cdn.html', 'Install from a CDN'],
  'dark-mode-with-one-line-of-css.html': ['docs/dark-mode.html', 'Dark mode'],
  'container-queries-utility-classes.html': ['docs/container-queries.html', 'Container queries'],
  'css-utilities-for-php-wordpress-django-rails.html': ['docs/install-php.html', 'Install Monsoon in PHP'],
};
for (const [from, [to, name]] of Object.entries(MOVED)) {
  const href = new URL(to, SITE).href;
  writeFileSync(join(DOCS, from), `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(name)} | Monsoon</title>
<meta name="robots" content="noindex">
<link rel="canonical" href="${href}">
<link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
<meta http-equiv="refresh" content="0; url=${to}">
</head>
<body>
<p>This page moved to <a href="${to}">${esc(name)}</a>.</p>
</body>
</html>
`);
}
at('404.html');
resetIds();
writeFileSync(join(DOCS, '404.html'), notFound());

// Showcase pages are copied as they are, with their highlighted source next to them.
for (const a of apps) {
  writeFileSync(join(DOCS, 'showcase/src', `${a.srcId}.html`), pre(a.source, 'html', { id: `src-${a.srcId}`, labelText: `${a.title} source` }).html);
  pages.push([a.href, null, '0.6']);
}
for (const s of showcase) {
  writeFileSync(join(DOCS, 'showcase', `${s.slug}.html`), s.source);
  at(`showcase/src/${s.slug}.html`);
  writeFileSync(join(DOCS, 'showcase/src', `${s.slug}.html`), pre(s.source, 'html', { id: `src-${s.slug}`, labelText: `${s.title} source` }).html);
  pages.push([`showcase/${s.slug}.html`, null, '0.6']);
}

// ---- Indexes ----

writeFileSync(join(DOCS, 'classes.json'), JSON.stringify(compactIndex(templates, STATE.compCss)));
// Component sources for the copy buttons on the components index, loaded on demand.
writeFileSync(join(DOCS, 'components-src.json'), JSON.stringify(Object.fromEntries(STATE.components.map((c) => [c.slug, c.html]))));

const entries = [];
const pushEntry = (kind, group, title, url, sub, text = '') => entries.push([kind, group, title, url, plain(sub || ''), String(text).slice(0, 400).toLowerCase()]);
for (const g of gettingStarted) pushEntry('doc', 'Getting started', g.nav || g.title, docHref(g.slug), g.description, pageText(g));
for (const g of installGuides) pushEntry('doc', 'Installation', `Install in ${g.stack || g.nav}`, docHref(g.slug), g.description, `${g.nav} ${g.stack} install ${pageText(g)}`);
for (const g of guides) pushEntry('guide', 'Guides', g.title, `${g.slug}.html`, g.blurb, pageText(g));
for (const c of STATE.components) pushEntry('component', 'Components', c.name, `components/${c.slug}.html`, c.description, `${c.slug} ${c.classes.join(' ')} ${c.groupTitle}`);
for (const [cat, list] of cats) pushEntry('utility', 'Utilities', `${(CAT_INFO[cat] || [cat])[0]} utilities`, `utilities/${cat}.html`, `${fmt(list.length)} classes`, (CAT_INFO[cat] || ['', ''])[1]);
for (const [title, url, sub, text] of [
  ['Home', 'index.html', 'Monsoon overview', 'landing live editor responsive seed dark mode showcase'],
  ['All components', 'components.html', 'Searchable component gallery', 'components gallery'],
  ['Class reference', 'classes.html', 'Search every class with its CSS', 'classes reference css variants'],
  ['Showcase', 'showcase.html', 'Full page templates', 'templates examples landing dashboard pricing blog portfolio auth'],
  ['Playground', 'playground.html', 'Edit HTML live', 'playground editor try'],
  ['Page builder', 'builder.html', 'Drag blocks into a page and copy the HTML', 'builder drag drop blocks landing page template layout'],
  ['Why Monsoon', 'why.html', `${why.length} differentiators with live demos`, why.map((r) => r.title).join(' ')],
]) pushEntry('page', 'Pages', title, url, sub, text);
for (const s of gallery) pushEntry('page', 'Showcase', s.title, s.href || `showcase/${s.slug}.html`, s.description, (s.tags || []).join(' '));
// Every h2 and h3 of the written docs, so search can open the exact section.
const plainHtml = (h) => h.replace(/<a [^>]*class="anchor"[^>]*>.*?<\/a>/g, '').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').trim();
for (const [file, render] of pages) {
  // Framework install pages share their section names, so only the core docs and guides are split up.
  if (!render || file.startsWith('docs/install-') || !(file.startsWith('docs/') || GUIDE_FILES.has(file))) continue;
  const html = readFileSync(join(DOCS, file), 'utf8');
  const title = plainHtml(/<h1 class="doc-title">([\s\S]*?)<\/h1>/.exec(html)?.[1] || file);
  for (const m of html.matchAll(/<h([23]) id="([^"]+)" class="doc-h[23]">([\s\S]*?)<\/h\1>/g)) {
    const text = plainHtml(m[3]);
    if (!text || /^(faq|frequently asked questions)$/i.test(text)) continue;
    pushEntry('section', 'Sections', text, `${file}#${m[2]}`, title, title);
  }
}
const catNames = [...new Set(INDEX.classes.map((c) => c.category))];
const classRows = INDEX.classes.map((c) => [c.class, catNames.indexOf(c.category), (/\{\n\s*([^\n]*)/.exec(c.css)?.[1] || '').replace(/;$/, '')]);
writeFileSync(join(DOCS, 'search-index.json'), JSON.stringify({ v: LASTMOD, entries, cats: catNames, classes: classRows }));

const urls = pages
  .map(([file, , priority]) => `  <url>\n    <loc>${file === 'index.html' ? SITE : SITE + file}</loc>\n    <lastmod>${LASTMOD}</lastmod>\n    <priority>${priority}</priority>\n  </url>`)
  .join('\n');
writeFileSync(join(DOCS, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
writeFileSync(join(DOCS, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}sitemap.xml\n`);
highlighter.dispose();

// ---- Checks ----

// Every class used in generated pages must exist in Monsoon or in site.css.
const known = new Set(INDEX.classes.map((c) => c.class));
for (const c of INDEX.classes) for (const v of c.variants) known.add(`${v}:${c.class}`);
for (const k of STATE.compCss.keys()) known.add(k);
// Hook classes that only exist for scripts or as styling scopes.
for (const k of ['layout-docs', 'layout-landing', 'live', 'resp', 'hiw', 'ease-demo', 'dt', 'comp-group', 'is-prev', 'is-next', 'ref-q', 'demo-inner', 'callout-note', 'peer', 'group', 'try-text', 'role-modifier', 'role-part', 'dark', 'light', 'hiw-win', 'sq-linear', 'is-app', 'ex-btn-label', 'ex-target', 'bl', 'bl-group']) known.add(k);
for (const m of readFileSync(join(DOCS, 'site.css'), 'utf8').matchAll(/\.((?:\\.|[\w-])+)/g)) known.add(m[1].replace(/\\/g, ''));
const { parseClass } = await import('../../src/arbitrary/index.mjs');
const unknown = new Map();
for (const [file, render] of pages) {
  if (!render) continue;
  const html = readFileSync(join(DOCS, file), 'utf8').replace(/<pre[\s\S]*?<\/pre>/g, '').replace(/<script[\s\S]*?<\/script>/g, '').replace(/srcdoc="[^"]*"/g, '');
  for (const m of html.matchAll(/\sclass="([^"]*)"/g))
    for (const c of m[1].split(/\s+/)) if (c && !known.has(c) && !parseClass(c)) unknown.set(c, (unknown.get(c) || new Set()).add(file));
}
// Builder blocks live in a JSON script, so check their classes here.
for (const b of builderBlocks)
  for (const m of b.html.matchAll(/\sclass="([^"]*)"/g))
    for (const c of m[1].split(/\s+/)) if (c && !known.has(c) && !parseClass(c)) unknown.set(c, (unknown.get(c) || new Set()).add(`builder block ${b.key}`));
if (unknown.size) {
  log(`unknown classes (${unknown.size}):`);
  for (const [c, files] of [...unknown].slice(0, 80)) log(`  ${c}  (${[...files].slice(0, 3).join(', ')}${files.size > 3 ? ', ...' : ''})`);
}
if (MISSING_ART.size) log(`art not found yet, placeholder used: ${[...MISSING_ART].join(', ')}`);

log(`built ${pages.length + 1} pages in ${((Date.now() - t0) / 1000).toFixed(1)} s: ${gettingStarted.length} getting started, ${installGuides.length} install guides, ${guides.length} guides, ${STATE.components.length} components, ${cats.size} utility categories, ${showcase.length} showcase templates`);
log(`stylesheet ${size.raw} raw, ${size.gzip} gzip, ${size.brotli} brotli`);
