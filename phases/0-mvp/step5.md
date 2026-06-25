# Step 5: claude-analysis

## 읽어야 할 파일

- `/docs/ADR.md` — ADR-004(자동 매핑), ADR-006(tool-use)
- `/docs/PRD.md` — 산출물 4종, Free/Pro 게이팅
- `/CLAUDE.md` — services/에서만 외부 API, 비밀키 서버 전용
- step1 산출물: `src/types/`, `src/types/schema.ts`; step4 산출물: `src/lib/csv.ts`(`RawRow`)

## 작업

Claude로 거래를 분석하는 services 래퍼를 만든다. 패키지: `@anthropic-ai/sdk`.

- `src/services/claude.ts`:
  - `classifyTransactions(rows: RawRow[], opts: { model: string }): Promise<Classification>` — **라벨링만** 반환한다(거래별 카테고리·정규화 가맹점 `labeled[]` + `mapping` + `confidence` + `summary` + `savingTips`). **숫자 집계(합계·비율·추이·이상탐지)는 여기서 하지 않는다** — `lib/aggregate`(step6)의 책임이다. tier로 분기하지 않는다.
  - 모델 상수: `MODEL_LABELING = "claude-haiku-4-5"`(또는 `claude-sonnet-4-6`), `MODEL_DEEP = "claude-opus-4-8"`. **이 함수는 tier를 모른다** — 어떤 모델을 쓸지는 `opts.model`로 주입받는다(API가 tier로 선택). 모델 티어링(ADR-008).
  - **tool-use**로 출력 스키마를 강제한다(`ClassificationSchema`와 일치하는 JSON tool input). 응답을 `ClassificationSchema.parse()`로 검증한 뒤 반환한다.
  - 프롬프트가 해야 할 일: 임의 컬럼에서 날짜/금액/가맹점 추론(→ `mapping`·`confidence` 보고) → 거래별 카테고리 분류(한국어: 식비, 교통, 구독, 쇼핑, 공과금 등) → 가맹점명 정규화 → 한국어 요약·절약 제안 문장. **합계·비율·추이·% 등 숫자 계산은 하지 마라(코드가 한다).** 통화는 요약/매핑 맥락에서 추론.
  - API 키는 `process.env.ANTHROPIC_API_KEY`(서버 전용). 키가 없으면 명확한 에러를 던진다.

## Acceptance Criteria

```bash
npm run build
npm test
```

SDK를 **모킹한** 단위테스트를 추가하라: 모킹된 tool-use 응답 → `Classification` 반환 + zod 검증. **모킹 응답은 `ClassificationSchema`에서 생성**(손으로 짠 모크 금지 — 스키마가 유일한 계약, 드리프트 차단). (실제 API 호출 없음. 집계·tier 게이팅은 step6에서 테스트)

## 검증 절차

1. AC 커맨드를 실행한다(모킹 테스트 통과).
2. 체크리스트:
   - 출력이 `ClassificationSchema`로 검증되는가?
   - **라벨링만** 반환하고 합계·추이 등 숫자 계산이 없는가? 모델을 `opts.model`로 주입받아 tier를 모르는가?
   - 키가 서버 전용이며 파일이 `src/services/` 안에 있는가?
3. `phases/0-mvp/index.json`의 step 5를 업데이트한다. `ANTHROPIC_API_KEY`가 없어도 테스트는 모킹으로 통과해야 하므로 build/test가 키 때문에 막혀선 안 된다. 실제 연동 확인은 step6/배포에서 한다.

## 금지사항

- 자유 텍스트 응답을 정규식으로 파싱하지 마라. 이유: ADR-006 — tool-use로 스키마를 강제한다.
- 합계·비율·추이·% 등 숫자를 LLM이 계산해 반환하게 하지 마라. 이유: ADR-007 — 산술은 코드(`lib/aggregate`)가 한다(재현성·정확성).
- 이 함수가 모델명을 tier로 분기해 내부에서 정하지 마라. 이유: tier 책임은 API에 있고, 래퍼는 `opts.model` 주입만 받는다(경계 단순).
- 이 모듈이 클라이언트 컴포넌트에서 import되게 만들지 마라(브라우저 번들에 키/SDK 노출 금지). 이유: CLAUDE.md CRITICAL.
- 단위테스트에서 실제 Anthropic API를 호출하지 마라. 이유: 비용·비결정성·CI 불가.
- 기존 테스트를 깨뜨리지 마라.
