"use client";

import { useState } from "react";
import type { Mode } from "@lucky/core";
import { track } from "@/lib/track";
import { Stamp } from "./ui";

/** PAY-2 복채 문답 (유료 해제 시). 고민 한 줄 → 맞춤 답변 (§5 ⑤). */
export function AskBox({ token, mode }: { token: string; mode: Mode }) {
  const [q, setQ] = useState("");
  const [answer, setAnswer] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function ask() {
    if (q.trim().length < 2) return setErr("고민을 한 줄로 적어 주세요.");
    setErr("");
    setBusy(true);
    track("ask_submit");
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token, question: q, mode }),
      });
      const data = (await res.json()) as { answer?: string; error?: string };
      if (!res.ok || !data.answer) throw new Error(data.error ?? "문답 실패");
      setAnswer(data.answer);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card" style={{ borderRadius: 16, borderColor: "var(--vermil)" }}>
      <div className="hstack" style={{ marginBottom: 10 }}>
        <Stamp char="問" />
        <span className="h-serif" style={{ fontSize: 18 }}>하나만 물어보세요</span>
      </div>
      {answer ? (
        <p style={{ lineHeight: 1.7, whiteSpace: "pre-line" }}>{answer}</p>
      ) : (
        <>
          <textarea
            value={q}
            onChange={(e) => setQ(e.target.value)}
            rows={3}
            maxLength={200}
            placeholder="요즘 가장 답답한 걸 한 줄로… (예: 연말 이직 제안, 받아도 될까요?)"
            className="field"
            style={{ fontWeight: 400, resize: "none" }}
          />
          {err && <p style={{ color: "var(--vermil)", fontSize: 13, marginTop: 6 }}>{err}</p>}
          <button onClick={ask} disabled={busy} className="btn ink" style={{ marginTop: 8 }}>
            {busy ? "헤아리는 중…" : "팔자에게 묻기"}
          </button>
        </>
      )}
    </div>
  );
}
