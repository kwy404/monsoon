import { breakpoints, containerBreakpoints } from './scales.mjs';

// A variant turns a utility selector into one or more selectors, optionally
// wrapped in an at-rule. "groups" lists the utility groups it applies to, which
// is how the bundle stays small: hover: is generated for colors and effects,
// md: for layout, and so on.

const pseudo = (name, pc, groups) => ({ name, groups, forms: [{ sel: (s) => `${s}${pc}` }] });

// dark: follows exactly the rule the tokens follow. An element is dark when
// its nearest themed ancestor (itself included) is .dark or [data-theme=dark],
// or when it has no themed ancestor at all and the OS prefers dark. A themed
// ancestor is any element with .dark, .light, [data-theme=dark] or
// [data-theme=light]; a forced light root is simply the nearest one.
//
// Three forms, none of which can match a light element:
// 1. DARK_SELF: the element is dark itself, or it sits below a dark element
//    and no light element sits below any dark one. That is exact for a dark
//    page, a light or unthemed page with dark sections, and dark inside dark.
//    Plain selectors cannot express "nearest" at any depth (each extra
//    dark > light > dark level would add about 200 kB of raw CSS), so dark
//    inside light inside dark is left to form 2. This form never matches a
//    light element.
// 2. DARK_SCOPE: @scope (dark) to (light) is the nearest ancestor rule itself,
//    exact at any depth in every browser with @scope. Older browsers drop the
//    block and keep form 1.
// 3. DARK_OS: inside the prefers-color-scheme media query, only elements with
//    no themed ancestor at all, the root included.
export const DARK = '.dark, [data-theme=dark]';
export const LIGHT = '.light, [data-theme=light]';
const D = `:is(${DARK})`;
const L = `:is(${LIGHT})`;
export const DARK_SELF = `:where(${DARK}, ${D} :not(${D} ${L}, ${D} ${L} *))`;
export const DARK_SCOPE = `@scope (${DARK}) to (${LIGHT})`;
export const DARK_OS = `:where(:not(${DARK}, ${LIGHT}, :is(${DARK}, ${LIGHT}) *))`;

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
      { sel: (s) => `${s}${DARK_SELF}` },
      { at: DARK_SCOPE, sel: (s) => s },
      { at: '@media (prefers-color-scheme: dark)', sel: (s) => `${s}${DARK_OS}` },
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
