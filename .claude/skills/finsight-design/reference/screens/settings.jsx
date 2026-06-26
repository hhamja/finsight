// settings.jsx — 데이터 통제: 이력·계정 삭제(개인정보 파기) + 플랜
function Settings({ go, plan, setPlan }) {
  const [modal, setModal] = React.useState(null); // 'history' | 'account'

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "36px 28px 80px" }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.025em", margin: "0 0 26px", color: "var(--text)" }}>설정</h1>

      {/* 계정 */}
      <SectionTitle sub="로그인 정보">계정</SectionTitle>
      <Card pad={0} style={{ marginBottom: 26 }}>
        <Row label="이메일" value="you@example.com" />
        <Row label="가입일" value="2026.02.14" last />
      </Card>

      {/* 플랜 */}
      <SectionTitle sub="구독 상태 · 결제">플랜</SectionTitle>
      <Card style={{ marginBottom: 26, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ display: "grid", placeItems: "center", width: 40, height: 40, borderRadius: 11, background: plan === "pro" ? "var(--accent-dim)" : "var(--panel-2)" }}>
            <Icon name={plan === "pro" ? "bolt" : "file"} size={20} color={plan === "pro" ? "var(--accent)" : "var(--muted)"} />
          </span>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>{plan === "pro" ? "FinSight Pro" : "Free"}</div>
            <div style={{ fontSize: 12.5, color: "var(--faint)", marginTop: 2 }}>{plan === "pro" ? "₩9,900/월 · 다음 결제 2026.06.30" : "일일 분석 횟수 제한 · 단건 분석"}</div>
          </div>
        </div>
        {plan === "pro"
          ? <Btn kind="ghost" size="sm" onClick={() => go("paywall")}>구독 관리</Btn>
          : <Btn kind="primary" size="sm" icon="bolt" onClick={() => go("paywall")}>Pro 업그레이드</Btn>}
      </Card>

      {/* 데이터 통제 */}
      <SectionTitle sub="저장되는 데이터는 집계 결과뿐 — 원본 CSV·거래내역은 보관하지 않습니다">데이터 통제 · 개인정보 파기</SectionTitle>
      <Card pad={0}>
        <DangerRow
          title="분석 이력 전체 삭제"
          desc="저장된 월별 집계를 모두 지웁니다. 되돌릴 수 없어요."
          action="이력 삭제" onClick={() => setModal("history")} />
        <DangerRow
          title="계정 삭제"
          desc="계정과 모든 데이터(집계 포함)를 영구 파기합니다."
          action="계정 삭제" onClick={() => setModal("account")} last />
      </Card>

      <div style={{ marginTop: 24, display: "flex", gap: 16, fontSize: 12.5 }}>
        <a href="#" onClick={(e) => e.preventDefault()} style={{ color: "var(--muted)", textDecoration: "none" }}>이용약관</a>
        <a href="#" onClick={(e) => e.preventDefault()} style={{ color: "var(--muted)", textDecoration: "none" }}>개인정보처리방침</a>
        <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 6, color: "var(--faint)", cursor: "pointer" }} onClick={() => go("landing")}>
          <Icon name="logout" size={13} /> 로그아웃
        </span>
      </div>

      {modal && (
        <ConfirmModal
          danger
          title={modal === "history" ? "분석 이력을 모두 삭제할까요?" : "계정을 삭제할까요?"}
          body={modal === "history"
            ? "저장된 월별 집계가 영구 삭제됩니다. 다음 방문 시 추이가 비어 있게 돼요."
            : "계정과 모든 데이터가 영구 파기됩니다. 이 작업은 되돌릴 수 없습니다."}
          confirmLabel={modal === "history" ? "이력 삭제" : "계정 영구 삭제"}
          onCancel={() => setModal(null)}
          onConfirm={() => { setModal(null); if (modal === "account") go("landing"); }}
        />
      )}
    </div>
  );
}

function DangerRow({ title, desc, action, onClick, last }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "16px 20px", borderBottom: last ? "none" : "1px solid var(--border)" }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{title}</div>
        <div style={{ fontSize: 12.5, color: "var(--faint)", marginTop: 3 }}>{desc}</div>
      </div>
      <Btn kind="danger" size="sm" icon="trash" onClick={onClick}>{action}</Btn>
    </div>
  );
}

function ConfirmModal({ title, body, confirmLabel, onCancel, onConfirm, danger }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "grid", placeItems: "center", zIndex: 100, padding: 20 }} onClick={onCancel}>
      <Card style={{ width: 400, animation: "pop .15s ease" }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
          <span style={{ flexShrink: 0, display: "grid", placeItems: "center", width: 38, height: 38, borderRadius: 10, background: "#2a1718" }}>
            <Icon name="alert" size={20} color="#ff8585" />
          </span>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text)" }}>{title}</div>
            <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 5, lineHeight: 1.55 }}>{body}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
          <Btn kind="ghost" size="sm" onClick={onCancel}>취소</Btn>
          <Btn kind="danger" size="sm" icon="trash" onClick={onConfirm} style={{ background: "#ff6b6b", color: "#fff", border: "1px solid #ff6b6b" }}>{confirmLabel}</Btn>
        </div>
      </Card>
    </div>
  );
}

Object.assign(window, { Settings, DangerRow, ConfirmModal });
