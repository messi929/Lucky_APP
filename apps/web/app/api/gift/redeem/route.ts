import type { SajuInput } from "@lucky/core";
import { record } from "@/lib/events";
import { createToken, getGift, markGiftRedeemed, markPaid } from "@/lib/store";

export const runtime = "nodejs";

/** POST /api/gift/redeem — 선물 수신자가 생일 입력으로 언락 (§8.2) */
export async function POST(req: Request): Promise<Response> {
  let body: { giftToken: string; birth: SajuInput };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return Response.json({ error: "잘못된 요청" }, { status: 400 });
  }

  const gift = await getGift(body.giftToken);
  if (!gift) return Response.json({ error: "선물을 찾을 수 없어요" }, { status: 404 });

  const token = await createToken(body.birth);
  await markPaid(token); // 선물은 선결제 → 수신자 리포트 유료 해제
  await markGiftRedeemed(body.giftToken);
  record("gift_opened", { sku: gift.sku });
  return Response.json({ token });
}
