// @vitest-environment jsdom
// Media components of the interactive layer: pure rules and geometry, then
// enhancement of the markup in a DOM.
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { enhance, readOptions } from '../src/js/core.mjs';
import {
  dropzone, fileKind, formatBytes, indexAt, matchesAccept, moveItem, parseSize, setInputFiles, validateFiles,
} from '../src/js/components/dropzone.mjs';
import {
  clampCenter, constrainBox, cropData, cropper, fitScale, initialBox, intersect, moveBox, outputSize, parseAspect,
  reshapeBox, resizeBox, rotatedSize, zoomAt,
} from '../src/js/components/cropper.mjs';
import { avatarUpload, outputName } from '../src/js/components/avatar-upload.mjs';
import { clampPan, collect, fileNameFrom, imageViewer, panLimit } from '../src/js/components/image-viewer.mjs';
import { mediaGallery, selectRange } from '../src/js/components/media-gallery.mjs';
import { compare, positionFrom } from '../src/js/components/compare.mjs';
import { segments, signature, strokeWidths, toSvg } from '../src/js/components/signature.mjs';

const file = (name, size = 10, type = '') => new File([new Uint8Array(size)], name, { type, lastModified: 1 });
const rect = (width, height, left = 0, top = 0) => ({ width, height, left, top, right: left + width, bottom: top + height, x: left, y: top });
const close = (a, b, digits = 1) => Object.keys(b).forEach((k) => expect(a[k], k).toBeCloseTo(b[k], digits));
const tick = () => new Promise((r) => setTimeout(r, 30));

beforeAll(() => {
  HTMLDialogElement.prototype.showModal ||= function showModal() { this.open = true; };
  HTMLDialogElement.prototype.close = function close(v) {
    if (!this.open) return;
    this.open = false;
    if (v !== undefined) this.returnValue = v;
    this.dispatchEvent(new Event('close'));
  };
  URL.createObjectURL ||= () => 'blob:test';
  URL.revokeObjectURL ||= () => {};
});

describe('file rules', () => {
  it('parses sizes', () => {
    expect(parseSize('5mb')).toBe(5 * 1024 * 1024);
    expect(parseSize('500 KB')).toBe(500 * 1024);
    expect(parseSize('1.5gb')).toBe(Math.round(1.5 * 1024 ** 3));
    expect(parseSize('2048')).toBe(2048);
    expect(parseSize('')).toBe(Infinity);
    expect(parseSize(undefined)).toBe(Infinity);
    expect(parseSize('lots')).toBe(Infinity);
  });

  it('formats sizes', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(1023)).toBe('1023 B');
    expect(formatBytes(1536)).toBe('1.5 KB');
    expect(formatBytes(10 * 1024 * 1024)).toBe('10 MB');
    expect(formatBytes(250 * 1024 * 1024)).toBe('250 MB');
  });

  it('matches accept lists by extension, wildcard and exact type', () => {
    expect(matchesAccept(file('a.PNG', 1, 'image/png'), 'image/*')).toBe(true);
    expect(matchesAccept(file('a.pdf', 1, 'application/pdf'), 'image/*, .pdf')).toBe(true);
    expect(matchesAccept(file('a.exe', 1, 'application/x-msdownload'), 'image/*,.pdf')).toBe(false);
    expect(matchesAccept(file('a.csv', 1, 'text/csv'), 'text/csv')).toBe(true);
    expect(matchesAccept(file('a.bin'), '')).toBe(true);
  });

  it('picks a preview kind', () => {
    expect(fileKind(file('a.gif', 1, 'image/gif'))).toBe('image');
    expect(fileKind(file('a.mp4', 1, 'video/mp4'))).toBe('video');
    expect(fileKind(file('a.mp3', 1, 'audio/mpeg'))).toBe('audio');
    expect(fileKind(file('a.pdf', 1, 'application/pdf'))).toBe('pdf');
    expect(fileKind(file('a.zip'))).toBe('archive');
    expect(fileKind(file('a.xlsx'))).toBe('sheet');
    expect(fileKind(file('a.docx'))).toBe('doc');
    expect(fileKind(file('a.json'))).toBe('code');
    expect(fileKind(file('a.xyz'))).toBe('file');
  });

  it('validates type, size, count and duplicates with clear messages', () => {
    const existing = [file('kept.png', 10, 'image/png')];
    const { accepted, errors } = validateFiles([
      file('ok.png', 100, 'image/png'),
      file('big.png', 6000, 'image/png'),
      file('tiny.png', 1, 'image/png'),
      file('virus.exe', 10, 'application/x-msdownload'),
      file('kept.png', 10, 'image/png'),
      file('third.png', 10, 'image/png'),
    ], { accept: 'image/*', maxSize: 5000, minSize: 5, maxFiles: 2, existing });
    expect(accepted.map((f) => f.name)).toEqual(['ok.png']);
    expect(errors.map((e) => e.code)).toEqual(['size', 'size', 'type', 'duplicate', 'count']);
    expect(errors[0].message).toBe('"big.png" is 5.9 KB, the limit is 4.9 KB.');
    expect(errors[2].message).toBe('"virus.exe" is not an accepted file type.');
    expect(errors[3].message).toBe('"kept.png" is already in the list.');
    expect(errors[4].message).toBe('"third.png" was not added, the limit is 2 files.');
  });

  it('writes files into an input through DataTransfer when it exists', () => {
    expect(setInputFiles(document.createElement('input'), [file('a.txt')])).toBe(false);
    globalThis.DataTransfer = class {
      constructor() { this.list = []; this.items = { add: (f) => this.list.push(f) }; }
      get files() { return this.list; }
    };
    const target = {};
    expect(setInputFiles(target, [file('a.txt'), file('b.txt')])).toBe(true);
    expect(target.files.map((f) => f.name)).toEqual(['a.txt', 'b.txt']);
    delete globalThis.DataTransfer;
  });
});

describe('reorder logic', () => {
  it('moves an item and clamps the target', () => {
    expect(moveItem(['a', 'b', 'c', 'd'], 0, 2)).toEqual(['b', 'c', 'a', 'd']);
    expect(moveItem(['a', 'b', 'c', 'd'], 3, 0)).toEqual(['d', 'a', 'b', 'c']);
    expect(moveItem(['a', 'b', 'c'], 1, 99)).toEqual(['a', 'c', 'b']);
    expect(moveItem(['a', 'b'], 5, 0)).toEqual(['a', 'b']);
  });

  it('finds the item under a point', () => {
    const rects = [rect(100, 50, 0, 0), rect(100, 50, 0, 60), rect(100, 50, 110, 0)];
    expect(indexAt(rects, 10, 70)).toBe(1);
    expect(indexAt(rects, 150, 20)).toBe(2);
    expect(indexAt(rects, 105, 55)).toBe(-1);
  });

  it('selects ranges in either direction', () => {
    expect(selectRange([false, false, false, false, false], 1, 3, true)).toEqual([false, true, true, true, false]);
    expect(selectRange([true, true, true, true], 3, 1, false)).toEqual([true, false, false, false]);
    expect(selectRange([false, false], 0, 9, true)).toEqual([true, true]);
  });
});

describe('crop geometry', () => {
  const bounds = { x: 0, y: 0, w: 400, h: 300 };

  it('parses aspects', () => {
    expect(parseAspect('16:9')).toBeCloseTo(16 / 9);
    expect(parseAspect('4/3')).toBeCloseTo(4 / 3);
    expect(parseAspect('1.5')).toBe(1.5);
    expect(parseAspect('circle')).toBe(1);
    expect(parseAspect('free')).toBe(0);
    expect(parseAspect('nonsense')).toBe(0);
  });

  it('fits the turned image in the stage', () => {
    expect(rotatedSize(800, 600, 1)).toEqual({ w: 600, h: 800 });
    expect(fitScale(800, 600, 0, 400, 300)).toBeCloseTo(0.5);
    expect(fitScale(800, 600, 1, 400, 300)).toBeCloseTo(0.375);
    expect(fitScale(800, 600, 0, 424, 324, 12)).toBeCloseTo(0.5);
  });

  it('keeps the image centred or covering the stage', () => {
    expect(clampCenter(50, 300, 400)).toBe(200);
    expect(clampCenter(500, 800, 400)).toBe(400);
    expect(clampCenter(-100, 800, 400)).toBe(0);
    expect(intersect({ x: -10, y: 20, w: 100, h: 100 }, bounds)).toEqual({ x: 0, y: 20, w: 90, h: 100 });
  });

  it('starts with a centred box of the aspect', () => {
    close(initialBox(bounds, 1), { x: 80, y: 30, w: 240, h: 240 });
    close(initialBox(bounds, 0, 1), { x: 0, y: 0, w: 400, h: 300 });
    const wide = initialBox(bounds, 16 / 9);
    expect(wide.w / wide.h).toBeCloseTo(16 / 9);
  });

  it('moves a box inside its bounds', () => {
    const b = { x: 100, y: 100, w: 100, h: 100 };
    expect(moveBox(b, 50, -20, bounds)).toEqual({ x: 150, y: 80, w: 100, h: 100 });
    expect(moveBox(b, 500, 500, bounds)).toEqual({ x: 300, y: 200, w: 100, h: 100 });
    expect(moveBox(b, -500, -500, bounds)).toEqual({ x: 0, y: 0, w: 100, h: 100 });
  });

  it('resizes freely from a corner and respects bounds and the minimum', () => {
    const b = { x: 100, y: 100, w: 100, h: 100 };
    expect(resizeBox(b, 'se', 30, 10, 0, bounds)).toEqual({ x: 100, y: 100, w: 130, h: 110 });
    expect(resizeBox(b, 'nw', -500, -500, 0, bounds)).toEqual({ x: 0, y: 0, w: 200, h: 200 });
    expect(resizeBox(b, 'e', -500, 0, 0, bounds, 24)).toEqual({ x: 100, y: 100, w: 24, h: 100 });
    expect(resizeBox(b, 'n', 0, 30, 0, bounds)).toEqual({ x: 100, y: 130, w: 100, h: 70 });
  });

  it('keeps the aspect: corners anchor the opposite corner, edges stay centred', () => {
    const b = { x: 100, y: 100, w: 160, h: 90 };
    const corner = resizeBox(b, 'se', 40, 0, 16 / 9, bounds);
    expect(corner.w / corner.h).toBeCloseTo(16 / 9);
    close(corner, { x: 100, y: 100, w: 200 });
    const edge = resizeBox(b, 'e', 32, 0, 16 / 9, bounds);
    close(edge, { x: 100, w: 192, h: 108 });
    expect(edge.y + edge.h / 2).toBeCloseTo(145);
    const nw = resizeBox(b, 'nw', -40, -40, 16 / 9, bounds);
    expect(nw.x + nw.w).toBeCloseTo(260);
    expect(nw.y + nw.h).toBeCloseTo(190);
  });

  it('shrinks an aspect locked resize that would leave the bounds', () => {
    const b = { x: 200, y: 100, w: 100, h: 100 };
    const r = resizeBox(b, 'se', 400, 400, 1, bounds);
    expect(r).toEqual({ x: 200, y: 100, w: 200, h: 200 });
    const e = resizeBox({ x: 150, y: 20, w: 100, h: 100 }, 'e', 300, 0, 1, bounds);
    expect(e.h).toBeCloseTo(140);
    expect(e.y).toBeGreaterThanOrEqual(0);
    expect(e.y + e.h).toBeLessThanOrEqual(300);
  });

  it('constrains and reshapes boxes', () => {
    close(constrainBox({ x: 350, y: 250, w: 100, h: 100 }, bounds, 0), { x: 300, y: 200 });
    const c = constrainBox({ x: 0, y: 0, w: 500, h: 500 }, bounds, 1);
    expect(c).toEqual({ x: 100, y: 0, w: 300, h: 300 });
    const r = reshapeBox({ x: 100, y: 100, w: 200, h: 50 }, 1, bounds);
    close(r, { w: 100, h: 100, x: 150, y: 75 });
  });

  it('zooms around a point', () => {
    expect(zoomAt(200, 150, 1, 2, 200, 150)).toEqual({ x: 200, y: 150 });
    expect(zoomAt(200, 150, 1, 2, 100, 100)).toEqual({ x: 300, y: 200 });
  });

  it('maps the box to source pixels, with rotation', () => {
    const st = { nw: 800, nh: 600, quarter: 0, fx: 1, fy: -1, fit: 0.5, zoom: 2, cx: 200, cy: 150, box: { x: 100, y: 50, w: 200, h: 100 } };
    expect(cropData(st)).toEqual({ x: 300, y: 200, width: 200, height: 100, rotate: 0, flipX: false, flipY: true, zoom: 2 });
    const turned = { ...st, quarter: 1, fy: 1, fit: 0.375, zoom: 1, box: { x: 87.5, y: 0, w: 225, h: 300 } };
    expect(cropData(turned)).toEqual({ x: 0, y: 0, width: 600, height: 800, rotate: 90, flipX: false, flipY: false, zoom: 1 });
  });

  it('computes export sizes', () => {
    expect(outputSize(640, 480)).toEqual({ width: 640, height: 480 });
    expect(outputSize(640, 480, { width: 200 })).toEqual({ width: 200, height: 150 });
    expect(outputSize(640, 480, { height: 120 })).toEqual({ width: 160, height: 120 });
    expect(outputSize(640, 480, { width: 256, height: 256 })).toEqual({ width: 256, height: 256 });
    expect(outputSize(4000, 3000, { max: 1000 })).toEqual({ width: 1000, height: 750 });
    expect(outputSize(0.2, 0.2)).toEqual({ width: 1, height: 1 });
  });
});

describe('viewer, compare and signature math', () => {
  it('limits panning to the overflow', () => {
    expect(panLimit(400, 1, 600)).toBe(0);
    expect(panLimit(400, 2, 600)).toBe(100);
    expect(clampPan(250, 400, 2, 600)).toBe(100);
    expect(clampPan(-250, 400, 2, 600)).toBe(-100);
  });

  it('names downloads', () => {
    expect(fileNameFrom('https://x.test/photos/Lake%20view.jpg?w=200')).toBe('Lake view.jpg');
    expect(fileNameFrom('data:image/svg+xml,abc')).toBe('image.svg');
    expect(fileNameFrom('data:image/jpeg;base64,abc')).toBe('image.jpg');
  });

  it('turns a pointer position into a percentage', () => {
    const r = rect(200, 100, 50, 0);
    expect(positionFrom(r, 100, 0)).toBe(25);
    expect(positionFrom(r, 0, 0)).toBe(0);
    expect(positionFrom(r, 400, 0)).toBe(100);
    expect(positionFrom(r, 0, 75, true)).toBe(75);
  });

  it('draws thinner lines when the pen moves fast and thicker with pressure', () => {
    const slow = strokeWidths([{ x: 0, y: 0, t: 0 }, { x: 1, y: 0, t: 10 }, { x: 2, y: 0, t: 20 }], 3);
    const fast = strokeWidths([{ x: 0, y: 0, t: 0 }, { x: 40, y: 0, t: 10 }, { x: 80, y: 0, t: 20 }], 3);
    expect(fast[2]).toBeLessThan(slow[2]);
    const pressed = strokeWidths([{ x: 0, y: 0, t: 0, p: 1 }], 3);
    expect(pressed[0]).toBeGreaterThan(3);
  });

  it('builds smooth segments and SVG that scale with the pad width', () => {
    const stroke = { color: 'red', width: 2, points: [{ x: 0, y: 0, t: 0 }, { x: 0.5, y: 0.1, t: 10 }, { x: 1, y: 0, t: 20 }] };
    const segs = segments(stroke, 100);
    expect(segs).toHaveLength(2);
    expect(segs[0].d).toBe('M0 0Q50 10 75 5');
    expect(segs[1].d).toBe('M75 5Q87.5 2.5 100 0');
    expect(segments({ ...stroke, points: [{ x: 0.1, y: 0.1, t: 0 }] }, 100)[0].d).toBe('M10 10l0 0');
    const svg = toSvg([stroke], 100, 50, { background: 'white' });
    expect(svg).toMatch(/^<svg xmlns="http:\/\/www.w3.org\/2000\/svg" width="100" height="50" viewBox="0 0 100 50"/);
    expect(svg).toContain('<g stroke="red">');
    expect(svg.match(/<path /g)).toHaveLength(2);
    expect(svg).toContain('<rect width="100%" height="100%" fill="white"/>');
  });

  it('names avatar files after the output type', () => {
    expect(outputName('Me at the beach.jpeg', 'image/png')).toBe('Me at the beach.png');
    expect(outputName('photo.png', 'image/jpeg')).toBe('photo.jpg');
    expect(outputName(undefined, 'image/webp')).toBe('avatar.webp');
  });
});

describe('dropzone enhancement', () => {
  const setup = (attrs = '') => {
    document.body.innerHTML = `<form><div class="dropzone" data-m-dropzone data-m-dropzone-max-size="1kb" data-m-dropzone-max-files="3" ${attrs}><label class="dropzone-area"><input type="file" name="f" multiple accept="image/*,.pdf"></label></div></form>`;
    enhance(document);
    return document.querySelector('.dropzone');
  };

  it('reads options and builds the list, summary and live region', () => {
    const el = setup();
    expect(readOptions(el, 'dropzone')).toEqual({ maxSize: '1kb', maxFiles: '3' });
    expect(el.hasAttribute('data-enhanced')).toBe(true);
    expect(el.querySelector('.dropzone-list').hidden).toBe(true);
    expect(el.querySelector('[role=status]')).not.toBeNull();
    expect(el.querySelector('.dropzone-errors').getAttribute('role')).toBe('alert');
  });

  it('adds valid files, reports invalid ones and keeps a summary', async () => {
    const el = setup('data-m-dropzone-simulate="false"');
    const changes = [];
    const errors = [];
    el.addEventListener('monsoon:dropzone-change', (e) => changes.push(e.detail.files.map((f) => f.name)));
    el.addEventListener('monsoon:dropzone-error', (e) => errors.push(...e.detail.errors.map((x) => x.code)));
    const api = dropzone(el);
    api.add([file('a.png', 100, 'image/png'), file('b.pdf', 300, 'application/pdf'), file('c.txt', 10, 'text/plain'), file('d.png', 4096, 'image/png')]);
    expect(api.files.map((f) => f.name)).toEqual(['a.png', 'b.pdf']);
    expect(errors).toEqual(['type', 'size']);
    expect(changes.at(-1)).toEqual(['a.png', 'b.pdf']);
    const rows = el.querySelectorAll('.dropzone-item');
    expect(rows).toHaveLength(2);
    expect(rows[0].dataset.kind).toBe('image');
    expect(rows[1].dataset.kind).toBe('pdf');
    expect(rows[1].querySelector('.dropzone-icon b').textContent).toBe('PDF');
    expect(rows[0].dataset.status).toBe('done');
    expect(el.querySelector('.dropzone-summary').textContent).toContain('2 files, 400 B');
    expect(el.querySelector('.dropzone-errors').textContent).toContain('"c.txt" is not an accepted file type.');
    api.add([file('e.png', 1, 'image/png'), file('f.png', 1, 'image/png')]);
    expect(api.files).toHaveLength(3);
    expect(errors.at(-1)).toBe('count');
    api.remove(0);
    expect(api.files.map((f) => f.name)).toEqual(['b.pdf', 'e.png']);
    api.clear();
    expect(api.files).toEqual([]);
    expect(el.querySelector('.dropzone-list').hidden).toBe(true);
  });

  it('lets the app upload and report progress, errors and retries', () => {
    const el = setup();
    const calls = [];
    el.addEventListener('monsoon:dropzone-upload', (e) => { e.preventDefault(); calls.push(e.detail); });
    dropzone(el).add([file('a.png', 100, 'image/png')]);
    const row = el.querySelector('.dropzone-item');
    expect(row.dataset.status).toBe('uploading');
    calls[0].progress(0.5);
    expect(row.querySelector('.dropzone-progress').getAttribute('aria-valuenow')).toBe('50');
    expect(row.querySelector('.dropzone-meta').textContent).toBe('100 B, 50%');
    calls[0].error('Server down');
    expect(row.dataset.status).toBe('error');
    expect(row.querySelector('.dropzone-meta').textContent).toBe('Server down');
    const retry = row.querySelector('[aria-label^="Retry"]');
    expect(retry.hidden).toBe(false);
    retry.click();
    expect(calls).toHaveLength(2);
    calls[0].done();
    expect(row.dataset.status).toBe('uploading');
    calls[1].done({ id: 7 });
    expect(row.dataset.status).toBe('done');
  });

  it('simulates progress by default', async () => {
    vi.useFakeTimers();
    const el = setup();
    dropzone(el).add([file('a.png', 100, 'image/png')]);
    expect(el.querySelector('.dropzone-item').dataset.status).toBe('uploading');
    vi.advanceTimersByTime(5000);
    expect(el.querySelector('.dropzone-item').dataset.status).toBe('done');
    vi.useRealTimers();
  });

  it('reorders with the keyboard on the handle', () => {
    const el = setup('data-m-dropzone-simulate="false"');
    const api = dropzone(el);
    api.add([file('a.png', 1, 'image/png'), file('b.png', 1, 'image/png'), file('c.png', 1, 'image/png')]);
    let detail;
    el.addEventListener('monsoon:dropzone-reorder', (e) => { detail = e.detail; });
    const handle = el.querySelector('.dropzone-handle');
    handle.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    expect(api.files.map((f) => f.name)).toEqual(['b.png', 'a.png', 'c.png']);
    expect([...el.querySelectorAll('.dropzone-name')].map((n) => n.textContent)).toEqual(['b.png', 'a.png', 'c.png']);
    expect(detail).toMatchObject({ from: 0, to: 1 });
  });

  it('accepts dropped files and replaces the file of a single input', () => {
    document.body.innerHTML = '<div class="dropzone" data-m-dropzone data-m-dropzone-simulate="false"><label class="dropzone-area"><input type="file"></label></div>';
    enhance(document);
    const el = document.querySelector('.dropzone');
    const drop = (f) => {
      const ev = new Event('drop', { bubbles: true, cancelable: true });
      ev.dataTransfer = { files: [f], types: ['Files'] };
      el.dispatchEvent(ev);
      return ev.defaultPrevented;
    };
    expect(drop(file('one.txt'))).toBe(true);
    drop(file('two.txt'));
    expect(dropzone(el).files.map((f) => f.name)).toEqual(['two.txt']);
  });
});

describe('cropper enhancement', () => {
  const setup = (attrs = '') => {
    document.body.innerHTML = `<div><div class="cropper" data-m-cropper data-m-cropper-aspect="4:3" data-m-cropper-preview="[data-p]" ${attrs}><img src="x.png" alt="Lake"></div><div data-p></div></div>`;
    enhance(document);
    const el = document.querySelector('.cropper');
    const img = el.querySelector('img:not(.cropper-image)');
    el.querySelector('.cropper-stage').getBoundingClientRect = () => rect(400, 300);
    Object.defineProperty(img, 'naturalWidth', { value: 800 });
    Object.defineProperty(img, 'naturalHeight', { value: 600 });
    img.dispatchEvent(new Event('load'));
    return el;
  };

  it('builds the stage, handles, toolbar and preview', () => {
    const el = setup();
    expect(el.querySelectorAll('.cropper-handle')).toHaveLength(8);
    expect(el.querySelector('.cropper-box').getAttribute('tabindex')).toBe('0');
    const radios = el.querySelectorAll('.segmented input[type=radio]');
    expect([...radios].map((r) => r.value)).toEqual(['free', '1:1', '4:3', '16:9', '3:4', 'circle']);
    expect(el.querySelector('input[value="4:3"]').checked).toBe(true);
    expect(el.querySelector('input[type=range]').getAttribute('aria-label')).toBe('Zoom');
    expect(document.querySelector('[data-p]').classList.contains('cropper-preview')).toBe(true);
    expect(el.dataset.ready).toBe('');
  });

  it('starts with a centred 4:3 crop and exports at source resolution', () => {
    const el = setup();
    const api = cropper(el);
    // 800 by 600 in a 400 by 300 stage with a 12px pad: scale 0.46, box at 80 percent.
    close(api.getData(), { x: 80, y: 60, width: 640, height: 480 });
    expect(api.toCanvas()).toMatchObject({ width: 640, height: 480 });
    expect(api.toCanvas({ width: 200 })).toMatchObject({ width: 200, height: 150 });
    expect(api.toCanvas({ max: 320 })).toMatchObject({ width: 320, height: 240 });
  });

  it('rotates, flips, changes aspect and zooms', () => {
    const el = setup();
    const api = cropper(el);
    api.rotate();
    close(api.getData(), { width: 480, height: 360, rotate: 90 });
    api.flip('x');
    expect(api.getData().flipX).toBe(true);
    api.setAspect('1:1');
    const sq = api.getData();
    expect(sq.width).toBeCloseTo(sq.height);
    api.zoom(2);
    expect(api.getData().zoom).toBe(2);
    expect(api.getData().width).toBeCloseTo(sq.width / 2, 0);
    api.zoom(100);
    expect(api.getData().zoom).toBe(8);
    api.setAspect('circle');
    expect(el.hasAttribute('data-circle')).toBe(true);
    expect(document.querySelector('[data-p]').hasAttribute('data-circle')).toBe(true);
    api.reset();
    close(api.getData(), { rotate: 0, zoom: 1 });
  });

  it('moves with arrows and resizes with Shift and arrows', () => {
    const el = setup();
    const api = cropper(el);
    const box = el.querySelector('.cropper-box');
    const before = api.getData();
    box.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', ctrlKey: true, bubbles: true }));
    expect(api.getData().x).toBeCloseTo(before.x - 10 / 0.46, 0);
    box.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', shiftKey: true, bubbles: true }));
    const after = api.getData();
    expect(after.width).toBeGreaterThan(before.width);
    expect(after.width / after.height).toBeCloseTo(4 / 3);
  });

  it('removes itself on destroy', () => {
    const el = setup();
    cropper(el).destroy();
    expect(el.querySelector('.cropper-stage')).toBeNull();
    expect(el.querySelector('img').hidden).toBe(false);
  });
});

describe('avatar upload enhancement', () => {
  it('opens a dialog with a circular cropper for a valid image and rejects others', async () => {
    document.body.innerHTML = '<div class="avatar-upload" data-m-avatar-upload data-m-avatar-upload-max-size="1kb"><label class="avatar-upload-trigger"><img class="avatar-upload-image" src="a.png" alt=""><input type="file" accept="image/*"></label><input type="hidden" name="d"></div>';
    enhance(document);
    const el = document.querySelector('.avatar-upload');
    const api = avatarUpload(el);
    expect(await api.open(file('notes.txt', 10, 'text/plain'))).toBe(false);
    expect(el.querySelector('.avatar-upload-error').textContent).toBe('"notes.txt" is not an accepted file type.');
    expect(await api.open(file('big.png', 4096, 'image/png'))).toBe(false);
    expect(await api.open(file('me.png', 100, 'image/png'))).toBe(true);
    const dialog = el.querySelector('dialog.avatar-upload-dialog');
    expect(dialog.open).toBe(true);
    expect(el.querySelector('.avatar-upload-error').hidden).toBe(true);
    expect(dialog.querySelector('.cropper').hasAttribute('data-circle')).toBe(true);
    expect(dialog.querySelector('.segmented')).toBeNull();
  });
});

describe('image viewer and gallery enhancement', () => {
  const pics = (n) => Array.from({ length: n }, (_, i) => `<li class="gallery-item"><a href="p${i}.svg" data-caption="Pic ${i}"><img src="p${i}.svg" alt="Alt ${i}"></a><label class="gallery-check"><input type="checkbox" value="${i}"></label></li>`).join('');

  it('collects images and opens the viewer on click', () => {
    document.body.innerHTML = '<div data-m-image-viewer><a href="big1.jpg" data-caption="First"><img src="t1.jpg" alt="One"></a><a href="big2.jpg"><img src="t2.jpg" alt="Two"></a></div>';
    enhance(document);
    const group = document.querySelector('[data-m-image-viewer]');
    const items = collect(group, 'a[href]');
    expect(items.map((i) => [i.src, i.caption, i.name])).toEqual([['big1.jpg', 'First', 'big1.jpg'], ['big2.jpg', 'Two', 'big2.jpg']]);
    group.querySelectorAll('a')[1].click();
    const v = document.querySelector('dialog.viewer');
    expect(v.open).toBe(true);
    expect(v.querySelector('.viewer-counter').textContent).toBe('2 / 2');
    expect(v.querySelector('.viewer-image').getAttribute('src')).toBe('big2.jpg');
    v.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(v.querySelector('.viewer-counter').textContent).toBe('1 / 2');
    expect(v.querySelector('.viewer-caption').textContent).toBe('First');
    expect(v.querySelector('a.viewer-btn').getAttribute('download')).toBe('big1.jpg');
    expect(v.querySelectorAll('.viewer-thumb')).toHaveLength(2);
    imageViewer(group).close();
    expect(v.open).toBe(false);
  });

  it('selects with shift ranges, deletes and reorders', () => {
    document.body.innerHTML = `<div class="gallery" data-m-media-gallery><ul class="gallery-list">${pics(5)}</ul></div>`;
    enhance(document);
    const el = document.querySelector('.gallery');
    const boxes = () => [...el.querySelectorAll('input[type=checkbox]')];
    expect(el.querySelector('.gallery-count').textContent).toBe('5 items');
    boxes()[1].click();
    boxes()[3].dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, shiftKey: true }));
    expect(boxes().map((b) => b.checked)).toEqual([false, true, true, true, false]);
    expect(el.querySelector('.gallery-count').textContent).toBe('3 selected');
    expect(el.hasAttribute('data-selecting')).toBe(true);
    expect(mediaGallery(el).values).toEqual(['1', '2', '3']);
    // In selection mode a click on a picture selects it instead of opening the viewer.
    el.querySelectorAll('a')[0].click();
    expect(boxes()[0].checked).toBe(true);
    expect(document.querySelector('dialog.viewer[open]')).toBeNull();
    let deleted;
    el.addEventListener('monsoon:gallery-delete', (e) => { deleted = e.detail.values; });
    mediaGallery(el).delete();
    expect(deleted).toEqual(['0', '1', '2', '3']);
    expect(el.querySelectorAll('.gallery-item')).toHaveLength(1);
    expect(el.hasAttribute('data-selecting')).toBe(false);
  });

  it('can cancel a delete and moves items with Alt and arrows', () => {
    document.body.innerHTML = `<div class="gallery" data-m-media-gallery><ul class="gallery-list">${pics(3)}</ul></div>`;
    enhance(document);
    const el = document.querySelector('.gallery');
    el.addEventListener('monsoon:gallery-delete', (e) => e.preventDefault());
    mediaGallery(el).selectAll();
    mediaGallery(el).delete();
    expect(el.querySelectorAll('.gallery-item')).toHaveLength(3);
    mediaGallery(el).clear();
    let order;
    el.addEventListener('monsoon:gallery-reorder', (e) => { order = e.detail.order; });
    el.querySelector('a').dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', altKey: true, bubbles: true }));
    expect(order).toEqual(['1', '0', '2']);
  });
});

describe('compare and signature enhancement', () => {
  it('creates the handle and range, and follows the range', () => {
    document.body.innerHTML = '<div class="compare" data-m-compare data-m-compare-position="30"><img class="compare-before" alt=""><img class="compare-after" alt=""></div>';
    enhance(document);
    const el = document.querySelector('.compare');
    const range = el.querySelector('.compare-range');
    expect(el.querySelector('.compare-handle .compare-knob')).not.toBeNull();
    expect(el.style.getPropertyValue('--pos')).toBe('30%');
    expect(range.getAttribute('aria-valuetext')).toBe('30% before, 70% after');
    let pos;
    el.addEventListener('monsoon:compare', (e) => { pos = e.detail.position; });
    range.value = '64';
    range.dispatchEvent(new Event('input'));
    expect(pos).toBe(64);
    expect(el.style.getPropertyValue('--pos')).toBe('64%');
    compare(el).set(150);
    expect(compare(el).position).toBe(100);
  });

  it('builds the pad, keeps strokes as data and exports SVG into the hidden input', () => {
    HTMLCanvasElement.prototype.getContext = () => null;
    HTMLCanvasElement.prototype.getBoundingClientRect = () => rect(300, 150);
    document.body.innerHTML = '<div class="signature" data-m-signature data-m-signature-format="svg" data-m-signature-colors="red,blue"><input type="hidden" name="s"><input class="signature-fallback"></div>';
    enhance(document);
    const el = document.querySelector('.signature');
    const api = signature(el);
    expect(el.querySelector('.signature-pad > .signature-canvas')).not.toBeNull();
    expect(el.querySelectorAll('.signature-swatch')).toHaveLength(2);
    expect(el.hasAttribute('data-empty')).toBe(true);
    expect(api.empty).toBe(true);
    api.fromData([{ color: 'red', width: 2, points: [{ x: 0.1, y: 0.1, t: 0 }, { x: 0.5, y: 0.2, t: 20 }] }]);
    expect(api.empty).toBe(false);
    const hidden = el.querySelector('input[type=hidden]');
    expect(hidden.value).toMatch(/^<svg [^>]*width="300" height="150"/);
    expect(hidden.value).toContain('<path d="M30 30Q');
    expect(api.toData()[0].points).toHaveLength(2);
    const typed = el.querySelector('.signature-fallback');
    typed.value = 'Ada Lovelace';
    typed.dispatchEvent(new Event('input'));
    expect(api.empty).toBe(true);
    expect(hidden.value).toBe('');
  });
});
