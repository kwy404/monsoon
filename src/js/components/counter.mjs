// Number counter: the buttons around an .input-counter call stepDown() and
// stepUp() on the number input, repeat while held and disable at min and max.
//
//   <div class="input-counter" data-m-counter>
//     <button type="button" class="input-counter-button" aria-label="Decrease">-</button>
//     <input type="number" class="input" value="2" min="0" max="10" aria-label="Quantity">
//     <button type="button" class="input-counter-button" aria-label="Increase">+</button>
//   </div>
import { define, emit } from '../core.mjs';
import { expose, notify } from './combobox.mjs';

define('counter', (root) => {
  const input = root.querySelector('input');
  const buttons = [...root.querySelectorAll('button')];
  if (!input || buttons.length < 2) return;
  const down = buttons[0];
  const up = buttons[buttons.length - 1];
  const sync = () => {
    const v = input.valueAsNumber;
    down.disabled = input.disabled || (input.min !== '' && v <= +input.min);
    up.disabled = input.disabled || (input.max !== '' && v >= +input.max);
  };
  const step = (d) => {
    const before = input.value;
    try {
      if (input.value === '') input.value = input.min || 0;
      else if (d > 0) input.stepUp();
      else input.stepDown();
    } catch { /* not a number input */ }
    if (input.value === before) return false;
    notify(input);
    emit(root, 'change', { value: input.valueAsNumber });
    sync();
    return true;
  };
  let timer;
  const stop = () => clearTimeout(timer);
  [down, up].forEach((btn, k) => {
    const d = k ? 1 : -1;
    btn.addEventListener('pointerdown', (e) => {
      if (e.button !== 0 || btn.disabled) return;
      e.preventDefault();
      step(d);
      let delay = 400;
      const repeat = () => {
        if (!step(d)) return;
        delay = Math.max(40, delay * 0.8);
        timer = setTimeout(repeat, delay);
      };
      timer = setTimeout(repeat, delay);
    });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach((t) => btn.addEventListener(t, stop));
    btn.addEventListener('click', (e) => e.detail === 0 && step(d));
  });
  input.addEventListener('input', sync);
  sync();
  expose(root, 'counter', { increment: () => step(1), decrement: () => step(-1) });
  return stop;
});
