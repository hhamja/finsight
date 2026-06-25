# Step 9: polar-billing

## 읽어야 할 파일

- `/docs/ADR.md` — ADR-003(Polar)
- `/docs/PRD.md` — Free/Pro 정의
- `/CLAUDE.md` — 비밀키 서버 전용
- step2 `profiles`(tier, polar_*), step3 auth, step7 `ProLockCard` 업그레이드 CTA

## 작업

Polar 구독 결제 연동. 패키지: `@polar-sh/sdk`, `@polar-sh/nextjs`.

- `src/services/polar.ts`: Polar 클라이언트(`POLAR_ACCESS_TOKEN`), 체크아웃 세션 생성 헬퍼, 고객 포털 URL 생성.
- `src/app/api/polar/checkout/route.ts`: 로그인 유저용 Pro 구독 체크아웃을 생성하고 Polar 결제 페이지로 리다이렉트. success_url 설정.
- `src/app/api/polar/webhook/route.ts`: 웹훅 **서명 검증**(`POLAR_WEBHOOK_SECRET`) 후 구독 생성/갱신/취소 이벤트를 처리 → `profiles`의 `tier`('pro'/'free'), `polar_customer_id`, `polar_subscription_id`, `current_period_end` 갱신(service-role).
- 설정/대시보드에 "구독 관리"(포털 링크)와 현재 tier 표시. step7 `ProLockCard`의 업그레이드 CTA를 checkout으로 연결.
- **데이터·계정 삭제**(설정 화면): "분석 이력 전체 삭제"(본인 `analyses` 삭제, RLS 내) + "계정 삭제"(service-role `auth.admin.deleteUser` → `on delete cascade`로 이력까지 파기). 둘 다 확인 단계를 둔다. (개인정보 파기 — CLAUDE.md CRITICAL)
- **데모용 tier 토글(키 없이 검증)**: `scripts/set-tier.ts`(또는 SQL 스니펫) — service-role로 특정 이메일의 `profiles.tier`를 pro/free로 설정해 **웹훅의 결과만 손으로 재현**한다(Free→Pro UI를 키 없이 end-to-end 데모). **사용자 노출 엔드포인트로 만들지 않는다**(개발 플래그는 권한상승 표면이 됨).
- 개발은 Polar **sandbox** 환경 기준.

## Acceptance Criteria

```bash
npm run build
npm test
```

웹훅 핸들러 단위테스트: 유효 서명 이벤트 → tier 갱신 호출, 무효 서명 → 거부(401). (실제 Polar 호출 없이 모킹 — 이 테스트가 키 없이 "결제→tier" 로직을 증명한다.) 계정·이력 삭제 핸들러 단위테스트(본인 행만 삭제)도 추가한다.

## 검증 절차

1. AC 커맨드를 실행한다.
2. 체크리스트:
   - 웹훅 서명 검증이 있는가?
   - tier 갱신이 service-role로 서버에서만 일어나는가?
   - Polar 토큰이 서버 전용인가?
3. `phases/0-mvp/index.json`의 step 9를 업데이트한다. `POLAR_ACCESS_TOKEN`/`POLAR_WEBHOOK_SECRET`과 Polar 상품(Product) 생성이 필요해 실제 검증이 막히면 `"blocked"` + 사유를 기록한다.

## 금지사항

- 서명 검증 없이 웹훅으로 tier를 바꾸지 마라. 이유: 위조 요청으로 무료 Pro 탈취가 가능하다.
- 사용자가 호출 가능한 tier 변경 엔드포인트를 만들지 마라(데모 토글은 service-role 스크립트/SQL로만). 이유: 권한상승으로 결제 우회가 가능하다.
- 계정/이력 삭제가 타인 행을 건드리지 않게 하라(RLS·본인 검증). 이유: 한 사용자가 남의 데이터를 지우면 안 된다.
- Polar 토큰을 클라이언트에 노출하지 마라. 이유: 결제/고객 데이터 접근 권한이다.
- 실제 토큰을 추측해 넣지 마라. 없으면 blocked 처리하라.
- 기존 테스트를 깨뜨리지 마라.
