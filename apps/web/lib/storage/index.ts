import { getSupabase } from "../supabase";
import type { StorageAdapter } from "./adapter";
import { memoryAdapter } from "./memory";
import { supabaseAdapter } from "./supabase";

/**
 * 활성 저장소 선택: Supabase 있으면 supabase, 없으면 memory.
 * 개발/미리보기는 자동 인메모리 → 무설정 구동.
 */
const db = getSupabase();
export const storage: StorageAdapter = db ? supabaseAdapter(db) : memoryAdapter();

export type { StorageAdapter } from "./adapter";
