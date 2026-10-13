// Component classes that share a name with a utility: both keep working, and
// other utilities on the element still win over the component.
import { describe, it, expect } from 'vitest';
import { collectUtilities } from '../src/generate.mjs';
import { componentsCss } from '../src/components/index.mjs';
import { read } from './helpers.mjs';

const min = read('dist/monsoon.min.css');

describe('utilities that share a name with a component', () => {
  const components = componentsCss();

  it('keeps .list-item a flex row inside .list and display:list-item elsewhere', () => {
    expect(components).toMatch(/:where\(\.list\) > \.list-item \{\s*display: flex;/);
    expect(min).toContain('.list-item:where(:not(.list>*)){display:list-item}');
    // One class of specificity on both sides, so .hidden on a list row still wins.
    expect(min.indexOf('.hidden{display:none}')).toBeGreaterThan(min.indexOf(':where(.list)>.list-item{'));
  });

  it('keeps .collapse a disclosure on <details> and visibility:collapse elsewhere', () => {
    expect(components).toMatch(/\n\.collapse \{\n {2}overflow: hidden;/);
    expect(components).not.toContain('.collapse:is(details)');
    expect(min).toContain('.collapse:where(:not(details)){visibility:collapse}');
  });

  it('has a single skip link: the component', () => {
    expect(collectUtilities().some((u) => u.name === 'skip-link')).toBe(false);
    expect(components).toMatch(/\.skip-link \{[^}]*position: fixed;/);
    expect(components).toMatch(/\.skip-link:focus,\s*\.skip-link:focus-visible \{\s*translate: 0 0;/);
  });

  it('keeps a dropdown on its trigger inside a stretching flex row', () => {
    expect(components).toMatch(/\.dropdown \{[^}]*block-size: fit-content;/);
  });
});
