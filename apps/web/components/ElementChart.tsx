"use client";

/**
 * 오행 밸런스 차트 — SVG 자체 구현 (기획서 §6 카드2, 차트 라이브러리 금지).
 * 오행별 가로 막대. 색상은 오행 전통색(청·적·황·백·흑청).
 */

// 색상 = design/design-spec-v1.2.html 오행 토큰
const ORDER: { key: string; label: string; color: string }[] = [
  { key: "목", label: "木 목", color: "#5B7B5A" },
  { key: "화", label: "火 화", color: "#C63D2F" },
  { key: "토", label: "土 토", color: "#B08D46" },
  { key: "금", label: "金 금", color: "#8C8C88" },
  { key: "수", label: "水 수", color: "#3D5A73" },
];

export function ElementChart({ fiveElements }: { fiveElements: Record<string, number> }) {
  const max = Math.max(1, ...ORDER.map((o) => fiveElements[o.key] ?? 0));
  const rowH = 34;
  const w = 260;
  const labelW = 56;
  const barMax = w - labelW - 28;

  return (
    <svg width="100%" viewBox={`0 0 ${w} ${ORDER.length * rowH}`} role="img" aria-label="오행 분포">
      {ORDER.map((o, i) => {
        const v = fiveElements[o.key] ?? 0;
        const bw = (v / max) * barMax;
        const y = i * rowH;
        return (
          <g key={o.key} transform={`translate(0 ${y})`}>
            <text x="0" y={rowH / 2} dominantBaseline="central" fontSize="13" fill="#4A443C">
              {o.label}
            </text>
            <rect x={labelW} y={rowH / 2 - 8} width={barMax} height="16" rx="8" fill="#EEE7DA" />
            <rect
              x={labelW}
              y={rowH / 2 - 8}
              width={Math.max(bw, v > 0 ? 10 : 0)}
              height="16"
              rx="8"
              fill={o.color}
            />
            <text x={w - 4} y={rowH / 2} textAnchor="end" dominantBaseline="central" fontSize="12" fill="#8D877D">
              {v}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
