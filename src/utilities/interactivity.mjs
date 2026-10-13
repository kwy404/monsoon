export default function interactivity(add) {
  const cursors = [
    'auto', 'default', 'pointer', 'wait', 'text', 'move', 'help', 'not-allowed', 'none', 'progress',
    'cell', 'crosshair', 'grab', 'grabbing', 'zoom-in', 'zoom-out', 'col-resize', 'row-resize',
  ];
  for (const c of cursors) add('interactivity', `cursor-${c}`, { cursor: c }, c === 'not-allowed' || c === 'default' ? ['disabled'] : []);
  add('interactivity', 'pointer-events-none', { 'pointer-events': 'none' }, ['disabled']);
  add('interactivity', 'pointer-events-auto', { 'pointer-events': 'auto' });
  for (const s of ['none', 'text', 'all', 'auto']) add('interactivity', `select-${s}`, { '-webkit-user-select': s, 'user-select': s });
  add('interactivity', 'resize-none', { resize: 'none' });
  add('interactivity', 'resize', { resize: 'both' });
  add('interactivity', 'resize-x', { resize: 'horizontal' });
  add('interactivity', 'resize-y', { resize: 'vertical' });
  add('interactivity', 'appearance-none', { appearance: 'none' });
  add('interactivity', 'appearance-auto', { appearance: 'auto' });
  add('interactivity', 'scroll-auto', { 'scroll-behavior': 'auto' });
  add('interactivity', 'scroll-smooth', { 'scroll-behavior': 'smooth' });
  for (const [k, v] of Object.entries({ 0: '0', 2: '0.5rem', 4: '1rem', 8: '2rem', 16: '4rem' })) {
    add('interactivity', `scroll-mt-${k}`, { 'scroll-margin-top': v });
  }
  add('interactivity', 'snap-none', { 'scroll-snap-type': 'none' });
  add('interactivity', 'snap-x', { 'scroll-snap-type': 'x var(--m-snap, proximity)' });
  add('interactivity', 'snap-y', { 'scroll-snap-type': 'y var(--m-snap, proximity)' });
  add('interactivity', 'snap-mandatory', { '--m-snap': 'mandatory' });
  add('interactivity', 'snap-proximity', { '--m-snap': 'proximity' });
  for (const s of ['start', 'end', 'center']) add('interactivity', `snap-${s}`, { 'scroll-snap-align': s });
  add('interactivity', 'snap-always', { 'scroll-snap-stop': 'always' });
  for (const t of ['auto', 'none', 'manipulation', 'pan-x', 'pan-y']) add('interactivity', `touch-${t}`, { 'touch-action': t });
  add('interactivity', 'will-change-auto', { 'will-change': 'auto' });
  add('interactivity', 'will-change-transform', { 'will-change': 'transform' });
  add('interactivity', 'will-change-opacity', { 'will-change': 'opacity' });
  add('interactivity', 'caret-transparent', { 'caret-color': 'transparent' });
  add('interactivity', 'caret-primary', { 'caret-color': 'var(--primary)' });
  add('interactivity', 'accent-primary', { 'accent-color': 'var(--primary)' });
  add('interactivity', 'accent-auto', { 'accent-color': 'auto' });
}

export function accessibility(add) {
  const srOnly = {
    position: 'absolute', width: '1px', height: '1px', padding: '0', margin: '-1px', overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)', 'white-space': 'nowrap', 'border-width': '0',
  };
  add('accessibility', 'sr-only', srOnly, ['layout', 'a11y']);
  add('accessibility', 'not-sr-only', {
    position: 'static', width: 'auto', height: 'auto', padding: '0', margin: '0', overflow: 'visible',
    clip: 'auto', 'white-space': 'normal',
  }, ['layout', 'a11y']);
  add('accessibility', 'forced-color-adjust-auto', { 'forced-color-adjust': 'auto' });
  add('accessibility', 'forced-color-adjust-none', { 'forced-color-adjust': 'none' });
  // Monsoon helpers
  add('accessibility', 'focus-ring', { outline: '2px solid var(--ring)', 'outline-offset': '2px' }, [], {
    selector: (s) => `${s}:focus-visible`,
  });
  add('accessibility', 'skip-link', srOnly, [], {
    selector: (s) => `${s}:not(:focus):not(:focus-within)`,
  });
  add('accessibility', 'touch-target', { 'min-width': '44px', 'min-height': '44px' });
}
