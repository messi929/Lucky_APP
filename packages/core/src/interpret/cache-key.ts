/**
 * 캐시 키 설계 (기획서 v1.2 §4.1): `유닛:값:프롬프트버전:시즌:톤모드:관심사`.
 * 프롬프트 버전이 키에 포함 → 프롬프트 개선 시 캐시 자연 무효화(§4.3).
 * 톤모드(mz/classic) 축 추가(v1.2 §4.2). 반응 톤(deep/counter)은 값에 포함.
 * 무료 리포트는 이 키로 캐시 적중률 90%+ 수렴 → 바이럴 비용 폭탄 방지(§4.2).
 */

import { modeOf } from "./persona.js";
import type { InterpretContext, InterpretationUnit } from "./types.js";

/** 유닛값 내 구분자·공백 정규화 (키 안정성) */
function normalize(value: string): string {
  return value.replace(/\s+/g, "").replace(/:/g, "·");
}

/** 정적/규칙 콘텐츠는 캐시 대상 아님(직접 참조) → null */
export function cacheKeyOf(
  unit: InterpretationUnit,
  ctx: InterpretContext,
  promptVersion: string,
): string | null {
  if (unit.source !== "llm") return null;
  const season = unit.seasonal ? ctx.season : "-";
  const mode = modeOf(ctx);
  const concern = unit.concern ?? "-";
  return `${unit.kind}:${normalize(unit.value)}:${promptVersion}:${season}:${mode}:${concern}`;
}
