import type { Mode } from "@lucky/core";
import { buildAnswer } from "@/lib/ask";
import { record } from "@/lib/events";
import { getInput, hasFullAccess } from "@/lib/store";

export const runtime = "nodejs";

/** POST /api/ask — 복채 문답 (유료 전용) */
export async function POST(req: Request): Promise<Response> {
  let body: { token: string; question: string; mode?: Mode };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return Response.json({ error: "잘못된 요청" }, { status: 400 });
  }

  const input = await getInput(body.token);
  if (!input) return Response.json({ error: "결과를 찾을 수 없어요" }, { status: 404 });
  // 영구 결제(full_report)뿐 아니라 유효 체험 패스(season_pass)도 "전체 열람"으로 판 이상 통과시킨다.
  if (!(await hasFullAccess(body.token))) {
    return Response.json({ error: "복채를 내면 문답이 열려요." }, { status: 402 });
  }
  const q = (body.question ?? "").trim();
  if (q.length < 2 || q.length > 200) {
    return Response.json({ error: "고민을 한 줄로 적어 주세요." }, { status: 400 });
  }

  const { answer } = await buildAnswer(input, q, body.mode ?? "mz");
  record("ask_answered");
  return Response.json({ answer });
}
