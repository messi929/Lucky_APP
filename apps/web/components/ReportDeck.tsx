"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReportPayload } from "@lucky/api-client";
import type { Mode, Reaction, ResolvedUnit } from "@lucky/core";
import { AskBox } from "./AskBox";
import { BrushIntro } from "./BrushIntro";
import { CompatInvite } from "./CompatInvite";
import { ElementChart } from "./ElementChart";
import { ModeToggle } from "./ModeToggle";
import { Dots, InkCircle, Stamp } from "./ui";
import { track } from "@/lib/track";

const REACTIONS: { key: Reaction; label: string }[] = [
  { key: "soul", label: "소름 돋았어요 😳" },
  { key: "half", label: "반 정도는요" },
  { key: "skeptic", label: "글쎄요, 잘 모르겠는데" },
];

export function ReportDeck({ initial }: { initial: ReportPayload }) {
  const [payload, setPayload] = useState(initial);
  const [mode, setMode] = useState<Mode>(initial.adaptive.defaultMode);
  const [reaction, setReaction] = useState<Reaction | undefined>();
  const [showIntro, setShowIntro] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.mode = mode;
  }, [mode]);
  useEffect(() => {
    if (!showIntro) track("report_view", { token: payload.token });
  }, [showIntro, payload.token]);

  async function reload(patch: { mode?: Mode; reaction?: Reaction }) {
    setLoading(true);
    const ctx = {
      season: "",
      mode: patch.mode ?? mode,
      ...((patch.reaction ?? reaction) ? { reaction: patch.reaction ?? reaction } : {}),
    };
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token: payload.token, ctx }),
      });
      if (res.ok) setPayload((await res.json()) as ReportPayload);
    } finally {
      setLoading(false);
    }
  }

  const u = useMemo(() => unitMap(payload.units), [payload]);
  const c = payload.chart;
  const iljuHanja = c.pillars.find((p) => p.position === "day");
  const ilju = iljuHanja ? `${iljuHanja.stemKo}${iljuHanja.branchKo} ${iljuHanja.stemHanja}${iljuHanja.branchHanja}` : "";
  const dayHanja = iljuHanja?.stemHanja ?? "";

  if (showIntro) return <BrushIntro pillars={c.pillars} onDone={() => setShowIntro(false)} />;

  return (
    <div>
      <ModeToggle mode={mode} onChange={(m) => { setMode(m); void reload({ mode: m }); }} />

      {/* 1 단정형 훅 (ON-2) */}
      <section className="screen">
        <div className="hstack" style={{ gap: 8 }}>
          <span className="eyebrow" style={{ letterSpacing: "0.3em" }}>당신의 일주</span>
          <span style={{ fontFamily: "var(--serif)", fontWeight: 700, fontSize: 13, color: "var(--vermil)" }}>{ilju}</span>
        </div>
        <div className="grow" />
        <div className="h-serif" style={{ fontSize: 32, lineHeight: 1.5 }}>{u.ilju_hook ?? "…"}</div>
        <div style={{ height: 24 }} />
        <div className="hstack"><Stamp char="眞" /><span className="sub">당신의 팔자가 그렇게 말하고 있어요</span></div>
        <div className="grow" />
        <Dots total={7} active={0} />
      </section>

      {/* 2 나의 팔자 + 오행 (R2) */}
      <section className="screen">
        <div className="eyebrow">나의 팔자</div>
        <div style={{ height: 16 }} />
        <div style={{ display: "flex", gap: 8 }}>
          {c.pillars.map((p) => {
            const isDay = p.position === "day";
            return (
              <div key={p.position} style={{ flex: 1, textAlign: "center", borderRadius: 12, padding: "14px 0", background: isDay ? "var(--ink)" : "var(--white)", border: isDay ? "none" : "1px solid var(--paper-dk)" }}>
                <div className="fine" style={{ marginBottom: 6, color: isDay ? "var(--paper)" : undefined }}>{POS_LABEL[p.position]}</div>
                <div style={{ fontFamily: "var(--serif)", fontWeight: 900, fontSize: 30, color: isDay ? "var(--paper)" : "var(--ink)" }}>{p.stemHanja}</div>
                <div style={{ fontFamily: "var(--serif)", fontWeight: 900, fontSize: 30, color: isDay ? "var(--paper)" : "var(--ink)" }}>{p.branchHanja}</div>
                <div className="fine" style={{ marginTop: 6, fontSize: 11, color: isDay ? "var(--paper)" : "var(--ink-70)" }}>{p.stemKo}{p.branchKo}</div>
              </div>
            );
          })}
        </div>
        <div style={{ height: 6 }} />
        <div className="fine" style={{ fontSize: 12 }}>일주가 당신의 본체 — {ilju}</div>

        <div style={{ height: 24 }} />
        <div style={{ fontWeight: 700, fontSize: 15 }}>오행의 균형</div>
        <div style={{ height: 10 }} />
        <ElementChart fiveElements={c.fiveElements} />

        {u.element_balance && (
          <div className="card" style={{ marginTop: 14 }}>
            <div className="sub" style={{ fontSize: 13 }}>{u.element_balance}</div>
          </div>
        )}
        {c.boundary.isBoundary && c.boundary.note && (
          <div className="card" style={{ marginTop: 8, borderColor: "var(--vermil)" }}>
            <div className="sub" style={{ fontSize: 12 }}>{c.boundary.note}</div>
          </div>
        )}

        {/* 오늘의 한 줄 */}
        <div style={{ marginTop: 12, background: "var(--ink)", borderRadius: 16, padding: 18 }}>
          <div style={{ fontSize: 11, letterSpacing: "0.2em", color: "#CCC5BB", marginBottom: 8 }}>오늘의 한 줄 · {payload.daily.todayGanji}일</div>
          <div style={{ fontFamily: "var(--serif)", fontWeight: 700, fontSize: 16, color: "var(--paper)", lineHeight: 1.5 }}>{payload.daily.line}</div>
        </div>
        <div className="grow" />
        <Dots total={7} active={1} />
      </section>

      {/* 3 타입 카드 (ON-3) */}
      <section className="screen center">
        <div className="eyebrow">나의 타입</div>
        <div className="grow" />
        <InkCircle char={dayHanja} size={220} />
        <div style={{ height: 28 }} />
        <div className="h-serif" style={{ fontSize: 30, letterSpacing: "0.05em" }}>{c.character.name}</div>
        <div style={{ height: 8 }} />
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8 }}>
          {c.character.keywords.map((k) => (<span key={k} className="chip">{k}</span>))}
        </div>
        <div className="grow" />
        <Dots total={7} active={2} />
      </section>

      {/* 반응 체크 (R-반응) */}
      <section className="screen center">
        <div className="grow" />
        <Stamp char="問" size={40} />
        <div style={{ height: 20 }} />
        <div className="h-serif" style={{ fontSize: 28 }}>여기까지,<br />어때요. 좀 맞나요?</div>
        <div style={{ height: 28 }} />
        <div className="vstack">
          {REACTIONS.map((r) => (
            <button
              key={r.key}
              onClick={() => { setReaction(r.key); track("reaction_tap", { reaction: r.key }); void reload({ reaction: r.key }); }}
              className={`btn ${reaction === r.key ? "ink" : ""}`}
              style={reaction === r.key ? {} : { background: "var(--white)", border: "1px solid var(--paper-dk)", color: "var(--ink)" }}
            >
              {r.label}
            </button>
          ))}
        </div>
        <div style={{ height: 14 }} />
        <div className="fine">어느 쪽이든 좋아요 — 다음 이야기가 달라질 뿐</div>
        <div className="grow" />
      </section>

      {/* 4 성격 코어 */}
      <section className="screen">
        <div className="eyebrow">성격의 코어</div>
        <div style={{ height: 20 }} />
        <div className="h-serif" style={{ fontSize: 24, whiteSpace: "pre-line" }}>{u.personality_core ?? "…"}</div>
        <div className="grow" />
        <Dots total={7} active={3} />
      </section>

      {/* 고민 문답 (R-고민) */}
      <section className="screen">
        <Stamp char="答" />
        <div style={{ height: 16 }} />
        <div className="h-serif" style={{ fontSize: 28 }}>그래서, 요즘<br />뭐가 제일 답답해요?</div>
        <div style={{ height: 8 }} />
        <div className="sub">하나만 골라주세요. 뒤 이야기가 그쪽으로 갑니다.</div>
        <div style={{ height: 20 }} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {payload.adaptive.concerns.map((co) => (
            <a
              key={co.id}
              href={`/s/${payload.token}/${co.id}`}
              className="tile"
              style={{ textAlign: "left", borderColor: "var(--paper-dk)", borderWidth: 1, textDecoration: "none", color: "inherit" }}
            >
              <div className="tt">{co.label}</div>
            </a>
          ))}
        </div>
        <div style={{ height: 14 }} />
        <a
          href={`/s/${payload.token}`}
          style={{ fontSize: 13, fontWeight: 500, color: "var(--vermil)", textDecoration: "none" }}
        >
          다른 고민 보기 — 자녀·택일·건강한 한 해 …
        </a>
        <div className="grow" />
        <Dots total={7} active={4} />
      </section>

      {/* 5 하반기 운 (R5) */}
      {u.seasonal_fortune && (
        <section className="screen">
          <div className="eyebrow" style={{ letterSpacing: "0.2em" }}>2026 하반기</div>
          <div style={{ height: 20 }} />
          <div className="h-serif" style={{ fontSize: 26 }}>{u.seasonal_fortune}</div>
          <div className="grow" />
          <Dots total={7} active={5} />
        </section>
      )}

      {/* 6 조심할 것 티저 (R6) */}
      <section className="screen">
        <div className="eyebrow">조심할 것</div>
        <div style={{ height: 20 }} />
        <div className="card" style={{ padding: "18px 16px" }}>
          <div style={{ fontSize: 12, fontWeight: 500, letterSpacing: "0.1em", color: "var(--vermil)", marginBottom: 8 }}>
            {payload.paid ? "당신의 원국이 말하는 주의점" : "하나는 그냥 알려드릴게요"}
          </div>
          <div style={{ fontFamily: "var(--serif)", fontWeight: 700, fontSize: 19, lineHeight: 1.5 }}>
            {payload.paid ? u.caution : firstSentence(u.caution)}
          </div>
        </div>
        {!payload.paid && (
          <>
            {[0, 1, 2].map((i) => (
              <div key={i} className="card" style={{ padding: "18px 16px", marginTop: i === 0 ? 10 : 6 }}>
                <span style={{ display: "block", width: `${70 - i * 8}%`, height: 12, borderRadius: 6, background: "rgba(141,135,125,.16)", marginBottom: 8 }} />
                <span style={{ display: "block", width: `${55 - i * 6}%`, height: 12, borderRadius: 6, background: "rgba(141,135,125,.11)" }} />
              </div>
            ))}
            <div className="grow" />
            <div className="sub" style={{ textAlign: "center", fontSize: 13, marginBottom: 10 }}>나머지 셋 + 월별 캘린더는 복채를 내면 열립니다</div>
            <a href={`/pay?token=${payload.token}&sku=full_report`} onClick={() => track("paywall_view", { from: "caution" })} className="btn ink">
              복채 내고 마저 보기 · 3,900원
            </a>
          </>
        )}
        {payload.paid && <><div className="grow" /><Dots total={7} active={6} /></>}
      </section>

      {/* 7 개운 처방전 (ON-4, 공유 카드) */}
      <section className="screen">
        <div className="hstack"><Stamp char="運" /><span className="h-serif" style={{ fontSize: 22, letterSpacing: "0.05em" }}>개운 처방전</span></div>
        <div style={{ height: 6 }} />
        <div className="eyebrow" style={{ letterSpacing: "0.1em" }}>2026 하반기 · {ilju}</div>
        <div style={{ height: 20 }} />
        <div className="vstack" style={{ gap: 6 }}>
          <RemedyRow label="당신의 색" value={c.remedy.colors.join(" · ")} />
          <RemedyRow label="좋은 방향" value={c.remedy.direction} />
          <RemedyRow label="올해의 한 가지" value={c.remedy.oneThing} />
        </div>
        <div className="grow" />
        <div className="fine" style={{ letterSpacing: "0.1em" }}>팔자 리포트 · paljareport.com</div>
        <div style={{ height: 10 }} />
        <button onClick={() => { track("share_click", { channel: "kakao", kind: "remedy" }); }} className="btn kakao">카카오톡으로 공유</button>
        <div style={{ height: 6 }} />
        <a href={`/api/og/story/${payload.token}`} target="_blank" rel="noreferrer" onClick={() => track("share_click", { channel: "save" })} className="btn ink">이미지 저장 · 스토리용 9:16</a>
      </section>

      {/* 8 CTA 허브 (R8) */}
      <section className="screen">
        <Stamp char="緣" />
        <div style={{ height: 16 }} />
        <div className="h-serif" style={{ fontSize: 28 }}>여기서부터는<br />당신이 고를 차례</div>
        {payload.paid && (<div style={{ marginTop: 16 }}><AskBox token={payload.token} mode={mode} /></div>)}
        <div className="grow" />
        <div className="vstack">
          {!payload.paid && (
            <a href={`/pay?token=${payload.token}&sku=full_report`} onClick={() => track("paywall_view", { from: "cta" })} style={{ background: "var(--ink)", borderRadius: 16, padding: 18 }}>
              <div style={{ fontWeight: 700, fontSize: 16, color: "var(--paper)", marginBottom: 4 }}>복채 내고 하나 묻기</div>
              <div style={{ fontSize: 12, color: "#CCC5BB" }}>궁금한 것 하나, 팔자로 답해드려요</div>
            </a>
          )}
          <CompatInvite token={payload.token} />
          <a href={`/pay?token=${payload.token}&sku=full_report&gift=1`} className="card" style={{ borderRadius: 16, padding: 18, display: "block" }}>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>선물하기</div>
            <div className="fine" style={{ fontSize: 12 }}>생일인 그 사람에게 사주 리포트를</div>
          </a>
          <button onClick={() => track("app_install_click")} className="card" style={{ borderRadius: 16, padding: 18, textAlign: "left" }}>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>매일 아침, 오늘의 한 줄</div>
            <div className="fine" style={{ fontSize: 12 }}>앱에서 푸시로 받아보기</div>
          </button>
        </div>
        <div style={{ height: 16 }} />
        <p className="fine">{payload.disclaimer}</p>
      </section>

      {loading && (
        <div style={{ position: "fixed", bottom: 12, left: "50%", transform: "translateX(-50%)", fontSize: 12, color: "var(--ink-70)", background: "rgba(255,255,255,.85)", borderRadius: 100, padding: "4px 12px" }}>
          다시 헤아리는 중…
        </div>
      )}
    </div>
  );
}

const POS_LABEL: Record<string, string> = { hour: "시", day: "일", month: "월", year: "연" };

function RemedyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="card">
      <div className="fl" style={{ fontSize: 11, color: "var(--ink-40)", letterSpacing: "0.15em", marginBottom: 2 }}>{label}</div>
      <div style={{ fontWeight: 700 }}>{value}</div>
    </div>
  );
}

function unitMap(units: ResolvedUnit[]): Partial<Record<string, string>> {
  const m: Record<string, string> = {};
  for (const un of units) m[un.kind] = un.text;
  return m;
}

function firstSentence(text?: string): string {
  if (!text) return "…";
  const idx = text.search(/[.。!?]/);
  return idx > 0 ? text.slice(0, idx + 1) : text;
}
