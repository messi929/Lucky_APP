import type { SajuInput } from "@lucky/core";
import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BirthForm } from "@/components/BirthForm";
import { Stamp } from "@/components/ui";
import { createReport } from "@/lib/api";
import { saveBirth, saveToken } from "@/lib/storage";
import { color, FONT } from "@/lib/theme";

/** ON-1 입력 (첫 실행 온보딩). birth → 리포트 생성 → 기기 저장 → 리포트로. */
export default function Onboarding() {
  const insets = useSafeAreaInsets();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function submit(birth: SajuInput) {
    setBusy(true);
    setErr("");
    try {
      const rep = await createReport(birth);
      await saveBirth(birth);
      await saveToken(rep.token);
      router.replace(`/r/${rep.token}`);
    } catch {
      setErr("문제가 생겼어요. 잠시 뒤 다시 시도해 주세요.");
      setBusy(false);
    }
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: color.hanji }} contentContainerStyle={{ padding: 24, paddingTop: insets.top + 40 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <Stamp char="命" />
        <Text style={{ fontFamily: FONT.serifBold, fontSize: 18, letterSpacing: 2, color: color.ink }}>팔자 리포트</Text>
      </View>
      <View style={{ height: 28 }} />
      <Text style={{ fontFamily: FONT.serifBlack, fontSize: 32, color: color.ink, lineHeight: 46 }}>
        먼저,{"\n"}태어난 날부터{"\n"}들어볼까요.
      </Text>
      <View style={{ height: 8 }} />
      <Text style={{ fontFamily: FONT.sans, fontSize: 14, color: color.inkSoft, lineHeight: 22 }}>
        사주는 태어난 순간의 하늘을 읽는 일이라 정확할수록 좋아요.
      </Text>
      <View style={{ height: 24 }} />
      <BirthForm submitLabel="팔자 적으러 가기" onSubmit={submit} busy={busy} />
      {!!err && <Text style={{ color: color.vermilion, marginTop: 12 }}>{err}</Text>}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}
