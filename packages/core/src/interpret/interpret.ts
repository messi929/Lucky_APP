/**
 * 해석 오케스트레이터 (기획서 §4.1 파이프라인).
 *   SajuChart → 유닛 분해 → 캐시 조회 → (미스) LLM 생성 → 가드레일 → 조립
 *
 * core 순수성(원칙 1): LLM 호출·캐시 I/O는 주입(InterpretDeps). 여기선 흐름·정적/규칙 해석만.
 */

import { dayMasterByStemIdx } from "../content/characters.js";
import { iljuHook } from "../content/hooks.js";
import { remedyFor, type Remedy } from "../content/remedies.js";
import type { Element } from "../saju/constants.js";
import { cacheKeyOf } from "./cache-key.js";
import { applyGuardrails, DISCLAIMER, DISCLAIMER_CLASSIC } from "./guardrails.js";
import { buildPrompt, modeOf, PROMPT_VERSION } from "./persona.js";
import { decomposeUnits } from "./units.js";
import type {
  InterpretContext,
  InterpretDeps,
  InterpretationUnit,
  InterpretedReport,
  ResolvedUnit,
  SajuChart,
} from "./types.js";

/** 가드레일 실패 시 최종 안전 폴백(겁주지 않는 톤) */
const SAFE_FALLBACK: Record<string, string> = {
  element_balance: "기질의 균형이 한쪽으로 살짝 기운 편이에요. 그 방향을 알면 힘이 됩니다.",
  personality_core: "겉으로 드러나는 모습과 속마음의 결이 조금 다른 분이에요.",
  seasonal_fortune: "하반기엔 서두르기보다 흐름을 살피며 한 걸음씩 가면 좋아요.",
  caution: "무리한 결정은 한 템포만 늦춰 보세요. 그게 올해의 대처법이에요.",
};

export async function interpret(
  chart: SajuChart,
  ctx: InterpretContext,
  deps: InterpretDeps,
): Promise<InterpretedReport> {
  const units = decomposeUnits(chart, ctx);
  const resolved: ResolvedUnit[] = [];
  for (const unit of units) {
    resolved.push(await resolveUnit(unit, chart, ctx, deps));
  }
  const disclaimer = modeOf(ctx) === "classic" ? DISCLAIMER_CLASSIC : DISCLAIMER;
  return { units: resolved, disclaimer, promptVersion: PROMPT_VERSION };
}

async function resolveUnit(
  unit: InterpretationUnit,
  chart: SajuChart,
  ctx: InterpretContext,
  deps: InterpretDeps,
): Promise<ResolvedUnit> {
  if (unit.source === "static") return resolveStatic(unit);
  if (unit.source === "rule") return resolveRule(unit);
  return resolveLlm(unit, chart, ctx, deps);
}

function resolveStatic(unit: InterpretationUnit): ResolvedUnit {
  let text: string;
  if (unit.kind === "ilju_hook") {
    const h = iljuHook(unit.value);
    text = h.hook ?? `${h.ganjiHangul} 일주의 기운을 지녔어요.`; // 카피 미작성 시 폴백
  } else {
    // daymaster_type
    text = dayMasterByStemIdx(Number(unit.value)).tagline;
  }
  return { kind: unit.kind, source: "static", cacheKey: null, text };
}

function resolveRule(unit: InterpretationUnit): ResolvedUnit {
  const remedy = remedyFor(unit.value as Element);
  return {
    kind: unit.kind,
    source: "rule",
    cacheKey: null,
    text: formatRemedy(remedy),
  };
}

function formatRemedy(r: Remedy): string {
  return `색은 ${r.colors.join("·")}, 길방은 ${r.direction}이에요. ${r.habits[0]}. 올해의 한 가지 — ${r.oneThing}`;
}

async function resolveLlm(
  unit: InterpretationUnit,
  chart: SajuChart,
  ctx: InterpretContext,
  deps: InterpretDeps,
): Promise<ResolvedUnit> {
  const key = cacheKeyOf(unit, ctx, PROMPT_VERSION)!;
  const cached = deps.cache ? await deps.cache.get(key) : null;
  if (cached !== null) {
    return { kind: unit.kind, source: "llm", cacheKey: key, text: cached, cacheHit: true };
  }

  const prompt = buildPrompt(unit, chart, ctx);
  const tier = ctx.paid ? "paid" : "free";
  const level = unit.guardrailLevel;

  // 생성 → 가드레일(유닛 단계). 위반 시 1회 재생성, 그래도 실패면 안전 폴백.
  let text = await deps.generate(prompt, { kind: unit.kind, tier });
  let guardrailFallback = false;
  if (!applyGuardrails(text, level).ok) {
    text = await deps.generate(prompt, { kind: unit.kind, tier });
    if (!applyGuardrails(text, level).ok) {
      text = SAFE_FALLBACK[unit.kind] ?? "지금은 준비의 시기예요. 한 걸음씩 가세요.";
      guardrailFallback = true;
    }
  }

  if (deps.cache && !guardrailFallback) await deps.cache.set(key, text);
  return {
    kind: unit.kind,
    source: "llm",
    cacheKey: key,
    text,
    cacheHit: false,
    ...(guardrailFallback ? { guardrailFallback: true } : {}),
  };
}
