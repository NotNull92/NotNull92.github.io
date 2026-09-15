# Ember Studio — The Living Studio

A point-and-click tour of Ember Studio’s office, presented through a northern magic-school fantasy. The rooms represent real studio functions: planning, project records, development, QA and community. The approved interaction and visual contract is in [DESIGN.md](DESIGN.md).

The concept decision and compatibility notes are recorded in [docs/CONCEPT-HISTORY.md](docs/CONCEPT-HISTORY.md).

## Preview

From the repository root:

```sh
python -m http.server 4173
```

Visit http://localhost:4173. Serve through HTTP because the interactive site uses native JavaScript modules. No package installation or build step is required.

## Editing

- `index.html`: accessible application shell, entrance and native dialogs.
- `assets/college.js`: five rooms, staff placement/conversations, rune and tool responses, remembered room and sound setting.
- `assets/college.css`: palette, typography, reusable controls, scene composition, responsive layouts and reduced motion.
- `assets/book.js`: two-page desktop / one-page mobile reader, page-turn animation, section bookmarks and per-book reading position.
- `assets/project-records.js`: Golem Sculptor and Monstel introduction and development notes. Sources: [PROJECT-SOURCES.md](docs/PROJECT-SOURCES.md).
- `assets/sound.js`: opt-in WAV loops from `assets/audio/`, outdoor wind and interaction sounds; music lowers during book reading and suspends when the tab is hidden.
- `assets/language.js`, `assets/locale.js`: English default, saved Korean switch and authored Korean interface/book copy.
- `assets/scenes/`, `assets/characters/`: optimized local artwork. Sources and generation details: [ASSETS.md](docs/ASSETS.md).
- `works.html`, `college.html`: existing URLs enter the library and hall; their HTML remains a readable fallback when JavaScript is disabled.

Language, motion, room and book position use browser local storage. Sound starts muted unless a saved opt-in is resumed by a user interaction. Blocked storage never prevents exploration.

## Validate

```sh
node scripts/check.mjs
node scripts/book-check.mjs
node scripts/sound-check.mjs
```

Browser verification and limitations are recorded in [VALIDATION.md](docs/VALIDATION.md). The previous static site's Lighthouse scores do not describe this redesign.

## Publishing

GitHub Pages serves the repository root from `main` at https://notnull92.github.io/. The current work remains on the feature branch until integrated into `main`; local implementation is not a production deployment.
