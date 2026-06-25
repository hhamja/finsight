# 아키텍처

## 디렉토리 구조
```
src/
├── app/               # 페이지 + API 라우트
│   ├── page.tsx           # 랜딩
│   ├── (auth)/            # 로그인·가입
│   ├── dashboard/         # 대시보드(업로드·결과·이력)
│   └── api/
│       ├── analyze/       # CSV 분석 엔드포인트
│       └── polar/         # checkout · webhook
├── components/        # UI 컴포넌트(차트, 업로드, 카드)
├── types/             # TypeScript 타입 + zod 스키마
├── lib/               # 유틸(csv 파싱·인코딩 폴백, supabase 클라이언트, aggregate 집계 계산)
└── services/          # 외부 API 래퍼(claude=라벨링만, polar)
```

## 패턴
- Server Components 기본. 업로드 드롭존·차트 등 인터랙션 컴포넌트만 Client Component.
- 외부 API는 `services/` 또는 `app/api/`에서만 호출. 클라이언트는 자체 API(`/api/*`)만 fetch.

## 데이터 흐름
```
업로드(Client) → POST /api/analyze
  → 세션 검증 + tier 조회 + Free 일일 캡 확인 (Supabase profiles 카운터)
  → CSV 파싱·디코딩 (lib/csv, 메모리; UTF-8 실패 시 EUC-KR/CP949 폴백)
  → 라벨링 (services/claude, 모델은 API가 tier로 주입)
        → { mapping, confidence, labeled[], summary, savingTips }   ※ 숫자 계산 없음
  → 집계 계산 (lib/aggregate, 결정론적)
        → AnalysisResult (카테고리 합계·추이·중복/구독/이상·총계)
  → confidence·합계 게이트: 비정상이면 분석 강행 안 하고 친화적 안내
  → 집계 결과만 저장 (Supabase analyses, RLS)   ※ 원본 CSV·거래 단위 리스트는 폐기
  → tier에 맞게 필터링된 결과 반환 → 대시보드(상단에 매핑 요약 배너) 렌더
```
- **역할 분리(ADR-007)**: `services/claude`는 라벨링·요약만, 모든 산술은 `lib/aggregate`. LLM에 숫자를 맡기지 않는다.
- **모델 티어링(ADR-008)**: Free=경량(haiku/sonnet), Pro=opus. 모델 상수는 services에, 선택은 API가 tier로.

## 상태 관리
- 서버 상태: Supabase(Postgres). 사용자별 RLS로 행 단위 격리.
- 클라이언트 상태: useState(업로드 진행, 로딩, 선택된 이력). 전역 상태 라이브러리 없음(MVP).

## 보안·프라이버시
- 원본 CSV·거래 단위 미저장(메모리 처리 후 폐기). **집계 결과 JSON만** 저장(ADR-005).
- 비밀키 서버 전용. RLS로 타 사용자 데이터 접근 차단.
- Polar 웹훅 서명 검증으로만 tier 변경.
- 사용자 계정·이력 삭제 가능(개인정보 파기). `analyses`는 `auth.users` 삭제 시 cascade.
- 컬럼 매핑·confidence를 노출하고, 저신뢰/비정상 합계는 분석을 막아 "조용한 오답"을 차단(ADR-009).
