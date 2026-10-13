import { describe, it, expect } from 'vitest';
import { generate } from '../src/generate.mjs';
import { read } from './helpers.mjs';

const css = read('src/components/40-display.css');
const manifest = JSON.parse(read('src/components/40-display.json'));
const built = generate();

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const definedIn = (text, cls) => new RegExp(`\\.${escapeRe(cls)}(?![\\w-])`).test(text);
// Classes the component CSS itself defines.
const ownClasses = new Set([...css.replace(/url\("[^"]*"\)|\/\*[\s\S]*?\*\//g, '').matchAll(/\.([a-z][a-z0-9-]*)/g)].map((m) => m[1]));
const utilityClasses = new Set(built.classes.map((c) => c.class));
const manifestClasses = manifest.components.flatMap((c) => c.classes);

describe('display components', () => {
  it('has a well formed manifest', () => {
    expect(manifest.group).toBe('display');
    const slugs = manifest.components.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const c of manifest.components) {
      expect(c.name && c.description && c.html).toBeTruthy();
      expect(c.classes.length).toBeGreaterThan(0);
    }
    expect(new Set(manifestClasses).size).toBe(manifestClasses.length);
    expect(manifestClasses.length).toBeGreaterThanOrEqual(110);
  });

  it('defines every manifest class in its own CSS and in the build output', () => {
    for (const cls of manifestClasses) {
      expect(definedIn(css, cls), cls).toBe(true);
      expect(definedIn(built.css, cls), cls).toBe(true);
      expect(definedIn(built.min, cls), cls).toBe(true);
    }
  });

  it('lists every component class it defines', () => {
    const listed = new Set(manifestClasses);
    expect([...ownClasses].filter((c) => !listed.has(c))).toEqual([]);
  });

  it('only uses existing classes in the examples', () => {
    for (const c of manifest.components) {
      for (const [, attr] of c.html.matchAll(/class="([^"]*)"/g)) {
        for (const cls of attr.split(/\s+/).filter(Boolean)) {
          expect(ownClasses.has(cls) || utilityClasses.has(cls), `${c.slug}: ${cls}`).toBe(true);
        }
      }
    }
  });

  it('never uses !important', () => {
    expect(css).not.toMatch(/!\s*important/);
  });

  it('uses tokens instead of hard coded hex colors outside data URIs', () => {
    const outside = css.replace(/url\("data:[^"]*"\)/g, '');
    expect(outside).not.toMatch(/#[0-9a-f]{3,8}\b/i);
  });

  it('keeps data URIs free of raw characters that break them', () => {
    for (const [uri] of css.matchAll(/url\("data:[^"]*"\)/g)) {
      expect(uri).not.toMatch(/[<>#]/);
    }
  });

  it('honours reduced motion', () => {
    expect(css).toMatch(/prefers-reduced-motion: reduce/);
  });
});
