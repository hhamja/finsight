# Step 3: auth-flow

## 읽어야 할 파일

- `/docs/ARCHITECTURE.md` — 패턴, 상태 관리
- `/docs/UI_GUIDE.md` — 입력 필드·버튼 스타일
- `/CLAUDE.md` — 보호 라우트·비밀키 규칙
- step2 산출물: `src/lib/supabase/*`, `supabase/migrations/0001_init.sql`

## 작업

Supabase Auth 기반 로그인/가입과 보호 라우트를 만든다.

1. 인증 페이지 `src/app/(auth)/login/page.tsx` — 이메일+비밀번호(또는 매직링크) 로그인/가입 폼. `/docs/UI_GUIDE.md`의 입력/버튼 스타일 사용.
   - 폼 제출은 Server Action 또는 route handler로. 클라이언트 인증 호출은 `client.ts`(anon key 범위)만 허용.
2. 세션 헬퍼 `src/lib/auth.ts`:
   - `getUser()` (server, 현재 세션 유저 또는 null)
   - `requireUser()` (없으면 `/login`으로 리다이렉트)
3. `src/middleware.ts`: `/dashboard` 등 보호 경로는 미인증 시 `/login`으로 리다이렉트. `@supabase/ssr`의 미들웨어 세션 갱신 패턴 사용.
4. 로그인 성공 시 `profiles` 행 보장(트리거가 없으면 upsert). 로그아웃 액션 제공.
5. 인증 성공 후 `/dashboard`로 리다이렉트.

## Acceptance Criteria

```bash
npm run build
npm test
```

미들웨어 리다이렉트 로직 또는 `requireUser` 동작 단위테스트를 추가하라.

## 검증 절차

1. AC 커맨드를 실행한다.
2. 체크리스트:
   - 미인증 상태로 `/dashboard` 접근 시 `/login`으로 가는가?
   - 세션이 쿠키로 유지되는가?
   - UI_GUIDE 스타일을 따르는가?
3. `phases/0-mvp/index.json`의 step 3을 업데이트한다. Supabase 키가 없어 검증이 불가하면 `"blocked"` 처리.

## 금지사항

- 대시보드 본문·업로드·분석 UI를 만들지 마라. 이유: step7 범위다.
- 자체 비밀번호 해싱/세션 테이블을 만들지 마라. 이유: 인증은 Supabase Auth에 위임한다(ADR-002).
- 보호 라우트 가드를 빠뜨리지 마라. 이유: 미인증 사용자가 대시보드/데이터에 접근하면 안 된다.
- 기존 테스트를 깨뜨리지 마라.
