// Textarea autosize: grows with its content. Uses CSS field-sizing where the
// browser has it and measures scrollHeight elsewhere; a max-height still
// applies, after which the textarea scrolls.
//
//   <textarea class="textarea" data-m-autosize rows="2"></textarea>
import { define } from '../core.mjs';

define('autosize', (el) => {
  if (typeof CSS !== 'undefined' && CSS.supports && CSS.supports('field-sizing', 'content')) {
    el.style.fieldSizing = 'content';
    return;
  }
  const fit = () => {
    const cs = getComputedStyle(el);
    el.style.height = 'auto';
    const border = parseFloat(cs.borderTopWidth) + parseFloat(cs.borderBottomWidth);
    el.style.height = `${el.scrollHeight + (cs.boxSizing === 'border-box' ? border || 0 : 0)}px`;
  };
  el.addEventListener('input', fit);
  addEventListener('resize', fit);
  fit();
  return () => {
    el.removeEventListener('input', fit);
    removeEventListener('resize', fit);
  };
});
