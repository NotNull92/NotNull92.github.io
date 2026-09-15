# Ember Studio — Northern Ledger

The immutable authority is [the handoff](docs/EMBER-STUDIO-WEBSITE-HANDOFF.md).

## 0. Reference
The supplied Northern Ledger design packet defines the palette, copy and hierarchy. No alternate brand research or generated artwork is needed. Original `assets/logo.png` is the focal asset; the banner is reference only.

## 1. Atmosphere & identity
A northern college archive: tall margins, quiet shelves, frost-lit stone and an intact warm pixel logo on black. The signature is a framed archive plate beside a literary entrance inscription. Chapter numerals structure the journey.

## 2. Color
`--bg-void: #0B0E14`; `--bg-hall: #141A24`; `--bg-shelf: #1B2330`; `--stone: #2A3344`; `--frost: #8FA3B8`; `--ink: #E8EEF5`; `--frost-glow: rgb(107 140 255 / 8%)`; `--ember: #F0A030`; `--ember-deep: #C45C18`; `--ember-soft: rgb(240 160 48 / 16%)`; `--logo-black: #000`.
Amber is limited to primary CTAs, link states, focus and logo glow. Body and muted copy meet AA on their surfaces.

## 3. Typography
Display: Georgia, Times New Roman, serif, normal weight, 1.12 line height. Titles clamp from 1.75 to 2.75rem. Body: system-ui, sans-serif, 1rem/1.6. Lead 1.125rem. Small 0.875rem. Metadata 0.75rem with 0.08em tracking. No font network requests.

## 4. Spacing & layout
4px base; space tokens 4, 8, 12, 16, 24, 32, 48, 64, 96px. Content max 1120px, fluid 20–48px gutters. Section gaps 64–96px. Two-column hero and shelves collapse below 700px. Nav stays visible and wraps into two rows on small screens; no scripted menu. Minimum viewport 320px. Logo plate max 360px, actual logo max 288px.

## 5. Components
- Header: home wordmark, text navigation, 1px active amber underline and aria-current. Sticky; natural wrapping; visible focus.
- Chapter: frost Roman numeral and rule, serif title, optional short intro. Shared section spacing.
- Action: actual anchor, 44px minimum target. Primary amber/dark text; secondary frost border/ink label. Hover underline or ember border, active dark ember/black for primary, 2px amber focus with offset. No disabled/loading states because there is no async UI.
- Shelf: semantic article with catalog number, title, pitch and outlined In development status. Full Works page adds truthful development notes, no speculative gameplay details or private repo access promises.
- Door: linked row with platform, brief destination description and decorative arrow; four rows separated by stone rules. Same-tab navigation, standard browser back behavior.
- Staff: semantic figures with name and role captions, three-column portrait register collapsing to one column.
- Footer: slogan whisper, copyright and exact social links mirrored on every page.

## 6. Motion & interaction
No automatic decorative motion. Links show immediate hover/focus/press states. No JavaScript required. Native anchor navigation and keyboard operation. Reduced-motion users receive the same stable page.

## 7. Depth & surface
Mixed tonal surfaces and 1px stone rules, squared corners. Faint frost radial light around hero frame, thin geometry as archival ornament. Amber soft glow only behind logo. No game art invented, no screenshot wallpaper, no large banner payload.

## 8. Accessibility & accepted debt
WCAG AA contrast, semantic landmarks, one H1 per page, skip link, descriptive link names, keyboard focus, 44px navigation targets, responsive reflow. Decorative motifs hidden from assistive technology. No accepted implementation debt. Public deployment and Victor's final brand approval are external verification steps.

### Staff portraits
The user supplied five portraits under `assets/staff/`. WebP delivery files contain the same square face crops used in the initial CSS composition, excluding embedded franchise names and unnecessary image payload. Three columns collapse to two at 900px and one at 480px. Pixie's original portrait was generated with the built-in image generator under user authorization, and saved as `assets/staff/pixie.webp`. Portraits are 480px square; all six have adjacent visible name/role captions; image alt is empty to avoid duplicate announcements.
