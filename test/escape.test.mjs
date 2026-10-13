import { describe, it, expect } from 'vitest';
import { escapeClass, unescapeClass, selectorClasses } from '../bin/css.mjs';

describe('class escaping', () => {
  const cases = [
    ['p-4', 'p-4'],
    ['md:p-4', 'md\\:p-4'],
    ['w-1/2', 'w-1\\/2'],
    ['p-0.5', 'p-0\\.5'],
    ['@md:flex', '\\@md\\:flex'],
    ['2xl:p-4', '\\32 xl\\:p-4'],
    ['-mt-4', '-mt-4'],
    ['bg-black/50', 'bg-black\\/50'],
    ['hover:bg-primary/90', 'hover\\:bg-primary\\/90'],
    ['-translate-x-1/2', '-translate-x-1\\/2'],
  ];

  it.each(cases)('escapes %s', (raw, escaped) => {
    expect(escapeClass(raw)).toBe(escaped);
    expect(unescapeClass(escaped)).toBe(raw);
  });

  it('extracts unescaped classes from selectors', () => {
    expect(selectorClasses('.group:hover .group-hover\\:text-primary')).toEqual(['group', 'group-hover:text-primary']);
    expect(selectorClasses('.\\32 xl\\:w-1\\/2')).toEqual(['2xl:w-1/2']);
    expect(selectorClasses(':where(.space-x-0\\.5>:not(:last-child))')).toEqual(['space-x-0.5']);
  });
});
