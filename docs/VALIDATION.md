# Website validation — 2026-09-15

## Implemented

- Static Entrance, Works and College pages, shared token CSS, local favicon and original logo.
- Golem Sculptor and Monstel, both marked In development. No unavailable store/trailer links.
- All six staff names and roles, five supplied portraits and one generated Pixie portrait.
- Exact Discord, YouTube, Threads and GitHub URLs in Doors and footer.
- Original PNG artwork preserved; six optimized portrait crops total 257,332 bytes.
- GitHub Pages remains configured for main / repository root. No backend, build framework or runtime JavaScript.

## Checks

- `node scripts/check.mjs`: pass; pages, local assets and anchors, social URLs, works and staff.
- Real Chrome through Playwright: all three pages at **320, 375, 768, 1280px**; 12 full-page captures. No horizontal overflow, broken images, page errors or failed local requests.
- Keyboard: Tab reveals skip link; Enter focuses main; primary action focus is visible. Navigation exercised through Works, College and Doors. Default, hover, keyboard focus and pointer-pressed primary action inspected.
- Pressed label uses black on the locked deep ember color to meet AA; default body and secondary text meet AA on their respective surfaces.
- External HTTP checks: Discord, YouTube, Threads and GitHub returned 200. Login/join flows were not submitted.
- `git diff --check`: pass.

## Lighthouse

Real Chrome stable, Lighthouse Node API attached to the browser's debugging port, static local server. Mobile throttling and desktop runs, all four categories:

| Page | Mobile P / A / BP / SEO | Desktop P / A / BP / SEO |
| --- | --- | --- |
| Entrance | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 |
| Works | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 |
| College | 100 / 100 / 100 / 100 | 100 / 100 / 100 / 100 |

Initial findings fixed: Works skipped a heading level; College's first visible portrait was lazy-loaded and images included invisible surroundings. Works now uses H2 game titles, the first portrait has eager/high-priority loading, and delivered assets contain only the displayed crop. College's final scores were confirmed in three consecutive mobile/desktop runs. Entrance and Works also scored 100 across repeated runs.

Screenshots, browser JSON, Lighthouse JSON and independent review receipts are retained locally under `.omo/evidence/`. There is no bitmap design reference; the immutable written handoff is the visual contract. No fabricated pixel-diff score is claimed.

## Remaining external verification

The PR must be merged to main before this version is served at https://notnull92.github.io/. Public deployment performance and Victor's final brand-feel acceptance remain unverified. No public deployment or user approval is claimed by the local checks above.
