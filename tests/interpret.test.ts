/**
 * 해석 레이어 검증 (기획서 v1.2 §4). mode 축·6파트 캐시키·가드레일 3단계·원칙 2.
 */

import { describe, expect, it, vi } from "vitest";
import {
  applyGuardrails,
  cacheKeyOf,
  computeSaju,
  decomposeUnits,
  DISCLAIMER,
  DISCLAIMER_CLASSIC,
  interpret,
  PROMPT_VERSION,
  type CacheStore,
  type GenerateFn,
  type InterpretContext,
  type SajuInput,
} from "@lucky/core";

const input: SajuInput = {
  birthDate: "1990-05-15",
  birthTime: "14:30",
  gender: "male",
  calendarType: "solar",
  unknownTime: false,
};
const chart = computeSaju(input);
const ctx: InterpretContext = { season: "2026H2", concern: "job", reaction: "soul", mode: "mz" };

describe("가드레일 3단계 (v1.2 §4.3)", () => {
  it("L1 공통은 모든 레벨에서 차단", () => {
    expect(applyGuardrails("액땜 안 하면 큰 화를 입어요", 1).ok).toBe(false);
    expect(applyGuardrails("암에 걸릴 수 있어요", 1).ok).toBe(false);
  });

  it("L2 관망 언어: 매매 지시는 level>=2에서만 차단", () => {
    const text = "지금 당장 사세요.";
    expect(applyGuardrails(text, 1).ok).toBe(true); // L1에선 통과
    expect(applyGuardrails(text, 2).ok).toBe(false); // L2에서 차단
  });

  it("L3 민감: 불안 자극은 level 3에서만 차단", () => {
    const text = "이대로면 어렵습니다.";
    expect(applyGuardrails(text, 2).ok).toBe(true);
    expect(applyGuardrails(text, 3).ok).toBe(false);
  });

  it("겁주지 않는 정상 문장은 통과", () => {
    const ok = "사람들이 당신한테 기대죠. 10월엔 큰 결정을 한 템포만 늦춰 보세요.";
    expect(applyGuardrails(ok, 3).ok).toBe(true);
  });
});

describe("유닛 분해 (§4.1) + concern 가드레일 상속", () => {
  it("고민 있으면 seasonal_fortune 포함, 없으면 제외", () => {
    const withC = decomposeUnits(chart, ctx).map((u) => u.kind);
    const without = decomposeUnits(chart, { season: "2026H2" }).map((u) => u.kind);
    expect(withC).toContain("seasonal_fortune");
    expect(without).not.toContain("seasonal_fortune");
  });

  it("L3 고민(자녀운)은 seasonal_fortune에 guardrailLevel=3 상속", () => {
    const u = decomposeUnits(chart, { season: "2026H2", concern: "child_fortune" }).find(
      (x) => x.kind === "seasonal_fortune",
    )!;
    expect(u.guardrailLevel).toBe(3);
    expect(u.concern).toBe("child_fortune");
  });

  it("L2 고민(부동산)은 guardrailLevel=2", () => {
    const u = decomposeUnits(chart, { season: "2026H2", concern: "real_estate" }).find(
      (x) => x.kind === "seasonal_fortune",
    )!;
    expect(u.guardrailLevel).toBe(2);
  });
});

describe("캐시 키 6파트 (v1.2 §4.1: 유닛:값:버전:시즌:톤모드:관심사)", () => {
  it("LLM 유닛은 6파트, 시즌·모드·관심사 축 반영", () => {
    const seasonal = decomposeUnits(chart, ctx).find((u) => u.kind === "seasonal_fortune")!;
    const key = cacheKeyOf(seasonal, ctx, PROMPT_VERSION)!;
    const parts = key.split(":");
    expect(parts).toHaveLength(6);
    expect(parts[0]).toBe("seasonal_fortune");
    expect(parts[2]).toBe(PROMPT_VERSION);
    expect(parts[3]).toBe("2026H2"); // 시즌
    expect(parts[4]).toBe("mz"); // 톤모드
    expect(parts[5]).toBe("job"); // 관심사
  });

  it("비시즌·무관심사 유닛은 시즌·관심사 축이 '-'", () => {
    const core = decomposeUnits(chart, ctx).find((u) => u.kind === "personality_core")!;
    const parts = cacheKeyOf(core, ctx, PROMPT_VERSION)!.split(":");
    expect(parts[3]).toBe("-"); // 시즌 없음
    expect(parts[5]).toBe("-"); // 관심사 없음
  });

  it("mode × 반응 = 4종 톤이 모두 다른 캐시 키", () => {
    const combos: InterpretContext[] = [
      { season: "2026H2", mode: "mz", reaction: "soul" },
      { season: "2026H2", mode: "mz", reaction: "skeptic" },
      { season: "2026H2", mode: "classic", reaction: "soul" },
      { season: "2026H2", mode: "classic", reaction: "skeptic" },
    ];
    const keys = combos.map((c) => {
      const u = decomposeUnits(chart, c).find((x) => x.kind === "personality_core")!;
      return cacheKeyOf(u, c, PROMPT_VERSION)!;
    });
    expect(new Set(keys).size).toBe(4);
  });

  it("정적/규칙 유닛은 캐시 키 없음(null)", () => {
    const ilju = decomposeUnits(chart, ctx).find((u) => u.kind === "ilju_hook")!;
    expect(cacheKeyOf(ilju, ctx, PROMPT_VERSION)).toBeNull();
  });
});

describe("오케스트레이터 (DI, §4.1)", () => {
  function memCache(): CacheStore {
    const m = new Map<string, string>();
    return { get: async (k) => m.get(k) ?? null, set: async (k, v) => void m.set(k, v) };
  }

  it("정적·규칙·LLM 조립 + mz 고지문", async () => {
    const generate: GenerateFn = async () => "당신은 균형을 잡아가는 사람이에요.";
    const report = await interpret(chart, ctx, { generate });
    expect(report.disclaimer).toBe(DISCLAIMER);
    expect(report.units.every((u) => u.text.length > 0)).toBe(true);
  });

  it("classic 모드는 강화 고지문", async () => {
    const generate: GenerateFn = async () => "주변에서 많이 의지하는 사주입니다.";
    const report = await interpret(chart, { ...ctx, mode: "classic" }, { generate });
    expect(report.disclaimer).toBe(DISCLAIMER_CLASSIC);
  });

  it("캐시 히트 시 generate 미호출", async () => {
    const cache = memCache();
    const generate = vi.fn<GenerateFn>(async () => "생성 결과입니다.");
    await interpret(chart, ctx, { generate, cache });
    const first = generate.mock.calls.length;
    generate.mockClear();
    await interpret(chart, ctx, { generate, cache });
    expect(first).toBeGreaterThan(0);
    expect(generate).not.toHaveBeenCalled();
  });

  it("L2 위반(매매 지시) → 재생성 후 폴백", async () => {
    const generate: GenerateFn = async () => "지금 당장 사세요."; // L2 위반
    const report = await interpret(chart, { season: "2026H2", concern: "real_estate" }, { generate });
    const seasonal = report.units.find((u) => u.kind === "seasonal_fortune")!;
    expect(seasonal.guardrailFallback).toBe(true);
    expect(applyGuardrails(seasonal.text, 2).ok).toBe(true);
  });

  it("LLM 프롬프트에 생년월일 원본 미포함 (원칙 2)", async () => {
    let user = "";
    const generate: GenerateFn = async (p) => {
      user = p.user;
      return "해석 결과입니다.";
    };
    await interpret(chart, ctx, { generate });
    expect(user).not.toMatch(/\b(19|20)\d{2}\b/);
    expect(user).not.toContain("1990");
    expect(user).toContain("원국");
  });
});
