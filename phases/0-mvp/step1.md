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
- `Category { name: string; total: number; count: number; pct: number }`
- `TrendPoint { period: string /* "YYYY-MM" */; total: number }`
- `Anomaly { kind: "large" | "duplicate" | "subscription_leak"; title: string; description: string; amount: number; date: string; merchant?: string }`
- `AnalysisResult { currency: string; period: { start: string; end: string }; totalSpend: number; categories: Category[]; trend: TrendPoint[]; anomalies: Anomaly[]; summary: string; savingTips: string[] }`

각 타입에 대응하는 zod 스키마를 `src/types/schema.ts`에 둔다(`AnalysisResultSchema` 등). 이 스키마는 step5(Claude 출력 검증)와 step6(API 검증)에서 재사용된다.

Free/Pro 메모(주석으로 명시): free는 `categories` + `summary`만 채워지고 `trend`/`anomalies`/`savingTips`는 빈 배열일 수 있다.

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
