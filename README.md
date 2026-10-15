<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://cdn.jsdelivr.net/gh/kwy404/monsoon@main/assets/mascot-dark.svg">
    <img src="https://cdn.jsdelivr.net/gh/kwy404/monsoon@main/assets/mascot.svg" width="150" alt="Mo, the Monsoon mascot: a red panda in a raincoat with an umbrella">
  </picture>
</p>

<h1 align="center">Monsoon</h1>

<p align="center">Utility-first CSS in one stylesheet, with seed color theming and automatic dark mode.</p>

<p align="center">
  <a href="https://www.npmjs.com/package/monsooncss"><img src="https://img.shields.io/npm/v/monsooncss?color=3b5bdb&label=npm" alt="npm version"></a>
  <a href="https://github.com/kwy404/monsoon/actions/workflows/ci.yml"><img src="https://github.com/kwy404/monsoon/actions/workflows/ci.yml/badge.svg" alt="CI status"></a>
  <a href="https://github.com/kwy404/monsoon/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/monsooncss?color=3b5bdb" alt="MIT license"></a>
</p>

<p align="center">
  <a href="https://kwy404.github.io/monsoon/">Documentation</a> &middot;
  <a href="https://kwy404.github.io/monsoon/components.html">Components</a> &middot;
  <a href="https://kwy404.github.io/monsoon/playground.html">Playground</a> &middot;
  <a href="https://kwy404.github.io/monsoon/builder.html">Page builder</a> &middot;
  <a href="https://github.com/kwy404/monsoon/blob/main/i18n/README.pt-BR.md">Português</a>
</p>

Monsoon is a CSS file with every utility class and component already written. Link it, write classes such as `px-4`, `md:grid-cols-3` or `btn btn-primary` in your HTML, and refresh. There is no compiler and no config file. One `--seed` color gives you a whole theme, and dark mode follows the system on its own.

## Quick start

Save this as `index.html` and open it in a browser:

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/monsooncss@0.2.0/dist/monsoon.min.css">
</head>
<body class="bg-background text-foreground antialiased">
  <main class="mx-auto max-w-md p-8">
    <div class="card">
      <div class="card-body space-y-4">
        <h1 class="text-2xl font-bold">Hello, Monsoon</h1>
        <p class="text-muted-foreground">One stylesheet. No build step.</p>
        <button class="btn btn-primary">Get started</button>
      </div>
    </div>
  </main>
</body>
</html>
```

Pin the version, as above, so the file never changes under you.

## Install with npm

```bash
npm install monsooncss
```

```js
import 'monsooncss';
```

Without a bundler, copy `node_modules/monsooncss/dist/monsoon.min.css` into your public folder and link it from your layout. The [install page](https://kwy404.github.io/monsoon/docs/installation-npm.html) lists the entry file for common frameworks.

## Theme from one color

```css
:root { --seed: #0d9488; }
```

Monsoon derives primary, secondary, accent, surfaces, borders, the focus ring and readable foreground colors from the seed with OKLCH relative colors, in the browser. Put `style="--seed: teal"` on any element to theme only that part of the page. The tests check 4.5:1 contrast for the token pairs across many seeds, in light and dark mode.

## Dark mode

Dark mode follows `prefers-color-scheme`. Force a scheme with `data-theme="dark"`, `class="dark"` or `class="light"` on the root or on any section; the nearest themed ancestor wins.

## Components

167 components, such as buttons, forms, cards, tables, dialogs, menus and navigation, are in the same stylesheet and are built on native HTML. A few behaviors that CSS cannot finish, for example a file drop zone or an image cropper, come from the optional script:

```html
<script src="https://cdn.jsdelivr.net/npm/monsooncss@0.2.0/dist/monsoon.js" defer></script>
```

The script also adds arbitrary values such as `w-[37px]` or `bg-[#0d9488]`. Every component page on the site has a live preview and a Copy HTML button.

## Ship less CSS

The full file is about 88 kB with brotli. To keep only the classes you use:

```bash
npx monsooncss purge "src/**/*.html" -o public/monsoon.css
```

Use `--safelist a,b,c` for class names built at runtime. Arbitrary value classes found in your files are compiled at the same time.

## Browser support

Current Chrome, Edge, Firefox and Safari. Seed theming needs relative color syntax (Chrome and Edge 119, Firefox 128, Safari 18). Older browsers get static tokens from the default seed.

## Not included

- Stacked variants such as `dark:hover:` on the prebuilt classes (arbitrary value classes can stack them).
- The important modifier.
- Opacity modifiers on palette steps, such as `bg-emerald-500/50`.

## More from kwy404

[graphemely](https://kwy404.github.io/graphemely/), [edgegoat](https://kwy404.github.io/edgegoat/), [vueleap](https://kwy404.github.io/vueleap/), [numberparrot](https://kwy404.github.io/numberparrot/), [breakhound](https://kwy404.github.io/breakhound/), [Voodoo.js](https://kwy404.github.io/Voodoo.js/) (used for the interactive parts of the site), [cookieowl](https://kwy404.github.io/cookieowl/), [installkite](https://kwy404.github.io/installkite/), [a11ymedic](https://kwy404.github.io/a11ymedic/), [fontsketch](https://kwy404.github.io/fontsketch/) and [kastor](https://kwy404.github.io/kastor/).

## Contributing

Issues and pull requests are welcome. [CONTRIBUTING.md](CONTRIBUTING.md) explains the generator and [src/components/CONVENTIONS.md](src/components/CONVENTIONS.md) covers components. Changes are listed in the [CHANGELOG](CHANGELOG.md).

## License

[MIT](LICENSE). Made by Alexandre Kohler ([GitHub](https://github.com/kwy404), [LinkedIn](https://www.linkedin.com/in/alexandre-silva-173687256/)).
