// Long form guides. Text uses a tiny inline markup: `code`, **bold**, [link](url).
// Every class in a code sample or demo must exist in scripts/classes.json.
const CDN = 'https://cdn.jsdelivr.net/npm/monsooncss';
const PIN = 'https://cdn.jsdelivr.net/npm/monsooncss@0.1.0/dist/monsoon.min.css';

export const guides = [
  // 1
  {
    slug: 'utility-first-css-without-a-build-step',
    short: 'Utility-first CSS without a build step',
    kicker: 'Getting started',
    title: 'Utility-first CSS without a build step',
    metaTitle: 'Utility-first CSS without a build step | Monsoon',
    description: 'How to use utility-first CSS without a build step: link one Monsoon stylesheet from a CDN and write classes in plain HTML. No compiler, no config file, no JavaScript.',
    blurb: 'Link one stylesheet and write classes in plain HTML. What you get, what you give up and why it stays small.',
    keywords: 'utility-first css without a build step, utility css no build, utility classes cdn, css without compiler',
    lead: 'Utility-first CSS usually comes with a toolchain: a compiler that scans your templates, a config file and a watch process. Monsoon takes the other road. Every class is already written into one stylesheet, so a single `<link>` tag is the whole setup.',
    sections: [
      {
        h: 'What "without a build step" actually means',
        blocks: [
          'A build step is any program that has to run between the file you edit and the file the browser loads. For utility CSS that program normally reads your HTML, finds the class names you used and writes a stylesheet that contains only those rules. It is a good design for large applications, but it means you cannot open an HTML file and start styling it. You need Node.js, a configuration file, a watcher in a terminal and a pipeline in production.',
          'Monsoon predeclares the classes instead. The stylesheet you link already contains `px-4`, `md:grid-cols-3`, `hover:bg-primary` and the other %BASE% base classes, plus %VARIANTS% variant classes. Nothing reads your markup, nothing generates CSS on the fly and nothing runs in the browser. You save the file and refresh.',
        ],
      },
      {
        h: 'Your first page in one minute',
        blocks: [
          'Create an HTML file, add the stylesheet and start writing classes. This is a complete, valid page:',
          {
            code: `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>My page</title>
  <link rel="stylesheet" href="${CDN}">
</head>
<body class="bg-background text-foreground antialiased">
  <main class="mx-auto max-w-2xl px-6 py-16 space-y-6">
    <h1 class="text-4xl font-extrabold tracking-tight">Hello</h1>
    <p class="text-lg text-muted-foreground">Styled with utility classes and nothing else.</p>
    <a href="#" class="inline-block rounded-lg bg-primary text-primary-foreground px-4 py-2 font-medium hover:bg-primary/90">
      Read more
    </a>
  </main>
</body>
</html>`,
            lang: 'html',
            title: 'index.html',
          },
          'Open it straight from disk with a double click. It works the same from `file://`, from a local server and from production, because there is no difference between a development stylesheet and a production stylesheet.',
          {
            demo: `<div class="rounded-2xl border bg-surface p-6 space-y-4">
  <p class="text-3xl font-extrabold tracking-tight">Hello</p>
  <p class="text-lg text-muted-foreground">Styled with utility classes and nothing else.</p>
  <a href="#" class="inline-block rounded-lg bg-primary text-primary-foreground px-4 py-2 font-medium hover:bg-primary/90">Read more</a>
</div>`,
          },
        ],
      },
      {
        h: 'How a predeclared stylesheet stays small',
        blocks: [
          'If every utility had every variant, the file would be enormous. Monsoon keeps it at about **%BROTLI% with brotli** (%GZIP% with gzip) by generating each variant only for the utility groups where it is useful. This is a deliberate, documented choice rather than an accident:',
          {
            list: [
              '`hover:` exists for colors, opacity modifiers, shadows, opacity and transforms, because that is what people change on hover.',
              '`focus:`, `focus-visible:` and `focus-within:` exist for semantic colors, rings and outlines.',
              '`sm:` to `2xl:` exist for layout: display, position, flex and grid, gaps, spacing, sizing and text size.',
              '`dark:` exists for palette colors, white, black and opacity modifiers. Semantic colors do not need it because they switch on their own.',
              '`@xs:` to `@xl:` container queries exist for the layout utilities you reach for inside components.',
            ],
          },
          'The [class reference](classes.html) shows the variants of every class, and `npx monsooncss classes --filter md:` lists them in a terminal.',
        ],
      },
      {
        h: 'What you give up, and the simple workarounds',
        blocks: [
          'A prebuilt file cannot know values you invent while writing markup. Three things are therefore not part of Monsoon:',
          {
            list: [
              '**Arbitrary values** such as `w-[37px]` are not in the file. They work with the optional `monsoon.js` script, or compiled by the purge CLI; otherwise use the nearest step of the scale, or a `style` attribute for a true one off.',
              '**Stacked variants** such as `dark:hover:` or `md:hover:`. Semantic colors already adapt to the color scheme, so `hover:bg-primary` covers most of the cases.',
              '**The important modifier.** Monsoon keeps its reset in a cascade layer and utilities at low specificity, so your own CSS wins without it.',
            ],
          },
          'Writing a few lines of your own CSS next to Monsoon is normal and encouraged. Custom properties make it pleasant, because the theme tokens are plain variables you can use anywhere:',
          {
            code: `.price-tag {
  background: var(--primary);
  color: var(--primary-foreground);
  clip-path: polygon(0 0, 92% 0, 100% 50%, 92% 100%, 0 100%);
}`,
            lang: 'css',
            title: 'site.css',
          },
        ],
      },
      {
        h: 'When to add a step back',
        blocks: [
          'Most sites can serve the full file forever: it is one cached request. If you care about every kilobyte, Monsoon ships an optional command that you run once before deploying. It scans your files and writes a stylesheet with only the rules they use. It is a convenience, not a requirement, and your source files do not change.',
          { term: 'npx monsooncss purge "src/**/*.html" -o public/monsoon.css' },
          'Read [the production guide](utility-css-cdn-in-production.html) for version pinning, caching and when purging is worth it.',
        ],
      },
    ],
    faqs: [
      ['Do I need Node.js to use Monsoon?', 'No. The stylesheet works from a CDN or from a copy on your server. Node.js is only needed if you want to run the optional `purge` or `classes` commands.'],
      ['Does Monsoon add JavaScript to my page?', 'No. It is a CSS file. Theming and dark mode are computed by the browser with custom properties and relative colors.'],
      ['Can I still write my own CSS?', 'Yes. Monsoon uses low specificity and a cascade layer for the reset, so a normal rule in your own stylesheet overrides it without tricks.'],
      ['How many classes are included?', '%BASE% base classes and %VARIANTS% variant classes, all searchable in the [class reference](classes.html).'],
    ],
    related: ['no-build-css-framework', 'css-framework-from-a-cdn', 'utility-css-cdn-in-production'],
  },

  // 2
  {
    slug: 'css-framework-from-a-cdn',
    short: 'CSS framework from a CDN',
    kicker: 'Install',
    title: 'How to load a CSS framework from a CDN',
    metaTitle: 'CSS framework from a CDN with one link tag | Monsoon',
    description: 'Load a complete CSS framework from a CDN with one link tag. jsDelivr and unpkg URLs for Monsoon, version pinning, subresource integrity, preconnect and self hosting.',
    blurb: 'jsDelivr and unpkg URLs, pinning a version, integrity hashes and when to host the file yourself.',
    keywords: 'css framework from a cdn, css cdn link, jsdelivr css, unpkg css, utility css cdn',
    lead: 'A CSS framework from a CDN is the shortest path from an empty file to a styled page. Monsoon is published to npm as `monsooncss`, and public CDNs that mirror npm serve it immediately. This guide covers the URLs, how to pin them and how to keep the setup safe.',
    sections: [
      {
        h: 'The one line install',
        blocks: [
          'Put this tag in the `<head>` of your page. jsDelivr reads the package manifest and serves the minified stylesheet:',
          { code: `<link rel="stylesheet" href="${CDN}">`, lang: 'html', title: 'index.html' },
          'unpkg works the same way and serves the same file:',
          { code: '<link rel="stylesheet" href="https://unpkg.com/monsooncss">', lang: 'html', title: 'index.html' },
          'Both URLs resolve to `dist/monsoon.min.css` from the latest published version. That is perfect for prototypes, demos, documentation and code you paste into an online editor, because readers can copy the snippet and it simply works.',
        ],
      },
      {
        h: 'Pin a version before you go live',
        blocks: [
          'An unversioned URL follows new releases. For a production site you want the exact bytes you tested, so name the version and the file:',
          { code: `<link rel="stylesheet" href="${PIN}">`, lang: 'html', title: 'index.html' },
          'A pinned URL never changes content, which lets the CDN and the browser cache it for a long time. When a new version comes out, read the [changelog](https://github.com/kwy404/monsoon/blob/main/CHANGELOG.md), update the number and test. jsDelivr also accepts a range such as `monsooncss@0.1` if you prefer patch releases to arrive on their own.',
        ],
      },
      {
        h: 'Add subresource integrity',
        blocks: [
          'Subresource integrity lets the browser refuse a file whose content does not match a hash you wrote down. It only makes sense with a pinned URL. Generate the hash from the exact file you will reference:',
          { term: `curl -s ${PIN} | openssl dgst -sha384 -binary | openssl base64 -A` },
          'Then add it with `crossorigin`, which public CDNs support:',
          {
            code: `<link rel="stylesheet"
  href="${PIN}"
  integrity="sha384-PASTE_THE_HASH_HERE"
  crossorigin="anonymous">`,
            lang: 'html',
            title: 'index.html',
          },
          'If the hash is wrong the stylesheet is blocked entirely, so regenerate it every time you change the version.',
        ],
      },
      {
        h: 'Make the first request faster',
        blocks: [
          'A stylesheet in the head blocks rendering until it arrives, which is what you want for CSS: no flash of unstyled content. You can shave the connection time by warming up the CDN host early, especially if the page also loads fonts or scripts from it:',
          { code: `<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
<link rel="stylesheet" href="${PIN}">`, lang: 'html', title: 'head.html' },
          'Keep Monsoon as one of the first stylesheets so your own rules come after it and win on equal specificity. The reset lives in a cascade layer named `base`, so element styles you write later override it naturally.',
        ],
      },
      {
        h: 'When to host the file yourself',
        blocks: [
          'A public CDN is not always the right answer. Host the stylesheet on your own domain when:',
          {
            list: [
              'a strict Content Security Policy only allows styles from your own origin,',
              'the site runs on an internal network or offline,',
              'you want one less third party connection for privacy reasons,',
              'you purge the stylesheet, since the result is specific to your project.',
            ],
          },
          'Self hosting is a copy away. Install the package and copy the file into your public folder, or download it once:',
          {
            term: `npm install monsooncss
cp node_modules/monsooncss/dist/monsoon.min.css public/monsoon.css`,
          },
          'The package also exposes the readable build as `monsooncss/css` (`dist/monsoon.css`) if you want to read the source of a rule.',
        ],
      },
      {
        h: 'Checklist',
        blocks: [
          {
            ol: [
              'Use the short URL while prototyping.',
              'Pin `monsooncss@VERSION/dist/monsoon.min.css` for production.',
              'Add an integrity hash if your policy asks for it.',
              'Preconnect to the CDN host if it is the first request to that origin.',
              'Self host or purge when policy, privacy or size requires it.',
            ],
          },
        ],
      },
    ],
    faqs: [
      ['Which CDN should I use for Monsoon?', 'jsDelivr and unpkg both mirror npm and serve the same file. jsDelivr is used in the examples on this site; either is fine.'],
      ['Is the CDN file minified?', 'Yes. Both CDN URLs serve `dist/monsoon.min.css`, about %BROTLI% with brotli and %GZIP% with gzip.'],
      ['Does the CDN version include dark mode and theming?', 'Yes. There is only one build. Seed theming, dark mode, the palette and every variant are in the file you link.'],
      ['Can I load Monsoon with @import?', 'You can write `@import url("' + PIN + '");` at the top of a stylesheet, but a `<link>` tag is faster because the browser discovers it without downloading another file first.'],
    ],
    related: ['utility-css-cdn-in-production', 'utility-first-css-without-a-build-step', 'css-utilities-for-php-wordpress-django-rails'],
  },

  // 3
  {
    slug: 'no-build-css-framework',
    short: 'No build CSS framework',
    kicker: 'Concepts',
    title: 'A no build CSS framework for real projects',
    metaTitle: 'No build CSS framework for real projects | Monsoon',
    description: 'Why a no build CSS framework fits static sites, prototypes, server-rendered apps and legacy pages, how Monsoon works without a compiler and what to expect in day to day work.',
    blurb: 'Who a no build stylesheet is for, how the workflow feels and how to keep a project tidy without tooling.',
    keywords: 'no build css framework, css framework without build tools, zero config css, css framework no npm',
    lead: 'Plenty of projects never needed a frontend build: a marketing page, documentation, an admin panel rendered by the server, a prototype for tomorrow morning. A no build CSS framework gives those projects a complete design system with one file and no toolchain to maintain.',
    sections: [
      {
        h: 'Who it is for',
        blocks: [
          'Monsoon is designed for the many places where adding a bundler costs more than the problem you are solving:',
          {
            list: [
              '**Static sites and landing pages.** Plain HTML files uploaded to any host.',
              '**Server-rendered applications.** PHP, WordPress themes, Django and Jinja templates, Rails views, Go templates and any other language that outputs HTML.',
              '**Prototypes and demos.** Ideas you want on screen in minutes, often in a single file you can send to someone.',
              '**Legacy pages.** Older sites where you want modern layout utilities without touching a fragile pipeline.',
              '**Documentation and internal tools.** Pages that should keep working years from now with no dependency updates.',
            ],
          },
          'It also works inside projects that do have a build. Import the file once and it behaves like any other stylesheet.',
        ],
      },
      {
        h: 'How the workflow feels',
        blocks: [
          'Without a compiler in the loop, the feedback cycle is the browser itself. Edit a class, save, refresh. Because the stylesheet already contains every class, the browser developer tools become a playground: add `shadow-lg` or `md:grid-cols-3` to an element in the inspector and see the result immediately, then copy the class list back into your template.',
          {
            code: `<!-- try classes directly in the inspector, then keep what you like -->
<article class="rounded-2xl border bg-surface p-6 shadow-sm hover:shadow-lg transition">
  <h2 class="text-xl font-semibold">Weekly report</h2>
  <p class="mt-2 text-muted-foreground">Everything is already in the stylesheet.</p>
</article>`,
            lang: 'html',
            title: 'card.html',
          },
          'There is no cache to clear, no watcher to restart and no out of date generated file, because there is nothing generated.',
        ],
      },
      {
        h: 'The theme lives in CSS, not in a config file',
        blocks: [
          'Build based systems usually keep colors in a configuration file that the compiler reads. Monsoon keeps the theme in the browser as custom properties. Set one variable and every semantic color follows:',
          { code: `:root { --seed: #0d9488; }`, lang: 'css', title: 'theme.css' },
          'Because it is runtime CSS, you can also change it per section with an attribute, per user from a value in your database, or with a color picker. See [generate a theme from one color](generate-a-theme-from-one-color-css.html) for the details.',
        ],
      },
      {
        h: 'Keeping a project tidy without tooling',
        blocks: [
          'Long class lists are the usual concern with utility CSS. A few habits keep them readable when no build tool is there to help:',
          {
            list: [
              'Order classes the same way every time: layout, spacing, size, typography, color, state. For example `flex items-center gap-3 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90`.',
              'Extract repeated markup into your template language: a partial, an include, a component or a macro, not a new CSS class.',
              'Prefer semantic colors such as `bg-surface` and `text-muted-foreground`. They carry meaning, switch with dark mode and follow the seed.',
              'When a rule is truly custom, write it in a small stylesheet next to Monsoon and use the theme variables.',
            ],
          },
        ],
      },
      {
        h: 'What a no build stylesheet costs',
        blocks: [
          'The honest trade off is file size. A compiler can emit only the rules a page uses; a predeclared file ships all of them. Monsoon keeps that cost small, about %BROTLI% with brotli for everything, and cached after the first page view. When you need less, run the optional purge command once and serve its output. For most sites the full file is smaller than a single hero image.',
          {
            table: {
              head: ['Setup', 'What you run', 'Typical size'],
              rows: [
                ['Full file from a CDN', 'nothing', 'about %BROTLI% brotli'],
                ['Purged file you host', '`npx monsooncss purge` once', 'about %PURGED% brotli for the kitchen sink demo'],
              ],
            },
          },
        ],
      },
    ],
    faqs: [
      ['Is a no build CSS framework slower in the browser?', 'Not in a way you will measure. The browser parses one stylesheet once and caches it. There is no JavaScript running to apply styles.'],
      ['Can I use Monsoon in a project that already has a bundler?', 'Yes. Install `monsooncss` and import the CSS file the way your bundler imports CSS, or keep the CDN link. It does not need a plugin.'],
      ['How do I avoid repeating long class lists?', 'Use the reuse tools of your template language, such as partials, includes or components. The class list then lives in one place.'],
      ['Does it work offline?', 'Yes, if you host the file yourself. Copy `dist/monsoon.min.css` from the npm package into your project.'],
    ],
    related: ['utility-first-css-without-a-build-step', 'css-utilities-for-php-wordpress-django-rails', 'generate-a-theme-from-one-color-css'],
  },

  // 4
  {
    slug: 'utility-css-cdn-in-production',
    short: 'Utility CSS from a CDN in production',
    kicker: 'Production',
    title: 'Utility CSS from a CDN in production',
    metaTitle: 'Utility CSS from a CDN in production | Monsoon',
    description: 'Is a utility CSS file from a CDN fine for production? Real sizes, caching, version pinning, render blocking and when to purge Monsoon down to a few kilobytes.',
    blurb: 'Real numbers for size and caching, plus a short checklist for shipping the stylesheet to production.',
    keywords: 'utility css cdn production, css cdn performance, purge unused css, production css size',
    lead: 'Serving a complete utility stylesheet from a CDN in production is a reasonable choice for most sites. This guide puts numbers on it, explains caching and render blocking, and shows when it is worth purging the file instead.',
    sections: [
      {
        h: 'The numbers',
        blocks: [
          'The production file is `dist/monsoon.min.css`. Measured on version 0.1.0:',
          {
            table: {
              head: ['Encoding', 'Size'],
              rows: [
                ['Minified, uncompressed', 'about %RAW%'],
                ['gzip', 'about %GZIP%'],
                ['brotli', 'about %BROTLI%'],
              ],
            },
          },
          'CDNs and most hosts send brotli to browsers that accept it, so %BROTLI% is what a visitor downloads once. The repository has a size check that warns above 100 kB and fails above 120 kB with brotli, so the number cannot creep up unnoticed.',
          'For comparison with everyday assets: that is less than a typical hero photo, and the stylesheet is shared by every page of the site.',
        ],
      },
      {
        h: 'Caching and pinning',
        blocks: [
          'Pin the version in production. A versioned URL never changes content, so the browser can keep it in cache across visits and the CDN can serve it from the edge:',
          { code: `<link rel="stylesheet" href="${PIN}">`, lang: 'html', title: 'layout.html' },
          'Modern browsers partition their cache per site, so do not count on visitors already having the file from another website. Count on the second page view and every later visit being free.',
        ],
      },
      {
        h: 'Render blocking is a feature for CSS',
        blocks: [
          'Stylesheets in the head block the first paint until they load. For your main stylesheet that is exactly what you want: the alternative is a flash of unstyled content. Keep it fast by:',
          {
            list: [
              'placing the `<link>` early in the `<head>`,',
              'using `<link rel="preconnect">` for the CDN host if it is a new origin for the page,',
              'avoiding `@import` chains, which make the browser discover files one after another.',
            ],
          },
          'There is no JavaScript to wait for. Seed theming and dark mode are computed by the CSS engine during the same style pass as everything else.',
        ],
      },
      {
        h: 'When purging is worth it',
        blocks: [
          'Purging removes the rules your files never mention. It is worth the extra step when the first visit matters a lot (for example a landing page for paid traffic), when you serve users on slow networks, or when you already have a deploy step anyway.',
          {
            term: 'npx monsooncss purge "src/**/*.html" "src/**/*.js" -o public/monsoon.css',
            out: '%PURGE_OUT%',
          },
          'That output comes from the kitchen sink demo in the repository, a page that uses a wide mix of utilities. The purged file keeps the reset, the theme tokens and the keyframes, so seed theming and dark mode still work.',
          { note: 'The purge command looks for class names as whole words in your files. If you build a class name from pieces at runtime, such as `"bg-" + status`, list the results with `--safelist bg-success,bg-danger` so they are kept.' },
        ],
      },
      {
        h: 'Production checklist',
        blocks: [
          {
            ol: [
              'Pin the exact version in the URL.',
              'Add `integrity` and `crossorigin` if your security policy wants subresource integrity.',
              'Preconnect to the CDN host, or self host the file on your own origin.',
              'Decide if the full file is fine. If not, purge in your deploy step and safelist dynamic classes.',
              'Check the page in light and dark mode, and with your seed color, before you ship.',
            ],
          },
        ],
      },
    ],
    faqs: [
      ['Is it bad practice to use a CSS framework from a CDN in production?', 'No, as long as you pin a version. Many production sites load CSS from public CDNs. Self host it if your security policy or privacy rules require it.'],
      ['How big is Monsoon after purging?', 'It depends on how many classes you use. The kitchen sink demo, which uses a wide mix, purges to about %PURGED% with brotli. Purging removes unused utilities; the reset, the theme tokens and the component layer are always kept.'],
      ['Does purging break dark mode or theming?', 'No. The purge command always keeps the theme tokens, the dark mode switch, the reset and the keyframes. Only unused utility rules are removed.'],
      ['Should I inline the CSS?', 'For most sites no. A cached external file is better across page views. Inlining a purged file can make sense for a single landing page.'],
    ],
    related: ['css-framework-from-a-cdn', 'utility-first-css-without-a-build-step', 'css-utilities-for-php-wordpress-django-rails'],
  },

  // 5
  {
    slug: 'generate-a-theme-from-one-color-css',
    short: 'Generate a theme from one color',
    kicker: 'Theming',
    title: 'Generate a theme from one color in CSS',
    metaTitle: 'Generate a theme from one color in CSS | Monsoon',
    description: 'Generate a complete, accessible color theme from one CSS color: Monsoon derives primary, accent, surfaces, borders and readable foregrounds from --seed with OKLCH relative color syntax.',
    blurb: 'How one --seed custom property becomes primary, accent, surfaces and readable text, in pure CSS.',
    keywords: 'generate a theme from one color css, css theme from one color, oklch relative color syntax, css color tokens',
    lead: 'With Monsoon a theme is one line: `--seed: #0d9488`. The browser derives every semantic color from it with OKLCH relative color syntax, including foregrounds that keep readable contrast. No preprocessor, no generator website, no JavaScript.',
    sections: [
      {
        h: 'Set the seed',
        blocks: [
          'Any valid CSS color works: a hex value, a named color, `rgb()`, `hsl()` or `oklch()`. Put it on the root element to theme the whole page:',
          { code: `:root {
  --seed: #0d9488;
}`, lang: 'css', title: 'theme.css' },
          'Or skip the stylesheet and use an attribute. Any element with `--seed` in its `style` attribute recomputes the tokens for its subtree:',
          { code: `<section style="--seed: teal" class="rounded-2xl bg-surface p-8 space-y-3">
  <h2 class="text-2xl font-bold text-primary">Teal section</h2>
  <button class="rounded-lg bg-primary text-primary-foreground px-4 py-2">Primary</button>
  <button class="rounded-lg bg-accent text-accent-foreground px-4 py-2">Accent</button>
</section>`, lang: 'html', title: 'section.html' },
          {
            demo: `<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
  <div style="--seed: teal" class="rounded-xl border bg-surface p-5 space-y-3"><p class="font-semibold text-primary">teal</p><button class="w-full rounded-md bg-primary text-primary-foreground py-2 font-medium">Primary</button><button class="w-full rounded-md bg-accent text-accent-foreground py-2 font-medium">Accent</button></div>
  <div style="--seed: #e11d48" class="rounded-xl border bg-surface p-5 space-y-3"><p class="font-semibold text-primary">#e11d48</p><button class="w-full rounded-md bg-primary text-primary-foreground py-2 font-medium">Primary</button><button class="w-full rounded-md bg-accent text-accent-foreground py-2 font-medium">Accent</button></div>
  <div style="--seed: gold" class="rounded-xl border bg-surface p-5 space-y-3"><p class="font-semibold">gold</p><button class="w-full rounded-md bg-primary text-primary-foreground py-2 font-medium">Primary</button><button class="w-full rounded-md bg-accent text-accent-foreground py-2 font-medium">Accent</button></div>
</div>`,
            label: 'Three seeds on one page',
          },
          'Notice the gold card: a light seed gets dark text on its buttons, a darker seed gets white text. That flip is automatic.',
        ],
      },
      {
        h: 'The tokens you get',
        blocks: [
          'Every token is available as a utility for text, background, border, ring and more (`bg-primary`, `text-muted-foreground`, `border-border`) and as a custom property (`var(--primary)`) for your own CSS.',
          {
            table: {
              head: ['Token', 'Derived as'],
              rows: [
                ['`primary`, `primary-foreground`', 'The seed with lightness pushed out of the unsafe band, and white or near black text.'],
                ['`secondary`, `secondary-foreground`', 'A low chroma tint of the seed for quiet buttons.'],
                ['`accent`, `accent-foreground`', 'The seed hue turned by 180 degrees, kept light.'],
                ['`background`, `foreground`', 'Near white and near black in light mode, swapped in dark mode, with a hint of the seed hue.'],
                ['`surface`, `surface-2`, `surface-3`', 'Raised layers for cards and panels.'],
                ['`muted`, `muted-foreground`', 'Subtle fills and secondary text.'],
                ['`border`, `ring`', 'Hairlines and the focus ring.'],
                ['`success`, `warning`, `danger`, `info`', 'Fixed status hues with their own foregrounds.'],
              ],
            },
          },
        ],
      },
      {
        h: 'How it works: OKLCH relative colors',
        blocks: [
          'Relative color syntax reads the channels of an existing color and lets you compute a new one from them. In OKLCH the channels are lightness `l`, chroma `c` and hue `h`, and lightness tracks how bright a color looks to people. That makes it the right space to reason about contrast. This is the real declaration for the background token:',
          { code: `--background: oklch(from var(--seed) calc(0.99 - 0.83 * var(--mode)) min(c, 0.012) h);`, lang: 'css', title: 'monsoon.css' },
          'It keeps the hue of your seed, caps the chroma so the background stays almost neutral, and picks a lightness of 0.99 in light mode or 0.16 in dark mode. `--mode` is a number, 0 or 1, which is how one declaration serves both schemes.',
          { h3: 'The primary color and its foreground' },
          'White text needs a dark fill and dark text needs a light fill. Around a lightness of 0.52 to 0.66 neither choice reaches a 4.5:1 contrast ratio for every hue, so Monsoon moves the primary color out of that band, to whichever side is closer to your seed. The step is written with `clamp()` and a large multiplier, a branch free "if" that works inside `calc()`:',
          { code: `--primary: oklch(from var(--_seed)
  calc((1 - clamp(0, (l - 0.6) * 100000, 1)) * min(l, 0.52)
     + clamp(0, (l - 0.6) * 100000, 1) * max(l, 0.66)) c h);

--primary-foreground: oklch(from var(--primary)
  clamp(0.17, (0.6 - l) * 100000, 1) min(c, 0.03) h);`, lang: 'css', title: 'monsoon.css' },
          'The foreground is white when the primary is dark and near black when it is light. The [accessible contrast guide](accessible-color-contrast-css.html) shows how this is tested.',
        ],
      },
      {
        h: 'Per section themes and the theme class',
        blocks: [
          'Custom properties are resolved where they are declared. That is why Monsoon redeclares the tokens on `:root`, on `.dark`, `.light`, `[data-theme]` and on any element whose `style` attribute contains `--seed`. If you set the seed from your own stylesheet on some other element, add the `theme` class to it so the tokens are recomputed there:',
          { code: `[data-brand="orange"] { --seed: #ea580c; }`, lang: 'css', title: 'site.css' },
          { code: `<aside data-brand="orange" class="theme rounded-xl bg-surface p-6">
  <a class="text-primary underline">Orange link</a>
</aside>`, lang: 'html', title: 'aside.html' },
        ],
      },
      {
        h: 'Older browsers',
        blocks: [
          'Relative color syntax is supported in current versions of Chrome, Edge, Firefox and Safari. For older browsers Monsoon ships a static fallback inside `@supports not (color: oklch(from red l c h))`: the tokens fall back to values computed from the default seed, `primary` and `ring` use your `--seed` directly, and the tokens that only depend on the color scheme still switch between light and dark.',
          'In practice that means a visitor on an old browser still gets a coherent, readable page in the default palette with your seed on primary buttons and links. Nothing breaks and no script is needed to detect support.',
        ],
      },
    ],
    faqs: [
      ['Which color formats can I use for --seed?', 'Any CSS color: hex, named colors, `rgb()`, `hsl()`, `oklch()` and others. The browser converts it to OKLCH for the calculations.'],
      ['Can users pick their own theme color?', 'Yes. Write their color into a `style="--seed: ..."` attribute from your server, or set it with one line of JavaScript on the root element. Everything else follows.'],
      ['Do I have to use the generated colors?', 'No. The 22 hue palette is available too, as `bg-blue-600`, `text-rose-500` and so on. Semantic tokens are recommended because they adapt to dark mode and to the seed.'],
      ['Does it work without JavaScript?', 'Yes. The theme is computed by the CSS engine. JavaScript is only needed if you want to change the seed interactively.'],
    ],
    related: ['accessible-color-contrast-css', 'dark-mode-with-one-line-of-css', 'oklch-color-palette-css'],
  },

  // 6
  {
    slug: 'dark-mode-with-one-line-of-css',
    short: 'Dark mode with one line of CSS',
    kicker: 'Dark mode',
    title: 'Dark mode with one line of CSS',
    metaTitle: 'Dark mode with one line of CSS | Monsoon',
    description: 'Add dark mode with one line of CSS: Monsoon follows prefers-color-scheme automatically, and class="dark" or data-theme="dark" force it on a page or a single section.',
    blurb: 'Automatic dark mode from the operating system, forced dark sections and a tiny toggle.',
    keywords: 'dark mode with one line of css, css dark mode, prefers-color-scheme, data-theme dark, dark mode toggle css',
    lead: 'If your page uses Monsoon semantic colors, dark mode is already done. The stylesheet follows the operating system setting, and one class or attribute forces a scheme on the whole page or on any section.',
    sections: [
      {
        h: 'Automatic: zero lines',
        blocks: [
          'Monsoon listens to `prefers-color-scheme`. When the visitor uses a dark system theme, a number called `--mode` becomes 1 and every semantic token recomputes: the background goes dark, text goes light, surfaces and borders follow, and the primary color is lifted so it stays readable as text. Native form controls and scrollbars switch too, because Monsoon sets `color-scheme` for you.',
          'So this card is correct in both schemes without a single `dark:` class:',
          { code: `<div class="rounded-2xl border bg-surface p-6 space-y-3">
  <h3 class="text-lg font-semibold">Invoices</h3>
  <p class="text-muted-foreground">Three are waiting for approval.</p>
  <a href="#" class="text-primary font-medium underline underline-offset-4">Review now</a>
</div>`, lang: 'html', title: 'card.html' },
        ],
      },
      {
        h: 'The one line: force a scheme',
        blocks: [
          'To pin the page to dark regardless of the system setting, add one attribute to the root element. Either form works:',
          { code: `<html data-theme="dark">
<!-- or -->
<html class="dark">`, lang: 'html', title: 'index.html' },
          'Use `data-theme="light"` or `class="light"` to pin light mode, which also stops the automatic switch.',
        ],
      },
      {
        h: 'Dark sections inside a light page',
        blocks: [
          'The same classes work on any element, so you can build a dark band in a light page, or the other way around. The tokens are recomputed for that subtree:',
          { code: `<section class="dark bg-background text-foreground rounded-2xl p-8">
  <h2 class="text-2xl font-bold">Always dark</h2>
  <p class="text-muted-foreground">Surfaces, borders and text switch together.</p>
  <button class="rounded-lg bg-primary text-primary-foreground px-4 py-2">Continue</button>
</section>`, lang: 'html', title: 'section.html' },
          {
            demo: `<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
  <div class="light bg-background text-foreground rounded-xl border p-5 space-y-3"><p class="font-semibold">class="light"</p><p class="text-sm text-muted-foreground">Same markup, light tokens.</p><button class="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium">Continue</button></div>
  <div class="dark bg-background text-foreground rounded-xl border p-5 space-y-3"><p class="font-semibold">class="dark"</p><p class="text-sm text-muted-foreground">Same markup, dark tokens.</p><button class="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium">Continue</button></div>
</div>`,
            label: 'Both schemes side by side',
          },
        ],
      },
      {
        h: 'A theme toggle in a few lines',
        blocks: [
          'Monsoon itself has no JavaScript, but a toggle needs a little. Store the choice and write it to `data-theme` on the root element. Put the first part in the `<head>` so the saved theme applies before the first paint:',
          { code: `<script>
  // in <head>: apply a saved choice before the page renders
  const saved = localStorage.getItem('theme');
  if (saved) document.documentElement.dataset.theme = saved;
</script>`, lang: 'html', title: 'head.html' },
          { code: `<button id="theme" class="rounded-lg border px-3 py-2 hover:bg-muted">Toggle theme</button>
<script>
  document.getElementById('theme').addEventListener('click', () => {
    const root = document.documentElement;
    const dark = root.dataset.theme
      ? root.dataset.theme === 'dark'
      : matchMedia('(prefers-color-scheme: dark)').matches;
    root.dataset.theme = dark ? 'light' : 'dark';
    localStorage.setItem('theme', root.dataset.theme);
  });
</script>`, lang: 'html', title: 'toggle.html' },
        ],
      },
      {
        h: 'What happens under the hood',
        blocks: [
          'Most dark mode setups duplicate every color: one value for light, another for dark, each switched by a selector. Monsoon declares each semantic token once. The declaration reads a number, `--mode`, which is 0 in light mode and 1 in dark mode, and interpolates between two lightness values with plain arithmetic:',
          { code: `/* light: 0.99, dark: 0.16 */
--background: oklch(from var(--seed) calc(0.99 - 0.83 * var(--mode)) min(c, 0.012) h);`, lang: 'css', title: 'monsoon.css' },
          'Switching the scheme only changes that one number. The operating system preference sets it through a media query, while `.dark`, `.light` and `data-theme` set it through a selector. Because the tokens are declared again on every element that changes the mode, a dark section inside a light page computes its own values from the same formulas, and a section with its own `--seed` inside a dark section still gets dark tokens in its own hue.',
          'This also means your own CSS can follow the scheme without a media query. Any rule that uses `var(--surface)` or `var(--border)` is automatically correct in both modes.',
        ],
      },
      {
        h: 'Images, shadows and other details',
        blocks: [
          'A few things are worth a second look when a page goes dark:',
          {
            list: [
              '**Shadows** are less visible on dark surfaces. Separate layers with `bg-surface-2` or `bg-surface-3` and a `border` instead of relying on a large shadow.',
              '**Logos and illustrations** with dark strokes may disappear. Swap them with a `<picture>` element and a `prefers-color-scheme` media query, or give them a light backing.',
              '**Pure white text** on a near black background can glare. Monsoon uses a soft off white for `foreground`, so prefer it over `text-white` for body copy.',
              '**Charts** drawn with fixed palette colors keep their colors. Pick middle steps such as 500, which read on both light and dark backgrounds.',
            ],
          },
        ],
      },
      {
        h: 'The dark: variant for palette colors',
        blocks: [
          'Semantic tokens switch by themselves. Fixed palette colors do not, because `bg-slate-100` is a specific color. For those, Monsoon generates a `dark:` variant on palette backgrounds, text and borders (all steps for the neutral hues, the middle steps for the others), on white and black, and on the opacity modifiers:',
          { code: `<span class="rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-3 py-1 text-sm">
  Draft
</span>
<div class="border border-black/10 dark:border-white/10 rounded-xl p-4">...</div>`, lang: 'html', title: 'badge.html' },
          '`dark:` applies under `.dark` or `[data-theme=dark]`, and with the system dark setting unless the root element is forced to light. Use the [class reference](classes.html) with the "Has dark:" filter to see every class that supports it.',
        ],
      },
    ],
    faqs: [
      ['Do I need dark: classes for dark mode?', 'Not for semantic colors such as `bg-surface`, `text-foreground` or `bg-primary`. They switch on their own. Use `dark:` only for fixed palette colors.'],
      ['How do I force dark mode with CSS only?', 'Add `class="dark"` or `data-theme="dark"` to the html element. That is the one line.'],
      ['Can one section be dark while the page is light?', 'Yes. Put `class="dark"` on the section. The tokens are recomputed for everything inside it.'],
      ['Does dark mode keep accessible contrast?', 'Yes. Token pairs are tested at 4.5:1 or better in dark mode, and the primary color is lifted so it is readable as text on the dark background.'],
    ],
    related: ['generate-a-theme-from-one-color-css', 'accessible-color-contrast-css', 'utility-first-css-without-a-build-step'],
  },

  // 7
  {
    slug: 'container-queries-utility-classes',
    short: 'Container queries utility classes',
    kicker: 'Layout',
    title: 'Container queries with utility classes',
    metaTitle: 'Container queries utility classes | Monsoon',
    description: 'Use CSS container queries with utility classes: mark a parent with @container and style children with @xs: to @xl:. Components that adapt to their column, not the viewport.',
    blurb: 'Mark a parent with @container and let components adapt to the space they are given.',
    keywords: 'container queries utility classes, css container queries, @container css, responsive components css',
    lead: 'Viewport breakpoints answer "how wide is the screen". Components usually need to know "how wide is my column". Container queries answer that, and Monsoon exposes them as utility classes you can write straight in your HTML.',
    sections: [
      {
        h: 'The two pieces',
        blocks: [
          'First, mark a parent as a container with the `@container` class. It sets `container-type: inline-size`, which makes the element a size container for its width. Then, on any descendant, prefix a utility with a container breakpoint such as `@md:`:',
          { code: `<div class="@container">
  <div class="flex flex-col @md:flex-row gap-4">
    <img class="rounded-xl @md:w-1/3" src="cover.jpg" alt="Cover">
    <div class="space-y-2">
      <h3 class="text-lg @lg:text-2xl font-bold">Title</h3>
      <p class="text-muted-foreground">Stacks when narrow, sits in a row when wide.</p>
    </div>
  </div>
</div>`, lang: 'html', title: 'card.html' },
          'The same card now works in a wide main column and in a narrow sidebar, without knowing anything about the page around it. The class `container-q` does the same as `@container` if you prefer a name without the at sign.',
        ],
      },
      {
        h: 'Container breakpoints',
        blocks: [
          'Container breakpoints are measured in rem because containers are usually smaller than screens:',
          {
            table: {
              head: ['Prefix', 'Container width at least'],
              rows: [['`@xs:`', '20rem (320px)'], ['`@sm:`', '24rem (384px)'], ['`@md:`', '28rem (448px)'], ['`@lg:`', '32rem (512px)'], ['`@xl:`', '36rem (576px)']],
            },
          },
          'They are min-width queries, mobile first like the viewport breakpoints: write the narrow layout without a prefix and add the wider layout with a prefix.',
        ],
      },
      {
        h: 'Which utilities support them',
        blocks: [
          'To keep the stylesheet small, container variants are generated for the utilities you use to rearrange a component:',
          {
            list: [
              'display: `block`, `inline-block`, `inline`, `flex`, `inline-flex`, `grid`, `hidden`',
              'flex direction and wrapping: `flex-row`, `flex-col`, `flex-wrap`, `flex-nowrap`',
              'grid: `grid-cols-1` to `grid-cols-12`, `col-span-1` to `col-span-12`, `col-span-full`',
              'gap, `items-*` and `justify-*`',
              'padding `p-*`, `px-*`, `py-*` for the common steps',
              'width fractions, `w-full` and `w-auto`',
              'text size `text-xs` to `text-9xl` and text alignment',
            ],
          },
          'Search the [class reference](classes.html) with the "Has @md:" filter for the complete list.',
        ],
      },
      {
        h: 'A responsive card grid that needs no breakpoints',
        blocks: [
          'Combine the two ideas: the grid uses viewport breakpoints to decide how many columns the page has, and each card uses container queries to decide its own layout inside whatever column width it gets.',
          { code: `<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
  <div class="lg:col-span-2 @container rounded-2xl border bg-surface p-4">
    <div class="grid grid-cols-1 @md:grid-cols-2 gap-4">...</div>
  </div>
  <aside class="@container rounded-2xl border bg-surface p-4">
    <div class="grid grid-cols-1 @md:grid-cols-2 gap-4">...</div>
  </aside>
</div>`, lang: 'html', title: 'layout.html' },
          {
            demo: `<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
  <div class="sm:col-span-2 @container rounded-xl border bg-surface p-4"><div class="flex flex-col @md:flex-row gap-3"><div class="h-20 @md:w-1/3 rounded-lg bg-gradient-to-br from-primary to-accent"></div><p class="flex-1 text-sm text-muted-foreground">Wide column: this card is at least 28rem, so it uses a row.</p></div></div>
  <div class="@container rounded-xl border bg-surface p-4"><div class="flex flex-col @md:flex-row gap-3"><div class="h-20 @md:w-1/3 rounded-lg bg-gradient-to-br from-primary to-accent"></div><p class="flex-1 text-sm text-muted-foreground">Narrow column: same markup, stacked.</p></div></div>
</div>`,
            label: 'Same card, two container widths',
          },
        ],
      },
      {
        h: 'Breakpoints or container queries?',
        blocks: [
          'Both have a place, and they answer different questions. Use viewport breakpoints (`md:`, `lg:`) for decisions about the whole page: how many columns the layout has, whether the navigation collapses, how wide the main content is. Use container queries for decisions inside a component: whether a card shows its image beside or above the text, how many items a list shows per row, how large a heading should be.',
          'A good test is to ask where the component might be reused. A product card that appears in a three column grid, a sidebar and a full width search result cannot know the viewport width that matters to it, because the same viewport gives it three different widths. That card should use container queries. A site header always spans the viewport, so viewport breakpoints are the natural fit.',
          'Because container queries are just classes in Monsoon, you can adopt them gradually. Start with the one component that looks wrong in a sidebar, wrap it in an element with `@container`, and replace its `md:` prefixes with `@md:`. Nothing else on the page has to change, and there is no configuration to update.',
        ],
      },
      {
        h: 'Things to know',
        blocks: [
          {
            list: [
              'A container cannot query itself. Put `@container` on a parent and the prefixed classes on its children.',
              '`container-type: inline-size` makes the element ignore the width of its contents for sizing, so give containers a width from their layout (a grid cell, `w-full`, a flex item).',
              'Containers nest. A prefixed class responds to the nearest ancestor container.',
              'Container queries are supported in all current major browsers.',
            ],
          },
        ],
      },
    ],
    faqs: [
      ['What is the difference between md: and @md:?', '`md:` checks the viewport width (768px and up). `@md:` checks the width of the nearest `@container` ancestor (28rem and up).'],
      ['Do I need a build step for container queries?', 'No. The `@container` class and the `@xs:` to `@xl:` variants are in the stylesheet you link from the CDN.'],
      ['Can I use container queries and breakpoints together?', 'Yes. A common pattern is breakpoints for the page grid and container queries inside each component.'],
      ['Which browsers support container queries?', 'Current versions of Chrome, Edge, Firefox and Safari. Older browsers ignore the prefixed classes and show the unprefixed, narrow layout.'],
    ],
    related: ['utility-first-css-without-a-build-step', 'no-build-css-framework', 'dark-mode-with-one-line-of-css'],
  },

  // 8
  {
    slug: 'oklch-color-palette-css',
    short: 'OKLCH color palette in CSS',
    kicker: 'Color',
    title: 'An OKLCH color palette for CSS',
    metaTitle: 'OKLCH color palette in CSS: 22 hues | Monsoon',
    description: 'Monsoon ships an OKLCH color palette in CSS: 22 hues from 50 to 950, generated on one shared lightness curve and kept inside sRGB, exposed as --color-{hue}-{step} variables and utilities.',
    blurb: '22 hues, 11 steps each, generated in OKLCH on one lightness curve and kept inside the sRGB gamut.',
    keywords: 'oklch color palette css, oklch colors, css color palette variables, perceptual color palette',
    lead: 'Besides the seed derived tokens, Monsoon includes a fixed palette of 22 hues with 11 steps each, from 50 to 950. It is generated in OKLCH so that the same step looks equally light across hues, and every color is available as a custom property and as utilities.',
    sections: [
      {
        h: 'The hues and steps',
        blocks: [
          'Five neutrals and seventeen colors: `slate`, `gray`, `zinc`, `neutral`, `stone`, `red`, `orange`, `amber`, `yellow`, `lime`, `green`, `emerald`, `teal`, `cyan`, `sky`, `blue`, `indigo`, `violet`, `purple`, `fuchsia`, `pink` and `rose`. Steps run `50`, `100`, `200` and so on up to `900`, then `950`.',
          {
            demo: `<div class="space-y-2">
  <div class="grid grid-cols-11 gap-1"><div class="h-8 rounded bg-blue-50"></div><div class="h-8 rounded bg-blue-100"></div><div class="h-8 rounded bg-blue-200"></div><div class="h-8 rounded bg-blue-300"></div><div class="h-8 rounded bg-blue-400"></div><div class="h-8 rounded bg-blue-500"></div><div class="h-8 rounded bg-blue-600"></div><div class="h-8 rounded bg-blue-700"></div><div class="h-8 rounded bg-blue-800"></div><div class="h-8 rounded bg-blue-900"></div><div class="h-8 rounded bg-blue-950"></div></div>
  <div class="grid grid-cols-11 gap-1"><div class="h-8 rounded bg-amber-50"></div><div class="h-8 rounded bg-amber-100"></div><div class="h-8 rounded bg-amber-200"></div><div class="h-8 rounded bg-amber-300"></div><div class="h-8 rounded bg-amber-400"></div><div class="h-8 rounded bg-amber-500"></div><div class="h-8 rounded bg-amber-600"></div><div class="h-8 rounded bg-amber-700"></div><div class="h-8 rounded bg-amber-800"></div><div class="h-8 rounded bg-amber-900"></div><div class="h-8 rounded bg-amber-950"></div></div>
  <div class="grid grid-cols-11 gap-1"><div class="h-8 rounded bg-emerald-50"></div><div class="h-8 rounded bg-emerald-100"></div><div class="h-8 rounded bg-emerald-200"></div><div class="h-8 rounded bg-emerald-300"></div><div class="h-8 rounded bg-emerald-400"></div><div class="h-8 rounded bg-emerald-500"></div><div class="h-8 rounded bg-emerald-600"></div><div class="h-8 rounded bg-emerald-700"></div><div class="h-8 rounded bg-emerald-800"></div><div class="h-8 rounded bg-emerald-900"></div><div class="h-8 rounded bg-emerald-950"></div></div>
  <div class="grid grid-cols-11 gap-1"><div class="h-8 rounded bg-rose-50"></div><div class="h-8 rounded bg-rose-100"></div><div class="h-8 rounded bg-rose-200"></div><div class="h-8 rounded bg-rose-300"></div><div class="h-8 rounded bg-rose-400"></div><div class="h-8 rounded bg-rose-500"></div><div class="h-8 rounded bg-rose-600"></div><div class="h-8 rounded bg-rose-700"></div><div class="h-8 rounded bg-rose-800"></div><div class="h-8 rounded bg-rose-900"></div><div class="h-8 rounded bg-rose-950"></div></div>
  <div class="grid grid-cols-11 gap-1"><div class="h-8 rounded bg-slate-50"></div><div class="h-8 rounded bg-slate-100"></div><div class="h-8 rounded bg-slate-200"></div><div class="h-8 rounded bg-slate-300"></div><div class="h-8 rounded bg-slate-400"></div><div class="h-8 rounded bg-slate-500"></div><div class="h-8 rounded bg-slate-600"></div><div class="h-8 rounded bg-slate-700"></div><div class="h-8 rounded bg-slate-800"></div><div class="h-8 rounded bg-slate-900"></div><div class="h-8 rounded bg-slate-950"></div></div>
</div>`,
            label: 'blue, amber, emerald, rose and slate, 50 to 950',
          },
        ],
      },
      {
        h: 'Why OKLCH',
        blocks: [
          'In the familiar RGB and HSL spaces, two colors with the same "lightness" number can look very different: a pure yellow looks far lighter than a pure blue. OKLCH is a perceptual space. Its lightness channel follows what people see, chroma measures colorfulness and hue is an angle. That gives the palette a useful property: **step 500 of one hue sits next to step 500 of another**, so swapping `bg-blue-600` for `bg-violet-600` keeps the same visual weight and roughly the same contrast with white text.',
          'Monsoon generates the palette from a short list of hue definitions. Every hue shares one lightness curve from 0.975 at step 50 to 0.27 at step 950. Warm hues such as amber and yellow get a small lightness lift around their peak, which is where those colors naturally look best, and each hue drifts slightly across the steps so dark shades do not turn muddy.',
        ],
      },
      {
        h: 'Kept inside sRGB on purpose',
        blocks: [
          'OKLCH can describe colors that most screens cannot show. Each step is generated with a requested chroma and then reduced, by a binary search, until it fits inside the sRGB gamut. The result renders the same in every browser and on every display instead of being clipped differently by each one.',
        ],
      },
      {
        h: 'Using the palette',
        blocks: [
          'Every color is a custom property named `--color-{hue}-{step}` on the root element, written as an `oklch()` value. Use them in your own CSS:',
          { code: `.chart-bar {
  background: var(--color-emerald-500);
}
.chart-bar.negative {
  background: var(--color-rose-500);
}`, lang: 'css', title: 'chart.css' },
          'And as utilities. Text, background and border get every step; ring, outline, decoration, fill, stroke and shadow color get the middle steps 400, 500 and 600, and so do gradient stops:',
          { code: `<span class="rounded-full bg-emerald-100 text-emerald-800 px-3 py-1 text-sm">Paid</span>
<div class="border-l-4 border-amber-500 bg-amber-50 p-4 text-amber-900">Pending review</div>
<div class="h-24 rounded-xl bg-gradient-to-r from-sky-500 via-indigo-500 to-fuchsia-500"></div>`, lang: 'html', title: 'palette.html' },
          {
            demo: `<div class="space-y-3"><div class="flex flex-wrap gap-2"><span class="rounded-full bg-emerald-100 text-emerald-800 px-3 py-1 text-sm">Paid</span><span class="rounded-full bg-amber-100 text-amber-800 px-3 py-1 text-sm">Pending</span><span class="rounded-full bg-rose-100 text-rose-800 px-3 py-1 text-sm">Overdue</span></div><div class="h-16 rounded-xl bg-gradient-to-r from-sky-500 via-indigo-500 to-fuchsia-500"></div></div>`,
          },
        ],
      },
      {
        h: 'Contrast across the palette',
        blocks: [
          'Because every hue follows the same lightness curve, contrast rules of thumb carry across hues. Steps 600 and darker take white text comfortably for normal sized text, and steps 100 and lighter work as tinted backgrounds for text in the 800 to 950 range of the same hue. The middle of the scale, around 400 and 500, is best for large text, icons, borders, chart series and decoration rather than small body text.',
          'These are starting points, not guarantees: warm hues are deliberately lifted at their peak, so a yellow 500 is lighter than a blue 500 and pairs with dark text instead of white. When in doubt, measure the pair, or use the semantic status tokens, which come with tested foregrounds.',
        ],
      },
      {
        h: 'Palette or semantic tokens?',
        blocks: [
          'Use semantic tokens (`bg-primary`, `bg-surface`, `text-muted-foreground`) for the structure of your interface. They follow the seed and switch with dark mode on their own. Reach for the palette for data and meaning that should not change with the theme: chart series, category labels, tags, illustrations. For palette colors that need a different value in dark mode, add the `dark:` variant, for example `bg-slate-100 dark:bg-slate-800`.',
        ],
      },
    ],
    faqs: [
      ['How many colors are in the Monsoon palette?', '22 hues with 11 steps each, 242 colors, all available as `--color-{hue}-{step}` custom properties.'],
      ['Can I use the palette colors in my own CSS?', 'Yes. Write `var(--color-indigo-600)` anywhere. The variables are defined on the root element.'],
      ['Do palette colors change in dark mode?', 'No, they are fixed. Use the `dark:` variant or semantic tokens when a color should adapt to the scheme.'],
      ['Which browsers support OKLCH?', 'All current major browsers support `oklch()` colors.'],
    ],
    related: ['generate-a-theme-from-one-color-css', 'accessible-color-contrast-css', 'dark-mode-with-one-line-of-css'],
  },

  // 9
  {
    slug: 'accessible-color-contrast-css',
    short: 'Accessible color contrast in CSS',
    kicker: 'Accessibility',
    title: 'Accessible color contrast in CSS, for any seed color',
    metaTitle: 'Accessible color contrast in CSS | Monsoon',
    description: 'How Monsoon keeps accessible color contrast in CSS for any seed color: WCAG AA 4.5:1 for text on primary, accent and surfaces in light and dark mode, plus focus, skip link and motion helpers.',
    blurb: 'How the seed formulas keep 4.5:1 contrast for any color, and the helpers for focus and motion.',
    keywords: 'accessible color contrast css, wcag contrast css, readable text color css, accessible theme',
    lead: 'A theme generated from any color is only useful if the text stays readable. Monsoon builds the contrast guarantee into the formulas themselves and checks it with tests, so a user picked brand color cannot produce an unreadable button.',
    sections: [
      {
        h: 'The target: WCAG AA',
        blocks: [
          'WCAG 2 asks for a contrast ratio of at least **4.5:1** between normal text and its background (level AA). Monsoon aims for that between every semantic fill and the foreground meant to sit on it: `primary` and `primary-foreground`, `secondary`, `accent`, the status colors, `background` with `foreground`, the three surfaces with `foreground`, and `muted` with `muted-foreground`.',
        ],
      },
      {
        h: 'Why a naive formula fails',
        blocks: [
          'A tempting approach is "use the seed as the fill and pick white or black text, whichever contrasts more". It fails for mid lightness colors. A saturated green or orange around OKLCH lightness 0.6 can sit below 4.5:1 against white and against black at the same time. No text color saves it.',
          'Monsoon therefore changes the fill, not only the text. If the seed lightness is below 0.6, primary takes `min(l, 0.52)`; otherwise it takes `max(l, 0.66)`. The band between 0.52 and 0.66 is never used, and the foreground flips on the same threshold: white for the dark side, near black (lightness 0.17) for the light side.',
          { code: `--primary-foreground: oklch(from var(--primary)
  clamp(0.17, (0.6 - l) * 100000, 1) min(c, 0.03) h);`, lang: 'css', title: 'monsoon.css' },
          'In dark mode the seed is first lifted to a lightness of at least 0.7, so `text-primary` on the dark background stays readable too.',
        ],
      },
      {
        h: 'How it is tested',
        blocks: [
          'The formulas live in one JavaScript module that writes the CSS, and the tests evaluate those exact expressions. The suite checks:',
          {
            list: [
              '18 named seeds, including black, white, gray, pure red, pure green, pure blue, gold and a seed placed exactly on the threshold,',
              'both light and dark mode,',
              '13 token pairs, with two methods of bringing out of gamut colors into sRGB,',
              'a sweep of 2,197 sRGB seeds (13 steps per channel) for primary, accent and body text,',
              'that primary lightness never lands inside the unsafe band.',
            ],
          },
          'Every one of those pairs must be at least 4.5:1. You can watch the same guarantee hold in the [seed playground](index.html#seed), which measures the colors your browser actually renders.',
        ],
      },
      {
        h: 'Accessibility helpers beyond color',
        blocks: [
          'Contrast is one part of accessible styling. Monsoon includes small helpers for the rest:',
          {
            table: {
              head: ['Class', 'What it does'],
              rows: [
                ['`sr-only`, `not-sr-only`', 'Hide content visually but keep it for screen readers, and undo it.'],
                ['`skip-link`', 'A component class (see [Skip link](components/skip-link.html)): visually hidden until it receives focus, for "Skip to content" links.'],
                ['`focus-ring`', 'A 2px outline in the ring color, only on keyboard focus (`:focus-visible`).'],
                ['`touch-target`', 'Minimum 44 by 44 pixels for small controls.'],
                ['`motion-safe:`, `motion-reduce:`', 'Apply transitions and animations only when the user has not asked for reduced motion.'],
                ['`forced-color-adjust-auto`, `-none`', 'Control how elements behave in Windows high contrast mode.'],
              ],
            },
          },
          'The base reset also gives every focusable element a visible `:focus-visible` outline in the ring color, which follows your seed.',
          { code: `<a href="#main" class="skip-link fixed top-2 left-2 z-50 rounded-md bg-primary text-primary-foreground px-3 py-2">
  Skip to content
</a>

<button class="touch-target focus-ring rounded-full hover:bg-muted" aria-label="Close">
  <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor"/></svg>
</button>

<div class="motion-safe:animate-pulse rounded-lg bg-muted h-4"></div>`, lang: 'html', title: 'a11y.html' },
        ],
      },
      {
        h: 'What remains your responsibility',
        blocks: [
          {
            list: [
              'Palette colors are fixed. `text-yellow-400` on white is not readable; check combinations you build from the palette yourself.',
              'Opacity modifiers lower contrast. `text-foreground/50` or text on `bg-primary/10` should be checked case by case.',
              'Large text has a lower requirement (3:1), but small text on tinted fills should still aim for 4.5:1.',
              'Color should never be the only signal. Pair status colors with a word or an icon.',
            ],
          },
          'A quick way to check your own combinations is the browser developer tools: inspect a text element and the color picker shows its contrast ratio against the background. Do it in both schemes, since a pair that passes in light mode can fail in dark mode when one side is a fixed palette color.',
        ],
      },
    ],
    faqs: [
      ['Is the primary button text always readable?', 'Yes for any seed. Primary is moved out of the unsafe lightness band and `primary-foreground` flips between white and near black on the same threshold. Tests check 4.5:1 for 18 named seeds and 2,197 sweep seeds in both modes.'],
      ['Does Monsoon check contrast at runtime?', 'No runtime code is involved. The guarantee comes from the formulas, which the browser evaluates as normal CSS.'],
      ['How do I hide text visually but keep it for screen readers?', 'Use the `sr-only` class. Use `skip-link` for a skip navigation link that appears when focused.'],
      ['Does Monsoon respect reduced motion?', 'Yes. Use `motion-safe:` and `motion-reduce:` on transitions and animations, and the reset turns off smooth scrolling for users who ask for reduced motion.'],
    ],
    related: ['generate-a-theme-from-one-color-css', 'dark-mode-with-one-line-of-css', 'oklch-color-palette-css'],
  },

  // 10
  {
    slug: 'css-utilities-for-php-wordpress-django-rails',
    short: 'CSS utilities for PHP, WordPress, Django and Rails',
    kicker: 'Server-rendered',
    title: 'CSS utilities for PHP, WordPress, Django and Rails',
    metaTitle: 'CSS utilities for PHP, WordPress, Django, Rails | Monsoon',
    description: 'Use utility CSS in PHP, WordPress, Laravel Blade, Django, Jinja and Rails templates with no Node.js build: link Monsoon, write classes, theme per user and purge template folders.',
    blurb: 'Link Monsoon from your layout, theme it from server data and purge your template folders.',
    keywords: 'css utilities for php wordpress django rails, utility css wordpress, utility css django, utility css rails, utility css php',
    lead: 'Server-rendered applications often skip a JavaScript toolchain entirely, and they are better for it. Monsoon fits them naturally: it is a stylesheet, so any template language can use it, and the optional purge command reads template files of any type.',
    sections: [
      {
        h: 'Plain PHP and Laravel Blade',
        blocks: [
          'Add the stylesheet to your layout and write classes in your templates. Conditional classes are ordinary strings:',
          { code: `<!doctype html>
<html lang="en">
<head>
  <link rel="stylesheet" href="${PIN}">
</head>
<body class="bg-background text-foreground">
  <?php foreach ($orders as $order): ?>
    <div class="flex items-center justify-between border-b py-3">
      <span class="font-medium"><?= htmlspecialchars($order->number) ?></span>
      <span class="rounded-full px-2 py-0.5 text-xs <?= $order->paid ? 'bg-success text-success-foreground' : 'bg-warning text-warning-foreground' ?>">
        <?= $order->paid ? 'Paid' : 'Open' ?>
      </span>
    </div>
  <?php endforeach; ?>
</body>
</html>`, lang: 'php', title: 'orders.php' },
          'Blade templates work the same way, since they compile to PHP. Put the `<link>` in your main layout.',
        ],
      },
      {
        h: 'WordPress themes',
        blocks: [
          'Enqueue the stylesheet from your theme so WordPress prints it in the head and plugins can depend on it:',
          { code: `<?php
add_action('wp_enqueue_scripts', function () {
    wp_enqueue_style(
        'monsoon',
        '${PIN}',
        array(),
        null
    );
});`, lang: 'php', title: 'functions.php' },
          'Then use utilities in your template files and block patterns. Content written in the editor keeps its own styles; Monsoon only styles the classes you add.',
        ],
      },
      {
        h: 'Django and Jinja',
        blocks: [
          'Link it from your base template. To host it yourself, place the file in a static folder and use the `static` tag:',
          { code: `{% load static %}
<!doctype html>
<html lang="en">
<head>
  <link rel="stylesheet" href="{% static 'css/monsoon.css' %}">
</head>
<body class="bg-background text-foreground">
  <main class="mx-auto max-w-3xl p-6 space-y-4">
    {% for message in messages %}
      <div class="rounded-lg border-l-4 border-info bg-info/10 p-4 text-sm">{{ message }}</div>
    {% endfor %}
    {% block content %}{% endblock %}
  </main>
</body>
</html>`, lang: 'jinja', title: 'base.html' },
        ],
      },
      {
        h: 'Rails',
        blocks: [
          '`stylesheet_link_tag` accepts a full URL, so the CDN works without touching the asset pipeline:',
          { code: `<!DOCTYPE html>
<html>
  <head>
    <%= stylesheet_link_tag "${PIN}" %>
  </head>
  <body class="bg-background text-foreground">
    <% flash.each do |type, message| %>
      <div class="rounded-lg bg-success/10 text-foreground p-4"><%= message %></div>
    <% end %>
    <%= yield %>
  </body>
</html>`, lang: 'erb', title: 'application.html.erb' },
        ],
      },
      {
        h: 'Reuse markup with partials, not new CSS',
        blocks: [
          'Long class lists repeat quickly in server templates: every button, every card, every form row. The answer is the reuse feature of your template language, not a new CSS class. A Blade component, a Django `include`, a Jinja macro or a Rails partial keeps the class list in one file, and every page that renders it stays consistent.',
          { code: `{% macro button(label, kind='primary') %}
  <button class="rounded-lg px-4 py-2 font-medium {{ 'bg-primary text-primary-foreground hover:bg-primary/90' if kind == 'primary' else 'border hover:bg-muted' }}">
    {{ label }}
  </button>
{% endmacro %}`, lang: 'jinja', title: 'macros.html' },
          'Changing the look of every button is then one edit in one template, which is exactly what a component class would have given you, without leaving HTML. The same idea works with Flask, FastAPI with Jinja templates, Symfony with Twig and any other stack that renders HTML on the server.',
        ],
      },
      {
        h: 'Theme per customer from the server',
        blocks: [
          'Because the theme is one custom property, a multi tenant app can brand every customer with one attribute rendered by the server. Validate the value before printing it, for example by only accepting hex colors:',
          { code: `<body class="bg-background text-foreground" style="--seed: <?= $tenant->brand_hex ?>">`, lang: 'php', title: 'layout.php' },
          'Buttons, links, focus rings and surfaces now follow the customer color, with readable foregrounds and dark mode, and no per customer stylesheet to build or cache.',
        ],
      },
      {
        h: 'Dark mode and forms in server templates',
        blocks: [
          'Server-rendered pages get dark mode for free, because it is decided in the browser from the visitor setting. If your users can choose a theme in their profile, render it as an attribute on the html element, for example `data-theme="dark"`, and the whole page follows on the first paint, with no flash and no script.',
          'Forms deserve a mention because they are the heart of most server applications. The reset gives inputs, selects and buttons the page font and removes browser default borders, so style them explicitly: `rounded-md border bg-background px-3 py-2` for fields and `focus:ring-2 focus:ring-ring focus:outline-none` for a focus ring that follows your seed. Validation states map to the status tokens, for example `border-danger` and `text-danger` next to an error message rendered by your framework.',
        ],
      },
      {
        h: 'Purge your template folders',
        blocks: [
          'The purge command accepts several globs and any file type. Point it at your templates and write the result into your static folder as part of your deploy:',
          {
            term: `# Django or Jinja
npx monsooncss purge "templates/**/*.html" -o static/css/monsoon.css

# Rails
npx monsooncss purge "app/views/**/*.erb" "app/helpers/**/*.rb" -o public/monsoon.css

# WordPress theme
npx monsooncss purge "wp-content/themes/my-theme/**/*.php" -o wp-content/themes/my-theme/monsoon.css`,
          },
          'Classes that come from the database or are built from strings in code are invisible to the scanner. Add them with `--safelist`, separated by commas.',
        ],
      },
    ],
    faqs: [
      ['Do I need Node.js on my server to use Monsoon?', 'No. Link the CDN file or copy the stylesheet into your static folder. Node.js is only used if you run the optional purge command, usually on a developer machine or in CI.'],
      ['Will Monsoon conflict with WordPress block styles?', 'Monsoon includes a small reset in a cascade layer and only styles the utility classes you write. Test your theme, especially headings and lists, since the reset removes default margins and list markers.'],
      ['Can I purge PHP or ERB files?', 'Yes. The purge command reads any text file and looks for class names in it, so `.php`, `.erb`, `.html`, `.twig` and `.py` files all work.'],
      ['How do I brand each customer differently?', 'Render `style="--seed: #hex"` on the body or a wrapper from your server. Validate the value first.'],
    ],
    related: ['no-build-css-framework', 'css-framework-from-a-cdn', 'utility-css-cdn-in-production'],
  },
];
