// Builds the optional scripts:
//   dist/monsoon.js            browser script, global `Monsoon`, starts itself: the
//                              interactive components (src/js/components/*.mjs) and
//                              the arbitrary value engine (src/js/arbitrary.mjs)
//   dist/monsoon.esm.js        the same as an ES module, call start() yourself; it also
//                              exports what every component module exports (getters
//                              such as dropzone and cropper, and their helpers)
//   dist/monsoon-arbitrary.js  only the arbitrary value engine, global `MonsoonArbitrary`
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { sizes, kb } from '../bin/css.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dir = join(root, 'src/js/components');
const files = readdirSync(dir).filter((f) => f.endsWith('.mjs')).sort();

const CORE = ['define', 'enhance', 'destroy', 'start', 'emit', 'components'];

// Named exports of every component module, like "export *" would give. A name
// exported by more than one module (shared helpers such as clamp or h) is
// ambiguous and left out, as is any name the core or the engine exports.
function componentExports() {
  const owners = new Map();
  for (const f of files) {
    const src = readFileSync(join(dir, f), 'utf8');
    for (const m of src.matchAll(/^export\s+(?:async\s+)?(?:function\*?|const|let|class)\s+([A-Za-z_$][\w$]*)/gm)) {
      if (!owners.has(m[1])) owners.set(m[1], new Set());
      owners.get(m[1]).add(f);
    }
  }
  const out = new Map();
  for (const [name, set] of owners) {
    if (set.size !== 1 || CORE.includes(name) || name === 'arbitrary') continue;
    const [f] = set;
    if (!out.has(f)) out.set(f, []);
    out.get(f).push(name);
  }
  return out;
}

const imports = files.map((f) => `import './components/${f}';`).join('\n');
const core = `export { ${CORE.join(', ')} } from './core.mjs';\nexport { arbitrary } from './arbitrary.mjs';`;
const autostart = "import { start } from './core.mjs';\nimport { start as startArbitrary } from './arbitrary.mjs';\nstartArbitrary();\nstart();";
const named = [...componentExports()]
  .map(([f, names]) => `export { ${names.sort().join(', ')} } from './components/${f}';`)
  .join('\n');

const common = { bundle: true, minify: true, target: 'es2020', legalComments: 'none', logLevel: 'warning' };
const stdin = (contents) => ({ contents, resolveDir: join(root, 'src/js'), loader: 'js' });

await build({ ...common, stdin: stdin(`${imports}\n${core}\n${autostart}`), format: 'iife', globalName: 'Monsoon', outfile: join(root, 'dist/monsoon.js') });
await build({ ...common, stdin: stdin(`${imports}\n${core}\n${named}`), format: 'esm', outfile: join(root, 'dist/monsoon.esm.js') });
await build({
  ...common,
  stdin: stdin("export { start, stop, scan, add, css, reset } from './arbitrary.mjs';\nimport { start } from './arbitrary.mjs';\nstart();"),
  format: 'iife',
  globalName: 'MonsoonArbitrary',
  outfile: join(root, 'dist/monsoon-arbitrary.js'),
});

const report = async (f) => {
  const s = await sizes(readFileSync(join(root, f), 'utf8'));
  return `${f}: ${kb(s.raw)} raw, ${kb(s.gzip)} gzip, ${kb(s.brotli)} brotli`;
};
console.log(`  dist/monsoon.js and dist/monsoon.esm.js: ${files.length} interactive components and the arbitrary value engine`);
console.log(`  ${await report('dist/monsoon.js')}`);
console.log(`  ${await report('dist/monsoon-arbitrary.js')}`);
