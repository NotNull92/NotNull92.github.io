# Grok 모션 구현 검수 — 2026-09-17

## 3차 재검수 — 최종 수정 확인, 2026-09-17

현재 판정: 기존 지적사항 4개 모두 해결. 이번 수정 범위에서 승인을 보류할 추가 결함은 발견하지 않았다. 아래 1·2차 기록과 수정 요청문은 당시의 역사적 기록이며, 현재 미해결 목록이 아니다.

이번 소스 변경은 CSS에 한정됐다. `college.js`와 `book.js`의 SHA-256은 2차 검수와 같아, 앞서 확인한 배경 전환·도구 정리 로직이 유지됐다.

최신 페이지를 새로고침한 뒤 직접 Chrome에서 확인한 결과:

| 조건 | 실제 결과 |
| --- | --- |
| Pause + Golem 책에 키보드 포커스 | 책갈피 transform `none`, transition `0s`; 표지는 원래 회전 유지 |
| Golem 포커스 해제 → Monstel 포커스 | 두 책 모두 책갈피 이동 없음, transition `0s`; 각 표지의 원래 ±3도 회전 유지 |
| Pause + Pixie 도구 알림 표시 | 문구 즉시 표시, transition `0s`, translateY `0` |
| 알림 자동 해제 | `.visible` 제거, transition `0s`, translateY `0` 유지 |
| Pause + Pixie 인물 포커스/해제 | 말풍선 opacity `1→0`, transform `none`, transition `0s` 유지 |

정지 규칙이 이제 hover/focus 선택자에만 걸리지 않고 요소 자체에 적용된다. 따라서 OS no-preference에서 포커스나 hover를 해제할 때 기본 transition이 다시 살아나던 원인이 제거됐다. 책갈피·말풍선·알림의 정지 상태 위치도 명시됐으며 텍스트·선택 피드백과 기본 배치는 유지된다.

Grok의 갱신된 `scripts/motion-review-qa.mjs`와 `.omo/evidence/motion-review/report.json`도 확인했다. no-preference 환경의 hover/unhover와 Pause→Play 복원을 실제 값으로 검사하도록 확장됐으며, 기록에는 정지 중 transition `0s`, Play 복원 후 책갈피 transition `0.2s`와 이동이 남아 있다. 이 기록은 Grok 실행 증거이며 이번 검수에서 해당 스크립트를 직접 재실행한 것은 아니다.

이번에 직접 다시 실행한 `check.mjs`, `book-check.mjs`, `motion-check.mjs`, `sound-check.mjs`는 모두 PASS. `git diff --check`도 PASS이며 기존 LF/CRLF 안내만 있었다.

검증 한계: 직접 사용한 Chrome은 OS reduce 상태였다. no-preference 조건은 수정된 CSS 경로 분석과 Grok의 갱신된 실행 기록을 함께 확인했다. 전체 15개 방/폭 조합, 청음, FPS, 스크린리더는 이번에 다시 검사하지 않았다. 이 판정은 기존 네 지적사항의 수정 확인이며 전체 사이트에 결함이 전혀 없다는 보장은 아니다.

현재 검수 CSS SHA-256:

```text
assets/college.css 6d1b0ccd4543e318868f43b202930f1c6a12a45c335bbc4e875370b5a1d7b5ff
```

검수 과정에서 앱 소스·설정을 수정하거나 커밋·푸시·배포하지 않았다. 검수 문서만 갱신했다. 추가 Grok 수정 요청은 없다.

---

## 2차 재검수 — Grok 수정본, 2026-09-17

당시 판정: 이전 4개 항목 중 3개 해결, 전역 Pause는 부분 해결. 남은 Pause 누락을 수정한 뒤 해당 조건만 재검수하면 된다. 아래 1차 기록은 수정 전의 역사적 결과다.

| 이전 항목 | 현재 결과 | 이번 독립 확인 |
| --- | --- | --- |
| 전환 중 폭 변경으로 이전 배경 잔류 | 해결 | 홀→서고 중 768→375px, 서고→공방 중 375→768px. 최종 fade 비활성, 서고 `fadeSrc:null`, `opacity:0`, 정상 서고 배경 |
| 서로 다른 도구의 이전 장식 잔류 | 해결 | build→test와 test→build 빠른 Space 입력 후 `.tool-fx` 0개 |
| 수동 Pause의 CSS 모션 누락 | 부분 해결 | 대화창·책 펼침 `animation-name:none`. 정지 상태 페이지 1–2→3–4 이동, leaf 0개, Escape 포커스 복원 정상. 아래 잔여 누락 존재 |
| 입구 선택 조명 무효 | 해결 | Play 상태의 키보드 focus-visible에서 `animation:none`, `opacity:0.95` |

### 남은 [P2] Pause에서 책갈피·알림·hover 해제 모션이 계속 허용됨

위치: `assets/college.css:67`의 새 정지 규칙과 `assets/college.css:8`, `:9`, `:12`의 기존 효과.

확인 수준: 현재 소스와 CSS 적용 경로 분석. 이번 직접 사용한 Chrome의 `matchMedia('(prefers-reduced-motion: reduce)').matches`는 `true`였다. OS no-preference 조건의 이 잔여 현상은 이번에 독립 실브라우저 재현하지 않았다. Grok의 새 QA 기록은 no-preference에서 창과 책 펼침이 정지함을 확인하지만, 아래 대상은 검사하지 않는다.

구체적으로 남은 경로:

- `.book-ribbon`은 `transition:transform 200ms`와 hover/focus/selected의 `translateY(-36px)`가 그대로다. 새 정지 규칙은 `.volume-cover`만 다뤄서 책갈피를 놓친다.
- `.notice`는 `transition:opacity var(--select),transform var(--select)`가 남아 있다. Pause 상태에서도 도구나 룬을 누르면 `.visible` 변경으로 알림이 320ms 동안 16px 이동한다.
- `.talk-symbol`의 8px 이동 transition도 정지 대상에서 빠져 있다.
- 여러 `transition:none` 규칙이 `:hover`/`:focus-visible`일 때만 적용된다. 예를 들어 Pause 상태에서 책 표지 포커스를 해제하면 정지 선택자가 더 이상 일치하지 않아, 기본 회전 배치로 돌아가는 320ms transition이 다시 허용된다. 진입뿐 아니라 해제 경로도 막아야 한다.

이는 이전 3번 항목의 잔여 범위다. 인계 명세 6.2의 수동 정지 정책이 환경 효과와 일부 모달에만 한정돼 있지 않으므로 전체 해결로 처리하지 않았다.

최소 수정 방향: 기존 대상의 transition 정지를 hover/focus 상태에 의존하지 않게 적용하고, 책갈피·말풍선·알림 등 누락된 장식 이동에도 같은 정책을 연결한다. 기본 배치 transform, 읽을 수 있는 텍스트, 선택 색상/테두리를 보존한다. 효과나 라이브러리를 추가할 필요는 없다.

재검수: OS no-preference + 사이트 Pause에서 책 focus/blur·hover/unhover, 인물 focus/blur, 도구/룬 알림의 표시·해제를 확인한다. 텍스트와 선택 상태는 즉시 갱신하고 장식 이동은 발생하지 않아야 한다. Play에서는 기존 효과가 돌아와야 한다.

### 2차 검사 결과와 증거 범위

`node scripts/check.mjs`, `node scripts/book-check.mjs`, `node scripts/motion-check.mjs`, `node scripts/sound-check.mjs`를 새로 실행해 모두 PASS. 앱 JS 3개 문법 검사와 `git diff --check`도 PASS이며 기존 LF/CRLF 안내만 있었다.

실브라우저 확인은 같은 로컬 서버 `http://127.0.0.1:8765`의 최신 페이지를 새로고침해서 수행했다. CSS의 새 Pause 규칙이 로드된 것도 확인했다. 위 DOM 값·화면은 이번 재검수 대화의 도구 결과에 있다. OS reduce 상태에서 명시적 Play와 수동 Pause를 사용했다. viewport 임시 설정은 복원했다.

`scripts/motion-review-qa.mjs`와 `.omo/evidence/motion-review/report.json`도 읽었다. 새 QA에는 실제 화면 조건에 대한 실패 판정이 추가돼 이전보다 개선됐다. 해당 스크립트를 이번 독립 검수에서 재실행했다고 주장하지 않는다. 또한 `motion-check.mjs`의 `firstFx.remove()` 예시는 앱의 `playTool()`이나 타이머를 실행하지 않으므로, 그것만으로 도구 회귀를 보장하지는 않는다.

앱 소스 수정·커밋·푸시·배포는 하지 않았다. 전체 화면 행렬·청음·FPS·스크린리더 검사는 다시 실행하지 않았다.

2차 검수 소스 SHA-256:

```text
assets/college.js  6ee134cc77862000f96ec6e8f12e28311a6c1a9a717b7553802a166097247948
assets/college.css 652f0a488c8bebdb014b62523c979f9c03cb648a809d6ee217679d792bbbf31d
assets/book.js     0e40212f893a4a93a07d3673e7498181c0f656b6f5afa17c4ad41657f2f4fb94
```

### Grok에 전달할 이번 수정 요청

```text
2차 검수에서 배경 잔류, 도구 잔류, 입구 조명 문제는 해결 확인됐어.
Pause도 책·대화창은 해결됐지만 CSS 장식 이동에 누락이 남아 있어.
docs/GROK-MOTION-REVIEW.md 맨 위의 2차 재검수 결과를 읽고 남은 항목만 수정해줘.

OS no-preference + 사이트 Pause에서 book-ribbon의 36px 이동,
notice의 16px 이동, talk-symbol 이동을 막아줘.
또 transition:none을 hover/focus 상태에만 걸어서 해제할 때 다시 움직이는 경로도 정리해줘.
기본 배치 transform과 즉시 표시되는 텍스트·선택 피드백은 보존해줘.

focus/blur, hover/unhover, 알림 표시/해제를 실제 no-preference 환경에서 확인하고
Play로 되돌렸을 때의 정상 동작도 확인해줘. 새 효과·라이브러리·배포는 추가하지 마.
검사한 조건과 실제 결과를 보고해줘.
```

---

## 1차 검수 기록 — 수정 전

당시 판정: 수정 후 재검수 필요. 기존 테마에 맞는 효과와 기본 기능은 반영됐지만, 전환·연속 입력·모션 제어에서 완료 기준을 충족하지 못했다.

검수 대상은 기준 커밋 `e791393f00f0737c8a2a23e918ca347931ee2e3a` 위의 현재 미커밋 변경이다. 공개 GitHub Pages 배포본에 대한 판정이 아니다. 앱 소스는 이 검수에서 수정하지 않았다.

## 1. [P2] 화면 전환 중 폭을 바꾸면 이전 방 배경이 고정된다

- 위치: `assets/college.js:139–145`, `assets/college.js:149–169`, `assets/college.js:362`.
- 확인 수준: 실제 Chrome에서 재현.
- 영향: 내비게이션·제목·책·인물은 새 방인데 이전 방 배경이 계속 덮는다. 다음 방 이동 등 추가 정리가 일어나기 전까지 화면이 잘못된 상태로 남는다.

재현:

1. 모션을 Play로 켜고 768px 폭에서 서고를 한 번 방문해 이미지를 로드한다.
2. 홀로 이동하고 전환이 끝나기를 기다린다.
3. 서고를 선택한 직후, 320ms 전환 안에 폭을 375px로 바꾼다.
4. 1초 이상 지난 뒤 배경과 `#scene-art-fade`를 확인한다.

이번 관찰 결과:

```json
{
  "room": "library",
  "art": "assets/scenes/library.webp",
  "fade": {
    "class": "scene-art scene-art-fade is-fading",
    "opacity": "1",
    "src": "http://127.0.0.1:8765/assets/scenes/hall.webp"
  }
}
```

화면에서도 서고 제목·책·Pixie 뒤에 홀 배경이 남았다.

원인: 실내는 700px 경계를 넘어도 이미지 경로가 같다. 그런데 `updateArt()`는 같은 경로인지 확인하기 전에 요청 번호를 증가시키고 기존 애니메이션을 취소한다. 이후 같은 경로라서 반환하면, 이전 요청의 `reveal()`도 번호 불일치로 정리를 거부한다. `.is-fading`과 이전 `src`가 남는다.

최소 수정 방향: 이미지가 바뀌지 않는 호출은 진행 중인 유효한 전환을 무효화하지 않도록 순서를 조정한다. 같은 경로일 때 전환을 끝내기로 결정한다면 취소·레이어 정리까지 함께 완료해야 한다. 새 전환 관리 엔진은 필요 없다.

재검수 조건: 홀↔서고↔공방 이동 중 700px 경계를 양방향으로 통과해도, 완료 후 fade 레이어는 비활성이고 최종 방과 배경이 일치한다. 입구의 desktop/mobile 이미지 교체도 유지한다.

## 2. [P2] 서로 다른 공방 도구를 연속 사용하면 이전 장식이 남는다

- 위치: `assets/college.js:72`, `assets/college.js:313–322`.
- 확인 수준: 실제 Chrome에서 재현.
- 영향: build의 세 줄 또는 test의 체크가 원래 800ms 수명 이후에도 남는다. 같은 도구를 다시 누르거나 방을 떠나야 사라진다.

재현:

1. 공방에서 모션을 Play로 켠다.
2. build와 test를 800ms 이내에 연속 활성화한다. 이번에는 각 버튼에 Space를 빠르게 전달해 재현했다.
3. 1초 이상 기다린다.

이번 관찰 결과: test 효과는 사라졌지만 build 장식 1개와 그 안의 세 줄이 모두 `opacity: 1`로 남았다. 화면에서도 build 버튼 옆 세 줄이 유지됐다.

원인: 모든 도구가 하나의 `toolGate`를 공유한다. 두 번째 도구가 첫 번째 도구의 토큰을 무효화하지만, 첫 번째 장식은 제거하지 않는다. 첫 번째 장식의 유일한 제거 타이머는 토큰 검사에서 건너뛴다.

최소 수정 방향: 타이머가 자신이 생성한 `fx` 노드만 제거하면 새 장식을 지울 위험이 없다. 이 제거에 전역 최신 토큰이 필요한지 재검토한다. 동시에 한 효과만 허용하려면 새 입력에서 이전 효과를 실제 제거하도록 처리한다. 불필요한 per-tool 관리 계층을 먼저 추가하지 않는다.

재검수 조건: build→test, test→build, 같은 도구 연타, 정지 상태의 교차 입력 모두에서 각 반응 종료 후 장식이 남지 않는다. 방 이탈·정지도 기존처럼 정리된다.

## 3. [P2] 수동 Pause가 CSS 장식 모션 전체에 적용되지 않는다

- 위치: `assets/college.js:377–389`, `assets/college.css:11`, `assets/college.css:17`, `assets/college.css:63–64`.
- 확인 수준: 코드와 CSS 적용 경로 분석. OS `no-preference` 조건의 실제 브라우저 재현은 이번 후속 검수에서 실행하지 않았다.
- 영향: OS가 모션을 허용하는 환경에서는 사이트에서 Pause를 눌러도 대화창 등장과 책 펼침 등 장식 이동이 새로 시작한다. 전역 정지라는 UI·명세의 약속과 다르다.

확인할 재현 절차:

1. OS 또는 브라우저의 `prefers-reduced-motion`이 `no-preference`인 환경에서 연다.
2. 사이트의 Pause를 누른다.
3. 캐릭터 대화창 또는 프로젝트 책을 연다.
4. 창과 책의 이동·확대가 발생하는지 확인한다.

원인: JS는 페이지 leaf와 전환·도구 효과를 정리하고 `html.motion-paused`를 붙인다. CSS의 정지 규칙은 날씨·촛불·먼지·룬 등 일부 대상만 다룬다. `dialog[open]`의 220ms `arrive`와 `.book-spread`의 520ms `open-book`은 수동 정지 시 해제되지 않는다. 기존 hover/focus 이동 transition도 같은 누락을 점검해야 한다. OS reduce의 전역 `animation:none!important; transition:none!important`가 이 결함을 가릴 수 있다.

최소 수정 방향: 기존 CSS/JS 효과가 동일한 전역 정책을 따르도록 정지 선택자와 실행 조건을 연결한다. 정지 시 콘텐츠를 숨기거나 기본 배치 transform을 제거하지 않는다. `animation-play-state:paused`만으로 등장 모션을 중간 프레임에 멈추는 방식도 피한다.

재검수 조건: OS reduce/no-preference × 사이트 Play/Pause 조합에서 책·대화·페이지 넘김·도구·룬·환경을 확인한다. Pause에서는 내용과 선택 피드백이 즉시 표시되고 장식 이동은 시작하지 않는다. 명시적 Play 허용 범위도 일관돼야 한다.

## 4. [P3] 입구 선택 시 강화되는 조명이 실제로 적용되지 않는다

- 위치: `assets/college.css:22–23`, `assets/college.css:35`.
- 확인 수준: 실제 Chrome에서 키보드 focus-visible과 계산 스타일로 확인.
- 영향: 입구 버튼 선택에 반응하는 온기 강화가 보이지 않는다. 기본 조명 호흡만 지속된다.

재현: 모션을 Play로 켠 입구에서 `Enter the studio`에 키보드 포커스를 준다. `:has(.primary-action:is(:hover,:focus-visible))`가 일치하는지와 `.hearth-glow`의 계산 스타일을 확인한다.

이번 관찰:

```json
{
  "focus": true,
  "selectorMatches": true,
  "motion": "motion-opt-in",
  "glow": {
    "animation": "hearth-breath",
    "opacity": "0.671717",
    "transform": "matrix(1.01149, 0, 0, 1.01149, 0, 0)"
  }
}
```

원인: 선택 규칙은 `opacity:.95; transform:scale(1.1)`을 지정하지만, 실행 중인 `hearth-breath`가 같은 두 속성을 계속 제어한다. 일반 선택 규칙이 애니메이션 값에 가려진다.

최소 수정 방향: 선택 시 기존 호흡을 해제하고 정적 강조를 적용하거나, 키프레임이 참조하는 값에 선택 상태를 반영한다. 작은 반응 하나를 위해 새 애니메이션 시스템을 추가할 필요는 없다.

재검수 조건: 마우스 hover와 키보드 focus 모두에서 선택에 따른 차이가 보이고, 선택 해제 후 기본 조명으로 돌아온다. Pause 상태의 정책도 함께 지킨다.

## 검증 결과와 범위

이어서 진행한 전체 검수에서 `check.mjs`, `book-check.mjs`, `motion-check.mjs`, `sound-check.mjs`는 PASS였다. `college.js`, `book.js`, `sound.js` 문법 검사와 `git diff --check`도 통과했다. 기존 WAV 4개는 현재 존재하며, 초기 인계 때의 WAV 누락은 현재 실패 사유가 아니다.

그러나 `scripts/motion-check.mjs`는 요청 카운터·불리언·인덱스 같은 보조함수만 검사한다. 실제 `updateArt()`, `playTool()`, CSS 정지 경로를 실행하지 않는다. 출력의 “stale room/art requests lose”를 실제 화면 전환 검증으로 해석하면 안 된다. 발견한 경계 조건을 검사에 포함해야 한다.

이번 후속 실브라우저 확인은 로컬 HTTP `http://127.0.0.1:8765`, Chrome, 영어 UI, 375/768/1280px 폭에서 위 재현에 집중했다. 도구 잔류와 잘못된 배경의 화면 캡처, DOM 값, 입구 조명 계산 스타일은 검수 대화의 도구 결과에 있다. 별도 저장된 캡처 파일은 주장하지 않는다. 기존 `.omo/evidence/motion-juice/`와 `docs/VALIDATION.md`는 Grok의 기록이며, 이번 독립 재현과 구분한다.

이번 후속 단계에서 전체 15개 방/폭 조합, 모든 책 페이지, 실제 청음, FPS 계측, 스크린리더, OS 설정 UI 변경을 새로 완료했다고 주장하지 않는다. 위 오류가 있어 전체 완료 승인은 보류한다.

테마 면에서는 작은 국소 조명·서고 먼지·도구별 반응이 기존 북방 판타지 스튜디오와 어울린다. 새 의존성 없이 CSS/브라우저 기능으로 구현한 방향도 적절하다. 우선 효과를 더 늘리기보다 현재 효과의 종료·정지·선택 반응을 완성하면 된다.

검수한 소스 SHA-256:

```text
assets/college.js  b1d57ff2540062a3f105cc04c5d7b1fb4efbdc826ccf6ac0f414706fd0df8953
assets/college.css eae59f54b603be01b1f077c13a958c244c2fdf18640032db08fd9144aac264a1
assets/book.js     f66b963f367db0810d14114ecb1673227ac83e94d2f9b8e93993bb1e6d74884b
```

## Grok에 전달할 수정 요청

```text
현재 모션 구현의 독립 검수에서 수정 항목 4개가 나왔어.
docs/GROK-MOTION-REVIEW.md를 읽고, 원래 docs/GROK-MOTION-IMPLEMENTATION-HANDOFF.md의 모션 정책과 함께 반영해줘.

우선순위는 (1) 방 전환 중 700px 경계 통과 시 이전 배경 잔류,
(2) build/test 교차 입력 후 이전 효과 잔류,
(3) OS no-preference에서 수동 Pause의 CSS 모션 누락,
(4) 입구 선택 조명이 기존 호흡 애니메이션에 가려지는 문제야.

원인을 공통 처리 지점에서 최소 변경으로 고치고, 이 네 조건을 실제 브라우저에서 확인해줘.
motion-check의 토큰 검사만 통과시키지 말고 실제 전환·효과 정리·정지 결과를 검증해줘.
기존 사용자 변경, 테마, 콘텐츠, 링크, 한영 전환, 읽기 위치를 보존해줘.
현재 WAV 네 개는 복원되어 있으니 예전 누락 설명을 현재 상태로 재사용하지 마.

새 효과나 라이브러리를 추가하지 말고, 수정 파일과 실제 검사 결과 및 남은 미검증 범위를 보고해줘.
커밋·푸시·배포는 하지 마.
```
