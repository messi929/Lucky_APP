import type { SupabaseClient } from "@supabase/supabase-js";
import type { SajuInput } from "@lucky/core";
import type { StorageAdapter } from "./adapter";

/**
 * Supabase 어댑터 (프로덕션). 서버 전용(service role key).
 * 스키마: supabase/schema.sql.
 */
export function supabaseAdapter(db: SupabaseClient): StorageAdapter {
  return {
    getInput: async (t) => {
      const { data } = await db.from("results").select("input").eq("token", t).maybeSingle();
      return (data?.input as SajuInput) ?? null;
    },
    putInput: async (t, v) => {
      await db.from("results").upsert({ token: t, input: v, paid: false });
    },
    isPaid: async (t) => {
      const { data } = await db.from("results").select("paid").eq("token", t).maybeSingle();
      return data?.paid === true;
    },
    setPaid: async (t) => {
      await db.from("results").update({ paid: true }).eq("token", t);
    },
    isConcernUnlocked: async (t, c) => {
      const { data, error } = await db
        .from("concern_unlocks")
        .select("concern")
        .eq("token", t)
        .eq("concern", c)
        .maybeSingle();
      if (error) return false; // 테이블 미적용 시 안전하게 미해제
      return !!data;
    },
    unlockConcern: async (t, c) => {
      await db.from("concern_unlocks").upsert({ token: t, concern: c });
    },
    getInvite: async (t) => {
      const { data } = await db
        .from("invites")
        .select("owner_token, relation")
        .eq("token", t)
        .maybeSingle();
      return data ? { ownerToken: data.owner_token, relation: data.relation } : null;
    },
    putInvite: async (t, v) => {
      await db.from("invites").upsert({ token: t, owner_token: v.ownerToken, relation: v.relation });
    },
    getCompat: async (t) => {
      const { data } = await db
        .from("compats")
        .select("a_token, b_input, relation")
        .eq("token", t)
        .maybeSingle();
      return data
        ? { aToken: data.a_token, bInput: data.b_input as SajuInput, relation: data.relation }
        : null;
    },
    putCompat: async (t, v) => {
      await db
        .from("compats")
        .upsert({ token: t, a_token: v.aToken, b_input: v.bInput, relation: v.relation });
    },
    getGift: async (t) => {
      const { data } = await db
        .from("gifts")
        .select("sku, from_msg, redeemed")
        .eq("token", t)
        .maybeSingle();
      return data ? { sku: data.sku, fromMsg: data.from_msg, redeemed: data.redeemed } : null;
    },
    putGift: async (t, v) => {
      await db.from("gifts").upsert({ token: t, sku: v.sku, from_msg: v.fromMsg, redeemed: v.redeemed });
    },
    setGiftRedeemed: async (t) => {
      await db.from("gifts").update({ redeemed: true }).eq("token", t);
    },
    putPushToken: async (rec) => {
      await db
        .from("push_tokens")
        .upsert({ expo_token: rec.expoToken, result_token: rec.resultToken, hour: rec.hour });
    },
    listPushTokens: async () => {
      const { data } = await db.from("push_tokens").select("expo_token, result_token, hour");
      return (data ?? []).map((r) => ({
        expoToken: r.expo_token,
        resultToken: r.result_token,
        hour: r.hour,
      }));
    },
    putOrder: async (rec) => {
      await db.from("orders").upsert({
        order_id: rec.orderId,
        token: rec.token,
        sku: rec.sku,
        amount: rec.amount,
        gift: rec.gift,
        from_msg: rec.fromMsg ?? "",
        status: rec.status,
        payment_key: rec.paymentKey ?? null,
      });
    },
    getOrder: async (id) => {
      const { data } = await db
        .from("orders")
        .select("order_id, token, sku, amount, gift, from_msg, status, payment_key")
        .eq("order_id", id)
        .maybeSingle();
      return data
        ? {
            orderId: data.order_id,
            token: data.token,
            sku: data.sku,
            amount: data.amount,
            gift: data.gift,
            fromMsg: data.from_msg ?? "",
            status: data.status,
            ...(data.payment_key ? { paymentKey: data.payment_key } : {}),
          }
        : null;
    },
    setOrderPaid: async (id, paymentKey) => {
      await db.from("orders").update({ status: "paid", payment_key: paymentKey }).eq("order_id", id);
    },
  };
}
