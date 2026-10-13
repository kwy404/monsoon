// @vitest-environment jsdom
// The runtime engine: scans class attributes on load and on every mutation,
// writes rules into one stylesheet, caches, keeps variant order and rejects
// unsafe classes.
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { start, stop, scan, add, css, reset } from '../src/js/arbitrary.mjs';
import { root } from './helpers.mjs';

const tick = () => new Promise((r) => setTimeout(r, 0));
const rules = () => css().split('\n').filter(Boolean);

beforeEach(() => {
  reset();
  document.head.innerHTML = '';
  document.body.innerHTML = '';
});
afterEach(() => reset());

describe('runtime engine', () => {
  it('generates rules for the classes on the page when it starts', () => {
    document.body.innerHTML = '<div class="p-4 bg-[#0ea5e9] w-[37px]"><span class="text-[13px] content-[\'x\']"></span></div>';
    start();
    const text = css();
    expect(text).toContain('.bg-\\[\\#0ea5e9\\]');
    expect(text).toMatch(/background-color: (#0ea5e9|rgb\(14, 165, 233\))/);
    expect(text).toContain('width: 37px');
    expect(text).toContain('font-size: 13px');
    expect(text).not.toContain('.p-4');
  });

  it('falls back to a <style> element when adoptedStyleSheets is missing', () => {
    document.body.innerHTML = '<p class="w-[1px]"></p>';
    start();
    const style = document.getElementById('monsoon-arbitrary');
    expect(style).not.toBeNull();
    expect(style.sheet.cssRules.length).toBe(1);
  });

  it('adds rules for elements added later and for class changes', async () => {
    start();
    expect(rules()).toHaveLength(0);
    const el = document.createElement('div');
    el.innerHTML = '<b class="h-[calc(100vh-4rem)]"></b>';
    document.body.appendChild(el);
    await tick();
    expect(css()).toContain('height: calc(100vh - 4rem)');
    el.className = 'rounded-[10px]';
    await tick();
    expect(css()).toContain('border-radius: 10px');
    el.setAttribute('class', 'rounded-[10px] z-[999]');
    await tick();
    expect(css()).toContain('z-index: 999');
  });

  it('caches: a class used many times produces one rule', async () => {
    document.body.innerHTML = '<i class="w-[3px]"></i><i class="w-[3px]"></i>';
    start();
    document.body.insertAdjacentHTML('beforeend', '<i class="w-[3px]"></i>');
    await tick();
    expect(rules().filter((r) => r.includes('w-\\[3px\\]'))).toHaveLength(1);
    expect(add('w-[3px]')).toBe(true);
    expect(rules()).toHaveLength(1);
  });

  it('keeps variants after plain classes and breakpoints in order', () => {
    document.body.innerHTML = '<i class="xl:w-[3px] md:w-[2px] w-[1px] hover:w-[4px]"></i>';
    start();
    const order = rules().map((r) => /w-\\\[(\d)px/.exec(r)?.[1]);
    expect(order).toEqual(['1', '4', '2', '3']);
    expect(rules()[2]).toMatch(/^@media \(min-width: 768px\)/);
  });

  it('respects media and container variants', () => {
    document.body.innerHTML = '<i class="print:w-[1px] md:w-[2px]"></i>';
    scan(document);
    const text = css();
    expect(text).toContain('@media print');
    expect(text).toContain('@media (min-width: 768px)');
  });

  it('rejects unsafe classes and writes nothing for them', async () => {
    start();
    const bad = document.createElement('div');
    bad.setAttribute('class', 'bg-[red;color:blue] w-[1px}] content-[\'</style>\'] bg-[@import] w-[calc(1px]');
    document.body.appendChild(bad);
    await tick();
    expect(rules()).toHaveLength(0);
    expect(document.querySelectorAll('style').length).toBe(0);
  });

  it('stop() disconnects the observer', async () => {
    start();
    stop();
    document.body.innerHTML = '<i class="w-[9px]"></i>';
    await tick();
    expect(css()).toBe('');
  });

  it('uses a constructed stylesheet when the browser has adoptedStyleSheets', () => {
    class FakeSheet {
      constructor() { this.cssRules = []; }
      insertRule(text, i) { this.cssRules.splice(i, 0, { cssText: text }); return i; }
    }
    const saved = globalThis.CSSStyleSheet;
    globalThis.CSSStyleSheet = FakeSheet;
    document.adoptedStyleSheets = [];
    try {
      document.body.innerHTML = '<i class="md:w-[2px] w-[1px]"></i>';
      start();
      expect(document.adoptedStyleSheets).toHaveLength(1);
      expect(document.querySelector('style')).toBeNull();
      expect(rules()).toEqual(['.w-\\[1px\\]{width:1px}', '@media (min-width: 768px){.md\\:w-\\[2px\\]{width:2px}}']);
      reset();
      expect(document.adoptedStyleSheets).toHaveLength(0);
    } finally {
      globalThis.CSSStyleSheet = saved;
      delete document.adoptedStyleSheets;
    }
  });
});

describe('browser bundles', () => {
  it('dist/monsoon-arbitrary.js runs on its own and exposes MonsoonArbitrary', () => {
    document.body.innerHTML = '<p class="w-[41px]"></p>';
    const code = readFileSync(join(root, 'dist/monsoon-arbitrary.js'), 'utf8');
    // eslint-disable-next-line no-new-func
    new Function('window', 'document', `${code};window.MonsoonArbitrary = MonsoonArbitrary;`)(window, document);
    expect(typeof window.MonsoonArbitrary.start).toBe('function');
    expect(window.MonsoonArbitrary.css()).toContain('width: 41px');
    window.MonsoonArbitrary.reset();
  });

  it('dist/monsoon-arbitrary.js stays small', () => {
    const size = readFileSync(join(root, 'dist/monsoon-arbitrary.js')).length;
    expect(size).toBeLessThan(20 * 1024);
  });

  it('dist/monsoon.js includes the engine as Monsoon.arbitrary', () => {
    const code = readFileSync(join(root, 'dist/monsoon.js'), 'utf8');
    expect(code).toContain('monsoon-arbitrary');
  });
});
