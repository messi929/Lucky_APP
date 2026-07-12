import { confirmToss, fulfillOrder } from "@/lib/payments";
import { storage } from "@/lib/storage";

export const runtime = "nodejs";

/**
 * POST /api/payments/confirm — 토스 결제 승인 (§9).
 * 클라이언트가 위젯 결제 성공 후 {orderId, paymentKey, amount}로 호출.
 * 서버가 저장된 주문 금액과 대조 후 토스 승인 → 상품 이행(unlock/선물).
 */
export async function POST(req: Request): Promise<Response> {
  let body: { orderId: string; paymentKey: string; amount: number };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return Response.json({ error: "잘못된 요청" }, { status: 400 });
  }

  const order = await storage.getOrder(body.orderId);
  if (!order) return Response.json({ error: "주문을 찾을 수 없어요" }, { status: 404 });
  if (order.status === "paid") {
    return Response.json({ error: "이미 처리된 주문이에요" }, { status: 409 });
  }
  // 금액 위변조 방지: 저장된 주문 금액과 일치해야 함
  if (order.amount !== body.amount) {
    return Response.json({ error: "결제 금액이 일치하지 않아요" }, { status: 400 });
  }

  const conf = await confirmToss(body.paymentKey, body.orderId, body.amount);
  if (!conf.ok) {
    return Response.json({ error: conf.error ?? "결제 승인 실패" }, { status: 402 });
  }

  const result = await fulfillOrder(order, body.paymentKey);
  return Response.json({ ok: true, unlocked: order.sku, ...result });
}
