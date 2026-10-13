import { breakpoints, containerBreakpoints } from './scales.mjs';

// A variant turns a utility selector into one or more selectors, optionally
// wrapped in an at-rule. "groups" lists the utility groups it applies to, which
// is how the bundle stays small: hover: is generated for colors and effects,
// md: for layout, and so on.

const pseudo = (name, pc, groups) => ({ name, groups, forms: [{ sel: (s) => `${s}${pc}` }] });

const DARK_CLASS = ':where(.dark, .dark *, [data-theme=dark], [data-theme=dark] *)';
const DARK_MEDIA = ':where(:root:not(.light, [data-theme=light]) *)';

export const stateVariants = [
  pseudo('hover', ':hover', ['color', 'alpha', 'effect']),
  pseudo('focus', ':focus', ['semantic', 'ring', 'a11y']),
  pseudo('focus-within', ':focus-within', ['ring', 'semantic']),
  pseudo('focus-visible', ':focus-visible', ['ring', 'semantic', 'a11y']),
  pseudo('active', ':active', ['semantic', 'alpha', 'effect']),
  pseudo('disabled', ':disabled', ['disabled', 'semantic']),
  { name: 'group-hover', groups: ['color', 'effect', 'visibility'], forms: [{ sel: (s) => `.group:hover ${s}` }] },
  { name: 'peer-checked', groups: ['semantic', 'effect', 'visibility'], forms: [{ sel: (s) => `.peer:checked ~ ${s}` }] },
  pseudo('first', ':first-child', ['struct']),
  pseudo('last', ':last-child', ['struct']),
  pseudo('odd', ':nth-child(odd)', ['struct']),
  pseudo('even', ':nth-child(even)', ['struct']),
  { name: 'motion-safe', groups: ['motion'], forms: [{ at: '@media (prefers-reduced-motion: no-preference)', sel: (s) => s }] },
  { name: 'motion-reduce', groups: ['motion'], forms: [{ at: '@media (prefers-reduced-motion: reduce)', sel: (s) => s }] },
  {
    name: 'dark',
    groups: ['darkColor', 'alpha'],
    forms: [
      { sel: (s) => `${s}${DARK_CLASS}` },
      { at: '@media (prefers-color-scheme: dark)', sel: (s) => `${s}${DARK_MEDIA}` },
    ],
  },
];

export const responsiveVariants = Object.entries(breakpoints).map(([name, w]) => ({
  name,
  groups: ['layout'],
  forms: [{ at: `@media (min-width: ${w})`, sel: (s) => s }],
}));

export const containerVariants = Object.entries(containerBreakpoints).map(([name, w]) => ({
  name: `@${name}`,
  groups: ['cq'],
  forms: [{ at: `@container (min-width: ${w})`, sel: (s) => s }],
}));

export const variants = [...stateVariants, ...responsiveVariants, ...containerVariants];
