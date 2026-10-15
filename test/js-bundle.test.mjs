// @vitest-environment jsdom
// The built scripts: the ES module exposes the component getters and the
// engine, the browser script keeps its Monsoon global.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { root } from './helpers.mjs';

describe('dist/monsoon.esm.js', () => {
  it('exports the core, the arbitrary engine and every component getter', async () => {
    const m = await import(pathToFileURL(join(root, 'dist/monsoon.esm.js')).href);
    for (const name of ['define', 'enhance', 'destroy', 'start', 'emit', 'components', 'arbitrary']) expect(m[name], name).toBeDefined();
    for (const name of ['dropzone', 'cropper', 'avatarUpload', 'imageViewer', 'mediaGallery', 'compare', 'signature']) {
      expect(typeof m[name], name).toBe('function');
    }
    expect(typeof m.arbitrary.start).toBe('function');
    expect(typeof m.copy).toBe('function');
    expect(typeof m.toast.promise).toBe('function');
    // Helpers shared by several modules are ambiguous and left out.
    expect(m.clamp).toBeUndefined();
  });
});

describe('dist/monsoon.js', () => {
  it('defines the Monsoon global with the core and the engine', () => {
    const code = readFileSync(join(root, 'dist/monsoon.js'), 'utf8');
    // eslint-disable-next-line no-new-func
    const g = new Function('window', 'document', `${code};return Monsoon;`)(window, document);
    expect(typeof g.define).toBe('function');
    expect(typeof g.arbitrary.css).toBe('function');
    expect(g.components().length).toBeGreaterThan(10);
  });
});
