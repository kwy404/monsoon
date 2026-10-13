import { describe, it, expect } from 'vitest';
import { generate } from '../src/generate.mjs';
import { read } from './helpers.mjs';

const css = read('src/components/30-navigation.css');
const manifest = JSON.parse(read('src/components/30-navigation.json'));
const built = generate();

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const definedIn = (text, cls) => new RegExp(`\\.${escapeRe(cls)}(?![\\w-])`).test(text);
const stripped = css.replace(/url\("[^"]*"\)|\/\*[\s\S]*?\*\//g, '');
const ownClasses = new Set([...stripped.matchAll(/\.([a-z][a-z0-9-]*)/g)].map((m) => m[1]));
const utilities = new Map(built.classes.map((c) => [c.class, c.variants]));
const manifestClasses = manifest.components.flatMap((c) => c.classes);

// A utility used in an example, with or without a variant prefix (hover:, lg:).
function isUtility(cls) {
  if (utilities.has(cls)) return true;
  const i = cls.lastIndexOf(':');
  if (i < 1) return false;
  const variants = utilities.get(cls.slice(i + 1));
  return Boolean(variants && variants.includes(cls.slice(0, i)));
}

describe('navigation components', () => {
  it('has a well formed manifest', () => {
    expect(manifest.group).toBe('navigation');
    const slugs = manifest.components.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const c of manifest.components) {
      expect(c.name && c.description && c.html, c.slug).toBeTruthy();
      expect(c.classes.length, c.slug).toBeGreaterThan(0);
    }
    expect(new Set(manifestClasses).size).toBe(manifestClasses.length);
    expect(manifestClasses.length).toBeGreaterThanOrEqual(90);
  });

  it('puts every manifest class in its own CSS and in the build output', () => {
    for (const cls of manifestClasses) {
      expect(definedIn(css, cls), cls).toBe(true);
      expect(definedIn(built.css, cls), cls).toBe(true);
      expect(definedIn(built.min, cls), cls).toBe(true);
    }
  });

  it('lists every class its CSS defines', () => {
    const listed = new Set(manifestClasses);
    expect([...ownClasses].filter((c) => !listed.has(c))).toEqual([]);
  });

  it('only uses existing classes in the examples', () => {
    for (const c of manifest.components) {
      for (const [, attr] of c.html.matchAll(/class="([^"]*)"/g)) {
        for (const cls of attr.split(/\s+/).filter(Boolean)) {
          expect(ownClasses.has(cls) || isUtility(cls), `${c.slug}: ${cls}`).toBe(true);
        }
      }
    }
  });

  it('works without JavaScript', () => {
    for (const c of manifest.components) {
      expect(c.html, c.slug).not.toMatch(/<script|\son[a-z]+=/i);
    }
    const html = manifest.components.map((c) => c.html).join('');
    expect(html).toMatch(/command="show-modal"/);
    expect(html).toMatch(/popovertarget=/);
    expect(html).toMatch(/<details[^>]*name=/);
  });

  it('animates overlays with discrete transitions and starting styles', () => {
    expect(css).toMatch(/transition-behavior: allow-discrete/);
    expect(css).toMatch(/@starting-style/);
    expect(css).toMatch(/position-area/);
    expect(css).toMatch(/@supports \(position-area/);
  });

  it('never uses !important', () => {
    expect(css).not.toMatch(/!\s*important/);
  });

  it('uses tokens instead of hard coded hex colors outside data URIs', () => {
    const outside = css.replace(/url\("data:[^"]*"\)/g, '');
    expect(outside).not.toMatch(/#[0-9a-f]{3,8}\b/i);
    expect(outside).not.toMatch(/\b(rgba?|hsla?)\(/);
  });

  it('keeps data URIs free of raw characters that break them', () => {
    for (const [uri] of css.matchAll(/url\("data:[^"]*"\)/g)) {
      expect(uri).not.toMatch(/[<>#;]/);
    }
  });

  it('honours reduced motion and shows a focus ring', () => {
    expect(css).toMatch(/prefers-reduced-motion: reduce/);
    expect(css).toMatch(/outline: 2px solid var\(--ring\)/);
  });
});
