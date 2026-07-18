import type { SessionPayload } from "@lucky/api-client";
import type { ConcernId } from "@lucky/core";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Btn, Card, Dots, Stamp } from "@/components/ui";
import { fetchSession } from "@/lib/api";
import { loadToken } from "@/lib/storage";
import { color, FONT } from "@/lib/theme";

/**
 * 상담 세션 (SESSION) — 고민 1개 집중. 진단→근거→시기→처방→마무리→다음.
 * 카드 1장 = 뷰포트 1화면(원칙). 무료는 진단까지, 근거·시기·처방은 주제 단위 해금.
 */

const POS_LABEL: Record<string, string> = { hour: "시", day: "일", month: "월", year: "연" };
const BEAT_EYEBROW: Record<string, string> = {
  session_diagnosis: "하나 · 진단",
  session_reason: "둘 · 근거",
  session_timing: "셋 · 시기",
  session_remedy: "넷 · 처방",
};

type Beat = SessionPayload["beats"][number];

export default function Session() {
  const { concern } = useLocalSearchParams<{ concern: string }>();
  const insets = useSafeAreaInsets();
  const [payload, setPayload] = useState<SessionPayload | null>(null);
  const [err, setErr] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    (async () => {
      const token = await loadToken();
      if (!token) {
        router.replace("/onboarding");
        return;
      }
      try {
        const p = await fetchSession(token, concern as ConcernId, { mode: "mz" });
        setPayload(p);
      } catch (e) {
        setErr((e as Error).message);
      }
    })();
  }, [concern]);

  const cards = useMemo<CardItem[]>(() => (payload ? buildCards(payload) : []), [payload]);

  const goNext = useCallback(() => setIndex((i) => Math.min(i + 1, cards.length - 1)), [cards.length]);

  if (err) {
    return (
      <View style={[st.fill, st.center, { padding: 24 }]}>
        <Text style={st.sub}>{err}</Text>
        <View style={{ height: 16 }} />
        <Btn label="상담 허브로" variant="ink" onPress={() => router.replace("/consult")} />
      </View>
    );
  }
  if (!payload) {
    return (
      <View style={[st.fill, st.center]}>
        <Stamp char="緣" size={40} />
        <View style={{ height: 16 }} />
        <ActivityIndicator color={color.ink} />
        <Text style={[st.fine, { marginTop: 12 }]}>도사가 헤아리는 중…</Text>
      </View>
    );
  }

  const card = cards[index];
  const last = index >= cards.length - 1;

  return (
    <View style={st.fill}>
      {/* 헤더 — 주제 + 낙관 */}
      <View style={[st.header, { paddingTop: insets.top + 12 }]}>
        <Stamp char="緣" size={30} />
        <Text style={st.headerLabel}>{payload.concern.label} · 상담</Text>
      </View>

      <ScrollView
        style={st.fill}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 120, flexGrow: 1, justifyContent: "center" }}
        showsVerticalScrollIndicator={false}
      >
        {card.node}
      </ScrollView>

      {/* 하단 바 — 진행 + 다음 */}
      <View style={[st.bar, { paddingBottom: insets.bottom + 14 }]}>
        {card.action ?? (!last && <Btn label="다음" variant="ink" onPress={goNext} />)}
        <View style={{ height: 12 }} />
        <Dots total={cards.length} active={index} />
      </View>
    </View>
  );
}

type CardItem = { key: string; node: ReactNode; action?: ReactNode };

function buildCards(p: SessionPayload): CardItem[] {
  const byKind = (k: string): Beat | undefined => p.beats.find((b) => b.kind === k);
  const diagnosis = byKind("session_diagnosis");
  const cards: CardItem[] = [];

  // 1) 진단 (무료 티저)
  cards.push({
    key: "diagnosis",
    node: (
      <>
        <Text style={st.eyebrow}>{BEAT_EYEBROW.session_diagnosis}</Text>
        <View style={{ height: 18 }} />
        <Text style={st.quote}>{diagnosis?.text ?? "…"}</Text>
        <View style={{ height: 16 }} />
        <Text style={st.sub}>넘겨서 왜 그런지 — 당신 사주의 근거를 볼게요.</Text>
      </>
    ),
  });

  if (p.paid) {
    // 2) 근거 — 원국 일지 하이라이트
    const reason = byKind("session_reason");
    cards.push({
      key: "reason",
      node: (
        <>
          <Text style={st.eyebrow}>{BEAT_EYEBROW.session_reason}</Text>
          <View style={{ height: 14 }} />
          <View style={st.pillars}>
            {p.chart.pillars.map((pl) => {
              const isDay = pl.position === "day";
              return (
                <View key={pl.position} style={[st.pil, isDay ? st.pilDay : st.pilWhite]}>
                  <Text style={[st.pilPos, { color: isDay ? color.hanji : color.inkMuted }]}>{POS_LABEL[pl.position]}</Text>
                  <Text style={[st.pilHanja, { color: isDay ? color.hanji : color.ink }]}>{pl.stemHanja}</Text>
                  <Text style={[st.pilHanja, { color: isDay ? color.vermilion : color.ink }]}>{pl.branchHanja}</Text>
                </View>
              );
            })}
          </View>
          <View style={{ height: 18 }} />
          <Text style={st.body}>{reason?.text ?? "…"}</Text>
        </>
      ),
    });

    // 3) 시기
    const timing = byKind("session_timing");
    cards.push({
      key: "timing",
      node: (
        <>
          <Text style={st.eyebrow}>{BEAT_EYEBROW.session_timing}</Text>
          <View style={{ height: 16 }} />
          <Text style={st.body}>{timing?.text ?? "…"}</Text>
        </>
      ),
    });

    // 4) 처방
    const remedy = byKind("session_remedy");
    cards.push({
      key: "remedy",
      node: (
        <>
          <View style={st.hstack}>
            <Stamp char="運" size={30} />
            <Text style={st.eyebrow}>{BEAT_EYEBROW.session_remedy}</Text>
          </View>
          <View style={{ height: 16 }} />
          <Text style={st.body}>{remedy?.text ?? "…"}</Text>
          <View style={{ height: 16 }} />
          <Card>
            <Text style={st.tiny}>당신의 색</Text>
            <Text style={st.bodyBold}>{p.chart.remedy.colors.join(" · ")} · {p.chart.remedy.direction}</Text>
          </Card>
        </>
      ),
    });

    // 5) 마무리 — 꺾는 문장(진단이 곧 결론) + 緣
    cards.push({
      key: "close",
      node: (
        <View style={{ alignItems: "center" }}>
          <Stamp char="緣" size={56} />
          <View style={{ height: 22 }} />
          <Text style={st.pivot}>{diagnosis?.text ?? "…"}</Text>
          <View style={{ height: 16 }} />
          <Text style={[st.sub, { textAlign: "center" }]}>— {p.concern.label}, 여기까지 봤어요.</Text>
        </View>
      ),
      action: <Btn label="이어서, 다음이 궁금해요" variant="ink" onPress={() => router.replace(nextHref(p))} />,
    });
  } else {
    // 무료: 진단 후 주제 단위 해금
    cards.push({
      key: "pay",
      node: (
        <>
          <Text style={st.eyebrow}>이 상담 하나 열기</Text>
          <View style={{ height: 14 }} />
          <View style={st.lockCard}>
            <Text style={st.lockTitle}>근거 · 시기 · 처방{"\n"}세 장을 이어서 봅니다</Text>
            <View style={{ height: 14 }} />
            <View style={st.pillars}>
              {["근거", "시기", "처방"].map((t) => (
                <View key={t} style={[st.pil, st.pilWhite, { opacity: 0.5 }]}>
                  <Text style={[st.pilHanja, { color: color.inkMuted, fontSize: 15 }]}>{t}</Text>
                </View>
              ))}
            </View>
          </View>
          <View style={{ height: 12 }} />
          <Card>
            <Text style={st.tiny}>
              구매 전 안내 · 콘텐츠 특성상 열람 즉시 청약철회가 제한됩니다. 아래를 눌러 동의하고 진행합니다.
            </Text>
          </Card>
        </>
      ),
      action: (
        <View style={{ gap: 8 }}>
          <Btn label="동의하고 열기 · 990원" variant="gold" onPress={() => router.push("/subscribe")} />
          <Btn label="다른 고민부터 볼래요" variant="ghost" onPress={() => router.replace("/consult")} />
        </View>
      ),
    });
  }

  return cards;
}

function nextHref(p: SessionPayload): string {
  if (p.next?.concern) return `/session/${p.next.concern}`;
  if (p.next?.sku === "taekil") return "/vertical/taekil";
  return "/consult";
}

const st = StyleSheet.create({
  fill: { flex: 1, backgroundColor: color.hanji },
  center: { alignItems: "center", justifyContent: "center" },
  hstack: { flexDirection: "row", alignItems: "center", gap: 10 },
  header: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 24, paddingBottom: 8 },
  headerLabel: { fontFamily: FONT.sansMedium, fontSize: 12, letterSpacing: 2, color: color.inkMuted },
  eyebrow: { fontFamily: FONT.sansMedium, fontSize: 12, letterSpacing: 4, color: color.inkMuted },
  quote: { fontFamily: FONT.serifBlack, fontSize: 29, lineHeight: 42, color: color.ink },
  pivot: { fontFamily: FONT.serifBlack, fontSize: 27, lineHeight: 40, color: color.vermilion, textAlign: "center" },
  body: { fontFamily: FONT.sans, fontSize: 16.5, lineHeight: 27, color: color.ink },
  bodyBold: { fontFamily: FONT.sansBold, fontSize: 15, color: color.ink },
  sub: { fontFamily: FONT.sans, fontSize: 14.5, color: color.inkSoft, lineHeight: 22 },
  fine: { fontFamily: FONT.sans, fontSize: 12, color: color.inkMuted },
  tiny: { fontFamily: FONT.sans, fontSize: 12.5, color: color.inkSoft, lineHeight: 19 },
  bar: { position: "absolute", left: 0, right: 0, bottom: 0, paddingHorizontal: 24, paddingTop: 12, alignItems: "center", backgroundColor: color.hanji },
  pillars: { flexDirection: "row", gap: 8 },
  pil: { flex: 1, alignItems: "center", borderRadius: 12, paddingVertical: 12 },
  pilWhite: { backgroundColor: color.white, borderWidth: 1, borderColor: color.hanjiDeep },
  pilDay: { backgroundColor: color.ink },
  pilPos: { fontFamily: FONT.sans, fontSize: 10, marginBottom: 5 },
  pilHanja: { fontFamily: FONT.serifBlack, fontSize: 24 },
  lockCard: { borderWidth: 1, borderColor: color.gold, borderStyle: "dashed", borderRadius: 14, padding: 18, alignItems: "center" },
  lockTitle: { fontFamily: FONT.serifBold, fontSize: 18, lineHeight: 27, color: color.ink, textAlign: "center" },
});
