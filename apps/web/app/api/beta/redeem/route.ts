import { getSupabase } from "@/lib/supabase";
import { BETA_COOKIE, betaCredential } from "@/lib/beta";

export const runtime = "nodejs";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 90; // 90일

/**
 * 초대 코드 소비: Supabase `beta_codes` 우선, 없으면 `BETA_CODES` env 폴백(콤마 구분).
 * 유효하면 used_count 증가. 다회용 코드는 max_uses로 제어.
 */
async function consume(code: string): Promise<boolean> {
  const db = getSupabase();
  if (db) {
    const { data } = await db
      .from("beta_codes")
      .select("code, max_uses, used_count, revoked")
      .eq("code", code)
      .maybeSingle();
    if (!data || data.revoked || data.used_count >= data.max_uses) return false;
    await db
      .from("beta_codes")
      .update({ used_count: data.used_count + 1, last_used_at: new Date().toISOString() })
      .eq("code", code);
    return true;
  }
  const list = (process.env.BETA_CODES ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return list.includes(code);
}

/** POST /api/beta/redeem — { code } → 검증 후 자격 쿠키 발급(+앱용 token 반환) */
export async function POST(req: Request): Promise<Response> {
  const secret = process.env.BETA_SECRET;
  if (!secret) return Response.json({ error: "베타 게이트가 비활성 상태예요" }, { status: 400 });

  let code = "";
  try {
    const body = (await req.json()) as { code?: string };
    code = (body.code ?? "").trim();
  } catch {
    return Response.json({ error: "잘못된 요청" }, { status: 400 });
  }
  if (!code) return Response.json({ error: "초대 코드를 입력해 주세요" }, { status: 400 });

  if (!(await consume(code))) {
    return Response.json({ error: "유효하지 않거나 소진된 초대 코드예요" }, { status: 403 });
  }

  const token = await betaCredential(secret);
  const res = Response.json({ ok: true, token });
  res.headers.append(
    "set-cookie",
    `${BETA_COOKIE}=${token}; Path=/; Max-Age=${COOKIE_MAX_AGE}; HttpOnly; SameSite=Lax; Secure`,
  );
  return res;
}
