import { router } from "expo-router";
import { useState } from "react";
import { Pressable, Share, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Btn, Card, Stamp } from "@/components/ui";
import { createInvite } from "@/lib/api";
import { loadToken } from "@/lib/storage";
import { API_BASE, color, FONT } from "@/lib/theme";

const RELATIONS = [
  { code: "lover", label: "연인", emoji: "💞" },
  { code: "crush", label: "썸", emoji: "🌙" },
  { code: "friend", label: "친구", emoji: "🤝" },
  { code: "work", label: "직장", emoji: "🏢" },
  { code: "parent_child", label: "부모–자녀", emoji: "👪" },
  { code: "couple", label: "부부", emoji: "🏠" },
  { code: "sibling", label: "형제", emoji: "👫" },
] as const;

/** REL-1 궁합 관계 선택 → 초대 링크 (§8.1). 공유 = 간단 요약, 열람은 앱 설치. */
export default function CompatNew() {
  const insets = useSafeAreaInsets();
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);

  async function pick(relation: string) {
    const token = await loadToken();
    if (!token) return router.replace("/onboarding");
    setBusy(true);
    try {
      const { inviteToken } = await createInvite(token, relation as (typeof RELATIONS)[number]["code"]);
      setUrl(`${API_BASE}/c/${inviteToken}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={[s.wrap, { paddingTop: insets.top + 40 }]}>
      <Text style={s.title}>누구와의{"\n"}사이가 궁금해요?</Text>
      <View style={{ height: 20 }} />
      {url ? (
        <Card style={{ borderRadius: 16 }}>
          <Text style={s.sub}>초대 링크가 만들어졌어요. 받는 분이 앱에서 생일만 넣으면 궁합이 열려요.</Text>
          <View style={{ height: 10 }} />
          <Btn label="카카오톡으로 초대 보내기" variant="kakao" onPress={() => Share.share({ message: `우리 궁합 볼래요? ${url}` })} />
        </Card>
      ) : (
        <View style={s.grid}>
          {RELATIONS.map((r) => (
            <Pressable key={r.code} disabled={busy} onPress={() => pick(r.code)} style={s.tile}>
              <Text style={{ fontSize: 24, marginBottom: 8 }}>{r.emoji}</Text>
              <Text style={{ fontFamily: FONT.sansBold, fontSize: 14, color: color.ink }}>{r.label}</Text>
            </Pressable>
          ))}
        </View>
      )}
      <View style={{ flex: 1 }} />
      <Text style={s.fine}>명절엔 가족 궁합 — 밥상 이야깃거리로 최고예요</Text>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: color.hanji, padding: 24 },
  title: { fontFamily: FONT.serifBlack, fontSize: 28, color: color.ink, lineHeight: 40 },
  sub: { fontFamily: FONT.sans, fontSize: 14, color: color.inkSoft, lineHeight: 22 },
  fine: { fontFamily: FONT.sans, fontSize: 12, color: color.inkMuted, textAlign: "center", marginBottom: 12 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  tile: { width: "30%", alignItems: "center", backgroundColor: color.white, borderWidth: 1, borderColor: color.hanjiDeep, borderRadius: 14, paddingVertical: 18 },
});
