# Ember Studio website concept history

## 2026-09-15 — Magic-school office clarification

### Decision

The location is Ember Studio's real office, presented through the visual language of a northern magic school. The school is atmosphere and interface metaphor; it is not the studio's organization, and the six characters are studio staff rather than teachers, students or wizards.

### Visitor-facing model

| Internal ID | Visitor-facing space | Office function |
| --- | --- | --- |
| entrance | The Studio Approach / 스튜디오로 가는 길 | Office entrance |
| hall | The Studio Hall / 스튜디오 홀 | Design, planning and production |
| library | The Project Archive / 프로젝트 기록실 | Game introductions and development records |
| workshop | The Development Workshop / 개발 공방 | Implementation and QA |
| doors | The Open Doors / 스튜디오 밖으로 | Official channels and community |

Project information still appears as physical books because the archive presentation is part of the fantasy office. Labels now identify each book as an Ember Studio project record. The floor seal, candlelight, stone halls, bridge, snow and other magical details remain decorative parts of the office theme.

### Copy changes

- Replaced Living College, college navigation and school-as-organization wording with Living Studio, studio spaces and office wording.
- Changed the header identity to “A Studio of Curious Makers.”
- Reframed room descriptions around planning, project documentation, implementation, QA and studio channels.
- Kept staff job titles and rewrote dialogue that described work as magic or treated project records as enchanted books.
- Renamed book metadata and controls to project records, project sections, game overview and development notes.
- Updated English source copy and authored Korean copy together, including metadata, accessibility labels and no-script fallbacks.
- Updated the legacy college.html screen to say Studio while preserving its URL.

### Compatibility choices

The filenames college.html, assets/college.js and assets/college.css, the CollegeSound class, room hash IDs and saved local-storage keys remain unchanged. They are internal identifiers and changing them would break existing links or remembered visitor state without improving the visible concept.

### Authority

This decision supersedes earlier documents that describe Ember Studio itself as a college, academy or group of apprentice scholars. Those documents remain historical records. Future copy should pass this test: a visitor may see a magical school, but should understand that they are touring an indie game studio office and meeting its working team.
