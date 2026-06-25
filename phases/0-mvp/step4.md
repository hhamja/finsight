# Step 4: csv-parser

## 읽어야 할 파일

- `/docs/ARCHITECTURE.md` — 데이터 흐름(lib/csv)
- `/CLAUDE.md` — 원본 CSV 미저장 CRITICAL
- `/docs/ADR.md` — ADR-004(범용 CSV)
- step1 산출물: `src/types/`

## 작업

범용 CSV를 메모리에서 파싱·정규화하는 lib를 만든다. 패키지: `papaparse`(+ `@types/papaparse`).

- `src/lib/csv.ts`:
  - `parseCsv(input: File | string): Promise<RawRow[]>` — papaparse 기본 옵션(`header: true`, `skipEmptyLines: true`, 구분자 자동 감지)으로 파싱. `RawRow = Record<string,string>`로 원본 헤더를 보존한다.
  - **인코딩 폴백(필수)**: 입력이 `File`이면 ArrayBuffer로 읽어 `TextDecoder('utf-8')` 시도 → 치환문자(`�`) 감지되면 `TextDecoder('euc-kr')`(CP949 포함)로 재디코드한 뒤 파싱한다. 선두 BOM은 제거한다. (국내 은행/카드 CSV는 CP949가 흔해 UTF-8 가정 시 한글 가맹점명이 깨짐.) 메타 객체는 만들지 않는다 — 문자열만 올바르게 디코드해 넘긴다.
  - `MAX_ROWS`(예: 5000) 초과 시 **throw**한다(잘라내거나 메타 객체를 반환하지 않는다 — 반환 타입은 `RawRow[]` 유지). 빈 파일/깨진 CSV도 명확한 에러를 던진다.
  - 컬럼 의미(날짜/금액/가맹점) 매핑은 여기서 하지 않는다 — step5에서 Claude가 추론한다. 여기선 "행들의 원시 표"만 만든다.
- 결과는 호출자에게 반환만 한다. 파일을 디스크에 쓰거나 어디에도 저장하지 않는다.

## Acceptance Criteria

```bash
npm run build
npm test
```

샘플 CSV 픽스처(쉼표/세미콜론/헤더 없음 + **CP949/EUC-KR로 인코딩된 한글 가맹점명** 픽스처)로 `src/lib/__tests__/csv.test.ts` 단위테스트를 추가하라. CP949 입력이 한글로 올바르게 디코드되는지 검증한다.

## 검증 절차

1. AC 커맨드를 실행한다(샘플 CSV 파싱 테스트 통과).
2. 체크리스트:
   - 디스크/네트워크 쓰기가 전혀 없는 순수 함수인가?
   - 다양한 구분자/헤더 유무를 처리하는가?
3. `phases/0-mvp/index.json`의 step 4를 업데이트한다.

## 금지사항

- 파싱한 CSV를 파일/DB/로그에 기록하지 마라. 이유: CLAUDE.md CRITICAL — 원본 미저장.
- 여기서 Claude를 호출하거나 컬럼 의미를 하드코딩하지 마라. 이유: 매핑은 step5의 책임이며 ADR-004(자동 매핑)를 따른다.
- 기존 테스트를 깨뜨리지 마라.
