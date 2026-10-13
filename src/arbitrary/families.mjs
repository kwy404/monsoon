// Arbitrary value families: every utility prefix that takes a value, mapped to
// the CSS it writes. The prefixes and properties are the same ones the static
// utilities use (src/utilities/*.mjs); test/arbitrary.test.mjs checks each
// family against the static class with the same prefix, so the two never drift.
//
// A family is a function (value, kind) => [[property, value], ...] or null.
// kind is what the value looks like (see kindOf in parse.mjs): color, length,
// number, image, ident or any, or the type hint the class gave explicitly, as
// in bg-[length:200px] or text-(color:--brand).
import { RING_BOX } from '../utilities/borders.mjs';

const P = (...props) => (v) => props.map((p) => [p, v]);
const set = (s) => new Set(s.split(' '));

// Keywords that pick the non color branch of a family that also takes colors.
const BORDER_KW = set('thin medium thick');
const SIZE_KW = set('xx-small x-small small medium large x-large xx-large xxx-large smaller larger');
const BG_SIZE_KW = set('auto cover contain');
const BG_POS_KW = set('top bottom left right center');
const WEIGHT_KW = set('normal bold bolder lighter');

const isLen = (k) => k === 'length' || k === 'number' || k === 'size';
const ms = (v, k) => (k === 'number' ? `${v}ms` : v);
const repeat = (v, k) => (k === 'number' && /^\d+$/.test(v) ? `repeat(${v}, minmax(0, 1fr))` : v);
const span = (v) => (/^\d+$/.test(v) ? `span ${v} / span ${v}` : v);

const ring = (v) => [
  ['--m-ring-offset-shadow', 'var(--m-ring-inset,) 0 0 0 var(--m-ring-offset-width) var(--m-ring-offset-color)'],
  ['--m-ring-shadow', `var(--m-ring-inset,) 0 0 0 calc(${v} + var(--m-ring-offset-width)) var(--m-ring-color)`],
  ['box-shadow', RING_BOX],
];

/** Families that accept a color, so they also accept an opacity modifier: bg-[red]/50. */
export const COLOR_FAMILIES = set(
  'bg text border border-x border-y border-t border-r border-b border-l border-s border-e ring ring-offset outline decoration fill stroke shadow caret accent from via to divide placeholder',
);

/** Families whose value may be negated with a leading dash: -mt-[3px]. */
export const NEGATIVE = set(
  'm mx my mt mr mb ml ms me inset inset-x inset-y top right bottom left start end z order translate-x translate-y rotate space-x space-y scroll-m scroll-mx scroll-my scroll-mt scroll-mr scroll-mb scroll-ml indent tracking hue-rotate',
);

/** Selector wrappers, the same ones the static utilities use. */
export const SELECTORS = {
  'space-x': (s) => `:where(${s} > :not(:last-child))`,
  'space-y': (s) => `:where(${s} > :not(:last-child))`,
  'divide-x': (s) => `:where(${s} > :not(:last-child))`,
  'divide-y': (s) => `:where(${s} > :not(:last-child))`,
  divide: (s) => `:where(${s} > :not(:last-child))`,
  placeholder: (s) => `${s}::placeholder`,
};

export const families = {
  // Layout
  inset: P('inset'),
  'inset-x': P('left', 'right'),
  'inset-y': P('top', 'bottom'),
  top: P('top'),
  right: P('right'),
  bottom: P('bottom'),
  left: P('left'),
  start: P('inset-inline-start'),
  end: P('inset-inline-end'),
  z: P('z-index'),
  aspect: P('aspect-ratio'),
  columns: P('columns'),
  object: P('object-position'),
  // Flexbox and grid
  basis: P('flex-basis'),
  flex: P('flex'),
  grow: P('flex-grow'),
  shrink: P('flex-shrink'),
  order: P('order'),
  'grid-cols': (v, k) => [['grid-template-columns', repeat(v, k)]],
  'grid-rows': (v, k) => [['grid-template-rows', repeat(v, k)]],
  col: P('grid-column'),
  'col-span': (v) => [['grid-column', span(v)]],
  'col-start': P('grid-column-start'),
  'col-end': P('grid-column-end'),
  row: P('grid-row'),
  'row-span': (v) => [['grid-row', span(v)]],
  'row-start': P('grid-row-start'),
  'row-end': P('grid-row-end'),
  'auto-cols': P('grid-auto-columns'),
  'auto-rows': P('grid-auto-rows'),
  gap: P('gap'),
  'gap-x': P('column-gap'),
  'gap-y': P('row-gap'),
  // Sizing
  w: P('width'),
  h: P('height'),
  size: P('width', 'height'),
  'min-w': P('min-width'),
  'max-w': P('max-width'),
  'min-h': P('min-height'),
  'max-h': P('max-height'),
  'space-x': P('margin-inline-end'),
  'space-y': P('margin-block-end'),
  // Typography
  text: (v, k) => (isLen(k) || SIZE_KW.has(v) ? [['font-size', v]] : [['color', v]]),
  font: (v, k) => (k === 'number' || k === 'weight' || WEIGHT_KW.has(v) ? [['font-weight', v]] : [['font-family', v]]),
  leading: P('line-height'),
  tracking: P('letter-spacing'),
  indent: P('text-indent'),
  decoration: (v, k) => (isLen(k) || v === 'auto' || v === 'from-font' ? [['text-decoration-thickness', v]] : [['text-decoration-color', v]]),
  'underline-offset': P('text-underline-offset'),
  'line-clamp': (v) => [['overflow', 'hidden'], ['display', '-webkit-box'], ['-webkit-box-orient', 'vertical'], ['-webkit-line-clamp', v]],
  list: P('list-style-type'),
  align: P('vertical-align'),
  content: P('content'),
  placeholder: P('color'),
  // Borders, outline and ring
  rounded: P('border-radius'),
  'rounded-t': P('border-top-left-radius', 'border-top-right-radius'),
  'rounded-r': P('border-top-right-radius', 'border-bottom-right-radius'),
  'rounded-b': P('border-bottom-right-radius', 'border-bottom-left-radius'),
  'rounded-l': P('border-top-left-radius', 'border-bottom-left-radius'),
  'rounded-tl': P('border-top-left-radius'),
  'rounded-tr': P('border-top-right-radius'),
  'rounded-br': P('border-bottom-right-radius'),
  'rounded-bl': P('border-bottom-left-radius'),
  'divide-x': (v) => [['border-inline-style', 'solid'], ['border-inline-start-width', '0'], ['border-inline-end-width', v]],
  'divide-y': (v) => [['border-top-width', '0'], ['border-bottom-style', 'solid'], ['border-bottom-width', v]],
  divide: P('border-color'),
  outline: (v, k) => (isLen(k) ? [['outline-style', 'solid'], ['outline-width', v]] : [['outline-color', v]]),
  'outline-offset': P('outline-offset'),
  ring: (v, k) => (isLen(k) ? ring(v) : [['--m-ring-color', v]]),
  'ring-offset': (v, k) => (isLen(k) ? [['--m-ring-offset-width', v]] : [['--m-ring-offset-color', v]]),
  // Colors and backgrounds
  bg: (v, k) => {
    if (k === 'image' || v === 'none') return [['background-image', v]];
    if (k === 'size' || BG_SIZE_KW.has(v)) return [['background-size', v]];
    if (k === 'position' || isLen(k) || BG_POS_KW.has(v)) return [['background-position', v]];
    return [['background-color', v]];
  },
  from: (v) => [
    ['--m-gradient-from', v],
    ['--m-gradient-stops', 'var(--m-gradient-from), var(--m-gradient-via, var(--m-gradient-to, transparent)), var(--m-gradient-to, transparent)'],
  ],
  via: P('--m-gradient-via'),
  to: P('--m-gradient-to'),
  fill: P('fill'),
  stroke: (v, k) => (isLen(k) ? [['stroke-width', v]] : [['stroke', v]]),
  caret: P('caret-color'),
  accent: P('accent-color'),
  // Effects and filters
  shadow: (v, k) => (k === 'color' || (k === 'ident' && v !== 'none') ? [['--m-shadow-color', v]] : [['--m-shadow', v], ['box-shadow', RING_BOX]]),
  opacity: P('opacity'),
  'mix-blend': P('mix-blend-mode'),
  // Transitions and animation
  transition: (v) => [['transition-property', v], ['transition-timing-function', 'cubic-bezier(0.4, 0, 0.2, 1)'], ['transition-duration', '150ms']],
  duration: (v, k) => [['transition-duration', ms(v, k)]],
  delay: (v, k) => [['transition-delay', ms(v, k)]],
  ease: P('transition-timing-function'),
  animate: P('animation'),
  // Transforms
  scale: P('scale'),
  'scale-x': (v) => [['scale', `${v} 1`]],
  'scale-y': (v) => [['scale', `1 ${v}`]],
  rotate: P('rotate'),
  'translate-x': (v) => [['--m-tx', v], ['translate', 'var(--m-tx) var(--m-ty)']],
  'translate-y': (v) => [['--m-ty', v], ['translate', 'var(--m-tx) var(--m-ty)']],
  origin: P('transform-origin'),
  // Interactivity
  cursor: P('cursor'),
  'will-change': P('will-change'),
};

// Padding, margin, scroll margin and scroll padding on every side.
const SIDES = { '': '', x: '-inline', y: '-block', t: '-top', r: '-right', b: '-bottom', l: '-left', s: '-inline-start', e: '-inline-end' };
for (const [side, suffix] of Object.entries(SIDES)) {
  families[`p${side}`] = P(`padding${suffix}`);
  families[`m${side}`] = P(`margin${suffix}`);
  families[`scroll-m${side}`] = P(`scroll-margin${suffix}`);
  families[`scroll-p${side}`] = P(`scroll-padding${suffix}`);
}

// Border width or color, on every side. Widths follow the static border-x-2
// (left and right) and border-s-2 (inline start) classes.
const BORDER_SIDES = { '': [''], x: ['-left', '-right'], y: ['-top', '-bottom'], t: ['-top'], r: ['-right'], b: ['-bottom'], l: ['-left'], s: ['-inline-start'], e: ['-inline-end'] };
for (const [side, parts] of Object.entries(BORDER_SIDES)) {
  families[side ? `border-${side}` : 'border'] = (v, k) =>
    parts.map((p) => [`border${p}-${isLen(k) || BORDER_KW.has(v) ? 'width' : 'color'}`, v]);
}

// Filters, as in the static blur-* and backdrop-blur-* classes.
for (const f of ['blur', 'brightness', 'contrast', 'saturate', 'grayscale', 'invert', 'sepia', 'hue-rotate', 'drop-shadow']) {
  families[f] = (v) => [['filter', `${f}(${v})`]];
  families[`backdrop-${f}`] = (v) => [['-webkit-backdrop-filter', `${f}(${v})`], ['backdrop-filter', `${f}(${v})`]];
}
