// upload.jsx — UC2: CSV 업로드 → 컬럼 자동 인식(매핑·신뢰도 노출) → 분석
function Upload({ go, plan }) {
  const [stage, setStage] = React.useState("idle"); // idle | processing | review
  const [step, setStep] = React.useState(0);
  const m = CSV_MAPPING;

  const steps = [
    "파일 인코딩 감지 중… (EUC-KR 폴백)",
    "구분자·헤더 행 파악 중…",
    "Claude가 날짜·금액·가맹점 컬럼 매핑 중…",
    "거래 61건 정규화 완료",
  ];

  React.useEffect(() => {
    if (stage !== "processing") return;
    setStep(0);
    const timers = steps.map((_, i) => setTimeout(() => {
      setStep(i);
      if (i === steps.length - 1) setTimeout(() => setStage("review"), 700);
    }, i * 750));
    return () => timers.forEach(clearTimeout);
  }, [stage]);

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "36px 28px 80px" }}>
      <div style={{ marginBottom: 6, fontSize: 13, color: "var(--accent)", fontWeight: 700 }}>
        {plan === "pro" ? "Pro 분석" : "무료 분석"}
      </div>
      <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.025em", margin: "0 0 8px", color: "var(--text)" }}>명세서 업로드</h1>
      <p style={{ fontSize: 14, color: "var(--muted)", margin: "0 0 26px" }}>
        은행/카드사에서 받은 CSV 파일을 올리세요. 원본은 분석 후 저장되지 않습니다.
      </p>

      {stage === "idle" && (
        <div
          onClick={() => setStage("processing")}
          style={{
            border: "1.5px dashed var(--border-2)", borderRadius: 16, padding: "56px 24px",
            textAlign: "center", cursor: "pointer", background: "var(--panel)", transition: "border-color .15s, background .15s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent-border)"; e.currentTarget.style.background = "var(--panel-2)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border-2)"; e.currentTarget.style.background = "var(--panel)"; }}
        >
          <div style={{ display: "inline-flex", padding: 16, borderRadius: 14, background: "var(--accent-dim)", marginBottom: 16 }}>
            <Icon name="upload" size={26} color="var(--accent)" />
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text)" }}>CSV 파일을 끌어다 놓거나 클릭해 선택</div>
          <div style={{ fontSize: 13, color: "var(--faint)", marginTop: 8 }}>.csv · 최대 5MB · CP949/EUC-KR/UTF-8 지원</div>
          <div style={{ margintop: 20, marginTop: 20, display: "inline-block" }}>
            <Pill tone="neutral" style={{ marginTop: 20 }}><Icon name="file" size={12} /> 샘플로 체험: 신한카드_2026-05.csv</Pill>
          </div>
        </div>
      )}

      {stage === "processing" && (
        <Card pad={28}>
          <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 22 }}>
            <Icon name="file" size={18} color="var(--accent)" />
            <span style={{ fontWeight: 700, color: "var(--text)" }}>{m.filename}</span>
            <Pill tone="neutral" style={{ marginLeft: "auto" }}>분석 중</Pill>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {steps.map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, opacity: i <= step ? 1 : 0.35, transition: "opacity .3s" }}>
                <span style={{
                  width: 22, height: 22, borderRadius: 999, flexShrink: 0, display: "grid", placeItems: "center",
                  background: i < step ? "var(--accent)" : i === step ? "var(--accent-dim)" : "var(--panel-2)",
                  border: i === step ? "1px solid var(--accent-border)" : "1px solid var(--border)",
                }}>
                  {i < step ? <Icon name="check" size={13} color="#06120c" />
                    : i === step ? <span className="pulse" style={{ width: 7, height: 7, borderRadius: 999, background: "var(--accent)" }} />
                    : <span style={{ width: 6, height: 6, borderRadius: 999, background: "var(--faint)" }} />}
                </span>
                <span style={{ fontSize: 14, color: i <= step ? "var(--text)" : "var(--faint)" }}>{s}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {stage === "review" && (
        <>
          <Card pad={0} style={{ overflow: "hidden", marginBottom: 16 }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 11, flexWrap: "wrap" }}>
              <Icon name="file" size={17} color="var(--accent)" />
              <span style={{ fontWeight: 700, color: "var(--text)" }}>{m.filename}</span>
              <Pill tone="accent"><Icon name="check" size={12} /> 인식 완료</Pill>
              <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                <Pill tone="neutral">{m.encoding}</Pill>
                <Pill tone="neutral">{m.rows}행 · 구분자 "{m.detectedDelimiter}"</Pill>
              </div>
            </div>
            <div style={{ padding: "8px 20px 16px" }}>
              <div style={{ fontSize: 12.5, color: "var(--faint)", margin: "12px 0", display: "flex", alignItems: "center", gap: 7 }}>
                <Icon name="eye" size={13} /> Claude가 컬럼을 이렇게 읽었어요. 직접 검산하고 필요하면 역할을 바꾸세요.
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr 1fr 1.1fr", gap: 0, fontSize: 12, color: "var(--faint)", padding: "0 0 8px", borderBottom: "1px solid var(--border)" }}>
                <span>원본 컬럼</span><span>인식 역할</span><span>예시 값</span><span>신뢰도</span>
              </div>
              {m.columns.map((c, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr 1fr 1.1fr", gap: 0, alignItems: "center", padding: "11px 0", borderBottom: i < m.columns.length - 1 ? "1px solid var(--border)" : "none" }}>
                  <span style={{ fontSize: 13.5, color: "var(--text)", fontWeight: 600 }}>{c.source}</span>
                  <span>
                    <RolePill role={c.role} />
                  </span>
                  <span style={{ fontSize: 13, color: "var(--muted)", fontVariantNumeric: "tabular-nums" }}>{c.sample}</span>
                  <Confidence value={c.confidence} />
                </div>
              ))}
            </div>
          </Card>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <span style={{ fontSize: 13, color: "var(--muted)" }}>{m.rows}건 중 매핑 실패 0건 · 모든 금액 합계가 계산됩니다</span>
            <div style={{ display: "flex", gap: 10 }}>
              <Btn kind="ghost" onClick={() => setStage("idle")}>다시 업로드</Btn>
              <Btn kind="primary" icon="arrowRight" onClick={() => go("dashboard", { justAnalyzed: true })}>분석 결과 보기</Btn>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function RolePill({ role }) {
  const map = {
    "날짜": "accent", "금액": "accent", "가맹점": "accent", "무시": "neutral",
  };
  return <Pill tone={map[role] || "neutral"} style={role === "무시" ? { opacity: 0.7 } : {}}>{role}</Pill>;
}

Object.assign(window, { Upload, RolePill });
