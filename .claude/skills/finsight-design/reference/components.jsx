// components.jsx — FinSight 공용 UI 프리미티브 + 차트
// 색상은 CSS 변수(--accent 등) 참조 → Tweaks가 즉시 반영됨.

// ── 아이콘 (stroke SVG) ───────────────────────────────────────
function Icon({ name, size = 18, color = "currentColor", stroke = 1.6, style }) {
  const p = {
    width: size, height: size, viewBox: "0 0 24 24", fill: "none",
    stroke: color, strokeWidth: stroke, strokeLinecap: "round", strokeLinejoin: "round", style,
  };
  const paths = {
    upload: <><path d="M12 16V4M12 4l-4 4M12 4l4 4" /><path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" /></>,
    chart: <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></>,
    history: <><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 4v4h4" /><path d="M12 8v4l3 2" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z" /></>,
    lock: <><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></>,
    check: <path d="M20 6 9 17l-5-5" />,
    arrowRight: <path d="M5 12h14M13 6l6 6-6 6" />,
    arrowUp: <path d="M12 19V5M5 12l7-7 7 7" />,
    arrowDown: <path d="M12 5v14M5 12l7 7 7-7" />,
    alert: <><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" /><path d="M12 9v4M12 17h.01" /></>,
    repeat: <><path d="M17 2l4 4-4 4" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><path d="M7 22l-4-4 4-4" /><path d="M21 13v2a4 4 0 0 1-4 4H3" /></>,
    copy: <><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></>,
    sparkles: <><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" /><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z" /></>,
    file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /></>,
    trash: <><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /></>,
    logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5M21 12H9" /></>,
    x: <path d="M18 6 6 18M6 6l12 12" />,
    download: <><path d="M12 3v12M8 11l4 4 4-4" /><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" /></>,
    eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></>,
    bolt: <path d="M13 2 3 14h7l-1 8 10-12h-7z" />,
  };
  return <svg {...p}>{paths[name] || null}</svg>;
}

// ── 로고 ──────────────────────────────────────────────────────
function Logo({ size = 22 }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <rect x="2" y="2" width="20" height="20" rx="6" fill="var(--accent-dim)" />
        <path d="M6 16l3.5-4 3 2.5L18 8" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="18" cy="8" r="1.8" fill="var(--accent)" />
      </svg>
      <span style={{ fontWeight: 800, fontSize: size * 0.82, letterSpacing: "-0.02em", color: "var(--text)" }}>
        FinSight
      </span>
    </div>
  );
}

// ── 버튼 ──────────────────────────────────────────────────────
function Btn({ children, kind = "ghost", size = "md", onClick, icon, style, disabled }) {
  const sizes = {
    sm: { padding: "7px 12px", fontSize: 13 },
    md: { padding: "10px 16px", fontSize: 14 },
    lg: { padding: "14px 22px", fontSize: 15 },
  };
  const kinds = {
    primary: { background: "var(--accent)", color: "#06120c", border: "1px solid var(--accent)", fontWeight: 700 },
    ghost: { background: "var(--panel-2)", color: "var(--text)", border: "1px solid var(--border)", fontWeight: 600 },
    subtle: { background: "transparent", color: "var(--muted)", border: "1px solid transparent", fontWeight: 600 },
    danger: { background: "transparent", color: "#ff6b6b", border: "1px solid #3a2422", fontWeight: 600 },
  };
  return (
    <button
      onClick={disabled ? undefined : onClick}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
        borderRadius: 9, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.45 : 1,
        transition: "transform .12s, filter .15s, background .15s", whiteSpace: "nowrap",
        ...sizes[size], ...kinds[kind], ...style,
      }}
      onMouseEnter={(e) => { if (!disabled) { e.currentTarget.style.filter = "brightness(1.08)"; } }}
      onMouseLeave={(e) => { e.currentTarget.style.filter = "none"; }}
      onMouseDown={(e) => { if (!disabled) e.currentTarget.style.transform = "scale(0.97)"; }}
      onMouseUp={(e) => { e.currentTarget.style.transform = "none"; }}
    >
      {icon && <Icon name={icon} size={size === "lg" ? 18 : 16} />}
      {children}
    </button>
  );
}

// ── 카드/패널 ─────────────────────────────────────────────────
function Card({ children, style, pad = 20, hover }) {
  return (
    <div
      style={{
        background: "var(--panel)", border: "1px solid var(--border)", borderRadius: 14,
        padding: pad, transition: "border-color .15s", ...style,
      }}
      onMouseEnter={hover ? (e) => (e.currentTarget.style.borderColor = "var(--border-2)") : undefined}
      onMouseLeave={hover ? (e) => (e.currentTarget.style.borderColor = "var(--border)") : undefined}
    >
      {children}
    </div>
  );
}

function Pill({ children, tone = "neutral", style }) {
  const tones = {
    neutral: { background: "var(--panel-2)", color: "var(--muted)", border: "1px solid var(--border)" },
    accent: { background: "var(--accent-dim)", color: "var(--accent)", border: "1px solid var(--accent-border)" },
    warn: { background: "#2a2114", color: "#e6b45c", border: "1px solid #4a3a1c" },
    danger: { background: "#2a1718", color: "#ff8585", border: "1px solid #4a2424" },
  };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5, fontWeight: 700, padding: "3px 9px", borderRadius: 999, letterSpacing: "-0.01em", ...tones[tone], ...style }}>
      {children}
    </span>
  );
}

function Lock({ size = 13 }) {
  return <Pill tone="neutral" style={{ background: "var(--panel-2)" }}><Icon name="lock" size={size} /> Pro</Pill>;
}

// ── 섹션 헤더 ─────────────────────────────────────────────────
function SectionTitle({ children, sub, right }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 14 }}>
      <div>
        <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.01em" }}>{children}</div>
        {sub && <div style={{ fontSize: 12.5, color: "var(--faint)", marginTop: 3 }}>{sub}</div>}
      </div>
      {right}
    </div>
  );
}

// ── 도넛 차트 (카테고리) ──────────────────────────────────────
function Donut({ data, size = 168, thickness = 22, centerLabel, centerSub }) {
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const total = data.reduce((s, d) => s + d.total, 0);
  let offset = 0;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        {data.map((d, i) => {
          const frac = total ? d.total / total : 0;
          const len = c * frac;
          const seg = (
            <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none"
              stroke={`color-mix(in oklab, var(--accent) ${Math.round(d.shade * 100)}%, var(--panel-2))`}
              strokeWidth={thickness} strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-offset}
              style={{ transition: "stroke-dashoffset .6s ease, stroke-dasharray .6s ease" }} />
          );
          offset += len;
          return seg;
        })}
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: 21, fontWeight: 800, color: "var(--text)", fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em" }}>{centerLabel}</div>
        {centerSub && <div style={{ fontSize: 11.5, color: "var(--faint)", marginTop: 2 }}>{centerSub}</div>}
      </div>
    </div>
  );
}

// ── 막대 차트 (월별 추이) ─────────────────────────────────────
function Bars({ data, height = 130, valueKey = "total", highlightLast = true, fmt }) {
  const max = Math.max(...data.map((d) => d[valueKey]));
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 14, height }}>
      {data.map((d, i) => {
        const isLast = i === data.length - 1;
        const h = max ? (d[valueKey] / max) * (height - 28) : 0;
        return (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <div style={{ fontSize: 11, color: isLast ? "var(--accent)" : "var(--faint)", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
              {fmt ? fmt(d[valueKey]) : d[valueKey]}
            </div>
            <div style={{
              width: "100%", maxWidth: 46, height: Math.max(h, 3), borderRadius: 6,
              background: isLast && highlightLast ? "var(--accent)" : "var(--bar)",
              transition: "height .5s ease",
            }} />
            <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>{d.label}</div>
          </div>
        );
      })}
    </div>
  );
}

// ── 스파크라인 (일별) ─────────────────────────────────────────
function Spark({ data, width = 220, height = 44, valueKey = "v" }) {
  const max = Math.max(...data.map((d) => d[valueKey]), 1);
  const pts = data.map((d, i) => [(i / (data.length - 1)) * width, height - (d[valueKey] / max) * (height - 6) - 3]);
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const area = `${path} L${width},${height} L0,${height} Z`;
  return (
    <svg width={width} height={height} style={{ display: "block" }}>
      <defs>
        <linearGradient id="sparkfill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.22" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#sparkfill)" />
      <path d={path} fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── 신뢰도 막대 ───────────────────────────────────────────────
function Confidence({ value }) {
  const pct = Math.round(value * 100);
  const tone = value >= 0.95 ? "var(--accent)" : value >= 0.9 ? "#e6b45c" : "#ff8585";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 96 }}>
      <div style={{ flex: 1, height: 5, background: "var(--panel-2)", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: tone, borderRadius: 3 }} />
      </div>
      <span style={{ fontSize: 11.5, fontWeight: 700, color: tone, fontVariantNumeric: "tabular-nums", width: 30 }}>{pct}%</span>
    </div>
  );
}

Object.assign(window, { Icon, Logo, Btn, Card, Pill, Lock, SectionTitle, Donut, Bars, Spark, Confidence });
