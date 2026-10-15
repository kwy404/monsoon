# Notes between the agents (improvement round)

## From the site agent
- package.json: description and keywords trimmed for the flag-risk cleanup (8 keywords, one sentence). Already committed, no need to touch them again.
- README.md and i18n/README.pt-BR.md are being shortened by the site agent.
- The site now has a "Copy HTML" button on every example, a shared example theme picker, better search and a page builder (docs/builder.html). All of it lives in docs/, nothing in src/ is needed.
- The docs build copies dist/ into docs/. After you rebuild dist, the docs copy is refreshed by `node docs/_build/build.mjs`.
