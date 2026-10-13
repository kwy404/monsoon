// Sections added to getting started pages for features that landed after the
// pages were written: media and direction variants, and fluid type and space.
// Counts come from scripts/classes.json at build time.

export function augment(pages, index) {
  const count = (v) => index.classes.filter((c) => c.variants.includes(v)).length;
  const fmt = (n) => n.toLocaleString('en-US');
  const has = (v) => count(v) > 0;
  const variants = pages.find((p) => p.slug === 'variants');
  if (variants && (has('print') || has('rtl') || has('forced-colors')) && !variants.sections.some((s) => /print/i.test(s.h))) {
    const rows = [
      ['`print:`', 'When the page is printed (`@media print`).', fmt(count('print')), 'Layout utilities, the same set as the breakpoints: display, position, flex and grid, spacing, sizing and text size.'],
      ['`screen:`', 'Only on screens (`@media screen`).', fmt(count('screen')), 'The same set as `print:`.'],
      ['`rtl:`', 'Inside an element with `dir="rtl"`, or the element itself.', fmt(count('rtl')), 'Utilities that name a physical side: left and right margins and padding, positions, rounded corners, borders, translate, space between, flex row and transform origin.'],
      ['`ltr:`', 'Inside an element with `dir="ltr"`.', fmt(count('ltr')), 'The same set as `rtl:`.'],
      ['`forced-colors:`', 'When a high contrast theme is active (`@media (forced-colors: active)`).', fmt(count('forced-colors')), 'Display, borders, outlines, underlines, screen reader helpers and `forced-color-adjust`.'],
    ].filter((r) => count(r[0].replace(/[`:]/g, '')) > 0);
    variants.sections.push({
      h: 'Print, screen, direction and forced colors',
      blocks: [
        'Five more prefixes cover the media and the writing direction a page is shown in. Like the others they are generated only where they are useful, which the table spells out.',
        { table: { head: ['Prefix', 'Applies', 'Classes', 'Generated for'], rows } },
        {
          code: `<!-- hide the navigation and show the URL when printing -->
<nav class="flex print:hidden">...</nav>
<p class="hidden print:block">monsoon.example/report</p>

<!-- mirror a physical margin in right to left languages -->
<div dir="rtl">
  <span class="ml-4 rtl:ml-0 rtl:mr-4">Badge</span>
</div>

<!-- keep a visible border when a high contrast theme removes backgrounds -->
<button class="rounded-lg bg-primary text-primary-foreground forced-colors:border">Save</button>`,
          lang: 'html',
          title: 'variants.html',
        },
        { note: 'Prefer logical utilities such as `ms-4`, `ps-4` and `border-s-2`: they follow the writing direction on their own, so `rtl:` is only needed for the physical ones.' },
      ],
    });
  }
  const responsive = pages.find((p) => p.slug === 'responsive-design');
  const fluid = index.classes.filter((c) => /(^|-)fluid-/.test(c.class));
  if (responsive && fluid.length && !responsive.sections.some((s) => /fluid/i.test(s.h))) {
    responsive.sections.push({
      h: 'Fluid type and spacing',
      blocks: [
        `Breakpoints switch values in steps. Fluid utilities change them smoothly: each one is a \`clamp()\` of rem and vw that grows from a phone size at 360px to a desktop size at 1280px, and still follows the reader's font size setting. There are ${fmt(fluid.length)} of them, for text size, padding, margin and gap.`,
        {
          code: `<section class="px-fluid-md py-fluid-xl">
  <h1 class="text-fluid-5xl font-extrabold">One class, every width</h1>
  <p class="mt-4 text-fluid-lg text-muted-foreground">No sm: or lg: needed.</p>
</section>`,
          lang: 'html',
          title: 'hero.html',
        },
        { demo: '<div class="rounded-2xl border bg-surface p-fluid-md"><p class="text-fluid-3xl font-extrabold tracking-tight">Fluid headline</p><p class="text-fluid-base text-muted-foreground">Resize the window: size and padding follow the viewport.</p></div>', label: 'Live result' },
        'Every fluid class with its exact `clamp()` is listed on the [fluid utilities](../utilities/fluid.html) page.',
      ],
    });
  }
  return pages;
}
