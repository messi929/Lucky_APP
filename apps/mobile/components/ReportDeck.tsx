import type { ReportPayload } from "@lucky/api-client";
import type { ConcernId, Mode, Reaction, ResolvedUnit } from "@lucky/core";
import { router } from "expo-router";
import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { color, FONT } from "@/lib/theme";
import { fetchReport } from "@/lib/api";
import { BrushIntro } from "./BrushIntro";
import { ElementChart } from "./ElementChart";
import { Btn, Card, Chip, Dots, InkCircle, Stamp } from "./ui";

const POS_LABEL: Record<string, string> = { hour: "시", day: "일", month: "월", year: "연" };
const REACTIONS: { key: Reaction; label: string }[] = [
  { key: "soul", label: "소름 돋았어요 😳" },
  { key: "half", label: "반 정도는요" },
  { key: "skeptic", label: "글쎄요, 잘 모르겠는데" },
];

/**
 * 리포트 덱 — 카드 1장 = 뷰포트 1화면 (디자인 원칙 2).
 * 가로 페이징: mz는 스와이프, classic은 하단 [다음] 버튼 병행.
 */
export function ReportDeck({ initial }: { initial: ReportPayload }) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [payload, setPayload] = useState(initial);
  const [mode, setMode] = useState<Mode>(initial.adaptive.defaultMode);
  const [reaction, setReaction] = useState<Reaction | undefined>();
  const [concern, setConcern] = useState<ConcernId | undefined>();
  const [showIntro, setShowIntro] = useState(true);
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList<CardItem>>(null);

  async function reload(patch: { mode?: Mode; reaction?: Reaction; concern?: ConcernId }) {
    const next = await fetchReport(payload.token, {
      mode: patch.mode ?? mode,
      ...((patch.reaction ?? reaction) ? { reaction: patch.reaction ?? reaction } : {}),
      ...((patch.concern ?? concern) ? { concern: patch.concern ?? concern } : {}),
    }).catch(() => null);
    if (next) setPayload(next);
  }

  const u = useMemo(() => unitMap(payload.units), [payload]);
  const c = payload.chart;
  const day = c.pillars.find((p) => p.position === "day");
  const ilju = day ? `${day.stemKo}${day.branchKo} ${day.stemHanja}${day.branchHanja}` : "";

  const cards: CardItem[] = [
    /* 1 훅 */
    {
      key: "hook",
      node: (
        <>
          <View style={st.hstack}>
            <Text style={st.eyebrow}>당신의 일주</Text>
            <Text style={{ fontFamily: FONT.serifBold, fontSize: 13, color: color.vermilion }}>{ilju}</Text>
          </View>
          <View style={st.grow} />
          <Text style={[st.hSerif, { fontSize: 32, lineHeight: 48 }]}>{u.ilju_hook ?? "…"}</Text>
          <View style={{ height: 24 }} />
          <View style={st.hstack}>
            <Stamp char="眞" />
            <Text style={st.sub}>당신의 팔자가 그렇게 말하고 있어요</Text>
          </View>
          <View style={st.grow} />
        </>
      ),
    },
    /* 2 원국·오행 */
    {
      key: "chart",
      node: (
        <>
          <Text style={st.eyebrow}>나의 팔자</Text>
          <View style={{ height: 16 }} />
          <View style={{ flexDirection: "row", gap: 8 }}>
            {c.pillars.map((p) => {
              const isDay = p.position === "day";
              return (
                <View key={p.position} style={[st.pillar, isDay ? st.pillarDay : st.pillarWhite]}>
                  <Text style={[st.pillarPos, { color: isDay ? color.hanji : color.inkMuted }]}>{POS_LABEL[p.position]}</Text>
                  <Text style={[st.pillarHanja, { color: isDay ? color.hanji : color.ink }]}>{p.stemHanja}</Text>
                  <Text style={[st.pillarHanja, { color: isDay ? color.hanji : color.ink }]}>{p.branchHanja}</Text>
                  <Text style={[st.pillarKo, { color: isDay ? color.hanji : color.inkSoft }]}>{p.stemKo}{p.branchKo}</Text>
                </View>
              );
            })}
          </View>
          <View style={{ height: 20 }} />
          <Text style={{ fontFamily: FONT.sansBold, fontSize: 15, color: color.ink, marginBottom: 10 }}>오행의 균형</Text>
          <ElementChart fiveElements={c.fiveElements} />
          {!!u.element_balance && <Card style={{ marginTop: 12 }}><Text style={st.sub}>{u.element_balance}</Text></Card>}
          <View style={st.dailyCard}>
            <Text style={st.dailyLabel}>오늘의 한 줄 · {payload.daily.todayGanji}일</Text>
            <Text style={st.dailyLine}>{payload.daily.line}</Text>
          </View>
        </>
      ),
    },
    /* 3 타입 */
    {
      key: "type",
      center: true,
      node: (
        <>
          <Text style={st.eyebrow}>나의 타입</Text>
          <View style={st.grow} />
          <InkCircle char={day?.stemHanja ?? ""} size={200} />
          <View style={{ height: 24 }} />
          <Text style={[st.hSerif, { fontSize: 30 }]}>{c.character.name}</Text>
          <View style={{ height: 12 }} />
          <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 8 }}>
            {c.character.keywords.map((k) => <Chip key={k} label={k} />)}
          </View>
          <View style={st.grow} />
        </>
      ),
    },
    /* 반응 체크 */
    {
      key: "reaction",
      center: true,
      node: (
        <>
          <View style={st.grow} />
          <Stamp char="問" size={40} />
          <View style={{ height: 20 }} />
          <Text style={[st.hSerif, { fontSize: 28, textAlign: "center" }]}>여기까지,{"\n"}어때요. 좀 맞나요?</Text>
          <View style={{ height: 24, width: "100%" }} />
          {REACTIONS.map((r) => (
            <View key={r.key} style={{ width: "100%", marginBottom: 8 }}>
              <Btn
                label={r.label}
                variant={reaction === r.key ? "ink" : "ghost"}
                onPress={() => { setReaction(r.key); void reload({ reaction: r.key }); }}
                style={reaction === r.key ? {} : st.whiteBtn}
              />
            </View>
          ))}
          <Text style={[st.fine, { marginTop: 6 }]}>어느 쪽이든 좋아요 — 다음 이야기가 달라질 뿐</Text>
          <View style={st.grow} />
        </>
      ),
    },
    /* 4 성격 코어 */
    {
      key: "personality",
      node: (
        <>
          <Text style={st.eyebrow}>성격의 코어</Text>
          <View style={{ height: 20 }} />
          <Text style={[st.hSerif, { fontSize: 24 }]}>{u.personality_core ?? "…"}</Text>
          <View style={st.grow} />
        </>
      ),
    },
    /* 고민 문답 */
    {
      key: "concern",
      node: (
        <>
          <Stamp char="答" />
          <View style={{ height: 16 }} />
          <Text style={[st.hSerif, { fontSize: 28 }]}>그래서, 요즘{"\n"}뭐가 제일 답답해요?</Text>
          <View style={{ height: 8 }} />
          <Text style={st.sub}>하나만 골라주세요. 뒤 이야기가 그쪽으로 갑니다.</Text>
          <View style={{ height: 20 }} />
          <View style={st.tileGrid}>
            {payload.adaptive.concerns.map((co) => (
              <Pressable
                key={co.id}
                onPress={() => { setConcern(co.id); void reload({ concern: co.id }); }}
                style={[st.tile, concern === co.id && st.tileOn]}
              >
                <Text style={{ fontFamily: FONT.sansBold, fontSize: 15, color: color.ink }}>{co.label}</Text>
              </Pressable>
            ))}
          </View>
          <View style={st.grow} />
        </>
      ),
    },
  ];

  /* 5 하반기 운 (있을 때만) */
  if (u.seasonal_fortune) {
    cards.push({
      key: "seasonal",
      node: (
        <>
          <Text style={[st.eyebrow, { letterSpacing: 2 }]}>2026 하반기</Text>
          <View style={{ height: 20 }} />
          <Text style={[st.hSerif, { fontSize: 26 }]}>{u.seasonal_fortune}</Text>
          <View style={st.grow} />
        </>
      ),
    });
  }

  /* 6 조심할 것 */
  cards.push({
    key: "caution",
    node: (
      <>
        <Text style={st.eyebrow}>조심할 것</Text>
        <View style={{ height: 20 }} />
        <Card style={{ padding: 18 }}>
          <Text style={{ fontFamily: FONT.sansMedium, fontSize: 12, color: color.vermilion, marginBottom: 8 }}>
            {payload.paid ? "당신의 원국이 말하는 주의점" : "하나는 그냥 알려드릴게요"}
          </Text>
          <Text style={{ fontFamily: FONT.serifBold, fontSize: 19, lineHeight: 29, color: color.ink }}>
            {payload.paid ? u.caution : firstSentence(u.caution)}
          </Text>
        </Card>
        {!payload.paid && (
          <>
            {[0, 1, 2].map((i) => (
              <Card key={i} style={{ padding: 18, marginTop: i === 0 ? 10 : 6 }}>
                <View style={{ height: 12, borderRadius: 6, backgroundColor: "rgba(141,135,125,.16)", width: `${70 - i * 8}%`, marginBottom: 8 }} />
                <View style={{ height: 12, borderRadius: 6, backgroundColor: "rgba(141,135,125,.11)", width: `${55 - i * 6}%` }} />
              </Card>
            ))}
            <View style={st.grow} />
            <Text style={[st.sub, { textAlign: "center", marginBottom: 10 }]}>구독하면 월별 캘린더까지 전부 열립니다</Text>
            <Btn label="구독하고 마저 보기" variant="ink" onPress={() => router.push("/subscribe")} />
          </>
        )}
      </>
    ),
  });

  /* 7 처방전 */
  cards.push({
    key: "remedy",
    node: (
      <>
        <View style={st.hstack}><Stamp char="運" /><Text style={[st.hSerif, { fontSize: 22 }]}>개운 처방전</Text></View>
        <View style={{ height: 6 }} />
        <Text style={[st.eyebrow, { letterSpacing: 1 }]}>2026 하반기 · {ilju}</Text>
        <View style={{ height: 20, gap: 6 }}>
          <RemedyRow label="당신의 색" value={c.remedy.colors.join(" · ")} />
          <RemedyRow label="좋은 방향" value={c.remedy.direction} />
          <RemedyRow label="올해의 한 가지" value={c.remedy.oneThing} />
        </View>
        <View style={st.grow} />
        <Btn label="이미지로 저장 · 스토리 9:16" variant="ink" />
      </>
    ),
  });

  /* 8 CTA */
  cards.push({
    key: "cta",
    node: (
      <>
        <Stamp char="緣" />
        <View style={{ height: 16 }} />
        <Text style={[st.hSerif, { fontSize: 28 }]}>여기서부터는{"\n"}당신이 고를 차례</Text>
        <View style={st.grow} />
        <View style={{ gap: 8 }}>
          <Btn label="복채 문답 · 하나 묻기" variant="ink" onPress={() => router.push("/ask")} />
          <Btn label="궁합 · 가족 보기" variant="ghost" style={st.wideGhost} onPress={() => router.push("/compat/new")} />
          <Btn label="택일 · 좋은 날 찾기" variant="ghost" style={st.wideGhost} onPress={() => router.push("/vertical/taekil")} />
          <Btn label="구독 — 매일 아침 + 문답 + 궁합" variant="ghost" style={st.wideGhost} onPress={() => router.push("/subscribe")} />
        </View>
        <Text style={[st.fine, { marginTop: 16 }]}>{payload.disclaimer}</Text>
      </>
    ),
  });

  const last = index >= cards.length - 1;
  const goNext = useCallback(() => {
    listRef.current?.scrollToIndex({ index: Math.min(index + 1, cards.length - 1), animated: true });
  }, [index, cards.length]);

  const onScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const next = Math.round(e.nativeEvent.contentOffset.x / width);
      setIndex(next);
    },
    [width],
  );

  if (showIntro) return <BrushIntro pillars={c.pillars} onDone={() => setShowIntro(false)} />;

  const barHeight = insets.bottom + (mode === "classic" ? 84 : 44);

  return (
    <View style={{ flex: 1, backgroundColor: color.hanji }}>
      {/* mode 토글 */}
      <View style={[st.toggle, { top: insets.top + 8 }]}>
        {(["mz", "classic"] as Mode[]).map((m) => (
          <Pressable key={m} onPress={() => { setMode(m); void reload({ mode: m }); }} style={[st.toggleBtn, mode === m && st.toggleOn]}>
            <Text style={{ fontSize: 12, color: mode === m ? color.hanji : color.inkMuted }}>{m === "mz" ? "요즘말" : "정중히"}</Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        ref={listRef}
        data={cards}
        keyExtractor={(item) => item.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScrollEnd}
        getItemLayout={(_d, i) => ({ length: width, offset: width * i, index: i })}
        renderItem={({ item }) => (
          <ScrollView
            style={{ width }}
            contentContainerStyle={[
              st.card,
              {
                paddingTop: insets.top + 48,
                paddingBottom: barHeight + 16,
                ...(item.center ? { alignItems: "center" } : {}),
              },
            ]}
            showsVerticalScrollIndicator={false}
          >
            {item.node}
          </ScrollView>
        )}
      />

      {/* 하단 고정 바 — 진행 도트 + (classic) 다음 버튼 */}
      <View style={[st.bar, { paddingBottom: insets.bottom + 12 }]}>
        {mode === "classic" && !last && (
          <View style={{ width: "100%", marginBottom: 12 }}>
            <Btn label="다음" variant="ink" onPress={goNext} />
          </View>
        )}
        <Dots total={cards.length} active={index} />
        {mode === "mz" && index === 0 && <Text style={st.swipeHint}>옆으로 밀어서 넘기기 →</Text>}
      </View>
    </View>
  );
}

type CardItem = { key: string; node: ReactNode; center?: boolean };

function RemedyRow({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <Text style={{ fontFamily: FONT.sansMedium, fontSize: 11, color: color.inkMuted, letterSpacing: 1, marginBottom: 2 }}>{label}</Text>
      <Text style={{ fontFamily: FONT.sansBold, color: color.ink }}>{value}</Text>
    </Card>
  );
}

function unitMap(units: ResolvedUnit[]): Partial<Record<string, string>> {
  const m: Record<string, string> = {};
  for (const un of units) m[un.kind] = un.text;
  return m;
}
function firstSentence(text?: string): string {
  if (!text) return "…";
  const idx = text.search(/[.。!?]/);
  return idx > 0 ? text.slice(0, idx + 1) : text;
}

const st = StyleSheet.create({
  card: { flexGrow: 1, paddingHorizontal: 24, justifyContent: "center" },
  grow: { flex: 1, minHeight: 16 },
  hstack: { flexDirection: "row", alignItems: "center", gap: 10 },
  eyebrow: { fontFamily: FONT.sansMedium, fontSize: 12, letterSpacing: 4, color: color.inkMuted },
  hSerif: { fontFamily: FONT.serifBlack, color: color.ink, lineHeight: 40 },
  sub: { fontFamily: FONT.sans, fontSize: 14, color: color.inkSoft, lineHeight: 22 },
  fine: { fontFamily: FONT.sans, fontSize: 11, color: color.inkMuted },
  toggle: { position: "absolute", right: 12, zIndex: 20, flexDirection: "row", borderRadius: 100, borderWidth: 1, borderColor: color.hanjiDeep, backgroundColor: "rgba(255,255,255,.85)", overflow: "hidden" },
  toggleBtn: { paddingHorizontal: 12, paddingVertical: 6 },
  toggleOn: { backgroundColor: color.ink },
  bar: { position: "absolute", left: 0, right: 0, bottom: 0, paddingHorizontal: 24, paddingTop: 12, alignItems: "center", backgroundColor: color.hanji },
  swipeHint: { fontFamily: FONT.sans, fontSize: 11, color: color.inkMuted, marginTop: 8 },
  pillar: { flex: 1, alignItems: "center", borderRadius: 12, paddingVertical: 14 },
  pillarWhite: { backgroundColor: color.white, borderWidth: 1, borderColor: color.hanjiDeep },
  pillarDay: { backgroundColor: color.ink },
  pillarPos: { fontFamily: FONT.sans, fontSize: 11, marginBottom: 6 },
  pillarHanja: { fontFamily: FONT.serifBlack, fontSize: 28 },
  pillarKo: { fontFamily: FONT.sans, fontSize: 11, marginTop: 6 },
  dailyCard: { marginTop: 12, backgroundColor: color.ink, borderRadius: 16, padding: 18 },
  dailyLabel: { fontSize: 11, letterSpacing: 2, color: "#CCC5BB", marginBottom: 8, fontFamily: FONT.sans },
  dailyLine: { fontFamily: FONT.serifBold, fontSize: 16, color: color.hanji, lineHeight: 24 },
  whiteBtn: { backgroundColor: color.white, borderWidth: 1, borderColor: color.hanjiDeep, borderRadius: 14, minHeight: 52, paddingVertical: 0 },
  tileGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  tile: { width: "47%", backgroundColor: color.white, borderWidth: 1, borderColor: color.hanjiDeep, borderRadius: 14, padding: 16 },
  tileOn: { borderColor: color.ink, borderWidth: 2 },
  wideGhost: { width: "100%", borderRadius: 14 },
});
