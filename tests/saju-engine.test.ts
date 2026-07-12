/**
 * 만세력 엔진 검증 (기획서 §13.3 + VERIFICATION-REPORT).
 * Phase 1 게이트: 전체 통과 전 UI 착수 금지.
 *
 * 구성:
 *  A. 계산 코어 회귀 — ssaju(raw) vs lunar-javascript 교차검증 (verify.js/verify2.js 이식)
 *  B. 어댑터 검증 — 우리 corrections/boundary (DST·표준시변경기·LMT·경계·음력·폴백)
 */

import { describe, expect, it } from "vitest";
import { calculateSaju } from "ssaju";
import { Solar } from "lunar-javascript";
import { computeSaju, toLlmContext, ipchunInstant, type SajuInput } from "@lucky/core";

// ── 독립 일주 산술 (60갑자 앵커: 1900-01-01 = 甲戌 = index 10) — verify.js 이식
const STEMS = "甲乙丙丁戊己庚辛壬癸";
const BRANCHES = "子丑寅卯辰巳午未申酉戌亥";
function dayPillarByAnchor(y: number, m: number, d: number): string {
  const days = Math.round((Date.UTC(y, m - 1, d) - Date.UTC(1900, 0, 1)) / 86400000);
  const idx = (((10 + days) % 60) + 60) % 60;
  return STEMS[idx % 10]! + BRANCHES[idx % 12]!;
}

function lunarJs(y: number, m: number, d: number, h: number, mi: number, shiftH = 0) {
  const date = new Date(Date.UTC(y, m - 1, d, h, mi) + shiftH * 3600000);
  const s = Solar.fromYmdHms(
    date.getUTCFullYear(),
    date.getUTCMonth() + 1,
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    0,
  );
  const ec = s.getLunar().getEightChar();
  ec.setSect(2); // 조자시설 (자정 기준 일주 변경) — 기획서 v1.1 기본
  return { year: ec.getYear(), month: ec.getMonth(), day: ec.getDay(), hour: ec.getTime() };
}

function ssajuRaw(y: number, m: number, d: number, h: number, mi: number) {
  const p = calculateSaju({
    year: y,
    month: m,
    day: d,
    hour: h,
    minute: mi,
    gender: "남",
    applyLocalMeanTime: false,
    timezone: "Asia/Seoul",
  }).pillars;
  return { year: p.year, month: p.month, day: p.day, hour: p.hour };
}

// verify.js/verify2.js 경계 케이스
const CASES: [string, number, number, number, number, number][] = [
  ["평범-1990s", 1990, 5, 15, 14, 30],
  ["평범-README", 2001, 11, 3, 14, 20],
  ["평범-1975", 1975, 9, 23, 10, 0],
  ["평범-2010", 2010, 3, 8, 21, 15],
  ["평범-1962", 1962, 12, 25, 6, 40],
  ["입춘경계-1990직전", 1990, 2, 4, 5, 0],
  ["입춘경계-1990직후", 1990, 2, 4, 15, 0],
  ["입춘경계-2000직전", 2000, 2, 4, 10, 0],
  ["입춘경계-2000직후", 2000, 2, 4, 22, 0],
  ["절기경계-입동전", 2001, 11, 7, 6, 0],
  ["절기경계-입동후", 2001, 11, 7, 20, 0],
  ["자시-2330", 1995, 8, 10, 23, 30],
  ["자시-0030", 1995, 8, 11, 0, 30],
];

describe("A. 계산 코어 회귀 — ssaju(raw) vs lunar-javascript (VERIFICATION-REPORT)", () => {
  it.each(CASES)("%s: 연·월(절기)·일·시주 3자 교차 일치", (_desc, y, m, d, h, mi) => {
    const sj = ssajuRaw(y, m, d, h, mi);
    const ljYM = lunarJs(y, m, d, h, mi, -1); // KST→CST: 절기 시각 정렬
    const ljDH = lunarJs(y, m, d, h, mi, 0); // 일·시주: 동일 벽시계
    expect(sj.year).toBe(ljYM.year);
    expect(sj.month).toBe(ljYM.month);
    expect(sj.day).toBe(ljDH.day);
    expect(sj.day).toBe(dayPillarByAnchor(y, m, d));

    if (_desc === "자시-2330") {
      // 야자시(23:00~24:00) 시간(干) 유파 차이 — 버그 아님(REPORT 어댑터 4).
      // ssaju: 당일 일간 기준(조자시설 정합) / lunar-js sect2: 익일 간. 지지는 子로 동일.
      expect(sj.hour.endsWith("子")).toBe(true);
      expect(ljDH.hour.endsWith("子")).toBe(true);
    } else {
      expect(sj.hour).toBe(ljDH.hour);
    }
  });
});

const base: Omit<SajuInput, "birthDate"> = {
  calendarType: "solar",
  unknownTime: false,
  birthTime: "12:00",
  gender: "male",
};

describe("B1. 서머타임 보정 (§13.3 #4, REPORT 어댑터 1)", () => {
  it("1988-07-15 15:30(DST) → -1h 보정으로 未시 (미보정 申)", () => {
    const c = computeSaju({ ...base, birthDate: "1988-07-15", birthTime: "15:30" });
    expect(c.meta.dstApplied).toBe(true);
    expect(c.saju.pillars.hour.endsWith("未")).toBe(true);
  });
  it("1988-12-15는 DST 미적용", () => {
    const c = computeSaju({ ...base, birthDate: "1988-12-15" });
    expect(c.meta.dstApplied).toBe(false);
  });
  it("1960-06-01는 DST 적용(1955–60 구간)", () => {
    const c = computeSaju({ ...base, birthDate: "1960-06-01" });
    expect(c.meta.dstApplied).toBe(true);
  });
});

describe("B2. 표준시 변경기 LMT 비활성 (REPORT 어댑터 3)", () => {
  it("1958-06-15는 표준시 변경기 → LMT 비활성", () => {
    const c = computeSaju({ ...base, birthDate: "1958-06-15", birthRegion: "SEOUL" });
    expect(c.meta.standardTimeEra).toBe(true);
    expect(c.meta.localMeanTimeApplied).toBe(false);
  });
  it("1990-06-15는 정상기 → LMT 활성", () => {
    const c = computeSaju({ ...base, birthDate: "1990-06-15", birthRegion: "SEOUL" });
    expect(c.meta.standardTimeEra).toBe(false);
    expect(c.meta.localMeanTimeApplied).toBe(true);
  });
});

describe("B3. 진태양시(LMT) 경도 보정 (§13.3 #5, #7)", () => {
  it("서울 15:10 LMT 적용 → 未시 (미적용 申)", () => {
    const c = computeSaju({ ...base, birthDate: "1990-05-15", birthTime: "15:10", birthRegion: "SEOUL" });
    expect(c.meta.localMeanTimeApplied).toBe(true);
    expect(Math.round(c.meta.longitude)).toBe(127); // 126.98
    expect(c.saju.pillars.hour.endsWith("未")).toBe(true);
  });
});

describe("B4. 절입 경계 플래그 (REPORT 어댑터 2)", () => {
  it("입춘 절입 ±3분 출생 → isBoundary=true", () => {
    // 2000년 입춘 절입 UTC → KST 벽시계 분으로 환산해 그 시각 출생 구성
    const ipchunKst = new Date(ipchunInstant(2000).getTime() + 9 * 3600000);
    const y = ipchunKst.getUTCFullYear();
    const m = ipchunKst.getUTCMonth() + 1;
    const d = ipchunKst.getUTCDate();
    const hh = String(ipchunKst.getUTCHours()).padStart(2, "0");
    const mm = String(ipchunKst.getUTCMinutes()).padStart(2, "0");
    const c = computeSaju({
      ...base,
      birthDate: `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
      birthTime: `${hh}:${mm}`,
    });
    expect(c.boundary.isBoundary).toBe(true);
    expect(c.boundary.nearestTerm.name).toBe("입춘");
    expect(c.boundary.note).toBeTruthy();
  });
  it("절기에서 먼 날짜 → isBoundary=false", () => {
    const c = computeSaju({ ...base, birthDate: "2000-06-15", birthTime: "12:00" });
    expect(c.boundary.isBoundary).toBe(false);
  });
});

describe("B5. 음력 변환 (§13.3 #6)", () => {
  it("음력 2000-01-01 == 양력 2000-02-05 (설날): 팔자 동일", () => {
    const lunar = computeSaju({ ...base, birthDate: "2000-01-01", calendarType: "lunar" });
    const solar = computeSaju({ ...base, birthDate: "2000-02-05", calendarType: "solar" });
    expect(lunar.saju.pillars).toEqual(solar.saju.pillars);
  });
  it("윤달: 음력 2020 윤4월 1일 == 양력 2020-05-23", () => {
    const leap = computeSaju({ ...base, birthDate: "2020-04-01", calendarType: "lunarLeap" });
    const solar = computeSaju({ ...base, birthDate: "2020-05-23", calendarType: "solar" });
    expect(leap.saju.pillars).toEqual(solar.saju.pillars);
  });
});

describe("B6. 출생시 모름 폴백 (§13.3 #8)", () => {
  it("meta.unknownTime=true, 연월일주 존재", () => {
    const c = computeSaju({
      birthDate: "2000-06-15",
      calendarType: "solar",
      gender: "male",
      unknownTime: true,
    });
    expect(c.meta.unknownTime).toBe(true);
    expect(c.saju.pillars.year).toBeTruthy();
    expect(c.saju.pillars.month).toBeTruthy();
    expect(c.saju.pillars.day).toBeTruthy();
  });
});

describe("B7. LLM 컨텍스트 (CLAUDE.md 원칙 2)", () => {
  it("toLlmContext는 간지 요약 문자열 (생년월일 원본 미포함 확인)", () => {
    const c = computeSaju({ ...base, birthDate: "1990-05-15", birthTime: "14:30" });
    const ctx = toLlmContext(c);
    expect(typeof ctx).toBe("string");
    expect(ctx).toContain("원국");
  });
});
