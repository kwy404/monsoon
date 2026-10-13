// Build time data: component manifests, component CSS, utility categories,
// variant templates read from the real build, and the stylesheet sizes.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, INDEX } from './lib.mjs';
import { parse, serialize, selectorClasses, escapeClass, sizes, kb } from '../../bin/css.mjs';

const COMP_DIR = join(ROOT, 'src/components');

/** Reads every src/components/*.json manifest, skipping missing or broken ones. */
export function loadManifests(log = console.log) {
  const groups = [];
  if (!existsSync(COMP_DIR)) return groups;
  for (const file of readdirSync(COMP_DIR).filter((f) => f.endsWith('.json')).sort()) {
    let data;
    try {
      data = JSON.parse(readFileSync(join(COMP_DIR, file), 'utf8'));
    } catch (e) {
      log(`  skipped ${file}: not valid JSON yet (${e.message.split('\n')[0]})`);
      continue;
    }
    if (!data || !Array.isArray(data.components) || !data.group) {
      log(`  skipped ${file}: missing group or components`);
      continue;
    }
    const comps = data.components.filter((c) => c && c.slug && c.name && typeof c.html === 'string' && Array.isArray(c.classes));
    if (comps.length < data.components.length) log(`  ${file}: skipped ${data.components.length - comps.length} incomplete components`);
    groups.push({ file, group: data.group, title: data.title || data.group, components: comps.map((c) => ({ ...c, group: data.group, groupTitle: data.title || data.group })) });
  }
  // A slug must be unique across groups.
  const seen = new Set();
  for (const g of groups) {
    g.components = g.components.filter((c) => {
      if (seen.has(c.slug)) {
        log(`  duplicate component slug ${c.slug} in ${g.file}, skipped`);
        return false;
      }
      seen.add(c.slug);
      return true;
    });
  }
  return groups.filter((g) => g.components.length);
}

/** Map of component class name to the CSS rules that mention it, from src/components/*.css. */
export function componentCss() {
  const map = new Map();
  if (!existsSync(COMP_DIR)) return map;
  const walk = (nodes, wrap) => {
    for (const n of nodes) {
      if (n.type !== 'block') continue;
      if (n.children) {
        if (n.prelude.startsWith('@keyframes')) continue;
        walk(n.children, n.prelude.startsWith('@') ? [...wrap, n.prelude] : wrap);
        continue;
      }
      if (!n.decls.length) continue;
      const names = new Set(selectorClasses(n.prelude));
      const text = serialize(wrap.reduceRight((inner, w) => [{ type: 'block', prelude: w, children: inner }], [n])).trim();
      for (const c of names) {
        if (!map.has(c)) map.set(c, []);
        const arr = map.get(c);
        // Prefer rules where the class is the subject of the selector.
        const lead = n.prelude.split(',').some((s) => s.trim().startsWith(`.${escapeClass(c)}`));
        arr.push({ text, lead, len: text.length, decls: n.decls });
      }
    }
  };
  for (const file of readdirSync(COMP_DIR).filter((f) => f.endsWith('.css')).sort()) {
    try {
      walk(parse(readFileSync(join(COMP_DIR, file), 'utf8')), []);
    } catch (e) {
      console.log(`  could not parse ${file}: ${e.message}`);
    }
  }
  return map;
}

/** Utility categories in index order with their classes. */
export function categories() {
  const out = new Map();
  for (const c of INDEX.classes) {
    if (!out.has(c.category)) out.set(c.category, []);
    out.get(c.category).push(c);
  }
  return out;
}

/**
 * Variant templates read from dist/monsoon.css: for each variant, the wrapper
 * at-rules and the selector shape with {c} where the escaped class name goes.
 * The browser joins them with the base declarations to show the real CSS.
 */
export function variantTemplates(css) {
  const variants = [...new Set(INDEX.classes.flatMap((c) => c.variants))];
  const sample = {};
  for (const v of variants) {
    const c = INDEX.classes.find((x) => x.variants.includes(v) && /^[a-z-]+$/.test(x.class));
    if (c) sample[v] = c.class;
  }
  const want = new Map(Object.entries(sample).map(([v, c]) => [`${v}:${c}`, v]));
  const found = {};
  const walk = (nodes, wrap) => {
    for (const n of nodes) {
      if (n.type !== 'block') continue;
      if (n.children) {
        walk(n.children, n.prelude.startsWith('@') ? [...wrap, n.prelude] : wrap);
        continue;
      }
      for (const name of selectorClasses(n.prelude)) {
        const v = want.get(name);
        if (!v) continue;
        const esc = `.${escapeClass(name)}`;
        (found[v] ||= []).push({ wrap, sel: n.prelude.split(esc).join('.{c}') });
      }
    }
  };
  walk(parse(css), []);
  return found;
}

export async function sizeOf(path) {
  const s = await sizes(readFileSync(path, 'utf8'));
  return { raw: kb(s.raw), gzip: kb(s.gzip), brotli: kb(s.brotli), rawBytes: s.raw, brotliBytes: s.brotli };
}

/** Classes used in an html snippet. */
export function classesIn(html) {
  const out = new Set();
  for (const m of html.matchAll(/class="([^"]*)"/g)) for (const c of m[1].split(/\s+/)) if (c) out.add(c);
  return [...out];
}
