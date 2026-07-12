"use client";

import type { Mode } from "@lucky/core";

/** 세대 톤 토글 (mz/classic). data-mode 갱신 + 재생성 (v1.2 §4.2, 원칙 7). */
export function ModeToggle({ mode, onChange }: { mode: Mode; onChange: (m: Mode) => void }) {
  return (
    <div
      style={{
        position: "fixed",
        top: 12,
        right: 12,
        zIndex: 20,
        display: "flex",
        overflow: "hidden",
        borderRadius: 100,
        border: "1px solid var(--paper-dk)",
        background: "rgba(255,255,255,.85)",
        fontSize: 12,
      }}
    >
      {(["mz", "classic"] as Mode[]).map((m) => (
        <button
          key={m}
          onClick={() => onChange(m)}
          aria-pressed={mode === m}
          style={{
            padding: "6px 12px",
            border: "none",
            cursor: "pointer",
            background: mode === m ? "var(--ink)" : "transparent",
            color: mode === m ? "var(--paper)" : "var(--ink-40)",
          }}
        >
          {m === "mz" ? "요즘말" : "정중히"}
        </button>
      ))}
    </div>
  );
}
