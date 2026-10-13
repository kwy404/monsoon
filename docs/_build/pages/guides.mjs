import { page, code, terminal, esc, md, plain, slug, breadcrumbs, breadcrumbLd, faqList, faqLd, SITE, CDN, LASTMOD, BASE_COUNT, VARIANT_COUNT, fmt } from '../lib.mjs';
import { guides } from './guides-content.mjs';

function block(b) {
  if (typeof b === 'string') return `<p>${md(b)}</p>`;
  if (b.h3) return `<h3 class="text-xl font-semibold tracking-tight pt-4">${md(b.h3)}</h3>`;
  if (b.code) return `<div>${code(b.code, b.lang || 'html', b.title || `example.${b.lang || 'html'}`)}</div>`;
  if (b.term) return `<div>${terminal(b.term, b.title || 'bash', b.out || '')}</div>`;
  if (b.list) return `<ul class="list-disc pl-6 space-y-2">${b.list.map((x) => `<li>${md(x)}</li>`).join('')}</ul>`;
  if (b.ol) return `<ol class="list-decimal pl-6 space-y-2">${b.ol.map((x) => `<li>${md(x)}</li>`).join('')}</ol>`;
  if (b.note) return `<div class="rounded-xl border-l-4 border-primary bg-primary/5 p-5"><p>${md(b.note)}</p></div>`;
  if (b.table)
    return `<div class="overflow-x-auto rounded-xl border bg-surface"><table class="w-full text-sm"><thead class="bg-muted text-left"><tr>${b.table.head
      .map((h) => `<th scope="col" class="px-4 py-2.5 font-semibold">${md(h)}</th>`)
      .join('')}</tr></thead><tbody class="divide-y">${b.table.rows
      .map((r) => `<tr>${r.map((c) => `<td class="px-4 py-2.5 align-top">${md(c)}</td>`).join('')}</tr>`)
      .join('')}</tbody></table></div>`;
  if (b.demo)
    return `<figure class="rounded-2xl border bg-surface-2 p-5 sm:p-6"><figcaption class="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">${esc(b.label || 'Live result')}</figcaption>${b.demo}</figure>`;
  throw new Error(`Unknown block ${JSON.stringify(b).slice(0, 80)}`);
}

export function wordCount(g) {
  const text = [g.lead, ...g.sections.flatMap((s) => [s.h, ...s.blocks.map((b) => (typeof b === 'string' ? b : b.note || b.h3 || (b.list || b.ol || []).join(' ') || (b.table ? b.table.rows.flat().join(' ') : '') || ''))]), ...g.faqs.flat()].join(' ');
  return plain(text).split(/\s+/).filter(Boolean).length;
}

export function guidePage(g) {
  const crumbs = [['Monsoon', 'index.html'], ['Guides', 'index.html#guides'], [g.short, `${g.slug}.html`]];
  const words = wordCount(g);
  const minutes = Math.max(3, Math.round(words / 220));
  const toc = g.sections.map((s) => `<li><a href="#${slug(s.h)}" class="block rounded-md px-3 py-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">${md(s.h)}</a></li>`).join('\n          ');
  const related = g.related
    .map((r) => guides.find((x) => x.slug === r))
    .map(
      (r) => `<a href="${r.slug}.html" class="rounded-2xl border bg-surface p-5 hover:shadow-lg hover:-translate-y-0.5 transition">
          <p class="text-xs font-semibold uppercase tracking-widest text-primary">${r.kicker}</p>
          <p class="mt-2 font-semibold">${esc(r.title)}</p>
          <p class="mt-1 text-sm text-muted-foreground">${esc(r.blurb)}</p>
        </a>`,
    )
    .join('\n        ');

  const body = `
<div class="bloom border-b">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 pt-10 pb-12">
    ${breadcrumbs(crumbs)}
    <p class="mt-8 text-sm font-semibold uppercase tracking-widest text-primary">${g.kicker}</p>
    <h1 class="mt-3 max-w-4xl text-4xl sm:text-5xl font-extrabold tracking-tight text-balance">${esc(g.title)}</h1>
    <p class="mt-5 max-w-3xl text-lg sm:text-xl text-muted-foreground text-pretty">${md(g.lead)}</p>
    <p class="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground"><span>By <a href="https://github.com/kwy404" class="text-foreground hover:underline">Alexandre Kohler</a></span><span aria-hidden="true">&middot;</span><time datetime="${LASTMOD}">Updated October 13, 2026</time><span aria-hidden="true">&middot;</span><span>${minutes} min read</span></p>
  </div>
</div>
<div class="mx-auto max-w-7xl px-4 sm:px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-10">
  <article class="article lg:col-span-8 min-w-0 space-y-5 text-foreground">
${g.sections
  .map(
    (s) => `    <section class="space-y-5">
      <h2 id="${slug(s.h)}" class="pt-6 text-2xl sm:text-3xl font-bold tracking-tight scroll-mt-16">${md(s.h)}</h2>
      ${s.blocks.map(block).join('\n      ')}
    </section>`,
  )
  .join('\n')}
    <section class="space-y-5">
      <h2 id="faq" class="pt-6 text-2xl sm:text-3xl font-bold tracking-tight scroll-mt-16">Frequently asked questions</h2>
      ${faqList(g.faqs)}
    </section>
    <div class="rounded-2xl bg-gradient-to-br from-primary via-violet-600 to-fuchsia-600 p-8 text-white shadow-xl">
      <p class="text-2xl font-bold tracking-tight">Try it in ten seconds</p>
      <p class="mt-2 text-white/90">Paste this into any HTML page. No install, no build.</p>
      <div class="mt-5">${code(`<link rel="stylesheet" href="${CDN}">`, 'html', 'index.html')}</div>
    </div>
  </article>
  <aside class="hidden lg:block lg:col-span-4">
    <div class="sticky top-24 space-y-6">
      <nav aria-label="On this page" class="rounded-2xl border bg-surface p-4">
        <p class="px-3 pb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">On this page</p>
        <ol class="text-sm space-y-0.5">
          ${toc}
          <li><a href="#faq" class="block rounded-md px-3 py-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">FAQ</a></li>
        </ol>
      </nav>
      <div class="rounded-2xl border bg-surface p-5 space-y-3">
        <p class="font-semibold">Monsoon in numbers</p>
        <ul class="text-sm text-muted-foreground space-y-1.5">
          <li><span class="font-semibold text-foreground">${fmt(BASE_COUNT)}</span> base classes</li>
          <li><span class="font-semibold text-foreground">${fmt(VARIANT_COUNT)}</span> variant classes</li>
          <li><span class="font-semibold text-foreground">43 kB</span> brotli, whole file</li>
          <li><span class="font-semibold text-foreground">0</span> build steps</li>
        </ul>
        <a href="classes.html" class="inline-block text-sm font-medium text-primary hover:underline">Search the class reference</a>
      </div>
    </div>
  </aside>
</div>
<div class="border-t bg-surface-2">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 py-14">
    <h2 class="text-2xl font-bold tracking-tight">Related guides</h2>
    <div class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-5">
        ${related}
    </div>
  </div>
</div>`;

  return page({
    path: `${g.slug}.html`,
    title: g.metaTitle,
    description: g.description,
    active: 'Guides',
    ogType: 'article',
    body,
    jsonld: [
      {
        '@type': 'TechArticle',
        headline: g.title,
        description: g.description,
        url: `${SITE}${g.slug}.html`,
        mainEntityOfPage: `${SITE}${g.slug}.html`,
        datePublished: LASTMOD,
        dateModified: LASTMOD,
        inLanguage: 'en',
        proficiencyLevel: 'Beginner',
        keywords: g.keywords,
        wordCount: words,
        image: `${SITE}assets/og.png`,
        author: { '@type': 'Person', name: 'Alexandre Kohler', url: 'https://github.com/kwy404' },
        publisher: { '@type': 'Person', name: 'Alexandre Kohler', url: 'https://github.com/kwy404' },
        about: { '@type': 'SoftwareApplication', name: 'Monsoon', applicationCategory: 'DeveloperApplication', url: SITE },
      },
      faqLd(g.faqs),
      breadcrumbLd(crumbs),
    ],
  });
}

export { guides };
