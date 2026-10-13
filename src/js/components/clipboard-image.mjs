// Paste an image from the clipboard into an element. Focus the zone and press
// Ctrl V (or drop an image on it); the image shows as a preview, a file input
// inside receives the file, and monsoon:paste-image fires with { file, url }.
//
//   <div class="paste-zone" tabindex="0" data-m-clipboard-image aria-label="Paste a screenshot">
//     <p>Click here and press Ctrl V</p>
//     <input type="file" name="screenshot" accept="image/*" hidden>
//   </div>
//
// Option: -global (listen to pastes anywhere on the page). Delete or
// Backspace clears the zone.
import { define, emit } from '../core.mjs';
import { expose, h } from './combobox.mjs';

/** The first image file in a DataTransfer (clipboard or drop). */
export function imageFrom(data) {
  if (!data) return null;
  for (const f of data.files || []) if (f.type.startsWith('image/')) return f;
  for (const item of data.items || []) {
    if (item.kind === 'file' && item.type.startsWith('image/')) return item.getAsFile();
  }
  return null;
}

define('clipboard-image', (el, opts) => {
  if (el.tabIndex < 0) el.tabIndex = 0;
  const fileInput = el.querySelector('input[type=file]');
  let url = '';
  let img = null;
  const take = (file) => {
    if (!file) return false;
    if (url) URL.revokeObjectURL(url);
    url = URL.createObjectURL(file);
    if (!emit(el, 'paste-image', { file, url })) return true;
    if (!img) {
      img = h('img', { class: 'paste-zone-preview', alt: '' });
      el.append(img);
    }
    img.src = url;
    img.alt = file.name && file.name !== 'image.png' ? file.name : 'Pasted image';
    el.setAttribute('data-filled', '');
    if (fileInput && typeof DataTransfer !== 'undefined') {
      try {
        const dt = new DataTransfer();
        dt.items.add(file);
        fileInput.files = dt.files;
        fileInput.dispatchEvent(new Event('change', { bubbles: true }));
      } catch { /* read only files */ }
    }
    return true;
  };
  const clear = () => {
    if (img) img.remove();
    img = null;
    if (url) URL.revokeObjectURL(url);
    url = '';
    el.removeAttribute('data-filled');
    if (fileInput) fileInput.value = '';
    emit(el, 'paste-clear', {});
  };
  const onPaste = (e) => {
    if (!opts.global && !el.contains(e.target)) return;
    if (take(imageFrom(e.clipboardData))) e.preventDefault();
  };
  const target = opts.global !== undefined ? document : el;
  target.addEventListener('paste', onPaste);
  el.addEventListener('dragover', (e) => {
    e.preventDefault();
    el.setAttribute('data-over', '');
  });
  el.addEventListener('dragleave', () => el.removeAttribute('data-over'));
  el.addEventListener('drop', (e) => {
    e.preventDefault();
    el.removeAttribute('data-over');
    take(imageFrom(e.dataTransfer));
  });
  el.addEventListener('keydown', (e) => {
    if ((e.key === 'Delete' || e.key === 'Backspace') && e.target === el && img) {
      e.preventDefault();
      clear();
    }
  });
  expose(el, 'clipboardImage', { clear, get file() { return fileInput && fileInput.files[0]; } });
  return () => {
    target.removeEventListener('paste', onPaste);
    if (url) URL.revokeObjectURL(url);
  };
});
