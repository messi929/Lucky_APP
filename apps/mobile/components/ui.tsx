import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { color, FONT } from "@/lib/theme";

/** 낙관 스탬프 (화면당 1개, 命眞問答運緣福吉曉) */
export function Stamp({ char, size = 36 }: { char: string; size?: number }) {
  return (
    <View style={[s.stamp, { width: size, height: size, borderRadius: size >= 64 ? 14 : 6 }]}>
      <Text style={{ fontFamily: FONT.serifBlack, color: color.hanji, fontSize: size * 0.5 }}>{char}</Text>
    </View>
  );
}

/** 카드 진행 페이저 */
export function Dots({ total, active }: { total: number; active: number }) {
  return (
    <View style={s.dots}>
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} style={[s.dot, i === active && s.dotOn]} />
      ))}
    </View>
  );
}

/** 먹 원 + 큰 한자 (타입 카드·궁합) */
export function InkCircle({ char, size = 220, bg = color.ink }: { char: string; size?: number; bg?: string }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: bg, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ fontFamily: FONT.serifBlack, fontSize: size * 0.5, color: color.hanji }}>{char}</Text>
    </View>
  );
}

type BtnVariant = "ink" | "kakao" | "vermil" | "gold" | "ghost";
export function Btn({
  label,
  onPress,
  variant = "ink",
  disabled,
  style,
}: {
  label: string;
  onPress?: () => void;
  variant?: BtnVariant;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const bg = { ink: color.ink, kakao: color.kakao, vermil: color.vermilion, gold: color.gold, ghost: "transparent" }[variant];
  const fg = variant === "kakao" ? color.ink : variant === "ghost" ? color.inkSoft : color.hanji;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        s.btn,
        { backgroundColor: bg, opacity: disabled ? 0.5 : 1 },
        variant === "ghost" && s.btnGhost,
        style,
      ]}
    >
      <Text style={{ fontFamily: FONT.sansBold, fontSize: variant === "ghost" ? 13 : 16, color: fg }}>{label}</Text>
    </Pressable>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[s.card, style]}>{children}</View>;
}

export function Chip({ label }: { label: string }) {
  return (
    <View style={s.chip}>
      <Text style={{ fontFamily: FONT.sansMedium, fontSize: 13, color: color.inkSoft }}>{label}</Text>
    </View>
  );
}

/** 텍스트 스타일 헬퍼 */
export const t = StyleSheet.create({
  hSerif: { fontFamily: FONT.serifBlack, color: color.ink, lineHeight: 40 },
  sub: { fontFamily: FONT.sans, fontSize: 14, color: color.inkSoft, lineHeight: 22 },
  eyebrow: { fontFamily: FONT.sansMedium, fontSize: 12, letterSpacing: 4, color: color.inkMuted },
  fine: { fontFamily: FONT.sans, fontSize: 11, color: color.inkMuted, lineHeight: 17 },
});

const s = StyleSheet.create({
  stamp: { backgroundColor: color.vermilion, alignItems: "center", justifyContent: "center" },
  dots: { flexDirection: "row", gap: 6, justifyContent: "center" },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: color.inkMuted, opacity: 0.4 },
  dotOn: { backgroundColor: color.vermilion, opacity: 1 },
  btn: { minHeight: 52, borderRadius: 14, alignItems: "center", justifyContent: "center", paddingHorizontal: 20, flexDirection: "row" },
  btnGhost: { borderWidth: 1, borderColor: color.inkMuted, borderRadius: 100, minHeight: 0, paddingVertical: 10, alignSelf: "center" },
  card: { backgroundColor: color.white, borderWidth: 1, borderColor: color.hanjiDeep, borderRadius: 14, padding: 16, width: "100%" },
  chip: { backgroundColor: color.hanjiDeep, borderRadius: 100, paddingVertical: 8, paddingHorizontal: 14 },
});
