// Reports raw, gzip and brotli sizes for the built stylesheets.
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { sizes, kb } from '../bin/css.mjs';

export const TARGET_BROTLI = 60 * 1024;
export const LIMIT_BROTLI = 80 * 1024;

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const files = ['dist/monsoon.css', 'dist/monsoon.min.css'];

let failed = false;
console.log('file'.padEnd(24), 'raw'.padStart(10), 'gzip'.padStart(10), 'brotli'.padStart(10));
for (const f of files) {
  const path = join(root, f);
  if (!existsSync(path)) {
    console.error(`${f} is missing, run "npm run build" first`);
    process.exit(1);
  }
  const s = await sizes(readFileSync(path, 'utf8'));
  console.log(f.padEnd(24), kb(s.raw).padStart(10), kb(s.gzip).padStart(10), kb(s.brotli).padStart(10));
  if (f.endsWith('.min.css')) {
    if (s.brotli > LIMIT_BROTLI) {
      console.error(`brotli size ${kb(s.brotli)} is above the hard limit of ${kb(LIMIT_BROTLI)}`);
      failed = true;
    } else if (s.brotli > TARGET_BROTLI) {
      console.warn(`brotli size ${kb(s.brotli)} is above the ${kb(TARGET_BROTLI)} target`);
    } else {
      console.log(`brotli size is within the ${kb(TARGET_BROTLI)} target`);
    }
  }
}
process.exit(failed ? 1 : 0);
