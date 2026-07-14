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
const RANGES: { months: number; label: string }[] = [
  { months: 1, label: "앞으로 1개월" },
  { months: 3, label: "3개월" },
  { months: 6, label: "6개월" },
];
const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const addMonths = (d: Date, m: number) => new Date(d.getFullYear(), d.getMonth() + m, d.getDate());
const KO_DATE = (d: Date) => `${d.getMonth() + 1}월 ${d.getDate()}일`;

/** PAY-4 택일 (§3, §7.4). 목적+기간 → 좋은 날/피할 날. 기간은 프리셋으로. */
export default function Taekil() {
  const insets = useSafeAreaInsets();
  const [token, setToken] = useState<string | null>(null);
  const [purpose, setPurpose] = useState<TaekilPurpose>("move");
  const [months, setMonths] = useState(1);
  const [result, setResult] = useState<TaekilResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const start = new Date();
  const end = addMonths(start, months);

  useEffect(() => {
    loadToken().then(setToken);
  }, []);

  async function run() {
    if (!token) return;
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
      <View style={{ height: 16 }} />
      <Text style={{ fontFamily: FONT.sansBold, fontSize: 14, color: color.ink, marginBottom: 8 }}>언제 안에서 찾을까요?</Text>
      <View style={{ flexDirection: "row", gap: 8 }}>
        {RANGES.map((r) => (
          <Pressable key={r.months} onPress={() => setMonths(r.months)} style={{ flex: 1, alignItems: "center", paddingVertical: 12, borderRadius: 14, backgroundColor: months === r.months ? color.ink : color.white, borderWidth: 1, borderColor: months === r.months ? color.ink : color.hanjiDeep }}>
            <Text style={{ fontFamily: FONT.sansBold, fontSize: 14, color: months === r.months ? color.hanji : color.inkSoft }}>{r.label}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={{ fontFamily: FONT.sans, fontSize: 12, color: color.inkMuted, marginTop: 8 }}>
        {KO_DATE(start)} ~ {KO_DATE(end)} 안에서 일진을 살핍니다
      </Text>
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
