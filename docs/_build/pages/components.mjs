// Component pages generated from the src/components/*.json manifests, plus
// the searchable components index with live thumbnails.
import { page, docsShell, esc, u, I, code, pre, copyButton, windowBar, fileIcon, breadcrumbLd, SITE, STATE, fmt, uid } from '../lib.mjs';

const TONES = { primary: 'the primary color', secondary: 'the quiet secondary tint', accent: 'the accent color (seed hue rotated)', neutral: 'a neutral, near foreground fill', success: 'the success color', warning: 'the warning color', danger: 'the danger color', info: 'the info color' };
const SIZES = { xs: 'extra small', sm: 'small', md: 'medium, the default', lg: 'large', xl: 'extra large', '2xl': 'double extra large' };

// Plain words for the properties a rule sets. Only facts read from the CSS.
const PROP_WORDS = [
  [/^position$/, (v) => (v === 'relative' ? '' : `${v} position`)],
  [/^display$/, (v) => (v === 'none' ? 'hidden by default' : `${v} display`)],
  [/^(inset|top|right|bottom|left|inset-inline.*|inset-block.*)$/, () => 'offsets'],
  [/^z-index$/, () => 'stacking order'],
  [/^(background|background-color|background-image)$/, () => 'background'],
  [/^color$/, () => 'text color'],
  [/^(padding|padding-.*)$/, () => 'padding'],
  [/^(margin|margin-.*)$/, () => 'margin'],
  [/radius/, () => 'corner radius'],
  [/^(border|border-(?!.*radius).*|outline.*)$/, () => 'border'],
  [/^box-shadow$/, () => 'shadow'],
  [/^(width|min-width|max-width|inline-size|min-inline-size|max-inline-size)$/, () => 'width'],
  [/^(height|min-height|max-height|block-size|min-block-size|max-block-size)$/, () => 'height'],
  [/^(font-size|font)$/, () => 'text size'],
  [/^font-weight$/, () => 'font weight'],
  [/^(line-height|letter-spacing|text-.*|white-space)$/, () => 'text style'],
  [/^(gap|row-gap|column-gap)$/, () => 'gap'],
  [/^(grid-.*|grid)$/, () => 'grid tracks'],
  [/^(flex.*|align-.*|justify-.*|place-.*)$/, () => 'alignment'],
  [/^(transform|translate|scale|rotate)$/, () => 'transform'],
  [/^transition.*/, () => 'transition'],
  [/^animation.*/, () => 'animation'],
  [/^opacity$/, () => 'opacity'],
  [/^overflow.*/, () => 'overflow'],
  [/^cursor$/, (v) => `${v} cursor`],
  [/^(appearance|accent-color|caret-color)$/, () => 'native control styling'],
  [/^(fill|stroke)$/, () => 'icon color'],
  [/^(content)$/, () => 'generated content'],
];

function phrasesFor(decls) {
  const vars = [];
  const words = [];
  for (const [p, v] of decls) {
    if (p.startsWith('--')) {
      vars.push(p);
      continue;
    }
    for (const [re, fn] of PROP_WORDS) {
      if (re.test(p)) {
        const w = fn(String(v).trim());
        if (w && !words.includes(w)) words.push(w);
        break;
      }
    }
  }
  return { vars, words };
}

const listText = (a) => (a.length < 2 ? a.join('') : `${a.slice(0, -1).join(', ')} and ${a[a.length - 1]}`);

/**
 * What a class does, described only from facts: the CSS rules where it is the
 * subject, and the element it sits on in the manifest example.
 */
export function describeClass(cls, comp, base) {
  const rules = STATE.compCss.get(cls) || [];
  const lead = rules.filter((r) => r.lead);
  const decls = lead.flatMap((r) => r.decls || []);
  const { vars, words } = phrasesFor(decls);
  const tagMatch = new RegExp(`<([a-z0-9-]+)[^>]*\\sclass="(?:[^"]*\\s)?${cls.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}(?:\\s[^"]*)?"`).exec(comp.html);
  const tag = tagMatch ? tagMatch[1] : '';
  const shares = [...comp.html.matchAll(/class="([^"]*)"/g)].some((m) => {
    const list = m[1].split(/\s+/);
    return list.includes(cls) && list.some((c) => c !== cls && comp.classes.includes(c));
  });
  const suffix = cls.startsWith(`${base}-`) ? cls.slice(base.length + 1) : '';
  let role = cls === base ? 'Base' : shares ? 'Modifier' : 'Part';
  if (role !== 'Base' && (shares || !tag) && TONES[suffix] && vars.length) role = 'Tone';
  else if (role !== 'Base' && (shares || !tag) && SIZES[suffix]) role = 'Size';
  else if (role === 'Part' && !tag && rules.some((r) => r.text.split('{')[0].includes(`.${base}`))) role = 'Modifier';
  const where = tag ? `On ${/^[aeiou]/.test(tag) ? 'an' : 'a'} <${tag}> in the example. ` : 'Not used in the example above. ';
  let what = '';
  if (role === 'Base') what = `Base class of the ${comp.name.toLowerCase()}. `;
  else if (role === 'Tone') what = `${suffix[0].toUpperCase()}${suffix.slice(1)} tone. `;
  else if (role === 'Size') what = `${SIZES[suffix][0].toUpperCase()}${SIZES[suffix].slice(1)} size. `;
  else if (role === 'Modifier') what = `Modifier, combined with the ${base} class. `;
  else what = `Part of the ${comp.name.toLowerCase()}. `;
  let sets = '';
  if (words.length) sets = `Sets ${listText(words.slice(0, 6))}`;
  if (vars.length) sets += `${sets ? ', and ' : 'Sets '}${vars.length > 3 ? `${vars.length} custom properties` : listText(vars.map((v) => `\`${v}\``))}`;
  if (sets) sets += '.';
  else if (rules.length) {
    const sel = rules[0].text.split('{')[0].trim().split(',')[0].trim();
    sets = `A hook for state rules such as \`${sel.length > 70 ? `${sel.slice(0, 70)}...` : sel}\`.`;
  }
  return [role, `${what}${where}${sets}`.trim()];
}

export function baseClass(comp) {
  const list = comp.classes;
  const exact = list.find((c) => c === comp.slug);
  if (exact) return exact;
  let best = list[0];
  let score = -1;
  for (const c of list) {
    const n = list.filter((x) => x === c || x.startsWith(`${c}-`)).length;
    if (n > score || (n === score && c.length < best.length)) {
      best = c;
      score = n;
    }
  }
  return best;
}

export function a11yNotes(comp) {
  const h = comp.html;
  const notes = [];
  if (/<dialog/.test(h)) notes.push('Built on the native `dialog` element. Opened with `showModal()` (or a command button) it goes to the top layer, makes the rest of the page inert, closes with Escape and returns focus to the button that opened it.');
  if (/\spopover[\s=>]/.test(h)) notes.push('Uses the `popover` attribute: the browser handles light dismiss, Escape and top layer stacking, and `popovertarget` wires the trigger without JavaScript.');
  if (/<details/.test(h)) notes.push('Built on `details` and `summary`, so it opens with Enter or Space and screen readers announce expanded and collapsed. A shared `name` makes a group exclusive.');
  if (/<(input|select|textarea)/.test(h)) notes.push('Give every control a visible `label` linked with `for`, or an `aria-label` when the purpose is obvious from context. Link help and error text with `aria-describedby`; invalid styles use `:user-invalid`, so they appear only after the user interacts.');
  if (/type="checkbox"|type="radio"/.test(h)) notes.push('Checkboxes and radios stay real inputs, so they keep native keyboard behavior (Space toggles, arrow keys move within a radio group) and form submission.');
  if (/<button/.test(h)) notes.push('Use `button` for actions and `a` for navigation. Icon only buttons need an `aria-label`; decorative icons carry `aria-hidden="true"`.');
  if (/role="(tablist|tab|tabpanel)"/.test(h)) notes.push('Tabs follow the tabs pattern: `role="tablist"`, `role="tab"` with `aria-selected`, and `role="tabpanel"`.');
  if (/<nav/.test(h)) notes.push('Wrap navigation in `nav` with an `aria-label` when there is more than one on the page, and mark the current link with `aria-current="page"`.');
  if (/<progress|<meter/.test(h)) notes.push('Uses the native `progress` or `meter` element, which exposes its value to assistive technology. Add a visible label or `aria-label`.');
  if (/role="(alert|status)"|aria-live/.test(h)) notes.push('Announces itself with `role="status"` (polite) or `role="alert"` (assertive). Use alert only for messages that need immediate attention.');
  if (/spinner|skeleton|loading|animate/.test(h + comp.slug)) notes.push('Animations stop under `prefers-reduced-motion: reduce`. Mark busy regions with `aria-busy="true"` and give spinners an accessible name.');
  if (/<img|avatar/.test(h + comp.slug)) notes.push('Give meaningful images an `alt` text and decorative ones `alt=""`. Initials avatars should expose the full name to screen readers.');
  if (/<table/.test(h)) notes.push('Keep real table markup with `th scope` headers and a `caption` (visually hidden if needed) so screen readers can navigate by row and column.');
  if (/tooltip/.test(comp.slug)) notes.push('Tooltips appear on hover and on keyboard focus. Keep essential information out of tooltips, since touch users may never see them.');
  if (/kbd/.test(comp.slug)) notes.push('Use the `kbd` element for keys so the meaning survives without styles.');
  notes.push('Every interactive part shows a visible focus ring with `:focus-visible`, and tone colors pair with `-foreground` tokens that keep text at 4.5:1 or better in light and dark mode.');
  return [...new Set(notes)];
}

function relatedFor(comp, all) {
  const words = new Set(comp.slug.split('-'));
  const ia = all.indexOf(comp);
  return all
    .filter((c) => c.slug !== comp.slug)
    .map((c) => {
      let s = 0;
      for (const w of c.slug.split('-')) if (words.has(w)) s += 3;
      if (c.group === comp.group) s += 1;
      if (Math.abs(ia - all.indexOf(c)) <= 2 && c.group === comp.group) s += 1;
      return [s, c];
    })
    .filter(([s]) => s > 0)
    .sort((a, b) => b[0] - a[0])
    .slice(0, 4)
    .map(([, c]) => c);
}

/** Strips ids and wiring attributes so several copies can live on one page. */
export const thumbHtml = (html) =>
  html.replace(/\s(id|for|href|aria-labelledby|aria-describedby|aria-controls|popovertarget|commandfor|name|autofocus)(="[^"]*")?(?=[\s>/])/g, '').replace(/<dialog([^>]*)\sopen/g, '<dialog$1');

/** True when an example needs the optional interactive layer. */
export const needsJs = (comp) => Boolean(comp.needsJs) || /\sdata-m-[a-z]/.test(comp.html || '');

export function frameDoc(html, { pad = 24, js = false } = {}) {
  const script = js && STATE.hasJs ? `<script src="${u('monsoon.js')}" defer></script>` : '';
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="stylesheet" href="${u('monsoon.min.css')}">${script}<style>html,body{min-height:0!important;height:auto!important}body{padding:${pad}px}</style></head><body class="antialiased bg-background text-foreground">${html}</body></html>`;
}

/** A preview with Preview and Code tabs, light or dark, and a draggable width. */
export function previewBlock(html, { title, id = uid('pv'), source = html, lang = 'html', fileName = 'example.html', minHeight = 160, playground = true, js = false } = {}) {
  const { id: codeId, html: codeHtml } = pre(source, lang, { labelText: `${title} code` });
  return `<div class="pv" id="${id}" v-data="{ view: 'preview', mode: '' }">
  <div class="pv-bar">
    <div class="seg" role="tablist" aria-label="${esc(title)} example">
      <button type="button" role="tab" id="${id}-tp" aria-controls="${id}-pp" aria-selected="true" :aria-selected="view === 'preview' ? 'true' : 'false'" @click="view = 'preview'">${I.eye}<span>Preview</span></button>
      <button type="button" role="tab" id="${id}-tc" aria-controls="${id}-pc" aria-selected="false" :aria-selected="view === 'code' ? 'true' : 'false'" @click="view = 'code'">${I.code}<span>Code</span></button>
    </div>
    <div class="pv-tools" v-show="view === 'preview'">
      <div class="seg seg-icons" role="group" aria-label="Preview width">
        <button type="button" @click="pvSet('${id}', 0)" :aria-pressed="PV['${id}'] ? 'false' : 'true'" aria-pressed="true" aria-label="Full width" title="Full width">${I.monitor}</button>
        <button type="button" @click="pvSet('${id}', 768)" :aria-pressed="PV['${id}'] === 768 ? 'true' : 'false'" aria-pressed="false" aria-label="Tablet width, 768 pixels" title="768px">${I.tablet}</button>
        <button type="button" @click="pvSet('${id}', 375)" :aria-pressed="PV['${id}'] === 375 ? 'true' : 'false'" aria-pressed="false" aria-label="Phone width, 375 pixels" title="375px">${I.phone}</button>
      </div>
      <span class="pv-size" v-text="pvLabel('${id}')" aria-live="polite">Full</span>
      <div class="seg" role="group" aria-label="Preview color scheme">
        <button type="button" @click="mode = ''" :aria-pressed="mode === '' ? 'true' : 'false'" aria-pressed="true" title="Follow the site theme">Auto</button>
        <button type="button" @click="mode = 'light'" :aria-pressed="mode === 'light' ? 'true' : 'false'" aria-pressed="false" aria-label="Light preview" title="Light">${I.sun}</button>
        <button type="button" @click="mode = 'dark'" :aria-pressed="mode === 'dark' ? 'true' : 'false'" aria-pressed="false" aria-label="Dark preview" title="Dark">${I.moon}</button>
      </div>
      ${playground ? `<button type="button" class="pv-open" @click="toPlayground('${id}')" title="Open in the playground" aria-label="Open this example in the playground">${I.external}</button>` : ''}
    </div>
  </div>
  <div class="pv-stage" id="${id}-pp" role="tabpanel" aria-labelledby="${id}-tp" v-show="view === 'preview'">
    <div class="pv-resize" data-pv="${id}" :style="{ width: PV['${id}'] ? PV['${id}'] + 'px' : '' }">
      <iframe class="pv-frame" title="${esc(title)} preview" style="height:${minHeight}px" data-minh="${minHeight}" srcdoc="${esc(frameDoc(html, { js }))}" data-autoheight :data-fx="frameMode($el, mode, T.mode, T.dark)"></iframe>
      <div class="pv-handle" role="slider" tabindex="0" aria-label="Preview width in pixels" aria-valuemin="280" aria-valuemax="1600" data-handle="${id}"><span></span></div>
    </div>
  </div>
  <div id="${id}-pc" role="tabpanel" aria-labelledby="${id}-tc" hidden :hidden="view !== 'code'">
    <figure class="window pv-code">${windowBar(`<span class="ed-tab active">${fileIcon(fileName)}<span>${esc(fileName)}</span></span>${copyButton(codeId, `${title} code`)}`)}${codeHtml}</figure>
  </div>
  <script type="text/plain" class="pv-src">${source.replace(/<\/script/gi, '<\\/script')}</script>
</div>`;
}

const inline = (s) => esc(String(s)).replace(/`([^`]+)`/g, '<code>$1</code>');

/** Renders a manifest api field: a string, a list, or an object of lists (attributes, options, methods, events). */
function apiSection(comp) {
  const api = comp.api;
  if (!api) return '';
  const item = (x) => {
    if (typeof x === 'string') return [x, ''];
    if (Array.isArray(x)) return [x[0], x[1] || ''];
    return [x.name || x.attribute || x.event || x.method || x.option || '', x.description || x.desc || x.detail || x.type || ''];
  };
  const table = (list, head) =>
    `<div class="tbl-wrap"><table class="doc-table"><thead><tr><th scope="col">${head}</th><th scope="col">Description</th></tr></thead><tbody>${list
      .map((x) => {
        const [n, d] = item(x);
        return `<tr><td class="cls-name"><code>${esc(n)}</code></td><td>${inline(d)}</td></tr>`;
      })
      .join('')}</tbody></table></div>`;
  if (typeof api === 'string') return `<p>${inline(api)}</p>`;
  if (Array.isArray(api)) return table(api, 'Name');
  return Object.entries(api)
    .map(([key, val]) => {
      const title = key.charAt(0).toUpperCase() + key.slice(1);
      if (typeof val === 'string') return `<div class="api-block"><p class="api-title">${esc(title)}</p><p>${inline(val)}</p></div>`;
      if (Array.isArray(val)) return `<div class="api-block"><p class="api-title">${esc(title)}</p>${table(val, title.replace(/s$/, ''))}</div>`;
      if (val && typeof val === 'object') return `<div class="api-block"><p class="api-title">${esc(title)}</p>${table(Object.entries(val).map(([n, d]) => [n, typeof d === 'string' ? d : JSON.stringify(d)]), title.replace(/s$/, ''))}</div>`;
      return '';
    })
    .join('\n');
}

const OVERLAY = /<dialog|\spopover|drawer|sheet|lightbox|command-palette|toast|modal|dropdown|context-menu|tooltip|mega-menu|back-to-top|fab/;

export function componentPage(comp, all) {
  const base = baseClass(comp);
  const cssMap = STATE.compCss;
  const rows = comp.classes
    .map((cls) => {
      const [role, desc] = describeClass(cls, comp, base);
      const rules = [...(cssMap.get(cls) || [])].sort((a, b) => b.lead - a.lead || a.len - b.len).slice(0, 2);
      const css = rules.map((r) => r.text).join('\n\n');
      return `<tr id="cls-${esc(cls)}">
        <td class="cls-name"><button type="button" class="cls-copy" data-copy-text="${esc(cls)}" title="Copy class name"><code>${esc(cls)}</code></button></td>
        <td><span class="role role-${role.toLowerCase()}">${role}</span></td>
        <td class="cls-desc">${esc(desc).replace(/`([^`]+)`/g, "<code>$1</code>")}${css ? `<details class="cls-css"><summary>CSS</summary><pre class="css-out" v-pre><code>${esc(css.length > 1400 ? `${css.slice(0, 1400)}\n/* ... */` : css)}</code></pre></details>` : ''}</td>
      </tr>`;
    })
    .join('\n      ');
  const notes = a11yNotes(comp);
  const related = relatedFor(comp, all);
  const js = needsJs(comp);
  const api = apiSection(comp);
  const toc = [
    ['example', 'Example', 2],
    ['classes', 'Classes', 2],
    ...(api ? [['api', 'JavaScript API', 2]] : []),
    ['usage', 'Usage', 2],
    ['accessibility', 'Accessibility', 2],
    ['related', 'Related components', 2],
  ];
  const lines = comp.html.split('\n');
  const usage = `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/monsooncss">${js ? '\n<script src="https://cdn.jsdelivr.net/npm/monsooncss/dist/monsoon.js" defer></script>' : ''}

<!-- ${comp.name}: start from the base class, then add modifiers -->
${lines.slice(0, 14).join('\n')}${lines.length > 14 ? '\n<!-- the full example is in the Code tab above -->' : ''}`;
  const h2 = (id, text) => `<h2 id="${id}" class="doc-h2"><a href="#${id}" class="anchor" aria-hidden="true" tabindex="-1">#</a>${text}</h2>`;
  const body = `
${js ? `<div class="note-box note-warn" role="note"><p><strong>Needs monsoon.js.</strong> The styles work on their own, and the behavior comes from the optional interactive layer: add <code>&lt;script src="https://cdn.jsdelivr.net/npm/monsooncss/dist/monsoon.js" defer&gt;&lt;/script&gt;</code> or <code>import 'monsooncss/js'</code>. See <a href="${u('docs/interactive-layer.html')}">the interactive layer</a>.</p></div>` : ''}
<section class="doc-section">
  ${h2('example', 'Example')}
  ${previewBlock(comp.slug === 'skip-link' ? `<p class="text-sm text-muted-foreground">Click inside this preview, then press Tab: the skip link appears at the top.</p>${comp.html}` : comp.html, { source: comp.html, title: comp.name, id: `pv-${comp.slug}`, fileName: `${comp.slug}.html`, minHeight: OVERLAY.test(comp.slug + comp.html) ? 480 : 160, js })}
</section>${api ? `\n<section class="doc-section">\n  ${h2('api', 'JavaScript API')}\n  ${api}\n</section>` : ''}
<section class="doc-section">
  ${h2('classes', 'Classes')}
  <p>${comp.classes.length} classes. Click a name to copy it. Utilities on the same element always win over component defaults, so any of them can be adjusted with plain utility classes.</p>
  <div class="tbl-wrap" v-data><table class="doc-table cls-table">
    <thead><tr><th scope="col">Class</th><th scope="col">Type</th><th scope="col">What it does</th></tr></thead>
    <tbody>
      ${rows}
    </tbody>
  </table></div>
</section>
<section class="doc-section">
  ${h2('usage', 'Usage')}
  <p>${js ? 'The styles ship inside the same stylesheet as the utilities, and the behavior comes from the optional monsoon.js script, which enhances any element with a matching data-m attribute, including markup added later.' : 'Components ship inside the same stylesheet as the utilities. There is nothing else to install and no script to load: link Monsoon and write the markup.'}</p>
  ${code(usage, 'html', 'index.html')}
  <div class="note-box" role="note"><p>Theme it with <code>--seed</code> on any ancestor, for example <code>style="--seed: #0d9488"</code>, and force a scheme with <code>class="dark"</code> or <code>class="light"</code> on a wrapper.</p></div>
</section>
<section class="doc-section">
  ${h2('accessibility', 'Accessibility')}
  <ul class="a11y-list">${notes.map((n) => `<li>${esc(n).replace(/`([^`]+)`/g, '<code>$1</code>')}</li>`).join('')}</ul>
</section>
<section class="doc-section">
  ${h2('related', 'Related components')}
  <div class="related-grid">${related
    .map((r) => `<a href="${u(`components/${r.slug}.html`)}" class="related-card"><span class="related-kicker">${esc(r.groupTitle)}</span><span class="related-title">${esc(r.name)}</span><span class="related-desc">${esc(r.description)}</span></a>`)
    .join('')}</div>
</section>`;
  const crumbs = [['Docs', 'docs/introduction.html'], ['Components', 'components.html'], [comp.groupTitle, `components.html#${comp.group}`], [comp.name, `components/${comp.slug}.html`]];
  const meta = `<p class="doc-meta"><span class="pill">${esc(comp.groupTitle)}</span><span>${comp.classes.length} classes</span>${js ? '<span class="badge-js">Needs monsoon.js</span>' : '<span>No JavaScript</span>'}<span>Light and dark</span></p>`;
  return page({
    path: `components/${comp.slug}.html`,
    title: `${comp.name} component | Monsoon CSS`,
    description: `${comp.description} Monsoon CSS component, ${comp.classes.length} classes, ${js ? "works with the optional monsoon.js layer" : "no JavaScript"}, light and dark mode.`.slice(0, 300),
    jsonld: [
      { '@type': 'TechArticle', headline: `${comp.name} component`, description: comp.description, url: `${SITE}components/${comp.slug}.html`, inLanguage: 'en', about: { '@type': 'SoftwareApplication', name: 'Monsoon', url: SITE } },
      breadcrumbLd(crumbs),
    ],
    body: docsShell({ crumbs, kicker: comp.groupTitle, title: esc(comp.name), lead: esc(comp.description), meta, body, toc, editPath: comp.file ? `src/components/${comp.file}` : '' }),
  });
}

export function componentsIndex(groups) {
  const all = groups.flatMap((g) => g.components);
  const chips = [['all', `All ${all.length}`], ...groups.map((g) => [g.group, `${g.title} ${g.components.length}`])];
  const card = (c) => `<div class="comp-card" v-show="cmatch(q, g, '${c.group}', '${esc(`${c.name} ${c.slug} ${c.description}`.toLowerCase().replace(/'/g, ''))}')">
      ${needsJs(c) ? '<span class="comp-js" title="Needs monsoon.js">JS</span>' : ''}<div class="thumb" aria-hidden="true"><div class="thumb-in" inert v-pre>${thumbHtml(c.html)}</div></div>
      <div class="comp-meta"><a href="${u(`components/${c.slug}.html`)}" class="comp-name stretched">${esc(c.name)}</a><span class="comp-desc">${esc(c.description)}</span><span class="comp-count">${c.classes.length} classes</span></div>
    </div>`;
  const body = `
<div v-data="{ q: '', g: 'all' }">
  <div class="comp-filter">
    <label class="filter-input">${I.search}<span class="sr-only">Filter components</span><input type="search" v-model="q" placeholder="Filter ${all.length} components, for example modal, toggle or badge" autocomplete="off"></label>
    <div class="chips" role="group" aria-label="Group">${chips.map(([k, l], i) => `<button type="button" class="fchip" aria-pressed="${i === 0}" :aria-pressed="g === '${k}' ? 'true' : 'false'" @click="g = '${k}'">${esc(l)}</button>`).join('')}</div>
  </div>
  ${groups
    .map(
      (g) => `<section class="comp-group" v-show="g === 'all' || g === '${g.group}'">
    <h2 id="${g.group}" class="doc-h2">${esc(g.title)} <span class="h-count">${g.components.length}</span></h2>
    <div class="comp-grid">
    ${g.components.map(card).join('\n    ')}
    </div>
  </section>`,
    )
    .join('\n  ')}
</div>`;
  const crumbs = [['Docs', 'docs/introduction.html'], ['Components', 'components.html']];
  return page({
    path: 'components.html',
    title: `${all.length} CSS components with no JavaScript | Monsoon`,
    description: `Browse ${all.length} Monsoon components: forms, buttons, alerts, navigation, cards, tables, dialogs and more. Native HTML, no JavaScript, light and dark mode, themed by one seed color.`,
    jsonld: [
      { '@type': 'CollectionPage', name: 'Monsoon components', url: `${SITE}components.html`, hasPart: all.map((c) => ({ '@type': 'TechArticle', name: c.name, url: `${SITE}components/${c.slug}.html` })) },
      breadcrumbLd(crumbs),
    ],
    body: docsShell({
      crumbs,
      kicker: 'Components',
      title: 'Components',
      lead: `${fmt(all.length)} components in ${groups.length} groups, built with native HTML and no JavaScript. Every one follows <code>--seed</code>, light and dark mode, and can be adjusted with utilities.`,
      body,
      toc: groups.map((g) => [g.group, g.title, 2]),
    }),
  });
}
