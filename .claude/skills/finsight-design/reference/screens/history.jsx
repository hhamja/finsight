// history.jsx — UC5 재방문자: 분석 이력 열람 · 월별 비교 (집계만 저장)
function History({ go, plan }) {
  const isPro = plan === "pro";
  const [sel, setSel] = React.useState(HISTORY[0].id);
  const [cmp, setCmp] = React.useState(HISTORY[1].id);

  if (!isPro) {
    return (
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "40px 28px 80px" }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.025em", margin: "0 0 8px", color: "var(--text)" }}>분석 이력</h1>
        <p style={{ fontSize: 14, color: "var(--muted)", margin: "0 0 24px" }}>과거 분석을 보관하고 월별로 비교하세요.</p>
        <Card style={{ textAlign: "center", padding: "48px 24px" }}>
          <div style={{ display: "inline-flex", padding: 14, borderRadius: 14, background: "var(--accent-dim)", marginBottom: 16 }}>
            <Icon name="history" size={24} color="var(--accent)" />
          </div>
          <div style={{ fontSize: 17, fontWeight: 700, color: "var(--text)" }}>이력은 Pro 기능입니다</div>
          <div style={{ fontSize: 13.5, color: "var(--muted)", marginTop: 8, maxWidth: 380, marginInline: "auto", lineHeight: 1.55 }}>
            매월 명세서를 올리면 추이·전월 대비·"평소 대비 이상"이 쌓입니다. Free는 이번 달 단건만 분석돼요.
          </div>
          <Btn kind="primary" size="lg" icon="bolt" style={{ marginTop: 20 }} onClick={() => go("paywall")}>Pro로 이력 해제</Btn>
        </Card>
      </div>
    );
  }

  const a = HISTORY.find((h) => h.id === sel);
  const b = HISTORY.find((h) => h.id === cmp);
  const diff = a.total - b.total;
  const diffPct = Math.round((diff / b.total) * 1000) / 10;

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "28px 28px 80px" }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 22 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.025em", margin: "0 0 6px", color: "var(--text)" }}>분석 이력</h1>
          <p style={{ fontSize: 13, color: "var(--faint)", margin: 0 }}>집계 결과만 저장됩니다 · 거래 단위 드릴다운은 재업로드 시 재현</p>
        </div>
        <Pill tone="accent"><Icon name="bolt" size={12} /> Pro</Pill>
      </div>

      {/* 추이 */}
      <Card style={{ marginBottom: 16 }}>
        <SectionTitle sub="최근 4개월 총 지출">월별 추이</SectionTitle>
        <Bars data={MONTHLY_TREND} fmt={(v) => "₩" + (v / 10000).toFixed(0) + "만"} height={150} />
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: 16, alignItems: "start" }}>
        {/* 이력 리스트 */}
        <Card pad={0}>
          <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)", fontSize: 13, fontWeight: 700, color: "var(--muted)" }}>저장된 분석 ({HISTORY.length})</div>
          {HISTORY.map((h, i) => (
            <div key={h.id} onClick={() => setSel(h.id)}
              style={{ padding: "14px 18px", borderBottom: i < HISTORY.length - 1 ? "1px solid var(--border)" : "none", cursor: "pointer", background: sel === h.id ? "var(--panel-2)" : "transparent", borderLeft: sel === h.id ? "2px solid var(--accent)" : "2px solid transparent" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{h.label}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", fontVariantNumeric: "tabular-nums" }}>{won(h.total)}</span>
              </div>
              <div style={{ fontSize: 12, color: "var(--faint)", marginTop: 4, display: "flex", gap: 8 }}>
                <span>{h.txCount}건</span><span>·</span><span>최다 {h.top}</span>
              </div>
            </div>
          ))}
        </Card>

        {/* 비교 */}
        <Card>
          <SectionTitle sub="두 달의 집계를 나란히 비교">월별 비교</SectionTitle>
          <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
            <Select value={sel} onChange={setSel} />
            <span style={{ alignSelf: "center", color: "var(--faint)" }}>vs</span>
            <Select value={cmp} onChange={setCmp} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            <MiniStat label={a.label} value={won(a.total)} />
            <MiniStat label={b.label} value={won(b.total)} />
          </div>
          <div style={{ padding: "14px 16px", borderRadius: 11, background: "var(--panel-2)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 13.5, color: "var(--muted)" }}>차이</span>
            <span style={{ fontSize: 16, fontWeight: 800, color: diff >= 0 ? "#ff8585" : "var(--accent)", fontVariantNumeric: "tabular-nums" }}>
              {diff >= 0 ? "+" : ""}{won(diff)} <span style={{ fontSize: 13 }}>({diffPct >= 0 ? "▲" : "▼"}{Math.abs(diffPct)}%)</span>
            </span>
          </div>
          <div style={{ marginTop: 16, padding: "12px 14px", borderRadius: 10, border: "1px dashed var(--border-2)", display: "flex", alignItems: "center", gap: 9, fontSize: 12.5, color: "var(--faint)" }}>
            <Icon name="upload" size={14} /> 거래 단위로 보려면 해당 월 CSV를 다시 업로드하세요. (원본은 저장하지 않음)
          </div>
        </Card>
      </div>
    </div>
  );
}

function Select({ value, onChange }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      style={{ flex: 1, padding: "9px 11px", borderRadius: 9, background: "var(--panel-2)", border: "1px solid var(--border)", color: "var(--text)", fontSize: 13.5, fontFamily: "inherit", outline: "none", cursor: "pointer" }}>
      {HISTORY.map((h) => <option key={h.id} value={h.id} style={{ background: "var(--panel)" }}>{h.label}</option>)}
    </select>
  );
}

function MiniStat({ label, value }) {
  return (
    <div style={{ padding: "12px 14px", borderRadius: 11, background: "var(--panel-2)" }}>
      <div style={{ fontSize: 12, color: "var(--faint)" }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 800, color: "var(--text)", marginTop: 4, fontVariantNumeric: "tabular-nums" }}>{value}</div>
    </div>
  );
}

Object.assign(window, { History, Select, MiniStat });
