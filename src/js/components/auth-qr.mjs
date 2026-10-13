// QR code without dependencies: byte mode, error correction level M,
// versions 1 to 10 (up to 213 bytes, enough for any otpauth:// URI).
// Draws an SVG into the element, so an authenticator app can scan it.
//
//   <div class="qr" data-m-qr data-m-qr-value="otpauth://totp/Example:ada%40example.com?secret=...&issuer=Example"></div>
//
// Options: -value (the text), -label (accessible name, "QR code" by default),
// -border (quiet zone in modules, 2 by default), -mask (0 to 7, chosen by
// penalty score when left out). Fires monsoon:qr-render with { version, size, mask }.
import { define, emit } from '../core.mjs';
import { expose } from './auth-util.mjs';

// Error correction level M, indexed by version: codewords per block, blocks.
const EC_PER_BLOCK = [0, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26];
const EC_BLOCKS = [0, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5];
const FORMAT_M = 0; // two bit level indicator: L 01, M 00, Q 11, H 10
export const MAX_VERSION = 10;

// Galois field GF(256) with the QR polynomial x^8 + x^4 + x^3 + x^2 + 1.
const EXP = new Uint8Array(512);
const LOG = new Uint8Array(256);
for (let i = 0, x = 1; i < 255; i++) {
  EXP[i] = x;
  LOG[x] = i;
  x <<= 1;
  if (x & 0x100) x ^= 0x11d;
}
for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255];
const mul = (a, b) => (a && b ? EXP[LOG[a] + LOG[b]] : 0);

/** Generator polynomial of the given degree, highest term first (leading 1 dropped). */
export function rsGenerator(degree) {
  let poly = [1];
  for (let i = 0; i < degree; i++) {
    const next = new Array(poly.length + 1).fill(0);
    poly.forEach((c, j) => {
      next[j] ^= c;
      next[j + 1] ^= mul(c, EXP[i]);
    });
    poly = next;
  }
  return poly.slice(1);
}

/** Reed-Solomon error correction codewords for data. */
export function rsEncode(data, degree) {
  const gen = rsGenerator(degree);
  const rem = new Array(degree).fill(0);
  for (const byte of data) {
    const factor = byte ^ rem.shift();
    rem.push(0);
    for (let i = 0; i < degree; i++) rem[i] ^= mul(gen[i], factor);
  }
  return rem;
}

/** Modules available for data and error correction in a version. */
export function rawModules(ver) {
  let n = (16 * ver + 128) * ver + 64;
  if (ver >= 2) {
    const align = Math.floor(ver / 7) + 2;
    n -= (25 * align - 10) * align - 55;
    if (ver >= 7) n -= 36;
  }
  return n;
}
export const dataCodewords = (ver) => Math.floor(rawModules(ver) / 8) - EC_PER_BLOCK[ver] * EC_BLOCKS[ver];

/** Centers of the alignment patterns on each axis. */
export function alignmentPositions(ver) {
  if (ver === 1) return [];
  const count = Math.floor(ver / 7) + 2;
  const step = Math.ceil((ver * 4 + 4) / (count * 2 - 2)) * 2;
  const out = [6];
  for (let p = ver * 4 + 10; out.length < count; p -= step) out.splice(1, 0, p);
  return out;
}

/** 15 bit format information for level M and a mask, BCH(15,5) with the fixed XOR. */
export function formatBits(mask) {
  const data = (FORMAT_M << 3) | mask;
  let rem = data;
  for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
  return ((data << 10) | rem) ^ 0x5412;
}

/** 18 bit version information (versions 7 and up), BCH(18,6). */
export function versionBits(ver) {
  let rem = ver;
  for (let i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25);
  return (ver << 12) | rem;
}

const MASKS = [
  (x, y) => (x + y) % 2 === 0,
  (x, y) => y % 2 === 0,
  (x) => x % 3 === 0,
  (x, y) => (x + y) % 3 === 0,
  (x, y) => (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0,
  (x, y) => ((x * y) % 2) + ((x * y) % 3) === 0,
  (x, y) => (((x * y) % 2) + ((x * y) % 3)) % 2 === 0,
  (x, y) => (((x + y) % 2) + ((x * y) % 3)) % 2 === 0,
];

/** Data codewords for text in byte mode (UTF-8), padded to the version capacity. */
export function encodeData(bytes, ver) {
  const bits = [];
  const put = (value, len) => { for (let i = len - 1; i >= 0; i--) bits.push((value >>> i) & 1); };
  const capacity = dataCodewords(ver) * 8;
  put(0b0100, 4);
  put(bytes.length, ver < 10 ? 8 : 16);
  for (const b of bytes) put(b, 8);
  put(0, Math.min(4, capacity - bits.length));
  put(0, (8 - (bits.length % 8)) % 8);
  const out = [];
  for (let i = 0; i < bits.length; i += 8) out.push(bits.slice(i, i + 8).reduce((a, b) => (a << 1) | b, 0));
  for (let pad = 0xec; out.length < capacity / 8; pad ^= 0xec ^ 0x11) out.push(pad);
  return out;
}

/** Splits data into blocks, adds error correction and interleaves the codewords. */
export function interleave(data, ver) {
  const blocks = EC_BLOCKS[ver];
  const ecLen = EC_PER_BLOCK[ver];
  const raw = Math.floor(rawModules(ver) / 8);
  const shortBlocks = blocks - (raw % blocks);
  const shortLen = Math.floor(raw / blocks) - ecLen;
  const parts = [];
  for (let b = 0, k = 0; b < blocks; b++) {
    const len = shortLen + (b < shortBlocks ? 0 : 1);
    const d = data.slice(k, k + len);
    k += len;
    parts.push({ d, ec: rsEncode(d, ecLen) });
  }
  const out = [];
  for (let i = 0; i <= shortLen; i++) for (const p of parts) if (i < p.d.length) out.push(p.d[i]);
  for (let i = 0; i < ecLen; i++) for (const p of parts) out.push(p.ec[i]);
  return out;
}

/** Penalty score of a finished matrix (lower is better), the four rules of the standard. */
export function penalty(m) {
  const n = m.length;
  let score = 0;
  const line = (get) => {
    for (let a = 0; a < n; a++) {
      let run = 1;
      for (let b = 1; b <= n; b++) {
        if (b < n && get(a, b) === get(a, b - 1)) run++;
        else {
          if (run >= 5) score += run - 2;
          run = 1;
        }
      }
      for (let b = 0; b + 11 <= n; b++) {
        const s = Array.from({ length: 11 }, (_, k) => get(a, b + k)).join('');
        if (s === '10111010000' || s === '00001011101') score += 40;
      }
    }
  };
  line((y, x) => m[y][x]);
  line((x, y) => m[y][x]);
  for (let y = 0; y < n - 1; y++) {
    for (let x = 0; x < n - 1; x++) {
      const c = m[y][x];
      if (c === m[y][x + 1] && c === m[y + 1][x] && c === m[y + 1][x + 1]) score += 3;
    }
  }
  const dark = m.reduce((a, row) => a + row.reduce((s, v) => s + v, 0), 0);
  score += (Math.ceil(Math.abs(dark * 20 - n * n * 10) / (n * n)) - 1) * 10;
  return score;
}

/**
 * Encodes text into a QR matrix: { version, size, mask, modules } where
 * modules[y][x] is 1 for a dark module.
 */
export function encodeQr(text, { minVersion = 1, maxVersion = MAX_VERSION, mask = -1 } = {}) {
  const bytes = [...new TextEncoder().encode(String(text))];
  const top = Math.min(maxVersion, MAX_VERSION);
  let ver = Math.max(1, minVersion);
  while (ver <= top && 4 + (ver < 10 ? 8 : 16) + bytes.length * 8 > dataCodewords(ver) * 8) ver++;
  if (ver > top) throw new RangeError(`QR: ${bytes.length} bytes do not fit in version ${top}`);
  const size = ver * 4 + 17;
  const base = Array.from({ length: size }, () => new Array(size).fill(0));
  const fixed = Array.from({ length: size }, () => new Array(size).fill(false));
  const set = (x, y, dark) => {
    base[y][x] = dark ? 1 : 0;
    fixed[y][x] = true;
  };

  for (let i = 0; i < size; i++) {
    set(6, i, i % 2 === 0);
    set(i, 6, i % 2 === 0);
  }
  for (const [cx, cy] of [[3, 3], [size - 4, 3], [3, size - 4]]) {
    for (let dy = -4; dy <= 4; dy++) {
      for (let dx = -4; dx <= 4; dx++) {
        const x = cx + dx;
        const y = cy + dy;
        if (x < 0 || y < 0 || x >= size || y >= size) continue;
        const d = Math.max(Math.abs(dx), Math.abs(dy));
        set(x, y, d !== 2 && d !== 4);
      }
    }
  }
  const pos = alignmentPositions(ver);
  pos.forEach((cx, i) => pos.forEach((cy, j) => {
    const last = pos.length - 1;
    if ((i === 0 && j === 0) || (i === 0 && j === last) || (i === last && j === 0)) return;
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) set(cx + dx, cy + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
  }));
  const drawFormat = (m, bits) => {
    const bit = (i) => (bits >>> i) & 1;
    const put = (x, y, v) => {
      m[y][x] = v;
      fixed[y][x] = true;
    };
    for (let i = 0; i <= 5; i++) put(8, i, bit(i));
    put(8, 7, bit(6));
    put(8, 8, bit(7));
    put(7, 8, bit(8));
    for (let i = 9; i < 15; i++) put(14 - i, 8, bit(i));
    for (let i = 0; i < 8; i++) put(size - 1 - i, 8, bit(i));
    for (let i = 8; i < 15; i++) put(8, size - 15 + i, bit(i));
    put(8, size - 8, 1);
  };
  drawFormat(base, 0);
  if (ver >= 7) {
    const bits = versionBits(ver);
    for (let i = 0; i < 18; i++) {
      const v = (bits >>> i) & 1;
      const a = size - 11 + (i % 3);
      const b = Math.floor(i / 3);
      set(a, b, v);
      set(b, a, v);
    }
  }

  const codewords = interleave(encodeData(bytes, ver), ver);
  let i = 0;
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    const upward = ((right + 1) & 2) === 0;
    for (let v = 0; v < size; v++) {
      const y = upward ? size - 1 - v : v;
      for (let j = 0; j < 2; j++) {
        const x = right - j;
        if (fixed[y][x]) continue;
        if (i < codewords.length * 8) base[y][x] = (codewords[i >>> 3] >>> (7 - (i & 7))) & 1;
        i++;
      }
    }
  }

  const withMask = (k) => {
    const m = base.map((row) => row.slice());
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) if (!fixed[y][x] && MASKS[k](x, y)) m[y][x] ^= 1;
    }
    drawFormat(m, formatBits(k));
    return m;
  };
  let best = mask;
  let modules;
  if (best >= 0 && best < 8) modules = withMask(best);
  else {
    let low = Infinity;
    for (let k = 0; k < 8; k++) {
      const m = withMask(k);
      const p = penalty(m);
      if (p < low) {
        low = p;
        best = k;
        modules = m;
      }
    }
  }
  return { version: ver, size, mask: best, modules };
}

/** SVG path data: one subpath per horizontal run of dark modules. */
export function qrPath(modules, border = 0) {
  let d = '';
  modules.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      if (!row[x]) continue;
      let w = 1;
      while (x + w < row.length && row[x + w]) w++;
      d += `M${x + border} ${y + border}h${w}v1h-${w}z`;
      x += w - 1;
    }
  });
  return d;
}

const svgOf = (modules, border, label) => {
  const n = modules.length + border * 2;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);
  return `<svg xmlns="http://www.w3.org/2000/svg" class="qr-code" viewBox="0 0 ${n} ${n}" role="img" aria-label="${esc(label)}" shape-rendering="crispEdges"><path fill="currentColor" d="${qrPath(modules, border)}"/></svg>`;
};

/** A standalone SVG string (dark modules in currentColor). */
export function qrSvg(text, { border = 2, label = 'QR code', ...opts } = {}) {
  return svgOf(encodeQr(text, opts).modules, border, label);
}

export function qr(el, opts = {}) {
  let value = opts.value ?? el.dataset.mQr ?? '';
  let info = null;
  const render = () => {
    el.querySelector(':scope > .qr-code')?.remove();
    el.removeAttribute('data-qr-error');
    if (!value) return;
    try {
      const mask = opts.mask === undefined ? -1 : Number(opts.mask);
      info = encodeQr(value, { mask });
      el.insertAdjacentHTML('afterbegin', svgOf(info.modules, opts.border === undefined ? 2 : Number(opts.border), opts.label || 'QR code'));
      emit(el, 'qr-render', { version: info.version, size: info.size, mask: info.mask });
    } catch (e) {
      info = null;
      el.setAttribute('data-qr-error', '');
      emit(el, 'qr-error', { message: e.message });
    }
  };
  render();
  const api = {
    get value() { return value; },
    set value(v) {
      value = String(v ?? '');
      render();
    },
    get version() { return info && info.version; },
    get modules() { return info && info.modules; },
    destroy() {
      el.querySelector(':scope > .qr-code')?.remove();
      if (el.monsoon) delete el.monsoon.qr;
    },
  };
  return expose(el, 'qr', api);
}

define('qr', (el, opts) => qr(el, opts).destroy);
