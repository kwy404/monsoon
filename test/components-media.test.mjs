import { describe, it, expect } from 'vitest';
import { readdirSync } from 'node:fs';
import { generate } from '../src/generate.mjs';
import { componentsCss } from '../src/components/index.mjs';
import { read } from './helpers.mjs';

const css = read('src/components/50-media.css');
const manifest = JSON.parse(read('src/components/50-media.json'));
const built = generate();
const JS = ['dropzone', 'cropper', 'avatar-upload', 'image-viewer', 'media-gallery', 'compare', 'signature'];
const js = JS.map((n) => read(`src/js/components/${n}.mjs`)).join('\n');

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const definedIn = (text, cls) => new RegExp(`\\.${escapeRe(cls)}(?![\\w-])`).test(text);
const classesOf = (text) => new Set([...text.replace(/url\("[^"]*"\)|\/\*[\s\S]*?\*\//g, '').matchAll(/\.([a-z][a-z0-9-]*)/g)].map((m) => m[1]));
const ownClasses = classesOf(css);
const allComponentClasses = classesOf(componentsCss());
const utilityClasses = new Set(built.classes.map((c) => c.class));
const manifestClasses = manifest.components.flatMap((c) => c.classes);

describe('media components', () => {
  it('has a well formed manifest', () => {
    expect(manifest.group).toBe('media');
    expect(manifest.title).toBe('Media and files');
    const slugs = manifest.components.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const c of manifest.components) {
      expect(c.name && c.description && c.html, c.slug).toBeTruthy();
      expect(c.classes.length, c.slug).toBeGreaterThan(0);
      expect(c.needsJs, c.slug).toBe(true);
      expect(c.description, c.slug).toContain('needs monsoon.js');
      expect(c.api && c.api.attribute, c.slug).toBeTruthy();
    }
    expect(new Set(manifestClasses).size).toBe(manifestClasses.length);
  });

  it('documents methods and events for every interactive component', () => {
    const main = manifest.components.filter((c) => !/-(compact|masonry|vertical)$/.test(c.slug));
    expect(main.map((c) => c.slug)).toEqual(['dropzone', 'cropper', 'avatar-upload', 'image-viewer', 'media-gallery', 'compare', 'signature']);
    for (const c of main) {
      expect(Object.keys(c.api.methods).length, c.slug).toBeGreaterThan(0);
      expect(Object.keys(c.api.events).every((e) => e.startsWith('monsoon:')), c.slug).toBe(true);
      for (const opt of Object.keys(c.api.options || {})) expect(opt, c.slug).toMatch(/^data-m-[a-z-]+$/);
    }
    // Every documented event is emitted by the scripts.
    const emitted = new Set([...js.matchAll(/emit\([^,]+, '([a-z-]+)'/g)].map((m) => `monsoon:${m[1]}`));
    emitted.add('monsoon:dropzone-complete').add('monsoon:dropzone-failed');
    for (const c of main) for (const e of Object.keys(c.api.events)) expect(emitted.has(e), e).toBe(true);
  });

  it('defines every manifest class in its own CSS and in the build output', () => {
    for (const cls of manifestClasses) {
      expect(definedIn(css, cls), cls).toBe(true);
      expect(definedIn(built.css, cls), cls).toBe(true);
      expect(definedIn(built.min, cls), cls).toBe(true);
    }
  });

  it('lists every component class it defines', () => {
    // Parts of other groups it styles in context (.segmented in the cropper toolbar) are not its own.
    const others = classesOf(componentsCss().replace(css, ''));
    const listed = new Set(manifestClasses);
    expect([...ownClasses].filter((c) => !listed.has(c) && !others.has(c))).toEqual([]);
  });

  it('does not reuse a utility class name or another group class name', () => {
    expect(manifestClasses.filter((c) => utilityClasses.has(c))).toEqual([]);
    const others = classesOf(componentsCss().replace(css, ''));
    expect(manifestClasses.filter((c) => others.has(c))).toEqual([]);
  });

  it('only uses existing classes in the examples', () => {
    for (const c of manifest.components) {
      for (const [, attr] of c.html.matchAll(/class="([^"]*)"/g)) {
        for (const cls of attr.split(/\s+/).filter(Boolean)) {
          expect(allComponentClasses.has(cls) || utilityClasses.has(cls), `${c.slug}: ${cls}`).toBe(true);
        }
      }
    }
  });

  it('only creates classes from the scripts that exist', () => {
    const created = [...js.matchAll(/class: '([^']+)'/g)].flatMap((m) => m[1].split(/\s+/));
    for (const cls of created) expect(allComponentClasses.has(cls) || utilityClasses.has(cls), cls).toBe(true);
  });

  it('uses only enhanced data attributes of defined components in the examples', () => {
    const defined = new Set(readdirSync('src/js/components').map((f) => f.replace('.mjs', '')));
    for (const c of manifest.components) {
      for (const [, name] of c.html.matchAll(/data-m-([a-z-]+?)(?:[ =>])/g)) {
        const base = JS.find((n) => name === n || name.startsWith(`${n}-`));
        expect(base && defined.has(base), `${c.slug}: data-m-${name}`).toBeTruthy();
      }
    }
  });

  it('keeps examples self contained: inline SVG data URIs, no external images', () => {
    for (const c of manifest.components) {
      expect(c.html, c.slug).not.toMatch(/(src|href)="https?:/);
      for (const [, uri] of c.html.matchAll(/(?:src|href)="(data:[^"]*)"/g)) expect(uri, c.slug).not.toMatch(/[<>#\s"]/);
    }
  });

  it('never uses !important', () => {
    expect(css).not.toMatch(/!\s*important/);
  });

  it('uses tokens instead of hard coded hex colors', () => {
    expect(css).not.toMatch(/#[0-9a-f]{3,8}\b/i);
  });

  it('honours reduced motion', () => {
    expect(css).toMatch(/prefers-reduced-motion: reduce/);
    const block = css.slice(css.indexOf('@media (prefers-reduced-motion: reduce)'));
    for (const sel of ['.dropzone-item', '.viewer-image', '.gallery-item', '.compare-knob']) expect(block).toContain(sel);
  });

  it('shows a focus ring on every interactive part', () => {
    for (const sel of ['.dropzone-area:has(> input:focus-visible)', '.dropzone-handle:focus-visible', '.cropper-box:focus-visible', '.avatar-upload-trigger:has(> input:focus-visible)', '.viewer-btn:focus-visible', '.gallery-check > input:focus-visible', '.compare:has(.compare-range:focus-visible) .compare-knob', '.signature-pad:has(.signature-canvas:focus-visible)', '.signature-swatch:focus-visible']) {
      expect(css, sel).toContain(sel);
    }
  });
});
