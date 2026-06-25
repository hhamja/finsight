# 사용자 흐름 (User Flow)

이 문서는 FinSight의 화면 전환·데이터 흐름·요금제 분기를 정의한다.
UI/대시보드/랜딩/결제 구현(step3·6·7·8·9)은 이 흐름을 그대로 따른다.

## 페르소나 & Use Case

| # | 페르소나 | 하고 싶은 것 | 진입점 | 성공 |
|---|----------|--------------|--------|------|
| UC1 | 첫 방문자 | 이 앱이 뭘 해주는지 이해 | 랜딩 `/` | 가입 클릭 |
| UC2 | 신규 가입자 (Activation) | 첫 명세서 업로드 → 즉시 인사이트 | `/dashboard` 빈 상태 | 카테고리+요약 확인 |
| UC3 | Free 사용자 (Conversion) | 추이·이상탐지를 보고 싶음 | 🔒 Pro 잠금 카드 | 업그레이드 결제 |
| UC4 | Pro 사용자 (Retention) | 전월 대비 비교, 절약 포인트 | `/dashboard` + 이력 | 추이·이상·절약팁 |
| UC5 | 재방문자 | 과거 분석 다시 보기 | 이력 목록 | 저장된 분석 열람 |
| UC6 | 구독자 (Billing) | 구독 취소/변경 | 설정 → Polar 포털 | 셀프서비스 |

## 1. 전체 네비게이션 흐름

```mermaid
flowchart TD
    L["랜딩 /<br/>가치 제안 · 시작하기 CTA"]
    L --> AUTH{"로그인됨?"}
    AUTH -- "아니오" --> SIGNUP["로그인·가입<br/>(Supabase Auth)"]
    AUTH -- "예" --> DASH
    SIGNUP --> DASH["대시보드 /dashboard<br/>빈상태·업로드중·분석중·이력"]
    DASH -- "CSV 드롭" --> PIPE["분석 파이프라인<br/>파싱 → Claude → 저장"]
    PIPE --> TIER{"내 tier?"}
    TIER -- "free" --> FREE["카테고리 분류 + AI 요약<br/>🔒 추이·이상탐지 잠금 프리뷰"]
    TIER -- "pro" --> PRO["카테고리 + 추이 + 이상탐지<br/>+ 절약제안 + 이력 비교"]
    FREE -- "업그레이드" --> CHK["Polar 체크아웃"]
    CHK -- "결제 성공(webhook)" --> PRO
    DASH --> HIST["분석 이력 목록"] --> FREE
    DASH --> SET["설정 → Polar 고객 포털"]
```

## 2. 핵심 분석 파이프라인 (업로드 → 인사이트)

```mermaid
sequenceDiagram
    participant U as 사용자(Client)
    participant API as /api/analyze
    participant CSV as lib/csv
    participant CL as services/claude
    participant DB as Supabase

    U->>API: CSV 업로드 (세션 쿠키)
    API->>API: 세션 검증 + profiles.tier 조회
    API->>CSV: parseCsv(file)
    CSV-->>API: RawRow[] (메모리에만)
    API->>CL: analyzeTransactions(rows, tier)
    Note right of CL: tool-use로 JSON 강제 · 컬럼 자동 매핑
    CL-->>API: AnalysisResult
    API->>DB: analyses insert (결과 JSON만)
    Note over CSV,DB: ⚠ 원본 CSV는 저장하지 않고 폐기
    DB-->>API: ok (RLS: 본인 행만)
    API-->>U: AnalysisResult (tier에 맞게 필터링)
```

## 3. Free / Pro 상태 전이

```mermaid
stateDiagram-v2
    [*] --> Free: 가입 직후
    Free --> Free: 업로드 → 카테고리 + 요약
    Free --> Checkout: 🔒 Pro 잠금 클릭
    Checkout --> Pro: Polar 결제 성공(webhook)
    Pro --> Pro: 업로드 → 추이·이상탐지·절약팁·이력
    Pro --> Free: 구독 취소/만료(webhook)
```

## 화면별 상태 인벤토리

| 화면 | 상태 | 담당 step |
|------|------|-----------|
| 랜딩 `/` | 로그아웃 / 로그인됨(CTA 변경) | step8 |
| 로그인·가입 | 입력 / 검증중 / 에러 / 성공→리다이렉트 | step3 |
| 대시보드 | 빈상태 / 업로드중 / 분석중 / 결과 / 에러 | step7 |
| 결과(Free) | 카테고리·요약 + 🔒 Pro 프리뷰 | step7 |
| 결과(Pro) | 카테고리·추이·이상탐지·절약팁·이력 | step7 |
| 이력 목록 | 비어있음 / 카드 리스트 → 클릭 시 재표시 | step7 |
| 설정/빌링 | tier 표시 / 업그레이드 / Polar 포털 | step9 |
