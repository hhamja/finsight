// app.jsx — 라우터 · 앱 셸(사이드바) · Tweaks
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#3ecf8e",
  "font": "Pretendard",
  "density": "regular",
  "plan": "free",
  "chart": "donut",
  "layout": "comfortable"
}/*EDITMODE-END*/;

const ACCENTS = {
  "그린": "#3ecf8e",
  "앰버": "#f5b13d",
  "민트": "#34d6c8",
  "라임": "#a6e22e",
};
const FONTS = {
  "Pretendard": '"Pretendard Variable", Pretendard, -apple-system, sans-serif',
  "시스템": '-apple-system, BlinkMacSystemFont, "Segoe UI", "Apple SD Gothic Neo", sans-serif',
  "모노 강조": '"Pretendard Variable", Pretendard, sans-serif',
};

const NAV = [
  { key: "dashboard", label: "대시보드", icon: "chart" },
  { key: "history", label: "분석 이력", icon: "history" },
  { key: "settings", label: "설정", icon: "settings" },
];

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [route, setRoute] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem("finsight_route") || "null") || { screen: "landing", params: {} }; }
    catch { return { screen: "landing", params: {} }; }
  });
  // plan은 tweak이 소스 (Tweaks로 Free/Pro 토글). 결제/해지 시 tweak 갱신.
  const plan = t.plan;
  const setPlan = (p) => setTweak("plan", p);

  const go = (screen, params = {}) => {
    const next = { screen, params };
    setRoute(next);
    try { localStorage.setItem("finsight_route", JSON.stringify(next)); } catch {}
    window.scrollTo(0, 0);
    const sc = document.getElementById("fs-content");
    if (sc) sc.scrollTop = 0;
  };

  // 테마 변수 주입
  React.useEffect(() => {
    const r = document.documentElement;
    r.style.setProperty("--accent", t.accent);
    r.style.setProperty("--font", FONTS[t.font] || FONTS.Pretendard);
  }, [t.accent, t.font]);

  const { screen, params } = route;
  const isApp = !["landing", "signup"].includes(screen);
  const density = { compact: 0.92, regular: 1, comfy: 1.07 }[t.density] || 1;

  let body;
  if (screen === "landing") body = <Landing go={go} />;
  else if (screen === "signup") body = <Auth go={go} mode={params.mode} />;
  else if (screen === "upload") body = <Upload go={go} plan={plan} />;
  else if (screen === "dashboard") body = <Dashboard go={go} plan={plan} layout={t.layout} chart={t.chart} justAnalyzed={params.justAnalyzed || params.upgraded} />;
  else if (screen === "history") body = <History go={go} plan={plan} />;
  else if (screen === "settings") body = <Settings go={go} plan={plan} setPlan={setPlan} />;
  else if (screen === "paywall") body = <Paywall go={go} plan={plan} setPlan={setPlan} />;
  else body = <Landing go={go} />;

  return (
    <div style={{ minHeight: "100vh", background: "var(--app)", fontFamily: "var(--font)" }}>
      {isApp ? (
        <div style={{ display: "flex", minHeight: "100vh" }}>
          <Sidebar screen={screen} go={go} plan={plan} />
          <div id="fs-content" style={{ flex: 1, minWidth: 0, height: "100vh", overflowY: "auto" }}>
            <div style={{ zoom: density }}>{body}</div>
          </div>
        </div>
      ) : (
        <div style={{ zoom: density }}>{body}</div>
      )}
      <Tweaks t={t} setTweak={setTweak} />
    </div>
  );
}

function Sidebar({ screen, go, plan }) {
  return (
    <div style={{ width: 220, flexShrink: 0, borderRight: "1px solid var(--border)", background: "var(--panel)", display: "flex", flexDirection: "column", height: "100vh", position: "sticky", top: 0 }}>
      <div style={{ padding: "20px 18px 18px", cursor: "pointer" }} onClick={() => go("dashboard")}><Logo size={20} /></div>
      <div style={{ padding: "6px 12px", display: "flex", flexDirection: "column", gap: 3 }}>
        {NAV.map((n) => {
          const active = screen === n.key;
          return (
            <div key={n.key} onClick={() => go(n.key)}
              style={{ display: "flex", alignItems: "center", gap: 11, padding: "10px 12px", borderRadius: 9, cursor: "pointer", color: active ? "var(--text)" : "var(--muted)", background: active ? "var(--panel-2)" : "transparent", fontWeight: active ? 700 : 600, fontSize: 14, transition: "background .12s" }}
              onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "var(--panel-2)"; }}
              onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}>
              <Icon name={n.icon} size={17} color={active ? "var(--accent)" : "currentColor"} />
              {n.label}
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: "auto", padding: 14 }}>
        <Btn kind="ghost" size="sm" icon="upload" style={{ width: "100%", marginBottom: 10 }} onClick={() => go("upload")}>새 명세서</Btn>
        {plan === "pro" ? (
          <div style={{ padding: "12px 14px", borderRadius: 11, background: "var(--accent-dim)", border: "1px solid var(--accent-border)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 700, color: "var(--accent)" }}><Icon name="bolt" size={14} /> Pro 이용 중</div>
            <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 4 }}>모든 분석 해제됨</div>
          </div>
        ) : (
          <div onClick={() => go("paywall")} style={{ padding: "13px 14px", borderRadius: 11, background: "var(--panel-2)", border: "1px solid var(--border)", cursor: "pointer" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>Pro 업그레이드</div>
            <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 3, lineHeight: 1.5 }}>구독 누수·이상탐지·추이 해제</div>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--accent)", marginTop: 8, display: "flex", alignItems: "center", gap: 5 }}>₩9,900/월 <Icon name="arrowRight" size={13} /></div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Tweaks 패널 ───────────────────────────────────────────────
function Tweaks({ t, setTweak }) {
  const accentKey = Object.keys(ACCENTS).find((k) => ACCENTS[k] === t.accent) || "그린";
  return (
    <TweaksPanel>
      <TweakSection label="상태" />
      <TweakRadio label="플랜" value={t.plan} options={["free", "pro"]} onChange={(v) => setTweak("plan", v)} />
      <TweakSection label="대시보드" />
      <TweakRadio label="레이아웃" value={t.layout} options={["comfortable", "dense"]} onChange={(v) => setTweak("layout", v)} />
      <TweakRadio label="차트" value={t.chart} options={["donut", "bar"]} onChange={(v) => setTweak("chart", v)} />
      <TweakSection label="테마" />
      <TweakColor label="포인트 색" value={t.accent}
        options={[ACCENTS["그린"], ACCENTS["앰버"], ACCENTS["민트"], ACCENTS["라임"]]}
        onChange={(v) => setTweak("accent", v)} />
      <TweakSelect label="글꼴" value={t.font} options={Object.keys(FONTS)} onChange={(v) => setTweak("font", v)} />
      <TweakRadio label="밀도" value={t.density} options={["compact", "regular", "comfy"]} onChange={(v) => setTweak("density", v)} />
    </TweaksPanel>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
