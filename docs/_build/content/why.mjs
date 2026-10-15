// The twenty differentiators on the "Why Monsoon" page and the landing page.
// Each one has a short title, one sentence, a link and either a live demo
// (HTML rendered on the page) or a code sample. Numbers come from the build.

export function reasons({ components = 0, noJs = 0, installGuides = 0, brotli = '', version = '', classes = 0 } = {}) {
  const pin = version ? `@${version}` : '';
  return [
    {
      title: 'Zero build in production, from a CDN',
      text: `One stylesheet link is the whole install: every class is already in the file${brotli ? `, ${brotli} with brotli` : ''}, so there is no compiler, config or watcher, in development or in production.`,
      href: 'docs/installation-cdn.html',
      code: `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/monsooncss${pin}">`,
      lang: 'html',
    },
    {
      title: 'Arbitrary values without a build step',
      text: 'Write w-[37px] or bg-[#0ea5e9] when no step fits: a small script writes the rules in the browser, or the purge CLI compiles them for production.',
      href: 'docs/arbitrary-values.html',
      demo: '<div class="grid grid-cols-[1fr_2fr] gap-2"><div class="h-[52px] rounded-[12px] bg-[#0ea5e9]"></div><div class="h-[52px] rounded-[12px] bg-[oklch(0.72_0.16_150)] p-[6px_10px] text-[12px] font-[650] text-[#06210f]">grid-cols-[1fr_2fr]</div></div>',
    },
    {
      title: 'A whole theme from one --seed color',
      text: 'Primary, accent, surfaces, borders, muted text and the focus ring are computed from one OKLCH seed in pure CSS, so one line re-themes everything.',
      href: 'docs/theming.html',
      demo: '<div class="flex flex-wrap gap-2"><button class="btn btn-sm" style="--seed: #0d9488">Teal</button><button class="btn btn-sm" style="--seed: #e11d48">Rose</button><button class="btn btn-sm" style="--seed: #7c3aed">Violet</button><button class="btn btn-sm" style="--seed: #ca8a04">Gold</button></div>',
    },
    {
      title: 'Accessible contrast, tested for every token pair',
      text: 'Every fill and its foreground keep at least 4.5:1 for any seed, in light and dark mode, and the test suite checks each pair across a sweep of seeds.',
      href: 'accessible-color-contrast-css.html',
      demo: '<div class="flex flex-wrap gap-2"><span class="rounded-md bg-primary text-primary-foreground px-3 py-1 text-sm font-medium" style="--seed: #fde047">light seed</span><span class="rounded-md bg-primary text-primary-foreground px-3 py-1 text-sm font-medium" style="--seed: #1e3a8a">dark seed</span><span class="rounded-md bg-primary text-primary-foreground px-3 py-1 text-sm font-medium" style="--seed: #22c55e">mid seed</span></div>',
    },
    {
      title: 'Per-section theming with style="--seed"',
      text: 'Put a seed on any element and only that subtree re-themes, so a pricing card, a sidebar or a whole tenant can have its own brand on the same page.',
      href: 'generate-a-theme-from-one-color-css.html',
      demo: '<div class="grid grid-cols-2 gap-2"><div class="rounded-lg border bg-surface p-3" style="--seed: #0284c7"><p class="text-sm font-semibold text-primary">Ocean</p><div class="mt-2 h-1.5 rounded-full bg-primary"></div></div><div class="rounded-lg border bg-surface p-3" style="--seed: #ea580c"><p class="text-sm font-semibold text-primary">Ember</p><div class="mt-2 h-1.5 rounded-full bg-primary"></div></div></div>',
    },
    {
      title: 'Dark mode that follows the nearest themed ancestor',
      text: 'A light card inside a dark section inside a light page is exactly what you expect, at any depth, for the tokens and for the dark: prefix alike.',
      href: 'docs/dark-mode.html',
      demo: '<div class="dark rounded-lg border p-3"><p class="text-xs text-muted-foreground">dark</p><div class="light mt-2 rounded-md border p-3"><p class="text-xs text-muted-foreground">light</p><div class="dark mt-2 rounded border p-2 text-xs">dark again</div></div></div>',
    },
    {
      title: `${components} components in the same file`,
      text: `${components} components ship in the one stylesheet, ${noJs} of them with no script at all: forms, actions, navigation, overlays and data display.`,
      href: 'components.html',
      demo: '<div class="flex flex-wrap items-center gap-2"><span class="badge badge-primary">New</span><span class="badge badge-success badge-dot">Active</span><kbd class="kbd">Ctrl</kbd><kbd class="kbd">K</kbd><progress class="progress progress-sm w-24" value="64" max="100">64%</progress></div>',
    },
    {
      title: 'Components that need no JavaScript',
      text: 'Dialogs, popovers, menus and accordions are built on dialog, the popover attribute and details, so the browser does the work and nothing has to hydrate.',
      href: 'components/collapse.html',
      demo: '<details class="collapse collapse-arrow"><summary class="collapse-title">Does it need a script?</summary><div class="collapse-content">No. This is a details element.</div></details>',
    },
    {
      title: 'An optional interactive layer',
      text: 'One script adds file drop, cropping, date pickers, sortable lists, comboboxes and more on top of native inputs that keep working without it.',
      href: 'docs/interactive-layer.html',
      code: `<script src="https://cdn.jsdelivr.net/npm/monsooncss${pin}/dist/monsoon.js" defer></script>
<div class="datepicker" data-m-datepicker>
  <input type="date" class="input">
</div>`,
      lang: 'html',
    },
    {
      title: 'Container query variants built in',
      text: 'Prefix a class with @sm: to @xl: and it reacts to the width of its container, so a card adapts to the column it is dropped into.',
      href: 'docs/container-queries.html',
      demo: '<div class="@container rounded-lg border p-3"><div class="flex flex-col @xs:flex-row gap-2"><div class="h-10 @xs:w-1/3 rounded-md bg-primary"></div><p class="text-xs text-muted-foreground">Stacks when narrow, a row from 20rem of container width.</p></div></div>',
    },
    {
      title: 'Fluid type and spacing utilities',
      text: 'text-fluid-* and p-fluid-* grow smoothly with the viewport between a mobile and a desktop size, with no breakpoint classes and respecting browser zoom.',
      href: 'utilities/fluid.html',
      demo: '<p class="text-fluid-2xl font-bold">Fluid heading</p><p class="text-fluid-sm text-muted-foreground">Resize the window to watch it grow.</p>',
    },
    {
      title: 'Print, rtl, ltr and forced-colors variants',
      text: 'Hide navigation when printing, mirror a margin in right to left languages and fix a border for high contrast themes, all with a prefix.',
      href: 'docs/variants.html',
      code: `<nav class="print:hidden">...</nav>
<span class="ml-4 rtl:ml-0 rtl:mr-4">Badge</span>
<div class="border-0 forced-colors:border">...</div>`,
      lang: 'html',
    },
    {
      title: 'Zero config purge that compiles arbitrary values',
      text: 'One command keeps only the classes your files use and writes static rules for every arbitrary value it finds, with no config file.',
      href: 'docs/purge-cli.html',
      code: 'npx monsooncss purge "src/**/*.{html,jsx,vue,php}" -o public/monsoon.css',
      lang: 'bash',
    },
    {
      title: 'Works with any backend or framework',
      text: `It is plain CSS classes, so server templates, static site generators and single page apps all use it the same way, with ${installGuides} step by step install guides.`,
      href: 'docs/installation-npm.html',
      code: `{% for user in users %}
  <li class="flex items-center gap-3 py-2">{{ user.name }}</li>
{% endfor %}`,
      lang: 'jinja',
    },
    {
      title: 'One shared token scale for every control',
      text: 'Inputs, selects and buttons of the same size share one height, radius and padding token, so a row of mixed controls lines up with no tweaks.',
      href: 'components/input.html',
      demo: '<div class="flex flex-wrap items-center gap-2"><input class="input input-sm w-32" placeholder="Search" aria-label="Search"><select class="select select-sm w-28" aria-label="Sort"><option>Newest</option></select><button class="btn btn-sm">Apply</button></div>',
    },
    {
      title: 'An in-gamut OKLCH palette',
      text: 'Twenty-two hues share one lightness curve and have their chroma capped to sRGB, so step 500 of every hue looks equally strong and renders the same everywhere.',
      href: 'oklch-color-palette-css.html',
      demo: '<div class="grid grid-cols-11 gap-1"><span class="h-7 rounded bg-red-500"></span><span class="h-7 rounded bg-orange-500"></span><span class="h-7 rounded bg-amber-500"></span><span class="h-7 rounded bg-yellow-500"></span><span class="h-7 rounded bg-lime-500"></span><span class="h-7 rounded bg-emerald-500"></span><span class="h-7 rounded bg-cyan-500"></span><span class="h-7 rounded bg-blue-500"></span><span class="h-7 rounded bg-violet-500"></span><span class="h-7 rounded bg-fuchsia-500"></span><span class="h-7 rounded bg-rose-500"></span></div>',
    },
    {
      title: 'Accessible by default',
      text: 'Every component has a visible focus ring, motion stops under prefers-reduced-motion and controls stay usable in forced colors mode, with no extra classes.',
      href: 'accessible-color-contrast-css.html',
      demo: '<div class="flex flex-wrap items-center gap-2"><button class="btn btn-sm">Tab to me</button><a href="#reason-17" class="text-sm text-primary underline underline-offset-4">and to me</a></div>',
    },
    {
      title: 'Utilities always override components',
      text: 'Components sit before the utilities in the same file, so a utility on a component always wins without !important or a specificity fight.',
      href: 'components/button.html',
      demo: '<div class="flex flex-wrap gap-2"><button class="btn btn-sm">btn</button><button class="btn btn-sm rounded-full bg-emerald text-white">btn rounded-full bg-emerald</button></div>',
    },
    {
      title: 'One cached file for every page and project',
      text: 'Every page of every site that links the same version shares one file the browser already has, so the second page and the next project load no CSS at all.',
      href: 'docs/installation-cdn.html',
      code: `<!-- page one, page two, project three: the same URL -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/monsooncss${pin}">`,
      lang: 'html',
    },
    {
      title: 'A machine readable class index',
      text: `classes.json lists all ${classes ? classes.toLocaleString('en-US') : ''} classes with their CSS and variants, ready for editor completion, linters and other tooling.`,
      href: 'https://github.com/kwy404/monsoon/blob/main/scripts/classes.json',
      code: `{
  "class": "grid-cols-3",
  "category": "grid",
  "css": ".grid-cols-3 {\\n  grid-template-columns: repeat(3, minmax(0, 1fr));\\n}",
  "variants": ["sm", "md", "lg", "xl", "2xl", "@xs", "@sm", "@md", "@lg", "@xl", "print", "screen"]
}`,
      lang: 'json',
    },
  ];
}
