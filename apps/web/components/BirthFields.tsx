"use client";

import { useState } from "react";
import type { SajuInput } from "@lucky/core";
import { REGIONS } from "@/lib/regions";

/** 공용 대화체 출생 입력 (design ON-1). onSubmit에 SajuInput 전달. */
export function BirthFields({
  submitLabel,
  onSubmit,
  busy,
}: {
  submitLabel: string;
  onSubmit: (birth: SajuInput) => void;
  busy?: boolean;
}) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [unknownTime, setUnknownTime] = useState(false);
  const [gender, setGender] = useState<"" | "male" | "female">("");
  const [region, setRegion] = useState("");
  const [lunar, setLunar] = useState(false);
  const [err, setErr] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!date) return setErr("생년월일을 알려주세요.");
    if (!unknownTime && !time) return setErr("시간을 모르시면 '시간 몰라요'를 눌러 주세요.");
    setErr("");
    onSubmit({
      birthDate: date,
      calendarType: lunar ? "lunar" : "solar",
      unknownTime,
      ...(unknownTime ? {} : { birthTime: time }),
      ...(gender ? { gender } : {}),
      ...(region ? { birthRegion: region as SajuInput["birthRegion"] } : {}),
    });
  }

  const input = {
    width: "100%",
    border: "none",
    outline: "none",
    background: "transparent",
    fontSize: 17,
    fontWeight: 700,
    color: "var(--ink)",
    fontFamily: "var(--sans)",
  } as const;

  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
      <div className="field">
        <div className="fl">생년월일</div>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={input} />
      </div>

      <label className="hstack" style={{ padding: "4px 2px", cursor: "pointer" }}>
        <input type="checkbox" checked={lunar} onChange={(e) => setLunar(e.target.checked)} />
        <span className="sub">음력이에요</span>
      </label>

      <div className="field">
        <div className="fl">태어난 시간 — 확실해요?</div>
        <input
          type="time"
          value={time}
          disabled={unknownTime}
          onChange={(e) => setTime(e.target.value)}
          style={{ ...input, opacity: unknownTime ? 0.4 : 1 }}
        />
      </div>

      <label className="hstack" style={{ padding: "4px 2px", cursor: "pointer" }}>
        <input
          type="checkbox"
          checked={unknownTime}
          onChange={(e) => setUnknownTime(e.target.checked)}
        />
        <span className="sub">시간 몰라요 — 괜찮아요, 시 없이 보는 법도 있으니</span>
      </label>

      <div className="hstack" style={{ gap: 6, alignItems: "stretch" }}>
        <div className="field" style={{ flex: 1 }}>
          <div className="fl">성별</div>
          <select value={gender} onChange={(e) => setGender(e.target.value as typeof gender)} style={input}>
            <option value="">선택</option>
            <option value="male">남성</option>
            <option value="female">여성</option>
          </select>
        </div>
        <div className="field" style={{ flex: 2 }}>
          <div className="fl">태어난 지역 — 경도 반영</div>
          <select value={region} onChange={(e) => setRegion(e.target.value)} style={input}>
            <option value="">모름</option>
            {REGIONS.map((r) => (
              <option key={r.code} value={r.code}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {err && (
        <p style={{ color: "var(--vermil)", fontSize: 13, marginTop: 4 }}>{err}</p>
      )}

      <div className="grow" />
      <button type="submit" disabled={busy} className="btn ink">
        {busy ? "팔자를 적는 중…" : submitLabel}
      </button>
    </form>
  );
}
