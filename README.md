# Ember Studio

A static official studio website, following the [Northern Ledger handoff](docs/EMBER-STUDIO-WEBSITE-HANDOFF.md).

## Preview locally

Open `index.html` directly, or from this folder run:

```sh
python -m http.server 4173
```

Visit http://localhost:4173. No installation, build step or JavaScript runtime is required by the site.

## Pages and editing

- `index.html`: Entrance, works preview, college introduction and Doors.
- `works.html`: Golem Sculptor and Monstel, both in development.
- `college.html`: Studio, six staff portraits and roles, tools and Doors.
- `assets/site.css`: shared responsive styles and locked color tokens.
- `DESIGN.md`: design decisions, components and accessibility constraints.
- `assets/logo.png`, `assets/banner.png`, `assets/staff/*.png`: supplied originals, preserved. The banner is not loaded on any page.
- `assets/staff/*.webp`: optimized delivery images; `pixie.webp` is generated. Portrait source/prompt details are in `docs/ASSETS.md`.

Navigation and footers are plain HTML on each page; update all three when changing shared copy or links.

## GitHub Pages

Serve the **repository root `/` from `main`** (Settings → Pages → Deploy from a branch → main → /(root)). This is the existing repository setting, verified during implementation. `.nojekyll` keeps the site a plain static publish.

Public URL: https://notnull92.github.io/

A feature branch or PR is not the public deployment. Merge to `main` to publish; no custom domain is configured by this change.

## Validate

```sh
node scripts/check.mjs
```

This dependency-free check verifies page structure, local asset/anchor references, exact social URLs, works and staff. Browser and Lighthouse results are recorded in [the validation report](docs/VALIDATION.md).
