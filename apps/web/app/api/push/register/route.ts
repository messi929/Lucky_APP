import { record } from "@/lib/events";
import { getInput, registerPush } from "@/lib/store";

export const runtime = "nodejs";

/** POST /api/push/register — 앱이 Expo push token 등록 (§10.1 옵트인 후) */
export async function POST(req: Request): Promise<Response> {
  let body: { expoToken: string; token: string; hour?: number };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return Response.json({ error: "잘못된 요청" }, { status: 400 });
  }
  if (!body.expoToken || !(await getInput(body.token))) {
    return Response.json({ error: "잘못된 등록 정보" }, { status: 400 });
  }
  await registerPush(body.expoToken, body.token, body.hour ?? 8);
  record("push_optin");
  return Response.json({ ok: true });
}
