import { SKUS, type CheckoutRequest } from "@lucky/api-client";
import { nanoid } from "nanoid";
import { record } from "@/lib/events";
import { fulfillOrder, isTossEnabled } from "@/lib/payments";
import { getInput } from "@/lib/store";
import { storage } from "@/lib/storage";

export const runtime = "nodejs";

/**
 * POST /api/checkout — 주문 생성 (§9).
 * 청약철회 명시 동의 필수(원칙 9). 미동의 시 거부.
 * TOSS_SECRET_KEY 있으면 주문(pending) 반환 → 클라이언트가 토스 위젯으로 결제 →
 *   /api/payments/confirm 로 승인. 없으면 mock 즉시 이행(현재 UX 유지).
 */
export async function POST(req: Request): Promise<Response> {
  let body: CheckoutRequest;
  try {
    body = (await req.json()) as CheckoutRequest;
  } catch {
    return Response.json({ error: "잘못된 요청" }, { status: 400 });
  }

  const sku = SKUS[body.sku];
  if (!sku) return Response.json({ error: "알 수 없는 상품" }, { status: 400 });
  if (body.withdrawalConsent !== true) {
    return Response.json(
      { error: "결제 전, 열람 시 청약철회가 제한된다는 점에 동의해 주세요." },
      { status: 400 },
    );
  }
  if (!(await getInput(body.token))) {
    return Response.json({ error: "결과를 찾을 수 없어요" }, { status: 404 });
  }

  const orderId = `ord_${nanoid(16)}`;
  const order = {
    orderId,
    token: body.token,
    sku: sku.id,
    amount: sku.price,
    gift: body.gift === true,
    fromMsg: body.fromMsg ?? "",
    status: "pending" as const,
  };
  await storage.putOrder(order);
  record("paywall_purchase_start", { sku: sku.id });

  // 토스 연동 시: 클라이언트가 위젯으로 결제 후 confirm
  if (isTossEnabled()) {
    return Response.json({
      ok: true,
      requiresPayment: true,
      orderId,
      amount: sku.price,
      orderName: sku.label,
    });
  }

  // mock: 즉시 이행
  const result = await fulfillOrder(order, "mock");
  return Response.json({ ok: true, unlocked: sku.id, ...result });
}
