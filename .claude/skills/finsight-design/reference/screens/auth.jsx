// auth.jsx — 가입/로그인 (UC1→UC2 진입)
function Auth({ go, mode: initialMode }) {
  const [mode, setMode] = React.useState(initialMode || "signup");
  const isSignup = mode === "signup";
  return (
    <div style={{ minHeight: "100%", background: "var(--app)", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "22px 32px" }}>
        <span style={{ cursor: "pointer" }} onClick={() => go("landing")}><Logo /></span>
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px 32px 80px" }}>
        <Card style={{ width: 380 }} pad={28}>
          <div style={{ fontSize: 21, fontWeight: 800, letterSpacing: "-0.02em", color: "var(--text)" }}>
            {isSignup ? "FinSight 시작하기" : "다시 오신 걸 환영해요"}
          </div>
          <div style={{ fontSize: 13.5, color: "var(--muted)", marginTop: 6, marginBottom: 22 }}>
            {isSignup ? "첫 명세서 분석은 무료입니다." : "계정에 로그인하세요."}
          </div>

          <Btn kind="ghost" size="lg" style={{ width: "100%", marginBottom: 16 }}
            onClick={() => go(isSignup ? "upload" : "dashboard")}>
            <span style={{ fontWeight: 700 }}>G</span> Google로 계속
          </Btn>

          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "4px 0 16px" }}>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
            <span style={{ fontSize: 12, color: "var(--faint)" }}>또는</span>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          </div>

          <Field label="이메일" placeholder="you@example.com" />
          <Field label="비밀번호" placeholder="••••••••" type="password" />

          <Btn kind="primary" size="lg" style={{ width: "100%", marginTop: 8 }}
            onClick={() => go(isSignup ? "upload" : "dashboard")}>
            {isSignup ? "가입하고 명세서 올리기" : "로그인"}
          </Btn>

          <div style={{ textAlign: "center", fontSize: 13, color: "var(--muted)", marginTop: 18 }}>
            {isSignup ? "이미 계정이 있나요? " : "계정이 없나요? "}
            <span style={{ color: "var(--accent)", cursor: "pointer", fontWeight: 600 }}
              onClick={() => setMode(isSignup ? "login" : "signup")}>
              {isSignup ? "로그인" : "가입하기"}
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Field({ label, placeholder, type = "text" }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--muted)", marginBottom: 6 }}>{label}</div>
      <input type={type} placeholder={placeholder} readOnly
        style={{
          width: "100%", boxSizing: "border-box", padding: "11px 13px", borderRadius: 9,
          background: "var(--panel-2)", border: "1px solid var(--border)", color: "var(--text)",
          fontSize: 14, outline: "none", fontFamily: "inherit",
        }}
        onFocus={(e) => (e.target.style.borderColor = "var(--accent-border)")}
        onBlur={(e) => (e.target.style.borderColor = "var(--border)")} />
    </div>
  );
}

Object.assign(window, { Auth, Field });
