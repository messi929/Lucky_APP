import DateTimePicker from "@react-native-community/datetimepicker";
import { REGIONS, type SajuInput } from "@lucky/core";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { color, FONT } from "@/lib/theme";
import { Btn } from "./ui";

const REGION_LIST = Object.values(REGIONS);

/** 대화체 출생 입력 (RN, ON-1). onSubmit에 SajuInput 전달. */
export function BirthForm({
  submitLabel,
  onSubmit,
  busy,
}: {
  submitLabel: string;
  onSubmit: (birth: SajuInput) => void;
  busy?: boolean;
}) {
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<Date | null>(null);
  const [unknownTime, setUnknownTime] = useState(false);
  const [gender, setGender] = useState<"" | "male" | "female">("");
  const [region, setRegion] = useState<string>("");
  const [lunar, setLunar] = useState(false);
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);
  const [err, setErr] = useState("");

  function submit() {
    if (!date) return setErr("생년월일을 알려주세요.");
    if (!unknownTime && !time) return setErr("시간을 모르면 '시간 몰라요'를 눌러 주세요.");
    setErr("");
    const y = date.getFullYear();
    const md = `${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    onSubmit({
      birthDate: `${y}-${md}`,
      calendarType: lunar ? "lunar" : "solar",
      unknownTime,
      ...(unknownTime || !time
        ? {}
        : { birthTime: `${String(time.getHours()).padStart(2, "0")}:${String(time.getMinutes()).padStart(2, "0")}` }),
      ...(gender ? { gender } : {}),
      ...(region ? { birthRegion: region as SajuInput["birthRegion"] } : {}),
    });
  }

  return (
    <View style={{ gap: 8 }}>
      <Pressable style={s.field} onPress={() => setShowDate(true)}>
        <Text style={s.fl}>생년월일</Text>
        <Text style={[s.fv, !date && s.empty]}>
          {date ? `${date.getFullYear()}. ${date.getMonth() + 1}. ${date.getDate()}` : "선택하기"}
        </Text>
      </Pressable>
      {showDate && (
        <DateTimePicker
          value={date ?? new Date(2000, 0, 1)}
          mode="date"
          onChange={(_e, d) => { setShowDate(false); if (d) setDate(d); }}
        />
      )}

      <Toggle on={lunar} onToggle={() => setLunar(!lunar)} label="음력이에요" />

      <Pressable style={[s.field, unknownTime && { opacity: 0.4 }]} disabled={unknownTime} onPress={() => setShowTime(true)}>
        <Text style={s.fl}>태어난 시간 — 확실해요?</Text>
        <Text style={[s.fv, !time && s.empty]}>
          {time ? `${time.getHours()}시 ${time.getMinutes()}분` : "선택하기"}
        </Text>
      </Pressable>
      {showTime && (
        <DateTimePicker
          value={time ?? new Date(2000, 0, 1, 12, 0)}
          mode="time"
          onChange={(_e, d) => { setShowTime(false); if (d) setTime(d); }}
        />
      )}
      <Toggle on={unknownTime} onToggle={() => setUnknownTime(!unknownTime)} label="시간 몰라요 — 괜찮아요, 시 없이 보는 법도 있으니" />

      <Text style={s.fl}>성별 (선택)</Text>
      <View style={{ flexDirection: "row", gap: 8 }}>
        {([["", "선택 안 함"], ["male", "남성"], ["female", "여성"]] as const).map(([v, label]) => (
          <Pressable key={v} onPress={() => setGender(v)} style={[s.seg, gender === v && s.segOn]}>
            <Text style={{ color: gender === v ? color.hanji : color.inkSoft, fontFamily: FONT.sansMedium, fontSize: 13 }}>{label}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={[s.fl, { marginTop: 4 }]}>태어난 지역 — 경도 반영 (선택)</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, paddingVertical: 2 }}>
        {REGION_LIST.map((r) => (
          <Pressable key={r.code} onPress={() => setRegion(region === r.code ? "" : r.code)} style={[s.chip, region === r.code && s.chipOn]}>
            <Text style={{ color: region === r.code ? color.hanji : color.inkSoft, fontSize: 13 }}>{r.name}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {!!err && <Text style={{ color: color.vermilion, fontSize: 13 }}>{err}</Text>}
      <View style={{ height: 8 }} />
      <Btn label={busy ? "팔자를 적는 중…" : submitLabel} onPress={submit} disabled={busy} />
    </View>
  );
}

function Toggle({ on, onToggle, label }: { on: boolean; onToggle: () => void; label: string }) {
  return (
    <Pressable style={s.toggleRow} onPress={onToggle}>
      <View style={[s.checkbox, on && s.checkboxOn]}>{on && <Text style={{ color: color.hanji, fontSize: 12 }}>✓</Text>}</View>
      <Text style={s.toggleLabel}>{label}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  field: { backgroundColor: color.white, borderWidth: 1, borderColor: color.hanjiDeep, borderRadius: 14, padding: 14 },
  fl: { fontFamily: FONT.sansMedium, fontSize: 12, color: color.inkMuted, marginBottom: 4 },
  fv: { fontFamily: FONT.sansBold, fontSize: 17, color: color.ink },
  empty: { color: color.inkMuted, fontFamily: FONT.sans },
  toggleRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 4 },
  checkbox: { width: 18, height: 18, borderRadius: 5, borderWidth: 1.5, borderColor: color.inkMuted, alignItems: "center", justifyContent: "center" },
  checkboxOn: { backgroundColor: color.vermilion, borderColor: color.vermilion },
  toggleLabel: { flex: 1, fontFamily: FONT.sans, fontSize: 13, color: color.inkSoft },
  seg: { flex: 1, alignItems: "center", paddingVertical: 12, borderRadius: 14, borderWidth: 1, borderColor: color.hanjiDeep, backgroundColor: color.white },
  segOn: { backgroundColor: color.ink, borderColor: color.ink },
  chip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 100, backgroundColor: color.hanjiDeep },
  chipOn: { backgroundColor: color.ink },
});
