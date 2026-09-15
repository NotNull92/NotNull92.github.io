# 실내 BGM 연결 상태

사용자가 assets/audio/에 내보낸 수정본 WAV 네 곡을 사이트에 연결했습니다. 실내 합성 선율 코드는 제거했고, 외부 눈바람과 효과음은 유지했습니다.

## 최신 프리셋: 2026-09-15 2차 수정

권위 있는 데이터와 사용법은 다음 폴더에 있습니다.

`C:\Users\PC\Desktop\Cowork\8bit-bgm-maker-offline\ember-presets`

사용자가 네 곡이 비슷하다고 피드백하여 공통 도서관 베이스·공통 선율을 수정했습니다.
서고 악보는 그대로 유지하고 홀·공방·출구의 프리셋, 선율, 화음 진행과 각 파트의 리듬을 분리했습니다.

| 악보 | 바탕 프리셋 | 구성 | 템포 / 길이 | 연결 파일명 |
| --- | --- | --- | --- | --- |
| 01-hall.txt | 왕궁 / palace | C 장조, 분산화음, 두 박자 베이스 | 76 BPM / 75.79초 | hall.wav |
| 02-library.txt | 도서관 / library | C 도리안, 여백과 지속 화음 | 64 BPM / 90초 | library.wav |
| 03-workshop.txt | 마법 학교 / magicSchool | E♭ 리디안, 짧은 선율과 엇박 반주 | 96 BPM / 60초 | workshop.wav |
| 04-doors.txt | 밤바다 / nightsea | E 믹솔리디안, 긴 하행 선율 | 70 BPM / 82.29초 | doors.wav |

이전 도서관 공통 베이스 슬라이더 표는 폐기했습니다. 모든 곡은 무드럼이고, 제작기 원본 HTML은 변경하지 않았습니다.
데이터 형식·음계·리듬 차이 검사는 통과했습니다. 사용자가 수정본 WAV를 내보냈으며, 실제 파일 검사와 사이트 연결을 완료했습니다. 에이전트의 청음 평가는 하지 않았습니다.
브라우저 URL 정책이 제작기 실행과 우회를 차단했던 기존 결정은 유지합니다.

## 연결 완료 파일

- 중앙 홀: assets/audio/8bit_palace_edit_76s.wav
- 서고: assets/audio/8bit_library_edit_90s.wav
- 공방: assets/audio/8bit_magicSchool_edit_60s.wav
- 출구: assets/audio/8bit_nightsea_edit_82s.wav

파일명은 사용자가 제공한 원본 그대로 사용합니다. 표의 hall.wav 등은 이전 안내용 이름입니다.
네 파일은 44.1 kHz 모노 PCM16이며, 실제 길이가 수정 프리셋과 일치합니다.
파일은 최초 사운드 활성화 때 로드하고 한 번 디코딩한 버퍼를 반복 재생합니다.
한 파일의 실패가 다른 곡을 막지 않으며, 사운드를 다시 켜면 실패한 곡만 재시도합니다.
독서 감쇠, 방 전환, 음소거, 숨긴 탭 처리 및 자동 검사 결과는 VALIDATION.md에 기록합니다.
공개 배포는 수행하지 않았습니다.
