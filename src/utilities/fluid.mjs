// Fluid type and space: values that grow smoothly with the viewport between a
// mobile size and a desktop size, with no breakpoint classes. Each value is a
// clamp() of rem plus vw, so it still follows the user's font size setting.

// The viewport range the values interpolate over, in rem (360px to 1280px).
export const FLUID_FROM = 22.5;
export const FLUID_TO = 80;

const num = (n) => String(+n.toFixed(4));

// clamp(min, a + b vw, max) that is `min` at FLUID_FROM and `max` at FLUID_TO.
export function fluid(min, max) {
  const slope = (max - min) / (FLUID_TO - FLUID_FROM);
  const intercept = min - slope * FLUID_FROM;
  return `clamp(${num(min)}rem, ${num(intercept)}rem + ${num(slope * 100)}vw, ${num(max)}rem)`;
}

// [mobile size, desktop size, line height]
export const fluidFontSizes = {
  sm: [0.8125, 0.875, '1.5'],
  base: [0.9375, 1, '1.6'],
  lg: [1, 1.125, '1.55'],
  xl: [1.125, 1.25, '1.45'],
  '2xl': [1.25, 1.5, '1.3'],
  '3xl': [1.5, 1.875, '1.2'],
  '4xl': [1.75, 2.25, '1.15'],
  '5xl': [2, 3, '1.1'],
  '6xl': [2.25, 3.75, '1.05'],
};

// [mobile size, desktop size]
export const fluidSpacing = {
  xs: [0.5, 0.75],
  sm: [0.75, 1.25],
  md: [1, 2],
  lg: [1.5, 3],
  xl: [2, 4],
  '2xl': [3, 6],
  '3xl': [4, 8],
};

const spacingProps = {
  p: ['padding'],
  px: ['padding-inline'],
  py: ['padding-block'],
  m: ['margin'],
  gap: ['gap'],
};

export default function fluidUtilities(add) {
  for (const [k, [min, max, lh]] of Object.entries(fluidFontSizes)) {
    add('typography', `text-fluid-${k}`, { 'font-size': fluid(min, max), 'line-height': lh });
  }
  for (const [prefix, props] of Object.entries(spacingProps)) {
    for (const [k, [min, max]] of Object.entries(fluidSpacing)) {
      const value = fluid(min, max);
      add('spacing', `${prefix}-fluid-${k}`, Object.fromEntries(props.map((p) => [p, value])));
    }
  }
}
