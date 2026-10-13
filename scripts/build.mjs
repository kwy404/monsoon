// Builds dist/monsoon.css, dist/monsoon.min.css and scripts/classes.json.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { generate } from '../src/generate.mjs';
import { sizes, kb } from '../bin/css.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));

const started = Date.now();
const { css, min, classes } = generate({ version: pkg.version });

mkdirSync(join(root, 'dist'), { recursive: true });
writeFileSync(join(root, 'dist/monsoon.css'), css);
writeFileSync(join(root, 'dist/monsoon.min.css'), `${min}\n`);
writeFileSync(join(root, 'scripts/classes.json'), `${JSON.stringify({ version: pkg.version, count: classes.length, classes }, null, 2)}\n`);

const s = await sizes(min);
const variantCount = classes.reduce((n, c) => n + c.variants.length, 0);
console.log(`monsooncss ${pkg.version} built in ${Date.now() - started} ms`);
console.log(`  utilities: ${classes.length} base classes, ${variantCount} variant classes, ${classes.length + variantCount} total`);
console.log(`  dist/monsoon.min.css: ${kb(s.raw)} raw, ${kb(s.gzip)} gzip, ${kb(s.brotli)} brotli`);
