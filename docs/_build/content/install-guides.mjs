// Per stack installation guides, rendered to docs/docs/install-<stack>.html.
// Strings use a tiny inline markup: `code`, **bold**, [text](url). No raw HTML.
// Every class in a code sample must exist in scripts/classes.json.
import { readFileSync } from 'node:fs';

const VERSION = JSON.parse(readFileSync(new URL('../../../package.json', import.meta.url), 'utf8')).version;
const CDN = `https://cdn.jsdelivr.net/npm/monsooncss@${VERSION}/dist/monsoon.min.css`;
const CDN_HOST = 'https://cdn.jsdelivr.net';

// Runs in <head> before first paint: stored choice first, then the OS setting.
const THEME =
  "(function(){var t;try{t=localStorage.getItem('monsoon-theme')}catch(e){}var d=t==='dark'||(t!=='light'&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.add(d?'dark':'light')})()";

const TOGGLE_JS = `const button = document.getElementById('theme-toggle');

button.addEventListener('click', () => {
  const root = document.documentElement;
  const next = root.classList.contains('dark') ? 'light' : 'dark';
  root.classList.remove('dark', 'light');
  root.classList.add(next);
  button.setAttribute('aria-pressed', String(next === 'dark'));
  try { localStorage.setItem('monsoon-theme', next); } catch (e) {}
});`;

const TOGGLE_BUTTON = `<button type="button" id="theme-toggle" class="rounded-lg border px-3 py-2 text-sm hover:bg-muted">
  Toggle theme
</button>`;

const CARD_HTML = `<article class="rounded-2xl border bg-surface p-6 shadow-sm space-y-4">
  <div class="flex items-center justify-between">
    <h2 class="text-lg font-semibold">Team plan</h2>
    <span class="rounded-full bg-secondary text-secondary-foreground px-2 py-1 text-xs font-medium">Popular</span>
  </div>
  <p class="text-muted-foreground">Shared projects, roles and a single invoice for everyone.</p>
  <button type="button" class="w-full rounded-lg bg-primary text-primary-foreground px-4 py-2 font-medium hover:bg-primary/90">
    Choose plan
  </button>
</article>`;

const PURGE_NOTE =
  "The purge CLI reads your files as plain text and keeps every class name it can see. It cannot see a name that is assembled at runtime, so write each class in full: `isActive ? 'bg-primary' : 'bg-muted'` survives a purge, `'bg-' + color` does not. Names that only exist at runtime (from a database, a CMS or an API) go in `--safelist bg-success,bg-danger`.";

const PURGE_KEEPS =
  'The purged file always keeps the reset, the theme tokens, the `.dark` and `.light` scopes and the keyframes, so dark mode and `--seed` keep working. See the [purge CLI reference](purge-cli.html) for every option.';

const TS_DECL_NOTE =
  "TypeScript 6 and newer check side effect imports by default (`noUncheckedSideEffectImports`), and a bare `import 'monsooncss'` has no type declaration, so `tsc` reports that it cannot find the module. Add a one line declaration file, for example `monsooncss.d.ts` containing `declare module 'monsooncss';`, somewhere your `tsconfig.json` includes.";

const SEED_LINK = 'Every semantic token (primary, secondary, accent, surfaces, muted text, borders and the focus ring) is derived from `--seed` in the browser. [Theming](theming.html) lists the tokens.';

function nextSteps(more = []) {
  return {
    h: 'Next steps',
    blocks: [
      {
        list: [
          'Browse every utility and its variants in the [class reference](../classes.html).',
          'Read how the scheme is chosen in [Dark mode](dark-mode.html), and how tokens are derived in [Theming](theming.html).',
          ...more,
        ],
      },
    ],
  };
}

export const installGuides = [
  // 1. Plain HTML
  {
    slug: 'install-html',
    nav: 'HTML',
    stack: 'Plain HTML',
    title: 'Install Monsoon in plain HTML',
    metaTitle: 'Install Monsoon in plain HTML | Monsoon docs',
    description: 'Add Monsoon to a plain HTML page with one link tag: utility classes, dark mode without a flash, a theme from one --seed color and an optional purge.',
    lead: 'Plain HTML is the shortest path to Monsoon. One `<link>` tag gives you every utility, the seed theme and dark mode. There is no Node.js to install, no config file and nothing to run.',
    sections: [
      {
        h: 'Install',
        blocks: [
          'Pick where the stylesheet comes from. The CDN is the quickest start, a local copy is the right call for intranets, offline kiosks or a strict content security policy.',
          {
            tabs: [
              {
                label: 'CDN',
                blocks: [
                  'Save this as `index.html` and open it in a browser. It already works from `file://`.',
                  {
                    code: `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>My page</title>
  <link rel="stylesheet" href="${CDN}">
  <script>${THEME}</script>
</head>
<body class="bg-background text-foreground antialiased">
  <main class="mx-auto max-w-2xl px-6 py-16 space-y-6">
    <h1 class="text-4xl font-extrabold tracking-tight">Hello, Monsoon</h1>
    <p class="text-lg text-muted-foreground">One stylesheet, no build step.</p>
  </main>
</body>
</html>`,
                    lang: 'html',
                    title: 'index.html',
                  },
                  `The URL pins version ${VERSION}, so the file never changes under you. For a quick prototype the short form \`https://cdn.jsdelivr.net/npm/monsooncss\` always serves the latest release. [Installing from a CDN](installation-cdn.html) covers pinning, unpkg and integrity hashes.`,
                ],
              },
              {
                label: 'npm',
                blocks: [
                  'Install the package, then copy the stylesheet next to your pages so it ships with the site:',
                  { term: 'npm install monsooncss\ncp node_modules/monsooncss/dist/monsoon.min.css css/monsoon.min.css', title: 'bash' },
                  {
                    code: `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>My page</title>
  <link rel="stylesheet" href="css/monsoon.min.css">
  <script>${THEME}</script>
</head>
<body class="bg-background text-foreground antialiased">
  <main class="mx-auto max-w-2xl px-6 py-16 space-y-6">
    <h1 class="text-4xl font-extrabold tracking-tight">Hello, Monsoon</h1>
    <p class="text-lg text-muted-foreground">Served from my own folder.</p>
  </main>
</body>
</html>`,
                    lang: 'html',
                    title: 'index.html',
                  },
                  'The package also ships a readable `dist/monsoon.css` if you want to read the rules while you work. [Installing with npm](installation-npm.html) explains both files.',
                ],
              },
            ],
          },
          { note: 'Load Monsoon before your own stylesheet. Your rules then win whenever the specificity is equal, without `!important`.' },
        ],
      },
      {
        h: 'Use the classes',
        blocks: [
          'Write classes straight into the `class` attribute. Responsive variants such as `md:grid-cols-3` and state variants such as `hover:bg-primary/90` are already in the file.',
          {
            code: `<section class="mx-auto max-w-5xl px-6 py-12">
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    ${CARD_HTML.split('\n').join('\n    ')}
  </div>
</section>`,
            lang: 'html',
            title: 'index.html',
          },
          'Static variants are not stacked (`md:hover:` does not exist). When a scale has no step that fits, write an arbitrary value such as `w-[37px]` (it needs `monsoon.js` or the purge CLI), a `style` attribute, or a few lines of your own CSS with the theme variables.',
        ],
      },
      {
        h: 'Dark mode',
        blocks: [
          'Without any extra code, Monsoon follows the operating system through `prefers-color-scheme`. A toggle needs two pieces: the one line script in `<head>` from the install step, which applies the saved choice before the first paint, and a button that flips the class on `<html>`.',
          {
            code: `${TOGGLE_BUTTON}

<script>
${TOGGLE_JS.split('\n').map((l) => (l ? '  ' + l : l)).join('\n')}
</script>`,
            lang: 'html',
            title: 'index.html',
          },
          'The class works on any element, not only `<html>`. A section with `class="dark"` stays dark on a light page, and its semantic colors follow:',
          {
            code: `<aside class="dark rounded-2xl bg-background text-foreground p-6">
  <p class="text-muted-foreground">This panel is always dark.</p>
</aside>`,
            lang: 'html',
            title: 'index.html',
          },
          { note: 'Keep the head script inline in `<head>`. Do not move it to the end of `<body>` or mark it `defer`: if it runs late, the page paints in the OS scheme first and then flips.' },
        ],
      },
      {
        h: 'Theme with --seed',
        blocks: [
          'Set `--seed` once for the page, or on any element to theme just that part:',
          {
            code: `<style>
  :root { --seed: #0d9488; }
</style>

<section style="--seed: #7c3aed" class="rounded-2xl bg-surface p-6 space-y-3">
  <h2 class="text-xl font-bold text-primary">Violet section</h2>
  <button type="button" class="rounded-lg bg-primary text-primary-foreground px-4 py-2">Primary</button>
</section>`,
            lang: 'html',
            title: 'index.html',
          },
          'A color input can drive the seed live, which is handy while you pick a brand color:',
          {
            code: `<input type="color" id="seed" value="#0d9488">

<script>
  document.getElementById('seed').addEventListener('input', (event) => {
    document.documentElement.style.setProperty('--seed', event.target.value);
  });
</script>`,
            lang: 'html',
            title: 'index.html',
          },
          SEED_LINK,
        ],
      },
      {
        h: 'Using the purge CLI',
        blocks: [
          'The full file is cached after the first visit, so many sites never purge. When you want the smallest possible file, scan your pages once and write a stylesheet with only the rules they use. Add a script to `package.json`:',
          {
            code: `{
  "private": true,
  "scripts": {
    "css:purge": "monsooncss purge \\"**/*.html\\" \\"js/**/*.js\\" -o css/monsoon.css"
  },
  "devDependencies": {
    "monsooncss": "^${VERSION}"
  }
}`,
            lang: 'json',
            title: 'package.json',
          },
          { term: 'npm run css:purge', title: 'bash' },
          'Then point the `<link>` at `css/monsoon.css` instead of the CDN URL or the full copy. Run the script again whenever you add classes. Without a `package.json`, `npx monsooncss purge "**/*.html" -o css/monsoon.css` does the same in one line.',
          { note: PURGE_NOTE },
          PURGE_KEEPS,
        ],
      },
      nextSteps(['Using a framework? Start from [React](install-react.html), [Vue](install-vue.html) or [PHP](install-php.html).']),
    ],
    faqs: [
      ['Do I need Node.js to use Monsoon in plain HTML?', 'No. The CDN link is all you need. Node.js is only used if you install the package with npm or run the purge CLI.'],
      ['Can I open the page straight from disk?', 'Yes. The stylesheet has no runtime and no build step, so `file://`, a local server and production all behave the same.'],
    ],
  },

  // 2. React with Vite
  {
    slug: 'install-react',
    nav: 'React',
    stack: 'React with Vite',
    title: 'Install Monsoon in React with Vite',
    metaTitle: 'Install Monsoon in React with Vite | Monsoon docs',
    description: 'Use Monsoon in a React app built with Vite: import it in src/main.jsx or link the CDN, use className, add a dark mode toggle and purge for production.',
    lead: 'In a Vite React app Monsoon is one import in `src/main.jsx`. Vite resolves `monsooncss` to the prebuilt stylesheet, bundles it with your own CSS and fingerprints the file. Components just use `className`.',
    sections: [
      {
        h: 'Install',
        blocks: [
          'Start from `npm create vite@latest my-app -- --template react` (or `react-ts`), then choose one of the two setups.',
          {
            tabs: [
              {
                label: 'CDN',
                blocks: [
                  'Link the stylesheet in the root `index.html`. Vite leaves external URLs alone.',
                  {
                    code: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My app</title>
    <link rel="stylesheet" href="${CDN}" />
    <script>${THEME}</script>
  </head>
  <body class="bg-background text-foreground antialiased">
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`,
                    lang: 'html',
                    title: 'index.html',
                  },
                ],
              },
              {
                label: 'npm',
                blocks: [
                  { term: 'npm install monsooncss', title: 'bash' },
                  'Import the package once, at the top of the entry file and before your own styles:',
                  {
                    code: `import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'monsooncss';
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);`,
                    lang: 'jsx',
                    title: 'src/main.jsx',
                  },
                  "`'monsooncss'` resolves to `dist/monsoon.min.css` through the package `exports`. Use `'monsooncss/css'` for the readable build. Do not import `'monsooncss/dist/monsoon.min.css'`: that path is not exported, and Vite stops with a missing specifier error.",
                  { note: TS_DECL_NOTE.replace('somewhere your `tsconfig.json` includes', 'in `src/`') },
                ],
              },
            ],
          },
          { note: 'The Vite starter ships demo rules in `src/index.css` and `src/App.css` (a centered `#root`, its own colors). Empty or delete them, otherwise they paint over the Monsoon theme.' },
        ],
      },
      {
        h: 'Use the classes',
        blocks: [
          'Classes go in `className`. Keep every class name as a complete string, even when it is conditional, so the purge step can find it later:',
          {
            code: `const tones = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
};

export function Button({ tone = 'primary', className = '', ...props }) {
  return (
    <button
      type="button"
      className={'rounded-lg px-4 py-2 font-medium ' + tones[tone] + ' ' + className}
      {...props}
    />
  );
}

export function PlanCard({ name, price, featured = false }) {
  return (
    <article className={featured ? 'rounded-2xl border bg-surface p-6 space-y-4 ring-2 ring-ring' : 'rounded-2xl border bg-surface p-6 space-y-4 shadow-sm'}>
      <h2 className="text-lg font-semibold">{name}</h2>
      <p className="text-3xl font-bold">{price}</p>
      <Button tone={featured ? 'primary' : 'secondary'} className="w-full">
        Choose {name}
      </Button>
    </article>
  );
}`,
            lang: 'jsx',
            title: 'src/components/PlanCard.jsx',
          },
          {
            code: `import { PlanCard } from './components/PlanCard.jsx';

export default function App() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <PlanCard name="Starter" price="$0" />
        <PlanCard name="Team" price="$12" featured />
        <PlanCard name="Business" price="$40" />
      </div>
    </main>
  );
}`,
            lang: 'jsx',
            title: 'src/App.jsx',
          },
        ],
      },
      {
        h: 'Dark mode',
        blocks: [
          'Keep the head script from the install step in `index.html` in both setups: it runs before React loads, so the first paint already has the right scheme. The toggle then only flips the class and remembers the choice:',
          {
            code: `import { useState } from 'react';

function readTheme() {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState(readTheme);

  function toggle() {
    const next = theme === 'dark' ? 'light' : 'dark';
    const root = document.documentElement;
    root.classList.remove('dark', 'light');
    root.classList.add(next);
    try { localStorage.setItem('monsoon-theme', next); } catch (e) {}
    setTheme(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={theme === 'dark'}
      className="rounded-lg border px-3 py-2 text-sm hover:bg-muted"
    >
      {theme === 'dark' ? 'Light mode' : 'Dark mode'}
    </button>
  );
}`,
            lang: 'jsx',
            title: 'src/components/ThemeToggle.jsx',
          },
          "To force a scheme on one part of the tree, add the class to that element: `<aside className=\"dark bg-background text-foreground p-6\">`.",
        ],
      },
      {
        h: 'Theme with --seed',
        blocks: [
          'React passes custom properties in the `style` object as they are, so the seed can come from state, props or a user setting:',
          {
            code: `import { useState } from 'react';

export default function BrandPreview() {
  const [seed, setSeed] = useState('#0d9488');

  return (
    <section style={{ '--seed': seed }} className="rounded-2xl bg-surface p-6 space-y-4">
      <input type="color" value={seed} onChange={(e) => setSeed(e.target.value)} />
      <button type="button" className="rounded-lg bg-primary text-primary-foreground px-4 py-2">
        Primary
      </button>
    </section>
  );
}`,
            lang: 'jsx',
            title: 'src/components/BrandPreview.jsx',
          },
          "In TypeScript, cast the object: `style={{ '--seed': seed } as React.CSSProperties}`. " + SEED_LINK,
        ],
      },
      {
        h: 'Using the purge CLI',
        blocks: [
          'Write the purged file before every production build:',
          {
            code: `{
  "scripts": {
    "dev": "vite",
    "css:purge": "monsooncss purge \\"index.html\\" \\"src/**/*.{js,jsx,ts,tsx}\\" -o src/monsoon.purged.css",
    "build": "npm run css:purge && vite build",
    "preview": "vite preview"
  }
}`,
            lang: 'json',
            title: 'package.json',
          },
          "Then let Vite swap the import only for builds. `import 'monsooncss'` stays in `src/main.jsx`, development keeps the full file (so a new class works the moment you type it), and `vite build` bundles the purged one:",
          {
            code: `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

const purged = fileURLToPath(new URL('./src/monsoon.purged.css', import.meta.url));

export default defineConfig(({ command }) => ({
  plugins: [react()],
  resolve: {
    alias: command === 'build' ? { monsooncss: purged } : {},
  },
}));`,
            lang: 'js',
            title: 'vite.config.js',
          },
          'Using the CDN setup instead? Write to `public/monsoon.css` and change the `<link>` in `index.html` to `/monsoon.css`.',
          { note: PURGE_NOTE },
          PURGE_KEEPS,
        ],
      },
      nextSteps(['Server rendering? See [Next.js](install-nextjs.html) or [Remix](install-remix.html).']),
    ],
    faqs: [
      ['Does Monsoon need a PostCSS or Vite plugin in React?', 'No. It is a finished stylesheet, so Vite handles it like any other CSS import. Nothing scans your components in development.'],
      ['Can I import Monsoon from a component instead of main.jsx?', 'You can, but import it once at the entry point. Vite then places it before component styles, and your own rules keep winning on equal specificity.'],
    ],
  },

  // 3. Next.js
  {
    slug: 'install-nextjs',
    nav: 'Next.js',
    stack: 'Next.js',
    title: 'Install Monsoon in Next.js',
    metaTitle: 'Install Monsoon in Next.js | Monsoon docs',
    description: 'Add Monsoon to a Next.js App Router project: import it in app/layout.tsx, set dark mode before hydration and purge for production builds.',
    lead: 'In the App Router, global CSS belongs in the root layout. Import Monsoon in `app/layout.tsx`, put the theme script in `<head>` and you can use `className` everywhere, in server and client components alike.',
    sections: [
      {
        h: 'Install',
        blocks: [
          'These examples assume a project created with `npx create-next-app@latest` and the `app/` directory. If you chose `src/`, the files live in `src/app/`.',
          {
            tabs: [
              {
                label: 'CDN',
                blocks: [
                  {
                    code: `import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'My app',
};

const themeScript = "${THEME}";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="${CDN}" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="bg-background text-foreground antialiased">{children}</body>
    </html>
  );
}`,
                    lang: 'tsx',
                    title: 'app/layout.tsx',
                  },
                ],
              },
              {
                label: 'npm',
                blocks: [
                  { term: 'npm install monsooncss', title: 'bash' },
                  {
                    code: `import type { Metadata } from 'next';
import 'monsooncss';
import './globals.css';

export const metadata: Metadata = {
  title: 'My app',
};

const themeScript = "${THEME}";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="bg-background text-foreground antialiased">{children}</body>
    </html>
  );
}`,
                    lang: 'tsx',
                    title: 'app/layout.tsx',
                  },
                  'Next.js allows global CSS imports from `node_modules` in the root layout, and `monsooncss` resolves to the minified stylesheet through the package `exports`.',
                  {
                    code: `declare module 'monsooncss';`,
                    lang: 'ts',
                    title: 'monsooncss.d.ts',
                  },
                  'That one line file at the project root keeps `next build` from failing its type check: TypeScript 6 and newer reject a side effect import that has no type declaration.',
                ],
              },
            ],
          },
          { note: '`suppressHydrationWarning` on `<html>` is required. The head script adds `dark` or `light` to that element before React hydrates, so the class differs from the server HTML on purpose. The attribute only silences that one element, not its children.' },
          { note: 'If `create-next-app` filled `app/globals.css` with another utility setup, clear it so two resets do not compete.' },
        ],
      },
      {
        h: 'Use the classes',
        blocks: [
          'Server components can use every class, since nothing runs in the browser to apply them. Conditional classes stay as full strings:',
          {
            code: `import Link from 'next/link';

type Plan = { name: string; price: string; href: string; featured?: boolean };

export function PlanCard({ name, price, href, featured = false }: Plan) {
  return (
    <article className={featured ? 'rounded-2xl border bg-surface p-6 space-y-4 ring-2 ring-ring' : 'rounded-2xl border bg-surface p-6 space-y-4 shadow-sm'}>
      <h2 className="text-lg font-semibold">{name}</h2>
      <p className="text-3xl font-bold">{price}</p>
      <Link
        href={href}
        className={featured ? 'block rounded-lg bg-primary text-primary-foreground px-4 py-2 text-center font-medium hover:bg-primary/90' : 'block rounded-lg bg-secondary text-secondary-foreground px-4 py-2 text-center font-medium hover:bg-secondary/80'}
      >
        Choose {name}
      </Link>
    </article>
  );
}`,
            lang: 'tsx',
            title: 'components/PlanCard.tsx',
          },
          {
            code: `import { PlanCard } from '@/components/PlanCard';

export default function PricingPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <PlanCard name="Starter" price="$0" href="/signup" />
        <PlanCard name="Team" price="$12" href="/signup?plan=team" featured />
        <PlanCard name="Business" price="$40" href="/contact" />
      </div>
    </main>
  );
}`,
            lang: 'tsx',
            title: 'app/pricing/page.tsx',
          },
        ],
      },
      {
        h: 'Dark mode',
        blocks: [
          'The head script in the layout picks the scheme before the first paint. The toggle is a small client component that does not read the theme while rendering, so the server and client markup always match:',
          {
            code: `'use client';

export function ThemeToggle() {
  function toggle() {
    const root = document.documentElement;
    const next = root.classList.contains('dark') ? 'light' : 'dark';
    root.classList.remove('dark', 'light');
    root.classList.add(next);
    try { localStorage.setItem('monsoon-theme', next); } catch (e) {}
  }

  return (
    <button type="button" onClick={toggle} className="rounded-lg border px-3 py-2 text-sm hover:bg-muted">
      Toggle theme
    </button>
  );
}`,
            lang: 'tsx',
            title: 'components/ThemeToggle.tsx',
          },
          'If you want the label to show the current scheme, read the class in a `useEffect` after mount, never during render, or the first client render will not match the server HTML.',
          'A section can opt out of the page scheme with the class alone: `<aside className="dark bg-background text-foreground p-6">` renders dark on every page.',
        ],
      },
      {
        h: 'Theme with --seed',
        blocks: [
          'Because the seed is a plain custom property, a server component can set it from data, and the themed HTML arrives ready to paint:',
          {
            code: `import { getTeam } from '@/lib/teams';

export default async function TeamLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ team: string }>;
}) {
  const { team } = await params;
  const { brandColor } = await getTeam(team);

  return (
    <div style={{ '--seed': brandColor } as React.CSSProperties} className="min-h-dvh bg-background">
      {children}
    </div>
  );
}`,
            lang: 'tsx',
            title: 'app/[team]/layout.tsx',
          },
          'Validate stored colors on the server (a hex pattern such as `^#[0-9a-fA-F]{6}$` is enough). ' + SEED_LINK,
        ],
      },
      {
        h: 'Using the purge CLI',
        blocks: [
          'Generate the purged file before `next build`:',
          {
            code: `{
  "scripts": {
    "dev": "next dev",
    "css:purge": "monsooncss purge \\"app/**/*.{js,jsx,ts,tsx,mdx}\\" \\"components/**/*.{js,jsx,ts,tsx}\\" -o app/monsoon.purged.css",
    "build": "npm run css:purge && next build",
    "start": "next start"
  }
}`,
            lang: 'json',
            title: 'package.json',
          },
          "Then alias the import for production only. The layout keeps `import 'monsooncss'`; `next dev` loads the full file and `next build` the purged one:",
          {
            code: `import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias:
      process.env.NODE_ENV === 'production'
        ? { monsooncss: './app/monsoon.purged.css' }
        : {},
  },
};

export default nextConfig;`,
            lang: 'ts',
            title: 'next.config.ts',
          },
          'If you still build with webpack (`next build --webpack`), add the same alias to `config.resolve.alias` in the `webpack` function instead. With the CDN setup, write to `public/monsoon.css` and link `/monsoon.css`.',
          { note: PURGE_NOTE },
          PURGE_KEEPS,
        ],
      },
      nextSteps(['Using the Pages Router? Import `monsooncss` in `pages/_app.tsx` and put the head script in `pages/_document.tsx`.']),
    ],
    faqs: [
      ['Why does Next.js warn about a hydration mismatch on the html element?', 'The head script changes the class on `<html>` before React hydrates. Add `suppressHydrationWarning` to that element, as in the layout above.'],
      ['Does Monsoon work with React Server Components?', 'Yes. It is plain CSS with no runtime, so server components, client components and static export all render the same classes.'],
      ['Should I use next/script for the theme script?', 'A plain inline `<script>` in the root layout `<head>` is enough and runs before paint. `next/script` with `beforeInteractive` also works, but it adds nothing here.'],
    ],
  },

  // 4. Vue 3 with Vite
  {
    slug: 'install-vue',
    nav: 'Vue',
    stack: 'Vue 3 with Vite',
    title: 'Install Monsoon in Vue 3 with Vite',
    metaTitle: 'Install Monsoon in Vue 3 with Vite | Monsoon docs',
    description: 'Set up Monsoon in a Vue 3 and Vite app: import it in src/main.js, bind classes with :class, theme with :style and purge for production.',
    lead: 'Vue templates and utility classes fit together naturally: static classes go in `class`, conditional ones in `:class`, and the seed color in `:style`. Monsoon itself is one import in `src/main.js`.',
    sections: [
      {
        h: 'Install',
        blocks: [
          'Start from `npm create vue@latest` or `npm create vite@latest my-app -- --template vue`.',
          {
            tabs: [
              {
                label: 'CDN',
                blocks: [
                  {
                    code: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My app</title>
    <link rel="stylesheet" href="${CDN}" />
    <script>${THEME}</script>
  </head>
  <body class="bg-background text-foreground antialiased">
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>`,
                    lang: 'html',
                    title: 'index.html',
                  },
                ],
              },
              {
                label: 'npm',
                blocks: [
                  { term: 'npm install monsooncss', title: 'bash' },
                  {
                    code: `import { createApp } from 'vue';
import 'monsooncss';
import './style.css';
import App from './App.vue';

createApp(App).mount('#app');`,
                    lang: 'js',
                    title: 'src/main.js',
                  },
                  'Keep the head script from the CDN tab in `index.html` too: it is what prevents a flash of the wrong scheme.',
                  { note: TS_DECL_NOTE.replace('somewhere your `tsconfig.json` includes', 'in `src/`') + ' This matters when `vue-tsc` runs as part of `npm run build`.' },
                ],
              },
            ],
          },
          { note: 'The starter `src/style.css` (or `src/assets/main.css`) sets its own colors and layout. Clear it so it does not override the theme.' },
        ],
      },
      {
        h: 'Use the classes',
        blocks: [
          'Static classes and `:class` merge on the same element. The object syntax keeps each class name whole, which also keeps it visible to the purge step:',
          {
            code: `<script setup>
defineProps({
  name: String,
  price: String,
  featured: { type: Boolean, default: false },
});
</script>

<template>
  <article
    class="rounded-2xl border bg-surface p-6 space-y-4"
    :class="{ 'ring-2 ring-ring': featured, 'shadow-sm': !featured }"
  >
    <h2 class="text-lg font-semibold">{{ name }}</h2>
    <p class="text-3xl font-bold">{{ price }}</p>
    <button
      type="button"
      class="w-full rounded-lg px-4 py-2 font-medium"
      :class="featured ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'"
    >
      Choose {{ name }}
    </button>
  </article>
</template>`,
            lang: 'vue',
            title: 'src/components/PlanCard.vue',
          },
          {
            code: `<script setup>
import PlanCard from './components/PlanCard.vue';
</script>

<template>
  <main class="mx-auto max-w-5xl px-6 py-12">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <PlanCard name="Starter" price="$0" />
      <PlanCard name="Team" price="$12" featured />
      <PlanCard name="Business" price="$40" />
    </div>
  </main>
</template>`,
            lang: 'vue',
            title: 'src/App.vue',
          },
        ],
      },
      {
        h: 'Dark mode',
        blocks: [
          'A small composable shares the current scheme across components. It starts from the class the head script already set:',
          {
            code: `import { ref } from 'vue';

const theme = ref(document.documentElement.classList.contains('dark') ? 'dark' : 'light');

export function useTheme() {
  function toggle() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark';
    const root = document.documentElement;
    root.classList.remove('dark', 'light');
    root.classList.add(theme.value);
    try { localStorage.setItem('monsoon-theme', theme.value); } catch (e) {}
  }
  return { theme, toggle };
}`,
            lang: 'js',
            title: 'src/composables/useTheme.js',
          },
          {
            code: `<script setup>
import { useTheme } from '../composables/useTheme';

const { theme, toggle } = useTheme();
</script>

<template>
  <button
    type="button"
    class="rounded-lg border px-3 py-2 text-sm hover:bg-muted"
    :aria-pressed="theme === 'dark'"
    @click="toggle"
  >
    {{ theme === 'dark' ? 'Light mode' : 'Dark mode' }}
  </button>
</template>`,
            lang: 'vue',
            title: 'src/components/ThemeToggle.vue',
          },
          'To pin one region to a scheme, bind the class on it: `<aside class="bg-background text-foreground p-6" :class="{ dark: alwaysDark }">`.',
        ],
      },
      {
        h: 'Theme with --seed',
        blocks: [
          'Vue sets custom properties from a `:style` object directly:',
          {
            code: `<script setup>
import { ref } from 'vue';

const seed = ref('#0d9488');
</script>

<template>
  <section class="rounded-2xl bg-surface p-6 space-y-4" :style="{ '--seed': seed }">
    <input v-model="seed" type="color" />
    <button type="button" class="rounded-lg bg-primary text-primary-foreground px-4 py-2">Primary</button>
  </section>
</template>`,
            lang: 'vue',
            title: 'src/components/BrandPreview.vue',
          },
          SEED_LINK,
        ],
      },
      {
        h: 'Using the purge CLI',
        blocks: [
          {
            code: `{
  "scripts": {
    "dev": "vite",
    "css:purge": "monsooncss purge \\"index.html\\" \\"src/**/*.{vue,js,ts}\\" -o src/monsoon.purged.css",
    "build": "npm run css:purge && vite build",
    "preview": "vite preview"
  }
}`,
            lang: 'json',
            title: 'package.json',
          },
          "Alias the package to the purged file for builds only, so `import 'monsooncss'` loads the full file in development:",
          {
            code: `import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath } from 'node:url';

const purged = fileURLToPath(new URL('./src/monsoon.purged.css', import.meta.url));

export default defineConfig(({ command }) => ({
  plugins: [vue()],
  resolve: {
    alias: command === 'build' ? { monsooncss: purged } : {},
  },
}));`,
            lang: 'js',
            title: 'vite.config.js',
          },
          'If your config already has `resolve.alias` (the create-vue template defines `@`), merge the two objects. With the CDN setup, write to `public/monsoon.css` and change the `<link>` to `/monsoon.css`.',
          { note: PURGE_NOTE + " In Vue that means quoted keys in `:class` objects, such as `{ 'bg-primary': active }`." },
          PURGE_KEEPS,
        ],
      },
      nextSteps(['Server rendering with Vue? See [Nuxt](install-nuxt.html).']),
    ],
    faqs: [
      ['Can I use Monsoon classes inside scoped styles?', 'Monsoon classes go in templates. Inside `<style scoped>` use the theme variables instead, for example `color: var(--primary)`.'],
      ['Does Monsoon conflict with Vue transitions?', 'No. Vue adds its own transition classes, and Monsoon utilities such as `transition` and `duration-200` work on the same elements.'],
    ],
  },

  // 5. Nuxt 3
  {
    slug: 'install-nuxt',
    nav: 'Nuxt',
    stack: 'Nuxt 3',
    title: 'Install Monsoon in Nuxt 3',
    metaTitle: 'Install Monsoon in Nuxt 3 | Monsoon docs',
    description: 'Add Monsoon to Nuxt 3 through nuxt.config.ts: the css array or app.head.link, a theme script that runs before paint, and a purged file for builds.',
    lead: 'Nuxt reads global styles and head tags from `nuxt.config.ts`, so the whole setup lives in one file. The same configuration works in Nuxt 4, where components and assets move under `app/`.',
    sections: [
      {
        h: 'Install',
        blocks: [
          {
            tabs: [
              {
                label: 'CDN',
                blocks: [
                  {
                    code: `export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  app: {
    head: {
      link: [{ rel: 'stylesheet', href: '${CDN}' }],
      script: [{ innerHTML: "${THEME}" }],
    },
  },
});`,
                    lang: 'ts',
                    title: 'nuxt.config.ts',
                  },
                ],
              },
              {
                label: 'npm',
                blocks: [
                  { term: 'npm install monsooncss', title: 'bash' },
                  {
                    code: `export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  css: ['monsooncss'],
  app: {
    head: {
      script: [{ innerHTML: "${THEME}" }],
    },
  },
});`,
                    lang: 'ts',
                    title: 'nuxt.config.ts',
                  },
                  'Nuxt resolves `monsooncss` through the package `exports` and adds the stylesheet to every page, server rendered and client side.',
                ],
              },
            ],
          },
          { note: 'The theme script goes in `app.head.script`, not in a plugin. Plugins run after the HTML has painted, which is too late to avoid a flash of the wrong scheme.' },
        ],
      },
      {
        h: 'Use the classes',
        blocks: [
          'Components are auto imported, and classes work exactly as in any Vue template, with `class` for static names and `:class` for conditional ones:',
          {
            code: `<script setup lang="ts">
defineProps<{ name: string; price: string; featured?: boolean }>();
</script>

<template>
  <article
    class="rounded-2xl border bg-surface p-6 space-y-4"
    :class="featured ? 'ring-2 ring-ring' : 'shadow-sm'"
  >
    <h2 class="text-lg font-semibold">{{ name }}</h2>
    <p class="text-3xl font-bold">{{ price }}</p>
    <NuxtLink
      to="/signup"
      class="block rounded-lg px-4 py-2 text-center font-medium"
      :class="featured ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'"
    >
      Choose {{ name }}
    </NuxtLink>
  </article>
</template>`,
            lang: 'vue',
            title: 'components/PlanCard.vue',
          },
          {
            code: `<template>
  <main class="mx-auto max-w-5xl px-6 py-12">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <PlanCard name="Starter" price="$0" />
      <PlanCard name="Team" price="$12" featured />
      <PlanCard name="Business" price="$40" />
    </div>
  </main>
</template>`,
            lang: 'vue',
            title: 'pages/pricing.vue',
          },
        ],
      },
      {
        h: 'Dark mode',
        blocks: [
          'On the server there is no `localStorage`, so the toggle reads the class only after mount. Server and client render the same first label, and hydration stays clean:',
          {
            code: `<script setup lang="ts">
const isDark = ref(false);

onMounted(() => {
  isDark.value = document.documentElement.classList.contains('dark');
});

function toggle() {
  isDark.value = !isDark.value;
  const theme = isDark.value ? 'dark' : 'light';
  const root = document.documentElement;
  root.classList.remove('dark', 'light');
  root.classList.add(theme);
  try { localStorage.setItem('monsoon-theme', theme); } catch (e) {}
}
</script>

<template>
  <button
    type="button"
    class="rounded-lg border px-3 py-2 text-sm hover:bg-muted"
    :aria-pressed="isDark"
    @click="toggle"
  >
    {{ isDark ? 'Light mode' : 'Dark mode' }}
  </button>
</template>`,
            lang: 'vue',
            title: 'components/ThemeToggle.vue',
          },
          { note: 'Do not also set the class through `useHead({ htmlAttrs: { class } })`. Nuxt would then own that attribute and could remove the class the head script added.' },
        ],
      },
      {
        h: 'Theme with --seed',
        blocks: [
          'Set the seed for the whole document from server data with `useHead`, so the first HTML is already themed:',
          {
            code: `<script setup lang="ts">
const { data: team } = await useFetch('/api/team');

useHead({
  htmlAttrs: {
    style: () => '--seed: ' + (team.value?.brandColor ?? '#0d9488'),
  },
});
</script>

<template>
  <NuxtPage />
</template>`,
            lang: 'vue',
            title: 'app.vue',
          },
          "For a single component, bind it inline: `<section :style=\"{ '--seed': color }\">`. Validate colors that come from users before you render them. " + SEED_LINK,
        ],
      },
      {
        h: 'Using the purge CLI',
        blocks: [
          {
            code: `{
  "scripts": {
    "dev": "nuxt dev",
    "css:purge": "monsooncss purge \\"app.vue\\" \\"{components,layouts,pages}/**/*.{vue,ts}\\" -o assets/css/monsoon.purged.css",
    "build": "npm run css:purge && nuxt build"
  }
}`,
            lang: 'json',
            title: 'package.json',
          },
          'Nuxt environment overrides pick the right file: the full package while you develop, the purged file when you build.',
          {
            code: `export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  $development: { css: ['monsooncss'] },
  $production: { css: ['~/assets/css/monsoon.purged.css'] },
  app: {
    head: {
      script: [{ innerHTML: "${THEME}" }],
    },
  },
});`,
            lang: 'ts',
            title: 'nuxt.config.ts',
          },
          'In Nuxt 4 the source folder is `app/`, so scan `"app/**/*.{vue,ts}"` and write to `app/assets/css/monsoon.purged.css` (the `~` alias already points there).',
          { note: PURGE_NOTE },
          PURGE_KEEPS,
        ],
      },
      nextSteps(['Client side Vue only? See [Vue 3 with Vite](install-vue.html).']),
    ],
    faqs: [
      ['Should I use the css array or app.head.link?', 'Use `css` when you install from npm: Nuxt bundles and fingerprints the file. Use `app.head.link` for the CDN, since there is nothing to bundle.'],
      ['Does this work with static generation?', 'Yes. `nuxt generate` writes the same head script and stylesheet into every page.'],
    ],
  },

  // 6. Angular
  {
    slug: 'install-angular',
    nav: 'Angular',
    stack: 'Angular',
    title: 'Install Monsoon in Angular',
    metaTitle: 'Install Monsoon in Angular | Monsoon docs',
    description: 'Install Monsoon in Angular with the angular.json styles array, an @import or a CDN link, then use [class.dark] and [style.--seed] bindings.',
    lead: 'Angular has three good places for a global stylesheet: the `styles` array in `angular.json`, an `@import` in `src/styles.css`, or a `<link>` in `src/index.html`. Templates then use plain `class` attributes plus `[class.x]` and `[style.--seed]` bindings.',
    sections: [
      {
        h: 'Install',
        blocks: [
          {
            tabs: [
              {
                label: 'CDN',
                blocks: [
                  {
                    code: `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>MyApp</title>
  <base href="/">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" type="image/x-icon" href="favicon.ico">
  <link rel="stylesheet" href="${CDN}">
  <script>${THEME}</script>
</head>
<body class="bg-background text-foreground antialiased">
  <app-root></app-root>
</body>
</html>`,
                    lang: 'html',
                    title: 'src/index.html',
                  },
                ],
              },
              {
                label: 'npm',
                blocks: [
                  { term: 'npm install monsooncss', title: 'bash' },
                  'Add the file to the build target, before your own `src/styles.css` so your rules win:',
                  {
                    code: `{
  "projects": {
    "my-app": {
      "architect": {
        "build": {
          "options": {
            "styles": [
              "node_modules/monsooncss/dist/monsoon.min.css",
              "src/styles.css"
            ]
          }
        }
      }
    }
  }
}`,
                    lang: 'json',
                    title: 'angular.json',
                  },
                  "Only the `styles` entry changes; leave the rest of `angular.json` as it is. The equivalent in CSS is one line at the top of `src/styles.css`: `@import 'monsooncss';`. In both cases keep the head script from the CDN tab in `src/index.html`.",
                ],
              },
            ],
          },
          { warn: 'Angular budgets measure the uncompressed size of the initial bundle, and the full stylesheet is over the 500 kB warning that new projects set for `initial`. Raise that budget in the `production` configuration, or ship the purged file (see below), which is the better fix.' },
        ],
      },
      {
        h: 'Use the classes',
        blocks: [
          'Static classes go in `class`. For conditional ones, prefer a `[class]` binding with full strings; Angular merges it with the static attribute:',
          {
            code: `import { Component, input } from '@angular/core';

@Component({
  selector: 'app-plan-card',
  template: \`
    <article
      class="rounded-2xl border bg-surface p-6 space-y-4"
      [class]="featured() ? 'ring-2 ring-ring' : 'shadow-sm'"
    >
      <h2 class="text-lg font-semibold">{{ name() }}</h2>
      <p class="text-3xl font-bold">{{ price() }}</p>
      <button
        type="button"
        class="w-full rounded-lg px-4 py-2 font-medium"
        [class.bg-primary]="featured()"
        [class.text-primary-foreground]="featured()"
        [class.bg-secondary]="!featured()"
        [class.text-secondary-foreground]="!featured()"
      >
        Choose {{ name() }}
      </button>
    </article>
  \`,
})
export class PlanCardComponent {
  name = input.required<string>();
  price = input.required<string>();
  featured = input(false);
}`,
            lang: 'ts',
            title: 'src/app/plan-card.component.ts',
          },
          {
            code: `<main class="mx-auto max-w-5xl px-6 py-12">
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    @for (plan of plans; track plan.name) {
      <app-plan-card [name]="plan.name" [price]="plan.price" [featured]="plan.featured" />
    }
  </div>
</main>`,
            lang: 'html',
            title: 'src/app/app.component.html',
          },
          'Both `[class.bg-primary]` and the `[class]` string work at runtime. The difference matters for the purge step below.',
        ],
      },
      {
        h: 'Dark mode',
        blocks: [
          'A root service owns the scheme. It reads the class the head script set, and toggles it through the injected `DOCUMENT`:',
          {
            code: `import { Injectable, inject, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly root = inject(DOCUMENT).documentElement;
  readonly theme = signal<'light' | 'dark'>(this.root.classList.contains('dark') ? 'dark' : 'light');

  toggle(): void {
    const next = this.theme() === 'dark' ? 'light' : 'dark';
    this.root.classList.remove('dark', 'light');
    this.root.classList.add(next);
    try { localStorage.setItem('monsoon-theme', next); } catch (e) {}
    this.theme.set(next);
  }
}`,
            lang: 'ts',
            title: 'src/app/theme.service.ts',
          },
          {
            code: `import { Component, inject } from '@angular/core';
import { ThemeService } from './theme.service';

@Component({
  selector: 'app-theme-toggle',
  template: \`
    <button
      type="button"
      class="rounded-lg border px-3 py-2 text-sm hover:bg-muted"
      [attr.aria-pressed]="theme.theme() === 'dark'"
      (click)="theme.toggle()"
    >
      {{ theme.theme() === 'dark' ? 'Light mode' : 'Dark mode' }}
    </button>
  \`,
})
export class ThemeToggleComponent {
  protected readonly theme = inject(ThemeService);
}`,
            lang: 'ts',
            title: 'src/app/theme-toggle.component.ts',
          },
          'To force one region dark, bind the class on it: `<aside class="bg-background text-foreground p-6" [class.dark]="alwaysDark">`.',
        ],
      },
      {
        h: 'Theme with --seed',
        blocks: [
          'Angular binds custom properties with the `[style.--name]` syntax:',
          {
            code: `import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-brand-preview',
  template: \`
    <section class="rounded-2xl bg-surface p-6 space-y-4" [style.--seed]="seed()">
      <input type="color" [value]="seed()" (input)="seed.set($any($event.target).value)" />
      <button type="button" class="rounded-lg bg-primary text-primary-foreground px-4 py-2">Primary</button>
    </section>
  \`,
})
export class BrandPreviewComponent {
  seed = signal('#0d9488');
}`,
            lang: 'ts',
            title: 'src/app/brand-preview.component.ts',
          },
          SEED_LINK,
        ],
      },
      {
        h: 'Using the purge CLI',
        blocks: [
          {
            code: `{
  "scripts": {
    "start": "ng serve",
    "css:purge": "monsooncss purge \\"src/**/*.{html,ts}\\" -o src/monsoon.purged.css",
    "build": "npm run css:purge && ng build"
  }
}`,
            lang: 'json',
            title: 'package.json',
          },
          'Then swap the stylesheet in the `production` configuration only, so `ng serve` keeps the full file:',
          {
            code: `{
  "projects": {
    "my-app": {
      "architect": {
        "build": {
          "configurations": {
            "production": {
              "styles": [
                "src/monsoon.purged.css",
                "src/styles.css"
              ]
            }
          }
        }
      }
    }
  }
}`,
            lang: 'json',
            title: 'angular.json',
          },
          { warn: 'The purge CLI does not read `[class.bg-primary]` as the class `bg-primary`, because the binding name and the class are one token. For classes you only use in `[class.x]` bindings, either switch to a `[class]` string as in the card above, or list them in `--safelist bg-primary,text-primary-foreground`.' },
          { note: PURGE_NOTE },
          PURGE_KEEPS,
        ],
      },
      nextSteps(),
    ],
    faqs: [
      ['Which install option should I pick in Angular?', 'The `styles` array is the most explicit and keeps the file in the build output. The `@import` keeps everything in CSS. The CDN link keeps the stylesheet out of the bundle and out of the budget.'],
      ['Does Monsoon work with Angular SSR?', 'Yes. The stylesheet has no runtime. Keep the head script in `src/index.html` so the scheme is set before the server rendered HTML paints.'],
    ],
  },

  // 7. Svelte with Vite
  {
    slug: 'install-svelte',
    nav: 'Svelte',
    stack: 'Svelte with Vite',
    title: 'Install Monsoon in Svelte with Vite',
    metaTitle: 'Install Monsoon in Svelte with Vite | Monsoon docs',
    description: 'Use Monsoon in a Svelte 5 and Vite app: import it in src/main.js, toggle classes with class: directives, theme with style:--seed and purge.',
    lead: 'Svelte gives you two tidy tools that map straight onto Monsoon: the `class:` directive for conditional classes and the `style:` directive for the seed color. Monsoon itself is one import in `src/main.js`.',
    sections: [
      {
        h: 'Install',
        blocks: [
          'Start from `npm create vite@latest my-app -- --template svelte`. Building a full app with routing? Use the [SvelteKit guide](install-sveltekit.html).',
          {
            tabs: [
              {
                label: 'CDN',
                blocks: [
                  {
                    code: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My app</title>
    <link rel="stylesheet" href="${CDN}" />
    <script>${THEME}</script>
  </head>
  <body class="bg-background text-foreground antialiased">
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>`,
                    lang: 'html',
                    title: 'index.html',
                  },
                ],
              },
              {
                label: 'npm',
                blocks: [
                  { term: 'npm install monsooncss', title: 'bash' },
                  {
                    code: `import { mount } from 'svelte';
import 'monsooncss';
import './app.css';
import App from './App.svelte';

const app = mount(App, { target: document.getElementById('app') });

export default app;`,
                    lang: 'js',
                    title: 'src/main.js',
                  },
                  'Keep the head script from the CDN tab in `index.html`, and clear the demo rules in `src/app.css`.',
                ],
              },
            ],
          },
        ],
      },
      {
        h: 'Use the classes',
        blocks: [
          'Static names go in `class`, and each `class:name={condition}` directive adds one class when the condition is true:',
          {
            code: `<script>
  let { name, price, featured = false } = $props();
</script>

<article
  class="rounded-2xl border bg-surface p-6 space-y-4"
  class:shadow-sm={!featured}
  class:ring-2={featured}
  class:ring-ring={featured}
>
  <h2 class="text-lg font-semibold">{name}</h2>
  <p class="text-3xl font-bold">{price}</p>
  <button
    type="button"
    class={featured
      ? 'w-full rounded-lg px-4 py-2 font-medium bg-primary text-primary-foreground hover:bg-primary/90'
      : 'w-full rounded-lg px-4 py-2 font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80'}
  >
    Choose {name}
  </button>
</article>`,
            lang: 'svelte',
            title: 'src/lib/PlanCard.svelte',
          },
          {
            code: `<script>
  import PlanCard from './lib/PlanCard.svelte';
</script>

<main class="mx-auto max-w-5xl px-6 py-12">
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    <PlanCard name="Starter" price="$0" />
    <PlanCard name="Team" price="$12" featured />
    <PlanCard name="Business" price="$40" />
  </div>
</main>`,
            lang: 'svelte',
            title: 'src/App.svelte',
          },
          'Svelte 5.16 and newer also accept objects and arrays in `class`, for example `class={[\'rounded-lg px-4 py-2\', { \'bg-primary\': active }]}`.',
        ],
      },
      {
        h: 'Dark mode',
        blocks: [
          {
            code: `<script>
  let isDark = $state(document.documentElement.classList.contains('dark'));

  function toggle() {
    isDark = !isDark;
    const theme = isDark ? 'dark' : 'light';
    const root = document.documentElement;
    root.classList.remove('dark', 'light');
    root.classList.add(theme);
    try { localStorage.setItem('monsoon-theme', theme); } catch (e) {}
  }
</script>

<button
  type="button"
  onclick={toggle}
  aria-pressed={isDark}
  class="rounded-lg border px-3 py-2 text-sm hover:bg-muted"
>
  {isDark ? 'Light mode' : 'Dark mode'}
</button>`,
            lang: 'svelte',
            title: 'src/lib/ThemeToggle.svelte',
          },
          'The `class:` directive is also the shortest way to pin one region to a scheme: `<aside class="bg-background text-foreground p-6" class:dark={alwaysDark}>`.',
        ],
      },
      {
        h: 'Theme with --seed',
        blocks: [
          'The `style:` directive accepts custom properties, so the seed follows a variable:',
          {
            code: `<script>
  let seed = $state('#0d9488');
</script>

<section class="rounded-2xl bg-surface p-6 space-y-4" style:--seed={seed}>
  <input type="color" bind:value={seed} />
  <button type="button" class="rounded-lg bg-primary text-primary-foreground px-4 py-2">Primary</button>
</section>`,
            lang: 'svelte',
            title: 'src/lib/BrandPreview.svelte',
          },
          SEED_LINK,
        ],
      },
      {
        h: 'Using the purge CLI',
        blocks: [
          {
            code: `{
  "scripts": {
    "dev": "vite",
    "css:purge": "monsooncss purge \\"index.html\\" \\"src/**/*.{svelte,js,ts}\\" -o src/monsoon.purged.css",
    "build": "npm run css:purge && vite build",
    "preview": "vite preview"
  }
}`,
            lang: 'json',
            title: 'package.json',
          },
          {
            code: `import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { fileURLToPath } from 'node:url';

const purged = fileURLToPath(new URL('./src/monsoon.purged.css', import.meta.url));

export default defineConfig(({ command }) => ({
  plugins: [svelte()],
  resolve: {
    alias: command === 'build' ? { monsooncss: purged } : {},
  },
}));`,
            lang: 'js',
            title: 'vite.config.js',
          },
          "The alias only applies to `vite build`, so development keeps the full stylesheet and the build bundles the purged one. With the CDN setup, write to `public/monsoon.css` and link `/monsoon.css` instead.",
          { warn: 'The purge CLI reads `class:ring-2={featured}` as one token and does not keep `ring-2` for it. Classes that appear only in `class:` directives must either also appear in a quoted string (as in the button above) or go in `--safelist ring-2,ring-ring`.' },
          { note: PURGE_NOTE },
          PURGE_KEEPS,
        ],
      },
      nextSteps(['Need routing and server rendering? See [SvelteKit](install-sveltekit.html).']),
    ],
    faqs: [
      ['Do Svelte scoped styles conflict with Monsoon?', 'No. Scoped styles only target your own selectors. Monsoon classes are global and work in every component.'],
      ['Can I use the theme variables inside a Svelte style block?', 'Yes. Every token is a custom property, so `color: var(--primary)` works in component styles.'],
    ],
  },

  // 8. SvelteKit
  {
    slug: 'install-sveltekit',
    nav: 'SvelteKit',
    stack: 'SvelteKit',
    title: 'Install Monsoon in SvelteKit',
    metaTitle: 'Install Monsoon in SvelteKit | Monsoon docs',
    description: 'Install Monsoon in SvelteKit: import it in the root +layout.svelte, set the theme in src/app.html before paint and purge for production.',
    lead: 'SvelteKit has a natural home for each piece: the stylesheet import in `src/routes/+layout.svelte`, and the theme script in `src/app.html`, which is served before any JavaScript runs.',
    sections: [
      {
        h: 'Install',
        blocks: [
          {
            tabs: [
              {
                label: 'CDN',
                blocks: [
                  {
                    code: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="stylesheet" href="${CDN}" />
    <script>${THEME}</script>
    %sveltekit.head%
  </head>
  <body data-sveltekit-preload-data="hover" class="bg-background text-foreground antialiased">
    <div style="display: contents">%sveltekit.body%</div>
  </body>
</html>`,
                    lang: 'html',
                    title: 'src/app.html',
                  },
                ],
              },
              {
                label: 'npm',
                blocks: [
                  { term: 'npm install monsooncss', title: 'bash' },
                  {
                    code: `<script>
  import 'monsooncss';

  let { children } = $props();
</script>

{@render children()}`,
                    lang: 'svelte',
                    title: 'src/routes/+layout.svelte',
                  },
                  'Keep the theme script in `src/app.html` exactly as in the CDN tab, minus the `<link>`.',
                  { note: TS_DECL_NOTE.replace('somewhere your `tsconfig.json` includes', 'in `src/` (next to `app.d.ts`)') + ' `svelte-check` reports the same error.' },
                ],
              },
            ],
          },
        ],
      },
      {
        h: 'Use the classes',
        blocks: [
          {
            code: `<script>
  let { plan } = $props();
</script>

<article
  class={plan.featured
    ? 'rounded-2xl border bg-surface p-6 space-y-4 ring-2 ring-ring'
    : 'rounded-2xl border bg-surface p-6 space-y-4 shadow-sm'}
>
  <h2 class="text-lg font-semibold">{plan.name}</h2>
  <p class="text-3xl font-bold">{plan.price}</p>
  <a
    href="/signup?plan={plan.slug}"
    class="block rounded-lg px-4 py-2 text-center font-medium"
    class:bg-primary={plan.featured}
    class:text-primary-foreground={plan.featured}
    class:bg-muted={!plan.featured}
  >
    Choose {plan.name}
  </a>
</article>`,
            lang: 'svelte',
            title: 'src/lib/components/PlanCard.svelte',
          },
          {
            code: `<script>
  import PlanCard from '$lib/components/PlanCard.svelte';

  let { data } = $props();
</script>

<main class="mx-auto max-w-5xl px-6 py-12">
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    {#each data.plans as plan (plan.slug)}
      <PlanCard {plan} />
    {/each}
  </div>
</main>`,
            lang: 'svelte',
            title: 'src/routes/pricing/+page.svelte',
          },
        ],
      },
      {
        h: 'Dark mode',
        blocks: [
          'Components also render on the server, where `document` does not exist. Read the class in `onMount` and keep the server label neutral:',
          {
            code: `<script>
  import { onMount } from 'svelte';

  let isDark = $state(false);

  onMount(() => {
    isDark = document.documentElement.classList.contains('dark');
  });

  function toggle() {
    isDark = !isDark;
    const theme = isDark ? 'dark' : 'light';
    const root = document.documentElement;
    root.classList.remove('dark', 'light');
    root.classList.add(theme);
    try { localStorage.setItem('monsoon-theme', theme); } catch (e) {}
  }
</script>

<button
  type="button"
  onclick={toggle}
  aria-pressed={isDark}
  class="rounded-lg border px-3 py-2 text-sm hover:bg-muted"
>
  {isDark ? 'Light mode' : 'Dark mode'}
</button>`,
            lang: 'svelte',
            title: 'src/lib/components/ThemeToggle.svelte',
          },
          { note: 'The head script lives in `src/app.html` rather than in `<svelte:head>`, because `app.html` is plain HTML that runs before hydration. If you enable `kit.csp`, add the hash of that inline script to `script-src`.' },
        ],
      },
      {
        h: 'Theme with --seed',
        blocks: [
          'Load the brand color on the server and apply it with the `style:` directive, so the first response is already themed:',
          {
            code: `export async function load({ locals }) {
  return { brandColor: locals.team?.brandColor ?? '#0d9488' };
}`,
            lang: 'js',
            title: 'src/routes/+layout.server.js',
          },
          {
            code: `<script>
  import 'monsooncss';

  let { data, children } = $props();
</script>

<div class="min-h-dvh bg-background" style:--seed={data.brandColor}>
  {@render children()}
</div>`,
            lang: 'svelte',
            title: 'src/routes/+layout.svelte',
          },
          SEED_LINK,
        ],
      },
      {
        h: 'Using the purge CLI',
        blocks: [
          {
            code: `{
  "scripts": {
    "dev": "vite dev",
    "css:purge": "monsooncss purge \\"src/**/*.{svelte,html,js,ts}\\" -o src/lib/monsoon.purged.css",
    "build": "npm run css:purge && vite build",
    "preview": "vite preview"
  }
}`,
            lang: 'json',
            title: 'package.json',
          },
          {
            code: `import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

const purged = fileURLToPath(new URL('./src/lib/monsoon.purged.css', import.meta.url));

export default defineConfig(({ command }) => ({
  plugins: [sveltekit()],
  resolve: {
    alias: command === 'build' ? { monsooncss: purged } : {},
  },
}));`,
            lang: 'js',
            title: 'vite.config.js',
          },
          "`import 'monsooncss'` in the layout now loads the full file under `vite dev` and the purged file in builds. With the CDN setup, write to `static/monsoon.css` and change the `<link>` in `src/app.html` to `%sveltekit.assets%/monsoon.css`.",
          { warn: 'Classes used only in `class:` directives, such as `class:bg-muted={...}` above, are not detected by the purge CLI. Put them in a quoted string elsewhere or add them with `--safelist bg-muted`.' },
          { note: PURGE_NOTE },
          PURGE_KEEPS,
        ],
      },
      nextSteps(),
    ],
    faqs: [
      ['Why not import Monsoon in src/app.html?', '`app.html` is a template, not a module, so it cannot import from `node_modules`. Use the root layout for the import and `app.html` for the CDN link and the head script.'],
      ['Does it work with prerendering and adapter-static?', 'Yes. The stylesheet and the head script end up in every prerendered page.'],
    ],
  },

  // 9. Astro
  {
    slug: 'install-astro',
    nav: 'Astro',
    stack: 'Astro',
    title: 'Install Monsoon in Astro',
    metaTitle: 'Install Monsoon in Astro | Monsoon docs',
    description: 'Add Monsoon to Astro: import it in a layout frontmatter or link it, use class and class:list, keep dark mode across view transitions and purge.',
    lead: 'Astro renders HTML on the server and ships no JavaScript by default, which suits a stylesheet with no runtime. Import Monsoon in your base layout and every page that uses the layout gets it.',
    sections: [
      {
        h: 'Install',
        blocks: [
          {
            tabs: [
              {
                label: 'CDN',
                blocks: [
                  {
                    code: `---
interface Props {
  title: string;
}

const { title } = Astro.props;
---

<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <link rel="stylesheet" href="${CDN}" />
    <script is:inline>${THEME}</script>
  </head>
  <body class="bg-background text-foreground antialiased">
    <slot />
  </body>
</html>`,
                    lang: 'astro',
                    title: 'src/layouts/Layout.astro',
                  },
                ],
              },
              {
                label: 'npm',
                blocks: [
                  { term: 'npm install monsooncss', title: 'bash' },
                  {
                    code: `---
import 'monsooncss';

interface Props {
  title: string;
}

const { title } = Astro.props;
---

<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <script is:inline>${THEME}</script>
  </head>
  <body class="bg-background text-foreground antialiased">
    <slot />
  </body>
</html>`,
                    lang: 'astro',
                    title: 'src/layouts/Layout.astro',
                  },
                  'Astro bundles the imported stylesheet and adds the `<link>` to the head for you.',
                  { note: TS_DECL_NOTE.replace('somewhere your `tsconfig.json` includes', 'in `src/`') + ' `astro check` reports the same error.' },
                ],
              },
            ],
          },
          { note: 'Keep `is:inline` on the theme script. Without it Astro processes the script as a module, which runs after the page has painted.' },
        ],
      },
      {
        h: 'Use the classes',
        blocks: [
          'Use `class` for static names and `class:list` to combine them with conditions. Both render to a plain `class` attribute:',
          {
            code: `---
interface Props {
  name: string;
  price: string;
  featured?: boolean;
}

const { name, price, featured = false } = Astro.props;
---

<article class:list={['rounded-2xl border bg-surface p-6 space-y-4', { 'ring-2 ring-ring': featured, 'shadow-sm': !featured }]}>
  <h2 class="text-lg font-semibold">{name}</h2>
  <p class="text-3xl font-bold">{price}</p>
  <a
    href="/signup"
    class:list={[
      'block rounded-lg px-4 py-2 text-center font-medium',
      featured ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    ]}
  >
    Choose {name}
  </a>
</article>`,
            lang: 'astro',
            title: 'src/components/PlanCard.astro',
          },
          {
            code: `---
import Layout from '../layouts/Layout.astro';
import PlanCard from '../components/PlanCard.astro';
---

<Layout title="Pricing">
  <main class="mx-auto max-w-5xl px-6 py-12">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <PlanCard name="Starter" price="$0" />
      <PlanCard name="Team" price="$12" featured />
      <PlanCard name="Business" price="$40" />
    </div>
  </main>
</Layout>`,
            lang: 'astro',
            title: 'src/pages/pricing.astro',
          },
        ],
      },
      {
        h: 'Dark mode',
        blocks: [
          'A processed `<script>` is fine for the toggle itself, since the head script has already set the scheme:',
          {
            code: `<button id="theme-toggle" type="button" class="rounded-lg border px-3 py-2 text-sm hover:bg-muted">
  Toggle theme
</button>

<script>
  document.getElementById('theme-toggle')?.addEventListener('click', () => {
    const root = document.documentElement;
    const next = root.classList.contains('dark') ? 'light' : 'dark';
    root.classList.remove('dark', 'light');
    root.classList.add(next);
    try { localStorage.setItem('monsoon-theme', next); } catch (e) {}
  });
</script>`,
            lang: 'astro',
            title: 'src/components/ThemeToggle.astro',
          },
          'With view transitions (`<ClientRouter />`), Astro replaces the attributes of `<html>` on every navigation, which drops the class. Turn the head script into a named function and run it again after each swap:',
          {
            code: `<script is:inline>
  function applyTheme() {
    var t;
    try { t = localStorage.getItem('monsoon-theme'); } catch (e) {}
    var d = t === 'dark' || (t !== 'light' && matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.add(d ? 'dark' : 'light');
  }
  applyTheme();
  document.addEventListener('astro:after-swap', applyTheme);
</script>`,
            lang: 'astro',
            title: 'src/layouts/Layout.astro',
          },
          'With view transitions, register the toggle listener inside `document.addEventListener(\'astro:page-load\', ...)` as well, so it binds to the new button after each navigation.',
        ],
      },
      {
        h: 'Theme with --seed',
        blocks: [
          'Astro accepts a style object and keeps custom property names as they are:',
          {
            code: `---
const { brandColor = '#0d9488' } = Astro.props;
---

<section style={{ '--seed': brandColor }} class="rounded-2xl bg-surface p-6 space-y-4">
  <slot />
  <button type="button" class="rounded-lg bg-primary text-primary-foreground px-4 py-2">Primary</button>
</section>`,
            lang: 'astro',
            title: 'src/components/BrandSection.astro',
          },
          SEED_LINK,
        ],
      },
      {
        h: 'Using the purge CLI',
        blocks: [
          {
            code: `{
  "scripts": {
    "dev": "astro dev",
    "css:purge": "monsooncss purge \\"src/**/*.{astro,html,md,mdx,js,ts,jsx,tsx,vue,svelte}\\" -o src/styles/monsoon.purged.css",
    "build": "npm run css:purge && astro build"
  }
}`,
            lang: 'json',
            title: 'package.json',
          },
          'A tiny inline integration points `monsooncss` at the purged file for `astro build` only:',
          {
            code: `import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';

const purged = fileURLToPath(new URL('./src/styles/monsoon.purged.css', import.meta.url));

export default defineConfig({
  integrations: [
    {
      name: 'monsoon-purged-css',
      hooks: {
        'astro:config:setup': ({ command, updateConfig }) => {
          if (command === 'build') {
            updateConfig({ vite: { resolve: { alias: { monsooncss: purged } } } });
          }
        },
      },
    },
  ],
});`,
            lang: 'js',
            title: 'astro.config.mjs',
          },
          'With the CDN setup, write to `public/monsoon.css` and change the `<link>` href to `/monsoon.css`.',
          { note: PURGE_NOTE + ' Content collections count too: include `src/content/**` in the glob if your Markdown uses classes.' },
          PURGE_KEEPS,
        ],
      },
      nextSteps(),
    ],
    faqs: [
      ['Do framework islands in Astro see Monsoon classes?', 'Yes. The stylesheet is global, so React, Vue, Svelte and Solid islands use the same classes as `.astro` components.'],
      ['Should the stylesheet go in every page?', 'Import it once in the shared layout. Every page that uses the layout gets it, and Astro deduplicates the file.'],
    ],
  },

  // 10. Solid
  {
    slug: 'install-solid',
    nav: 'Solid',
    stack: 'Solid',
    title: 'Install Monsoon in Solid',
    metaTitle: 'Install Monsoon in Solid | Monsoon docs',
    description: 'Use Monsoon in a Solid app with Vite: import it in src/index.jsx, use class and classList, theme with a style object and purge for production.',
    lead: 'Solid compiles JSX to real DOM operations, and its `class` and `classList` props map straight onto utility classes. Monsoon is one import in the entry file.',
    sections: [
      {
        h: 'Install',
        blocks: [
          'Start from `npm create vite@latest my-app -- --template solid`.',
          {
            tabs: [
              {
                label: 'CDN',
                blocks: [
                  {
                    code: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My app</title>
    <link rel="stylesheet" href="${CDN}" />
    <script>${THEME}</script>
  </head>
  <body class="bg-background text-foreground antialiased">
    <div id="root"></div>
    <script type="module" src="/src/index.jsx"></script>
  </body>
</html>`,
                    lang: 'html',
                    title: 'index.html',
                  },
                ],
              },
              {
                label: 'npm',
                blocks: [
                  { term: 'npm install monsooncss', title: 'bash' },
                  {
                    code: `/* @refresh reload */
import { render } from 'solid-js/web';
import 'monsooncss';
import './index.css';
import App from './App.jsx';

render(() => <App />, document.getElementById('root'));`,
                    lang: 'jsx',
                    title: 'src/index.jsx',
                  },
                  'Keep the head script from the CDN tab in `index.html`.',
                ],
              },
            ],
          },
        ],
      },
      {
        h: 'Use the classes',
        blocks: [
          'Solid uses `class` (not `className`) for the static list and `classList` for classes that depend on signals or props:',
          {
            code: `export default function PlanCard(props) {
  return (
    <article
      class="rounded-2xl border bg-surface p-6 space-y-4"
      classList={{ 'ring-2 ring-ring': props.featured, 'shadow-sm': !props.featured }}
    >
      <h2 class="text-lg font-semibold">{props.name}</h2>
      <p class="text-3xl font-bold">{props.price}</p>
      <button
        type="button"
        class={props.featured
          ? 'w-full rounded-lg px-4 py-2 font-medium bg-primary text-primary-foreground hover:bg-primary/90'
          : 'w-full rounded-lg px-4 py-2 font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80'}
      >
        Choose {props.name}
      </button>
    </article>
  );
}`,
            lang: 'jsx',
            title: 'src/components/PlanCard.jsx',
          },
          {
            code: `import PlanCard from './components/PlanCard.jsx';

export default function App() {
  return (
    <main class="mx-auto max-w-5xl px-6 py-12">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <PlanCard name="Starter" price="$0" />
        <PlanCard name="Team" price="$12" featured />
        <PlanCard name="Business" price="$40" />
      </div>
    </main>
  );
}`,
            lang: 'jsx',
            title: 'src/App.jsx',
          },
        ],
      },
      {
        h: 'Dark mode',
        blocks: [
          {
            code: `import { createSignal } from 'solid-js';

export default function ThemeToggle() {
  const [dark, setDark] = createSignal(document.documentElement.classList.contains('dark'));

  const toggle = () => {
    const next = dark() ? 'light' : 'dark';
    const root = document.documentElement;
    root.classList.remove('dark', 'light');
    root.classList.add(next);
    try { localStorage.setItem('monsoon-theme', next); } catch (e) {}
    setDark(next === 'dark');
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={dark()}
      class="rounded-lg border px-3 py-2 text-sm hover:bg-muted"
    >
      {dark() ? 'Light mode' : 'Dark mode'}
    </button>
  );
}`,
            lang: 'jsx',
            title: 'src/components/ThemeToggle.jsx',
          },
          "A single region can stay dark with `classList={{ dark: alwaysDark() }}` on its wrapper.",
        ],
      },
      {
        h: 'Theme with --seed',
        blocks: [
          'Solid writes style objects with `setProperty`, so custom properties work and update only when the signal changes:',
          {
            code: `import { createSignal } from 'solid-js';

export default function BrandPreview() {
  const [seed, setSeed] = createSignal('#0d9488');

  return (
    <section style={{ '--seed': seed() }} class="rounded-2xl bg-surface p-6 space-y-4">
      <input type="color" value={seed()} onInput={(e) => setSeed(e.currentTarget.value)} />
      <button type="button" class="rounded-lg bg-primary text-primary-foreground px-4 py-2">Primary</button>
    </section>
  );
}`,
            lang: 'jsx',
            title: 'src/components/BrandPreview.jsx',
          },
          SEED_LINK,
        ],
      },
      {
        h: 'Using the purge CLI',
        blocks: [
          {
            code: `{
  "scripts": {
    "dev": "vite",
    "css:purge": "monsooncss purge \\"index.html\\" \\"src/**/*.{js,jsx,ts,tsx}\\" -o src/monsoon.purged.css",
    "build": "npm run css:purge && vite build",
    "serve": "vite preview"
  }
}`,
            lang: 'json',
            title: 'package.json',
          },
          {
            code: `import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';
import { fileURLToPath } from 'node:url';

const purged = fileURLToPath(new URL('./src/monsoon.purged.css', import.meta.url));

export default defineConfig(({ command }) => ({
  plugins: [solid()],
  resolve: {
    alias: command === 'build' ? { monsooncss: purged } : {},
  },
}));`,
            lang: 'js',
            title: 'vite.config.js',
          },
          'Development keeps the full file; `vite build` bundles the purged one. With the CDN setup, write to `public/monsoon.css` and link `/monsoon.css`.',
          { note: PURGE_NOTE + " Quoted `classList` keys such as `{ 'bg-primary': active() }` are found." },
          PURGE_KEEPS,
        ],
      },
      nextSteps(),
    ],
    faqs: [
      ['How do I add Monsoon to SolidStart?', "Import `monsooncss` in `src/app.tsx` (or `src/app.jsx`) and put the head script inside the `<head>` that `src/entry-server.tsx` renders."],
      ['Does className work in Solid?', 'Solid accepts it, but `class` is the idiomatic prop, and `classList` covers the conditional cases.'],
    ],
  },

  // 11. Remix
  {
    slug: 'install-remix',
    nav: 'Remix',
    stack: 'Remix',
    title: 'Install Monsoon in Remix',
    metaTitle: 'Install Monsoon in Remix | Monsoon docs',
    description: 'Add Monsoon to Remix or React Router v7 with a links export and a ?url import, set dark mode before hydration and purge for production.',
    lead: 'Remix manages stylesheets through the `links` export, which renders `<link>` tags into `<Links />` in the root. Import Monsoon with `?url`, return it from `links`, and the stylesheet is in place before hydration.',
    sections: [
      {
        h: 'Install',
        blocks: [
          'These examples use Remix with Vite. React Router v7 in framework mode is the successor of Remix and uses the same approach; only the imports change (see the note below).',
          {
            tabs: [
              {
                label: 'CDN',
                blocks: [
                  {
                    code: `import type { LinksFunction } from '@remix-run/node';
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from '@remix-run/react';

const themeScript = "${THEME}";

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: '${CDN}' },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <Meta />
        <Links />
      </head>
      <body className="bg-background text-foreground antialiased">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}`,
                    lang: 'tsx',
                    title: 'app/root.tsx',
                  },
                ],
              },
              {
                label: 'npm',
                blocks: [
                  { term: 'npm install monsooncss', title: 'bash' },
                  {
                    code: `import type { LinksFunction } from '@remix-run/node';
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from '@remix-run/react';
import monsoonHref from 'monsooncss?url';

const themeScript = "${THEME}";

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: monsoonHref },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <Meta />
        <Links />
      </head>
      <body className="bg-background text-foreground antialiased">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}`,
                    lang: 'tsx',
                    title: 'app/root.tsx',
                  },
                  "`?url` asks Vite for the URL of the built file instead of injecting it, which is what `links` expects. The `vite/client` types already declare `*?url` imports, so TypeScript is satisfied. A plain `import 'monsooncss'` in `root.tsx` also works if you prefer side effect imports.",
                ],
              },
            ],
          },
          {
            note: "React Router v7: import `Links`, `Meta`, `Outlet`, `Scripts` and `ScrollRestoration` from `'react-router'`, and type the export as `Route.LinksFunction` with `import type { Route } from './+types/root'`. Everything else on this page is unchanged.",
          },
          { note: '`suppressHydrationWarning` on `<html>` is needed because the head script adds `dark` or `light` there before React hydrates.' },
        ],
      },
      {
        h: 'Use the classes',
        blocks: [
          '`NavLink` takes a function for `className`, which keeps active and inactive styles as full strings:',
          {
            code: `import { NavLink } from '@remix-run/react';

const base = 'rounded-lg px-3 py-2 text-sm font-medium';

export function MainNav() {
  return (
    <nav className="flex items-center gap-2">
      {[['/', 'Home'], ['/pricing', 'Pricing'], ['/docs', 'Docs']].map(([to, label]) => (
        <NavLink
          key={to}
          to={to}
          end
          className={({ isActive }) =>
            isActive
              ? base + ' bg-primary text-primary-foreground'
              : base + ' text-muted-foreground hover:bg-muted'
          }
        >
          {label}
        </NavLink>
      ))}
    </nav>
  );
}`,
            lang: 'tsx',
            title: 'app/components/MainNav.tsx',
          },
          {
            code: `export function PlanCard({ name, price, featured = false }: { name: string; price: string; featured?: boolean }) {
  return (
    <article className={featured ? 'rounded-2xl border bg-surface p-6 space-y-4 ring-2 ring-ring' : 'rounded-2xl border bg-surface p-6 space-y-4 shadow-sm'}>
      <h2 className="text-lg font-semibold">{name}</h2>
      <p className="text-3xl font-bold">{price}</p>
      <button
        type="submit"
        className={featured ? 'w-full rounded-lg bg-primary text-primary-foreground px-4 py-2 font-medium hover:bg-primary/90' : 'w-full rounded-lg bg-secondary text-secondary-foreground px-4 py-2 font-medium hover:bg-secondary/80'}
      >
        Choose {name}
      </button>
    </article>
  );
}`,
            lang: 'tsx',
            title: 'app/components/PlanCard.tsx',
          },
        ],
      },
      {
        h: 'Dark mode',
        blocks: [
          'The toggle does not read the theme during render, so server and client markup always match:',
          {
            code: `export function ThemeToggle() {
  function toggle() {
    const root = document.documentElement;
    const next = root.classList.contains('dark') ? 'light' : 'dark';
    root.classList.remove('dark', 'light');
    root.classList.add(next);
    try { localStorage.setItem('monsoon-theme', next); } catch (e) {}
  }

  return (
    <button type="button" onClick={toggle} className="rounded-lg border px-3 py-2 text-sm hover:bg-muted">
      Toggle theme
    </button>
  );
}`,
            lang: 'tsx',
            title: 'app/components/ThemeToggle.tsx',
          },
          'Prefer the choice on the server? Store it in a cookie, read it in the root `loader`, and render `<html className={theme}>`. Then the head script is only needed for visitors without the cookie.',
        ],
      },
      {
        h: 'Theme with --seed',
        blocks: [
          'Return the brand color from a loader and set it as a custom property on the route wrapper:',
          {
            code: `import type { LoaderFunctionArgs } from '@remix-run/node';
import { Outlet, useLoaderData } from '@remix-run/react';
import { getTeam } from '~/models/team.server';

export async function loader({ params }: LoaderFunctionArgs) {
  const team = await getTeam(params.team!);
  return { brandColor: team.brandColor };
}

export default function TeamRoute() {
  const { brandColor } = useLoaderData<typeof loader>();

  return (
    <div style={{ '--seed': brandColor } as React.CSSProperties} className="min-h-dvh bg-background">
      <Outlet />
    </div>
  );
}`,
            lang: 'tsx',
            title: 'app/routes/$team.tsx',
          },
          'Validate stored colors before rendering them. ' + SEED_LINK,
        ],
      },
      {
        h: 'Using the purge CLI',
        blocks: [
          {
            code: `{
  "scripts": {
    "dev": "remix vite:dev",
    "css:purge": "monsooncss purge \\"app/**/*.{js,jsx,ts,tsx}\\" -o app/monsoon.purged.css",
    "build": "npm run css:purge && remix vite:build",
    "start": "remix-serve ./build/server/index.js"
  }
}`,
            lang: 'json',
            title: 'package.json',
          },
          'Alias the package for builds only. The pattern form is needed here, because a plain string alias would not match the `?url` suffix:',
          {
            code: `import { vitePlugin as remix } from '@remix-run/dev';
import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

const purged = fileURLToPath(new URL('./app/monsoon.purged.css', import.meta.url));

export default defineConfig(({ command }) => ({
  plugins: [remix()],
  resolve: {
    alias: command === 'build' ? [{ find: /^monsooncss(?=\\?|$)/, replacement: purged }] : [],
  },
}));`,
            lang: 'ts',
            title: 'vite.config.ts',
          },
          'In React Router v7 the scripts are `react-router dev` and `react-router build`, and the plugin is `reactRouter()` from `@react-router/dev/vite`. With the CDN setup, write to `public/monsoon.css` and return `/monsoon.css` from `links`.',
          { note: PURGE_NOTE },
          PURGE_KEEPS,
        ],
      },
      nextSteps(['Other React setups: [React with Vite](install-react.html) and [Next.js](install-nextjs.html).']),
    ],
    faqs: [
      ['Should I use the links export or a side effect import?', 'Both work with Vite. `links` with `?url` is the documented Remix pattern and lets you add `media` or preload hints; the side effect import is shorter.'],
      ['Does this work in React Router v7 framework mode?', 'Yes. Swap the imports to `react-router`, type the export with `Route.LinksFunction`, and keep the rest of the setup.'],
    ],
  },

  // 12. Laravel Blade
  {
    slug: 'install-laravel',
    nav: 'Laravel',
    stack: 'Laravel Blade',
    title: 'Install Monsoon in Laravel Blade',
    metaTitle: 'Install Monsoon in Laravel Blade | Monsoon docs',
    description: 'Use Monsoon in Laravel Blade: a CDN link in the layout or npm with Vite, @class for conditional classes, a seed from your models and a purge.',
    lead: 'Blade layouts are server rendered HTML, so Monsoon works with a single `<link>`. If your app already runs Vite through `@vite`, import the package instead and let Vite fingerprint it.',
    sections: [
      {
        h: 'Install',
        blocks: [
          {
            tabs: [
              {
                label: 'CDN',
                blocks: [
                  {
                    code: `<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title', config('app.name'))</title>
    <link rel="stylesheet" href="${CDN}">
    <script>${THEME}</script>
</head>
<body class="bg-background text-foreground antialiased">
    @yield('content')
    <script src="{{ asset('js/theme-toggle.js') }}" defer></script>
</body>
</html>`,
                    lang: 'blade',
                    title: 'resources/views/layouts/app.blade.php',
                  },
                ],
              },
              {
                label: 'npm',
                blocks: [
                  { term: 'npm install monsooncss', title: 'bash' },
                  'Import the package at the very top of the CSS entry (an `@import` must come before any other rule):',
                  {
                    code: `@import 'monsooncss';

/* your own styles below */`,
                    lang: 'css',
                    title: 'resources/css/app.css',
                  },
                  {
                    code: `<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title', config('app.name'))</title>
    <script>${THEME}</script>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body class="bg-background text-foreground antialiased">
    @yield('content')
    <script src="{{ asset('js/theme-toggle.js') }}" defer></script>
</body>
</html>`,
                    lang: 'blade',
                    title: 'resources/views/layouts/app.blade.php',
                  },
                  "Prefer JavaScript entries? `import 'monsooncss';` at the top of `resources/js/app.js` works the same way.",
                ],
              },
            ],
          },
          { note: 'If `resources/css/app.css` came from a starter kit with another utility setup, remove those lines so two resets do not compete.' },
        ],
      },
      {
        h: 'Use the classes',
        blocks: [
          "Blade's `@class` directive and `$attributes->class()` take arrays where each key is a full class string, which reads well and stays purge friendly:",
          {
            code: `@props(['name', 'price', 'featured' => false])

<article {{ $attributes->class([
    'rounded-2xl border bg-surface p-6 space-y-4',
    'ring-2 ring-ring' => $featured,
    'shadow-sm' => ! $featured,
]) }}>
    <h2 class="text-lg font-semibold">{{ $name }}</h2>
    <p class="text-3xl font-bold">{{ $price }}</p>
    {{ $slot }}
    <a href="{{ route('register', ['plan' => $name]) }}" @class([
        'block rounded-lg px-4 py-2 text-center font-medium',
        'bg-primary text-primary-foreground hover:bg-primary/90' => $featured,
        'bg-secondary text-secondary-foreground hover:bg-secondary/80' => ! $featured,
    ])>Choose {{ $name }}</a>
</article>`,
            lang: 'blade',
            title: 'resources/views/components/plan-card.blade.php',
          },
          {
            code: `@extends('layouts.app')

@section('content')
<main class="mx-auto max-w-5xl px-6 py-12">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        @foreach ($plans as $plan)
            <x-plan-card :name="$plan->name" :price="$plan->price" :featured="$plan->featured">
                <p class="text-sm text-muted-foreground">{{ $plan->summary }}</p>
            </x-plan-card>
        @endforeach
    </div>
</main>
@endsection`,
            lang: 'blade',
            title: 'resources/views/pricing.blade.php',
          },
        ],
      },
      {
        h: 'Dark mode',
        blocks: [
          'The head script in the layout sets the scheme before paint. Add a button anywhere in your views and a small script in `public/js` to flip it:',
          {
            code: TOGGLE_BUTTON,
            lang: 'blade',
            title: 'resources/views/partials/header.blade.php',
          },
          { code: TOGGLE_JS, lang: 'js', title: 'public/js/theme-toggle.js' },
          'To render the right scheme on the very first request without JavaScript, store the choice in a cookie and print it on `<html class="{{ $theme }}">` after checking it is `dark` or `light`.',
        ],
      },
      {
        h: 'Theme with --seed',
        blocks: [
          'Write the seed inline from your data. Blade escapes HTML, but it does not make a value safe inside CSS, so validate it when it is saved:',
          {
            code: `<section style="--seed: {{ $team->brand_color ?? '#0d9488' }}" class="rounded-2xl bg-surface p-6 space-y-4">
    <h2 class="text-xl font-bold text-primary">{{ $team->name }}</h2>
    <a href="{{ route('teams.show', $team) }}" class="inline-block rounded-lg bg-primary text-primary-foreground px-4 py-2">Open</a>
</section>`,
            lang: 'blade',
            title: 'resources/views/teams/card.blade.php',
          },
          {
            code: `$request->validate([
    'brand_color' => ['nullable', 'regex:/^#[0-9a-fA-F]{6}$/'],
]);`,
            lang: 'php',
            title: 'app/Http/Controllers/TeamController.php',
          },
          SEED_LINK,
        ],
      },
      {
        h: 'Using the purge CLI',
        blocks: [
          {
            code: `{
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "css:purge": "monsooncss purge \\"resources/views/**/*.blade.php\\" \\"resources/js/**/*.{js,vue,jsx}\\" \\"app/View/**/*.php\\" -o resources/css/monsoon.purged.css",
    "build": "npm run css:purge && vite build"
  }
}`,
            lang: 'json',
            title: 'package.json',
          },
          "With the Vite setup, alias the package for builds only. The `@import 'monsooncss'` stays; `npm run dev` serves the full file and `npm run build` the purged one:",
          {
            code: `import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import { fileURLToPath } from 'node:url';

const purged = fileURLToPath(new URL('./resources/css/monsoon.purged.css', import.meta.url));

export default defineConfig(({ command }) => ({
  plugins: [
    laravel({
      input: ['resources/css/app.css', 'resources/js/app.js'],
      refresh: true,
    }),
  ],
  resolve: {
    alias: command === 'build' ? { monsooncss: purged } : {},
  },
}));`,
            lang: 'js',
            title: 'vite.config.js',
          },
          'With the CDN setup, write to `public/css/monsoon.css` instead and switch the link by environment:',
          {
            code: `@production
    <link rel="stylesheet" href="{{ asset('css/monsoon.css') }}">
@else
    <link rel="stylesheet" href="${CDN}">
@endproduction`,
            lang: 'blade',
            title: 'resources/views/layouts/app.blade.php',
          },
          { note: PURGE_NOTE + ' Class names stored in the database or in config files belong in the safelist.' },
          PURGE_KEEPS,
        ],
      },
      nextSteps(['Other server templates: [Django](install-django.html), [Rails](install-rails.html) and [PHP](install-php.html).']),
    ],
    faqs: [
      ['Does Monsoon work with Livewire?', 'Yes. Livewire morphs the DOM but keeps the class on `<html>`, and Monsoon classes in Livewire views behave like any other Blade markup. Add `resources/views/livewire/**` to the purge glob if you keep views there.'],
      ['Do I need Vite to use Monsoon in Laravel?', 'No. The CDN link in the layout is enough. Vite is only useful if you already bundle your own CSS and JavaScript.'],
    ],
  },

  // 13. Django templates
  {
    slug: 'install-django',
    nav: 'Django',
    stack: 'Django templates',
    title: 'Install Monsoon in Django templates',
    metaTitle: 'Install Monsoon in Django templates | Monsoon docs',
    description: 'Add Monsoon to Django with a CDN link in base.html or a static file, style forms through widget attrs, theme from a model field and purge templates.',
    lead: 'Django templates render plain HTML, so Monsoon needs no Python package and no build step. Link it in `base.html`, either from the CDN or as a static file served by `{% static %}`.',
    sections: [
      {
        h: 'Install',
        blocks: [
          {
            tabs: [
              {
                label: 'CDN',
                blocks: [
                  {
                    code: `{% load static %}<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{% block title %}My site{% endblock %}</title>
  <link rel="stylesheet" href="${CDN}">
  <script>${THEME}</script>
  {% block head %}{% endblock %}
</head>
<body class="bg-background text-foreground antialiased">
  {% block content %}{% endblock %}
  <script src="{% static 'js/theme-toggle.js' %}" defer></script>
</body>
</html>`,
                    lang: 'jinja',
                    title: 'templates/base.html',
                  },
                ],
              },
              {
                label: 'npm',
                blocks: [
                  'Copy the stylesheet into your static folder once (repeat after upgrading):',
                  { term: 'npm install monsooncss\ncp node_modules/monsooncss/dist/monsoon.min.css static/css/monsoon.min.css', title: 'bash' },
                  `No Node.js on the machine? Download the same file instead: \`curl -o static/css/monsoon.min.css ${CDN}\`.`,
                  {
                    code: `STATICFILES_DIRS = [BASE_DIR / "static"]`,
                    lang: 'python',
                    title: 'mysite/settings.py',
                  },
                  {
                    code: `{% load static %}<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{% block title %}My site{% endblock %}</title>
  <link rel="stylesheet" href="{% static 'css/monsoon.min.css' %}">
  <script>${THEME}</script>
  {% block head %}{% endblock %}
</head>
<body class="bg-background text-foreground antialiased">
  {% block content %}{% endblock %}
  <script src="{% static 'js/theme-toggle.js' %}" defer></script>
</body>
</html>`,
                    lang: 'jinja',
                    title: 'templates/base.html',
                  },
                  'The stylesheet only references `data:` URLs, so `ManifestStaticFilesStorage` and WhiteNoise process it without missing file errors during `collectstatic`.',
                ],
              },
            ],
          },
        ],
      },
      {
        h: 'Use the classes',
        blocks: [
          'Template tags work inside `class` like anywhere else. Keep each branch a full class list:',
          {
            code: `<article class="rounded-2xl border bg-surface p-6 space-y-4 {% if plan.featured %}ring-2 ring-ring{% else %}shadow-sm{% endif %}">
  <h2 class="text-lg font-semibold">{{ plan.name }}</h2>
  <p class="text-3xl font-bold">{{ plan.price }}</p>
  <a href="{% url 'checkout' plan.slug %}" class="block rounded-lg px-4 py-2 text-center font-medium {% if plan.featured %}bg-primary text-primary-foreground hover:bg-primary/90{% else %}bg-secondary text-secondary-foreground hover:bg-secondary/80{% endif %}">
    Choose {{ plan.name }}
  </a>
</article>`,
            lang: 'jinja',
            title: 'templates/components/plan_card.html',
          },
          {
            code: `{% extends "base.html" %}

{% block content %}
<main class="mx-auto max-w-5xl px-6 py-12">
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    {% for plan in plans %}
      {% include "components/plan_card.html" with plan=plan %}
    {% endfor %}
  </div>
</main>
{% endblock %}`,
            lang: 'jinja',
            title: 'templates/pricing.html',
          },
          'Form fields get their classes from widget attributes, so rendered forms match the rest of the page:',
          {
            code: `from django import forms

FIELD = "w-full rounded-lg border bg-background px-3 py-2 text-sm"


class ContactForm(forms.Form):
    email = forms.EmailField(widget=forms.EmailInput(attrs={"class": FIELD}))
    message = forms.CharField(widget=forms.Textarea(attrs={"class": FIELD, "rows": 4}))`,
            lang: 'python',
            title: 'contact/forms.py',
          },
        ],
      },
      {
        h: 'Dark mode',
        blocks: [
          'The head script in `base.html` sets the scheme before paint. Add a button to any template and the toggle script to `static/js`:',
          { code: TOGGLE_BUTTON, lang: 'jinja', title: 'templates/partials/header.html' },
          { code: TOGGLE_JS, lang: 'js', title: 'static/js/theme-toggle.js' },
          'A section can be pinned to a scheme with the class alone: `<aside class="dark bg-background text-foreground p-6">`.',
        ],
      },
      {
        h: 'Theme with --seed',
        blocks: [
          'Store the brand color on a model and validate its format, then print it inline. Autoescaping protects HTML, not CSS, so the validator is what keeps the value safe:',
          {
            code: `from django.core.validators import RegexValidator
from django.db import models

hex_color = RegexValidator(r"^#[0-9a-fA-F]{6}$", "Use a hex color such as #0d9488.")


class Team(models.Model):
    name = models.CharField(max_length=100)
    brand_color = models.CharField(max_length=7, default="#0d9488", validators=[hex_color])`,
            lang: 'python',
            title: 'teams/models.py',
          },
          {
            code: `<section style="--seed: {{ team.brand_color }}" class="rounded-2xl bg-surface p-6 space-y-4">
  <h2 class="text-xl font-bold text-primary">{{ team.name }}</h2>
  <a href="{% url 'team_detail' team.pk %}" class="inline-block rounded-lg bg-primary text-primary-foreground px-4 py-2">Open</a>
</section>`,
            lang: 'jinja',
            title: 'templates/teams/card.html',
          },
          'Model validators run in `full_clean()` and in model forms, not on a bare `save()`. ' + SEED_LINK,
        ],
      },
      {
        h: 'Using the purge CLI',
        blocks: [
          'Scan the project templates, the app templates, any Python that holds class strings and your scripts:',
          {
            code: `{
  "private": true,
  "scripts": {
    "css:purge": "monsooncss purge \\"templates/**/*.html\\" \\"*/templates/**/*.html\\" \\"*/forms.py\\" \\"static/js/**/*.js\\" -o static/css/monsoon.css"
  },
  "devDependencies": {
    "monsooncss": "^${VERSION}"
  }
}`,
            lang: 'json',
            title: 'package.json',
          },
          { term: 'npm run css:purge\npython manage.py collectstatic --noinput', title: 'bash' },
          "Change the `<link>` to `{% static 'css/monsoon.css' %}`, and run the script in your deploy step before `collectstatic`. Without a `package.json`, `npx monsooncss purge ...` does the same.",
          { note: PURGE_NOTE },
          PURGE_KEEPS,
        ],
      },
      nextSteps(['Other server templates: [Laravel](install-laravel.html), [Rails](install-rails.html) and [PHP](install-php.html).']),
    ],
    faqs: [
      ['Do I need a Django package for Monsoon?', 'No. Monsoon is a stylesheet. Link it from the CDN or serve it with the static files app you already have.'],
      ['Does Monsoon work with Jinja2 templates in Django?', 'Yes. Replace `{% static %}` with your environment helper, for example `static()`, and the rest of the markup is the same.'],
    ],
  },

  // 14. Rails ERB
  {
    slug: 'install-rails',
    nav: 'Rails',
    stack: 'Rails ERB',
    title: 'Install Monsoon in Rails ERB',
    metaTitle: 'Install Monsoon in Rails ERB | Monsoon docs',
    description: 'Install Monsoon in Rails with stylesheet_link_tag and a CDN URL or a vendored file for Propshaft, then use class_names, a Stimulus toggle and a purge.',
    lead: 'Monsoon needs no gem and no JavaScript bundler in Rails. Link it from the application layout with `stylesheet_link_tag`, either straight from the CDN or as a vendored file that Propshaft fingerprints.',
    sections: [
      {
        h: 'Install',
        blocks: [
          {
            tabs: [
              {
                label: 'CDN',
                blocks: [
                  {
                    code: `<!DOCTYPE html>
<html>
  <head>
    <title><%= content_for(:title) || "My app" %></title>
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <%= csrf_meta_tags %>
    <%= csp_meta_tag %>
    <%= javascript_tag nonce: true do %>${THEME}<% end %>
    <%= stylesheet_link_tag "${CDN}" %>
    <%= stylesheet_link_tag :app, "data-turbo-track": "reload" %>
    <%= javascript_importmap_tags %>
  </head>
  <body class="bg-background text-foreground antialiased">
    <%= yield %>
  </body>
</html>`,
                    lang: 'erb',
                    title: 'app/views/layouts/application.html.erb',
                  },
                ],
              },
              {
                label: 'npm',
                blocks: [
                  'Vendor the file so Propshaft serves it with a digest:',
                  { term: 'npm install monsooncss\ncp node_modules/monsooncss/dist/monsoon.min.css vendor/assets/stylesheets/monsoon.css', title: 'bash' },
                  `Without Node.js, download it instead: \`curl -o vendor/assets/stylesheets/monsoon.css ${CDN}\`.`,
                  {
                    code: `<!DOCTYPE html>
<html>
  <head>
    <title><%= content_for(:title) || "My app" %></title>
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <%= csrf_meta_tags %>
    <%= csp_meta_tag %>
    <%= javascript_tag nonce: true do %>${THEME}<% end %>
    <%= stylesheet_link_tag "monsoon", "data-turbo-track": "reload" %>
    <%= stylesheet_link_tag :app, "data-turbo-track": "reload" %>
    <%= javascript_importmap_tags %>
  </head>
  <body class="bg-background text-foreground antialiased">
    <%= yield %>
  </body>
</html>`,
                    lang: 'erb',
                    title: 'app/views/layouts/application.html.erb',
                  },
                  "Using cssbundling-rails? Then `@import \"monsooncss\";` at the top of the PostCSS entry resolves the package directly. Importmaps only handle JavaScript, so with importmap-rails always link the CSS with `stylesheet_link_tag`.",
                ],
              },
            ],
          },
          { note: 'The vendored file goes in `vendor/assets/stylesheets` rather than `app/assets/stylesheets`, because `stylesheet_link_tag :app` links every file in the latter in alphabetical order, which could load Monsoon after your own styles.' },
          { note: `If you enable the content security policy initializer, allow the CDN with \`policy.style_src :self, "${CDN_HOST}"\`, and add \`:data\` to \`img_src\` for the inline SVG images some styles use. \`nonce: true\` already covers the head script.` },
        ],
      },
      {
        h: 'Use the classes',
        blocks: [
          'The `class_names` helper (also available as `token_list`) builds a class string from conditions, with each key a full class list:',
          {
            code: `<article class="<%= class_names("rounded-2xl border bg-surface p-6 space-y-4", "ring-2 ring-ring": plan.featured?, "shadow-sm": !plan.featured?) %>">
  <h2 class="text-lg font-semibold"><%= plan.name %></h2>
  <p class="text-3xl font-bold"><%= number_to_currency(plan.price) %></p>
  <%= link_to "Choose #{plan.name}", new_subscription_path(plan: plan),
        class: plan.featured? ? "block rounded-lg bg-primary text-primary-foreground px-4 py-2 text-center font-medium hover:bg-primary/90" : "block rounded-lg bg-secondary text-secondary-foreground px-4 py-2 text-center font-medium hover:bg-secondary/80" %>
</article>`,
            lang: 'erb',
            title: 'app/views/plans/_plan.html.erb',
          },
          {
            code: `<main class="mx-auto max-w-5xl px-6 py-12">
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    <%= render @plans %>
  </div>
</main>`,
            lang: 'erb',
            title: 'app/views/plans/index.html.erb',
          },
          'Form builders take the same strings: `form.text_field :email, class: "w-full rounded-lg border bg-background px-3 py-2 text-sm"`.',
        ],
      },
      {
        h: 'Dark mode',
        blocks: [
          'A Stimulus controller is the idiomatic home for the toggle. With importmap-rails and the default `controllers/index.js`, it registers itself from its file name:',
          {
            code: `import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  toggle() {
    const root = document.documentElement
    const next = root.classList.contains("dark") ? "light" : "dark"
    root.classList.remove("dark", "light")
    root.classList.add(next)
    this.element.setAttribute("aria-pressed", String(next === "dark"))
    try { localStorage.setItem("monsoon-theme", next) } catch (e) {}
  }
}`,
            lang: 'js',
            title: 'app/javascript/controllers/theme_controller.js',
          },
          {
            code: `<button type="button" data-controller="theme" data-action="theme#toggle" class="rounded-lg border px-3 py-2 text-sm hover:bg-muted">
  Toggle theme
</button>`,
            lang: 'erb',
            title: 'app/views/layouts/_header.html.erb',
          },
          'Turbo Drive swaps `<body>` and merges `<head>` on navigation but leaves the `<html>` element alone, so the class survives page visits.',
        ],
      },
      {
        h: 'Theme with --seed',
        blocks: [
          'Validate the stored color on the model, then write it inline in the view:',
          {
            code: `class Account < ApplicationRecord
  validates :brand_color, format: { with: /\\A#\\h{6}\\z/ }, allow_blank: true
end`,
            lang: 'ruby',
            title: 'app/models/account.rb',
          },
          {
            code: `<%= tag.section style: "--seed: #{current_account.brand_color.presence || '#0d9488'}", class: "rounded-2xl bg-surface p-6 space-y-4" do %>
  <h2 class="text-xl font-bold text-primary"><%= current_account.name %></h2>
  <%= link_to "Settings", edit_account_path, class: "inline-block rounded-lg bg-primary text-primary-foreground px-4 py-2" %>
<% end %>`,
            lang: 'erb',
            title: 'app/views/accounts/_brand.html.erb',
          },
          SEED_LINK,
        ],
      },
      {
        h: 'Using the purge CLI',
        blocks: [
          'Scan views, helpers, components and Stimulus controllers:',
          {
            code: `{
  "private": true,
  "scripts": {
    "css:purge": "monsooncss purge \\"app/views/**/*.erb\\" \\"app/helpers/**/*.rb\\" \\"app/components/**/*.{rb,erb}\\" \\"app/javascript/**/*.js\\" -o vendor/assets/stylesheets/monsoon.purged.css"
  },
  "devDependencies": {
    "monsooncss": "^${VERSION}"
  }
}`,
            lang: 'json',
            title: 'package.json',
          },
          'Link the purged file in production and keep the full one in development:',
          {
            code: `<%= stylesheet_link_tag(Rails.env.production? ? "monsoon.purged" : "monsoon", "data-turbo-track": "reload") %>`,
            lang: 'erb',
            title: 'app/views/layouts/application.html.erb',
          },
          'Run `npm run css:purge` before `bin/rails assets:precompile` in your deploy (for example in the Dockerfile, right before the precompile step).',
          { note: PURGE_NOTE + ' Class strings built in Ruby, like `"text-#{tone}"`, have the same problem.' },
          PURGE_KEEPS,
        ],
      },
      nextSteps(['Other server templates: [Laravel](install-laravel.html), [Django](install-django.html) and [PHP](install-php.html).']),
    ],
    faqs: [
      ['Do I need a gem for Monsoon in Rails?', 'No. It is one stylesheet. Link it from the CDN or vendor the file and Propshaft serves it.'],
      ['Does Monsoon work with ViewComponent?', 'Yes. Component templates are ERB like any other view; add `app/components/**` to the purge glob, as above.'],
    ],
  },

  // 15. WordPress
  {
    slug: 'install-wordpress',
    nav: 'WordPress',
    stack: 'WordPress',
    title: 'Install Monsoon in WordPress',
    metaTitle: 'Install Monsoon in WordPress | Monsoon docs',
    description: 'Add Monsoon to a WordPress theme with wp_enqueue_style from the CDN or a bundled file, use classes in templates and set the seed from the Customizer.',
    lead: 'In WordPress, stylesheets belong in `functions.php` through `wp_enqueue_style`, never in a hard coded `<link>`. Enqueue Monsoon first and your theme stylesheet second, and every template can use the classes.',
    sections: [
      {
        h: 'Install',
        blocks: [
          {
            tabs: [
              {
                label: 'CDN',
                blocks: [
                  {
                    code: `<?php
add_action( 'wp_enqueue_scripts', function () {
	wp_enqueue_style( 'monsoon', '${CDN}', array(), null );
	wp_enqueue_style( 'my-theme', get_stylesheet_uri(), array( 'monsoon' ), wp_get_theme()->get( 'Version' ) );
	wp_enqueue_script( 'my-theme-toggle', get_theme_file_uri( 'assets/js/theme-toggle.js' ), array(), wp_get_theme()->get( 'Version' ), array( 'in_footer' => true ) );
} );

add_action( 'wp_head', function () {
	wp_print_inline_script_tag( "${THEME}" );
}, 1 );`.replace(/\t/g, '    '),
                    lang: 'php',
                    title: 'functions.php',
                  },
                  'The version argument is `null` because the URL already pins the release; WordPress then adds no `?ver=` query.',
                ],
              },
              {
                label: 'npm',
                blocks: [
                  'Ship the stylesheet inside the theme. From the theme folder:',
                  { term: 'npm install monsooncss\ncp node_modules/monsooncss/dist/monsoon.min.css assets/css/monsoon.min.css', title: 'bash' },
                  {
                    code: `<?php
add_action( 'wp_enqueue_scripts', function () {
	wp_enqueue_style( 'monsoon', get_theme_file_uri( 'assets/css/monsoon.min.css' ), array(), '${VERSION}' );
	wp_enqueue_style( 'my-theme', get_stylesheet_uri(), array( 'monsoon' ), wp_get_theme()->get( 'Version' ) );
	wp_enqueue_script( 'my-theme-toggle', get_theme_file_uri( 'assets/js/theme-toggle.js' ), array(), wp_get_theme()->get( 'Version' ), array( 'in_footer' => true ) );
} );

add_action( 'wp_head', function () {
	wp_print_inline_script_tag( "${THEME}" );
}, 1 );`.replace(/\t/g, '    '),
                    lang: 'php',
                    title: 'functions.php',
                  },
                  'Commit `assets/css/monsoon.min.css` with the theme so it installs from a zip without Node.js.',
                ],
              },
            ],
          },
          { note: 'Priority `1` on `wp_head` prints the theme script before the stylesheets, so the class is on `<html>` before anything paints.' },
        ],
      },
      {
        h: 'Use the classes',
        blocks: [
          '`body_class()` and `post_class()` accept extra classes, so Monsoon utilities sit next to the classes WordPress adds:',
          {
            code: `<!doctype html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo( 'charset' ); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <?php wp_head(); ?>
</head>
<body <?php body_class( 'bg-background text-foreground antialiased' ); ?>>
<?php wp_body_open(); ?>
<header class="border-b">
    <div class="mx-auto max-w-5xl flex items-center justify-between px-6 py-4">
        <a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="text-lg font-semibold"><?php bloginfo( 'name' ); ?></a>
        <button type="button" id="theme-toggle" class="rounded-lg border px-3 py-2 text-sm hover:bg-muted">Toggle theme</button>
    </div>
</header>`,
            lang: 'php',
            title: 'header.php',
          },
          {
            code: `<article id="post-<?php the_ID(); ?>" <?php post_class( 'rounded-2xl border bg-surface p-6 shadow-sm space-y-3' ); ?>>
    <h2 class="text-xl font-semibold">
        <a href="<?php the_permalink(); ?>" class="hover:text-primary"><?php the_title(); ?></a>
    </h2>
    <p class="text-sm text-muted-foreground"><?php echo esc_html( get_the_date() ); ?></p>
    <div class="text-muted-foreground"><?php the_excerpt(); ?></div>
    <?php if ( is_sticky() ) : ?>
        <span class="inline-block rounded-full bg-secondary text-secondary-foreground px-2 py-1 text-xs font-medium">Featured</span>
    <?php endif; ?>
</article>`,
            lang: 'php',
            title: 'template-parts/content-card.php',
          },
          'In the block editor, type classes into **Advanced > Additional CSS class(es)** on any block.',
        ],
      },
      {
        h: 'Dark mode',
        blocks: [
          'The inline script printed in `wp_head` sets the scheme. The button in `header.php` above is wired up by the enqueued toggle script:',
          { code: TOGGLE_JS, lang: 'js', title: 'assets/js/theme-toggle.js' },
          '`wp_print_inline_script_tag()` adds the attributes that a security plugin or a CSP filter asks for, which a hand written `<script>` in `header.php` would miss.',
        ],
      },
      {
        h: 'Theme with --seed',
        blocks: [
          'Let site owners pick the brand color in the Customizer, sanitize it, and print it as an inline style attached to the Monsoon handle:',
          {
            code: `<?php
add_action( 'customize_register', function ( $wp_customize ) {
	$wp_customize->add_setting( 'monsoon_seed', array(
		'default'           => '#0d9488',
		'sanitize_callback' => 'sanitize_hex_color',
	) );
	$wp_customize->add_control( new WP_Customize_Color_Control( $wp_customize, 'monsoon_seed', array(
		'label'   => __( 'Brand color', 'my-theme' ),
		'section' => 'colors',
	) ) );
} );

add_action( 'wp_enqueue_scripts', function () {
	$seed = sanitize_hex_color( get_theme_mod( 'monsoon_seed', '#0d9488' ) );
	if ( $seed ) {
		wp_add_inline_style( 'monsoon', ':root { --seed: ' . $seed . '; }' );
	}
}, 20 );`.replace(/\t/g, '    '),
            lang: 'php',
            title: 'functions.php',
          },
          'Block themes can skip the Customizer and set `:root { --seed: ... }` in their own stylesheet. ' + SEED_LINK,
        ],
      },
      {
        h: 'Using the purge CLI',
        blocks: [
          'Run it from the theme folder:',
          {
            code: `{
  "private": true,
  "scripts": {
    "css:purge": "monsooncss purge \\"*.php\\" \\"template-parts/**/*.php\\" \\"inc/**/*.php\\" \\"parts/**/*.html\\" \\"templates/**/*.html\\" \\"assets/js/**/*.js\\" -o assets/css/monsoon.css"
  },
  "devDependencies": {
    "monsooncss": "^${VERSION}"
  }
}`,
            lang: 'json',
            title: 'package.json',
          },
          'Then enqueue the purged file on production sites only:',
          {
            code: `<?php
$monsoon = 'production' === wp_get_environment_type()
	? get_theme_file_uri( 'assets/css/monsoon.css' )
	: '${CDN}';

wp_enqueue_style( 'monsoon', $monsoon, array(), null );`.replace(/\t/g, '    '),
            lang: 'php',
            title: 'functions.php',
          },
          { warn: 'Classes typed into the block editor are stored in the database, not in theme files, so the purge cannot see them. On sites where editors add classes, either list them in `--safelist` or ship the full file.' },
          { note: PURGE_NOTE },
          PURGE_KEEPS,
        ],
      },
      nextSteps(['Not using WordPress? See [PHP](install-php.html).']),
    ],
    faqs: [
      ['How do I see Monsoon classes inside the block editor?', "Add `add_theme_support( 'editor-styles' );` and `add_editor_style( 'assets/css/monsoon.min.css' );` in `after_setup_theme`, using the bundled copy."],
      ['Can I use Monsoon in a plugin instead of a theme?', 'Yes. Enqueue it the same way from the plugin with `plugins_url()`, and give the handle a prefix so it does not clash with a theme that also loads Monsoon.'],
    ],
  },

  // 16. PHP
  {
    slug: 'install-php',
    nav: 'PHP',
    stack: 'PHP',
    title: 'Install Monsoon in PHP',
    metaTitle: 'Install Monsoon in PHP | Monsoon docs',
    description: 'Use Monsoon in a plain PHP site: one link in a shared header include, classes in templates, an escaped --seed from your data and a purge.',
    lead: 'A plain PHP site usually shares one header include across pages. Put the Monsoon `<link>` there and every page that includes it gets the utilities, the seed theme and dark mode.',
    sections: [
      {
        h: 'Install',
        blocks: [
          {
            tabs: [
              {
                label: 'CDN',
                blocks: [
                  {
                    code: `<?php $title = $title ?? 'My site'; ?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title><?= htmlspecialchars($title, ENT_QUOTES) ?></title>
  <link rel="stylesheet" href="${CDN}">
  <script>${THEME}</script>
</head>
<body class="bg-background text-foreground antialiased">`,
                    lang: 'php',
                    title: 'includes/header.php',
                  },
                ],
              },
              {
                label: 'npm',
                blocks: [
                  { term: 'npm install monsooncss\ncp node_modules/monsooncss/dist/monsoon.min.css public/css/monsoon.min.css', title: 'bash' },
                  {
                    code: `<?php $title = $title ?? 'My site'; ?>
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title><?= htmlspecialchars($title, ENT_QUOTES) ?></title>
  <link rel="stylesheet" href="/css/monsoon.min.css">
  <script>${THEME}</script>
</head>
<body class="bg-background text-foreground antialiased">`,
                    lang: 'php',
                    title: 'includes/header.php',
                  },
                  'This assumes `public/` is the web root. Composer projects can do the same; Monsoon has no PHP package to install.',
                ],
              },
            ],
          },
          {
            code: `<?php
$title = 'Pricing';
require __DIR__ . '/../includes/header.php';
?>
<main class="mx-auto max-w-5xl px-6 py-12">
  <h1 class="text-3xl font-bold tracking-tight">Pricing</h1>
</main>
<?php require __DIR__ . '/../includes/footer.php'; ?>`,
            lang: 'php',
            title: 'public/pricing.php',
          },
        ],
      },
      {
        h: 'Use the classes',
        blocks: [
          'A small render function keeps markup in one place. Escape every value, and keep each class branch a full string:',
          {
            code: `<?php
function plan_card(array $plan): void
{
    $featured = !empty($plan['featured']);
    $card = $featured
        ? 'rounded-2xl border bg-surface p-6 space-y-4 ring-2 ring-ring'
        : 'rounded-2xl border bg-surface p-6 space-y-4 shadow-sm';
    $button = $featured
        ? 'block rounded-lg bg-primary text-primary-foreground px-4 py-2 text-center font-medium hover:bg-primary/90'
        : 'block rounded-lg bg-secondary text-secondary-foreground px-4 py-2 text-center font-medium hover:bg-secondary/80';
    $name = htmlspecialchars($plan['name'], ENT_QUOTES);
    ?>
    <article class="<?= $card ?>">
      <h2 class="text-lg font-semibold"><?= $name ?></h2>
      <p class="text-3xl font-bold"><?= htmlspecialchars($plan['price'], ENT_QUOTES) ?></p>
      <a href="/signup.php?plan=<?= urlencode($plan['slug']) ?>" class="<?= $button ?>">Choose <?= $name ?></a>
    </article>
    <?php
}`,
            lang: 'php',
            title: 'includes/components.php',
          },
          {
            code: `<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
  <?php foreach ($plans as $plan) { plan_card($plan); } ?>
</div>`,
            lang: 'php',
            title: 'public/pricing.php',
          },
        ],
      },
      {
        h: 'Dark mode',
        blocks: [
          'The head script in the header include sets the scheme before paint. Put the button in the header and the toggle script in the footer include:',
          { code: TOGGLE_BUTTON, lang: 'php', title: 'includes/header.php' },
          {
            code: `<script src="/js/theme-toggle.js" defer></script>
</body>
</html>`,
            lang: 'php',
            title: 'includes/footer.php',
          },
          { code: TOGGLE_JS, lang: 'js', title: 'public/js/theme-toggle.js' },
        ],
      },
      {
        h: 'Theme with --seed',
        blocks: [
          'Check the color against a strict pattern before printing it. `htmlspecialchars` stops HTML injection, but only the pattern keeps the value a valid CSS color:',
          {
            code: `<?php
$seed = $team['brand_color'] ?? '';
if (!preg_match('/^#[0-9a-f]{6}$/i', $seed)) {
    $seed = '#0d9488';
}
?>
<section style="--seed: <?= $seed ?>" class="rounded-2xl bg-surface p-6 space-y-4">
  <h2 class="text-xl font-bold text-primary"><?= htmlspecialchars($team['name'], ENT_QUOTES) ?></h2>
  <a href="/team.php" class="inline-block rounded-lg bg-primary text-primary-foreground px-4 py-2">Open</a>
</section>`,
            lang: 'php',
            title: 'public/team.php',
          },
          SEED_LINK,
        ],
      },
      {
        h: 'Using the purge CLI',
        blocks: [
          'Point the globs at your PHP folders, not the whole project, so `vendor/` stays out of the scan:',
          {
            code: `{
  "private": true,
  "scripts": {
    "css:purge": "monsooncss purge \\"public/**/*.php\\" \\"includes/**/*.php\\" \\"templates/**/*.php\\" \\"public/js/**/*.js\\" -o public/css/monsoon.css"
  },
  "devDependencies": {
    "monsooncss": "^${VERSION}"
  }
}`,
            lang: 'json',
            title: 'package.json',
          },
          'Then link `/css/monsoon.css` in the header include. Node.js is only needed on the machine that runs the script; the server just serves a CSS file.',
          { note: PURGE_NOTE },
          PURGE_KEEPS,
        ],
      },
      nextSteps(['Using a framework or CMS? See [Laravel](install-laravel.html) or [WordPress](install-wordpress.html).']),
    ],
    faqs: [
      ['Does Monsoon need Composer?', 'No. It is a static CSS file. Link it from the CDN or copy it into your web root.'],
      ['Can I keep the toggle choice on the server?', 'Yes. Save it in a cookie, read `$_COOKIE`, and print `class="dark"` or `class="light"` on `<html>` after checking the value against those two words.'],
    ],
  },

  // 17. Electron
  {
    slug: 'install-electron',
    nav: 'Electron',
    stack: 'Electron',
    title: 'Install Monsoon in Electron',
    metaTitle: 'Install Monsoon in Electron | Monsoon docs',
    description: 'Use Monsoon in an Electron renderer: a local stylesheet or the CDN, a content security policy that allows it, and dark mode that matches nativeTheme.',
    lead: 'An Electron window is a web page, so Monsoon works in the renderer like anywhere else. The differences are a content security policy, offline use and a native title bar that should follow your theme.',
    sections: [
      {
        h: 'Install',
        blocks: [
          'A desktop app should not need a network connection to look right, so the local file is the better default. The CDN works too if your app is always online.',
          {
            tabs: [
              {
                label: 'CDN',
                blocks: [
                  {
                    code: `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' ${CDN_HOST}; img-src 'self' data:">
  <title>My app</title>
  <link rel="stylesheet" href="${CDN}">
  <script src="./theme-init.js"></script>
</head>
<body class="bg-background text-foreground antialiased">
  <main class="p-6 space-y-4">
    <h1 class="text-2xl font-bold">Hello from Electron</h1>
  </main>
  <script src="./renderer.js"></script>
</body>
</html>`,
                    lang: 'html',
                    title: 'src/index.html',
                  },
                ],
              },
              {
                label: 'npm',
                blocks: [
                  { term: 'npm install monsooncss', title: 'bash' },
                  {
                    code: `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:">
  <title>My app</title>
  <link rel="stylesheet" href="../node_modules/monsooncss/dist/monsoon.min.css">
  <script src="./theme-init.js"></script>
</head>
<body class="bg-background text-foreground antialiased">
  <main class="p-6 space-y-4">
    <h1 class="text-2xl font-bold">Hello from Electron</h1>
  </main>
  <script src="./renderer.js"></script>
</body>
</html>`,
                    lang: 'html',
                    title: 'src/index.html',
                  },
                  'Install it as a regular dependency, not a dev dependency, so packagers include it in the app archive. If your renderer goes through a bundler (the Electron Forge Vite template or electron-vite), use `import \'monsooncss\';` in the renderer entry instead of the `<link>`.',
                ],
              },
            ],
          },
          {
            code: `${THEME};`,
            lang: 'js',
            title: 'src/theme-init.js',
          },
          { note: "A strict policy (`script-src 'self'`) blocks inline scripts, so the theme script lives in its own file, loaded without `defer` or `type=\"module\"` so it still runs before the first paint. `img-src data:` lets the inline SVG images some styles use load." },
        ],
      },
      {
        h: 'Use the classes',
        blocks: [
          'Classes work in static HTML and in markup you create from the renderer script:',
          {
            code: `<div class="flex min-h-dvh">
  <aside class="w-64 shrink-0 border-r bg-surface p-4 space-y-1">
    <a href="#inbox" class="block rounded-lg bg-primary text-primary-foreground px-3 py-2 text-sm font-medium">Inbox</a>
    <a href="#archive" class="block rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted">Archive</a>
  </aside>
  <main class="flex-1 min-w-0 p-6 space-y-4">
    ${CARD_HTML.split('\n').join('\n    ')}
  </main>
</div>`,
            lang: 'html',
            title: 'src/index.html',
          },
        ],
      },
      {
        h: 'Dark mode',
        blocks: [
          'Toggle the class in the renderer as usual. To keep the native title bar and menus in step, also tell the main process, which sets `nativeTheme.themeSource`:',
          {
            code: `const button = document.getElementById('theme-toggle');

button.addEventListener('click', () => {
  const root = document.documentElement;
  const next = root.classList.contains('dark') ? 'light' : 'dark';
  root.classList.remove('dark', 'light');
  root.classList.add(next);
  try { localStorage.setItem('monsoon-theme', next); } catch (e) {}
  window.appTheme?.set(next);
});`,
            lang: 'js',
            title: 'src/renderer.js',
          },
          {
            code: `const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('appTheme', {
  set: (theme) => ipcRenderer.invoke('theme:set', theme),
});`,
            lang: 'js',
            title: 'src/preload.js',
          },
          {
            code: `const { app, BrowserWindow, ipcMain, nativeTheme } = require('electron');
const path = require('node:path');

ipcMain.handle('theme:set', (_event, theme) => {
  if (['light', 'dark', 'system'].includes(theme)) nativeTheme.themeSource = theme;
});

app.whenReady().then(() => {
  const win = new BrowserWindow({
    width: 1100,
    height: 720,
    webPreferences: { preload: path.join(__dirname, 'preload.js') },
  });
  win.loadFile(path.join(__dirname, 'index.html'));
});`,
            lang: 'js',
            title: 'src/main.js',
          },
          'Setting `nativeTheme.themeSource` also changes `prefers-color-scheme` inside the window, so with `system` Monsoon simply follows the OS again.',
        ],
      },
      {
        h: 'Theme with --seed',
        blocks: [
          "Under `style-src 'self'` an inline `style=\"--seed: ...\"` attribute is blocked, but setting the property from script is not. Use `style.setProperty`:",
          {
            code: `function applySeed(color) {
  document.documentElement.style.setProperty('--seed', color);
  try { localStorage.setItem('monsoon-seed', color); } catch (e) {}
}

try {
  const saved = localStorage.getItem('monsoon-seed');
  if (saved) applySeed(saved);
} catch (e) {}`,
            lang: 'js',
            title: 'src/renderer.js',
          },
          'For a fixed brand color, put `:root { --seed: #0d9488; }` in your own stylesheet instead. ' + SEED_LINK,
        ],
      },
      {
        h: 'Using the purge CLI',
        blocks: [
          'File size matters less when the stylesheet is read from disk, but a purged file still parses faster and shrinks the app archive:',
          {
            code: `{
  "scripts": {
    "start": "electron .",
    "css:purge": "monsooncss purge \\"src/**/*.{html,js}\\" -o src/monsoon.css"
  }
}`,
            lang: 'json',
            title: 'package.json',
          },
          'Change the `<link>` to `./monsoon.css` and run the script before you package. Monsoon can then move to `devDependencies`, since the app no longer reads it from `node_modules`.',
          { note: PURGE_NOTE },
          PURGE_KEEPS,
        ],
      },
      nextSteps(),
    ],
    faqs: [
      ['Why does the stylesheet not load in my packaged Electron app?', 'Usually because `monsooncss` is a dev dependency and the packager skipped it, or because the policy blocks it. Make it a regular dependency (or ship the purged copy) and check `style-src`.'],
      ['Does dark mode follow the OS in Electron?', 'Yes. Without a stored choice Monsoon follows `prefers-color-scheme`, which Electron maps to the OS setting or to `nativeTheme.themeSource`.'],
    ],
  },
];
