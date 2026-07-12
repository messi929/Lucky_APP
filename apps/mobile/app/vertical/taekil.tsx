import DateTimePicker from "@react-native-community/datetimepicker";
import type { TaekilPurpose, TaekilResult } from "@lucky/core";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Btn, Card } from "@/components/ui";
import { taekil } from "@/lib/api";
import { loadToken } from "@/lib/storage";
import { color, FONT } from "@/lib/theme";

const PURPOSES: { code: TaekilPurpose; label: string }[] = [
  { code: "move", label: "이사" },
  { code: "open", label: "개업" },
  { code: "contract", label: "계약" },
  { code: "event", label: "행사" },
];
const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** PAY-4 택일 (§3, §7.4). 목적+기간 → 좋은 날/피할 날. */
export default function Taekil() {
  const insets = useSafeAreaInsets();
  const [token, setToken] = useState<string | null>(null);
  const [purpose, setPurpose] = useState<TaekilPurpose>("move");
  const [start, setStart] = useState<Date | null>(null);
  const [end, setEnd] = useState<Date | null>(null);
  const [pick, setPick] = useState<"start" | "end" | null>(null);
  const [result, setResult] = useState<TaekilResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    loadToken().then(setToken);
  }, []);

  async function run() {
    if (!token) return;
    if (!start || !end) return setErr("기간을 정해 주세요.");
    setErr("");
    setBusy(true);
    try {
      setResult(await taekil(token, purpose, ymd(start), ymd(end)));
    } catch (e) {
      const msg = (e as Error).message;
      if (msg.includes("결제")) router.push("/subscribe");
      else setErr(msg);
    } finally {
      setBusy(false);
    }
  }

  const dateBox = { flex: 1, backgroundColor: color.white, borderWidth: 1, borderColor: color.hanjiDeep, borderRadius: 14, padding: 14 } as const;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: color.hanji }} contentContainerStyle={{ padding: 24, paddingTop: insets.top + 40 }}>
      <Text style={{ fontFamily: FONT.serifBlack, fontSize: 24, color: color.ink }}>택일 · 좋은 날 찾기</Text>
      <View style={{ height: 16 }} />
      <View style={{ flexDirection: "row", gap: 8 }}>
        {PURPOSES.map((p) => (
          <Pressable key={p.code} onPress={() => setPurpose(p.code)} style={{ flex: 1, alignItems: "center", paddingVertical: 12, borderRadius: 14, backgroundColor: purpose === p.code ? color.ink : color.white, borderWidth: 1, borderColor: purpose === p.code ? color.ink : color.hanjiDeep }}>
            <Text style={{ fontFamily: FONT.sansBold, fontSize: 14, color: purpose === p.code ? color.hanji : color.inkSoft }}>{p.label}</Text>
          </Pressable>
        ))}
      </View>
      <View style={{ height: 10 }} />
      <View style={{ flexDirection: "row", gap: 8 }}>
        <Pressable style={dateBox} onPress={() => setPick("start")}><Text style={{ fontFamily: FONT.sansBold, color: start ? color.ink : color.inkMuted }}>{start ? ymd(start) : "시작일"}</Text></Pressable>
        <Pressable style={dateBox} onPress={() => setPick("end")}><Text style={{ fontFamily: FONT.sansBold, color: end ? color.ink : color.inkMuted }}>{end ? ymd(end) : "종료일"}</Text></Pressable>
      </View>
      {pick && (
        <DateTimePicker
          value={(pick === "start" ? start : end) ?? new Date()}
          mode="date"
          onChange={(_e, d) => { const p = pick; setPick(null); if (d) { p === "start" ? setStart(d) : setEnd(d); } }}
        />
      )}
      {!!err && <Text style={{ color: color.vermilion, marginTop: 8 }}>{err}</Text>}
      <View style={{ height: 12 }} />
      <Btn label={busy ? "일진을 살피는 중…" : "좋은 날 찾기"} variant="vermil" onPress={run} disabled={busy} />

      {result && (
        <View style={{ marginTop: 20, gap: 8 }}>
          <Text style={{ fontFamily: FONT.sansBold, fontSize: 14, color: color.vermilion, letterSpacing: 1 }}>{result.purposeKo} 좋은 날</Text>
          {result.goodDays.map((d) => (
            <Card key={d.date}>
              <Text style={{ fontFamily: FONT.serifBold, fontSize: 15, color: color.ink }}>{d.date} · {d.ganjiHangul}</Text>
              <Text style={{ fontFamily: FONT.sans, fontSize: 12, color: color.inkMuted, marginTop: 2 }}>{d.reasons.join(" / ")}</Text>
            </Card>
          ))}
          {result.avoidDays.length > 0 && (
            <Text style={{ fontFamily: FONT.sans, fontSize: 12, color: color.inkMuted, marginTop: 4 }}>
              피할 날: {result.avoidDays.map((d) => d.date).join(" · ")} — 충이 드는 날
            </Text>
          )}
        </View>
      )}
    </ScrollView>
  );
}
