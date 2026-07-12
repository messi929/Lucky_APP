"use client";

import { useState } from "react";

interface TaekilDay {
  date: string;
  ganjiHangul: string;
  score: number;
  reasons: string[];
}
interface TaekilResult {
  purposeKo: string;
  goodDays: TaekilDay[];
  avoidDays: TaekilDay[];
}

const PURPOSES = [
  { code: "move", label: "이사" },
  { code: "open", label: "개업" },
  { code: "contract", label: "계약" },
  { code: "event", label: "행사" },
];

/** PAY-4 택일 (§3, §7.4). 목적+기간 → 좋은 날/피할 날. */
export function TaekilForm({ token }: { token: string }) {
  const [purpose, setPurpose] = useState("move");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [result, setResult] = useState<TaekilResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function run() {
    if (!start || !end) return setErr("기간을 정해 주세요.");
    setErr("");
    setBusy(true);
    try {
      const res = await fetch("/api/taekil", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token, purpose, startDate: start, endDate: end }),
      });
      const data = (await res.json()) as TaekilResult & { error?: string };
      if (!res.ok) throw new Error(data.error ?? "실패");
      setResult(data);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const dateInput = { fontWeight: 700 as const };

  return (
    <div className="vstack">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
        {PURPOSES.map((p) => (
          <button
            key={p.code}
            onClick={() => setPurpose(p.code)}
            className="chip"
            style={{ textAlign: "center", padding: "10px 0", background: purpose === p.code ? "var(--ink)" : "var(--paper-dk)", color: purpose === p.code ? "var(--paper)" : "var(--ink-70)", fontWeight: 700, border: "none", cursor: "pointer" }}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="field" style={dateInput} />
        <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="field" style={dateInput} />
      </div>
      {err && <p style={{ color: "var(--vermil)", fontSize: 13 }}>{err}</p>}
      <button onClick={run} disabled={busy} className="btn ink">{busy ? "일진을 살피는 중…" : "좋은 날 찾기"}</button>

      {result && (
        <div className="vstack" style={{ marginTop: 8 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: "var(--vermil)", letterSpacing: "0.1em" }}>좋은 날</div>
          {result.goodDays.map((d) => (
            <div key={d.date} className="card hstack" style={{ alignItems: "flex-start", gap: 12 }}>
              <span style={{ minWidth: 96, fontFamily: "var(--serif)", fontWeight: 900, fontSize: 15 }}>{d.date}</span>
              <span className="fine" style={{ fontSize: 12, color: "var(--ink-70)" }}>{d.ganjiHangul} — {d.reasons.join(" / ")}</span>
            </div>
          ))}
          {result.avoidDays.length > 0 && (
            <>
              <div style={{ fontWeight: 700, fontSize: 14, color: "var(--ink-40)", letterSpacing: "0.1em", marginTop: 6 }}>피할 날</div>
              <div style={{ background: "var(--paper-dk)", borderRadius: 14, padding: "14px 16px" }}>
                <b style={{ fontSize: 14, color: "var(--ink-70)" }}>{result.avoidDays.map((d) => d.date).join(" · ")}</b>
                <span className="fine" style={{ fontSize: 12 }}> — 충이 드는 날, 굳이 고를 필요 없어요</span>
              </div>
            </>
          )}
          <div className="fine" style={{ marginTop: 6 }}>* 택일은 참고용 흐름 안내이며, 최종 결정은 상황을 살펴 정하세요. (가드레일 L2 관망 언어)</div>
        </div>
      )}
    </div>
  );
}
