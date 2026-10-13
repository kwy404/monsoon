// Component layer: every src/components/*.css file, in name order, is placed
// after the base styles and before the utilities, so utilities always win.
// Each CSS file has a matching *.json manifest used by the docs site.
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = dirname(fileURLToPath(import.meta.url));

export function componentFiles() {
  return readdirSync(dir).filter((f) => f.endsWith('.css')).sort();
}

export function componentsCss() {
  return componentFiles().map((f) => readFileSync(join(dir, f), 'utf8')).join('\n');
}

export function componentManifests() {
  return readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .sort()
    .map((f) => JSON.parse(readFileSync(join(dir, f), 'utf8')));
}
