---
name: finsight-design
description: FinSight의 다크 UI 디자인 시스템 — 디자인 토큰·컴포넌트 프리미티브·차트·화면 레이아웃 패턴. FinSight 앱의 화면/컴포넌트/스타일을 새로 만들거나 수정할 때, 색·간격·타이포·차트·플랜 게이팅 UI를 정할 때 사용한다.
---

# FinSight 디자인 시스템

FinSight 대시보드의 시각 언어를 정의한다. 새 화면·컴포넌트를 만들거나 기존 UI를 손볼 때 이 문서의 토큰·스펙·패턴을 따른다. 매월 쓰는 **도구**의 톤이지 마케팅 페이지가 아니다 — 차분하고 조밀하고 수치 중심.

원본 프로토타입(React + 인라인 스타일)은 `reference/`에 있다. 실서비스는 **Next.js 15 + TypeScript + Tailwind v4**이므로, 인라인 스타일을 그대로 베끼지 말고 토큰/패턴을 Tailwind 유틸·컴포넌트로 옮긴다. 토큰 정의와 Tailwind v4 매핑은 `tokens.css` 참고.

## 제1원칙 (어기지 말 것)
- **다크 고정.** 라이트 모드 없음. 표면은 `--app`(최하단) → `--panel` → `--panel-2` 순으로 밝아진다.
- **무채색 + 포인트 1색.** 포인트는 그린(`--accent: #3ecf8e`) 하나. **보라/인디고 절대 금지.** 위계는 색이 아니라 명도(`--text`/`--muted`/`--faint`)와 accent의 음영(`color-mix`)으로 만든다.
- **수치는 항상 tabular-nums.** 금액·퍼센트·날짜에 `font-variant-numeric: tabular-nums`(`body`에 `font-feature-settings:"tnum"` 기본). 금액은 `won()`(`₩` + `toLocaleString("ko-KR")`).
- **타이포는 Pretendard.** 제목은 굵게(700~800) + 음수 자간(`-0.02em~-0.035em`).
- **둥근 모서리.** 카드 14, 버튼/입력 9, pill 999, 작은 칩 6~7.
- **장식 금지.** 그림자·글로우 거의 안 씀. 구분은 `1px solid var(--border)`로. 강조는 `--accent-dim` 배경 + `--accent-border` 경계로.

## 디자인 토큰
전체 정의·의미 색상·Tailwind v4 매핑은 `tokens.css`에 있다. 핵심만:

| 용도 | 토큰 |
|---|---|
| 앱 배경 | `--app #0b0c0e` |
| 카드/사이드바 | `--panel #141619` |
| 카드 안 단·입력·바 트랙 | `--panel-2 #1c1f23` |
| 경계선 / hover 경계 | `--border #25282d` / `--border-2 #34383f` |
| 본문·수치 / 보조 / 캡션 | `--text #e9eaec` / `--muted #9aa0a8` / `--faint #6a7078` |
| 포인트 | `--accent #3ecf8e` |
| 포인트 배경 / 포인트 경계 | `--accent-dim` / `--accent-border` (둘 다 `color-mix` 파생) |

의미 색(하드코딩 고정값): danger `#ff8585`(텍스트)·`#ff6b6b`(강조)·bg `#2a1718`·border `#4a2424` / warn `#e6b45c`·bg `#2a2114`·border `#4a3a1c` / accent 위 글자 `#06120c`.
**방향 색**: 지출 *증가*=`#ff8585`(나쁨), *감소*=`--accent`(좋음), 주의=`#e6b45c`.

## 컴포넌트 프리미티브
`reference/components.jsx`가 정본. 스펙:

- **Btn** — kind × size. kind: `primary`(accent 면, 글자 `#06120c`, 700) · `ghost`(panel-2 면 + border, 600) · `subtle`(투명, muted) · `danger`(투명, `#ff6b6b`, border `#3a2422`). size: `sm`(7/12·13) · `md`(10/16·14) · `lg`(14/22·15). radius 9. hover `brightness(1.08)`, active `scale(.97)`. 선택적 leading 아이콘.
- **Card** — `--panel` + `1px var(--border)`, radius 14, 기본 pad 20. `hover`면 경계 `--border-2`로.
- **Pill** — tone: `neutral`/`accent`/`warn`/`danger`. radius 999, 11.5px/700, pad 3/9. 라벨·상태·매핑 역할 배지.
- **Lock** — `<Pill> 자물쇠 + "Pro"`. Pro 잠금 표시 전용.
- **SectionTitle** — `children`(15px/700) + `sub`(12.5 faint) + 우측 `right` 슬롯. 카드 헤더에 항상 사용.
- **Icon** — 1.6 stroke SVG 세트(`upload chart history settings lock check arrowRight/Up/Down alert repeat copy sparkles file trash logout x download eye bolt`). 단색 stroke, `currentColor` 기본.
- **Logo** — accent-dim 라운드 + accent 체크라인 + "FinSight"(800).
- **Field**(auth/paywall) — 라벨(12.5 muted) + input(panel-2, border, radius 9). focus 시 경계 `--accent-border`.
- **Row / DangerRow / ConfirmModal**(settings/paywall) — 리스트 행·위험 행·확인 모달. 모달은 `rgba(0,0,0,.6)` 딤 + `pop` 애니메이션.

## 차트 (직접 SVG, 라이브러리 없음)
`reference/components.jsx`:
- **Donut** — 카테고리 비중. 세그먼트 색은 `color-mix(in oklab, var(--accent) {shade*100}%, var(--panel-2))` — accent 한 색의 명도 변주. 중앙에 총액+라벨.
- **Bars** — 월별 추이. 마지막(이번 달) 막대만 `--accent`, 나머지 `--bar`.
- **Spark** — 일별 흐름. accent 라인 + 하단 그라데이션 면.
- **Confidence** — 신뢰도 막대. 색 임계값: `≥.95` accent · `≥.90` `#e6b45c` · 그 미만 `#ff8585`.

CSV 매핑/신뢰도는 **반드시 화면에 노출**(조용한 오답 금지) — `Confidence` + 역할 `Pill`로. `reference/screens/upload.jsx`의 review 단계가 정본.

## 레이아웃·화면 패턴
- **앱 셸**: 좌측 고정 사이드바 220px(`--panel`, 우측 border) + 본문 스크롤 영역. 사이드바 = 로고 → nav(대시보드/이력/설정) → 하단 "새 명세서" 버튼 + 플랜 카드. landing/auth만 셸 없음.
- **본문 폭**: 대시보드 `maxWidth 1120`, 폼·업로드 `~760`, 설정·결제 `620~880`. 가운데 정렬, pad `28px`.
- **플랜 게이팅(Free→Pro)** — 가장 중요한 패턴. `reference/screens/dashboard.jsx`의 `ProCard`가 정본: Pro 전용 카드는 Free일 때 내용을 `blur(5px)`+`opacity .5`+`pointerEvents:none` 처리하고 중앙에 "Pro로 해제" 버튼 오버레이. 헤더 우측엔 `<Lock/>`. 잠긴 수치(`Stat`)는 값 대신 자물쇠+"Pro에서 해제". 깊이/이력으로 게이팅하지 횟수로 하지 않는다.
- **상태 흐름**: 업로드는 `idle → processing(단계별 체크리스트, pulse) → review(매핑 표)`. 빈 상태·로딩은 단계 텍스트로 안심시키기. 첫 달 추이는 빈 차트 대신 "다음 명세서를 올리면 추이가 나타납니다".
- **개인정보 톤**: "원본 CSV·거래내역 미저장, 집계만 보관"을 업로드·대시보드·설정·푸터에 반복 노출. 삭제는 `danger` + `ConfirmModal` 2단 확인.

화면별 정본:
| 화면 | 파일 | UC |
|---|---|---|
| 랜딩(로그아웃 샘플 미리보기) | `reference/screens/landing.jsx` | UC1 |
| 가입/로그인 | `reference/screens/auth.jsx` | UC1→2 |
| 업로드·매핑 검수 | `reference/screens/upload.jsx` | UC2 |
| 분석 대시보드(Free/Pro) | `reference/screens/dashboard.jsx` | UC2/3/4 |
| 분석 이력·월별 비교 | `reference/screens/history.jsx` | UC5 |
| 설정·데이터 파기 | `reference/screens/settings.jsx` | — |
| Paywall·구독 관리 | `reference/screens/paywall.jsx` | UC3/6 |

## 구현 시 주의
- 인라인 스타일은 프로토타입 한정. 실서비스는 `tokens.css`를 globals.css에 두고 Tailwind v4 `@theme inline`로 매핑해 유틸 클래스로 쓴다. `accent-dim`/`accent-border`는 `color-mix`라 `var(--accent-dim)` 직접 참조.
- `reference/data.jsx`의 집계 함수(`byCategory`/`detectSubscriptions`/`detectDuplicates`/`detectAnomalies`/`dailySeries`)는 **목업이자 결정론적 집계의 형태 명세**다. 실제 구현은 `src/lib/`에서 코드로 계산하고, 그 출력 shape를 이 컴포넌트들이 그대로 받게 한다. LLM에는 숫자를 맡기지 않는다(라벨·요약만).
- `reference/`의 `Tweaks` 패널(`app.jsx` 내)·`tweaks-panel.jsx`는 프로토타입 전용 디자인 토글 도구로, 제품 UI가 아니다(복사 제외됨). 플랜 토글은 실서비스에서 `profiles.tier`로 대체.
- 새 컴포넌트는 위 프리미티브를 조합해 만들고, 새 색·새 radius를 임의로 추가하지 말 것. 필요하면 토큰부터 정의.
