/**
 * 해석 유닛 분해 (기획서 §4.1). SajuChart → 캐시 가능한 유닛 목록.
 * 순수 함수. LLM/캐시 호출 없음.
 */

import { concernById, type ConcernId } from "../content/concerns.js";
import type { Element } from "../saju/constants.js";
import {
  SESSION_BEATS,
  type InterpretContext,
  type InterpretationUnit,
  type SajuChart,
  type SessionBeatKind,
  type Tone,
} from "./types.js";

/** ssaju fiveElements 한글 키 → Element */
const KO_TO_ELEMENT: Record<string, Element> = {
  목: "wood",
  화: "fire",
  토: "earth",
  금: "metal",
  수: "water",
};

export interface DerivedFacts {
  iljuHanja: string; // 일주 간지 (예: "庚辰")
  dayStemHanja: string; // 일간 (예: "庚")
  dayStemIdx: number;
  yearGanji: string; // 연주 간지
  monthStemTenGod: string; // 월간 십신
  strength: string; // 신강/신약
  weakestElement: Element;
  strongestElement: Element;
  elementSignature: string; // "목0화2토2금3수1"
}

export function deriveFacts(chart: SajuChart): DerivedFacts {
  const s = chart.saju;
  const fe = s.fiveElements;
  const order: [string, Element][] = [
    ["목", "wood"],
    ["화", "fire"],
    ["토", "earth"],
    ["금", "metal"],
    ["수", "water"],
  ];
  let weakest: Element = "wood";
  let strongest: Element = "wood";
  let min = Infinity;
  let max = -Infinity;
  let sig = "";
  for (const [ko, el] of order) {
    const v = fe[ko] ?? 0;
    sig += `${ko}${v}`;
    if (v < min) {
      min = v;
      weakest = el;
    }
    if (v > max) {
      max = v;
      strongest = el;
    }
  }
  void KO_TO_ELEMENT;

  return {
    iljuHanja: s.pillars.day,
    dayStemHanja: s.dayStem,
    dayStemIdx: s.pillarDetails.day.stemIdx,
    yearGanji: s.pillars.year,
    monthStemTenGod: s.tenGods.month.stem,
    strength: s.advanced.dayStrength.strength,
    weakestElement: weakest,
    strongestElement: strongest,
    elementSignature: sig,
  };
}

export function toneOf(ctx: InterpretContext): Tone {
  return ctx.reaction === "skeptic" ? "counter" : "deep";
}

/** SajuChart + 컨텍스트 → 유닛 목록 (카드 순서) */
export function decomposeUnits(chart: SajuChart, ctx: InterpretContext): InterpretationUnit[] {
  const f = deriveFacts(chart);
  const tone = toneOf(ctx);
  const units: InterpretationUnit[] = [
    // 카드1 단정형 훅 (정적)
    { kind: "ilju_hook", source: "static", value: f.iljuHanja, seasonal: false, guardrailLevel: 1 },
    // 카드3 타입 (정적)
    { kind: "daymaster_type", source: "static", value: String(f.dayStemIdx), seasonal: false, guardrailLevel: 1 },
    // 오행 밸런스 (LLM)
    {
      kind: "element_balance",
      source: "llm",
      value: `${f.elementSignature}|${f.strength}`,
      seasonal: false,
      guardrailLevel: 1,
    },
    // 카드4 성격 코어 (LLM, 톤 민감)
    {
      kind: "personality_core",
      source: "llm",
      value: `${f.iljuHanja}|${f.monthStemTenGod}|${tone}`,
      seasonal: false,
      guardrailLevel: 1,
    },
    // 카드6 조심할 것 (LLM, 톤 민감)
    {
      kind: "caution",
      source: "llm",
      value: `${f.dayStemHanja}|${f.weakestElement}|${tone}`,
      seasonal: false,
      guardrailLevel: 1,
    },
    // 카드7 개운 처방 (규칙)
    { kind: "remedy", source: "rule", value: f.weakestElement, seasonal: false, guardrailLevel: 1 },
  ];

  // 카드5 선택 고민×일간 하반기 운 (LLM, 시즌) — 고민 선택 시에만.
  // 가드레일 단계는 concern에서 상속(부동산=L2, 자녀운/건강=L3 등).
  if (ctx.concern) {
    const concern = concernById(ctx.concern);
    units.splice(4, 0, {
      kind: "seasonal_fortune",
      source: "llm",
      value: `${f.dayStemHanja}|${ctx.concern}|${f.yearGanji}|${tone}`,
      seasonal: true,
      guardrailLevel: concern.guardrailLevel,
      concern: ctx.concern,
    });
  }

  return units;
}

/**
 * 상담 세션 유닛 분해 — concern 1개에 대한 집중 리딩(진단→근거→시기→처방).
 * 무료(paid=false)면 진단 비트만, 유료면 4비트 전체. 나머지는 lockedBeats로.
 * 모두 LLM·시즌·concern 축. 가드레일 단계는 concern에서 상속(L2 관망/L3 민감).
 */
export function decomposeSessionUnits(
  chart: SajuChart,
  concernId: ConcernId,
  ctx: InterpretContext,
): { units: InterpretationUnit[]; locked: SessionBeatKind[] } {
  const f = deriveFacts(chart);
  const tone = toneOf(ctx);
  const concern = concernById(concernId);
  const value = `${f.iljuHanja}|${f.monthStemTenGod}|${f.yearGanji}|${tone}`;

  const active: SessionBeatKind[] = ctx.paid ? SESSION_BEATS : ["session_diagnosis"];
  const locked = SESSION_BEATS.filter((b) => !active.includes(b));

  const units: InterpretationUnit[] = active.map((kind) => ({
    kind,
    source: "llm",
    value,
    seasonal: true,
    guardrailLevel: concern.guardrailLevel,
    concern: concernId,
  }));

  return { units, locked };
}
