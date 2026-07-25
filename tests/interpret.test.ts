/**
 * 해석 레이어 검증 (기획서 v1.2 §4). mode 축·6파트 캐시키·가드레일 3단계·원칙 2.
 */

import { describe, expect, it, vi } from "vitest";
import {
  applyGuardrails,
  cacheKeyOf,
  computeSaju,
  CONCERNS,
  decomposeSessionUnits,
  decomposeUnits,
  DISCLAIMER,
  DISCLAIMER_CLASSIC,
  interpret,
  interpretSession,
  pivotFor,
  PROMPT_VERSION,
  RETRO_TEMPLATES,
  retroProbes,
  retroSentence,
  remedyConflicts,
  SESSION_BEATS,
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

describe("상담 세션 리딩 (interpretSession — 진단→근거→시기→처방)", () => {
  it("무료는 진단 1비트, 근거·시기·처방은 locked", () => {
    const { units, locked } = decomposeSessionUnits(chart, "marriage_timing", {
      season: "2026H2",
    });
    expect(units.map((u) => u.kind)).toEqual(["session_diagnosis"]);
    expect(locked).toEqual(["session_reason", "session_timing", "session_remedy"]);
  });

  it("유료는 4비트 전체, locked 없음", () => {
    const { units, locked } = decomposeSessionUnits(chart, "marriage_timing", {
      season: "2026H2",
      paid: true,
    });
    expect(units.map((u) => u.kind)).toEqual(SESSION_BEATS);
    expect(locked).toEqual([]);
  });

  it("세션 비트는 concern·시즌 축 + 가드레일 상속 (L3 자녀운)", () => {
    const { units } = decomposeSessionUnits(chart, "child_fortune", { season: "2026H2", paid: true });
    for (const u of units) {
      expect(u.concern).toBe("child_fortune");
      expect(u.guardrailLevel).toBe(3);
      expect(u.seasonal).toBe(true);
    }
  });

  it("비트마다 캐시 키가 다르다 (kind 축)", () => {
    const { units } = decomposeSessionUnits(chart, "money_timing", { season: "2026H2", paid: true });
    const keys = units.map((u) => cacheKeyOf(u, { season: "2026H2", concern: "money_timing" }, PROMPT_VERSION)!);
    expect(new Set(keys).size).toBe(4);
  });

  it("interpretSession: 무료는 진단만 조립 + lockedBeats 3개", async () => {
    const generate: GenerateFn = async () => "당신의 결혼은 늦되 확실합니다.";
    const s = await interpretSession(chart, "marriage_timing", { season: "2026H2" }, { generate });
    expect(s.beats.map((b) => b.kind)).toEqual(["session_diagnosis"]);
    expect(s.lockedBeats).toHaveLength(3);
    expect(s.beats[0]!.text.length).toBeGreaterThan(0);
    expect(s.disclaimer).toBe(DISCLAIMER);
  });

  it("interpretSession: 유료는 4비트 전부 생성", async () => {
    const generate = vi.fn<GenerateFn>(async () => "근거가 있는 해석입니다.");
    const s = await interpretSession(chart, "marriage_timing", { season: "2026H2", paid: true }, { generate });
    expect(s.beats).toHaveLength(4);
    expect(s.lockedBeats).toHaveLength(0);
    expect(generate).toHaveBeenCalledTimes(4);
  });

  it("세션 프롬프트도 생년월일 원본 미포함 (원칙 2)", async () => {
    let user = "";
    const generate: GenerateFn = async (p) => {
      user = p.user;
      return "해석입니다.";
    };
    await interpretSession(chart, "marriage_timing", { season: "2026H2", paid: true }, { generate });
    expect(user).not.toContain("1990");
    expect(user).not.toMatch(/\b(19|20)\d{2}\b/);
  });
});

describe("마무리 꺾는 문장 (pivotFor — concern별 authored)", () => {
  it("18개 concern 전부 authored 꺾는 문장 보유 (진단문 fallback 없이)", () => {
    for (const id of Object.keys(CONCERNS) as (keyof typeof CONCERNS)[]) {
      const line = pivotFor(id);
      expect(line, `pivot 누락: ${id}`).toBeTruthy();
      expect(line!.length).toBeGreaterThan(10);
    }
  });

  it("민감 concern(L3)도 질병·불안 단정 카피 금지 (가드레일 정합)", () => {
    for (const id of ["child_fortune", "health_year", "parent_worry"] as const) {
      const line = pivotFor(id)!;
      expect(line).not.toMatch(/암|질병|수술|죽|이혼/);
    }
  });
});

describe("개운 처방 오행 선정 (weakestElement 동점 처리)", () => {
  /** 최소값이 여럿인 원국에서 remedy 유닛이 고른 오행 */
  function remedyElement(birth: SajuInput): string {
    const chart = computeSaju(birth);
    const unit = decomposeUnits(chart, { season: "2026H2" }).find((u) => u.kind === "remedy");
    expect(unit, "remedy 유닛 없음").toBeTruthy();
    return String(unit!.value);
  }

  it("동점(목0·수0)일 때 고정 순서로 앞선 목을 뽑지 않는다 — 용신으로 가른다", () => {
    // 1958-07-02 09:20 서울: {목0 화1 토5 금2 수0} · yongsin ["己","丙","癸"] → 癸=수
    // 수정 전에는 목화토금수 순회에서 목0이 min을 선점해 항상 wood가 나왔다.
    const chart = computeSaju({
      birthDate: "1958-07-02",
      birthTime: "09:20",
      gender: "female",
      birthRegion: "SEOUL",
      calendarType: "solar",
      unknownTime: false,
    });
    const fe = chart.saju.fiveElements as Record<string, number>;
    expect(fe["목"], "전제: 목이 최소여야 동점 상황").toBe(0);
    expect(fe["수"], "전제: 수도 같은 최소여야 동점 상황").toBe(0);

    const unit = decomposeUnits(chart, { season: "2026H2" }).find((u) => u.kind === "remedy");
    expect(unit!.value).toBe("water");
  });

  it("동점이 아니면 최소 오행을 그대로 고른다", () => {
    // 1990-03-15 14:30 서울: {목2 화1 토3 금2 수0} → 수 단독 최소
    expect(
      remedyElement({
        birthDate: "1990-03-15",
        birthTime: "14:30",
        gender: "male",
        birthRegion: "SEOUL",
        calendarType: "solar",
        unknownTime: false,
      }),
    ).toBe("water");
  });

  it("같은 입력은 항상 같은 처방 오행 (결정론 — 재현성)", () => {
    const birth: SajuInput = {
      birthDate: "1958-07-02",
      birthTime: "09:20",
      gender: "female",
      birthRegion: "SEOUL",
      calendarType: "solar",
      unknownTime: false,
    };
    const runs = new Set([remedyElement(birth), remedyElement(birth), remedyElement(birth)]);
    expect(runs.size).toBe(1);
  });
});

describe("처방 정합성 — 색·방위 단일 소스 (B3)", () => {
  const chart = computeSaju({
    birthDate: "1958-07-02",
    birthTime: "09:20",
    gender: "female",
    birthRegion: "SEOUL",
    calendarType: "solar",
    unknownTime: false,
  });

  it("처방 오행 본인의 색·방위는 충돌로 보지 않는다", () => {
    expect(remedyConflicts("검은색 소품을 두고 북쪽을 보고 앉으세요.", "water")).toEqual([]);
  });

  it("다른 오행의 색·방위가 섞이면 충돌로 잡는다", () => {
    // 실제로 났던 사고: 처방은 water인데 서사가 초록·동쪽을 말함
    expect(remedyConflicts("초록색 화분을 동쪽에 두세요.", "water")).toContain("wood");
  });

  it("표기 변형(검정/검은색)도 잡는다", () => {
    expect(remedyConflicts("흰색 옷을 입고 서쪽으로", "water")).toContain("metal");
  });

  it("세션 처방 프롬프트에 코어 처방값이 주입된다 (LLM 자유생성 차단)", async () => {
    let user = "";
    const generate: GenerateFn = async (p) => {
      user = p.user;
      return "마음의 여백을 두세요.";
    };
    await interpretSession(chart, "health_year", { season: "2026H2", paid: true }, { generate });
    // 마지막 비트가 session_remedy — 지시문에 색·방위가 박혀 있어야 한다
    expect(user).toMatch(/처방 색은/);
    expect(user).toMatch(/지어내지 마세요/);
  });

  it("색·방위가 어긋난 생성물은 채택되지 않는다 (재생성 → 폴백)", async () => {
    let calls = 0;
    // 처방은 water인데 계속 초록·동쪽을 말하는 모델
    const generate: GenerateFn = async () => {
      calls += 1;
      return "초록색 소품을 동쪽에 두세요.";
    };
    const r = await interpretSession(chart, "health_year", { season: "2026H2", paid: true }, { generate });
    const remedyBeat = r.beats.find((b) => b.kind === "session_remedy")!;
    expect(calls).toBeGreaterThan(1); // 1회 재생성 시도
    expect(remedyBeat.text).not.toMatch(/초록|동쪽/); // 폴백으로 대체
  });
});

describe("처방 어휘 오탐 방지 (부분문자열 충돌)", () => {
  it("'검은색'의 '은색'을 금(metal)으로 오인하지 않는다", () => {
    expect(remedyConflicts("검은색 소품", "water")).toEqual([]);
  });
  it("독립된 '은색'은 여전히 금으로 잡는다", () => {
    expect(remedyConflicts("은색 액세서리", "water")).toContain("metal");
  });
  it("'남색'(수)과 '남쪽'(화)을 혼동하지 않는다", () => {
    expect(remedyConflicts("남색 옷", "water")).toEqual([]);
    expect(remedyConflicts("남쪽으로", "water")).toContain("fire");
  });
});

describe("과거 검증 프로브 (retroProbes — 신뢰 방아쇠)", () => {
  const me = computeSaju({
    birthDate: "1990-03-15",
    birthTime: "14:30",
    gender: "male",
    birthRegion: "SEOUL",
    calendarType: "solar",
    unknownTime: false,
  });

  it("과거 대운 전환만 뽑는다 (미래 제외)", () => {
    const probes = retroProbes(me);
    expect(probes.length).toBeGreaterThan(0);
    for (const p of probes) {
      expect(p.pivotYear).toBeLessThanOrEqual(me.saju.currentYear);
    }
  });

  it("기억나지 않을 어린 시절(17세 미만)은 제외", () => {
    for (const p of retroProbes(me, 10)) expect(p.age).toBeGreaterThanOrEqual(17);
  });

  it("최근 전환부터 (가까운 과거일수록 검증률이 높다)", () => {
    const years = retroProbes(me, 10).map((p) => p.pivotYear);
    expect([...years].sort((a, b) => b - a)).toEqual(years);
  });

  it("전부 질문형 — 단정하지 않는다 (틀려도 손상 없어야 함)", () => {
    for (const t of Object.values(RETRO_TEMPLATES)) {
      expect(t.endsWith("?"), `질문형 아님: ${t}`).toBe(true);
      expect(t).not.toMatch(/있었습니다|했습니다|겪었|분명히|틀림없/);
    }
  });

  it("전 템플릿이 가드레일 최고 단계(L3)를 통과", () => {
    for (const t of Object.values(RETRO_TEMPLATES)) {
      expect(applyGuardrails(t, 3).ok, `가드레일 위반: ${t}`).toBe(true);
    }
  });

  it("건강·사망·법적 사건 어휘 없음", () => {
    for (const t of Object.values(RETRO_TEMPLATES)) {
      expect(t).not.toMatch(/아프|병|수술|입원|사망|죽|이혼|소송|사고/);
    }
  });

  it("완성 문장은 구간 + 질문", () => {
    const p = retroProbes(me)[0]!;
    const s = retroSentence(p);
    expect(s).toContain(`${p.fromYear}년에서 ${p.toYear}년 사이`);
    expect(s.endsWith("?")).toBe(true);
  });

  it("같은 입력은 항상 같은 결과 (재현성)", () => {
    const a = JSON.stringify(retroProbes(me));
    const b = JSON.stringify(retroProbes(me));
    expect(a).toBe(b);
  });

  it("나이대가 다르면 프로브도 다르다 (68세 케이스)", () => {
    const mom = computeSaju({
      birthDate: "1958-07-02",
      birthTime: "09:20",
      gender: "female",
      birthRegion: "SEOUL",
      calendarType: "solar",
      unknownTime: false,
    });
    const probes = retroProbes(mom);
    expect(probes.length).toBeGreaterThan(0);
    // 68세는 대운 전환 이력이 더 많다 (36세보다 프로브 후보가 많거나 같다)
    expect(probes.length).toBeGreaterThanOrEqual(retroProbes(me).length);
    // 질문 십신 근거가 사람마다 다르므로 문장 집합도 달라야 한다
    const momQ = new Set(retroProbes(mom, 10).map((p) => p.question));
    const meQ = new Set(retroProbes(me, 10).map((p) => p.question));
    expect(JSON.stringify([...momQ])).not.toBe(JSON.stringify([...meQ]));
  });
});

describe("세션 비트 간 일관성 (B4 — 진단이 후속 비트 컨텍스트로)", () => {
  const chart = computeSaju({
    birthDate: "1990-03-15",
    birthTime: "14:30",
    gender: "male",
    birthRegion: "SEOUL",
    calendarType: "solar",
    unknownTime: false,
  });

  it("진단 텍스트가 근거·시기·처방 프롬프트에 주입된다", async () => {
    const prompts: string[] = [];
    const generate: GenerateFn = async (p, meta) => {
      prompts.push(p.user);
      // 진단은 식별 가능한 고유 문장으로
      if (meta?.kind === "session_diagnosis") return "당신의 결혼은 서른일곱에 열립니다XYZ.";
      return "이어지는 해석입니다.";
    };
    const r = await interpretSession(chart, "marriage_timing", { season: "2026H2", paid: true }, { generate });
    expect(r.beats.map((b) => b.kind)).toEqual(SESSION_BEATS);

    // 진단 프롬프트에는 앞선 상담이 없어야 한다
    expect(prompts[0]).not.toContain("[앞선 상담]");
    // 근거·시기·처방 프롬프트에는 진단 문장이 실려야 한다
    for (const p of prompts.slice(1)) {
      expect(p).toContain("[앞선 상담]");
      expect(p).toContain("서른일곱에 열립니다XYZ");
    }
  });

  it("첫 비트(진단)는 prior 컨텍스트 없이 생성된다", async () => {
    let firstUser = "";
    let n = 0;
    const generate: GenerateFn = async (p) => {
      if (n++ === 0) firstUser = p.user;
      return "해석입니다.";
    };
    await interpretSession(chart, "job", { season: "2026H2", paid: true }, { generate });
    expect(firstUser).not.toContain("앞선 상담");
  });

  it("prior 주입이 원칙 2를 깨지 않는다 (생년월일 여전히 미포함)", async () => {
    const prompts: string[] = [];
    const generate: GenerateFn = async (p) => {
      prompts.push(p.user);
      return "1990년 어쩌구를 일부러 뱉는 진단."; // 진단이 연도를 뱉어도
    };
    await interpretSession(chart, "money_timing", { season: "2026H2", paid: true }, { generate });
    // 후속 프롬프트에 진단 텍스트가 들어가긴 하지만, 원국 컨텍스트(toLlmContext)엔 생년월일이 없어야 한다.
    // 진단 텍스트에 든 연도는 LLM이 생성한 것이지 우리가 생년월일을 넘긴 게 아니다 — 이 구분을 확인.
    expect(prompts[0]).not.toContain("1990-03-15");
  });
});
