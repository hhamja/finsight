# Step 8: landing-page

## 읽어야 할 파일

- `/docs/UI_GUIDE.md` — 전체
- `/docs/PRD.md` — 목표, UC1(첫 방문자)
- step0 `src/app/page.tsx`(플레이스홀더), step3 인증 경로(`getUser`, `/login`, `/dashboard`)

## 작업

랜딩 페이지를 본 구현으로 교체한다. `src/app/page.tsx`.

- 섹션 구성: 히어로(한 줄 가치제안, 예: "명세서 CSV를 던지면 어디에 얼마 썼는지 보여드립니다") + 핵심기능 3~4개(카테고리 분류 / 추이 / 이상탐지 / 절약 제안) + 요금(Free/Pro) + CTA.
- **CTA "시작하기"**: 로그인 상태면 `/dashboard`, 아니면 `/login`으로 (getUser로 분기).
- 다크 미니멀, 좌측 정렬 기본. `/docs/UI_GUIDE.md`를 엄수한다.

## Acceptance Criteria

```bash
npm run build
npm test
```

CTA 링크가 인증 상태에 따라 `/dashboard` 또는 `/login`을 가리키는지 테스트한다.

## 검증 절차

1. AC 커맨드를 실행한다.
2. 체크리스트:
   - CTA가 대시보드로 연결되는가?
   - UI_GUIDE 안티패턴 위반이 없는가?
   - 마케팅 과장/슬롭 없는 "도구" 톤인가?
3. `phases/0-mvp/index.json`의 step 8을 업데이트한다.

## 금지사항

- gradient-text, gradient orb, glassmorphism, 보라/인디고를 쓰지 마라. 이유: UI_GUIDE 명시 금지(AI 슬롭).
- "Powered by AI" 류 배지를 넣지 마라. 이유: 장식일 뿐 사용자 가치가 없다.
- 기존 테스트를 깨뜨리지 마라.
