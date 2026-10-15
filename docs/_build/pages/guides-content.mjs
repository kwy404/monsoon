// Long form guides. Text uses a tiny inline markup: `code`, **bold**, [link](url).
// Every class in a code sample or demo must exist in scripts/classes.json.
const CDN = 'https://cdn.jsdelivr.net/npm/monsooncss';
import { readFileSync } from 'node:fs';
const VERSION = JSON.parse(readFileSync(new URL('../../../package.json', import.meta.url), 'utf8')).version;
const PIN = `https://cdn.jsdelivr.net/npm/monsooncss@${VERSION}/dist/monsoon.min.css`;

export const guides = [
  // 1
  {
    slug: 'utility-css-cdn-in-production',
    short: 'Using the CDN in production',
    kicker: 'Production',
    title: 'Using the CDN build in production',
    metaTitle: 'Using the CDN build in production | Monsoon',
    description: 'File sizes, caching, version pinning and when to purge the stylesheet before you ship.',
    blurb: 'Real numbers for size and caching, plus a short checklist for shipping the stylesheet to production.',
    lead: 'Serving a complete utility stylesheet from a CDN in production is a reasonable choice for most sites. This guide puts numbers on it, explains caching and render blocking, and shows when it is worth purging the file instead.',
    sections: [
      {
        h: 'The numbers',
        blocks: [
          `The production file is \`dist/monsoon.min.css\`. Measured on version ${VERSION}:`,
          {
            table: {
              head: ['Encoding', 'Size'],
              rows: [
                ['Minified, uncompressed', 'about %RAW%'],
                ['gzip', 'about %GZIP%'],
                ['brotli', 'about %BROTLI%'],
              ],
            },
          },
          'CDNs and most hosts send brotli to browsers that accept it, so %BROTLI% is what a visitor downloads once. The repository has a size check that warns above 100 kB and fails above 120 kB with brotli, so the number cannot creep up unnoticed.',
          'For comparison with everyday assets: that is less than a typical hero photo, and the stylesheet is shared by every page of the site.',
        ],
      },
      {
        h: 'Caching and pinning',
        blocks: [
          'Pin the version in production. A versioned URL never changes content, so the browser can keep it in cache across visits and the CDN can serve it from the edge:',
          { code: `<link rel="stylesheet" href="${PIN}">`, lang: 'html', title: 'layout.html' },
          'Modern browsers partition their cache per site, so do not count on visitors already having the file from another website. Count on the second page view and every later visit being free.',
        ],
      },
      {
        h: 'Render blocking is a feature for CSS',
        blocks: [
          'Stylesheets in the head block the first paint until they load. For your main stylesheet that is exactly what you want: the alternative is a flash of unstyled content. Keep it fast by:',
          {
            list: [
              'placing the `<link>` early in the `<head>`,',
              'using `<link rel="preconnect">` for the CDN host if it is a new origin for the page,',
              'avoiding `@import` chains, which make the browser discover files one after another.',
            ],
          },
          'There is no JavaScript to wait for. Seed theming and dark mode are computed by the CSS engine during the same style pass as everything else.',
        ],
      },
      {
        h: 'When purging is worth it',
        blocks: [
          'Purging removes the rules your files never mention. It is worth the extra step when the first visit matters a lot (for example a landing page for paid traffic), when you serve users on slow networks, or when you already have a deploy step anyway.',
          {
            term: 'npx monsooncss purge "src/**/*.html" "src/**/*.js" -o public/monsoon.css',
            out: '%PURGE_OUT%',
          },
          'That output comes from the kitchen sink demo in the repository, a page that uses a wide mix of utilities. The purged file keeps the reset, the theme tokens and the keyframes, so seed theming and dark mode still work.',
          { note: 'The purge command looks for class names as whole words in your files. If you build a class name from pieces at runtime, such as `"bg-" + status`, list the results with `--safelist bg-success,bg-danger` so they are kept.' },
        ],
      },
      {
        h: 'Production checklist',
        blocks: [
          {
            ol: [
              'Pin the exact version in the URL.',
              'Add `integrity` and `crossorigin` if your security policy wants subresource integrity.',
              'Preconnect to the CDN host, or self host the file on your own origin.',
              'Decide if the full file is fine. If not, purge in your deploy step and safelist dynamic classes.',
              'Check the page in light and dark mode, and with your seed color, before you ship.',
            ],
          },
        ],
      },
    ],
    faqs: [
      ['Is loading the stylesheet from a CDN fine in production?', 'No, as long as you pin a version. Many production sites load CSS from public CDNs. Self host it if your security policy or privacy rules require it.'],
      ['How big is Monsoon after purging?', 'It depends on how many classes you use. The kitchen sink demo, which uses a wide mix, purges to about %PURGED% with brotli. Purging removes unused utilities; the reset, the theme tokens and the component layer are always kept.'],
      ['Does purging break dark mode or theming?', 'No. The purge command always keeps the theme tokens, the dark mode switch, the reset and the keyframes. Only unused utility rules are removed.'],
      ['Should I inline the CSS?', 'For most sites no. A cached external file is better across page views. Inlining a purged file can make sense for a single landing page.'],
    ],
    related: ['generate-a-theme-from-one-color-css', 'oklch-color-palette-css', 'accessible-color-contrast-css'],
  },

  // 2
  {
    slug: 'generate-a-theme-from-one-color-css',
    short: 'How the seed theme works',
    kicker: 'Theming',
    title: 'How the seed color theme works',
    metaTitle: 'How the seed color theme works | Monsoon',
    description: 'How Monsoon turns one --seed color into primary, accent, surface and text colors with OKLCH relative colors.',
    blurb: 'How one --seed custom property becomes primary, accent, surfaces and readable text, in pure CSS.',
    lead: 'With Monsoon a theme is one line: `--seed: #0d9488`. The browser derives every semantic color from it with OKLCH relative color syntax, including foregrounds that keep readable contrast. No preprocessor, no generator website, no JavaScript.',
    sections: [
      {
        h: 'Set the seed',
        blocks: [
          'Any valid CSS color works: a hex value, a named color, `rgb()`, `hsl()` or `oklch()`. Put it on the root element to theme the whole page:',
          { code: `:root {
  --seed: #0d9488;
}`, lang: 'css', title: 'theme.css' },
          'Or skip the stylesheet and use an attribute. Any element with `--seed` in its `style` attribute recomputes the tokens for its subtree:',
          { code: `<section style="--seed: teal" class="rounded-2xl bg-surface p-8 space-y-3">
  <h2 class="text-2xl font-bold text-primary">Teal section</h2>
  <button class="rounded-lg bg-primary text-primary-foreground px-4 py-2">Primary</button>
  <button class="rounded-lg bg-accent text-accent-foreground px-4 py-2">Accent</button>
</section>`, lang: 'html', title: 'section.html' },
          {
            demo: `<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
  <div style="--seed: teal" class="rounded-xl border bg-surface p-5 space-y-3"><p class="font-semibold text-primary">teal</p><button class="w-full rounded-md bg-primary text-primary-foreground py-2 font-medium">Primary</button><button class="w-full rounded-md bg-accent text-accent-foreground py-2 font-medium">Accent</button></div>
  <div style="--seed: #e11d48" class="rounded-xl border bg-surface p-5 space-y-3"><p class="font-semibold text-primary">#e11d48</p><button class="w-full rounded-md bg-primary text-primary-foreground py-2 font-medium">Primary</button><button class="w-full rounded-md bg-accent text-accent-foreground py-2 font-medium">Accent</button></div>
  <div style="--seed: gold" class="rounded-xl border bg-surface p-5 space-y-3"><p class="font-semibold">gold</p><button class="w-full rounded-md bg-primary text-primary-foreground py-2 font-medium">Primary</button><button class="w-full rounded-md bg-accent text-accent-foreground py-2 font-medium">Accent</button></div>
</div>`,
            label: 'Three seeds on one page',
          },
          'Notice the gold card: a light seed gets dark text on its buttons, a darker seed gets white text. That flip is automatic.',
        ],
      },
      {
        h: 'The tokens you get',
        blocks: [
          'Every token is available as a utility for text, background, border, ring and more (`bg-primary`, `text-muted-foreground`, `border-border`) and as a custom property (`var(--primary)`) for your own CSS.',
          {
            table: {
              head: ['Token', 'Derived as'],
              rows: [
                ['`primary`, `primary-foreground`', 'The seed with lightness pushed out of the unsafe band, and white or near black text.'],
                ['`secondary`, `secondary-foreground`', 'A low chroma tint of the seed for quiet buttons.'],
                ['`accent`, `accent-foreground`', 'The seed hue turned by 180 degrees, kept light.'],
                ['`background`, `foreground`', 'Near white and near black in light mode, swapped in dark mode, with a hint of the seed hue.'],
                ['`surface`, `surface-2`, `surface-3`', 'Raised layers for cards and panels.'],
                ['`muted`, `muted-foreground`', 'Subtle fills and secondary text.'],
                ['`border`, `ring`', 'Hairlines and the focus ring.'],
                ['`success`, `warning`, `danger`, `info`', 'Fixed status hues with their own foregrounds.'],
              ],
            },
          },
        ],
      },
      {
        h: 'How it works: OKLCH relative colors',
        blocks: [
          'Relative color syntax reads the channels of an existing color and lets you compute a new one from them. In OKLCH the channels are lightness `l`, chroma `c` and hue `h`, and lightness tracks how bright a color looks to people. That makes it the right space to reason about contrast. This is the real declaration for the background token:',
          { code: `--background: oklch(from var(--seed) calc(0.99 - 0.83 * var(--mode)) min(c, 0.012) h);`, lang: 'css', title: 'monsoon.css' },
          'It keeps the hue of your seed, caps the chroma so the background stays almost neutral, and picks a lightness of 0.99 in light mode or 0.16 in dark mode. `--mode` is a number, 0 or 1, which is how one declaration serves both schemes.',
          { h3: 'The primary color and its foreground' },
          'White text needs a dark fill and dark text needs a light fill. Around a lightness of 0.52 to 0.66 neither choice reaches a 4.5:1 contrast ratio for every hue, so Monsoon moves the primary color out of that band, to whichever side is closer to your seed. The step is written with `clamp()` and a large multiplier, a branch free "if" that works inside `calc()`:',
          { code: `--primary: oklch(from var(--_seed)
  calc((1 - clamp(0, (l - 0.6) * 100000, 1)) * min(l, 0.52)
     + clamp(0, (l - 0.6) * 100000, 1) * max(l, 0.66)) c h);

--primary-foreground: oklch(from var(--primary)
  clamp(0.17, (0.6 - l) * 100000, 1) min(c, 0.03) h);`, lang: 'css', title: 'monsoon.css' },
          'The foreground is white when the primary is dark and near black when it is light. The [accessible contrast guide](accessible-color-contrast-css.html) shows how this is tested.',
        ],
      },
      {
        h: 'Per section themes and the theme class',
        blocks: [
          'Custom properties are resolved where they are declared. That is why Monsoon redeclares the tokens on `:root`, on `.dark`, `.light`, `[data-theme]` and on any element whose `style` attribute contains `--seed`. If you set the seed from your own stylesheet on some other element, add the `theme` class to it so the tokens are recomputed there:',
          { code: `[data-brand="orange"] { --seed: #ea580c; }`, lang: 'css', title: 'site.css' },
          { code: `<aside data-brand="orange" class="theme rounded-xl bg-surface p-6">
  <a class="text-primary underline">Orange link</a>
</aside>`, lang: 'html', title: 'aside.html' },
        ],
      },
      {
        h: 'Older browsers',
        blocks: [
          'Relative color syntax is supported in current versions of Chrome, Edge, Firefox and Safari. For older browsers Monsoon ships a static fallback inside `@supports not (color: oklch(from red l c h))`: the tokens fall back to values computed from the default seed, `primary` and `ring` use your `--seed` directly, and the tokens that only depend on the color scheme still switch between light and dark.',
          'In practice that means a visitor on an old browser still gets a coherent, readable page in the default palette with your seed on primary buttons and links. Nothing breaks and no script is needed to detect support.',
        ],
      },
    ],
    faqs: [
      ['Which color formats can I use for --seed?', 'Any CSS color: hex, named colors, `rgb()`, `hsl()`, `oklch()` and others. The browser converts it to OKLCH for the calculations.'],
      ['Can users pick their own theme color?', 'Yes. Write their color into a `style="--seed: ..."` attribute from your server, or set it with one line of JavaScript on the root element. Everything else follows.'],
      ['Do I have to use the generated colors?', 'No. The 22 hue palette is available too, as `bg-blue-600`, `text-rose-500` and so on. Semantic tokens are recommended because they adapt to dark mode and to the seed.'],
      ['Does it work without JavaScript?', 'Yes. The theme is computed by the CSS engine. JavaScript is only needed if you want to change the seed interactively.'],
    ],
    related: ['accessible-color-contrast-css', 'oklch-color-palette-css', 'utility-css-cdn-in-production'],
  },

  // 3
  {
    slug: 'oklch-color-palette-css',
    short: 'The color palette',
    kicker: 'Color',
    title: 'The OKLCH color palette',
    metaTitle: 'The OKLCH color palette | Monsoon',
    description: 'The 22 hue palette: how it is generated in OKLCH, the variable names and the matching utilities.',
    blurb: '22 hues, 11 steps each, generated in OKLCH on one lightness curve and kept inside the sRGB gamut.',
    lead: 'Besides the seed derived tokens, Monsoon includes a fixed palette of 22 hues with 11 steps each, from 50 to 950. It is generated in OKLCH so that the same step looks equally light across hues, and every color is available as a custom property and as utilities.',
    sections: [
      {
        h: 'The hues and steps',
        blocks: [
          'Five neutrals and seventeen colors: `slate`, `gray`, `zinc`, `neutral`, `stone`, `red`, `orange`, `amber`, `yellow`, `lime`, `green`, `emerald`, `teal`, `cyan`, `sky`, `blue`, `indigo`, `violet`, `purple`, `fuchsia`, `pink` and `rose`. Steps run `50`, `100`, `200` and so on up to `900`, then `950`.',
          {
            demo: `<div class="space-y-2">
  <div class="grid grid-cols-11 gap-1"><div class="h-8 rounded bg-blue-50"></div><div class="h-8 rounded bg-blue-100"></div><div class="h-8 rounded bg-blue-200"></div><div class="h-8 rounded bg-blue-300"></div><div class="h-8 rounded bg-blue-400"></div><div class="h-8 rounded bg-blue-500"></div><div class="h-8 rounded bg-blue-600"></div><div class="h-8 rounded bg-blue-700"></div><div class="h-8 rounded bg-blue-800"></div><div class="h-8 rounded bg-blue-900"></div><div class="h-8 rounded bg-blue-950"></div></div>
  <div class="grid grid-cols-11 gap-1"><div class="h-8 rounded bg-amber-50"></div><div class="h-8 rounded bg-amber-100"></div><div class="h-8 rounded bg-amber-200"></div><div class="h-8 rounded bg-amber-300"></div><div class="h-8 rounded bg-amber-400"></div><div class="h-8 rounded bg-amber-500"></div><div class="h-8 rounded bg-amber-600"></div><div class="h-8 rounded bg-amber-700"></div><div class="h-8 rounded bg-amber-800"></div><div class="h-8 rounded bg-amber-900"></div><div class="h-8 rounded bg-amber-950"></div></div>
  <div class="grid grid-cols-11 gap-1"><div class="h-8 rounded bg-emerald-50"></div><div class="h-8 rounded bg-emerald-100"></div><div class="h-8 rounded bg-emerald-200"></div><div class="h-8 rounded bg-emerald-300"></div><div class="h-8 rounded bg-emerald-400"></div><div class="h-8 rounded bg-emerald-500"></div><div class="h-8 rounded bg-emerald-600"></div><div class="h-8 rounded bg-emerald-700"></div><div class="h-8 rounded bg-emerald-800"></div><div class="h-8 rounded bg-emerald-900"></div><div class="h-8 rounded bg-emerald-950"></div></div>
  <div class="grid grid-cols-11 gap-1"><div class="h-8 rounded bg-rose-50"></div><div class="h-8 rounded bg-rose-100"></div><div class="h-8 rounded bg-rose-200"></div><div class="h-8 rounded bg-rose-300"></div><div class="h-8 rounded bg-rose-400"></div><div class="h-8 rounded bg-rose-500"></div><div class="h-8 rounded bg-rose-600"></div><div class="h-8 rounded bg-rose-700"></div><div class="h-8 rounded bg-rose-800"></div><div class="h-8 rounded bg-rose-900"></div><div class="h-8 rounded bg-rose-950"></div></div>
  <div class="grid grid-cols-11 gap-1"><div class="h-8 rounded bg-slate-50"></div><div class="h-8 rounded bg-slate-100"></div><div class="h-8 rounded bg-slate-200"></div><div class="h-8 rounded bg-slate-300"></div><div class="h-8 rounded bg-slate-400"></div><div class="h-8 rounded bg-slate-500"></div><div class="h-8 rounded bg-slate-600"></div><div class="h-8 rounded bg-slate-700"></div><div class="h-8 rounded bg-slate-800"></div><div class="h-8 rounded bg-slate-900"></div><div class="h-8 rounded bg-slate-950"></div></div>
</div>`,
            label: 'blue, amber, emerald, rose and slate, 50 to 950',
          },
        ],
      },
      {
        h: 'Why OKLCH',
        blocks: [
          'In the familiar RGB and HSL spaces, two colors with the same "lightness" number can look very different: a pure yellow looks far lighter than a pure blue. OKLCH is a perceptual space. Its lightness channel follows what people see, chroma measures colorfulness and hue is an angle. That gives the palette a useful property: **step 500 of one hue sits next to step 500 of another**, so swapping `bg-blue-600` for `bg-violet-600` keeps the same visual weight and roughly the same contrast with white text.',
          'Monsoon generates the palette from a short list of hue definitions. Every hue shares one lightness curve from 0.975 at step 50 to 0.27 at step 950. Warm hues such as amber and yellow get a small lightness lift around their peak, which is where those colors naturally look best, and each hue drifts slightly across the steps so dark shades do not turn muddy.',
        ],
      },
      {
        h: 'Kept inside sRGB on purpose',
        blocks: [
          'OKLCH can describe colors that most screens cannot show. Each step is generated with a requested chroma and then reduced, by a binary search, until it fits inside the sRGB gamut. The result renders the same in every browser and on every display instead of being clipped differently by each one.',
        ],
      },
      {
        h: 'Using the palette',
        blocks: [
          'Every color is a custom property named `--color-{hue}-{step}` on the root element, written as an `oklch()` value. Use them in your own CSS:',
          { code: `.chart-bar {
  background: var(--color-emerald-500);
}
.chart-bar.negative {
  background: var(--color-rose-500);
}`, lang: 'css', title: 'chart.css' },
          'And as utilities. Text, background and border get every step; ring, outline, decoration, fill, stroke and shadow color get the middle steps 400, 500 and 600, and so do gradient stops:',
          { code: `<span class="rounded-full bg-emerald-100 text-emerald-800 px-3 py-1 text-sm">Paid</span>
<div class="border-l-4 border-amber-500 bg-amber-50 p-4 text-amber-900">Pending review</div>
<div class="h-24 rounded-xl bg-gradient-to-r from-sky-500 via-indigo-500 to-fuchsia-500"></div>`, lang: 'html', title: 'palette.html' },
          {
            demo: `<div class="space-y-3"><div class="flex flex-wrap gap-2"><span class="rounded-full bg-emerald-100 text-emerald-800 px-3 py-1 text-sm">Paid</span><span class="rounded-full bg-amber-100 text-amber-800 px-3 py-1 text-sm">Pending</span><span class="rounded-full bg-rose-100 text-rose-800 px-3 py-1 text-sm">Overdue</span></div><div class="h-16 rounded-xl bg-gradient-to-r from-sky-500 via-indigo-500 to-fuchsia-500"></div></div>`,
          },
        ],
      },
      {
        h: 'Contrast across the palette',
        blocks: [
          'Because every hue follows the same lightness curve, contrast rules of thumb carry across hues. Steps 600 and darker take white text comfortably for normal sized text, and steps 100 and lighter work as tinted backgrounds for text in the 800 to 950 range of the same hue. The middle of the scale, around 400 and 500, is best for large text, icons, borders, chart series and decoration rather than small body text.',
          'These are starting points, not guarantees: warm hues are deliberately lifted at their peak, so a yellow 500 is lighter than a blue 500 and pairs with dark text instead of white. When in doubt, measure the pair, or use the semantic status tokens, which come with tested foregrounds.',
        ],
      },
      {
        h: 'Palette or semantic tokens?',
        blocks: [
          'Use semantic tokens (`bg-primary`, `bg-surface`, `text-muted-foreground`) for the structure of your interface. They follow the seed and switch with dark mode on their own. Reach for the palette for data and meaning that should not change with the theme: chart series, category labels, tags, illustrations. For palette colors that need a different value in dark mode, add the `dark:` variant, for example `bg-slate-100 dark:bg-slate-800`.',
        ],
      },
    ],
    faqs: [
      ['How many colors are in the Monsoon palette?', '22 hues with 11 steps each, 242 colors, all available as `--color-{hue}-{step}` custom properties.'],
      ['Can I use the palette colors in my own CSS?', 'Yes. Write `var(--color-indigo-600)` anywhere. The variables are defined on the root element.'],
      ['Do palette colors change in dark mode?', 'No, they are fixed. Use the `dark:` variant or semantic tokens when a color should adapt to the scheme.'],
      ['Which browsers support OKLCH?', 'All current major browsers support `oklch()` colors.'],
    ],
    related: ['generate-a-theme-from-one-color-css', 'accessible-color-contrast-css', 'utility-css-cdn-in-production'],
  },

  // 4
  {
    slug: 'accessible-color-contrast-css',
    short: 'Color contrast',
    kicker: 'Accessibility',
    title: 'How Monsoon keeps text readable',
    metaTitle: 'Color contrast | Monsoon',
    description: 'How the seed formulas keep text at 4.5:1 contrast in light and dark mode, plus the helpers for focus and reduced motion.',
    blurb: 'How the seed formulas keep 4.5:1 contrast for any color, and the helpers for focus and motion.',
    lead: 'A theme generated from any color is only useful if the text stays readable. Monsoon builds the contrast guarantee into the formulas themselves and checks it with tests, so a user picked brand color cannot produce an unreadable button.',
    sections: [
      {
        h: 'The target: WCAG AA',
        blocks: [
          'WCAG 2 asks for a contrast ratio of at least **4.5:1** between normal text and its background (level AA). Monsoon aims for that between every semantic fill and the foreground meant to sit on it: `primary` and `primary-foreground`, `secondary`, `accent`, the status colors, `background` with `foreground`, the three surfaces with `foreground`, and `muted` with `muted-foreground`.',
        ],
      },
      {
        h: 'Why a naive formula fails',
        blocks: [
          'A tempting approach is "use the seed as the fill and pick white or black text, whichever contrasts more". It fails for mid lightness colors. A saturated green or orange around OKLCH lightness 0.6 can sit below 4.5:1 against white and against black at the same time. No text color saves it.',
          'Monsoon therefore changes the fill, not only the text. If the seed lightness is below 0.6, primary takes `min(l, 0.52)`; otherwise it takes `max(l, 0.66)`. The band between 0.52 and 0.66 is never used, and the foreground flips on the same threshold: white for the dark side, near black (lightness 0.17) for the light side.',
          { code: `--primary-foreground: oklch(from var(--primary)
  clamp(0.17, (0.6 - l) * 100000, 1) min(c, 0.03) h);`, lang: 'css', title: 'monsoon.css' },
          'In dark mode the seed is first lifted to a lightness of at least 0.7, so `text-primary` on the dark background stays readable too.',
        ],
      },
      {
        h: 'How it is tested',
        blocks: [
          'The formulas live in one JavaScript module that writes the CSS, and the tests evaluate those exact expressions. The suite checks:',
          {
            list: [
              '18 named seeds, including black, white, gray, pure red, pure green, pure blue, gold and a seed placed exactly on the threshold,',
              'both light and dark mode,',
              '13 token pairs, with two methods of bringing out of gamut colors into sRGB,',
              'a sweep of 2,197 sRGB seeds (13 steps per channel) for primary, accent and body text,',
              'that primary lightness never lands inside the unsafe band.',
            ],
          },
          'Every one of those pairs must be at least 4.5:1. You can watch the same guarantee hold in the [seed playground](index.html#seed), which measures the colors your browser actually renders.',
        ],
      },
      {
        h: 'Accessibility helpers beyond color',
        blocks: [
          'Contrast is one part of accessible styling. Monsoon includes small helpers for the rest:',
          {
            table: {
              head: ['Class', 'What it does'],
              rows: [
                ['`sr-only`, `not-sr-only`', 'Hide content visually but keep it for screen readers, and undo it.'],
                ['`skip-link`', 'A component class (see [Skip link](components/skip-link.html)): visually hidden until it receives focus, for "Skip to content" links.'],
                ['`focus-ring`', 'A 2px outline in the ring color, only on keyboard focus (`:focus-visible`).'],
                ['`touch-target`', 'Minimum 44 by 44 pixels for small controls.'],
                ['`motion-safe:`, `motion-reduce:`', 'Apply transitions and animations only when the user has not asked for reduced motion.'],
                ['`forced-color-adjust-auto`, `-none`', 'Control how elements behave in Windows high contrast mode.'],
              ],
            },
          },
          'The base reset also gives every focusable element a visible `:focus-visible` outline in the ring color, which follows your seed.',
          { code: `<a href="#main" class="skip-link fixed top-2 left-2 z-50 rounded-md bg-primary text-primary-foreground px-3 py-2">
  Skip to content
</a>

<button class="touch-target focus-ring rounded-full hover:bg-muted" aria-label="Close">
  <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor"/></svg>
</button>

<div class="motion-safe:animate-pulse rounded-lg bg-muted h-4"></div>`, lang: 'html', title: 'a11y.html' },
        ],
      },
      {
        h: 'What remains your responsibility',
        blocks: [
          {
            list: [
              'Palette colors are fixed. `text-yellow-400` on white is not readable; check combinations you build from the palette yourself.',
              'Opacity modifiers lower contrast. `text-foreground/50` or text on `bg-primary/10` should be checked case by case.',
              'Large text has a lower requirement (3:1), but small text on tinted fills should still aim for 4.5:1.',
              'Color should never be the only signal. Pair status colors with a word or an icon.',
            ],
          },
          'A quick way to check your own combinations is the browser developer tools: inspect a text element and the color picker shows its contrast ratio against the background. Do it in both schemes, since a pair that passes in light mode can fail in dark mode when one side is a fixed palette color.',
        ],
      },
    ],
    faqs: [
      ['Is the primary button text always readable?', 'Yes for any seed. Primary is moved out of the unsafe lightness band and `primary-foreground` flips between white and near black on the same threshold. Tests check 4.5:1 for 18 named seeds and 2,197 sweep seeds in both modes.'],
      ['Does Monsoon check contrast at runtime?', 'No runtime code is involved. The guarantee comes from the formulas, which the browser evaluates as normal CSS.'],
      ['How do I hide text visually but keep it for screen readers?', 'Use the `sr-only` class. Use `skip-link` for a skip navigation link that appears when focused.'],
      ['Does Monsoon respect reduced motion?', 'Yes. Use `motion-safe:` and `motion-reduce:` on transitions and animations, and the reset turns off smooth scrolling for users who ask for reduced motion.'],
    ],
    related: ['generate-a-theme-from-one-color-css', 'oklch-color-palette-css', 'utility-css-cdn-in-production'],
  },


];
