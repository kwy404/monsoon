// Renders content blocks (guides, getting started and install pages) into
// HTML, and collects the headings for the table of contents.
import { code, terminal, esc, md, slug, I, uid, exPicker } from './lib.mjs';

export function demoBox(html, labelText = 'Live result') {
  const id = uid('demo');
  return `<figure class="demo-box" id="${id}" v-data="{ mode: '' }">
  <figcaption class="demo-bar"><span class="demo-label">${I.eye}${esc(labelText)}</span>
    <span class="demo-tools">
    <button type="button" class="pv-copy pv-copy-sm" data-copy-src="#${id}" aria-label="Copy this example's HTML"><span class="ic-swap">${I.copy}${I.check}</span><span>Copy</span></button>
    ${exPicker(`${id}-theme`, { cls: 'ex-theme-sm' })}
    <span class="seg seg-sm" role="group" aria-label="Preview color scheme">
      <button type="button" :aria-pressed="mode === '' ? 'true' : 'false'" aria-pressed="true" @click="mode = ''">Auto</button>
      <button type="button" :aria-pressed="mode === 'light' ? 'true' : 'false'" aria-pressed="false" @click="mode = 'light'">Light</button>
      <button type="button" :aria-pressed="mode === 'dark' ? 'true' : 'false'" aria-pressed="false" @click="mode = 'dark'">Dark</button>
    </span>
    </span>
  </figcaption>
  <div class="demo-stage" :class="mode"><div class="demo-inner ex-target" v-pre>${html}</div></div>
  <script type="text/plain" class="pv-src">${html.replace(/<\/script/gi, '<\\/script')}</script>
</figure>`;
}

function tabsBlock(b, ctx) {
  const labels = b.tabs.map((t) => t.label);
  const key = `monsoon-tabs-${labels.map(slug).join('-')}`;
  const id = `tabs-${++ctx.tabs}`;
  const first = labels[0];
  const buttons = b.tabs
    .map(
      (t, i) =>
        `<button type="button" role="tab" id="${id}-t${i}" aria-controls="${id}-p${i}" class="tabs-btn" aria-selected="${i === 0}" :aria-selected="tab === '${esc(t.label)}' ? 'true' : 'false'" :tabindex="tab === '${esc(t.label)}' ? '0' : '-1'" @click="tab = '${esc(t.label)}'; $storage.set('${key}', '${esc(t.label)}')">${esc(t.label)}</button>`,
    )
    .join('');
  const panels = b.tabs
    .map(
      (t, i) =>
        `<div role="tabpanel" id="${id}-p${i}" aria-labelledby="${id}-t${i}" class="tabs-panel"${i ? ' hidden' : ''} :hidden="tab !== '${esc(t.label)}'">${t.blocks.map((x) => block(x, ctx)).join('\n')}</div>`,
    )
    .join('');
  return `<div class="tabs-block" v-data="{ tab: ${JSON.stringify(labels).replace(/"/g, "'")}.includes($storage.get('${key}')) ? $storage.get('${key}') : '${esc(first)}' }"><div class="tabs-list" role="tablist" aria-label="${esc(labels.join(' or '))}">${buttons}</div>${panels}</div>`;
}

export function block(b, ctx) {
  if (typeof b === 'string') return `<p>${md(b)}</p>`;
  if (b.h3) {
    const id = uniq(slug(b.h3), ctx);
    ctx.toc.push([id, b.h3.replace(/`/g, ''), 3]);
    return `<h3 id="${id}" class="doc-h3"><a href="#${id}" class="anchor" aria-hidden="true" tabindex="-1">#</a>${md(b.h3)}</h3>`;
  }
  if (b.code != null) return code(b.code, b.lang || 'html', b.title || `example.${b.lang || 'html'}`);
  if (b.term != null) return terminal(b.term, b.title || 'bash', b.out ? esc(b.out) : '');
  if (b.list) return `<ul class="doc-list">${b.list.map((x) => `<li>${md(x)}</li>`).join('')}</ul>`;
  if (b.ol) return `<ol class="doc-ol">${b.ol.map((x) => `<li>${md(x)}</li>`).join('')}</ol>`;
  if (b.note) return `<div class="note-box" role="note"><p>${md(b.note)}</p></div>`;
  if (b.warn) return `<div class="note-box note-warn" role="note"><p>${md(b.warn)}</p></div>`;
  if (b.table)
    return `<div class="tbl-wrap"><table class="doc-table"><thead><tr>${b.table.head
      .map((h) => `<th scope="col">${md(h)}</th>`)
      .join('')}</tr></thead><tbody>${b.table.rows.map((r) => `<tr>${r.map((c) => `<td>${md(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  if (b.demo) return demoBox(b.demo, b.label || 'Live result');
  if (b.tabs) return tabsBlock(b, ctx);
  if (b.html) return b.html;
  throw new Error(`Unknown block ${JSON.stringify(b).slice(0, 80)}`);
}

function uniq(id, ctx) {
  let out = id || 'section';
  let n = 2;
  while (ctx.ids.has(out)) out = `${id}-${n++}`;
  ctx.ids.add(out);
  return out;
}

export function newCtx() {
  return { toc: [], ids: new Set(['main', 'article', 'search', 'site-nav']), tabs: 0 };
}

/** Sections with h2 headings plus their blocks. */
export function sections(list, ctx) {
  return list
    .map((s) => {
      const id = uniq(slug(s.h), ctx);
      ctx.toc.push([id, s.h.replace(/`/g, ''), 2]);
      return `<section class="doc-section">
  <h2 id="${id}" class="doc-h2"><a href="#${id}" class="anchor" aria-hidden="true" tabindex="-1">#</a>${md(s.h)}</h2>
  ${s.blocks.map((b) => block(b, ctx)).join('\n  ')}
</section>`;
    })
    .join('\n');
}

/** Word count of a content page (lead, headings, text blocks and FAQ). */
export function wordCount(g) {
  const text = (b) =>
    typeof b === 'string'
      ? b
      : b.note || b.warn || b.h3 || (b.list || b.ol || []).join(' ') || (b.table ? b.table.rows.flat().join(' ') : '') || (b.tabs ? b.tabs.flatMap((t) => t.blocks.map(text)).join(' ') : '');
  const all = [g.lead, ...g.sections.flatMap((s) => [s.h, ...s.blocks.map(text)]), ...(g.faqs || []).flat()].join(' ');
  return all.replace(/`([^`]+)`/g, '$1').split(/\s+/).filter(Boolean).length;
}

/** Plain text of a page for the search index. */
export function pageText(g) {
  const text = (b) => (typeof b === 'string' ? b : b.note || b.warn || b.h3 || (b.list || b.ol || []).join(' ') || '');
  return [g.lead, ...g.sections.flatMap((s) => [s.h, ...s.blocks.map(text)])].join(' ').replace(/`/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
}
