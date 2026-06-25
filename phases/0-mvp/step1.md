# Step 1: core-types

## 읽어야 할 파일

- `/docs/ARCHITECTURE.md` — `src/types/` 위치
- `/docs/PRD.md` — 산출물 4종, Free/Pro 정의
- `/docs/ADR.md` — ADR-006(tool-use 구조화 출력)
- step0 산출물: `src/types/`, `tsconfig.json`, `vitest.config.ts`, `package.json`

이전 step에서 만들어진 골격을 읽고 일관성을 유지하라.

## 작업

`src/types/`에 도메인 타입과 zod 스키마를 정의한다. 외부 패키지는 `zod`만 추가한다.

정의할 타입(시그니처 수준, 내부 표현은 재량):

- `Tier = "free" | "pro"`
- `Transaction { date: string /* ISO */; amount: number; merchant: string; raw?: Record<string,string> }`
  - amount 부호 규약: **지출은 양수, 환불/입금은 음수**. (주석으로 명시)
- `Category { name: string; total: number; count: number; pct: number; topMerchants?: { name: string; total: number; count: number }[] }` — `topMerchants`는 카테고리 내 상위 가맹점(Pro 드릴다운용 **집계**, 거래 단위 리스트 아님).
- `TrendPoint { period: string /* "YYYY-MM" */; total: number }`
- `Anomaly { kind: "large" | "duplicate" | "subscription_leak"; title: string; description: string; amount: number; date: string; merchant?: string }`
- `ColumnMapping { date: string; amount: string; merchant: string }` — Claude가 어느 CSV 헤더를 각 의미로 읽었는지.
- `Confidence = "low" | "medium" | "high"`
- `LabeledTransaction { date: string; amount: number; merchant: string; category: string }` — **services/claude 라벨링 출력의 거래 단위(메모리 전용, 절대 저장 안 함)**. 지출 양수/환불 음수 규약.
- `Classification { mapping: ColumnMapping; confidence: Confidence; labeled: LabeledTransaction[]; summary: string; savingTips: string[] }` — **step5 `services/claude`의 반환 타입**. 숫자 집계는 들어있지 않다(라벨·요약·매핑만).
- `AnalysisResult { currency: string; period: { start: string; end: string }; totalSpend: number; categories: Category[]; trend: TrendPoint[]; anomalies: Anomaly[]; summary: string; savingTips: string[]; mapping: ColumnMapping; confidence: Confidence }` — **step6 `lib/aggregate`의 출력이자 DB 저장본**. 집계 + 매핑/신뢰도만(거래 단위 리스트 없음).

각 타입에 대응하는 zod 스키마를 `src/types/schema.ts`에 둔다(`ClassificationSchema`, `AnalysisResultSchema` 등). **이 스키마가 유일한 계약**이다 — `ClassificationSchema`는 step5에서 Claude tool-use 출력을 검증하고 모킹 테스트도 이 스키마로 생성하며(손으로 짠 모크 금지, 드리프트 차단), `AnalysisResultSchema`는 step6 집계 출력·API 응답을 검증한다.

설계 메모(주석으로 명시):
- **역할 분리(ADR-007)**: `Classification`(LLM 라벨링) → `AnalysisResult`(코드 집계). 합계·추이·중복/구독 탐지는 `lib/aggregate`가 계산하며 이 타입엔 LLM이 계산한 숫자가 없다.
- **Free/Pro 게이팅**: free는 `categories`(상위) + `summary` + `mapping`/`confidence`만 채워 반환하고 `trend`/`anomalies`/`savingTips`는 빈 배열로 필터(게이팅은 step6 한 곳). 저장본은 항상 전체.

## Acceptance Criteria

```bash
npm run build
npm test
```

`src/types/__tests__/schema.test.ts`에 zod round-trip 테스트를 추가하라: 유효 객체 parse 성공, 잘못된 객체 parse 실패.

## 검증 절차

1. AC 커맨드를 실행한다.
2. 체크리스트:
   - 타입이 `src/types/`에 모여 있는가?
   - 외부 의존이 `zod`뿐인가?
   - `AnalysisResult`가 PRD의 산출물 4종(카테고리/추이/이상탐지/요약·절약)을 모두 표현하는가?
3. `phases/0-mvp/index.json`의 step 1을 업데이트한다.

## 금지사항

- 여기서 Claude/Supabase/네트워크 코드를 작성하지 마라. 이유: 이 step은 순수 타입·스키마 레이어다.
- 타입을 컴포넌트/서비스 파일에 흩뿌리지 마라. 이유: 재사용을 위해 `src/types/`에 집중해야 한다.
- 기존 테스트를 깨뜨리지 마라.
