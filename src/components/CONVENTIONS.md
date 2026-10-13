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
- No JavaScript. Prefer native HTML: `<dialog>`, the `popover` attribute,
  `<details>`/`<summary>` (with `name` for exclusive groups), `:checked`,
  `:has()`, `:focus-visible`, `:user-invalid`, scroll snap, anchor
  positioning with a plain fallback.
- Keyboard and screen reader friendly: visible focus ring
  (`outline: 2px solid var(--ring)`), honour `prefers-reduced-motion`.
- Keep selectors flat (one class, plus states and parts), no `!important`,
  no IDs, no element selectors at the top level.
- Keep it lean: shared values in custom properties
  (`--btn-bg`, `--btn-fg`, ...) so tones and sizes only swap variables.
