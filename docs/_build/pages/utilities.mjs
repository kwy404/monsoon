// One page per utility category, generated from scripts/classes.json: every
// class with its CSS and variants, grouped by property, plus a live example.
import { page, docsShell, esc, u, I, breadcrumbLd, SITE, fmt, slug } from '../lib.mjs';
import { previewBlock } from './components.mjs';

export const CAT_INFO = {
  layout: ['Layout', 'Display, position, inset, z-index, overflow, floats, object fit, aspect ratio, columns and container setup.'],
  flexbox: ['Flexbox', 'Direction, wrapping, grow, shrink, basis and order for flex layouts.'],
  grid: ['Grid', 'Template columns and rows, spans, start and end lines, auto flow and implicit tracks.'],
  spacing: ['Spacing', 'Padding, margin, gap and space between, on a 0.25rem scale with logical start and end sides.'],
  alignment: ['Alignment', 'Justify, align and place utilities for flex and grid items and content.'],
  sizing: ['Sizing', 'Width, height, size, min and max dimensions, fractions and viewport units.'],
  typography: ['Typography', 'Font family, size, weight, line height, letter spacing, alignment, decoration, wrapping and lists.'],
  borders: ['Borders', 'Border width and style, radius, divide, ring and outline utilities.'],
  colors: ['Colors', 'Text, background, border, ring, outline, decoration, fill, stroke and shadow colors: semantic tokens and the OKLCH palette.'],
  backgrounds: ['Backgrounds', 'Gradients with from, via and to stops, background size, position, repeat, attachment and clip.'],
  effects: ['Effects', 'Box shadows, opacity and blend modes.'],
  filters: ['Filters', 'Blur, grayscale, invert and sepia filters, plus backdrop blur.'],
  transitions: ['Transitions', 'Transition property, duration, easing and delay.'],
  animation: ['Animation', 'Spin, ping, pulse and bounce keyframe animations that respect reduced motion.'],
  transforms: ['Transforms', 'Scale, rotate, translate and transform origin.'],
  interactivity: ['Interactivity', 'Cursor, pointer events, user select, resize, scroll behavior, scroll snap, touch action and accent colors.'],
  fluid: ['Fluid type and spacing', 'Text sizes, padding, margin and gaps that scale smoothly with the viewport through clamp(), so one class covers phones and wide screens without breakpoints.'],
  accessibility: ['Accessibility', 'Screen reader only text, forced colors, a focus ring, a skip link and touch targets.'],
};

const PROP_NAMES = {
  'grid-template-columns': 'Grid template columns', 'grid-template-rows': 'Grid template rows', '--m-tx': 'Translate X', '--m-ty': 'Translate Y',
  '--m-gradient-from': 'Gradient from', '--m-gradient-via': 'Gradient via', '--m-gradient-to': 'Gradient to', '--m-shadow': 'Box shadow',
  '--m-ring-color': 'Ring color', '--m-shadow-color': 'Shadow color', '--m-ring-offset-color': 'Ring offset color', '--m-ring-offset-shadow': 'Ring width',
  '--m-ring-inset': 'Ring inset', '--m-ring-offset-width': 'Ring offset width', '--m-snap': 'Scroll snap strictness', color: 'Text color',
  '-webkit-font-smoothing': 'Font smoothing', '-webkit-hyphens': 'Hyphens', '-webkit-user-select': 'User select', '-webkit-backdrop-filter': 'Backdrop filter',
  '-webkit-background-clip': 'Background clip text', '-webkit-box-decoration-break': 'Box decoration break', 'container-type': 'Container',
};
const propTitle = (p) => PROP_NAMES[p] || p.replace(/^-+/, '').replace(/-/g, ' ').replace(/^./, (c) => c.toUpperCase());

/** Live examples, one per category. Every class here exists in the stylesheet. */
export const CAT_DEMOS = {
  fluid: `<div class="rounded-2xl border bg-surface p-fluid-md space-y-3">
  <p class="text-fluid-3xl font-extrabold tracking-tight">Fluid headline</p>
  <p class="text-fluid-base text-muted-foreground">Resize the preview: the headline, the text and the padding grow and shrink with the width, with no breakpoint classes at all.</p>
</div>`,
  layout: `<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
  <div class="relative aspect-video overflow-hidden rounded-xl bg-gradient-to-br from-primary to-accent">
    <span class="absolute top-3 left-3 rounded-full bg-background px-2.5 py-1 text-xs font-semibold">absolute top-3 left-3</span>
    <span class="absolute bottom-3 right-3 z-10 rounded-md bg-foreground text-background px-2 py-1 text-xs">z-10</span>
  </div>
  <div class="@container rounded-xl border bg-surface p-4">
    <div class="flex flex-col @md:flex-row gap-3">
      <div class="h-16 @md:w-1/3 rounded-lg bg-primary"></div>
      <p class="text-sm text-muted-foreground">An @container parent. Children switch to a row once the container is 28rem wide.</p>
    </div>
  </div>
</div>`,
  flexbox: `<div class="space-y-3">
  <div class="flex items-center justify-between gap-3 rounded-xl border bg-surface p-3">
    <div class="size-10 rounded-lg bg-primary"></div>
    <div class="flex-1 h-3 rounded-full bg-muted"></div>
    <div class="size-10 rounded-lg bg-accent"></div>
  </div>
  <div class="flex flex-wrap gap-2">
    <span class="rounded-full bg-secondary text-secondary-foreground px-3 py-1 text-sm">flex-wrap</span>
    <span class="rounded-full bg-secondary text-secondary-foreground px-3 py-1 text-sm">gap-2</span>
    <span class="order-first rounded-full bg-primary text-primary-foreground px-3 py-1 text-sm">order-first</span>
    <span class="rounded-full bg-secondary text-secondary-foreground px-3 py-1 text-sm">items wrap onto new lines</span>
  </div>
</div>`,
  grid: `<div class="grid grid-cols-4 gap-3">
  <div class="col-span-2 row-span-2 grid place-items-center rounded-xl bg-primary text-primary-foreground text-sm font-semibold min-h-32">col-span-2 row-span-2</div>
  <div class="grid place-items-center rounded-xl bg-surface-3 text-sm h-16">1</div>
  <div class="grid place-items-center rounded-xl bg-surface-3 text-sm h-16">2</div>
  <div class="col-span-2 grid place-items-center rounded-xl bg-accent text-accent-foreground text-sm font-semibold h-16">col-span-2</div>
</div>`,
  spacing: `<div class="flex flex-wrap items-end gap-4">
  <div class="rounded-lg bg-primary/10 p-2"><div class="size-8 rounded bg-primary"></div></div>
  <div class="rounded-lg bg-primary/10 p-4"><div class="size-8 rounded bg-primary"></div></div>
  <div class="rounded-lg bg-primary/10 p-6"><div class="size-8 rounded bg-primary"></div></div>
  <div class="rounded-lg bg-primary/10 px-8 py-2"><div class="size-8 rounded bg-primary"></div></div>
  <div class="space-y-2 rounded-lg border p-3"><div class="h-2 w-24 rounded bg-muted-foreground/40"></div><div class="h-2 w-16 rounded bg-muted-foreground/40"></div><div class="h-2 w-20 rounded bg-muted-foreground/40"></div></div>
</div>`,
  alignment: `<div class="grid grid-cols-3 gap-3">
  <div class="flex h-24 items-start justify-start rounded-xl border bg-surface p-2"><span class="size-6 rounded bg-primary"></span></div>
  <div class="grid h-24 place-items-center rounded-xl border bg-surface p-2"><span class="size-6 rounded bg-primary"></span></div>
  <div class="flex h-24 items-end justify-end rounded-xl border bg-surface p-2"><span class="size-6 rounded bg-primary"></span></div>
</div>`,
  sizing: `<div class="space-y-3">
  <div class="flex items-end gap-3"><div class="size-6 rounded bg-primary"></div><div class="size-10 rounded bg-primary"></div><div class="size-16 rounded bg-primary"></div><div class="size-24 rounded bg-primary"></div></div>
  <div class="w-full rounded bg-muted"><div class="h-3 w-2/3 rounded bg-accent"></div></div>
  <div class="max-w-xs rounded-lg border bg-surface p-3 text-sm text-muted-foreground">max-w-xs keeps this box at 20rem or less.</div>
</div>`,
  typography: `<div class="space-y-2">
  <p class="text-4xl font-black tracking-tight">Monsoon</p>
  <p class="text-xl font-semibold text-balance">Text that balances its lines so headings never leave one word alone</p>
  <p class="text-sm text-muted-foreground leading-relaxed line-clamp-2 max-w-md">Line clamp keeps long descriptions to two lines. Everything after the second line is hidden behind an ellipsis, which is handy for cards and lists that need equal heights.</p>
  <p class="font-mono text-sm uppercase tracking-widest text-primary">font-mono uppercase tracking-widest</p>
</div>`,
  borders: `<div class="flex flex-wrap items-center gap-4">
  <div class="size-16 rounded-none border-2 border-primary"></div>
  <div class="size-16 rounded-lg border-4 border-dashed border-accent"></div>
  <div class="size-16 rounded-2xl border bg-surface ring-4 ring-primary/30"></div>
  <div class="size-16 rounded-full border-8 border-double border-primary"></div>
  <div class="divide-y rounded-xl border bg-surface w-40 text-sm"><p class="px-3 py-2">divide-y</p><p class="px-3 py-2">between</p><p class="px-3 py-2">rows</p></div>
</div>`,
  colors: `<div class="space-y-3">
  <div class="grid grid-cols-6 sm:grid-cols-11 gap-1.5">
    <div class="h-10 rounded bg-sky-50"></div><div class="h-10 rounded bg-sky-100"></div><div class="h-10 rounded bg-sky-200"></div><div class="h-10 rounded bg-sky-300"></div><div class="h-10 rounded bg-sky-400"></div><div class="h-10 rounded bg-sky-500"></div><div class="h-10 rounded bg-sky-600"></div><div class="h-10 rounded bg-sky-700"></div><div class="h-10 rounded bg-sky-800"></div><div class="h-10 rounded bg-sky-900"></div><div class="h-10 rounded bg-sky-950"></div>
  </div>
  <div class="flex flex-wrap gap-2 text-sm font-medium">
    <span class="rounded-md bg-primary text-primary-foreground px-3 py-1.5">primary</span>
    <span class="rounded-md bg-accent text-accent-foreground px-3 py-1.5">accent</span>
    <span class="rounded-md bg-success text-success-foreground px-3 py-1.5">success</span>
    <span class="rounded-md bg-warning text-warning-foreground px-3 py-1.5">warning</span>
    <span class="rounded-md bg-danger text-danger-foreground px-3 py-1.5">danger</span>
    <span class="rounded-md border border-primary text-primary px-3 py-1.5">text-primary</span>
  </div>
</div>`,
  backgrounds: `<div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
  <div class="h-24 rounded-xl bg-gradient-to-r from-primary to-accent"></div>
  <div class="h-24 rounded-xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-orange-400"></div>
  <div class="h-24 rounded-xl bg-gradient-to-t from-sky-500 to-emerald-400"></div>
</div>`,
  effects: `<div class="flex flex-wrap gap-5">
  <div class="size-20 rounded-xl bg-surface shadow-sm grid place-items-center text-xs">sm</div>
  <div class="size-20 rounded-xl bg-surface shadow-lg grid place-items-center text-xs">lg</div>
  <div class="size-20 rounded-xl bg-surface shadow-2xl grid place-items-center text-xs">2xl</div>
  <div class="size-20 rounded-xl bg-primary opacity-50 grid place-items-center text-xs text-primary-foreground">50%</div>
</div>`,
  filters: `<div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono text-center">
  <div><div class="h-20 rounded-xl bg-gradient-to-br from-rose-500 via-amber-400 to-sky-500"></div><p class="mt-1">none</p></div>
  <div><div class="h-20 rounded-xl bg-gradient-to-br from-rose-500 via-amber-400 to-sky-500 grayscale"></div><p class="mt-1">grayscale</p></div>
  <div><div class="h-20 rounded-xl bg-gradient-to-br from-rose-500 via-amber-400 to-sky-500 sepia"></div><p class="mt-1">sepia</p></div>
  <div><div class="h-20 rounded-xl bg-gradient-to-br from-rose-500 via-amber-400 to-sky-500 blur-sm"></div><p class="mt-1">blur-sm</p></div>
</div>`,
  transitions: `<div class="flex flex-wrap gap-3">
  <button class="rounded-lg bg-primary text-primary-foreground px-4 py-2 font-medium transition duration-150 ease-out hover:bg-primary/80">duration-150</button>
  <button class="rounded-lg bg-primary text-primary-foreground px-4 py-2 font-medium transition duration-500 ease-in-out hover:bg-accent hover:text-accent-foreground">duration-500</button>
  <button class="rounded-lg border px-4 py-2 font-medium transition-transform duration-300 hover:scale-105">hover:scale-105</button>
</div>`,
  animation: `<div class="flex flex-wrap items-center gap-8">
  <div class="size-10 rounded-full border-4 border-muted border-t-primary animate-spin"></div>
  <span class="relative flex size-4"><span class="absolute inset-0 rounded-full bg-accent opacity-75 animate-ping"></span><span class="relative size-4 rounded-full bg-accent"></span></span>
  <div class="h-4 w-32 rounded bg-muted animate-pulse"></div>
  <div class="size-8 rounded-full bg-primary animate-bounce"></div>
</div>`,
  transforms: `<div class="flex flex-wrap items-center gap-6">
  <div class="size-16 rounded-xl bg-primary rotate-6"></div>
  <div class="size-16 rounded-xl bg-accent -rotate-12"></div>
  <div class="size-16 rounded-xl bg-surface-3 scale-75"></div>
  <div class="size-16 rounded-xl bg-primary translate-y-2 transition-transform hover:scale-110"></div>
</div>`,
  interactivity: `<div class="space-y-3">
  <div class="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2">
    <div class="snap-start shrink-0 w-40 h-20 rounded-xl bg-primary"></div><div class="snap-start shrink-0 w-40 h-20 rounded-xl bg-accent"></div><div class="snap-start shrink-0 w-40 h-20 rounded-xl bg-surface-3"></div><div class="snap-start shrink-0 w-40 h-20 rounded-xl bg-primary"></div>
  </div>
  <div class="flex flex-wrap gap-3 text-sm"><span class="rounded border px-3 py-1 cursor-pointer">cursor-pointer</span><span class="rounded border px-3 py-1 cursor-not-allowed">cursor-not-allowed</span><span class="rounded border px-3 py-1 select-all">select-all text</span><label class="flex items-center gap-2"><input type="checkbox" class="accent-primary size-4" checked> accent-primary</label></div>
</div>`,
  accessibility: `<div class="flex flex-wrap items-center gap-4">
  <button class="touch-target focus-ring rounded-lg border px-3 py-1.5 text-sm">touch-target and focus-ring</button>
  <button class="rounded-lg bg-primary text-primary-foreground p-2" aria-label="Search"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><span class="sr-only">Search</span></button>
  <p class="text-sm text-muted-foreground">The icon button above has a label only screen readers hear (sr-only).</p>
</div>`,
};

function firstProp(css) {
  return /\{\n\s*([a-z-]+):/.exec(css)?.[1] || 'other';
}
function declsOf(css) {
  const m = /\{\n([\s\S]*)\n\}$/.exec(css);
  return m ? m[1].split('\n').map((l) => l.trim()).join(' ') : css;
}

const VARIANT_GROUPS = [
  ['State', ['hover', 'focus', 'focus-within', 'focus-visible', 'active', 'disabled']],
  ['Group and peer', ['group-hover', 'peer-checked']],
  ['Structure', ['first', 'last', 'odd', 'even']],
  ['Motion', ['motion-safe', 'motion-reduce']],
  ['Scheme', ['dark']],
  ['Breakpoints', ['sm', 'md', 'lg', 'xl', '2xl']],
  ['Containers', ['@xs', '@sm', '@md', '@lg', '@xl']],
  ['Media and direction', ['print', 'screen', 'rtl', 'ltr', 'forced-colors']],
];
const vlist = (vs) => (vs.length ? vs.map((v) => `<span class="vchip">${esc(v)}:</span>`).join('') : '<span class="text-muted-foreground">none</span>');

export function utilityPage(cat, list, cats) {
  const [title, desc] = CAT_INFO[cat] || [cat, ''];
  const groups = [];
  for (const c of list) {
    const p = firstProp(c.css);
    let g = groups.find((x) => x.prop === p);
    if (!g) groups.push((g = { prop: p, items: [] }));
    g.items.push(c);
  }
  const isColor = cat === 'colors' || cat === 'backgrounds';
  const colorOf = (css) => /:\s*((?:oklch|rgb|#|var\()[^;]*);/.exec(css)?.[1];
  const toc = [['example', 'Live example', 2], ['variants', 'Variant support', 2]];
  const usedIds = new Set();
  const sectionsHtml = groups
    .map((g) => {
      let id = slug(propTitle(g.prop));
      while (usedIds.has(id)) id += '-x';
      usedIds.add(id);
      toc.push([id, propTitle(g.prop), 2]);
      const same = g.items.every((c) => c.variants.join() === g.items[0].variants.join());
      const rows = g.items
        .map((c) => {
          const sw = isColor ? colorOf(c.css) : '';
          return `<tr id="cls-${esc(c.class)}"><td class="cls-name">${sw ? `<span class="sw" style="background:${esc(sw)}"></span>` : ''}<code>${esc(c.class)}</code></td><td class="cls-css-cell"><code>${esc(declsOf(c.css))}</code></td>${same ? '' : `<td class="cls-var">${c.variants.length ? esc(c.variants.join(' ')) : ''}</td>`}</tr>`;
        })
        .join('');
      return `<section class="doc-section util-sec">
  <h2 id="${id}" class="doc-h2"><a href="#${id}" class="anchor" aria-hidden="true" tabindex="-1">#</a>${esc(propTitle(g.prop))} <span class="h-count">${g.items.length}</span></h2>
  <p class="util-vars">Variants: ${same ? vlist(g.items[0].variants) : 'listed per class'}</p>
  <div class="tbl-wrap util-table" v-pre><table class="doc-table"><thead><tr><th scope="col">Class</th><th scope="col">CSS</th>${same ? '' : '<th scope="col">Variants</th>'}</tr></thead><tbody>${rows}</tbody></table></div>
</section>`;
    })
    .join('\n');

  const counts = {};
  for (const c of list) for (const v of c.variants) counts[v] = (counts[v] || 0) + 1;
  const varTable = `<div class="tbl-wrap"><table class="doc-table"><thead><tr><th scope="col">Kind</th><th scope="col">Prefixes</th><th scope="col">Classes in this category</th></tr></thead><tbody>${VARIANT_GROUPS.map(
    ([name, vs]) => {
      const have = vs.filter((v) => counts[v]);
      return `<tr><td>${name}</td><td>${have.length ? have.map((v) => `<span class="vchip">${esc(v)}:</span>`).join('') : '<span class="text-muted-foreground">not generated</span>'}</td><td class="tabular-nums">${have.length ? fmt(Math.max(...have.map((v) => counts[v]))) : '0'}</td></tr>`;
    },
  ).join('')}</tbody></table></div>`;
  const variantTotal = list.reduce((n, c) => n + c.variants.length, 0);
  const demo = CAT_DEMOS[cat] || '';
  const body = `
<div class="util-stats">
  <div><span class="stat-n">${fmt(list.length)}</span><span class="stat-l">classes</span></div>
  <div><span class="stat-n">${fmt(variantTotal)}</span><span class="stat-l">variant classes</span></div>
  <div><span class="stat-n">${groups.length}</span><span class="stat-l">properties</span></div>
</div>
<div class="filter-row" v-data="{ q: '' }">
  <label class="filter-input">${I.search}<span class="sr-only">Filter ${esc(title.toLowerCase())} classes</span><input type="search" v-model="q" :data-fx="filterRows(q, '#util-body')" placeholder="Filter ${fmt(list.length)} classes or CSS, for example ${esc(list[Math.min(list.length - 1, 7)].class)}" autocomplete="off"></label>
  <a class="btn-soft-link" href="${u('classes.html')}?cat=${cat}">Open in the class reference ${I.arrowRight}</a>
</div>
<section class="doc-section">
  <h2 id="example" class="doc-h2"><a href="#example" class="anchor" aria-hidden="true" tabindex="-1">#</a>Live example</h2>
  ${demo ? previewBlock(demo, { title: `${title} utilities`, id: `pv-${cat}`, fileName: `${cat}.html` }) : ''}
</section>
<section class="doc-section">
  <h2 id="variants" class="doc-h2"><a href="#variants" class="anchor" aria-hidden="true" tabindex="-1">#</a>Variant support</h2>
  <p>Variants are generated where they are useful, which keeps the whole stylesheet small enough to link from a CDN. Prefix a class with one of these to apply it in that state or above that width${(() => {
    const pick = ['md', 'hover', 'dark', 'focus-visible', '@md', 'print'].map((v) => [v, list.find((c) => c.variants.includes(v))]).find(([, c]) => c) || [list.find((c) => c.variants.length)?.variants[0], list.find((c) => c.variants.length)];
    return pick[1] ? `, for example <code>${esc(`${pick[0]}:${pick[1].class}`)}</code>` : '';
  })()}. Stacked variants such as <code>dark:hover:</code> are not part of the prebuilt file; <a href="${u('docs/arbitrary-values.html')}">arbitrary values</a> take any variant, stacked, with the optional script or the purge CLI.</p>
  ${varTable}
</section>
<div id="util-body">
${sectionsHtml}
</div>`;
  const crumbs = [['Docs', 'docs/introduction.html'], ['Utilities', 'utilities/layout.html'], [title, `utilities/${cat}.html`]];
  return page({
    path: `utilities/${cat}.html`,
    title: `${title} utilities: ${fmt(list.length)} classes with CSS | Monsoon`,
    description: `${desc} Every Monsoon ${title.toLowerCase()} class with the CSS it writes and its variants.`.slice(0, 300),
    jsonld: [
      { '@type': 'TechArticle', headline: `${title} utilities`, description: desc, url: `${SITE}utilities/${cat}.html`, inLanguage: 'en' },
      breadcrumbLd(crumbs),
    ],
    body: docsShell({ crumbs, kicker: 'Utilities', title: esc(title), lead: esc(desc), body, toc, editPath: 'scripts/classes.json' }),
  });
}
