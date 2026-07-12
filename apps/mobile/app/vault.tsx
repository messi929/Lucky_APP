import { Stack } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { color, FONT } from "@/lib/theme";

/**
 * 보관함 (디자인 APP-4). 내 리포트·택일·궁합 + 가족 업셀(점선 카드).
 * ※ 실제 목록은 기기 저장 토큰에서 로드(§12). 스캐폴드는 정적 예시.
 */
const ITEMS = [
  { stamp: "命", title: "나의 풀 리포트", sub: "2026 하반기", color: color.vermilion },
  { stamp: "吉", title: "이사 택일 — 8월", sub: "좋은 날 3 · 저장됨", color: color.vermilion },
  { stamp: "緣", title: "지현 × 나 — 불꽃형", sub: "궁합 · 상세 미열람", color: color.gold },
];

export default function Vault() {
  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: "보관함" }} />
      <ScrollView style={{ flex: 1, backgroundColor: color.hanji }} contentContainerStyle={{ padding: 24 }}>
        <View style={{ gap: 8 }}>
          {ITEMS.map((it) => (
            <View key={it.title} style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{it.title}</Text>
                <Text style={styles.sub}>{it.sub}</Text>
              </View>
              <View style={[styles.stamp, { backgroundColor: it.color }]}>
                <Text style={styles.stampText}>{it.stamp}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.upsell}>
          <Text style={styles.upsellText}>엄마 사주도 봐드릴까요?</Text>
          <Text style={styles.upsellCta}>+ 가족 리포트 추가</Text>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: "row", alignItems: "center", backgroundColor: color.white, borderRadius: 16, borderWidth: 1, borderColor: color.hanjiDeep, padding: 16 },
  title: { fontSize: 15, fontWeight: "700", color: color.ink },
  sub: { fontSize: 12, color: color.inkMuted, marginTop: 2 },
  stamp: { width: 36, height: 36, borderRadius: 6, alignItems: "center", justifyContent: "center" },
  stampText: { color: color.hanji, fontFamily: FONT.serifBlack, fontWeight: "900", fontSize: 18 },
  upsell: { borderWidth: 1.5, borderColor: color.inkMuted, borderStyle: "dashed", borderRadius: 16, padding: 20, alignItems: "center", marginTop: 16 },
  upsellText: { fontSize: 13, color: color.inkSoft },
  upsellCta: { fontSize: 12, fontWeight: "700", color: color.vermilion, marginTop: 4 },
});
