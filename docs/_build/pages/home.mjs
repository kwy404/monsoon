import {
  page, code, terminal, pre, copyButton, esc, md, icon, sectionHead, faqList, faqLd, breadcrumbLd,
  SITE, REPO, NPM, CDN, VERSION, INDEX, BASE_COUNT, VARIANT_COUNT, fmt, guidesNav, ROOT,
} from '../lib.mjs';
import { presets } from '../presets.mjs';
import { tokens, tokenCss } from '../../../src/theme.mjs';
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';

export const SEEDS = [
  ['Indigo', '#3b5bdb'],
  ['Teal', '#0d9488'],
  ['Rose', '#e11d48'],
  ['Amber', '#f59e0b'],
  ['Violet', '#7c3aed'],
  ['Emerald', '#059669'],
  ['Sky', '#0284c7'],
  ['Lime', '#84cc16'],
  ['Orange', '#ea580c'],
  ['Slate', '#475569'],
];

export const homeFaqs = [
  ['How do I use utility-first CSS without a build step?', 'Add one tag, `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/monsooncss">`, and write classes such as `px-4`, `md:grid-cols-3` or `hover:bg-primary` in your HTML. Every class is already in the file, so there is no compiler, no config file and no watcher to run.'],
  ['Is a CSS framework from a CDN fine for production?', `Yes. The minified file is about 43 kB with brotli and 80 kB with gzip, it is cached by the browser after the first visit, and you can pin an exact version such as \`monsooncss@${VERSION}\`. If you want the smallest possible file, run \`npx monsooncss purge\` once and serve the result yourself.`],
  ['How do I generate a whole theme from one color in CSS?', 'Set `--seed` to any CSS color, for example `:root { --seed: #0d9488; }`. Monsoon derives primary, secondary, accent, surfaces, muted text, borders and the focus ring from it with OKLCH relative colors, in pure CSS. Put `style="--seed: teal"` on any element to theme only that section.'],
  ['How does dark mode work?', 'It is automatic. Monsoon follows `prefers-color-scheme`, and you can force a scheme with `class="dark"`, `class="light"` or `data-theme="dark"` on the root element or on any section. Semantic colors such as `bg-surface` and `text-foreground` switch on their own, so most pages need no `dark:` classes at all.'],
  ['Is the color contrast accessible?', 'The seed formulas push the primary color out of the lightness band where neither white nor dark text is safe, and flip the foreground to match. The test suite checks 4.5:1 (WCAG AA) for every token pair across 18 named seeds and a sweep of 2,197 sRGB seeds, in light and dark mode.'],
  ['Does Monsoon support container queries?', 'Yes. Add `@container` to a parent and use `@xs:` to `@xl:` on its children, for example `@md:flex-row`. The container breakpoints run from 20rem to 36rem and are generated for layout, spacing, sizing and text utilities.'],
  ['Can I use it with PHP, WordPress, Django or Rails?', 'Yes. It is a plain stylesheet, so it works in any template language. Link it from your layout, write classes in your templates, and if you want a smaller file point the purge command at your template folders, for example `"templates/**/*.html"` or `"app/views/**/*.erb"`.'],
  ['What is not supported?', 'Stacked variants such as `dark:hover:`, arbitrary values such as `w-[37px]` and the important modifier are not part of a prebuilt stylesheet. Opacity modifiers like `bg-primary/90` exist for semantic colors, black and white. For anything else, a `style` attribute or a few lines of your own CSS next to Monsoon work fine.'],
];

const stat = (value, label) => `<div class="rounded-2xl border bg-surface/80 px-5 py-4">
          <p class="text-2xl sm:text-3xl font-extrabold tracking-tight">${value}</p>
          <p class="text-sm text-muted-foreground">${label}</p>
        </div>`;

function installTabs(prefix) {
  const tabs = [
    ['cdn', 'CDN', 'html', `<link rel="stylesheet" href="${CDN}">`],
    ['npm', 'npm', 'bash', 'npm install monsooncss'],
    ['pnpm', 'pnpm', 'bash', 'pnpm add monsooncss'],
    ['yarn', 'yarn', 'bash', 'yarn add monsooncss'],
    ['bun', 'bun', 'bash', 'bun add monsooncss'],
  ];
  const buttons = tabs
    .map(
      ([k, l], i) =>
        `<button type="button" role="tab" class="tab" id="${prefix}-tab-${k}" aria-controls="${prefix}-panel-${k}" aria-selected="${i === 0}" :aria-selected="pm === '${k}' ? 'true' : 'false'" @click="pm = '${k}'; $storage.set('monsoon-pm', '${k}')">${l}</button>`,
    )
    .join('');
  const copies = tabs.map(([k], i) => `<span class="ml-auto flex items-center" v-show="pm === '${k}'"${i ? ' v-cloak' : ''}>${copyButton(`${prefix}-code-${k}`, `${k} install command`)}</span>`).join('');
  const panels = tabs
    .map(([k, , lang, src], i) => {
      const { html } = pre(src, lang, { id: `${prefix}-code-${k}`, labelText: `${k} install command` });
      return `<div role="tabpanel" id="${prefix}-panel-${k}" aria-labelledby="${prefix}-tab-${k}" :hidden="pm !== '${k}'"${i ? ' hidden' : ''}>${html}</div>`;
    })
    .join('');
  return `<div class="window text-left" v-data="{ pm: $storage.get('monsoon-pm') || 'cdn' }">
  <div class="window-bar"><span class="dots" aria-hidden="true"><i></i><i></i><i></i></span><div class="tabs" role="tablist" aria-label="Install with">${buttons}</div>${copies}</div>
  ${panels}
</div>`;
}

const quickStart = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
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

const features = [
  ['no-build', 'No build step', 'Link one stylesheet. No compiler, no config file, no watcher and no JavaScript in your page.'],
  ['cdn', 'Straight from a CDN', 'Served by jsDelivr and unpkg from npm. Pin a version for production or host the file yourself.'],
  ['seed-theme', 'A theme from one color', 'Set `--seed` and every semantic color follows, computed in the browser with OKLCH relative colors.'],
  ['dark-mode', 'Dark mode built in', 'Follows the operating system, and `.dark`, `.light` or `data-theme` switch a page or a single section.'],
  ['accessibility', 'Contrast you can trust', 'Foregrounds flip to keep 4.5:1 against their fill. Focus ring, skip link and touch target helpers included.'],
  ['utility-classes', `${fmt(BASE_COUNT)} utilities`, 'Layout, flexbox, grid, spacing, sizing, typography, color, borders, effects, filters, transforms and motion.'],
  ['variants', `${fmt(VARIANT_COUNT)} variant classes`, 'hover, focus, active, disabled, group, peer, structural, dark, motion and five breakpoints, where they make sense.'],
  ['container-queries', 'Container queries', 'Mark a parent with `@container` and style children with `@xs:` to `@xl:`, independent of the viewport.'],
  ['tiny-size', 'About 43 kB brotli', 'The complete minified stylesheet. One request, cached after the first page view.'],
  ['purge', 'Optional purge CLI', '`npx monsooncss purge` keeps only the classes your files use. A typical page ends up at a few kilobytes.'],
  ['framework-agnostic', 'Any stack', 'Plain HTML, PHP, WordPress, Django, Rails, static site generators or any JavaScript framework.'],
  ['familiar-classes', 'Names that read like CSS', '`px-4`, `gap-6`, `text-muted-foreground`: each class says what it writes, so markup stays readable.'],
];

function seedPanel(mode) {
  const dark = mode === 'dark';
  return `<div class="${mode} rounded-2xl border bg-background text-foreground p-5 sm:p-6 space-y-5 shadow-sm" style="--seed: #3b5bdb" :style="{ '--seed': safe(seed) }">
  <div class="flex flex-wrap items-center justify-between gap-3">
    <p class="inline-flex items-center gap-2 text-sm font-semibold"><span class="size-2.5 rounded-full ${dark ? 'bg-slate-900 border border-white/30' : 'bg-white border border-black/20'}"></span>${dark ? 'Dark' : 'Light'} mode</p>
    <div class="flex flex-wrap gap-2 text-xs">
      <span class="inline-flex items-center gap-1.5 rounded-full border bg-surface px-2.5 py-1" title="Contrast of primary-foreground on primary">Button text <b class="font-mono font-semibold" v-text="ratio(seed, '${mode}', 'primary')">-</b></span>
      <span class="inline-flex items-center gap-1.5 rounded-full border bg-surface px-2.5 py-1" title="Contrast of foreground on background">Body text <b class="font-mono font-semibold" v-text="ratio(seed, '${mode}', 'body')">-</b></span>
      <span class="rounded-full bg-success text-success-foreground px-2.5 py-1 font-semibold" v-text="grade(seed, '${mode}')">AA</span>
    </div>
  </div>
  <div class="flex flex-wrap gap-2">
    <button type="button" class="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium shadow-sm hover:bg-primary/90 transition">Primary</button>
    <button type="button" class="rounded-lg bg-secondary text-secondary-foreground px-4 py-2 text-sm font-medium hover:bg-secondary/80 transition">Secondary</button>
    <button type="button" class="rounded-lg bg-accent text-accent-foreground px-4 py-2 text-sm font-medium transition">Accent</button>
    <button type="button" class="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted transition">Outline</button>
  </div>
  <div class="rounded-lg border-l-4 border-primary bg-primary/10 p-3 text-sm"><strong class="font-semibold text-primary">Tip.</strong> Every color in this card comes from one seed.</div>
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <form class="rounded-xl border bg-surface p-4 space-y-3" onsubmit="return false">
      <label class="block text-sm font-medium" for="email-${mode}">Email</label>
      <input id="email-${mode}" type="email" placeholder="you@example.com" class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
      <label class="flex items-center gap-2 text-sm"><input type="checkbox" class="accent-primary size-4" checked> Keep me posted</label>
      <div class="h-2 rounded-full bg-muted"><div class="h-2 w-2/3 rounded-full bg-primary"></div></div>
    </form>
    <div class="rounded-xl border bg-surface overflow-hidden text-sm">
      <table class="w-full">
        <thead class="bg-muted text-left text-xs uppercase tracking-wide text-muted-foreground"><tr><th class="px-3 py-2 font-semibold">Plan</th><th class="px-3 py-2 font-semibold">Status</th></tr></thead>
        <tbody class="divide-y">
          <tr><td class="px-3 py-2">Starter</td><td class="px-3 py-2"><span class="rounded-full bg-success/10 text-success px-2 py-0.5 text-xs font-medium">Active</span></td></tr>
          <tr><td class="px-3 py-2">Team</td><td class="px-3 py-2"><span class="rounded-full bg-warning text-warning-foreground px-2 py-0.5 text-xs font-medium">Trial</span></td></tr>
          <tr><td class="px-3 py-2">Legacy</td><td class="px-3 py-2"><span class="rounded-full bg-danger/10 text-danger px-2 py-0.5 text-xs font-medium">Ended</span></td></tr>
        </tbody>
      </table>
    </div>
  </div>
  <div class="flex flex-wrap gap-2 text-xs font-medium">
    <span class="rounded-full bg-success text-success-foreground px-2.5 py-0.5">success</span>
    <span class="rounded-full bg-warning text-warning-foreground px-2.5 py-0.5">warning</span>
    <span class="rounded-full bg-danger text-danger-foreground px-2.5 py-0.5">danger</span>
    <span class="rounded-full bg-info text-info-foreground px-2.5 py-0.5">info</span>
    <span class="rounded-full border px-2.5 py-0.5 text-muted-foreground">muted</span>
  </div>
  <div class="grid grid-cols-4 sm:grid-cols-8 gap-1.5" aria-label="Derived tokens">
    ${['primary', 'secondary', 'accent', 'surface-3', 'muted', 'border', 'ring', 'foreground']
      .map((t) => `<div class="space-y-1"><div class="h-8 rounded-md border bg-${t}"></div><p class="text-xs text-muted-foreground truncate">${t}</p></div>`)
      .join('\n    ')}
  </div>
</div>`;
}

function classPlayground() {
  const first = presets[0].code;
  const buttons = presets
    .map(
      (p, i) =>
        `<button type="button" class="rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${i === 0 ? 'bg-primary text-primary-foreground border-primary' : 'bg-surface hover:bg-muted'}" :class="p === ${i} ? 'bg-primary text-primary-foreground border-primary' : 'bg-surface hover:bg-muted'" :aria-pressed="p === ${i} ? 'true' : 'false'" aria-pressed="${i === 0}" @click="code = presets[${i}].code; p = ${i}">${esc(p.label)}</button>`,
    )
    .join('\n      ');
  return `<div v-data="{ code: presets[0].code, p: 0, dark: false }">
    <div class="flex flex-wrap items-center gap-2 mb-5" role="group" aria-label="Examples">
      ${buttons}
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <div class="window flex flex-col">
        <div class="window-bar"><span class="dots" aria-hidden="true"><i></i><i></i><i></i></span><span class="tab active"><svg class="file-icon" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><rect width="16" height="16" rx="3" fill="#e44d26"/><text x="8" y="11.2" text-anchor="middle" font-family="Segoe UI, Arial, sans-serif" font-size="6" font-weight="700" fill="#ffffff">&lt;/&gt;</text></svg><span>playground.html</span></span><span class="panel-shell">Edit me</span></div>
        <label for="playground-code" class="sr-only">HTML with Monsoon classes</label>
        <textarea id="playground-code" class="code-input flex-1 w-full min-h-96 p-4 resize-y focus:outline-none" spellcheck="false" autocomplete="off" autocapitalize="off" v-model.debounce="code">${esc(first)}</textarea>
      </div>
      <div class="window flex flex-col">
        <div class="window-bar"><span class="dots" aria-hidden="true"><i></i><i></i><i></i></span><span class="tab active"><span>Preview</span></span>
          <label class="ml-auto mr-3 inline-flex items-center gap-2 text-xs cursor-pointer select-none" style="color: var(--ed-tab-text)"><input type="checkbox" class="accent-primary size-4" v-model="dark"> Dark preview</label>
        </div>
        <iframe class="preview-frame flex-1 bg-background" title="Live preview of the HTML above" sandbox srcdoc="${esc(frameDoc(first, false))}" :srcdoc.dangerous="frameDoc(code, dark)"></iframe>
      </div>
    </div>
  </div>`;
}

export function frameDoc(codeText, dark) {
  return `<!doctype html><html class="${dark ? 'dark' : 'light'}"><head><meta charset="utf-8"><link rel="stylesheet" href="monsoon.min.css"></head><body class="p-6 antialiased bg-background text-foreground">${codeText}</body></html>`;
}

function themeCss() {
  const pick = (n) => tokens.find((t) => t.name === n);
  const lines = ['primary', 'primary-foreground', 'background', 'accent'].map((n) => `  --${n}: ${tokenCss(pick(n))};`);
  return `/* You write one line */
:root { --seed: #0d9488; }

/* Monsoon derives the rest in the browser */
${lines.join('\n')}`;
}

const tokenRows = [
  ['primary', 'primary-foreground', 'Main actions, links, active states. Lightness is pushed out of the unsafe band.'],
  ['secondary', 'secondary-foreground', 'Quiet buttons and chips, a low chroma tint of the seed.'],
  ['accent', 'accent-foreground', 'Highlights. The seed hue rotated by 180 degrees.'],
  ['background', 'foreground', 'Page background and body text.'],
  ['surface, surface-2, surface-3', 'foreground', 'Cards, panels and raised layers.'],
  ['muted', 'muted-foreground', 'Subtle fills and secondary text.'],
  ['border, ring', '', 'Hairlines and the focus ring.'],
  ['success, warning, danger, info', '*-foreground', 'Status colors with their own readable text.'],
];

export function home() {
  const guideCards = guidesNav
    .map(
      (g) => `<a href="${g.slug}.html" class="group rounded-2xl border bg-surface p-6 hover:shadow-lg hover:-translate-y-0.5 transition">
        <p class="text-xs font-semibold uppercase tracking-widest text-primary">${g.kicker}</p>
        <h3 class="mt-2 text-lg font-semibold tracking-tight">${esc(g.title)}</h3>
        <p class="mt-2 text-sm text-muted-foreground">${esc(g.blurb)}</p>
        <p class="mt-4 text-sm font-medium text-primary">Read the guide <span aria-hidden="true">&rarr;</span></p>
      </a>`,
    )
    .join('\n      ');

  const cats = Object.entries(
    INDEX.classes.reduce((m, c) => ((m[c.category] = (m[c.category] || 0) + 1), m), {}),
  ).sort((a, b) => b[1] - a[1]);

  const purgeOut = [
    '<span class="dim">monsooncss purge: scanned 1 file</span>',
    '<span class="dim">  kept 293 of 12779 utility rules</span>',
    '  public/monsoon.css: 31.3 kB raw, 6.9 kB gzip, <span class="ok">5.7 kB brotli</span> <span class="dim">(full build 43.2 kB brotli)</span>',
  ].join('\n');

  const body = `
<section class="relative overflow-hidden">
  <div class="bloom absolute inset-0 -z-10" aria-hidden="true"></div>
  <div class="grid-lines absolute inset-0 -z-10" aria-hidden="true"></div>
  <div class="mx-auto max-w-7xl px-4 sm:px-6 pt-16 pb-20 lg:pt-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
    <div class="space-y-7">
      <a href="${REPO}/blob/main/CHANGELOG.md" class="inline-flex items-center gap-2 rounded-full border bg-surface/80 px-3 py-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <span class="rounded-full bg-primary text-primary-foreground px-2 py-0.5 text-xs font-semibold">New</span> Version ${VERSION} is out
      </a>
      <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-balance leading-tight">Utility-first CSS <span class="text-gradient">without a build step</span></h1>
      <p class="text-lg sm:text-xl text-muted-foreground text-pretty max-w-xl">Monsoon is one stylesheet from a CDN. Write classes in your HTML, change one <code class="font-mono text-base whitespace-nowrap rounded-md border bg-surface px-1.5 py-0.5 text-foreground">--seed</code> color and get a full theme with automatic dark mode. No compiler, no config, no JavaScript.</p>
      <div class="flex flex-wrap gap-3">
        <a href="#quick-start" class="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-5 py-3 font-semibold shadow-lg hover:bg-primary/90 transition">Get started</a>
        <a href="#playground" class="inline-flex items-center gap-2 rounded-xl border bg-surface px-5 py-3 font-semibold hover:bg-muted transition">Try the seed playground</a>
      </div>
      <div class="max-w-xl">${installTabs('hero')}</div>
    </div>
    <div class="relative">
      <div class="absolute inset-8 rounded-full bg-gradient-to-br from-primary to-accent opacity-20 blur-3xl" aria-hidden="true"></div>
      <img src="assets/mascot.svg" width="452" height="452" alt="Mo, the Monsoon mascot: a cheerful red panda in a raincoat holding a colorful umbrella" class="float relative mx-auto w-full max-w-md">
    </div>
  </div>
  <div class="mx-auto max-w-7xl px-4 sm:px-6 pb-16">
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        ${stat(fmt(BASE_COUNT), 'base utility classes')}
        ${stat(fmt(VARIANT_COUNT), 'variant classes')}
        ${stat('43 kB', 'brotli, the whole file')}
        ${stat('0', 'build steps or JavaScript')}
    </div>
  </div>
</section>

<section id="quick-start" class="py-24 border-t">
  <div class="mx-auto max-w-7xl px-4 sm:px-6">
    ${sectionHead('Quick start', 'One link tag, then just write HTML', 'Copy this file, open it in a browser and you are done. Every class below is already in the stylesheet.')}
    <div class="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
      <div class="lg:col-span-3 min-w-0">${code(quickStart, 'html', 'index.html')}</div>
      <div class="lg:col-span-2 space-y-6">
        <ol class="space-y-5">
          <li class="flex gap-4"><span class="grid place-items-center size-8 shrink-0 rounded-full bg-primary text-primary-foreground text-sm font-bold">1</span><div><p class="font-semibold">Link the stylesheet</p><p class="text-sm text-muted-foreground">From jsDelivr, unpkg or your own server. Nothing to install.</p></div></li>
          <li class="flex gap-4"><span class="grid place-items-center size-8 shrink-0 rounded-full bg-primary text-primary-foreground text-sm font-bold">2</span><div><p class="font-semibold">Write utility classes</p><p class="text-sm text-muted-foreground">Spacing, layout, color and state live right in the markup.</p></div></li>
          <li class="flex gap-4"><span class="grid place-items-center size-8 shrink-0 rounded-full bg-primary text-primary-foreground text-sm font-bold">3</span><div><p class="font-semibold">Pick a seed color</p><p class="text-sm text-muted-foreground">One custom property themes the page, light and dark.</p></div></li>
        </ol>
        <div class="rounded-2xl border bg-surface-2 p-6">
          <p class="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Result</p>
          <div class="rounded-2xl border bg-surface p-6 shadow-lg space-y-4">
            <p class="text-2xl font-bold">Hello, Monsoon</p>
            <p class="text-muted-foreground">One stylesheet. No build step.</p>
            <button type="button" class="rounded-lg bg-primary text-primary-foreground px-4 py-2 font-medium hover:bg-primary/90">Get started</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="py-24 border-t bg-surface-2">
  <div class="mx-auto max-w-7xl px-4 sm:px-6">
    ${sectionHead('Why Monsoon', 'Everything a utility stylesheet needs, nothing to set up', 'A complete set of utilities and a theme engine written in CSS itself, so the file you link is the whole product.')}
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      ${features
        .map(
          ([ic, t, d]) => `<div class="rounded-2xl border bg-surface p-6 hover:shadow-md transition">
        <div class="icon size-11 rounded-xl bg-primary/10 text-primary p-2.5">${icon(ic)}</div>
        <h3 class="mt-4 font-semibold text-lg">${esc(t)}</h3>
        <p class="mt-2 text-sm text-muted-foreground leading-relaxed">${md(d)}</p>
      </div>`,
        )
        .join('\n      ')}
    </div>
  </div>
</section>

<section id="playground" class="py-24 border-t">
  <div class="mx-auto max-w-7xl px-4 sm:px-6" v-data="{ seed: '#3b5bdb' }">
    ${sectionHead('Seed playground', 'Generate a theme from one color', 'Pick any color. Buttons, cards, alerts, forms, badges and the table below are re-themed live in light and dark mode, and the contrast ratios are measured from the colors your browser actually renders.')}
    <div class="rounded-2xl border bg-surface p-4 sm:p-5 shadow-sm flex flex-col lg:flex-row gap-5 lg:items-center">
      <div class="flex items-center gap-3">
        <input type="color" class="color-input" value="#3b5bdb" v-model="seed" aria-label="Seed color picker">
        <div>
          <label for="seed-text" class="block text-xs font-medium text-muted-foreground">--seed</label>
          <input id="seed-text" class="w-40 rounded-md border bg-background px-2.5 py-1.5 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ring" value="#3b5bdb" v-model.debounce="seed" spellcheck="false" autocomplete="off">
        </div>
      </div>
      <div class="flex flex-wrap gap-2.5" role="group" aria-label="Preset seed colors">
        ${SEEDS.map(([n, h], i) => `<button type="button" class="swatch size-8 rounded-full ring-2 ring-offset-2 ring-offset-surface transition hover:scale-110 ${i === 0 ? 'ring-foreground' : 'ring-transparent'}" style="--swatch: ${h}" :class="seed === '${h}' ? 'ring-foreground' : 'ring-transparent'" @click="seed = '${h}'" aria-label="${n} ${h}" title="${n} ${h}"></button>`).join('\n        ')}
      </div>
      <div class="lg:ml-auto rounded-lg bg-muted px-3 py-2 font-mono text-xs text-muted-foreground">
        style="--seed: <span class="text-foreground" v-text="seed">#3b5bdb</span>"<br>
        <span v-text="lch(seed)">oklch(0.52 0.19 267)</span>
      </div>
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5">
      ${seedPanel('light')}
      ${seedPanel('dark')}
    </div>
    <p class="mt-5 text-sm text-muted-foreground text-center">Ratios are WCAG 2 contrast computed from <span class="font-mono">getComputedStyle</span>. The test suite checks 4.5:1 or better for every pair in both modes.</p>
  </div>
</section>

<section id="class-playground" class="py-24 border-t bg-surface-2">
  <div class="mx-auto max-w-7xl px-4 sm:px-6">
    ${sectionHead('Class playground', 'Edit HTML, see Monsoon render it', 'Type any utility class into the editor. The preview is a sandboxed frame that loads the same stylesheet you would link in production.')}
    ${classPlayground()}
    <script type="application/json" id="playground-presets">${JSON.stringify(presets).replace(/</g, '\\u003c')}</script>
  </div>
</section>

<section class="py-24 border-t">
  <div class="mx-auto max-w-7xl px-4 sm:px-6">
    ${sectionHead('Components', 'Build real interfaces with utilities only', 'Navbars, heroes, pricing, forms, tables, alerts, a modal with the native dialog element and more. Each one is plain HTML you can copy.')}
    <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
      <div class="rounded-2xl border bg-surface p-6 space-y-4">
        <p class="text-sm font-semibold text-muted-foreground">Pricing</p>
        <p class="text-4xl font-extrabold tracking-tight">$19<span class="text-base font-medium text-muted-foreground">/month</span></p>
        <ul class="space-y-2 text-sm"><li class="flex gap-2"><span class="text-success font-bold" aria-hidden="true">&#10003;</span>Unlimited projects</li><li class="flex gap-2"><span class="text-success font-bold" aria-hidden="true">&#10003;</span>Priority support</li></ul>
        <button type="button" class="w-full rounded-lg bg-primary text-primary-foreground py-2.5 font-medium hover:bg-primary/90 transition">Choose plan</button>
      </div>
      <div class="rounded-2xl border bg-surface p-6 space-y-3">
        <p class="text-sm font-semibold text-muted-foreground">Alerts</p>
        <div class="rounded-lg border-l-4 border-success bg-success/10 p-3 text-sm"><strong class="font-semibold">Saved.</strong> Settings updated.</div>
        <div class="rounded-lg border-l-4 border-warning bg-warning/10 p-3 text-sm"><strong class="font-semibold">Heads up.</strong> Trial ends soon.</div>
        <div class="rounded-lg border-l-4 border-danger bg-danger/10 p-3 text-sm"><strong class="font-semibold">Error.</strong> Payment failed.</div>
      </div>
      <div class="rounded-2xl border bg-surface p-6 space-y-3">
        <p class="text-sm font-semibold text-muted-foreground">Form</p>
        <label for="teaser-email" class="block text-sm font-medium">Work email</label>
        <input id="teaser-email" type="email" placeholder="you@company.com" class="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
        <label class="relative inline-flex items-center gap-3 cursor-pointer">
          <input type="checkbox" class="peer sr-only" checked>
          <span class="w-11 h-6 rounded-full bg-muted peer-checked:bg-primary transition-colors"></span>
          <span class="absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5"></span>
          <span class="text-sm">Product updates</span>
        </label>
      </div>
    </div>
    <p class="mt-8 text-center"><a href="components.html" class="inline-flex items-center gap-2 rounded-xl border bg-surface px-5 py-3 font-semibold hover:bg-muted transition">Open the components gallery <span aria-hidden="true">&rarr;</span></a></p>
  </div>
</section>

<section id="theming" class="py-24 border-t bg-surface-2">
  <div class="mx-auto max-w-7xl px-4 sm:px-6">
    ${sectionHead('How seed theming works', 'One custom property, a full palette, in pure CSS', 'No preprocessor computes your colors ahead of time. The browser derives every token from <span class="font-mono">--seed</span> with OKLCH relative color syntax, so changing it at runtime, per page or per section just works.')}
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      <div class="min-w-0 space-y-5">
        ${code(themeCss(), 'css', 'theme.css')}
        ${code(`<!-- Re-theme one section, the rest of the page keeps its seed -->
<section style="--seed: teal" class="rounded-2xl bg-surface p-8">
  <button class="rounded-lg bg-primary text-primary-foreground px-4 py-2">Teal</button>
</section>`, 'html', 'section.html')}
      </div>
      <div class="space-y-6">
        <ol class="space-y-5">
          <li class="flex gap-4"><span class="grid place-items-center size-8 shrink-0 rounded-full bg-primary text-primary-foreground text-sm font-bold">1</span><div><p class="font-semibold">Read the seed in OKLCH</p><p class="text-sm text-muted-foreground"><span class="font-mono">oklch(from var(--seed) l c h)</span> splits any CSS color into perceptual lightness, chroma and hue.</p></div></li>
          <li class="flex gap-4"><span class="grid place-items-center size-8 shrink-0 rounded-full bg-primary text-primary-foreground text-sm font-bold">2</span><div><p class="font-semibold">Keep lightness out of the unsafe band</p><p class="text-sm text-muted-foreground">Between L 0.52 and 0.66 neither white nor dark text reaches 4.5:1 for every hue, so primary snaps to one side of it.</p></div></li>
          <li class="flex gap-4"><span class="grid place-items-center size-8 shrink-0 rounded-full bg-primary text-primary-foreground text-sm font-bold">3</span><div><p class="font-semibold">Flip the foreground</p><p class="text-sm text-muted-foreground">A <span class="font-mono">clamp()</span> with a large multiplier acts as a branch free if, choosing white or near black text.</p></div></li>
          <li class="flex gap-4"><span class="grid place-items-center size-8 shrink-0 rounded-full bg-primary text-primary-foreground text-sm font-bold">4</span><div><p class="font-semibold">Switch modes with a number</p><p class="text-sm text-muted-foreground"><span class="font-mono">--mode</span> is 0 in light and 1 in dark, so the same declarations serve both schemes.</p></div></li>
        </ol>
        <div class="rounded-2xl border bg-surface overflow-hidden">
          <table class="w-full text-sm">
            <caption class="sr-only">Semantic tokens derived from the seed</caption>
            <thead class="bg-muted text-left"><tr><th class="px-4 py-2.5 font-semibold">Token</th><th class="px-4 py-2.5 font-semibold">Used for</th></tr></thead>
            <tbody class="divide-y">
              ${tokenRows.map(([a, b, d]) => `<tr><td class="px-4 py-2.5 font-mono text-xs align-top">${a}${b ? `<br><span class="text-muted-foreground">${b}</span>` : ''}</td><td class="px-4 py-2.5 text-muted-foreground">${d}</td></tr>`).join('\n              ')}
            </tbody>
          </table>
        </div>
        <p class="text-sm"><a href="generate-a-theme-from-one-color-css.html" class="font-medium text-primary underline underline-offset-4">Read the full seed theming guide</a></p>
      </div>
    </div>
  </div>
</section>

<section id="variants" class="py-24 border-t">
  <div class="mx-auto max-w-7xl px-4 sm:px-6">
    ${sectionHead('Dark mode, variants and container queries', 'State, scheme and size in the class name', 'Variants are generated where they are useful: hover and focus for colors and effects, breakpoints for layout, dark for palette colors. That is what keeps the full file small enough to link directly.')}
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div class="min-w-0 space-y-3">
        <h3 class="font-semibold text-lg">Dark mode with one line</h3>
        <p class="text-sm text-muted-foreground min-h-10">Automatic from the operating system. Force it on a page or a section with one attribute.</p>
        ${code(`<html data-theme="dark">

<!-- or only one section -->
<aside class="dark bg-surface p-6">
  <p class="text-foreground">Always dark</p>
</aside>`, 'html', 'dark.html')}
      </div>
      <div class="min-w-0 space-y-3">
        <h3 class="font-semibold text-lg">State and breakpoints</h3>
        <p class="text-sm text-muted-foreground min-h-10">Prefix a class with a state or a breakpoint. Breakpoints are mobile first.</p>
        ${code(`<button class="bg-primary
  hover:bg-primary/90
  focus-visible:ring-2
  active:scale-95
  disabled:opacity-50">
  Save
</button>

<div class="grid grid-cols-1
  md:grid-cols-3 gap-6">`, 'html', 'variants.html')}
      </div>
      <div class="min-w-0 space-y-3">
        <h3 class="font-semibold text-lg">Container queries</h3>
        <p class="text-sm text-muted-foreground min-h-10">Respond to the width of a parent instead of the viewport.</p>
        ${code(`<div class="@container">
  <div class="flex flex-col
    @md:flex-row gap-4">
    <img class="@md:w-1/3"
      src="cover.jpg" alt="">
    <p class="@lg:text-lg">
      Fits any column.
    </p>
  </div>
</div>`, 'html', 'card.html')}
      </div>
    </div>
    <div class="mt-8 rounded-2xl border bg-surface p-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
      <div><p class="font-semibold">State variants</p><p class="mt-1 text-muted-foreground font-mono text-xs leading-relaxed">hover: focus: focus-within: focus-visible: active: disabled: group-hover: peer-checked: first: last: odd: even: motion-safe: motion-reduce: dark:</p></div>
      <div><p class="font-semibold">Breakpoints (min-width)</p><p class="mt-1 text-muted-foreground font-mono text-xs leading-relaxed">sm: 640px, md: 768px, lg: 1024px, xl: 1280px, 2xl: 1536px</p></div>
      <div><p class="font-semibold">Container breakpoints</p><p class="mt-1 text-muted-foreground font-mono text-xs leading-relaxed">@xs: 20rem, @sm: 24rem, @md: 28rem, @lg: 32rem, @xl: 36rem</p></div>
    </div>
  </div>
</section>

<section id="purge" class="py-24 border-t bg-surface-2">
  <div class="mx-auto max-w-7xl px-4 sm:px-6">
    ${sectionHead('Purge CLI', 'Ship only the classes you use', 'The full file is fine for most sites. When every kilobyte counts, one command scans your templates and writes a stylesheet with only the rules they reference, plus the reset, theme tokens and keyframes.')}
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      <div class="min-w-0">${terminal('npx monsooncss purge "src/**/*.html" -o public/monsoon.css', 'bash', purgeOut)}
        <p class="mt-3 text-sm text-muted-foreground">Real output for the repository's kitchen sink demo page.</p>
      </div>
      <div class="min-w-0 space-y-5">
        ${terminal(`# several globs, any file type
npx monsooncss purge "templates/**/*.html" "app/**/*.{php,erb,js}" -o static/monsoon.css

# keep classes you build from strings at runtime
npx monsooncss purge "src/**/*.html" --safelist bg-success,bg-danger -o out.css

# list every class, or search them
npx monsooncss classes --filter grid-cols`)}
        <ul class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <li class="rounded-xl border bg-surface p-4"><span class="font-mono font-semibold">-o, --out</span><br><span class="text-muted-foreground">Output file. Without it the CSS goes to stdout.</span></li>
          <li class="rounded-xl border bg-surface p-4"><span class="font-mono font-semibold">--safelist a,b</span><br><span class="text-muted-foreground">Classes to keep even if no file mentions them.</span></li>
          <li class="rounded-xl border bg-surface p-4"><span class="font-mono font-semibold">--no-minify</span><br><span class="text-muted-foreground">Readable output instead of minified CSS.</span></li>
          <li class="rounded-xl border bg-surface p-4"><span class="font-mono font-semibold">--css file</span><br><span class="text-muted-foreground">Purge another copy of the stylesheet.</span></li>
        </ul>
      </div>
    </div>
  </div>
</section>

<section id="reference" class="py-24 border-t">
  <div class="mx-auto max-w-7xl px-4 sm:px-6">
    ${sectionHead('Class reference', `${fmt(BASE_COUNT)} classes, searchable, with their CSS`, 'Every class in the stylesheet with its category, the exact CSS it writes and the variants it supports.')}
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      ${cats.map(([c, n]) => `<a href="classes.html?cat=${c}" class="rounded-xl border bg-surface p-4 hover:border-primary hover:shadow-md transition"><p class="font-semibold capitalize">${c}</p><p class="text-sm text-muted-foreground">${fmt(n)} classes</p></a>`).join('\n      ')}
    </div>
    <p class="mt-8 text-center"><a href="classes.html" class="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-5 py-3 font-semibold hover:bg-primary/90 transition">Search all classes <span aria-hidden="true">&rarr;</span></a></p>
  </div>
</section>

<section id="guides" class="py-24 border-t bg-surface-2">
  <div class="mx-auto max-w-7xl px-4 sm:px-6">
    ${sectionHead('Guides', 'Learn the ideas behind Monsoon', 'Practical guides with examples you can paste into a page today.')}
    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
      ${guideCards}
    </div>
  </div>
</section>

<section id="faq" class="py-24 border-t">
  <div class="mx-auto max-w-3xl px-4 sm:px-6">
    ${sectionHead('FAQ', 'Questions people ask about Monsoon', '')}
    ${faqList(homeFaqs)}
  </div>
</section>

<section class="pb-24">
  <div class="mx-auto max-w-5xl px-4 sm:px-6">
    <div class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-violet-600 to-fuchsia-600 p-10 sm:p-14 text-center text-white shadow-2xl">
      <h2 class="text-3xl sm:text-4xl font-extrabold tracking-tight text-balance">Paste one line and start building</h2>
      <p class="mt-3 text-lg text-white/90">Free and open source under the MIT license.</p>
      <div class="mt-8 mx-auto max-w-2xl">${code(`<link rel="stylesheet" href="${CDN}">`, 'html', 'index.html')}</div>
      <div class="mt-8 flex flex-wrap justify-center gap-3">
        <a href="${REPO}" class="rounded-xl bg-white text-slate-900 px-5 py-3 font-semibold hover:bg-white/90 transition">Star on GitHub</a>
        <a href="${NPM}" class="rounded-xl border border-white/50 px-5 py-3 font-semibold text-white hover:bg-white/10 transition">View on npm</a>
      </div>
    </div>
  </div>
</section>`;

  const jsonld = [
    {
      '@type': 'SoftwareApplication',
      name: 'Monsoon',
      alternateName: 'monsooncss',
      description: 'Utility-first CSS framework with no build step: one stylesheet from a CDN, a full theme from one seed color with OKLCH relative colors, automatic dark mode and container query utilities.',
      applicationCategory: 'DeveloperApplication',
      applicationSubCategory: 'CSS framework',
      operatingSystem: 'Any',
      softwareVersion: VERSION,
      url: SITE,
      downloadUrl: NPM,
      codeRepository: REPO,
      license: 'https://opensource.org/licenses/MIT',
      isAccessibleForFree: true,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      author: { '@type': 'Person', name: 'Alexandre Kohler', url: 'https://github.com/kwy404' },
      image: `${SITE}assets/og.png`,
      keywords: 'utility-first css without a build step, css framework from a cdn, no build css framework, utility css cdn production, generate a theme from one color css, dark mode css, container queries utility classes, oklch color palette css, accessible color contrast css',
    },
    { '@type': 'WebSite', name: 'Monsoon', url: SITE },
    faqLd(homeFaqs),
    breadcrumbLd([['Monsoon', 'index.html']]),
  ];

  return page({
    path: 'index.html',
    title: 'Monsoon: utility-first CSS without a build step, from a CDN',
    description: `Monsoon is a no build CSS framework: one stylesheet from a CDN, ${fmt(BASE_COUNT)} utility classes, a whole theme from one --seed color, automatic dark mode and container queries.`,
    body,
    jsonld,
  });
}
