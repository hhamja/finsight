# 프로젝트: FinSight

CSV 거래내역·카드명세서를 Claude API로 분석해 지출 인사이트를 제공하는 핀테크 SaaS.

## 기술 스택
- Next.js 15 (App Router)
- TypeScript (strict mode)
- Tailwind CSS v4
- Supabase (Auth + Postgres, `@supabase/ssr`)
- Claude API (`@anthropic-ai/sdk`, 모델 `claude-opus-4-8`)
- Polar (`@polar-sh/nextjs`, 구독 결제)
- Vitest + React Testing Library (테스트)

## 아키텍처 규칙
- CRITICAL: 외부 API(Claude·Supabase·Polar) 호출은 `src/services/` 또는 `src/app/api/` 라우트 핸들러에서만 한다. 클라이언트 컴포넌트에서 직접 호출 금지.
- CRITICAL: 업로드된 원본 CSV는 DB·디스크에 저장하지 않는다. 메모리에서 파싱·분석한 뒤 폐기하고, 분석 결과(JSON)만 저장한다.
- CRITICAL: 비밀키(`ANTHROPIC_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `POLAR_*`)는 서버 전용 env로만 접근한다. `NEXT_PUBLIC_` 접두사로 노출 금지.
- CRITICAL: Supabase 테이블은 RLS를 켜고 본인 행(`auth.uid() = user_id`)만 접근 가능하게 한다.
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
