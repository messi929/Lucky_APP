import { getSupabase } from "./supabase";

/**
 * 퍼널 이벤트 싱크 (기획서 §8.3). Supabase 있으면 events 테이블, 없으면 인메모리 + 콘솔.
 * fire-and-forget — 실패해도 UX/응답 지연 없음.
 */

export interface AppEvent {
  name: string;
  props?: Record<string, unknown>;
  ts: number;
}

const buffer: AppEvent[] = [];

export function record(name: string, props?: Record<string, unknown>): void {
  const e: AppEvent = { name, ts: Date.now(), ...(props ? { props } : {}) };
  buffer.push(e);
  if (buffer.length > 500) buffer.shift();

  const db = getSupabase();
  if (db) {
    void db
      .from("events")
      .insert({ name, props: props ?? null })
      .then(() => undefined);
  } else if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.log("[event]", name, props ?? "");
  }
}

export function recent(n = 100): AppEvent[] {
  return buffer.slice(-n);
}
