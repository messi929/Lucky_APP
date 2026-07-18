import type { SessionRequest } from "@lucky/api-client";
import type { InterpretContext } from "@lucky/core";
import { getInput, isSessionUnlocked } from "@/lib/store";
import { buildSession } from "@/lib/session";
import { currentSeason } from "@/lib/age";

export const runtime = "nodejs";

/**
 * POST /api/session — 토큰 + 고민 1개 → 집중 상담 리딩(진단→근거→시기→처방).
 * 무료는 진단만, 결제 시 4비트 전체. 허브에서 주제 선택 시 호출.
 * TODO(결제): 현재는 토큰 단위 isPaid. 주제 단위 해금 원장은 후속.
 */
export async function POST(req: Request): Promise<Response> {
  let body: SessionRequest;
  try {
    body = (await req.json()) as SessionRequest;
  } catch {
    return Response.json({ error: "잘못된 요청" }, { status: 400 });
  }

  if (!body.token || !body.concern) {
    return Response.json({ error: "토큰과 고민이 필요해요" }, { status: 400 });
  }

  const input = await getInput(body.token);
  if (!input) {
    return Response.json({ error: "결과를 찾을 수 없어요" }, { status: 404 });
  }

  const ctx: InterpretContext = {
    season: body.ctx?.season || currentSeason(),
    ...(body.ctx?.reaction ? { reaction: body.ctx.reaction } : {}),
    ...(body.ctx?.mode ? { mode: body.ctx.mode } : {}),
    ...((await isSessionUnlocked(body.token, body.concern)) ? { paid: true } : {}),
  };

  try {
    const payload = await buildSession(body.token, input, body.concern, ctx);
    return Response.json(payload);
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}
