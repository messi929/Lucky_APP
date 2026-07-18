/**
 * 고민 카탈로그 taxonomy (기획서 v1.2 §7). 전 세대 고민 + 연령 적응 노출.
 * 생년월일로 연령을 알므로 별도 설정 없이 자동 적응. 연령 밖 선택도 자유 보장.
 *
 * 스키마(§7.2): { id, label, ageWeights, promptTemplate, guardrailLevel, verticalSku? }
 * guardrailLevel: 1(공통) / 2(관망 언어: 부동산·사업·재물 시기) / 3(민감: 자녀운·건강)
 */

export type GuardrailLevel = 1 | 2 | 3;

/** 연령 버킷 (§7.2 열) */
export type AgeBucket = "teens20" | "twenties30" | "forties50" | "sixtyplus";

/** 버티컬 유료 SKU (§7.4) */
export type VerticalSku = "child_fortune" | "taekil" | "exam" | "timing";

export type ConcernId =
  | "love_dating"
  | "marriage_timing"
  | "marital"
  | "relationship"
  | "career_path"
  | "job"
  | "business"
  | "retirement_finance"
  | "money_timing"
  | "real_estate"
  | "stability"
  | "parent_worry"
  | "child_fortune"
  | "descendants"
  | "exam"
  | "contract_timing"
  | "taekil"
  | "health_year";

export interface Concern {
  id: ConcernId;
  label: string;
  /** 연령 버킷별 노출 가중치 0..1 */
  ageWeights: Record<AgeBucket, number>;
  /** seasonal_fortune/버티컬 프롬프트에 삽입할 지시 템플릿 */
  promptTemplate: string;
  guardrailLevel: GuardrailLevel;
  verticalSku?: VerticalSku;
}

const W = (t: number, tw: number, f: number, s: number): Record<AgeBucket, number> => ({
  teens20: t,
  twenties30: tw,
  forties50: f,
  sixtyplus: s,
});

export const CONCERNS: Record<ConcernId, Concern> = {
  love_dating: {
    id: "love_dating",
    label: "썸·연애",
    ageWeights: W(1, 0.7, 0.2, 0.1),
    promptTemplate: "연애·썸의 흐름을 이 사람 관점에서 단정과 조언으로 짚어 주세요.",
    guardrailLevel: 1,
  },
  marriage_timing: {
    id: "marriage_timing",
    label: "결혼 타이밍",
    ageWeights: W(0.2, 1, 0.4, 0.1),
    promptTemplate: "결혼·정착 시기의 흐름을 조심스럽게 제시하되 단정은 근거와 함께.",
    guardrailLevel: 1,
    verticalSku: "timing",
  },
  marital: {
    id: "marital",
    label: "부부 관계",
    ageWeights: W(0, 0.2, 0.8, 0.7),
    promptTemplate: "부부 관계의 결을 화합과 대처 관점에서 짚어 주세요. 이혼 단정 금지.",
    guardrailLevel: 1,
  },
  relationship: {
    id: "relationship",
    label: "인간관계",
    ageWeights: W(0.7, 0.7, 0.6, 0.5),
    promptTemplate: "주변 사람과의 관계 흐름을 이 사람 기질에 근거해 짚어 주세요.",
    guardrailLevel: 1,
  },
  career_path: {
    id: "career_path",
    label: "진로",
    ageWeights: W(1, 0.3, 0.1, 0),
    promptTemplate: "진로 방향의 강점과 다음 한 걸음을 근거와 함께 제시해 주세요.",
    guardrailLevel: 1,
  },
  job: {
    id: "job",
    label: "취업·이직",
    ageWeights: W(0.5, 1, 0.4, 0),
    promptTemplate: "취업·이직 흐름을 기회와 대처 위주로 제시해 주세요.",
    guardrailLevel: 1,
    verticalSku: "timing",
  },
  business: {
    id: "business",
    label: "사업·승진",
    ageWeights: W(0, 0.4, 1, 0.3),
    promptTemplate: "사업 확장·정리, 승진의 흐름을 관망 언어로 제시(단정적 매도·매수 지시 금지).",
    guardrailLevel: 2,
  },
  retirement_finance: {
    id: "retirement_finance",
    label: "노후 재정",
    ageWeights: W(0, 0, 0.4, 1),
    promptTemplate: "노후 재정의 흐름을 안정·관망 관점으로 안내(투자 지시 금지).",
    guardrailLevel: 2,
  },
  money_timing: {
    id: "money_timing",
    label: "목돈 시기",
    ageWeights: W(0.2, 1, 0.5, 0.2),
    promptTemplate: "목돈·독립의 시기 흐름을 관망 언어로 제시(구체 종목·매매 지시 금지).",
    guardrailLevel: 2,
  },
  real_estate: {
    id: "real_estate",
    label: "부동산·이사 시기",
    ageWeights: W(0, 0.3, 1, 0.4),
    promptTemplate: "부동산 매매·이사 방위의 흐름을 '서두르기보다 살펴보기 좋은 시기' 수준의 관망 언어로만.",
    guardrailLevel: 2,
    verticalSku: "taekil",
  },
  stability: {
    id: "stability",
    label: "정리와 안정",
    ageWeights: W(0, 0.1, 0.3, 1),
    promptTemplate: "삶의 정리와 안정의 흐름을 부드럽게 안내해 주세요.",
    guardrailLevel: 1,
  },
  parent_worry: {
    id: "parent_worry",
    label: "부모 걱정",
    ageWeights: W(0.4, 0.7, 0.3, 0),
    promptTemplate: "부모님과의 관계·건강 걱정을 대처 위주로 다독여 주세요. 건강 단정 금지.",
    guardrailLevel: 3,
  },
  child_fortune: {
    id: "child_fortune",
    label: "자녀운 (수능·취업·혼사)",
    ageWeights: W(0, 0.1, 1, 0.6),
    promptTemplate:
      "자녀의 학업·취업·혼사 흐름을 부모 입장에서 짚되, 불안 자극('이대로면 어렵다') 절대 금지. 대처·응원 위주.",
    guardrailLevel: 3,
    verticalSku: "child_fortune",
  },
  descendants: {
    id: "descendants",
    label: "자식·손주",
    ageWeights: W(0, 0, 0.3, 1),
    promptTemplate: "자식·손주와의 관계와 화합을 따뜻하게 안내해 주세요.",
    guardrailLevel: 1,
  },
  exam: {
    id: "exam",
    label: "시험운",
    ageWeights: W(1, 0.4, 0.2, 0),
    promptTemplate: "시험·수험의 흐름을 준비·컨디션 관리 관점으로 응원과 함께 제시해 주세요.",
    guardrailLevel: 1,
    verticalSku: "exam",
  },
  contract_timing: {
    id: "contract_timing",
    label: "계약·퇴사 시점",
    ageWeights: W(0.2, 1, 0.5, 0.1),
    promptTemplate: "계약·퇴사 시점의 흐름을 관망 언어로 제시(확정적 지시 금지).",
    guardrailLevel: 2,
  },
  taekil: {
    id: "taekil",
    label: "이사·개업·혼사 택일",
    ageWeights: W(0, 0.3, 1, 0.5),
    promptTemplate: "택일 결과(좋은 날/피할 날)를 근거와 함께 담담히 안내해 주세요.",
    guardrailLevel: 1,
    verticalSku: "taekil",
  },
  health_year: {
    id: "health_year",
    label: "건강한 한 해",
    ageWeights: W(0, 0, 0.6, 1),
    promptTemplate:
      "올해 건강 흐름을 '쉬어갈 시기 안내' 프레임으로만. 질병·수술 예언 절대 금지, 불안 자극 금지.",
    guardrailLevel: 3,
  },
};

export function concernById(id: ConcernId): Concern {
  return CONCERNS[id];
}

/**
 * 상담 허브 타일 표현 (낙관 한자 마커 + 한 줄 부제). 웹·모바일 허브 공용 단일 소스(원칙 8).
 * 한자는 디자인 §불변 4 낙관 세트에서: 答(고민) 緣(궁합) 運(처방) 福(선물) 問(질문) 吉(택일).
 */
export const CONCERN_HUB: Record<ConcernId, { hanja: string; sub: string }> = {
  love_dating: { hanja: "答", sub: "썸과 연애의 결" },
  marriage_timing: { hanja: "緣", sub: "언제, 어떤 인연" },
  marital: { hanja: "緣", sub: "부부의 결" },
  relationship: { hanja: "答", sub: "사람과의 거리" },
  career_path: { hanja: "運", sub: "일의 방향" },
  job: { hanja: "運", sub: "지금 움직여도 될까" },
  business: { hanja: "運", sub: "확장과 정리 사이" },
  retirement_finance: { hanja: "福", sub: "지키고 누리는 때" },
  money_timing: { hanja: "福", sub: "열리고 닫히는 때" },
  real_estate: { hanja: "福", sub: "집·계약의 때" },
  stability: { hanja: "福", sub: "덜어내며 단단해지기" },
  parent_worry: { hanja: "問", sub: "부모님, 그리고 나" },
  child_fortune: { hanja: "問", sub: "그 아이의 길" },
  descendants: { hanja: "問", sub: "곁의 온기" },
  exam: { hanja: "運", sub: "시험의 흐름" },
  contract_timing: { hanja: "吉", sub: "그 계약, 언제" },
  taekil: { hanja: "吉", sub: "좋은 날 고르기" },
  health_year: { hanja: "問", sub: "올 한 해 몸의 결" },
};

/** 만 나이 → 연령 버킷 (§7.2) */
export function ageToBucket(age: number): AgeBucket {
  if (age < 20) return "teens20";
  if (age < 40) return "twenties30";
  if (age < 60) return "forties50";
  return "sixtyplus";
}

/** 연령 기본 노출: 버킷 가중치 상위 N개 (§7.3 "연령대별 기본 4개") */
export function concernsForAge(age: number, n = 4): Concern[] {
  const bucket = ageToBucket(age);
  return Object.values(CONCERNS)
    .filter((c) => c.ageWeights[bucket] > 0)
    .sort((a, b) => b.ageWeights[bucket] - a.ageWeights[bucket])
    .slice(0, n);
}
