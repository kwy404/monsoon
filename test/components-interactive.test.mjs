import { describe, it, expect } from 'vitest';
import { readdirSync } from 'node:fs';
import { generate } from '../src/generate.mjs';
import { componentsCss } from '../src/components/index.mjs';
import { semanticColors } from '../src/theme.mjs';
import { parse, selectorClasses, escapeClass } from '../bin/css.mjs';
import { read, root, sharedTokens } from './helpers.mjs';

const pkg = JSON.parse(read('package.json'));
const css = read('src/components/60-interactive.css');
const manifest = JSON.parse(read('src/components/60-interactive.json'));
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
const otherManifests = readdirSync(`${root}/src/components`)
  .filter((f) => f.endsWith('.json') && f !== '60-interactive.json')
  .map((f) => JSON.parse(read(`src/components/${f}`)));

// Custom properties the scripts set inline (positions, colors, fills).
const SET_BY_SCRIPT = ['range-start', 'range-end', 'range-at', 'swatch', 'fill', 'carousel-interval',
  'color-picker-hue', 'color-picker-solid', 'color-picker-color', 'color-picker-x', 'color-picker-y', 'color-picker-h', 'color-picker-a'];

describe('interactive components', () => {
  it('has a well formed manifest', () => {
    expect(manifest.group).toBe('interactive');
    expect(manifest.title).toBe('Interactive');
    const slugs = manifest.components.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const c of manifest.components) {
      expect(c.name, c.slug).toBeTruthy();
      expect(c.slug).toMatch(/^[a-z][a-z0-9-]*$/);
      expect(c.description, c.slug).toMatch(/needs monsoon\.js/i);
      expect(c.needsJs, c.slug).toBe(true);
      expect(c.classes.length, c.slug).toBeGreaterThan(0);
      expect(c.html, c.slug).toMatch(/data-m-[a-z-]+/);
      expect(c.api.attribute, c.slug).toMatch(/^data-m-/);
      expect(Array.isArray(c.api.methods) && Array.isArray(c.api.events) && Array.isArray(c.api.options), c.slug).toBe(true);
    }
    expect(manifest.components.length).toBeGreaterThanOrEqual(20);
  });

  it('uses slugs no other group uses', () => {
    const others = new Set(otherManifests.flatMap((m) => m.components.map((c) => c.slug)));
    expect(manifest.components.map((c) => c.slug).filter((s) => others.has(s))).toEqual([]);
  });

  it('documents a script module for every data attribute it uses', () => {
    const modules = new Set(readdirSync(`${root}/src/js/components`).map((f) => f.replace(/\.mjs$/, '')));
    const names = {
      datepicker: 'datepicker', combobox: 'combobox', 'tags-input': 'tags-input', sortable: 'sortable', 'range-dual': 'range-dual',
      'color-picker': 'color-picker', 'data-table': 'data-table', tree: 'tree', splitter: 'splitter', toast: 'toast',
      password: 'password', counter: 'counter', autosize: 'autosize', command: 'command', 'infinite-scroll': 'infinite-scroll',
      countdown: 'countdown', select: 'select', 'clipboard-image': 'clipboard-image', 'rating-input': 'rating-input', 'carousel-auto': 'carousel-auto',
    };
    for (const c of manifest.components) {
      const attr = c.api.attribute.match(/^data-m-([a-z-]+)/)[1];
      expect(modules.has(names[attr]), `${c.slug}: ${attr}`).toBe(true);
    }
  });

  it('ships every manifest class in the build output', () => {
    const missing = [...listed].filter(
      (c) => !componentClasses.has(c) || !new RegExp(`\\.${escapeRe(escapeClass(c))}(?![\\w-])`).test(built),
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

  it('never uses !important or element selectors at the top level', () => {
    expect(css).not.toMatch(/!\s*important/);
    const tops = selectors(parse(css)).flatMap((s) => s.split(',').map((x) => x.trim()));
    expect(tops.filter((s) => /^[a-z]/i.test(s) && !/^(from|to|\d)/.test(s))).toEqual([]);
  });

  it('uses theme tokens instead of hard coded colors', () => {
    const outsideUrls = css.replace(/url\("[^"]*"\)/g, 'url()');
    expect(outsideUrls).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    expect(outsideUrls).not.toMatch(/\b(rgb|rgba|hsl|hsla)\(/);
    const declared = new Set([...outsideUrls.matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1].slice(2)));
    const nav = new Set([...componentsCss().matchAll(/(--m-[\w-]+)\s*:/g)].map((m) => m[1].slice(2)));
    const allowed = new Set([...semanticColors, 'mode', 'font-mono', 'tone', 'tone-fg', 'field-h', 'field-fs', 'field-px', 'field-radius', 'field-bg', 'field-tone', 'field-border', 'choice-size',
      ...sharedTokens.map((t) => t.slice(2)), ...SET_BY_SCRIPT, ...declared, ...nav]);
    const vars = [...outsideUrls.matchAll(/var\(--([\w-]+)/g)].map((m) => m[1]);
    expect([...new Set(vars.filter((v) => !allowed.has(v) && !v.startsWith('_')))]).toEqual([]);
  });

  it('honours reduced motion and forced colors', () => {
    expect(css).toContain('@media (prefers-reduced-motion: reduce)');
    expect(css).toContain('@media (forced-colors: active)');
  });

  it('keeps popups hidden until the script opens them', () => {
    // A display value on a [popover] element would beat the browser's hiding,
    // so the panels only get one while open or without the popover attribute.
    for (const panel of ['datepicker-panel', 'color-picker-panel', 'data-table-menu', 'select-menu-popup']) {
      const rules = css.match(new RegExp(`\\.${panel}(?::[\\w-]+(?:\\([^)]*\\))?)? \\{[^}]*display:`, 'g')) || [];
      expect(rules.every((r) => /:popover-open|:not\(\[popover\]\)/.test(r)), panel).toBe(true);
    }
  });
});
