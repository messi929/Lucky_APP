import { CONCERN_HUB, CONSULTANT, concernsForAge, seasonHook, seasonPhase, type ConcernId } from "@lucky/core";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Stamp } from "@/components/ui";
import { findPerson, loadBirth, loadToken, personLabel } from "@/lib/storage";
import { color, FONT } from "@/lib/theme";

/**
 * 상담 허브 (CONSULT-HUB) — "오늘 뭐가 궁금해요?".
 * 도사의 인사 → 고민 1개 선택 → 집중 세션. 연령 적응 노출은 core에서 로컬 계산(네트워크 0).
 */

function ageFrom(birthDate: string): number {
  const y = Number(birthDate.slice(0, 4));
  return new Date().getFullYear() - y;
}

/** 절기 전환 재방문 훅 (A5) — 전환 직후·임박일 때만. */
function SeasonStrip() {
  const phase = seasonPhase(new Date());
  if (!phase.justTurned && !phase.turningSoon) return null;
  return (
    <View style={s.season}>
      <Text style={s.seasonLabel}>절기 · {phase.currentTerm}</Text>
      <Text style={s.seasonBody}>{seasonHook(phase)}</Text>
    </View>
  );
}

export default function ConsultHub() {
  const insets = useSafeAreaInsets();
  // token 파라미터가 있으면 "타인 사주" 상담 — 없으면 본인(기기 저장 토큰).
  const { token: paramToken } = useLocalSearchParams<{ token?: string }>();
  const [ready, setReady] = useState(false);
  const [concerns, setConcerns] = useState<{ id: ConcernId; label: string }[]>([]);
  const [who, setWho] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (paramToken) {
        const person = await findPerson(paramToken);
        if (!person) {
          // 명부에 없는 토큰(기기 초기화 등) → 본인 상담으로 되돌린다
          router.replace("/consult");
          return;
        }
        setWho(personLabel(person));
        setConcerns(
          concernsForAge(ageFrom(person.birthDate), 6).map((c) => ({ id: c.id, label: c.label })),
        );
        setReady(true);
        return;
      }
      const birth = await loadBirth();
      const token = await loadToken();
      if (!birth || !token) {
        router.replace("/onboarding");
        return;
      }
      setWho(null);
      const list = concernsForAge(ageFrom(birth.birthDate), 6).map((c) => ({ id: c.id, label: c.label }));
      setConcerns(list);
      setReady(true);
    })();
  }, [paramToken]);

  if (!ready) {
    return (
      <View style={[s.fill, s.center]}>
        <ActivityIndicator color={color.ink} />
      </View>
    );
  }

  return (
    <ScrollView style={s.fill} contentContainerStyle={{ padding: 24, paddingTop: insets.top + 24, paddingBottom: insets.bottom + 32 }}>
      <View style={s.hstack}>
        <Stamp char="問" size={30} />
        <Text style={s.eyebrow}>{who ? `${who}의 상담` : "오늘의 상담"}</Text>
      </View>

      <View style={{ height: 10 }} />
      <View style={{ flexDirection: "row", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
        <Text style={{ fontFamily: FONT.serifBlack, fontSize: 16, color: color.ink }}>
          {CONSULTANT.name} {CONSULTANT.title}
        </Text>
        <Text style={{ fontFamily: FONT.sans, fontSize: 12, color: color.inkMuted }}>{CONSULTANT.tagline}</Text>
      </View>

      <SeasonStrip />

      <View style={{ height: 16 }} />
      <Text style={s.h}>
        {who ? `${who} 사주,\n뭐가 제일 궁금해요?` : "그래서 — 오늘,\n뭐가 제일 궁금해요?"}
      </Text>
      <View style={{ height: 8 }} />
      <Text style={s.sub}>하나만 골라요. 그 주제로 끝까지 봐줄게요.</Text>

      <View style={{ height: 22 }} />
      <View style={s.grid}>
        {concerns.map((c) => (
          <Pressable
            key={c.id}
            style={s.tile}
            onPress={() => router.push(paramToken ? `/session/${c.id}?token=${paramToken}` : `/session/${c.id}`)}
          >
            <Text style={s.tHanja}>{CONCERN_HUB[c.id].hanja}</Text>
            <Text style={s.tLabel}>{c.label}</Text>
            <Text style={s.tSub}>{CONCERN_HUB[c.id].sub}</Text>
          </Pressable>
        ))}
      </View>

      <View style={{ height: 18 }} />
      <Text style={s.fine}>한 번에 다 안 봐도 괜찮아요. 궁금할 때 하나씩 — 그게 상담이에요.</Text>

      <View style={{ height: 18 }} />
      <View style={s.divider} />
      <Pressable onPress={() => router.push("/person/new")} style={{ paddingVertical: 12 }}>
        <Text style={s.otherLink}>다른 사람 사주 보기 →</Text>
      </Pressable>
      {who && (
        <Pressable onPress={() => router.replace("/consult")} style={{ paddingVertical: 4 }}>
          <Text style={s.otherLink}>← 내 상담으로 돌아가기</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  fill: { flex: 1, backgroundColor: color.hanji },
  center: { alignItems: "center", justifyContent: "center" },
  hstack: { flexDirection: "row", alignItems: "center", gap: 10 },
  eyebrow: { fontFamily: FONT.sansMedium, fontSize: 12, letterSpacing: 4, color: color.inkMuted },
  h: { fontFamily: FONT.serifBlack, fontSize: 29, lineHeight: 40, color: color.ink },
  sub: { fontFamily: FONT.sans, fontSize: 14.5, color: color.inkSoft, lineHeight: 22 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  tile: { width: "47.5%", backgroundColor: color.white, borderWidth: 1, borderColor: color.hanjiDeep, borderRadius: 16, padding: 15, gap: 5 },
  tHanja: { fontFamily: FONT.serifBlack, fontSize: 16, color: color.gold },
  tLabel: { fontFamily: FONT.sansBold, fontSize: 16, color: color.ink },
  tSub: { fontFamily: FONT.sans, fontSize: 12, color: color.inkSoft },
  fine: { fontFamily: FONT.sans, fontSize: 12, color: color.inkMuted, textAlign: "center", lineHeight: 18 },
  divider: { height: 1, backgroundColor: color.hanjiDeep },
  otherLink: { fontFamily: FONT.sansMedium, fontSize: 13.5, color: color.inkSoft, textAlign: "center" },
  season: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: color.hanjiDeep,
    borderLeftWidth: 3,
    borderLeftColor: color.gold,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: color.white,
  },
  seasonLabel: { fontFamily: FONT.sansMedium, fontSize: 11, letterSpacing: 2, color: color.gold, marginBottom: 4 },
  seasonBody: { fontFamily: FONT.sans, fontSize: 13.5, color: color.inkSoft, lineHeight: 20 },
});
