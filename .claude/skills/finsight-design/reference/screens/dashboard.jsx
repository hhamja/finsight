// dashboard.jsx — UC2/3/4: 분석 대시보드 (Free / Pro)
function Dashboard({ go, plan, layout, chart, justAnalyzed }) {
  const cats = byCategory();
  const subs = detectSubscriptions();
  const dups = detectDuplicates();
  const anomalies = detectAnomalies();
  const sum = aiSummary();
  const trend = MONTHLY_TREND;
  const prev = trend[trend.length - 2].total;
  const cur = totalSpend();
  const delta = cur - prev;
  const deltaPct = Math.round((delta / prev) * 1000) / 10;
  const isPro = plan === "pro";
  const [drill, setDrill] = React.useState(null);

  const colW = layout === "dense" ? "repeat(3, 1fr)" : "repeat(2, 1fr)";

  return (
    <div style={{ maxWidth: 1120, margin: "0 auto", padding: "28px 28px 80px" }}>
      {/* 헤더 */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 22 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.025em", margin: 0, color: "var(--text)" }}>{MONTH.label} 분석</h1>
            {isPro ? <Pill tone="accent"><Icon name="bolt" size={12} /> Pro</Pill> : <Pill tone="neutral">Free</Pill>}
          </div>
          <div style={{ fontSize: 13, color: "var(--faint)", marginTop: 5 }}>신한카드_2026-05.csv · 거래 {TRANSACTIONS.length}건 · 집계만 저장됩니다</div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Btn kind="ghost" size="sm" icon="upload" onClick={() => go("upload")}>새 명세서</Btn>
          {isPro && <Btn kind="ghost" size="sm" icon="download" onClick={() => {}}>내보내기</Btn>}
        </div>
      </div>

      {justAnalyzed && (
        <div style={{ marginBottom: 18, padding: "11px 16px", borderRadius: 11, background: "var(--accent-dim)", border: "1px solid var(--accent-border)", display: "flex", alignItems: "center", gap: 10, fontSize: 13.5, color: "var(--accent)" }}>
          <Icon name="check" size={16} /> 분석이 완료됐어요. 아래에서 결과를 확인하세요.
        </div>
      )}

      {/* 핵심 수치 밴드 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 16 }}>
        <Stat label="총 지출" value={won(cur)} accent />
        <Stat label="전월 대비" value={isPro ? `${delta >= 0 ? "+" : ""}${won(delta)}` : null}
          sub={isPro ? `${deltaPct >= 0 ? "▲" : "▼"} ${Math.abs(deltaPct)}%` : null}
          subTone={delta >= 0 ? "up" : "down"} locked={!isPro} onUnlock={() => go("paywall")} />
        <Stat label="구독 누수" value={isPro ? `${subs.count}건` : null} sub={isPro ? `월 ${won(subs.monthlyTotal)}` : null} locked={!isPro} onUnlock={() => go("paywall")} />
        <Stat label="이상·중복" value={isPro ? `${anomalies.length + dups.length}건` : null} sub={isPro ? "확인 필요" : null} subTone="warn" locked={!isPro} onUnlock={() => go("paywall")} />
      </div>

      {/* 메인 그리드 */}
      <div style={{ display: "grid", gridTemplateColumns: layout === "dense" ? "1fr 1fr 1fr" : "1.15fr 1fr", gap: 16, alignItems: "start" }}>
        {/* 카테고리 분류 (Free·Pro 공통) */}
        <Card style={layout === "dense" ? { gridColumn: "span 1" } : {}}>
          <SectionTitle sub={isPro ? "전체 카테고리 · 클릭 시 가맹점 드릴다운" : "상위 카테고리 (Free)"}>지출 분류</SectionTitle>
          {chart === "donut" ? (
            <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
              <Donut data={isPro ? cats : cats.slice(0, 5)} centerLabel={won(cur)} centerSub="총 지출" size={158} />
              <div style={{ flex: 1, minWidth: 180, display: "flex", flexDirection: "column", gap: 2 }}>
                {(isPro ? cats : cats.slice(0, 5)).map((c) => (
                  <CatRow key={c.cat} c={c} pro={isPro} active={drill === c.cat} onClick={() => isPro && setDrill(drill === c.cat ? null : c.cat)} />
                ))}
                {!isPro && (
                  <div style={{ marginTop: 8, fontSize: 12, color: "var(--faint)", display: "flex", alignItems: "center", gap: 6 }}>
                    <Icon name="lock" size={12} /> 나머지 {cats.length - 5}개 카테고리·가맹점은 Pro
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {(isPro ? cats : cats.slice(0, 5)).map((c) => (
                <CatBar key={c.cat} c={c} max={cats[0].total} pro={isPro} active={drill === c.cat} onClick={() => isPro && setDrill(drill === c.cat ? null : c.cat)} />
              ))}
            </div>
          )}
          {/* 드릴다운 */}
          {isPro && drill && (
            <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--border)" }}>
              <div style={{ fontSize: 12.5, color: "var(--muted)", fontWeight: 700, marginBottom: 10, display: "flex", alignItems: "center", gap: 7 }}>
                <Icon name="arrowRight" size={13} color="var(--accent)" /> {CAT[drill].label} 가맹점
              </div>
              {byMerchant(drill).map((mch) => (
                <div key={mch.merchant} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 13 }}>
                  <span style={{ color: "var(--muted)" }}>{mch.merchant} <span style={{ color: "var(--faint)" }}>· {mch.count}회</span></span>
                  <span style={{ color: "var(--text)", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{won(mch.total)}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* AI 총평 (Free·Pro 공통) */}
        <Card>
          <SectionTitle sub="Claude 요약 · 숫자는 코드 계산">
            <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}><Icon name="sparkles" size={15} color="var(--accent)" /> 이번 달 총평</span>
          </SectionTitle>
          <p style={{ fontSize: 14, lineHeight: 1.68, color: "var(--text)", margin: 0 }}>{sum.free}</p>
          {isPro && (
            <div style={{ marginTop: 16 }}>
              <Spark data={dailySeries()} width={layout === "dense" ? 280 : 360} height={50} />
              <div style={{ fontSize: 11.5, color: "var(--faint)", marginTop: 4 }}>일별 지출 흐름 (5/1–5/31)</div>
            </div>
          )}
        </Card>

        {/* ── Pro 전용 / Free 잠금 카드들 ── */}
        {/* 구독 누수 */}
        <ProCard isPro={isPro} go={go} title="구독·정기결제 탐지" icon="repeat"
          sub={isPro ? `매달 빠지는 구독 ${subs.count}건 · 합계 ${won(subs.monthlyTotal)}` : "매달 자동 결제되는 구독을 찾아드려요"}>
          {subs.list.map((s) => (
            <div key={s.merchant} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid var(--border)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <span style={{ width: 7, height: 7, borderRadius: 999, background: "var(--accent)" }} />
                <span style={{ fontSize: 13.5, color: "var(--text)", fontWeight: 600 }}>{s.merchant}</span>
              </div>
              <span style={{ fontSize: 13.5, color: "var(--muted)", fontVariantNumeric: "tabular-nums" }}>{won(s.amount)}/월</span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 11, fontSize: 13.5, fontWeight: 700 }}>
            <span style={{ color: "var(--muted)" }}>월 고정 지출</span>
            <span style={{ color: "var(--accent)", fontVariantNumeric: "tabular-nums" }}>{won(subs.monthlyTotal)}</span>
          </div>
        </ProCard>

        {/* 중복·이상 */}
        <ProCard isPro={isPro} go={go} title="중복·이상 거래" icon="alert"
          sub={isPro ? `이중청구 의심 ${dups.length}건 · 이상 ${anomalies.length}건` : "이중청구·평소와 다른 결제를 짚어드려요"}>
          {dups.map((d) => (
            <DetectRow key={d.merchant} icon="copy" tone="danger"
              title={`${d.merchant} 이중청구 의심`} body={`${d.days.map((x) => `5/${x}`).join(", ")} · 동일 금액 ${won(d.amount)}`} />
          ))}
          <div style={{ height: 10 }} />
          {anomalies.map((a, i) => (
            <DetectRow key={i} icon="alert" tone="warn"
              title={`${a.merchant} 평소 대비 급증`} body={`5/${a.day} · ${won(a.amount)} (평소 ₩20,300)`} />
          ))}
        </ProCard>

        {/* 월별 추이 (retention) */}
        <ProCard isPro={isPro} go={go} title="월별 추이" icon="chart"
          sub={isPro ? `전월 대비 ${delta >= 0 ? "+" : ""}${won(delta)} (${deltaPct >= 0 ? "▲" : "▼"}${Math.abs(deltaPct)}%)` : "이력이 쌓이면 전월 대비 추이가 자랍니다"}
          span={layout === "dense" ? 1 : 2}>
          <Bars data={trend} fmt={(v) => "₩" + (v / 10000).toFixed(0) + "만"} height={150} />
        </ProCard>

        {/* 절약 제안 */}
        <ProCard isPro={isPro} go={go} title="가맹점별 절약 제안" icon="sparkles"
          sub={isPro ? "Claude가 패턴 기반으로 제안" : "구체적인 절약 포인트를 제안해드려요"}
          span={layout === "dense" ? 2 : 1}>
          <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
            {sum.proTips.map((t, i) => (
              <div key={i} style={{ display: "flex", gap: 11 }}>
                <span style={{ flexShrink: 0, width: 24, height: 24, borderRadius: 7, background: "var(--accent-dim)", display: "grid", placeItems: "center", color: "var(--accent)", fontWeight: 800, fontSize: 12 }}>{i + 1}</span>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text)" }}>{t.title}</div>
                  <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 2, lineHeight: 1.55 }}>{t.body}</div>
                </div>
              </div>
            ))}
          </div>
        </ProCard>
      </div>

      {/* Free 하단 업그레이드 배너 */}
      {!isPro && (
        <Card style={{ marginTop: 18, background: "linear-gradient(180deg, var(--panel) 0%, var(--panel-2) 100%)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ display: "grid", placeItems: "center", width: 44, height: 44, borderRadius: 12, background: "var(--accent-dim)" }}><Icon name="bolt" size={22} color="var(--accent)" /></span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: "var(--text)" }}>단건도 더 깊게, 이력으로 더 자라게</div>
              <div style={{ fontSize: 13.5, color: "var(--muted)", marginTop: 3 }}>구독 누수·이중청구·이상탐지·전월 대비 추이 — Pro로 전부 해제</div>
            </div>
          </div>
          <Btn kind="primary" size="lg" icon="arrowRight" onClick={() => go("paywall")}>Pro 업그레이드 · ₩9,900/월</Btn>
        </Card>
      )}
    </div>
  );
}

// ── 보조 컴포넌트 ─────────────────────────────────────────────
function Stat({ label, value, sub, subTone, accent, locked, onUnlock }) {
  const toneColor = { up: "#ff8585", down: "var(--accent)", warn: "#e6b45c" }[subTone] || "var(--faint)";
  return (
    <Card pad={16} style={{ position: "relative", overflow: "hidden" }}>
      <div style={{ fontSize: 12.5, color: "var(--faint)", fontWeight: 600 }}>{label}</div>
      {locked ? (
        <div onClick={onUnlock} style={{ cursor: "pointer", marginTop: 8, display: "flex", alignItems: "center", gap: 7, color: "var(--muted)" }}>
          <Icon name="lock" size={15} /> <span style={{ fontSize: 14, fontWeight: 600 }}>Pro에서 해제</span>
        </div>
      ) : (
        <>
          <div style={{ fontSize: 22, fontWeight: 800, marginTop: 6, color: accent ? "var(--accent)" : "var(--text)", fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em" }}>{value}</div>
          {sub && <div style={{ fontSize: 12.5, marginTop: 3, color: toneColor, fontWeight: 700 }}>{sub}</div>}
        </>
      )}
    </Card>
  );
}

function CatRow({ c, active, onClick, pro }) {
  return (
    <div onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 13, padding: "5px 6px", margin: "0 -6px", borderRadius: 7, cursor: pro ? "pointer" : "default", background: active ? "var(--panel-2)" : "transparent" }}>
      <span style={{ width: 9, height: 9, borderRadius: 3, background: `color-mix(in oklab, var(--accent) ${Math.round(c.shade * 100)}%, var(--panel-2))` }} />
      <span style={{ color: "var(--muted)", flex: 1 }}>{c.label}</span>
      <span style={{ color: "var(--text)", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{won(c.total)}</span>
      <span style={{ color: "var(--faint)", fontVariantNumeric: "tabular-nums", width: 38, textAlign: "right" }}>{c.pct}%</span>
    </div>
  );
}

function CatBar({ c, max, active, onClick, pro }) {
  return (
    <div onClick={onClick} style={{ padding: "8px 6px", margin: "0 -6px", borderRadius: 7, cursor: pro ? "pointer" : "default", background: active ? "var(--panel-2)" : "transparent" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
        <span style={{ color: "var(--muted)" }}>{c.label}</span>
        <span style={{ color: "var(--text)", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{won(c.total)} <span style={{ color: "var(--faint)", fontWeight: 500 }}>{c.pct}%</span></span>
      </div>
      <div style={{ height: 8, background: "var(--panel-2)", borderRadius: 4, overflow: "hidden" }}>
        <div style={{ width: `${(c.total / max) * 100}%`, height: "100%", borderRadius: 4, background: `color-mix(in oklab, var(--accent) ${Math.round(c.shade * 100)}%, var(--bar))`, transition: "width .5s" }} />
      </div>
    </div>
  );
}

// Pro 전용 카드: Free면 잠금 오버레이
function ProCard({ isPro, go, title, icon, sub, children, span = 1 }) {
  return (
    <Card style={{ position: "relative", gridColumn: span > 1 ? `span ${span}` : undefined, overflow: "hidden" }}>
      <SectionTitle sub={sub} right={isPro ? null : <Lock />}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}><Icon name={icon} size={15} color="var(--accent)" /> {title}</span>
      </SectionTitle>
      <div style={{ position: "relative" }}>
        <div style={{ filter: isPro ? "none" : "blur(5px)", opacity: isPro ? 1 : 0.5, pointerEvents: isPro ? "auto" : "none", userSelect: isPro ? "auto" : "none", transition: "filter .2s" }}>
          {children}
        </div>
        {!isPro && (
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
            <Btn kind="primary" size="sm" icon="bolt" onClick={() => go("paywall")}>Pro로 해제</Btn>
          </div>
        )}
      </div>
    </Card>
  );
}

Object.assign(window, { Dashboard, Stat, CatRow, CatBar, ProCard });
