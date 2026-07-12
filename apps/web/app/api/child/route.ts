import type { SajuInput } from "@lucky/core";
import { record } from "@/lib/events";
import { createToken, getInput, isPaid, markPaid } from "@/lib/store";

export const runtime = "nodejs";

/**
 * POST /api/child — 자녀운 (§7.4 자녀운 SKU = 가족 루프).
 * 부모가 자녀운 결제(부모 토큰 paid) → 자녀 생년월일로 자녀 리포트 생성(paid).
 */
export async function POST(req: Request): Promise<Response> {
  let body: { parentToken: string; birth: SajuInput };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return Response.json({ error: "잘못된 요청" }, { status: 400 });
  }

  if (!(await getInput(body.parentToken))) {
    return Response.json({ error: "결과를 찾을 수 없어요" }, { status: 404 });
  }
  if (!(await isPaid(body.parentToken))) {
    return Response.json({ error: "자녀운 리포트는 결제 후 열려요." }, { status: 402 });
  }

  const childToken = await createToken(body.birth);
  await markPaid(childToken);
  record("child_report_created");
  return Response.json({ token: childToken });
}
