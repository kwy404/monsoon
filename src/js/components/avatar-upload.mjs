// Avatar upload: a picture with a native file input. Without the script the
// chosen file is submitted as is. With it, dropping, pasting or picking an
// image opens a circular cropper in a <dialog>; saving writes the cropped File
// back into the input (so FormData and normal submits send it), optionally a
// data URL into a hidden input, and updates the preview.
import { define, emit } from '../core.mjs';
import { createCropper } from './cropper.mjs';
import { expose, fileDrop, h, parseSize, setInputFiles, validateFiles } from './dropzone.mjs';

const instances = new WeakMap();
export const avatarUpload = expose('avatarUpload', instances);
let uid = 0;

/** Output file name: the original base name with the extension of type. */
export function outputName(name = 'avatar', type = 'image/png') {
  const base = String(name).replace(/\.[^.]+$/, '') || 'avatar';
  const ext = { 'image/jpeg': 'jpg', 'image/webp': 'webp' }[type] || 'png';
  return `${base}.${ext}`;
}

define('avatar-upload', (el, o) => {
  const input = el.querySelector('input[type=file]');
  if (!input) return;
  const id = `av${++uid}`;
  const preview = el.querySelector('.avatar-upload-image');
  const hidden = o.hidden ? document.querySelector(o.hidden) : el.querySelector('input[type=hidden]');
  const size = Number(o.size) || 512;
  const type = o.type || 'image/png';
  const circle = o.shape !== 'square';
  const rules = { accept: o.accept || input.accept || 'image/*', maxSize: parseSize(o.maxSize), maxFiles: 1 };
  let saved = null;
  let source = null;
  let crop = null;
  let previewUrl = '';
  let srcUrl = '';

  const error = h('p', { class: 'avatar-upload-error', role: 'alert', hidden: true });
  const cropImg = h('img', { alt: '' });
  const cropEl = h('div', { class: 'cropper avatar-upload-cropper' }, cropImg);
  const saveBtn = h('button', { type: 'button', class: 'btn btn-primary', onclick: () => save() }, 'Save photo');
  const dialog = h('dialog', { class: 'modal avatar-upload-dialog', 'aria-labelledby': `${id}-t` },
    h('div', { class: 'modal-box' },
      h('div', { class: 'modal-header' }, h('h2', { class: 'modal-title', id: `${id}-t` }, o.title || 'Crop your photo')),
      cropEl,
      h('div', { class: 'modal-actions' },
        h('button', { type: 'button', class: 'btn btn-ghost', onclick: () => dialog.close() }, 'Cancel'),
        saveBtn)));
  el.append(error, dialog);
  el.dataset.enhanced = '';

  const showError = (msg) => { error.textContent = msg || ''; error.hidden = !msg; };

  const open = async (file) => {
    const { accepted, errors } = validateFiles([file], rules);
    if (!accepted.length) { showError(errors[0].message); restore(); return false; }
    if (!file.type.startsWith('image/')) { showError(`"${file.name}" is not an image.`); restore(); return false; }
    showError('');
    source = file;
    if (srcUrl) URL.revokeObjectURL(srcUrl);
    srcUrl = URL.createObjectURL(file);
    if (typeof dialog.showModal === 'function' && !dialog.open) dialog.showModal();
    if (!crop) {
      cropImg.src = srcUrl;
      crop = createCropper(cropEl, { aspect: circle ? 'circle' : '1:1', aspects: 'none', maxZoom: o.maxZoom || 6, fill: 0.9 });
    } else await crop.load(srcUrl);
    const box = cropEl.querySelector('.cropper-box');
    if (box) box.focus({ preventScroll: true });
    emit(el, 'avatar-open', { file });
    return true;
  };

  // Puts the last saved crop back into the input (the picker replaced it).
  const restore = () => setInputFiles(input, saved ? [saved] : []);

  const save = async () => {
    saveBtn.disabled = true;
    try {
      const opts = { width: size, height: size, circle };
      const file = await crop.toFile(outputName(source && source.name, type), type, 0.92, opts);
      saved = file;
      restore();
      let dataURL;
      if (hidden) hidden.value = dataURL = crop.toDataURL(type, 0.92, opts);
      if (preview) {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        preview.src = previewUrl = URL.createObjectURL(file);
      }
      el.dataset.hasImage = '';
      dialog.close('saved');
      emit(el, 'avatar-change', { file, dataURL, data: crop.getData() });
    } catch (err) {
      showError('The photo could not be cropped.');
      emit(el, 'avatar-error', { error: err });
    } finally {
      saveBtn.disabled = false;
    }
  };

  const onChange = () => { if (input.files.length) open(input.files[0]); };
  const onClose = () => { if (dialog.returnValue !== 'saved') restore(); dialog.returnValue = ''; };
  input.addEventListener('change', onChange);
  dialog.addEventListener('close', onClose);
  const offDrop = fileDrop(el, (files) => open(files[0]));

  instances.set(el, { open, get file() { return saved; }, get cropper() { return crop; } });

  return () => {
    input.removeEventListener('change', onChange);
    offDrop();
    if (crop) crop.destroy();
    error.remove();
    dialog.remove();
    [srcUrl, previewUrl].forEach((u) => u && URL.revokeObjectURL(u));
    delete el.dataset.enhanced;
    instances.delete(el);
  };
});
