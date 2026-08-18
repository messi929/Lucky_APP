import type { DreamPayload, DreamRequest } from "@lucky/api-client";
import {
  collectMetrics,
  computeSaju,
  dreamSymbolById,
  interpretDream,
  isDreamMood,
  isDreamSymbolId,
  type InterpretContext,
} from "@lucky/core";
import { memCache } from "@/lib/cache";
import { currentSeason } from "@/lib/age";
import { record } from "@/lib/events";
import { generate } from "@/lib/generate";
import { getInput } from "@/lib/store";

export const runtime = "nodejs";

/**
 * POST /api/dream — 상징 1개 + 감정 1개 → 꿈 해석 (무료, DREAM-DESIGN.md).
 *
 * 저장하지 않는다(무상태). 캐시는 기존 interpret_cache를 그대로 쓴다 —
 * 키가 유한하게 묶여 있어야 이 무료 기능이 바이럴을 타도 비용이 폭발하지 않는다.
 */
export async function POST(req: Request): Promise<Response> {
  let body: DreamRequest;
  try {
    body = (await req.json()) as DreamRequest;
  } catch {
    return Response.json({ error: "잘못된 요청" }, { status: 400 });
  }

  if (!body.token) {
    return Response.json({ error: "토큰이 필요해요" }, { status: 400 });
  }
  // 상징·감정은 사용자 입력이 아니라 카탈로그 선택이다. 검증 없이 통과시키면
  // dreamSymbolById가 undefined를 반환해 원시 에러가 노출된다(상담 주제와 같은 사고).
  if (!body.symbol || !isDreamSymbolId(body.symbol)) {
    return Response.json({ error: "그 상징은 아직 없어요." }, { status: 404 });
  }
  if (!body.mood || !isDreamMood(body.mood)) {
    return Response.json({ error: "꿈에서 받은 느낌을 골라 주세요." }, { status: 400 });
  }

  const input = await getInput(body.token);
  if (!input) {
    return Response.json({ error: "결과를 찾을 수 없어요" }, { status: 404 });
  }

  const ctx: InterpretContext = {
    season: currentSeason(),
    ...(body.ctx?.mode ? { mode: body.ctx.mode } : {}),
    // 무료 전용 — 유료 티어로 올라가지 않는다(비용 전제).
  };

  try {
    const reading = await interpretDream(computeSaju(input), body.symbol, body.mood, ctx, {
      generate,
      cache: memCache,
    });
    const symbol = dreamSymbolById(body.symbol);

    // 이 기능의 성공 판정은 재방문율이고, 캐시 적중률은 비용 전제의 검증 지표다.
    record("dream_read", {
      symbol: body.symbol,
      mood: body.mood,
      relation: reading.relation,
      ...collectMetrics(reading.units),
    });

    const payload: DreamPayload = {
      token: body.token,
      symbol: { id: symbol.id, label: symbol.label, category: symbol.category },
      mood: body.mood,
      units: reading.units,
      disclaimer: reading.disclaimer,
      promptVersion: reading.promptVersion,
    };
    return Response.json(payload);
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}
