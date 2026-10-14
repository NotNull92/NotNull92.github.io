# Living College validation — 2026-09-15

> Historical validation title. The current concept is Living Studio; see the latest section below and [CONCEPT-HISTORY.md](CONCEPT-HISTORY.md).

## Current visitor-feedback revision

English default with saved Korean switching, living exterior motion controls, deliberate project access through library books, pitched indoor music, and quieter music during reading are implemented. Korean mobile headings were shortened after an independent review. Fresh independent source and visual reviews passed on this revision. All 15 room/viewport combinations, 12 mobile book pages, 6 desktop spreads, staff conversations, language state and motion were checked. The historical PASS below applies only to the earlier build.

The user has now supplied four WAV exports, and the site plays them in the four interior rooms. The earlier maker UI restriction was not bypassed. See the WAV integration checks below; the old synthesized indoor score has been removed.

Current automated checks: scripts/check.mjs (including complete Korean book copy), book-check.mjs and sound-check.mjs passed, including reading music reduction/restoration. Evidence for this revision is in `.omo/evidence/college-refinements/`. No audible listening or Lighthouse score is claimed.

---

## Earlier living-college build (historical)

This report replaces the earlier static-layout validation. Its Lighthouse 100 scores do not apply to this redesign.

## Implemented surface

- Five rooms: entrance, great hall, library, workshop, open doors.
- Six placed pixel staff with native modal conversations and matching portraits.
- Two project books, six pages each: introduction and development notes. Two facing leaves above 700px; one leaf below. Section bookmarks, page turns, remembered page, Escape and opener focus restoration.
- Clickable fragmented seal, tool traces, opt-in procedural ambience and sound effects.
- Stored room, individual reading positions and sound preference. First visit is muted; remembered opt-in resumes only through user interaction. Hidden tabs suspend sound.
- Existing URLs retain readable no-JavaScript HTML and enter the corresponding interactive room when JavaScript is available.

## Automated checks

Passed on the current implementation:

- `node scripts/check.mjs`: entry routes, local assets, room anchors, approved social URLs, six staff and twelve project pages.
- `node scripts/book-check.mjs`: every page reachable at both widths, exact reading indices, boundary handling and content length.
- `node --check` for college, book, sound and legacy-route JavaScript.
- `git diff --check`: no whitespace errors. Git emits its existing LF/CRLF conversion notices.

The original static-only test assertions were updated for the approved interactive redesign: social destinations are in the room renderer, room hashes are application routes, and native modules are now intentional.

## Direct browser observations

Real Chrome via CUA, served locally over HTTP:

- Enter the college opens the hall; quick navigation changes rooms and active state.
- Clicking the seal produces its active aligned state and a status message.
- Julie's conversation opens with her portrait; the work question changes dialogue. The earlier field-notes shortcut was removed in the visitor-feedback revision.
- Desktop Golem pages3–4 advance to5–6. Escape closes the reader and restores focus to the book. Reopening restores5–6.
- At 375px, Monstel displays one page. Next advances1→2; ArrowRight advances2→3; Escape returns focus to Monstel.
- Pixie's mobile conversation loads the supplied mint/pink identity and readable choices.
- Mora's instrument produces visible work feedback.
- Sound toggles on/off. After muting, returning to the bare site URL restores the Workshop and remains muted through the next room navigation.

## Review corrections

Two independent initial reviews identified a malformed mobile CSS fragment, a mute preference stored from a success return value, tool labels overlapping staff faces, and Jenny overlapping a portal description. These were corrected. Audio restoration now uses click, which also supports keyboard activation. Navigation remains visible while scrolling, and mobile dialogue portraits show the full head.

A fresh independent final review returned PASS with no blockers: all15 room/viewport combinations, all6 desktop spreads and12 mobile book pages, all six portraits, keyboard/focus, sticky navigation, corrected overlaps, sound preferences and room restoration. Browser warning/error logs were empty. Detailed receipts and source hashes are recorded in `.omo/evidence/living-college/`.

## Evidence and limits

Live CUA screenshots and DOM observations are available in the implementation conversation. The CUA interface used here returns screenshot bytes without a documented local-file export; no saved screenshot files or pixel-diff scores are claimed. There is no exact bitmap target: DESIGN.md is the approved visual contract.

No new Lighthouse run, audible listening assessment, screen-reader session or production deployment is claimed. Audio's module lifecycle was checked during implementation; UI activation and mute persistence were exercised in Chrome. This is the local feature-branch implementation, not a published update at the public GitHub Pages URL.

Four revision-2 v4 score-data presets are in the maker folder (ember-presets). The user exported their WAVs; integration is recorded below. No agent audition is claimed.

## WAV integration — 2026-09-15

- Four user-provided PCM16 mono WAVs at 44.1 kHz load from their original filenames in assets/audio/. Total transfer: 27,172,408 bytes after sound opt-in, no new dependency or transcoding. Files decode once per page; room changes reuse the buffers.
- Mapping and measured input RMS/peak: hall 75.79s 0.0217/0.1125; library 90s 0.0234/0.1032; workshop 60s 0.0182/0.0960; doors 82.29s 0.0150/0.0747. All first/last sample differences are zero. These numeric checks do not establish perceived seamlessness or musical quality.
- Playback trims 3.0/2.8/3.5/4.2 compensate for low export levels; unchanged master gain 0.4, room gain 0.7, reading gain 0.28. Outdoor wind, exterior tones and interaction effects retain their existing code and levels.
- node scripts/sound-check.mjs passed against the actual files plus mocked lifecycle calls: room mapping, looping, levels/headroom, first gesture, muted startup, reading/restore, rapid navigation, hidden-tab suspend/resume, destroy during loading, late completion while muted, concurrent opt-in, HTTP/decode failure isolation and retry of missing files only.
- node scripts/check.mjs and node scripts/book-check.mjs passed; sound.js syntax check passed.
- Real Chrome Web Audio harness at .omo/evidence/wav-bgm/browser-check.html fetched/decoded all four WAVs with loop=true. It passed rapid room selection, reading gain 1.926 -> 0.805 after fade settling, closing restore, exterior wind and mute-to-suspended. This validates the actual browser audio graph; no audible listening assessment was performed.
- Main-site Chrome UI: sound enabled, all four interior rooms visited, Golem reader opened on saved pages 5–6, Korean/English switching preserved those pages, Escape closed the reader, workshop tool feedback worked, and muting survived reload. Warning/error log query returned empty. Hidden-tab behavior was checked in the automated lifecycle test, not a separate real-browser visibility assertion.
- No public deployment, commit or push. Existing broader visual review remains historical; this change does not alter layouts.

## Studio-office copy revision — 2026-09-15

- Clarified the location as Ember Studio's office presented through a northern magic-school fantasy. Staff are game-development team members; the magical architecture is atmosphere.
- Updated English and Korean identity, room names/descriptions, staff dialogue, project-record controls, metadata, accessibility labels, no-script copy and the readable works.html / college.html fallbacks.
- Preserved historical URLs, room hashes, code filenames/classes and saved-state keys for compatibility.
- The authoritative rationale and future copy rule are in docs/CONCEPT-HISTORY.md; the older unified handoff is explicitly marked historical.
- Automated checks passed: scripts/check.mjs, scripts/book-check.mjs, scripts/sound-check.mjs, JavaScript syntax checks and git diff whitespace validation.
- Real Chrome verification passed in English and Korean for the entrance identity, navigation, Project Archive, Golem Sculptor project record, Development Workshop and longer Korean labels. The 1667px desktop capture showed no clipping or overlap from the revised copy. No new full viewport matrix was run because layout code did not change.

## Motion / game-feel implementation — 2026-09-16

Local implementation only. No commit, push, or public deployment. Baseline commit `e791393`. Existing working-tree WAV deletions were left in place.

### Automated checks (this machine, Node v24.12.0)

| Command | Result |
| --- | --- |
| `node scripts/check.mjs` | PASS |
| `node scripts/book-check.mjs` | PASS |
| `node scripts/motion-check.mjs` | PASS — stale request tokens lose; paused page turns skip the decorative leaf; repeated rune tokens keep the latest |
| `node --check assets/college.js` / `book.js` / `sound.js` | PASS |
| `git diff --check` | PASS aside from the existing LF/CRLF notice |
| `node scripts/sound-check.mjs` | FAIL — ENOENT on the four deleted `assets/audio/*.wav` files, then `sound.musicReady` assertion. Not weakened. |

### Chrome (headless, HTTP `http://127.0.0.1:4173`)

Served from the existing local preview. Screenshots and a JSON report: `.omo/evidence/motion-juice/` (gitignored). Viewports 1280, 768 and 375 for all five rooms. `prefers-reduced-motion: no-preference` was emulated for the motion-on pass after an initial run showed headless Chrome defaulting to reduce.

Observed in DOM and screenshots:

- Header motion control visible in every room; icon-only so 768px no longer overlaps the wordmark. Two-row header from 900px down.
- Hall 4 lamps, workshop 3, library 2 lamps + 8 dust (5 on 375px). No page overflow at 1280/768/375.
- Background room id, hash and title matched after sequential and rapid hash changes. Last room won. Fade layer count 0 after settle.
- Rune click: aligned `.active`, 4 sparks, wave, readable notice. Ten repeats kept one spark node. Pause: aligned state + notice, 0 sparks. Play again: sparks and wave return.
- Build/test/pixels produced distinct decorations (3 lines / 1 check / 4 palette pixels). Leaving the workshop after a tool click cleared decorations and the previous notice.
- Golem record opened to pages 1–2; Next reached 3–4 with a turning leaf while motion allowed. Dust `animation-play-state` was `paused` while the dialog was open.
- Julie conversation opened with her portrait and greeting; the work question replaced the whole line immediately.
- Korean switch kept the hall, translated the motion label to `움직임 멈추기`.
- Mobile: motion button in the header, entrance door hotspot hidden as before, first-tap tools still fire.

### Limits

- Indoor BGM, reading ducking and hidden-tab audio were not listened to or marked passing: the four WAV files are still missing locally. `sound-check.mjs` remains FAIL for that reason.
- No Lighthouse, FPS counter, or screen-reader session. Smoothness is a visual observation on this machine, not a 60fps guarantee.
- OS Settings UI for reduced motion was not clicked in a full desktop Chrome window; headless emulation plus the in-page pause control were used.
- Official external destinations were not signed into. Link URLs are unchanged.
- Historical PASS rows above are not this revision.

## WAV restore — 2026-09-16

The four tracked indoor loops are back in `assets/audio/` and match the previously connected sizes. `node scripts/sound-check.mjs` now PASSES (hall 75.79s, library 90.00s, workshop 60.00s, doors 82.29s; loop seams, levels, mute, visibility, late loads, retry). `check.mjs`, `book-check.mjs` and `motion-check.mjs` still PASS.

Chrome at `http://127.0.0.1:4173` fetched all four files with HTTP 200. Clicking Sound produced `Sound on` and no error notice; hall → library → workshop → doors → entrance → library left no load warning; Golem record opened while sound stayed on; mute returned `aria-pressed=false`. Evidence: `.omo/evidence/audio-restore/report.json`. This is graph/UI verification, not a listening session.

Removed leftover untracked `assets/audio/8bit_workshop_70s.wav`. It was not in the music handoff. The Development Workshop still uses `8bit_magicSchool_edit_60s.wav`. No commit or deploy.

## Motion review fixes — 2026-09-17

Addressed `docs/GROK-MOTION-REVIEW.md` without adding effects or libraries. `check.mjs`, `book-check.mjs`, `motion-check.mjs` (now includes same-path art-gate) and `sound-check.mjs` PASS. Chrome at `http://127.0.0.1:8765` with `prefers-reduced-motion: no-preference` reproduced the four review cases after the patch:

- Library transition interrupted by 768→375: fade inactive, `data-scene` is library.webp.
- Workshop build then test: 0 leftover `.tool-fx` after 1.1s.
- Site Pause: staff dialog and book spread `animation-name: none`.
- Entrance `Enter the studio` focus: hearth `animation: none`, opacity 0.95.

Evidence: `.omo/evidence/motion-review/report.json`. Full 15-room matrix, listening, FPS and OS Settings UI were not rerun. No commit or deploy.

## Motion review, remaining Pause paths — 2026-09-17

Second-review leftovers: Pause `transition:none` is on the elements themselves, not only `:hover`/`:focus-visible`. `.book-ribbon`, `.notice`, and `.talk-symbol` no longer travel while paused. Chrome `prefers-reduced-motion: no-preference` at `http://127.0.0.1:8765`:

- Pause + library book hover/unhover: ribbon `transition 0s`, transform `none`; cover stays on its rest rotation.
- Pause + Pixie tool notice: visible immediately, transform `y:0`, `transition 0s`.
- Pause + hall actor hover/unhover: talk-symbol opacity 1 then 0, `y:0`, `transition 0s`.
- Play: ribbon `transition 0.2s`, hover `y ≈ -38`.

`check.mjs` and `motion-check.mjs` PASS. No commit or deploy.

## Page-turn scrollbar fix — 2026-09-17

- The perspective-transformed temporary leaf was contributing overflow outside the book to the dialog's scroll area. In the Korean desktop Golem 5–6 → 3–4 turn, a 653px-tall dialog reached scrollHeight 1283px and its client width dropped from 1120 to 1105px as scrollbars appeared; horizontal overflow also appeared.
- Added `overflow:clip` to `.book-spread`. The decorative turn is bounded by the book, while the book retains natural content height and the outer dialog retains `overflow:auto` for long pages. No page-turn logic, timing, or content changed.
- Real Chrome over local HTTP, motion enabled: sampled Golem Korean forward/backward turns at 1680×1013 (45/55 DOM observations) and Monstel English forward/backward at 1280×900 (45/45). During the sampled active turns, dialog scrollWidth/clientWidth and scrollHeight/clientHeight were equal, with clientWidth remaining 1120px. The temporary leaf was removed after completion.
- At 375×700, Korean single-page turning had no horizontal overflow and a stable scrollHeight during the sampled turn. The longer page retained vertical reading scroll: clientHeight 665px, scrollHeight 721px, End scrolled to 56px and exposed the footer/navigation. Content was not clipped by disabling dialog scrolling.
- `node scripts/check.mjs`, `node scripts/book-check.mjs`, `node scripts/motion-check.mjs`, and `git diff --check` passed. DOM sampling is not an FPS measurement. Browser language and temporary viewport were restored. No commit, push, or deployment.
