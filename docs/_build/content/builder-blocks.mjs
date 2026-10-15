// Blocks for the page builder. Each one is plain HTML with Monsoon classes and
// components, made to stack in any order. The build checks that every class
// exists in Monsoon. Placeholder copy only: replace it after copying.

const arrow = '<svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
const check = '<svg class="size-4 shrink-0 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';
const icon = (d) => `<span class="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary"><svg class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg></span>`;

export const builderBlocks = [
  {
    key: 'navbar',
    label: 'Navigation bar',
    group: 'Header',
    desc: 'Brand, links and a call to action',
    html: `<header class="navbar navbar-blur">
  <div class="navbar-start">
    <a href="#" class="navbar-brand"><span class="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-accent text-primary-foreground font-bold">P</span>Product</a>
  </div>
  <nav class="navbar-center navbar-nav" aria-label="Main">
    <a href="#features" class="navbar-link">Features</a>
    <a href="#pricing" class="navbar-link">Pricing</a>
    <a href="#faq" class="navbar-link">FAQ</a>
  </nav>
  <div class="navbar-end">
    <a href="#" class="navbar-link hidden sm:inline-flex">Sign in</a>
    <a href="#cta" class="btn btn-sm">Get started</a>
  </div>
</header>`,
  },
  {
    key: 'hero',
    label: 'Hero',
    group: 'Header',
    desc: 'Big headline, two buttons',
    html: `<section class="relative isolate overflow-hidden">
  <div class="pointer-events-none absolute -top-16 left-1/2 -z-10 size-96 -translate-x-1/2 rounded-full bg-primary/30 blur-3xl" aria-hidden="true"></div>
  <div class="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 md:py-24">
    <span class="badge badge-primary badge-pill">New in version 2</span>
    <h1 class="mt-6 text-4xl font-extrabold tracking-tight text-balance sm:text-6xl">Say what your product does in one line</h1>
    <p class="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground text-pretty">A short sentence about who it is for and the one problem it solves. Keep it under two lines.</p>
    <div class="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
      <a href="#cta" class="btn btn-lg w-full sm:w-auto">Start for free ${arrow}</a>
      <a href="#features" class="btn btn-lg btn-outline btn-neutral w-full sm:w-auto">See how it works</a>
    </div>
  </div>
</section>`,
  },
  {
    key: 'logos',
    label: 'Logo strip',
    group: 'Social proof',
    desc: 'Names of teams that use it',
    html: `<section class="border-y bg-surface-2 py-10" aria-label="Customers">
  <div class="mx-auto max-w-6xl px-4 sm:px-6">
    <p class="text-center text-sm font-medium text-muted-foreground">Used by teams at</p>
    <ul class="mt-6 grid grid-cols-2 items-center gap-6 text-center text-lg font-bold tracking-tight text-muted-foreground sm:grid-cols-3 lg:grid-cols-5">
      <li>Northwind</li><li class="font-serif italic">Larkspur</li><li class="font-mono">fieldnote</li><li>OAKHAVEN</li><li class="font-serif">Bluegate</li>
    </ul>
  </div>
</section>`,
  },
  {
    key: 'features',
    label: 'Feature grid',
    group: 'Content',
    desc: 'Three features with icons',
    html: `<section id="features" class="mx-auto max-w-6xl px-4 py-20 sm:px-6">
  <div class="mx-auto max-w-2xl text-center">
    <p class="text-sm font-semibold uppercase tracking-wider text-primary">Features</p>
    <h2 class="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Everything you need, nothing you do not</h2>
  </div>
  <div class="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
    <div class="card"><div class="card-body">${icon('<path d="M13 2 3 14h9l-1 8 10-12h-9z"/>')}<h3 class="card-title mt-3">Fast by default</h3><p class="text-muted-foreground">One sentence on why this matters to the reader.</p></div></div>
    <div class="card"><div class="card-body">${icon('<rect x="3" y="11" width="18" height="10" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>')}<h3 class="card-title mt-3">Private by design</h3><p class="text-muted-foreground">One sentence on why this matters to the reader.</p></div></div>
    <div class="card"><div class="card-body">${icon('<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>')}<h3 class="card-title mt-3">Easy to change</h3><p class="text-muted-foreground">One sentence on why this matters to the reader.</p></div></div>
  </div>
</section>`,
  },
  {
    key: 'split',
    label: 'Text and image',
    group: 'Content',
    desc: 'A story next to a picture',
    html: `<section class="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 py-20 sm:px-6 md:grid-cols-2">
  <div>
    <h2 class="text-3xl font-bold tracking-tight sm:text-4xl">Show the product doing its job</h2>
    <p class="mt-4 text-lg text-muted-foreground">Explain the main workflow in two or three sentences. Point to the picture so the reader knows where to look.</p>
    <ul class="mt-6 space-y-3">
      <li class="flex items-center gap-3">${check}<span>A concrete benefit</span></li>
      <li class="flex items-center gap-3">${check}<span>Another concrete benefit</span></li>
      <li class="flex items-center gap-3">${check}<span>One more, then stop</span></li>
    </ul>
  </div>
  <div class="aspect-[4/3] rounded-2xl border bg-primary/10 p-6 shadow-lg">
    <div class="h-full rounded-xl border bg-surface p-4 shadow-sm">
      <div class="h-3 w-24 rounded-full bg-muted"></div>
      <div class="mt-4 grid grid-cols-3 gap-3"><div class="h-16 rounded-lg bg-primary/20"></div><div class="h-16 rounded-lg bg-muted"></div><div class="h-16 rounded-lg bg-muted"></div></div>
      <div class="mt-4 space-y-2"><div class="h-2.5 rounded-full bg-muted"></div><div class="h-2.5 w-4/5 rounded-full bg-muted"></div><div class="h-2.5 w-3/5 rounded-full bg-muted"></div></div>
    </div>
  </div>
</section>`,
  },
  {
    key: 'stats',
    label: 'Stats',
    group: 'Social proof',
    desc: 'Four numbers that matter',
    html: `<section class="bg-surface-2 py-16">
  <dl class="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 text-center sm:px-6 md:grid-cols-4">
    <div><dt class="text-sm text-muted-foreground">Teams</dt><dd class="mt-1 text-4xl font-extrabold tracking-tight">1,200</dd></div>
    <div><dt class="text-sm text-muted-foreground">Uptime</dt><dd class="mt-1 text-4xl font-extrabold tracking-tight">99.9%</dd></div>
    <div><dt class="text-sm text-muted-foreground">Countries</dt><dd class="mt-1 text-4xl font-extrabold tracking-tight">48</dd></div>
    <div><dt class="text-sm text-muted-foreground">Rating</dt><dd class="mt-1 text-4xl font-extrabold tracking-tight">4.8</dd></div>
  </dl>
</section>`,
  },
  {
    key: 'testimonial',
    label: 'Testimonial',
    group: 'Social proof',
    desc: 'One quote from a customer',
    html: `<section class="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
  <blockquote class="text-2xl font-medium tracking-tight text-balance sm:text-3xl">"A quote from a real customer about the result they got, in their own words."</blockquote>
  <div class="mt-8 flex items-center justify-center gap-3">
    <span class="avatar avatar-placeholder">JR</span>
    <div class="text-left"><p class="font-semibold">Jordan Reyes</p><p class="text-sm text-muted-foreground">Head of operations, Northwind</p></div>
  </div>
</section>`,
  },
  {
    key: 'pricing',
    label: 'Pricing',
    group: 'Conversion',
    desc: 'Two plans side by side',
    html: `<section id="pricing" class="mx-auto max-w-4xl px-4 py-20 sm:px-6">
  <h2 class="text-center text-3xl font-bold tracking-tight sm:text-4xl">Simple pricing</h2>
  <div class="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
    <div class="card"><div class="card-body">
      <h3 class="card-title">Starter</h3>
      <p class="mt-2"><span class="text-4xl font-extrabold">$0</span> <span class="text-muted-foreground">per month</span></p>
      <ul class="mt-6 space-y-3 text-sm"><li class="flex items-center gap-2">${check}Up to 3 projects</li><li class="flex items-center gap-2">${check}Community support</li></ul>
      <a href="#cta" class="btn btn-outline btn-neutral mt-8 w-full">Start free</a>
    </div></div>
    <div class="card ring-2 ring-primary"><div class="card-body">
      <div class="flex items-center justify-between"><h3 class="card-title">Pro</h3><span class="badge badge-primary badge-solid badge-pill">Popular</span></div>
      <p class="mt-2"><span class="text-4xl font-extrabold">$12</span> <span class="text-muted-foreground">per month</span></p>
      <ul class="mt-6 space-y-3 text-sm"><li class="flex items-center gap-2">${check}Unlimited projects</li><li class="flex items-center gap-2">${check}Priority support</li><li class="flex items-center gap-2">${check}Team roles</li></ul>
      <a href="#cta" class="btn mt-8 w-full">Choose Pro</a>
    </div></div>
  </div>
</section>`,
  },
  {
    key: 'faq',
    label: 'FAQ',
    group: 'Content',
    desc: 'Questions that open and close',
    html: `<section id="faq" class="mx-auto max-w-3xl px-4 py-20 sm:px-6">
  <h2 class="text-center text-3xl font-bold tracking-tight sm:text-4xl">Questions</h2>
  <div class="mt-10 space-y-3">
    <details class="collapse" name="faq" open><summary class="collapse-title">Is there a free plan?</summary><div class="collapse-content"><p class="text-muted-foreground">Yes. Answer the question in one or two sentences.</p></div></details>
    <details class="collapse" name="faq"><summary class="collapse-title">Can I cancel any time?</summary><div class="collapse-content"><p class="text-muted-foreground">Yes. Answer the question in one or two sentences.</p></div></details>
    <details class="collapse" name="faq"><summary class="collapse-title">Where is my data stored?</summary><div class="collapse-content"><p class="text-muted-foreground">Answer the question in one or two sentences.</p></div></details>
  </div>
</section>`,
  },
  {
    key: 'newsletter',
    label: 'Newsletter',
    group: 'Conversion',
    desc: 'Email field and a button',
    html: `<section class="mx-auto max-w-3xl px-4 py-16 sm:px-6">
  <div class="rounded-2xl border bg-surface p-8 text-center shadow-sm">
    <h2 class="text-2xl font-bold tracking-tight">Get one short email a month</h2>
    <p class="mt-2 text-muted-foreground">Product news and tips. No spam.</p>
    <form class="mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row" onsubmit="return false">
      <label for="nl-email" class="sr-only">Email</label>
      <input id="nl-email" type="email" class="input flex-1" placeholder="you@example.com" required>
      <button class="btn">Subscribe</button>
    </form>
  </div>
</section>`,
  },
  {
    key: 'cta',
    label: 'Call to action',
    group: 'Conversion',
    desc: 'Colored band with one button',
    html: `<section id="cta" class="px-4 py-16 sm:px-6">
  <div class="mx-auto max-w-5xl rounded-3xl bg-primary px-6 py-14 text-center text-primary-foreground shadow-xl">
    <h2 class="text-3xl font-bold tracking-tight sm:text-4xl">Ready when you are</h2>
    <p class="mx-auto mt-3 max-w-xl opacity-90">One line that removes the last doubt, for example a free plan or a trial.</p>
    <a href="#" class="btn btn-lg btn-neutral mt-8">Create an account</a>
  </div>
</section>`,
  },
  {
    key: 'footer',
    label: 'Footer',
    group: 'Footer',
    desc: 'Links and a copyright line',
    html: `<footer class="border-t bg-surface-2">
  <div class="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-10 text-sm text-muted-foreground sm:flex-row sm:px-6">
    <p>&copy; 2026 Product. All rights reserved.</p>
    <nav class="flex gap-6" aria-label="Footer"><a href="#" class="hover:text-foreground">Privacy</a><a href="#" class="hover:text-foreground">Terms</a><a href="#" class="hover:text-foreground">Contact</a></nav>
  </div>
</footer>`,
  },
];

/** The starting page offered on an empty canvas. */
export const builderStarter = ['navbar', 'hero', 'features', 'testimonial', 'pricing', 'cta', 'footer'];
