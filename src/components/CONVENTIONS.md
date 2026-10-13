# Component conventions

Every `src/components/*.css` file is concatenated in name order after the base
styles and before the utilities (see `index.mjs`), so a utility class on the
same element always overrides a component default.

## Files

- `NN-group.css`: the CSS for one group of components.
- `NN-group.json`: the manifest the docs site reads:

```json
{
  "group": "forms",
  "title": "Forms",
  "components": [
    {
      "name": "Select",
      "slug": "select",
      "description": "One sentence.",
      "classes": ["select", "select-sm", "select-lg"],
      "html": "<select class=\"select\"><option>One</option></select>"
    }
  ]
}
```

Every class listed in `classes` must exist in the CSS, and every `html`
example must only use classes that exist (component classes or utilities).

## Naming

- Base class is the component name: `.btn`, `.card`, `.drawer`.
- Modifiers are `name-modifier`: `.btn-sm`, `.btn-outline`, `.card-compact`.
- Parts are `name-part`: `.card-body`, `.modal-box`, `.drawer-side`.
- Tones: `-primary`, `-secondary`, `-accent`, `-success`, `-warning`,
  `-danger`, `-info`, `-neutral` where they make sense.
- Sizes: `-xs`, `-sm`, `-md` (default), `-lg`, `-xl`.

## Rules

- Use only the theme tokens (`var(--primary)`, `var(--primary-foreground)`,
  `var(--surface)`, `var(--surface-2)`, `var(--surface-3)`, `var(--muted)`,
  `var(--muted-foreground)`, `var(--border)`, `var(--ring)`,
  `var(--foreground)`, `var(--background)`, `var(--secondary)`,
  `var(--accent)`, `var(--success)`, `var(--warning)`, `var(--danger)`,
  `var(--info)` and their `-foreground` pairs when present) so components
  follow `--seed`, light and dark mode automatically. Read `src/base.mjs`
  for the exact token names before writing CSS.
- Use the shared component tokens from `src/base.mjs` instead of raw
  values, so the whole library reads as one system:
  - radius: `--m-radius-xs` (.25rem), `-sm`, `-md`, `-lg`, `-xl`, `-2xl`,
    `-3xl` (1.25rem) and `-full`. Nested surfaces stay concentric: inner
    radius = outer radius minus the padding between them.
  - size steps: `--m-control-h-{xs,sm,md,lg,xl}` (1.75 to 3.5rem),
    `--m-control-fs-*` and `--m-control-px-*`. Every sized control (button,
    field, tabs, pagination, segmented, toggle group) maps its `-xs` to `-xl`
    classes onto the same step, so controls of one size line up in a row.
  - `--m-border-width`, `--m-ring` (width, style and color in one value),
    `--m-ring-width`, `--m-ring-offset`, `--m-disabled-opacity`.
  - shadows: `--m-shadow-xs` (fields, cards), `-sm` (selected thumbs),
    `-md` (floating buttons, tooltips), `-lg` (popovers, menus, toasts),
    `-xl` (dialogs, drawers, palettes). They follow `--mode`.
  - motion: `--m-duration-fast` (color changes), `--m-duration` (small
    movement), `--m-duration-slow` (overlays), `--m-ease`,
    `--m-ease-spring` and `--m-ease-drawer`.
- Focus: `outline: var(--m-ring); outline-offset: var(--m-ring-offset)` on
  `:focus-visible`. Items inside a clipping container (menus, tabs, lists)
  use an inset ring: `outline-offset: calc(-1 * var(--m-ring-width))`.
- Disabled: `opacity: var(--m-disabled-opacity)` and `cursor: not-allowed`.
  A disabled wrapper dims once; the control inside it does not dim again.
- Tones: every component reads `--tone` and `--tone-fg`. The component sets
  its default on itself and the `-primary`, `-success`, ... classes come
  later in the file and swap only those two values.
- No JavaScript. Prefer native HTML: `<dialog>`, the `popover` attribute,
  `<details>`/`<summary>` (with `name` for exclusive groups), `:checked`,
  `:has()`, `:focus-visible`, `:user-invalid`, scroll snap, anchor
  positioning with a plain fallback. When a part does need a script (the
  password reveal button, the number counter buttons), say so in the
  manifest description.
- Keyboard and screen reader friendly: visible focus ring (see above),
  honour `prefers-reduced-motion`.
- A component class must not change what a utility of the same name does.
  `.list-item`, `.collapse` and `.table` share a name with a utility: the
  utility skips the component's context (`:not(.list > *)`,
  `:not(details)`) and the component stays at one class of specificity, so
  other utilities on the element still win.
- Keep selectors flat (one class, plus states and parts), no `!important`,
  no IDs, no element selectors at the top level.
- Keep it lean: shared values in custom properties
  (`--btn-bg`, `--btn-fg`, ...) so tones and sizes only swap variables.
