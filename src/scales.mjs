// Shared scales. Keys are the class suffixes, values are CSS values.

const rem = (n) => `${+(n * 0.25).toFixed(4)}rem`;
const scale = (keys) =>
  Object.fromEntries(keys.map((k) => [k, k === '0' ? '0' : k === 'px' ? '1px' : rem(+k)]));

export const spacing = scale([
  '0', 'px', '0.5', '1', '1.5', '2', '2.5', '3', '3.5', '4', '5', '6', '7', '8', '9', '10',
  '11', '12', '14', '16', '20', '24', '32', '40', '48', '64',
]);

export const sizing = {
  ...spacing,
  ...scale(['28', '36', '44', '56', '72', '80', '96']),
};

export const negativeSpacing = scale([
  'px', '0.5', '1', '1.5', '2', '2.5', '3', '4', '5', '6', '8', '10', '12', '16', '20', '24',
]);

export const fractions = Object.fromEntries(
  [
    [1, 2], [1, 3], [2, 3], [1, 4], [2, 4], [3, 4], [1, 5], [2, 5], [3, 5], [4, 5], [1, 6], [5, 6],
  ].map(([a, b]) => [`${a}/${b}`, `${+((a / b) * 100).toFixed(6)}%`]),
);

export const breakpoints = { sm: '640px', md: '768px', lg: '1024px', xl: '1280px', '2xl': '1536px' };

export const containerBreakpoints = { xs: '20rem', sm: '24rem', md: '28rem', lg: '32rem', xl: '36rem' };

export const containerWidths = {
  '3xs': '16rem', '2xs': '18rem', xs: '20rem', sm: '24rem', md: '28rem', lg: '32rem', xl: '36rem',
  '2xl': '42rem', '3xl': '48rem', '4xl': '56rem', '5xl': '64rem', '6xl': '72rem', '7xl': '80rem',
};

export const fontSizes = {
  xs: ['0.75rem', '1rem'],
  sm: ['0.875rem', '1.25rem'],
  base: ['1rem', '1.5rem'],
  lg: ['1.125rem', '1.75rem'],
  xl: ['1.25rem', '1.75rem'],
  '2xl': ['1.5rem', '2rem'],
  '3xl': ['1.875rem', '2.25rem'],
  '4xl': ['2.25rem', '2.5rem'],
  '5xl': ['3rem', '1'],
  '6xl': ['3.75rem', '1'],
  '7xl': ['4.5rem', '1'],
  '8xl': ['6rem', '1'],
  '9xl': ['8rem', '1'],
};

export const fontWeights = {
  thin: 100, extralight: 200, light: 300, normal: 400, medium: 500,
  semibold: 600, bold: 700, extrabold: 800, black: 900,
};

export const radii = {
  none: '0', xs: '0.125rem', sm: '0.25rem', '': '0.25rem', md: '0.375rem', lg: '0.5rem',
  xl: '0.75rem', '2xl': '1rem', '3xl': '1.5rem', '4xl': '2rem', full: '9999px',
};

export const fonts = {
  sans: 'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
  serif: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
  mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
};

export const alphaSteps = [5, 10, 20, 30, 50, 70, 80, 90];
