/**
 * 절기 국면 (A5 재방문 훅). 결정론 — now를 고정 날짜로 주입.
 */
import { describe, expect, it } from "vitest";
import { seasonPhase, seasonHook } from "@lucky/core";

describe("seasonPhase — 절기 국면 판정", () => {
  it("입추(8/8 무렵) 직후를 잡는다", () => {
    // 2026-08-10 UTC — 입추(약 8/7) 지난 지 며칠
    const p = seasonPhase(new Date("2026-08-10T00:00:00Z"));
    expect(p.currentTerm).toBe("입추");
    expect(p.nextTerm).toBe("백로");
    expect(p.daysSinceCurrent).toBeGreaterThanOrEqual(0);
    expect(p.daysUntilNext).toBeGreaterThan(0);
  });

  it("전환 직후면 justTurned=true", () => {
    // 입추 당일~직후
    const p = seasonPhase(new Date("2026-08-08T12:00:00Z"));
    expect(p.currentTerm).toBe("입추");
    expect(p.justTurned).toBe(true);
  });

  it("절기 중간이면 justTurned=false, turningSoon=false", () => {
    // 입추와 백로 사이 중간(8월 하순)
    const p = seasonPhase(new Date("2026-08-25T00:00:00Z"));
    expect(p.justTurned).toBe(false);
    expect(p.turningSoon).toBe(false);
  });

  it("다음 절기 임박이면 turningSoon=true", () => {
    // 백로(약 9/8) 직전
    const p = seasonPhase(new Date("2026-09-06T00:00:00Z"));
    expect(p.nextTerm).toBe("백로");
    expect(p.turningSoon).toBe(true);
  });

  it("경계를 넘으면 다음 절기로 현재가 바뀐다", () => {
    const before = seasonPhase(new Date("2026-09-06T00:00:00Z"));
    const after = seasonPhase(new Date("2026-09-10T00:00:00Z"));
    expect(before.currentTerm).toBe("입추");
    expect(after.currentTerm).toBe("백로");
  });

  it("같은 시각은 항상 같은 결과 (재현성)", () => {
    const d = new Date("2026-08-15T00:00:00Z");
    expect(JSON.stringify(seasonPhase(d))).toBe(JSON.stringify(seasonPhase(d)));
  });
});

describe("seasonHook — 재방문 한 줄", () => {
  it("justTurned이면 '막 지났어요' 문구", () => {
    const h = seasonHook(seasonPhase(new Date("2026-08-08T12:00:00Z")));
    expect(h).toContain("막 지났어요");
    expect(h).toContain("입추");
  });

  it("turningSoon이면 남은 일수 + 다음 절기 안내", () => {
    const h = seasonHook(seasonPhase(new Date("2026-09-06T00:00:00Z")));
    expect(h).toMatch(/\d+일 뒤 백로/);
  });

  it("turningSoon 으로/로 조사를 받침으로 구분한다", () => {
    const base = { currentTerm: "-", daysSinceCurrent: 1, daysUntilNext: 3, justTurned: false, turningSoon: true };
    // 입춘(받침 ㄴ) → '입춘으로', 백로(받침 없음) → '백로로', 대설(받침 ㄹ) → '대설로'
    expect(seasonHook({ ...base, nextTerm: "입춘" })).toContain("입춘으로 넘어가요");
    expect(seasonHook({ ...base, nextTerm: "백로" })).toContain("백로로 넘어가요");
    expect(seasonHook({ ...base, nextTerm: "대설" })).toContain("대설로 넘어가요");
  });

  it("조사 이/가를 받침으로 구분한다 (대설 vs 입추)", () => {
    // 대설(받침 ㄹ) → '대설이', 입추(받침 없음) → '입추가'
    const h1 = seasonHook(seasonPhase(new Date("2026-12-08T12:00:00Z")));
    expect(h1).toContain("대설이");
    const h2 = seasonHook(seasonPhase(new Date("2026-08-08T12:00:00Z")));
    expect(h2).toContain("입추가");
  });

  it("평시 문구는 '지금은'으로 시작한다 (조사는 지금에 붙는다)", () => {
    const h = seasonHook(seasonPhase(new Date("2026-08-25T00:00:00Z")));
    expect(h).toMatch(/^지금은 /);
    expect(h).not.toContain("지금는");
  });

  it("겁주는 단정 어휘가 없다", () => {
    for (const d of ["2026-08-08", "2026-08-25", "2026-09-06"]) {
      const h = seasonHook(seasonPhase(new Date(`${d}T00:00:00Z`)));
      expect(h).not.toMatch(/반드시|틀림없|위험|큰일|나쁜/);
    }
  });
});
