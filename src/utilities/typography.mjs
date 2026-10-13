import { fontSizes, fontWeights } from '../scales.mjs';

export default function typography(add) {
  const LC = ['layout', 'cq'];

  for (const f of ['sans', 'serif', 'mono']) add('typography', `font-${f}`, { 'font-family': `var(--font-${f})` });

  for (const [k, [size, lh]] of Object.entries(fontSizes)) {
    add('typography', `text-${k}`, { 'font-size': size, 'line-height': lh }, LC);
  }
  for (const [k, v] of Object.entries(fontWeights)) add('typography', `font-${k}`, { 'font-weight': String(v) }, ['layout']);

  add('typography', 'italic', { 'font-style': 'italic' });
  add('typography', 'not-italic', { 'font-style': 'normal' });
  add('typography', 'antialiased', { '-webkit-font-smoothing': 'antialiased', '-moz-osx-font-smoothing': 'grayscale' });
  add('typography', 'subpixel-antialiased', { '-webkit-font-smoothing': 'auto', '-moz-osx-font-smoothing': 'auto' });
  add('typography', 'normal-nums', { 'font-variant-numeric': 'normal' });
  add('typography', 'tabular-nums', { 'font-variant-numeric': 'tabular-nums' });
  add('typography', 'proportional-nums', { 'font-variant-numeric': 'proportional-nums' });
  add('typography', 'slashed-zero', { 'font-variant-numeric': 'slashed-zero' });

  const leading = { none: '1', tight: '1.25', snug: '1.375', normal: '1.5', relaxed: '1.625', loose: '2' };
  for (const [k, v] of Object.entries(leading)) add('typography', `leading-${k}`, { 'line-height': v });
  for (let i = 3; i <= 10; i++) add('typography', `leading-${i}`, { 'line-height': `${i * 0.25}rem` });

  const tracking = { tighter: '-0.05em', tight: '-0.025em', normal: '0em', wide: '0.025em', wider: '0.05em', widest: '0.1em' };
  for (const [k, v] of Object.entries(tracking)) add('typography', `tracking-${k}`, { 'letter-spacing': v });

  for (const a of ['left', 'center', 'right', 'justify', 'start', 'end']) {
    add('typography', `text-${a}`, { 'text-align': a }, ['left', 'center', 'right'].includes(a) ? LC : ['layout']);
  }

  add('typography', 'underline', { 'text-decoration-line': 'underline' }, ['effect']);
  add('typography', 'overline', { 'text-decoration-line': 'overline' });
  add('typography', 'line-through', { 'text-decoration-line': 'line-through' });
  add('typography', 'no-underline', { 'text-decoration-line': 'none' }, ['effect']);
  for (const s of ['solid', 'double', 'dotted', 'dashed', 'wavy']) add('typography', `decoration-${s}`, { 'text-decoration-style': s });
  for (const t of ['0', '1', '2', '4', '8']) add('typography', `decoration-${t}`, { 'text-decoration-thickness': `${t}px` });
  add('typography', 'decoration-auto', { 'text-decoration-thickness': 'auto' });
  add('typography', 'decoration-from-font', { 'text-decoration-thickness': 'from-font' });
  for (const t of ['0', '1', '2', '4', '8']) add('typography', `underline-offset-${t}`, { 'text-underline-offset': `${t}px` });
  add('typography', 'underline-offset-auto', { 'text-underline-offset': 'auto' });

  add('typography', 'uppercase', { 'text-transform': 'uppercase' });
  add('typography', 'lowercase', { 'text-transform': 'lowercase' });
  add('typography', 'capitalize', { 'text-transform': 'capitalize' });
  add('typography', 'normal-case', { 'text-transform': 'none' });

  add('typography', 'truncate', { overflow: 'hidden', 'text-overflow': 'ellipsis', 'white-space': 'nowrap' });
  add('typography', 'text-ellipsis', { 'text-overflow': 'ellipsis' });
  add('typography', 'text-clip', { 'text-overflow': 'clip' });
  for (let i = 1; i <= 6; i++) {
    add('typography', `line-clamp-${i}`, {
      overflow: 'hidden', display: '-webkit-box', '-webkit-box-orient': 'vertical', '-webkit-line-clamp': String(i),
    });
  }
  add('typography', 'line-clamp-none', { overflow: 'visible', display: 'block', '-webkit-box-orient': 'horizontal', '-webkit-line-clamp': 'unset' });

  for (const w of ['normal', 'nowrap', 'pre', 'pre-line', 'pre-wrap', 'break-spaces']) add('typography', `whitespace-${w}`, { 'white-space': w });
  add('typography', 'break-normal', { 'overflow-wrap': 'normal', 'word-break': 'normal' });
  add('typography', 'break-words', { 'overflow-wrap': 'break-word' });
  add('typography', 'break-all', { 'word-break': 'break-all' });
  add('typography', 'break-keep', { 'word-break': 'keep-all' });
  for (const w of ['wrap', 'nowrap', 'balance', 'pretty']) add('typography', `text-${w}`, { 'text-wrap': w });
  for (const h of ['none', 'manual', 'auto']) add('typography', `hyphens-${h}`, { '-webkit-hyphens': h, hyphens: h });

  for (const v of ['baseline', 'top', 'middle', 'bottom', 'text-top', 'text-bottom', 'sub', 'super']) add('typography', `align-${v}`, { 'vertical-align': v });

  add('typography', 'list-none', { 'list-style-type': 'none' });
  add('typography', 'list-disc', { 'list-style-type': 'disc' });
  add('typography', 'list-decimal', { 'list-style-type': 'decimal' });
  add('typography', 'list-inside', { 'list-style-position': 'inside' });
  add('typography', 'list-outside', { 'list-style-position': 'outside' });

  for (const [k, v] of Object.entries({ 0: '0', px: '1px', 1: '0.25rem', 2: '0.5rem', 4: '1rem', 8: '2rem' })) {
    add('typography', `indent-${k}`, { 'text-indent': v });
  }
}
