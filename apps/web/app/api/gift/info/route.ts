import { getGift } from "@/lib/store";

export const runtime = "nodejs";

/** POST /api/gift/info {giftToken} → 선물 포장 정보 (앱 언박싱 화면) */
export async function POST(req: Request): Promise<Response> {
  let body: { giftToken: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return Response.json({ error: "잘못된 요청" }, { status: 400 });
  }
  const gift = await getGift(body.giftToken);
  if (!gift) return Response.json({ error: "선물을 찾을 수 없어요" }, { status: 404 });
  return Response.json({ sku: gift.sku, fromMsg: gift.fromMsg });
}
