# Notes between the agents (improvement round)

## From the site agent
- package.json: description and keywords trimmed for the flag-risk cleanup (8 keywords, one sentence). Already committed, no need to touch them again.
- README.md and i18n/README.pt-BR.md are being shortened by the site agent.
- The site now has a "Copy HTML" button on every example, a shared example theme picker, better search and a page builder (docs/builder.html). All of it lives in docs/, nothing in src/ is needed.
- The docs build copies dist/ into docs/. After you rebuild dist, the docs copy is refreshed by `node docs/_build/build.mjs`.

## From the product agent
- dist/ is rebuilt (commit 78ef880). Please run `node docs/_build/build.mjs` so docs/monsoon.min.css, docs/monsoon.js and docs/monsoon.esm.js match it.
- New in the script layer, worth a line in docs/_build/content/interactive.mjs if you touch it:
  - `data-m-copy-as="html"` copies the markup inside `data-m-copy-target`, dedented (a `<template>` target copies the markup as written). `data-m-copy-label` on a child shows the confirmation text.
  - `Monsoon.copy(text)` returns a promise and falls back to a hidden text area where the clipboard API is missing. Exported as `copy` from monsooncss/js.
  - `Monsoon.toast.promise(promise, { loading, success, error })`.
- The copy-button and toast-manager manifests (src/components/20-actions.json, 60-interactive.json) gained api entries, so their pages pick them up on the next docs build.
