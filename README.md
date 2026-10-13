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
  <a href="https://github.com/kwy404/monsoon/blob/main/scripts/size.mjs"><img src="https://img.shields.io/badge/brotli-88%20kB-3b5bdb" alt="Full stylesheet with every utility and component is about 88 kB with brotli"></a>
  <a href="https://kwy404.github.io/monsoon/components.html"><img src="https://img.shields.io/badge/components-167-3b5bdb" alt="167 CSS components"></a>
</p>

<p align="center">
  <a href="https://kwy404.github.io/monsoon/">Documentation</a> &middot;
  <a href="https://kwy404.github.io/monsoon/components.html">Components</a> &middot;
  <a href="https://kwy404.github.io/monsoon/classes.html">Class reference</a> &middot;
  <a href="https://kwy404.github.io/monsoon/playground.html">Seed playground</a> &middot;
  <a href="https://kwy404.github.io/monsoon/why.html">Why Monsoon</a> &middot;
  <a href="https://github.com/kwy404/monsoon/blob/main/i18n/README.pt-BR.md">Leia em Português (pt-BR)</a>
</p>

**Monsoon is a utility-first CSS framework and component library you use straight from a CDN.** Add one `<link>` tag and write classes like `px-4`, `md:grid-cols-3`, `hover:bg-primary` or `btn btn-primary` in plain HTML. There is no compiler and no config file, and the stylesheet needs no JavaScript. Set one `--seed` color and Monsoon derives a complete, accessible theme with OKLCH relative colors, including automatic dark mode. One file holds 4,923 utilities, 10,237 variant classes and 167 components, about 88 kB with brotli.

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/monsooncss">
```

When you need more, two optional pieces still skip the build step: a script that adds behavior to 45 interactive components (dropzone, image cropper, date picker, data table, two factor code cells and more) and writes arbitrary values such as `w-[37px]` and `bg-[#0ea5e9]` in the browser, and a purge command that compiles those values into a static file for production.

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
    <td width="33%" valign="top"><picture><source media="(prefers-color-scheme: dark)" srcset="https://cdn.jsdelivr.net/gh/kwy404/monsoon@main/assets/icons/dark/dark-mode.svg"><img src="https://cdn.jsdelivr.net/gh/kwy404/monsoon@main/assets/icons/light/dark-mode.svg" width="32" alt="Half moon icon: dark mode with one line of CSS"></picture><br><b>Dark mode built in</b><br>Follows the OS, or one class switches a page or a section. The nearest themed ancestor wins.</td>
    <td width="33%" valign="top"><picture><source media="(prefers-color-scheme: dark)" srcset="https://cdn.jsdelivr.net/gh/kwy404/monsoon@main/assets/icons/dark/accessibility.svg"><img src="https://cdn.jsdelivr.net/gh/kwy404/monsoon@main/assets/icons/light/accessibility.svg" width="32" alt="Accessibility icon: accessible color contrast in CSS"></picture><br><b>Accessible contrast</b><br>Foregrounds flip to keep 4.5:1, tested for any seed.</td>
    <td width="33%" valign="top"><picture><source media="(prefers-color-scheme: dark)" srcset="https://cdn.jsdelivr.net/gh/kwy404/monsoon@main/assets/icons/dark/utility-classes.svg"><img src="https://cdn.jsdelivr.net/gh/kwy404/monsoon@main/assets/icons/light/utility-classes.svg" width="32" alt="Stacked bars icon: utility classes"></picture><br><b>4,923 utilities</b><br>Layout, flex, grid, spacing, fluid type, color, effects and more.</td>
  </tr>
  <tr>
    <td width="33%" valign="top"><picture><source media="(prefers-color-scheme: dark)" srcset="https://cdn.jsdelivr.net/gh/kwy404/monsoon@main/assets/icons/dark/variants.svg"><img src="https://cdn.jsdelivr.net/gh/kwy404/monsoon@main/assets/icons/light/variants.svg" width="32" alt="Layers icon: hover, focus and responsive variants"></picture><br><b>10,237 variant classes</b><br>State, group, peer, dark, motion, print, rtl and breakpoints.</td>
    <td width="33%" valign="top"><picture><source media="(prefers-color-scheme: dark)" srcset="https://cdn.jsdelivr.net/gh/kwy404/monsoon@main/assets/icons/dark/familiar-classes.svg"><img src="https://cdn.jsdelivr.net/gh/kwy404/monsoon@main/assets/icons/light/familiar-classes.svg" width="32" alt="Pill icon: CSS components with readable class names"></picture><br><b>167 components</b><br>Forms, overlays, data display, media, two factor and sign in. 122 need no script.</td>
    <td width="33%" valign="top"><picture><source media="(prefers-color-scheme: dark)" srcset="https://cdn.jsdelivr.net/gh/kwy404/monsoon@main/assets/icons/dark/tiny-size.svg"><img src="https://cdn.jsdelivr.net/gh/kwy404/monsoon@main/assets/icons/light/tiny-size.svg" width="32" alt="Compress icon: small utility css for production"></picture><br><b>About 88 kB brotli</b><br>Every utility and component in one cached request.</td>
  </tr>
  <tr>
    <td width="33%" valign="top"><picture><source media="(prefers-color-scheme: dark)" srcset="https://cdn.jsdelivr.net/gh/kwy404/monsoon@main/assets/icons/dark/purge.svg"><img src="https://cdn.jsdelivr.net/gh/kwy404/monsoon@main/assets/icons/light/purge.svg" width="32" alt="Funnel icon: purge unused CSS"></picture><br><b>Arbitrary values, no build</b><br><code>w-[37px]</code> in the browser, or compiled by the purge CLI.</td>
    <td width="33%" valign="top"><picture><source media="(prefers-color-scheme: dark)" srcset="https://cdn.jsdelivr.net/gh/kwy404/monsoon@main/assets/icons/dark/framework-agnostic.svg"><img src="https://cdn.jsdelivr.net/gh/kwy404/monsoon@main/assets/icons/light/framework-agnostic.svg" width="32" alt="Shapes icon: CSS utilities for React, Vue, Angular, PHP, WordPress, Django and Rails"></picture><br><b>Any stack</b><br>17 install guides, from React and Vue to Django and WordPress.</td>
    <td width="33%" valign="top"><picture><source media="(prefers-color-scheme: dark)" srcset="https://cdn.jsdelivr.net/gh/kwy404/monsoon@main/assets/icons/dark/container-queries.svg"><img src="https://cdn.jsdelivr.net/gh/kwy404/monsoon@main/assets/icons/light/container-queries.svg" width="32" alt="Nested boxes icon: container queries utility classes"></picture><br><b>Container queries</b><br><code>@container</code> plus <code>@xs:</code> to <code>@xl:</code> variants.</td>
  </tr>
</table>

## Table of contents

- [Quick start](#quick-start)
- [Why Monsoon](#why-monsoon)
- [Install with npm, pnpm, yarn or bun](#install-with-npm-pnpm-yarn-or-bun)
- [Use with React, Vue, Angular and more](#use-with-react-vue-angular-and-more)
- [Components](#components)
- [Interactive layer](#interactive-layer)
- [Arbitrary values](#arbitrary-values)
- [Two factor and sign in components](#two-factor-and-sign-in-components)
- [Generate a theme from one color](#generate-a-theme-from-one-color)
- [Dark mode with one line of CSS](#dark-mode-with-one-line-of-css)
- [Variants and container queries](#variants-and-container-queries)
- [Fluid type and spacing](#fluid-type-and-spacing)
- [Purge CLI: ship only the classes you use](#purge-cli-ship-only-the-classes-you-use)
- [Class reference by category](#class-reference-by-category)
- [Showcase](#showcase)
- [Browser support](#browser-support)
- [What is not included](#what-is-not-included)
- [FAQ](#faq)
- [Guides](#guides)
- [More from kwy404](#more-from-kwy404)
- [Author](#author)
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
    <div class="card">
      <div class="card-body space-y-4">
        <h1 class="text-2xl font-bold">Hello, Monsoon</h1>
        <p class="text-muted-foreground">One stylesheet. No build step.</p>
        <button class="btn btn-primary">Get started</button>
      </div>
    </div>
  </main>
</body>
</html>
```

For production, pin the version so the files never change under you:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/monsooncss@0.2.0/dist/monsoon.min.css">
<!-- optional: interactive components and arbitrary values -->
<script src="https://cdn.jsdelivr.net/npm/monsooncss@0.2.0/dist/monsoon.js" defer></script>
```

`https://unpkg.com/monsooncss` serves the same stylesheet.

## Why Monsoon

Twenty things Monsoon does that you would otherwise wire up yourself. Each one has a live demo on the [Why Monsoon page](https://kwy404.github.io/monsoon/why.html).

1. [**Zero build in production, from a CDN.**](https://kwy404.github.io/monsoon/why.html#reason-1) One stylesheet link is the whole install.
2. [**Arbitrary values without a build step.**](https://kwy404.github.io/monsoon/why.html#reason-2) `w-[37px]` and `bg-[#0ea5e9]` from a small script, or compiled by the purge CLI.
3. [**A whole theme from one `--seed` color.**](https://kwy404.github.io/monsoon/why.html#reason-3) Primary, accent, surfaces, borders and focus ring in pure CSS.
4. [**Accessible contrast, tested for every token pair.**](https://kwy404.github.io/monsoon/why.html#reason-4) At least 4.5:1 for any seed, in light and dark.
5. [**Per-section theming with `style="--seed"`.**](https://kwy404.github.io/monsoon/why.html#reason-5) Only that subtree re-themes.
6. [**Dark mode that follows the nearest themed ancestor.**](https://kwy404.github.io/monsoon/why.html#reason-6) Light inside dark inside light, at any depth.
7. [**167 components in the same file.**](https://kwy404.github.io/monsoon/why.html#reason-7) Forms, actions, navigation, overlays, data display, media and auth.
8. [**Components that need no JavaScript.**](https://kwy404.github.io/monsoon/why.html#reason-8) Dialogs, popovers, menus and accordions on native HTML.
9. [**An optional interactive layer.**](https://kwy404.github.io/monsoon/why.html#reason-9) File drop, cropping, date pickers, sortable lists and comboboxes on top of native inputs.
10. [**Container query variants built in.**](https://kwy404.github.io/monsoon/why.html#reason-10) `@sm:` to `@xl:` react to the container width.
11. [**Fluid type and spacing utilities.**](https://kwy404.github.io/monsoon/why.html#reason-11) `text-fluid-*` and `p-fluid-*` grow with the viewport.
12. [**Print, rtl, ltr and forced-colors variants.**](https://kwy404.github.io/monsoon/why.html#reason-12) One prefix each.
13. [**Zero config purge that compiles arbitrary values.**](https://kwy404.github.io/monsoon/why.html#reason-13) One command, no config file.
14. [**Works with any backend or framework.**](https://kwy404.github.io/monsoon/why.html#reason-14) Plain classes, with 17 install guides.
15. [**One shared token scale for every control.**](https://kwy404.github.io/monsoon/why.html#reason-15) Inputs, selects and buttons of one size line up.
16. [**An in-gamut OKLCH palette.**](https://kwy404.github.io/monsoon/why.html#reason-16) 22 hues on one lightness curve, capped to sRGB.
17. [**Accessible by default.**](https://kwy404.github.io/monsoon/why.html#reason-17) Visible focus rings, reduced motion and forced colors support.
18. [**Utilities always override components.**](https://kwy404.github.io/monsoon/why.html#reason-18) No `!important`, no specificity fights.
19. [**One cached file for every page and project.**](https://kwy404.github.io/monsoon/why.html#reason-19) The same URL is shared across sites.
20. [**A machine readable class index.**](https://kwy404.github.io/monsoon/why.html#reason-20) [`classes.json`](https://github.com/kwy404/monsoon/blob/main/scripts/classes.json) lists every class with its CSS and variants.

## Install with npm, pnpm, yarn or bun

```bash
npm install monsooncss
pnpm add monsooncss
yarn add monsooncss
bun add monsooncss
```

Import it the way your bundler imports CSS, or copy the file into your public folder:

```bash
cp node_modules/monsooncss/dist/monsoon.min.css public/monsoon.css
```

| Import | File | What it is |
| --- | --- | --- |
| `monsooncss` | `dist/monsoon.min.css` | The stylesheet: utilities, components and theme (default export). |
| `monsooncss/css` | `dist/monsoon.css` | The same stylesheet, readable. |
| `monsooncss/js` | `dist/monsoon.esm.js` | The interactive layer as an ES module. Call `start()` once. |
| `monsooncss/js/browser` | `dist/monsoon.js` | The interactive layer and arbitrary value engine, starts itself (global `Monsoon`). |
| `monsooncss/js/arbitrary` | `dist/monsoon-arbitrary.js` | Only the arbitrary value engine (global `MonsoonArbitrary`). |
| `monsooncss/arbitrary` | `src/arbitrary/index.mjs` | The arbitrary value parser, for tooling. |

## Use with React, Vue, Angular and more

Monsoon is plain CSS classes, so every framework uses it the same way: load the stylesheet once and write classes in your templates. Import `'monsooncss'` (it resolves to the minified file through the package `exports`), not a deep `dist/` path.

**React with Vite** (`src/main.jsx`):

```jsx
import 'monsooncss';
import './index.css';
```

**Next.js** (`app/layout.tsx`, the root layout):

```tsx
import 'monsooncss';
import './globals.css';
```

**Vue 3 with Vite** (`src/main.js`):

```js
import { createApp } from 'vue';
import 'monsooncss';
import App from './App.vue';

createApp(App).mount('#app');
```

**Nuxt** (`nuxt.config.ts`):

```ts
export default defineNuxtConfig({
  css: ['monsooncss'],
});
```

**Angular** (`angular.json`, or `@import 'monsooncss';` at the top of `src/styles.css`):

```json
"styles": [
  "node_modules/monsooncss/dist/monsoon.min.css",
  "src/styles.css"
]
```

**Svelte with Vite** (`src/main.js`):

```js
import 'monsooncss';
import './app.css';
```

For the interactive layer, call `start()` from `monsooncss/js` once in the browser, or add the CDN script tag. It watches the document, so components that your framework renders later are enhanced on their own and cleaned up when removed.

There are 17 step by step install guides: [HTML](https://kwy404.github.io/monsoon/docs/install-html.html), [React](https://kwy404.github.io/monsoon/docs/install-react.html), [Next.js](https://kwy404.github.io/monsoon/docs/install-nextjs.html), [Vue](https://kwy404.github.io/monsoon/docs/install-vue.html), [Nuxt](https://kwy404.github.io/monsoon/docs/install-nuxt.html), [Angular](https://kwy404.github.io/monsoon/docs/install-angular.html), [Svelte](https://kwy404.github.io/monsoon/docs/install-svelte.html), [SvelteKit](https://kwy404.github.io/monsoon/docs/install-sveltekit.html), [Astro](https://kwy404.github.io/monsoon/docs/install-astro.html), [Solid](https://kwy404.github.io/monsoon/docs/install-solid.html), [Remix](https://kwy404.github.io/monsoon/docs/install-remix.html), [Laravel](https://kwy404.github.io/monsoon/docs/install-laravel.html), [Django](https://kwy404.github.io/monsoon/docs/install-django.html), [Rails](https://kwy404.github.io/monsoon/docs/install-rails.html), [WordPress](https://kwy404.github.io/monsoon/docs/install-wordpress.html), [PHP](https://kwy404.github.io/monsoon/docs/install-php.html) and [Electron](https://kwy404.github.io/monsoon/docs/install-electron.html).

## Components

167 components ship in the same stylesheet as the utilities, with 1,142 component classes. They are built on native HTML (`<dialog>`, the `popover` attribute, `<details>`, `:has()`, `:user-invalid`), use only theme tokens, so they follow `--seed` and dark mode, and share one size scale from `-xs` to `-xl`. Components come before the utilities in the file, so `class="btn rounded-full"` just works.

```html
<button class="btn btn-primary">Save</button>
<button class="btn btn-outline btn-sm">Cancel</button>
<span class="badge badge-success">Active</span>
<input type="email" class="input" placeholder="you@example.com" aria-label="Email">
```

| Group | Components | Classes | Highlights |
| --- | ---: | ---: | --- |
| Forms | 26 | 165 | input, select, checkbox, toggle, range, one time code, floating label, password field, radio card |
| Actions and feedback | 26 | 284 | button, button group, copy button, segmented control, alert, toast, badge, progress, skeleton, tooltip |
| Navigation and overlays | 26 | 187 | drawer, modal, sheet, popover, dropdown, command palette, navbar, mega menu, tabs, pagination, steps |
| Data display and layout | 38 | 187 | card, avatar, table, timeline, stats, accordion, carousel, pricing, chat, mockups, prose, layout primitives |
| Media and files | 10 | 78 | dropzone, image cropper, avatar upload, image viewer, media gallery, before and after compare, signature pad |
| Interactive | 24 | 153 | date picker, combobox, tags input, sortable list, kanban board, color picker, data table, tree view, split panes |
| Two factor and sign in | 17 | 126 | verification code, authenticator setup, QR code, recovery codes, passkey, phone number, sign in layouts |

Browse every component with live light and dark previews and copyable markup at [kwy404.github.io/monsoon/components.html](https://kwy404.github.io/monsoon/components.html). The lists below mark the ones that need the [interactive layer](#interactive-layer).

<details>
<summary><b>Forms: 26 components</b></summary>

| Component | Base class | monsoon.js |
| --- | --- | :---: |
| [Input](https://kwy404.github.io/monsoon/components/input.html) | `.input` |  |
| [Date and time](https://kwy404.github.io/monsoon/components/date-time.html) | `.input` |  |
| [Textarea](https://kwy404.github.io/monsoon/components/textarea.html) | `.textarea` |  |
| [Select](https://kwy404.github.io/monsoon/components/select.html) | `.select` |  |
| [Multiple select](https://kwy404.github.io/monsoon/components/select-multiple.html) | `.select` |  |
| [Custom select](https://kwy404.github.io/monsoon/components/select-custom.html) | `.select-custom` |  |
| [Checkbox](https://kwy404.github.io/monsoon/components/checkbox.html) | `.checkbox` |  |
| [Radio](https://kwy404.github.io/monsoon/components/radio.html) | `.radio` |  |
| [Toggle](https://kwy404.github.io/monsoon/components/toggle.html) | `.toggle` |  |
| [Range](https://kwy404.github.io/monsoon/components/range.html) | `.range` |  |
| [File input](https://kwy404.github.io/monsoon/components/file-input.html) | `.file-input` |  |
| [Color input](https://kwy404.github.io/monsoon/components/color-input.html) | `.color-input` |  |
| [Rating](https://kwy404.github.io/monsoon/components/rating.html) | `.rating` |  |
| [One time code](https://kwy404.github.io/monsoon/components/otp.html) | `.otp` |  |
| [Field](https://kwy404.github.io/monsoon/components/field.html) | `.field` |  |
| [Fieldset](https://kwy404.github.io/monsoon/components/fieldset.html) | `.fieldset` |  |
| [Form layout](https://kwy404.github.io/monsoon/components/form-layout.html) | `.form` |  |
| [Form control](https://kwy404.github.io/monsoon/components/form-control.html) | `.form-control` |  |
| [Input group](https://kwy404.github.io/monsoon/components/input-group.html) | `.input-group` |  |
| [Floating label](https://kwy404.github.io/monsoon/components/floating-label.html) | `.floating-label` |  |
| [Search field](https://kwy404.github.io/monsoon/components/search-field.html) | `.search-field` |  |
| [Password field](https://kwy404.github.io/monsoon/components/password-field.html) | `.password-field` |  |
| [Checkbox card](https://kwy404.github.io/monsoon/components/checkbox-card.html) | `.checkbox-card` |  |
| [Radio card](https://kwy404.github.io/monsoon/components/radio-card.html) | `.radio-card` |  |
| [Switch group](https://kwy404.github.io/monsoon/components/switch-group.html) | `.switch-group` |  |
| [Input counter](https://kwy404.github.io/monsoon/components/input-counter.html) | `.input-counter` |  |

</details>

<details>
<summary><b>Actions and feedback: 26 components</b></summary>

| Component | Base class | monsoon.js |
| --- | --- | :---: |
| [Button](https://kwy404.github.io/monsoon/components/button.html) | `.btn` |  |
| [Button shapes](https://kwy404.github.io/monsoon/components/button-shapes.html) | `.btn-square` |  |
| [Button group](https://kwy404.github.io/monsoon/components/button-group.html) | `.btn-group` |  |
| [Floating action button](https://kwy404.github.io/monsoon/components/fab.html) | `.fab` |  |
| [Copy button](https://kwy404.github.io/monsoon/components/copy-button.html) | `.copy-btn` |  |
| [Segmented control](https://kwy404.github.io/monsoon/components/segmented.html) | `.segmented` |  |
| [Toggle group](https://kwy404.github.io/monsoon/components/toggle-group.html) | `.toggle-group` |  |
| [Swap](https://kwy404.github.io/monsoon/components/swap.html) | `.swap` |  |
| [Alert](https://kwy404.github.io/monsoon/components/alert.html) | `.alert` |  |
| [Callout](https://kwy404.github.io/monsoon/components/callout.html) | `.callout` |  |
| [Banner](https://kwy404.github.io/monsoon/components/banner.html) | `.banner` |  |
| [Toast](https://kwy404.github.io/monsoon/components/toast.html) | `.toast` |  |
| [Badge](https://kwy404.github.io/monsoon/components/badge.html) | `.badge` |  |
| [Chip](https://kwy404.github.io/monsoon/components/chip.html) | `.chip` |  |
| [Tag](https://kwy404.github.io/monsoon/components/tag.html) | `.tag` |  |
| [Keyboard key](https://kwy404.github.io/monsoon/components/kbd.html) | `.kbd` |  |
| [Spinner](https://kwy404.github.io/monsoon/components/spinner.html) | `.spinner` |  |
| [Progress](https://kwy404.github.io/monsoon/components/progress.html) | `.progress` |  |
| [Radial progress](https://kwy404.github.io/monsoon/components/radial-progress.html) | `.radial-progress` |  |
| [Meter](https://kwy404.github.io/monsoon/components/meter.html) | `.meter` |  |
| [Skeleton](https://kwy404.github.io/monsoon/components/skeleton.html) | `.skeleton` |  |
| [Tooltip](https://kwy404.github.io/monsoon/components/tooltip.html) | `.tooltip` |  |
| [Indicator](https://kwy404.github.io/monsoon/components/indicator.html) | `.indicator` |  |
| [Status](https://kwy404.github.io/monsoon/components/status.html) | `.status` |  |
| [Empty state](https://kwy404.github.io/monsoon/components/empty-state.html) | `.empty-state` |  |
| [Notification](https://kwy404.github.io/monsoon/components/notification.html) | `.notification` |  |

</details>

<details>
<summary><b>Navigation and overlays: 26 components</b></summary>

| Component | Base class | monsoon.js |
| --- | --- | :---: |
| [Drawer](https://kwy404.github.io/monsoon/components/drawer.html) | `.drawer` |  |
| [Drawer dialog](https://kwy404.github.io/monsoon/components/drawer-dialog.html) | `.drawer-dialog` |  |
| [Responsive drawer](https://kwy404.github.io/monsoon/components/drawer-responsive.html) | `.drawer-open-lg` |  |
| [Modal](https://kwy404.github.io/monsoon/components/modal.html) | `.modal` |  |
| [Sheet](https://kwy404.github.io/monsoon/components/sheet.html) | `.sheet` |  |
| [Popover](https://kwy404.github.io/monsoon/components/popover.html) | `.popover` |  |
| [Dropdown](https://kwy404.github.io/monsoon/components/dropdown.html) | `.dropdown` |  |
| [Menu](https://kwy404.github.io/monsoon/components/menu.html) | `.menu` |  |
| [Context menu](https://kwy404.github.io/monsoon/components/context-menu.html) | `.context-menu` |  |
| [Command palette](https://kwy404.github.io/monsoon/components/command-palette.html) | `.command-palette` |  |
| [Lightbox](https://kwy404.github.io/monsoon/components/lightbox.html) | `.lightbox` |  |
| [Navbar](https://kwy404.github.io/monsoon/components/navbar.html) | `.navbar` |  |
| [Mega menu](https://kwy404.github.io/monsoon/components/mega-menu.html) | `.mega-menu` |  |
| [Sidebar](https://kwy404.github.io/monsoon/components/sidebar.html) | `.sidebar` |  |
| [Tabs](https://kwy404.github.io/monsoon/components/tabs.html) | `.tabs` |  |
| [Breadcrumbs](https://kwy404.github.io/monsoon/components/breadcrumbs.html) | `.breadcrumbs` |  |
| [Pagination](https://kwy404.github.io/monsoon/components/pagination.html) | `.pagination` |  |
| [Steps](https://kwy404.github.io/monsoon/components/steps.html) | `.steps` |  |
| [Stepper](https://kwy404.github.io/monsoon/components/stepper.html) | `.stepper` |  |
| [Dock](https://kwy404.github.io/monsoon/components/dock.html) | `.dock` |  |
| [Link](https://kwy404.github.io/monsoon/components/link.html) | `.link` |  |
| [Table of contents](https://kwy404.github.io/monsoon/components/toc.html) | `.toc` |  |
| [Scroll spy](https://kwy404.github.io/monsoon/components/scroll-spy.html) | `.scroll-spy` |  |
| [Back to top](https://kwy404.github.io/monsoon/components/back-to-top.html) | `.back-to-top` |  |
| [Skip link](https://kwy404.github.io/monsoon/components/skip-link.html) | `.skip-link` |  |
| [Footer](https://kwy404.github.io/monsoon/components/footer.html) | `.footer` |  |

</details>

<details>
<summary><b>Data display and layout: 38 components</b></summary>

| Component | Base class | monsoon.js |
| --- | --- | :---: |
| [Card](https://kwy404.github.io/monsoon/components/card.html) | `.card` |  |
| [Card overlay](https://kwy404.github.io/monsoon/components/card-overlay.html) | `.card-overlay` |  |
| [Card side](https://kwy404.github.io/monsoon/components/card-side.html) | `.card-side` |  |
| [Avatar](https://kwy404.github.io/monsoon/components/avatar.html) | `.avatar` |  |
| [Avatar group](https://kwy404.github.io/monsoon/components/avatar-group.html) | `.avatar-group` |  |
| [List](https://kwy404.github.io/monsoon/components/list.html) | `.list` |  |
| [Table](https://kwy404.github.io/monsoon/components/table.html) | `.table` |  |
| [Timeline](https://kwy404.github.io/monsoon/components/timeline.html) | `.timeline` |  |
| [Stats](https://kwy404.github.io/monsoon/components/stats.html) | `.stats` |  |
| [Collapse](https://kwy404.github.io/monsoon/components/collapse.html) | `.collapse` |  |
| [Accordion](https://kwy404.github.io/monsoon/components/accordion.html) | `.accordion` |  |
| [Carousel](https://kwy404.github.io/monsoon/components/carousel.html) | `.carousel` |  |
| [Rating display](https://kwy404.github.io/monsoon/components/rating-display.html) | `.rating-display` |  |
| [Divider](https://kwy404.github.io/monsoon/components/divider.html) | `.divider` |  |
| [Hero](https://kwy404.github.io/monsoon/components/hero.html) | `.hero` |  |
| [Feature grid](https://kwy404.github.io/monsoon/components/feature-grid.html) | `.feature-grid` |  |
| [Pricing](https://kwy404.github.io/monsoon/components/pricing.html) | `.pricing` |  |
| [Testimonial](https://kwy404.github.io/monsoon/components/testimonial.html) | `.testimonial` |  |
| [Chat](https://kwy404.github.io/monsoon/components/chat.html) | `.chat` |  |
| [Mockup browser](https://kwy404.github.io/monsoon/components/mockup-browser.html) | `.mockup-browser` |  |
| [Mockup window](https://kwy404.github.io/monsoon/components/mockup-window.html) | `.mockup-window` |  |
| [Mockup phone](https://kwy404.github.io/monsoon/components/mockup-phone.html) | `.mockup-phone` |  |
| [Mockup code](https://kwy404.github.io/monsoon/components/mockup-code.html) | `.mockup-code` |  |
| [Code block](https://kwy404.github.io/monsoon/components/code-block.html) | `.code-block` |  |
| [Countdown](https://kwy404.github.io/monsoon/components/countdown.html) | `.countdown` |  |
| [Diff](https://kwy404.github.io/monsoon/components/diff.html) | `.diff` |  |
| [Masonry](https://kwy404.github.io/monsoon/components/masonry.html) | `.masonry` |  |
| [Mask](https://kwy404.github.io/monsoon/components/mask.html) | `.mask` |  |
| [Blockquote](https://kwy404.github.io/monsoon/components/blockquote.html) | `.blockquote` |  |
| [Prose](https://kwy404.github.io/monsoon/components/prose.html) | `.prose` |  |
| [Stack](https://kwy404.github.io/monsoon/components/stack.html) | `.stack` |  |
| [Artboard](https://kwy404.github.io/monsoon/components/artboard.html) | `.artboard` |  |
| [Container narrow](https://kwy404.github.io/monsoon/components/container-narrow.html) | `.container-narrow` |  |
| [Section](https://kwy404.github.io/monsoon/components/section.html) | `.section` |  |
| [Grid auto](https://kwy404.github.io/monsoon/components/grid-auto.html) | `.grid-auto` |  |
| [Center](https://kwy404.github.io/monsoon/components/center.html) | `.center` |  |
| [Cluster](https://kwy404.github.io/monsoon/components/cluster.html) | `.cluster` |  |
| [Sidebar layout](https://kwy404.github.io/monsoon/components/sidebar-layout.html) | `.sidebar-layout` |  |

</details>

<details>
<summary><b>Media and files: 10 components</b></summary>

| Component | Base class | monsoon.js |
| --- | --- | :---: |
| [Dropzone](https://kwy404.github.io/monsoon/components/dropzone.html) | `.dropzone` | yes |
| [Dropzone compact](https://kwy404.github.io/monsoon/components/dropzone-compact.html) | `.dropzone-compact` | yes |
| [Image cropper](https://kwy404.github.io/monsoon/components/cropper.html) | `.cropper` | yes |
| [Avatar upload](https://kwy404.github.io/monsoon/components/avatar-upload.html) | `.avatar-upload` | yes |
| [Image viewer](https://kwy404.github.io/monsoon/components/image-viewer.html) | `.viewer` | yes |
| [Media gallery](https://kwy404.github.io/monsoon/components/media-gallery.html) | `.gallery` | yes |
| [Media gallery masonry](https://kwy404.github.io/monsoon/components/media-gallery-masonry.html) | `.gallery-masonry` | yes |
| [Before and after compare](https://kwy404.github.io/monsoon/components/compare.html) | `.compare` | yes |
| [Compare vertical](https://kwy404.github.io/monsoon/components/compare-vertical.html) | `.compare-vertical` | yes |
| [Signature pad](https://kwy404.github.io/monsoon/components/signature.html) | `.signature` | yes |

</details>

<details>
<summary><b>Interactive: 24 components</b></summary>

| Component | Base class | monsoon.js |
| --- | --- | :---: |
| [Date picker](https://kwy404.github.io/monsoon/components/datepicker.html) | `.datepicker` | yes |
| [Date range picker](https://kwy404.github.io/monsoon/components/datepicker-range.html) | `.datepicker` | yes |
| [Combobox](https://kwy404.github.io/monsoon/components/combobox.html) | `.combobox` | yes |
| [Multi select combobox](https://kwy404.github.io/monsoon/components/combobox-multiple.html) | `.combobox` | yes |
| [Select (custom)](https://kwy404.github.io/monsoon/components/select-menu.html) | `.select-menu` | yes |
| [Tags input](https://kwy404.github.io/monsoon/components/tags-input.html) | `.tags-input` | yes |
| [Sortable list](https://kwy404.github.io/monsoon/components/sortable.html) | `.sortable` | yes |
| [Kanban board](https://kwy404.github.io/monsoon/components/kanban.html) | `.kanban` | yes |
| [Dual range slider](https://kwy404.github.io/monsoon/components/range-dual.html) | `.range-dual` | yes |
| [Color picker](https://kwy404.github.io/monsoon/components/color-picker.html) | `.color-picker` | yes |
| [Data table](https://kwy404.github.io/monsoon/components/data-table.html) | `.data-table` | yes |
| [Tree view](https://kwy404.github.io/monsoon/components/tree.html) | `.tree` | yes |
| [Tree with checkboxes](https://kwy404.github.io/monsoon/components/tree-checkbox.html) | `.tree` | yes |
| [Split panes](https://kwy404.github.io/monsoon/components/splitter.html) | `.splitter` | yes |
| [Toast manager](https://kwy404.github.io/monsoon/components/toast-manager.html) | `.toast` | yes |
| [Password strength](https://kwy404.github.io/monsoon/components/password-strength.html) | `.password-field` | yes |
| [Number counter](https://kwy404.github.io/monsoon/components/number-counter.html) | `.input-counter` | yes |
| [Textarea autosize](https://kwy404.github.io/monsoon/components/textarea-autosize.html) | `.textarea` | yes |
| [Command search](https://kwy404.github.io/monsoon/components/command-search.html) | `.command-palette` | yes |
| [Infinite scroll](https://kwy404.github.io/monsoon/components/infinite-scroll.html) | `.infinite-scroll` | yes |
| [Countdown timer](https://kwy404.github.io/monsoon/components/countdown-timer.html) | `.countdown` | yes |
| [Paste an image](https://kwy404.github.io/monsoon/components/clipboard-image.html) | `.paste-zone` | yes |
| [Rating input](https://kwy404.github.io/monsoon/components/rating-input.html) | `.rating-input` | yes |
| [Autoplay carousel](https://kwy404.github.io/monsoon/components/carousel-autoplay.html) | `.carousel-auto` | yes |

</details>

<details>
<summary><b>Two factor and sign in: 17 components</b></summary>

| Component | Base class | monsoon.js |
| --- | --- | :---: |
| [Verification code](https://kwy404.github.io/monsoon/components/otp-cells.html) | `.otp` | yes |
| [Authenticator app setup](https://kwy404.github.io/monsoon/components/authenticator-setup.html) | `.auth-card` | yes |
| [QR code](https://kwy404.github.io/monsoon/components/qr-code.html) | `.qr` | yes |
| [Recovery codes](https://kwy404.github.io/monsoon/components/recovery-codes.html) | `.backup-codes` | yes |
| [Method picker](https://kwy404.github.io/monsoon/components/method-picker.html) | `.auth-methods` |  |
| [Verify screen](https://kwy404.github.io/monsoon/components/verify-code.html) | `.auth-card` | yes |
| [Push approval](https://kwy404.github.io/monsoon/components/push-approval.html) | `.auth-push` |  |
| [Security key and passkey](https://kwy404.github.io/monsoon/components/security-key.html) | `.auth-key` |  |
| [Phone number](https://kwy404.github.io/monsoon/components/phone-input.html) | `.phone-input` | yes |
| [Two factor status](https://kwy404.github.io/monsoon/components/two-factor-status.html) | `.auth-status` |  |
| [Sign in progress](https://kwy404.github.io/monsoon/components/sign-in-steps.html) | `.auth-flow` |  |
| [Magic link sent](https://kwy404.github.io/monsoon/components/magic-link.html) | `.auth-mail-visual` | yes |
| [Trusted devices](https://kwy404.github.io/monsoon/components/trusted-devices.html) | `.auth-devices` |  |
| [New password](https://kwy404.github.io/monsoon/components/new-password.html) | `.auth-strength` | yes |
| [Sign in, centered](https://kwy404.github.io/monsoon/components/sign-in-centered.html) | `.auth-layout` | yes |
| [Sign in, split](https://kwy404.github.io/monsoon/components/sign-in-split.html) | `.auth-split` | yes |
| [Sign in, compact](https://kwy404.github.io/monsoon/components/sign-in-compact.html) | `.auth-card-compact` | yes |

</details>

## Interactive layer

Almost every component is CSS on native HTML. A few cannot be finished in CSS alone, such as dropping files, cropping an image or reordering a list. `monsoon.js` is the optional script for those: 35 behaviors, about 54 kB with brotli, that enhance elements carrying `data-m-*` attributes. It also includes the [arbitrary value](#arbitrary-values) engine. Without the script those components still render with their full styling and fall back to their native controls.

**From a CDN.** It defines a global `Monsoon` and starts on its own:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/monsooncss">
<script src="https://cdn.jsdelivr.net/npm/monsooncss/dist/monsoon.js" defer></script>
```

**From npm.** Import the ES module and call `start()` once:

```js
import 'monsooncss';
import { start } from 'monsooncss/js';

start();
```

**Data attributes.** `data-m-<name>` switches a behavior on and `data-m-<name>-<option>` sets its options. Markup stays declarative, so it works in any template language. Elements added later are enhanced automatically through a `MutationObserver`, and their cleanup runs when they are removed.

```html
<button class="btn" data-m-copy="npm i monsooncss">Copy</button>
<div class="datepicker" data-m-datepicker><input type="date" class="input"></div>
<div class="qr" data-m-qr data-m-qr-value="https://example.com"></div>
```

**Events.** Components report what happened with bubbling, cancelable DOM events named `monsoon:<event>`, such as `monsoon:dropzone-change`, `monsoon:crop`, `monsoon:otp-complete`, `monsoon:table-sort`, `monsoon:tag-add` and `monsoon:sort`. Listen on the element or anywhere above it.

**API.** `start()`, `enhance(root?, names?)`, `destroy(root)`, `define(name, setup)` for your own behaviors, `emit(el, name, detail)` and `components()`. Components with state expose a getter on the global that takes an element or a selector, such as `Monsoon.dropzone(el)`, `Monsoon.cropper('#photo')` or `Monsoon.datepicker(el)`. The media getters (`dropzone`, `cropper`, `imageViewer`, `mediaGallery` and others) are also named exports of `monsooncss/js`.

**Dropzone with your own upload.** Drag and drop, paste, validation, previews, progress, retry and reorder, while the native input stays in sync so a plain form submit still sends the files. Cancel `monsoon:dropzone-upload` to upload each file yourself:

```html
<div class="dropzone" data-m-dropzone data-m-dropzone-max-size="10mb" data-m-dropzone-max-files="8">
  <label class="dropzone-area">
    <input type="file" name="attachments" multiple accept="image/*,.pdf">
    <span class="grid gap-1">
      <span class="dropzone-title">Drop files here or <span class="dropzone-browse">browse</span></span>
      <span class="dropzone-hint">Images and PDF up to 10 MB, 8 files at most.</span>
    </span>
  </label>
</div>

<script>
  document.addEventListener('monsoon:dropzone-upload', async (event) => {
    event.preventDefault(); // this page uploads the file itself
    const { file, done, error } = event.detail;
    const body = new FormData();
    body.append('file', file);
    try {
      const res = await fetch('/upload', { method: 'POST', body });
      if (res.ok) done(await res.json());
      else error(`Upload failed: ${res.status}`);
    } catch (e) {
      error(e.message);
    }
  });
</script>
```

**Image cropper.** Move and resize the crop box with handles or the keyboard, pick an aspect, zoom, rotate and flip, then export a canvas, Blob, data URL or File:

```html
<div class="cropper" id="photo" data-m-cropper data-m-cropper-aspect="1:1">
  <img src="/photo.jpg" alt="Profile photo">
</div>
<button class="btn btn-primary" id="save">Save</button>

<script>
  document.querySelector('#photo').addEventListener('monsoon:crop', (event) => {
    console.log(event.detail); // { x, y, width, height, rotate, flipX, flipY, zoom }
  });
  document.querySelector('#save').addEventListener('click', async () => {
    const file = await Monsoon.cropper('#photo').toFile('avatar.webp', 'image/webp', 0.9);
    // send file with fetch, or put it back into a form
  });
</script>
```

Read more on the [interactive layer page](https://kwy404.github.io/monsoon/docs/interactive-layer.html).

## Arbitrary values

When a scale has no step that fits, write the value itself. Monsoon supports arbitrary values with no build step.

```html
<div class="grid grid-cols-[200px_1fr] gap-3">
  <aside class="w-[37px] rounded-[14px] bg-[#0ea5e9]"></aside>
  <main class="h-[calc(100vh-4rem)] bg-[oklch(0.72_0.16_150)] text-[13px] font-[650]">...</main>
</div>
<p class="hover:bg-[#0369a1] md:w-[37rem] dark:text-[#eee] before:content-['#']">...</p>
```

| You write | You get |
| --- | --- |
| `w-[37px]` | `width: 37px` |
| `p-[3px_7px]` | `padding: 3px 7px` (an underscore is a space, `\_` is an underscore) |
| `h-[calc(100vh-4rem)]` | `height: calc(100vh - 4rem)` |
| `bg-(--brand)` | `background-color: var(--brand)` |
| `[mask-type:luminance]` | `mask-type: luminance` (any property) |
| `bg-[red]/50` | the color at 50% opacity |
| `-mt-[3px]` | `margin-top: -3px` |
| `text-[length:var(--size)]` | `font-size: var(--size)` (a type hint for ambiguous values) |

Every variant works on them and they can be stacked (`md:hover:underline-offset-[6px]`), plus `before:`, `after:`, `placeholder:`, `selection:`, `file:` and more.

**Runtime or compiled.** Both modes use the same parser, so a class means the same thing in development and in production.

- **Runtime:** load `dist/monsoon.js`, or only the engine with `dist/monsoon-arbitrary.js` (about 6 kB brotli). It reads class attributes on load and watches for new elements and class changes, compiles each new class once, and writes the rules into one constructed stylesheet in the order of the static stylesheet. Classes without brackets cost nothing.
- **Compiled:** `npx monsooncss purge "src/**/*.{html,jsx,vue,php}" -o public/monsoon.css` finds every arbitrary class in your files and writes static rules for it, so production needs no script.

```html
<script src="https://cdn.jsdelivr.net/npm/monsooncss/dist/monsoon-arbitrary.js" defer></script>
```

**Safety.** Class attributes can come from user content, so a value is ignored, and nothing is written, when it contains `;`, `{`, `}`, `@`, `!`, `<` or `>`, a backslash escape other than `\_`, a comment, a control character, `expression(` or `javascript:`, has unbalanced brackets or quotes, or is longer than 300 characters. Selectors are escaped like `CSS.escape`, and the test suite feeds the parser a list of injection attempts.

**Bare color names.** Every palette hue also works without a step, as static classes with no script: `bg-red`, `text-blue`, `border-emerald`, `ring-violet`, `from-sky`. They use step 500 in light mode and 400 in dark mode.

See the full syntax and every supported prefix on the [arbitrary values page](https://kwy404.github.io/monsoon/docs/arbitrary-values.html).

## Two factor and sign in components

A group of 17 components for authentication screens, in light and dark, reduced motion and forced colors aware: verification code cells, authenticator app setup with a QR code drawn in the browser, recovery codes, a method picker, a verify screen, push approval with number matching, a security key and passkey prompt, a phone number field with a country picker, a two factor status card, sign in progress, magic link sent, trusted devices, a new password form with a strength meter, and centered, split and compact sign in layouts.

```html
<form class="auth-card">
  <header class="auth-header">
    <h2 class="auth-title">Enter the code we texted you</h2>
    <p class="auth-description">We sent a 6 digit code to your phone.</p>
  </header>
  <div class="otp mx-auto" data-m-otp data-m-otp-separator="3" data-m-otp-autosubmit>
    <input class="otp-field" name="code" maxlength="6" inputmode="numeric" autocomplete="one-time-code" aria-label="Verification code">
  </div>
  <button class="btn btn-primary btn-block">Verify</button>
  <button type="button" class="link link-primary" data-m-auth-resend data-m-auth-resend-seconds="30">Resend code</button>
</form>
```

Without a script, `.otp-field` is one native input, so typing, paste and SMS autofill work. With `monsoon.js` these attributes add behavior:

| Attribute | Behavior |
| --- | --- |
| `data-m-otp` | 4 to 8 code cells with auto advance, paste and autofill from any cell, error and success states, `monsoon:otp-complete` |
| `data-m-qr` | A QR code as SVG with no dependency (byte mode, level M, enough for any `otpauth://` URI) |
| `data-m-auth-resend` | A resend link with a countdown |
| `data-m-auth-phone` | Country search with flags, formatting as you type and a hidden E.164 field |
| `data-m-auth-password` | Password rules, a strength score and a reveal button |
| `data-m-auth-codes` | Copy, download as .txt and print recovery codes, confirm before continuing |

All examples use placeholder data. See them under [Two factor and sign in](https://kwy404.github.io/monsoon/components.html) in the components gallery, for example the [verify screen](https://kwy404.github.io/monsoon/components/verify-code.html) and the [split sign in](https://kwy404.github.io/monsoon/components/sign-in-split.html).

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

Every token is a utility (`bg-primary`, `text-muted-foreground`, `border-border`, `ring-ring`) and a custom property (`var(--primary)`), and every component reads them. Theme one section by putting the seed on it:

```html
<section style="--seed: teal" class="rounded-2xl bg-surface p-8 space-y-3">
  <h2 class="text-2xl font-bold text-primary">Teal section</h2>
  <button class="btn btn-primary">Primary</button>
  <button class="rounded-lg bg-accent text-accent-foreground px-4 py-2">Accent</button>
</section>
```

**Accessible color contrast is built into the formulas.** The primary color never sits between OKLCH lightness 0.52 and 0.66, and its foreground flips between white and near black on the same threshold. The test suite checks 4.5:1 (WCAG AA) for 13 token pairs across 18 named seeds and a sweep of 2,197 sRGB seeds, in light and dark mode. Try any color in the [seed playground](https://kwy404.github.io/monsoon/playground.html).

Monsoon also ships its own 22 hue OKLCH palette, `slate` to `rose`, steps `50` to `950`, as `--color-{hue}-{step}` custom properties and as utilities such as `bg-emerald-100` and `text-rose-600`. Without a step, `bg-red` or `text-blue` picks step 500 in light mode and 400 in dark mode.

## Dark mode with one line of CSS

Dark mode is automatic through `prefers-color-scheme`. Semantic colors switch on their own, so most pages need no extra classes. Force a scheme on the page or on any section:

```html
<html data-theme="dark">
<!-- or class="dark", class="light", data-theme="light" -->

<aside class="dark rounded-2xl p-6">
  <p class="text-muted-foreground">This section is always dark.</p>
  <div class="light rounded-xl p-4">And this card inside it is always light.</div>
</aside>
```

The nearest themed ancestor wins, at any depth, for the tokens and for the `dark:` variant alike. A themed section switches `color-scheme` and paints its own text and background, so it never shows dark text on a dark backdrop. For fixed palette colors there is a `dark:` variant: `bg-slate-100 dark:bg-slate-800`.

## Variants and container queries

```html
<button class="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-2 active:scale-95 disabled:opacity-50">
  Save
</button>

<div class="grid grid-cols-1 md:grid-cols-3 gap-6">...</div>

<div class="@container">
  <div class="flex flex-col @md:flex-row gap-4">...</div>
</div>

<nav class="print:hidden">...</nav>
<span class="ml-4 rtl:ml-0 rtl:mr-4">Badge</span>
<div class="border-0 forced-colors:border">...</div>
```

| Variants | Values |
| --- | --- |
| State | `hover:` `focus:` `focus-within:` `focus-visible:` `active:` `disabled:` `group-hover:` `peer-checked:` |
| Structure | `first:` `last:` `odd:` `even:` |
| Scheme and motion | `dark:` `motion-safe:` `motion-reduce:` |
| Breakpoints (min-width) | `sm:` 640px, `md:` 768px, `lg:` 1024px, `xl:` 1280px, `2xl:` 1536px |
| Container queries | `@xs:` 20rem, `@sm:` 24rem, `@md:` 28rem, `@lg:` 32rem, `@xl:` 36rem (inside an `@container` parent) |
| Media | `print:` `screen:` (on the breakpoint set, `print:hidden` beats `md:block`) |
| Direction | `rtl:` `ltr:` (utilities that name a physical side, following the nearest `dir` attribute) |
| High contrast | `forced-colors:` (display, borders, outlines, underlines, `forced-color-adjust`) |

Variants are applied to a curated set of utilities to keep the file small: `hover:` for colors, opacity, shadows and transforms; breakpoints for layout, spacing, sizing and text; `dark:` for palette colors. Arbitrary value classes take every variant. The [class reference](https://kwy404.github.io/monsoon/classes.html) shows the variants of every class.

## Fluid type and spacing

Fluid utilities grow smoothly with the viewport between 360px and 1280px through `clamp()` of rem plus vw, so they keep following the user's font size and need no breakpoint classes.

```html
<section class="p-fluid-lg">
  <h1 class="text-fluid-4xl font-bold">Fluid heading</h1>
  <p class="text-fluid-base text-muted-foreground">Resize the window to watch it grow.</p>
</section>
```

| Utilities | Steps |
| --- | --- |
| `text-fluid-*` | `sm`, `base`, `lg`, `xl`, `2xl` to `6xl` |
| `p-fluid-*`, `px-fluid-*`, `py-fluid-*`, `m-fluid-*`, `gap-fluid-*` | `xs`, `sm`, `md`, `lg`, `xl`, `2xl`, `3xl` |

See the [fluid utilities page](https://kwy404.github.io/monsoon/utilities/fluid.html).

## Purge CLI: ship only the classes you use

The full file is fine for most sites. To ship less, scan your files once and write a stylesheet with only the utilities they use, plus the reset, theme tokens, keyframes and the component layer. Arbitrary value classes found in your files are compiled into static rules at the same time.

```bash
npx monsooncss purge "src/**/*.html" -o public/monsoon.css
npx monsooncss purge "templates/**/*.html" "app/**/*.{php,erb,js}" --safelist bg-success,bg-danger -o static/monsoon.css
npx monsooncss classes --filter grid-cols
```

| Option | Meaning |
| --- | --- |
| `-o, --out <file>` | Output file. Without it the CSS goes to stdout. |
| `--safelist a,b,c` | Classes to keep even if no file mentions them (for class names built at runtime). Arbitrary classes work too. |
| `--no-arbitrary` | Do not compile arbitrary value classes. |
| `--no-minify` | Readable output. |
| `--css <file>` | Purge another copy of the stylesheet. |
| `classes --json`, `--filter <text>` | List every class, as JSON or filtered. |

On the repository's kitchen sink demo the purged file is about 39 kB with brotli, against 88 kB for the full build. Most of what remains is the component layer, which purge keeps whole.

## Class reference by category

| Category | Classes | Examples |
| --- | ---: | --- |
| colors | 2,248 | `text-foreground`, `bg-primary/90`, `border-slate-200`, `bg-red`, `ring-ring` |
| spacing | 796 | `p-4`, `px-6`, `mt-8`, `-mx-2`, `gap-3`, `space-y-4`, `p-fluid-md` |
| layout | 388 | `flex`, `grid`, `hidden`, `relative`, `inset-0`, `z-50`, `@container` |
| backgrounds | 367 | `bg-gradient-to-br`, `from-primary`, `to-accent`, `from-sky`, `bg-cover` |
| sizing | 268 | `w-full`, `max-w-3xl`, `size-10`, `h-screen`, `min-h-dvh` |
| borders | 193 | `border`, `rounded-xl`, `divide-y`, `ring-2`, `outline-none` |
| transforms | 143 | `scale-95`, `rotate-3`, `-translate-y-1`, `origin-top` |
| typography | 140 | `text-lg`, `font-semibold`, `tracking-tight`, `truncate`, `text-fluid-2xl` |
| grid | 111 | `grid-cols-3`, `col-span-2`, `grid-flow-row`, `auto-rows-fr` |
| flexbox | 58 | `flex-col`, `flex-1`, `shrink-0`, `basis-1/2`, `order-first` |
| interactivity | 58 | `cursor-pointer`, `select-none`, `snap-x`, `accent-primary` |
| alignment | 55 | `items-center`, `justify-between`, `place-items-center` |
| effects | 34 | `shadow-lg`, `opacity-50`, `mix-blend-multiply` |
| transitions | 29 | `transition`, `duration-200`, `ease-out` |
| filters | 24 | `blur-sm`, `backdrop-blur-md`, `grayscale` |
| accessibility | 6 | `sr-only`, `focus-ring`, `touch-target`, `forced-color-adjust-none` |
| animation | 5 | `animate-spin`, `animate-pulse` |

That is 4,923 utilities and 10,237 variant classes. Search all of them with their CSS at [kwy404.github.io/monsoon/classes.html](https://kwy404.github.io/monsoon/classes.html), or read [`scripts/classes.json`](https://github.com/kwy404/monsoon/blob/main/scripts/classes.json).

## Showcase

Three complete apps built only with Monsoon classes and components, each re-themed from one seed color and saved in localStorage.

<table>
  <tr>
    <td width="33%" valign="top"><a href="https://kwy404.github.io/monsoon/showcase/chat/"><img src="https://cdn.jsdelivr.net/gh/kwy404/monsoon@main/docs/showcase/chat/thumb.png" width="100%" alt="Harbor, a community chat app built with the Monsoon CSS framework"></a><br><b><a href="https://kwy404.github.io/monsoon/showcase/chat/">Harbor</a></b>, a community chat<br>Servers and channels, replies, reactions, edit and delete, member list and an accent color setting.</td>
    <td width="33%" valign="top"><a href="https://kwy404.github.io/monsoon/showcase/board/"><img src="https://cdn.jsdelivr.net/gh/kwy404/monsoon@main/docs/showcase/board/thumb.png" width="100%" alt="Stack, a kanban board built with the Monsoon CSS framework"></a><br><b><a href="https://kwy404.github.io/monsoon/showcase/board/">Stack</a></b>, a kanban board<br>Drag cards between lists, labels, checklists, due dates, comments, filters and a board color.</td>
    <td width="33%" valign="top"><a href="https://kwy404.github.io/monsoon/showcase/calendar/"><img src="https://cdn.jsdelivr.net/gh/kwy404/monsoon@main/docs/showcase/calendar/thumb.png" width="100%" alt="Tidal, a calendar app built with the Monsoon CSS framework"></a><br><b><a href="https://kwy404.github.io/monsoon/showcase/calendar/">Tidal</a></b>, a calendar<br>Day, week, month and agenda views, overlapping events, a live time line and drag to move.</td>
  </tr>
</table>

More whole pages (dashboard, pricing, SaaS landing, blog article, product page, portfolio and sign in) are in the [showcase](https://kwy404.github.io/monsoon/showcase.html).

## Browser support

Monsoon targets current versions of Chrome, Edge, Firefox and Safari. Seed theming uses OKLCH relative color syntax (`oklch(from var(--seed) l c h)`), which needs Chrome and Edge 119 or newer, Firefox 128 or newer and Safari 18 or newer. Container query variants need container query support, available in all current browsers. The `dark:` variant uses `@scope` where it exists for an exact nearest ancestor rule, with a selector fallback elsewhere.

**Fallback for relative color syntax.** Inside `@supports not (color: oklch(from red l c h))`, the stylesheet ships static tokens computed from the default seed. `primary` and `ring` use your `--seed` directly, tokens that only depend on the color scheme still switch between light and dark, and the page stays readable.

## What is not included

- Stacked static variants such as `dark:hover:` or `md:hover:` on the prebuilt classes. Arbitrary value classes can stack them: `md:hover:bg-[#0369a1]`.
- The important modifier.
- Opacity modifiers on palette steps (`bg-emerald-500/50`). `bg-primary/90` and `bg-black/50` exist for semantic colors, black and white, and any color takes one as an arbitrary value: `bg-[red]/50`.

Use an arbitrary value, the nearest step of a scale, a `style` attribute, or a few lines of your own CSS with the theme variables.

## FAQ

### How do I use utility-first CSS without a build step?

Add `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/monsooncss">` and write classes in your HTML. Every class is predeclared, so nothing has to scan your files or generate CSS.

### Is a utility CSS file from a CDN fine for production?

Yes. Pin the version, and the file (about 88 kB brotli with every utility and component) is cached after the first visit. Add subresource integrity if your policy asks for it, or self host. If every kilobyte counts, run `npx monsooncss purge` once.

### Does Monsoon support arbitrary values like `w-[37px]` without a build?

Yes. `dist/monsoon.js` or the 6 kB `dist/monsoon-arbitrary.js` writes them in the browser, and `npx monsooncss purge` compiles them into static CSS for production.

### Does Monsoon include components?

Yes, 167 of them in the same stylesheet: forms, buttons, alerts, modals, drawers, menus, tabs, tables, cards, a dropzone, an image cropper, date pickers, a data table, two factor and sign in screens and more.

### Does Monsoon need JavaScript?

The stylesheet does not: utilities, theming, dark mode and 122 of the 167 components are pure CSS. The optional `monsoon.js` adds behavior to the other 45 (file drop, cropping, date pickers, sortable lists, code cells) and writes arbitrary values.

### How do I generate a theme from one color in CSS?

Set `--seed` on `:root` or on any element with `style="--seed: ..."`. Primary, secondary, accent, surfaces, muted text, borders and the focus ring are derived from it with OKLCH relative colors.

### How do I add dark mode with one line of CSS?

It is already on through `prefers-color-scheme`. To force it, add `class="dark"` or `data-theme="dark"` to the html element or to any section. The nearest themed ancestor wins.

### Does Monsoon keep accessible color contrast for any brand color?

Yes for the semantic token pairs. Primary is moved out of the unsafe lightness band and its foreground flips to stay at 4.5:1 or better, which the test suite checks in both modes.

### Does Monsoon support container queries with utility classes?

Yes. Put `@container` on a parent and use `@xs:` to `@xl:` on its children, for example `@md:flex-row`.

### Can I use Monsoon with React, Vue, Angular, PHP, WordPress, Django or Rails?

Yes. Import or link the stylesheet once and write classes in your components or templates. There are [17 install guides](#use-with-react-vue-angular-and-more), and the purge command reads any text file, such as `"templates/**/*.html"` or `"app/views/**/*.erb"`.

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
- [Arbitrary values without a build step](https://kwy404.github.io/monsoon/docs/arbitrary-values.html)
- [The optional interactive layer](https://kwy404.github.io/monsoon/docs/interactive-layer.html)

## More from kwy404

- [graphemely](https://kwy404.github.io/graphemely/): truncate, slice and count strings with emoji safely.
- [edgegoat](https://kwy404.github.io/edgegoat/): edge case test inputs for time zones, DST, unicode and numbers.
- [vueleap](https://kwy404.github.io/vueleap/): migrate Vue 2 to Vue 3 with one command.
- [numberparrot](https://kwy404.github.io/numberparrot/): parse localized number and currency strings back into numbers.
- [breakhound](https://kwy404.github.io/breakhound/): find bugs in any JavaScript library automatically, no tests needed.
- [Voodoo.js](https://github.com/kwy404/Voodoo.js): JSX and reactivity from a plain HTML file, used for the interactive parts of the Monsoon site.

## Contributing

Issues and pull requests are welcome. [CONTRIBUTING.md](https://github.com/kwy404/monsoon/blob/main/CONTRIBUTING.md) explains the generator, how to add a utility and how variants are assigned, and [`src/components/CONVENTIONS.md`](https://github.com/kwy404/monsoon/blob/main/src/components/CONVENTIONS.md) covers components. Changes are listed in the [CHANGELOG](https://github.com/kwy404/monsoon/blob/main/CHANGELOG.md).

## Author

Created by **Alexandre Kohler** ([GitHub](https://github.com/kwy404) and [LinkedIn](https://www.linkedin.com/in/alexandre-silva-173687256/)).

## License

[MIT](https://github.com/kwy404/monsoon/blob/main/LICENSE). Copyright 2026 Alexandre Kohler ([kwy404](https://github.com/kwy404))
