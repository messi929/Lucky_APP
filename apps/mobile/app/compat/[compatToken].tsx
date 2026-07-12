import type { CompatResult } from "@lucky/core";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Btn, InkCircle } from "@/components/ui";
import { compatResult } from "@/lib/api";
import { color, FONT } from "@/lib/theme";

/** REL-3 궁합 결과 (§8.1). 등급 4종, 나쁜 결과 없음 프레임. */
export default function CompatResultScreen() {
  const { compatToken } = useLocalSearchParams<{ compatToken: string }>();
  const insets = useSafeAreaInsets();
  const [data, setData] = useState<{ result: CompatResult; aHanja: string; bHanja: string } | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    compatResult(compatToken).then(setData).catch(() => setErr("결과를 찾지 못했어요."));
  }, [compatToken]);

  if (err) return <Center><Text style={{ fontFamily: FONT.serifBold, color: color.ink }}>{err}</Text></Center>;
  if (!data) return <Center><ActivityIndicator color={color.ink} /></Center>;

  const { result: r } = data;
  return (
    <ScrollView style={{ flex: 1, backgroundColor: color.hanji }} contentContainerStyle={{ padding: 24, paddingTop: insets.top + 40, alignItems: "center", minHeight: "100%" }}>
      <Text style={{ fontFamily: FONT.sansMedium, letterSpacing: 4, color: color.inkMuted, fontSize: 12 }}>두 사람의 합</Text>
      <View style={{ height: 20 }} />
      <View style={{ flexDirection: "row" }}>
        <View style={{ borderWidth: 4, borderColor: color.hanji, borderRadius: 60, zIndex: 1 }}>
          <InkCircle char={data.aHanja} size={110} />
        </View>
        <View style={{ borderWidth: 4, borderColor: color.hanji, borderRadius: 60, marginLeft: -14 }}>
          <InkCircle char={data.bHanja} size={110} bg={color.vermilion} />
        </View>
      </View>
      <View style={{ height: 24 }} />
      <Text style={{ fontFamily: FONT.serifBlack, fontSize: 34, color: color.vermilion }}>{r.gradeLabel}</Text>
      <Text style={{ fontFamily: FONT.serifBold, fontSize: 17, color: color.ink }}>{r.relationLabel} 궁합 · {r.score}점</Text>
      <View style={{ height: 16, width: "100%" }} />
      <View style={{ backgroundColor: color.white, borderWidth: 1, borderColor: color.hanjiDeep, borderRadius: 14, padding: 18, width: "100%" }}>
        <Text style={{ fontFamily: FONT.sans, fontSize: 14, color: color.inkSoft, lineHeight: 24 }}>{r.headline}</Text>
        {r.dynamics.map((d, i) => (
          <Text key={i} style={{ fontFamily: FONT.sans, fontSize: 12, color: color.inkMuted, marginTop: 6 }}>· {d}</Text>
        ))}
      </View>
      <View style={{ flex: 1 }} />
      <View style={{ width: "100%", gap: 6, marginTop: 24 }}>
        <Btn label="관계 상세 보기 (구독)" variant="ink" onPress={() => router.push("/subscribe")} />
        <Btn label="내 사주 전체 보기" variant="kakao" onPress={() => router.replace("/")} />
      </View>
    </ScrollView>
  );
}

function Center({ children }: { children: React.ReactNode }) {
  return <View style={{ flex: 1, backgroundColor: color.hanji, alignItems: "center", justifyContent: "center" }}>{children}</View>;
}
