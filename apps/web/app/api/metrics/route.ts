import { recent } from "@/lib/events";

export const runtime = "nodejs";

/**
 * GET /api/metrics — 생성 품질 요약 (B6).
 * 최근 generation_quality 이벤트를 집계해 캐시 적중률·폴백율·재생성율을 낸다.
 *
 * ⚠️ 인메모리 버퍼(recent) 기준 — 단일 인스턴스·재시작 시 초기화.
 * 프로덕션 장기 집계는 Supabase events 테이블 SQL로 별도 구성(후속).
 */
export async function GET(): Promise<Response> {
  const events = recent(500).filter((e) => e.name === "generation_quality");

  const acc = {
    samples: 0,
    llm: 0,
    cacheHits: 0,
    fallbacks: 0,
    retries: 0,
    rejectGuardrail: 0,
    rejectRemedy: 0,
  };
  const bySurface: Record<string, number> = {};

  for (const e of events) {
    const p = (e.props ?? {}) as Record<string, number | string | boolean>;
    acc.samples += 1;
    acc.llm += num(p.llm);
    acc.cacheHits += num(p.cacheHits);
    acc.fallbacks += num(p.fallbacks);
    acc.retries += num(p.retries);
    acc.rejectGuardrail += num(p.rejectGuardrail);
    acc.rejectRemedy += num(p.rejectRemedy);
    const s = String(p.surface ?? "unknown");
    bySurface[s] = (bySurface[s] ?? 0) + 1;
  }

  const rate = (n: number): number => (acc.llm === 0 ? 0 : Number((n / acc.llm).toFixed(3)));

  return Response.json({
    window: "in-memory (recent 500)",
    samples: acc.samples,
    bySurface,
    llmUnits: acc.llm,
    cacheHitRate: rate(acc.cacheHits),
    fallbackRate: rate(acc.fallbacks),
    retryRate: rate(acc.retries),
    rejectReasons: { guardrail: acc.rejectGuardrail, remedy: acc.rejectRemedy },
    raw: acc,
  });
}

function num(v: unknown): number {
  return typeof v === "number" && Number.isFinite(v) ? v : 0;
}
