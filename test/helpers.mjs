import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { componentScale, componentThemeTokens } from '../src/base.mjs';

export const root = join(dirname(fileURLToPath(import.meta.url)), '..');
export const read = (f) => readFileSync(join(root, f), 'utf8');

// Names of the shared component tokens (--m-radius-md, --m-ring, ...) from base.mjs.
export const sharedTokens = [...Object.keys(componentScale), ...Object.keys(componentThemeTokens)].map((k) => `--m-${k}`);
