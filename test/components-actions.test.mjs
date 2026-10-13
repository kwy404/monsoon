import { describe, it, expect } from 'vitest';
import { generate } from '../src/generate.mjs';
import { parse, selectorClasses } from '../bin/css.mjs';
import { semanticColors } from '../src/theme.mjs';
import { read, sharedTokens } from './helpers.mjs';

const css = read('src/components/20-actions.css');
const manifest = JSON.parse(read('src/components/20-actions.json'));
const built = generate();

// Every class that appears in a selector of the given nodes.
function classesIn(nodes, out = new Set()) {
  for (const n of nodes) {
    if (n.type !== 'block') continue;
    if (!n.prelude.startsWith('@')) for (const c of selectorClasses(n.prelude)) out.add(c);
    if (n.children) classesIn(n.children, out);
  }
  return out;
}

const builtClasses = classesIn(built.nodes);
const ownClasses = classesIn(parse(css));
const manifestClasses = new Set(manifest.components.flatMap((c) => c.classes));
const utilityClasses = new Set(built.classes.flatMap((c) => [c.class, ...c.variants.map((v) => `${v}:${c.class}`)]));

describe('actions and feedback components', () => {
  it('has a well formed manifest', () => {
    expect(manifest.group).toBe('actions');
    expect(manifest.title).toBeTruthy();
    const slugs = manifest.components.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const c of manifest.components) {
      expect(c.name, c.slug).toBeTruthy();
      expect(c.description, c.slug).toMatch(/\.$/);
      expect(c.classes.length, c.slug).toBeGreaterThan(0);
      expect(c.html, c.slug).toContain('class="');
    }
    expect(manifestClasses.size).toBeGreaterThanOrEqual(110);
  });

  it('ships every manifest class in the build output', () => {
    const missing = [...manifestClasses].filter((c) => !builtClasses.has(c));
    expect(missing).toEqual([]);
  });

  it('documents every class the stylesheet defines', () => {
    const undocumented = [...ownClasses].filter((c) => !manifestClasses.has(c));
    expect(undocumented).toEqual([]);
  });

  it('only uses existing classes in the examples', () => {
    const unknown = [];
    for (const c of manifest.components) {
      for (const m of c.html.matchAll(/class="([^"]*)"/g)) {
        for (const cls of m[1].split(/\s+/).filter(Boolean)) {
          if (!builtClasses.has(cls) && !utilityClasses.has(cls)) unknown.push(`${c.slug}: ${cls}`);
        }
      }
    }
    expect(unknown).toEqual([]);
  });

  it('never uses !important', () => {
    expect(css).not.toMatch(/!\s*important/i);
  });

  it('uses theme tokens instead of hard coded hex colors', () => {
    const withoutDataUris = css.replace(/url\((["']?)data:[^)]*\1\)/g, '');
    expect(withoutDataUris).not.toMatch(/#[0-9a-f]{3,8}\b/i);
  });

  it('only reads known tokens or its own custom properties', () => {
    const declared = new Set([...css.matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1]));
    const allowed = new Set([...semanticColors.map((t) => `--${t}`), '--mode', '--font-sans', '--font-mono', '--m-shadow-color', ...sharedTokens]);
    const unknown = [...new Set([...css.matchAll(/var\((--[\w-]+)/g)].map((m) => m[1]))]
      .filter((v) => !declared.has(v) && !allowed.has(v));
    expect(unknown).toEqual([]);
  });

  it('respects reduced motion and shows a focus ring', () => {
    expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\)/);
    expect(css).toContain('outline: var(--m-ring)');
    expect(css).not.toContain('outline: 2px solid var(--ring)');
  });

  it('keeps tone classes after the component defaults', () => {
    const tones = css.indexOf('.btn-primary,');
    expect(tones).toBeGreaterThan(css.indexOf('.status {'));
    expect(tones).toBeGreaterThan(css.indexOf('.tooltip {'));
  });
});
