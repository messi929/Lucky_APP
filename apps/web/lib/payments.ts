import type { OrderRecord } from "@/lib/storage/adapter";
import { record } from "@/lib/events";
import { createGift, markPaid } from "@/lib/store";
import { storage } from "@/lib/storage";

/**
 * 결제 (기획서 §9). 토스페이먼츠 단건. env-gated:
 *  - TOSS_SECRET_KEY 있으면 실승인(confirm API), 없으면 mock(즉시 성공).
 * 청약철회 동의(원칙 9)는 checkout에서 이미 강제. 여기선 승인·이행만.
 */

export function isTossEnabled(): boolean {
  return !!process.env.TOSS_SECRET_KEY;
}

/** 토스 결제 승인 API 호출 (금액 위변조 방지: orderId+amount 서버 검증) */
export async function confirmToss(
  paymentKey: string,
  orderId: string,
  amount: number,
): Promise<{ ok: boolean; error?: string }> {
  const key = process.env.TOSS_SECRET_KEY;
  if (!key) return { ok: false, error: "결제 설정 없음" };
  const auth = Buffer.from(`${key}:`).toString("base64");
  const res = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
    method: "POST",
    headers: { Authorization: `Basic ${auth}`, "content-type": "application/json" },
    body: JSON.stringify({ paymentKey, orderId, amount }),
  });
  if (res.ok) return { ok: true };
  const err = (await res.json().catch(() => ({}))) as { message?: string };
  return { ok: false, error: err.message ?? "결제 승인 실패" };
}

export interface FulfillResult {
  gift: boolean;
  giftToken?: string;
  token?: string;
}

/** 결제 완료 후 상품 지급: 선물이면 선물 토큰 발급, 아니면 결과 토큰 unlock. */
export async function fulfillOrder(order: OrderRecord, paymentKey: string): Promise<FulfillResult> {
  await storage.setOrderPaid(order.orderId, paymentKey);
  if (order.gift) {
    const giftToken = await createGift(order.sku, order.fromMsg ?? "");
    record("purchase", { sku: order.sku, price: order.amount, gift: true });
    record("gift_sent", { sku: order.sku });
    return { gift: true, giftToken };
  }
  await markPaid(order.token);
  record("purchase", { sku: order.sku, price: order.amount });
  return { gift: false, token: order.token };
}
