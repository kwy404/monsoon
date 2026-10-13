# Contributing to Monsoon

Thanks for helping. Monsoon is a single generated stylesheet, so most changes touch the generator in `src/` and then rebuild `dist/`.

## Setup

```sh
git clone https://github.com/kwy404/monsoon.git
cd monsoon
npm install
npm run build
npm test
```

Node 18 or newer is required. There are no runtime dependencies.

## Project layout

| Path | What lives there |
| --- | --- |
| `src/scales.mjs` | Shared scales: spacing, sizing, fractions, breakpoints, font sizes, radii |
| `src/palette.mjs` | The OKLCH palette, generated from hue definitions |
| `src/theme.mjs` | Seed token formulas, written once and used by both the CSS and the tests |
| `src/base.mjs` | Theme tokens, dark mode switch and the base reset |
| `src/utilities/*.mjs` | Utility definitions, one module per area |
| `src/variants.mjs` | Variants and the utility groups each one applies to |
| `src/generate.mjs` | Turns definitions into CSS |
| `bin/` | The `monsooncss` CLI and the small CSS parser it shares with the build |
| `scripts/` | Build, size report, lint and the generated `classes.json` |
| `test/` | Vitest suites |
| `demo/kitchen-sink.html` | A page that exercises most utilities, open it in a browser after a build |

## Adding a utility

Every utility module receives an `add` function:

```js
add(category, name, declarations, groups, options);
```

- `category`: a short label used in `scripts/classes.json` (`spacing`, `colors`, `typography`...).
- `name`: the class name without the leading dot, for example `text-balance`. Escaping is handled for you.
- `declarations`: an object such as `{ 'text-wrap': 'balance' }`, or an array of pairs when a property repeats.
- `groups` (optional): which variants the utility gets. See below.
- `options` (optional): `selector` to wrap the class selector (used by `space-x-*` and `divide-*`), `media` for extra rules per breakpoint (used by `container`).

Example, in `src/utilities/typography.mjs`:

```js
add('typography', 'text-balance', { 'text-wrap': 'balance' });
```

Then run `npm run build` and add the class to the sample list in `test/build.test.mjs`.

### Choosing variant groups

Variants are only generated for utilities in the groups they list (see `src/variants.mjs`). This keeps the full file small. The groups are:

| Group | Gets | Use it for |
| --- | --- | --- |
| `layout` | `sm:` to `2xl:` | display, flex direction, grid columns, gaps, padding, margin, width, text size, weight and alignment |
| `cq` | `@xs:` to `@xl:` | the subset of layout that makes sense in container queries |
| `color` | `hover:`, `group-hover:` | semantic colors and the 500, 600 and 700 steps |
| `semantic` | `focus:`, `active:`, `peer-checked:` and more | semantic colors only |
| `alpha` | `hover:`, `active:`, `dark:` | opacity modifiers like `bg-black/10` |
| `effect` | `hover:`, `active:`, `group-hover:` | opacity, shadow, scale, rotate, translate, underline |
| `ring` | `focus:`, `focus-visible:`, `focus-within:` | rings and outlines |
| `visibility` | `group-hover:`, `peer-checked:` | show and hide |
| `struct` | `first:`, `last:`, `odd:`, `even:` | zero margins and borders, row backgrounds |
| `motion` | `motion-safe:`, `motion-reduce:` | transitions and animations |
| `darkColor` | `dark:` | neutral palettes and common steps |
| `disabled` | `disabled:` | opacity, cursor and pointer events |
| `a11y` | `focus:`, `focus-visible:` | `sr-only` and `not-sr-only` |

Every variant you add costs bytes for each utility in its groups. Run `npm run size` before and after, and keep the minified file under the 60 kB brotli target.

## Changing theme tokens

Token formulas live in `src/theme.mjs` as CSS expressions. The tests evaluate the same strings in JavaScript and check WCAG AA contrast for many seed colors in light and dark mode, so a change that breaks contrast fails `npm test`.

## Before opening a pull request

```sh
npm run build
npm run lint
npm test
npm run size
```

Commit the rebuilt `dist/` files and `scripts/classes.json` together with the source change. The lint step rejects em and en dashes, emoji, trailing whitespace and scripts that fail `node --check`.
