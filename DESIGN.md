# Ember Studio — The Living Studio

> Current concept authority: this is Ember Studio's office presented as a northern magic school. See [docs/CONCEPT-HISTORY.md](docs/CONCEPT-HISTORY.md). Earlier college-as-organization wording is historical.

## 0. Authority and references
The user's approved interactive design supersedes the old handoff's static layout, serif headings and 200ms-only motion. Branding, English copy, approved links and static GitHub Pages remain. References researched: Winterhold bridge/cylindrical towers/scholarly community; Arinji full-canvas scenery and pixel typography; Recent Ice Fracture, Cartridge Timeline and pinned-scroll. These inform an original design, not a clone. All navigation, text, books and characters are live elements.

## 1. Journey
Eye-level pixel office presented as a northern magic school. First visit exterior; revisit last room. The fantasy architecture is a visual metaphor for Ember Studio’s real office: the Studio Hall is planning and production, the Project Archive holds game records, the Development Workshop is implementation and QA, and the Open Doors lead to official channels. Six staff speak as actual game developers. Project records retain their book presentation and page-turn interaction. Remember room and reading position.

## 2. Color
Tokens: void #0B0E14; hall #141A24; shelf #1B2330; stone #2A3344; frost #8FA3B8; ink #E8EEF5; ember #F0A030; deep ember #C45C18; parchment #E9DFC7; paper ink #302D2B; paper muted #625849; brass #A98B56; black #000; overlay rgba(7,12,20,.78). Cold structure, selective amber lights and focus. Preserve character palettes.

## 3. Typography
Local Silkscreen display at24–48px, exterior title32–60px, -0.03em tracking. Body system sans16–18px/1.65, book Georgia serif. Meta11–12px uppercase/.15em tracking, controls13–14px/1.4, small headings20–24px. Local WOFF2 swap. Logo intact on void plate.

## 4. Layout
4px unit; spacing4/8/12/16/20/24/32/40/48/64/80/96. Header76px, footer48px, scene fills remaining viewport min600px desktop. Background cover with independent interactive foreground. Caption upper left, objects center/lower. Book max1120px two leaves; <700px single leaf and natural vertical reading scroll. Mobile room ledger reflows reachable character/navigation controls, minimum44px targets. No page horizontal overflow. Text never baked into scenery.

## 5. Primitives
Scene (changing/settled), hotspot (button or link with plaque, hover/focus/pressed), staff (transparent sprite, shadow/nameplate, focus/talking), project record (DOM book cover/spine, section selection, native dialog leaves and controls), dialogue (native dialog portrait/name/role/greeting/action choices), studio seal/tool (short action response+polite status), sound toggle, contextual room ledger. All repeated elements share tokens and styles. Escape closes; focus restored. Page index announced. First/last controls disabled correctly. Resize preserves exact reading position. Legacy Works/Studio pages retain readable fallback and direct interactive links.

## 6. Motion
Feedback160ms, selection320ms, page turn520ms, scene entrance800ms, ease cubic-bezier(.22,1,.36,1). Transform/opacity only; no scroll hijack. Page rotation around spine via temporary leaf, content never waits for animation events. Modal scales from center, nearest beui center-morph mechanism. No new motion dependency. Novel rune has three segments align on click; tool marks last1.2s. Reduced motion removes transforms; invisible page pauses animation. Audio explicit opt-in, remembered setting, user gesture unlock, hidden tab suspends; room-specific filtered wind/soft tones, short procedural effects, no voice.

## 7. Materials and assets
Original generated pixel exterior/hall/library/workshop/doors, supplied logo, six pixel sprites/portraits from original identities. New assets/staff/픽시.png replaces earlier temporary Pixie as reference. Sprite alpha preserved. Compressed WebP delivery. Book covers are symbolic geometric art, not fabricated game screenshots. Provenance in docs/ASSETS.md.

## 8. Accessibility and verification
AA contrast, skip link, semantic headings/nav, native dialog keyboard trap/Escape, arrow reading, labeled links and controls. Desktop explorer and mobile direct reader can complete every task. Verify navigation/back/refresh, all staff, both books/pages/bookmarks, resizing, audio visibility, reduced motion, storage failures. Capture375/768/1280px and interaction states; independent review. No accepted functional debt. Public deployment remains separate from local implementation.

## 2026-09-15 visitor feedback revision

English remains the initial language; a persistent EN/Korean control translates all room, staff, reader and accessibility copy without changing room, dialog or reading position. Korean is authored for meaning, tone and character voice. Korean headings use a legible pixel Hangul font, body prose a Korean system sans stack; keep words together at narrow widths.

The exterior is a living illustration: slow aurora drift, two depths of pixel snow and a restrained amber doorway glow. Motion overlays preserve the original architecture and logo, never intercept pointer input, and stop under reduced motion, hidden tabs or an explicit motion pause control. Visitors may explicitly choose Play despite an existing reduced-motion preference; a new OS preference change pauses motion again.

Project reading starts only by selecting a library book. Staff conversations stay with the character and never navigate to a project or another room. Remove the entrance's secondary library shortcut; persistent room navigation and the hall doorway still provide intentional access to the library.

Outdoor wind is retained. Indoor sound is pitched musical ambience with clear note attacks and melody; no continuous noise bed inside. Preserve mute, gesture and hidden-tab behaviour.

Music revision: approved direction is reusable rendered music files, gentle room crossfades and a quieter music level while a book is open. Retain the approved exterior wind and existing mute/visibility behaviour.
