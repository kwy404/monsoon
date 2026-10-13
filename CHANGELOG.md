# Changelog

All notable changes to this project are documented in this file.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses [Semantic Versioning](https://semver.org/).

## [0.2.0] - 2026-10-13

Components, an optional script layer and arbitrary values, still with no build step.

### Added

- A component layer in the same stylesheet: 167 components and 1,142 component classes in seven groups, loaded from `src/components/*.css` with a JSON manifest per group (`src/components/*.json`) that the docs site reads. Components sit before the utilities, so a utility on a component always wins. 122 of them need no JavaScript.
  - Forms (26): input, textarea, select, checkbox, radio, toggle, range, file and color inputs, rating, one time code, field, fieldset, floating label, input group, search and password fields, checkbox and radio cards, switch group, input counter.
  - Actions and feedback (26): button, button group, floating action button, copy button, segmented control, toggle group, swap, alert, callout, banner, toast, badge, chip, tag, keyboard key, spinner, progress, radial progress, meter, skeleton, tooltip, indicator, status, empty state, notification.
  - Navigation and overlays (26): drawer, modal, sheet, popover, dropdown, menu, context menu, command palette, lightbox, navbar, mega menu, sidebar, tabs, breadcrumbs, pagination, steps, stepper, dock, table of contents, scroll spy, back to top, skip link, footer.
  - Data display and layout (38): card, avatar and avatar group, list, table, timeline, stats, collapse, accordion, carousel, hero, feature grid, pricing, testimonial, chat, browser, window, phone and code mockups, code block, countdown, diff, masonry, mask, blockquote, prose and layout primitives (stack, section, center, cluster, grid auto, sidebar layout).
  - Media and files (10): dropzone, image cropper, avatar upload, image viewer, media gallery (grid and masonry), before and after compare, signature pad.
  - Interactive (24): date and date range picker, combobox and multi select combobox, custom select, tags input, sortable list, kanban board, dual range slider, color picker, data table, tree view, split panes, toast manager, password strength, number counter, textarea autosize, command search, infinite scroll, countdown timer, paste an image, rating input, autoplay carousel.
  - Two factor and sign in (17): verification code cells, authenticator app setup, QR code, recovery codes, method picker, verify screen, push approval with number matching, security key and passkey, phone number with a country picker, two factor status, sign in progress, magic link sent, trusted devices, new password with a strength meter, and centered, split and compact sign in layouts.
- Shared component tokens in `src/base.mjs` (`--m-radius-*`, `--m-control-h-*`, `--m-control-fs-*`, `--m-control-px-*`, `--m-ring`, `--m-shadow-*`, `--m-duration*`, `--m-ease*`, `--m-disabled-opacity`), so controls of one size line up in a row and every focus ring, shadow and transition matches. Component tones read `--tone` and `--tone-fg`.
- An optional interactive layer for the components CSS cannot finish alone. `dist/monsoon.js` (global `Monsoon`, starts itself) and `dist/monsoon.esm.js` (`import { start } from 'monsooncss/js'`) enhance elements with `data-m-*` attributes, on load and when markup is added later through a `MutationObserver`, and run cleanups when elements are removed. 35 behaviors, options as `data-m-<name>-<option>` attributes, bubbling and cancelable `monsoon:<event>` events, and a small API: `start`, `enhance`, `destroy`, `define`, `emit`, `components`, plus instance getters such as `Monsoon.dropzone(el)` and `Monsoon.cropper(el).toBlob()`. Every enhanced component falls back to its native control without the script, and the script never injects styles.
- Arbitrary values with no build step: `w-[37px]`, `bg-[#0ea5e9]`, `h-[calc(100vh-4rem)]`, `grid-cols-[200px_1fr]`, `bg-(--brand)`, `[mask-type:luminance]`, `bg-[red]/50`, `-mt-[3px]` and `content-['x']`, with type hints such as `text-[length:var(--size)]`. Every static variant works on them, stacked (`md:hover:underline-offset-[6px]`), plus `before:`, `after:`, `placeholder:`, `selection:`, `marker:`, `file:`, `backdrop:`, `first-line:`, `first-letter:`, `visited:`, `checked:`, `invalid:`, `required:`, `empty:`, `target:`, `open:`, `group-focus:` and `peer-focus:`.
  - `src/arbitrary/`: one parser and generator shared by the runtime and the CLI, also exported as `monsooncss/arbitrary`. Values that could leave their declaration are rejected (`;`, `{`, `}`, `@`, `!`, `<`, `>`, escapes other than `\_`, comments, control characters, `expression(`, `javascript:`, unbalanced brackets or quotes, more than 300 characters).
  - The runtime engine ships inside `dist/monsoon.js` as `Monsoon.arbitrary` and alone as `dist/monsoon-arbitrary.js` (global `MonsoonArbitrary`, about 6 kB brotli). It writes rules into one constructed stylesheet in the order of the static stylesheet.
  - `monsooncss purge` compiles every arbitrary value class it finds into static rules after the utilities, so production can drop the script. `--no-arbitrary` turns it off and `--safelist` accepts arbitrary classes.
- Bare color shorthand: `bg-red`, `text-blue`, `border-emerald`, `ring-violet`, `from-sky` and the other color utilities without a step (text, bg, border, ring, outline, decoration, fill, stroke, shadow, from, via, to) for all 22 hues. They use step 500 in light mode and step 400 in dark mode and follow the nearest themed ancestor.
- Fluid utilities that grow with the viewport between 360px and 1280px through `clamp()` of rem plus vw, so they keep following the user's font size: `text-fluid-sm` to `text-fluid-6xl`, and `p-`, `px-`, `py-`, `m-` and `gap-fluid-xs` to `-3xl`.
- Variants `print:` and `screen:` (on the breakpoint set, display included), `rtl:` and `ltr:` (on utilities that name a physical side, following the nearest `dir` attribute) and `forced-colors:` (display, borders, outlines, underlines and `forced-color-adjust`).
- Package entry points `monsooncss/js` (ES module), `monsooncss/js/browser` (self starting script), `monsooncss/js/arbitrary` (engine only) and `monsooncss/arbitrary` (parser for tooling).
- Docs site rebuilt as a docs app with search: a page per component and per utility category, Arbitrary values, Interactive layer, Why Monsoon (20 differentiators) and 17 step by step install guides (HTML, React, Next.js, Vue, Nuxt, Angular, Svelte, SvelteKit, Astro, Solid, Remix, Laravel, Django, Rails, WordPress, PHP, Electron).
- Showcase apps built only with Monsoon: Harbor (community chat), Stack (kanban board) and Tidal (calendar).
- `scripts/showcase.mjs`, which renders every component in light and dark mode.

### Changed

- The full stylesheet now carries the component layer: 4,923 utilities, 10,237 variant classes and 1,142 component classes. `dist/monsoon.min.css` is about 88 kB with brotli (145 kB gzip), up from about 43 kB.
- `monsooncss purge` keeps the whole component layer next to the base reset, theme tokens and keyframes, and purges only the utilities.
- `skip-link` moved from the accessibility utilities to the Skip link navigation component. The class name is unchanged.
- `print:` rules come after the breakpoints, so `print:hidden` beats `md:block`.
- `npm run build` also builds the scripts (`scripts/build-js.mjs`).
- Every README image has a light and a dark version.

### Fixed

- Dark and light mode: the nearest themed ancestor wins at any depth, for the tokens and for the `dark:` variant alike, so a light card inside a dark section inside a light page renders light. Browsers with `@scope` get the exact rule at any depth, older ones a selector fallback that never paints a light element dark.
- A themed section (`.dark`, `.light`, `[data-theme=dark]` or `[data-theme=light]` on any element other than the root) switches `color-scheme` and paints its own text and background, so it never shows dark text on a dark backdrop. The rule has zero specificity, so component classes and `bg-*` or `text-*` utilities still win.

## [0.1.0] - 2026-10-13

First public release.

### Added

- `dist/monsoon.css` and `dist/monsoon.min.css`: a complete utility stylesheet that works from a CDN with no build step, no config and no JavaScript.
- Utilities for layout, flexbox, grid, spacing, sizing, typography, colors, backgrounds and gradients, borders, rings, outlines, shadows, opacity, filters, transitions, animations, transforms, interactivity and accessibility.
- A 22 hue OKLCH palette (steps 50 to 950) exposed as `--color-{hue}-{step}` custom properties.
- Seed theming: semantic tokens (`primary`, `secondary`, `accent`, `surface`, `muted`, `border`, `ring`, `success`, `warning`, `danger`, `info`, `foreground`, `background` and their foregrounds) derived from one `--seed` color with OKLCH relative color syntax. Foreground colors flip to keep WCAG AA contrast. Any element with `style="--seed: ..."` re-themes its subtree.
- Automatic dark mode through `prefers-color-scheme`, plus `.dark`, `.light` and `[data-theme]` overrides that also work on sections.
- Static fallback tokens for browsers without relative color syntax.
- Variants: `hover:`, `focus:`, `focus-within:`, `focus-visible:`, `active:`, `disabled:`, `group-hover:`, `peer-checked:`, `first:`, `last:`, `odd:`, `even:`, `dark:`, `motion-safe:`, `motion-reduce:`, responsive `sm:` to `2xl:` and container query `@xs:` to `@xl:`, applied to a curated set of utilities to keep the bundle small.
- Opacity modifiers such as `bg-primary/90` and `bg-black/50` for semantic colors, black and white.
- `monsooncss` command line: `purge` writes a stylesheet with only the classes your files use, `classes` lists every class.
- `scripts/classes.json` with every base class, its category, its CSS and its variants.
