// The "Arbitrary values" docs page. It is a function so the build can pass
// the real file sizes; the family table is generated from src/arbitrary, so it
// always matches the parser.
import { families, compileClass, ruleCss } from '../../../src/arbitrary/index.mjs';
import { COLOR_FAMILIES, NEGATIVE } from '../../../src/arbitrary/families.mjs';

const SAMPLE = {
  aspect: '4/3', 'grid-cols': '200px_1fr', 'grid-rows': 'auto_1fr', content: "'x'", list: 'square', cursor: 'grab', ease: 'linear',
  'mix-blend': 'multiply', 'will-change': 'scroll-position', animate: 'spin_2s_linear_infinite', transition: 'width', object: '25%_75%',
  align: '-2px', z: '999', order: '13', opacity: '.35', 'line-clamp': '7', grow: '2', shrink: '0', flex: '2_1_0%', columns: '18rem',
  font: '650', leading: '1.1', tracking: '.02em', scale: '1.15', 'scale-x': '1.15', 'scale-y': '1.15', rotate: '17deg', origin: '30%_70%',
  duration: '250', delay: '75', basis: '37%', col: '2/4', row: '1/3', 'col-span': '5', 'row-span': '3', 'col-start': '2', 'col-end': '-1',
  'row-start': '2', 'row-end': '4', 'auto-cols': '12rem', 'auto-rows': 'minmax(4rem,auto)', shadow: '0_2px_8px_rgb(0_0_0/.2)',
  blur: '3px', brightness: '1.2', contrast: '1.1', saturate: '1.4', grayscale: '.5', invert: '.8', sepia: '.3', 'hue-rotate': '90deg',
  'drop-shadow': '0_2px_4px_red', bg: '#0ea5e9', text: '13px', fill: '#0ea5e9', from: '#0ea5e9', via: '#0ea5e9', to: '#0ea5e9',
  caret: '#0ea5e9', accent: '#0ea5e9', divide: '#0ea5e9', placeholder: '#0ea5e9', ring: '3px', 'ring-offset': '3px', outline: '3px',
  decoration: '3px', stroke: '1.5', 'underline-offset': '6px',
};

const GROUPS = [
  ['Layout', ['inset', 'inset-x', 'inset-y', 'top', 'right', 'bottom', 'left', 'start', 'end', 'z', 'aspect', 'columns', 'object']],
  ['Flexbox and grid', ['basis', 'flex', 'grow', 'shrink', 'order', 'grid-cols', 'grid-rows', 'col', 'col-span', 'col-start', 'col-end', 'row', 'row-span', 'row-start', 'row-end', 'auto-cols', 'auto-rows', 'gap', 'gap-x', 'gap-y']],
  ['Spacing', ['p', 'px', 'py', 'pt', 'pr', 'pb', 'pl', 'ps', 'pe', 'm', 'mx', 'my', 'mt', 'mr', 'mb', 'ml', 'ms', 'me', 'space-x', 'space-y', 'scroll-m', 'scroll-mt', 'scroll-p', 'scroll-pt']],
  ['Sizing', ['w', 'h', 'size', 'min-w', 'max-w', 'min-h', 'max-h']],
  ['Typography', ['text', 'font', 'leading', 'tracking', 'indent', 'decoration', 'underline-offset', 'line-clamp', 'list', 'align', 'content', 'placeholder']],
  ['Borders, outline and ring', ['border', 'border-x', 'border-y', 'border-t', 'border-r', 'border-b', 'border-l', 'border-s', 'border-e', 'rounded', 'rounded-t', 'rounded-r', 'rounded-b', 'rounded-l', 'rounded-tl', 'rounded-tr', 'rounded-br', 'rounded-bl', 'divide-x', 'divide-y', 'divide', 'outline', 'outline-offset', 'ring', 'ring-offset']],
  ['Colors and backgrounds', ['bg', 'from', 'via', 'to', 'fill', 'stroke', 'caret', 'accent']],
  ['Effects and filters', ['shadow', 'opacity', 'mix-blend', 'blur', 'brightness', 'contrast', 'saturate', 'grayscale', 'invert', 'sepia', 'hue-rotate', 'drop-shadow', 'backdrop-blur', 'backdrop-brightness']],
  ['Transitions and transforms', ['transition', 'duration', 'delay', 'ease', 'animate', 'scale', 'scale-x', 'scale-y', 'rotate', 'translate-x', 'translate-y', 'origin']],
  ['Interactivity', ['cursor', 'will-change']],
];

function familyRows() {
  const listed = new Set(GROUPS.flatMap(([, f]) => f));
  const rest = Object.keys(families).filter((f) => !listed.has(f));
  const groups = rest.length ? [...GROUPS, ['More', rest]] : GROUPS;
  return groups.flatMap(([group, list]) =>
    list
      .filter((f) => families[f])
      .map((f, i) => {
        const cls = `${f}-[${SAMPLE[f] || '3px'}]`;
        const c = compileClass(cls);
        const decls = c ? c.rules[0].decls.map(([p, v]) => `${p}: ${v}`).join('; ') : '';
        const notes = [COLOR_FAMILIES.has(f) ? 'color' : '', NEGATIVE.has(f) ? 'negative' : ''].filter(Boolean).join(', ');
        return [i ? '' : `**${group}**`, `\`${cls}\``, `\`${decls}\``, notes];
      }),
  );
}

export function arbitraryPage({ size = '', jsSize = '', version = '' } = {}) {
  const css = (cls) => compileClass(cls).rules.map(ruleCss).join('\n');
  return {
    slug: 'arbitrary-values',
    nav: 'Arbitrary values',
    title: 'Arbitrary values without a build step',
    metaTitle: 'Arbitrary values: w-[37px] and bg-[#0ea5e9] with no build | Monsoon docs',
    description: 'Write bg-[#0ea5e9], w-[37px] or md:grid-cols-[1fr_2fr] with no build step: the optional script writes the rules in the browser, the purge CLI compiles them for production.',
    keywords: 'arbitrary values css, w-[37px], bg-[#hex], arbitrary values without build, runtime css utilities, css variable shorthand',
    lead: `When a scale has no step that fits, write the value itself: \`w-[37px]\`, \`bg-[#0ea5e9]\`, \`grid-cols-[200px_1fr]\`. The stylesheet cannot contain values you invent, so they come from one of two places, neither of them a build step: a small script that writes the rules in the browser${size ? ` (${size} with brotli)` : ''}, or the purge CLI, which compiles them into the purged file.`,
    head: (u) => `<script src="${u('monsoon-arbitrary.js')}" defer></script>\n`,
    sections: [
      {
        h: 'Try it',
        blocks: [
          'This page loads the script, so these boxes are styled by classes that are not in the stylesheet. Switch the preview to dark to see the `dark:` value apply.',
          {
            demo: `<div class="grid grid-cols-[repeat(auto-fit,minmax(9rem,1fr))] gap-3">
  <div class="rounded-[14px] bg-[#0ea5e9] p-4 text-white font-[650]">bg-[#0ea5e9]</div>
  <div class="rounded-[14px] bg-[oklch(0.72_0.16_150)] p-4 text-[#06210f] font-[650]">oklch()</div>
  <div class="rounded-[14px] bg-red p-4 text-white font-[650]">bg-red</div>
  <div class="rounded-[14px] border-[3px] border-[#a855f7] p-4 text-[#a855f7] dark:text-[#e9d5ff] font-[650]">border-[3px]</div>
</div>
<p class="mt-3 h-[calc(2.5rem+6px)] leading-[calc(2.5rem+6px)] rounded-lg bg-muted px-4 text-[13px] tracking-[.02em]">h-[calc(2.5rem+6px)] and text-[13px]</p>`,
          },
          {
            code: `<div class="grid grid-cols-[repeat(auto-fit,minmax(9rem,1fr))] gap-3">
  <div class="rounded-[14px] bg-[#0ea5e9] p-4 text-white font-[650]">...</div>
  <div class="rounded-[14px] bg-[oklch(0.72_0.16_150)] p-4">...</div>
  <div class="rounded-[14px] border-[3px] border-[#a855f7] dark:text-[#e9d5ff]">...</div>
</div>`,
            lang: 'html',
            title: 'index.html',
          },
        ],
      },
      {
        h: 'The syntax',
        blocks: [
          {
            table: {
              head: ['You write', 'You get', 'Notes'],
              rows: [
                ['`w-[37px]`', '`width: 37px`', 'Any utility prefix that takes a value, followed by the value in brackets.'],
                ['`p-[3px_7px]`', '`padding: 3px 7px`', 'An underscore is a space. Write `\\_` for a real underscore.'],
                ['`h-[calc(100vh-4rem)]`', '`height: calc(100vh - 4rem)`', 'The spaces that `calc()`, `min()`, `max()` and `clamp()` need around `+` and `-` are added for you.'],
                ['`bg-[url(/img/hero_1.png)]`', '`background-image: url(/img/hero_1.png)`', 'Underscores inside `url()` stay underscores.'],
                ['`bg-(--brand)`', '`background-color: var(--brand)`', 'Parentheses take a custom property name: a short way to write `bg-[var(--brand)]`.'],
                ['`[mask-type:luminance]`', '`mask-type: luminance`', 'An arbitrary property: any property and value, in brackets.'],
                ['`bg-[red]/50`', '`color-mix(in oklab, red 50%, transparent)`', 'An opacity modifier, on the families that take a color.'],
                ['`-mt-[3px]`', '`margin-top: -3px`', 'A negative value, on margins, positions, translate, rotate, z-index and a few more.'],
                ["`content-['x']`", "`content: 'x'`", 'Use it with `before:` and `after:`.'],
                ['`text-[length:var(--size)]`', '`font-size: var(--size)`', 'A type hint for values that could mean two things.'],
              ],
            },
          },
          { h3: 'One prefix, two meanings' },
          'A few prefixes write a color or a size depending on the value, exactly like their static classes do (`border-2` and `border-primary`). The value decides:',
          {
            table: {
              head: ['Class', 'CSS', 'Why'],
              rows: [
                ['`border-[3px]`', '`border-width: 3px`', 'A length is a width.'],
                ['`border-[red]`', '`border-color: red`', 'A color, a color function or a color keyword is a color.'],
                ['`text-[13px]`', '`font-size: 13px`', 'A length is a font size.'],
                ['`text-[#eee]`', '`color: #eee`', 'A color is the text color.'],
                ['`font-[650]`', '`font-weight: 650`', 'A number is a weight, anything else is a family.'],
                ['`bg-[url(/a.png)]`', '`background-image: url(/a.png)`', 'Images and gradients are a background image.'],
                ['`bg-[cover]`, `bg-[center_top]`', '`background-size`, `background-position`', 'Size and position keywords.'],
                ['`shadow-[0_2px_8px_red]`', '`box-shadow` (it composes with `ring`)', 'A whole shadow. `shadow-[red]` sets only the shadow color.'],
              ],
            },
          },
          'When a value is ambiguous, for example a custom property, add a hint before a colon: `color:`, `length:`, `size:`, `position:`, `image:`, `number:`, `weight:` or `family-name:`. So `bg-[length:200px_100px]` is a background size and `border-(color:--edge)` is a border color.',
        ],
      },
      {
        h: 'Variants',
        blocks: [
          'Every prefix of the static classes works on arbitrary values, on every family, and they can be stacked. The order on the page is the same as in the stylesheet: plain values first, then states, then breakpoints from small to large, then container and media queries.',
          {
            code: `<div class="hover:bg-[#0369a1] md:w-[37rem] dark:text-[#eee]">
<div class="@container"><div class="grid @md:grid-cols-[1fr_2fr]">...</div></div>
<nav class="print:hidden rtl:mr-[3px]">
<p class="md:hover:underline-offset-[6px]">
<span class="before:content-['#'] before:mr-[.25em]">`,
            lang: 'html',
            title: 'variants.html',
          },
          'These are the rules the last line writes:',
          { code: [css("before:content-['#']"), css('md:hover:underline-offset-[6px]')].join('\n'), lang: 'css', title: 'generated.css' },
          'Besides the static variants, arbitrary values also take `before:`, `after:`, `placeholder:`, `selection:`, `marker:`, `file:`, `backdrop:`, `first-line:` and `first-letter:` (pseudo elements are always written last), plus `visited:`, `checked:`, `invalid:`, `required:`, `empty:`, `target:`, `open:`, `group-focus:` and `peer-focus:`.',
          'The `dark:` prefix uses the same rule as the rest of Monsoon: the nearest themed ancestor wins, at any depth.',
        ],
      },
      {
        h: 'Runtime or compiled',
        blocks: [
          'Both modes use the same parser, from `src/arbitrary/`, so a class means exactly the same thing in development and in production.',
          {
            tabs: [
              {
                label: 'Runtime',
                blocks: [
                  `Load the script. \`monsoon.js\` includes it next to the interactive layer; \`monsoon-arbitrary.js\` is the engine alone${size ? `, ${size} with brotli` : ''}.`,
                  {
                    code: `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/monsooncss${version ? `@${version}` : ''}">
<script src="https://cdn.jsdelivr.net/npm/monsooncss${version ? `@${version}` : ''}/dist/monsoon-arbitrary.js" defer></script>`,
                    lang: 'html',
                    title: 'index.html',
                  },
                  {
                    list: [
                      'On load it reads the class attributes of the page, and a `MutationObserver` catches every element added later and every class change, so it works with any library that renders HTML.',
                      'Each new class is compiled once and cached. Rules go into one constructed stylesheet with `adoptedStyleSheets`, or a `<style id="monsoon-arbitrary">` element in older browsers.',
                      'Rules are inserted in the order of the static stylesheet, so `w-[1px] md:w-[2px]` behaves the way you expect whatever order the classes appear in.',
                      'Classes without brackets or parentheses are skipped with one quick check, so static classes cost nothing.',
                    ],
                  },
                  'The engine has a small API on `Monsoon.arbitrary` (or `MonsoonArbitrary` for the standalone file): `scan(root)`, `add(className)`, `css()` to read the generated rules, `stop()` and `reset()`.',
                ],
              },
              {
                label: 'Compiled',
                blocks: [
                  'The purge CLI finds every arbitrary value class in your files and writes static rules for it after the utilities. Production then needs no script at all.',
                  { term: 'npx monsooncss purge "src/**/*.{html,jsx,vue,php}" -o public/monsoon.css', out: 'monsooncss purge: scanned 42 files\n  kept 512 of 16351 utility rules\n  compiled 18 arbitrary value classes' },
                  'Class names are found in any text: HTML attributes, JSX, template strings, arrays of classes. Every candidate goes through the same parser and the same safety checks as the runtime, so a stray `arr[i]` in your code is ignored. `--safelist` accepts arbitrary classes too, and `--no-arbitrary` turns compiling off.',
                ],
              },
            ],
          },
          { note: 'Arbitrary rules come after every static utility. A value you wrote on purpose wins over a scale step on the same element: with `p-[3px] md:p-4`, the arbitrary padding wins at every width. Put both on the arbitrary side (`md:p-[1rem]`) when you need a breakpoint to override it.' },
        ],
      },
      {
        h: 'Safety',
        blocks: [
          'Class attributes can come from user content, so the parser only accepts values that cannot leave their declaration. A class is ignored, and nothing is written, when its value:',
          {
            list: [
              'contains `;`, `{`, `}`, `@`, `!`, `<` or `>`, so it cannot end a declaration, open a rule or an at-rule, add `!important` or close a `<style>` element;',
              'contains a backslash other than `\\_`, so nothing can hide behind a CSS escape;',
              'contains a comment, a control character, `expression(` or `javascript:`;',
              'has unbalanced brackets, parentheses or quotes;',
              'is longer than 300 characters, or uses an unknown prefix or variant.',
            ],
          },
          'Selectors are escaped with the same rules as `CSS.escape`, and property names of arbitrary properties must be plain lowercase names or custom properties. The test suite feeds the parser a list of injection attempts and checks that none of them produces a rule.',
          { code: `bg-[red;color:blue]          ignored: ";"
w-[1px}]                     ignored: "}" and unbalanced
content-['</style>']         ignored: "<" and ">"
bg-[\\7d]                     ignored: escape
bg-[red_!important]          ignored: "!"`, lang: 'bash', title: 'rejected classes' },
        ],
      },
      {
        h: 'Every family',
        blocks: [
          'Each prefix maps to the same properties as the static classes with that prefix. The table is generated from the parser, so it is always complete.',
          { table: { head: ['Group', 'Example', 'CSS', 'Takes'], rows: familyRows() } },
        ],
      },
      {
        h: 'Bare color names',
        blocks: [
          'Every palette hue also works without a step: `bg-red`, `text-blue`, `border-emerald`, `ring-violet`, `from-sky`. These are static classes in the stylesheet, no script needed. They use step 500 in light mode and step 400 in dark mode, and follow the nearest themed ancestor like every semantic color.',
          { demo: '<div class="flex flex-wrap gap-2"><span class="rounded-md bg-red px-3 py-1 text-white">bg-red</span><span class="rounded-md bg-orange px-3 py-1 text-white">bg-orange</span><span class="rounded-md bg-emerald px-3 py-1 text-white">bg-emerald</span><span class="rounded-md bg-sky px-3 py-1 text-white">bg-sky</span><span class="rounded-md bg-violet px-3 py-1 text-white">bg-violet</span><span class="rounded-md border-2 border-pink px-3 py-1 text-pink">border-pink</span></div>' },
        ],
      },
    ],
    faqs: [
      ['Do I need the script in production?', 'No. Run `npx monsooncss purge` and the arbitrary classes are compiled into the purged stylesheet. Keep the script for prototypes, CMS content and pages you never purge.'],
      ['Does it slow the page down?', `The engine only looks at class names that contain a bracket or a parenthesis and compiles each distinct class once, so the work grows with the number of different arbitrary classes, not with the size of the page.${jsSize ? ` The whole interactive layer with the engine is ${jsSize} with brotli.` : ''}`],
      ['Can a user break my page with a class attribute?', 'Not through the engine: values that could end a declaration or open a rule are rejected before any CSS is written, see Safety above.'],
    ],
  };
}
