// data.jsx — FinSight mock data + 결정론적 집계 헬퍼
// 모든 합계/추이/탐지 숫자는 여기서 코드로 계산. (LLM은 라벨/요약만 — PRD)

// ── 카테고리 정의 ─────────────────────────────────────────────
const CATEGORIES = [
  { key: "delivery", label: "식비·배달", shade: 1.00 },
  { key: "cafe",     label: "카페·간식", shade: 0.82 },
  { key: "grocery",  label: "마트·장보기", shade: 0.66 },
  { key: "subs",     label: "구독·정기결제", shade: 0.52 },
  { key: "transport",label: "교통", shade: 0.42 },
  { key: "shopping", label: "쇼핑", shade: 0.34 },
  { key: "convenience", label: "편의점", shade: 0.28 },
  { key: "utility",  label: "통신·공과금", shade: 0.22 },
  { key: "etc",      label: "기타", shade: 0.16 },
];
const CAT = Object.fromEntries(CATEGORIES.map((c) => [c.key, c]));

// 거래 한 건: [일(day), 가맹점, 금액, 카테고리, flags?]
// flags: sub(구독), dup(중복의심), anomaly(이상)
function tx(day, merchant, amount, cat, flags) {
  return { day, merchant, amount, cat, ...(flags || {}) };
}

// ── 이번 달 거래 (2026.05) — 30대 직장인, 배달·카페·구독 多 ──────
const MONTH = { year: 2026, month: 5, label: "2026년 5월" };
const TRANSACTIONS = [
  tx(1, "넷플릭스", 17000, "subs", { sub: true }),
  tx(1, "스타벅스 강남R점", 6300, "cafe"),
  tx(1, "배달의민족", 23400, "delivery"),
  tx(2, "GS25 역삼", 4800, "convenience"),
  tx(2, "카카오T 택시", 12700, "transport"),
  tx(3, "쿠팡 와우 멤버십", 7890, "subs", { sub: true }),
  tx(3, "투썸플레이스", 9100, "cafe"),
  tx(3, "배달의민족", 18900, "delivery"),
  tx(4, "이마트 성수", 64200, "grocery"),
  tx(4, "메가커피", 2500, "cafe"),
  tx(5, "유튜브 프리미엄", 14900, "subs", { sub: true }),
  tx(5, "올리브영", 38400, "shopping"),
  tx(6, "지하철 교통카드 충전", 50000, "transport"),
  tx(6, "쿠팡이츠", 21300, "delivery"),
  tx(7, "스타벅스 선릉", 5900, "cafe"),
  tx(7, "CU 삼성", 3200, "convenience"),
  tx(8, "ChatGPT Plus", 29000, "subs", { sub: true }),
  tx(8, "배달의민족", 16700, "delivery"),
  tx(9, "무신사", 89000, "shopping"),
  tx(9, "메가커피", 2500, "cafe"),
  tx(10, "멜론 스트리밍", 10900, "subs", { sub: true }),
  tx(10, "김밥천국", 8500, "delivery"),
  tx(11, "배달의민족", 27800, "delivery", { anomaly: true }),
  tx(11, "GS25 역삼", 5600, "convenience"),
  tx(12, "스타벅스 강남R점", 6300, "cafe"),
  tx(12, "카카오T 택시", 9800, "transport"),
  tx(13, "넷플릭스", 17000, "subs", { sub: true, dup: true }),
  tx(13, "쿠팡이츠", 19400, "delivery"),
  tx(14, "홈플러스 익스프레스", 31200, "grocery"),
  tx(14, "투썸플레이스", 8800, "cafe"),
  tx(15, "SKT 통신요금", 55000, "utility"),
  tx(15, "배달의민족", 22100, "delivery"),
  tx(16, "디즈니플러스", 9900, "subs", { sub: true }),
  tx(16, "메가커피", 2500, "cafe"),
  tx(17, "올리브영", 21600, "shopping"),
  tx(17, "GS25 역삼", 4100, "convenience"),
  tx(18, "배달의민족", 18300, "delivery"),
  tx(18, "스타벅스 선릉", 5900, "cafe"),
  tx(19, "카카오T 택시", 14200, "transport"),
  tx(19, "쿠팡이츠", 24600, "delivery"),
  tx(20, "이마트 성수", 48700, "grocery"),
  tx(20, "메가커피", 2500, "cafe"),
  tx(21, "한국전력 전기요금", 38400, "utility"),
  tx(21, "배달의민족", 20500, "delivery"),
  tx(22, "투썸플레이스", 9100, "cafe"),
  tx(22, "CU 삼성", 2900, "convenience"),
  tx(23, "넷플릭스", 17000, "subs", { sub: true, dup: true }),
  tx(23, "쿠팡이츠", 17800, "delivery"),
  tx(24, "무신사", 54000, "shopping"),
  tx(24, "스타벅스 강남R점", 6300, "cafe"),
  tx(25, "배달의민족", 25900, "delivery", { anomaly: true }),
  tx(25, "메가커피", 2500, "cafe"),
  tx(26, "지하철 교통카드 충전", 50000, "transport"),
  tx(26, "GS25 역삼", 6200, "convenience"),
  tx(27, "배달의민족", 19600, "delivery"),
  tx(27, "투썸플레이스", 8800, "cafe"),
  tx(28, "올리브영", 29900, "shopping"),
  tx(28, "쿠팡이츠", 22400, "delivery"),
  tx(29, "스타벅스 선릉", 5900, "cafe"),
  tx(29, "김밥천국", 9000, "delivery"),
  tx(30, "배달의민족", 21700, "delivery"),
  tx(30, "메가커피", 2500, "cafe"),
  tx(31, "GS25 역삼", 5300, "convenience"),
];

// ── 결정론적 집계 ─────────────────────────────────────────────
function won(n) {
  return "₩" + n.toLocaleString("ko-KR");
}

function totalSpend(txs = TRANSACTIONS) {
  return txs.reduce((s, t) => s + t.amount, 0);
}

function byCategory(txs = TRANSACTIONS) {
  const map = {};
  for (const t of txs) {
    if (!map[t.cat]) map[t.cat] = { cat: t.cat, total: 0, count: 0 };
    map[t.cat].total += t.amount;
    map[t.cat].count += 1;
  }
  const total = totalSpend(txs);
  return Object.values(map)
    .map((m) => ({
      ...m,
      label: CAT[m.cat].label,
      shade: CAT[m.cat].shade,
      pct: total ? Math.round((m.total / total) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.total - a.total);
}

// 가맹점별 (드릴다운)
function byMerchant(catKey, txs = TRANSACTIONS) {
  const map = {};
  for (const t of txs) {
    if (catKey && t.cat !== catKey) continue;
    if (!map[t.merchant]) map[t.merchant] = { merchant: t.merchant, total: 0, count: 0, cat: t.cat };
    map[t.merchant].total += t.amount;
    map[t.merchant].count += 1;
  }
  return Object.values(map).sort((a, b) => b.total - a.total);
}

// 구독 탐지 — 같은 가맹점 sub 플래그
function detectSubscriptions(txs = TRANSACTIONS) {
  const map = {};
  for (const t of txs) {
    if (!t.sub) continue;
    if (!map[t.merchant]) map[t.merchant] = { merchant: t.merchant, amount: t.amount, count: 0 };
    map[t.merchant].count += 1;
  }
  const list = Object.values(map).sort((a, b) => b.amount - a.amount);
  // 월 단위 합계 = 가맹점별 1회 청구액 합 (중복 제외)
  const monthlyTotal = list.reduce((s, m) => s + m.amount, 0);
  return { list, monthlyTotal, count: list.length };
}

// 중복/이중청구 의심 — dup 플래그 (같은 가맹점·같은 금액 2회)
function detectDuplicates(txs = TRANSACTIONS) {
  const dups = txs.filter((t) => t.dup);
  const map = {};
  for (const t of dups) {
    if (!map[t.merchant]) map[t.merchant] = { merchant: t.merchant, amount: t.amount, days: [] };
    map[t.merchant].days.push(t.day);
  }
  return Object.values(map);
}

// 이상 거래 — anomaly 플래그
function detectAnomalies(txs = TRANSACTIONS) {
  return txs.filter((t) => t.anomaly).map((t) => ({ ...t }));
}

// 월별 추이 (이력) — 과거 집계만 저장됨(거래 미저장) → 재현
const MONTHLY_TREND = [
  { ym: "2026.02", label: "2월", total: 1180000, delivery: 290000, cafe: 118000, subs: 96690 },
  { ym: "2026.03", label: "3월", total: 1262000, delivery: 318000, cafe: 132000, subs: 96690 },
  { ym: "2026.04", label: "4월", total: 1198000, delivery: 305000, cafe: 121000, subs: 96690 },
  { ym: "2026.05", label: "5월", total: totalSpend(), delivery: byCategory().find((c) => c.cat === "delivery").total, cafe: byCategory().find((c) => c.cat === "cafe").total, subs: byCategory().find((c) => c.cat === "subs").total },
];

// 일별 추이 (이번 달 스파크라인용)
function dailySeries(txs = TRANSACTIONS) {
  const days = {};
  for (let d = 1; d <= 31; d++) days[d] = 0;
  for (const t of txs) days[t.day] += t.amount;
  return Object.entries(days).map(([day, v]) => ({ day: +day, v }));
}

// 분석 이력 목록 (집계 결과만 저장)
const HISTORY = [
  { id: "h5", ym: "2026.05", label: "2026년 5월", total: totalSpend(), txCount: TRANSACTIONS.length, source: "신한카드_2026-05.csv", top: "식비·배달" },
  { id: "h4", ym: "2026.04", label: "2026년 4월", total: 1198000, txCount: 58, source: "신한카드_2026-04.csv", top: "식비·배달" },
  { id: "h3", ym: "2026.03", label: "2026년 3월", total: 1262000, txCount: 61, source: "신한카드_2026-03.csv", top: "식비·배달" },
  { id: "h2", ym: "2026.02", label: "2026년 2월", total: 1180000, txCount: 55, source: "신한카드_2026-02.csv", top: "식비·배달" },
];

// CSV 컬럼 매핑 (자동 인식 결과 — 신뢰도 노출용)
const CSV_MAPPING = {
  filename: "신한카드_2026-05.csv",
  encoding: "EUC-KR → UTF-8 변환됨",
  rows: 61,
  detectedDelimiter: ",",
  columns: [
    { source: "이용일자", role: "날짜", sample: "2026-05-11", confidence: 0.99 },
    { source: "이용금액", role: "금액", sample: "27,800", confidence: 0.97 },
    { source: "이용가맹점", role: "가맹점", sample: "배달의민족", confidence: 0.95 },
    { source: "이용구분", role: "무시", sample: "일시불", confidence: 0.88 },
    { source: "승인번호", role: "무시", sample: "30481102", confidence: 0.91 },
  ],
};

// AI 요약 (LLM이 생성한 라벨/총평 — 숫자는 코드값 주입)
function aiSummary() {
  const cats = byCategory();
  const subs = detectSubscriptions();
  const top = cats[0];
  return {
    free: `이번 달 총 ${won(totalSpend())}을 지출했어요. 가장 큰 항목은 ${top.label}(${won(top.total)}, ${top.pct}%)입니다. 배달과 카페를 합치면 식음료에 지출의 절반 가까이가 쏠려 있어요.`,
    proTips: [
      { title: "구독 정리", body: `매달 빠지는 구독이 ${subs.count}건, 합계 ${won(subs.monthlyTotal)}입니다. 멜론·디즈니플러스는 최근 사용이 거의 없어 해지 시 월 ${won(20800)} 절약돼요.` },
      { title: "넷플릭스 이중청구 의심", body: "5/13, 5/23 두 차례 동일 금액(₩17,000)이 청구됐어요. 계정 중복 결제일 수 있으니 확인을 권해요." },
      { title: "배달 지출 급증", body: "5/11·5/25 배달 단건이 평소(₩20,300)보다 30%↑. 주말 배달이 늘어난 패턴이에요. 주 1회 장보기로 대체 시 월 ₩60,000 내외 절약 가능." },
    ],
  };
}

Object.assign(window, {
  CATEGORIES, CAT, MONTH, TRANSACTIONS, MONTHLY_TREND, HISTORY, CSV_MAPPING,
  won, totalSpend, byCategory, byMerchant, dailySeries,
  detectSubscriptions, detectDuplicates, detectAnomalies, aiSummary,
});
