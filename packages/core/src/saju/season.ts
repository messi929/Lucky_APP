/**
 * 절기 국면 (A5 재방문 훅) — "입추 지났어요, 결이 바뀌는 때예요".
 *
 * 재방문 이유가 제품 구조에 없었다. 절기(節)는 12번/년 바뀌고 boundary/astro가 이미
 * 정밀 계산한다. 전환 직후 다시 오면 "국면이 바뀌었다"고 말해줄 근거가 된다.
 *
 * 순수 함수 — now를 인자로 받는다(Date.now() 호출 없음: 결정론·테스트 용이).
 */

import { findEnclosingMajorTerms } from "./astro.js";

const MS_PER_DAY = 86_400_000;
/** 전환 직후로 보는 창(일) — 재방문 훅이 강해지는 구간 */
const FRESH_DAYS = 3;
/** 다음 전환이 임박한 것으로 보는 창(일) */
const SOON_DAYS = 3;

export interface SeasonPhase {
  /** 현재 속한 절기 */
  currentTerm: string;
  /** 다음 절기 */
  nextTerm: string;
  /** 현재 절기 시작 후 경과일 (내림) */
  daysSinceCurrent: number;
  /** 다음 절기까지 남은 일 (올림) */
  daysUntilNext: number;
  /** 최근 전환 직후인가 (재방문 훅 강) */
  justTurned: boolean;
  /** 다음 전환 임박인가 */
  turningSoon: boolean;
}

/** 주어진 시각의 절기 국면 */
export function seasonPhase(now: Date): SeasonPhase {
  const { current, next } = findEnclosingMajorTerms(now);
  const ms = now.getTime();
  const daysSinceCurrent = Math.floor((ms - current.instant.getTime()) / MS_PER_DAY);
  const daysUntilNext = Math.ceil((next.instant.getTime() - ms) / MS_PER_DAY);
  return {
    currentTerm: current.name,
    nextTerm: next.name,
    daysSinceCurrent,
    daysUntilNext,
    justTurned: daysSinceCurrent <= FRESH_DAYS,
    turningSoon: daysUntilNext <= SOON_DAYS,
  };
}

/** 한글 마지막 글자에 받침이 있는가 (조사 이/가·은/는 선택용) */
function hasFinalConsonant(word: string): boolean {
  const last = word.charCodeAt(word.length - 1);
  if (last < 0xac00 || last > 0xd7a3) return false; // 한글 음절이 아니면 없음 취급
  return (last - 0xac00) % 28 !== 0;
}

/** 으로/로 조사: 받침 없음(종성 0) 또는 ㄹ받침(종성 8)이면 '로', 그 외 받침이면 '으로'. */
function euroRo(word: string): string {
  const last = word.charCodeAt(word.length - 1);
  if (last < 0xac00 || last > 0xd7a3) return "로";
  const jong = (last - 0xac00) % 28;
  return jong === 0 || jong === 8 ? "로" : "으로";
}

/**
 * 절기 국면 → 재방문 한 줄. justTurned > turningSoon > 평시 순.
 * 카피는 관망 언어(겁주지 않기). guardrails 통과를 전제로 authored.
 */
export function seasonHook(phase: SeasonPhase): string {
  const cur = phase.currentTerm;
  const nxt = phase.nextTerm;
  if (phase.justTurned) {
    const josa = hasFinalConsonant(cur) ? "이" : "가";
    return `${cur}${josa} 막 지났어요. 계절의 결이 바뀌는 때 — 흐름을 다시 봐드릴까요?`;
  }
  if (phase.turningSoon) {
    return `${phase.daysUntilNext}일 뒤 ${nxt}${euroRo(nxt)} 넘어가요. 국면이 바뀌기 전에 한 번 짚어볼까요?`;
  }
  // 은/는은 '지금'에 붙는다(항상 지금은) — 절기 이름 받침과 무관.
  return `지금은 ${cur} 무렵. 다음 ${nxt}까지 ${phase.daysUntilNext}일 남았어요.`;
}
