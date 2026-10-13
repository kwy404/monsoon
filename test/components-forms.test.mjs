import { describe, it, expect } from 'vitest';
import { generate } from '../src/generate.mjs';
import { componentsCss } from '../src/components/index.mjs';
import { semanticColors } from '../src/theme.mjs';
import { parse, selectorClasses, escapeClass } from '../bin/css.mjs';
import { read } from './helpers.mjs';

const pkg = JSON.parse(read('package.json'));
const css = read('src/components/10-forms.css');
const manifest = JSON.parse(read('src/components/10-forms.json'));
const built = generate({ version: pkg.version }).css;

function selectors(nodes, out = []) {
  for (const n of nodes) {
    if (n.type !== 'block') continue;
    if (!n.prelude.startsWith('@')) out.push(n.prelude);
    if (n.children) selectors(n.children, out);
  }
  return out;
}
const classesOf = (text) => new Set(selectors(parse(text)).flatMap(selectorClasses));

const ownClasses = classesOf(css);
const componentClasses = classesOf(componentsCss());
const utilities = new Set(
  JSON.parse(read('scripts/classes.json')).classes.flatMap((c) => [c.class, ...c.variants.map((v) => `${v}:${c.class}`)]),
);
const listed = new Set(manifest.components.flatMap((c) => c.classes));
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

describe('forms components', () => {
  it('has a well formed manifest', () => {
    expect(manifest.group).toBe('forms');
    expect(manifest.title).toBe('Forms');
    const slugs = manifest.components.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const c of manifest.components) {
      expect(c.name, c.slug).toBeTruthy();
      expect(c.slug).toMatch(/^[a-z][a-z0-9-]*$/);
      expect(c.description.length, c.slug).toBeGreaterThan(10);
      expect(c.classes.length, c.slug).toBeGreaterThan(0);
      expect(c.html, c.slug).toMatch(/class="/);
    }
    expect(listed.size).toBeGreaterThanOrEqual(50);
  });

  it('ships every manifest class in the build output', () => {
    const missing = [...listed].filter(
      (c) => !ownClasses.has(c) || !new RegExp(`\\.${escapeRe(escapeClass(c))}(?![\\w-])`).test(built),
    );
    expect(missing).toEqual([]);
  });

  it('lists every class the stylesheet defines', () => {
    expect([...ownClasses].filter((c) => !listed.has(c))).toEqual([]);
  });

  it('only uses existing classes in the html examples', () => {
    const unknown = [];
    for (const c of manifest.components) {
      for (const [, value] of c.html.matchAll(/class="([^"]*)"/g)) {
        for (const cls of value.split(/\s+/).filter(Boolean)) {
          if (!componentClasses.has(cls) && !utilities.has(cls)) unknown.push(`${c.slug}: ${cls}`);
        }
      }
    }
    expect(unknown).toEqual([]);
  });

  it('never uses !important', () => {
    expect(css).not.toMatch(/!\s*important/);
  });

  it('uses theme tokens instead of hard coded colors', () => {
    const outsideUrls = css.replace(/url\("[^"]*"\)/g, 'url()');
    expect(outsideUrls).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    expect(outsideUrls).not.toMatch(/\b(rgb|rgba|hsl|hsla)\(/);
    const allowed = new Set([...semanticColors, 'mode', 'font-mono']);
    const vars = [...outsideUrls.matchAll(/var\(--([\w-]+)/g)].map((m) => m[1]);
    const foreign = vars.filter((v) => !allowed.has(v) && !/^(_|field-|choice-|otp-)/.test(v));
    expect(foreign).toEqual([]);
  });

  it('honours reduced motion', () => {
    expect(css).toContain('@media (prefers-reduced-motion: reduce)');
  });
});
