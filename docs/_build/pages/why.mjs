// "Why Monsoon": twenty differentiators, each with a short title, one
// sentence and a live demo or a code sample. whyGrid() is the compact version
// on the landing page.
import { page, code, esc, u, I, breadcrumbs, breadcrumbLd, SITE, CDN } from '../lib.mjs';

const num = (i) => String(i + 1).padStart(2, '0');

/** The landing page grid: the twenty titles and sentences, each linking to its demo. */
export function whyGrid(list) {
  return `<div class="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border bg-border sm:grid-cols-2 lg:grid-cols-4">
      ${list
        .map((r, i) => `<a href="${u(`why.html#reason-${i + 1}`)}" class="why-card"><span class="text-xs font-semibold tabular-nums text-primary">${num(i)}</span><h3 class="why-title">${esc(r.title)}</h3><p class="why-desc">${esc(r.text)}</p></a>`)
        .join('\n      ')}
    </div>`;
}

function card(r, i) {
  const sample = r.demo
    ? `<div class="demo-stage rounded-xl border" v-pre>${r.demo}</div>`
    : code(r.code, r.lang || 'html', r.lang === 'bash' ? 'terminal' : r.lang === 'json' ? 'classes.json' : r.lang === 'jinja' ? 'users.html' : 'index.html');
  const external = /^https?:/.test(r.href);
  return `<article id="reason-${i + 1}" class="flex min-w-0 flex-col gap-3 rounded-2xl border bg-surface p-5 sm:p-6">
        <span class="text-sm font-semibold tabular-nums text-primary">${num(i)}</span>
        <h2 class="text-xl font-bold tracking-tight text-balance">${esc(r.title)}</h2>
        <p class="text-muted-foreground">${esc(r.text)}</p>
        <div class="mt-auto pt-2">${sample}</div>
        <a href="${u(r.href)}" class="why-more"${external ? ' rel="noopener"' : ''}>Learn more ${I.arrowRight}</a>
      </article>`;
}

export function whyPage(list) {
  const crumbs = [['Monsoon', 'index.html'], ['Why Monsoon', 'why.html']];
  const body = `
<section class="band band-hero-sm">
  <div class="frame">
    <div class="page-hero">
      ${breadcrumbs(crumbs)}
      <p class="kicker">Why Monsoon</p>
      <h1 class="page-title">${list.length} reasons to link one stylesheet</h1>
      <p class="page-lead">Each reason below has a live demo built with the classes it describes, or the few lines of code it takes. The demos on this page use the same stylesheet you would link, plus the small arbitrary value script for the one demo that needs it.</p>
      <div class="hero-cta">
        <a href="${u('docs/introduction.html')}" class="cta-primary">Get started ${I.arrowRight}</a>
        <a href="${u('playground.html')}" class="cta-secondary">Open the playground</a>
      </div>
    </div>
  </div>
</section>
<section class="band" aria-label="${list.length} reasons">
  <div class="frame">
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      ${list.map(card).join('\n      ')}
    </div>
  </div>
</section>
<section class="band band-final">
  <div class="frame">
    <div class="final-cta">
      <h2 class="final-title">Paste one line. Start building.</h2>
      <p class="final-lead">Free and open source under the MIT license.</p>
      <div class="final-code">${code(`<link rel="stylesheet" href="${CDN}">`, 'html', 'index.html')}</div>
    </div>
  </div>
</section>`;
  return page({
    path: 'why.html',
    layout: 'landing',
    title: `Why Monsoon: ${list.length} reasons, each with a live demo`,
    description: `${list.length} things Monsoon does differently: no build in production, arbitrary values without a build step, a whole theme from one seed color, tested contrast, native components and more, each with a live demo.`,
    head: `<script src="${u('monsoon-arbitrary.js')}" defer></script>\n`,
    jsonld: [
      {
        '@type': 'ItemList',
        name: 'Why Monsoon',
        url: `${SITE}why.html`,
        numberOfItems: list.length,
        itemListElement: list.map((r, i) => ({ '@type': 'ListItem', position: i + 1, name: r.title, description: r.text, url: `${SITE}why.html#reason-${i + 1}` })),
      },
      breadcrumbLd(crumbs),
    ],
    body,
  });
}
