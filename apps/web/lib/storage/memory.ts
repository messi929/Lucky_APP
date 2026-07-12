import type { SajuInput } from "@lucky/core";
import type {
  CompatRecord,
  GiftRecord,
  InviteRecord,
  OrderRecord,
  PushTokenRecord,
  StorageAdapter,
} from "./adapter";

/** 인메모리 어댑터 (개발/스캐폴드). 프로세스 재시작 시 소실. */
export function memoryAdapter(): StorageAdapter {
  const inputs = new Map<string, SajuInput>();
  const paid = new Set<string>();
  const invites = new Map<string, InviteRecord>();
  const compats = new Map<string, CompatRecord>();
  const gifts = new Map<string, GiftRecord>();
  const pushTokens = new Map<string, PushTokenRecord>();
  const orders = new Map<string, OrderRecord>();

  return {
    getInput: async (t) => inputs.get(t) ?? null,
    putInput: async (t, v) => void inputs.set(t, v),
    isPaid: async (t) => paid.has(t),
    setPaid: async (t) => void paid.add(t),
    getInvite: async (t) => invites.get(t) ?? null,
    putInvite: async (t, v) => void invites.set(t, v),
    getCompat: async (t) => compats.get(t) ?? null,
    putCompat: async (t, v) => void compats.set(t, v),
    getGift: async (t) => gifts.get(t) ?? null,
    putGift: async (t, v) => void gifts.set(t, v),
    setGiftRedeemed: async (t) => {
      const g = gifts.get(t);
      if (g) g.redeemed = true;
    },
    putPushToken: async (rec) => void pushTokens.set(rec.expoToken, rec),
    listPushTokens: async () => [...pushTokens.values()],
    putOrder: async (rec) => void orders.set(rec.orderId, rec),
    getOrder: async (id) => orders.get(id) ?? null,
    setOrderPaid: async (id, paymentKey) => {
      const o = orders.get(id);
      if (o) {
        o.status = "paid";
        o.paymentKey = paymentKey;
      }
    },
  };
}
