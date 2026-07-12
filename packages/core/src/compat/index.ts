/**
 * 궁합 엔진 (기획서 §8.2). 순수 계산.
 *  일간 오행 상생상극 + 일지 합충 → 점수 → 등급 4종.
 *  관계 7종: 연인/썸/친구/직장 + 부모-자녀/부부/형제(가족 궁합).
 *
 * ★ 나쁜 결과 없음 원칙: 불꽃형(충)도 "싸우면서 정드는 조합" 재미 프레임.
 *   부정 결과는 공유가 죽는다 → 등급 라벨·헤드라인 모두 긍정.
 * 카피는 골격(draft), 최종 확정은 사람(§12.3).
 */

import { CONTROLS, GENERATES, type Element } from "../saju/constants.js";
import { isBranchChung, isBranchSamhap, isBranchYukhap } from "../saju/ganzi.js";
import type { SajuChart } from "../saju/types.js";

export type RelationType =
  | "lover"
  | "crush"
  | "friend"
  | "work"
  | "parent_child"
  | "couple"
  | "sibling";

export type CompatGrade = "destined" | "goodmatch" | "effort" | "spark";

export const RELATION_LABEL: Record<RelationType, string> = {
  lover: "연인",
  crush: "썸",
  friend: "친구",
  work: "직장",
  parent_child: "부모-자녀",
  couple: "부부",
  sibling: "형제",
};

export const GRADE_LABEL: Record<CompatGrade, string> = {
  destined: "천생연분",
  goodmatch: "좋은 합",
  effort: "노력형",
  spark: "불꽃형",
};

export interface CompatResult {
  score: number; // 0..100
  grade: CompatGrade;
  gradeLabel: string;
  relation: RelationType;
  relationLabel: string;
  /** 등급×관계 헤드라인 (공유 카드용, 항상 긍정 프레임) */
  headline: string;
  /** 관계 역학 설명 (상생/합/충 요인, 재미 프레임) */
  dynamics: string[];
}

const KO_TO_ELEMENT: Record<string, Element> = {
  목: "wood",
  화: "fire",
  토: "earth",
  금: "metal",
  수: "water",
};

interface DayFacts {
  element: Element;
  branchIdx: number;
}

function dayFacts(chart: SajuChart): DayFacts {
  const pd = chart.saju.pillarDetails.day;
  return { element: KO_TO_ELEMENT[pd.element.stem] ?? "earth", branchIdx: pd.branchIdx };
}

/** 두 사주의 궁합 계산 */
export function computeCompat(a: SajuChart, b: SajuChart, relation: RelationType): CompatResult {
  const fa = dayFacts(a);
  const fb = dayFacts(b);
  const dynamics: string[] = [];

  let score = 50;

  // 1) 일간 오행 관계
  let elementTension = false;
  if (fa.element === fb.element) {
    score += 10;
    dynamics.push("같은 오행 — 결이 비슷해 편안한 사이");
  } else if (GENERATES[fa.element] === fb.element || GENERATES[fb.element] === fa.element) {
    score += 20;
    dynamics.push("서로를 살리는 상생 — 한쪽이 다른 쪽을 북돋움");
  } else if (CONTROLS[fa.element] === fb.element || CONTROLS[fb.element] === fa.element) {
    elementTension = true;
    dynamics.push("긴장감 있는 조합 — 끌리면서도 부딪히는 힘");
  } else {
    score += 5;
  }

  // 2) 일지 합충
  let branchClash = false;
  if (isBranchSamhap(fa.branchIdx, fb.branchIdx)) {
    score += 18;
    dynamics.push("일지 삼합 — 함께 있으면 일이 풀리는 기운");
  } else if (isBranchYukhap(fa.branchIdx, fb.branchIdx)) {
    score += 15;
    dynamics.push("일지 육합 — 자연스레 손발이 맞음");
  } else if (isBranchChung(fa.branchIdx, fb.branchIdx)) {
    branchClash = true;
    dynamics.push("일지 충 — 밀당의 텐션, 지루할 틈이 없음");
  } else {
    score += 6;
  }

  score = Math.max(35, Math.min(97, score));

  // 3) 등급 — 불꽃형은 충/극 두드러질 때(점수와 무관, 재미 프레임)
  let grade: CompatGrade;
  if (branchClash || (elementTension && score < 70)) grade = "spark";
  else if (score >= 82) grade = "destined";
  else if (score >= 66) grade = "goodmatch";
  else grade = "effort";

  return {
    score,
    grade,
    gradeLabel: GRADE_LABEL[grade],
    relation,
    relationLabel: RELATION_LABEL[relation],
    headline: headlineFor(grade, relation),
    dynamics,
  };
}

/** 등급×관계 헤드라인 (골격 draft, 항상 긍정) */
function headlineFor(grade: CompatGrade, relation: RelationType): string {
  const rel = RELATION_LABEL[relation];
  switch (grade) {
    case "destined":
      return `${rel}으로 이보다 좋기 어려운 조합이에요. 말 안 해도 통하는 사이.`;
    case "goodmatch":
      return `${rel}으로 잘 맞는 편이에요. 서로 다른 데서 오히려 배우는 사이.`;
    case "effort":
      return `${rel}으로 노력하면 깊어지는 사이예요. 처음보다 나중이 좋은 조합.`;
    case "spark":
      return `불꽃 튀는 ${rel} 조합 — 싸우면서 정드는, 지루할 틈 없는 사이예요.`;
  }
}
