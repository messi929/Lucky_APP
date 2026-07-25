/**
 * 생성 품질 계측 (B6). ResolvedUnit 메타데이터를 집계해 요약한다.
 * 순수 함수 — 기록(record)은 앱 레이어 몫(원칙 1: core는 외부 I/O 없음).
 *
 * 측정 없이는 개선 판단이 안 선다:
 *  - cacheHitRate  : 캐시 적중률 = 비용 + 재현성 지표
 *  - fallbackRate  : 폴백 발생률 = 프롬프트가 얼마나 자주 실패하는지
 *  - retryRate     : 재생성률 = 첫 생성이 얼마나 자주 반려되는지
 *  - reject 사유별  : guardrail vs remedy — 어느 쪽 프롬프트를 손봐야 하는지
 */

import type { ResolvedUnit } from "./types.js";

export interface GenerationMetrics {
  /** LLM 유닛 총수 (static/rule 제외) */
  llm: number;
  /** 캐시 히트 수 */
  cacheHits: number;
  /** 폴백 대체 수 */
  fallbacks: number;
  /** 재생성 시도 수 */
  retries: number;
  /** 반려 사유별 카운트 */
  rejectGuardrail: number;
  rejectRemedy: number;
  /** 비율 (llm=0이면 0) */
  cacheHitRate: number;
  fallbackRate: number;
  retryRate: number;
}

export function collectMetrics(units: ResolvedUnit[]): GenerationMetrics {
  const llmUnits = units.filter((u) => u.source === "llm");
  const llm = llmUnits.length;
  const cacheHits = llmUnits.filter((u) => u.cacheHit).length;
  const fallbacks = llmUnits.filter((u) => u.guardrailFallback).length;
  const retries = llmUnits.filter((u) => u.retried).length;
  const rejectGuardrail = llmUnits.filter((u) => u.rejectReason === "guardrail").length;
  const rejectRemedy = llmUnits.filter((u) => u.rejectReason === "remedy").length;
  const rate = (n: number): number => (llm === 0 ? 0 : Number((n / llm).toFixed(3)));

  return {
    llm,
    cacheHits,
    fallbacks,
    retries,
    rejectGuardrail,
    rejectRemedy,
    cacheHitRate: rate(cacheHits),
    fallbackRate: rate(fallbacks),
    retryRate: rate(retries),
  };
}
