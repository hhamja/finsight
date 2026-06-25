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
  - `UploadDropzone` (client): CSV 선택/드래그 → `/api/analyze` POST. 상태: idle / uploading / analyzing / error.
  - `CategoryChart`: 카테고리별 지출(막대 또는 도넛). 금액은 tabular-nums.
  - `TrendChart`: 기간별 추이(라인). **pro 전용**.
  - `AnomalyList`: 이상·중복·구독누수 리스트. **pro 전용**.
  - `SummaryCard`: AI 요약(free) + 절약 제안(pro).
  - `HistoryList`: 저장된 분석 카드. 클릭 시 해당 결과 표시.
  - `ProLockCard`: free에게 추이/이상탐지 자리에 블러/프리뷰 + "업그레이드" CTA(step9 체크아웃으로 연결).
- 화면 상태를 모두 구현: **빈 상태**(업로드 유도) / **분석 중**(로딩) / **결과** / **에러**.
- `/docs/UI_GUIDE.md`의 색·컴포넌트·안티패턴을 엄수한다.

## Acceptance Criteria

```bash
npm run build
npm test
```

컴포넌트 렌더 테스트(@testing-library/react): free일 때 `ProLockCard` 노출, pro일 때 `TrendChart`/`AnomalyList` 렌더, 빈 상태 렌더.

## 검증 절차

1. AC 커맨드를 실행한다.
2. 체크리스트:
   - 4가지 화면 상태(빈/분석중/결과/에러)가 존재하는가?
   - free/pro 분기 UI가 있는가?
   - UI_GUIDE 안티패턴(보라색·glassmorphism·gradient-text·글로우)을 위반하지 않는가?
   - 차트가 실제 결과 데이터를 그리는가?
3. `phases/0-mvp/index.json`의 step 7을 업데이트한다.

## 금지사항

- 컴포넌트에서 Claude/Supabase를 직접 호출하지 마라. 반드시 `/api/analyze` 등 자체 API를 경유하라. 이유: CLAUDE.md CRITICAL.
- UI_GUIDE 안티패턴(보라/인디고, glassmorphism, gradient-text, 글로우)을 쓰지 마라. 이유: AI 슬롭 회피가 명시 요구사항이다.
- free 사용자 화면에 실제 pro 데이터를 렌더하지 마라(프리뷰/잠금만). 이유: 게이팅.
- 기존 테스트를 깨뜨리지 마라.
