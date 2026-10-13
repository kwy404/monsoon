// Repository lint: syntax check every script and keep text files clean.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, extname } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const BINARY = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico', '.woff', '.woff2', '.ttf', '.otf', '.pdf', '.zip', '.gz', '.br']);
const SKIP = new Set(['package-lock.json']);

const listed = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], { cwd: root, encoding: 'utf8' })
  .split('\0')
  .filter(Boolean)
  .filter((f) => !f.startsWith('node_modules/') && !SKIP.has(f.split('/').pop()));

// Built from code points so this file does not contain the characters itself.
const DASHES = new RegExp(`[${String.fromCodePoint(0x2013)}${String.fromCodePoint(0x2014)}]`);
const EMOJI = /\p{Extended_Pictographic}/u;
const BANNED_WORD = new RegExp(['tail', 'wind'].join(''), 'i');

const problems = [];
let checked = 0;
for (const file of listed) {
  if (BINARY.has(extname(file).toLowerCase())) continue;
  let text;
  try {
    text = readFileSync(join(root, file), 'utf8');
  } catch {
    continue; // deleted in the working tree
  }
  checked++;
  text.split('\n').forEach((line, i) => {
    const where = `${file}:${i + 1}`;
    if (DASHES.test(line)) problems.push(`${where} contains an em or en dash`);
    if (EMOJI.test(line)) problems.push(`${where} contains an emoji`);
    if (BANNED_WORD.test(line)) problems.push(`${where} mentions another framework by name`);
    if (/[ \t]+\r?$/.test(line) && !file.endsWith('.md')) problems.push(`${where} has trailing whitespace`);
  });
  if (/\.(mjs|js|cjs)$/.test(file)) {
    try {
      execFileSync(process.execPath, ['--check', join(root, file)], { stdio: 'pipe' });
    } catch (e) {
      problems.push(`${file} failed node --check: ${String(e.stderr).trim()}`);
    }
  }
}

if (problems.length) {
  console.error(problems.join('\n'));
  console.error(`\nlint: ${problems.length} problem(s) in ${checked} files`);
  process.exit(1);
}
console.log(`lint: ${checked} files clean`);
