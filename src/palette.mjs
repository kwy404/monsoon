// Monsoon palette, generated in OKLCH from a short list of hue definitions.
// Every hue shares one lightness curve so step 500 of one hue sits next to
// step 500 of another. Warm and yellow hues get a lightness lift where they
// peak, and chroma is capped to the sRGB gamut so colors render the same in
// every browser.

import { oklchToLinearSrgb } from './color.mjs';

export const steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

const lightness = [0.975, 0.94, 0.885, 0.81, 0.715, 0.635, 0.56, 0.49, 0.425, 0.37, 0.27];
const chromaCurve = [0.07, 0.17, 0.34, 0.6, 0.86, 1, 0.97, 0.86, 0.72, 0.58, 0.44];
// How much of a hue's lightness lift applies at each step.
const liftCurve = [0, 0.15, 0.35, 0.6, 0.9, 1, 0.8, 0.5, 0.3, 0.15, 0.05];

// name: [hue, peak chroma, lightness lift, hue drift from 50 to 950]
const hues = {
  slate: [257, 0.042, 0, 0],
  gray: [262, 0.03, 0, 0],
  zinc: [286, 0.016, 0, 0],
  neutral: [0, 0, 0, 0],
  stone: [56, 0.014, 0, 0],
  red: [25, 0.235, 0, 2],
  orange: [46, 0.205, 0.04, -6],
  amber: [72, 0.185, 0.11, -14],
  yellow: [92, 0.185, 0.15, -16],
  lime: [128, 0.205, 0.12, -2],
  green: [148, 0.2, 0.05, 2],
  emerald: [164, 0.165, 0.04, 2],
  teal: [184, 0.135, 0.05, 2],
  cyan: [212, 0.145, 0.07, 6],
  sky: [236, 0.165, 0.04, 4],
  blue: [260, 0.215, 0, 4],
  indigo: [276, 0.23, -0.02, 2],
  violet: [292, 0.245, 0, 2],
  purple: [305, 0.255, 0, 0],
  fuchsia: [322, 0.27, 0, 0],
  pink: [354, 0.225, 0, 2],
  rose: [13, 0.23, 0, 2],
};

export const neutrals = ['slate', 'gray', 'zinc', 'neutral', 'stone'];

function maxChroma(L, H, want) {
  const ok = (c) => oklchToLinearSrgb([L, c, H]).every((v) => v >= -0.0005 && v <= 1.0005);
  if (ok(want)) return want;
  let lo = 0;
  let hi = want;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    if (ok(mid)) lo = mid;
    else hi = mid;
  }
  return lo;
}

const round = (n, d) => +n.toFixed(d);

// Values are [lightness %, chroma, hue] and print as oklch(63.5% 0.2 260).
export const palette = Object.fromEntries(
  Object.entries(hues).map(([name, [hue, peak, lift, drift]]) => {
    const shades = {};
    steps.forEach((step, i) => {
      const L = Math.min(0.985, lightness[i] + lift * liftCurve[i]);
      const H = (hue + (drift * i) / (steps.length - 1) + 360) % 360;
      const C = maxChroma(L, H, peak * chromaCurve[i]);
      shades[step] = [round(L * 100, 1), round(C, 3), round(H, 1)];
    });
    return [name, shades];
  }),
);
