import { spacing, negativeSpacing, fractions, containerWidths, breakpoints } from '../scales.mjs';

const pick = (obj, keys) => Object.fromEntries(keys.map((k) => [k, obj[k]]));

export default function layout(add) {

  // Container
  add('layout', 'container', { width: '100%', 'margin-inline': 'auto', 'padding-inline': '1rem' }, [], {
    media: Object.fromEntries(Object.entries(breakpoints).map(([bp, w]) => [bp, { 'max-width': w }])),
  });
  add('layout', 'container-q', { 'container-type': 'inline-size' });
  add('layout', '@container', { 'container-type': 'inline-size' });

  // Display
  const display = {
    block: 'block', 'inline-block': 'inline-block', inline: 'inline', flex: 'flex',
    'inline-flex': 'inline-flex', grid: 'grid', 'inline-grid': 'inline-grid', contents: 'contents',
    'flow-root': 'flow-root', table: 'table', 'table-row': 'table-row', 'table-cell': 'table-cell',
    'list-item': 'list-item', hidden: 'none',
  };
  for (const [k, v] of Object.entries(display)) {
    const groups = ['layout', 'visibility'];
    if (['block', 'inline-block', 'inline', 'flex', 'inline-flex', 'grid', 'hidden'].includes(k)) groups.push('cq');
    add('layout', k, { display: v }, groups);
  }

  // Position
  for (const p of ['static', 'fixed', 'absolute', 'relative', 'sticky']) add('layout', p, { position: p }, ['layout']);

  // Inset
  const insetVals = {
    ...pick(spacing, ['0', 'px', '0.5', '1', '1.5', '2', '2.5', '3', '4', '5', '6', '8', '10', '12', '16', '20', '24']),
    auto: 'auto', full: '100%',
    ...pick(fractions, ['1/2', '1/3', '2/3', '1/4', '3/4']),
  };
  const insetNeg = {
    ...pick(negativeSpacing, ['px', '0.5', '1', '2', '3', '4', '6', '8', '12', '16']),
    full: '100%', '1/2': '50%',
  };
  const insetProps = {
    inset: ['inset'], 'inset-x': ['left', 'right'], 'inset-y': ['top', 'bottom'],
    top: ['top'], right: ['right'], bottom: ['bottom'], left: ['left'],
  };
  for (const [prefix, props] of Object.entries(insetProps)) {
    for (const [k, v] of Object.entries(insetVals)) add('layout', `${prefix}-${k}`, Object.fromEntries(props.map((p) => [p, v])));
    for (const [k, v] of Object.entries(insetNeg)) add('layout', `-${prefix}-${k}`, Object.fromEntries(props.map((p) => [p, `-${v}`])));
  }

  // Z-index
  for (const z of ['0', '10', '20', '30', '40', '50']) add('layout', `z-${z}`, { 'z-index': z });
  add('layout', 'z-auto', { 'z-index': 'auto' });
  add('layout', '-z-10', { 'z-index': '-10' });

  // Overflow
  for (const v of ['auto', 'hidden', 'clip', 'visible', 'scroll']) {
    add('layout', `overflow-${v}`, { overflow: v });
    add('layout', `overflow-x-${v}`, { 'overflow-x': v });
    add('layout', `overflow-y-${v}`, { 'overflow-y': v });
  }
  for (const v of ['auto', 'contain', 'none']) {
    add('layout', `overscroll-${v}`, { 'overscroll-behavior': v });
    add('layout', `overscroll-x-${v}`, { 'overscroll-behavior-x': v });
    add('layout', `overscroll-y-${v}`, { 'overscroll-behavior-y': v });
  }

  // Visibility and box
  add('layout', 'visible', { visibility: 'visible' }, ['visibility']);
  add('layout', 'invisible', { visibility: 'hidden' }, ['visibility']);
  add('layout', 'collapse', { visibility: 'collapse' });
  add('layout', 'box-border', { 'box-sizing': 'border-box' });
  add('layout', 'box-content', { 'box-sizing': 'content-box' });
  for (const v of ['left', 'right', 'none', 'start', 'end']) add('layout', `float-${v}`, { float: v === 'start' ? 'inline-start' : v === 'end' ? 'inline-end' : v });
  for (const v of ['left', 'right', 'both', 'none']) add('layout', `clear-${v}`, { clear: v });
  add('layout', 'isolate', { isolation: 'isolate' });
  add('layout', 'isolation-auto', { isolation: 'auto' });

  // Object fit and position
  for (const v of ['contain', 'cover', 'fill', 'none', 'scale-down']) add('layout', `object-${v}`, { 'object-fit': v });
  for (const v of ['bottom', 'center', 'left', 'left-bottom', 'left-top', 'right', 'right-bottom', 'right-top', 'top']) {
    add('layout', `object-${v}`, { 'object-position': v.replace('-', ' ') });
  }

  // Aspect ratio
  add('layout', 'aspect-auto', { 'aspect-ratio': 'auto' });
  add('layout', 'aspect-square', { 'aspect-ratio': '1 / 1' });
  add('layout', 'aspect-video', { 'aspect-ratio': '16 / 9' });
  for (const r of ['4/3', '3/2', '16/9', '21/9', '3/4', '2/3', '9/16']) add('layout', `aspect-${r}`, { 'aspect-ratio': r.replace('/', ' / ') });

  // Columns
  for (let i = 1; i <= 12; i++) add('layout', `columns-${i}`, { columns: String(i) });
  add('layout', 'columns-auto', { columns: 'auto' });
  for (const k of ['3xs', '2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl']) add('layout', `columns-${k}`, { columns: containerWidths[k] });
  for (const v of ['auto', 'avoid', 'avoid-page', 'avoid-column']) add('layout', `break-inside-${v}`, { 'break-inside': v });
  for (const v of ['auto', 'avoid', 'all', 'page', 'column']) {
    add('layout', `break-before-${v}`, { 'break-before': v });
    add('layout', `break-after-${v}`, { 'break-after': v });
  }

  // Box decoration and tables
  add('layout', 'box-decoration-clone', { '-webkit-box-decoration-break': 'clone', 'box-decoration-break': 'clone' });
  add('layout', 'box-decoration-slice', { '-webkit-box-decoration-break': 'slice', 'box-decoration-break': 'slice' });
  add('layout', 'border-collapse', { 'border-collapse': 'collapse' });
  add('layout', 'border-separate', { 'border-collapse': 'separate' });
  add('layout', 'table-auto', { 'table-layout': 'auto' });
  add('layout', 'table-fixed', { 'table-layout': 'fixed' });

}
