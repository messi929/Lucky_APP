import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Btn, Card, Stamp } from "@/components/ui";
import { ask } from "@/lib/api";
import { loadToken } from "@/lib/storage";
import { color, FONT } from "@/lib/theme";

/** PAY-2 복채 문답 (§5 ⑤). 구독자 전용(백엔드 402 게이트). */
export default function Ask() {
  const insets = useSafeAreaInsets();
  const [token, setToken] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [answer, setAnswer] = useState("");
  const [busy, setBusy] = useState(false);
  const [locked, setLocked] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    loadToken().then(setToken);
  }, []);

  async function submit() {
    if (!token) return;
    if (q.trim().length < 2) return setErr("고민을 한 줄로 적어 주세요.");
    setErr("");
    setBusy(true);
    try {
      const res = await ask(token, q, "mz");
      setAnswer(res.answer);
    } catch (e) {
      const msg = (e as Error).message;
      if (msg.includes("복채") || msg.includes("결제")) setLocked(true);
      else setErr(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: color.hanji }} contentContainerStyle={{ padding: 24, paddingTop: insets.top + 40 }}>
      <Stamp char="問" />
      <View style={{ height: 16 }} />
      <Text style={{ fontFamily: FONT.serifBlack, fontSize: 30, color: color.ink, lineHeight: 44 }}>자, 하나만{"\n"}물어보세요.</Text>
      <View style={{ height: 8 }} />
      <Text style={{ fontFamily: FONT.sans, fontSize: 14, color: color.inkSoft }}>당신의 팔자와 대운을 놓고 답해드립니다.</Text>
      <View style={{ height: 20 }} />

      {answer ? (
        <Card><Text style={{ fontFamily: FONT.sans, fontSize: 15, color: color.ink, lineHeight: 26 }}>{answer}</Text></Card>
      ) : locked ? (
        <Card style={{ alignItems: "center" }}>
          <Text style={{ fontFamily: FONT.serifBold, fontSize: 16, color: color.ink, marginBottom: 8 }}>구독하면 문답이 열려요</Text>
          <Btn label="구독 보기" variant="ink" onPress={() => router.push("/subscribe")} />
        </Card>
      ) : (
        <>
          <TextInput
            value={q}
            onChangeText={setQ}
            multiline
            maxLength={200}
            placeholder="연말에 이직 제안이 올 것 같은데, 받아도 되는 흐름인가요?"
            placeholderTextColor={color.inkMuted}
            style={{ backgroundColor: color.white, borderWidth: 1, borderColor: color.hanjiDeep, borderRadius: 14, padding: 16, minHeight: 120, fontFamily: FONT.sans, fontSize: 15, color: color.ink, textAlignVertical: "top" }}
          />
          {!!err && <Text style={{ color: color.vermilion, marginTop: 8 }}>{err}</Text>}
          <View style={{ height: 12 }} />
          <Btn label={busy ? "헤아리는 중…" : "팔자에게 묻기"} onPress={submit} disabled={busy} />
        </>
      )}
    </ScrollView>
  );
}
