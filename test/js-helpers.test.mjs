// @vitest-environment jsdom
// Copy to clipboard and the toast helpers.
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { enhance } from '../src/js/core.mjs';
import { copy, dedent, markupOf } from '../src/js/components/copy.mjs';
import { toast } from '../src/js/components/toast.mjs';

const flush = () => new Promise((r) => setTimeout(r, 0));

describe('copy', () => {
  let written;
  beforeEach(() => {
    written = [];
    document.body.innerHTML = '';
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: async (t) => { written.push(t); } },
    });
  });

  it('dedents markup and trims the blank lines around it', () => {
    expect(dedent('\n    <div>\n      <p>Hi</p>\n    </div>\n  ')).toBe('<div>\n  <p>Hi</p>\n</div>');
    expect(dedent('one')).toBe('one');
    expect(dedent('')).toBe('');
  });

  it('reads the markup of a template as written and of an element without the copy state', () => {
    document.body.innerHTML = '<template id="t">\n  <button class="btn">Save</button>\n</template><div id="d">\n  <button class="copy-btn" data-copied>Copy</button>\n</div>';
    expect(markupOf(document.getElementById('t'))).toBe('<button class="btn">Save</button>');
    expect(markupOf(document.getElementById('d'))).toBe('<button class="copy-btn">Copy</button>');
  });

  it('copies text, a target value or a target markup and shows the confirmation', async () => {
    document.body.innerHTML = `
      <button id="a" data-m-copy="npm i monsooncss" aria-label="Copy command">Copy</button>
      <input id="key" value="ABC123"><button id="b" data-m-copy data-m-copy-target="#key" data-m-copy-done="Key copied"><span data-m-copy-label>Copy key</span></button>
      <div id="ex">
        <span class="badge">New</span>
      </div>
      <button id="c" data-m-copy data-m-copy-target="#ex" data-m-copy-as="html">Copy component</button>`;
    enhance(document);
    const events = [];
    document.addEventListener('monsoon:copy', (e) => events.push(e.detail.text));
    const a = document.getElementById('a');
    a.click();
    await flush();
    expect(a.hasAttribute('data-copied')).toBe(true);
    expect(a.getAttribute('aria-label')).toBe('Copied');
    const b = document.getElementById('b');
    b.click();
    await flush();
    expect(b.querySelector('span').textContent).toBe('Key copied');
    document.getElementById('c').click();
    await flush();
    expect(written).toEqual(['npm i monsooncss', 'ABC123', '<span class="badge">New</span>']);
    expect(events).toEqual(written);
  });

  it('restores the label after the confirmation and restarts it on a second click', async () => {
    vi.useFakeTimers();
    try {
      document.body.innerHTML = '<button data-m-copy="x" aria-label="Copy">C</button>';
      enhance(document);
      const btn = document.querySelector('button');
      btn.click();
      await vi.advanceTimersByTimeAsync(1000);
      btn.click();
      await vi.advanceTimersByTimeAsync(1000);
      expect(btn.hasAttribute('data-copied')).toBe(true);
      await vi.advanceTimersByTimeAsync(600);
      expect(btn.hasAttribute('data-copied')).toBe(false);
      expect(btn.getAttribute('aria-label')).toBe('Copy');
    } finally {
      vi.useRealTimers();
    }
  });

  it('falls back to a hidden text area when the clipboard API is missing', async () => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined });
    const exec = vi.fn(() => true);
    document.execCommand = exec;
    await expect(copy('hello')).resolves.toBe('hello');
    expect(exec).toHaveBeenCalledWith('copy');
    expect(document.querySelector('textarea')).toBeNull();
    document.execCommand = () => false;
    await expect(copy('nope')).rejects.toThrow(/clipboard/);
  });
});

describe('toast helpers', () => {
  beforeEach(() => { document.body.innerHTML = ''; });

  it('turns a loading toast into a success toast when the promise resolves', async () => {
    let resolve;
    const p = new Promise((r) => { resolve = r; });
    const out = toast.promise(p, { loading: 'Saving', success: (v) => `Saved ${v}` });
    expect(out).toBe(p);
    const item = document.querySelector('.toast-item');
    expect(item.dataset.tone).toBe('loading');
    expect(item.getAttribute('aria-busy')).toBe('');
    expect(item.querySelector('.toast-close')).toBeNull();
    resolve('3 files');
    await flush();
    expect(item.dataset.tone).toBe('success');
    expect(item.hasAttribute('aria-busy')).toBe(false);
    expect(item.querySelector('.toast-title').textContent).toBe('Saved 3 files');
    expect(item.querySelector('.toast-close')).not.toBeNull();
  });

  it('shows the error text when the promise rejects or the task throws', async () => {
    toast.promise(() => { throw new Error('Offline'); }, { loading: 'Sending', error: (e) => e.message }).catch(() => {});
    await flush();
    const item = document.querySelector('.toast-item');
    expect(item.dataset.tone).toBe('danger');
    expect(item.getAttribute('role')).toBe('alert');
    expect(item.querySelector('.toast-title').textContent).toBe('Offline');
  });

  it('keeps earlier updates and drops the alert role when the tone changes', () => {
    const t = toast('Uploading', { tone: 'danger', description: 'Step 1', duration: 0 });
    t.update({ description: 'Step 2' });
    t.update('Uploaded', { tone: 'success' });
    expect(t.el.querySelector('.toast-title').textContent).toBe('Uploaded');
    expect(t.el.querySelector('.toast-description').textContent).toBe('Step 2');
    expect(t.el.hasAttribute('role')).toBe(false);
  });
});
