import type { ReportRequest } from "@lucky/api-client";
import type { InterpretContext } from "@lucky/core";
import { createToken, getInput, isPaid } from "@/lib/store";
import { buildReport } from "@/lib/report";
import { currentSeason } from "@/lib/age";

export const runtime = "nodejs";

/** POST /api/report — 신규(birth) 또는 재조회(token) + 컨텍스트 → 리포트 페이로드 */
export async function POST(req: Request): Promise<Response> {
  let body: ReportRequest;
  try {
    body = (await req.json()) as ReportRequest;
  } catch {
    return Response.json({ error: "잘못된 요청" }, { status: 400 });
  }

  const input = body.birth ?? (body.token ? await getInput(body.token) : null);
  if (!input) {
    return Response.json({ error: "결과를 찾을 수 없어요" }, { status: 404 });
  }
  const token = body.birth ? await createToken(body.birth) : body.token!;

  const ctx: InterpretContext = {
    season: body.ctx?.season || currentSeason(),
    ...(body.ctx?.reaction ? { reaction: body.ctx.reaction } : {}),
    ...(body.ctx?.concern ? { concern: body.ctx.concern } : {}),
    ...(body.ctx?.mode ? { mode: body.ctx.mode } : {}),
    ...((await isPaid(token)) ? { paid: true } : {}),
  };

  try {
    const payload = await buildReport(token, input, ctx);
    return Response.json(payload);
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}
