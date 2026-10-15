// Content pages in the documentation shell: getting started, framework
// installation guides and the long form guides.
import { page, docsShell, esc, md, faqList, faqLd, breadcrumbLd, u, SITE, LASTMOD, CDN, code, I } from '../lib.mjs';
import { sections, newCtx, wordCount } from '../blocks.mjs';

function article(g, url, kind) {
  return {
    '@type': 'TechArticle',
    headline: g.title,
    description: g.description,
    url,
    mainEntityOfPage: url,
    datePublished: LASTMOD,
    dateModified: LASTMOD,
    inLanguage: 'en',
    proficiencyLevel: 'Beginner',
    wordCount: wordCount(g),
    articleSection: kind,
    image: `${SITE}assets/og.png`,
    author: { '@type': 'Person', name: 'Alexandre Kohler', url: 'https://github.com/kwy404' },
    publisher: { '@type': 'Person', name: 'Alexandre Kohler', url: 'https://github.com/kwy404' },
    about: { '@type': 'SoftwareApplication', name: 'Monsoon', applicationCategory: 'DeveloperApplication', url: SITE },
  };
}

const tryIt = () => `<div class="try-card">
  <p class="try-title">Try it in ten seconds</p><p>Paste this into any HTML page. No install, no build.</p>
  ${code(`<link rel="stylesheet" href="${CDN}">`, 'html', 'index.html')}
</div>`;

const h2 = (id, text) => `<h2 id="${id}" class="doc-h2"><a href="#${id}" class="anchor" aria-hidden="true" tabindex="-1">#</a>${text}</h2>`;

/** kind: 'start' (getting started), 'install' (framework guides) or 'guide' (long form). */
export function contentPage(g, { file, kind, crumbs, related = [] }) {
  const ctx = newCtx();
  const words = wordCount(g);
  const minutes = Math.max(2, Math.round(words / 220));
  let body = sections(g.sections, ctx);
  if (g.faqs && g.faqs.length) {
    ctx.toc.push(['faq', 'FAQ', 2]);
    body += `\n<section class="doc-section">${h2('faq', 'Frequently asked questions')}${faqList(g.faqs)}</section>`;
  }
  if (kind === 'guide') body += tryIt();
  if (related.length) {
    body += `\n<section class="doc-section">${h2('related', 'Keep reading')}<div class="related-grid">${related
      .map((r) => `<a href="${u(r.href)}" class="related-card"><span class="related-kicker">${esc(r.kicker || '')}</span><span class="related-title">${esc(r.title)}</span><span class="related-desc">${esc(r.desc || '')}</span></a>`)
      .join('')}</div></section>`;
    ctx.toc.push(['related', 'Keep reading', 2]);
  }
  const meta = `<p class="doc-meta"><span>${I.clock}${minutes} min read</span>${kind === 'guide' ? `<span>By <a href="https://github.com/kwy404">Alexandre Kohler</a></span>` : ''}${g.stack ? `<span class="pill">${esc(g.stack)}</span>` : ''}</p>`;
  const url = new URL(file, SITE).href;
  const jsonld = [article(g, url, kind === 'guide' ? 'Guides' : kind === 'install' ? 'Installation' : 'Getting started'), breadcrumbLd(crumbs)];
  if (g.faqs && g.faqs.length) jsonld.push(faqLd(g.faqs));
  return page({
    path: file,
    title: g.metaTitle || `${g.title} | Monsoon docs`,
    description: g.description,
    ogType: 'article',
    jsonld,
    head: typeof g.head === 'function' ? g.head(u) : g.head || '',
    body: docsShell({
      crumbs,
      kicker: g.kicker || (kind === 'install' ? 'Installation' : kind === 'start' ? 'Getting started' : 'Guide'),
      title: esc(g.title),
      lead: md(g.lead),
      meta,
      body,
      toc: ctx.toc,
      editPath: kind === 'guide' ? 'docs/_build/pages/guides-content.mjs' : kind === 'install' ? 'docs/_build/content/install-guides.mjs' : 'docs/_build/content/getting-started.mjs',
    }),
  });
}
