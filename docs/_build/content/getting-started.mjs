// Getting started section of the docs site: data only, rendered into docs/docs/<slug>.html.
// Inline markup in strings: `code`, **bold**, [text](url). Everything else is escaped.
// Every class in a code sample or demo must exist in scripts/classes.json (or in a
// component manifest), and a variant class only when the base class lists that variant.
import { readFileSync } from 'node:fs';
import { brotliCompressSync, gzipSync, constants } from 'node:zlib';
import { purgeCss, extractCandidates } from '../../../bin/monsoon.mjs';

const ROOT = new URL('../../../', import.meta.url);
const read = (path) => readFileSync(new URL(path, ROOT), 'utf8');

const pkg = JSON.parse(read('package.json'));
const index = JSON.parse(read('scripts/classes.json'));

const VERSION = pkg.version;
const MINOR = VERSION.split('.').slice(0, 2).join('.');
const CDN = 'https://cdn.jsdelivr.net/npm/monsooncss';
const PIN = `${CDN}@${VERSION}/dist/monsoon.min.css`;
const PIN_READABLE = `${CDN}@${VERSION}/dist/monsoon.css`;
const UNPKG = 'https://unpkg.com/monsooncss';
const UNPKG_PIN = `${UNPKG}@${VERSION}/dist/monsoon.min.css`;
const CHANGELOG = 'https://github.com/kwy404/monsoon/blob/main/CHANGELOG.md';

const fmt = (n) => n.toLocaleString('en-US');
const BASE_COUNT = index.classes.length;
const VARIANT_COUNT = index.classes.reduce((n, c) => n + c.variants.length, 0);

// ---- Class coverage, computed from scripts/classes.json ----

function coverage(variant) {
  const out = {};
  for (const c of index.classes) if (c.variants.includes(variant)) out[c.category] = (out[c.category] || 0) + 1;
  return out;
}
const total = (cov) => Object.values(cov).reduce((a, b) => a + b, 0);
const catLink = (cat) => `[${cat}](../utilities/${cat}.html)`;
const covText = (variant) =>
  Object.entries(coverage(variant))
    .sort((a, b) => b[1] - a[1])
    .map(([cat, n]) => `${catLink(cat)} ${fmt(n)}`)
    .join(', ');

// ---- Sizes, measured from the files in this repository ----

const FIRST_PAGE = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Hello, Monsoon</title>
  <link rel="stylesheet" href="${CDN}">
</head>
<body class="bg-background text-foreground antialiased">
  <main class="mx-auto max-w-md p-8">
    <div class="rounded-2xl border bg-surface p-6 shadow-lg space-y-4">
      <h1 class="text-2xl font-bold">Hello, Monsoon</h1>
      <p class="text-muted-foreground">One stylesheet. No build step.</p>
      <button class="rounded-lg bg-primary text-primary-foreground px-4 py-2 font-medium hover:bg-primary/90">
        Get started
      </button>
    </div>
  </main>
</body>
</html>`;

const kb = (n) => `${(n / 1024).toFixed(1)} kB`;
const about = (n) => (n >= 1024 * 1000 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.round(n / 1024)} kB`);
function measure(text) {
  const buf = Buffer.from(text);
  return {
    raw: buf.length,
    gzip: gzipSync(buf, { level: 9 }).length,
    brotli: brotliCompressSync(buf, { params: { [constants.BROTLI_PARAM_QUALITY]: 11 } }).length,
  };
}
function purged(html, source) {
  const { css, stats } = purgeCss(source, extractCandidates(html));
  return { ...measure(css), ...stats };
}
const SIZES = (() => {
  try {
    const source = read('dist/monsoon.css');
    return {
      full: measure(read('dist/monsoon.min.css')),
      sink: purged(read('demo/kitchen-sink.html'), source),
      card: purged(FIRST_PAGE, source),
    };
  } catch {
    // Values measured on 0.1.0, used only if the files above cannot be read.
    return {
      full: { raw: 1050931, gzip: 112333, brotli: 67584 },
      sink: { raw: 172954, gzip: 32563, brotli: 27238, kept: 295, total: 13372 },
      card: { raw: 157389, gzip: 29901, brotli: 25088, kept: 22, total: 13372 },
    };
  }
})();
const FULL_BR = about(SIZES.full.brotli);
const FULL_GZ = about(SIZES.full.gzip);

// ---- Shared snippets ----

const HEAD_SCRIPT = `<script>
  // Runs before the first paint: apply a saved choice, if any.
  (function () {
    try {
      var theme = localStorage.getItem('theme');
      if (theme === 'light' || theme === 'dark') {
        document.documentElement.setAttribute('data-theme', theme);
      }
    } catch (e) {}
  })();
</script>`;

export const gettingStarted = [
  // 1 ------------------------------------------------------------------------
  {
    slug: 'introduction',
    nav: 'Introduction',
    title: 'Introduction to Monsoon',
    metaTitle: 'Introduction | Monsoon docs',
    description: 'Monsoon is a utility-first CSS framework in one stylesheet: predeclared classes, a theme from one seed color, automatic dark mode, no build step.',
    lead: 'Monsoon is a utility-first CSS framework that ships as **one stylesheet**. Link it from a CDN, write classes such as `px-4`, `md:grid-cols-3` and `hover:bg-primary` in your markup, and the page is styled. There is no compiler, no config file and no JavaScript.',
    sections: [
      {
        h: 'What Monsoon is',
        blocks: [
          `Most utility-first setups generate CSS from your source files. Monsoon ships the CSS already written: ${fmt(BASE_COUNT)} base classes and ${fmt(VARIANT_COUNT)} variant classes, a reset, a color palette, a theme engine and a layer of ready made components, all in one file. Because nothing is generated, the same file works in a static HTML page, a server rendered template and a single page app.`,
          {
            list: [
              '**Utilities** for layout, flexbox, grid, spacing, sizing, typography, colors, backgrounds, borders, effects, filters, transitions, animation, transforms, interactivity and accessibility. Browse them in the [class reference](../classes.html).',
              '**Seed theming.** Set one `--seed` color and every semantic color (primary, accent, surfaces, borders, muted text, the focus ring) is derived from it in the browser with OKLCH relative colors.',
              '**Automatic dark mode** that follows the operating system, plus `class="dark"`, `class="light"` and `data-theme` to force a scheme on the page or on a single section.',
              '**Responsive and container variants:** `sm:` to `2xl:` for the viewport, and `@xs:` to `@xl:` for the nearest parent marked with `@container`.',
              '**A component layer** with buttons, cards, alerts, form controls, tabs, modals and more, built on native HTML with no JavaScript. See the [component gallery](../components.html).',
              '**An optional purge command**, `npx monsooncss purge`, that writes a smaller file with only the utilities your files use.',
            ],
          },
        ],
      },
      {
        h: 'The ideas behind it',
        blocks: [
          { h3: 'Predeclared, not generated' },
          `Every class exists before you type it. That is what removes the build step, and it is also why a few things are left out on purpose: a prebuilt file cannot contain values you invent while writing markup, so static classes have no stacked variants such as \`md:hover:\`. Values you do invent, such as \`w-[37px]\`, are arbitrary values: the optional script writes them in the browser and the purge CLI compiles them, see [Arbitrary values](arbitrary-values.html). Variants are generated only for the utility groups where they are useful, which keeps the complete file at about ${FULL_BR} with brotli.`,
          { h3: 'One color, a whole theme' },
          'The theme is not a list of hand picked colors. It is a set of formulas that read your `--seed` and compute everything else, so changing one line re-themes the page, and `style="--seed: teal"` on an element re-themes only that element and its children. Foreground colors flip between white and near black to keep a contrast ratio of at least 4.5:1.',
          { h3: 'Dark mode is a number' },
          'Each token is declared once and reads a number, `--mode`, which is 0 in light mode and 1 in dark mode. The operating system setting, the `dark` class and the `data-theme` attribute only change that number. Semantic colors such as `bg-surface` and `text-muted-foreground` therefore need no `dark:` prefix at all.',
          { h3: 'Components without JavaScript' },
          'Component classes such as `btn`, `card` and `alert` come before the utilities in the stylesheet, so a utility on the same element always wins. They read the same theme tokens, which means they follow your seed and the color scheme with no extra work.',
        ],
      },
      {
        h: 'Your first page',
        blocks: [
          'Save this file and open it in a browser. It works from disk, from a local server and in production, because there is no development build that differs from the production file.',
          { code: FIRST_PAGE, lang: 'html', title: 'index.html' },
          {
            demo: `<div class="mx-auto max-w-md rounded-2xl border bg-surface p-6 shadow-lg space-y-4">
  <p class="text-2xl font-bold">Hello, Monsoon</p>
  <p class="text-muted-foreground">One stylesheet. No build step.</p>
  <button class="rounded-lg bg-primary text-primary-foreground px-4 py-2 font-medium hover:bg-primary/90">Get started</button>
</div>`,
            label: 'Live result',
          },
          'Now change the button to `bg-accent text-accent-foreground`, or add `style="--seed: #e11d48"` to the `main` element, and refresh. That is the whole workflow: edit, save, reload.',
        ],
      },
      {
        h: 'How to read a class name',
        blocks: [
          'Each utility sets one thing, so class names read like shorthand CSS. Most follow the pattern `variant:property-value`, where the variant is optional:',
          {
            table: {
              head: ['Class', 'Reads as', 'CSS'],
              rows: [
                ['`p-4`', 'padding, step 4 of the spacing scale', '`padding: 1rem`'],
                ['`px-6`', 'padding on the inline axis, step 6', '`padding-inline: 1.5rem`'],
                ['`-mt-2`', 'negative top margin, step 2', '`margin-top: -0.5rem`'],
                ['`w-1/2`', 'width as a fraction', '`width: 50%`'],
                ['`text-muted-foreground`', 'text color from a theme token', '`color: var(--muted-foreground)`'],
                ['`bg-rose-600`', 'background from the palette, hue and step', '`background-color: var(--color-rose-600)`'],
                ['`bg-primary/90`', 'background with an opacity modifier', '`color-mix(in oklab, var(--primary) 90%, transparent)`'],
                ['`hover:bg-primary`', 'primary background while hovered', 'the same rule behind `:hover`'],
                ['`md:grid-cols-3`', 'three grid columns from 768px up', 'the same rule inside `@media (min-width: 768px)`'],
              ],
            },
          },
          'The spacing scale counts in quarters of a rem: `1` is 0.25rem, `4` is 1rem and `16` is 4rem. Text sizes, radii and shadows use names instead (`text-sm`, `text-2xl`, `rounded-lg`, `shadow-md`). A class takes at most one variant prefix.',
          { note: 'Not sure a class exists? Search the [class reference](../classes.html), which also lists the variants of every class, or run `npx monsooncss classes --filter grid-cols` in a terminal.' },
        ],
      },
      {
        h: 'Utilities and components together',
        blocks: [
          'A component gives a whole pattern sensible defaults, and utilities adjust it. Both can live on the same element, and the utility wins because it comes later in the stylesheet:',
          {
            code: `<article class="card card-bordered max-w-sm">
  <div class="card-body">
    <div class="flex items-center justify-between gap-3">
      <h3 class="card-title">Weekly digest</h3>
      <span class="badge badge-success badge-dot">Live</span>
    </div>
    <p class="text-sm text-muted-foreground">Components set the defaults, utilities fine tune them.</p>
    <div class="card-actions">
      <button class="btn btn-ghost btn-sm">Later</button>
      <button class="btn btn-primary btn-sm rounded-full px-6">Subscribe</button>
    </div>
  </div>
</article>`,
            lang: 'html',
            title: 'digest.html',
          },
          {
            demo: `<article class="card card-bordered max-w-sm">
  <div class="card-body">
    <div class="flex items-center justify-between gap-3">
      <h3 class="card-title">Weekly digest</h3>
      <span class="badge badge-success badge-dot">Live</span>
    </div>
    <p class="text-sm text-muted-foreground">Components set the defaults, utilities fine tune them.</p>
    <div class="card-actions">
      <button class="btn btn-ghost btn-sm">Later</button>
      <button class="btn btn-primary btn-sm rounded-full px-6">Subscribe</button>
    </div>
  </div>
</article>`,
            label: 'Card, badge and buttons with utility overrides',
          },
          'Every component page lists its classes, parts and modifiers. Good places to start are [Button](../components/button.html), [Card](../components/card.html) and [Alert](../components/alert.html).',
        ],
      },
      {
        h: 'Where to go next',
        blocks: [
          {
            list: [
              'Install it: [from a CDN](installation-cdn.html) with one link tag, or [from npm](installation-npm.html) for bundlers. Framework guides cover [React](install-react.html), [Vue](install-vue.html), [Laravel](install-laravel.html), [Django](install-django.html) and more.',
              'Make it yours with [Theming](theming.html), then check [Dark mode](dark-mode.html).',
              'Lay out pages with [Responsive design](responsive-design.html) and components with [Container queries](container-queries.html).',
              'Learn which prefixes exist in [Variants](variants.html).',
              'Ship less CSS with the [purge CLI](purge-cli.html), and see [Browser support](browser-support.html) before you go live.',
              'Experiment with markup, classes and `--seed` values live in the [playground](../playground.html).',
            ],
          },
        ],
      },
    ],
    faqs: [
      ['Does Monsoon need Node.js or a build tool?', 'No. Link the stylesheet and write classes. Node.js is only needed to install from npm or to run the optional purge command.'],
      ['Does Monsoon ship any JavaScript?', 'No. Theming, dark mode and the components are plain CSS. A theme switcher needs a few lines of your own script, shown in [Dark mode](dark-mode.html).'],
      ['Can I mix Monsoon with my own CSS?', 'Yes. The reset sits in a cascade layer named `base`, and every theme color is a custom property such as `var(--primary)`, so your own rules can use the theme and override anything.'],
    ],
  },

  // 2 ------------------------------------------------------------------------
  {
    slug: 'installation-cdn',
    nav: 'Install from a CDN',
    title: 'Install Monsoon from a CDN',
    metaTitle: 'Install from a CDN | Monsoon docs',
    description: 'Load Monsoon from jsDelivr or unpkg with one link tag. Pin a version, add subresource integrity, self host the file and start from a full page.',
    lead: 'The quickest way to use Monsoon is a single `<link>` tag that points at a CDN. That file is the complete framework: utilities, theme, dark mode and components. There is nothing else to install.',
    sections: [
      {
        h: 'Add the stylesheet',
        blocks: [
          { code: `<link rel="stylesheet" href="${CDN}">`, lang: 'html', title: 'index.html' },
          'Put it in the `<head>`, before your own stylesheets, so your rules come after Monsoon and win on equal specificity. The bare package URL serves the minified build, `dist/monsoon.min.css`.',
          'That is the whole installation. Every class in the [class reference](../classes.html) and every [component](../components.html) is now available on the page.',
        ],
      },
      {
        h: 'Pin a version for production',
        blocks: [
          'The bare URL always follows the latest release. That is ideal for prototypes and demos, but a page in production should not change because a new version was published. Pin the exact version instead:',
          { code: `<link rel="stylesheet" href="${PIN}">`, lang: 'html', title: 'index.html' },
          {
            table: {
              head: ['URL', 'Serves', 'Use it for'],
              rows: [
                [`\`${CDN}\``, 'the latest release, minified', 'prototypes and demos'],
                [`\`${PIN}\``, `exactly ${VERSION}, minified`, 'production'],
                [`\`${CDN}@${MINOR}\``, `the newest ${MINOR}.x release, minified`, 'receiving patch releases automatically'],
                [`\`${PIN_READABLE}\``, `exactly ${VERSION}, readable`, 'reading or debugging the CSS'],
              ],
            },
          },
          `Monsoon follows semantic versioning. Before 1.0, a minor release (for example from ${MINOR} to the next minor) may contain breaking changes, so read the [changelog](${CHANGELOG}) before you move a pin.`,
        ],
      },
      {
        h: 'jsDelivr or unpkg',
        blocks: [
          'Both CDNs serve files straight from the published npm package, so the content is identical. Pick the one your team already allows.',
          {
            tabs: [
              {
                label: 'jsDelivr',
                blocks: [
                  { code: `<!-- latest -->
<link rel="stylesheet" href="${CDN}">

<!-- pinned -->
<link rel="stylesheet" href="${PIN}">`, lang: 'html', title: 'index.html' },
                ],
              },
              {
                label: 'unpkg',
                blocks: [
                  { code: `<!-- latest -->
<link rel="stylesheet" href="${UNPKG}">

<!-- pinned -->
<link rel="stylesheet" href="${UNPKG_PIN}">`, lang: 'html', title: 'index.html' },
                ],
              },
            ],
          },
          'The short URLs work because the package declares `dist/monsoon.min.css` in its `jsdelivr` and `unpkg` fields. A pinned URL with the full file path is the most explicit form and the one to use with integrity hashes.',
        ],
      },
      {
        h: 'Subresource integrity',
        blocks: [
          'Subresource integrity tells the browser to refuse a file whose content does not match a hash you recorded. It protects your pages if a CDN ever served something unexpected. Use it only with a fully pinned URL: a moving URL changes content and the hash would stop matching. Generate the hash from the exact file you reference:',
          { term: `curl -sL ${PIN} | openssl dgst -sha384 -binary | openssl base64 -A`, title: 'bash' },
          { code: `<link
  rel="stylesheet"
  href="${PIN}"
  integrity="sha384-PASTE_THE_HASH_HERE"
  crossorigin="anonymous">`, lang: 'html', title: 'index.html' },
          { warn: 'Keep `crossorigin="anonymous"`. Integrity checks on a file from another origin need a CORS request, and without the attribute the browser blocks the stylesheet. Generate a new hash every time you change the version.' },
        ],
      },
      {
        h: 'Self host the file',
        blocks: [
          'Some projects cannot load assets from a third party domain: a strict content security policy, an intranet without internet access, or a privacy policy that rules out external requests. Download the file once and serve it with your other assets:',
          { term: `mkdir -p public/css
curl -L -o public/css/monsoon.min.css ${PIN}`, title: 'bash' },
          { code: '<link rel="stylesheet" href="/css/monsoon.min.css">', lang: 'html', title: 'index.html' },
          'The file has no dependencies. Fonts come from the system font stack, so there are no web fonts to fetch, and the small icons some components draw (select arrows, checkmarks, chevrons) are inline SVG data URLs. With a content security policy, allow your own origin in `style-src` and `data:` in `img-src`.',
          'If you install the package from npm, the same file is at `node_modules/monsooncss/dist/monsoon.min.css`. See [Install with npm](installation-npm.html).',
        ],
      },
      {
        h: 'A complete starter page',
        blocks: [
          'This page combines everything above: a pinned stylesheet, a preconnect hint, the color scheme meta tag, and a small layout that adapts from phone to desktop.',
          {
            code: `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light dark">
  <title>Acme Studio</title>
  <link rel="preconnect" href="https://cdn.jsdelivr.net">
  <link rel="stylesheet" href="${PIN}">
</head>
<body class="min-h-dvh bg-background text-foreground antialiased">
  <header class="border-b">
    <nav class="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
      <a href="/" class="font-bold">Acme Studio</a>
      <a href="/contact" class="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90">Contact</a>
    </nav>
  </header>
  <main class="mx-auto max-w-5xl px-6 py-16 space-y-10">
    <section class="max-w-2xl space-y-4">
      <h1 class="text-4xl md:text-5xl font-extrabold tracking-tight text-balance">Websites that load before you blink</h1>
      <p class="text-lg text-muted-foreground">Design, build and hosting for small teams.</p>
    </section>
    <section class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <article class="rounded-2xl border bg-surface p-6 space-y-2">
        <h2 class="font-semibold">Design</h2>
        <p class="text-sm text-muted-foreground">Layouts and type that fit your brand.</p>
      </article>
      <article class="rounded-2xl border bg-surface p-6 space-y-2">
        <h2 class="font-semibold">Build</h2>
        <p class="text-sm text-muted-foreground">Fast pages on the stack you already use.</p>
      </article>
      <article class="rounded-2xl border bg-surface p-6 space-y-2">
        <h2 class="font-semibold">Host</h2>
        <p class="text-sm text-muted-foreground">Monitoring, backups and updates included.</p>
      </article>
    </section>
  </main>
  <footer class="border-t py-8 text-center text-sm text-muted-foreground">Acme Studio</footer>
</body>
</html>`,
            lang: 'html',
            title: 'index.html',
          },
          {
            demo: `<div class="rounded-2xl border bg-background overflow-hidden">
  <div class="flex items-center justify-between border-b px-5 py-3"><span class="font-bold">Acme Studio</span><span class="rounded-lg bg-primary text-primary-foreground px-3 py-1.5 text-sm font-medium">Contact</span></div>
  <div class="px-5 py-8 space-y-6">
    <div class="max-w-2xl space-y-2"><p class="text-3xl font-extrabold tracking-tight text-balance">Websites that load before you blink</p><p class="text-muted-foreground">Design, build and hosting for small teams.</p></div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="rounded-xl border bg-surface p-4 space-y-1"><p class="font-semibold">Design</p><p class="text-sm text-muted-foreground">Layouts and type that fit your brand.</p></div>
      <div class="rounded-xl border bg-surface p-4 space-y-1"><p class="font-semibold">Build</p><p class="text-sm text-muted-foreground">Fast pages on the stack you already use.</p></div>
      <div class="rounded-xl border bg-surface p-4 space-y-1"><p class="font-semibold">Host</p><p class="text-sm text-muted-foreground">Monitoring, backups and updates included.</p></div>
    </div>
  </div>
</div>`,
            label: 'Starter page, scaled down',
          },
          'Using a framework or a server side stack? The [HTML](install-html.html), [React](install-react.html), [Next.js](install-nextjs.html), [Vue](install-vue.html), [Laravel](install-laravel.html), [WordPress](install-wordpress.html) and other install guides show where the link tag goes in each one.',
        ],
      },
      {
        h: 'Caching and performance',
        blocks: [
          {
            list: [
              `**One request.** The whole framework is about ${FULL_BR} with brotli and ${FULL_GZ} with gzip. CDNs send the compressed version to every current browser.`,
              '**Long lived cache.** A pinned URL never changes content, so the CDN and the browser can keep it for a long time. Every page view after the first one costs nothing.',
              '**No shared cache across sites.** Browsers partition their cache per site, so do not count on visitors having the file from another website. Count on the second page of your own site being free.',
              '**Render blocking on purpose.** A stylesheet in the `<head>` delays the first paint until it arrives, which is what you want for your main CSS: the alternative is a flash of unstyled content. The preconnect hint above starts the connection early.',
              '**Less CSS when it matters.** The [purge command](purge-cli.html) writes a file with only the utilities you use, which you then self host.',
            ],
          },
        ],
      },
    ],
    faqs: [
      ['Which file does the bare CDN URL serve?', 'The minified build, `dist/monsoon.min.css`. Add `/dist/monsoon.css` after a pinned version to get the readable file.'],
      ['Is the CDN file different from the npm package?', 'No. jsDelivr and unpkg serve the files of the published npm package, byte for byte.'],
      ['Do I need a CDN at all?', 'No. Download the file and host it yourself, or install it from npm. It is one static CSS file with no dependencies.'],
    ],
  },

  // 3 ------------------------------------------------------------------------
  {
    slug: 'installation-npm',
    nav: 'Install with npm',
    title: 'Install Monsoon with npm',
    metaTitle: 'Install with npm | Monsoon docs',
    description: 'Install the monsooncss package with npm, pnpm, yarn or bun, import it in your bundler, or copy the stylesheet into a public folder.',
    lead: 'Installing from npm pins Monsoon in your lockfile, lets your bundler include the stylesheet in its output, and gives you the `monsooncss` command for purging. The package contains CSS only: there is no JavaScript to load at runtime.',
    sections: [
      {
        h: 'Install the package',
        blocks: [
          {
            tabs: [
              { label: 'npm', blocks: [{ term: 'npm install monsooncss', title: 'bash' }] },
              { label: 'pnpm', blocks: [{ term: 'pnpm add monsooncss', title: 'bash' }] },
              { label: 'yarn', blocks: [{ term: 'yarn add monsooncss', title: 'bash' }] },
              { label: 'bun', blocks: [{ term: 'bun add monsooncss', title: 'bash' }] },
            ],
          },
          'The package has no dependencies. It contains the two stylesheets in `dist/`, the command line tool in `bin/`, the readme, the license and the changelog.',
        ],
      },
      {
        h: 'What the package exports',
        blocks: [
          {
            table: {
              head: ['Import path', 'File', 'Notes'],
              rows: [
                ['`monsooncss`', '`dist/monsoon.min.css`', 'The default. Minified.'],
                ['`monsooncss/css`', '`dist/monsoon.css`', 'The same rules, formatted and readable.'],
                ['`monsooncss/min`', '`dist/monsoon.min.css`', 'An explicit name for the default.'],
                ['`monsooncss/package.json`', '`package.json`', 'For tools that read the version.'],
              ],
            },
          },
          'There is no JavaScript entry point. The `main`, `style`, `unpkg` and `jsdelivr` fields all point at the minified stylesheet, and `sideEffects` lists `*.css`, so bundlers that tree shake never drop the import.',
          { note: 'The `exports` map is strict, so a deep path such as `monsooncss/dist/monsoon.css` cannot be imported through the package name. Use `monsooncss/css`, or point at the file on disk.' },
        ],
      },
      {
        h: 'Import it in a bundler',
        blocks: [
          'Any bundler that handles CSS imports (Vite, webpack with a CSS loader, Parcel, esbuild) can import the stylesheet from your entry file. Import it once, before your own styles:',
          { code: `import 'monsooncss';
import './styles.css';`, lang: 'js', title: 'main.js' },
          'To bundle the readable file while you debug, import `monsooncss/css` instead. In production the minified default is the better choice.',
          'You can also import it from a CSS file. `@import` must come before any other rule in the file:',
          { code: `@import 'monsooncss';

:root {
  --seed: #0d9488;
}

.prose-link {
  color: var(--primary);
  text-decoration: underline;
}`, lang: 'css', title: 'styles.css' },
          'The import is the same in every framework, only the entry file changes:',
          {
            table: {
              head: ['Stack', 'Where the import goes', 'Guide'],
              rows: [
                ['React with Vite', '`src/main.jsx`', '[React](install-react.html)'],
                ['Next.js (App Router)', '`app/layout.tsx`', '[Next.js](install-nextjs.html)'],
                ['Vue with Vite', '`src/main.js`', '[Vue](install-vue.html)'],
                ['Nuxt', 'the `css` array in `nuxt.config.ts`', '[Nuxt](install-nuxt.html)'],
                ['SvelteKit', '`src/routes/+layout.svelte`', '[SvelteKit](install-sveltekit.html)'],
                ['Astro', 'the frontmatter of your layout', '[Astro](install-astro.html)'],
                ['Angular', 'the `styles` array in `angular.json`', '[Angular](install-angular.html)'],
                ['Solid with Vite', '`src/index.jsx`', '[Solid](install-solid.html)'],
              ],
            },
          },
        ],
      },
      {
        h: 'Copy the file instead',
        blocks: [
          'Server rendered stacks such as Laravel, Django, Rails, WordPress or plain PHP often have no CSS bundler. Copy the stylesheet into your public folder and link it like any other static asset:',
          { term: 'cp node_modules/monsooncss/dist/monsoon.min.css public/css/monsoon.min.css', title: 'bash' },
          'To keep the copy in sync when you update the package, run the copy from an npm script. This version uses Node instead of `cp`, so it also works in Windows terminals. Create the `public/css` folder once beforehand:',
          {
            code: `{
  "scripts": {
    "copy:css": "node -e \\"require('fs').copyFileSync('node_modules/monsooncss/dist/monsoon.min.css', 'public/css/monsoon.min.css')\\"",
    "postinstall": "npm run copy:css"
  },
  "devDependencies": {
    "monsooncss": "^${VERSION}"
  }
}`,
            lang: 'json',
            title: 'package.json',
          },
          'Then link `/css/monsoon.min.css` from your layout. The [Laravel](install-laravel.html), [Django](install-django.html), [Rails](install-rails.html), [WordPress](install-wordpress.html) and [PHP](install-php.html) guides show the exact template tag for each.',
        ],
      },
      {
        h: 'The monsooncss command',
        blocks: [
          'The package also installs a command line tool named `monsooncss`. It needs Node.js 18 or newer. Run it with `npx`, or call it by name from an npm script:',
          { term: 'npx monsooncss --version', title: 'bash', out: VERSION },
          {
            table: {
              head: ['Command', 'What it does'],
              rows: [
                ['`monsooncss purge <glob...> -o <file>`', 'Writes a stylesheet with only the utilities your files use. See [Purge CLI](purge-cli.html).'],
                ['`monsooncss classes`', 'Lists every utility class, variants included. Add `--filter <text>` or `--json`.'],
                ['`monsooncss --help`', 'Prints usage and examples.'],
                ['`monsooncss --version`', 'Prints the installed version.'],
              ],
            },
          },
        ],
      },
      {
        h: 'Updating',
        blocks: [
          `npm treats versions below 1.0 carefully: a caret range such as \`^${VERSION}\` accepts new ${MINOR}.x patches but not the next minor release. To move to a new minor version, install it explicitly and read the [changelog](${CHANGELOG}) first:`,
          { term: 'npm install monsooncss@latest', title: 'bash' },
          'To see which version a project uses, run `npm ls monsooncss` or `npx monsooncss --version`. If you copy the file into a public folder, remember that the copy only changes when your copy script runs again.',
        ],
      },
    ],
    faqs: [
      ['Should I import monsooncss or monsooncss/css?', 'Use `monsooncss`, the minified file, for production builds. `monsooncss/css` contains the same rules, formatted for reading and debugging.'],
      ['Does it work in TypeScript projects?', 'Yes. The package only ships CSS, so there are no types to install. A side effect import such as `import \'monsooncss\'` works wherever your bundler handles CSS.'],
      ['Do I have to install the package to use the purge command?', 'No. `npx monsooncss purge` fetches the package on demand. Installing it as a dev dependency pins the version for your team and your CI.'],
    ],
  },

  // 4 ------------------------------------------------------------------------
  {
    slug: 'purge-cli',
    nav: 'Purge CLI',
    title: 'Purge unused CSS with the Monsoon CLI',
    metaTitle: 'Purge CLI | Monsoon docs',
    description: 'Use npx monsooncss purge to write a stylesheet with only the utilities your files use. Globs, safelist, scanning rules, npm scripts and CI.',
    lead: 'The full stylesheet is fine for most sites. When you want to ship less, `monsooncss purge` scans your files and writes a stylesheet that keeps only the utilities they use. It runs once before you deploy and never changes your source files.',
    sections: [
      {
        h: 'When to purge',
        blocks: [
          `Purging is optional. The full file is one cached request of about ${FULL_BR} with brotli, and it gives you every class while you work. Purge when first visit weight matters most (a landing page, a small marketing site), when a performance budget asks for less unused CSS, or when you self host the CSS anyway and already have a deploy step.`,
          'These are real numbers from this release. The kitchen sink demo in the repository uses a wide mix of utilities; the single card page is the first page from the [introduction](introduction.html):',
          {
            table: {
              head: ['File', 'Utility rules', 'Raw', 'gzip', 'brotli'],
              rows: [
                ['Full `monsoon.min.css`', 'all', kb(SIZES.full.raw), kb(SIZES.full.gzip), kb(SIZES.full.brotli)],
                ['Purged, kitchen sink demo', `${fmt(SIZES.sink.kept)} of ${fmt(SIZES.sink.total)}`, kb(SIZES.sink.raw), kb(SIZES.sink.gzip), kb(SIZES.sink.brotli)],
                ['Purged, single card page', `${fmt(SIZES.card.kept)} of ${fmt(SIZES.card.total)}`, kb(SIZES.card.raw), kb(SIZES.card.gzip), kb(SIZES.card.brotli)],
              ],
            },
          },
          'The purged files are close in size because purging removes utilities only. The theme, the reset and the component layer are always kept, as explained below. Keep the full file during development so any class you try just works, and purge for production.',
        ],
      },
      {
        h: 'Run it',
        blocks: [
          'Pass one or more files, folders or glob patterns, and an output file. Running it against the kitchen sink demo in the Monsoon repository prints:',
          {
            term: 'npx monsooncss purge demo/kitchen-sink.html -o public/monsoon.css',
            title: 'bash',
            out: `monsooncss purge: scanned 1 file
  kept ${SIZES.sink.kept} of ${SIZES.sink.total} utility rules
  public/monsoon.css: ${kb(SIZES.sink.raw)} raw, ${kb(SIZES.sink.gzip)} gzip, ${kb(SIZES.sink.brotli)} brotli (full build ${kb(SIZES.full.brotli)} brotli)`,
          },
          'The report goes to standard error. Without `-o`, the CSS itself goes to standard output, so redirecting works and the report never ends up inside the file:',
          { term: 'npx monsooncss purge "src/**/*.html" > public/monsoon.css', title: 'bash' },
        ],
      },
      {
        h: 'Options',
        blocks: [
          {
            table: {
              head: ['Option', 'What it does'],
              rows: [
                ['`<glob...>`', 'Files, folders or glob patterns to scan. At least one is required.'],
                ['`-o`, `--out <file>`', 'Write the CSS to this file and print a size report. Missing folders are created.'],
                ['`--safelist <a,b,c>`', 'Comma separated classes to keep even if no scanned file mentions them.'],
                ['`--no-minify`', 'Write readable, indented CSS instead of minified CSS.'],
                ['`--css <file>`', 'Purge a different copy of the stylesheet instead of the bundled `dist/monsoon.css`. It must be the readable file: the minified one has no marker where the utilities start.'],
                ['`-h`, `--help`', 'Print usage and examples.'],
                ['`-v`, `--version`', 'Print the installed version.'],
              ],
            },
          },
          {
            term: `# readable output, to inspect what was kept
npx monsooncss purge "src/**/*.html" --no-minify -o build/monsoon.css

# keep classes that only exist at runtime
npx monsooncss purge "src/**/*.html" --safelist bg-success,bg-danger -o public/monsoon.css`,
            title: 'bash',
          },
        ],
      },
      {
        h: 'Files, folders and globs',
        blocks: [
          {
            list: [
              '`*` matches inside one folder, `**` matches any depth, `?` matches one character, `[abc]` matches a set, and `{html,php}` expands to alternatives.',
              'A path without wildcards can be a file or a folder. A folder is scanned completely.',
              '`node_modules`, `.git`, `.hg` and `.svn` folders are always skipped.',
              'Quote your patterns. The tool expands them itself, so they behave the same in every shell, Windows included.',
            ],
          },
          'Scan every file that can contain a class name: templates, components, and scripts that build markup. Some typical commands:',
          {
            term: `# a JavaScript app
npx monsooncss purge "src/**/*.{html,js,jsx,tsx,vue,svelte,astro}" -o public/monsoon.css

# Laravel
npx monsooncss purge "resources/views/**/*.blade.php" "resources/js/**/*.{js,vue}" -o public/css/monsoon.css

# Django and Rails in one go
npx monsooncss purge "templates/**/*.html" "app/views/**/*.erb" -o static/monsoon.css`,
            title: 'bash',
          },
        ],
      },
      {
        h: 'How scanning works',
        blocks: [
          'The scanner does not parse HTML or JavaScript. It reads each file as text and splits it on whitespace, quotes, backticks, the backslash and the characters `< > = { } ( ) ; , | & !`. Every piece is a candidate class name, and a copy with a trailing `.` or `:` removed is added too. A utility rule is kept when a class in its selector is one of the candidates.',
          'The consequence is simple: **every class must appear in your source as a complete string.** Names assembled from pieces at runtime are invisible to the scanner:',
          {
            code: `// Found: both full class names appear in the file
const tone = failed
  ? 'bg-danger text-danger-foreground'
  : 'bg-success text-success-foreground';

// Not found: the file only contains "bg-" and the variable name
const badge = 'bg-' + status;`,
            lang: 'js',
            title: 'badge.js',
          },
          'When names come from data, such as a status stored in a database, either map each value to a full class name in your code, or list the classes with `--safelist`.',
          'Variant classes are matched as written. If your markup uses `md:flex`, the rule for `md:flex` is kept, and the plain `flex` rule is kept only if `flex` also appears on its own.',
          { note: 'Extra candidates are harmless. Ordinary words in your text that happen to be class names, such as `block` or `hidden`, only keep a few more small rules.' },
        ],
      },
      {
        h: 'What is always kept',
        blocks: [
          'Purging removes unused utility rules and nothing else. Everything that comes before the utilities in the stylesheet stays:',
          {
            list: [
              'the reset in the `base` cascade layer,',
              'the theme: `--seed`, every derived token, light and dark mode, and the static fallback for browsers without relative colors,',
              'the palette custom properties, `--color-slate-50` to `--color-rose-950`,',
              'the keyframes used by the animation utilities,',
              'the whole [component layer](../components.html), so `btn`, `card` and every other component class keep working without a safelist.',
            ],
          },
          `That is why a purged file has a floor of about ${about(SIZES.card.brotli)} with brotli, even for a page that uses a handful of utilities. Your custom properties such as \`var(--primary)\` also keep working in a purged file, because the tokens are never removed.`,
        ],
      },
      {
        h: 'The classes command',
        blocks: [
          '`monsooncss classes` lists every utility class in the stylesheet, variants included, one per line. `--filter` keeps the names that contain a piece of text, and `--json` prints a JSON array:',
          {
            term: 'npx monsooncss classes --filter grid-cols',
            title: 'bash',
            out: `grid-cols-1
grid-cols-2
grid-cols-3
...
sm:grid-cols-1
sm:grid-cols-2
...`,
          },
          {
            term: `# check whether a variant exists before you write it
npx monsooncss classes --filter md:grid

# every class as JSON, for editor tooling or your own checks
npx monsooncss classes --json > monsoon-classes.json`,
            title: 'bash',
          },
          'The filter is a plain substring match, so `--filter md:grid` also shows the container variant `@md:grid`. The command reads the same stylesheet as purge, and `--css` works here too.',
        ],
      },
      {
        h: 'npm scripts and CI',
        blocks: [
          'Install the package as a dev dependency so everyone runs the same version, then add a script. npm runs a script named `prebuild` automatically before `build`:',
          {
            code: `{
  "scripts": {
    "build:css": "monsooncss purge \\"src/**/*.{html,js}\\" -o dist/monsoon.css",
    "prebuild": "npm run build:css",
    "build": "your-build-command"
  },
  "devDependencies": {
    "monsooncss": "^${VERSION}"
  }
}`,
            lang: 'json',
            title: 'package.json',
          },
          'In CI, install the dependencies and run the same script before you deploy. The command exits with code 1 when none of the patterns match a file, when an option is unknown or when the stylesheet cannot be found, so a broken path fails the job instead of shipping an empty stylesheet:',
          { term: `npm ci
npm run build:css`, title: 'bash' },
          'Treat the purged file as a build artifact: generate it in CI on every deploy rather than committing it, so it can never fall behind your templates.',
        ],
      },
    ],
    faqs: [
      ['Do I need to purge?', `No. The full file is about ${FULL_BR} with brotli and is cached after the first visit. Purging is an optional production step.`],
      ['Why did a class disappear after purging?', 'Its full name does not appear in any scanned file. Check that the file is matched by your patterns and that the class is not built from pieces at runtime, or add it with `--safelist`.'],
      ['Does purging remove component classes?', 'No. The component layer, the reset and the theme are always kept. Only utility rules are removed.'],
      ['Can I purge the minified file?', 'Purge reads the readable `dist/monsoon.css` and minifies its output by default. Pass `--no-minify` for readable output.'],
    ],
  },

  // 5 ------------------------------------------------------------------------
  {
    slug: 'theming',
    nav: 'Theming',
    title: 'Theming with one seed color',
    metaTitle: 'Theming | Monsoon docs',
    description: 'Set --seed to any CSS color and Monsoon derives every semantic token with OKLCH relative colors. Theme sections and override single tokens.',
    lead: 'A Monsoon theme is one line of CSS: `--seed: #0d9488`. The browser derives primary, secondary and accent colors, surfaces, borders, muted text and the focus ring from it, with foregrounds that keep readable contrast. No preprocessor and no generator website.',
    sections: [
      {
        h: 'Set the seed',
        blocks: [
          'Any valid CSS color works: hex, a named color, `rgb()`, `hsl()` or `oklch()`. Set it on the root element to theme the whole page:',
          { code: `:root {
  --seed: #0d9488;
}`, lang: 'css', title: 'theme.css' },
          'Load this after Monsoon, in your own stylesheet or in a `<style>` tag placed after the link, so it wins over the default. Without it, the default seed is `oklch(0.55 0.22 262)`, a saturated blue. To experiment, add `style="--seed: ..."` to an element in the [playground](../playground.html) and watch the tokens change.',
        ],
      },
      {
        h: 'Every derived token',
        blocks: [
          'Each token is a custom property (`var(--primary)`) and a family of utilities (`bg-primary`, `text-primary`, `border-primary`, `ring-primary` and more). Lightness values are on the OKLCH scale from 0 (black) to 1 (white):',
          {
            table: {
              head: ['Token', 'Light / dark lightness', 'What it is for'],
              rows: [
                ['`background`', '0.99 / 0.16', 'The page background. Chroma is capped near zero, so only a hint of the seed hue remains.'],
                ['`foreground`', '0.21 / 0.96', 'Body text on `background` and the surfaces.'],
                ['`surface`', '1 / 0.2', 'Cards and panels.'],
                ['`surface-2`, `surface-3`', '0.97, 0.94 / 0.24, 0.28', 'Raised or nested layers: table headers, wells, hover fills.'],
                ['`muted`', '0.955 / 0.27', 'Subtle fills such as tags and code backgrounds.'],
                ['`muted-foreground`', '0.47 / 0.74', 'Secondary text, captions and placeholders.'],
                ['`border`', '0.9 / 0.33', 'Hairlines. It is also the default color of every border, so `border` alone needs no color class.'],
                ['`primary`', 'the seed, moved out of 0.52 to 0.66', 'Main actions and links. In dark mode the seed is lifted to at least 0.7 first.'],
                ['`primary-foreground`', '1 or 0.17', 'Text on `primary`: white on a dark primary, near black on a light one.'],
                ['`ring`', 'same as primary', 'Focus rings, the default `ring` color and the focus outline in the reset.'],
                ['`secondary`', '0.94 / 0.3', 'Quiet buttons and chips: a low chroma tint of the seed.'],
                ['`accent`', '0.74 to 0.88, both modes', 'Highlights: the seed hue turned by 180 degrees, kept light.'],
                ['`success`, `warning`, `danger`, `info`', 'fixed hues', 'Status colors at hues 150, 80, 27 and 235. They do not follow the seed.'],
              ],
            },
          },
          '`primary`, `secondary`, `accent` and the four status colors each have a `-foreground` partner for text on top of them, `muted` pairs with `muted-foreground`, and `foreground` is the text color for `background` and the surfaces. The 22 hue palette (`bg-emerald-100`, `text-rose-600`) is separate and fixed: it never follows the seed.',
          {
            demo: `<div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm font-medium">
  <div class="rounded-lg bg-primary text-primary-foreground p-3">primary</div>
  <div class="rounded-lg bg-secondary text-secondary-foreground p-3">secondary</div>
  <div class="rounded-lg bg-accent text-accent-foreground p-3">accent</div>
  <div class="rounded-lg bg-muted text-muted-foreground p-3">muted</div>
  <div class="rounded-lg border bg-surface text-foreground p-3">surface</div>
  <div class="rounded-lg bg-surface-3 text-foreground p-3">surface-3</div>
  <div class="rounded-lg bg-success text-success-foreground p-3">success</div>
  <div class="rounded-lg bg-danger text-danger-foreground p-3">danger</div>
</div>`,
            label: 'Tokens from the default seed',
          },
        ],
      },
      {
        h: 'Theme one section',
        blocks: [
          'Custom properties are computed where they are declared, so the tokens must be declared again wherever the seed changes. Monsoon does that automatically for any element whose `style` attribute sets `--seed`:',
          { code: `<section style="--seed: #db2777" class="rounded-2xl bg-surface p-6 space-y-3">
  <h2 class="text-xl font-bold text-primary">Spring sale</h2>
  <button class="rounded-lg bg-primary text-primary-foreground px-4 py-2">Shop now</button>
</section>`, lang: 'html', title: 'section.html' },
          {
            demo: `<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
  <div style="--seed: #0891b2" class="rounded-xl border bg-surface p-5 space-y-3"><p class="font-semibold text-primary">#0891b2</p><span class="inline-block rounded-full bg-secondary text-secondary-foreground px-3 py-1 text-xs font-medium">secondary</span><button class="w-full rounded-lg bg-primary text-primary-foreground py-2 font-medium">Primary</button><button class="w-full rounded-lg bg-accent text-accent-foreground py-2 font-medium">Accent</button></div>
  <div style="--seed: #db2777" class="rounded-xl border bg-surface p-5 space-y-3"><p class="font-semibold text-primary">#db2777</p><span class="inline-block rounded-full bg-secondary text-secondary-foreground px-3 py-1 text-xs font-medium">secondary</span><button class="w-full rounded-lg bg-primary text-primary-foreground py-2 font-medium">Primary</button><button class="w-full rounded-lg bg-accent text-accent-foreground py-2 font-medium">Accent</button></div>
  <div style="--seed: #facc15" class="rounded-xl border bg-surface p-5 space-y-3"><p class="font-semibold">#facc15</p><span class="inline-block rounded-full bg-secondary text-secondary-foreground px-3 py-1 text-xs font-medium">secondary</span><button class="w-full rounded-lg bg-primary text-primary-foreground py-2 font-medium">Primary</button><button class="w-full rounded-lg bg-accent text-accent-foreground py-2 font-medium">Accent</button></div>
</div>`,
            label: 'Three seed islands on one page',
          },
          'Look at the yellow island: a light seed gets near black text on its primary button, while the darker seeds get white text. Each island also tints its own surface and computes its own accent.',
          { h3: 'Setting the seed from your own CSS' },
          'If you set `--seed` from your stylesheet instead of the `style` attribute, add the `theme` class to the same element. It tells Monsoon to recompute the tokens there without painting anything:',
          { code: `[data-brand="ocean"] {
  --seed: #0369a1;
}`, lang: 'css', title: 'brands.css' },
          { code: `<div data-brand="ocean" class="theme rounded-2xl border bg-surface p-6">
  <a href="/plans" class="text-primary font-medium">See plans</a>
</div>`, lang: 'html', title: 'plans.html' },
        ],
      },
      {
        h: 'Override a single token',
        blocks: [
          'Sometimes the brand needs one exact color. Set that token yourself after Monsoon loads. Use the same list of selectors Monsoon uses for its tokens, so the override also applies inside themed sections:',
          { code: `:root, .theme, .dark, .light, [data-theme], [style*="--seed"] {
  --danger: #c81e1e;
}`, lang: 'css', title: 'theme.css' },
          'The partner token follows automatically: `--danger-foreground` is computed from `var(--danger)`, so it still flips between white and near black for your color. The same is true for `primary`, `secondary`, `accent` and the status colors.',
          'To give an override a different value in dark mode, use `--mode`, which is 0 in light mode and 1 in dark mode, the same way Monsoon does:',
          { code: `:root, .theme, .dark, .light, [data-theme], [style*="--seed"] {
  /* lightness 0.5 in light mode, 0.72 in dark mode */
  --info: oklch(calc(0.5 + 0.22 * var(--mode)) 0.13 250);
}`, lang: 'css', title: 'theme.css' },
          { warn: 'An overridden color skips the lightness adjustment that Monsoon applies to the seed. Check its contrast against its foreground in both modes.' },
        ],
      },
      {
        h: 'Accent: the opposite hue',
        blocks: [
          'The accent token takes the seed hue and turns it by 180 degrees, so it always sits on the opposite side of the color wheel: a teal seed gets a coral accent, a blue seed gets an amber one. Its lightness is kept between 0.74 and 0.88 and its chroma is capped at 0.16, so it reads as a bright highlight in both modes, always with dark text.',
          'Use it sparingly, for things that should stand out from the primary color: a "new" badge, a highlighted price, the second stop of a gradient.',
          { code: `<div class="h-24 rounded-2xl bg-gradient-to-br from-primary to-accent"></div>`, lang: 'html', title: 'banner.html' },
          {
            demo: `<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
  <div style="--seed: teal" class="h-20 rounded-xl bg-gradient-to-br from-primary to-accent"></div>
  <div style="--seed: #2563eb" class="h-20 rounded-xl bg-gradient-to-br from-primary to-accent"></div>
  <div style="--seed: #9333ea" class="h-20 rounded-xl bg-gradient-to-br from-primary to-accent"></div>
</div>`,
            label: 'Primary to accent for three seeds',
          },
        ],
      },
      {
        h: 'Contrast guarantees',
        blocks: [
          'White text needs a dark fill and near black text needs a light fill. Around an OKLCH lightness of 0.52 to 0.66, neither choice reaches 4.5:1 for every hue, so Monsoon moves the primary color out of that band, to the side that is closer to your seed, and flips its foreground on the same threshold. The other foregrounds flip on the same rule.',
          'The test suite checks a contrast ratio of at least 4.5:1 (WCAG AA for body text) for these 13 pairs, in light and dark mode, for 18 named seeds and a sweep of 2,197 seeds across sRGB:',
          {
            list: [
              '`primary`, `secondary`, `accent`, `success`, `warning`, `danger` and `info`, each with its `-foreground`,',
              '`foreground` on `background`, `surface`, `surface-2` and `surface-3`,',
              '`muted-foreground` on `background` and on `muted`.',
            ],
          },
          'The guarantee covers those pairs. Combinations you choose yourself, such as palette colors or `text-accent` on a white surface, are up to you to check.',
        ],
      },
    ],
    faqs: [
      ['Which color formats can I use for --seed?', 'Any CSS color: hex, named colors, `rgb()`, `hsl()`, `oklch()` and others. The browser converts it to OKLCH for the calculations.'],
      ['Can different parts of a page use different seeds?', 'Yes. Put `style="--seed: ..."` on any element, or set the seed with a class and add `theme` to that element.'],
      ['Do the palette colors change with the seed?', 'No. The 22 hue palette is fixed. Only the semantic tokens follow the seed.'],
      ['What happens in browsers without relative colors?', 'They get static tokens computed from the default seed, with `primary` and `ring` set to your seed directly. See [Browser support](browser-support.html).'],
    ],
  },

  // 6 ------------------------------------------------------------------------
  {
    slug: 'dark-mode',
    nav: 'Dark mode',
    title: 'Dark mode',
    metaTitle: 'Dark mode | Monsoon docs',
    description: 'Monsoon follows prefers-color-scheme automatically. Force a scheme with class="dark" or data-theme, style palette colors with dark:, add a toggle.',
    lead: 'If your page uses the semantic colors, dark mode already works. Monsoon follows the operating system setting, and one class or attribute forces a scheme on the whole page or on any section. JavaScript is only needed if you want a switcher.',
    sections: [
      {
        h: 'Automatic by default',
        blocks: [
          'Monsoon listens to `prefers-color-scheme`. When the visitor uses a dark system theme, the number `--mode` becomes 1 and every semantic token recomputes: the background goes dark, text goes light, surfaces and borders follow, and the primary color is lifted so it stays readable on the dark background. Monsoon also sets `color-scheme`, so native form controls and scrollbars switch with it.',
          'This card is correct in both schemes without a single `dark:` class:',
          { code: `<div class="rounded-2xl border bg-surface p-6 space-y-3">
  <h3 class="text-lg font-semibold">Invoices</h3>
  <p class="text-muted-foreground">Three are waiting for approval.</p>
  <a href="/invoices" class="text-primary font-medium underline underline-offset-4">Review now</a>
</div>`, lang: 'html', title: 'card.html' },
        ],
      },
      {
        h: 'Force a scheme on the page',
        blocks: [
          'To pin the whole page, add a class or an attribute to the `<html>` element. The class and the attribute are equivalent:',
          { code: `<html lang="en" class="dark">
<!-- or -->
<html lang="en" data-theme="dark">`, lang: 'html', title: 'index.html' },
          '`class="light"` or `data-theme="light"` pins light mode, which also stops the automatic switch when the operating system is dark. Without either, the page follows the system.',
        ],
      },
      {
        h: 'Dark and light sections',
        blocks: [
          'The same classes work on any element. A themed section recomputes the tokens for everything inside it, switches `color-scheme`, and paints its own text and background color, so a light card inside a dark page is never dark text on a dark backdrop:',
          { code: `<div class="light rounded-xl border p-5">...</div>
<div class="dark rounded-xl border p-5">...</div>`, lang: 'html', title: 'sections.html' },
          {
            demo: `<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
  <div class="light rounded-xl border p-5 space-y-3">
    <p class="font-semibold">class="light"</p>
    <p class="text-sm text-muted-foreground">Same markup, light tokens.</p>
    <div class="flex flex-wrap items-center gap-2"><button class="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium">Continue</button><span class="rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-3 py-1 text-xs font-medium">Draft</span></div>
  </div>
  <div class="dark rounded-xl border p-5 space-y-3">
    <p class="font-semibold">class="dark"</p>
    <p class="text-sm text-muted-foreground">Same markup, dark tokens.</p>
    <div class="flex flex-wrap items-center gap-2"><button class="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium">Continue</button><span class="rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-3 py-1 text-xs font-medium">Draft</span></div>
  </div>
</div>`,
            label: 'A light and a dark card side by side',
          },
          'The automatic paint has zero specificity, so a background or text utility on the same element still wins. Use `theme` instead when you only want new tokens for a different `--seed`, without any paint.',
          { h3: 'Nested sections' },
          'Sections nest to any depth. `--mode` is inherited, so the nearest themed ancestor decides, and the tokens are exact at every level:',
          {
            demo: `<div class="dark rounded-xl border p-4 space-y-3">
  <p class="text-sm text-muted-foreground">class="dark"</p>
  <div class="light rounded-lg border p-4 space-y-3">
    <p class="text-sm text-muted-foreground">class="light" inside a dark section</p>
    <div class="dark rounded-md border p-3"><p class="text-sm font-medium">class="dark" one level deeper</p></div>
  </div>
</div>`,
            label: 'Dark, light, dark',
          },
          'The `dark:` variant follows the same nearest ancestor rule. A selector cannot express "nearest" at any depth by itself, so the deepest case (dark inside light inside dark) relies on `@scope`. In browsers without `@scope`, `dark:` classes in that one arrangement keep their light values. Semantic tokens are not affected.',
        ],
      },
      {
        h: 'The dark: variant for palette colors',
        blocks: [
          'Semantic tokens switch by themselves. Palette colors do not, because `bg-slate-100` is one specific color. For those, Monsoon generates a `dark:` variant:',
          {
            list: [
              'every step of the neutral hues (`slate`, `gray`, `zinc`, `neutral`, `stone`) for background, text and border,',
              'the middle steps of the other hues: 300 to 700 for text, 500 to 700 for background and border,',
              '`white`, `black` and `transparent`, and the opacity modifiers such as `bg-black/10` and `bg-primary/90`.',
            ],
          },
          { code: `<span class="rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-3 py-1 text-sm">
  Draft
</span>
<div class="rounded-xl border border-black/10 dark:border-white/10 p-4">...</div>`, lang: 'html', title: 'badge.html' },
          '`dark:` applies inside `.dark` or `[data-theme=dark]`, and with the system dark setting unless the page or a nearer section is forced light. Filter the [class reference](../classes.html) by variant to see every class that has it.',
        ],
      },
      {
        h: 'A theme switcher: system, light, dark',
        blocks: [
          'A three state switcher stores the choice and writes `data-theme` on the `<html>` element. "System" simply removes the attribute, so the page follows the operating system again.',
          '**Step 1: apply the saved choice before the first paint.** Put this inline script in the `<head>`, before the stylesheet link. It runs before anything is drawn, so a visitor who chose dark never sees a flash of the light page. Keep it inline: an external or deferred script would run too late.',
          { code: HEAD_SCRIPT, lang: 'html', title: 'head.html' },
          '**Step 2: the control.** A native `<select>` is keyboard and screen reader friendly with no extra work:',
          {
            code: `<label class="inline-flex items-center gap-2 text-sm font-medium">
  Theme
  <select data-theme-picker class="rounded-lg border bg-surface px-3 py-2 text-sm">
    <option value="system">System</option>
    <option value="light">Light</option>
    <option value="dark">Dark</option>
  </select>
</label>

<script>
  (function () {
    var root = document.documentElement;
    var picker = document.querySelector('[data-theme-picker]');
    picker.value = root.getAttribute('data-theme') || 'system';

    picker.addEventListener('change', function () {
      var choice = picker.value;
      if (choice === 'system') root.removeAttribute('data-theme');
      else root.setAttribute('data-theme', choice);
      try {
        if (choice === 'system') localStorage.removeItem('theme');
        else localStorage.setItem('theme', choice);
      } catch (e) {}
    });
  })();
</script>`,
            lang: 'html',
            title: 'theme-picker.html',
          },
          'The `try` blocks matter: some browsers throw when storage is disabled, and the page should still work. If you prefer classes, use `root.classList` with `dark` and `light` instead of the attribute; Monsoon treats both the same.',
          { note: 'On a server rendered site you can skip the head script: store the choice in a cookie and render `data-theme="dark"` on the `<html>` element directly. The page is correct on the first paint with no script at all.' },
        ],
      },
      {
        h: 'Details worth a second look',
        blocks: [
          {
            list: [
              '**Shadows** are hard to see on dark surfaces. Separate layers with `bg-surface-2` or `bg-surface-3` and a `border` rather than a large shadow.',
              '**Logos and illustrations** with dark strokes can disappear. Swap them with a `<picture>` element and a `prefers-color-scheme` media query, or give them a light backing.',
              '**Pure white text** on a dark background can glare. `foreground` is a soft off white, so prefer `text-foreground` over `text-white` for body copy.',
              '**Charts** drawn with palette colors keep their colors. Middle steps such as 500 read well on both backgrounds.',
              '**Your own CSS** follows the scheme for free when it uses tokens: `border-color: var(--border)` is right in both modes, with no media query.',
            ],
          },
        ],
      },
    ],
    faqs: [
      ['Do I need dark: classes for dark mode?', 'Not for semantic colors such as `bg-surface`, `text-foreground` or `bg-primary`, which switch on their own. Use `dark:` only for fixed palette colors, white, black and opacity modifiers.'],
      ['Should I use class="dark" or data-theme="dark"?', 'Either. They do exactly the same thing. Pick the one that fits your templates or your switcher script.'],
      ['How do I stop the flash of the wrong theme on load?', 'Apply the saved choice with a small inline script in the `<head>`, as shown above, or render the attribute on the server.'],
      ['Can one section stay dark while the page is light?', 'Yes. Put `class="dark"` on the section. Tokens are recomputed for everything inside it.'],
    ],
  },

  // 7 ------------------------------------------------------------------------
  {
    slug: 'responsive-design',
    nav: 'Responsive design',
    title: 'Responsive design',
    metaTitle: 'Responsive design | Monsoon docs',
    description: 'Mobile first breakpoint variants sm: to 2xl: for layout, flex, grid, spacing, sizing and text, plus patterns for hiding, showing and grids.',
    lead: 'Monsoon is mobile first. Write the small screen layout with plain classes, then add a breakpoint prefix such as `md:` to change something from that width up. Each prefix is a `min-width` media query, already in the stylesheet.',
    sections: [
      {
        h: 'Breakpoints',
        blocks: [
          {
            table: {
              head: ['Prefix', 'Applies from', 'Media query'],
              rows: [
                ['`sm:`', '640px', '`@media (min-width: 640px)`'],
                ['`md:`', '768px', '`@media (min-width: 768px)`'],
                ['`lg:`', '1024px', '`@media (min-width: 1024px)`'],
                ['`xl:`', '1280px', '`@media (min-width: 1280px)`'],
                ['`2xl:`', '1536px', '`@media (min-width: 1536px)`'],
              ],
            },
          },
          'An unprefixed class applies at every width. A prefixed class applies at its breakpoint and above, and overrides the smaller ones because the rules appear in that order. So `grid-cols-1 md:grid-cols-2 xl:grid-cols-4` means one column on phones, two from 768px and four from 1280px.',
          'Design for the narrowest screen first. It is usually the simplest layout, a single column, and every prefix you add after that describes one change as space grows. To test, resize the window or switch on the device toolbar in your browser developer tools and step through the widths in the table.',
          { note: 'There are no max-width variants. To style only small screens, write the small screen value without a prefix and undo it at the breakpoint, for example `flex-col md:flex-row`.' },
        ],
      },
      {
        h: 'A first responsive layout',
        blocks: [
          { code: `<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  <div class="rounded-xl border bg-surface p-4">One</div>
  <div class="rounded-xl border bg-surface p-4">Two</div>
  <div class="rounded-xl border bg-surface p-4">Three</div>
  <div class="rounded-xl border bg-surface p-4">Four</div>
</div>`, lang: 'html', title: 'grid.html' },
          {
            demo: `<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm font-medium">
  <div class="rounded-xl border bg-surface p-4">One</div>
  <div class="rounded-xl border bg-surface p-4">Two</div>
  <div class="rounded-xl border bg-surface p-4">Three</div>
  <div class="rounded-xl border bg-surface p-4">Four</div>
</div>`,
            label: 'Resize the window: 1, 2 or 4 columns',
          },
          'Breakpoints follow the width of the browser window, not the width of this preview box. For components that should react to their own column, use [container queries](container-queries.html).',
        ],
      },
      {
        h: 'Which utilities have breakpoint variants',
        blocks: [
          'Breakpoint variants are generated for the utilities that change a layout. Colors, borders, shadows and other decoration have none, because they rarely change with the screen width and leaving them out keeps the file small. Every breakpoint covers the same set:',
          {
            table: {
              head: ['Category', 'Utilities with sm: to 2xl:', 'Classes per breakpoint'],
              rows: [
                [catLink('layout'), 'display (`block`, `flex`, `grid`, `hidden` and more) and position (`static`, `relative`, `absolute`, `fixed`, `sticky`)', fmt(coverage('md').layout || 0)],
                [catLink('flexbox'), 'direction, wrapping, `flex-1` and friends, `basis-*`, `order-*`', fmt(coverage('md').flexbox || 0)],
                [catLink('grid'), '`grid-cols-*`, `col-span-*`, `col-auto`', fmt(coverage('md').grid || 0)],
                [catLink('spacing'), 'padding, margin (including `mx-auto`) and gap, every step of the scale', fmt(coverage('md').spacing || 0)],
                [catLink('alignment'), '`items-*`, `justify-*`, `self-*`', fmt(coverage('md').alignment || 0)],
                [catLink('sizing'), 'width (scale, fractions, `w-full`, `w-screen`), height keywords such as `h-full` and `h-screen`, `max-w-*`', fmt(coverage('md').sizing || 0)],
                [catLink('typography'), 'text size, font weight, text alignment', fmt(coverage('md').typography || 0)],
                [catLink('accessibility'), '`sr-only`, `not-sr-only`', fmt(coverage('md').accessibility || 0)],
              ],
            },
          },
          `That is ${fmt(total(coverage('md')))} classes per breakpoint and ${fmt(total(coverage('md')) * 5)} in total. The [class reference](../classes.html) shows the variants of each class.`,
        ],
      },
      {
        h: 'Hiding and showing',
        blocks: [
          'Combine `hidden` with a display class at a breakpoint. The element below is hidden on small screens and shown from `md:` up, while the other one does the opposite:',
          { code: `<span class="md:hidden">Below 768px</span>
<span class="hidden md:inline-flex">768px and up</span>
<span class="hidden lg:inline-flex">1024px and up</span>`, lang: 'html', title: 'visibility.html' },
          {
            demo: `<div class="flex flex-wrap gap-2 text-sm font-medium">
  <span class="md:hidden rounded-full bg-secondary text-secondary-foreground px-3 py-1">Below 768px</span>
  <span class="hidden md:inline-flex rounded-full bg-primary text-primary-foreground px-3 py-1">768px and up</span>
  <span class="hidden lg:inline-flex rounded-full bg-accent text-accent-foreground px-3 py-1">1024px and up</span>
</div>`,
            label: 'Badges that depend on the window width',
          },
          'For content that should stay available to screen readers, use `sr-only md:not-sr-only` instead of `hidden`: the text is visually hidden on small screens but still read aloud, for example the label next to an icon button.',
        ],
      },
      {
        h: 'Responsive grids',
        blocks: [
          'A twelve column grid with `col-span-*` covers most page layouts. Start with one column, and switch to twelve at the breakpoint where the content has room:',
          { code: `<div class="grid grid-cols-1 md:grid-cols-12 gap-4">
  <main class="md:col-span-8">Article</main>
  <aside class="md:col-span-4">Sidebar</aside>
  <div class="md:col-span-4">Card</div>
  <div class="md:col-span-4">Card</div>
  <div class="md:col-span-4">Card</div>
</div>`, lang: 'html', title: 'layout.html' },
          {
            demo: `<div class="grid grid-cols-1 md:grid-cols-12 gap-3 text-sm font-medium">
  <div class="md:col-span-8 rounded-lg bg-primary text-primary-foreground p-4">col-span-8</div>
  <div class="md:col-span-4 rounded-lg bg-secondary text-secondary-foreground p-4">col-span-4</div>
  <div class="md:col-span-4 rounded-lg border bg-surface p-4">col-span-4</div>
  <div class="md:col-span-4 rounded-lg border bg-surface p-4">col-span-4</div>
  <div class="md:col-span-4 rounded-lg border bg-surface p-4">col-span-4</div>
</div>`,
            label: 'Twelve column grid from md: up',
          },
        ],
      },
      {
        h: 'Direction, spacing and type',
        blocks: [
          'The same idea works for flex direction, spacing and text size. This media object stacks on phones and sits in a row from `sm:` up, with more padding and a larger heading on wider screens:',
          { code: `<article class="flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl border bg-surface p-4 md:p-6">
  <div class="size-16 shrink-0 rounded-xl bg-gradient-to-br from-primary to-accent"></div>
  <div class="space-y-1">
    <h3 class="text-lg md:text-xl font-semibold">Weekend workshop</h3>
    <p class="text-sm text-muted-foreground">Saturday, 10:00 to 16:00. Twelve seats left.</p>
  </div>
</article>`, lang: 'html', title: 'media.html' },
          {
            demo: `<article class="flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl border bg-surface p-4 md:p-6">
  <div class="size-16 shrink-0 rounded-xl bg-gradient-to-br from-primary to-accent"></div>
  <div class="space-y-1">
    <p class="text-lg md:text-xl font-semibold">Weekend workshop</p>
    <p class="text-sm text-muted-foreground">Saturday, 10:00 to 16:00. Twelve seats left.</p>
  </div>
</article>`,
            label: 'Stacked on phones, a row from 640px',
          },
          'Breakpoints only take one prefix per class, so `md:hover:` does not exist. Where you need both, see the workarounds in [Variants](variants.html).',
        ],
      },
    ],
    faqs: [
      ['Is Monsoon mobile first?', 'Yes. Unprefixed classes apply everywhere, and `sm:` to `2xl:` apply from their width up.'],
      ['Can I change the breakpoint widths?', 'Not in the prebuilt file: the widths are part of the media queries. For component level changes, container queries let you pick the element that is measured.'],
      ['Why does md:bg-primary not exist?', 'Breakpoint variants are generated for layout utilities only. Change colors at a breakpoint with your own CSS and the theme variables.'],
    ],
  },

  // 8 ------------------------------------------------------------------------
  {
    slug: 'container-queries',
    nav: 'Container queries',
    title: 'Container queries',
    metaTitle: 'Container queries | Monsoon docs',
    description: 'Mark a parent with @container and use @xs: to @xl: on its children, so components adapt to the width of their column instead of the screen.',
    lead: 'Viewport breakpoints answer "how wide is the window". A component usually needs to know "how wide is my column". Container queries answer that, and Monsoon exposes them as utility classes you write straight in your HTML.',
    sections: [
      {
        h: 'Two pieces: a container and a prefix',
        blocks: [
          'Mark a parent with the `@container` class. It sets `container-type: inline-size`, which makes the element a container measured by its width. Then prefix utilities on any descendant with a container breakpoint such as `@md:`:',
          { code: `<div class="@container">
  <div class="flex flex-col @md:flex-row gap-4">
    <img class="rounded-xl @md:w-1/3" src="cover.jpg" alt="Cover">
    <div class="space-y-2">
      <h3 class="text-lg @lg:text-2xl font-bold">Title</h3>
      <p class="text-muted-foreground">Stacked when narrow, a row when wide.</p>
    </div>
  </div>
</div>`, lang: 'html', title: 'card.html' },
          'The class `container-q` does the same as `@container`, for templates or tools that do not like the at sign in a class name.',
        ],
      },
      {
        h: 'Container breakpoints',
        blocks: [
          {
            table: {
              head: ['Prefix', 'Container width at least', 'In pixels (16px root)', 'Query'],
              rows: [
                ['`@xs:`', '20rem', '320px', '`@container (min-width: 20rem)`'],
                ['`@sm:`', '24rem', '384px', '`@container (min-width: 24rem)`'],
                ['`@md:`', '28rem', '448px', '`@container (min-width: 28rem)`'],
                ['`@lg:`', '32rem', '512px', '`@container (min-width: 32rem)`'],
                ['`@xl:`', '36rem', '576px', '`@container (min-width: 36rem)`'],
              ],
            },
          },
          'They are measured in rem because containers are usually much smaller than screens, and they follow the user font size. Like the viewport breakpoints they are mobile first: write the narrow layout without a prefix and add the wider one with a prefix.',
        ],
      },
      {
        h: 'One card, two parents',
        blocks: [
          'Here the same card sits in a wide parent and in a narrow one. The card switches to a row when its own container reaches 20rem (`@xs:`), whatever the window width:',
          { code: `<div class="grid sm:flex gap-4">
  <div class="@container flex-1 rounded-xl border bg-surface p-3">
    <!-- card -->
  </div>
  <div class="@container sm:w-48 rounded-xl border bg-surface p-3">
    <!-- the same card -->
  </div>
</div>

<!-- card -->
<div class="flex flex-col @xs:flex-row gap-3">
  <div class="h-24 @xs:w-1/3 shrink-0 rounded-lg bg-gradient-to-br from-primary to-accent"></div>
  <div class="space-y-1">
    <p class="font-semibold @xs:text-lg">Mountain cabin</p>
    <p class="text-sm text-muted-foreground">Sleeps four. Wood stove, lake view.</p>
  </div>
</div>`, lang: 'html', title: 'cards.html' },
          {
            demo: `<div class="grid sm:flex gap-4">
  <div class="@container flex-1 rounded-xl border bg-surface p-3">
    <div class="flex flex-col @xs:flex-row gap-3">
      <div class="h-24 @xs:w-1/3 shrink-0 rounded-lg bg-gradient-to-br from-primary to-accent"></div>
      <div class="space-y-1"><p class="font-semibold @xs:text-lg">Mountain cabin</p><p class="text-sm text-muted-foreground">Sleeps four. Wood stove, lake view.</p></div>
    </div>
  </div>
  <div class="@container sm:w-48 rounded-xl border bg-surface p-3">
    <div class="flex flex-col @xs:flex-row gap-3">
      <div class="h-24 @xs:w-1/3 shrink-0 rounded-lg bg-gradient-to-br from-primary to-accent"></div>
      <div class="space-y-1"><p class="font-semibold @xs:text-lg">Mountain cabin</p><p class="text-sm text-muted-foreground">Sleeps four. Wood stove, lake view.</p></div>
    </div>
  </div>
</div>`,
            label: 'Same markup in a wide and a narrow container',
          },
          'On a phone both parents are narrow, so both cards stack. On a wider screen the left parent grows past 20rem and its card turns into a row, while the right parent stays at 12rem and keeps the stacked layout.',
        ],
      },
      {
        h: 'Which utilities have container variants',
        blocks: [
          'Container variants are generated for the utilities you use to rearrange a component. Each of the five prefixes covers the same set:',
          {
            table: {
              head: ['Category', 'Utilities with @xs: to @xl:', 'Classes per prefix'],
              rows: [
                [catLink('layout'), '`block`, `inline-block`, `inline`, `flex`, `inline-flex`, `grid`, `hidden`', fmt(coverage('@md').layout || 0)],
                [catLink('flexbox'), '`flex-row`, `flex-col`, `flex-wrap`, `flex-nowrap`', fmt(coverage('@md').flexbox || 0)],
                [catLink('grid'), '`grid-cols-1` to `grid-cols-12`, `col-span-1` to `col-span-12`, `col-span-full`', fmt(coverage('@md').grid || 0)],
                [catLink('spacing'), 'every `gap`, `gap-x` and `gap-y` step; `p`, `px` and `py` at 0, 1, 2, 3, 4, 6, 8, 10, 12 and 16', fmt(coverage('@md').spacing || 0)],
                [catLink('alignment'), '`items-*` and `justify-*`', fmt(coverage('@md').alignment || 0)],
                [catLink('sizing'), 'width fractions, `w-full` and `w-auto`', fmt(coverage('@md').sizing || 0)],
                [catLink('typography'), '`text-xs` to `text-9xl`, `text-left`, `text-center`, `text-right`', fmt(coverage('@md').typography || 0)],
              ],
            },
          },
          `That is ${fmt(total(coverage('@md')))} classes per prefix. Filter the [class reference](../classes.html) by variant, or run \`npx monsooncss classes --filter @md:\`, to see each one.`,
        ],
      },
      {
        h: 'Breakpoints or container queries?',
        blocks: [
          'They answer different questions, and most pages use both. Use viewport breakpoints (`md:`, `lg:`) for decisions about the whole page: how many columns the layout has, whether the navigation collapses, how wide the main content is. Use container queries for decisions inside a component: whether a card shows its image beside or above the text, how many items a row holds, how large a heading is.',
          'A good test is to ask where the component will be reused. A product card that appears in a three column grid, in a sidebar and in a full width search result cannot rely on the window width, because the same window gives it three different widths. That card wants container queries. A site header always spans the window, so viewport breakpoints fit it.',
          'A common pattern combines them: breakpoints decide the page grid, and each cell is an `@container` whose content adapts to the cell.',
          { code: `<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
  <section class="lg:col-span-2 @container">
    <div class="grid grid-cols-1 @md:grid-cols-2 gap-4">...</div>
  </section>
  <aside class="@container">
    <div class="grid grid-cols-1 @md:grid-cols-2 gap-4">...</div>
  </aside>
</div>`, lang: 'html', title: 'layout.html' },
        ],
      },
      {
        h: 'Named containers and other limits',
        blocks: [
          'Monsoon has no named container utilities: every prefixed class responds to its **nearest** ancestor container. That covers most components, because the nearest container is usually the one you mean. When you need to skip a level, name the container in your own CSS and write that one query by hand:',
          { code: `.sidebar {
  container: sidebar / inline-size;
}

@container sidebar (min-width: 30rem) {
  .sidebar-nav {
    display: flex;
    gap: 1rem;
  }
}`, lang: 'css', title: 'sidebar.css' },
          {
            list: [
              'An element cannot query itself. Put `@container` on a parent and the prefixed classes on its children.',
              'An inline size container does not take its width from its content. Give it a width from the layout: a grid cell, a flex item with `flex-1`, or `w-full`. Inside a shrink to fit parent it can collapse to zero.',
              'Containers nest. A prefixed class always responds to the nearest one.',
              'Container queries work in all current browsers. Older ones ignore the prefixed classes and keep the unprefixed, narrow layout. See [Browser support](browser-support.html).',
            ],
          },
        ],
      },
    ],
    faqs: [
      ['What is the difference between md: and @md:?', '`md:` checks the window width (768px and up). `@md:` checks the width of the nearest `@container` ancestor (28rem and up).'],
      ['Do container queries need a build step?', 'No. The `@container` class and the `@xs:` to `@xl:` variants are in the stylesheet you link.'],
      ['Does Monsoon support named containers?', 'Not as utilities. Prefixed classes use the nearest container. Name a container in your own CSS when you need to target a specific one.'],
    ],
  },

  // 9 ------------------------------------------------------------------------
  {
    slug: 'variants',
    nav: 'Variants',
    title: 'Variants',
    metaTitle: 'Variants | Monsoon docs',
    description: 'Every Monsoon variant: hover, focus, group and peer, structural, motion, dark, breakpoints and container queries, and which utilities get each.',
    lead: `A variant is a prefix that applies a utility under a condition: \`hover:bg-primary/90\`, \`md:flex-row\`, \`dark:bg-slate-800\`. Monsoon predeclares ${fmt(VARIANT_COUNT)} variant classes, generated for the utility groups where each condition is useful.`,
    sections: [
      {
        h: 'How variants work',
        blocks: [
          'Write the variant, a colon and the utility. The variant only changes when the rule applies, never what it does:',
          { code: `<button class="bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 focus-visible:ring-2 disabled:opacity-50">
  Save
</button>`, lang: 'html', title: 'button.html' },
          'Because the stylesheet is prebuilt, a variant class exists only where it was generated. `hover:bg-primary` exists, `hover:p-4` does not. The [class reference](../classes.html) lists the variants of every class, and `npx monsooncss classes --filter hover:` lists them in a terminal.',
        ],
      },
      {
        h: 'Every variant',
        blocks: [
          {
            table: {
              head: ['Variant', 'Applies when', 'CSS'],
              rows: [
                ['`hover:`', 'the pointer is over the element', '`:hover`'],
                ['`focus:`', 'the element has focus', '`:focus`'],
                ['`focus-visible:`', 'the element has keyboard focus', '`:focus-visible`'],
                ['`focus-within:`', 'the element or a descendant has focus', '`:focus-within`'],
                ['`active:`', 'the element is being pressed', '`:active`'],
                ['`disabled:`', 'a form control is disabled', '`:disabled`'],
                ['`group-hover:`', 'an ancestor with the `group` class is hovered', '`.group:hover .x`'],
                ['`peer-checked:`', 'an earlier sibling with the `peer` class is checked', '`.peer:checked ~ .x`'],
                ['`first:`, `last:`', 'the element is the first or last child', '`:first-child`, `:last-child`'],
                ['`odd:`, `even:`', 'the element is an odd or even child', '`:nth-child(odd)`, `:nth-child(even)`'],
                ['`motion-safe:`', 'the visitor has not asked for reduced motion', '`@media (prefers-reduced-motion: no-preference)`'],
                ['`motion-reduce:`', 'the visitor asked for reduced motion', '`@media (prefers-reduced-motion: reduce)`'],
                ['`dark:`', 'the nearest themed ancestor is dark, or none is set and the system is dark', 'selectors, `@scope` and `prefers-color-scheme`'],
                ['`sm:` to `2xl:`', 'the window is at least 640, 768, 1024, 1280 or 1536px wide', '`@media (min-width: ...)`'],
                ['`@xs:` to `@xl:`', 'the nearest container is at least 20, 24, 28, 32 or 36rem wide', '`@container (min-width: ...)`'],
              ],
            },
          },
          'Details on the last three: [Dark mode](dark-mode.html), [Responsive design](responsive-design.html) and [Container queries](container-queries.html).',
        ],
      },
      {
        h: 'Which utilities get which variants',
        blocks: [
          'Each variant is generated for a curated set of utility groups. This table is computed from the class index that ships with this release:',
          {
            table: {
              head: ['Variant', 'Typical use', 'Classes per category'],
              rows: [
                ['`hover:`', 'semantic colors, white, black, palette steps 500 to 700, opacity modifiers, shadows, opacity, transforms, underline', covText('hover')],
                ['`focus:`', 'semantic colors, rings, outlines, `sr-only`', covText('focus')],
                ['`focus-visible:`', 'the same as `focus:`', covText('focus-visible')],
                ['`focus-within:`', 'semantic colors, rings, outlines', covText('focus-within')],
                ['`active:`', 'semantic colors, white, black, opacity modifiers, shadows, opacity, transforms, underline', covText('active')],
                ['`disabled:`', 'semantic colors, opacity, `cursor-not-allowed`, `pointer-events-none`', covText('disabled')],
                ['`group-hover:`', 'colors, display, visibility, shadows, opacity, transforms', covText('group-hover')],
                ['`peer-checked:`', 'semantic colors, display, visibility, shadows, opacity, transforms', covText('peer-checked')],
                ['`first:` `last:` `odd:` `even:`', 'semantic backgrounds and borders, light neutral backgrounds, zero padding, margin and border widths', covText('first')],
                ['`dark:`', 'palette colors, white, black, opacity modifiers', covText('dark')],
                ['`motion-safe:` `motion-reduce:`', 'transitions and animations', covText('motion-safe')],
                ['`sm:` to `2xl:`', 'display, position, flex, grid, spacing, alignment, sizing, text', covText('md')],
                ['`@xs:` to `@xl:`', 'display, flex direction, grid, gap, padding, alignment, width, text', covText('@md')],
              ],
            },
          },
          'The counts are per variant: `odd:` has the same classes as `first:`, and every breakpoint has the same classes as `md:`.',
        ],
      },
      {
        h: 'State variants in practice',
        blocks: [
          'Buttons and inputs combine several state variants. `transition` smooths the change, and the focus ring appears only for keyboard focus:',
          { code: `<button class="rounded-lg bg-primary text-primary-foreground px-4 py-2 font-medium transition hover:bg-primary/90 active:scale-95 focus-visible:ring-2 focus-visible:ring-offset-2">Save</button>
<button class="rounded-lg border bg-surface px-4 py-2 font-medium transition hover:bg-surface-2 active:scale-95">Cancel</button>
<button disabled class="rounded-lg bg-primary text-primary-foreground px-4 py-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed">Disabled</button>

<div class="flex items-center gap-2 rounded-lg border bg-surface px-3 py-2 focus-within:border-primary focus-within:ring-2">
  <input class="flex-1 bg-transparent text-sm outline-none" placeholder="Search" aria-label="Search">
</div>`, lang: 'html', title: 'states.html' },
          {
            demo: `<div class="space-y-4">
  <div class="flex flex-wrap items-center gap-3">
    <button class="rounded-lg bg-primary text-primary-foreground px-4 py-2 font-medium transition hover:bg-primary/90 active:scale-95 focus-visible:ring-2 focus-visible:ring-offset-2">Save</button>
    <button class="rounded-lg border bg-surface px-4 py-2 font-medium transition hover:bg-surface-2 active:scale-95">Cancel</button>
    <button disabled class="rounded-lg bg-primary text-primary-foreground px-4 py-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed">Disabled</button>
  </div>
  <div class="flex max-w-sm items-center gap-2 rounded-lg border bg-surface px-3 py-2 focus-within:border-primary focus-within:ring-2">
    <input class="flex-1 bg-transparent text-sm outline-none" placeholder="Search" aria-label="Search">
  </div>
</div>`,
            label: 'Hover, press, tab and type',
          },
        ],
      },
      {
        h: 'Group and peer',
        blocks: [
          '`group-hover:` styles a child when an ancestor is hovered. Mark the ancestor with `group`, and the whole card reacts as one target:',
          { code: `<div class="group max-w-sm cursor-pointer rounded-xl border bg-surface p-5 transition hover:shadow-lg">
  <p class="font-semibold group-hover:text-primary">Read the theming guide</p>
  <p class="text-sm text-muted-foreground">Hover anywhere on the card.</p>
  <span class="mt-3 inline-block text-sm font-medium text-primary transition-transform group-hover:translate-x-1">Open</span>
</div>`, lang: 'html', title: 'group.html' },
          {
            demo: `<div class="group max-w-sm cursor-pointer rounded-xl border bg-surface p-5 transition hover:shadow-lg">
  <p class="font-semibold group-hover:text-primary">Read the theming guide</p>
  <p class="text-sm text-muted-foreground">Hover anywhere on the card.</p>
  <span class="mt-3 inline-block text-sm font-medium text-primary transition-transform group-hover:translate-x-1">Open</span>
</div>`,
            label: 'group-hover',
          },
          '`peer-checked:` styles an element when an **earlier sibling** with the `peer` class is checked. It is how you build reveal panels and custom choices without JavaScript:',
          { code: `<label class="flex flex-wrap items-center gap-3 text-sm">
  <input type="checkbox" class="peer size-4 accent-primary">
  <span class="font-medium peer-checked:text-primary">Add a gift note</span>
  <span class="hidden w-full rounded-lg bg-muted p-3 text-muted-foreground peer-checked:block">
    The note is printed on the packing slip.
  </span>
</label>`, lang: 'html', title: 'peer.html' },
          {
            demo: `<label class="flex flex-wrap items-center gap-3 text-sm">
  <input type="checkbox" class="peer size-4 accent-primary">
  <span class="font-medium peer-checked:text-primary">Add a gift note</span>
  <span class="hidden w-full rounded-lg bg-muted p-3 text-muted-foreground peer-checked:block">The note is printed on the packing slip.</span>
</label>`,
            label: 'peer-checked: tick the box',
          },
          { note: 'The peer must come before the element it controls and share its parent, because CSS can only look at earlier siblings. Keep the input visible or give it a visible focus style, so keyboard users can see where they are.' },
        ],
      },
      {
        h: 'Structural and motion variants',
        blocks: [
          'Structural variants style children by position, which keeps repeated markup identical. Motion variants respect the reduced motion setting of the visitor:',
          { code: `<ul class="overflow-hidden rounded-xl border bg-surface text-sm">
  <li class="border-t first:border-t-0 odd:bg-surface-2 px-4 py-2">Invoice 1041</li>
  <li class="border-t first:border-t-0 odd:bg-surface-2 px-4 py-2">Invoice 1042</li>
  <li class="border-t first:border-t-0 odd:bg-surface-2 px-4 py-2">Invoice 1043</li>
</ul>

<span class="size-3 rounded-full bg-success motion-safe:animate-pulse"></span>`, lang: 'html', title: 'structure.html' },
          {
            demo: `<div class="space-y-4">
  <ul class="max-w-sm overflow-hidden rounded-xl border bg-surface text-sm">
    <li class="border-t first:border-t-0 odd:bg-surface-2 px-4 py-2">Invoice 1041</li>
    <li class="border-t first:border-t-0 odd:bg-surface-2 px-4 py-2">Invoice 1042</li>
    <li class="border-t first:border-t-0 odd:bg-surface-2 px-4 py-2">Invoice 1043</li>
    <li class="border-t first:border-t-0 odd:bg-surface-2 px-4 py-2">Invoice 1044</li>
  </ul>
  <div class="flex items-center gap-3 text-sm"><span class="size-3 rounded-full bg-success motion-safe:animate-pulse"></span><span class="text-muted-foreground">Pulses only when the visitor allows motion.</span></div>
</div>`,
            label: 'first:, odd: and motion-safe:',
          },
        ],
      },
      {
        h: 'What is not supported, and what to do instead',
        blocks: [
          'A prebuilt file cannot contain every combination, so a few things are deliberately missing:',
          {
            table: {
              head: ['Not available', 'Example', 'Do this instead'],
              rows: [
                ['Stacked variants', '`md:hover:bg-muted`, `dark:hover:bg-slate-700`', 'Split the conditions across two elements, rely on semantic colors that already adapt to dark mode, or write the rule in CSS.'],
                ['A variant the class does not have', '`hover:p-4`, `md:bg-primary`', 'Check the class reference; otherwise write a small rule.'],
                ['Opacity modifiers on palette colors', '`bg-rose-500/50`', 'Use a lighter step, or `color-mix()` with `var(--color-rose-500)`.'],
                ['The important modifier', '`!p-0`', 'Not needed: the reset is in a cascade layer and utilities come last.'],
              ],
            },
          },
          'Your own CSS can use the theme, so a missing combination takes a few lines and stays correct in every theme and scheme:',
          { code: `/* md:hover:bg-surface-2, written by hand */
@media (min-width: 768px) {
  .nav-link:hover {
    background-color: var(--surface-2);
  }
}

/* a palette color at 50 percent */
.highlight {
  background-color: color-mix(in oklab, var(--color-rose-500) 50%, transparent);
}`, lang: 'css', title: 'site.css' },
          'Splitting conditions across elements often reads better than a stacked class anyway. Put the breakpoint on a wrapper and the state on the child: `<div class="hidden md:block">` around `<a class="hover:bg-muted">` gives you a link that only exists from 768px and reacts to hover.',
        ],
      },
    ],
    faqs: [
      ['Why can I not combine two variants like md:hover:?', 'Every combination would multiply the size of the prebuilt file. Use two elements, semantic colors, or a few lines of CSS with the theme variables.'],
      ['How do I know if a variant exists for a class?', 'Search the [class reference](../classes.html), which lists the variants of every class, or run `npx monsooncss classes --filter` with the class name.'],
      ['Do variants work with component classes?', 'No. Variants are generated for utilities only. Components handle their own states, such as hover and focus, internally.'],
    ],
  },

  // 10 -----------------------------------------------------------------------
  {
    slug: 'browser-support',
    nav: 'Browser support',
    title: 'Browser support',
    metaTitle: 'Browser support | Monsoon docs',
    description: 'The CSS features Monsoon relies on, the browser versions that support them, what older browsers get instead, and how to check.',
    lead: 'Monsoon targets the current versions of Chrome, Edge, Firefox and Safari. The full seed theme needs OKLCH relative color syntax, available in **Chrome and Edge 119, Firefox 128 and Safari 18** or newer. Older browsers still get a readable page.',
    sections: [
      {
        h: 'The short version',
        blocks: [
          {
            list: [
              '**Current browsers:** everything works, including seed theming, dark mode, container queries and the components.',
              '**Browsers without relative color syntax:** a static theme computed from the default seed, with `primary` and `ring` set to your seed. Light and dark mode still switch.',
              '**Browsers without container queries:** the `@xs:` to `@xl:` classes are ignored and the unprefixed layout is used.',
              '**No JavaScript, no polyfills:** Monsoon is plain CSS, so there is nothing to load or patch at runtime.',
            ],
          },
        ],
      },
      {
        h: 'Features the utilities rely on',
        blocks: [
          'These are the modern CSS features found in the utility and theme rules, with the first browser versions that support them:',
          {
            table: {
              head: ['Feature', 'Used for', 'Chrome / Edge', 'Firefox', 'Safari'],
              rows: [
                ['Relative colors, `oklch(from ...)`', 'deriving every token from `--seed`', '119', '128', '18'],
                ['`oklch()` colors', 'the palette and the tokens', '111', '113', '15.4'],
                ['`color-mix()`', 'opacity modifiers such as `bg-primary/90`', '111', '113', '16.2'],
                ['Container queries', '`@container` and `@xs:` to `@xl:`', '105', '110', '16'],
                ['Cascade layers, `@layer`', 'the reset, so your CSS wins without tricks', '99', '97', '15.4'],
                ['`:is()` and `:where()`', 'the `dark:` variant, `space-*`, `divide-*`, section paint', '88', '78', '14'],
                ['Logical properties', '`px-*`, `py-*`, `mx-auto`, `space-y-*`', '87', '66', '14.1'],
                ['Individual transforms', '`scale-*`, `rotate-*`, `translate-*` as separate properties', '104', '72', '14.1'],
                ['`dvh` and `svh` units', '`h-dvh`, `min-h-dvh` and friends', '108', '101', '15.4'],
                ['`text-wrap: balance`', '`text-balance`', '114', '121', '17.5'],
              ],
            },
          },
          'Utilities that use a newer property, such as `text-balance`, simply have no effect in a browser that does not know it. The rest of the rule set is unaffected.',
        ],
      },
      {
        h: 'Progressive enhancements',
        blocks: [
          'Some rules improve the result where a browser supports them and fall back to a plain but correct result elsewhere:',
          {
            table: {
              head: ['Feature', 'Used for', 'Without it'],
              rows: [
                ['`@scope`', 'an exact `dark:` variant at any nesting depth (Chrome and Edge 118, Safari 17.4, recent Firefox)', '`dark:` uses selectors only. Exact except for dark inside light inside dark.'],
                ['`:has()`', 'component states such as rating stars, checkbox cards and field validation (Chrome 105, Firefox 121, Safari 15.4)', 'Those components lose the state styling that depends on it.'],
                ['The `popover` attribute', 'popovers and dropdowns that open with `popover` (Chrome 114, Firefox 125, Safari 17)', 'Use the dropdown built on `details` or focus instead, which works everywhere.'],
                ['`@starting-style`', 'entry animations of popovers, modals, drawers and sheets', 'They open without the animation.'],
                ['Anchor positioning', 'placing popovers next to their trigger, inside `@supports`', 'Popovers are centered in the viewport.'],
                ['Scroll driven animations', 'revealing the back to top button, inside `@supports`', 'The button is always visible.'],
                ['`field-sizing: content`', '`textarea-autosize`', 'A regular resizable textarea.'],
                ['`::details-content` and `interpolate-size`', 'animated collapse and accordion panels', 'Panels open instantly.'],
              ],
            },
          },
          'Check the page of each [component](../components.html) for its own notes.',
        ],
      },
      {
        h: 'Without relative color syntax',
        blocks: [
          'Seed theming computes colors in the browser, which needs relative color syntax. For browsers without it, the stylesheet ships a static theme inside `@supports not (color: oklch(from red l c h))`:',
          {
            list: [
              'every token gets a fixed value computed from the default seed,',
              '`primary` and `ring` use your `--seed` directly, so your brand color still shows,',
              'tokens whose lightness only depends on the scheme (background, foreground, surfaces, muted, border, secondary and the status colors) still switch between light and dark,',
              'foregrounds are fixed for the default seed, so `primary-foreground` stays white.',
            ],
          },
          'With a dark or saturated seed that is fine. With a very light seed, such as yellow, white text on the primary color would be hard to read, so set a foreground for those browsers yourself:',
          { code: `@supports not (color: oklch(from red l c h)) {
  :root {
    --primary-foreground: #1c1917;
  }
}`, lang: 'css', title: 'theme.css' },
        ],
      },
      {
        h: 'How to check',
        blocks: [
          'Paste this into the console of any browser to see which features it has:',
          { code: `console.table({
  'relative colors': CSS.supports('color', 'oklch(from red l c h)'),
  'oklch': CSS.supports('color', 'oklch(0.5 0.1 200)'),
  'color-mix': CSS.supports('color', 'color-mix(in oklab, red, blue)'),
  'container queries': CSS.supports('container-type', 'inline-size'),
  ':has()': CSS.supports('selector(:has(a))'),
  '@layer': typeof CSSLayerBlockRule !== 'undefined',
  '@scope': typeof CSSScopeRule !== 'undefined',
});`, lang: 'js', title: 'console' },
          {
            ol: [
              'Open the page in the oldest browser you support and confirm that text, buttons and forms are readable.',
              'In the developer tools, emulate `prefers-color-scheme: dark` and `prefers-reduced-motion: reduce` to test the scheme and the motion variants without changing system settings.',
              'Inspect an element and look at the computed value of `--primary` to see what the browser derived from your seed.',
              'Open the [playground](../playground.html) in each browser you support and paste a representative piece of your markup to compare the results.',
            ],
          },
        ],
      },
    ],
    faqs: [
      ['Does Monsoon work in Internet Explorer?', 'No. It relies on custom properties, modern color functions and cascade layers that Internet Explorer never supported.'],
      ['What is the minimum for the full seed theme?', 'Relative color syntax: Chrome and Edge 119, Firefox 128 and Safari 18 or newer.'],
      ['Is there a JavaScript polyfill?', 'No, and none is needed for a readable page. Older browsers get the static fallback theme.'],
    ],
  },
];
