import { palette, steps, neutrals } from '../palette.mjs';
import { semanticColors } from '../theme.mjs';
import { alphaSteps } from '../scales.mjs';

const specials = { white: '#fff', black: '#000', transparent: 'transparent', current: 'currentColor', inherit: 'inherit' };

const properties = {
  text: { color: 'VALUE' },
  bg: { 'background-color': 'VALUE' },
  border: { 'border-color': 'VALUE' },
  ring: { '--m-ring-color': 'VALUE' },
  outline: { 'outline-color': 'VALUE' },
  decoration: { 'text-decoration-color': 'VALUE' },
  fill: { fill: 'VALUE' },
  stroke: { stroke: 'VALUE' },
  shadow: { '--m-shadow-color': 'VALUE' },
};

const fill = (decls, value) => Object.fromEntries(Object.entries(decls).map(([p, v]) => [p, v.replace('VALUE', value)]));
const mix = (value, pct) => `color-mix(in oklab, ${value} ${pct}%, transparent)`;
const BTB = ['bg', 'text', 'border'];

export default function colors(add) {
  // Ordered by utility type so later types never fight earlier ones.
  for (const [prefix, decls] of Object.entries(properties)) {
    const cat = 'colors';
    for (const name of semanticColors) {
      const groups = [];
      if (BTB.includes(prefix)) groups.push('color', 'semantic');
      if (prefix === 'bg' || prefix === 'border') groups.push('struct');
      if (prefix === 'ring' || prefix === 'outline') groups.push('ring');
      add(cat, `${prefix}-${name}`, fill(decls, `var(--${name})`), groups);
    }
    for (const [name, value] of Object.entries(specials)) {
      if (prefix === 'shadow' && (name === 'current' || name === 'inherit')) continue;
      const groups = BTB.includes(prefix) && name !== 'inherit' && name !== 'current' ? ['color', 'darkColor'] : [];
      add(cat, `${prefix}-${name}`, fill(decls, value), groups);
    }
    for (const [p, shades] of Object.entries(palette)) {
      // text, bg and border get every step; the other color utilities get the middle steps.
      for (const s of BTB.includes(prefix) ? steps : [400, 500, 600]) {
        const groups = [];
        if (BTB.includes(prefix)) {
          if ([500, 600, 700].includes(s)) groups.push('color', 'darkColor');
          else if (neutrals.includes(p)) groups.push('darkColor');
          else if (prefix === 'text' && (s === 300 || s === 400)) groups.push('darkColor');
          if (prefix === 'bg' && neutrals.includes(p) && (s === 50 || s === 100)) groups.push('struct');
        }
        if (prefix === 'ring' && s === 500) groups.push('ring');
        add(cat, `${prefix}-${p}-${s}`, fill(decls, `var(--color-${p}-${s})`), groups);
        void shades;
      }
    }
  }

  // Opacity modifiers for semantic colors, black and white: bg-black/50, text-primary/80.
  for (const prefix of BTB) {
    for (const name of [...semanticColors, 'white', 'black']) {
      const value = specials[name] || `var(--${name})`;
      for (const pct of alphaSteps) {
        const groups = prefix === 'bg' || ['white', 'black'].includes(name) ? ['alpha'] : [];
        add('colors', `${prefix}-${name}/${pct}`, fill(properties[prefix], mix(value, pct)), groups);
      }
    }
  }

  // Ring offset color and divide / placeholder colors (semantic only).
  for (const name of [...semanticColors, 'white', 'black', 'transparent']) {
    const value = specials[name] || `var(--${name})`;
    add('colors', `ring-offset-${name}`, { '--m-ring-offset-color': value });
    add('colors', `divide-${name}`, { 'border-color': value }, [], { selector: (s) => `:where(${s} > :not(:last-child))` });
    add('colors', `placeholder-${name}`, { color: value }, [], { selector: (s) => `${s}::placeholder` });
  }

  // Gradients: direction plus from / via / to stops.
  const dirs = { t: 'top', tr: 'top right', r: 'right', br: 'bottom right', b: 'bottom', bl: 'bottom left', l: 'left', tl: 'top left' };
  for (const [k, v] of Object.entries(dirs)) {
    add('backgrounds', `bg-gradient-to-${k}`, { 'background-image': `linear-gradient(to ${v}, var(--m-gradient-stops))` });
  }
  const stopColors = { ...Object.fromEntries(semanticColors.map((n) => [n, `var(--${n})`])), white: '#fff', black: '#000', transparent: 'transparent' };
  for (const p of Object.keys(palette)) for (const s of [400, 500, 600]) stopColors[`${p}-${s}`] = `var(--color-${p}-${s})`;
  for (const [n, v] of Object.entries(stopColors)) {
    add('backgrounds', `from-${n}`, {
      '--m-gradient-from': v,
      '--m-gradient-stops': 'var(--m-gradient-from), var(--m-gradient-via, var(--m-gradient-to, transparent)), var(--m-gradient-to, transparent)',
    });
  }
  for (const [n, v] of Object.entries(stopColors)) add('backgrounds', `via-${n}`, { '--m-gradient-via': v });
  for (const [n, v] of Object.entries(stopColors)) add('backgrounds', `to-${n}`, { '--m-gradient-to': v });

  // Background helpers
  add('backgrounds', 'bg-none', { 'background-image': 'none' });
  for (const v of ['auto', 'cover', 'contain']) add('backgrounds', `bg-${v}`, { 'background-size': v });
  for (const v of ['center', 'top', 'bottom', 'left', 'right']) add('backgrounds', `bg-${v}`, { 'background-position': v });
  add('backgrounds', 'bg-repeat', { 'background-repeat': 'repeat' });
  add('backgrounds', 'bg-no-repeat', { 'background-repeat': 'no-repeat' });
  add('backgrounds', 'bg-fixed', { 'background-attachment': 'fixed' });
  add('backgrounds', 'bg-local', { 'background-attachment': 'local' });
  add('backgrounds', 'bg-scroll', { 'background-attachment': 'scroll' });
  add('backgrounds', 'bg-clip-text', { '-webkit-background-clip': 'text', 'background-clip': 'text' });
  add('backgrounds', 'bg-clip-padding', { 'background-clip': 'padding-box' });
  add('backgrounds', 'bg-clip-border', { 'background-clip': 'border-box' });
}
