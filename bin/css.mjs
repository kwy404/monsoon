// Tiny CSS toolkit shared by the build and the CLI. It only needs to handle
// the CSS that Monsoon itself produces, so it stays small and dependency free.

// CSS.escape as specified in CSSOM, shared with the arbitrary value engine.
export { escapeClass } from '../src/arbitrary/escape.mjs';

export function unescapeClass(value) {
  return value.replace(/\\([0-9a-fA-F]{1,6}\s?|[\s\S])/g, (_, seq) => {
    if (/^[0-9a-fA-F]{1,6}\s?$/.test(seq)) return String.fromCodePoint(parseInt(seq.trim(), 16));
    return seq;
  });
}

const CLASS_RE = /\.((?:\\[0-9a-fA-F]{1,6} ?|\\[^0-9a-fA-F\s]|[\w-])+)/g;

// Returns the unescaped class names found in a selector.
export function selectorClasses(selector) {
  const out = [];
  let m;
  CLASS_RE.lastIndex = 0;
  while ((m = CLASS_RE.exec(selector))) out.push(unescapeClass(m[1]));
  return out;
}

// ---- Parser ----
// Node shapes:
//   { type: 'comment', text }
//   { type: 'statement', prelude }               e.g. @layer a, b;
//   { type: 'block', prelude, decls: [[prop, value]] }
//   { type: 'block', prelude, children: [nodes] }

function skipString(css, i) {
  const q = css[i];
  i++;
  while (i < css.length && css[i] !== q) {
    if (css[i] === '\\') i++;
    i++;
  }
  return i;
}

function findBlockEnd(css, start) {
  let depth = 0;
  for (let i = start; i < css.length; i++) {
    const ch = css[i];
    if (ch === '"' || ch === "'") i = skipString(css, i);
    else if (ch === '/' && css[i + 1] === '*') i = css.indexOf('*/', i + 2) + 1;
    else if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) return i;
    }
  }
  throw new Error('Unbalanced braces in CSS');
}

function hasNestedBlock(body) {
  for (let i = 0; i < body.length; i++) {
    const ch = body[i];
    if (ch === '"' || ch === "'") i = skipString(body, i);
    else if (ch === '{') return true;
  }
  return false;
}

export function parseDecls(body) {
  const decls = [];
  let cur = '';
  let depth = 0;
  for (let i = 0; i < body.length; i++) {
    const ch = body[i];
    if (ch === '"' || ch === "'") {
      const end = skipString(body, i);
      cur += body.slice(i, end + 1);
      i = end;
      continue;
    }
    if (ch === '/' && body[i + 1] === '*') {
      i = body.indexOf('*/', i + 2) + 1;
      continue;
    }
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (ch === ';' && depth === 0) {
      push(cur);
      cur = '';
    } else cur += ch;
  }
  push(cur);
  return decls;
  function push(text) {
    const t = text.trim();
    if (!t) return;
    const idx = t.indexOf(':');
    decls.push([t.slice(0, idx).trim(), t.slice(idx + 1).trim()]);
  }
}

export function parse(css) {
  const nodes = [];
  let i = 0;
  let buf = '';
  while (i < css.length) {
    const ch = css[i];
    if (ch === '/' && css[i + 1] === '*') {
      const end = css.indexOf('*/', i + 2);
      nodes.push({ type: 'comment', text: css.slice(i + 2, end).trim() });
      i = end + 2;
      continue;
    }
    if (ch === '"' || ch === "'") {
      const end = skipString(css, i);
      buf += css.slice(i, end + 1);
      i = end + 1;
      continue;
    }
    if (ch === ';') {
      if (buf.trim()) nodes.push({ type: 'statement', prelude: buf.trim() });
      buf = '';
      i++;
      continue;
    }
    if (ch === '{') {
      const end = findBlockEnd(css, i);
      const body = css.slice(i + 1, end);
      const prelude = buf.trim().replace(/\s+/g, ' ');
      if (hasNestedBlock(body)) nodes.push({ type: 'block', prelude, children: parse(body) });
      else nodes.push({ type: 'block', prelude, decls: parseDecls(body) });
      buf = '';
      i = end + 1;
      continue;
    }
    buf += ch;
    i++;
  }
  return nodes;
}

// ---- Serializer ----

function minSelector(sel) {
  return sel.replace(/\s+/g, ' ').replace(/\s*([>+~,])\s*/g, '$1').trim();
}

function minValue(v) {
  return v
    .replace(/\s+/g, ' ')
    .replace(/\s*,\s*/g, ',')
    .replace(/(^|[\s,(/:])(-?)0+\.(\d)/g, '$1$2.$3')
    .trim();
}

function minPrelude(p) {
  if (!p.startsWith('@')) return minSelector(p);
  return p.replace(/\s+/g, ' ').replace(/:\s+/g, ':').trim();
}

export function serialize(nodes, { minify = false } = {}) {
  return minify ? serMin(nodes) : serPretty(nodes, '');
}

function serMin(nodes) {
  let out = '';
  for (const n of nodes) {
    if (n.type === 'comment') {
      if (n.text.startsWith('!')) out += `/*${n.text}*/`;
    } else if (n.type === 'statement') out += `${minPrelude(n.prelude)};`;
    else if (n.children) {
      if (n.children.length) out += `${minPrelude(n.prelude)}{${serMin(n.children)}}`;
    } else if (n.decls.length) {
      out += `${minPrelude(n.prelude)}{${n.decls.map(([p, v]) => `${p}:${minValue(v)}`).join(';')}}`;
    }
  }
  return out;
}

function serPretty(nodes, ind) {
  let out = '';
  for (const n of nodes) {
    if (n.type === 'comment') out += `${ind}/* ${n.text} */\n`;
    else if (n.type === 'statement') out += `${ind}${n.prelude};\n`;
    else if (n.children) {
      if (!n.children.length) continue;
      out += `${ind}${n.prelude} {\n${serPretty(n.children, `${ind}  `)}${ind}}\n`;
    } else if (n.decls.length) {
      const sel = n.prelude.includes(',') && n.prelude.length > 70 && !n.prelude.includes('(')
        ? n.prelude.split(/,\s*/).join(`,\n${ind}`)
        : n.prelude;
      out += `${ind}${sel} {\n${n.decls.map(([p, v]) => `${ind}  ${p}: ${v};\n`).join('')}${ind}}\n`;
    }
  }
  return out;
}

// ---- Size helpers ----

export async function sizes(text) {
  const zlib = await import('node:zlib');
  const buf = Buffer.from(text);
  return {
    raw: buf.length,
    gzip: zlib.gzipSync(buf, { level: 9 }).length,
    brotli: zlib.brotliCompressSync(buf, {
      params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 11 },
    }).length,
  };
}

export const kb = (n) => `${(n / 1024).toFixed(1)} kB`;
