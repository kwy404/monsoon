// Infinite scroll trigger: when the sentinel comes near the viewport (or a
// scroll container) it fires monsoon:load. Call detail.done() after adding the
// next items, or detail.done(false) when there is nothing left.
//
//   <div class="infinite-scroll" data-m-infinite-scroll data-m-infinite-scroll-margin="300px">Loading more</div>
//
// Options: -margin (rootMargin, "200px" by default), -root (a selector for
// the scroll container), -end (text shown once everything is loaded).
import { define, emit } from '../core.mjs';
import { expose } from './combobox.mjs';

define('infinite-scroll', (el, opts) => {
  if (typeof IntersectionObserver === 'undefined') return;
  let page = 0;
  let loading = false;
  let ended = false;
  const io = new IntersectionObserver((entries) => {
    if (!entries.some((e) => e.isIntersecting) || loading || ended) return;
    loading = true;
    page += 1;
    el.setAttribute('data-loading', '');
    el.setAttribute('aria-busy', 'true');
    emit(el, 'load', {
      page,
      done(more = true) {
        loading = false;
        el.removeAttribute('data-loading');
        el.setAttribute('aria-busy', 'false');
        if (!more) {
          ended = true;
          el.setAttribute('data-ended', '');
          if (opts.end) el.textContent = opts.end;
          io.disconnect();
          return;
        }
        // Observe again so a sentinel that is still visible fires once more.
        io.unobserve(el);
        io.observe(el);
      },
    });
  }, { root: opts.root ? document.querySelector(opts.root) : null, rootMargin: opts.margin || '200px' });
  el.setAttribute('role', el.getAttribute('role') || 'status');
  io.observe(el);
  expose(el, 'infiniteScroll', {
    get page() { return page; },
    reset() {
      page = 0;
      ended = false;
      loading = false;
      el.removeAttribute('data-ended');
      io.observe(el);
    },
  });
  return () => io.disconnect();
});
