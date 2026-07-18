import { getInput, unlockConcern } from "@/lib/store";

export const runtime = "nodejs";

/**
 * POST /api/session/unlock — 상담 세션 주제 1개 해금.
 * 청약철회 제한 동의(원칙 9) 필수. 프로덕션에선 결제 confirm 웹훅이 호출.
 * 지금은 PG/IAP 미연동이라 프리뷰 해금 경로. (TODO: 실결제 검증 뒤 해금)
 */
export async function POST(req: Request): Promise<Response> {
  let body: { token?: string; concern?: string; withdrawalConsent?: boolean };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return Response.json({ error: "잘못된 요청" }, { status: 400 });
  }

  if (!body.token || !body.concern) {
    return Response.json({ error: "토큰과 고민이 필요해요" }, { status: 400 });
  }
  if (body.withdrawalConsent !== true) {
    return Response.json({ error: "청약철회 제한 동의가 필요해요 (원칙 9)" }, { status: 400 });
  }
  if (!(await getInput(body.token))) {
    return Response.json({ error: "결과를 찾을 수 없어요" }, { status: 404 });
  }

  await unlockConcern(body.token, body.concern);
  return Response.json({ ok: true });
}
