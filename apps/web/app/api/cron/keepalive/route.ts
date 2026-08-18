import { getSupabase } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/cron/keepalive — 저장소 왕복 1회.
 *
 * 두 가지 목적이 겹쳐 있다.
 *  1) 유지 핑: Supabase 무료 플랜은 비활동 기간이 길면 프로젝트를 정지시킨다.
 *     기존 스케줄(pg_cron)은 DB 안에 살아서 DB가 멈추면 같이 멈춘다 —
 *     그래서 이 핑만은 Vercel cron(= DB 밖)에서 돈다.
 *  2) 헬스체크: putInput 등 쓰기 경로가 에러를 삼키는 탓에, 저장소가 죽어도
 *     사용자에겐 "만료된 링크"로만 보이고 아무 데도 티가 나지 않았다
 *     (2026-08 Supabase 소실을 열흘 넘게 몰랐던 이유). 여기서만은 에러를 드러낸다.
 *
 * 인증: CRON_SECRET. Vercel cron은 Authorization: Bearer, pg_cron 쪽은 x-cron-secret.
 * 미설정이면 개방(개발) — 기존 /api/push/dispatch와 같은 관례.
 */
export async function GET(req: Request): Promise<Response> {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const bearer = req.headers.get("authorization") === `Bearer ${secret}`;
    const header = req.headers.get("x-cron-secret") === secret;
    if (!bearer && !header) {
      return Response.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const db = getSupabase();
  if (!db) {
    // 인메모리 모드 — 정지될 저장소 자체가 없으니 핑도 무의미하다. 실패는 아님.
    return Response.json({ ok: true, storage: "memory" });
  }

  // 쓰기 → 읽기 왕복. events는 퍼널 로그 테이블이라 남아도 무해하다.
  const started = Date.now();
  const { error: writeError } = await db.from("events").insert({ name: "keepalive" });
  const { error: readError } = await db.from("events").select("id").limit(1);
  const failure = writeError ?? readError;

  if (failure) {
    return Response.json(
      { ok: false, storage: "supabase", error: failure.message },
      { status: 503 },
    );
  }
  return Response.json({ ok: true, storage: "supabase", ms: Date.now() - started });
}
