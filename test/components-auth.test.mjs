import { describe, it, expect } from 'vitest';
import { readdirSync } from 'node:fs';
import { generate } from '../src/generate.mjs';
import { componentsCss } from '../src/components/index.mjs';
import { semanticColors } from '../src/theme.mjs';
import { parse, selectorClasses, escapeClass } from '../bin/css.mjs';
import { read, root, sharedTokens } from './helpers.mjs';

const pkg = JSON.parse(read('package.json'));
const css = read('src/components/70-auth.css');
const manifest = JSON.parse(read('src/components/70-auth.json'));
const forms = JSON.parse(read('src/components/10-forms.json'));
const formsCss = read('src/components/10-forms.css');
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
  .filter((f) => f.endsWith('.json') && f !== '70-auth.json')
  .map((f) => JSON.parse(read(`src/components/${f}`)));
const jsDir = `${root}/src/js/components`;
const defined = new Set(readdirSync(jsDir).filter((f) => f.endsWith('.mjs'))
  .flatMap((f) => [...read(`src/js/components/${f}`).matchAll(/define\('([a-z-]+)'/g)].map((m) => m[1])));
const otp = forms.components.find((c) => c.slug === 'otp');

describe('auth components', () => {
  it('has a well formed manifest', () => {
    expect(manifest.group).toBe('auth');
    expect(manifest.title).toBe('Two factor and sign in');
    const slugs = manifest.components.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const c of manifest.components) {
      expect(c.name, c.slug).toBeTruthy();
      expect(c.slug).toMatch(/^[a-z][a-z0-9-]*$/);
      expect(c.description.length, c.slug).toBeGreaterThan(40);
      expect(c.classes.length, c.slug).toBeGreaterThan(0);
      expect(c.html, c.slug).toMatch(/class="/);
    }
    expect(manifest.components.length).toBeGreaterThanOrEqual(13);
  });

  it('uses slugs no other group uses', () => {
    const others = new Set(otherManifests.flatMap((m) => m.components.map((c) => c.slug)));
    expect(manifest.components.map((c) => c.slug).filter((s) => others.has(s))).toEqual([]);
  });

  it('marks every scripted example and documents its API', () => {
    for (const c of manifest.components) {
      const attrs = [...c.html.matchAll(/\sdata-m-([a-z-]+?)(?=[\s=>])/g)].map((m) => m[1]);
      const own = attrs.filter((a) => defined.has(a));
      if (!own.length) {
        expect(c.needsJs, c.slug).toBeFalsy();
        continue;
      }
      expect(c.needsJs, c.slug).toBe(true);
      expect(c.description, c.slug).toMatch(/needs monsoon\.js/i);
    }
    for (const c of manifest.components.filter((x) => x.api && x.api.attribute)) {
      expect(c.api.attribute, c.slug).toMatch(/^data-m-/);
      expect(defined.has(c.api.attribute.slice(7)), c.slug).toBe(true);
      expect(Array.isArray(c.api.options) && Array.isArray(c.api.methods) && Array.isArray(c.api.events), c.slug).toBe(true);
    }
    const key = manifest.components.find((c) => c.slug === 'security-key');
    expect(key.api.notes.join(' ')).toMatch(/navigator\.credentials\.get/);
  });

  it('only uses data-m attributes of components that exist', () => {
    const unknown = [];
    for (const c of manifest.components) {
      for (const [, name] of c.html.matchAll(/\sdata-m-([a-z]+(?:-[a-z]+)*)(?=[\s=>])/g)) {
        const base = [...defined].some((d) => name === d || name.startsWith(`${d}-`));
        if (!base) unknown.push(`${c.slug}: ${name}`);
      }
    }
    expect(unknown).toEqual([]);
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

  it('uses placeholder data only: example domains, documentation IPs, no external images', () => {
    const all = manifest.components.map((c) => c.html).join('\n');
    for (const [email] of all.matchAll(/[\w.%+-]+@[\w-]+(\.[\w-]+)+/g)) expect(email).toMatch(/@example\.com$/);
    for (const [, host] of all.matchAll(/%40([\w.-]+)/g)) expect(host).toMatch(/example\.com$/);
    for (const [ip] of all.matchAll(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g)) expect(ip).toMatch(/^(192\.0\.2|198\.51\.100|203\.0\.113)\./);
    expect(all).not.toMatch(/<img\b/);
    expect(all).not.toMatch(/src="https?:/);
    expect(all).not.toMatch(/\+\d{1,3} ?\d{4,}/);
  });

  it('never uses !important', () => {
    expect(css).not.toMatch(/!\s*important/);
  });

  it('uses theme tokens instead of hard coded colors', () => {
    const outsideUrls = css.replace(/url\("[^"]*"\)/g, 'url()');
    expect(outsideUrls).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    expect(outsideUrls).not.toMatch(/\b(rgb|rgba|hsl|hsla)\(/);
    expect(outsideUrls).not.toMatch(/:\s*(white|black)\b|,\s*(white|black)\b/);
    const allowed = new Set([...semanticColors, 'mode', 'font-mono', 'tone', 'tone-fg', ...sharedTokens.map((t) => t.slice(2))]);
    const vars = [...outsideUrls.matchAll(/var\(--([\w-]+)/g)].map((m) => m[1]);
    const foreign = vars.filter((v) => !allowed.has(v) && !/^(_|auth-|qr-|field-)/.test(v));
    expect(foreign).toEqual([]);
  });

  it('keeps selectors flat and namespaced', () => {
    for (const sel of selectors(parse(css))) {
      expect(sel, sel).not.toMatch(/#[\w-]+/);
      for (const part of sel.split(',')) expect(part.trim(), sel).toMatch(/^(\.|:root|from|to|\d)/);
    }
  });

  it('keeps the QR tile dark on light in both modes', () => {
    expect(css).toMatch(/--qr-light: color-mix\(in oklab, var\(--foreground\) calc\(100% \* var\(--mode\)\), var\(--surface\)\)/);
    expect(css).toMatch(/--qr-dark: color-mix\(in oklab, var\(--background\) calc\(100% \* var\(--mode\)\), var\(--foreground\)\)/);
  });

  it('honours reduced motion and forced colors', () => {
    expect(css).toContain('@media (prefers-reduced-motion: reduce)');
    expect(css).toContain('@media (forced-colors: active)');
    const animated = [...css.matchAll(/^([^@{}][^{}]*)\{[^}]*\banimation:\s*m-/gm)].length;
    expect(animated).toBeGreaterThan(5);
  });
});

describe('one time code in forms', () => {
  it('works without JavaScript as a single field', () => {
    expect(otp.html).not.toMatch(/data-m-/);
    expect(otp.html).toContain('class="otp-field"');
    expect(otp.html).toContain('autocomplete="one-time-code"');
    expect(otp.html).toContain('inputmode="numeric"');
    expect(otp.html).not.toMatch(/maxlength="1"/);
    expect(otp.description).toMatch(/data-m-otp/);
  });

  it('lists sizes, tones, lengths and states', () => {
    for (const c of ['otp', 'otp-field', 'otp-input', 'otp-separator', 'otp-masked', 'otp-xs', 'otp-sm', 'otp-md', 'otp-lg', 'otp-xl',
      'otp-primary', 'otp-success', 'otp-danger', 'otp-4', 'otp-8']) expect(otp.classes).toContain(c);
  });

  it('spaces the field over slots and styles the script states', () => {
    expect(formsCss).toMatch(/\.otp-field \{[^}]*letter-spacing: calc\(var\(--_pitch\) - 1ch\);/);
    expect(formsCss).toMatch(/\.otp-field \{[^}]*font-family: var\(--font-mono\);/);
    expect(formsCss).toMatch(/\.otp\[data-otp-ready\] > \.otp-field \{[^}]*opacity: 0;/);
    expect(formsCss).toMatch(/\.otp\[data-state=error\] \{[^}]*animation: m-otp-shake/);
    expect(formsCss).toMatch(/\.otp\[data-state=success\] > \.otp-input \{/);
    expect(formsCss).toMatch(/@media \(prefers-reduced-motion: reduce\) \{[\s\S]*\.otp\[data-state=error\][^{]*\{ animation: none; \}/);
  });
});
