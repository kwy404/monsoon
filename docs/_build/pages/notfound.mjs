import { page, guidesNav } from '../lib.mjs';

export function notFound() {
  const links = [
    ['Home', 'index.html'],
    ['Seed playground', 'index.html#playground'],
    ['Components', 'components.html'],
    ['Class reference', 'classes.html'],
  ];
  const body = `
<section class="relative overflow-hidden">
  <div class="bloom absolute inset-0 -z-10" aria-hidden="true"></div>
  <div class="mx-auto max-w-3xl px-4 sm:px-6 py-20 text-center">
    <img src="assets/mascot.svg" width="452" height="452" alt="Mo the red panda with an umbrella, looking for the page you asked for" class="float mx-auto w-full max-w-xs">
    <p class="mt-8 text-sm font-semibold uppercase tracking-widest text-primary">Error 404</p>
    <h1 class="mt-3 text-4xl sm:text-5xl font-extrabold tracking-tight text-balance">This page blew away</h1>
    <p class="mt-4 text-lg text-muted-foreground">The address may be mistyped, or the page moved. These are good places to land instead.</p>
    <div class="mt-8 flex flex-wrap justify-center gap-3">
      ${links.map(([t, h], i) => `<a href="${h}" class="rounded-xl ${i === 0 ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'border bg-surface hover:bg-muted'} px-5 py-3 font-semibold transition">${t}</a>`).join('\n      ')}
    </div>
    <div class="mt-14 text-left rounded-2xl border bg-surface p-6">
      <h2 class="font-semibold">Guides</h2>
      <ul class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
        ${guidesNav.map((g) => `<li><a href="${g.slug}.html" class="text-muted-foreground hover:text-foreground">${g.title}</a></li>`).join('\n        ')}
      </ul>
    </div>
  </div>
</section>`;
  // GitHub Pages serves 404.html for any missing path, possibly in a subfolder,
  // so links and assets resolve against the site root.
  return page({
    path: '404.html',
    title: 'Page not found | Monsoon',
    description: 'This page does not exist. Find the Monsoon quick start, seed playground, components and class reference from here.',
    body,
  })
    .replace('<meta charset="utf-8">', '<meta charset="utf-8">\n<base href="/monsoon/">\n<meta name="robots" content="noindex">')
    .replace(/<link rel="canonical"[^>]*>\n/, '');
}
