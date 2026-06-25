# Step 2: supabase-setup

## 읽어야 할 파일

- `/docs/ARCHITECTURE.md` — 데이터 흐름, 보안·프라이버시
- `/docs/ADR.md` — ADR-002(Supabase), ADR-005(결과만 저장)
- `/CLAUDE.md` — RLS·비밀키 CRITICAL 규칙
- step1 산출물: `src/types/`, `src/types/schema.ts` (`analyses.result`의 형태)

## 작업

Supabase 클라이언트와 DB 스키마(마이그레이션)를 만든다. 패키지: `@supabase/supabase-js`, `@supabase/ssr`.

1. 클라이언트 래퍼:
   - `src/lib/supabase/server.ts` → `createClient()` (쿠키 기반, Server Component/route handler용, `@supabase/ssr`)
   - `src/lib/supabase/client.ts` → `createBrowserClient()` (Client Component용, anon key)
   - service-role 클라이언트는 별도 함수로 서버에서만 사용(`SUPABASE_SERVICE_ROLE_KEY`). 클라이언트 번들에 포함 금지.
2. 마이그레이션 SQL `supabase/migrations/0001_init.sql`:
   - `profiles`: `id uuid primary key references auth.users`, `tier text not null default 'free'`, `polar_customer_id text`, `polar_subscription_id text`, `current_period_end timestamptz`, `created_at timestamptz default now()`
   - `analyses`: `id uuid primary key default gen_random_uuid()`, `user_id uuid not null references auth.users`, `created_at timestamptz default now()`, `period_label text`, `source_filename text`, `transaction_count int`, `result jsonb not null` (step1 `AnalysisResult` 형태)
   - 두 테이블 **RLS enable**. policy: 본인 행만 select/insert/update (`auth.uid() = id` / `auth.uid() = user_id`).
   - 신규 가입 시 `profiles` 자동 생성 트리거(`on auth.users` insert) 권장.
3. step1 타입을 재사용해 `analyses.result`가 `AnalysisResult`임을 타입으로 연결한다.

## Acceptance Criteria

```bash
npm run build
npm test
```

마이그레이션 SQL 파일 존재와 RLS/policy 구문 포함을 확인하는 테스트(또는 클라이언트 팩토리 단위테스트)를 추가하라.

## 검증 절차

1. AC 커맨드를 실행한다.
2. 체크리스트:
   - 두 테이블 모두 RLS가 켜졌는가?
   - service-role 키가 클라이언트 경로(`client.ts`)에 노출되지 않는가?
   - 원본 CSV/거래 원문을 담는 컬럼·테이블이 없는가(결과만 저장)?
3. `phases/0-mvp/index.json`의 step 2를 업데이트한다.
   - Supabase 프로젝트 URL/키가 없어 빌드·검증이 막히면 `"blocked"` + `blocked_reason: "Supabase 프로젝트 생성 및 env 키(NEXT_PUBLIC_SUPABASE_URL/ANON_KEY, SERVICE_ROLE_KEY) 필요"`로 중단한다.

## 금지사항

- 원본 CSV/거래 원문을 저장할 테이블·컬럼을 만들지 마라. 이유: ADR-005 — 결과 JSON만 저장한다.
- service-role 키를 `NEXT_PUBLIC_`로 노출하거나 `client.ts`에서 사용하지 마라. 이유: 전체 DB 우회 권한이라 유출 시 치명적이다.
- 실제 키를 추측해 채워 넣지 마라. 키가 없으면 blocked 처리하라.
- 기존 테스트를 깨뜨리지 마라.
