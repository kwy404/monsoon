import { spacing, fractions } from '../scales.mjs';

const pick = (obj, keys) => Object.fromEntries(keys.map((k) => [k, obj[k]]));

export default function flexgrid(add) {
  const LC = ['layout', 'cq'];

  // Flex
  add('flexbox', 'flex-row', { 'flex-direction': 'row' }, LC);
  add('flexbox', 'flex-row-reverse', { 'flex-direction': 'row-reverse' }, ['layout']);
  add('flexbox', 'flex-col', { 'flex-direction': 'column' }, LC);
  add('flexbox', 'flex-col-reverse', { 'flex-direction': 'column-reverse' }, ['layout']);
  add('flexbox', 'flex-wrap', { 'flex-wrap': 'wrap' }, LC);
  add('flexbox', 'flex-wrap-reverse', { 'flex-wrap': 'wrap-reverse' });
  add('flexbox', 'flex-nowrap', { 'flex-wrap': 'nowrap' }, LC);
  add('flexbox', 'flex-1', { flex: '1 1 0%' }, ['layout']);
  add('flexbox', 'flex-auto', { flex: '1 1 auto' }, ['layout']);
  add('flexbox', 'flex-initial', { flex: '0 1 auto' }, ['layout']);
  add('flexbox', 'flex-none', { flex: 'none' }, ['layout']);
  add('flexbox', 'grow', { 'flex-grow': '1' });
  add('flexbox', 'grow-0', { 'flex-grow': '0' });
  add('flexbox', 'shrink', { 'flex-shrink': '1' });
  add('flexbox', 'shrink-0', { 'flex-shrink': '0' });
  const basis = {
    ...pick(spacing, ['0', 'px', '1', '2', '4', '8', '12', '16', '20', '24', '32', '40', '48', '64']),
    auto: 'auto', full: '100%', ...fractions,
  };
  for (const [k, v] of Object.entries(basis)) add('flexbox', `basis-${k}`, { 'flex-basis': v }, k.includes('/') || k === 'full' || k === 'auto' ? ['layout'] : []);

  for (let i = 1; i <= 12; i++) add('flexbox', `order-${i}`, { order: String(i) }, ['layout']);
  add('flexbox', 'order-first', { order: '-9999' }, ['layout']);
  add('flexbox', 'order-last', { order: '9999' }, ['layout']);
  add('flexbox', 'order-none', { order: '0' }, ['layout']);

  // Grid
  for (let i = 1; i <= 12; i++) add('grid', `grid-cols-${i}`, { 'grid-template-columns': `repeat(${i}, minmax(0, 1fr))` }, LC);
  add('grid', 'grid-cols-none', { 'grid-template-columns': 'none' }, ['layout']);
  add('grid', 'grid-cols-subgrid', { 'grid-template-columns': 'subgrid' });
  add('grid', 'col-auto', { 'grid-column': 'auto' }, ['layout']);
  for (let i = 1; i <= 12; i++) add('grid', `col-span-${i}`, { 'grid-column': `span ${i} / span ${i}` }, LC);
  add('grid', 'col-span-full', { 'grid-column': '1 / -1' }, LC);
  for (let i = 1; i <= 13; i++) add('grid', `col-start-${i}`, { 'grid-column-start': String(i) });
  for (let i = 1; i <= 13; i++) add('grid', `col-end-${i}`, { 'grid-column-end': String(i) });
  add('grid', 'col-start-auto', { 'grid-column-start': 'auto' });
  add('grid', 'col-end-auto', { 'grid-column-end': 'auto' });
  for (let i = 1; i <= 12; i++) add('grid', `grid-rows-${i}`, { 'grid-template-rows': `repeat(${i}, minmax(0, 1fr))` });
  add('grid', 'grid-rows-none', { 'grid-template-rows': 'none' });
  add('grid', 'grid-rows-subgrid', { 'grid-template-rows': 'subgrid' });
  add('grid', 'row-auto', { 'grid-row': 'auto' });
  for (let i = 1; i <= 12; i++) add('grid', `row-span-${i}`, { 'grid-row': `span ${i} / span ${i}` });
  add('grid', 'row-span-full', { 'grid-row': '1 / -1' });
  for (let i = 1; i <= 7; i++) add('grid', `row-start-${i}`, { 'grid-row-start': String(i) });
  for (let i = 1; i <= 7; i++) add('grid', `row-end-${i}`, { 'grid-row-end': String(i) });
  for (const v of ['row', 'col', 'dense', 'row-dense', 'col-dense']) {
    add('grid', `grid-flow-${v}`, { 'grid-auto-flow': v.replace('col', 'column').replace('-', ' ') });
  }
  const auto = { auto: 'auto', min: 'min-content', max: 'max-content', fr: 'minmax(0, 1fr)' };
  for (const [k, v] of Object.entries(auto)) {
    add('grid', `auto-cols-${k}`, { 'grid-auto-columns': v });
    add('grid', `auto-rows-${k}`, { 'grid-auto-rows': v });
  }

  // Gap
  for (const [k, v] of Object.entries(spacing)) {
    add('spacing', `gap-${k}`, { gap: v }, LC);
    add('spacing', `gap-x-${k}`, { 'column-gap': v }, LC);
    add('spacing', `gap-y-${k}`, { 'row-gap': v }, LC);
  }

  // Alignment
  const align = { start: 'flex-start', end: 'flex-end', center: 'center', baseline: 'baseline', stretch: 'stretch' };
  for (const [k, v] of Object.entries(align)) add('alignment', `items-${k}`, { 'align-items': v }, LC);
  const justify = {
    normal: 'normal', start: 'flex-start', end: 'flex-end', center: 'center', between: 'space-between',
    around: 'space-around', evenly: 'space-evenly', stretch: 'stretch',
  };
  for (const [k, v] of Object.entries(justify)) add('alignment', `justify-${k}`, { 'justify-content': v }, LC);
  for (const k of ['start', 'end', 'center', 'stretch']) add('alignment', `justify-items-${k}`, { 'justify-items': k });
  for (const k of ['auto', 'start', 'end', 'center', 'stretch']) add('alignment', `justify-self-${k}`, { 'justify-self': k });
  const content = {
    normal: 'normal', center: 'center', start: 'flex-start', end: 'flex-end', between: 'space-between',
    around: 'space-around', evenly: 'space-evenly', baseline: 'baseline', stretch: 'stretch',
  };
  for (const [k, v] of Object.entries(content)) add('alignment', `content-${k}`, { 'align-content': v });
  const self = { auto: 'auto', start: 'flex-start', end: 'flex-end', center: 'center', stretch: 'stretch', baseline: 'baseline' };
  for (const [k, v] of Object.entries(self)) add('alignment', `self-${k}`, { 'align-self': v }, ['layout']);
  for (const k of ['center', 'start', 'end', 'between', 'around', 'evenly', 'baseline', 'stretch']) {
    const v = { between: 'space-between', around: 'space-around', evenly: 'space-evenly' }[k] || k;
    add('alignment', `place-content-${k}`, { 'place-content': v });
  }
  for (const k of ['start', 'end', 'center', 'baseline', 'stretch']) add('alignment', `place-items-${k}`, { 'place-items': k });
  for (const k of ['auto', 'start', 'end', 'center', 'stretch']) add('alignment', `place-self-${k}`, { 'place-self': k });
}
