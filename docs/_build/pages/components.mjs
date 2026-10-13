import { page, code, esc, breadcrumbs, breadcrumbLd, SITE, CDN } from '../lib.mjs';

const check = '<svg class="size-5 shrink-0 text-success" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M16.7 5.3a1 1 0 0 1 0 1.4l-8 8a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.4L8 12.6l7.3-7.3a1 1 0 0 1 1.4 0z"/></svg>';

export const components = [
  {
    id: 'navbar',
    title: 'Navbar',
    desc: 'A responsive top bar. Links collapse into a native details menu on small screens, so it needs no JavaScript.',
    html: `<header class="border-b bg-surface">
  <div class="mx-auto max-w-6xl flex items-center justify-between gap-4 px-4 h-16">
    <a href="#" class="flex items-center gap-2 font-bold text-lg">
      <span class="grid place-items-center size-8 rounded-lg bg-primary text-primary-foreground text-sm">M</span>
      Acme
    </a>
    <nav class="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
      <a href="#" class="hover:text-foreground transition-colors">Product</a>
      <a href="#" class="hover:text-foreground transition-colors">Pricing</a>
      <a href="#" class="hover:text-foreground transition-colors">Docs</a>
      <a href="#" class="rounded-lg bg-primary text-primary-foreground px-3 py-2 font-medium hover:bg-primary/90">Sign up</a>
    </nav>
    <details class="relative md:hidden">
      <summary class="list-none cursor-pointer rounded-lg border px-3 py-1.5 text-sm font-medium">Menu</summary>
      <nav class="absolute right-0 top-full mt-2 w-48 rounded-xl border bg-surface p-2 shadow-lg z-10">
        <a href="#" class="block rounded-md px-3 py-2 text-sm hover:bg-muted">Product</a>
        <a href="#" class="block rounded-md px-3 py-2 text-sm hover:bg-muted">Pricing</a>
        <a href="#" class="block rounded-md px-3 py-2 text-sm hover:bg-muted">Docs</a>
      </nav>
    </details>
  </div>
</header>`,
  },
  {
    id: 'hero',
    title: 'Hero',
    desc: 'A centered hero with a gradient headline accent and two calls to action.',
    html: `<section class="px-6 py-20 text-center">
  <p class="inline-flex rounded-full border bg-surface px-3 py-1 text-xs font-medium text-muted-foreground">Now in public beta</p>
  <h1 class="mt-6 text-4xl md:text-6xl font-extrabold tracking-tight text-balance">
    Ship pages that look
    <span class="bg-gradient-to-r from-primary via-violet-500 to-fuchsia-500 bg-clip-text text-transparent">finished</span>
  </h1>
  <p class="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
    One stylesheet, readable classes and a theme that follows your brand color.
  </p>
  <div class="mt-8 flex flex-wrap justify-center gap-3">
    <a href="#" class="rounded-xl bg-primary text-primary-foreground px-5 py-3 font-semibold shadow-lg hover:bg-primary/90 transition">Start free</a>
    <a href="#" class="rounded-xl border bg-surface px-5 py-3 font-semibold hover:bg-muted transition">See examples</a>
  </div>
</section>`,
  },
  {
    id: 'pricing',
    title: 'Pricing cards',
    desc: 'Three plans with a highlighted middle card. The featured card uses the primary color and a ring.',
    html: `<div class="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
  <div class="rounded-2xl border bg-surface p-6 space-y-5">
    <p class="font-semibold">Hobby</p>
    <p class="text-4xl font-extrabold">$0<span class="text-base font-medium text-muted-foreground">/mo</span></p>
    <ul class="space-y-2 text-sm text-muted-foreground">
      <li class="flex gap-2">${check}1 project</li>
      <li class="flex gap-2">${check}Community support</li>
    </ul>
    <a href="#" class="block rounded-lg border py-2.5 text-center font-medium hover:bg-muted">Get started</a>
  </div>
  <div class="relative rounded-2xl border border-primary bg-surface p-6 space-y-5 shadow-xl ring-2 ring-primary">
    <span class="absolute -top-3 left-6 rounded-full bg-primary text-primary-foreground px-3 py-0.5 text-xs font-semibold">Popular</span>
    <p class="font-semibold">Team</p>
    <p class="text-4xl font-extrabold">$19<span class="text-base font-medium text-muted-foreground">/mo</span></p>
    <ul class="space-y-2 text-sm text-muted-foreground">
      <li class="flex gap-2">${check}Unlimited projects</li>
      <li class="flex gap-2">${check}Priority support</li>
      <li class="flex gap-2">${check}Shared themes</li>
    </ul>
    <a href="#" class="block rounded-lg bg-primary text-primary-foreground py-2.5 text-center font-medium hover:bg-primary/90">Choose Team</a>
  </div>
  <div class="rounded-2xl border bg-surface p-6 space-y-5">
    <p class="font-semibold">Enterprise</p>
    <p class="text-4xl font-extrabold">Custom</p>
    <ul class="space-y-2 text-sm text-muted-foreground">
      <li class="flex gap-2">${check}SSO and audit log</li>
      <li class="flex gap-2">${check}Dedicated support</li>
    </ul>
    <a href="#" class="block rounded-lg border py-2.5 text-center font-medium hover:bg-muted">Contact sales</a>
  </div>
</div>`,
  },
  {
    id: 'features',
    title: 'Feature grid',
    desc: 'Icon tiles in a responsive grid that goes from one to three columns.',
    html: `<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 p-6">
  <div class="rounded-2xl border bg-surface p-6 hover:shadow-lg transition">
    <div class="grid place-items-center size-11 rounded-xl bg-primary/10 text-primary font-bold">01</div>
    <h3 class="mt-4 font-semibold">Fast by default</h3>
    <p class="mt-2 text-sm text-muted-foreground">One cached request and no runtime work in the browser.</p>
  </div>
  <div class="rounded-2xl border bg-surface p-6 hover:shadow-lg transition">
    <div class="grid place-items-center size-11 rounded-xl bg-accent text-accent-foreground font-bold">02</div>
    <h3 class="mt-4 font-semibold">Themeable</h3>
    <p class="mt-2 text-sm text-muted-foreground">Change one seed color and the whole page follows.</p>
  </div>
  <div class="rounded-2xl border bg-surface p-6 hover:shadow-lg transition">
    <div class="grid place-items-center size-11 rounded-xl bg-success/10 text-success font-bold">03</div>
    <h3 class="mt-4 font-semibold">Accessible</h3>
    <p class="mt-2 text-sm text-muted-foreground">Readable contrast and visible focus out of the box.</p>
  </div>
</div>`,
  },
  {
    id: 'form',
    title: 'Form',
    desc: 'Labels, inputs, a select, a checkbox and a submit button with focus rings that follow the seed.',
    html: `<form class="mx-auto max-w-md space-y-4 rounded-2xl border bg-surface p-6 shadow-sm">
  <h3 class="text-lg font-semibold">Create your account</h3>
  <div class="space-y-1.5">
    <label for="cf-name" class="block text-sm font-medium">Name</label>
    <input id="cf-name" type="text" placeholder="Ada Rivers" class="w-full rounded-md border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring">
  </div>
  <div class="space-y-1.5">
    <label for="cf-email" class="block text-sm font-medium">Email</label>
    <input id="cf-email" type="email" placeholder="you@example.com" class="w-full rounded-md border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring">
  </div>
  <div class="space-y-1.5">
    <label for="cf-role" class="block text-sm font-medium">Role</label>
    <select id="cf-role" class="w-full rounded-md border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring">
      <option>Designer</option>
      <option>Developer</option>
      <option>Other</option>
    </select>
  </div>
  <label class="flex items-center gap-2 text-sm">
    <input type="checkbox" class="accent-primary size-4"> I agree to the terms
  </label>
  <button type="submit" class="w-full rounded-lg bg-primary text-primary-foreground py-2.5 font-medium hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-offset-2">Create account</button>
</form>`,
  },
  {
    id: 'table',
    title: 'Table',
    desc: 'A data table with zebra rows from the odd: and even: variants and a scroll wrapper for small screens.',
    html: `<div class="overflow-x-auto rounded-xl border">
  <table class="w-full text-sm">
    <thead class="bg-muted text-left">
      <tr>
        <th class="px-4 py-3 font-semibold">Customer</th>
        <th class="px-4 py-3 font-semibold">Plan</th>
        <th class="px-4 py-3 font-semibold">Status</th>
        <th class="px-4 py-3 font-semibold text-right">MRR</th>
      </tr>
    </thead>
    <tbody class="divide-y">
      <tr class="odd:bg-surface even:bg-surface-2">
        <td class="px-4 py-3 font-medium">Northwind</td>
        <td class="px-4 py-3">Team</td>
        <td class="px-4 py-3"><span class="rounded-full bg-success/10 text-success px-2 py-0.5 text-xs font-medium">Active</span></td>
        <td class="px-4 py-3 text-right tabular-nums">$190</td>
      </tr>
      <tr class="odd:bg-surface even:bg-surface-2">
        <td class="px-4 py-3 font-medium">Globex</td>
        <td class="px-4 py-3">Hobby</td>
        <td class="px-4 py-3"><span class="rounded-full bg-warning text-warning-foreground px-2 py-0.5 text-xs font-medium">Trial</span></td>
        <td class="px-4 py-3 text-right tabular-nums">$0</td>
      </tr>
      <tr class="odd:bg-surface even:bg-surface-2">
        <td class="px-4 py-3 font-medium">Initech</td>
        <td class="px-4 py-3">Enterprise</td>
        <td class="px-4 py-3"><span class="rounded-full bg-danger/10 text-danger px-2 py-0.5 text-xs font-medium">Overdue</span></td>
        <td class="px-4 py-3 text-right tabular-nums">$1,200</td>
      </tr>
    </tbody>
  </table>
</div>`,
  },
  {
    id: 'alerts',
    title: 'Alerts',
    desc: 'Status messages built from the success, warning, danger and info tokens with opacity modifiers.',
    html: `<div class="space-y-3">
  <div role="status" class="flex gap-3 rounded-xl border border-success/30 bg-success/10 p-4 text-sm">
    <span class="grid place-items-center size-6 shrink-0 rounded-full bg-success text-success-foreground text-xs font-bold">i</span>
    <p><strong class="font-semibold">Deployed.</strong> Your site is live.</p>
  </div>
  <div role="status" class="flex gap-3 rounded-xl border border-warning/30 bg-warning/10 p-4 text-sm">
    <span class="grid place-items-center size-6 shrink-0 rounded-full bg-warning text-warning-foreground text-xs font-bold">!</span>
    <p><strong class="font-semibold">Almost full.</strong> You have used 90% of your storage.</p>
  </div>
  <div role="alert" class="flex gap-3 rounded-xl border border-danger/30 bg-danger/10 p-4 text-sm">
    <span class="grid place-items-center size-6 shrink-0 rounded-full bg-danger text-danger-foreground text-xs font-bold">x</span>
    <p><strong class="font-semibold">Build failed.</strong> Check the logs for details.</p>
  </div>
  <div role="status" class="flex gap-3 rounded-xl border border-info/30 bg-info/10 p-4 text-sm">
    <span class="grid place-items-center size-6 shrink-0 rounded-full bg-info text-info-foreground text-xs font-bold">?</span>
    <p><strong class="font-semibold">Tip.</strong> Press the slash key to search.</p>
  </div>
</div>`,
  },
  {
    id: 'modal',
    title: 'Modal with dialog',
    desc: 'The native dialog element opened with the command and commandfor attributes and closed with a dialog form. No JavaScript, focus is trapped and Escape closes it.',
    html: `<button type="button" commandfor="confirm-dialog" command="show-modal" class="rounded-lg bg-primary text-primary-foreground px-4 py-2 font-medium hover:bg-primary/90">Delete project</button>
<dialog id="confirm-dialog" aria-labelledby="confirm-title" class="m-auto w-full max-w-md rounded-2xl border bg-surface text-foreground p-6 shadow-2xl">
  <h3 id="confirm-title" class="text-lg font-semibold">Delete this project?</h3>
  <p class="mt-2 text-sm text-muted-foreground">This removes the project and its deployments. You cannot undo it.</p>
  <form method="dialog" class="mt-6 flex justify-end gap-2">
    <button value="cancel" class="rounded-lg border px-4 py-2 font-medium hover:bg-muted">Cancel</button>
    <button value="confirm" class="rounded-lg bg-danger text-danger-foreground px-4 py-2 font-medium">Delete</button>
  </form>
</dialog>`,
  },
  {
    id: 'tabs',
    title: 'Tabs with details',
    desc: 'Details elements that share a name open one at a time, so they behave like a set of tabs without any script.',
    html: `<div class="divide-y rounded-2xl border bg-surface">
  <details name="plan-tabs" open class="group">
    <summary class="cursor-pointer select-none px-5 py-4 font-medium hover:bg-muted">Overview</summary>
    <p class="px-5 pb-5 text-sm text-muted-foreground">Monsoon is one stylesheet with every utility predeclared, so there is nothing to compile.</p>
  </details>
  <details name="plan-tabs" class="group">
    <summary class="cursor-pointer select-none px-5 py-4 font-medium hover:bg-muted">Theming</summary>
    <p class="px-5 pb-5 text-sm text-muted-foreground">Set --seed on the root or on any element to theme that subtree.</p>
  </details>
  <details name="plan-tabs" class="group">
    <summary class="cursor-pointer select-none px-5 py-4 font-medium hover:bg-muted">Dark mode</summary>
    <p class="px-5 pb-5 text-sm text-muted-foreground">Follows the operating system, or add class="dark" to force it.</p>
  </details>
</div>`,
  },
  {
    id: 'footer',
    title: 'Footer',
    desc: 'A multi column footer that stacks on mobile.',
    html: `<footer class="border-t bg-surface-2">
  <div class="mx-auto max-w-6xl grid grid-cols-2 md:grid-cols-4 gap-8 px-6 py-12 text-sm">
    <div class="col-span-2 md:col-span-1 space-y-3">
      <p class="font-bold text-base">Acme</p>
      <p class="text-muted-foreground">Pages that look finished, built with one stylesheet.</p>
    </div>
    <div class="space-y-2">
      <p class="font-semibold">Product</p>
      <a href="#" class="block text-muted-foreground hover:text-foreground">Features</a>
      <a href="#" class="block text-muted-foreground hover:text-foreground">Pricing</a>
    </div>
    <div class="space-y-2">
      <p class="font-semibold">Company</p>
      <a href="#" class="block text-muted-foreground hover:text-foreground">About</a>
      <a href="#" class="block text-muted-foreground hover:text-foreground">Blog</a>
    </div>
    <div class="space-y-2">
      <p class="font-semibold">Legal</p>
      <a href="#" class="block text-muted-foreground hover:text-foreground">Privacy</a>
      <a href="#" class="block text-muted-foreground hover:text-foreground">Terms</a>
    </div>
  </div>
  <p class="border-t px-6 py-5 text-center text-xs text-muted-foreground">Copyright 2026 Acme Inc.</p>
</footer>`,
  },
];

export function componentsPage() {
  const crumbs = [['Monsoon', 'index.html'], ['Components', 'components.html']];
  const toc = components.map((c) => `<a href="#${c.id}" class="rounded-full border bg-surface px-3 py-1.5 text-sm font-medium hover:bg-muted transition-colors">${c.title}</a>`).join('\n      ');
  const sections = components
    .map(
      (c) => `
  <section id="${c.id}" class="py-12 border-t">
    <div class="flex flex-wrap items-end justify-between gap-3 mb-5">
      <div>
        <h2 class="text-2xl font-bold tracking-tight">${c.title}</h2>
        <p class="mt-1 text-muted-foreground max-w-2xl">${esc(c.desc)}</p>
      </div>
      <a href="#${c.id}" class="text-sm text-muted-foreground hover:text-foreground">#${c.id}</a>
    </div>
    <div class="rounded-2xl border bg-background ${c.id === 'modal' ? 'p-10 flex justify-center' : c.id === 'navbar' || c.id === 'footer' || c.id === 'hero' ? 'overflow-visible' : 'p-6'}">
${c.html.split('\n').map((l) => `      ${l}`).join('\n')}
    </div>
    <div class="mt-4">${code(c.html, 'html', `${c.id}.html`, { cls: 'scroll-y' })}</div>
  </section>`,
    )
    .join('\n');

  const body = `
<div class="bloom border-b">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 pt-10 pb-14">
    ${breadcrumbs(crumbs)}
    <h1 class="mt-6 text-4xl sm:text-5xl font-extrabold tracking-tight text-balance">Components built with utilities only</h1>
    <p class="mt-4 max-w-2xl text-lg text-muted-foreground">Ten common interface pieces made from Monsoon classes and plain HTML. Copy a snippet, paste it into a page that links <span class="font-mono text-base">monsooncss</span>, and it renders exactly like this, in light and dark mode and with any seed.</p>
    <div class="mt-6 flex flex-wrap gap-2">
      ${toc}
    </div>
  </div>
</div>
<div class="mx-auto max-w-7xl px-4 sm:px-6 pb-20">
${sections}
  <section class="py-12 border-t">
    <h2 class="text-2xl font-bold tracking-tight">Use them on your page</h2>
    <p class="mt-2 text-muted-foreground max-w-2xl">Every snippet needs only the stylesheet. Theme them all at once with a seed on the root element.</p>
    <div class="mt-5 max-w-3xl">${code(`<link rel="stylesheet" href="${CDN}">
<style>
  :root { --seed: #0d9488; }
</style>`, 'html', 'head.html')}</div>
  </section>
</div>`;

  return page({
    path: 'components.html',
    title: 'Monsoon components: copy and paste utility CSS UI',
    description: 'Copy and paste UI components built only with Monsoon utility classes: navbar, hero, pricing cards, feature grid, form, table, alerts, dialog modal, tabs and footer. No build step.',
    active: 'Components',
    body,
    jsonld: [
      {
        '@type': 'CollectionPage',
        name: 'Monsoon components',
        url: `${SITE}components.html`,
        description: 'UI components built only with Monsoon utility classes.',
      },
      breadcrumbLd(crumbs),
    ],
  });
}
