// The page builder: drag Monsoon blocks onto a live page, reorder them, theme
// them and copy the HTML. Dragging uses Voodoo's v-draggable, v-droppable and
// v-sortable, which also work with touch and the keyboard; every action has a
// plain button too.
import { page, esc, I, breadcrumbLd, SITE, VERSION, exPicker } from '../lib.mjs';
import { frameDoc } from './components.mjs';
import { builderBlocks, builderStarter } from '../content/builder-blocks.mjs';

const grip = '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" fill="currentColor"><circle cx="9" cy="6" r="1.6"/><circle cx="15" cy="6" r="1.6"/><circle cx="9" cy="12" r="1.6"/><circle cx="15" cy="12" r="1.6"/><circle cx="9" cy="18" r="1.6"/><circle cx="15" cy="18" r="1.6"/></svg>';
const svg = (d) => `<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
const up = svg('<path d="m6 15 6-6 6 6"/>');
const down = svg('<path d="m6 9 6 6 6-6"/>');
const trash = svg('<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>');
const plus = svg('<path d="M12 5v14M5 12h14"/>');

export function builderPage() {
  const crumbs = [['Monsoon', 'index.html'], ['Page builder', 'builder.html']];
  const groups = [...new Set(builderBlocks.map((b) => b.group))];
  const palette = groups
    .map(
      (g) => `<li class="bl-group"><span class="bl-group-name">${esc(g)}</span>
        <ul class="bl-picks">${builderBlocks
          .filter((b) => b.group === g)
          .map(
            (b) => `<li class="bl-pick" v-draggable v-draggable-data="'${b.key}'" data-key="${b.key}" aria-label="${esc(b.label)}, drag onto the page">
            <span class="bl-pick-text"><span class="bl-pick-name">${esc(b.label)}</span><span class="bl-pick-desc">${esc(b.desc)}</span></span>
            <button type="button" class="bl-add" @click.stop="blAdd('${b.key}')" aria-label="Add ${esc(b.label)} at the end of the page" title="Add at the end">${plus}</button>
          </li>`,
          )
          .join('')}</ul></li>`,
    )
    .join('');
  const body = `
<section class="pg bl" v-data="{ mode: '' }">
  <div class="pg-bar">
    <h1 class="pg-title">Page builder</h1>
    <p class="bl-lead">Drag blocks onto the page, reorder them, then copy the HTML.</p>
    <div class="bl-bar-tools">
      <div class="seg" role="group" aria-label="Preview width">
        ${[[0, 'Full'], [768, '768'], [375, '375']].map(([w, l]) => `<button type="button" @click="pvSet('bl', ${w})" :aria-pressed="(PV.bl || 0) === ${w} ? 'true' : 'false'" aria-pressed="${w === 0}">${l}</button>`).join('')}
      </div>
      <div class="seg" role="group" aria-label="Preview color scheme">
        <button type="button" @click="mode = ''" :aria-pressed="mode === '' ? 'true' : 'false'" aria-pressed="true">Auto</button>
        <button type="button" @click="mode = 'light'" :aria-pressed="mode === 'light' ? 'true' : 'false'" aria-pressed="false" aria-label="Light preview">${I.sun}</button>
        <button type="button" @click="mode = 'dark'" :aria-pressed="mode === 'dark' ? 'true' : 'false'" aria-pressed="false" aria-label="Dark preview">${I.moon}</button>
      </div>
      ${exPicker('bl-theme')}
      <button type="button" class="pv-copy" @click="blCopy($el)" :disabled="!B.list.length"><span class="ic-swap">${I.copy}${I.check}</span><span>Copy HTML</span></button>
      <button type="button" class="btn-mini btn-mini-ghost" @click="blToPlayground()" :disabled="!B.list.length">${I.external}<span>Open in playground</span></button>
    </div>
  </div>
  <div class="bl-grid">
    <aside class="bl-side" aria-labelledby="bl-blocks-h">
      <h2 id="bl-blocks-h" class="bl-h">Blocks <span class="bl-count">${builderBlocks.length}</span></h2>
      <ul class="bl-palette">${palette}</ul>
    </aside>
    <div class="bl-main">
      <div class="pv-resize bl-canvas" data-pv="bl" :style="{ width: PV.bl ? PV.bl + 'px' : '' }" v-droppable="blDrop($detail)" v-droppable-accept=".bl-pick" aria-label="Page canvas">
        <iframe class="live-frame bl-frame" title="Page preview" srcdoc="${esc(frameDoc('', { js: true, pad: 0 }))}" :data-fx="blRender($el, B.list.map((x) => x.id + x.key).join(), mode, T.mode, T.dark)"></iframe>
        <div class="bl-line" aria-hidden="true"></div>
        <div class="bl-empty" v-show="!B.list.length" hidden :hidden="B.list.length > 0">
          <div class="bl-empty-art" aria-hidden="true"><span></span><span></span><span></span></div>
          <p class="bl-empty-title">Drag a block here</p>
          <p class="bl-empty-text">Or press the plus button next to any block. Not sure where to begin?</p>
          <button type="button" class="cta-primary bl-start" @click="blStarter()">Start with a landing page</button>
        </div>
        <div class="pv-handle" role="slider" tabindex="0" aria-label="Preview width in pixels" aria-valuemin="320" aria-valuemax="1600" data-handle="bl"><span></span></div>
      </div>
    </div>
    <aside class="bl-side" aria-labelledby="bl-layers-h">
      <h2 id="bl-layers-h" class="bl-h">On the page <span class="bl-count" v-text="B.list.length">0</span></h2>
      <ol class="bl-layers" v-sortable v-sortable-handle=".bl-grip" @voodoo:sorted="blSorted($detail.order)" aria-label="Blocks on the page">
        <li v-for="(it, i) in B.list" :key="it.id" :data-id="it.id" class="bl-layer" :class="{ 'is-new': it.id === B.fresh }">
          <span class="bl-grip" title="Drag to reorder">${grip}</span>
          <span class="bl-layer-name" v-text="blName(it.key)"></span>
          <button type="button" class="bl-ic" @click="blMove(i, -1)" :disabled="i === 0" :aria-label="'Move ' + blName(it.key) + ' up'">${up}</button>
          <button type="button" class="bl-ic" @click="blMove(i, 1)" :disabled="i === B.list.length - 1" :aria-label="'Move ' + blName(it.key) + ' down'">${down}</button>
          <button type="button" class="bl-ic bl-ic-del" @click="blRemove(i)" :aria-label="'Remove ' + blName(it.key)">${trash}</button>
        </li>
      </ol>
      <p class="bl-none" v-show="!B.list.length">No blocks yet. The page you build is saved in this browser.</p>
      <div class="bl-side-foot">
        <button type="button" class="link-btn" v-show="B.list.length" @click="blClear()">Clear the page</button>
        <button type="button" class="link-btn" v-show="!B.list.length && B.undo.length" @click="blUndo()">Undo clear</button>
      </div>
    </aside>
  </div>
  <p class="bl-foot">Every block is plain HTML with Monsoon ${VERSION} classes. The copied page links the stylesheet from the CDN and keeps your theme as <code>--seed</code>.</p>
</section>
<script type="application/json" id="builder-data">${JSON.stringify({ blocks: builderBlocks.map(({ key, label, html }) => ({ key, label, html })), starter: builderStarter, version: VERSION }).replace(/</g, '\\u003c')}</script>`;
  return page({
    path: 'builder.html',
    layout: 'landing',
    title: 'Page builder: drag blocks into a page with Monsoon CSS',
    description: `Build a landing page by dragging ${builderBlocks.length} ready blocks: navigation, hero, features, pricing, FAQ, call to action and footer. Theme it with one seed color and copy plain HTML with Monsoon classes.`,
    jsonld: [{ '@type': 'WebApplication', name: 'Monsoon page builder', url: `${SITE}builder.html`, applicationCategory: 'DeveloperApplication', operatingSystem: 'Any' }, breadcrumbLd(crumbs)],
    body,
  });
}
