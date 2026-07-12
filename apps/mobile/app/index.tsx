import { computeSaju, dailyLine } from "@lucky/core";
import { Link, router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Btn, Card, Stamp } from "@/components/ui";
import { loadBirth, loadToken } from "@/lib/storage";
import { color, FONT } from "@/lib/theme";

/**
 * 앱 홈 (APP-1) — 데일리 리텐션 코어 (§10.1).
 * 기기 저장 birth로 '오늘의 한 줄' 로컬 계산(core, 네트워크 불필요). 없으면 온보딩으로.
 */
export default function Home() {
  const insets = useSafeAreaInsets();
  const [ready, setReady] = useState(false);
  const [daily, setDaily] = useState<{ line: string; ganji: string } | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const birth = await loadBirth();
      if (!birth) {
        router.replace("/onboarding");
        return;
      }
      setToken(await loadToken());
      const chart = computeSaju(birth);
      const now = new Date();
      const dl = dailyLine(chart.saju.pillarDetails.day.stemIdx, now.getFullYear(), now.getMonth() + 1, now.getDate());
      setDaily({ line: dl.line, ganji: dl.todayGanji });
      setReady(true);
    })();
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, backgroundColor: color.hanji, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={color.ink} />
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: color.hanji }} contentContainerStyle={{ padding: 24, paddingTop: insets.top + 24 }}>
      <View style={s.brandRow}>
        <Stamp char="命" />
        <Text style={s.brand}>팔자</Text>
      </View>

      {daily && (
        <View style={s.inkCard}>
          <Text style={s.eyebrow}>오늘의 한 줄 · {daily.ganji}일</Text>
          <Text style={s.dailyLine}>{daily.line}</Text>
        </View>
      )}

      <View style={{ height: 12 }} />
      {token && <Btn label="내 리포트 다시 보기" variant="ink" onPress={() => router.push(`/r/${token}`)} />}
      <View style={{ height: 8 }} />

      <Link href="/onboarding/push" asChild>
        <Card style={s.linkCard}><Text style={s.linkTitle}>매일 아침 8시, 오늘의 한 줄 받기</Text></Card>
      </Link>
      <Link href="/subscribe" asChild>
        <Card style={[s.linkCard, { borderColor: color.gold }]}><Text style={[s.linkTitle, { color: color.gold }]}>구독 — 매일 아침 + 문답 3회/월 · 4,900원</Text></Card>
      </Link>
      <Link href="/vault" asChild>
        <Card style={s.linkCard}><Text style={s.linkTitle}>내 보관함</Text></Card>
      </Link>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  brandRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 20 },
  brand: { fontFamily: FONT.serifBold, fontSize: 18, color: color.ink, letterSpacing: 2 },
  inkCard: { backgroundColor: color.ink, borderRadius: 20, padding: 24 },
  eyebrow: { color: "#CCC5BB", fontSize: 11, letterSpacing: 3, marginBottom: 12, fontFamily: FONT.sans },
  dailyLine: { color: color.hanji, fontFamily: FONT.serifBold, fontSize: 20, lineHeight: 30 },
  linkCard: { borderRadius: 16, padding: 18, marginTop: 10 },
  linkTitle: { fontFamily: FONT.sansBold, fontSize: 15, color: color.ink },
});
