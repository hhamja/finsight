# 사용자 흐름 (User Flow)

이 문서는 FinSight의 화면 전환·데이터 흐름·요금제 분기를 정의한다.
UI/대시보드/랜딩/결제 구현(step3·6·7·8·9)은 이 흐름을 그대로 따른다.

## 페르소나 & Use Case

| # | 페르소나 | 하고 싶은 것 | 진입점 | 성공 |
|---|----------|--------------|--------|------|
| UC1 | 첫 방문자 | 이 앱이 뭘 해주는지 이해 | 랜딩 `/` (로그아웃 샘플 체험) | 가입 클릭 |
| UC2 | 신규 가입자 (Activation) | 첫 명세서 업로드 → 즉시 인사이트 | `/dashboard` 빈 상태 | 카테고리+요약 확인 |
| UC3 | Free 사용자 (Conversion) | 추이·이상탐지를 보고 싶음 | 🔒 Pro 잠금 카드 | 업그레이드 결제 |
| UC4 | Pro 사용자 (Retention) | 전월 대비 비교, 절약 포인트 | `/dashboard` + 이력 | 추이·이상·절약팁 |
| UC5 | 재방문자 | 과거 분석 다시 보기 | 이력 목록 | 저장된 분석 열람 |
| UC6 | 구독자 (Billing) | 구독 취소/변경 | 설정 → Polar 포털 | 셀프서비스 |

## 1. 전체 네비게이션 흐름

```mermaid
flowchart TD
    L["랜딩 /<br/>가치 제안 · 샘플 체험(로그아웃) · CTA"]
    L --> AUTH{"로그인됨?"}
    AUTH -- "아니오" --> SIGNUP["로그인·가입<br/>(Supabase Auth · 매직링크)"]
    AUTH -- "예" --> DASH
    SIGNUP --> DASH["대시보드 /dashboard<br/>빈상태·업로드중·분석중·이력"]
    DASH -- "CSV 드롭" --> PIPE["분석 파이프라인<br/>파싱 → Claude → 저장"]
    PIPE --> TIER{"내 tier?"}
    TIER -- "free" --> FREE["상위 카테고리 + AI 총평<br/>🔒 구독탐지·드릴다운·추이 잠금 프리뷰"]
    TIER -- "pro" --> PRO["전체 카테고리·드릴다운 + 구독/중복 탐지<br/>+ 구체 절약제안 (이력 쌓이면 추이)"]
    FREE -- "업그레이드" --> CHK["Polar 체크아웃"]
    CHK -- "결제 성공(webhook)" --> PRO
    DASH --> HIST["분석 이력 목록"] --> FREE
    DASH --> SET["설정 → Polar 포털 · 데이터/계정 삭제"]
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
    API->>CL: classifyTransactions(rows, 모델=tier로 선택)
    Note right of CL: tool-use로 라벨링·매핑·요약 (숫자 계산 X)
    CL-->>API: {mapping, confidence, labeled, summary, savingTips}
    API->>API: lib/aggregate 집계 계산 (합계·추이·중복·구독)
    Note right of API: confidence·합계 비정상이면 분석 중단(친화적 안내)
    API->>DB: analyses insert (집계 JSON만)
    Note over CSV,DB: ⚠ 원본 CSV·거래 단위는 저장하지 않고 폐기
    DB-->>API: ok (RLS: 본인 행만)
    API-->>U: AnalysisResult + 매핑요약 (tier에 맞게 필터링)
```

## 3. Free / Pro 상태 전이

```mermaid
stateDiagram-v2
    [*] --> Free: 가입 직후
    Free --> Free: 업로드 → 카테고리 + 요약
    Free --> Checkout: 🔒 Pro 잠금 클릭
    Checkout --> Pro: Polar 결제 성공(webhook)
    Pro --> Pro: 업로드 → 구독/중복 탐지·드릴다운·구체팁 (이력 쌓이면 추이)
    Pro --> Free: 구독 취소/만료(webhook)
```

## 화면별 상태 인벤토리

| 화면 | 상태 | 담당 step |
|------|------|-----------|
| 랜딩 `/` | 로그아웃(+샘플 체험) / 로그인됨(CTA 변경) | step8 |
| 로그인·가입 | 매직링크 입력 / 메일 발송됨 / 에러 / 성공→리다이렉트 | step3 |
| 대시보드 | 빈상태 / 업로드중 / 분석중 / 결과 / 에러 / 저신뢰(읽기 실패) | step7 |
| 결과(공통) | 상단 매핑 요약 배너(읽은 컬럼·총건수·합계) | step7 |
| 결과(Free) | 상위 카테고리·총평 + 🔒 Pro 프리뷰 | step7 |
| 결과(Pro) | 전체 카테고리·드릴다운·구독/중복 탐지·구체팁 (이력 쌓이면 추이) | step7 |
| 이력 목록 | 비어있음 / 카드 리스트 → 클릭 시 집계 재현 (드릴다운은 재업로드) | step7 |
| 설정/빌링 | tier 표시 / 업그레이드 / Polar 포털 / 이력·계정 삭제 | step9 |
