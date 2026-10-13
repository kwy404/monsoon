<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://cdn.jsdelivr.net/gh/kwy404/monsoon@main/assets/mascot-dark.svg">
    <img src="https://cdn.jsdelivr.net/gh/kwy404/monsoon@main/assets/mascot.svg" width="168" alt="Mo, the Monsoon mascot: a red panda in a raincoat holding a colorful umbrella, the face of a utility-first CSS framework with no build step">
  </picture>
</p>

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://cdn.jsdelivr.net/gh/kwy404/monsoon@main/assets/banner-dark.svg">
    <img src="https://cdn.jsdelivr.net/gh/kwy404/monsoon@main/assets/banner.svg" width="820" alt="Monsoon banner: utility-first CSS from a CDN with no build step, a whole theme from one seed color and automatic dark mode">
  </picture>
</p>

<h1 align="center">Monsoon: utility-first CSS with no build step</h1>

<p align="center">
  <a href="https://www.npmjs.com/package/monsooncss"><img src="https://img.shields.io/npm/v/monsooncss?color=3b5bdb&label=npm" alt="monsooncss npm version"></a>
  <a href="https://www.npmjs.com/package/monsooncss"><img src="https://img.shields.io/npm/dm/monsooncss" alt="monsooncss npm downloads per month"></a>
  <a href="https://www.npmjs.com/package/monsooncss"><img src="https://img.shields.io/npm/dt/monsooncss" alt="monsooncss total npm downloads"></a>
  <a href="https://github.com/kwy404/monsoon/actions/workflows/ci.yml"><img src="https://github.com/kwy404/monsoon/actions/workflows/ci.yml/badge.svg" alt="CI status of the Monsoon CSS framework"></a>
  <a href="https://github.com/kwy404/monsoon/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/monsooncss?color=3b5bdb" alt="MIT license"></a>
  <a href="https://github.com/kwy404/monsoon/blob/main/scripts/size.mjs"><img src="https://img.shields.io/badge/brotli-43%20kB-3b5bdb" alt="Full stylesheet is about 43 kB with brotli"></a>
</p>

<p align="center">
  <a href="https://kwy404.github.io/monsoon/">Documentation</a> &middot;
  <a href="https://kwy404.github.io/monsoon/#playground">Seed playground</a> &middot;
  <a href="https://kwy404.github.io/monsoon/components.html">Components</a> &middot;
  <a href="https://kwy404.github.io/monsoon/classes.html">Class reference</a> &middot;
  <a href="https://github.com/kwy404/monsoon/blob/main/i18n/README.pt-BR.md">Leia em Português (pt-BR)</a>
</p>

**Monsoon is a utility-first CSS framework you use straight from a CDN.** Add one `<link>` tag and write classes like `px-4`, `md:grid-cols-3` and `hover:bg-primary` in plain HTML. There is no compiler, no config file and no JavaScript. Set one `--seed` color and Monsoon derives a complete, accessible theme with OKLCH relative colors, including automatic dark mode.

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/monsooncss">
```

<p align="center">
  <img src="https://cdn.jsdelivr.net/gh/kwy404/monsoon@main/assets/demo.svg" width="100%" alt="Animated demo of utility-first CSS without a build step: Monsoon utility classes render a card, then changing one --seed color re-themes buttons, badges and surfaces">
</p>

<table>
  <tr>
    <td width="33%" valign="top"><picture><source media="(prefers-color-scheme: dark)" srcset="https://cdn.jsdelivr.net/gh/kwy404/monsoon@main/assets/icons/dark/no-build.svg"><img src="https://cdn.jsdelivr.net/gh/kwy404/monsoon@main/assets/icons/light/no-build.svg" width="32" alt="No build icon: CSS framework with no build step"></picture><br><b>No build step</b><br>One stylesheet. No compiler, no config file, no watcher.</td>
    <td width="33%" valign="top"><picture><source media="(prefers-color-scheme: dark)" srcset="https://cdn.jsdelivr.net/gh/kwy404/monsoon@main/assets/icons/dark/cdn.svg"><img src="https://cdn.jsdelivr.net/gh/kwy404/monsoon@main/assets/icons/light/cdn.svg" width="32" alt="Cloud icon: CSS framework from a CDN"></picture><br><b>Straight from a CDN</b><br>jsDelivr or unpkg, or host the file yourself.</td>
    <td width="33%" valign="top"><picture><source media="(prefers-color-scheme: dark)" srcset="https://cdn.jsdelivr.net/gh/kwy404/monsoon@main/assets/icons/dark/seed-theme.svg"><img src="https://cdn.jsdelivr.net/gh/kwy404/monsoon@main/assets/icons/light/seed-theme.svg" width="32" alt="Seed icon: generate a theme from one color in CSS"></picture><br><b>A theme from one color</b><br><code>--seed</code> drives every semantic color, in pure CSS.</td>
  </tr>
  <tr>
    <td width="33%" valign="top"><picture><source media="(prefers-color-scheme: dark)" srcset="https://cdn.jsdelivr.net/gh/kwy404/monsoon@main/assets/icons/dark/dark-mode.svg"><img src="https://cdn.jsdelivr.net/gh/kwy404/monsoon@main/assets/icons/light/dark-mode.svg" width="32" alt="Half moon icon: dark mode with one line of CSS"></picture><br><b>Dark mode built in</b><br>Follows the OS, or one class switches a page or a section.</td>
    <td width="33%" valign="top"><picture><source media="(prefers-color-scheme: dark)" srcset="https://cdn.jsdelivr.net/gh/kwy404/monsoon@main/assets/icons/dark/accessibility.svg"><img src="https://cdn.jsdelivr.net/gh/kwy404/monsoon@main/assets/icons/light/accessibility.svg" width="32" alt="Accessibility icon: accessible color contrast in CSS"></picture><br><b>Accessible contrast</b><br>Foregrounds flip to keep 4.5:1, tested for any seed.</td>
    <td width="33%" valign="top"><picture><source media="(prefers-color-scheme: dark)" srcset="https://cdn.jsdelivr.net/gh/kwy404/monsoon@main/assets/icons/dark/utility-classes.svg"><img src="https://cdn.jsdelivr.net/gh/kwy404/monsoon@main/assets/icons/light/utility-classes.svg" width="32" alt="Stacked bars icon: utility classes"></picture><br><b>4,616 utilities</b><br>Layout, flex, grid, spacing, type, color, effects and more.</td>
  </tr>
  <tr>
    <td width="33%" valign="top"><picture><source media="(prefers-color-scheme: dark)" srcset="https://cdn.jsdelivr.net/gh/kwy404/monsoon@main/assets/icons/dark/variants.svg"><img src="https://cdn.jsdelivr.net/gh/kwy404/monsoon@main/assets/icons/light/variants.svg" width="32" alt="Layers icon: hover, focus and responsive variants"></picture><br><b>7,565 variant classes</b><br>State, group, peer, dark, motion and breakpoints.</td>
    <td width="33%" valign="top"><picture><source media="(prefers-color-scheme: dark)" srcset="https://cdn.jsdelivr.net/gh/kwy404/monsoon@main/assets/icons/dark/container-queries.svg"><img src="https://cdn.jsdelivr.net/gh/kwy404/monsoon@main/assets/icons/light/container-queries.svg" width="32" alt="Nested boxes icon: container queries utility classes"></picture><br><b>Container queries</b><br><code>@container</code> plus <code>@xs:</code> to <code>@xl:</code> variants.</td>
    <td width="33%" valign="top"><picture><source media="(prefers-color-scheme: dark)" srcset="https://cdn.jsdelivr.net/gh/kwy404/monsoon@main/assets/icons/dark/tiny-size.svg"><img src="https://cdn.jsdelivr.net/gh/kwy404/monsoon@main/assets/icons/light/tiny-size.svg" width="32" alt="Compress icon: small utility css for production"></picture><br><b>About 43 kB brotli</b><br>The whole file. One cached request.</td>
  </tr>
  <tr>
    <td width="33%" valign="top"><picture><source media="(prefers-color-scheme: dark)" srcset="https://cdn.jsdelivr.net/gh/kwy404/monsoon@main/assets/icons/dark/purge.svg"><img src="https://cdn.jsdelivr.net/gh/kwy404/monsoon@main/assets/icons/light/purge.svg" width="32" alt="Funnel icon: purge unused CSS"></picture><br><b>Optional purge CLI</b><br>Keep only the classes your files use.</td>
    <td width="33%" valign="top"><picture><source media="(prefers-color-scheme: dark)" srcset="https://cdn.jsdelivr.net/gh/kwy404/monsoon@main/assets/icons/dark/framework-agnostic.svg"><img src="https://cdn.jsdelivr.net/gh/kwy404/monsoon@main/assets/icons/light/framework-agnostic.svg" width="32" alt="Shapes icon: CSS utilities for PHP, WordPress, Django and Rails"></picture><br><b>Any stack</b><br>HTML, PHP, WordPress, Django, Rails or any JS framework.</td>
    <td width="33%" valign="top"><picture><source media="(prefers-color-scheme: dark)" srcset="https://cdn.jsdelivr.net/gh/kwy404/monsoon@main/assets/icons/dark/familiar-classes.svg"><img src="https://cdn.jsdelivr.net/gh/kwy404/monsoon@main/assets/icons/light/familiar-classes.svg" width="32" alt="Pill icon: readable utility class names"></picture><br><b>Names that read like CSS</b><br><code>gap-6</code>, <code>text-muted-foreground</code>, <code>rounded-xl</code>.</td>
  </tr>
</table>

## Table of contents

- [Quick start](#quick-start)
- [Install with npm, pnpm, yarn or bun](#install-with-npm-pnpm-yarn-or-bun)
- [Generate a theme from one color](#generate-a-theme-from-one-color)
- [Dark mode with one line of CSS](#dark-mode-with-one-line-of-css)
- [Variants and container queries](#variants-and-container-queries)
- [Purge CLI: ship only the classes you use](#purge-cli-ship-only-the-classes-you-use)
- [Class reference by category](#class-reference-by-category)
- [Browser support](#browser-support)
- [What is not included](#what-is-not-included)
- [FAQ](#faq)
- [Guides](#guides)
- [More from kwy404](#more-from-kwy404)
- [License](#license)

## Quick start

Save this as `index.html` and open it in a browser. Every class is already in the stylesheet.

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/monsooncss">
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
</html>
```

For production, pin the version so the file never changes under you:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/monsooncss@0.1.0/dist/monsoon.min.css">
```

`https://unpkg.com/monsooncss` serves the same file.

## Install with npm, pnpm, yarn or bun

```bash
npm install monsooncss
pnpm add monsooncss
yarn add monsooncss
bun add monsooncss
```

The package ships `dist/monsoon.min.css` (the default export) and the readable `dist/monsoon.css` (`monsooncss/css`). Import it the way your bundler imports CSS, or copy the file into your public folder:

```bash
cp node_modules/monsooncss/dist/monsoon.min.css public/monsoon.css
```

## Generate a theme from one color

Set `--seed` to any CSS color. Monsoon derives the semantic tokens from it in the browser with OKLCH relative color syntax:

```css
:root {
  --seed: #0d9488;
}
```

| Tokens | Used for |
| --- | --- |
| `primary`, `primary-foreground` | Main actions and links. Lightness is pushed out of the band where text cannot reach 4.5:1. |
| `secondary`, `secondary-foreground` | Quiet buttons and chips, a low chroma tint of the seed. |
| `accent`, `accent-foreground` | Highlights, the seed hue rotated by 180 degrees. |
| `background`, `foreground` | Page background and body text. |
| `surface`, `surface-2`, `surface-3` | Cards, panels and raised layers. |
| `muted`, `muted-foreground` | Subtle fills and secondary text. |
| `border`, `ring` | Hairlines and the focus ring. |
| `success`, `warning`, `danger`, `info` | Status colors, each with a `-foreground`. |

Every token is a utility (`bg-primary`, `text-muted-foreground`, `border-border`, `ring-ring`) and a custom property (`var(--primary)`). Theme one section by putting the seed on it:

```html
<section style="--seed: teal" class="rounded-2xl bg-surface p-8 space-y-3">
  <h2 class="text-2xl font-bold text-primary">Teal section</h2>
  <button class="rounded-lg bg-primary text-primary-foreground px-4 py-2">Primary</button>
  <button class="rounded-lg bg-accent text-accent-foreground px-4 py-2">Accent</button>
</section>
```

**Accessible color contrast is built into the formulas.** The primary color never sits between OKLCH lightness 0.52 and 0.66, and its foreground flips between white and near black on the same threshold. The test suite checks 4.5:1 (WCAG AA) for 13 token pairs across 18 named seeds and a sweep of 2,197 sRGB seeds, in light and dark mode. Try any color in the [seed playground](https://kwy404.github.io/monsoon/#playground).

Monsoon also ships its own 22 hue OKLCH palette, `slate` to `rose`, steps `50` to `950`, as `--color-{hue}-{step}` custom properties and as utilities such as `bg-emerald-100` and `text-rose-600`.

## Dark mode with one line of CSS

Dark mode is automatic through `prefers-color-scheme`. Semantic colors switch on their own, so most pages need no extra classes. Force a scheme on the page or on any section:

```html
<html data-theme="dark">
<!-- or class="dark", class="light", data-theme="light" -->

<aside class="dark bg-background text-foreground rounded-2xl p-6">
  <p class="text-muted-foreground">This section is always dark.</p>
</aside>
```

For fixed palette colors there is a `dark:` variant: `bg-slate-100 dark:bg-slate-800`.

## Variants and container queries

```html
<button class="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-2 active:scale-95 disabled:opacity-50">
  Save
</button>

<div class="grid grid-cols-1 md:grid-cols-3 gap-6">...</div>

<div class="@container">
  <div class="flex flex-col @md:flex-row gap-4">...</div>
</div>
```

| Variants | Values |
| --- | --- |
| State | `hover:` `focus:` `focus-within:` `focus-visible:` `active:` `disabled:` `group-hover:` `peer-checked:` |
| Structure | `first:` `last:` `odd:` `even:` |
| Scheme and motion | `dark:` `motion-safe:` `motion-reduce:` |
| Breakpoints (min-width) | `sm:` 640px, `md:` 768px, `lg:` 1024px, `xl:` 1280px, `2xl:` 1536px |
| Container queries | `@xs:` 20rem, `@sm:` 24rem, `@md:` 28rem, `@lg:` 32rem, `@xl:` 36rem (inside an `@container` parent) |

Variants are applied to a curated set of utilities to keep the file small: `hover:` for colors, opacity, shadows and transforms; breakpoints for layout, spacing, sizing and text; `dark:` for palette colors. The [class reference](https://kwy404.github.io/monsoon/classes.html) shows the variants of every class.

## Purge CLI: ship only the classes you use

The full file is fine for most sites. To ship less, scan your files once and write a stylesheet with only the rules they use, plus the reset, theme tokens and keyframes:

```bash
npx monsooncss purge "src/**/*.html" -o public/monsoon.css
npx monsooncss purge "templates/**/*.html" "app/**/*.{php,erb,js}" --safelist bg-success,bg-danger -o static/monsoon.css
npx monsooncss classes --filter grid-cols
```

| Option | Meaning |
| --- | --- |
| `-o, --out <file>` | Output file. Without it the CSS goes to stdout. |
| `--safelist a,b,c` | Classes to keep even if no file mentions them (for class names built at runtime). |
| `--no-minify` | Readable output. |
| `--css <file>` | Purge another copy of the stylesheet. |
| `classes --json`, `--filter <text>` | List every class, as JSON or filtered. |

On the repository's kitchen sink demo the purged file is about 5.7 kB with brotli, against 43 kB for the full build.

## Class reference by category

| Category | Classes | Examples |
| --- | ---: | --- |
| colors | 2,050 | `text-foreground`, `bg-primary/90`, `border-slate-200`, `ring-ring` |
| spacing | 761 | `p-4`, `px-6`, `mt-8`, `-mx-2`, `gap-3`, `space-y-4` |
| layout | 388 | `flex`, `grid`, `hidden`, `relative`, `inset-0`, `z-50`, `@container` |
| backgrounds | 301 | `bg-gradient-to-br`, `from-primary`, `to-accent`, `bg-cover` |
| sizing | 268 | `w-full`, `max-w-3xl`, `size-10`, `h-screen`, `min-h-dvh` |
| borders | 193 | `border`, `rounded-xl`, `divide-y`, `ring-2`, `outline-none` |
| transforms | 143 | `scale-95`, `rotate-3`, `-translate-y-1`, `origin-top` |
| typography | 131 | `text-lg`, `font-semibold`, `tracking-tight`, `truncate`, `text-balance` |
| grid | 111 | `grid-cols-3`, `col-span-2`, `grid-flow-row`, `auto-rows-fr` |
| flexbox | 58 | `flex-col`, `flex-1`, `shrink-0`, `basis-1/2`, `order-first` |
| interactivity | 58 | `cursor-pointer`, `select-none`, `snap-x`, `accent-primary` |
| alignment | 55 | `items-center`, `justify-between`, `place-items-center` |
| effects | 34 | `shadow-lg`, `opacity-50`, `mix-blend-multiply` |
| transitions | 29 | `transition`, `duration-200`, `ease-out` |
| filters | 24 | `blur-sm`, `backdrop-blur-md`, `grayscale` |
| accessibility | 7 | `sr-only`, `skip-link`, `focus-ring`, `touch-target` |
| animation | 5 | `animate-spin`, `animate-pulse` |

Search all of them with their CSS at [kwy404.github.io/monsoon/classes.html](https://kwy404.github.io/monsoon/classes.html), or read [`scripts/classes.json`](https://github.com/kwy404/monsoon/blob/main/scripts/classes.json).

## Browser support

Monsoon targets current versions of Chrome, Edge, Firefox and Safari. Seed theming uses OKLCH relative color syntax (`oklch(from var(--seed) l c h)`), which needs Chrome and Edge 119 or newer, Firefox 128 or newer and Safari 18 or newer. Container query variants need container query support, available in all current browsers.

**Fallback for relative color syntax.** Inside `@supports not (color: oklch(from red l c h))`, the stylesheet ships static tokens computed from the default seed. `primary` and `ring` use your `--seed` directly, tokens that only depend on the color scheme still switch between light and dark, and the page stays readable.

## What is not included

A prebuilt stylesheet cannot know values you invent while writing markup, so these are not part of Monsoon:

- stacked variants such as `dark:hover:` or `md:hover:`;
- the important modifier;
- opacity modifiers beyond semantic colors, black and white (`bg-primary/90` and `bg-black/50` exist, palette colors with `/50` do not).

Use the nearest step of a scale, a `style` attribute, or a few lines of your own CSS with the theme variables.

Arbitrary values such as `w-[37px]`, `bg-[#0ea5e9]` or `md:grid-cols-[1fr_2fr]` are not in the file either, but they need no build step: `dist/monsoon.js` (or the 6 kB `dist/monsoon-arbitrary.js`) writes them in the browser, and `monsooncss purge` compiles them into the purged stylesheet so production can drop the script.

## FAQ

### How do I use utility-first CSS without a build step?

Add `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/monsooncss">` and write classes in your HTML. Every class is predeclared, so nothing has to scan your files or generate CSS.

### Is a utility CSS file from a CDN fine for production?

Yes. Pin the version, and the file (about 43 kB brotli) is cached after the first visit. Add subresource integrity if your policy asks for it, or self host. If every kilobyte counts, run `npx monsooncss purge` once.

### How do I generate a theme from one color in CSS?

Set `--seed` on `:root` or on any element with `style="--seed: ..."`. Primary, secondary, accent, surfaces, muted text, borders and the focus ring are derived from it with OKLCH relative colors.

### How do I add dark mode with one line of CSS?

It is already on through `prefers-color-scheme`. To force it, add `class="dark"` or `data-theme="dark"` to the html element or to any section.

### Does Monsoon keep accessible color contrast for any brand color?

Yes for the semantic token pairs. Primary is moved out of the unsafe lightness band and its foreground flips to stay at 4.5:1 or better, which the test suite checks in both modes.

### Does Monsoon support container queries with utility classes?

Yes. Put `@container` on a parent and use `@xs:` to `@xl:` on its children, for example `@md:flex-row`.

### Can I use Monsoon with PHP, WordPress, Django or Rails?

Yes. Link the stylesheet from your layout, write classes in your templates, and point the purge command at template folders such as `"templates/**/*.html"` or `"app/views/**/*.erb"`.

### Does Monsoon include JavaScript?

No. It is a stylesheet. Theming and dark mode are computed by the CSS engine.

## Guides

- [Utility-first CSS without a build step](https://kwy404.github.io/monsoon/utility-first-css-without-a-build-step.html)
- [How to load a CSS framework from a CDN](https://kwy404.github.io/monsoon/css-framework-from-a-cdn.html)
- [A no build CSS framework for real projects](https://kwy404.github.io/monsoon/no-build-css-framework.html)
- [Utility CSS from a CDN in production](https://kwy404.github.io/monsoon/utility-css-cdn-in-production.html)
- [Generate a theme from one color in CSS](https://kwy404.github.io/monsoon/generate-a-theme-from-one-color-css.html)
- [Dark mode with one line of CSS](https://kwy404.github.io/monsoon/dark-mode-with-one-line-of-css.html)
- [Container queries with utility classes](https://kwy404.github.io/monsoon/container-queries-utility-classes.html)
- [An OKLCH color palette for CSS](https://kwy404.github.io/monsoon/oklch-color-palette-css.html)
- [Accessible color contrast in CSS](https://kwy404.github.io/monsoon/accessible-color-contrast-css.html)
- [CSS utilities for PHP, WordPress, Django and Rails](https://kwy404.github.io/monsoon/css-utilities-for-php-wordpress-django-rails.html)

## More from kwy404

- [graphemely](https://kwy404.github.io/graphemely/): truncate, slice and count strings with emoji safely.
- [edgegoat](https://kwy404.github.io/edgegoat/): edge case test inputs for time zones, DST, unicode and numbers.
- [vueleap](https://kwy404.github.io/vueleap/): migrate Vue 2 to Vue 3 with one command.
- [numberparrot](https://kwy404.github.io/numberparrot/): parse localized number and currency strings back into numbers.
- [breakhound](https://kwy404.github.io/breakhound/): find bugs in any JavaScript library automatically, no tests needed.
- [Voodoo.js](https://github.com/kwy404/Voodoo.js): JSX and reactivity from a plain HTML file, used for the interactive parts of the Monsoon site.

## Contributing

Issues and pull requests are welcome. [CONTRIBUTING.md](https://github.com/kwy404/monsoon/blob/main/CONTRIBUTING.md) explains the generator, how to add a utility and how variants are assigned. Changes are listed in the [CHANGELOG](https://github.com/kwy404/monsoon/blob/main/CHANGELOG.md).

## License

[MIT](https://github.com/kwy404/monsoon/blob/main/LICENSE). Copyright 2026 Alexandre Kohler ([kwy404](https://github.com/kwy404))
