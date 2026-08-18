import {
  computeSaju,
  concernsForAge,
  dayMasterByStemIdx,
  deriveFacts,
  interpret,
  remedyFor,
  retroProbes,
  type InterpretContext,
  type SajuInput,
} from "@lucky/core";
import type { ChartSummary, PillarView, ReportPayload } from "@lucky/api-client";
import { memCache } from "./cache";
import { isCommerceEnabled } from "./commerce";
import { generate } from "./generate";
import { ageFromBirth, defaultMode } from "./age";
import { dailyConcernFor, dailyFor } from "./daily";

const POSITIONS = ["year", "month", "day", "hour"] as const;

type Chart = ReturnType<typeof computeSaju>;

/** SajuChart → 카드 렌더용 원국 요약 (생년월일 원본 미노출). 리포트·세션 공용 */
export function buildChartSummary(chart: Chart, input: SajuInput): ChartSummary {
  const facts = deriveFacts(chart);
  const remedy = remedyFor(facts.weakestElement);
  const character = dayMasterByStemIdx(facts.dayStemIdx);

  const pd = chart.saju.pillarDetails;
  const pillars: PillarView[] = POSITIONS.filter(
    (p) => !(p === "hour" && input.unknownTime),
  ).map((p) => ({
    position: p,
    stemHanja: pd[p].stem,
    stemKo: pd[p].stemKo,
    branchHanja: pd[p].branch,
    branchKo: pd[p].branchKo,
  }));

  return {
    pillars,
    fiveElements: chart.saju.fiveElements,
    dayStemIdx: facts.dayStemIdx,
    character: { name: character.name, tagline: character.tagline, keywords: character.keywords },
    remedy: {
      element: remedy.element,
      colors: remedy.colors,
      direction: remedy.direction,
      oneThing: remedy.oneThing,
    },
    boundary: chart.boundary.isBoundary
      ? { isBoundary: true, ...(chart.boundary.note ? { note: chart.boundary.note } : {}) }
      : { isBoundary: false },
    // 원본 날짜 미노출(원칙2) — 보정 플래그·경도만 신뢰 배지로 전달
    correction: {
      dstApplied: chart.meta.dstApplied,
      localMeanTimeApplied: chart.meta.localMeanTimeApplied,
      standardTimeEra: chart.meta.standardTimeEra,
      longitude: chart.meta.longitude,
    },
    unknownTime: input.unknownTime,
  };
}

/** 출생 입력 + 컨텍스트 → 카드 렌더 페이로드 (생년월일 원본 미노출) */
export async function buildReport(
  token: string,
  input: SajuInput,
  ctx: InterpretContext,
): Promise<ReportPayload> {
  const chart = computeSaju(input);
  const report = await interpret(chart, ctx, { generate, cache: memCache });

  const chartSummary = buildChartSummary(chart, input);
  const age = ageFromBirth(input.birthDate);
  return {
    token,
    units: report.units,
    disclaimer: report.disclaimer,
    promptVersion: report.promptVersion,
    chart: chartSummary,
    adaptive: {
      age,
      defaultMode: defaultMode(age),
      concerns: concernsForAge(age, 4).map((c) => ({
        id: c.id,
        label: c.label,
        guardrailLevel: c.guardrailLevel,
      })),
    },
    paid: ctx.paid === true,
    commerce: isCommerceEnabled(),
    daily: (() => {
      const dl = dailyFor(input);
      const concern = dailyConcernFor(dl.tenGod, age); // 데일리→단건 퍼널: 오늘 결에 맞는 주제
      return { line: dl.line, todayGanji: dl.todayGanji, ...(concern ? { concern } : {}) };
    })(),
    retro: retroProbes(chart).map((p) => ({
      pivotYear: p.pivotYear,
      fromYear: p.fromYear,
      toYear: p.toYear,
      age: p.age,
      question: p.question,
    })),
  };
}
