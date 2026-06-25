# Step 6: analyze-api

## 읽어야 할 파일

- `/docs/ARCHITECTURE.md` — 데이터 흐름(전체 오케스트레이션)
- `/CLAUDE.md` — 외부 API 경계, 원본 미저장, 게이팅
- step1 `src/types/`, step2 `src/lib/supabase/*`, step3 `src/lib/auth.ts`, step4 `src/lib/csv.ts`, step5 `src/services/claude.ts`

이전 step들의 시그니처를 그대로 재사용하라. 새로 fetch로 외부 API를 부르지 마라.

## 작업

업로드 → 분석 → 저장을 오케스트레이션하는 API 라우트.

- `src/app/api/analyze/route.ts` (POST, multipart/form-data):
  1. `getUser()`로 세션 검증. 없으면 401.
  2. `profiles.tier` 조회.
  3. formData에서 파일 추출 → `parseCsv()` (메모리).
  4. `analyzeTransactions(rows, tier)`.
  5. 결과를 Supabase `analyses`에 insert(`user_id`, `result`, `transaction_count`, `source_filename`(파일명만), `period_label`). **원본 행은 저장하지 않는다.**
  6. tier에 맞게 필터링된 `AnalysisResult`를 JSON으로 반환. free면 `trend`/`anomalies`/`savingTips`를 비운다.
  - 파일 크기 상한·CSV MIME 검증. 에러는 적절한 status code.
- 이력 조회: `src/app/api/analyses/route.ts`(GET, 본인 것 목록) 또는 대시보드 Server Component에서 직접 쿼리 — 더 간단한 쪽 하나만 택한다.

## Acceptance Criteria

```bash
npm run build
npm test
```

route 핸들러 통합테스트(인증/파싱/분석/저장을 모킹): 미인증 401, 정상 흐름 200 + 결과, free 게이팅 확인.

## 검증 절차

1. AC 커맨드를 실행한다.
2. 체크리스트:
   - 미인증 요청을 차단하는가?
   - insert payload에 원본 행(rows)이 없는가(원본 미저장)?
   - free/pro 필터링이 적용되는가?
   - 외부 호출이 step2/4/5 래퍼를 경유하는가?
3. `phases/0-mvp/index.json`의 step 6을 업데이트한다. Supabase/Anthropic 키 부재로 end-to-end 검증이 막히면 모킹으로 단위검증하고, build/test가 키 때문에 깨지면 `"blocked"` 처리.

## 금지사항

- route에서 Claude/Supabase를 직접 fetch로 호출하지 말고 step5/step2 래퍼를 재사용하라. 이유: 모듈 경계·재사용.
- insert payload에 거래 원문(rows)을 넣지 마라. 이유: 원본 미저장 CRITICAL.
- free 사용자에게 pro 데이터를 반환하지 마라. 이유: 과금 게이팅이 무력화된다.
- 기존 테스트를 깨뜨리지 마라.
