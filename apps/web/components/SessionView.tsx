"use client";

import type { SessionPayload } from "@lucky/api-client";
import type { ConcernId } from "@lucky/core";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Stamp } from "./ui";

/**
 * 상담 세션 (웹 프리뷰) — 고민 1개 집중: 진단→근거→시기→처방→마무리→다음.
 * 무료는 진단까지, 근거·시기·처방은 주제 단위 해금(원칙 9 동의).
 */

const POS_LABEL: Record<string, string> = { hour: "시", day: "일", month: "월", year: "연" };
const EYEBROW: Record<string, string> = {
  session_diagnosis: "하나 · 진단",
  session_reason: "둘 · 근거",
  session_timing: "셋 · 시기",
  session_remedy: "넷 · 처방",
};

export function SessionView({ token, concern }: { token: string; concern: string }) {
  const router = useRouter();
  const [p, setP] = useState<SessionPayload | null>(null);
  const [err, setErr] = useState("");
  const [i, setI] = useState(0);
  const [unlocking, setUnlocking] = useState(false);

  const load = useCallback(async () => {
    const r = await fetch("/api/session", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token, concern: concern as ConcernId, ctx: { season: "2026H2", mode: "mz" } }),
    });
    const d = (await r.json()) as SessionPayload & { error?: string };
    if (!r.ok) throw new Error(d.error ?? "세션을 불러오지 못했어요.");
    setP(d);
  }, [token, concern]);

  useEffect(() => {
    load().catch((e: Error) => setErr(e.message));
  }, [load]);

  const unlock = useCallback(async () => {
    setUnlocking(true);
    try {
      const r = await fetch("/api/session/unlock", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token, concern, withdrawalConsent: true }),
      });
      if (!r.ok) throw new Error("해금에 실패했어요.");
      await load(); // 유료 4비트로 재조회
      setI(1); // 진단 다음(근거)부터 이어보기
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setUnlocking(false);
    }
  }, [token, concern, load]);

  const cards = useMemo(() => (p ? buildCards(p, router, unlock, unlocking) : []), [p, router, unlock, unlocking]);

  if (err) {
    return (
      <main className="screen" style={{ justifyContent: "center", alignItems: "center", textAlign: "center" }}>
        <p className="sub">{err}</p>
        <div style={{ height: 16 }} />
        <a className="btn ink" href="/input">처음으로</a>
      </main>
    );
  }
  if (!p) {
    return (
      <main className="screen" style={{ justifyContent: "center", alignItems: "center" }}>
        <Stamp char="緣" size={40} />
        <div style={{ height: 16 }} />
        <p className="sub">도사가 헤아리는 중…</p>
      </main>
    );
  }

  const card = cards[i]!;
  const last = i >= cards.length - 1;

  return (
    <main className="screen" style={{ paddingBottom: 120 }}>
      <div className="hstack">
        <Stamp char="緣" size={36} />
        <span style={{ fontSize: 12, letterSpacing: "0.12em", color: "var(--ink-40)", fontWeight: 500 }}>
          {p.concern.label} · 상담
        </span>
      </div>

      <div className="grow" />
      <div key={card.key} style={{ animation: "fade .35s ease" }}>{card.node}</div>
      <div className="grow" />

      <div style={{ position: "fixed", left: 0, right: 0, bottom: 0, maxWidth: 480, margin: "0 auto", padding: "16px 24px 24px", background: "linear-gradient(to top, var(--paper) 65%, transparent)" }}>
        {card.action ?? (!last ? <button className="btn ink" onClick={() => setI((x) => x + 1)}>다음</button> : null)}
        <div style={{ height: 12 }} />
        <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
          {cards.map((_, k) => (
            <span key={k} style={{ width: 6, height: 6, borderRadius: 3, background: k === i ? "var(--vermil)" : "var(--paper-dk)" }} />
          ))}
        </div>
      </div>
      <style>{`@keyframes fade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}`}</style>
    </main>
  );
}

type CardItem = { key: string; node: ReactNode; action?: ReactNode };

function buildCards(
  p: SessionPayload,
  router: ReturnType<typeof useRouter>,
  unlock: () => void,
  unlocking: boolean,
): CardItem[] {
  const byKind = (k: string) => p.beats.find((b) => b.kind === k);
  const diagnosis = byKind("session_diagnosis");
  const q: React.CSSProperties = { fontFamily: "var(--serif)", fontWeight: 900, fontSize: 29, lineHeight: 1.42, color: "var(--ink)" };
  const body: React.CSSProperties = { fontFamily: "var(--sans)", fontSize: 16.5, lineHeight: 1.65, color: "var(--ink)" };
  const eyebrow: React.CSSProperties = { fontSize: 12, letterSpacing: "0.32em", color: "var(--ink-40)", fontWeight: 600 };
  const cards: CardItem[] = [];

  cards.push({
    key: "diag",
    node: (
      <>
        <div style={eyebrow}>{EYEBROW.session_diagnosis}</div>
        <div style={{ height: 18 }} />
        <p style={q}>{diagnosis?.text}</p>
        <div style={{ height: 16 }} />
        <p className="sub">넘겨서 왜 그런지 — 당신 사주의 근거를 볼게요.</p>
      </>
    ),
  });

  if (p.paid) {
    cards.push({
      key: "reason",
      node: (
        <>
          <div style={eyebrow}>{EYEBROW.session_reason}</div>
          <div style={{ height: 14 }} />
          <div style={{ display: "flex", gap: 8 }}>
            {p.chart.pillars.map((pl) => {
              const day = pl.position === "day";
              return (
                <div key={pl.position} style={{ flex: 1, textAlign: "center", borderRadius: 12, padding: "12px 0", background: day ? "var(--ink)" : "var(--white)", border: "1px solid var(--paper-dk)" }}>
                  <div style={{ fontSize: 10, color: day ? "rgba(255,255,255,.6)" : "var(--ink-40)", marginBottom: 5 }}>{POS_LABEL[pl.position]}</div>
                  <div style={{ fontFamily: "var(--serif)", fontWeight: 900, fontSize: 23, color: day ? "var(--paper)" : "var(--ink)" }}>{pl.stemHanja}</div>
                  <div style={{ fontFamily: "var(--serif)", fontWeight: 900, fontSize: 23, color: "var(--vermil)" }}>{pl.branchHanja}</div>
                </div>
              );
            })}
          </div>
          <div style={{ height: 18 }} />
          <p style={body}>{byKind("session_reason")?.text}</p>
        </>
      ),
    });
    cards.push({
      key: "timing",
      node: (
        <>
          <div style={eyebrow}>{EYEBROW.session_timing}</div>
          <div style={{ height: 16 }} />
          <p style={body}>{byKind("session_timing")?.text}</p>
        </>
      ),
    });
    cards.push({
      key: "remedy",
      node: (
        <>
          <div className="hstack"><Stamp char="運" size={36} /><span style={eyebrow}>{EYEBROW.session_remedy}</span></div>
          <div style={{ height: 16 }} />
          <p style={body}>{byKind("session_remedy")?.text}</p>
          <div style={{ height: 16 }} />
          <div className="card"><div style={{ fontSize: 11, color: "var(--ink-40)", letterSpacing: "0.2em", marginBottom: 6 }}>당신의 색</div><div style={{ fontWeight: 700 }}>{p.chart.remedy.colors.join(" · ")} · {p.chart.remedy.direction}</div></div>
        </>
      ),
    });
    cards.push({
      key: "close",
      node: (
        <div style={{ textAlign: "center" }}>
          <Stamp char="緣" size={64} />
          <div style={{ height: 22 }} />
          <p style={{ fontFamily: "var(--serif)", fontWeight: 900, fontSize: 27, lineHeight: 1.45, color: "var(--vermil)" }}>{p.pivot ?? diagnosis?.text}</p>
          <div style={{ height: 16 }} />
          <p className="sub">— {p.concern.label}, 여기까지 봤어요.</p>
        </div>
      ),
      action: <button className="btn ink" onClick={() => router.push(nextHref(p))}>이어서, 다음이 궁금해요</button>,
    });
  } else {
    cards.push({
      key: "pay",
      node: (
        <>
          <div style={eyebrow}>이 상담 하나 열기</div>
          <div style={{ height: 14 }} />
          <div style={{ border: "1px dashed var(--gold)", borderRadius: 14, padding: 18, textAlign: "center" }}>
            <p style={{ fontFamily: "var(--serif)", fontWeight: 900, fontSize: 18, lineHeight: 1.5 }}>근거 · 시기 · 처방<br />세 장을 이어서 봅니다</p>
            <div style={{ height: 14 }} />
            <div style={{ display: "flex", gap: 8 }}>
              {["근거", "시기", "처방"].map((t) => (
                <div key={t} style={{ flex: 1, textAlign: "center", padding: "12px 0", borderRadius: 12, background: "var(--white)", border: "1px solid var(--paper-dk)", opacity: 0.5, fontFamily: "var(--serif)", fontWeight: 900, color: "var(--ink-40)" }}>{t}</div>
              ))}
            </div>
          </div>
          <div style={{ height: 12 }} />
          <div className="card"><p style={{ fontSize: 12.5, color: "var(--ink-70)", lineHeight: 1.5 }}>구매 전 안내 · 콘텐츠 특성상 열람 즉시 청약철회가 제한됩니다. 아래를 눌러 동의하고 진행합니다.</p></div>
        </>
      ),
      action: (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <button className="btn" style={{ background: "var(--gold)", color: "#fff" }} disabled={unlocking} onClick={unlock}>
            {unlocking ? "여는 중…" : "동의하고 열기 · 990원"}
          </button>
          <button className="btn ghost" onClick={() => router.push(`/s/${p.token}`)}>다른 고민부터 볼래요</button>
        </div>
      ),
    });
  }

  return cards;
}

function nextHref(p: SessionPayload): string {
  if (p.next?.concern) return `/s/${p.token}/${p.next.concern}`;
  if (p.next?.sku === "taekil") return "/vertical/taekil";
  return `/s/${p.token}`;
}
