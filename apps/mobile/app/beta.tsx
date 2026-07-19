import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Btn, Stamp } from "@/components/ui";
import { redeemBeta } from "@/lib/api";
import { saveBeta } from "@/lib/storage";
import { color, FONT } from "@/lib/theme";

/**
 * 초대 전용 베타 게이트 (앱). 코드 교환 성공 시 자격 증명 저장 후 홈으로.
 * 하드 게이트는 TestFlight/내부테스트(초대된 기기만 설치), 이 화면은 API 자격 확보용.
 */
export default function BetaScreen() {
  const insets = useSafeAreaInsets();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function submit() {
    setBusy(true);
    setErr("");
    try {
      const cred = await redeemBeta(code);
      await saveBeta(cred);
      router.replace("/");
    } catch (e) {
      setErr((e as Error).message);
      setBusy(false);
    }
  }

  return (
    <View style={[s.wrap, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 }]}>
      <View style={s.brandRow}>
        <Stamp char="命" />
        <Text style={s.brand}>팔자</Text>
      </View>

      <View style={{ flex: 1 }} />

      <Text style={s.h1}>초대 전용{"\n"}베타예요</Text>
      <Text style={s.sub}>받으신 초대 코드를 넣으면{"\n"}정식 오픈 전에 먼저 팔자를 보실 수 있어요.</Text>

      <TextInput
        value={code}
        onChangeText={(t) => setCode(t.trim())}
        placeholder="초대 코드"
        placeholderTextColor={color.inkMuted}
        autoCapitalize="characters"
        autoCorrect={false}
        style={s.input}
        onSubmitEditing={() => code && submit()}
      />
      {!!err && <Text style={s.err}>{err}</Text>}

      <View style={{ height: 14 }} />
      <Btn label={busy ? "확인 중…" : "입장하기"} variant="ink" disabled={busy || !code} onPress={submit} />
      <Text style={s.fine}>코드가 없으신가요? 정식 오픈을 기다려 주세요.</Text>

      <View style={{ flex: 1 }} />
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: color.hanji, paddingHorizontal: 24 },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  brand: { fontFamily: FONT.serifBold, fontSize: 18, color: color.ink, letterSpacing: 2 },
  h1: { fontFamily: FONT.serifBlack, fontSize: 30, color: color.ink, lineHeight: 40 },
  sub: { fontFamily: FONT.sans, fontSize: 14, color: "#4a443c", lineHeight: 22, marginTop: 10 },
  input: {
    fontFamily: FONT.serifBold,
    fontSize: 24,
    letterSpacing: 4,
    textAlign: "center",
    color: color.ink,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#eee7da",
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 22,
  },
  err: { fontFamily: FONT.sans, fontSize: 13, color: color.vermilion, marginTop: 10 },
  fine: { fontFamily: FONT.sans, fontSize: 12, color: "#8d877d", textAlign: "center", marginTop: 12 },
});
