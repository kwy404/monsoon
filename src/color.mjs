// Small color math helpers used by the theme tests and the contrast tuning.
// OKLab matrices from Bjorn Ottosson, "A perceptual color space for image processing".

const toLinear = (v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);

export function hexToRgb(hex) {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map((x) => x + x).join('');
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => v / 255);
}

export function srgbToOklch([r, g, b]) {
  const [lr, lg, lb] = [r, g, b].map(toLinear);
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const C = Math.hypot(A, B);
  let H = C < 1e-6 ? 0 : (Math.atan2(B, A) * 180) / Math.PI;
  if (H < 0) H += 360;
  return [L, C, H];
}

// Returns linear sRGB channels, possibly outside [0, 1].
export function oklchToLinearSrgb([L, C, H]) {
  const hr = (H * Math.PI) / 180;
  const a = C * Math.cos(hr);
  const b = C * Math.sin(hr);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

const inGamut = (rgb) => rgb.every((v) => v >= -1e-4 && v <= 1 + 1e-4);
const clip = (rgb) => rgb.map((v) => Math.min(1, Math.max(0, v)));

// Gamut mapping by chroma reduction, close to what CSS Color 4 describes.
export function oklchToLinearMapped([L, C, H]) {
  if (L >= 1) return [1, 1, 1];
  if (L <= 0) return [0, 0, 0];
  let rgb = oklchToLinearSrgb([L, C, H]);
  if (inGamut(rgb)) return clip(rgb);
  let lo = 0;
  let hi = C;
  for (let i = 0; i < 30; i++) {
    const mid = (lo + hi) / 2;
    if (inGamut(oklchToLinearSrgb([L, mid, H]))) lo = mid;
    else hi = mid;
  }
  return clip(oklchToLinearSrgb([L, lo, H]));
}

// Relative luminance per WCAG 2. mode "clip" clamps channels, "map" reduces chroma.
export function luminance(lch, mode = 'clip') {
  const [r, g, b] = mode === 'map' ? oklchToLinearMapped(lch) : clip(oklchToLinearSrgb(lch));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a, b, mode = 'clip') {
  const y1 = luminance(a, mode);
  const y2 = luminance(b, mode);
  return (Math.max(y1, y2) + 0.05) / (Math.min(y1, y2) + 0.05);
}
