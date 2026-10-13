// The landing page: cinematic hero, live editor, responsive and seed demos,
// the "how it works" editor, a bento grid of live feature demos, the
// showcase gallery, guides and FAQ.
import {
  page, code, terminal, pre, copyButton, windowBar, fileIcon, termIcon, esc, art, faqList, faqLd, breadcrumbLd, u, I,
  SITE, REPO, NPM, CDN, VERSION, BASE_COUNT, VARIANT_COUNT, fmt, STATE, INDEX,
} from '../lib.mjs';
import { presets } from '../presets.mjs';
import { frameDoc, thumbHtml } from './components.mjs';
import { CAT_INFO } from './utilities.mjs';
import { whyGrid } from './why.mjs';

export const SEEDS = [
  ['Storm', '#3b5bdb'], ['Cyan', '#22d3ee'], ['Violet', '#8b5cf6'], ['Rose', '#f43f5e'], ['Teal', '#0d9488'],
  ['Amber', '#f59e0b'], ['Emerald', '#059669'], ['Orange', '#ea580c'], ['Slate', '#475569'], ['Lime', '#84cc16'],
];

export const homeFaqs = [
  ['How do I use utility-first CSS without a build step?', 'Add one tag, `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/monsooncss">`, and write classes such as `px-4`, `md:grid-cols-3` or `hover:bg-primary` in your HTML. Every class is already in the file, so there is no compiler, no config file and no watcher to run.'],
  ['Is a CSS framework from a CDN fine for production?', `Yes. The file is cached by the browser after the first visit, and you can pin an exact version such as \`monsooncss@${VERSION}\`. If you want a smaller file, run \`npx monsooncss purge\` once and serve the result yourself.`],
  ['How do I generate a whole theme from one color in CSS?', 'Set `--seed` to any CSS color, for example `:root { --seed: #0d9488; }`. Monsoon derives primary, secondary, accent, surfaces, muted text, borders and the focus ring from it with OKLCH relative colors, in pure CSS. Put `style="--seed: teal"` on any element to theme only that section.'],
  ['How does dark mode work?', 'It is automatic. Monsoon follows `prefers-color-scheme`, and you can force a scheme with `class="dark"`, `class="light"` or `data-theme="dark"` on the root element or on any section. Semantic colors such as `bg-surface` and `text-foreground` switch on their own, so most pages need no `dark:` classes at all.'],
  ['Do the components need JavaScript?', 'No. Dialogs use the native `dialog` element, menus and popovers use the `popover` attribute or `details`, toggles are real checkboxes. Everything is CSS on top of native HTML, so it works in any stack.'],
  ['Is the color contrast accessible?', 'The seed formulas push the primary color out of the lightness band where neither white nor dark text is safe, and flip the foreground to match. The test suite checks 4.5:1 (WCAG AA) for every token pair across named seeds and a sweep of sRGB seeds, in light and dark mode.'],
  ['What is not supported?', 'Stacked variants on static classes such as `dark:hover:bg-muted` and the important modifier are not part of a prebuilt stylesheet. Arbitrary values such as `w-[37px]` work with the optional `monsoon.js` script or the purge CLI, stacked variants included. For anything else, a `style` attribute or a few lines of your own CSS next to Monsoon work fine.'],
];

// ---- Small pieces ----

const cap = (text) => `<p class="cap" aria-hidden="true"><span>${esc(text)}</span></p>`;
const gutter = (text) => `<span class="gutter-label" aria-hidden="true">${esc(text)}</span>`;
const band = (id, label, inner, cls = '') => `<section${id ? ` id="${id}"` : ''} class="band ${cls}"${id ? ` aria-labelledby="${id}-title"` : ''}>
  <div class="frame">${label ? gutter(label) : ''}
${inner}
  </div>
</section>`;
const head = (id, kicker, title, lead, artName) => `<div class="sec-head">
  ${artName ? art(artName, 'sec-art') : ''}
  <p class="kicker">${kicker}</p>
  <h2 id="${id}-title" class="sec-title">${title}</h2>
  ${lead ? `<p class="sec-lead">${lead}</p>` : ''}
</div>`;

/** Wraps responsive and container prefixes in spans the page can light up. */
function markTokens(html) {
  const re = /(^|[\s"';]|&quot;|&#x22;)((?:@?(?:2xl|xl|lg|md|sm|xs)):[\w\-/.@]+)/g;
  return html.replace(/>([^<]+)</g, (m, text) =>
    `>${text.replace(re, (_, before, tok) => {
      const bp = tok.slice(0, tok.indexOf(':'));
      return `${before}<span class="tk tk-${bp.replace('@', 'c')}">${tok}</span>`;
    })}<`,
  );
}

const RESP_HTML = `<div class="mx-auto max-w-5xl p-4 sm:p-6">
  <header class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
    <div>
      <p class="text-xs font-semibold uppercase tracking-widest text-primary">Monsoon weather</p>
      <h1 class="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight">Rain this week</h1>
    </div>
    <nav class="hidden md:flex gap-1 text-sm">
      <a class="rounded-lg bg-primary text-primary-foreground px-3 py-1.5" href="#">Week</a>
      <a class="rounded-lg px-3 py-1.5 text-muted-foreground" href="#">Month</a>
    </nav>
  </header>
  <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
    <div class="rounded-xl border bg-surface p-4"><p class="text-sm text-muted-foreground">Lisbon</p><p class="text-2xl font-bold">18°</p><p class="text-xs text-primary">Light rain</p></div>
    <div class="rounded-xl border bg-surface p-4"><p class="text-sm text-muted-foreground">Mumbai</p><p class="text-2xl font-bold">29°</p><p class="text-xs text-primary">Monsoon</p></div>
    <div class="rounded-xl border bg-surface p-4"><p class="text-sm text-muted-foreground">Recife</p><p class="text-2xl font-bold">26°</p><p class="text-xs text-primary">Showers</p></div>
    <div class="rounded-xl border bg-surface p-4"><p class="text-sm text-muted-foreground">Oslo</p><p class="text-2xl font-bold">9°</p><p class="text-xs text-primary">Drizzle</p></div>
  </div>
  <div class="@container mt-4 rounded-xl border bg-surface p-4" data-cq>
    <div class="flex flex-col @md:flex-row @md:items-center gap-4">
      <div class="h-20 @md:w-40 shrink-0 rounded-lg bg-gradient-to-br from-primary to-accent"></div>
      <div>
        <p class="font-semibold @lg:text-lg">Umbrella index</p>
        <p class="text-sm text-muted-foreground">This card reads its own width. It stacks below 28rem and turns into a row above it, wherever you put it.</p>
      </div>
    </div>
  </div>
</div>`;

function responsiveDemo() {
  const { id, html } = pre(RESP_HTML, 'html', { labelText: 'Responsive markup' });
  const bps = [['sm', 640], ['md', 768], ['lg', 1024], ['xl', 1280]];
  const cbs = [['@sm', 384], ['@md', 448], ['@lg', 512]];
  return `<div class="resp" v-data :class="bpClasses(PV.resp, PV.respC)">
  <div class="resp-toolbar">
    <div class="seg" role="group" aria-label="Preview width presets">
      ${[375, 768, 1024, 1280].map((w) => `<button type="button" @click="pvSet('resp', ${w})" :aria-pressed="PV.resp === ${w} ? 'true' : 'false'" aria-pressed="${w === 1024}">${w}</button>`).join('')}
    </div>
    <p class="resp-width"><span v-text="Math.round(PV.resp || 1024)">1024</span>px</p>
    <div class="resp-chips" aria-live="polite">
      ${bps.map(([b, px]) => `<span class="bp-chip" :class="{ 'is-on': (PV.resp || 1024) >= ${px} }" title="min-width ${px}px">${b}:</span>`).join('')}
      <span class="bp-sep" aria-hidden="true"></span>
      ${cbs.map(([b, px]) => `<span class="bp-chip is-c" :class="{ 'is-on': (PV.respC || 0) >= ${px} }" title="container min-width ${px / 16}rem">${b}:</span>`).join('')}
    </div>
  </div>
  <div class="resp-stage">
    <div class="pv-resize resp-frame" data-pv="resp" data-min="320" data-max="1280" :style="respStyle(PV.resp)">
      <iframe class="pv-frame" title="Responsive preview" style="height:420px" srcdoc="${esc(frameDoc(RESP_HTML, { pad: 0 }))}" data-autoheight data-cq-probe="resp" :data-fx="frameMode($el, '', T.mode, T.dark)"></iframe>
      <div class="pv-handle" role="slider" tabindex="0" aria-label="Preview width in pixels" aria-valuemin="320" aria-valuemax="1280" :aria-valuenow="PV.resp || 1024" data-handle="resp"><span></span></div>
    </div>
  </div>
  <figure class="window resp-code">${windowBar(`<span class="ed-tab active">${fileIcon('forecast.html')}<span>forecast.html</span></span><span class="panel-shell">Active prefixes light up as you drag</span>${copyButton(id, 'responsive markup')}`)}${markTokens(html)}</figure>
</div>`;
}

function liveEditor() {
  const tabs = presets
    .map(
      (p, i) =>
        `<button type="button" role="tab" class="ed-tab" aria-selected="${i === 0}" :aria-selected="p === ${i} ? 'true' : 'false'" @click="code = presets[${i}].code; p = ${i}">${fileIcon('x.html')}<span>${esc(p.file)}</span></button>`,
    )
    .join('');
  return `<div class="live" v-data="{ code: presets[0].code, p: 0, mode: '' }">
  <div class="live-grid">
    <div class="window live-ed">
      ${windowBar(`<div class="ed-tabs" role="tablist" aria-label="Examples">${tabs}</div>`)}
      <div class="ed">
        <pre class="ed-hl" aria-hidden="true" v-html="hl(code)">${esc(presets[0].code)}</pre>
        <label for="live-code" class="sr-only">HTML with Monsoon classes, edit to update the preview</label>
        <textarea id="live-code" class="ed-ta" wrap="off" spellcheck="false" autocomplete="off" autocapitalize="off" v-model="code">${esc(presets[0].code)}</textarea>
      </div>
      <div class="ed-status"><span>HTML</span><span>Monsoon ${VERSION}</span><span class="ml-auto" v-text="lineCount(code) + ' lines'"></span></div>
    </div>
    <div class="window live-out">
      ${windowBar(`<span class="ed-tab active"><span>Preview</span></span><span class="seg seg-sm bar-seg" role="group" aria-label="Preview scheme"><button type="button" @click="mode = ''" :aria-pressed="mode === '' ? 'true' : 'false'" aria-pressed="true">Auto</button><button type="button" @click="mode = 'light'" :aria-pressed="mode === 'light' ? 'true' : 'false'" aria-pressed="false">Light</button><button type="button" @click="mode = 'dark'" :aria-pressed="mode === 'dark' ? 'true' : 'false'" aria-pressed="false">Dark</button></span>`)}
      <iframe class="live-frame" title="Live preview of the HTML in the editor" srcdoc="${esc(frameDoc(presets[0].code, { js: true }))}" :data-fx="renderFrame($el, code, mode, T.mode, '', T.dark)"></iframe>
    </div>
  </div>
</div>
<script type="application/json" id="presets-data">${JSON.stringify(presets).replace(/</g, '\\u003c')}</script>`;
}

function howItWorks(purge) {
  const start = 'px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 md:px-6';
  const termLines = purge.lines.map((l, i) => `<span class="tl" style="--i:${i + 1}">${l}</span>`).join('\n');
  return `<div class="hiw" v-data="{ cls: '${start}', view: 'css' }">
  <div class="window hiw-win">
    ${windowBar(`<div class="ed-tabs" role="tablist" aria-label="Files">
      <button type="button" role="tab" class="ed-tab" aria-selected="true" :aria-selected="view === 'css' ? 'true' : 'false'" @click="view = 'css'">${fileIcon('index.html')}<span>index.html</span></button>
      <button type="button" role="tab" class="ed-tab" aria-selected="false" :aria-selected="view === 'cdn' ? 'true' : 'false'" @click="view = 'cdn'">${fileIcon('monsoon.css')}<span>monsoon.css</span><span class="tab-note">from CDN</span></button>
      <button type="button" role="tab" class="ed-tab" aria-selected="false" :aria-selected="view === 'term' ? 'true' : 'false'" @click="view = 'term'">${termIcon()}<span>Terminal</span></button>
    </div>`)}
    <div class="hiw-body" v-show="view !== 'term'">
      <div class="hiw-src">
        <pre class="hiw-code" aria-hidden="true" v-pre><span class="h-pun">&lt;</span><span class="h-tag">link</span> <span class="h-attr">rel</span><span class="h-pun">=</span><span class="h-str">"stylesheet"</span> <span class="h-attr">href</span><span class="h-pun">=</span><span class="h-str">"${CDN}"</span><span class="h-pun">&gt;</span>

<span class="h-pun">&lt;</span><span class="h-tag">button</span>
  <span class="h-attr">class</span><span class="h-pun">=</span><span class="h-str">"</span></pre>
        <label class="hiw-line"><span class="sr-only">Classes on the button, type to see the CSS</span><input type="text" v-model="cls" spellcheck="false" autocomplete="off" class="hiw-input" aria-describedby="hiw-help"></label>
        <pre class="hiw-code" aria-hidden="true" v-pre><span class="h-str">"</span><span class="h-pun">&gt;</span>
  Get started
<span class="h-pun">&lt;/</span><span class="h-tag">button</span><span class="h-pun">&gt;</span></pre>
        <div class="hiw-result"><p class="hiw-label">Rendered</p><button type="button" :class="cls" class="${start}">Get started</button></div>
        <p id="hiw-help" class="hiw-help">Edit the class list. Every class is looked up in the real stylesheet, including variants and component classes.</p>
      </div>
      <div class="hiw-out" aria-live="polite">
        <p class="hiw-label"><span v-show="view === 'cdn'">monsoon.min.css, the rules your classes use</span><span v-show="view !== 'cdn'">Generated CSS, already in the file you linked</span></p>
        <pre class="hiw-css" v-html="cssFor(cls, S.idx)"><span class="c-com">/* loading the class index */</span></pre>
      </div>
    </div>
    <div class="hiw-term" hidden :hidden="view !== 'term'">
      <pre class="term-anim" :class="{ 'is-run': view === 'term' }"><span class="tl tl-cmd" style="--i:0"><span class="prompt">$</span> npx monsooncss purge "src/**/*.html" -o public/monsoon.css</span>
${termLines}</pre>
    </div>
  </div>
</div>`;
}

// ---- Bento demos ----

const landscape = (id) => `<svg viewBox="0 0 160 100" class="w-full h-auto block" aria-hidden="true"><defs><linearGradient id="sky-${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3b5bdb"/><stop offset=".6" stop-color="#8b5cf6"/><stop offset="1" stop-color="#f43f5e"/></linearGradient></defs><rect width="160" height="100" fill="url(#sky-${id})"/><circle cx="118" cy="34" r="14" fill="#fde68a"/><path d="M0 72 38 44l26 22 22-16 34 26 40-30v54H0z" fill="#141530"/><path d="M0 86 30 70l30 12 34-14 30 12 36-10v30H0z" fill="#22d3ee" opacity=".85"/></svg>`;

function bentoFilters() {
  const f = [['none', ''], ['grayscale', 'grayscale'], ['sepia', 'sepia'], ['invert', 'invert'], ['blur-sm', 'blur-sm']];
  return `<div class="grid grid-cols-2 sm:grid-cols-5 gap-3">${f
    .map(([n, c], i) => `<figure class="space-y-1.5${i === 0 ? ' col-span-2 sm:col-span-1' : ''}"><figcaption class="cap-mini">${n}</figcaption><div class="overflow-hidden rounded-lg border ${c}">${landscape(`f${i}`)}</div></figure>`)
    .join('')}</div>`;
}

const miniCard = `<div class="rounded-xl border bg-surface p-4 shadow-sm space-y-3">
  <div class="flex items-center gap-3"><span class="size-9 rounded-full bg-gradient-to-br from-primary to-accent"></span><div><p class="text-sm font-semibold">Mo Panda</p><p class="text-xs text-muted-foreground">Umbrella engineer</p></div><span class="ml-auto rounded-full bg-success text-success-foreground px-2 py-0.5 text-xs font-medium">Online</span></div>
  <div class="h-1.5 rounded-full bg-muted"><div class="h-1.5 w-2/3 rounded-full bg-primary"></div></div>
  <div class="flex gap-2"><span class="flex-1 rounded-lg bg-primary text-primary-foreground py-1.5 text-center text-sm font-medium">Follow</span><span class="flex-1 rounded-lg border py-1.5 text-center text-sm font-medium">Message</span></div>
</div>`;

function bentoDark() {
  return `<div class="split" v-data="{ s: 50 }" :style="{ '--split': s + '%' }" style="--split:50%">
  <div class="split-layer light">${miniCard}</div>
  <div class="split-layer split-dark dark" aria-hidden="true">${miniCard}</div>
  <div class="split-line" aria-hidden="true"><span class="split-knob">${I.arrowLeft}${I.arrowRight}</span></div>
  <input type="range" min="0" max="100" v-model.number="s" class="split-range" aria-label="Compare light and dark mode, move the divider">
  <span class="split-tag split-tag-l" aria-hidden="true">.light</span><span class="split-tag split-tag-r" aria-hidden="true">.dark</span>
</div>`;
}

function bentoPalette() {
  const hues = ['slate', 'gray', 'zinc', 'neutral', 'stone', 'red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose'];
  const steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
  return `<div class="pal" role="img" aria-label="The Monsoon OKLCH palette: 22 hues by 11 steps from 50 to 950">
  <div class="pal-grid" style="--cols:${hues.length}">
    <span></span>${hues.map((h) => `<span class="pal-hue">${h}</span>`).join('')}
    ${steps.map((s) => `<span class="pal-step">${s}</span>${hues.map((h) => `<span class="pal-sw bg-${h}-${s}" title="bg-${h}-${s}"></span>`).join('')}`).join('\n    ')}
  </div>
</div>`;
}

function bentoGrid() {
  return `<div class="grid grid-cols-4 grid-rows-3 gap-2 h-56">
  <div class="col-span-2 row-span-2 rounded-lg bg-gradient-to-br from-indigo-600 via-violet-500 to-rose-500 mosaic-a"></div>
  <div class="rounded-lg bg-gradient-to-b from-cyan-400 to-sky-600"></div>
  <div class="row-span-2 rounded-lg bg-gradient-to-t from-amber-400 to-rose-500 mosaic-b"></div>
  <div class="rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 mosaic-c"></div>
  <div class="col-span-3 rounded-lg bg-gradient-to-r from-slate-600 to-indigo-600 mosaic-d"></div>
  <div class="rounded-lg bg-gradient-to-br from-fuchsia-500 to-violet-600"></div>
</div>
<p class="cap-mini mt-2">grid-cols-4 grid-rows-3 col-span-2 row-span-2</p>`;
}

function bentoEasing() {
  const rows = ['linear', 'out', 'in-out', 'in'];
  const val = (n) => {
    const c = INDEX.classes.find((x) => x.class === `ease-${n}`);
    return c ? /:\s*([^;]+);/.exec(c.css)?.[1] : '';
  };
  const curve = { linear: 'M2 30 L30 2', out: 'M2 30 C2 30 10 2 30 2', 'in-out': 'M2 30 C18 30 14 2 30 2', in: 'M2 30 C22 30 30 2 30 2' };
  return `<div class="space-y-3">${rows
    .map(
      (r) => `<div class="ease-row"><svg viewBox="0 0 32 32" class="ease-curve" aria-hidden="true"><path d="${curve[r]}"/></svg><div class="ease-track"><span class="ease-sq sq-${r}" style="animation-timing-function:${esc(val(r))}"></span></div><code class="cap-mini">ease-${r}</code></div>`,
    )
    .join('')}</div>`;
}

const logical = (dir) => `<div dir="${dir}" class="rounded-xl border bg-surface p-3 space-y-2 text-sm">
  <p class="cap-mini" dir="ltr">dir="${dir}"</p>
  <div class="border-s-4 border-primary ps-3"><p class="font-semibold">${dir === 'rtl' ? 'مرحبا' : 'Hello, Mo'}</p><p class="text-muted-foreground text-xs">border-s-4 ps-3</p></div>
  <div class="flex"><span class="rounded-md bg-primary text-primary-foreground px-2 py-0.5 text-xs">start</span><span class="ms-auto rounded-md bg-accent text-accent-foreground px-2 py-0.5 text-xs">ms-auto</span></div>
</div>`;

function bentoGradients() {
  const bars = [
    ['First paint', 'fast', 'w-1/4', 'from-cyan-400 to-sky-500'],
    ['Requests for CSS', '1', 'w-2/5', 'from-sky-500 to-indigo-500'],
    ['Classes available', fmt(BASE_COUNT + VARIANT_COUNT), 'w-5/6', 'from-indigo-500 via-violet-500 to-fuchsia-500'],
    ['Build steps', '0', 'w-1/6', 'from-rose-500 to-orange-400'],
  ];
  return `<div class="space-y-3">${bars
    .map(([l, v, w, g]) => `<div><div class="flex justify-between text-xs"><span class="text-muted-foreground">${l}</span><span class="font-mono font-semibold">${v}</span></div><div class="mt-1 h-2.5 rounded-full bg-muted"><div class="h-2.5 rounded-full bg-gradient-to-r ${g} ${w}"></div></div></div>`)
    .join('')}</div>`;
}

function bentoTransforms() {
  return `<div class="tilt-stage"><div class="group relative mx-auto h-40 w-56">
  <div class="absolute inset-0 rounded-xl bg-gradient-to-br from-rose-500 to-amber-400 shadow-lg transition-transform duration-500 -rotate-6 group-hover:-rotate-12 group-hover:-translate-x-4"></div>
  <div class="absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-400 to-indigo-500 shadow-lg transition-transform duration-500 rotate-3 group-hover:rotate-6 group-hover:translate-x-4"></div>
  <div class="tilt absolute inset-0 rounded-xl border bg-surface p-4 shadow-xl transition-transform duration-500 group-hover:scale-105">
    <p class="text-xs font-semibold uppercase tracking-widest text-primary">Hover me</p>
    <p class="mt-2 font-bold">rotate, scale, translate</p>
    <p class="mt-1 text-xs text-muted-foreground">group-hover:rotate-6 group-hover:scale-105</p>
  </div>
</div></div>`;
}

function bentoNative() {
  return `<div class="flex flex-wrap items-start gap-3" v-data>
  <button type="button" class="btn btn-sm" @click="$refs.bdlg.showModal()">Open dialog</button>
  <dialog class="modal" v-ref="bdlg" aria-labelledby="bento-dlg-title"><div class="modal-box"><div class="modal-header"><h3 id="bento-dlg-title" class="modal-title">A native dialog</h3></div><p class="modal-body text-muted-foreground">Focus is trapped, Escape closes it and the page behind is inert. The browser does all of it.</p><form method="dialog" class="modal-actions"><button class="btn btn-sm">Close</button></form></div></dialog>
  <button type="button" class="btn btn-sm btn-outline" popovertarget="bento-pop">Popover</button>
  <div id="bento-pop" popover class="popover"><strong class="popover-title">Popover API</strong><p class="text-muted-foreground">Light dismiss and top layer, no script.</p></div>
  <details class="w-full rounded-lg border bg-surface px-3 py-2 text-sm"><summary class="cursor-pointer font-medium">details and summary</summary><p class="mt-2 text-muted-foreground">Opens with Enter or Space, announced by screen readers.</p></details>
</div>`;
}

function bentoSeed() {
  return `<div v-data="{ seed: '#3b5bdb' }">
  <div class="flex flex-wrap items-center gap-2 mb-3">
    <input type="color" class="swatch-input" value="#3b5bdb" v-model="seed" aria-label="Seed color">
    ${SEEDS.slice(0, 6).map(([n, h]) => `<button type="button" class="swatch" style="--swatch:${h}" @click="seed = '${h}'" :aria-pressed="seed === '${h}' ? 'true' : 'false'" aria-pressed="${h === '#3b5bdb'}" aria-label="${n}"></button>`).join('')}
    <code class="cap-mini ml-auto" v-text="'--seed: ' + seed">--seed: #3b5bdb</code>
  </div>
  <div class="rounded-xl border bg-background p-3 space-y-2" style="--seed:#3b5bdb" :style="{ '--seed': safe(seed) }">
    <div class="flex items-center gap-2"><span class="size-6 rounded-md bg-primary"></span><span class="text-sm font-semibold">Revenue</span><span class="ml-auto rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs font-semibold">+12%</span></div>
    <div class="flex items-end gap-1 h-16">${[40, 65, 50, 80, 60, 95, 70].map((h) => `<span class="flex-1 rounded-t bg-primary" style="height:${h}%"></span>`).join('')}</div>
    <div class="flex gap-2"><span class="rounded-md bg-primary text-primary-foreground px-2.5 py-1 text-xs font-medium">Export</span><span class="rounded-md bg-accent text-accent-foreground px-2.5 py-1 text-xs font-medium">Share</span><span class="rounded-md bg-secondary text-secondary-foreground px-2.5 py-1 text-xs font-medium">Filter</span></div>
  </div>
</div>`;
}

function bentoCard({ name, title, text, demo, cls = '' }) {
  return `<article class="bento-card ${cls}">
  <div class="bento-demo">${demo}</div>
  <div class="bento-text">${art(name, 'bento-art')}<div><h3 class="bento-title">${title}</h3><p class="bento-desc">${text}</p></div></div>
</article>`;
}

function bento() {
  const cssVars = code(`:root {
  --seed: #3b5bdb;        /* the only line you write */
}
/* derived in the browser */
--primary: oklch(from var(--seed) ...);
--accent:  oklch(from var(--seed) l c calc(h + 180));
--surface: oklch(from var(--seed) 1 min(c, .008) h);`, 'css', 'theme.css');
  const layers = code(`@layer base {
  /* reset and element defaults */
  h1, p, ul { margin: 0; }
}

/* your rules sit outside the layer,
   so they win without !important */
h1 { letter-spacing: -0.02em; }`, 'css', 'app.css');
  const cq = markTokens(code(`<div class="@container">
  <article class="flex flex-col @sm:flex-row gap-4">
    <img class="@sm:w-1/3" src="cover.jpg" alt="">
    <p class="@md:text-lg">Fits any column.</p>
  </article>
</div>`, 'html', 'card.html'));
  return `<div class="bento">
${bentoCard({ name: 'filters', title: 'Filters', text: 'The same card through grayscale, sepia, invert and blur. One class each, no image editing.', demo: bentoFilters(), cls: 'span-2' })}
${bentoCard({ name: 'dark-mode', title: 'Dark mode', text: 'One element tree, two schemes. Drag the divider: the right half only adds <code>class="dark"</code>.', demo: bentoDark() })}
${bentoCard({ name: 'css-variables', title: 'CSS variables', text: 'Every token is a custom property derived from <code>--seed</code>. Override one, or all, at any level.', demo: cssVars })}
${bentoCard({ name: 'palette', title: 'OKLCH palette', text: '22 hues by 11 steps on one perceptual lightness curve, so step 500 of every hue carries the same weight.', demo: bentoPalette(), cls: 'span-2' })}
${bentoCard({ name: 'grid-layout', title: 'Grid layout', text: 'Columns, rows and spans compose a mosaic without a single line of custom CSS.', demo: bentoGrid() })}
${bentoCard({ name: 'transitions', title: 'Transitions and easing', text: 'Linear, ease out, ease in out and ease in, with durations and delays for every interaction.', demo: bentoEasing() })}
${bentoCard({ name: 'cascade-layers', title: 'Cascade layers', text: 'The reset lives in <code>@layer base</code>, so your own CSS overrides it with no specificity games.', demo: layers })}
${bentoCard({ name: 'logical-properties', title: 'Logical properties', text: 'Start and end instead of left and right. The same classes flip for right to left languages.', demo: `<div class="grid grid-cols-2 gap-3">${logical('ltr')}${logical('rtl')}</div>` })}
${bentoCard({ name: 'container-queries', title: 'Container queries', text: 'Mark a parent with <code>@container</code> and style children by its width, from <code>@xs:</code> to <code>@xl:</code>.', demo: cq })}
${bentoCard({ name: 'gradients', title: 'Gradients', text: 'From, via and to stops with every palette color and the semantic tokens.', demo: bentoGradients() })}
${bentoCard({ name: '3d-transforms', title: 'Transforms', text: 'Rotate, scale and translate with hover and group hover variants. Hover the stack.', demo: bentoTransforms() })}
${bentoCard({ name: 'native-components', title: 'Native components', text: 'Dialog, popover and details styled by Monsoon and powered by the browser. They really work.', demo: bentoNative() })}
${bentoCard({ name: 'seed-theme', title: 'Seed theming', text: 'Pick a color and watch a dashboard re-theme itself, contrast safe, in pure CSS.', demo: bentoSeed() })}
</div>`;
}

// ---- Seed section (light and dark side by side with contrast readouts) ----

function seedPanel(mode) {
  const dark = mode === 'dark';
  return `<div class="${mode} seed-panel" style="--seed:#3b5bdb" :style="{ '--seed': safe(seed) }">
  <div class="flex flex-wrap items-center justify-between gap-3">
    <p class="inline-flex items-center gap-2 text-sm font-semibold">${dark ? I.moon : I.sun} ${dark ? 'Dark' : 'Light'}</p>
    <div class="flex flex-wrap gap-2 text-xs">
      <span class="ratio-pill" title="primary-foreground on primary">Button <b v-text="ratio(seed, '${mode}', 'primary')">-</b></span>
      <span class="ratio-pill" title="foreground on background">Body <b v-text="ratio(seed, '${mode}', 'body')">-</b></span>
      <span class="ratio-pill" title="accent-foreground on accent">Accent <b v-text="ratio(seed, '${mode}', 'accent')">-</b></span>
      <span class="rounded-full bg-success text-success-foreground px-2.5 py-1 font-semibold" v-text="grade(seed, '${mode}')">AA</span>
    </div>
  </div>
  <div class="grid grid-cols-3 gap-3">
    <div class="rounded-xl border bg-surface p-3"><p class="text-xs text-muted-foreground">Visitors</p><p class="text-xl font-bold">24.8k</p><p class="text-xs text-success">+8.1%</p></div>
    <div class="rounded-xl border bg-surface p-3"><p class="text-xs text-muted-foreground">Signups</p><p class="text-xl font-bold">1,204</p><p class="text-xs text-primary">+3.4%</p></div>
    <div class="rounded-xl bg-primary text-primary-foreground p-3"><p class="text-xs opacity-80">Revenue</p><p class="text-xl font-bold">$9.3k</p><p class="text-xs opacity-80">this week</p></div>
  </div>
  <div class="rounded-xl border bg-surface p-3">
    <div class="flex items-end gap-1.5 h-24">${[35, 52, 44, 70, 58, 86, 64, 92, 75, 60, 81, 98].map((h, i) => `<span class="flex-1 rounded-t ${i % 4 === 3 ? 'bg-accent' : 'bg-primary'}" style="height:${h}%"></span>`).join('')}</div>
  </div>
  <div class="flex flex-wrap gap-2">
    <button type="button" class="rounded-lg bg-primary text-primary-foreground px-3.5 py-2 text-sm font-medium hover:bg-primary/90">Primary</button>
    <button type="button" class="rounded-lg bg-secondary text-secondary-foreground px-3.5 py-2 text-sm font-medium">Secondary</button>
    <button type="button" class="rounded-lg bg-accent text-accent-foreground px-3.5 py-2 text-sm font-medium">Accent</button>
    <button type="button" class="rounded-lg border px-3.5 py-2 text-sm font-medium hover:bg-muted">Outline</button>
  </div>
  <div class="rounded-xl border bg-surface overflow-hidden text-sm">
    <table class="w-full"><thead class="bg-muted text-left text-xs uppercase tracking-wide text-muted-foreground"><tr><th class="px-3 py-2 font-semibold">Customer</th><th class="px-3 py-2 font-semibold">Plan</th><th class="px-3 py-2 font-semibold">Status</th></tr></thead>
    <tbody class="divide-y"><tr><td class="px-3 py-2">Ada Rivers</td><td class="px-3 py-2 text-muted-foreground">Team</td><td class="px-3 py-2"><span class="rounded-full bg-success text-success-foreground px-2 py-0.5 text-xs font-medium">Active</span></td></tr><tr><td class="px-3 py-2">Kai Moreno</td><td class="px-3 py-2 text-muted-foreground">Starter</td><td class="px-3 py-2"><span class="rounded-full bg-warning text-warning-foreground px-2 py-0.5 text-xs font-medium">Trial</span></td></tr></tbody></table>
  </div>
</div>`;
}

function seedSection() {
  return `<div v-data="{ seed: '#3b5bdb' }">
  <div class="seed-bar">
    <div class="flex items-center gap-3">
      <input type="color" class="swatch-input swatch-input-lg" value="#3b5bdb" v-model="seed" aria-label="Seed color picker">
      <div><label for="seed-text" class="block text-xs font-medium text-muted-foreground">--seed</label><input id="seed-text" class="seed-text" value="#3b5bdb" v-model.debounce="seed" spellcheck="false" autocomplete="off"></div>
    </div>
    <div class="flex flex-wrap gap-2.5" role="group" aria-label="Preset seed colors">
      ${SEEDS.map(([n, h]) => `<button type="button" class="swatch swatch-lg" style="--swatch:${h}" @click="seed = '${h}'" :aria-pressed="seed === '${h}' ? 'true' : 'false'" aria-pressed="${h === '#3b5bdb'}" aria-label="${n} ${h}" title="${n} ${h}"></button>`).join('')}
    </div>
    <p class="seed-code">style="--seed: <span v-text="seed">#3b5bdb</span>"<br><span v-text="lch(seed)">oklch(0.52 0.19 267)</span></p>
  </div>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
    ${seedPanel('light')}
    ${seedPanel('dark')}
  </div>
  <p class="mt-4 text-sm text-muted-foreground text-center">Ratios are WCAG 2 contrast measured from the colors your browser renders. The test suite checks 4.5:1 or better for every pair in both modes.</p>
</div>`;
}

function darkTree() {
  return `<div v-data="{ d: true }" class="dt">
  <div class="dt-bar"><button type="button" class="dt-switch" role="switch" :aria-checked="d ? 'true' : 'false'" aria-checked="true" @click="d = !d" aria-label="Dark section"><span class="dt-knob"></span></button><code class="cap-mini" v-text="d ? '&lt;section class=&quot;dark&quot;&gt;' : '&lt;section class=&quot;light&quot;&gt;'">&lt;section class="dark"&gt;</code></div>
  <section class="dt-tree" :class="d ? 'dark' : 'light'">
    <div class="flex items-center justify-between"><p class="font-semibold">Inbox</p><span class="rounded-full bg-primary text-primary-foreground px-2 py-0.5 text-xs font-semibold">3 new</span></div>
    <ul class="mt-3 divide-y rounded-xl border bg-surface text-sm">
      <li class="flex items-center gap-3 p-3"><span class="size-8 shrink-0 rounded-full bg-gradient-to-br from-cyan-400 to-indigo-500"></span><div class="min-w-0"><p class="font-medium">Forecast updated</p><p class="text-xs text-muted-foreground truncate">Heavy rain expected after 6 pm.</p></div></li>
      <li class="flex items-center gap-3 p-3"><span class="size-8 shrink-0 rounded-full bg-gradient-to-br from-rose-500 to-amber-400"></span><div class="min-w-0"><p class="font-medium">Mo shared a palette</p><p class="text-xs text-muted-foreground truncate">Storm blue, cyan, violet and rose.</p></div></li>
    </ul>
    <div class="mt-3 flex gap-2"><span class="rounded-lg bg-primary text-primary-foreground px-3 py-1.5 text-sm font-medium">Reply</span><span class="rounded-lg border px-3 py-1.5 text-sm font-medium">Archive</span></div>
  </section>
</div>`;
}

/** Showcase cards: a live thumbnail, links, and the highlighted source loaded on demand. */
export function showcaseCards(showcase) {
  return showcase
    .map((s) => {
      const href = s.href || `showcase/${s.slug}.html`;
      const srcId = s.srcId || s.slug;
      const file = s.file || `${s.slug}.html`;
      const thumb = s.thumb
        ? `<img src="${u(s.thumb)}" alt="" loading="lazy" decoding="async" class="show-img">`
        : `<span class="show-thumb-in"><iframe src="${u(href)}" title="${esc(s.title)} preview" loading="lazy" tabindex="-1"></iframe></span>`;
      return `<article class="show-card${s.app ? ' is-app' : ''}" v-data="{ src: false }">
      <a href="${u(href)}" class="show-thumb" tabindex="-1" aria-hidden="true">${thumb}${s.app ? '<span class="show-badge">App</span>' : ''}</a>
      <div class="show-meta">
        <h3 class="show-title"><a href="${u(href)}">${esc(s.title)}</a></h3>
        <p class="show-desc">${esc(s.description)}</p>
        <p class="show-tags">${(s.tags || []).map((t) => `<span>${esc(t)}</span>`).join('')}</p>
        <div class="show-actions"><a class="btn-mini" href="${u(href)}">${s.app ? 'Open app' : 'Open page'} ${I.external}</a><button type="button" class="btn-mini btn-mini-ghost" @click="src = !src" :aria-expanded="src ? 'true' : 'false'" aria-expanded="false">${I.code}<span v-text="src ? 'Hide source' : 'View source'">View source</span></button></div>
      </div>
      <figure class="window show-src" hidden :hidden="!src">${windowBar(`<span class="ed-tab active">${fileIcon('x.html')}<span>${esc(file)}</span></span><span class="panel-shell">${s.lines} lines</span><button type="button" class="code-copy" @click="copySource('${href}')">${I.copy}<span>Copy</span></button>`)}<div class="show-src-body" v-html="src ? showSrc('${srcId}', S.srcTick) : ''"></div></figure>
    </article>`;
    })
    .join('\n    ');
}

// ---- Page ----

export function home({ purge, showcase, guides, why = [] }) {
  const comps = STATE.components;
  const h1Cls = 'text-5xl sm:text-7xl lg:text-8xl font-extrabold tracking-tight text-balance';
  const pCls = 'text-lg sm:text-xl text-muted-foreground max-w-2xl';
  const teaser = ['button', 'toggle', 'badge', 'alert', 'tabs', 'avatar-group', 'progress', 'rating', 'stats', 'breadcrumbs', 'kbd', 'chip']
    .map((s) => comps.find((c) => c.slug === s))
    .filter(Boolean);

  const body = `
${band('', '', `
    <div class="lp-hero">
      <div class="hero-bg" aria-hidden="true"></div>
      <div class="hero-copy">
        <a href="${REPO}/blob/main/CHANGELOG.md" class="hero-badge"><span class="hero-badge-new">New in v${VERSION}</span><span class="hero-badge-text">Arbitrary values with no build step, bare color names like bg-red, ${comps.length} components</span>${I.arrowRight}</a>
        ${cap(h1Cls)}
        <h1 class="${h1Cls}">Style anything. <span class="text-gradient">Build nothing.</span></h1>
        ${cap(pCls)}
        <p class="${pCls}">Monsoon is utility-first CSS in one file from a CDN. Every class is already written, a whole theme grows from one <code>--seed</code> color, dark mode is automatic and ${comps.length} components run on native HTML with no JavaScript.</p>
        <div class="hero-cta">
          <a href="${u('docs/introduction.html')}" class="cta-primary">Get started ${I.arrowRight}</a>
          <button type="button" class="cta-search" @click="openSearch()" v-data>${I.search}<span>Quick search</span><span class="kbd-group" aria-hidden="true"><kbd>Ctrl</kbd><kbd>K</kbd></span></button>
        </div>
        <div class="hero-install" v-data><code id="hero-npm"><span class="prompt">$</span>npm i monsooncss</code>${copyButton('hero-npm', 'install command')}</div>
      </div>
      <div class="hero-art">
        <div class="hero-art-glow" aria-hidden="true"></div>
        <img src="${u('assets/mascot.svg')}" width="452" height="452" class="mascot art-light" alt="Mo the red panda in a raincoat, holding a colorful umbrella">
        <img src="${u('assets/mascot-dark.svg')}" width="452" height="452" class="mascot art-dark" alt="Mo the red panda in a raincoat, holding a colorful umbrella">
      </div>
    </div>`, 'band-hero')}

${band('', '', `
    <dl class="lp-stats">
      <div><dt>Utility classes</dt><dd>${fmt(BASE_COUNT)}</dd><dd class="stat-sub">plus ${fmt(VARIANT_COUNT)} variants</dd></div>
      <div><dt>Components</dt><dd>${comps.length}</dd><dd class="stat-sub">native HTML, zero JavaScript</dd></div>
      <div><dt>Whole file, brotli</dt><dd>${STATE.brotli}</dd><dd class="stat-sub">${STATE.gzip} gzip, cached once</dd></div>
      <div><dt>Build steps</dt><dd>0</dd><dd class="stat-sub">link it and write HTML</dd></div>
    </dl>`, 'band-stats')}

${band('editor', 'LIVE EDITOR', `
    ${head('editor', 'Live editor', 'Type a class, see it render', 'The editor is plain HTML with Monsoon classes. The preview loads the same stylesheet you would link in production and updates on every keystroke.', 'no-build')}
    ${liveEditor()}`)}

${band('responsive', 'RESPONSIVE', `
    ${head('responsive', 'Responsive design', 'Drag the edge, watch the prefixes switch', 'Mobile first breakpoints for the viewport, container queries for components. Drag the handle or pick a preset: the prefixes that apply at the current width light up in the code.', 'responsive')}
    ${responsiveDemo()}`)}

${band('how', 'HOW IT WORKS', `
    ${head('how', 'How it works', 'Every class is already in the file', 'Nothing scans your markup at build time. Type a class and see the rule it maps to in the stylesheet you linked; switch to the terminal for the optional purge step.', 'cdn')}
    ${howItWorks(purge)}`)}

${band('features', 'FEATURES', `
    ${head('features', 'Everything in one file', 'Modern CSS, already written for you', 'Each card is a live demo built with the classes it describes.', '')}
    ${bento()}`)}

${band('seed', 'SEED THEMING', `
    ${head('seed', 'Theming with one color', 'Pick a seed, get a whole theme', 'Buttons, cards, charts and tables re-theme live in light and dark mode. Contrast ratios are measured from what your browser actually paints.', 'seed-theme')}
    ${seedSection()}`)}

${band('dark', 'DARK MODE', `
    <div class="split-sec">
      <div>
        ${head('dark', 'Dark mode', 'Flip one element tree', 'Monsoon follows the operating system by default. Add <code>class="dark"</code> or <code>class="light"</code> to the root or to any section and every semantic color inside follows: backgrounds, text, borders and the focus ring.', 'dark-mode')}
        ${code(`<html data-theme="dark">

<!-- or one section only -->
<section class="dark">
  <div class="bg-surface text-foreground">Always dark</div>
</section>`, 'html', 'dark.html')}
      </div>
      ${darkTree()}
    </div>`)}

${band('why', 'WHY MONSOON', `
    ${head('why', 'Why Monsoon', `${why.length} things Monsoon does differently`, 'No build in production, arbitrary values without one, a theme from one color, tested contrast and native components. Every reason has a live demo.', '')}
    ${whyGrid(why)}
    <p class="center-cta"><a href="${u('why.html')}" class="cta-secondary">See all ${why.length} with live demos ${I.arrowRight}</a></p>
    <div class="purge-anim">
      ${terminal('npx monsooncss purge "src/**/*.{html,jsx,vue}" -o public/monsoon.css', 'bash', purge.lines.join('\n'))}
    </div>`)}

${band('components', 'COMPONENTS', `
    ${head('components', `${comps.length} components`, 'Real components, zero JavaScript', 'Forms, actions, navigation, overlays and data display. Every one is a class on native HTML, follows the seed and both schemes, and gives way to utilities.', 'native-components')}
    <div class="teaser-grid">
      ${teaser.map((c) => `<div class="teaser"><div class="thumb" aria-hidden="true"><div class="thumb-in" inert v-pre>${thumbHtml(c.html)}</div></div><a href="${u(`components/${c.slug}.html`)}" class="teaser-name stretched">${esc(c.name)}</a></div>`).join('\n      ')}
    </div>
    <p class="center-cta"><a href="${u('components.html')}" class="cta-secondary">Browse all ${comps.length} components ${I.arrowRight}</a></p>`)}

${band('showcase', 'IN THE WILD', `
    ${head('showcase', 'Showcase', 'Whole pages, only Monsoon', 'Full templates built with the stylesheet and nothing else. Open one, resize it, switch your theme, then read the source.', 'grid-layout')}
    <div class="show-grid">
    ${showcaseCards(showcase.slice(0, 6))}
    </div>
    <p class="center-cta"><a href="${u('showcase.html')}" class="cta-secondary">See all ${showcase.length} templates ${I.arrowRight}</a></p>`)}

${band('utilities', 'REFERENCE', `
    ${head('utilities', 'Utilities', `${fmt(BASE_COUNT)} classes, every one documented`, 'Each category has a page with every class, the exact CSS it writes, its variants and a live example.', '')}
    <div class="cat-grid">
      ${Object.entries(INDEX.classes.reduce((m, c) => ((m[c.category] = (m[c.category] || 0) + 1), m), {}))
        .map(([c, n]) => `<a href="${u(`utilities/${c}.html`)}" class="cat-card"><span class="cat-name">${esc((CAT_INFO[c] || [c])[0])}</span><span class="cat-n">${fmt(n)}</span></a>`)
        .join('\n      ')}
      <a href="${u('classes.html')}" class="cat-card cat-all"><span class="cat-name">Search every class</span><span class="cat-n">Class reference ${I.arrowRight}</span></a>
    </div>`)}

${band('guides', 'GUIDES', `
    ${head('guides', 'Guides', 'Learn the ideas behind Monsoon', '', '')}
    <div class="guide-grid">
      ${guides.map((g) => `<a href="${u(`${g.slug}.html`)}" class="guide-card"><span class="related-kicker">${esc(g.kicker)}</span><span class="guide-title">${esc(g.title)}</span><span class="related-desc">${esc(g.blurb)}</span></a>`).join('\n      ')}
    </div>`)}

${band('faq', 'FAQ', `
    <div class="faq-wrap">
      ${head('faq', 'FAQ', 'Questions people ask', '', '')}
      ${faqList(homeFaqs)}
    </div>`)}

${band('', '', `
    <div class="final-cta">
      <img src="${u('assets/mascot.svg')}" width="140" height="140" class="art-light final-mo" alt="" loading="lazy"><img src="${u('assets/mascot-dark.svg')}" width="140" height="140" class="art-dark final-mo" alt="" loading="lazy">
      <h2 class="final-title">Paste one line. Start building.</h2>
      <p class="final-lead">Free and open source under the MIT license.</p>
      <div class="final-code">${code(`<link rel="stylesheet" href="${CDN}">`, 'html', 'index.html')}</div>
      <div class="hero-cta is-center"><a href="${u('docs/introduction.html')}" class="cta-primary">Read the docs ${I.arrowRight}</a><a href="${REPO}" class="cta-secondary">${I.github} Star on GitHub</a></div>
    </div>`, 'band-final')}`;

  const jsonld = [
    {
      '@type': 'SoftwareApplication',
      name: 'Monsoon',
      alternateName: 'monsooncss',
      description: 'Utility-first CSS framework with no build step: one stylesheet from a CDN, a full theme from one seed color with OKLCH relative colors, automatic dark mode, container query utilities and native components with no JavaScript.',
      applicationCategory: 'DeveloperApplication',
      applicationSubCategory: 'CSS framework',
      operatingSystem: 'Any',
      softwareVersion: VERSION,
      url: SITE,
      downloadUrl: NPM,
      codeRepository: REPO,
      license: 'https://opensource.org/licenses/MIT',
      isAccessibleForFree: true,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      author: { '@type': 'Person', name: 'Alexandre Kohler', url: 'https://github.com/kwy404' },
      image: `${SITE}assets/og.png`,
      keywords: 'utility-first css without a build step, css framework from a cdn, no build css framework, css components without javascript, generate a theme from one color css, dark mode css, container queries utility classes, oklch color palette css, accessible color contrast css',
    },
    { '@type': 'WebSite', name: 'Monsoon', url: SITE, potentialAction: { '@type': 'SearchAction', target: `${SITE}classes.html?q={search_term_string}`, 'query-input': 'required name=search_term_string' } },
    faqLd(homeFaqs),
    breadcrumbLd([['Monsoon', 'index.html']]),
  ];

  return page({
    path: 'index.html',
    layout: 'landing',
    title: 'Monsoon: utility-first CSS without a build step, from a CDN',
    description: `Monsoon is a no build CSS framework: one stylesheet from a CDN, ${fmt(BASE_COUNT)} utility classes, ${comps.length} components with no JavaScript, a whole theme from one --seed color and automatic dark mode.`,
    body,
    jsonld,
  });
}
