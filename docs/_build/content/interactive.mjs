// The "Interactive layer" docs page. It is a function so the build can pass
// the components that use the layer and the real file sizes.

export function interactivePage({ comps = [], size = '', version = '' }) {
  const list = comps.length
    ? comps.map((c) => `[${c.name}](../components/${c.slug}.html)`)
    : ['No component in this build needs the layer yet.'];
  return {
    slug: 'interactive-layer',
    nav: 'Interactive layer',
    title: 'The optional interactive layer',
    metaTitle: 'Interactive layer: monsoon.js | Monsoon docs',
    description: 'monsoon.js is an optional script that adds behavior to the few components CSS cannot finish alone, from data-m attributes, with events and a small API.',
    lead: `Almost every Monsoon component is CSS on native HTML and needs no script. A few cannot be finished in CSS alone, such as copying to the clipboard, dropping files or reordering a list. \`monsoon.js\` is the optional layer for those: one small script${size ? ` (${size} with gzip)` : ''} that enhances elements with \`data-m-*\` attributes.`,
    sections: [
      {
        h: 'When you need it',
        blocks: [
          'You only need the script when you use a component whose page shows the **Needs monsoon.js** badge. Everything else (dialogs, popovers, menus, tabs, toggles, accordions, forms) keeps working without it, because the browser does the work.',
          { list },
          'Without the script, those components still render with their full styling. Only the behavior that needs JavaScript is missing, so a page never breaks while the script loads.',
        ],
      },
      {
        h: 'Install it',
        blocks: [
          {
            tabs: [
              {
                label: 'CDN',
                blocks: [
                  'Add the script next to the stylesheet. It defines a global `Monsoon` and starts on its own.',
                  {
                    code: `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/monsooncss">
<script src="https://cdn.jsdelivr.net/npm/monsooncss/dist/monsoon.js" defer></script>`,
                    lang: 'html',
                    title: 'index.html',
                  },
                  `Pin a version in production, for example \`monsooncss@${version}/dist/monsoon.js\`.`,
                ],
              },
              {
                label: 'npm',
                blocks: [
                  { term: 'npm install monsooncss', title: 'bash' },
                  'The package exports two entry points. `monsooncss/js` is an ES module: import it and call `start()` once. `monsooncss/js/browser` is the same script the CDN serves, which starts itself.',
                  {
                    code: `import 'monsooncss';
import { start } from 'monsooncss/js';

start();`,
                    lang: 'js',
                    title: 'src/main.js',
                  },
                  {
                    code: `// or the self starting browser build
import 'monsooncss/js/browser';`,
                    lang: 'js',
                    title: 'src/main.js',
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        h: 'Data attributes',
        blocks: [
          'Each behavior is switched on with a `data-m-<name>` attribute. Options are more attributes with the same prefix: `data-m-<name>-<option>`. The script reads them when it enhances the element, so markup stays declarative and works in any template language.',
          {
            code: `<!-- copy a fixed string -->
<button class="btn" data-m-copy="npm i monsooncss">Copy</button>

<!-- copy the text of another element, with a custom confirmation label -->
<code id="key">sk_live_0000</code>
<button class="btn btn-soft" data-m-copy data-m-copy-target="#key" data-m-copy-done="Key copied">Copy key</button>`,
            lang: 'html',
            title: 'copy.html',
          },
          'Elements added later are enhanced automatically: the script watches the document with a `MutationObserver`, and it runs the cleanup of a component when its element is removed. That makes it safe with server rendered fragments, client side routing and any framework that inserts markup.',
        ],
      },
      {
        h: 'Events',
        blocks: [
          'Components report what happened with bubbling, cancelable DOM events named `monsoon:<event>`. Listen on the element or anywhere above it.',
          {
            code: `document.addEventListener('monsoon:copy', (event) => {
  console.log('copied', event.detail.text);
});

document.addEventListener('monsoon:copy-error', (event) => {
  console.warn('clipboard not available', event.detail.text);
});`,
            lang: 'js',
            title: 'events.js',
          },
          'Each component page with the badge lists its events under **JavaScript API**.',
        ],
      },
      {
        h: 'Programmatic API',
        blocks: [
          {
            table: {
              head: ['Function', 'What it does'],
              rows: [
                ['`start()`', 'Enhances the document and starts watching for new markup. The browser build calls it for you.'],
                ['`enhance(root?, names?)`', 'Enhances matching elements under `root` (the document by default), optionally only for some component names.'],
                ['`destroy(root)`', 'Runs the cleanup of every component on `root` and its descendants.'],
                ['`define(name, setup)`', 'Registers a component. `setup(el, options)` runs once per element with a `data-m-<name>` attribute and may return a cleanup function.'],
                ['`emit(el, name, detail)`', 'Dispatches a bubbling, cancelable `monsoon:<name>` event and returns whether it was not canceled.'],
                ['`components()`', 'Lists the names of the registered components.'],
              ],
            },
          },
          {
            code: `import { define, emit } from 'monsooncss/js';

// A tiny custom behavior: data-m-autofocus focuses the element once
define('autofocus', (el) => {
  el.focus();
  emit(el, 'autofocus', {});
});`,
            lang: 'js',
            title: 'my-components.js',
          },
        ],
      },
      {
        h: 'Purge and the script',
        blocks: [
          'The purge CLI only touches CSS, so the script and the stylesheet stay independent. Classes that a component adds at runtime are part of the component layer, which purge always keeps.',
          { note: 'The script never injects styles. Every visual state is a class or attribute styled in the stylesheet, so dark mode, `--seed` theming and utilities keep working on enhanced components.' },
        ],
      },
    ],
    faqs: [
      ['Do I need monsoon.js for dialogs and menus?', 'No. Dialogs use the native `dialog` element, menus and popovers use `details` or the `popover` attribute. The script is only for components marked with the Needs monsoon.js badge.'],
      ['Can I use it with a JavaScript framework?', 'Yes. It enhances any element with a `data-m-*` attribute, including markup a framework renders later, and cleans up when the element is removed.'],
    ],
  };
}
