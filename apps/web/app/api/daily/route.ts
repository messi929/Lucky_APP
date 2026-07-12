import { dailyFor } from "@/lib/daily";
import { getInput } from "@/lib/store";

export const runtime = "nodejs";

/**
 * POST /api/daily {token} → 오늘의 한 줄 (§10.1).
 * 앱 데일리 푸시 배치(Supabase cron → Edge Function → Expo Push)가 재사용할 계약.
 */
export async function POST(req: Request): Promise<Response> {
  let body: { token: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return Response.json({ error: "잘못된 요청" }, { status: 400 });
  }
  const input = await getInput(body.token);
  if (!input) return Response.json({ error: "결과를 찾을 수 없어요" }, { status: 404 });

  const dl = dailyFor(input);
  return Response.json({ line: dl.line, todayGanji: dl.todayGanji, date: dl.date });
}
