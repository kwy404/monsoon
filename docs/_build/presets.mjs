// Starting points for the live class playground on the home page. Every class
// here must exist in scripts/classes.json (the class check script verifies it)
// or be an arbitrary value class, which the preview frame renders with
// dist/monsoon.js.

export const presets = [
  {
    label: 'Profile card', file: 'profile-card.html',
    code: `<div class="mx-auto max-w-[22rem] rounded-2xl border bg-surface p-6 shadow-lg">
  <div class="flex items-center gap-4">
    <div class="size-14 rounded-full bg-gradient-to-br from-primary to-accent"></div>
    <div>
      <p class="text-lg font-semibold tracking-[-.01em]">Ada Rivers</p>
      <p class="text-sm text-muted-foreground">Design engineer</p>
    </div>
    <span class="ml-auto rounded-full border border-emerald px-2 py-0.5 text-xs font-medium text-emerald">Open to work</span>
  </div>
  <p class="mt-4 text-sm text-muted-foreground">
    Builds interfaces with plain HTML and one stylesheet.
  </p>
  <div class="mt-5 flex gap-2">
    <button class="flex-1 rounded-lg bg-primary text-primary-foreground px-4 py-2 font-medium hover:bg-primary/90 transition">Follow</button>
    <button class="flex-1 rounded-lg border px-4 py-2 font-medium hover:bg-muted transition">Message</button>
  </div>
</div>`,
  },
  {
    label: 'Arbitrary values', file: 'arbitrary.html',
    code: `<div class="grid grid-cols-[repeat(auto-fit,minmax(9rem,1fr))] gap-3">
  <div class="rounded-xl bg-red p-4 text-white font-medium">bg-red</div>
  <div class="rounded-xl bg-[red] p-4 text-white font-medium">bg-[red]</div>
  <div class="rounded-[18px] bg-[oklch(0.7_0.15_200)] p-4 font-medium text-[#0b2530]">oklch value</div>
  <div class="rounded-xl border-[3px] border-violet p-4 font-[650] text-violet">border-violet</div>
</div>
<p class="mt-4 h-[calc(3rem+4px)] rounded-lg bg-muted px-4 text-sm leading-[calc(3rem+4px)]">
  Fixed height from calc(): no build step, no config.
</p>`,
  },
  {
    label: 'Buttons', file: 'buttons.html',
    code: `<div class="flex flex-wrap gap-3">
  <button class="rounded-lg bg-primary text-primary-foreground px-4 py-2 font-medium shadow-sm hover:bg-primary/90 active:scale-95 transition">Primary</button>
  <button class="rounded-lg bg-secondary text-secondary-foreground px-4 py-2 font-medium hover:bg-secondary/80 transition">Secondary</button>
  <button class="rounded-lg bg-accent text-accent-foreground px-4 py-2 font-medium transition">Accent</button>
  <button class="rounded-lg border px-4 py-2 font-medium hover:bg-muted transition">Outline</button>
  <button class="rounded-lg px-4 py-2 font-medium text-primary hover:bg-primary/10 transition">Ghost</button>
  <button class="rounded-lg bg-danger text-danger-foreground px-4 py-2 font-medium">Delete</button>
  <button class="rounded-[10px] bg-blue text-white px-4 py-2 font-medium hover:bg-[#1d4ed8] transition">Blue</button>
  <button class="rounded-lg bg-primary text-primary-foreground px-4 py-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed" disabled>Disabled</button>
</div>`,
  },
  {
    label: 'Seed islands', file: 'seed-islands.html',
    code: `<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
  <div style="--seed: teal" class="rounded-xl border bg-surface p-5 space-y-3">
    <p class="font-semibold text-primary">teal</p>
    <button class="w-full rounded-md bg-primary text-primary-foreground py-2 font-medium">Primary</button>
    <button class="w-full rounded-md bg-accent text-accent-foreground py-2 font-medium">Accent</button>
  </div>
  <div style="--seed: #e11d48" class="rounded-xl border bg-surface p-5 space-y-3">
    <p class="font-semibold text-primary">#e11d48</p>
    <button class="w-full rounded-md bg-primary text-primary-foreground py-2 font-medium">Primary</button>
    <button class="w-full rounded-md bg-accent text-accent-foreground py-2 font-medium">Accent</button>
  </div>
  <div style="--seed: gold" class="rounded-xl border bg-surface p-5 space-y-3">
    <p class="font-semibold">gold</p>
    <button class="w-full rounded-md bg-primary text-primary-foreground py-2 font-medium">Primary</button>
    <button class="w-full rounded-md bg-accent text-accent-foreground py-2 font-medium">Accent</button>
  </div>
</div>`,
  },
  {
    label: 'Container query', file: 'container.html',
    code: `<div class="@container rounded-2xl border bg-surface p-4">
  <div class="flex flex-col @md:flex-row gap-4 @md:items-center">
    <div class="h-28 @md:w-1/3 rounded-xl bg-gradient-to-br from-primary to-accent"></div>
    <div class="flex-1 space-y-2">
      <p class="text-lg @lg:text-2xl font-bold">Resize the preview</p>
      <p class="text-sm text-muted-foreground">
        This card stacks in a narrow container and switches to a row
        once the container is 28rem wide, whatever the viewport is.
      </p>
    </div>
  </div>
</div>`,
  },
  {
    label: 'Alerts', file: 'alerts.html',
    code: `<div class="space-y-3">
  <div class="rounded-lg border-l-4 border-success bg-success/10 p-4 text-sm"><strong class="font-semibold">Saved.</strong> Your settings were updated.</div>
  <div class="rounded-lg border-l-4 border-warning bg-warning/10 p-4 text-sm"><strong class="font-semibold">Heads up.</strong> Your trial ends in 3 days.</div>
  <div class="rounded-lg border-l-4 border-danger bg-danger/10 p-4 text-sm"><strong class="font-semibold">Error.</strong> The payment could not be processed.</div>
  <div class="rounded-lg border-l-4 border-info bg-info/10 p-4 text-sm"><strong class="font-semibold">Note.</strong> A new version is available.</div>
</div>`,
  },
  {
    label: 'Toggle', file: 'toggle.html',
    code: `<label class="relative inline-flex items-center gap-3 cursor-pointer">
  <input type="checkbox" class="peer sr-only" checked>
  <span class="w-11 h-6 rounded-full bg-muted peer-checked:bg-primary transition-colors"></span>
  <span class="absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5"></span>
  <span class="text-sm font-medium">Email me about new releases</span>
</label>`,
  },
];
