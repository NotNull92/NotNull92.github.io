# Asset provenance — Living Studio

## User-supplied originals

The original files remain unchanged:

- `assets/logo.png`, `assets/banner.png`: original Ember Studio branding. Logo proportions and colours are preserved; the banner is a reference, not a runtime background.
- `assets/staff/{줄리,모라,바라,스타,제니,픽시}.png`: supplied staff identities.
- Pixie uses the newly supplied mint/pink twin tails, star hair clip, white shirt, mint overalls and stylus. The older ash-lavender `assets/staff/pixie.webp` is retained as an unused historical asset.

`assets/favicon.png` is the original logo delivered at 64px with nearest-neighbour scaling.

## Generated environments

Six original images were generated with the built-in image generator under the user's authorization. They depict Ember Studio's office through a detailed northern magic-school fantasy: cold blue stone, frosted windows, warm amber candlelight, substantial architecture and quiet space for live interface elements. The school-like architecture is atmosphere, not the studio's organizational identity. Winterhold informs atmosphere; no Skyrim screenshots, logos or proprietary game assets are included.

| Delivery file | Composition |
| --- | --- |
| `assets/scenes/entrance.webp` | Fantasy office on a sea cliff and bridge; open left side for original branding |
| `assets/scenes/entrance-mobile.webp` | Vertical exterior composition for narrow screens |
| `assets/scenes/hall.webp` | Great hall, stairways, side passages and a central seal pedestal |
| `assets/scenes/library.webp` | Shelves, cold window light and an empty reading table |
| `assets/scenes/workshop.webp` | Instruments, planning desk, test bench and open foreground |
| `assets/scenes/doors.webp` | Four outward-facing archways and a notice area |

Desktop originals are 1536×1024; the mobile exterior is 1024×1536. Local WebP delivery uses quality 82, approximately 248–361KB per scene. Scene artwork contains no baked-in buttons or project text.

## Pixel staff

`assets/characters/{julie,mora,bara,star,jenny,pixie}-{sprite,portrait}.webp` were generated from the corresponding supplied identity references. Prompts requested the same face, hair, outfit cues and tools in a coherent pixel adventure style, with a portrait and full-body figure on transparent backgrounds.

The output sheets have real alpha. Delivery extraction separates the full-body connected alpha component from the adjacent portrait and trims transparent margins; it does not redraw characters. Portraits are 480px square; full-body exports are up to 640px high. All six sprites retain alpha 0–255 and have been viewed against the rendered room backgrounds. RGB colours hidden under alpha0 are not visible artwork.

Generated source PNGs remain in the session's local generated_images directory. IDs (session `01a0a390-b8d9-7782-b3c6-49c897bba408`):

- Entrance `1ebb3e4f-36ca-4230-badc-fe11a30568ce`; mobile `125383b5-4c58-4570-a48b-338843a0161c`.
- Hall `2bf45842-761b-460a-afa1-7af5c1473bc8`; library `ac0cfa87-ce59-4f5b-afef-36f13192aad5`.
- Workshop `2d0dd278-a7cc-4719-bcc3-58721ea37e96`; doors `a04cb94a-a220-4dd3-9c45-981d8000c410`.
- Julie `bf5c9061-92eb-4269-b290-17bdc7700753`; Mora `25d6c4ee-4d1f-4161-ba9b-c4108bb6ea6f`.
- Bara `672b9fb8-d9f4-4d6c-84ea-c876720c49eb`; Star `7c43d46e-52ee-4d6d-97c6-80dc42747f50`.
- Jenny `08b4f7cd-d201-4a94-9028-e50baf57ca0e`; Pixie `0058d5e2-7d78-4e5b-a939-28465522228a`.

## Font and sound

Silkscreen is self-hosted at `assets/fonts/silkscreen.woff2`; its SIL Open Font License is included in `assets/fonts/OFL.txt`. Body text uses system fonts; book prose uses the browser's Georgia/serif stack.

Outdoor wind, soft exterior tones and brief paper/rune/tool cues are generated with Web Audio. Indoor music uses the four user-exported WAV files listed below. Sound is opt-in and remains muted on an initial visit.

## Visitor-feedback update

Korean headings use [NeoDunggeunmo](https://github.com/neodgm/neodgm-webfont), self-hosted as `assets/fonts/neodgm.woff2` (44,352 bytes). Its unmodified download matches the publisher's SHA256 `0c0ca9cd73f692a5da5d7fb39737902aa9ea312537237779972a9d81ef0a33bf`; SIL OFL terms are in `assets/fonts/NEODGM-LICENSE.txt`.

The exterior's snow, aurora and doorway glow are composited CSS layers over the existing artwork; no replacement image or video asset is needed. An explicit pause control and reduced-motion setting stop movement.

## User-exported indoor WAV music

The user exported the revision-2 Ember scores with their local 8bit BGM maker and supplied these unmodified files in `assets/audio/`. The maker HTML is not included in the website. The authored score presets and provenance are documented in [MUSIC-HANDOFF.md](MUSIC-HANDOFF.md).

| Room | File in assets/audio | Duration | Bytes | Playback trim |
| --- | --- | ---: | ---: | ---: |
| Hall | 8bit_palace_edit_76s.wav | 75.79 s | 6,684,676 | 3.0 |
| Library | 8bit_library_edit_90s.wav | 90.00 s | 7,938,044 | 2.8 |
| Workshop | 8bit_magicSchool_edit_60s.wav | 60.00 s | 5,292,044 | 3.5 |
| Doors | 8bit_nightsea_edit_82s.wav | 82.29 s | 7,257,644 | 4.2 |

All four are mono PCM16, 44,100 Hz (27,172,408 bytes total). Fixed playback trims bring the low-level exports to similar RMS levels without modifying source audio; master volume and reading reduction still apply. No runtime melody generator remains. The outdoor wind profile and procedural effects are unchanged.
