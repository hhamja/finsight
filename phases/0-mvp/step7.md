# Step 7: dashboard-ui

## 읽어야 할 파일

- `/docs/UI_GUIDE.md` — 전체(색·컴포넌트·안티패턴)
- `/docs/PRD.md` — 여정 UC2/UC4/UC5
- `/docs/ARCHITECTURE.md` — 패턴, 상태 관리
- step3 보호 라우트(`requireUser`), step6 `/api/analyze` 응답 형태, step1 `src/types/`

## 작업

대시보드 화면과 컴포넌트. 차트는 `recharts` 사용.

- `src/app/dashboard/page.tsx` (Server Component, `requireUser`): 이력 목록 로드 + 클라이언트 업로드/결과 컴포넌트 호스팅.
- 컴포넌트(`src/components/`):
  - `UploadDropzone` (client): CSV 선택/드래그 → `/api/analyze` POST. 상태: idle / uploading / analyzing / error / **저신뢰(422)**. 업로드 중 버튼 비활성(이중 제출=이중 과금 방지).
  - `MappingBanner` (전 tier 공통): 결과 상단에 "이렇게 읽었어요: 날짜=…, 금액=…, 가맹점=… · 총 N건 · 합계 ₩X"와 confidence 표시. 사용자가 눈으로 검산(ADR-009).
  - `CategoryChart`: 카테고리별 지출(막대 또는 도넛). 금액은 tabular-nums. **pro는 카테고리 펼치면 `topMerchants` 드릴다운**.
  - `TrendChart`: 기간별 추이(라인). **pro 전용**. 이력이 없으면 빈 차트 대신 "다음 명세서를 올리면 여기에 추이가 나타납니다" 기대치 플레이스홀더.
  - `SubscriptionCard` / `AnomalyList`: 구독·정기결제 누수("매달 빠지는 구독 N건, 합계 ₩X")·중복/이중청구·큰 지출 리스트. **pro 전용, Pro 1일차 주인공**(단건만으로 계산되므로 첫 업로드부터 가치).
  - `SummaryCard`: AI 요약(free=총평) + 구체 절약 제안(pro).
  - `HistoryList`: 저장된 분석 카드. 클릭 시 **저장 집계로 결과 재현**(드릴다운은 "재업로드 필요" 안내).
  - `ProLockCard`: free에게 구독탐지/드릴다운/추이 자리에 블러/프리뷰 + "업그레이드" CTA(step9 체크아웃으로 연결).
- 화면 상태를 모두 구현: **빈 상태**(업로드 유도, 샘플 CSV 안내) / **분석 중**(로딩) / **결과**(상단 매핑 배너) / **에러** / **저신뢰(읽기 실패)**.
- `/docs/UI_GUIDE.md`의 색·컴포넌트·안티패턴을 엄수한다.

## Acceptance Criteria

```bash
npm run build
npm test
```

컴포넌트 렌더 테스트(@testing-library/react): `MappingBanner`가 전 tier에서 매핑·합계 노출, free일 때 `ProLockCard` 노출, pro일 때 `SubscriptionCard`/`AnomalyList`/`TrendChart` 렌더(이력 0이면 추이 플레이스홀더), 빈 상태·저신뢰(422) 상태 렌더.

## 검증 절차

1. AC 커맨드를 실행한다.
2. 체크리스트:
   - 화면 상태(빈/분석중/결과/에러/저신뢰)가 존재하는가? 결과 상단에 매핑 요약 배너가 있는가?
   - free/pro 분기 UI가 있는가? 구독탐지가 Pro 1일차 가치로 노출되고, 이력 0일 때 추이는 플레이스홀더인가?
   - UI_GUIDE 안티패턴(보라색·glassmorphism·gradient-text·글로우)을 위반하지 않는가?
   - 차트가 실제 결과 데이터를 그리는가?
3. `phases/0-mvp/index.json`의 step 7을 업데이트한다.

## 금지사항

- 컴포넌트에서 Claude/Supabase를 직접 호출하지 마라. 반드시 `/api/analyze` 등 자체 API를 경유하라. 이유: CLAUDE.md CRITICAL.
- UI_GUIDE 안티패턴(보라/인디고, glassmorphism, gradient-text, 글로우)을 쓰지 마라. 이유: AI 슬롭 회피가 명시 요구사항이다.
- free 사용자 화면에 실제 pro 데이터를 렌더하지 마라(프리뷰/잠금만). 이유: 게이팅.
- 모델 출력(`summary`/`savingTips` 등)을 `dangerouslySetInnerHTML`로 렌더하지 마라. 텍스트로만 렌더하라. 이유: CSV에서 유입된 텍스트가 HTML로 렌더되면 XSS가 된다.
- 기존 테스트를 깨뜨리지 마라.
