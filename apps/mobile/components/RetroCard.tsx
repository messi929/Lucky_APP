import type { RetroProbeView } from "@lucky/api-client";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { loadRetro, saveRetro } from "@/lib/storage";
import { color, FONT } from "@/lib/theme";
import { Btn, Stamp } from "./ui";

/**
 * 과거 검증 카드 (PROCESS-DESIGN §5) — 신뢰 방아쇠.
 * "당신은 이런 사람" 다음에 "그때 이러지 않았어요?"로 과거를 짚는다.
 * 질문형 + [맞아요/아니요] → 기기 로컬 저장(원칙 5: 계정 없음).
 */

type Answer = "yes" | "no";

export function RetroCard({ token, probes }: { token: string; probes: RetroProbeView[] }) {
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, Answer>>({});

  useEffect(() => {
    loadRetro(token).then(setAnswers);
  }, [token]);

  const probe = probes[idx];
  const answered = probe ? answers[probe.pivotYear] : undefined;
  const hits = useMemo(
    () => probes.filter((p) => answers[p.pivotYear] === "yes").length,
    [probes, answers],
  );

  if (!probe) return null;

  async function answer(a: Answer) {
    if (!probe) return;
    const next = { ...answers, [probe.pivotYear]: a };
    setAnswers(next);
    await saveRetro(token, next);
  }

  const isLast = idx >= probes.length - 1;

  return (
    <>
      <View style={s.hstack}>
        <Stamp char="眞" size={34} />
        <Text style={s.eyebrow}>짚어볼게요 · {idx + 1}/{probes.length}</Text>
      </View>

      <View style={{ height: 22 }} />
      <Text style={s.q}>
        {probe.fromYear}년에서 {probe.toYear}년 사이,{"\n"}
        {probe.question}
      </Text>
      <View style={{ height: 8 }} />
      <Text style={s.fine}>그때 {probe.age}살 무렵이에요.</Text>

      <View style={{ height: 28, width: "100%" }} />

      {answered === undefined ? (
        <View style={{ flexDirection: "row", gap: 10, width: "100%" }}>
          <View style={{ flex: 1 }}>
            <Btn label="맞아요" variant="ink" onPress={() => answer("yes")} />
          </View>
          <View style={{ flex: 1 }}>
            <Btn label="아니요" variant="ghost" onPress={() => answer("no")} style={s.whiteBtn} />
          </View>
        </View>
      ) : (
        <>
          <Text style={[s.resolve, answered === "yes" ? { color: color.vermilion } : { color: color.inkSoft }]}>
            {answered === "yes"
              ? hits >= 2
                ? "이쯤 되면, 나머지 얘기도 한번 들어볼 만하죠."
                : "그쵸. 사주는 이렇게 지나온 자리부터 맞혀요."
              : "그럴 수도 있어요. 사람마다 결이 다르니까요."}
          </Text>
          <View style={{ height: 20, width: "100%" }} />
          {!isLast ? (
            <Btn label="하나 더 짚어볼까요" variant="ghost" onPress={() => setIdx((i) => i + 1)} style={s.whiteBtn} />
          ) : (
            <Text style={s.fine}>넘겨서, 이제 당신 차례예요.</Text>
          )}
        </>
      )}
    </>
  );
}

const s = StyleSheet.create({
  hstack: { flexDirection: "row", alignItems: "center", gap: 10 },
  eyebrow: { fontFamily: FONT.sansMedium, fontSize: 12, letterSpacing: 1.5, color: color.inkMuted },
  q: { fontFamily: FONT.serifBlack, fontSize: 25, lineHeight: 38, color: color.ink },
  fine: { fontFamily: FONT.sans, fontSize: 12, color: color.inkMuted },
  resolve: { fontFamily: FONT.serifBold, fontSize: 19, lineHeight: 28 },
  whiteBtn: { backgroundColor: color.white, borderWidth: 1, borderColor: color.hanjiDeep },
});
