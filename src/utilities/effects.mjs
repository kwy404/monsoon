import { spacing, fractions } from '../scales.mjs';
import { RING_BOX } from './borders.mjs';

const pick = (obj, keys) => Object.fromEntries(keys.map((k) => [k, obj[k]]));
const sc = (a) => `var(--m-shadow-color, rgb(0 0 0 / ${a}))`;

export const keyframes = `
@keyframes m-spin { to { transform: rotate(360deg); } }
@keyframes m-ping { 75%, 100% { transform: scale(2); opacity: 0; } }
@keyframes m-pulse { 50% { opacity: 0.5; } }
@keyframes m-bounce {
  0%, 100% { transform: translateY(-25%); animation-timing-function: cubic-bezier(0.8, 0, 1, 1); }
  50% { transform: none; animation-timing-function: cubic-bezier(0, 0, 0.2, 1); }
}
`;

export default function effects(add) {
  // Shadows
  const shadows = {
    '2xs': `0 1px ${sc(0.05)}`,
    xs: `0 1px 2px 0 ${sc(0.05)}`,
    sm: `0 1px 3px 0 ${sc(0.1)}, 0 1px 2px -1px ${sc(0.1)}`,
    '': `0 1px 3px 0 ${sc(0.1)}, 0 1px 2px -1px ${sc(0.1)}`,
    md: `0 4px 6px -1px ${sc(0.1)}, 0 2px 4px -2px ${sc(0.1)}`,
    lg: `0 10px 15px -3px ${sc(0.1)}, 0 4px 6px -4px ${sc(0.1)}`,
    xl: `0 20px 25px -5px ${sc(0.1)}, 0 8px 10px -6px ${sc(0.1)}`,
    '2xl': `0 25px 50px -12px ${sc(0.25)}`,
    inner: `inset 0 2px 4px 0 ${sc(0.05)}`,
    none: '0 0 #0000',
  };
  for (const [k, v] of Object.entries(shadows)) {
    add('effects', k ? `shadow-${k}` : 'shadow', { '--m-shadow': v, 'box-shadow': RING_BOX }, ['effect']);
  }

  // Opacity
  for (const o of [0, 5, 10, 15, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90, 95, 100]) {
    add('effects', `opacity-${o}`, { opacity: String(o / 100) }, ['effect', 'disabled']);
  }

  // Blend
  for (const m of ['normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten', 'difference', 'luminosity']) {
    add('effects', `mix-blend-${m}`, { 'mix-blend-mode': m });
  }

  // Filters
  const blur = { none: '0', xs: '4px', sm: '8px', '': '8px', md: '12px', lg: '16px', xl: '24px', '2xl': '40px', '3xl': '64px' };
  for (const [k, v] of Object.entries(blur)) {
    const suffix = k ? `-${k}` : '';
    const value = k === 'none' ? 'none' : `blur(${v})`;
    add('filters', `blur${suffix}`, { filter: value });
    add('filters', `backdrop-blur${suffix}`, { '-webkit-backdrop-filter': value, 'backdrop-filter': value });
  }
  add('filters', 'grayscale', { filter: 'grayscale(100%)' });
  add('filters', 'grayscale-0', { filter: 'grayscale(0)' });
  add('filters', 'invert', { filter: 'invert(100%)' });
  add('filters', 'sepia', { filter: 'sepia(100%)' });
  add('filters', 'filter-none', { filter: 'none' });
  add('filters', 'backdrop-filter-none', { '-webkit-backdrop-filter': 'none', 'backdrop-filter': 'none' });

  // Transitions
  const ease = 'cubic-bezier(0.4, 0, 0.2, 1)';
  const transitions = {
    '': 'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, translate, scale, rotate, filter, backdrop-filter',
    all: 'all',
    colors: 'color, background-color, border-color, outline-color, text-decoration-color, fill, stroke',
    opacity: 'opacity',
    shadow: 'box-shadow',
    transform: 'transform, translate, scale, rotate',
  };
  for (const [k, v] of Object.entries(transitions)) {
    add('transitions', k ? `transition-${k}` : 'transition', {
      'transition-property': v, 'transition-timing-function': ease, 'transition-duration': '150ms',
    }, ['motion']);
  }
  add('transitions', 'transition-none', { 'transition-property': 'none' }, ['motion']);
  for (const d of [0, 75, 100, 150, 200, 300, 500, 700, 1000]) add('transitions', `duration-${d}`, { 'transition-duration': `${d}ms` });
  const eases = { linear: 'linear', in: 'cubic-bezier(0.4, 0, 1, 1)', out: 'cubic-bezier(0, 0, 0.2, 1)', 'in-out': ease };
  for (const [k, v] of Object.entries(eases)) add('transitions', `ease-${k}`, { 'transition-timing-function': v });
  for (const d of [0, 75, 100, 150, 200, 300, 500, 700, 1000]) add('transitions', `delay-${d}`, { 'transition-delay': `${d}ms` });

  // Animations
  add('animation', 'animate-none', { animation: 'none' }, ['motion']);
  add('animation', 'animate-spin', { animation: 'm-spin 1s linear infinite' }, ['motion']);
  add('animation', 'animate-ping', { animation: 'm-ping 1s cubic-bezier(0, 0, 0.2, 1) infinite' }, ['motion']);
  add('animation', 'animate-pulse', { animation: 'm-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }, ['motion']);
  add('animation', 'animate-bounce', { animation: 'm-bounce 1s infinite' }, ['motion']);

  // Transforms (individual transform properties, so they compose)
  for (const s of [0, 50, 75, 90, 95, 100, 105, 110, 125, 150]) {
    add('transforms', `scale-${s}`, { scale: String(s / 100) }, ['effect']);
    add('transforms', `scale-x-${s}`, { scale: `${s / 100} 1` });
    add('transforms', `scale-y-${s}`, { scale: `1 ${s / 100}` });
  }
  for (const r of [0, 1, 2, 3, 6, 12, 45, 90, 180]) {
    add('transforms', `rotate-${r}`, { rotate: `${r}deg` }, ['effect']);
    if (r) add('transforms', `-rotate-${r}`, { rotate: `-${r}deg` }, ['effect']);
  }
  const tr = {
    ...pick(spacing, ['0', 'px', '0.5', '1', '1.5', '2', '3', '4', '5', '6', '8', '10', '12', '16', '20', '24']),
    full: '100%', ...pick(fractions, ['1/2', '1/3', '2/3', '1/4', '3/4']),
  };
  for (const axis of ['x', 'y']) {
    const v = `--m-t${axis}`;
    for (const [k, val] of Object.entries(tr)) {
      add('transforms', `translate-${axis}-${k}`, { [v]: val, translate: 'var(--m-tx) var(--m-ty)' }, ['effect']);
      if (k !== '0') add('transforms', `-translate-${axis}-${k}`, { [v]: `-${val}`, translate: 'var(--m-tx) var(--m-ty)' }, ['effect']);
    }
  }
  add('transforms', 'transform-none', { transform: 'none', translate: 'none', scale: 'none', rotate: 'none' });
  const origins = ['center', 'top', 'top-right', 'right', 'bottom-right', 'bottom', 'bottom-left', 'left', 'top-left'];
  for (const o of origins) add('transforms', `origin-${o}`, { 'transform-origin': o.replace('-', ' ') });
}
