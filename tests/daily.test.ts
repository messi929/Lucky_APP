/**
 * 오늘의 한 줄 검증 (기획서 §10.1). 결정성·캐시키·가드레일·간지 정합.
 */

import { describe, expect, it } from "vitest";
import { applyGuardrails, computeSaju, dailyLine } from "@lucky/core";

describe("오늘의 한 줄 (dailyLine)", () => {
  it("결정론적: 같은 입력 → 같은 결과", () => {
    const a = dailyLine(6, 2026, 7, 12);
    const b = dailyLine(6, 2026, 7, 12);
    expect(a).toEqual(b);
  });

  it("캐시 키는 daily:내일간:오늘천간 (100 조합)", () => {
    const r = dailyLine(6, 2026, 7, 12);
    expect(r.cacheKey).toMatch(/^daily:\d:\d$/);
  });

  it("일진 간지·날짜가 만세력 엔진과 일치", () => {
    // 내 일간과 무관하게 오늘 일진은 날짜로 결정 → computeSaju의 일주와 동일
    const chart = computeSaju({
      birthDate: "2026-07-12",
      birthTime: "12:00",
      calendarType: "solar",
      unknownTime: false,
    });
    const r = dailyLine(0, 2026, 7, 12);
    expect(r.todayGanji).toBe(chart.saju.pillarDetails.day.stemKo + chart.saju.pillarDetails.day.branchKo);
    expect(r.date).toBe("2026-07-12");
  });

  it("모든 일간×오늘천간 조합이 가드레일 통과 (겁주지 않음)", () => {
    for (let my = 0; my < 10; my++) {
      for (let day = 1; day <= 31; day++) {
        const r = dailyLine(my, 2026, 1, day);
        expect(applyGuardrails(r.line, 3).ok).toBe(true);
      }
    }
  });

  it("오행 겹칠 때 '○기가 겹치는 날' 부가", () => {
    // 갑(목,0) 일간, 오늘 천간도 목이면 겹침
    let found = false;
    for (let d = 1; d <= 60 && !found; d++) {
      const r = dailyLine(0, 2026, 1, d);
      if (r.elementOverlap) {
        expect(r.line).toContain("겹치는 날");
        found = true;
      }
    }
    expect(found).toBe(true);
  });
});
