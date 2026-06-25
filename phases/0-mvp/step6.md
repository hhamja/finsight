# Step 6: analyze-api

## 읽어야 할 파일

- `/docs/ARCHITECTURE.md` — 데이터 흐름(전체 오케스트레이션)
- `/CLAUDE.md` — 외부 API 경계, 원본 미저장, 게이팅
- step1 `src/types/`, step2 `src/lib/supabase/*`, step3 `src/lib/auth.ts`, step4 `src/lib/csv.ts`, step5 `src/services/claude.ts`

이전 step들의 시그니처를 그대로 재사용하라. 새로 fetch로 외부 API를 부르지 마라.

## 작업

업로드 → 분석 → 저장을 오케스트레이션하는 API 라우트.

- `src/lib/aggregate.ts`: `computeAnalysis(c: Classification, history: AnalysisResult[]): AnalysisResult` — **결정론적 집계**(외부 호출 없는 순수 함수). `c.labeled[]`로 카테고리 합계·비율·총계·기간 계산, 중복(같은 가맹점·금액 단기 반복)·구독 누수·큰 지출 이상탐지, `history`(과거 저장 집계)로 월별 추이·전월 대비 계산. `c.mapping`/`confidence`/`summary`/`savingTips`는 그대로 옮긴다. **모든 숫자는 여기서만 계산**(ADR-007).
- `src/app/api/analyze/route.ts` (POST, multipart/form-data):
  1. `getUser()`로 세션 검증. 없으면 401.
  2. `profiles`에서 tier + Free 일일 카운터(`free_analyses_date`/`count`) 조회. **tier==="free"이고 오늘 분석 수가 상한(예: 3) 초과면 429**(친화적 메시지, Claude 호출 안 함).
  3. formData에서 파일 추출 → `parseCsv()` (메모리, EUC-KR 폴백 포함).
  4. **모델 선택(여기서 tier로)**: `tier==="pro" ? MODEL_DEEP : MODEL_LABELING` → `classifyTransactions(rows, { model })`로 **라벨링만** 받는다.
  5. `computeAnalysis(classification, history)`로 집계해 `AnalysisResult` 생성. **confidence 게이트**: `confidence==="low"`이거나 `totalSpend`가 비정상(≤0)이면 저장·과금 없이 **422 + "이 파일을 자신 있게 읽지 못했어요"**(원문 노출 X).
  6. **집계만** Supabase `analyses`에 insert(`user_id`, `result`=AnalysisResult, `transaction_count`, `source_filename`(파일명만), `period_label`). **거래 단위·원본 행 저장 금지.** Free면 일일 카운터를 service-role로 증가(날짜 바뀌면 리셋).
  7. tier에 맞게 필터링된 `AnalysisResult`를 JSON으로 반환. free면 `trend`/`anomalies`/`savingTips`를 비우고 `categories[].topMerchants`(드릴다운)도 제거하며, `mapping`/`confidence`/`categories`(상위)/`summary`는 유지. (free 응답에 pro 데이터가 새지 않게)
  - **업로드 가드(Claude 호출 전):** 파일 크기 상한(예: 2MB)·CSV MIME 검증·행 수(step4 `MAX_ROWS`) 초과 → 400. 에러는 적절한 status code(스택 노출 X).
  - **게이팅은 여기 한 곳에서만:** DB에는 전체 결과를 저장하되(업그레이드 시 재분석 불필요) 응답만 필터링한다.
- 이력 조회: `src/app/api/analyses/route.ts`(GET, 본인 것 목록) 또는 대시보드 Server Component에서 직접 쿼리 — 더 간단한 쪽 하나만 택한다. 추이는 저장된 과거 집계를 가로질러 계산.

## Acceptance Criteria

```bash
npm run build
npm test
```

route 핸들러 통합테스트(인증/파싱/분석/저장을 모킹): 미인증 401, 정상 흐름 200 + 결과, free 게이팅 확인, **confidence=low → 422**, **free 일일 캡 초과 → 429**. 추가로 `lib/aggregate`의 **순수 단위테스트**: 고정 `Classification` 입력 → 카테고리 합계·중복 탐지가 결정론적으로 정확한지(같은 입력 = 같은 숫자).

## 검증 절차

1. AC 커맨드를 실행한다.
2. 체크리스트:
   - 미인증 요청을 차단하는가?
   - insert payload에 거래 단위 리스트가 없는가(집계만 저장)?
   - 숫자 집계가 `lib/aggregate`(코드)에서 나오는가(LLM이 아님)? confidence 게이트(422)·free 일일 캡(429)이 동작하는가?
   - 모델이 tier로 선택돼 `classifyTransactions`에 주입되는가? free/pro 응답 필터링이 적용되는가?
   - 외부 호출이 step2/4/5 래퍼를 경유하는가?
3. `phases/0-mvp/index.json`의 step 6을 업데이트한다. Supabase/Anthropic 키 부재로 end-to-end 검증이 막히면 모킹으로 단위검증하고, build/test가 키 때문에 깨지면 `"blocked"` 처리.

## 금지사항

- route에서 Claude/Supabase를 직접 fetch로 호출하지 말고 step5/step2 래퍼를 재사용하라. 이유: 모듈 경계·재사용.
- 집계·이상탐지 산술을 route 핸들러에 인라인으로 흩뿌리지 말고 `lib/aggregate`(순수 함수)로 분리하라. 이유: 결정론적 단위테스트와 재현성(ADR-007).
- low confidence/비정상 합계인데 분석을 강행해 저장·과금하지 마라. 이유: 조용한 오답 방지(ADR-009).
- insert payload에 거래 원문(rows)을 넣지 마라. 이유: 원본 미저장 CRITICAL.
- free 사용자에게 pro 데이터를 반환하지 마라. 이유: 과금 게이팅이 무력화된다.
- 거래 원문·파싱된 행을 로그·에러 응답에 남기지 마라. 이유: 원본 미저장 CRITICAL(로그도 저장이다).
- Supabase 저장 실패 시 500으로 끝내지 말고 분석 결과는 사용자에게 반환하라(저장 실패는 별도 로깅). 이유: 이미 Claude 비용이 발생했고 결과 자체는 유효하다.
- 기존 테스트를 깨뜨리지 마라.
