// paywall.jsx — UC3 전환(업그레이드) · UC6 구독 관리(Polar 포털)
function Paywall({ go, plan, setPlan }) {
  const [stage, setStage] = React.useState("compare"); // compare | checkout
  const subs = detectSubscriptions();

  if (plan === "pro") return <BillingPortal go={go} setPlan={setPlan} />;

  const proFeatures = [
    "구독·정기결제 자동 탐지 (월 고정 지출 합산)",
    "중복·이중청구 의심 거래 플래그",
    "전체 카테고리 + 가맹점 드릴다운",
    "가맹점별 구체 절약 제안",
    "월별 추이·전월 대비·이상 패턴 (이력)",
    "Opus 모델 — 더 정확한 분류·요약",
  ];

  return (
    <div style={{ maxWidth: 880, margin: "0 auto", padding: "40px 28px 80px" }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <Pill tone="accent" style={{ marginBottom: 16 }}><Icon name="bolt" size={13} /> FinSight Pro</Pill>
        <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-0.03em", margin: "0 0 10px", color: "var(--text)" }}>단건도 더 깊게, 이력으로 더 자라게</h1>
        <p style={{ fontSize: 15, color: "var(--muted)", margin: 0 }}>이번 달만 봐도 <b style={{ color: "var(--accent)" }}>월 {won(subs.monthlyTotal)}</b>의 구독이 빠져나가고 있어요.</p>
      </div>

      {stage === "compare" ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.25fr", gap: 16, alignItems: "start" }}>
          {/* Free */}
          <Card pad={24}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--muted)" }}>Free</div>
            <div style={{ fontSize: 30, fontWeight: 800, margin: "8px 0 4px", color: "var(--text)" }}>₩0</div>
            <div style={{ fontSize: 12.5, color: "var(--faint)", marginBottom: 18 }}>현재 플랜 · 일일 분석 횟수 제한</div>
            <Feat ok={false} faint>단건 명세서 · 상위 카테고리 분류</Feat>
            <Feat ok={false} faint>AI 총평 (경량 모델)</Feat>
            <Feat ok={false} muted>구독 누수·이상탐지 잠김</Feat>
            <Feat ok={false} muted>월별 추이·이력 잠김</Feat>
          </Card>
          {/* Pro */}
          <Card pad={24} style={{ border: "1px solid var(--accent-border)", background: "linear-gradient(180deg, var(--panel) 0%, color-mix(in oklab, var(--accent) 6%, var(--panel)) 100%)", position: "relative" }}>
            <Pill tone="accent" style={{ position: "absolute", top: 18, right: 18 }}>추천</Pill>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--accent)" }}>Pro</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, margin: "8px 0 4px" }}>
              <span style={{ fontSize: 30, fontWeight: 800, color: "var(--text)" }}>₩9,900</span>
              <span style={{ fontSize: 14, color: "var(--muted)" }}>/월</span>
            </div>
            <div style={{ fontSize: 12.5, color: "var(--faint)", marginBottom: 18 }}>언제든 해지 · Polar로 안전 결제</div>
            {proFeatures.map((f, i) => <Feat key={i} ok>{f}</Feat>)}
            <Btn kind="primary" size="lg" style={{ width: "100%", marginTop: 18 }} icon="bolt" onClick={() => setStage("checkout")}>Pro 시작하기</Btn>
          </Card>
        </div>
      ) : (
        <PolarCheckout go={go} setPlan={setPlan} onBack={() => setStage("compare")} />
      )}

      <div style={{ textAlign: "center", marginTop: 24 }}>
        <Btn kind="subtle" size="sm" onClick={() => go("dashboard")}>나중에 하기</Btn>
      </div>
    </div>
  );
}

function Feat({ children, ok, faint, muted }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 9, padding: "6px 0", fontSize: 13.5, color: muted ? "var(--faint)" : faint ? "var(--muted)" : "var(--text)" }}>
      <span style={{ marginTop: 1, flexShrink: 0 }}>
        {muted ? <Icon name="lock" size={14} color="var(--faint)" /> : <Icon name="check" size={14} color={ok ? "var(--accent)" : "var(--muted)"} />}
      </span>
      {children}
    </div>
  );
}

// ── Polar 결제 (모의) ─────────────────────────────────────────
function PolarCheckout({ go, setPlan, onBack }) {
  const [paying, setPaying] = React.useState(false);
  return (
    <Card pad={0} style={{ maxWidth: 460, margin: "0 auto", overflow: "hidden" }}>
      <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--muted)" }}>
          <Icon name="lock" size={14} color="var(--accent)" /> Polar 보안 결제
        </span>
        <Icon name="x" size={16} color="var(--faint)" style={{ cursor: "pointer" }} onClick={onBack} />
      </div>
      <div style={{ padding: 22 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 18 }}>
          <span style={{ fontSize: 14, color: "var(--text)", fontWeight: 600 }}>FinSight Pro · 월간</span>
          <span style={{ fontSize: 20, fontWeight: 800, color: "var(--text)" }}>₩9,900</span>
        </div>
        <Field label="카드 번호" placeholder="1234  5678  9012  3456" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="유효기간" placeholder="MM / YY" />
          <Field label="CVC" placeholder="•••" />
        </div>
        <Btn kind="primary" size="lg" style={{ width: "100%", marginTop: 8 }}
          disabled={paying}
          onClick={() => { setPaying(true); setTimeout(() => { setPlan("pro"); go("dashboard", { upgraded: true }); }, 1100); }}>
          {paying ? "결제 처리 중…" : "₩9,900 결제하고 Pro 시작"}
        </Btn>
        <div style={{ fontSize: 11.5, color: "var(--faint)", textAlign: "center", marginTop: 12, lineHeight: 1.5 }}>
          결제 시 이용약관에 동의하게 됩니다. 매월 자동 갱신되며 Polar 포털에서 언제든 해지할 수 있어요.
        </div>
      </div>
    </Card>
  );
}

// ── UC6: Polar 구독 관리 포털 ─────────────────────────────────
function BillingPortal({ go, setPlan }) {
  const [canceled, setCanceled] = React.useState(false);
  return (
    <div style={{ maxWidth: 620, margin: "0 auto", padding: "40px 28px 80px" }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.025em", margin: "0 0 6px", color: "var(--text)" }}>구독 관리</h1>
      <p style={{ fontSize: 14, color: "var(--muted)", margin: "0 0 24px" }}>Polar 고객 포털 · 결제·해지·영수증</p>

      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: "var(--text)" }}>FinSight Pro</span>
              {canceled ? <Pill tone="warn">해지 예약됨</Pill> : <Pill tone="accent">활성</Pill>}
            </div>
            <div style={{ fontSize: 13, color: "var(--faint)", marginTop: 5 }}>
              {canceled ? "2026.06.30까지 이용 가능 · 이후 Free로 전환" : "₩9,900/월 · 다음 결제일 2026.06.30"}
            </div>
          </div>
          <span style={{ display: "grid", placeItems: "center", width: 44, height: 44, borderRadius: 12, background: "var(--accent-dim)" }}><Icon name="bolt" size={22} color="var(--accent)" /></span>
        </div>
      </Card>

      <Card style={{ marginBottom: 16 }} pad={0}>
        <Row label="결제 수단" value="신한카드 ····3456" />
        <Row label="다음 청구" value={canceled ? "— (해지 예약)" : "2026.06.30 · ₩9,900"} />
        <Row label="최근 영수증" value="2026.05.30 · ₩9,900" action="다운로드" last />
      </Card>

      <div style={{ display: "flex", gap: 10 }}>
        <Btn kind="ghost" onClick={() => go("dashboard")}>대시보드로</Btn>
        {canceled ? (
          <Btn kind="primary" onClick={() => setCanceled(false)}>구독 재개</Btn>
        ) : (
          <Btn kind="danger" onClick={() => setCanceled(true)}>구독 해지</Btn>
        )}
        <Btn kind="subtle" size="md" style={{ marginLeft: "auto" }} onClick={() => { setPlan("free"); go("dashboard"); }}>Free로 전환(데모)</Btn>
      </div>
    </div>
  );
}

function Row({ label, value, action, last }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: last ? "none" : "1px solid var(--border)" }}>
      <span style={{ fontSize: 13.5, color: "var(--muted)" }}>{label}</span>
      <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 13.5, color: "var(--text)", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{value}</span>
        {action && <span style={{ fontSize: 12.5, color: "var(--accent)", fontWeight: 700, cursor: "pointer" }}>{action}</span>}
      </span>
    </div>
  );
}

Object.assign(window, { Paywall, Feat, PolarCheckout, BillingPortal, Row });
