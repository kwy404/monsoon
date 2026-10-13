// The searchable class reference and the compact class index the browser
// loads for it (also used by the "how it works" editor on the landing page).
import { page, docsShell, esc, faqList, faqLd, breadcrumbLd, code, INDEX, BASE_COUNT, VARIANT_COUNT, fmt, SITE, STATE, I } from '../lib.mjs';
import { escapeClass } from '../../../bin/css.mjs';
import { CAT_INFO } from './utilities.mjs';

const KNOWN_ORDER = [
  'hover', 'focus', 'focus-within', 'focus-visible', 'active', 'disabled', 'group-hover', 'peer-checked',
  'first', 'last', 'odd', 'even', 'motion-safe', 'motion-reduce', 'dark', 'print', 'screen', 'rtl', 'ltr', 'forced-colors',
  'sm', 'md', 'lg', 'xl', '2xl', '@xs', '@sm', '@md', '@lg', '@xl',
];
export const VARIANT_ORDER = (() => {
  const present = new Set(INDEX.classes.flatMap((c) => c.variants));
  return [...KNOWN_ORDER.filter((v) => present.has(v)), ...[...present].filter((v) => !KNOWN_ORDER.includes(v)).sort()];
})();

/** Compact class index for the browser: rows are [name, category, declarations, variant indexes, selector?]. */
export function compactIndex(templates = {}, compCss = new Map()) {
  const cats = [...new Set(INDEX.classes.map((c) => c.category))];
  const rows = INDEX.classes.map((c) => {
    const m = /^([\s\S]*?) \{\n([\s\S]*)\n\}$/.exec(c.css);
    const selector = m ? m[1] : `.${escapeClass(c.class)}`;
    const decls = m ? m[2].split('\n').map((l) => l.trim()).join(' ') : c.css;
    const vs = c.variants.map((v) => VARIANT_ORDER.indexOf(v));
    const row = [c.class, cats.indexOf(c.category), decls, vs];
    if (selector !== `.${escapeClass(c.class)}`) row.push(selector);
    return row;
  });
  const comp = {};
  for (const [name, rules] of compCss) {
    const best = [...rules].sort((a, b) => b.lead - a.lead || a.len - b.len)[0];
    if (best && best.lead) comp[name] = best.text.length > 700 ? `${best.text.slice(0, 700)}\n/* ... */` : best.text;
  }
  return { version: INDEX.version, count: rows.length, categories: cats, variants: VARIANT_ORDER, rows, templates, comp };
}

const refFaqs = [
  ['How do I find which classes Monsoon has?', 'Search this page, press Ctrl K anywhere on the site, or run `npx monsooncss classes` in a terminal. Add `--filter grid-cols` to narrow the list. The full index with CSS also ships in the repository as `scripts/classes.json`.'],
  ['Why does a class not have a hover: or md: version?', 'Variants are generated for the utility groups where they are useful, which keeps the complete file small enough to link from a CDN. The variant chips on each result show exactly what is available.'],
  ['Can I combine two variants, such as dark:hover:?', 'No. Stacked variants are not part of the prebuilt file. Semantic colors switch with the color scheme on their own, so `hover:bg-primary` already works in dark mode.'],
  ['Are arbitrary values like w-[37px] supported?', 'Yes, with no build step. They are not in the stylesheet: load `monsoon.js` (or the small `monsoon-arbitrary.js`) and they are written in the browser, or run the purge CLI and they are compiled into the purged file. See the arbitrary values page in the docs.'],
];

export function classesPage() {
  const crumbs = [['Docs', 'docs/introduction.html'], ['Class reference', 'classes.html']];
  const cats = Object.entries(INDEX.classes.reduce((m, c) => ((m[c.category] = m[c.category] || []).push(c), m), {}));
  const body = `
<div v-data="{ q: startQuery, cat: startCat, vr: '', limit: 60 }">
  <div class="ref-bar">
    <label class="filter-input ref-q">${I.search}<span class="sr-only">Search classes</span><input id="ref-q" type="search" placeholder="Search, for example bg-primary, md:grid-cols or gap" v-model="q" @input="limit = 60" autocomplete="off" spellcheck="false"></label>
    <label class="sr-only" for="ref-cat">Category</label>
    <select id="ref-cat" class="ref-select" v-model="cat" @change="limit = 60">
      <option value="all">All categories</option>
      ${cats.map(([c]) => `<option value="${c}">${esc((CAT_INFO[c] || [c])[0])}</option>`).join('\n      ')}
    </select>
    <label class="sr-only" for="ref-vr">Supports variant</label>
    <select id="ref-vr" class="ref-select" v-model="vr" @change="limit = 60">
      <option value="">Any variant</option>
      ${VARIANT_ORDER.map((v) => `<option value="${v}">Has ${v}:</option>`).join('\n      ')}
    </select>
  </div>
  <p class="ref-count" aria-live="polite"><span v-text="total(q, cat, vr, S.idx)">${fmt(BASE_COUNT)}</span> classes match<span v-show="total(q, cat, vr, S.idx) > limit">, showing the first <span v-text="limit"></span></span>.</p>
  <noscript><p class="note-box note-warn">The search needs JavaScript. The category pages in the sidebar list every class without it.</p></noscript>
  <div class="ref-grid">
    <article class="ref-card" v-for="r in search(q, cat, vr, limit, S.idx)" :key="r.n">
      <div class="ref-card-head">
        <div class="min-w-0"><h2 class="ref-name" v-text="r.n"></h2><a class="ref-cat" :href="'utilities/' + r.c + '.html#cls-' + r.n" v-text="r.c"></a></div>
        <button type="button" class="ref-copy" @click="copyText(r.n)" :aria-label="'Copy class ' + r.n">${I.copy}</button>
      </div>
      <pre class="css-out ref-css"><code v-text="r.css"></code></pre>
      <p class="ref-vars" v-show="r.v.length"><span class="vchip" v-for="v in r.v" :key="v" v-text="v + ':'"></span></p>
      <p class="ref-vars text-muted-foreground" v-show="!r.v.length">No variants</p>
    </article>
  </div>
  <p class="text-center mt-6" v-show="total(q, cat, vr, S.idx) > limit"><button type="button" class="btn-outline-site" @click="limit = limit + 60">Show more</button></p>
  <p class="text-center mt-6 text-muted-foreground" v-show="total(q, cat, vr, S.idx) === 0">No class matches. Try a shorter search, such as grid or primary.</p>
</div>
<section class="doc-section">
  <h2 id="reading" class="doc-h2">Reading a variant class</h2>
  <p>A variant is a prefix and a colon in front of a base class. The base class writes the CSS, the prefix decides when it applies.</p>
  ${code(`<!-- base class: always applies -->
<a class="text-primary">Docs</a>

<!-- state variant: only on hover -->
<a class="text-muted-foreground hover:text-foreground">Docs</a>

<!-- breakpoint: from 768px wide -->
<div class="grid grid-cols-1 md:grid-cols-3">...</div>

<!-- container query: when the @container parent is 28rem wide -->
<div class="@container"><div class="flex flex-col @md:flex-row">...</div></div>`, 'html', 'variants.html')}
  ${code('npx monsooncss classes --filter rounded', 'bash', 'bash')}
</section>
<section class="doc-section">
  <h2 id="faq" class="doc-h2">Class reference FAQ</h2>
  ${faqList(refFaqs)}
</section>`;
  return page({
    path: 'classes.html',
    title: `Monsoon class reference: ${fmt(BASE_COUNT)} utility classes`,
    description: `Searchable reference of every Monsoon utility class: category, the exact CSS it writes and its hover, focus, dark, responsive and container query variants. ${fmt(VARIANT_COUNT)} variant classes in total.`,
    jsonld: [{ '@type': 'WebPage', name: 'Monsoon class reference', url: `${SITE}classes.html` }, faqLd(refFaqs), breadcrumbLd(crumbs)],
    body: docsShell({
      crumbs,
      kicker: 'Reference',
      title: 'Class reference',
      lead: `Search all ${fmt(BASE_COUNT)} utility classes, see the exact CSS each one writes and which of the ${fmt(VARIANT_COUNT)} variant classes exist for it.`,
      body,
      toc: [['reading', 'Reading a variant class', 2], ['faq', 'FAQ', 2]],
      editPath: 'scripts/classes.json',
    }),
  });
}
