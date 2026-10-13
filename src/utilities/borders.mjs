import { radii } from '../scales.mjs';

const RING_BOX = 'var(--m-ring-offset-shadow), var(--m-ring-shadow), var(--m-shadow)';

export default function borders(add) {
  // Border width
  const widths = { '': '1px', 0: '0', 2: '2px', 4: '4px', 8: '8px' };
  const sides = {
    '': ['border-width'],
    x: ['border-left-width', 'border-right-width'],
    y: ['border-top-width', 'border-bottom-width'],
    t: ['border-top-width'],
    r: ['border-right-width'],
    b: ['border-bottom-width'],
    l: ['border-left-width'],
    s: ['border-inline-start-width'],
    e: ['border-inline-end-width'],
  };
  for (const [side, props] of Object.entries(sides)) {
    for (const [w, v] of Object.entries(widths)) {
      const name = ['border', side, w].filter((x) => x !== '').join('-');
      const groups = w === '0' && ['', 't', 'b', 'l', 'r'].includes(side) ? ['struct'] : [];
      add('borders', name, Object.fromEntries(props.map((p) => [p, v])), groups);
    }
  }
  for (const s of ['solid', 'dashed', 'dotted', 'double', 'hidden', 'none']) add('borders', `border-${s}`, { 'border-style': s });

  // Border radius
  const corners = {
    '': ['border-radius'],
    t: ['border-top-left-radius', 'border-top-right-radius'],
    r: ['border-top-right-radius', 'border-bottom-right-radius'],
    b: ['border-bottom-right-radius', 'border-bottom-left-radius'],
    l: ['border-top-left-radius', 'border-bottom-left-radius'],
    tl: ['border-top-left-radius'],
    tr: ['border-top-right-radius'],
    br: ['border-bottom-right-radius'],
    bl: ['border-bottom-left-radius'],
  };
  for (const [c, props] of Object.entries(corners)) {
    for (const [k, v] of Object.entries(radii)) {
      const name = ['rounded', c, k].filter((x) => x !== '').join('-');
      add('borders', name, Object.fromEntries(props.map((p) => [p, v])));
    }
  }

  // Divide (borders between children)
  const divideSel = (s) => `:where(${s} > :not(:last-child))`;
  for (const [w, v] of Object.entries({ '': '1px', 0: '0', 2: '2px', 4: '4px', 8: '8px' })) {
    const suffix = w === '' ? '' : `-${w}`;
    add('borders', `divide-x${suffix}`, { 'border-inline-style': 'solid', 'border-inline-start-width': '0', 'border-inline-end-width': v }, [], { selector: divideSel });
    add('borders', `divide-y${suffix}`, { 'border-top-width': '0', 'border-bottom-style': 'solid', 'border-bottom-width': v }, [], { selector: divideSel });
  }
  for (const s of ['solid', 'dashed', 'dotted', 'double', 'none']) add('borders', `divide-${s}`, { 'border-style': s }, [], { selector: divideSel });

  // Ring (box-shadow based, composes with shadows)
  for (const [w, v] of Object.entries({ 0: '0px', 1: '1px', 2: '2px', '': '3px', 4: '4px', 8: '8px' })) {
    const name = w === '' ? 'ring' : `ring-${w}`;
    add('borders', name, {
      '--m-ring-offset-shadow': 'var(--m-ring-inset,) 0 0 0 var(--m-ring-offset-width) var(--m-ring-offset-color)',
      '--m-ring-shadow': `var(--m-ring-inset,) 0 0 0 calc(${v} + var(--m-ring-offset-width)) var(--m-ring-color)`,
      'box-shadow': RING_BOX,
    }, ['ring']);
  }
  add('borders', 'ring-inset', { '--m-ring-inset': 'inset' }, ['ring']);
  for (const w of ['0', '1', '2', '4', '8']) add('borders', `ring-offset-${w}`, { '--m-ring-offset-width': `${w}px` }, ['ring']);

  // Outline
  add('borders', 'outline-none', { outline: '2px solid transparent', 'outline-offset': '2px' }, ['ring']);
  add('borders', 'outline-hidden', { outline: '2px solid transparent', 'outline-offset': '2px' }, ['ring']);
  add('borders', 'outline', { 'outline-style': 'solid', 'outline-width': '1px' }, ['ring']);
  for (const w of ['0', '1', '2', '4', '8']) add('borders', `outline-${w}`, { 'outline-style': 'solid', 'outline-width': `${w}px` }, ['ring']);
  for (const s of ['dashed', 'dotted', 'double']) add('borders', `outline-${s}`, { 'outline-style': s });
  for (const w of ['0', '1', '2', '4', '8']) add('borders', `outline-offset-${w}`, { 'outline-offset': `${w}px` }, ['ring']);
}

export { RING_BOX };
