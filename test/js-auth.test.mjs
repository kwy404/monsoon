// @vitest-environment jsdom
// One time code and sign in components of the interactive layer: pure rules,
// a QR encoder checked against an independent reference and reader, then the
// enhanced markup in a DOM.
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { enhance } from '../src/js/core.mjs';
import { cleanCode, insertedText, otp, otpLength, separatorsAfter } from '../src/js/components/otp.mjs';
import {
  alignmentPositions, dataCodewords, encodeQr, formatBits, interleave, encodeData, penalty, qrPath, qrSvg, rsEncode, versionBits,
} from '../src/js/components/auth-qr.mjs';
import { formatCountdown } from '../src/js/components/auth-resend.mjs';
import {
  caretAfterDigits, COUNTRIES, FLAGS, flagHtml, formatPhone, isComplete, nationalDigits, parseInternational, searchCountries, toE164, country,
} from '../src/js/components/auth-phone.mjs';
import { checkPassword, hasRun, isCommon, STRENGTH_LABELS } from '../src/js/components/auth-password.mjs';
import { codesText, readCodes } from '../src/js/components/auth-codes.mjs';

const tick = (ms = 0) => new Promise((r) => setTimeout(r, ms));
const mount = (html) => {
  const box = document.createElement('div');
  box.innerHTML = html;
  document.body.append(box);
  enhance(box);
  return box;
};
const key = (el, k, init = {}) => el.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true, ...init }));
const type = (el, value) => {
  el.value = value;
  el.dispatchEvent(new Event('input', { bubbles: true }));
};
const paste = (el, text) => {
  const e = new Event('paste', { bubbles: true, cancelable: true });
  Object.defineProperty(e, 'clipboardData', { value: { getData: () => text } });
  el.dispatchEvent(e);
  return e;
};

beforeAll(() => {
  URL.createObjectURL ||= () => 'blob:test';
  URL.revokeObjectURL ||= () => {};
});
afterEach(() => {
  document.body.innerHTML = '';
  vi.useRealTimers();
});

describe('one time code rules', () => {
  it('keeps only the allowed characters, without spaces and dashes', () => {
    expect(cleanCode('12 34-56')).toEqual(['1', '2', '3', '4', '5', '6']);
    expect(cleanCode('ab-12', '[a-z0-9]')).toEqual(['a', 'b', '1', '2']);
    expect(cleanCode('123456789', '[0-9]', 6).join('')).toBe('123456');
    expect(cleanCode(null)).toEqual([]);
  });

  it('finds what was typed into a filled cell', () => {
    expect(insertedText('4', '47')).toBe('7');
    expect(insertedText('4', '74')).toBe('7');
    expect(insertedText('', '9')).toBe('9');
    expect(insertedText('4', '9')).toBe('9');
    expect(insertedText('', '123456')).toBe('123456');
  });

  it('clamps the length to 4..8 and reads separators', () => {
    expect(otpLength(undefined, 6)).toBe(6);
    expect(otpLength('8', 6)).toBe(8);
    expect(otpLength('12')).toBe(8);
    expect(otpLength('2')).toBe(4);
    expect(otpLength(undefined, -1)).toBe(6);
    expect([...separatorsAfter('3', 6)]).toEqual([3]);
    expect([...separatorsAfter('2,4', 6)]).toEqual([2, 4]);
    expect([...separatorsAfter('0,6,x', 6)]).toEqual([]);
  });
});

describe('one time code cells', () => {
  const setup = (attrs = 'data-m-otp-separator="3"', field = '<input class="otp-field" name="code" maxlength="6" inputmode="numeric" autocomplete="one-time-code" aria-label="Verification code">') => {
    const box = mount(`<form><div class="otp" data-m-otp ${attrs}>${field}</div></form>`);
    const root = box.querySelector('.otp');
    return { box, root, form: box.querySelector('form'), field: root.querySelector('.otp-field'), cells: [...root.querySelectorAll('.otp-input')], api: root.monsoon.otp };
  };

  it('renders one cell per character with separators and keeps the field as carrier', () => {
    const { root, field, cells } = setup();
    expect(cells).toHaveLength(6);
    expect(root.querySelectorAll('.otp-separator')).toHaveLength(1);
    expect(cells[2].nextElementSibling.className).toBe('otp-separator');
    expect(root.getAttribute('role')).toBe('group');
    expect(root.getAttribute('aria-label')).toBe('Verification code');
    expect(field.getAttribute('tabindex')).toBe('-1');
    expect(field.getAttribute('aria-hidden')).toBe('true');
    expect(field.getAttribute('autocomplete')).toBe('one-time-code');
    for (const c of cells) {
      expect(c.getAttribute('autocomplete')).toBe('one-time-code');
      expect(c.getAttribute('inputmode')).toBe('numeric');
      expect(c.hasAttribute('maxlength')).toBe(false);
    }
    expect(cells[0].getAttribute('aria-label')).toBe('Digit 1 of 6');
    expect(cells.map((c) => c.tabIndex)).toEqual([0, -1, -1, -1, -1, -1]);
  });

  it('takes the length from the option, between 4 and 8', () => {
    expect(setup('data-m-otp-length="8"', '').cells).toHaveLength(8);
    expect(setup('data-m-otp-length="4"', '').cells).toHaveLength(4);
    expect(setup('data-m-otp-length="20"', '').cells).toHaveLength(8);
  });

  it('advances on input and rejects other characters', () => {
    const { cells, api } = setup();
    cells[0].focus();
    type(cells[0], '4');
    expect(document.activeElement).toBe(cells[1]);
    type(cells[1], 'x');
    expect(cells[1].value).toBe('');
    expect(document.activeElement).toBe(cells[1]);
    type(cells[1], '2');
    expect(api.value).toBe('42');
    expect(document.activeElement).toBe(cells[2]);
  });

  it('replaces a filled cell when a digit is added beside the old one', () => {
    const { cells, api } = setup();
    api.value = '123456';
    cells[2].focus();
    type(cells[2], '39');
    expect(api.value).toBe('129456');
    expect(document.activeElement).toBe(cells[3]);
  });

  it('goes back and clears with Backspace, Delete clears in place', () => {
    const { cells, api } = setup();
    api.value = '1234';
    cells[3].focus();
    key(cells[3], 'Backspace');
    expect(api.value).toBe('123');
    expect(document.activeElement).toBe(cells[3]);
    key(cells[3], 'Backspace');
    expect(api.value).toBe('12');
    expect(document.activeElement).toBe(cells[2]);
    key(cells[2], 'Backspace');
    expect(api.value).toBe('1');
    expect(document.activeElement).toBe(cells[1]);
    cells[0].focus();
    key(cells[0], 'Delete');
    expect(cells[0].value).toBe('');
  });

  it('moves with arrows, Home and End', () => {
    const { cells, api } = setup();
    api.value = '1234';
    cells[3].focus();
    key(cells[3], 'ArrowLeft');
    expect(document.activeElement).toBe(cells[2]);
    key(cells[2], 'ArrowRight');
    expect(document.activeElement).toBe(cells[3]);
    key(cells[3], 'Home');
    expect(document.activeElement).toBe(cells[0]);
    key(cells[0], 'End');
    expect(document.activeElement).toBe(cells[4]);
    expect(cells[4].tabIndex).toBe(0);
    expect(cells[0].tabIndex).toBe(-1);
  });

  it('sends focus to the first empty cell instead of leaving gaps', () => {
    const { cells } = setup();
    cells[4].focus();
    expect(document.activeElement).toBe(cells[0]);
  });

  it('distributes a pasted code from any cell, without spaces and dashes', () => {
    const { cells, api, field } = setup();
    cells[3].focus();
    const e = paste(cells[3], ' 482-913 ');
    expect(e.defaultPrevented).toBe(true);
    expect(api.value).toBe('482913');
    expect(field.value).toBe('482913');
    expect(document.activeElement).toBe(cells[5]);
  });

  it('fills from the current cell when the pasted text is shorter than the code', () => {
    const { cells, api } = setup();
    api.value = '12';
    cells[2].focus();
    paste(cells[2], '34');
    expect(api.value).toBe('1234');
    expect(document.activeElement).toBe(cells[4]);
  });

  it('accepts an SMS autofill of the whole code into one cell', () => {
    const { cells, api } = setup();
    cells[0].focus();
    type(cells[0], '654321');
    expect(api.value).toBe('654321');
    expect(cells.map((c) => c.value).join('')).toBe('654321');
  });

  it('distributes a code autofilled into the carrier field', () => {
    const { field, cells, api } = setup();
    type(field, '135790');
    expect(api.value).toBe('135790');
    expect(cells[5].value).toBe('0');
  });

  it('keeps the carrier in sync for forms and fires change events', () => {
    const { form, cells, field } = setup();
    const seen = [];
    field.addEventListener('input', () => seen.push(field.value));
    cells[0].focus();
    type(cells[0], '7');
    type(cells[1], '8');
    expect(new FormData(form).get('code')).toBe('78');
    expect(seen).toEqual(['7', '78']);
  });

  it('fires otp-change on every edit and otp-complete once with the code', () => {
    const { root, cells, api } = setup();
    const changes = [];
    const done = vi.fn();
    root.addEventListener('monsoon:otp-change', (e) => changes.push(e.detail));
    root.addEventListener('monsoon:otp-complete', (e) => done(e.detail.code));
    cells[0].focus();
    paste(cells[0], '12345');
    expect(done).not.toHaveBeenCalled();
    type(cells[5], '6');
    expect(done).toHaveBeenCalledWith('123456');
    expect(changes.at(-1)).toEqual({ value: '123456', complete: true });
    type(cells[5], '7');
    expect(done).toHaveBeenCalledTimes(1);
    expect(api.complete).toBe(true);
    expect(root.hasAttribute('data-otp-complete')).toBe(true);
  });

  it('submits the form when complete with -autosubmit', () => {
    const { form, cells } = setup('data-m-otp-autosubmit');
    const submitted = vi.fn((e) => e.preventDefault());
    form.addEventListener('submit', submitted);
    form.requestSubmit ||= function requestSubmit() { this.dispatchEvent(new Event('submit', { cancelable: true })); };
    paste(cells[0], '111111');
    expect(submitted).toHaveBeenCalledTimes(1);
  });

  it('takes letters and digits in alphanumeric mode, shown upper case', () => {
    const { cells, api } = setup('data-m-otp-type="alphanumeric" data-m-otp-length="8"', '');
    expect(cells).toHaveLength(8);
    expect(cells[0].getAttribute('inputmode')).toBe('text');
    expect(cells[0].getAttribute('aria-label')).toBe('Character 1 of 8');
    paste(cells[0], 'ab3x-9kq2');
    expect(api.value).toBe('AB3X9KQ2');
  });

  it('shows error and success states', () => {
    const { root, cells, api } = setup();
    api.value = '000000';
    api.error();
    expect(root.dataset.state).toBe('error');
    expect(cells.every((c) => c.getAttribute('aria-invalid') === 'true')).toBe(true);
    cells[0].focus();
    type(cells[0], '1');
    expect(root.hasAttribute('data-state')).toBe(false);
    expect(cells[0].hasAttribute('aria-invalid')).toBe(false);
    api.success();
    expect(root.dataset.state).toBe('success');
    api.reset();
    expect(api.state).toBe(null);
  });

  it('clears after an error when asked', async () => {
    vi.useFakeTimers();
    const { api } = setup();
    api.value = '999999';
    api.error(true);
    vi.advanceTimersByTime(500);
    expect(api.value).toBe('');
  });

  it('disables every cell, masks with a class and sets values without stealing focus', () => {
    const { root, cells, api } = setup('data-m-otp-masked data-m-otp-disabled');
    expect(cells.every((c) => c.disabled)).toBe(true);
    expect(root.classList.contains('otp-masked')).toBe(true);
    expect(root.hasAttribute('data-disabled')).toBe(true);
    api.disabled = false;
    const outside = document.createElement('button');
    document.body.append(outside);
    outside.focus();
    api.value = '1234';
    expect(document.activeElement).toBe(outside);
    expect(api.value).toBe('1234');
  });

  it('marks the cells invalid and focuses the first empty one when the form is invalid', () => {
    const { root, field, cells } = setup('', '<input class="otp-field" name="code" maxlength="6" required>');
    field.dispatchEvent(new Event('invalid', { cancelable: true }));
    expect(root.dataset.state).toBe('error');
    expect(document.activeElement).toBe(cells[0]);
  });

  it('clears on form reset', async () => {
    const { form, api } = setup();
    api.value = '123456';
    form.reset();
    await tick(5);
    expect(api.value).toBe('');
  });

  it('keeps the old markup with ready made boxes working', () => {
    const box = mount(`<div class="otp" data-m-otp data-m-otp-name="code">
      <input class="otp-input" maxlength="1"><input class="otp-input" maxlength="1"><span class="otp-separator"></span>
      <input class="otp-input" maxlength="1"><input class="otp-input" maxlength="1"></div>`);
    const root = box.querySelector('.otp');
    const cells = [...root.querySelectorAll('.otp-input')];
    expect(cells).toHaveLength(4);
    paste(cells[0], '9876');
    expect(root.querySelector('input[name=code]').value).toBe('9876');
    expect(root.monsoon.otp.value).toBe('9876');
  });

  it('restores the markup on destroy', () => {
    const { root, field } = setup();
    root.monsoon.otp.destroy();
    expect(root.querySelectorAll('.otp-input')).toHaveLength(0);
    expect(field.hasAttribute('aria-hidden')).toBe(false);
    expect(field.hasAttribute('tabindex')).toBe(false);
    expect(root.hasAttribute('data-otp-ready')).toBe(false);
  });

  it('uses the label of the field as the group name', () => {
    const box = mount('<label for="c1">Code from the app</label><div class="otp" data-m-otp><input id="c1" class="otp-field" maxlength="6"></div>');
    const root = box.querySelector('.otp');
    expect(root.getAttribute('aria-labelledby')).toBe(box.querySelector('label').id);
  });
});

// Reference QR encoder written independently of the module: carry-less
// multiplication instead of log tables, the block table from the standard,
// reserved areas drawn as rectangles and format bits as MSB first strings.
const ref = (() => {
  const gmul = (a, b) => {
    let r = 0;
    while (b) {
      if (b & 1) r ^= a;
      a <<= 1;
      if (a & 0x100) a ^= 0x11d;
      b >>= 1;
    }
    return r;
  };
  const gpow = (e) => {
    let r = 1;
    for (let i = 0; i < e; i++) r = gmul(r, 2);
    return r;
  };
  const generator = (n) => {
    let g = [1];
    for (let i = 0; i < n; i++) {
      const root = gpow(i);
      const next = new Array(g.length + 1).fill(0);
      for (let j = 0; j < g.length; j++) {
        next[j] ^= g[j];
        next[j + 1] ^= gmul(g[j], root);
      }
      g = next;
    }
    return g;
  };
  const remainder = (data, n) => {
    const g = generator(n);
    const buf = [...data, ...new Array(n).fill(0)];
    for (let i = 0; i < data.length; i++) {
      const c = buf[i];
      if (c) for (let j = 0; j < g.length; j++) buf[i + j] ^= gmul(g[j], c);
    }
    return buf.slice(data.length);
  };
  // [groups of [count, data codewords]], EC codewords per block, level M.
  const BLOCKS = [null, [[[1, 16]], 10], [[[1, 28]], 16], [[[1, 44]], 26], [[[2, 32]], 18], [[[2, 43]], 24],
    [[[4, 27]], 16], [[[4, 31]], 18], [[[2, 38], [2, 39]], 22], [[[3, 36], [2, 37]], 22], [[[4, 43], [1, 44]], 26]];
  const ALIGN = [null, [], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34], [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50]];
  const FORMAT_M = ['101010000010010', '101000100100101', '101111001111100', '101101101001011',
    '100010111111001', '100000011001110', '100111110010111', '100101010100000'];
  const VERSION = { 7: '000111110010010100', 8: '001000010110111100', 9: '001001101010011001', 10: '001010010011010011' };
  const capacity = (v) => BLOCKS[v][0].reduce((a, [c, d]) => a + c * d, 0);
  const formatCells = (size) => ({
    a: [[8, 0], [8, 1], [8, 2], [8, 3], [8, 4], [8, 5], [8, 7], [8, 8], [7, 8], [5, 8], [4, 8], [3, 8], [2, 8], [1, 8], [0, 8]],
    b: [...Array.from({ length: 7 }, (_, k) => [size - 1 - k, 8]), ...Array.from({ length: 8 }, (_, k) => [8, size - 8 + k])],
  });
  const maskFn = [
    (r, c) => (r + c) % 2 === 0, (r) => r % 2 === 0, (r, c) => c % 3 === 0, (r, c) => (r + c) % 3 === 0,
    (r, c) => (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0, (r, c) => ((r * c) % 2) + ((r * c) % 3) === 0,
    (r, c) => (((r * c) % 2) + ((r * c) % 3)) % 2 === 0, (r, c) => (((r * c) % 3) + ((r + c) % 2)) % 2 === 0,
  ];
  const layout = (v) => {
    const size = 17 + 4 * v;
    const m = Array.from({ length: size }, () => new Array(size).fill(0));
    const reserved = Array.from({ length: size }, () => new Array(size).fill(false));
    const rect = (r0, c0, h, w) => { for (let r = r0; r < r0 + h; r++) for (let c = c0; c < c0 + w; c++) reserved[r][c] = true; };
    rect(0, 0, 9, 9);
    rect(0, size - 8, 9, 8);
    rect(size - 8, 0, 8, 9);
    rect(6, 0, 1, size);
    rect(0, 6, size, 1);
    if (v >= 7) {
      rect(0, size - 11, 6, 3);
      rect(size - 11, 0, 3, 6);
    }
    const finder = (r0, c0) => {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          const ring = Math.min(r, c, 6 - r, 6 - c);
          m[r0 + r][c0 + c] = ring === 1 ? 0 : 1;
        }
      }
    };
    finder(0, 0);
    finder(0, size - 7);
    finder(size - 7, 0);
    for (let k = 8; k < size - 8; k++) {
      m[6][k] = k % 2 === 0 ? 1 : 0;
      m[k][6] = k % 2 === 0 ? 1 : 0;
    }
    const al = ALIGN[v];
    const inFinder = (r, c) => (r < 9 && c < 9) || (r < 9 && c >= size - 8) || (r >= size - 8 && c < 9);
    for (const r of al) {
      for (const c of al) {
        if (inFinder(r, c)) continue;
        rect(r - 2, c - 2, 5, 5);
        for (let dr = -2; dr <= 2; dr++) for (let dc = -2; dc <= 2; dc++) m[r + dr][c + dc] = Math.max(Math.abs(dr), Math.abs(dc)) === 1 ? 0 : 1;
      }
    }
    m[size - 8][8] = 1;
    if (v >= 7) {
      const bits = VERSION[v];
      for (let i = 0; i < 18; i++) {
        const bit = Number(bits[17 - i]);
        const r = Math.floor(i / 3);
        const c = size - 11 + (i % 3);
        m[r][c] = bit;
        m[c][r] = bit;
      }
    }
    return { size, m, reserved };
  };
  const order = (size, reserved) => {
    const cells = [];
    let up = true;
    for (let c = size - 1; c > 0; c -= 2) {
      if (c === 6) c--;
      for (let k = 0; k < size; k++) {
        const r = up ? size - 1 - k : k;
        for (const cc of [c, c - 1]) if (!reserved[r][cc]) cells.push([r, cc]);
      }
      up = !up;
    }
    return cells;
  };
  const encode = (text, mask) => {
    const bytes = [...new TextEncoder().encode(text)];
    let v = 1;
    while (4 + (v < 10 ? 8 : 16) + 8 * bytes.length > 8 * capacity(v)) v++;
    let bits = `0100${bytes.length.toString(2).padStart(v < 10 ? 8 : 16, '0')}${bytes.map((b) => b.toString(2).padStart(8, '0')).join('')}`;
    const cap = 8 * capacity(v);
    bits += '0'.repeat(Math.min(4, cap - bits.length));
    bits += '0'.repeat((8 - (bits.length % 8)) % 8);
    const data = bits.match(/.{8}/g).map((b) => parseInt(b, 2));
    for (let i = 0; data.length < capacity(v); i++) data.push(i % 2 ? 0x11 : 0xec);
    const [groups, ec] = BLOCKS[v];
    const blocks = [];
    let at = 0;
    for (const [count, len] of groups) {
      for (let k = 0; k < count; k++) {
        const d = data.slice(at, at + len);
        at += len;
        blocks.push({ d, e: remainder(d, ec) });
      }
    }
    const stream = [];
    const longest = Math.max(...blocks.map((b) => b.d.length));
    for (let i = 0; i < longest; i++) for (const b of blocks) if (i < b.d.length) stream.push(b.d[i]);
    for (let i = 0; i < ec; i++) for (const b of blocks) stream.push(b.e[i]);
    const { size, m, reserved } = layout(v);
    const cells = order(size, reserved);
    const flat = stream.flatMap((b) => b.toString(2).padStart(8, '0').split('').map(Number));
    cells.forEach(([r, c], i) => {
      const bit = i < flat.length ? flat[i] : 0;
      m[r][c] = bit ^ (maskFn[mask](r, c) ? 1 : 0);
    });
    const f = FORMAT_M[mask];
    const { a, b } = formatCells(size);
    a.forEach(([r, c], i) => { m[r][c] = Number(f[i]); });
    b.forEach(([r, c], i) => { m[r][c] = Number(f[i]); });
    return { version: v, size, modules: m, stream };
  };
  // Reader: format from the first copy, unmask, read in placement order,
  // split blocks back, check the Reed-Solomon syndromes, parse byte mode.
  const decode = (m) => {
    const size = m.length;
    const v = (size - 17) / 4;
    const { a, b } = formatCells(size);
    const fa = a.map(([r, c]) => m[r][c]).join('');
    const fb = b.map(([r, c]) => m[r][c]).join('');
    const mask = FORMAT_M.indexOf(fa);
    if (mask < 0 || fa !== fb) throw new Error('format information does not match level M');
    if (v >= 7) {
      const bits = VERSION[v];
      for (let i = 0; i < 18; i++) {
        const r = Math.floor(i / 3);
        const c = size - 11 + (i % 3);
        if (m[r][c] !== Number(bits[17 - i]) || m[c][r] !== Number(bits[17 - i])) throw new Error('version information');
      }
    }
    const { reserved } = layout(v);
    const flat = order(size, reserved).map(([r, c]) => m[r][c] ^ (maskFn[mask](r, c) ? 1 : 0));
    const [groups, ec] = BLOCKS[v];
    const lens = groups.flatMap(([count, len]) => new Array(count).fill(len));
    const total = lens.reduce((x, y) => x + y, 0) + ec * lens.length;
    const words = [];
    for (let i = 0; i < total; i++) words.push(parseInt(flat.slice(i * 8, i * 8 + 8).join(''), 2));
    const blocks = lens.map(() => ({ d: [], e: [] }));
    let k = 0;
    for (let i = 0; i < Math.max(...lens); i++) lens.forEach((len, j) => { if (i < len) blocks[j].d.push(words[k++]); });
    for (let i = 0; i < ec; i++) blocks.forEach((bl) => bl.e.push(words[k++]));
    for (const bl of blocks) {
      const poly = [...bl.d, ...bl.e];
      for (let i = 0; i < ec; i++) {
        const x = gpow(i);
        let s = 0;
        for (const c of poly) s = gmul(s, x) ^ c;
        if (s !== 0) throw new Error(`syndrome ${i} is ${s}`);
      }
    }
    const bits = blocks.flatMap((bl) => bl.d).map((x) => x.toString(2).padStart(8, '0')).join('');
    if (bits.slice(0, 4) !== '0100') throw new Error('not byte mode');
    const countBits = v < 10 ? 8 : 16;
    const n = parseInt(bits.slice(4, 4 + countBits), 2);
    const out = [];
    for (let i = 0; i < n; i++) out.push(parseInt(bits.slice(4 + countBits + i * 8, 12 + countBits + i * 8), 2));
    return { text: new TextDecoder().decode(new Uint8Array(out)), mask, version: v };
  };
  return { encode, decode, remainder, FORMAT_M, VERSION, ALIGN, capacity };
})();

const SAMPLES = [
  'A',
  'https://example.com',
  'otpauth://totp/Example:you%40example.com?secret=JBSWY3DPEHPK3PXP&issuer=Example',
  'otpauth://totp/Example%20Cloud:someone.with.a.long.address%40subdomain.example.com?secret=JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP&issuer=Example%20Cloud&algorithm=SHA1&digits=6&period=30',
  'Olá, São Paulo! Ünïcödé text in UTF-8',
  'x'.repeat(200),
];

describe('QR encoder', () => {
  it('computes Reed-Solomon codewords like the published HELLO WORLD 1-M example', () => {
    const data = [32, 91, 11, 120, 209, 114, 220, 77, 67, 64, 236, 17, 236, 17, 236, 17];
    expect(rsEncode(data, 10)).toEqual([196, 35, 39, 119, 235, 215, 231, 226, 93, 23]);
    expect(ref.remainder(data, 10)).toEqual([196, 35, 39, 119, 235, 215, 231, 226, 93, 23]);
  });

  it('matches the reference for other block sizes', () => {
    const data = Array.from({ length: 43 }, (_, i) => (i * 37 + 11) & 255);
    for (const n of [16, 18, 22, 24, 26]) expect(rsEncode(data, n)).toEqual(ref.remainder(data, n));
  });

  it('builds the format information table for level M', () => {
    expect([0, 1, 2, 3, 4, 5, 6, 7].map((k) => formatBits(k).toString(2).padStart(15, '0'))).toEqual(ref.FORMAT_M);
  });

  it('builds the version information for versions 7 to 10', () => {
    for (const v of [7, 8, 9, 10]) expect(versionBits(v).toString(2).padStart(18, '0')).toBe(ref.VERSION[v]);
    expect(versionBits(7)).toBe(0x07c94);
  });

  it('knows the data capacity and alignment positions of versions 1 to 10', () => {
    for (let v = 1; v <= 10; v++) {
      expect(dataCodewords(v), `v${v}`).toBe(ref.capacity(v));
      expect(alignmentPositions(v), `v${v}`).toEqual(ref.ALIGN[v]);
    }
  });

  it('pads data with 0xEC 0x11 and interleaves like the reference', () => {
    const bytes = [...new TextEncoder().encode('hello')];
    const data = encodeData(bytes, 1);
    expect(data.slice(0, 7)).toEqual([0x40, 0x56, 0x86, 0x56, 0xc6, 0xc6, 0xf0]);
    expect(data.slice(7)).toEqual([0xec, 0x11, 0xec, 0x11, 0xec, 0x11, 0xec, 0x11, 0xec]);
    const text = SAMPLES[3];
    const r = ref.encode(text, 0);
    expect(interleave(encodeData([...new TextEncoder().encode(text)], r.version), r.version)).toEqual(r.stream);
  });

  it('produces the same module matrix as the reference for every mask', () => {
    for (const text of SAMPLES) {
      for (let mask = 0; mask < 8; mask++) {
        const mine = encodeQr(text, { mask });
        const theirs = ref.encode(text, mask);
        expect(mine.version, text).toBe(theirs.version);
        expect(mine.modules, `${text} mask ${mask}`).toEqual(theirs.modules);
      }
    }
  });

  it('picks versions 1 to 10 by length and refuses longer text', () => {
    expect(encodeQr('A').version).toBe(1);
    expect(encodeQr('x'.repeat(14)).version).toBe(1);
    expect(encodeQr('x'.repeat(15)).version).toBe(2);
    expect(encodeQr('x'.repeat(213)).version).toBe(10);
    expect(() => encodeQr('x'.repeat(214))).toThrow(RangeError);
    expect(encodeQr('A', { minVersion: 3 }).size).toBe(29);
  });

  it('draws finder, timing, alignment and dark module, with both format copies readable', () => {
    const { modules: m, size, version, mask } = encodeQr(SAMPLES[2]);
    expect(size).toBe(version * 4 + 17);
    const row = (r, c0, n) => m[r].slice(c0, c0 + n).join('');
    for (const [r, c] of [[0, 0], [0, size - 7], [size - 7, 0]]) {
      expect(row(r, c, 7)).toBe('1111111');
      expect(row(r + 1, c, 7)).toBe('1000001');
      expect(row(r + 3, c, 7)).toBe('1011101');
      expect(row(r + 6, c, 7)).toBe('1111111');
    }
    expect(row(7, 0, 8)).toBe('00000000');
    expect(row(6, 8, size - 16)).toBe('10'.repeat(size).slice(0, size - 16));
    expect(m.slice(8, size - 8).map((r) => r[6]).join('')).toBe('10'.repeat(size).slice(0, size - 16));
    expect(m[size - 8][8]).toBe(1);
    const last = alignmentPositions(version).at(-1);
    expect(row(last - 2, last - 2, 5)).toBe('11111');
    expect(row(last, last - 2, 5)).toBe('10101');
    const decoded = ref.decode(m);
    expect(decoded.mask).toBe(mask);
  });

  it('round trips through an independent reader for every sample', () => {
    for (const text of SAMPLES) {
      const q = encodeQr(text);
      const d = ref.decode(q.modules);
      expect(d.text).toBe(text);
      expect(d.version).toBe(q.version);
      expect(q.mask).toBeGreaterThanOrEqual(0);
      expect(q.mask).toBeLessThan(8);
    }
  });

  it('chooses the mask with the lowest penalty', () => {
    const text = SAMPLES[2];
    const scores = [0, 1, 2, 3, 4, 5, 6, 7].map((k) => penalty(encodeQr(text, { mask: k }).modules));
    expect(encodeQr(text).mask).toBe(scores.indexOf(Math.min(...scores)));
  });

  it('writes an SVG path with one run per row segment', () => {
    expect(qrPath([[1, 1, 0, 1]], 0)).toBe('M0 0h2v1h-2zM3 0h1v1h-1z');
    const svg = qrSvg('https://example.com', { border: 2, label: 'Link <here>' });
    expect(svg).toMatch(/^<svg [^>]*viewBox="0 0 29 29"/);
    expect(svg).toContain('aria-label="Link &#60;here&#62;"');
    expect(svg).toContain('role="img"');
  });

  it('renders into data-m-qr and redraws when the value changes', () => {
    const box = mount('<div class="qr" data-m-qr data-m-qr-value="https://example.com" data-m-qr-label="Example link"></div>');
    const el = box.querySelector('.qr');
    const svg = el.querySelector('svg.qr-code');
    expect(svg).toBeTruthy();
    expect(svg.getAttribute('aria-label')).toBe('Example link');
    expect(el.monsoon.qr.version).toBe(2);
    const events = [];
    el.addEventListener('monsoon:qr-render', (e) => events.push(e.detail));
    el.monsoon.qr.value = SAMPLES[3];
    expect(el.querySelectorAll('svg')).toHaveLength(1);
    expect(events[0].version).toBe(encodeQr(SAMPLES[3]).version);
    el.monsoon.qr.value = 'x'.repeat(300);
    expect(el.hasAttribute('data-qr-error')).toBe(true);
    expect(el.querySelector('svg')).toBe(null);
  });
});

describe('resend countdown', () => {
  it('formats seconds as m:ss or h:mm:ss', () => {
    expect(formatCountdown(0)).toBe('0:00');
    expect(formatCountdown(9)).toBe('0:09');
    expect(formatCountdown(29.2)).toBe('0:30');
    expect(formatCountdown(75)).toBe('1:15');
    expect(formatCountdown(3700)).toBe('1:01:40');
    expect(formatCountdown(-5)).toBe('0:00');
  });

  it('starts disabled, counts down and enables again', () => {
    vi.useFakeTimers();
    const box = mount('<p><button type="button" data-m-auth-resend data-m-auth-resend-seconds="30">Resend code</button></p>');
    const btn = box.querySelector('button');
    const ready = vi.fn();
    btn.addEventListener('monsoon:auth-resend-ready', ready);
    expect(btn.disabled).toBe(true);
    expect(btn.textContent).toBe('Resend codein 0:30');
    expect(btn.querySelector('.auth-countdown').textContent).toBe('in 0:30');
    vi.advanceTimersByTime(10_100);
    expect(btn.querySelector('.auth-countdown').textContent).toBe('in 0:20');
    expect(btn.monsoon.authResend.remaining).toBe(20);
    vi.advanceTimersByTime(20_100);
    expect(btn.disabled).toBe(false);
    expect(btn.querySelector('.auth-countdown')).toBe(null);
    expect(ready).toHaveBeenCalledTimes(1);
  });

  it('fires a cancelable event on click and restarts unless prevented', () => {
    vi.useFakeTimers();
    const box = mount('<button type="button" data-m-auth-resend data-m-auth-resend-idle data-m-auth-resend-seconds="5">Resend</button>');
    const btn = box.querySelector('button');
    expect(btn.disabled).toBe(false);
    let block = true;
    btn.addEventListener('monsoon:auth-resend', (e) => { if (block) e.preventDefault(); });
    btn.click();
    expect(btn.disabled).toBe(false);
    block = false;
    btn.click();
    expect(btn.disabled).toBe(true);
    vi.advanceTimersByTime(5_100);
    expect(btn.disabled).toBe(false);
  });

  it('uses aria-disabled on links', () => {
    vi.useFakeTimers();
    const box = mount('<a href="#" data-m-auth-resend data-m-auth-resend-seconds="3">Resend</a>');
    const a = box.querySelector('a');
    expect(a.getAttribute('aria-disabled')).toBe('true');
    const e = new MouseEvent('click', { bubbles: true, cancelable: true });
    a.dispatchEvent(e);
    expect(e.defaultPrevented).toBe(true);
  });
});

describe('phone numbers', () => {
  it('formats as you type for several countries', () => {
    expect(formatPhone('5550100123', 'US')).toBe('(555) 010-0123');
    expect(formatPhone('555', 'US')).toBe('(555');
    expect(formatPhone('5550', 'US')).toBe('(555) 0');
    expect(formatPhone('1 555 010 0123', 'US')).toBe('(555) 010-0123');
    expect(formatPhone('11987650474', 'BR')).toBe('(11) 98765-0474');
    expect(formatPhone('1133334444', 'BR')).toBe('(11) 3333-4444');
    expect(formatPhone('07400123456', 'GB')).toBe('7400 123456');
    expect(formatPhone('0612345678', 'FR')).toBe('6 12 34 56 78');
    expect(formatPhone('9876543210', 'IN')).toBe('98765 43210');
    expect(formatPhone('09012345678', 'JP')).toBe('90-1234-5678');
    expect(formatPhone('912345678', 'PT')).toBe('912 345 678');
    expect(formatPhone('5550100123999', 'US')).toBe('(555) 010-0123');
    expect(formatPhone('', 'US')).toBe('');
  });

  it('builds E.164 numbers and checks completeness', () => {
    expect(toE164('(11) 98765-0474', 'BR')).toBe('+5511987650474');
    expect(toE164('07400 123456', 'GB')).toBe('+447400123456');
    expect(toE164('', 'US')).toBe('');
    expect(isComplete('(555) 010-0123', 'US')).toBe(true);
    expect(isComplete('(555) 010', 'US')).toBe(false);
    expect(nationalDigits('0612345678', country('FR'))).toBe('612345678');
  });

  it('reads international numbers and searches countries', () => {
    expect(parseInternational('+44 7400 123456')).toEqual({ iso: 'GB', national: '7400123456' });
    expect(parseInternational('+351 912 345 678')).toEqual({ iso: 'PT', national: '912345678' });
    expect(parseInternational('+1 555', 'CA')).toEqual({ iso: 'CA', national: '555' });
    expect(parseInternational('+35')).toBe(null);
    expect(searchCountries('+44')[0].iso).toBe('GB');
    expect(searchCountries('bra')[0].iso).toBe('BR');
    expect(searchCountries('kingdom').map((c) => c.iso)).toEqual(['GB']);
    expect(searchCountries('sao').length).toBe(0);
    expect(searchCountries('')).toBe(COUNTRIES);
  });

  it('places the caret after the same digit', () => {
    expect(caretAfterDigits('(555) 010-0123', 3)).toBe(4);
    expect(caretAfterDigits('(555) 010-0123', 4)).toBe(7);
    expect(caretAfterDigits('(555) 010-0123', 0)).toBe(1);
  });

  it('draws flags as SVG or falls back to the two letter code', () => {
    expect(flagHtml('BR')).toMatch(/^<svg class="phone-input-flag"/);
    expect(flagHtml('ZA')).toBe('<span class="phone-input-flag phone-input-code" aria-hidden="true">ZA</span>');
    for (const iso of Object.keys(FLAGS)) expect(COUNTRIES.some((c) => c.iso === iso), iso).toBe(true);
  });

  it('enhances the select and the tel input', () => {
    const box = mount(`<div class="phone-input" data-m-auth-phone data-m-auth-phone-name="e164">
      <select class="phone-input-select" name="country"><option value="US">United States</option><option value="BR" selected>Brazil</option><option value="GB">United Kingdom</option></select>
      <input class="phone-input-field" type="tel" name="phone" value="11987650474"></div>`);
    const root = box.querySelector('.phone-input');
    const select = root.querySelector('select');
    const input = root.querySelector('input[type=tel]');
    const hidden = root.querySelector('input[name=e164]');
    const button = root.querySelector('.phone-input-country');
    expect(select.hidden).toBe(true);
    expect(button.textContent).toBe('+55');
    expect(button.getAttribute('aria-label')).toBe('Country: Brazil (+55)');
    expect(input.value).toBe('(11) 98765-0474');
    expect(hidden.value).toBe('+5511987650474');

    const events = [];
    root.addEventListener('monsoon:auth-phone', (e) => events.push(e.detail));
    input.focus();
    type(input, '+44 7400 123456');
    expect(select.value).toBe('GB');
    expect(input.value).toBe('7400 123456');
    expect(hidden.value).toBe('+447400123456');
    expect(events.at(-1)).toMatchObject({ country: 'GB', e164: '+447400123456', valid: true });

    button.click();
    const menu = root.querySelector('.phone-input-menu');
    const search = menu.querySelector('.phone-input-search');
    expect(menu.hidden).toBe(false);
    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(document.activeElement).toBe(search);
    type(search, 'united s');
    expect([...menu.querySelectorAll('[role=option]')].map((o) => o.dataset.iso)).toEqual(['US']);
    key(search, 'Enter');
    expect(menu.hidden).toBe(true);
    expect(select.value).toBe('US');
    expect(input.value).toBe('(740) 012-3456');
    expect(hidden.value).toBe('+17400123456');
    type(input, '5550100123');
    expect(input.value).toBe('(555) 010-0123');
    expect(hidden.value).toBe('+15550100123');

    button.click();
    key(search, 'ArrowDown');
    expect(search.getAttribute('aria-activedescendant')).toMatch(/-CA$/);
    key(search, 'Escape');
    expect(menu.hidden).toBe(true);
    expect(document.activeElement).toBe(button);
  });

  it('keeps a typed + until the dial code is known', () => {
    const box = mount('<div class="phone-input" data-m-auth-phone><input type="tel"></div>');
    const input = box.querySelector('input');
    type(input, '+3');
    expect(input.value).toBe('+3');
    type(input, '+351');
    expect(box.querySelector('.phone-input').monsoon.authPhone.country).toBe('PT');
    expect(input.value).toBe('');
  });
});

describe('password strength', () => {
  it('checks every rule', () => {
    const r = checkPassword('Monsoon-Rain-42!');
    expect(r.rules).toEqual({ length: true, lower: true, upper: true, number: true, symbol: true, common: true });
    expect(r.score).toBe(4);
    expect(r.label).toBe('Strong');
    expect(r.valid).toBe(true);
    expect(checkPassword('short1!A').rules.length).toBe(false);
    expect(checkPassword('Short1!A', { min: 8 }).rules.length).toBe(true);
  });

  it('rates common passwords, runs and repeats as weak', () => {
    expect(isCommon('Password123!')).toBe(true);
    expect(isCommon('qwerty')).toBe(true);
    expect(isCommon('aaaa-Bb-77-x')).toBe(true);
    expect(isCommon('xx-abcd-yy')).toBe(true);
    expect(isCommon('Lisbon-River-82', ['lisbon'])).toBe(true);
    expect(hasRun('zyx9876')).toBe(true);
    expect(hasRun('k8#Lq2!v')).toBe(false);
    expect(checkPassword('Password123!').score).toBe(1);
    expect(checkPassword('Password123!').label).toBe(STRENGTH_LABELS[1]);
  });

  it('scores length, variety and passphrases', () => {
    expect(checkPassword('').score).toBe(0);
    expect(checkPassword('').label).toBe('');
    expect(checkPassword('abc').score).toBe(0);
    expect(checkPassword('Tr0ub4dor&3').score).toBe(2);
    expect(checkPassword('correct horse battery staple').score).toBe(3);
    expect(checkPassword('k8#Lq2!vZp9@').score).toBe(4);
  });

  it('updates the checklist, meter and reveal toggle', () => {
    const box = mount(`<div data-m-auth-password data-m-auth-password-min="10">
      <div class="password-field"><input type="password" class="input"><button type="button" class="password-field-toggle" aria-pressed="false" aria-label="Show password"></button></div>
      <div class="auth-strength"><span class="auth-strength-bar"></span><span class="auth-strength-label"></span></div>
      <ul class="auth-rules"><li class="auth-rule" data-rule="length">10+</li><li class="auth-rule" data-rule="number">Number</li><li class="auth-rule" data-rule="common">Common</li></ul>
    </div>`);
    const root = box.firstElementChild;
    const input = root.querySelector('input');
    const meter = root.querySelector('.auth-strength');
    const events = [];
    root.addEventListener('monsoon:auth-password', (e) => events.push(e.detail.score));
    expect(meter.hasAttribute('data-score')).toBe(false);
    expect(input.getAttribute('aria-describedby').split(' ')).toHaveLength(2);
    type(input, 'password');
    expect(meter.dataset.score).toBe('1');
    expect(root.querySelector('[data-rule=common]').hasAttribute('data-met')).toBe(false);
    type(input, 'Rain-forest-42');
    expect(meter.dataset.score).toBe('4');
    expect(root.querySelector('.auth-strength-label').textContent).toBe('Strong');
    expect(root.querySelector('[data-rule=length]').hasAttribute('data-met')).toBe(true);
    expect(root.querySelector('[data-rule=number] .sr-only').textContent).toBe(' (done)');
    expect(events).toEqual([1, 4]);
    const toggle = root.querySelector('.password-field-toggle');
    toggle.click();
    expect(input.type).toBe('text');
    expect(toggle.getAttribute('aria-pressed')).toBe('true');
    expect(toggle.getAttribute('aria-label')).toBe('Hide password');
    toggle.click();
    expect(input.type).toBe('password');
  });
});

describe('recovery codes', () => {
  const html = `<div class="backup-codes" data-m-auth-codes data-m-auth-codes-filename="codes.txt">
    <ol><li class="backup-code"><code>AAAA-1111</code></li><li class="backup-code backup-code-used"><code>BBBB-2222</code></li><li class="backup-code"><code>CCCC-3333</code></li></ol>
    <button data-codes-action="copy">Copy</button><button data-codes-action="download">Download</button>
    <input type="checkbox" data-codes-action="confirm"><button data-codes-action="continue" disabled>Continue</button></div>`;

  it('reads unused codes and writes a text file', () => {
    const box = mount(html);
    expect(readCodes(box)).toEqual(['AAAA-1111', 'CCCC-3333']);
    const text = codesText(['AAAA-1111'], { title: 'Example', date: new Date('2026-10-13T12:00:00Z') });
    expect(text).toBe('Example\nSaved on 2026-10-13\n\n 1. AAAA-1111\n\nEach code works once. Keep this file somewhere safe and private.\n');
  });

  it('keeps Continue disabled until the codes are marked as saved', () => {
    const box = mount(html);
    const confirm = box.querySelector('[data-codes-action=confirm]');
    const next = box.querySelector('[data-codes-action=continue]');
    expect(next.disabled).toBe(true);
    confirm.click();
    expect(next.disabled).toBe(false);
    confirm.click();
    expect(next.disabled).toBe(true);
  });

  it('copies all unused codes and downloads them', async () => {
    const writeText = vi.fn(() => Promise.resolve());
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    const box = mount(html);
    const root = box.querySelector('.backup-codes');
    const actions = [];
    root.addEventListener('monsoon:auth-codes', (e) => actions.push(e.detail.action));
    box.querySelector('[data-codes-action=copy]').click();
    await tick();
    expect(writeText).toHaveBeenCalledWith('AAAA-1111\nCCCC-3333');
    expect(box.querySelector('[data-codes-action=copy]').hasAttribute('data-done')).toBe(true);
    const clicks = [];
    const orig = HTMLAnchorElement.prototype.click;
    HTMLAnchorElement.prototype.click = function click() { clicks.push(this.download); };
    box.querySelector('[data-codes-action=download]').click();
    HTMLAnchorElement.prototype.click = orig;
    expect(clicks).toEqual(['codes.txt']);
    expect(actions).toEqual(['copy', 'download']);
  });
});
