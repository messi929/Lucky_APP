import { Fragment } from "react";
import { View } from "react-native";
import { Rect, Svg, Text as SvgText } from "react-native-svg";

/** 오행 밸런스 — SVG 자체 구현 (차트 라이브러리 금지, §6 카드2) */
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
  const w = 300;
  const labelW = 56;
  const barMax = w - labelW - 28;
  const h = ORDER.length * rowH;

  return (
    <View>
      <Svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`}>
        {ORDER.map((o, i) => {
          const v = fiveElements[o.key] ?? 0;
          const bw = (v / max) * barMax;
          const y = i * rowH;
          return (
            <Fragment key={o.key}>
              <SvgText x={0} y={y + rowH / 2 + 4} fontSize={13} fill="#4A443C">
                {o.label}
              </SvgText>
              <Rect x={labelW} y={y + rowH / 2 - 8} width={barMax} height={16} rx={8} fill="#EEE7DA" />
              <Rect x={labelW} y={y + rowH / 2 - 8} width={Math.max(bw, v > 0 ? 10 : 0)} height={16} rx={8} fill={o.color} />
              <SvgText x={w - 4} y={y + rowH / 2 + 4} fontSize={12} fill="#8D877D" textAnchor="end">
                {String(v)}
              </SvgText>
            </Fragment>
          );
        })}
      </Svg>
    </View>
  );
}
