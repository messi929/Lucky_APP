import type { PillarView } from "@lucky/api-client";
import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { color, FONT } from "@/lib/theme";
import { Btn } from "./ui";

/**
 * R0 팔자 붓글씨 연출 (§5 ②). 시·일·월·연 4기둥을 한 자씩 페이드(뜸=노동 착시).
 * 주홍 낙관 밑줄. 자당 ~0.32s. 스킵 제공.
 */
const POS_LABEL: Record<string, string> = { hour: "시", day: "일", month: "월", year: "연" };
const ORDER = ["hour", "day", "month", "year"];

export function BrushIntro({ pillars, onDone }: { pillars: PillarView[]; onDone: () => void }) {
  const insets = useSafeAreaInsets();
  const cols = ORDER.map((p) => pillars.find((x) => x.position === p)).filter(
    (p): p is PillarView => !!p,
  );
  const perChar = 320;

  return (
    <View style={[styles.wrap, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 36 }]}>
      <Text style={styles.eyebrow}>당신의 팔자를 적고 있어요</Text>
      <View style={styles.grow} />
      <View style={styles.row}>
        {cols.map((p, ci) => (
          <View key={p.position} style={styles.col}>
            <Text style={styles.posLabel}>{POS_LABEL[p.position]}</Text>
            <BrushChar char={p.stemHanja} delay={ci * 2 * perChar} />
            <BrushChar char={p.branchHanja} delay={(ci * 2 + 1) * perChar} />
          </View>
        ))}
      </View>
      <Text style={styles.hann}>한 자, 한 자.</Text>
      <View style={styles.grow} />
      <Btn label="바로 보기" variant="ghost" onPress={onDone} />
    </View>
  );
}

function BrushChar({ char, delay }: { char: string; delay: number }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const strokeW = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(opacity, { toValue: 1, duration: 500, delay, useNativeDriver: true }).start();
    Animated.timing(strokeW, { toValue: 1, duration: 400, delay: delay + 220, useNativeDriver: false }).start();
  }, [delay, opacity, strokeW]);
  return (
    <View style={{ alignItems: "center" }}>
      <Animated.Text style={[styles.char, { opacity }]}>{char}</Animated.Text>
      <Animated.View
        style={{
          height: 3,
          borderRadius: 2,
          backgroundColor: color.vermilion,
          width: strokeW.interpolate({ inputRange: [0, 1], outputRange: [0, 40] }),
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: color.hanji, alignItems: "center", paddingHorizontal: 24 },
  grow: { flex: 1 },
  eyebrow: { fontFamily: FONT.sansMedium, fontSize: 12, letterSpacing: 4, color: color.inkMuted },
  row: { flexDirection: "row", gap: 22 },
  col: { alignItems: "center" },
  posLabel: { fontFamily: FONT.sansMedium, fontSize: 12, letterSpacing: 5, color: color.inkMuted, marginBottom: 10 },
  char: { fontFamily: FONT.serifBlack, fontSize: 52, color: color.ink, marginBottom: 4 },
  hann: { fontFamily: FONT.serif, fontSize: 15, color: color.inkSoft, marginTop: 28 },
});
