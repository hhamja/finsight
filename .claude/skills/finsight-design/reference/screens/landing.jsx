// landing.jsx — UC1 첫 방문자: 로그아웃 상태에서 샘플 분석 미리보기
function Landing({ go }) {
  const cats = byCategory().slice(0, 5);
  const subs = detectSubscriptions();
  const sum = aiSummary();
  return (
    <div style={{ minHeight: "100%", background: "var(--app)" }}>
      {/* nav */}
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "22px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Logo />
        <div style={{ display: "flex", gap: 10 }}>
          <Btn kind="subtle" size="sm" onClick={() => go("signup", { mode: "login" })}>로그인</Btn>
          <Btn kind="primary" size="sm" onClick={() => go("signup", { mode: "signup" })}>시작하기</Btn>
        </div>
      </div>

      {/* hero */}
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "60px 32px 36px", textAlign: "center" }}>
        <Pill tone="accent" style={{ marginBottom: 22 }}><Icon name="sparkles" size={13} /> Claude 기반 명세서 분석</Pill>
        <h1 style={{ fontSize: 52, lineHeight: 1.08, fontWeight: 800, letterSpacing: "-0.035em", margin: "0 0 18px", color: "var(--text)" }}>
          카드 명세서를 올리면,<br />어디서 새는지 바로 보입니다
        </h1>
        <p style={{ fontSize: 17, color: "var(--muted)", maxWidth: 560, margin: "0 auto 30px", lineHeight: 1.6 }}>
          은행·카드사 CSV를 그대로 업로드하세요. 컬럼 자동 인식, 카테고리 분류,
          구독 누수·이중청구 탐지까지 — 수기 입력 없이.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <Btn kind="primary" size="lg" icon="upload" onClick={() => go("signup", { mode: "signup" })}>무료로 분석 시작</Btn>
          <Btn kind="ghost" size="lg" icon="eye" onClick={() => document.getElementById("sample")?.scrollIntoView?.({ behavior: "smooth" })}>샘플 결과 보기</Btn>
        </div>
        <div style={{ fontSize: 12.5, color: "var(--faint)", marginTop: 16 }}>가입 없이 아래 샘플 분석을 먼저 둘러볼 수 있어요 · 원본 CSV는 저장하지 않습니다</div>
      </div>

      {/* 샘플 분석 미리보기 (사전 제작 결과) */}
      <div id="sample" style={{ maxWidth: 1080, margin: "0 auto", padding: "30px 32px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <Pill tone="neutral"><Icon name="file" size={12} /> 샘플 · 신한카드_2026-05.csv</Pill>
          <span style={{ fontSize: 12.5, color: "var(--faint)" }}>로그아웃 상태 미리보기 — 실제 대시보드의 일부입니다</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1.4fr", gap: 16 }}>
          {/* 도넛 */}
          <Card>
            <SectionTitle sub="2026년 5월 · 카테고리 분류">지출 한눈에</SectionTitle>
            <div style={{ display: "flex", gap: 22, alignItems: "center" }}>
              <Donut data={cats} centerLabel={won(totalSpend()).replace("₩", "₩")} centerSub="총 지출" size={150} />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 9 }}>
                {cats.map((c) => (
                  <div key={c.cat} style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 13 }}>
                    <span style={{ width: 9, height: 9, borderRadius: 3, background: `color-mix(in oklab, var(--accent) ${Math.round(c.shade * 100)}%, var(--panel-2))` }} />
                    <span style={{ color: "var(--muted)", flex: 1 }}>{c.label}</span>
                    <span style={{ color: "var(--text)", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{c.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
          {/* AI 요약 + 탐지 */}
          <Card>
            <SectionTitle sub="Claude 요약 · 숫자는 코드가 계산">이번 달 총평</SectionTitle>
            <p style={{ fontSize: 14, lineHeight: 1.65, color: "var(--text)", margin: "0 0 16px" }}>{sum.free}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <DetectRow icon="repeat" tone="accent" title={`구독 ${subs.count}건 · 월 ${won(subs.monthlyTotal)}`} body="매달 자동 결제 중인 정기 구독" />
              <DetectRow icon="copy" tone="danger" title="넷플릭스 이중청구 의심" body="5/13·5/23 동일 금액 ₩17,000 2회" />
              <DetectRow icon="alert" tone="warn" title="배달 지출 급증" body="평소 대비 단건 30%↑" />
            </div>
          </Card>
        </div>
        {/* CTA 오버레이 */}
        <div style={{ position: "relative", marginTop: 16 }}>
          <Card style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--panel-2)" }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text)" }}>내 명세서로 직접 분석해 보세요</div>
              <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 3 }}>가입 30초 · 첫 명세서는 무료로 분석됩니다</div>
            </div>
            <Btn kind="primary" icon="arrowRight" onClick={() => go("signup", { mode: "signup" })}>가입하고 업로드</Btn>
          </Card>
        </div>
      </div>

      {/* 작동 방식 */}
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "50px 32px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
          {[
            { i: "upload", t: "1 · 업로드", b: "은행/카드사 CSV를 그대로. 한글 인코딩(CP949/EUC-KR) 자동 처리." },
            { i: "sparkles", t: "2 · 자동 인식", b: "Claude가 날짜·금액·가맹점 컬럼을 찾아 정규화. 매핑과 신뢰도를 공개." },
            { i: "chart", t: "3 · 분석", b: "카테고리·추이·누수 탐지. 모든 합계는 코드가 결정론적으로 계산." },
          ].map((s) => (
            <Card key={s.t} hover>
              <Icon name={s.i} size={22} color="var(--accent)" />
              <div style={{ fontWeight: 700, fontSize: 15, marginTop: 14, color: "var(--text)" }}>{s.t}</div>
              <div style={{ fontSize: 13.5, color: "var(--muted)", marginTop: 6, lineHeight: 1.55 }}>{s.b}</div>
            </Card>
          ))}
        </div>
      </div>

      {/* footer */}
      <div style={{ borderTop: "1px solid var(--border)", marginTop: 20 }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "26px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <span style={{ fontSize: 12.5, color: "var(--faint)" }}>© 2026 FinSight · 데이터는 분석 후 집계만 보관, 원본 CSV·거래내역 미저장</span>
          <div style={{ display: "flex", gap: 18, fontSize: 12.5 }}>
            <a href="#" onClick={(e) => e.preventDefault()} style={{ color: "var(--muted)", textDecoration: "none" }}>이용약관</a>
            <a href="#" onClick={(e) => e.preventDefault()} style={{ color: "var(--muted)", textDecoration: "none" }}>개인정보처리방침</a>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetectRow({ icon, tone, title, body }) {
  const c = { accent: "var(--accent)", danger: "#ff8585", warn: "#e6b45c" }[tone];
  return (
    <div style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
      <span style={{ marginTop: 1, flexShrink: 0 }}><Icon name={icon} size={16} color={c} /></span>
      <div>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text)" }}>{title}</div>
        <div style={{ fontSize: 12.5, color: "var(--faint)", marginTop: 1 }}>{body}</div>
      </div>
    </div>
  );
}

Object.assign(window, { Landing, DetectRow });
