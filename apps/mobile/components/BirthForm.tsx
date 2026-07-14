import { REGIONS, type SajuInput } from "@lucky/core";
import { useMemo, useRef, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { color, FONT } from "@/lib/theme";
import { Btn } from "./ui";

const REGION_LIST = Object.values(REGIONS);
const MIN_YEAR = 1900;

/**
 * 출생 입력 (ON-1). 네이티브 피커 대신 숫자 직접 입력 —
 * 생년월일 8자리 / 시각 4자리. 스크롤·휠 없이 키패드로 한 번에 끝난다.
 */
export function BirthForm({
  submitLabel,
  onSubmit,
  busy,
  initial,
}: {
  submitLabel: string;
  onSubmit: (birth: SajuInput) => void;
  busy?: boolean;
  initial?: SajuInput;
}) {
  const [ymd, setYmd] = useState(() => (initial ? initial.birthDate.replace(/-/g, "") : ""));
  const [hm, setHm] = useState(() => (initial?.birthTime ? initial.birthTime.replace(":", "") : ""));
  const [unknownTime, setUnknownTime] = useState(initial?.unknownTime ?? false);
  const [lunar, setLunar] = useState(initial?.calendarType === "lunar");
  const [gender, setGender] = useState<"" | "male" | "female">(initial?.gender ?? "");
  const [region, setRegion] = useState<string>(initial?.birthRegion ?? "");
  const [err, setErr] = useState("");
  const timeRef = useRef<TextInput>(null);

  const dateErr = useMemo(() => validateYmd(ymd), [ymd]);
  const timeErr = useMemo(() => (unknownTime ? "" : validateHm(hm)), [hm, unknownTime]);
  const ready = ymd.length === 8 && !dateErr && (unknownTime || (hm.length === 4 && !timeErr));

  function onYmdChange(next: string) {
    const digits = next.replace(/\D/g, "").slice(0, 8);
    setYmd(digits);
    setErr("");
    if (digits.length === 8 && !validateYmd(digits) && !unknownTime) timeRef.current?.focus();
  }

  function submit() {
    if (!ready) {
      setErr(dateErr || timeErr || "생년월일을 8자리로 입력해 주세요.");
      return;
    }
    onSubmit({
      birthDate: `${ymd.slice(0, 4)}-${ymd.slice(4, 6)}-${ymd.slice(6, 8)}`,
      calendarType: lunar ? "lunar" : "solar",
      unknownTime,
      ...(unknownTime ? {} : { birthTime: `${hm.slice(0, 2)}:${hm.slice(2, 4)}` }),
      ...(gender ? { gender } : {}),
      ...(region ? { birthRegion: region as SajuInput["birthRegion"] } : {}),
    });
  }

  return (
    <View style={{ gap: 20 }}>
      {/* 생년월일 — 8자리 */}
      <View>
        <View style={s.labelRow}>
          <Text style={s.label}>생년월일</Text>
          <View style={s.seg}>
            {([["solar", "양력"], ["lunar", "음력"]] as const).map(([v, l]) => {
              const on = (v === "lunar") === lunar;
              return (
                <Pressable key={v} onPress={() => setLunar(v === "lunar")} style={[s.segBtn, on && s.segBtnOn]}>
                  <Text style={[s.segText, on && s.segTextOn]}>{l}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
        <TextInput
          value={formatYmd(ymd)}
          onChangeText={onYmdChange}
          keyboardType="number-pad"
          inputMode="numeric"
          maxLength={12}
          placeholder="1990 . 03 . 15"
          placeholderTextColor={color.inkMuted}
          style={[s.bigInput, !!dateErr && ymd.length === 8 && s.inputErr]}
          autoFocus={!initial}
        />
        <Text style={s.hint}>{dateErr && ymd.length >= 4 ? dateErr : "숫자 8자리만 입력하면 돼요"}</Text>
      </View>

      {/* 태어난 시각 — 4자리 */}
      <View>
        <View style={s.labelRow}>
          <Text style={s.label}>태어난 시각</Text>
          <Pressable onPress={() => setUnknownTime(!unknownTime)} style={[s.pill, unknownTime && s.pillOn]}>
            <Text style={[s.pillText, unknownTime && s.pillTextOn]}>시간 몰라요</Text>
          </Pressable>
        </View>
        <TextInput
          ref={timeRef}
          value={formatHm(hm)}
          onChangeText={(v) => { setHm(v.replace(/\D/g, "").slice(0, 4)); setErr(""); }}
          keyboardType="number-pad"
          inputMode="numeric"
          maxLength={7}
          placeholder="14 : 30"
          placeholderTextColor={color.inkMuted}
          editable={!unknownTime}
          style={[s.bigInput, unknownTime && s.inputOff, !!timeErr && hm.length === 4 && s.inputErr]}
        />
        <Text style={s.hint}>
          {unknownTime
            ? "시(時) 없이 보는 법도 있어요 — 나머지 세 기둥으로 봅니다"
            : timeErr && hm.length >= 2
              ? timeErr
              : "24시 기준 — 밤 11시 20분이면 2320"}
        </Text>
      </View>

      {/* 성별 */}
      <View>
        <Text style={[s.label, { marginBottom: 8 }]}>성별 <Text style={s.optional}>선택</Text></Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
          {([["male", "남성"], ["female", "여성"], ["", "선택 안 함"]] as const).map(([v, label]) => (
            <Pressable key={v} onPress={() => setGender(v)} style={[s.choice, gender === v && s.choiceOn]}>
              <Text style={[s.choiceText, gender === v && s.choiceTextOn]}>{label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* 지역 */}
      <View>
        <Text style={[s.label, { marginBottom: 8 }]}>
          태어난 지역 <Text style={s.optional}>선택 · 경도 반영</Text>
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, paddingVertical: 2 }}>
          {REGION_LIST.map((r) => (
            <Pressable key={r.code} onPress={() => setRegion(region === r.code ? "" : r.code)} style={[s.chip, region === r.code && s.chipOn]}>
              <Text style={[s.chipText, region === r.code && s.chipTextOn]}>{r.name}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {!!err && <Text style={s.err}>{err}</Text>}
      <Btn label={busy ? "팔자를 적는 중…" : submitLabel} onPress={submit} disabled={busy || !ready} />
    </View>
  );
}

function formatYmd(d: string): string {
  if (!d) return "";
  const parts = [d.slice(0, 4), d.slice(4, 6), d.slice(6, 8)].filter(Boolean);
  return parts.join(" . ");
}
function formatHm(d: string): string {
  if (!d) return "";
  const parts = [d.slice(0, 2), d.slice(2, 4)].filter(Boolean);
  return parts.join(" : ");
}

function validateYmd(d: string): string {
  if (d.length < 8) return "";
  const y = Number(d.slice(0, 4));
  const m = Number(d.slice(4, 6));
  const day = Number(d.slice(6, 8));
  const now = new Date();
  if (y < MIN_YEAR || y > now.getFullYear()) return `${MIN_YEAR}년 ~ ${now.getFullYear()}년 사이로 입력해 주세요.`;
  if (m < 1 || m > 12) return "월은 01~12로 입력해 주세요.";
  const last = new Date(y, m, 0).getDate();
  if (day < 1 || day > last) return `${m}월은 ${last}일까지예요.`;
  if (new Date(y, m - 1, day) > now) return "아직 오지 않은 날이에요.";
  return "";
}

function validateHm(t: string): string {
  if (t.length < 4) return "";
  const h = Number(t.slice(0, 2));
  const min = Number(t.slice(2, 4));
  if (h > 23) return "시는 00~23으로 입력해 주세요.";
  if (min > 59) return "분은 00~59로 입력해 주세요.";
  return "";
}

const s = StyleSheet.create({
  labelRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  label: { fontFamily: FONT.sansBold, fontSize: 14, color: color.ink },
  optional: { fontFamily: FONT.sans, fontSize: 12, color: color.inkMuted },
  bigInput: {
    fontFamily: FONT.serifBold,
    fontSize: 30,
    letterSpacing: 1,
    color: color.ink,
    backgroundColor: color.white,
    borderWidth: 1,
    borderColor: color.hanjiDeep,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  inputOff: { opacity: 0.4 },
  inputErr: { borderColor: color.vermilion },
  hint: { fontFamily: FONT.sans, fontSize: 12, color: color.inkMuted, marginTop: 6, lineHeight: 18 },
  err: { fontFamily: FONT.sansMedium, fontSize: 13, color: color.vermilion },
  seg: { flexDirection: "row", borderRadius: 100, backgroundColor: color.hanjiDeep, padding: 2 },
  segBtn: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 100 },
  segBtnOn: { backgroundColor: color.ink },
  segText: { fontFamily: FONT.sansMedium, fontSize: 12, color: color.inkSoft },
  segTextOn: { color: color.hanji },
  pill: { paddingVertical: 7, paddingHorizontal: 12, borderRadius: 100, borderWidth: 1, borderColor: color.hanjiDeep, backgroundColor: color.white },
  pillOn: { backgroundColor: color.ink, borderColor: color.ink },
  pillText: { fontFamily: FONT.sansMedium, fontSize: 12, color: color.inkMuted },
  pillTextOn: { color: color.hanji },
  choice: { flex: 1, alignItems: "center", paddingVertical: 14, borderRadius: 14, borderWidth: 1, borderColor: color.hanjiDeep, backgroundColor: color.white },
  choiceOn: { backgroundColor: color.ink, borderColor: color.ink },
  choiceText: { fontFamily: FONT.sansMedium, fontSize: 14, color: color.inkSoft },
  choiceTextOn: { color: color.hanji },
  chip: { paddingVertical: 9, paddingHorizontal: 14, borderRadius: 100, backgroundColor: color.white, borderWidth: 1, borderColor: color.hanjiDeep },
  chipOn: { backgroundColor: color.ink, borderColor: color.ink },
  chipText: { fontFamily: FONT.sansMedium, fontSize: 13, color: color.inkSoft },
  chipTextOn: { color: color.hanji },
});
