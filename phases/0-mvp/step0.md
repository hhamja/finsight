# Step 0: project-setup

## 읽어야 할 파일

먼저 아래 파일들을 읽고 프로젝트의 아키텍처와 설계 의도를 파악하라:

- `/CLAUDE.md` — 스택, CRITICAL 규칙, 명령어
- `/docs/ARCHITECTURE.md` — 디렉토리 구조
- `/docs/ADR.md` — ADR-001(Next.js App Router)

이 step은 첫 step이므로 이전 산출물은 없다. 빈 저장소에 앱 골격을 세운다.

## 작업

Next.js 15 프로젝트 골격을 현재 저장소 루트에 구성한다.

1. Next.js 15 App Router + TypeScript(strict) + Tailwind CSS v4 + ESLint로 초기화한다.
   - `src/` 디렉토리 사용. import alias `@/*` → `src/*`.
   - 기존 루트 자산(`CLAUDE.md`, `docs/`, `scripts/`, `phases/`, `.git`, `.gitignore`, `.claude/`)을 덮어쓰거나 삭제하지 마라.
2. `/docs/ARCHITECTURE.md`의 디렉토리를 생성한다(빈 디렉토리는 `.gitkeep`):
   `src/app`, `src/components`, `src/types`, `src/lib`, `src/services`
3. 테스트 환경: Vitest + @testing-library/react + jsdom 설정.
   - `package.json` scripts: `dev`, `build`, `lint`, `test`(= `vitest run`).
   - `vitest.config.ts`에 jsdom 환경과 `@/*` alias 설정.
   - 동작 확인용 더미 단위테스트 1개(예: `src/lib/__tests__/smoke.test.ts`)를 둬서 `npm test`가 통과하게 한다.
4. `.env.example`에 필요한 키 플레이스홀더를 적는다(값은 비움):
   `ANTHROPIC_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `POLAR_ACCESS_TOKEN`, `POLAR_WEBHOOK_SECRET`, `POLAR_SUCCESS_URL`, `NEXT_PUBLIC_APP_URL`, `VERCEL_TOKEN`
5. `src/app/layout.tsx`, `src/app/page.tsx`(임시 플레이스홀더), `src/app/globals.css`(다크 배경 `#0a0a0a` 기본)만 최소로 둔다. 랜딩 본 구현은 step8에서 한다.
6. **(조기 배포)** `VERCEL_TOKEN`이 설정돼 있으면, 골격이 빌드된 직후 `npx vercel deploy --prod --yes --token=$VERCEL_TOKEN`로 **즉시 프로덕션 배포**해 라이브 URL을 확보한다(mock/placeholder env로도 OK — 빌드는 키를 강제하지 않음). 배포 성공 시 URL을 step summary에 남긴다. **`VERCEL_TOKEN`이 없으면 배포는 건너뛰고 step을 정상 완료하라 — 배포 부재로 `blocked` 처리하지 마라**(최종 배포는 step10).

## Acceptance Criteria

```bash
npm install
npm run build
npm run lint
npm test
```

## 검증 절차

1. 위 AC 커맨드를 모두 실행해 에러가 없는지 확인한다.
2. 아키텍처 체크리스트:
   - `/docs/ARCHITECTURE.md`의 `src/{app,components,types,lib,services}` 구조가 존재하는가?
   - `/CLAUDE.md` 명령어(dev/build/lint/test)가 모두 동작하는가?
   - TypeScript strict mode가 켜져 있는가(`tsconfig.json`)?
3. 결과에 따라 `phases/0-mvp/index.json`의 step 0을 업데이트한다(completed/error/blocked).

## 금지사항

- `npm create next-app` 등이 기존 `docs/`, `scripts/`, `phases/`, `CLAUDE.md`, `.claude/`를 지우게 두지 마라. 이유: 이 파일들이 하네스의 가드레일·러너다. 삭제 시 전체 파이프라인이 깨진다.
- 실제 비밀키를 `.env.example`이나 코드에 넣지 마라. 이유: 이 저장소는 public이며 키 유출은 치명적이다.
- 랜딩/대시보드/인증을 여기서 구현하지 마라. 이유: 각각 step8/step7/step3의 범위다. 이 step은 골격만 세운다.
- 기존 테스트를 깨뜨리지 마라.
