/**
 * 절입 경계 플래그 (VERIFICATION-REPORT §어댑터 2, option a).
 *
 * ssaju의 절입 시각은 근사 공식이라 ±2분 오차 가능. 절입 ±5분 이내 출생은
 * '경계 출생'으로 플래그하여 리포트에서 안내("절입 경계라 두 명식이 가능합니다").
 * 역술 관행상 오히려 전문성 어필 → 오차를 신뢰 자산으로 전환.
 *
 * 경계 판정은 자체 천문 계산(astro.ts, ±1~2분)으로 수행. 추후 KASI 공식 절기
 * 테이블(1900–2050)로 교체 시 이 모듈만 데이터 소스 변경.
 */

import { findEnclosingMajorTerms } from "./astro.js";
import type { CorrectionMeta } from "./corrections.js";

const MIN_MS = 60_000;
const BOUNDARY_WINDOW_MIN = 5;

export interface BoundaryFlag {
  /** 절입 ±5분 이내 출생 여부 */
  isBoundary: boolean;
  /** 가장 가까운 절(節) */
  nearestTerm: {
    name: string;
    instantKST: string;
    /** 출생 − 절입 (분). 음수 = 절입 전 출생 */
    diffMinutes: number;
  };
  note?: string;
}

/**
 * 보정된 표준시(correctedInput) 기준 실제 물리 순간으로 절입 경계 판정.
 * 절기는 전지구 공통 순간이므로 LMT(진태양시) 무관, 표준시 순간만 사용.
 */
export function detectBoundary(meta: CorrectionMeta): BoundaryFlag {
  const c = meta.correctedInput;
  // 표준 KST 벽시계 → 실제 UTC 순간
  const realUtcMs = Date.UTC(c.year, c.month - 1, c.day, c.hour, c.minute) - 9 * 3_600_000;
  const { current, next } = findEnclosingMajorTerms(new Date(realUtcMs));

  // 직전 절(current)과 다음 절(next) 중 더 가까운 쪽
  const dPrev = realUtcMs - current.instant.getTime();
  const dNext = realUtcMs - next.instant.getTime();
  const nearest = Math.abs(dPrev) <= Math.abs(dNext) ? { term: current, diff: dPrev } : { term: next, diff: dNext };
  const diffMinutes = nearest.diff / MIN_MS;
  const isBoundary = Math.abs(diffMinutes) <= BOUNDARY_WINDOW_MIN;

  return {
    isBoundary,
    nearestTerm: {
      name: nearest.term.name,
      instantKST: kstIso(nearest.term.instant),
      diffMinutes: Math.round(diffMinutes * 10) / 10,
    },
    ...(isBoundary
      ? {
          note: `출생 시각이 '${nearest.term.name}' 절입과 약 ${Math.abs(
            Math.round(diffMinutes),
          )}분 차이입니다. 절입 경계라 인접한 두 명식이 가능하니 참고하세요.`,
        }
      : {}),
  };
}

/** UTC Date → KST ISO 문자열(참고 표기) */
function kstIso(d: Date): string {
  return new Date(d.getTime() + 9 * 3_600_000).toISOString().replace("Z", "+09:00");
}
