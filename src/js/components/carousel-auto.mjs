// Autoplay for the CSS .carousel: advances every few seconds, pauses on hover,
// on focus, in a background tab and with reduced motion, adds a play and
// pause button, and keeps the .carousel-dot of the visible slide current.
//
//   <div class="carousel-auto" data-m-carousel-auto data-m-carousel-auto-interval="4000">
//     <div class="carousel carousel-full">...slides...</div>
//     <nav class="carousel-nav">...dots...</nav>
//   </div>
//
// Fires monsoon:slide with { index }.
import { define, emit } from '../core.mjs';
import { expose, h } from './combobox.mjs';

/** Index of the next slide, wrapping around. */
export const nextIndex = (i, n, d = 1) => (n ? (((i + d) % n) + n) % n : 0);

define('carousel-auto', (root, opts) => {
  const track = root.querySelector('.carousel');
  if (!track) return;
  const slides = [...track.children].filter((c) => c.classList.contains('carousel-item'));
  const n = slides.length;
  if (n < 2) return;
  const dots = [...root.querySelectorAll('.carousel-dot')];
  const interval = +opts.interval || 5000;
  const reduce = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  root.style.setProperty('--carousel-interval', `${interval}ms`);
  track.setAttribute('aria-roledescription', 'carousel');
  if (!track.getAttribute('aria-label')) track.setAttribute('aria-label', opts.label || 'Slides');
  slides.forEach((s, i) => {
    s.setAttribute('role', 'group');
    s.setAttribute('aria-roledescription', 'slide');
    if (!s.getAttribute('aria-label')) s.setAttribute('aria-label', `${i + 1} of ${n}`);
  });

  let index = 0;
  let userPaused = reduce && opts.force === undefined;
  let hover = false;
  let focused = false;
  let timer = 0;
  let left = interval;
  let since = 0;

  const play = h('button', { type: 'button', class: 'carousel-play' });
  (root.querySelector('.carousel-nav') || root).append(play);
  const running = () => !userPaused && !hover && !focused && !document.hidden;

  const schedule = () => {
    clearTimeout(timer);
    const run = running();
    root.toggleAttribute('data-paused', !run);
    track.setAttribute('aria-live', run ? 'off' : 'polite');
    play.setAttribute('aria-label', userPaused ? 'Play slides' : 'Pause slides');
    play.setAttribute('aria-pressed', String(!userPaused));
    if (!run) return;
    since = Date.now();
    timer = setTimeout(() => go(index + 1), left);
  };
  const pause = () => {
    if (running()) left = Math.max(0, left - (Date.now() - since));
  };
  const update = (cb) => {
    pause();
    cb();
    schedule();
  };

  const setIndex = (i) => {
    if (i === index && root.hasAttribute('data-ready')) return;
    index = i;
    left = interval;
    dots.forEach((d, k) => {
      d.removeAttribute('aria-current');
      if (k === i) {
        void d.offsetWidth;
        d.setAttribute('aria-current', 'true');
      }
    });
    root.setAttribute('data-ready', '');
    emit(root, 'slide', { index: i });
    schedule();
  };

  function go(i) {
    const k = nextIndex(i, n, 0);
    const r = slides[k].getBoundingClientRect();
    const t = track.getBoundingClientRect();
    track.scrollBy({ left: r.left - t.left, top: track.classList.contains('carousel-vertical') ? r.top - t.top : 0, behavior: reduce ? 'auto' : 'smooth' });
    setIndex(k);
  }

  const io = typeof IntersectionObserver !== 'undefined' && new IntersectionObserver((entries) => {
    const seen = entries.filter((e) => e.isIntersecting && e.intersectionRatio >= 0.6).map((e) => slides.indexOf(e.target));
    if (seen.length && !seen.includes(index)) setIndex(seen[0]);
  }, { root: track, threshold: [0.6] });
  if (io) slides.forEach((s) => io.observe(s));

  root.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    const slide = a && slides.find((s) => s.id && `#${s.id}` === a.getAttribute('href'));
    if (!slide) return;
    e.preventDefault();
    go(slides.indexOf(slide));
  });
  play.addEventListener('click', () => update(() => { userPaused = !userPaused; }));
  root.addEventListener('pointerenter', () => update(() => { hover = true; }));
  root.addEventListener('pointerleave', () => update(() => { hover = false; }));
  root.addEventListener('focusin', () => update(() => { focused = true; }));
  root.addEventListener('focusout', (e) => update(() => { focused = root.contains(e.relatedTarget); }));
  const onVisible = () => update(() => {});
  document.addEventListener('visibilitychange', onVisible);
  setIndex(0);

  expose(root, 'carouselAuto', {
    get index() { return index; },
    go,
    next: () => go(index + 1),
    prev: () => go(index - 1),
    play: () => update(() => { userPaused = false; }),
    pause: () => update(() => { userPaused = true; }),
  });
  return () => {
    clearTimeout(timer);
    if (io) io.disconnect();
    document.removeEventListener('visibilitychange', onVisible);
  };
});
