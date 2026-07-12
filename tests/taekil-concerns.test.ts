/**
 * 택일 모듈(v1.2 §3) + 고민 카탈로그 연령 적응(§7) 검증.
 */

import { describe, expect, it } from "vitest";
import {
  ageToBucket,
  computeSaju,
  computeTaekil,
  concernById,
  concernsForAge,
  dayGanziIndex,
  isBranchChung,
  isBranchSamhap,
  isStemHap,
  type SajuInput,
} from "@lucky/core";

describe("간지 관계 규칙 (ganzi.ts)", () => {
  it("천간합/지지충/삼합", () => {
    expect(isStemHap(0, 5)).toBe(true); // 甲己
    expect(isStemHap(1, 6)).toBe(true); // 乙庚
    expect(isBranchChung(0, 6)).toBe(true); // 子午
    expect(isBranchChung(2, 8)).toBe(true); // 寅申
    expect(isBranchSamhap(8, 0)).toBe(true); // 申子(수국)
    expect(isBranchSamhap(0, 1)).toBe(false);
  });

  it("일진 산술은 검증된 앵커와 일치", () => {
    // 2000-01-11 = 무진(index 4)
    expect(dayGanziIndex(2000, 1, 11)).toBe(4);
  });
});

describe("택일 (computeTaekil)", () => {
  const chart = computeSaju({
    birthDate: "1988-03-20",
    birthTime: "10:00",
    gender: "male",
    calendarType: "solar",
    unknownTime: false,
  } satisfies SajuInput);

  const result = computeTaekil({
    chart,
    purpose: "move",
    startDate: "2026-03-01",
    endDate: "2026-04-30",
  });

  it("좋은 날은 점수>0, 피할 날은 점수<0, 기간 내", () => {
    expect(result.goodDays.length).toBeGreaterThan(0);
    expect(result.goodDays.every((d) => d.score > 0)).toBe(true);
    expect(result.avoidDays.every((d) => d.score < 0)).toBe(true);
    expect(result.purposeKo).toBe("이사");
    for (const d of [...result.goodDays, ...result.avoidDays]) {
      expect(d.date >= "2026-03-01" && d.date <= "2026-04-30").toBe(true);
      expect(d.reasons.length).toBeGreaterThan(0);
    }
  });

  it("좋은 날은 점수 내림차순 정렬", () => {
    const scores = result.goodDays.map((d) => d.score);
    expect([...scores].sort((a, b) => b - a)).toEqual(scores);
  });

  it("스캔 일수는 기간과 일치 (61일)", () => {
    expect(result.scannedDays).toBe(61);
  });
});

describe("고민 카탈로그 연령 적응 (§7)", () => {
  it("연령 버킷 매핑", () => {
    expect(ageToBucket(17)).toBe("teens20");
    expect(ageToBucket(28)).toBe("twenties30");
    expect(ageToBucket(55)).toBe("forties50");
    expect(ageToBucket(70)).toBe("sixtyplus");
  });

  it("28세 기본 노출에 취업·이직·결혼 타이밍 등 20~30대 고민 상위", () => {
    const ids = concernsForAge(28, 4).map((c) => c.id);
    expect(ids).toContain("job");
    expect(ids).not.toContain("child_fortune"); // 40~50대 고민은 상위 아님
  });

  it("55세 기본 노출에 자녀운·부동산·건강 등 40~50대 고민 상위", () => {
    const ids = concernsForAge(55, 5).map((c) => c.id);
    expect(ids).toContain("child_fortune");
    expect(ids.some((id) => id === "real_estate" || id === "business")).toBe(true);
  });

  it("자녀운·건강 고민은 guardrailLevel 3 (민감)", () => {
    expect(concernById("child_fortune").guardrailLevel).toBe(3);
    expect(concernById("health_year").guardrailLevel).toBe(3);
    expect(concernById("real_estate").guardrailLevel).toBe(2);
    expect(concernById("love_dating").guardrailLevel).toBe(1);
  });

  it("버티컬 SKU 매핑", () => {
    expect(concernById("child_fortune").verticalSku).toBe("child_fortune");
    expect(concernById("taekil").verticalSku).toBe("taekil");
    expect(concernById("exam").verticalSku).toBe("exam");
  });
});
