# Step 8: landing-page

## 읽어야 할 파일

- `/docs/UI_GUIDE.md` — 전체
- `/docs/PRD.md` — 목표, UC1(첫 방문자)
- step0 `src/app/page.tsx`(플레이스홀더), step3 인증 경로(`getUser`, `/login`, `/dashboard`)

## 작업

랜딩 페이지를 본 구현으로 교체한다. `src/app/page.tsx`.

- 섹션 구성: 히어로(한 줄 가치제안, 예: "명세서 CSV를 던지면 어디에 얼마 썼는지 보여드립니다") + **프라이버시 약속**("원본 CSV는 저장하지 않고 분석 직후 폐기, 집계만 보관") + **샘플 체험** + 핵심기능 3~4개 + 요금(Free/Pro) + CTA + 푸터.
- **샘플 체험(로그아웃 공개·비용 0)**: 미리 구워둔 결과(`src/lib/sample-analysis.ts` 등 정적 `AnalysisResult` 픽스처)를 step7의 실제 결과 컴포넌트로 렌더한다 — 스크린샷·"Lorem ipsum"·빈 차트 금지(UI_GUIDE 슬롭). API 호출·로그인 없이 "내가 받을 화면"을 1:1로 보여 전환. 다운로드용 **샘플 CSV**(`public/sample-statement.csv`, 한글 가맹점 포함)도 제공해 가입 직후 빈 대시보드에서 바로 시도하게 한다.
- **요금표**: Free / Pro **₩9,900/월** 2칸. Pro 가치는 구독탐지·드릴다운·구체팁·추이(이력)로 표기.
- **CTA "시작하기"**: 로그인 상태면 `/dashboard`, 아니면 `/login`으로 (getUser로 분기).
- **푸터**: 이용약관·개인정보처리방침 링크(MVP placeholder 페이지라도 존재).
- 다크 미니멀, 좌측 정렬 기본. `/docs/UI_GUIDE.md`를 엄수한다.

## Acceptance Criteria

```bash
npm run build
npm test
```

CTA 링크가 인증 상태에 따라 `/dashboard` 또는 `/login`을 가리키는지, **샘플 체험이 정적 결과로 렌더되는지**(API 호출 없이), 푸터의 약관·개인정보 링크와 ₩9,900 가격 표기가 존재하는지 테스트한다.

## 검증 절차

1. AC 커맨드를 실행한다.
2. 체크리스트:
   - CTA가 대시보드로 연결되는가? 샘플 체험이 로그아웃 상태에서 실제 컴포넌트로 보이는가(API 호출·로그인 없이)?
   - 프라이버시 약속·₩9,900 요금표·약관/개인정보 푸터 링크·샘플 CSV 다운로드가 있는가?
   - UI_GUIDE 안티패턴 위반이 없는가? 마케팅 과장/슬롭 없는 "도구" 톤인가?
3. `phases/0-mvp/index.json`의 step 8을 업데이트한다.

## 금지사항

- gradient-text, gradient orb, glassmorphism, 보라/인디고를 쓰지 마라. 이유: UI_GUIDE 명시 금지(AI 슬롭).
- "Powered by AI" 류 배지를 넣지 마라. 이유: 장식일 뿐 사용자 가치가 없다.
- 기존 테스트를 깨뜨리지 마라.
