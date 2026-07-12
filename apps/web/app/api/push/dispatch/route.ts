import { record } from "@/lib/events";
import { dailyFor } from "@/lib/daily";
import { sendExpoPush, type ExpoMessage } from "@/lib/push";
import { getInput, listPush } from "@/lib/store";
import { kstToday } from "@/lib/daily";

export const runtime = "nodejs";

/**
 * POST /api/push/dispatch — 데일리 "오늘의 한 줄" 발송 배치 (기획서 §10.1).
 * Supabase cron(pg_cron+pg_net)이 매일 발송 시각에 호출. CRON_SECRET로 보호.
 * 모든 계산은 여기(core dailyFor 재사용, 원칙 8) → Expo Push로 발송.
 */
export async function POST(req: Request): Promise<Response> {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("x-cron-secret") !== secret) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const hourNow = new Date(Date.now() + 9 * 3_600_000).getUTCHours(); // KST 시
  const tokens = await listPush();

  const messages: ExpoMessage[] = [];
  for (const t of tokens) {
    if (t.hour !== hourNow) continue; // 유저별 설정 시각에만
    const input = await getInput(t.resultToken);
    if (!input) continue;
    const dl = dailyFor(input);
    messages.push({ to: t.expoToken, title: "오늘의 한 줄", body: dl.line, sound: "default" });
  }

  const sent = await sendExpoPush(messages);
  record("daily_push_sent", { candidates: tokens.length, sent });
  return Response.json({ ok: true, sent, date: `${kstToday().y}-${kstToday().m}-${kstToday().d}` });
}
