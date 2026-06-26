# 프로젝트: FinSight

CSV 거래내역·카드명세서를 Claude API로 분석해 지출 인사이트를 제공하는 핀테크 SaaS.

## 기술 스택
- Next.js 15 (App Router)
- TypeScript (strict mode)
- Tailwind CSS v4
- Supabase (Auth + Postgres, `@supabase/ssr`)
- Claude API (`@anthropic-ai/sdk`) — **모델 티어링**: 거래 라벨링은 경량 모델(`claude-haiku-4-5` 또는 `claude-sonnet-4-6`), Pro 심화 분석만 `claude-opus-4-8`. 모델은 호출부(API 라우트)가 tier로 선택해 주입한다(서비스 래퍼는 tier를 모른다).
- Polar (`@polar-sh/nextjs`, 구독 결제)
- Vitest + React Testing Library (테스트)

## 아키텍처 규칙
- CRITICAL: 외부 API(Claude·Supabase·Polar) 호출은 `src/services/` 또는 `src/app/api/` 라우트 핸들러에서만 한다. 클라이언트 컴포넌트에서 직접 호출 금지.
- CRITICAL: 업로드된 원본 CSV는 DB·디스크에 저장하지 않는다. 메모리에서 파싱·분석한 뒤 폐기하고, **집계 결과(JSON)만** 저장한다. 저장본에 거래 단위 원시 리스트(가맹점·금액 한 줄씩)를 넣지 않는다 — 카테고리 합계·추이 포인트·상위 가맹점·요약·팁 등 집계만 저장한다(유출 시 명세서 복원 불가).
- CRITICAL: 금액 합계·기간 추이·전월 대비·중복/구독 탐지 등 **모든 산술·집계는 코드(`src/lib/`)에서 결정론적으로** 계산한다. Claude(`src/services/`)는 거래 라벨링(카테고리 분류·가맹점 정규화), 컬럼 매핑 추론, 정성 요약·절약 제안 문장만 담당한다. LLM에 숫자 계산을 맡기지 않는다(재현성·정확성).
- CRITICAL: 분석 결과에는 Claude가 어떤 CSV 컬럼을 날짜/금액/가맹점으로 읽었는지(`mapping`)와 신뢰도(`confidence`)를 포함해 화면에 노출한다. confidence가 낮거나 합계가 비정상(음수/0)이면 분석을 강행하지 말고 "이 파일을 자신 있게 읽지 못했다"고 안내한다(조용한 오답 금지).
- CRITICAL: 비밀키(`ANTHROPIC_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `POLAR_*`)는 서버 전용 env로만 접근한다. `NEXT_PUBLIC_` 접두사로 노출 금지.
- CRITICAL: Supabase 테이블은 RLS를 켜고 본인 행(`auth.uid() = user_id`)만 접근 가능하게 한다.
- CRITICAL: `profiles.tier`와 구독 필드(`polar_*`, `current_period_end`)는 사용자가 직접 수정할 수 없다. 결제 상태 변경은 Polar 웹훅(service-role)으로만 한다. (`profiles`에 사용자 UPDATE 정책 금지 — tier 권한상승 방지)
- CRITICAL: 거래 원문·CSV 내용을 로그·에러 메시지·HTTP 응답에 남기지 마라. 로그도 저장이다.
- CRITICAL: 사용자는 자신의 분석 이력과 계정을 직접 삭제할 수 있어야 한다(개인정보 파기 대응). `analyses`는 `auth.users` 삭제 시 cascade 삭제되게 한다.
- MVP 범위: 레이트리밋 인프라(Redis 등)·큐·캐싱 레이어·전역 상태 라이브러리를 추가하지 마라. 단순 구현을 우선한다. (예외: Free 남용·비용 통제용 **일일 분석 횟수 캡은 Postgres `profiles` 컬럼 카운터**로 구현한다 — Redis가 아니므로 허용.)
- 컴포넌트는 `src/components/`, 타입은 `src/types/`, 유틸은 `src/lib/`, 외부 API 래퍼는 `src/services/`에 둔다.
- Server Components 기본. 인터랙션(업로드·차트)이 필요한 곳만 Client Component(`"use client"`).

## 개발 프로세스
- CRITICAL: 새 기능 구현 시 반드시 테스트를 먼저 작성하고, 테스트가 통과하는 구현을 작성할 것 (TDD)
- 커밋 메시지는 conventional commits 형식을 따를 것 (feat:, fix:, docs:, refactor:)

## 명령어
npm run dev      # 개발 서버
npm run build    # 프로덕션 빌드
npm run lint     # ESLint
npm run test     # Vitest
