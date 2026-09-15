# Ember Studio official website — unified handoff (design + implementation)

**For:** Codex Astra (`gpt-6-astra`, effort medium)  
**Repo:** https://github.com/NotNull92/NotNull92.github.io  
**Public URL:** https://notnull92.github.io (unless custom domain later)  
**Design lock:** Julie · 2026-09-15 · Northern Ledger (mage-college archive)  
**Implementer:** Victor + Codex Astra  

This file is the **single source of truth**. Older splits (`JULIE-SPEC-…`, `CODEX-ASTRA-…`, `DESIGN-IMMUTABLE-PASTE`) are superseded by this merge when they conflict — **this doc wins**.

---

## A. Goal (this round)

Ship a polished **static** official site for indie game studio **Ember Studio** on GitHub Pages.

**Primary win:** Visitors understand who Ember Studio is, feel the northern-archive brand mood, and can reach Discord / YouTube / Threads / works without explanation.

**Not failure this round:** No Steam page, blog CMS, i18n, auth, analytics dashboards.

---

## B. Design — Northern Ledger (immutable)

### B.0 Definitions

| Term | Definition |
|------|------------|
| Northern Ledger | Site metaphor: northern college archive; games = catalogued works, not tavern menu |
| Cold structure | Stone / frost / slate chrome (bg, borders, secondary text) |
| Ember accent | Logo glow + primary CTA + focus only — never full-page wash |
| Visitor | Apprentice scholar / reader — **not** inn guest |
| Place | Library / lecture / record room — **not** Whiterun tavern |

**Intentional contrast:** Ember = warmth · College = cold.  
Copy metaphor: *cold halls, warm aftertaste*.

### B.1 Place feel (do)

- Tall vertical space, wide margins, quiet shelves
- Faint stone / frost wash — never muddy parchment wallpaper
- Thin geometric rune/circle motifs as chapter ornaments
- Candle = 1–2 amber pixel points max (or CSS box-shadow), not particle theater
- Chapter rhythm: **I / II / III / IV**

### B.2 Do not

- Tavern metaphor (hearth, beer, cozy dialogue bubbles as primary)
- Pip-Boy green / Fallout terminal as dominant chrome
- RimWorld / Colony Board dense grids
- Elder Scrolls **proper nouns** in UI copy (no Arcanaeum, Saarthal, Skyrim, Winterhold-as-product-name, etc.) — mood only
- Sword / shield / dragon silhouette spam (logo is already flame)
- Hard sell, spam hashtags, fake Steam / App Store / trailer URLs
- Crushing the pixel logo under busy parchment
- Orange-washing the whole site **or** all-blue site that kills the logo
- Inventing X/Twitter URL (not confirmed)

### B.3 Color tokens (lock)

| Token | Hex | Use |
|-------|-----|-----|
| `--bg-void` | `#0B0E14` | Page background |
| `--bg-hall` | `#141A24` | Section panels |
| `--bg-shelf` | `#1B2330` | Cards / shelves |
| `--stone` | `#2A3344` | Borders, rules |
| `--frost` | `#8FA3B8` | Secondary text, captions |
| `--ink` | `#E8EEF5` | Primary body |
| `--frost-glow` | `#6B8CFF` @ 8–12% | Optional cold rim — never louder than amber |
| `--ember` | `#F0A030` | CTA fill, link hover, logo companion |
| `--ember-deep` | `#C45C18` | CTA pressed |
| `--ember-soft` | `#F0A030` @ 16% | Soft glow **behind logo only** |

**Contrast:** Body on `--bg-hall` ≥ WCAG AA. Amber CTA: dark label on ember fill, or ember outline + `--ink` label.  
**Avoid:** `#39FF14` Pip-Boy; full-page `#FF6600` wash.

### B.4 Type tokens

| Role | Spec |
|------|------|
| Display / chapter | Serif or slightly archaic (Fraunces / Source Serif / similar). ~clamp(1.75–2.75rem) |
| UI / body | Readable sans (Inter / system-ui). 1rem / 1.6 |
| Meta / shelf labels | Sans uppercase or small-caps 0.75rem, `--frost`, tracking ~0.08em |
| Language | **EN primary** |

### B.5 Components

| Component | Rule |
|-----------|------|
| Logo | Intact pixel asset on black or `--bg-void`. No blue recolor. Min ~96–128px wide; `image-rendering: pixelated` |
| Nav | Sparse text + active amber underline 1–2px. No chunky tavern tabs |
| Chapter head | `I`/`II`… in frost + display title in ink |
| Game card | Title, one-line pitch, chip `In development`, optional repo link. No fake store badges |
| CTA primary | Ember fill or outline — Discord **or** YouTube as hero primary; other secondary |
| CTA secondary | Ghost / frost border |
| Divider | 1px `--stone` or thin rune SVG ≤24px tall |
| Motion | Fade ≤200ms. No snowstorm; no loud candle loops |
| Texture | Parchment/stone ≤2–4% opacity. If logo suffers → remove |

### B.6 Brand strings (immutable)

- Studio: **Ember Studio**
- Hero H1 (preferred): **Games that glow after the screen fades.**
- Alternate whisper (footer/bio-style, optional): games that stay after the screen goes dark
- Logo: pixel flame + “EMBER / STUDIO” on black — do not recolor, distort, or bury

### B.7 Design risks (mitigate while building)

| # | Risk | Mitigation |
|---|------|------------|
| R1 | Cold wash kills logo | Logo on void/black plate; ember soft glow only behind logo |
| R2 | Contrast collapses (all-orange or all-ice) | Amber ≤ accents; structure stays frost |
| R3 | IP / cliché | Mood-only copy; thin geometry; texture ≤4%; no ES screenshots |

---

## C. IA + pages

```
[Sticky nav]  Ember Studio · Works · College · Doors
     │
     ▼
┌─ I. Entrance (Home hero) ─────────────────────────┐
│  Logo · Slogan · 2-sentence pitch · CTA row         │
└────────────────────────────────────────────────────┘
┌─ II. Works on the shelf (Games) ───────────────────┐
│  Card: Golem Sculptor  ·  Card: Monstel             │
│  (optional tiny tools footnote — not hero)          │
└────────────────────────────────────────────────────┘
┌─ III. The college (About) ─────────────────────────┐
│  Studio blurb · Staff roles (no Mephala)            │
└────────────────────────────────────────────────────┘
┌─ IV. Doors out (Links) ────────────────────────────┐
│  Discord · YouTube · Threads · GitHub               │
└────────────────────────────────────────────────────┘
[Footer] slogan whisper · © Ember Studio
```

**Page split (minimum):**
1. `index` — I + II strip + doors/footer  
2. `games` (or `works`) — full II  
3. `about` (or `college`) — III  
4. Doors = Home section + footer mirror (separate `links` page optional)

**Nav labels:** Entrance/Home · **Works** · **College** (or **Studio** if IP-safer) · **Doors**  
Nice-to-have: sticky nav, mobile ≥320px, favicon from logo crop.

---

## D. Copy (tone + seeds)

### D.1 Tone (8 rules)

1. Address visitor as **reader**, not customer.  
2. Short sentences. Literary salt, not purple prose.  
3. Cold nouns (stone, shelf, record, draft) + warm verbs (glow, linger, kindle).  
4. No tavern slang.  
5. No hype stack (revolutionary, ultimate, must-play).  
6. Every unfinished work: **In development**.  
7. EN chrome only for v1.  
8. No Elder Scrolls names in visible copy.

### D.2 Seeds (preferred defaults)

- **H1:** `Games that glow after the screen fades.`  
- **Sub:** `Ember Studio catalogues small games made with care — drafts on the shelf, warmth that stays.`  
- **Primary CTA:** pick one — `Enter Discord` **or** `Watch on YouTube`  
- **Secondary CTA:** `Browse works`  
- **II intro:** `II — Works on the shelf`  
- **Golem Sculptor:** `A siege board of stone and runes — still being carved.`  
- **Monstel:** `A monster-hotel elevator loop — floors rising in development.`  
- **III opener:** `III — The college`  
- **III body:** `Ember Studio is a small northern workshop. We build games that leave a glow after the screen goes dark.`  
- **Staff line:** `Julie — design / systems` (roles only; no “AI bot”)  
- **IV intro:** `IV — Doors out`

Optional founder line (tasteful, short; needs care): solo founder building in public with AI tools after becoming a parent; previously industry years — omit if unsure.

---

## E. Content inventory (immutable URLs)

### E.1 Links (exact)

- YouTube: https://www.youtube.com/@emberstudioo  
- Discord: https://discord.gg/VkAFZHyUn  
- Threads: https://www.threads.com/@emberstudio26 (`emberstudio26`)  
- GitHub: https://github.com/NotNull92  

### E.2 Works (primary)

- **Golem Sculptor** — https://github.com/NotNull92/golemsculptor (private OK; status In development)  
- **Monstel** — https://github.com/NotNull92/monstel (In development)

### E.3 Tools (secondary footnote only)

hera-agent-unity, hebe-agent-unity, hera-agent-godot, workforge-mcp → `https://github.com/NotNull92/<name>`  
Do not dominate homepage.

### E.4 Staff (College section) — never list Mephala/메피

- Julie — design / systems  
- Mora — implementation  
- Bara — production / scope  
- Star — QA  
- Jenny — marketing  
- Pixie — pixel / sprite art  

### E.5 Assets

- Logo required under `assets/` (pixel flame). Banner optional; if used, compress — do not ship multi‑MB hero on every page.  
- YouTube banner = mood reference only, not 1:1 page background.

---

## F. Tech + process (implementation)

### F.1 Tech constraints (immutable)

- Deploy on **GitHub Pages** from `NotNull92.github.io`  
- **Static** only: plain HTML/CSS/JS **or** static generator → `/` or `/docs` as Pages expects  
- No backend, no paid hosting assumption  
- WCAG AA contrast; optimize images  
- EN primary UI  

### F.2 Mutable (OK to decide)

- Exact CSS approach / mild framework or none  
- Tools footnote on Home vs College only  
- File structure  
- Hero primary CTA = Discord vs YouTube  
- Nav label College vs Studio  

### F.3 Needs Victor approval before

- Custom domain  
- Personal/family detail beyond short founder blurb  
- Any new external link not listed above  
- Rewriting the primary slogan  

### F.4 Out of scope

- Blog / CMS, login, private game embeds  
- X API / auto-posting  
- New pixel art (Pixie) unless separately requested  
- Marketing social posts (Jenny)  
- Rewriting Julie tokens without Victor  

### F.5 Implementation steps

1. Inspect repo; keep anything useful  
2. Add `assets/` (logo required)  
3. Build pages + shared CSS from tokens above  
4. Configure GitHub Pages (root or `/docs` — document which in README)  
5. Local + mobile check (≥320px)  
6. Branch + PR if history exists; greenfield empty site may commit main  

### F.6 Done definition

**Internal**
- [ ] Entrance: logo + slogan H1 + correct CTAs  
- [ ] Works: Golem Sculptor + Monstel, both `In development`  
- [ ] College: studio blurb + staff (no Mephala)  
- [ ] Doors: Discord / YouTube / Threads / GitHub exact URLs work  
- [ ] Tokens respected (cold structure + ember accents only)  
- [ ] Mobile usable; favicon present; images not breaking layout  
- [ ] README explains Pages serve path  

**External**
- [ ] Victor opens https://notnull92.github.io (or Pages URL) and confirms brand feel  

### F.7 Completion report (required)

- Files changed  
- Local how-to + Pages URL  
- Widths tested  
- BLOCKED / leftover (missing assets, etc.)  

---

## G. Compact Design lock (quick scan)

Place: northern college archive. Visitor = apprentice scholar.  
NOT: tavern, Colony Board, Pip-Boy green, Fallout chrome, ES proper nouns.  
Colors: void `#0B0E14` · hall `#141A24` · shelf `#1B2330` · stone `#2A3344` · frost `#8FA3B8` · ink `#E8EEF5` · ember `#F0A030` / deep `#C45C18`.  
IA: I Entrance · II Works · III College · IV Doors.  
H1: Games that glow after the screen fades.
