import type { StoredPerson } from "@lucky/api-client";
import type { SajuInput } from "@lucky/core";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BirthForm } from "@/components/BirthForm";
import { Stamp } from "@/components/ui";
import { createReport } from "@/lib/api";
import { listPeople, personLabel, rememberPerson } from "@/lib/storage";
import { color, FONT } from "@/lib/theme";

/**
 * PERSON-NEW — "누구의 사주를 볼까요?".
 * 궁합이 아니라 그 사람 단독 상담. 독립 토큰을 발급받아 내 토큰(palja.token)과 분리 보관한다.
 */
export default function NewPerson() {
  const insets = useSafeAreaInsets();
  const [alias, setAlias] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [people, setPeople] = useState<StoredPerson[]>([]);

  useEffect(() => {
    listPeople().then(setPeople);
  }, []);

  async function submit(birth: SajuInput) {
    setBusy(true);
    setErr("");
    try {
      const payload = await createReport(birth);
      await rememberPerson({
        token: payload.token,
        alias: alias.trim() || undefined,
        birthDate: birth.birthDate,
      });
      router.replace(`/consult?token=${payload.token}`);
    } catch (e) {
      setErr((e as Error).message || "잠시 문제가 생겼어요. 다시 시도해 주세요.");
      setBusy(false);
    }
  }

  return (
    <ScrollView
      style={s.fill}
      contentContainerStyle={{ padding: 24, paddingTop: insets.top + 24, paddingBottom: insets.bottom + 32 }}
      keyboardShouldPersistTaps="handled"
    >
      <View style={s.hstack}>
        <Stamp char="命" size={30} />
        <Text style={s.eyebrow}>다른 사람 사주</Text>
      </View>

      <View style={{ height: 16 }} />
      <Text style={s.h}>누구의 사주를{"\n"}볼까요?</Text>
      <View style={{ height: 8 }} />
      <Text style={s.sub}>그 사람 이야기는 따로 봐요. 내 상담은 그대로 남아 있어요.</Text>

      <View style={{ height: 22 }} />
      <View style={s.field}>
        <Text style={s.fl}>호칭 · 선택</Text>
        <TextInput
          value={alias}
          onChangeText={(t) => setAlias(t.slice(0, 12))}
          placeholder="엄마, 동생, 친구…"
          placeholderTextColor={color.inkMuted}
          style={s.fv}
        />
      </View>
      <View style={{ height: 8 }} />
      <Text style={s.fine}>
        이름은 안 물어봐요. 호칭은 이 기기에서 목록을 알아보기 위한 것이고, 비워도 됩니다.
      </Text>

      <View style={{ height: 18 }} />
      <BirthForm submitLabel="이 사람 사주 보기" onSubmit={submit} busy={busy} />
      {err ? <Text style={s.err}>{err}</Text> : null}

      {people.length > 0 && (
        <>
          <View style={{ height: 26 }} />
          <Text style={s.fl}>전에 봐준 사람</Text>
          <View style={{ height: 8 }} />
          <View style={s.chips}>
            {people.map((p) => (
              <Pressable key={p.token} style={s.chip} onPress={() => router.replace(`/consult?token=${p.token}`)}>
                <Text style={s.chipT}>{personLabel(p)}</Text>
              </Pressable>
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  fill: { flex: 1, backgroundColor: color.hanji },
  hstack: { flexDirection: "row", alignItems: "center", gap: 10 },
  eyebrow: { fontFamily: FONT.sansMedium, fontSize: 12, letterSpacing: 4, color: color.inkMuted },
  h: { fontFamily: FONT.serifBlack, fontSize: 29, lineHeight: 40, color: color.ink },
  sub: { fontFamily: FONT.sans, fontSize: 14.5, color: color.inkSoft, lineHeight: 22 },
  field: {
    backgroundColor: color.white,
    borderWidth: 1,
    borderColor: color.hanjiDeep,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  fl: { fontFamily: FONT.sansMedium, fontSize: 12, color: color.inkMuted, letterSpacing: 0.6 },
  fv: { fontFamily: FONT.sansBold, fontSize: 17, color: color.ink, padding: 0, marginTop: 4 },
  fine: { fontFamily: FONT.sans, fontSize: 12, color: color.inkMuted, lineHeight: 18 },
  err: { fontFamily: FONT.sans, fontSize: 13, color: color.vermilion, marginTop: 8 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { backgroundColor: color.hanjiDeep, borderRadius: 100, paddingHorizontal: 14, paddingVertical: 8 },
  chipT: { fontFamily: FONT.sansMedium, fontSize: 13, color: color.inkSoft },
});
