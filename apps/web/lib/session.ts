import {
  computeSaju,
  concernById,
  interpretSession,
  pivotFor,
  type ConcernId,
  type InterpretContext,
  type SajuInput,
} from "@lucky/core";
import type { SessionPayload, SkuId } from "@lucky/api-client";
import { memCache } from "./cache";
import { generate } from "./generate";
import { buildChartSummary } from "./report";

/**
 * 도사의 "다음 주제" 권유 (상담 → 다음 상담으로 이어지는 리듬).
 * 없으면 null → UI는 허브로 안내.
 */
const NEXT: Partial<Record<ConcernId, { concern?: ConcernId; label: string; sub: string; sku?: SkuId }>> = {
  // 연애·관계 계열
  love_dating: { concern: "marriage_timing", label: "결혼 타이밍도 볼까요", sub: "썸 다음의 흐름이 궁금하면" },
  marriage_timing: { label: "택일 — 좋은 날 찾기", sub: "그 시기 안에서 손 없는 날", sku: "taekil" },
  marital: { concern: "relationship", label: "인간관계도 같이", sub: "사람과의 거리 두는 법" },
  relationship: { concern: "love_dating", label: "연애의 결도 같이", sub: "가까워지고 멀어지는 리듬" },
  // 일·돈 계열
  career_path: { concern: "money_timing", label: "재물의 시기도", sub: "일의 흐름이 돈으로" },
  job: { label: "택일 — 좋은 날 찾기", sub: "이직·계약 날 고르기", sku: "taekil" },
  business: { concern: "money_timing", label: "목돈의 시기도", sub: "일의 확장이 돈으로" },
  money_timing: { concern: "job", label: "직업·이직도 같이", sub: "돈은 결국 일에서 나오니까" },
  contract_timing: { label: "택일 — 좋은 날 찾기", sub: "그 계약, 언제가 좋은지", sku: "taekil" },
  real_estate: { label: "택일 — 좋은 날 찾기", sub: "계약·이사 날 고르기", sku: "taekil" },
  retirement_finance: { concern: "health_year", label: "건강한 한 해도", sub: "돈 다음은 몸이니까" },
  // 가족·자녀 계열
  parent_worry: { concern: "stability", label: "당신 마음의 정리도", sub: "걱정 다음, 당신 차례" },
  child_fortune: { label: "택일 — 좋은 날 찾기", sub: "혼사·입시 날 고르기", sku: "taekil" },
  descendants: { concern: "stability", label: "정리와 안정도", sub: "덜어내며 단단해지는 때" },
  // 학업·건강·정리 계열
  exam: { concern: "career_path", label: "진로도 같이", sub: "시험 다음의 방향" },
  health_year: { concern: "stability", label: "정리와 안정도", sub: "몸 다음은 마음의 결" },
  stability: { concern: "descendants", label: "자식·손주 이야기도", sub: "곁의 사람들과의 결" },
  // taekil: 택일은 여정의 종착 — 다음 없이 허브로
};

/** 토큰 + 고민 → 세션 페이로드 (진단→근거→시기→처방, 무료=진단만) */
export async function buildSession(
  token: string,
  input: SajuInput,
  concern: ConcernId,
  ctx: InterpretContext,
): Promise<SessionPayload> {
  const chart = computeSaju(input);
  const reading = await interpretSession(chart, concern, ctx, { generate, cache: memCache });
  const meta = concernById(concern);

  return {
    token,
    concern: { id: concern, label: meta.label },
    beats: reading.beats,
    lockedBeats: reading.lockedBeats,
    paid: ctx.paid === true,
    chart: buildChartSummary(chart, input),
    next: NEXT[concern] ?? null,
    pivot: pivotFor(concern),
    disclaimer: reading.disclaimer,
    promptVersion: reading.promptVersion,
  };
}
