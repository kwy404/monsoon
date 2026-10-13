// Builds the optional interactive layer from src/js/components/*.mjs:
//   dist/monsoon.js      browser script, global `Monsoon`, starts itself
//   dist/monsoon.esm.js  ES module, call start() yourself
import { readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dir = join(root, 'src/js/components');
const files = readdirSync(dir).filter((f) => f.endsWith('.mjs')).sort();

const imports = files.map((f) => `import './components/${f}';`).join('\n');
const entry = (auto) => `${imports}
export { define, enhance, destroy, start, emit, components } from './core.mjs';
${auto ? "import { start } from './core.mjs';\nstart();" : ''}`;

const common = { bundle: true, minify: true, target: 'es2020', legalComments: 'none', logLevel: 'warning' };
await build({ ...common, stdin: { contents: entry(true), resolveDir: join(root, 'src/js'), loader: 'js' }, format: 'iife', globalName: 'Monsoon', outfile: join(root, 'dist/monsoon.js') });
await build({ ...common, stdin: { contents: entry(false), resolveDir: join(root, 'src/js'), loader: 'js' }, format: 'esm', outfile: join(root, 'dist/monsoon.esm.js') });
console.log(`  dist/monsoon.js and dist/monsoon.esm.js: ${files.length} interactive components`);
