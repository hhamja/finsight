# Step 10: deploy (Vercel CLI 자동 배포)

## 읽어야 할 파일

- `/CLAUDE.md` — 스택, 비밀키 규칙
- `/docs/ARCHITECTURE.md` — 전체 구조
- step0 `.env.example`(+ 조기 배포 결과), step1~9의 전체 산출물

## 작업

Vercel CLI로 **프로덕션에 자동 배포**한다. 실제 외부 연동 키가 아직 없어도(= mock/placeholder env) **먼저 배포해 라이브 URL을 확보**한다. 앱은 빌드 타임에 키를 강제하지 않으므로(런타임 체크) placeholder env로도 배포된다.

비대화형(non-interactive) 배포에 `VERCEL_TOKEN`을 사용한다:

1. 프로젝트 연결: `npx vercel link --yes --token=$VERCEL_TOKEN` (이미 연결돼 있으면 생략) → `npx vercel pull --yes --environment=production --token=$VERCEL_TOKEN`
2. 환경변수: 아직 실제 키가 없으면 **placeholder/mock 값**으로 등록(이미 있으면 생략). `npx vercel env add <KEY> production` 또는 배포 커맨드에 `--build-env`/`--env`로 주입. 실제 키는 사용자가 나중에 교체.
3. 배포: `npx vercel deploy --prod --yes --token=$VERCEL_TOKEN` → 출력된 **프로덕션 URL**을 step summary에 기록.
- `README.md`에 배포·실키 교체 절차를 간단히 문서화(env 목록, Supabase 마이그레이션, Polar 웹훅 URL 등록, 로컬 실행법).
- `vercel.json`·전용 env 검증 유틸은 **만들지 않는다**(Vercel 자동 감지 사용). 필요할 때만.

## Acceptance Criteria

```bash
npm run build                                          # 프로덕션 빌드 통과
npx vercel deploy --prod --yes --token=$VERCEL_TOKEN   # 배포 성공 → 프로덕션 URL 반환
```

## 검증 절차

1. 빌드 통과 + `vercel deploy --prod`가 프로덕션 URL을 반환하는지 확인한다.
2. 반환된 URL이 응답하는지 `curl -sI <url>`로 확인(랜딩 페이지 로드).
3. `phases/0-mvp/index.json`의 step 10을 업데이트한다. **summary에 배포 URL을 남긴다.**
   - `VERCEL_TOKEN`이 없어 배포가 불가하면 `"blocked"` + `blocked_reason: "VERCEL_TOKEN 필요 (vercel CLI 비대화형 프로덕션 배포용)"`로 중단한다.

## 금지사항

- 실제 연동 키가 없다고 배포를 미루지 마라. mock/placeholder env로라도 **먼저 배포**하라. 이유: 사용자 요구 — "mock일 때도 먼저 배포".
- `vercel login` 같은 대화형 인증을 쓰지 마라. 이유: 하네스는 비대화형으로 실행된다. `VERCEL_TOKEN`을 사용하라.
- 빌드 타임에 필수 키를 강제해 키 없이 빌드가 깨지게 만들지 마라. 이유: placeholder env로도 배포돼야 한다. 키 검증은 런타임으로.
- 실제 시크릿을 저장소에 커밋하지 마라. 이유: 이 저장소는 public이며 유출이 치명적이다.
- 기존 테스트를 깨뜨리지 마라.
