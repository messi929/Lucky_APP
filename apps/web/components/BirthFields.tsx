"use client";

import { useMemo, useRef, useState } from "react";
import type { SajuInput } from "@lucky/core";
import { REGIONS } from "@/lib/regions";

const MIN_YEAR = 1900;

/**
 * 공용 출생 입력 (design ON-1). 네이티브 date/time 피커 대신 숫자 직접 입력 —
 * 생년월일 8자리 / 시각 4자리. 앱(BirthForm.tsx)과 동일한 UX. onSubmit에 SajuInput 전달.
 */
export function BirthFields({
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
  const timeRef = useRef<HTMLInputElement>(null);

  const dateErr = useMemo(() => validateYmd(ymd), [ymd]);
  const timeErr = useMemo(() => (unknownTime ? "" : validateHm(hm)), [hm, unknownTime]);
  const ready = ymd.length === 8 && !dateErr && (unknownTime || (hm.length === 4 && !timeErr));

  function onYmdChange(next: string) {
    const digits = next.replace(/\D/g, "").slice(0, 8);
    setYmd(digits);
    setErr("");
    if (digits.length === 8 && !validateYmd(digits) && !unknownTime) timeRef.current?.focus();
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!ready) {
      setErr(dateErr || timeErr || "생년월일을 8자리로 입력해 주세요.");
      return;
    }
    setErr("");
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
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 20, flex: 1 }}>
      {/* 생년월일 — 8자리 */}
      <div>
        <div style={row}>
          <span style={label}>생년월일</span>
          <div style={seg}>
            {([["solar", "양력"], ["lunar", "음력"]] as const).map(([v, l]) => {
              const on = (v === "lunar") === lunar;
              return (
                <button
                  key={v}
                  type="button"
                  onClick={() => setLunar(v === "lunar")}
                  style={{ ...segBtn, ...(on ? segBtnOn : null) }}
                >
                  {l}
                </button>
              );
            })}
          </div>
        </div>
        <input
          value={formatYmd(ymd)}
          onChange={(e) => onYmdChange(e.target.value)}
          inputMode="numeric"
          autoComplete="off"
          maxLength={14}
          placeholder="1990 . 03 . 15"
          style={{ ...bigInput, ...(dateErr && ymd.length === 8 ? inputErr : null) }}
          autoFocus={!initial}
        />
        <p style={hint}>{dateErr && ymd.length >= 4 ? dateErr : "숫자 8자리만 입력하면 돼요"}</p>
      </div>

      {/* 태어난 시각 — 4자리 */}
      <div>
        <div style={row}>
          <span style={label}>태어난 시각</span>
          <button
            type="button"
            onClick={() => setUnknownTime(!unknownTime)}
            style={{ ...pill, ...(unknownTime ? pillOn : null) }}
          >
            시간 몰라요
          </button>
        </div>
        <input
          ref={timeRef}
          value={formatHm(hm)}
          onChange={(e) => { setHm(e.target.value.replace(/\D/g, "").slice(0, 4)); setErr(""); }}
          inputMode="numeric"
          autoComplete="off"
          maxLength={7}
          placeholder="14 : 30"
          disabled={unknownTime}
          style={{ ...bigInput, ...(unknownTime ? inputOff : null), ...(timeErr && hm.length === 4 ? inputErr : null) }}
        />
        <p style={hint}>
          {unknownTime
            ? "시(時) 없이 보는 법도 있어요 — 나머지 세 기둥으로 봅니다"
            : timeErr && hm.length >= 2
              ? timeErr
              : "24시 기준 — 밤 11시 20분이면 2320"}
        </p>
      </div>

      {/* 성별 */}
      <div>
        <div style={{ ...label, marginBottom: 8 }}>
          성별 <span style={optional}>선택</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {([["male", "남성"], ["female", "여성"], ["", "선택 안 함"]] as const).map(([v, l]) => (
            <button
              key={v}
              type="button"
              onClick={() => setGender(v)}
              style={{ ...choice, ...(gender === v ? choiceOn : null) }}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* 지역 */}
      <div>
        <div style={{ ...label, marginBottom: 8 }}>
          태어난 지역 <span style={optional}>선택 · 경도 반영</span>
        </div>
        <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 2, WebkitOverflowScrolling: "touch" }}>
          {REGIONS.map((r) => (
            <button
              key={r.code}
              type="button"
              onClick={() => setRegion(region === r.code ? "" : r.code)}
              style={{ ...regionChip, ...(region === r.code ? regionChipOn : null) }}
            >
              {r.name}
            </button>
          ))}
        </div>
      </div>

      {!!err && <p style={{ color: "var(--vermil)", fontSize: 13, fontWeight: 500 }}>{err}</p>}

      <div className="grow" />
      <button type="submit" disabled={busy || !ready} className="btn ink">
        {busy ? "팔자를 적는 중…" : submitLabel}
      </button>
    </form>
  );
}

function formatYmd(d: string): string {
  if (!d) return "";
  return [d.slice(0, 4), d.slice(4, 6), d.slice(6, 8)].filter(Boolean).join(" . ");
}
function formatHm(d: string): string {
  if (!d) return "";
  return [d.slice(0, 2), d.slice(2, 4)].filter(Boolean).join(" : ");
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

const row: React.CSSProperties = { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 };
const label: React.CSSProperties = { fontFamily: "var(--sans)", fontWeight: 700, fontSize: 14, color: "var(--ink)" };
const optional: React.CSSProperties = { fontWeight: 400, fontSize: 12, color: "var(--ink-40)" };
const bigInput: React.CSSProperties = {
  fontFamily: "var(--serif)",
  fontWeight: 700,
  fontSize: 30,
  letterSpacing: "0.02em",
  color: "var(--ink)",
  background: "var(--white)",
  border: "1px solid var(--paper-dk)",
  borderRadius: "var(--r-card)",
  padding: "16px 18px",
  width: "100%",
  outline: "none",
  boxSizing: "border-box",
};
const inputOff: React.CSSProperties = { opacity: 0.4 };
const inputErr: React.CSSProperties = { borderColor: "var(--vermil)" };
const hint: React.CSSProperties = { fontFamily: "var(--sans)", fontSize: 12, color: "var(--ink-40)", marginTop: 6, lineHeight: 1.5 };
const seg: React.CSSProperties = { display: "flex", borderRadius: 100, background: "var(--paper-dk)", padding: 2 };
const segBtn: React.CSSProperties = { padding: "6px 14px", borderRadius: 100, border: "none", background: "transparent", fontFamily: "var(--sans)", fontWeight: 500, fontSize: 12, color: "var(--ink-70)", cursor: "pointer" };
const segBtnOn: React.CSSProperties = { background: "var(--ink)", color: "var(--paper)" };
const pill: React.CSSProperties = { padding: "7px 12px", borderRadius: 100, border: "1px solid var(--paper-dk)", background: "var(--white)", fontFamily: "var(--sans)", fontWeight: 500, fontSize: 12, color: "var(--ink-40)", cursor: "pointer" };
const pillOn: React.CSSProperties = { background: "var(--ink)", borderColor: "var(--ink)", color: "var(--paper)" };
const choice: React.CSSProperties = { flex: 1, padding: "14px 0", borderRadius: "var(--r-card)", border: "1px solid var(--paper-dk)", background: "var(--white)", fontFamily: "var(--sans)", fontWeight: 500, fontSize: 14, color: "var(--ink-70)", cursor: "pointer" };
const choiceOn: React.CSSProperties = { background: "var(--ink)", borderColor: "var(--ink)", color: "var(--paper)" };
const regionChip: React.CSSProperties = { flex: "0 0 auto", padding: "9px 14px", borderRadius: 100, border: "1px solid var(--paper-dk)", background: "var(--white)", fontFamily: "var(--sans)", fontWeight: 500, fontSize: 13, color: "var(--ink-70)", cursor: "pointer", whiteSpace: "nowrap" };
const regionChipOn: React.CSSProperties = { background: "var(--ink)", borderColor: "var(--ink)", color: "var(--paper)" };
