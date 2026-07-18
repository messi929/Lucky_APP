import { getSupabase } from "../supabase";
import type { StorageAdapter } from "./adapter";
import { memoryAdapter } from "./memory";
import { supabaseAdapter } from "./supabase";

/**
 * 활성 저장소 선택: Supabase 있으면 supabase, 없으면 memory.
 * 개발/미리보기는 자동 인메모리 → 무설정 구동.
 *
 * 인메모리는 globalThis에 캐시 — Next dev는 라우트별로 모듈을 격리 번들하고
 * HMR마다 모듈을 재평가하므로, 캐시하지 않으면 라우트 간 상태(토큰·해금)가 갈린다.
 */
const g = globalThis as typeof globalThis & { __luckyStorage?: StorageAdapter };
const db = getSupabase();
export const storage: StorageAdapter =
  db ? supabaseAdapter(db) : (g.__luckyStorage ??= memoryAdapter());

export type { StorageAdapter } from "./adapter";
