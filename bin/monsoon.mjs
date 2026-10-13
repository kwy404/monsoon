#!/usr/bin/env node
// monsooncss command line: purge unused utilities and list available classes.
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync, mkdirSync, realpathSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse, serialize, selectorClasses, sizes, kb } from './css.mjs';
import { arbitraryCss, scanArbitrary } from '../src/arbitrary/index.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const DEFAULT_CSS = join(here, '..', 'dist', 'monsoon.css');
const MARKER = 'monsoon:utilities';
// Classes that only act as hooks for variants, never as utilities on their own.
const STRUCTURAL = new Set(['group', 'peer', 'dark', 'light', 'theme']);
const SKIP_DIRS = new Set(['node_modules', '.git', '.hg', '.svn']);

const HELP = `monsooncss: utility CSS with no build step

Usage
  monsooncss purge <glob...> [-o <file>] [options]
  monsooncss classes [--json] [--filter <text>]
  monsooncss --help | --version

Commands
  purge     Scan files for class names and write a stylesheet with only the
            rules you use, plus the base reset, theme tokens and keyframes.
            Arbitrary value classes (bg-[#0ea5e9], md:w-[37px]) are compiled
            into static rules, so production needs no script.
  classes   List every class in the stylesheet, one per line.

Purge options
  -o, --out <file>      Output file (default: print to stdout)
  --safelist <a,b,c>    Extra classes to keep even if they are not found
  --no-minify           Write readable CSS instead of minified CSS
  --no-arbitrary        Do not compile arbitrary value classes
  --css <file>          Source stylesheet (default: the bundled dist/monsoon.css)

Classes options
  --json                Print a JSON array
  --filter <text>       Only classes containing <text>

Examples
  npx monsooncss purge "src/**/*.{html,php,js,jsx,tsx,vue}" -o public/monsoon.css
  npx monsooncss classes --filter grid-cols
`;

// ---- Glob ----

export function expandBraces(pattern) {
  const m = pattern.match(/^(.*?)\{([^{}]*)\}(.*)$/);
  if (!m) return [pattern];
  return m[2].split(',').flatMap((part) => expandBraces(m[1] + part + m[3]));
}

export function globToRegExp(glob) {
  let re = '';
  for (let i = 0; i < glob.length; i++) {
    const ch = glob[i];
    if (ch === '*') {
      if (glob[i + 1] === '*') {
        i++;
        if (glob[i + 1] === '/') {
          i++;
          re += '(?:.*/)?';
        } else re += '.*';
      } else re += '[^/]*';
    } else if (ch === '?') re += '[^/]';
    else if (ch === '[') {
      const end = glob.indexOf(']', i);
      if (end === -1) re += '\\[';
      else {
        re += `[${glob.slice(i + 1, end).replace(/^!/, '^')}]`;
        i = end;
      }
    } else re += ch.replace(/[.+^${}()|\\]/g, '\\$&');
  }
  return new RegExp(`^${re}$`);
}

function walk(dir, out) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries) {
    if (e.isDirectory()) {
      if (!SKIP_DIRS.has(e.name)) walk(join(dir, e.name), out);
    } else if (e.isFile()) out.push(join(dir, e.name));
  }
}

export function glob(patterns, cwd = process.cwd()) {
  const found = new Set();
  for (const raw of patterns) {
    for (const pattern of expandBraces(raw.replace(/\\/g, '/'))) {
      if (!/[*?[]/.test(pattern)) {
        const p = resolve(cwd, pattern);
        if (existsSync(p) && statSync(p).isFile()) found.add(p);
        else if (existsSync(p) && statSync(p).isDirectory()) {
          const files = [];
          walk(p, files);
          files.forEach((f) => found.add(f));
        }
        continue;
      }
      const parts = pattern.split('/');
      const baseParts = [];
      while (parts.length && !/[*?[]/.test(parts[0])) baseParts.push(parts.shift());
      const base = resolve(cwd, baseParts.join('/') || '.');
      const re = globToRegExp(parts.join('/'));
      const files = [];
      walk(base, files);
      for (const f of files) {
        if (re.test(relative(base, f).split(sep).join('/'))) found.add(f);
      }
    }
  }
  return [...found].sort();
}

// ---- Candidates and purge ----

export function extractCandidates(text) {
  const out = new Set();
  for (const token of text.split(/[\s"'`<>={}();,\\|&!]+/)) {
    if (!token) continue;
    out.add(token);
    const trimmed = token.replace(/[.:]+$/, '');
    if (trimmed !== token) out.add(trimmed);
  }
  return out;
}

function utilityClasses(selector) {
  return selectorClasses(selector).filter((c) => !STRUCTURAL.has(c));
}

function splitAtMarker(nodes) {
  const idx = nodes.findIndex((n) => n.type === 'comment' && n.text === MARKER);
  if (idx === -1) throw new Error('Stylesheet has no utilities marker; use the dist/monsoon.css file.');
  return [nodes.slice(0, idx), nodes.slice(idx + 1)];
}

function filterNodes(nodes, keep, stats) {
  const out = [];
  for (const n of nodes) {
    if (n.type !== 'block') continue;
    if (n.children) {
      const children = filterNodes(n.children, keep, stats);
      if (children.length) out.push({ ...n, children });
      continue;
    }
    stats.total++;
    if (utilityClasses(n.prelude).some((c) => keep(c))) {
      stats.kept++;
      out.push(n);
    }
  }
  return out;
}

/**
 * Keeps the utility rules whose classes are in `used`. Classes in `arbitrary`
 * (arbitrary value classes such as bg-[red]) are compiled and appended after
 * the static utilities, in the same order the runtime engine uses.
 */
export function purgeCss(css, used, { minify = true, arbitrary = [] } = {}) {
  const [head, utils] = splitAtMarker(parse(css));
  const stats = { total: 0, kept: 0, arbitrary: 0 };
  const kept = filterNodes(utils, (c) => used.has(c), stats);
  const extra = arbitraryCss(arbitrary);
  stats.arbitrary = extra.classes.length;
  const nodes = [...head, ...kept];
  if (extra.css) nodes.push({ type: 'comment', text: 'monsoon:arbitrary' }, ...parse(extra.css));
  const out = serialize(nodes, { minify });
  return { css: minify ? `${out}\n` : out, stats };
}

export function listClasses(css) {
  const [, utils] = splitAtMarker(parse(css));
  const seen = new Set();
  const visit = (nodes) => {
    for (const n of nodes) {
      if (n.type !== 'block') continue;
      if (n.children) visit(n.children);
      else utilityClasses(n.prelude).forEach((c) => seen.add(c));
    }
  };
  visit(utils);
  return [...seen];
}

// ---- CLI ----

function parseArgs(argv) {
  const args = { _: [], minify: true, json: false, arbitrary: true };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '-o' || a === '--out') args.out = argv[++i];
    else if (a === '--css') args.css = argv[++i];
    else if (a === '--safelist') args.safelist = argv[++i];
    else if (a === '--filter') args.filter = argv[++i];
    else if (a === '--no-minify') args.minify = false;
    else if (a === '--no-arbitrary') args.arbitrary = false;
    else if (a === '--json') args.json = true;
    else if (a === '-h' || a === '--help') args.help = true;
    else if (a === '-v' || a === '--version') args.version = true;
    else if (a.startsWith('-')) throw new Error(`Unknown option: ${a}`);
    else args._.push(a);
  }
  return args;
}

export async function main(argv, io = { log: console.log, error: console.error, write: (s) => process.stdout.write(s) }) {
  let args;
  try {
    args = parseArgs(argv);
  } catch (e) {
    io.error(e.message);
    io.error('Run "monsooncss --help" for usage.');
    return 1;
  }
  const [command, ...rest] = args._;
  if (args.version) {
    io.log(JSON.parse(readFileSync(join(here, '..', 'package.json'), 'utf8')).version);
    return 0;
  }
  if (args.help || !command || command === 'help') {
    io.log(HELP);
    return args.help || command === 'help' ? 0 : 1;
  }
  const cssPath = args.css ? resolve(args.css) : DEFAULT_CSS;
  if (!existsSync(cssPath)) {
    io.error(`Stylesheet not found: ${cssPath}`);
    return 1;
  }
  const source = readFileSync(cssPath, 'utf8');

  if (command === 'classes') {
    let list = listClasses(source);
    if (args.filter) list = list.filter((c) => c.includes(args.filter));
    io.log(args.json ? JSON.stringify(list, null, 2) : list.join('\n'));
    return 0;
  }

  if (command === 'purge') {
    if (!rest.length) {
      io.error('purge needs at least one file or glob, for example "src/**/*.html"');
      return 1;
    }
    const files = glob(rest);
    if (!files.length) {
      io.error(`No files matched: ${rest.join(' ')}`);
      return 1;
    }
    const used = new Set();
    const arbitrary = new Set();
    for (const f of files) {
      const text = readFileSync(f, 'utf8');
      for (const c of extractCandidates(text)) used.add(c);
      if (args.arbitrary) for (const c of scanArbitrary(text)) arbitrary.add(c);
    }
    if (args.safelist) {
      for (const c of args.safelist.split(',').map((s) => s.trim()).filter(Boolean)) {
        used.add(c);
        if (args.arbitrary) arbitrary.add(c);
      }
    }
    const { css, stats } = purgeCss(source, used, { minify: args.minify, arbitrary: [...arbitrary].sort() });
    if (args.out) {
      mkdirSync(dirname(resolve(args.out)), { recursive: true });
      writeFileSync(args.out, css);
      const s = await sizes(css);
      const full = await sizes(serialize(parse(source), { minify: true }));
      io.error(`monsooncss purge: scanned ${files.length} file${files.length === 1 ? '' : 's'}`);
      io.error(`  kept ${stats.kept} of ${stats.total} utility rules`);
      if (stats.arbitrary) io.error(`  compiled ${stats.arbitrary} arbitrary value class${stats.arbitrary === 1 ? '' : 'es'}`);
      io.error(`  ${args.out}: ${kb(s.raw)} raw, ${kb(s.gzip)} gzip, ${kb(s.brotli)} brotli (full build ${kb(full.brotli)} brotli)`);
    } else io.write(css);
    return 0;
  }

  io.error(`Unknown command: ${command}`);
  io.error('Run "monsooncss --help" for usage.');
  return 1;
}

function isMain() {
  try {
    return Boolean(process.argv[1]) && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
  } catch {
    return false;
  }
}
if (isMain()) {
  main(process.argv.slice(2)).then((code) => {
    process.exitCode = code;
  });
}
