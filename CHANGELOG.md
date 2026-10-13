# Changelog

All notable changes to this project are documented in this file.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses [Semantic Versioning](https://semver.org/).

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
