import type { SajuInput } from "@lucky/core";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BirthForm } from "@/components/BirthForm";
import { InkCircle } from "@/components/ui";
import { inviteInfo, solveCompat } from "@/lib/api";
import { color, FONT } from "@/lib/theme";

/** REL-2 궁합 초대 수신자 랜딩 (§8.1). A 타입 먼저 노출 → B 입력. */
export default function InviteeLanding() {
  const { inviteToken } = useLocalSearchParams<{ inviteToken: string }>();
  const insets = useSafeAreaInsets();
  const [info, setInfo] = useState<{ ownerType: string; ownerHanja: string; relationLabel: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    inviteInfo(inviteToken).then(setInfo).catch(() => setErr("초대를 찾지 못했어요."));
  }, [inviteToken]);

  async function solve(birth: SajuInput) {
    setBusy(true);
    setErr("");
    try {
      const { compatToken } = await solveCompat(inviteToken, birth);
      router.replace(`/compat/${compatToken}`);
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
      <InkCircle char={info.ownerHanja} size={120} />
      <View style={{ height: 20 }} />
      <Text style={{ fontFamily: FONT.serifBlack, fontSize: 24, color: color.ink, textAlign: "center", lineHeight: 36 }}>
        &lsquo;{info.ownerType}&rsquo; 타입인 분이{"\n"}{info.relationLabel} 궁합을 요청했어요
      </Text>
      <View style={{ height: 8 }} />
      <Text style={{ fontFamily: FONT.sans, fontSize: 14, color: color.inkSoft, textAlign: "center" }}>
        생년월일만 넣으면 두 사람의 합을 보여드려요.
      </Text>
      <View style={{ height: 24, width: "100%" }} />
      <View style={{ width: "100%" }}>
        <BirthForm submitLabel="우리 궁합 보기" onSubmit={solve} busy={busy} />
      </View>
      {!!err && <Text style={{ color: color.vermilion, marginTop: 12 }}>{err}</Text>}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function Center({ children }: { children: React.ReactNode }) {
  return <View style={{ flex: 1, backgroundColor: color.hanji, alignItems: "center", justifyContent: "center" }}>{children}</View>;
}
