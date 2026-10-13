// Shared component tokens: one scale for radius, control heights, focus ring,
// border width, shadows, motion and disabled opacity, used by every component.
import { describe, it, expect } from 'vitest';
import { parse } from '../bin/css.mjs';
import { componentScale, componentThemeTokens, tokensCss, THEME_SCOPE } from '../src/base.mjs';
import { componentsCss, componentFiles } from '../src/components/index.mjs';
import { read, sharedTokens } from './helpers.mjs';

const css = componentsCss();
const SIZES = ['xs', 'sm', 'md', 'lg', 'xl'];

// Every rule of the component layer, flattened out of at-rules.
const rules = [];
(function walk(nodes) {
  for (const n of nodes) {
    if (n.decls) rules.push(n);
    if (n.children) walk(n.children);
  }
})(parse(css));
const selects = (r, selector) => r.prelude.split(',').map((s) => s.trim()).includes(selector);
// The last value the component layer gives `prop` on exactly `selector`.
const decl = (selector, prop) => {
  let value;
  for (const r of rules) if (selects(r, selector)) for (const [p, v] of r.decls) if (p === prop) value = v;
  return value;
};
// Replaces var() and calc() (nested too) with X.
const opaque = (v) => {
  let out = v;
  while (/(var|calc)\([^()]*\)/.test(out)) out = out.replace(/(var|calc)\([^()]*\)/g, 'X');
  return out;
};

describe('shared component tokens', () => {
  const tokens = tokensCss();
  const root = tokens.slice(tokens.indexOf(':root {'), tokens.indexOf('}', tokens.indexOf(':root {')));
  const scope = tokens.slice(tokens.indexOf(`${THEME_SCOPE} {`));

  it('declares the plain scale once, on :root', () => {
    for (const [k, v] of Object.entries(componentScale)) {
      expect(root).toContain(`--m-${k}: ${v};`);
      expect(scope).not.toContain(`--m-${k}:`);
    }
  });

  it('declares the ring and shadows with the theme tokens, so dark sections recompute them', () => {
    for (const k of Object.keys(componentThemeTokens)) expect(scope).toContain(`--m-${k}:`);
    expect(componentThemeTokens.ring).toBe('var(--m-ring-width) solid var(--ring)');
    for (const level of ['xs', 'sm', 'md', 'lg', 'xl']) expect(componentThemeTokens[`shadow-${level}`]).toContain('var(--mode)');
  });

  it('has a full scale for every size step', () => {
    for (const s of SIZES) {
      for (const k of ['control-h', 'control-fs', 'control-px']) expect(componentScale[`${k}-${s}`]).toMatch(/rem$/);
    }
    const heights = SIZES.map((s) => parseFloat(componentScale[`control-h-${s}`]));
    expect([...heights].sort((a, b) => a - b)).toEqual(heights);
    const radii = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'].map((s) => parseFloat(componentScale[`radius-${s}`]));
    expect([...radii].sort((a, b) => a - b)).toEqual(radii);
  });

  it('only reads --m-* names that exist', () => {
    const declared = new Set([...css.matchAll(/(--m-[\w-]+)\s*:/g)].map((m) => m[1]));
    const preflight = ['--m-shadow-color'];
    const used = [...new Set([...css.matchAll(/var\((--m-[\w-]+)/g)].map((m) => m[1]))];
    expect(used.filter((v) => !sharedTokens.includes(v) && !declared.has(v) && !preflight.includes(v))).toEqual([]);
  });

  it('never defines a custom property in terms of itself', () => {
    const cycles = [];
    for (const r of rules) for (const [p, v] of r.decls) if (p.startsWith('--') && v.includes(`var(${p})`)) cycles.push(`${r.prelude} { ${p} }`);
    expect(cycles).toEqual([]);
  });

  it('gives every component group the shared tokens', () => {
    for (const f of componentFiles()) {
      const text = read(`src/components/${f}`);
      expect(text, f).toContain('var(--m-radius-');
      expect(text, f).toContain('var(--m-border-width)');
      expect(text, f).toContain('var(--m-duration');
    }
  });
});

describe('one control scale across components', () => {
  const sized = {
    btn: '--btn-h', input: '--field-h', select: '--field-h', textarea: '--field-h', 'file-input': '--field-h',
    'input-group': '--field-h', tabs: '--tab-h', pagination: '--pg-size', segmented: '--seg-h', 'toggle-group': '--tg-h',
  };

  it.each(Object.entries(sized))('%s uses the shared control height for every size', (name, prop) => {
    for (const s of SIZES) expect(decl(`.${name}-${s}`, prop), `${name}-${s}`).toBe(`var(--m-control-h-${s})`);
  });

  it('defaults to the md step', () => {
    expect(decl('.btn', '--btn-h')).toBe('var(--m-control-h-md)');
    expect(decl('.tabs', '--tab-h')).toBe('var(--m-control-h-md)');
    expect(decl('.pagination', '--pg-size')).toBe('var(--m-control-h-md)');
    expect(decl('.segmented', '--seg-h')).toBe('var(--m-control-h-md)');
    expect(css).toContain('height: var(--field-h, var(--m-control-h-md));');
  });

  it('pairs each size with the shared font size', () => {
    for (const s of SIZES) {
      expect(decl(`.btn-${s}`, '--btn-fs')).toBe(`var(--m-control-fs-${s})`);
      expect(decl(`.input-${s}`, '--field-fs')).toBe(`var(--m-control-fs-${s})`);
      expect(decl(`.tabs-${s}`, '--tab-fs')).toBe(`var(--m-control-fs-${s})`);
    }
  });
});

describe('consistent details', () => {
  it('draws the same focus ring everywhere', () => {
    expect(css).not.toMatch(/outline:\s*\d+px solid var\(--ring\)/);
    const offsets = rules.flatMap((r) => r.decls.filter(([p]) => p === 'outline-offset').map(([, v]) => v));
    for (const v of offsets) expect(v).toMatch(/^(0|var\(--m-ring-offset\)|calc\(-\d \* var\(--m-ring-width\)\))$/);
    expect(read('src/base.mjs')).toContain(':focus-visible { outline: var(--m-ring); outline-offset: var(--m-ring-offset); }');
  });

  it('uses the shared disabled opacity', () => {
    for (const r of rules) {
      if (!/disabled/.test(r.prelude)) continue;
      for (const [p, v] of r.decls) if (p === 'opacity') expect(v, r.prelude).toMatch(/^(var\(--m-disabled-opacity\)|1)$/);
    }
  });

  it('uses the shared radius scale', () => {
    for (const r of rules) {
      if (/mockup-phone/.test(r.prelude)) continue; // device frame proportions
      for (const [p, v] of r.decls) {
        if (!/radius$/.test(p)) continue;
        for (const part of opaque(v).split(/\s+/)) {
          expect(part, `${r.prelude} { ${p}: ${v} }`).toMatch(/^(X|0|50%|inherit|[1-3]px)$/);
        }
      }
    }
  });

  it('uses the shared motion tokens', () => {
    for (const r of rules) {
      for (const [p, v] of r.decls) {
        if (!/^transition(-duration)?$/.test(p)) continue;
        expect(v.replace(/\b0s\b/g, ''), `${r.prelude} { ${p}: ${v} }`).not.toMatch(/\d(\.\d+)?m?s\b/);
      }
    }
  });

  it('uses the shared border width', () => {
    expect(css).not.toMatch(/[^-\w.]1px solid /);
  });

  it('uses the shared shadow levels instead of ad hoc black shadows', () => {
    expect(css).not.toMatch(/rgb\(0 0 0/);
    const levels = ['xs', 'sm', 'md', 'lg', 'xl'].filter((l) => css.includes(`var(--m-shadow-${l})`));
    expect(levels).toEqual(['xs', 'sm', 'md', 'lg', 'xl']);
  });

  it('tones every component with --tone and --tone-fg', () => {
    for (const legacy of ['--choice-tone', '--choice-fg', '--step-tone', '--bubble-bg', '--bubble-fg', '--divider-color', '--trend', '--field-ring']) {
      expect(css).not.toContain(legacy);
    }
    for (const sel of ['.checkbox-success', '.toggle-success', '.btn-success', '.badge-success', '.steps-success', '.divider-success', '.chat-bubble-success', '.input-success']) {
      expect(decl(sel, '--tone'), sel).toBe('var(--success)');
    }
    for (const sel of ['.menu', '.tabs', '.pagination', '.sidebar', '.stepper', '.toc', '.checkbox']) {
      expect(decl(sel, '--tone'), sel).toBe('var(--primary)');
    }
  });
});
