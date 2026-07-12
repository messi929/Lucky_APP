import type { CacheStore } from "@lucky/core";
import { getSupabase } from "./supabase";

/**
 * 해석 유닛 캐시. Supabase 있으면 interpret_cache 테이블, 없으면 인메모리.
 * 캐시 키 = 유닛:값:버전:시즌:톤모드:관심사 (§4.1). 90%+ 적중으로 비용 디커플링.
 */
function build(): CacheStore {
  const db = getSupabase();
  if (db) {
    return {
      get: async (k) => {
        const { data } = await db
          .from("interpret_cache")
          .select("value")
          .eq("key", k)
          .maybeSingle();
        return data?.value ?? null;
      },
      set: async (k, v) => {
        await db.from("interpret_cache").upsert({ key: k, value: v });
      },
    };
  }

  const store = new Map<string, string>();
  return {
    get: async (k) => store.get(k) ?? null,
    set: async (k, v) => void store.set(k, v),
  };
}

export const memCache: CacheStore = build();
