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
├── lib/               # 유틸(csv 파싱, supabase 클라이언트)
└── services/          # 외부 API 래퍼(claude, polar)
```

## 패턴
- Server Components 기본. 업로드 드롭존·차트 등 인터랙션 컴포넌트만 Client Component.
- 외부 API는 `services/` 또는 `app/api/`에서만 호출. 클라이언트는 자체 API(`/api/*`)만 fetch.

## 데이터 흐름
```
업로드(Client) → POST /api/analyze
  → 세션 검증 + tier 조회 (Supabase)
  → CSV 파싱 (lib/csv, 메모리)
  → Claude 분석 (services/claude) → AnalysisResult
  → 결과 저장 (Supabase analyses, RLS)     ※ 원본 CSV는 폐기
  → tier에 맞게 필터링된 결과 반환 → 대시보드 렌더
```

## 상태 관리
- 서버 상태: Supabase(Postgres). 사용자별 RLS로 행 단위 격리.
- 클라이언트 상태: useState(업로드 진행, 로딩, 선택된 이력). 전역 상태 라이브러리 없음(MVP).

## 보안·프라이버시
- 원본 CSV 미저장(메모리 처리 후 폐기). 분석 결과 JSON만 저장.
- 비밀키 서버 전용. RLS로 타 사용자 데이터 접근 차단.
- Polar 웹훅 서명 검증으로만 tier 변경.
