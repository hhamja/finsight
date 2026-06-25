# Step 5: claude-analysis

## 읽어야 할 파일

- `/docs/ADR.md` — ADR-004(자동 매핑), ADR-006(tool-use)
- `/docs/PRD.md` — 산출물 4종, Free/Pro 게이팅
- `/CLAUDE.md` — services/에서만 외부 API, 비밀키 서버 전용
- step1 산출물: `src/types/`, `src/types/schema.ts`; step4 산출물: `src/lib/csv.ts`(`RawRow`)

## 작업

Claude로 거래를 분석하는 services 래퍼를 만든다. 패키지: `@anthropic-ai/sdk`.

- `src/services/claude.ts`:
  - `analyzeTransactions(rows: RawRow[], tier: Tier): Promise<AnalysisResult>`
  - 모델: `claude-opus-4-8`(Opus 4.8)을 기본값으로 하고 상수(`MODEL`)로 분리해 교체 가능하게 한다. (분석 품질 최우선)
  - **tool-use**로 출력 스키마를 강제한다(step1 zod 스키마와 일치하는 JSON tool input). 응답을 `AnalysisResultSchema.parse()`로 검증한 뒤 반환한다.
  - 프롬프트가 해야 할 일: 임의 컬럼에서 날짜/금액/가맹점 추론 → 카테고리 분류(한국어: 식비, 교통, 구독, 쇼핑, 공과금 등) → 합계/비율 계산 → (pro면) 월별 추이·이상/중복/구독누수 탐지·절약 제안. 통화 추론.
  - `tier === "free"`이면 `trend`, `anomalies`, `savingTips`를 빈 배열로 둔다(프롬프트에서 생략 또는 호출 후 제거). free는 categories + summary 중심.
  - API 키는 `process.env.ANTHROPIC_API_KEY`(서버 전용). 키가 없으면 명확한 에러를 던진다.

## Acceptance Criteria

```bash
npm run build
npm test
```

SDK를 **모킹한** 단위테스트를 추가하라: 모킹된 tool-use 응답 → `AnalysisResult` 반환/검증, free tier 필터링 확인. (실제 API 호출 없음)

## 검증 절차

1. AC 커맨드를 실행한다(모킹 테스트 통과).
2. 체크리스트:
   - 출력이 zod로 검증되는가?
   - free/pro 분기가 있는가?
   - 키가 서버 전용이며 파일이 `src/services/` 안에 있는가?
3. `phases/0-mvp/index.json`의 step 5를 업데이트한다. `ANTHROPIC_API_KEY`가 없어도 테스트는 모킹으로 통과해야 하므로 build/test가 키 때문에 막혀선 안 된다. 실제 연동 확인은 step6/배포에서 한다.

## 금지사항

- 자유 텍스트 응답을 정규식으로 파싱하지 마라. 이유: ADR-006 — tool-use로 스키마를 강제한다.
- 이 모듈이 클라이언트 컴포넌트에서 import되게 만들지 마라(브라우저 번들에 키/SDK 노출 금지). 이유: CLAUDE.md CRITICAL.
- 단위테스트에서 실제 Anthropic API를 호출하지 마라. 이유: 비용·비결정성·CI 불가.
- 기존 테스트를 깨뜨리지 마라.
