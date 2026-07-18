import {
  computeSaju,
  concernById,
  interpretSession,
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
  marriage_timing: { label: "택일 — 좋은 날 찾기", sub: "그 시기 안에서 손 없는 날", sku: "taekil" },
  love_dating: { concern: "marriage_timing", label: "결혼 타이밍도 볼까요", sub: "썸 다음의 흐름이 궁금하면" },
  relationship: { concern: "love_dating", label: "연애의 결도 같이", sub: "사람과의 거리 두는 법" },
  money_timing: { concern: "job", label: "직업·이직도 같이", sub: "돈은 결국 일에서 나오니까" },
  real_estate: { label: "택일 — 좋은 날 찾기", sub: "계약·이사 날 고르기", sku: "taekil" },
  career_path: { concern: "money_timing", label: "재물의 시기도", sub: "일의 흐름이 돈으로" },
  job: { label: "택일 — 좋은 날 찾기", sub: "이직·계약 날 고르기", sku: "taekil" },
  contract_timing: { label: "택일 — 좋은 날 찾기", sub: "그 계약, 언제가 좋은지", sku: "taekil" },
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
    disclaimer: reading.disclaimer,
    promptVersion: reading.promptVersion,
  };
}
