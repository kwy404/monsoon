import { page, esc, md, breadcrumbs, breadcrumbLd, faqList, faqLd, code, INDEX, BASE_COUNT, VARIANT_COUNT, fmt, SITE } from '../lib.mjs';
import { escapeClass } from '../../../bin/css.mjs';

export const VARIANT_ORDER = [
  'hover', 'focus', 'focus-within', 'focus-visible', 'active', 'disabled', 'group-hover', 'peer-checked',
  'first', 'last', 'odd', 'even', 'motion-safe', 'motion-reduce', 'dark',
  'sm', 'md', 'lg', 'xl', '2xl', '@xs', '@sm', '@md', '@lg', '@xl',
];

/** Compact class index for the browser: [name, category, declarations, variant bitmask, selector?]. */
export function compactIndex() {
  const cats = [...new Set(INDEX.classes.map((c) => c.category))];
  const unknown = new Set(INDEX.classes.flatMap((c) => c.variants).filter((v) => !VARIANT_ORDER.includes(v)));
  if (unknown.size) throw new Error(`Unknown variants in classes.json: ${[...unknown].join(', ')}`);
  const rows = INDEX.classes.map((c) => {
    const m = /^([\s\S]*?) \{\n([\s\S]*)\n\}$/.exec(c.css);
    if (!m) throw new Error(`Unexpected css for ${c.class}`);
    const selector = m[1];
    const decls = m[2].split('\n').map((l) => l.trim()).join(' ');
    const mask = c.variants.reduce((n, v) => n | (1 << VARIANT_ORDER.indexOf(v)), 0);
    const row = [c.class, cats.indexOf(c.category), decls, mask];
    if (selector !== `.${escapeClass(c.class)}`) row.push(selector);
    return row;
  });
  return { version: INDEX.version, count: rows.length, categories: cats, variants: VARIANT_ORDER, rows };
}

const refFaqs = [
  ['How do I find which classes Monsoon has?', 'Search this page, or run `npx monsooncss classes` in a terminal. Add `--filter grid-cols` to narrow the list or `--json` for a JSON array. The full index with CSS also ships in the repository as `scripts/classes.json`.'],
  ['Why does a class not have a hover: or md: version?', 'Variants are generated for the utility groups where they are useful, which keeps the complete file at about 43 kB brotli. `hover:` exists for colors, opacity, shadows and transforms, `md:` for layout, spacing, sizing and text. The variant chips on each result show exactly what is available.'],
  ['Can I combine two variants, such as dark:hover:?', 'No. Stacked variants are not part of the prebuilt file. Use semantic colors, which switch with the color scheme on their own, so `hover:bg-primary` already works in dark mode.'],
  ['Are arbitrary values like w-[37px] supported?', 'No. Use the nearest step of the scale, an inline `style` attribute, or a small rule in your own stylesheet next to Monsoon.'],
];

export function classesPage() {
  const crumbs = [['Monsoon', 'index.html'], ['Class reference', 'classes.html']];
  const cats = Object.entries(INDEX.classes.reduce((m, c) => ((m[c.category] = m[c.category] || []).push(c), m), {}));
  const summary = cats
    .map(
      ([cat, list]) => `<tr>
          <th scope="row" class="px-4 py-3 text-left font-semibold capitalize align-top">${cat}</th>
          <td class="px-4 py-3 tabular-nums align-top">${fmt(list.length)}</td>
          <td class="px-4 py-3 font-mono text-xs text-muted-foreground">${list.filter((_, i) => i % Math.max(1, Math.floor(list.length / 6)) === 0).slice(0, 6).map((c) => esc(c.class)).join(', ')}</td>
        </tr>`,
    )
    .join('\n        ');

  const variantChip = (v) => `<span class="rounded-md border bg-surface-2 px-1.5 py-0.5 font-mono text-xs">${v}:</span>`;

  const body = `
<div class="bloom border-b">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 pt-10 pb-12">
    ${breadcrumbs(crumbs)}
    <h1 class="mt-6 text-4xl sm:text-5xl font-extrabold tracking-tight text-balance">Monsoon class reference</h1>
    <p class="mt-4 max-w-2xl text-lg text-muted-foreground">Search all ${fmt(BASE_COUNT)} utility classes, see the exact CSS each one writes and which of the ${fmt(VARIANT_COUNT)} variant classes exist for it.</p>
  </div>
</div>

<div class="mx-auto max-w-7xl px-4 sm:px-6 py-10" v-data="{ q: startQuery, cat: startCat, vr: '', limit: 60, copied: '' }">
  <div class="sticky top-16 z-30 border rounded-2xl bg-background/90 backdrop-blur-md p-3 sm:p-4 grid grid-cols-1 md:grid-cols-12 gap-3 shadow-sm">
    <div class="md:col-span-6">
      <label for="ref-q" class="sr-only">Search classes</label>
      <input id="ref-q" type="search" placeholder="Search, for example bg-primary, md:grid-cols or gap" class="w-full rounded-lg border bg-surface px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-ring" v-model="q" @input="limit = 60" autocomplete="off" spellcheck="false">
    </div>
    <div class="md:col-span-3">
      <label for="ref-cat" class="sr-only">Category</label>
      <select id="ref-cat" class="w-full rounded-lg border bg-surface px-3 py-2.5 capitalize focus:outline-none focus:ring-2 focus:ring-ring" v-model="cat" @change="limit = 60">
        <option value="all">All categories</option>
        ${cats.map(([c]) => `<option value="${c}">${c}</option>`).join('\n        ')}
      </select>
    </div>
    <div class="md:col-span-3">
      <label for="ref-vr" class="sr-only">Supports variant</label>
      <select id="ref-vr" class="w-full rounded-lg border bg-surface px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-ring" v-model="vr" @change="limit = 60">
        <option value="">Any variant</option>
        ${VARIANT_ORDER.map((v) => `<option value="${v}">Has ${v}:</option>`).join('\n        ')}
      </select>
    </div>
  </div>

  <p class="mt-6 text-sm text-muted-foreground" aria-live="polite"><span v-text="total(q, cat, vr)">${fmt(BASE_COUNT)}</span> classes match. <span v-show="total(q, cat, vr) > limit" v-cloak>Showing the first <span v-text="limit"></span>.</span></p>
  <noscript><p class="mt-4 rounded-lg border-l-4 border-warning bg-warning/10 p-4 text-sm">The search needs JavaScript. The summary below and <a class="underline" href="classes.json">classes.json</a> work without it.</p></noscript>

  <div class="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
    <article class="rounded-xl border bg-surface p-4 min-w-0" v-for="r in search(q, cat, vr, limit)" :key="r.n" v-cloak>
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <h2 class="font-mono font-semibold text-base break-all" v-text="r.n"></h2>
          <p class="mt-1 text-xs text-muted-foreground capitalize" v-text="r.c"></p>
        </div>
        <button type="button" class="shrink-0 rounded-md border px-2.5 py-1 text-xs font-medium hover:bg-muted transition-colors" @click="copyClass(r.n); copied = r.n" v-text="copied === r.n ? 'Copied' : 'Copy'" :aria-label="'Copy class ' + r.n">Copy</button>
      </div>
      <pre class="css-out mt-3 rounded-lg bg-surface-2 border p-3"><code v-text="r.css"></code></pre>
      <p class="mt-3 flex flex-wrap gap-1" v-show="r.v.length"><span class="rounded-md border bg-surface-2 px-1.5 py-0.5 font-mono text-xs" v-for="v in r.v" :key="v" v-text="v + ':'"></span></p>
      <p class="mt-3 text-xs text-muted-foreground" v-show="!r.v.length">No variants</p>
    </article>
  </div>
  <p class="mt-6 text-center" v-show="total(q, cat, vr) > limit" v-cloak>
    <button type="button" class="rounded-xl border bg-surface px-5 py-2.5 font-semibold hover:bg-muted transition" @click="limit = limit + 60">Show more</button>
  </p>
  <p class="mt-6 text-center text-muted-foreground" v-show="total(q, cat, vr) === 0" v-cloak>No class matches. Try a shorter search, such as <span class="font-mono">grid</span> or <span class="font-mono">primary</span>.</p>
</div>

<div class="border-t bg-surface-2">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 py-16 grid grid-cols-1 lg:grid-cols-3 gap-10">
    <div class="lg:col-span-2 min-w-0 space-y-6">
      <h2 class="text-2xl font-bold tracking-tight">Classes by category</h2>
      <div class="overflow-x-auto rounded-2xl border bg-surface">
        <table class="w-full text-sm">
          <thead class="bg-muted text-left"><tr><th scope="col" class="px-4 py-3 font-semibold">Category</th><th scope="col" class="px-4 py-3 font-semibold">Classes</th><th scope="col" class="px-4 py-3 font-semibold">Examples</th></tr></thead>
          <tbody class="divide-y">
        ${summary}
          </tbody>
        </table>
      </div>
      <h2 class="text-2xl font-bold tracking-tight pt-6">Reading a variant class</h2>
      <p class="text-muted-foreground">A variant is a prefix and a colon in front of a base class. The base class writes the CSS, the prefix decides when it applies.</p>
      ${code(`<!-- base class: always applies -->
<a class="text-primary">Docs</a>

<!-- state variant: only on hover -->
<a class="text-muted-foreground hover:text-foreground">Docs</a>

<!-- breakpoint: from 768px wide -->
<div class="grid grid-cols-1 md:grid-cols-3">...</div>

<!-- container query: when the @container parent is 28rem wide -->
<div class="@container"><div class="flex flex-col @md:flex-row">...</div></div>`, 'html', 'variants.html')}
    </div>
    <aside class="space-y-6">
      <div class="rounded-2xl border bg-surface p-5">
        <h2 class="font-semibold">State and scheme variants</h2>
        <p class="mt-3 flex flex-wrap gap-1.5">${VARIANT_ORDER.slice(0, 15).map(variantChip).join(' ')}</p>
      </div>
      <div class="rounded-2xl border bg-surface p-5">
        <h2 class="font-semibold">Breakpoints</h2>
        <p class="mt-3 flex flex-wrap gap-1.5">${VARIANT_ORDER.slice(15, 20).map(variantChip).join(' ')}</p>
        <p class="mt-3 text-sm text-muted-foreground">Mobile first min-width queries at 640, 768, 1024, 1280 and 1536 pixels.</p>
      </div>
      <div class="rounded-2xl border bg-surface p-5">
        <h2 class="font-semibold">Container queries</h2>
        <p class="mt-3 flex flex-wrap gap-1.5">${VARIANT_ORDER.slice(20).map(variantChip).join(' ')}</p>
        <p class="mt-3 text-sm text-muted-foreground">Need a parent with the <span class="font-mono">@container</span> class. 20rem to 36rem.</p>
      </div>
      <div class="rounded-2xl border bg-surface p-5 text-sm text-muted-foreground space-y-2">
        <h2 class="font-semibold text-foreground">Also in your terminal</h2>
        ${code('npx monsooncss classes --filter rounded', 'bash', 'bash')}
      </div>
    </aside>
  </div>
  <div class="mx-auto max-w-3xl px-4 sm:px-6 pb-20">
    <h2 class="text-2xl font-bold tracking-tight mb-6">Class reference FAQ</h2>
    ${faqList(refFaqs)}
  </div>
</div>`;

  return page({
    path: 'classes.html',
    title: `Monsoon class reference: ${fmt(BASE_COUNT)} utility classes`,
    description: `Searchable reference of every Monsoon utility class: category, the exact CSS it writes and its hover, focus, dark, responsive and container query variants. ${fmt(VARIANT_COUNT)} variant classes in total.`,
    active: 'Classes',
    body,
    jsonld: [
      { '@type': 'WebPage', name: 'Monsoon class reference', url: `${SITE}classes.html` },
      faqLd(refFaqs),
      breadcrumbLd(crumbs),
    ],
  });
}
