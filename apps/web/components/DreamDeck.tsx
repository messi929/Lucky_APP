"use client";

import type { DreamPayload } from "@lucky/api-client";
import {
  DREAM_CATEGORY_LABEL,
  DREAM_MOOD_LABEL,
  dreamSymbolsByCategory,
  type DreamCategory,
  type DreamMood,
  type DreamSymbolId,
} from "@lucky/core";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Stamp } from "./ui";
import { track } from "@/lib/track";

/**
 * 꿈 해석 덱 (DREAM-DESIGN §4). 상징 선택 → 감정 → 통설 → 내 해석 → 잇기.
 * 카드 1장 = 뷰포트 1화면(원칙 7). 무료 — 결제 유도 없음, 마지막에 사주로 잇기만.
 *
 * 상징은 **1개만** 고르게 한다. 2개를 허용하면 조합이 1,770가지가 되어
 * 캐시 적중률이 무너지고 무료 기능의 비용 전제가 깨진다(DREAM-DESIGN §2).
 */

const CATEGORIES: DreamCategory[] = ["animal", "nature", "body", "person", "event", "thing"];
const MOODS: DreamMood[] = ["fear", "relief", "sad", "odd"];

type Step = "symbol" | "mood" | "classic" | "reading" | "bridge";

export function DreamDeck({ token }: { token: string }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("symbol");
  const [cat, setCat] = useState<DreamCategory>("animal");
  const [symbol, setSymbol] = useState<DreamSymbolId | null>(null);
  const [mood, setMood] = useState<DreamMood | null>(null);
  const [p, setP] = useState<DreamPayload | null>(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const read = useCallback(
    async (sym: DreamSymbolId, mo: DreamMood) => {
      setBusy(true);
      setErr("");
      try {
        const r = await fetch("/api/dream", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ token, symbol: sym, mood: mo }),
        });
        const d = (await r.json()) as DreamPayload & { error?: string };
        if (!r.ok) throw new Error(d.error ?? "해몽을 불러오지 못했어요.");
        setP(d);
        setStep("classic");
      } catch (e) {
        setErr((e as Error).message);
      } finally {
        setBusy(false);
      }
    },
    [token],
  );

  const byKind = (k: string): string => p?.units.find((u) => u.kind === k)?.text ?? "";

  const eyebrow: React.CSSProperties = {
    fontSize: 12,
    letterSpacing: "0.32em",
    color: "var(--ink-40)",
    fontWeight: 600,
  };
  const q: React.CSSProperties = {
    fontFamily: "var(--serif)",
    fontWeight: 900,
    fontSize: 27,
    lineHeight: 1.45,
    color: "var(--ink)",
  };
  const body: React.CSSProperties = {
    fontFamily: "var(--sans)",
    fontSize: 16.5,
    lineHeight: 1.65,
    color: "var(--ink)",
  };

  if (err) {
    return (
      <main className="screen" style={{ justifyContent: "center", alignItems: "center", textAlign: "center" }}>
        <p className="sub">{err}</p>
        <div style={{ height: 16 }} />
        <button className="btn ink" onClick={() => { setErr(""); setStep("symbol"); }}>
          다시 고르기
        </button>
      </main>
    );
  }

  return (
    <main className="screen" style={{ paddingBottom: 120 }}>
      <div className="hstack">
        <Stamp char={step === "bridge" ? "運" : "夢"} size={36} />
        <span style={{ fontSize: 12, letterSpacing: "0.12em", color: "var(--ink-40)", fontWeight: 500 }}>
          어젯밤 꿈
        </span>
      </div>

      <div className="grow" />

      {step === "symbol" && (
        <div>
          <div style={eyebrow}>하나 · 무엇이 나왔나요</div>
          <div style={{ height: 14 }} />
          <p className="sub">가장 또렷하게 기억나는 것 하나만 고르세요.</p>
          <div style={{ height: 14 }} />
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className="btn"
                style={{
                  padding: "7px 13px",
                  fontSize: 13,
                  width: "auto",
                  background: c === cat ? "var(--ink)" : "var(--white)",
                  color: c === cat ? "var(--paper)" : "var(--ink-70)",
                  border: "1px solid var(--paper-dk)",
                }}
              >
                {DREAM_CATEGORY_LABEL[c]}
              </button>
            ))}
          </div>
          <div style={{ height: 12 }} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {dreamSymbolsByCategory(cat).map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  track("dream_symbol_select", { symbol: s.id });
                  setSymbol(s.id);
                  setStep("mood");
                }}
                className="card"
                style={{
                  padding: "14px 12px",
                  textAlign: "left",
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: "pointer",
                  borderRadius: 14,
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === "mood" && (
        <div>
          <div style={eyebrow}>둘 · 그때 느낌은</div>
          <div style={{ height: 18 }} />
          <p style={q}>깨고 나서 어땠어요?</p>
          <div style={{ height: 18 }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {MOODS.map((m) => (
              <button
                key={m}
                disabled={busy}
                onClick={() => {
                  setMood(m);
                  if (symbol) void read(symbol, m);
                }}
                className="btn ghost"
              >
                {DREAM_MOOD_LABEL[m]}
              </button>
            ))}
          </div>
          {busy && (
            <>
              <div style={{ height: 14 }} />
              <p className="sub" style={{ textAlign: "center" }}>꿈을 읽는 중…</p>
            </>
          )}
        </div>
      )}

      {step === "classic" && p && (
        <div>
          <div style={eyebrow}>셋 · 예로부터</div>
          <div style={{ height: 16 }} />
          <p style={q}>{p.symbol.label}</p>
          <div style={{ height: 14 }} />
          <p style={body}>{byKind("dream_classic")}</p>
        </div>
      )}

      {step === "reading" && p && (
        <div>
          <div style={eyebrow}>넷 · 당신 사주로 보면</div>
          <div style={{ height: 16 }} />
          <p style={body}>{byKind("dream_reading")}</p>
          <div style={{ height: 16 }} />
          <p className="fine" style={{ fontSize: 11.5 }}>{p.disclaimer}</p>
        </div>
      )}

      {step === "bridge" && p && (
        <div>
          <div style={eyebrow}>다섯 · 이어서</div>
          <div style={{ height: 16 }} />
          <p style={q}>꿈은 하룻밤,<br />흐름은 한 해예요.</p>
          <div style={{ height: 14 }} />
          <p className="sub">이 결이 올해 전체로는 어떻게 흐르는지 볼까요?</p>
        </div>
      )}

      <div className="grow" />

      <div
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          maxWidth: 480,
          margin: "0 auto",
          padding: "16px 24px 24px",
          background: "linear-gradient(to top, var(--paper) 65%, transparent)",
        }}
      >
        {step === "classic" && (
          <button className="btn ink" onClick={() => setStep("reading")}>
            내 사주로는 어떤지 보기
          </button>
        )}
        {step === "reading" && (
          <button className="btn ink" onClick={() => setStep("bridge")}>다음</button>
        )}
        {step === "bridge" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <button
              className="btn ink"
              onClick={() => {
                track("dream_to_report", { symbol: p?.symbol.id ?? "" });
                router.push(`/s/${token}`);
              }}
            >
              올해 흐름 상담 받기
            </button>
            <button
              className="btn ghost"
              onClick={() => {
                setP(null);
                setSymbol(null);
                setMood(null);
                setStep("symbol");
              }}
            >
              다른 꿈도 풀어보기
            </button>
          </div>
        )}
        {mood !== null && step === "mood" && !busy && null}
      </div>
    </main>
  );
}
