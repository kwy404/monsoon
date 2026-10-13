// Renders every component example from the four manifests, light and dark side
// by side, into static HTML pages for visual review.
//
//   node scripts/showcase.mjs <out-dir> [per-page] [open]
//
// Writes <out-dir>/showcase-01.html, showcase-02.html, ... (per-page examples
// each, 8 by default) that load dist/monsoon.css from this repository. Each
// cell is a containing block for fixed elements, so drawers, toasts, docks and
// floating buttons stay inside their own example. With "open", only the
// overlays are rendered, opened: dialogs, drawers, dropdowns and popovers.
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { componentManifests } from '../src/components/index.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = resolve(process.argv[2] || join(root, 'showcase'));
const perPage = Number(process.argv[3]) || 8;
const openMode = process.argv[4] === 'open';
const OVERLAYS = new Set(['drawer', 'drawer-dialog', 'modal', 'sheet', 'popover', 'dropdown', 'context-menu', 'command-palette', 'lightbox', 'mega-menu', 'navbar', 'tooltip', 'fab', 'toast', 'select-custom']);
const opened = (html) => html
  .replace(/<dialog(?![^>]*\sopen)/g, '<dialog open')
  .replace(/<details class="(dropdown|mega-menu|navbar-mobile)/g, '<details open class="$1')
  .replace(/class="drawer-toggle"/g, 'class="drawer-toggle" checked')
  .replace(/class="tooltip/g, 'class="tooltip-open tooltip')
  .replace(/class="fab"/g, 'class="fab fab-open"');
const cssHref = pathToFileURL(join(root, 'dist/monsoon.css')).href;

const items = componentManifests()
  .flatMap((m) => m.components.map((c) => ({ group: m.title, ...c })))
  .filter((c) => !openMode || OVERLAYS.has(c.slug))
  .map((c) => (openMode ? { ...c, html: opened(c.html) } : c));

// The dark copy gets its own ids and radio names so both copies keep their state.
const twin = (html) => html.replace(/\b(id|for|name|popovertarget|commandfor|anchor)="([^"]*)"/g, '$1="d-$2"').replace(/href="#([^"]+)"/g, 'href="#d-$1"');

const page = (list, n, total) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Monsoon components ${n} of ${total}</title>
<link rel="stylesheet" href="${cssHref}">
<style>
  body { margin: 0; font-family: var(--font-sans); }
  .sc-row { display: grid; grid-template-columns: 1fr 1fr; border-bottom: 1px solid var(--border); }
  .sc-head { grid-column: 1 / -1; display: flex; gap: .75rem; align-items: baseline; padding: .75rem 1.25rem; background: var(--surface-2); border-bottom: 1px solid var(--border); }
  .sc-head b { font-size: .9375rem; }
  .sc-head span { font-size: .75rem; color: var(--muted-foreground); }
  .sc-cell { position: relative; transform: translateZ(0); overflow: hidden; min-height: ${openMode ? '34rem' : '9rem'}; padding: 1.5rem; }
</style>
</head>
<body>
${list.map((c) => `<section class="sc-row">
  <div class="sc-head"><b>${c.name}</b><span>${c.group} / ${c.slug}</span></div>
  <div class="sc-cell light">${c.html}</div>
  <div class="sc-cell dark">${twin(c.html)}</div>
</section>`).join('\n')}
${openMode ? '<script>document.querySelectorAll("[popover]").forEach((p) => { try { p.showPopover(); } catch {} });</script>' : ''}
</body>
</html>
`;

mkdirSync(out, { recursive: true });
const total = Math.ceil(items.length / perPage);
for (let i = 0; i < total; i++) {
  const file = join(out, `${openMode ? 'open' : 'showcase'}-${String(i + 1).padStart(2, '0')}.html`);
  writeFileSync(file, page(items.slice(i * perPage, (i + 1) * perPage), i + 1, total));
}
console.log(`showcase: ${items.length} examples in ${total} pages written to ${out}`);
