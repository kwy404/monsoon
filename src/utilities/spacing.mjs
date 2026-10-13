import { spacing, sizing, negativeSpacing, fractions, containerWidths, breakpoints } from '../scales.mjs';

const pick = (obj, keys) => Object.fromEntries(keys.map((k) => [k, obj[k]]));

const sides = {
  '': ['padding'],
  x: ['padding-inline'],
  y: ['padding-block'],
  t: ['padding-top'],
  r: ['padding-right'],
  b: ['padding-bottom'],
  l: ['padding-left'],
  s: ['padding-inline-start'],
  e: ['padding-inline-end'],
};

// Steps that also get container query variants (keeps the bundle small).
const cqSteps = new Set(['0', '1', '2', '3', '4', '6', '8', '10', '12', '16']);

export function spacingUtilities(add) {
  for (const kind of ['p', 'm']) {
    const prop = kind === 'p' ? 'padding' : 'margin';
    for (const [side, props] of Object.entries(sides)) {
      const name = `${kind}${side}`;
      const cssProps = props.map((p) => p.replace('padding', prop));
      const values = kind === 'm' ? { ...spacing, auto: 'auto' } : spacing;
      for (const [k, v] of Object.entries(values)) {
        const groups = ['s', 'e'].includes(side) ? [] : ['layout'];
        if (kind === 'p' && ['', 'x', 'y'].includes(side) && cqSteps.has(k)) groups.push('cq');
        if (k === '0' && ['t', 'b', 'l', 'r', 'x', 'y', ''].includes(side)) groups.push('struct');
        add('spacing', `${name}-${k}`, Object.fromEntries(cssProps.map((p) => [p, v])), groups);
      }
      if (kind === 'm') {
        for (const [k, v] of Object.entries(negativeSpacing)) {
          add('spacing', `-${name}-${k}`, Object.fromEntries(cssProps.map((p) => [p, `-${v}`])));
        }
      }
    }
  }

  // space-x and space-y: margins between children, wrapped in :where() so they stay easy to override.
  for (const axis of ['x', 'y']) {
    const prop = axis === 'x' ? 'margin-inline-end' : 'margin-block-end';
    for (const [k, v] of Object.entries(spacing)) {
      add('spacing', `space-${axis}-${k}`, { [prop]: v }, [], {
        selector: (s) => `:where(${s} > :not(:last-child))`,
      });
    }
    for (const [k, v] of Object.entries(pick(negativeSpacing, ['px', '0.5', '1', '2', '4']))) {
      add('spacing', `-space-${axis}-${k}`, { [prop]: `-${v}` }, [], {
        selector: (s) => `:where(${s} > :not(:last-child))`,
      });
    }
  }
}

export function sizingUtilities(add) {
  const LC = ['layout', 'cq'];
  const common = { auto: 'auto', full: '100%', min: 'min-content', max: 'max-content', fit: 'fit-content' };

  // Width
  for (const [k, v] of Object.entries(sizing)) add('sizing', `w-${k}`, { width: v }, ['layout']);
  for (const [k, v] of Object.entries(fractions)) add('sizing', `w-${k}`, { width: v }, LC);
  for (const [k, v] of Object.entries(common)) add('sizing', `w-${k}`, { width: v }, k === 'auto' || k === 'full' ? LC : ['layout']);
  add('sizing', 'w-screen', { width: '100vw' }, ['layout']);
  for (const u of ['svw', 'lvw', 'dvw']) add('sizing', `w-${u}`, { width: `100${u}` });

  // Height
  for (const [k, v] of Object.entries(sizing)) add('sizing', `h-${k}`, { height: v });
  for (const [k, v] of Object.entries(fractions)) add('sizing', `h-${k}`, { height: v });
  for (const [k, v] of Object.entries(common)) add('sizing', `h-${k}`, { height: v }, ['layout']);
  add('sizing', 'h-screen', { height: '100vh' }, ['layout']);
  for (const u of ['svh', 'lvh', 'dvh']) add('sizing', `h-${u}`, { height: `100${u}` });

  // Size (width and height)
  for (const [k, v] of Object.entries({ ...sizing, ...common })) add('sizing', `size-${k}`, { width: v, height: v });

  // Min and max width
  const minSteps = pick(sizing, ['0', 'px', '8', '10', '12', '16', '20', '24', '32', '40', '48', '64', '72', '80', '96']);
  for (const [k, v] of Object.entries({ ...minSteps, ...common, screen: '100vw' })) {
    if (k === 'auto') continue;
    add('sizing', `min-w-${k}`, { 'min-width': v });
  }
  const maxW = {
    none: 'none', '0': '0', px: '1px', full: '100%', min: 'min-content', max: 'max-content',
    fit: 'fit-content', prose: '65ch', ...pick(containerWidths, ['3xs', '2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl']),
    ...pick(sizing, ['8', '12', '16', '24', '32', '40', '48', '64', '72', '80', '96']),
  };
  for (const [k, v] of Object.entries(maxW)) add('sizing', `max-w-${k}`, { 'max-width': v }, ['layout']);
  for (const [k, v] of Object.entries(breakpoints)) add('sizing', `max-w-screen-${k}`, { 'max-width': v }, ['layout']);

  // Min and max height
  for (const [k, v] of Object.entries({ ...minSteps, ...common, screen: '100vh', svh: '100svh', lvh: '100lvh', dvh: '100dvh' })) {
    if (k === 'auto') continue;
    add('sizing', `min-h-${k}`, { 'min-height': v });
  }
  const maxH = {
    none: 'none', ...sizing, full: '100%', min: 'min-content', max: 'max-content', fit: 'fit-content',
    screen: '100vh', svh: '100svh', lvh: '100lvh', dvh: '100dvh',
  };
  for (const [k, v] of Object.entries(maxH)) add('sizing', `max-h-${k}`, { 'max-height': v });
}
