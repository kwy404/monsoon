import { escapeClass, parse, serialize } from '../bin/css.mjs';
import { tokensCss, preflight } from './base.mjs';
import { componentsCss } from './components/index.mjs';
import { keyframes } from './utilities/effects.mjs';
import layout from './utilities/layout.mjs';
import flexgrid from './utilities/flexgrid.mjs';
import { spacingUtilities, sizingUtilities } from './utilities/spacing.mjs';
import typography from './utilities/typography.mjs';
import borders from './utilities/borders.mjs';
import colors from './utilities/colors.mjs';
import effects from './utilities/effects.mjs';
import interactivity, { accessibility } from './utilities/interactivity.mjs';
import { stateVariants, responsiveVariants, containerVariants } from './variants.mjs';

export const UTILITIES_MARKER = 'monsoon:utilities';

const modules = [
  layout, flexgrid, spacingUtilities, sizingUtilities, typography, borders, colors, effects,
  interactivity, accessibility,
];

export function collectUtilities() {
  const list = [];
  const seen = new Set();
  const add = (category, name, decls, groups = [], opts = {}) => {
    if (seen.has(name)) throw new Error(`Duplicate utility: ${name}`);
    seen.add(name);
    list.push({
      category,
      name,
      decls: Array.isArray(decls) ? decls : Object.entries(decls),
      groups: new Set(groups),
      selector: opts.selector || ((s) => s),
      media: opts.media,
    });
  };
  for (const m of modules) m(add);
  return list;
}

const rule = (prelude, decls) => ({ type: 'block', prelude, decls });

function variantRules(variant, utilities) {
  // Returns [{ at, rules }] for each form of the variant.
  return variant.forms.map((form) => {
    const rules = [];
    for (const u of utilities) {
      if (![...u.groups].some((g) => variant.groups.includes(g))) continue;
      const cls = `${variant.name}:${u.name}`;
      rules.push({ cls, base: u, node: rule(u.selector(form.sel(`.${escapeClass(cls)}`)), u.decls) });
    }
    return { at: form.at, rules };
  });
}

export function generate({ version = '0.0.0' } = {}) {
  const utilities = collectUtilities();
  const nodes = [];
  const classes = [];

  nodes.push({ type: 'comment', text: `! monsooncss v${version} | MIT License | https://github.com/kwy404/monsoon` });
  nodes.push({ type: 'comment', text: 'Theme tokens: palette, seed derived semantic colors, dark mode' });
  nodes.push(...parse(tokensCss()));
  nodes.push({ type: 'comment', text: 'Base: modern reset' });
  nodes.push(...parse(preflight));
  nodes.push({ type: 'comment', text: 'Keyframes' });
  nodes.push(...parse(keyframes));
  const components = componentsCss();
  if (components.trim()) {
    nodes.push({ type: 'comment', text: 'Components' });
    nodes.push(...parse(components));
  }
  nodes.push({ type: 'comment', text: UTILITIES_MARKER });

  // Base utilities
  const variantsOf = new Map(utilities.map((u) => [u.name, []]));
  for (const u of utilities) {
    nodes.push(rule(u.selector(`.${escapeClass(u.name)}`), u.decls));
    classes.push({ class: u.name, category: u.category, base: u });
  }

  const emit = (variant) => {
    for (const { at, rules } of variantRules(variant, utilities)) {
      if (!rules.length) continue;
      for (const r of rules) {
        const list = variantsOf.get(r.base.name);
        if (!list.includes(variant.name)) list.push(variant.name);
      }
      const ruleNodes = rules.map((r) => r.node);
      if (at) nodes.push({ type: 'block', prelude: at, children: ruleNodes });
      else nodes.push(...ruleNodes);
    }
  };

  for (const v of stateVariants) emit(v);

  for (const v of responsiveVariants) {
    const [{ at, rules }] = variantRules(v, utilities);
    const extra = utilities
      .filter((u) => u.media && u.media[v.name])
      .map((u) => rule(`.${escapeClass(u.name)}`, Object.entries(u.media[v.name])));
    for (const r of rules) variantsOf.get(r.base.name).push(v.name);
    nodes.push({ type: 'block', prelude: at, children: [...extra, ...rules.map((r) => r.node)] });
  }

  for (const v of containerVariants) emit(v);

  const css = serialize(nodes);
  const min = serialize(nodes, { minify: true });

  const classList = classes.map((c) => ({
    class: c.class,
    category: c.category,
    css: serialize([rule(c.base.selector(`.${escapeClass(c.class)}`), c.base.decls)]).trim(),
    variants: variantsOf.get(c.class),
  }));

  return { css, min, nodes, utilities, classes: classList };
}
