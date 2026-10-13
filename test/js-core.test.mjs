// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { define, enhance, destroy, readOptions } from '../src/js/core.mjs';

describe('interactive core', () => {
  it('enhances elements once and reads data-m-<name>-<option> options', () => {
    let calls = 0;
    let seen;
    define('probe', (el, opts) => { calls++; seen = opts; return () => { el.dataset.cleaned = ''; }; });
    document.body.innerHTML = '<div data-m-probe data-m-probe-max-size="5mb"></div>';
    enhance(document);
    enhance(document);
    expect(calls).toBe(1);
    expect(seen).toEqual({ maxSize: '5mb' });
    destroy(document.body);
    expect(document.querySelector('[data-cleaned]')).not.toBeNull();
  });

  it('readOptions ignores other components', () => {
    document.body.innerHTML = '<div data-m-crop-aspect="1" data-m-copy-target="#x"></div>';
    expect(readOptions(document.body.firstChild, 'crop')).toEqual({ aspect: '1' });
  });
});

describe('moving an enhanced element', () => {
  it('keeps the instance when the element is moved, cleans up when removed', async () => {
    let cleaned = 0;
    define('mover', () => () => { cleaned++; });
    const { start } = await import('../src/js/core.mjs');
    document.body.innerHTML = '<div id="a"><span data-m-mover></span></div><div id="b"></div>';
    start();
    const el = document.querySelector('[data-m-mover]');
    document.getElementById('b').appendChild(el);
    await new Promise((r) => setTimeout(r, 0));
    expect(cleaned).toBe(0);
    el.remove();
    await new Promise((r) => setTimeout(r, 0));
    expect(cleaned).toBe(1);
  });
});
