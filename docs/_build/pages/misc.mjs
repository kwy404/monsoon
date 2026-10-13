// Showcase index, playground and the 404 page.
import { page, esc, u, I, windowBar, fileIcon, breadcrumbs, breadcrumbLd, SITE, VERSION, STATE } from '../lib.mjs';
import { showcaseCards, SEEDS } from './home.mjs';
import { frameDoc } from './components.mjs';
import { presets } from '../presets.mjs';

export function showcasePage(showcase) {
  const crumbs = [['Monsoon', 'index.html'], ['Showcase', 'showcase.html']];
  const body = `
<section class="band band-hero-sm">
  <div class="frame">
    <div class="page-hero">
      ${breadcrumbs(crumbs)}
      <p class="kicker">Showcase</p>
      <h1 class="page-title">Whole pages, built only with Monsoon</h1>
      <p class="page-lead">${showcase.filter((s) => s.app).length ? `${showcase.filter((s) => s.app).length} working apps and ` : ''}${showcase.filter((s) => !s.app).length} complete templates: a product landing, a dashboard, an article, pricing, a product page, a portfolio and auth screens. Each one is plain HTML styled with the Monsoon stylesheet. Open them, resize the window, switch the theme, then read the source.</p>
    </div>
  </div>
</section>
<section class="band">
  <div class="frame">
    <div class="show-grid show-grid-lg">
    ${showcaseCards(showcase)}
    </div>
  </div>
</section>`;
  return page({
    path: 'showcase.html',
    layout: 'landing',
    title: 'Showcase: full page templates built with Monsoon CSS',
    description: `${showcase.length} full page templates built only with Monsoon utility classes and components: SaaS landing, dashboard, blog article, pricing, product page, portfolio and auth screens.`,
    jsonld: [{ '@type': 'CollectionPage', name: 'Monsoon showcase', url: `${SITE}showcase.html`, hasPart: showcase.map((s) => ({ '@type': 'WebPage', name: s.title, url: `${SITE}showcase/${s.slug}.html` })) }, breadcrumbLd(crumbs)],
    body,
  });
}

export function playgroundPage() {
  const crumbs = [['Monsoon', 'index.html'], ['Playground', 'playground.html']];
  const tabs = presets
    .map((p, i) => `<option value="${i}">${esc(p.label)}</option>`)
    .join('');
  const body = `
<section class="pg" v-data="{ code: pgStart(), mode: '', seed: '#3b5bdb', p: '' }">
  <div class="pg-bar">
    <h1 class="pg-title">Playground</h1>
    <label class="sr-only" for="pg-preset">Start from an example</label>
    <select id="pg-preset" class="ref-select" v-model="p" @change="code = presets[p].code">
      <option value="" disabled selected>Load an example</option>${tabs}
    </select>
    <div class="seg" role="group" aria-label="Preview width">
      ${[[0, 'Full'], [1024, '1024'], [768, '768'], [375, '375']].map(([w, l]) => `<button type="button" @click="pvSet('pg', ${w})" :aria-pressed="(PV.pg || 0) === ${w} ? 'true' : 'false'" aria-pressed="${w === 0}">${l}</button>`).join('')}
    </div>
    <div class="seg" role="group" aria-label="Preview color scheme">
      <button type="button" @click="mode = ''" :aria-pressed="mode === '' ? 'true' : 'false'" aria-pressed="true">Auto</button>
      <button type="button" @click="mode = 'light'" :aria-pressed="mode === 'light' ? 'true' : 'false'" aria-pressed="false">Light</button>
      <button type="button" @click="mode = 'dark'" :aria-pressed="mode === 'dark' ? 'true' : 'false'" aria-pressed="false">Dark</button>
    </div>
    <label class="pg-seed"><span>--seed</span><input type="color" class="swatch-input" value="#3b5bdb" v-model="seed" aria-label="Preview seed color"></label>
    <button type="button" class="btn-mini" @click="shareCode(code)">${I.external}<span>Copy share link</span></button>
  </div>
  <div class="pg-grid">
    <div class="window pg-ed">
      ${windowBar(`<span class="ed-tab active">${fileIcon('index.html')}<span>index.html</span></span><span class="panel-shell">Monsoon ${VERSION}</span>`)}
      <div class="ed" data-editor>
        <pre class="ed-hl" aria-hidden="true" v-html="hl(code)"></pre>
        <label for="pg-code" class="sr-only">HTML with Monsoon classes</label>
        <textarea id="pg-code" class="ed-ta" spellcheck="false" autocomplete="off" autocapitalize="off" v-model="code"></textarea>
      </div>
      <div class="ed-status"><span>HTML</span><span v-text="lineCount(code) + ' lines'"></span><span class="ml-auto">Saved in this browser</span></div>
    </div>
    <div class="pg-out">
      <div class="pv-resize pg-frame" data-pv="pg" :style="{ width: PV.pg ? PV.pg + 'px' : '' }">
        <iframe class="live-frame" title="Playground preview" srcdoc="${esc(frameDoc('', { js: true }))}" :data-fx="renderFrame($el, code, mode, T.mode, seed)"></iframe>
        <div class="pv-handle" role="slider" tabindex="0" aria-label="Preview width in pixels" aria-valuemin="280" aria-valuemax="1600" data-handle="pg"><span></span></div>
      </div>
      <p class="pg-size"><span v-text="PV.pg ? PV.pg + 'px' : 'Full width'"></span></p>
    </div>
  </div>
</section>
<script type="application/json" id="presets-data">${JSON.stringify(presets).replace(/</g, '\\u003c')}</script>`;
  return page({
    path: 'playground.html',
    layout: 'landing',
    title: 'Monsoon playground: try utility classes live in the browser',
    description: 'Write HTML with Monsoon utility classes and components and see it render live, in light and dark mode, at any width and with any seed color. Share a link to your snippet.',
    jsonld: [{ '@type': 'WebApplication', name: 'Monsoon playground', url: `${SITE}playground.html`, applicationCategory: 'DeveloperApplication', operatingSystem: 'Any' }, breadcrumbLd(crumbs)],
    body,
  });
}

export function notFound() {
  const links = [
    ['Home', 'index.html'],
    ['Docs', 'docs/introduction.html'],
    ['Components', 'components.html'],
    ['Class reference', 'classes.html'],
  ];
  const body = `
<section class="band band-hero-sm">
  <div class="frame">
    <div class="nf">
      <img src="${u('assets/mascot.svg')}" width="452" height="452" alt="Mo the red panda with an umbrella, looking for the page you asked for" class="nf-mo art-light">
      <img src="${u('assets/mascot-dark.svg')}" width="452" height="452" alt="" class="nf-mo art-dark">
      <p class="kicker">Error 404</p>
      <h1 class="page-title">This page blew away</h1>
      <p class="page-lead">The address may be mistyped, or the page moved. Search for it with <kbd>Ctrl</kbd> <kbd>K</kbd>, or land somewhere good.</p>
      <div class="hero-cta is-center">
        <button type="button" class="cta-primary" v-data @click="openSearch()">${I.search} Search the docs</button>
        ${links.map(([t, h]) => `<a href="${u(h)}" class="cta-secondary">${t}</a>`).join('\n        ')}
      </div>
    </div>
  </div>
</section>`;
  // GitHub Pages serves 404.html for any missing path, possibly in a subfolder,
  // so links and assets resolve against the site root.
  return page({ path: '404.html', layout: 'landing', title: 'Page not found | Monsoon', description: 'This page does not exist. Find the Monsoon docs, components and class reference from here.', body, noindex: true }).replace(
    '<meta charset="utf-8">',
    '<meta charset="utf-8">\n<base href="/monsoon/">',
  );
}
