"use client";

import type { PillarView } from "@lucky/api-client";

/**
 * R0 팔자 붓글씨 연출 (design-spec §P1, 기획서 §5 ②).
 * 시·일·월·연 4기둥을 한지 위에 한 자씩. SVG 스트로크 드로잉(패스 애니) + 먹 번짐 페이드.
 * 자당 ~0.32s, 총 2~3s 뜸(노동 착시). prefers-reduced-motion 시 즉시 표시. 스킵 제공.
 */
const POS_LABEL: Record<string, string> = { hour: "시", day: "일", month: "월", year: "연" };
const ORDER = ["hour", "day", "month", "year"];

export function BrushIntro({ pillars, onDone }: { pillars: PillarView[]; onDone: () => void }) {
  const cols = ORDER.map((pos) => pillars.find((p) => p.position === pos)).filter(
    (p): p is PillarView => !!p,
  );
  const perChar = 320;

  return (
    <section className="screen center">
      <div className="eyebrow" style={{ letterSpacing: "0.2em" }}>
        당신의 팔자를 적고 있어요
      </div>
      <div className="grow" />
      <div style={{ display: "flex", gap: 22 }}>
        {cols.map((p, ci) => (
          <div key={p.position} style={{ textAlign: "center" }}>
            <div className="eyebrow" style={{ letterSpacing: "0.3em", marginBottom: 10 }}>
              {POS_LABEL[p.position]}
            </div>
            <BrushChar char={p.stemHanja} delay={ci * 2 * perChar} />
            <BrushChar char={p.branchHanja} delay={(ci * 2 + 1) * perChar} />
          </div>
        ))}
      </div>
      <div style={{ height: 28 }} />
      <div style={{ fontFamily: "var(--serif)", fontSize: 15, color: "var(--ink-70)" }}>한 자, 한 자.</div>
      <div className="grow" />
      <button onClick={onDone} className="btn ghost">
        바로 보기
      </button>
    </section>
  );
}

function BrushChar({ char, delay }: { char: string; delay: number }) {
  return (
    <svg viewBox="0 0 100 100" width="52" height="60" role="img" aria-label={char}>
      <text
        x="50"
        y="48"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="var(--serif)"
        fontWeight={900}
        fontSize="76"
        fill="var(--ink)"
        style={{ opacity: 0, animation: `fade-up .5s ease ${delay}ms both` }}
      >
        {char}
      </text>
      <path
        d="M22 90 Q50 96 78 88"
        fill="none"
        stroke="var(--vermil)"
        strokeWidth="3"
        strokeLinecap="round"
        pathLength={1}
        style={{ strokeDasharray: 1, strokeDashoffset: 1, animation: `brush-draw .6s ease ${delay + 220}ms forwards` }}
      />
    </svg>
  );
}
