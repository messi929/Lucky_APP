import type { SajuInput } from "@lucky/core";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BirthForm } from "@/components/BirthForm";
import { giftInfo, redeemGift } from "@/lib/api";
import { saveBirth, saveToken } from "@/lib/storage";
import { color, FONT } from "@/lib/theme";

/** GIFT-1 선물 수신 언박싱 (§8.2). 생일 입력 → 유료 리포트 열람. */
export default function GiftUnbox() {
  const { giftToken } = useLocalSearchParams<{ giftToken: string }>();
  const insets = useSafeAreaInsets();
  const [info, setInfo] = useState<{ sku: string; fromMsg: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    giftInfo(giftToken).then(setInfo).catch(() => setErr("선물을 찾지 못했어요."));
  }, [giftToken]);

  async function redeem(birth: SajuInput) {
    setBusy(true);
    setErr("");
    try {
      const { token } = await redeemGift(giftToken, birth);
      await saveBirth(birth);
      await saveToken(token);
      router.replace(`/r/${token}`);
    } catch {
      setErr("문제가 생겼어요. 다시 시도해 주세요.");
      setBusy(false);
    }
  }

  if (err && !info) return <Center><Text style={{ fontFamily: FONT.serifBold, color: color.ink }}>{err}</Text></Center>;
  if (!info) return <Center><ActivityIndicator color={color.ink} /></Center>;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: color.hanji }} contentContainerStyle={{ padding: 24, paddingTop: insets.top + 40, alignItems: "center" }}>
      <View style={{ height: 20 }} />
      <View style={{ width: 160, height: 160, borderRadius: 20, backgroundColor: color.vermilion, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ fontFamily: FONT.serifBlack, fontSize: 76, color: color.hanji }}>福</Text>
      </View>
      <View style={{ height: 24 }} />
      <Text style={{ fontFamily: FONT.serifBlack, fontSize: 24, color: color.ink, textAlign: "center", lineHeight: 34 }}>사주 리포트를{"\n"}선물받았어요</Text>
      {!!info.fromMsg && (
        <View style={{ backgroundColor: color.white, borderWidth: 1, borderColor: color.hanjiDeep, borderRadius: 14, padding: 14, marginTop: 12 }}>
          <Text style={{ fontFamily: FONT.sans, fontSize: 13, color: color.inkSoft }}>&ldquo;{info.fromMsg}&rdquo;</Text>
        </View>
      )}
      <View style={{ height: 16 }} />
      <Text style={{ fontFamily: FONT.sans, fontSize: 11, color: color.inkMuted, textAlign: "center" }}>생일만 넣으면 바로 열려요 · 복채는 이미 냈답니다</Text>
      <View style={{ height: 20, width: "100%" }} />
      <View style={{ width: "100%" }}>
        <BirthForm submitLabel="선물 열어보기" onSubmit={redeem} busy={busy} />
      </View>
      {!!err && <Text style={{ color: color.vermilion, marginTop: 12 }}>{err}</Text>}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function Center({ children }: { children: React.ReactNode }) {
  return <View style={{ flex: 1, backgroundColor: color.hanji, alignItems: "center", justifyContent: "center" }}>{children}</View>;
}
