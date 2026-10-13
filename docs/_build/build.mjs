// Builds the Monsoon documentation site into docs/.
//
//   node docs/_build/build.mjs
//
// Copies dist/monsoon.min.css, writes docs/classes.json from scripts/classes.json,
// renders every page with Shiki highlighted code (VS Code Light+ and Dark+), and
// writes sitemap.xml and robots.txt. Set SHIKI_PATH to point at another copy of
// shiki/dist/index.mjs if the default path does not exist on your machine.
import { writeFileSync, copyFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { DOCS, ROOT, SITE, LASTMOD, guidesNav, resetIds, highlighter } from './lib.mjs';
import { guides, guidePage, wordCount } from './pages/guides.mjs';

// The footer and the home page list the guides, so register them first.
guidesNav.push(...guides);

const { home } = await import('./pages/home.mjs');
const { componentsPage } = await import('./pages/components.mjs');
const { classesPage, compactIndex } = await import('./pages/classes.mjs');
const { notFound } = await import('./pages/notfound.mjs');

mkdirSync(join(DOCS, 'assets'), { recursive: true });
copyFileSync(join(ROOT, 'dist/monsoon.min.css'), join(DOCS, 'monsoon.min.css'));
writeFileSync(join(DOCS, 'classes.json'), JSON.stringify(compactIndex()));

const pages = [
  ['index.html', home, '1.0'],
  ['components.html', componentsPage, '0.8'],
  ['classes.html', classesPage, '0.8'],
  ...guides.map((g) => [`${g.slug}.html`, () => guidePage(g), '0.7']),
];

for (const [file, render] of pages) {
  resetIds();
  writeFileSync(join(DOCS, file), render());
}
resetIds();
writeFileSync(join(DOCS, '404.html'), notFound());

const urls = pages
  .map(([file, , priority]) => `  <url>\n    <loc>${file === 'index.html' ? SITE : SITE + file}</loc>\n    <lastmod>${LASTMOD}</lastmod>\n    <priority>${priority}</priority>\n  </url>`)
  .join('\n');
writeFileSync(join(DOCS, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
writeFileSync(join(DOCS, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}sitemap.xml\n`);

highlighter.dispose();
console.log(`built ${pages.length + 1} pages`);
for (const g of guides) console.log(`  ${String(wordCount(g)).padStart(5)} words  ${g.slug}`);
