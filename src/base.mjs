import { palette, steps } from './palette.mjs';
import { tokens, tokenCss, fallbackCss, DEFAULT_SEED } from './theme.mjs';
import { fonts } from './scales.mjs';

// Elements that recompute the seed tokens. Custom properties are resolved where
// they are declared, so any element that changes --seed or the color scheme has
// to declare the tokens again for its subtree.
export const THEME_SCOPE = ':root, .theme, .dark, .light, [data-theme], [style*="--seed"]';

// Light and dark mode
// -------------------
// --mode is 1 on .dark and [data-theme=dark], 0 on .light and
// [data-theme=light], and on an unthemed root it follows prefers-color-scheme.
// It inherits, so the nearest themed ancestor decides, exactly like the dark:
// variant (see variants.mjs).
//
// A themed section is any element other than the root with .dark, .light,
// [data-theme=dark] or [data-theme=light]. It switches color-scheme (native
// controls and scrollbars follow) and paints its own text and background, so
// a light section inside a dark page is never dark text on a dark backdrop.
// The paint rule has zero specificity: a component class or a bg-* or text-*
// utility on the same element still wins. To recompute the tokens for a new
// --seed without painting anything, use .theme or style="--seed: ...".
export const SECTION = ':where(.dark, .light, [data-theme=dark], [data-theme=light]):where(:not(:root))';

// Shared component tokens
// -----------------------
// One scale for every component: radius, control heights, font sizes and
// paddings per size step, border width, focus ring, motion and disabled
// opacity. They are plain values declared once on :root, so overriding one
// (for the whole page or for a subtree) restyles every component using it.
export const componentScale = {
  'radius-xs': '.25rem',
  'radius-sm': '.375rem',
  'radius-md': '.5rem',
  'radius-lg': '.625rem',
  'radius-xl': '.75rem',
  'radius-2xl': '1rem',
  'radius-3xl': '1.25rem',
  'radius-full': '9999px',
  'control-h-xs': '1.75rem',
  'control-h-sm': '2rem',
  'control-h-md': '2.5rem',
  'control-h-lg': '3rem',
  'control-h-xl': '3.5rem',
  'control-fs-xs': '.75rem',
  'control-fs-sm': '.8125rem',
  'control-fs-md': '.875rem',
  'control-fs-lg': '1rem',
  'control-fs-xl': '1.125rem',
  'control-px-xs': '.5rem',
  'control-px-sm': '.75rem',
  'control-px-md': '1rem',
  'control-px-lg': '1.25rem',
  'control-px-xl': '1.5rem',
  'border-width': '1px',
  'ring-width': '2px',
  'ring-offset': '2px',
  'duration-fast': '.15s',
  duration: '.2s',
  'duration-slow': '.3s',
  ease: 'cubic-bezier(.2, .8, .2, 1)',
  'ease-spring': 'cubic-bezier(.3, 1.3, .6, 1)',
  'ease-drawer': 'cubic-bezier(.32, .72, 0, 1)',
  'disabled-opacity': '.5',
};

// Tokens that read the theme (--ring, --mode) are declared with the theme
// tokens, so a dark section inside a light page gets dark mode shadows.
const shade = (a, b) => `oklch(0 0 0 / calc(${a} + ${b} * var(--mode)))`;
export const componentThemeTokens = {
  ring: 'var(--m-ring-width) solid var(--ring)',
  'shadow-xs': `0 1px 2px ${shade(0.05, 0.15)}`,
  'shadow-sm': `0 1px 2px ${shade(0.05, 0.2)}, 0 1px 3px ${shade(0.05, 0.15)}`,
  'shadow-md': `0 2px 4px -1px ${shade(0.05, 0.2)}, 0 6px 16px -4px ${shade(0.12, 0.3)}`,
  'shadow-lg': `0 2px 6px -2px ${shade(0.06, 0.2)}, 0 12px 32px -8px ${shade(0.18, 0.3)}`,
  'shadow-xl': `0 4px 12px -4px ${shade(0.08, 0.2)}, 0 24px 64px -16px ${shade(0.28, 0.3)}`,
};

const declare = (obj, indent) => Object.entries(obj).map(([k, v]) => `${indent}--m-${k}: ${v};`).join('\n');

function defaultSeedLch() {
  const m = DEFAULT_SEED.match(/oklch\(([\d.]+) ([\d.]+) ([\d.]+)\)/);
  return [+m[1], +m[2], +m[3]];
}

export function tokensCss() {
  const paletteVars = [];
  for (const [name, shades] of Object.entries(palette)) {
    for (const s of steps) {
      const [l, c, h] = shades[s];
      paletteVars.push(`  --color-${name}-${s}: oklch(${l}% ${c} ${h});`);
    }
  }
  const tokenDecls = tokens.map((t) => `  --${t.name}: ${tokenCss(t)};`).join('\n');
  const seed = defaultSeedLch();
  const fallback = tokens
    .filter((t) => !t.internal)
    .map((t) => `    --${t.name}: ${fallbackCss(t, seed)};`)
    .join('\n');

  return `
:root {
  --seed: ${DEFAULT_SEED};
  --mode: 0;
  --font-sans: ${fonts.sans};
  --font-serif: ${fonts.serif};
  --font-mono: ${fonts.mono};
${paletteVars.join('\n')}
${declare(componentScale, '  ')}
  color-scheme: light;
}
@media (prefers-color-scheme: dark) {
  :root:not(.light, [data-theme=light]) { --mode: 1; color-scheme: dark; }
}
.dark, [data-theme=dark] { --mode: 1; color-scheme: dark; }
.light, [data-theme=light] { --mode: 0; color-scheme: light; }
${THEME_SCOPE} {
${tokenDecls}
${declare(componentThemeTokens, '  ')}
}
${SECTION} {
  color: var(--foreground);
  background-color: var(--background);
}
@supports not (color: oklch(from red l c h)) {
  ${THEME_SCOPE} {
${fallback}
  }
}
`;
}

export const preflight = `
@layer base {
  *, ::before, ::after, ::backdrop, ::file-selector-button {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    border: 0 solid var(--border);
  }
  *, ::before, ::after, ::backdrop {
    --m-tx: 0;
    --m-ty: 0;
    --m-shadow: 0 0 #0000;
    --m-shadow-color: initial;
    --m-ring-shadow: 0 0 #0000;
    --m-ring-offset-shadow: 0 0 #0000;
    --m-ring-inset: initial;
    --m-ring-offset-width: 0px;
    --m-ring-offset-color: var(--background);
    --m-ring-color: var(--ring);
    --m-gradient-from: initial;
    --m-gradient-via: initial;
    --m-gradient-to: initial;
  }
  html, :host {
    line-height: 1.5;
    -webkit-text-size-adjust: 100%;
    tab-size: 4;
    font-family: var(--font-sans);
    font-feature-settings: normal;
    font-variation-settings: normal;
    -webkit-tap-highlight-color: transparent;
  }
  body {
    min-height: 100%;
    background-color: var(--background);
    color: var(--foreground);
    line-height: inherit;
  }
  hr { height: 0; color: inherit; border-top-width: 1px; }
  abbr:where([title]) { -webkit-text-decoration: underline dotted; text-decoration: underline dotted; }
  h1, h2, h3, h4, h5, h6 { font-size: inherit; font-weight: inherit; }
  a { color: inherit; -webkit-text-decoration: inherit; text-decoration: inherit; }
  b, strong { font-weight: bolder; }
  code, kbd, samp, pre { font-family: var(--font-mono); font-size: 1em; }
  small { font-size: 80%; }
  sub, sup { font-size: 75%; line-height: 0; position: relative; vertical-align: baseline; }
  sub { bottom: -0.25em; }
  sup { top: -0.5em; }
  table { text-indent: 0; border-color: inherit; border-collapse: collapse; }
  progress { vertical-align: baseline; }
  summary { display: list-item; }
  ol, ul, menu { list-style: none; }
  img, svg, video, canvas, audio, iframe, embed, object { display: block; vertical-align: middle; }
  img, video { max-width: 100%; height: auto; }
  button, input, select, optgroup, textarea, ::file-selector-button {
    font: inherit;
    font-feature-settings: inherit;
    font-variation-settings: inherit;
    letter-spacing: inherit;
    color: inherit;
    border-radius: 0;
    background-color: transparent;
    opacity: 1;
  }
  button, [role=button] { cursor: pointer; }
  :disabled { cursor: default; }
  ::placeholder { opacity: 1; color: var(--muted-foreground); }
  textarea { resize: vertical; }
  button, input:where([type=button], [type=reset], [type=submit]) { appearance: button; }
  :focus-visible { outline: var(--m-ring); outline-offset: var(--m-ring-offset); }
  [hidden]:where(:not([hidden=until-found])) { display: none !important; }
}
@layer base {
  :-moz-focusring { outline: auto; }
  ::-webkit-inner-spin-button, ::-webkit-outer-spin-button { height: auto; }
  ::-webkit-search-decoration { -webkit-appearance: none; }
}
@media (prefers-reduced-motion: reduce) {
  html:focus-within { scroll-behavior: auto; }
}
`;
