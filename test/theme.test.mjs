import { describe, it, expect } from 'vitest';
import { resolveTokens, tokens, tokenCss, T, LO, HI } from '../src/theme.mjs';
import { contrast, hexToRgb, srgbToOklch } from '../src/color.mjs';
import { read } from './helpers.mjs';

const hex = (h) => srgbToOklch(hexToRgb(h));

const seeds = {
  default: [0.55, 0.22, 262],
  teal: hex('#008080'),
  rose: hex('#e11d48'),
  gold: hex('#ffd700'),
  lime: hex('#84cc16'),
  green: hex('#16a34a'),
  orange: hex('#f97316'),
  cyan: hex('#06b6d4'),
  purple: hex('#800080'),
  navy: hex('#000080'),
  black: hex('#000000'),
  white: hex('#ffffff'),
  gray: hex('#808080'),
  pureRed: hex('#ff0000'),
  pureGreen: hex('#00ff00'),
  pureBlue: hex('#0000ff'),
  pastel: hex('#a5b4fc'),
  borderline: [0.6, 0.15, 150],
};

const pairs = [
  ['primary', 'primary-foreground'],
  ['secondary', 'secondary-foreground'],
  ['accent', 'accent-foreground'],
  ['success', 'success-foreground'],
  ['warning', 'warning-foreground'],
  ['danger', 'danger-foreground'],
  ['info', 'info-foreground'],
  ['background', 'foreground'],
  ['surface', 'foreground'],
  ['surface-2', 'foreground'],
  ['surface-3', 'foreground'],
  ['background', 'muted-foreground'],
  ['muted', 'muted-foreground'],
];

describe('seed theming contrast (WCAG AA, 4.5:1)', () => {
  for (const [name, seed] of Object.entries(seeds)) {
    for (const mode of [0, 1]) {
      it(`${name} seed in ${mode ? 'dark' : 'light'} mode`, () => {
        const t = resolveTokens(seed, mode);
        for (const [a, b] of pairs) {
          for (const gamut of ['clip', 'map']) {
            const ratio = contrast(t[a], t[b], gamut);
            expect(ratio, `${a} on ${b} (${gamut})`).toBeGreaterThanOrEqual(4.5);
          }
        }
        // In dark mode primary doubles as a readable text color on the background.
        if (mode === 1) expect(contrast(t.primary, t.background)).toBeGreaterThanOrEqual(4.5);
      });
    }
  }

  it('holds for a sweep of sRGB seeds', () => {
    let worst = Infinity;
    const N = 12;
    for (let r = 0; r <= N; r++) {
      for (let g = 0; g <= N; g++) {
        for (let b = 0; b <= N; b++) {
          const seed = srgbToOklch([r / N, g / N, b / N]);
          for (const mode of [0, 1]) {
            const t = resolveTokens(seed, mode);
            worst = Math.min(
              worst,
              contrast(t.primary, t['primary-foreground']),
              contrast(t.accent, t['accent-foreground']),
              contrast(t.foreground, t.background),
            );
          }
        }
      }
    }
    expect(worst).toBeGreaterThanOrEqual(4.5);
  });

  it('never leaves primary lightness inside the unsafe band', () => {
    for (let l = 0; l <= 1; l += 0.005) {
      for (const mode of [0, 1]) {
        const L = resolveTokens([l, 0.1, 200], mode).primary[0];
        expect(L <= LO + 1e-9 || L >= HI - 1e-9, `l=${l} gave ${L}`).toBe(true);
      }
    }
    expect(T).toBeGreaterThan(LO);
    expect(T).toBeLessThan(HI);
  });

  it('writes exactly the formulas the tests evaluate into the CSS', () => {
    const css = read('dist/monsoon.css');
    for (const t of tokens) expect(css).toContain(`--${t.name}: ${tokenCss(t)};`);
  });
});
