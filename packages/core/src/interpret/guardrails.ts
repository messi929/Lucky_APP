/**
 * 가드레일 — 카테고리별 3단계 (기획서 v1.2 §4.3).
 * 프롬프트 명시 + guardrails.ts 후처리 이중 방어. "겁주지 않는 사주" 코드 방어선.
 *
 *  L1 공통(전체): 건강 진단·사고 예언·투자 지시·사망/이혼 단정·공포 소구·부적/굿 지출 유도
 *  L2 관망 언어(부동산·사업·재물 시기): "사라/팔라" 금지 → 관망 표현만 (자문업 오해 차단)
 *  L3 최고 민감(자녀운·건강): 불안 자극("이대로면 어렵다") 금지, 건강은 "쉬어갈 시기" 프레임만
 *
 * level N 검사는 rule.level ≤ N 인 규칙을 모두 적용한다.
 */

import type { GuardrailLevel } from "../content/concerns.js";

export type GuardrailCategory =
  | "health" // 건강 단정(수술·질병·사고 예언)
  | "investment" // 투자 지시
  | "fatal" // 사망·이혼·파산 단정
  | "fear" // 공포 소구
  | "spending" // 부적·굿 등 추가 지출 유도
  | "directive_trade" // L2: 매수·매도 등 확정적 매매 지시
  | "anxiety"; // L3: 불안 자극 표현

interface Rule {
  category: GuardrailCategory;
  level: GuardrailLevel;
  pattern: RegExp;
}

const RULES: readonly Rule[] = [
  // L1 공통
  { category: "health", level: 1, pattern: /암에\s*걸|발암|종양|암세포|수술(을|받|하게)|불치병|난치병|시한부/ },
  { category: "investment", level: 1, pattern: /투자(하세요|하라|해라|를\s*하면|\s*추천)|주식.{0,5}(사세요|매수|몰빵)|코인.{0,5}(사|투자)|영끌|몰빵/ },
  { category: "fatal", level: 1, pattern: /죽는다|죽을\s*것|죽게\s*(된|될)|사망(하게|할|한다)|이혼(하게|한다|할\s*것|수순)|파산(한다|하게|할\s*것)/ },
  { category: "fear", level: 1, pattern: /액땜|살(을)?\s*풀|큰\s*화(를|가)|재앙|횡액|저주|천벌|불행이\s*(닥|찾)|화를\s*입/ },
  { category: "spending", level: 1, pattern: /부적|굿(을|\s|하|이)|치성|살풀이|기도\s*비용|개운\s*부적|제(를|사를)\s*지내/ },
  // L2 관망 언어 (부동산·사업·재물 시기)
  { category: "directive_trade", level: 2, pattern: /(지금|당장|반드시|꼭)\s*(사세요|파세요|매수|매도|팔)|사라|파세요|팔아라|매수하세요|매도하세요|들어가세요|빼세요/ },
  // L3 민감 (자녀운·건강)
  { category: "anxiety", level: 3, pattern: /이대로(면|는|라면)\s*(어렵|힘들|안\s*됩|안\s*돼|망)|가망(이)?\s*없|끝장|위험(합니다|해요|하다|한\s*해)|큰일\s*(납|나|입)|답이\s*없/ },
];

export interface Violation {
  category: GuardrailCategory;
  match: string;
}

export interface GuardrailResult {
  ok: boolean;
  level: GuardrailLevel;
  violations: Violation[];
}

/**
 * 생성 텍스트 후처리 검사. level(기본 1)까지의 규칙을 적용.
 * 위반 시 오케스트레이터가 재생성 또는 안전 폴백.
 */
export function applyGuardrails(text: string, level: GuardrailLevel = 1): GuardrailResult {
  const violations: Violation[] = [];
  for (const rule of RULES) {
    if (rule.level > level) continue;
    const m = rule.pattern.exec(text);
    if (m) violations.push({ category: rule.category, match: m[0] });
  }
  return { ok: violations.length === 0, level, violations };
}

/** 모든 리포트 하단 고지(§4.3). 클래식 모드는 강화판 사용 */
export const DISCLAIMER =
  "본 콘텐츠는 오락·자기이해 목적이며 의학·법률·투자 조언이 아닙니다.";

export const DISCLAIMER_CLASSIC =
  "본 콘텐츠는 오락과 자기이해를 돕기 위한 것으로, 의학적·법률적·재정적 판단의 근거로 삼지 마시기 바랍니다. 중요한 결정은 반드시 해당 분야 전문가와 상의하십시오.";
