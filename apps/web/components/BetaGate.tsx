"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Stamp } from "./ui";

/** 초대 코드 게이트. 링크(?invite=CODE)면 자동 교환, 아니면 직접 입력. */
export function BetaGate() {
  const router = useRouter();
  const params = useSearchParams();
  const nextRaw = params.get("next") || "/";
  const next = nextRaw.startsWith("/") ? nextRaw : "/"; // open-redirect 방지

  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const redeem = useCallback(
    async (value: string) => {
      setBusy(true);
      setErr("");
      try {
        const res = await fetch("/api/beta/redeem", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ code: value }),
        });
        const data = (await res.json()) as { ok?: boolean; error?: string };
        if (!res.ok || !data.ok) throw new Error(data.error || "유효하지 않은 초대 코드예요");
        router.replace(next);
      } catch (e) {
        setErr((e as Error).message);
        setBusy(false);
      }
    },
    [next, router],
  );

  // 링크로 들어온 경우 ?invite=CODE 자동 교환
  useEffect(() => {
    const invite = params.get("invite");
    if (invite) {
      setCode(invite);
      void redeem(invite);
    }
    // 최초 1회만
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="screen">
      <div className="hstack">
        <Stamp char="命" />
        <span style={{ fontFamily: "var(--serif)", fontWeight: 700, letterSpacing: "0.1em" }}>
          팔자 리포트
        </span>
      </div>

      <div className="grow" />

      <h1 className="h-serif" style={{ fontSize: 30 }}>
        초대 전용
        <br />
        베타예요
      </h1>
      <div style={{ height: 8 }} />
      <p className="sub">
        받으신 초대 코드를 넣으면
        <br />
        정식 오픈 전에 먼저 팔자를 보실 수 있어요.
      </p>

      <div style={{ height: 22 }} />
      <input
        value={code}
        onChange={(e) => setCode(e.target.value.trim())}
        onKeyDown={(e) => {
          if (e.key === "Enter" && code) void redeem(code);
        }}
        placeholder="초대 코드"
        autoCapitalize="characters"
        autoCorrect="off"
        spellCheck={false}
        style={input}
        aria-label="초대 코드"
      />
      {err && (
        <p style={{ fontFamily: "var(--sans)", fontSize: 13, color: "var(--vermil)", marginTop: 10 }}>
          {err}
        </p>
      )}

      <div style={{ height: 14 }} />
      <button className="btn ink" disabled={busy || !code} onClick={() => void redeem(code)}>
        {busy ? "확인 중…" : "입장하기"}
      </button>

      <div style={{ height: 10 }} />
      <p className="fine" style={{ textAlign: "center" }}>
        코드가 없으신가요? 정식 오픈을 기다려 주세요.
      </p>

      <div className="grow" />
    </main>
  );
}

const input: React.CSSProperties = {
  fontFamily: "var(--serif)",
  fontWeight: 700,
  fontSize: 26,
  letterSpacing: "0.08em",
  textAlign: "center",
  color: "var(--ink)",
  background: "var(--white)",
  border: "1px solid var(--paper-dk)",
  borderRadius: "var(--r-card)",
  padding: "16px 18px",
  width: "100%",
  outline: "none",
  boxSizing: "border-box",
};
