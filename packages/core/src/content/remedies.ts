/**
 * 개운 처방 규칙 테이블 (기획서 §6 카드7, §4.2 "조합 규칙 기반").
 * 부족한 오행을 색·방향·생활습관으로 보완. 규칙 기반이라 LLM 없이 결정론적 생성.
 *
 * 가드레일(§4.4): 부적·굿 등 추가 지출 유도 표현 금지 → 여기 데이터엔 소비 유도 항목 없음.
 * 감수 필요(§13.4): 오행 결핍→색·방향 매핑은 사람이 감수.
 */

import type { Element } from "../saju/constants.js";

export interface Remedy {
  element: Element;
  /** 보완 색상 (한글 라벨 + hex는 ui 토큰 참조) */
  colors: string[];
  /** 길방(吉方) */
  direction: string;
  /** 생활 처방 (소비 유도 없는 습관 중심) */
  habits: string[];
  /** "올해의 한 가지" 골격 문구 */
  oneThing: string;
}

/** 부족한 오행 → 처방 */
export const REMEDIES: Record<Element, Remedy> = {
  wood: {
    element: "wood",
    colors: ["초록", "청록"],
    direction: "동쪽",
    habits: ["아침 산책으로 하루를 여세요", "화분 하나를 곁에 두고 돌보세요"],
    oneThing: "미뤄둔 시작을 올해는 딱 하나만 실행으로 옮기기.",
  },
  fire: {
    element: "fire",
    colors: ["빨강", "주홍"],
    direction: "남쪽",
    habits: ["햇빛 드는 창가에서 잠깐씩 쉬세요", "표현을 미루지 말고 그날 안에 말하세요"],
    oneThing: "속으로만 담아둔 마음을 올해는 먼저 꺼내 보기.",
  },
  earth: {
    element: "earth",
    colors: ["노랑", "베이지"],
    direction: "중앙·근거리",
    habits: ["끼니를 거르지 말고 규칙적으로 챙기세요", "약속을 작게 잡고 꼭 지키세요"],
    oneThing: "벌여둔 일을 올해는 하나씩 마무리해 땅을 다지기.",
  },
  metal: {
    element: "metal",
    colors: ["흰색", "은색"],
    direction: "서쪽",
    habits: ["주변을 비우고 정리하는 시간을 가지세요", "맺고 끊는 결정을 미루지 마세요"],
    oneThing: "질질 끌던 관계나 일을 올해는 깔끔하게 정리하기.",
  },
  water: {
    element: "water",
    colors: ["검정", "남색"],
    direction: "북쪽",
    habits: ["물을 충분히 마시고 잘 자세요", "물가 근처를 걸으며 생각을 흘려보내세요"],
    oneThing: "쉼 없이 달렸다면 올해는 의도적으로 한 박자 쉬어 가기.",
  },
};

export function remedyFor(weakest: Element): Remedy {
  return REMEDIES[weakest];
}

/**
 * 오행별 색·방위 표기 변형. LLM은 "검정"을 "검은색"으로 쓰는 식으로 흔들리므로
 * 테이블 값만으로 매칭하면 놓친다.
 */
const REMEDY_TERMS: Record<Element, RegExp> = {
  wood: /초록|녹색|청록|동쪽|동방/,
  fire: /빨강|빨간|붉은|주홍|남쪽|남방/,
  earth: /노랑|노란|베이지|황색/,
  // '은색'은 '검은색'의 부분문자열이라 앞에 한글이 붙으면 제외한다(한글엔 단어 경계가 없다).
  metal: /흰색|하얀|하양|(?<![가-힣])은색|서쪽|서방/,
  water: /검정|검은|까만|남색|북쪽|북방/,
};

/**
 * 처방 서사에 **다른 오행의 색·방위**가 섞였는지 검사.
 * 개운 처방은 코어가 결정하고 LLM은 서사만 써야 하는데(단일 소스), 자유 생성이 새면
 * 같은 화면의 결정론적 처방 카드와 어긋난다 — 유료 구간에서 신뢰를 직접 깎는 사고.
 *
 * 오탐을 줄이려고 **처방 오행 본인의 표현은 항상 통과**시키고, 나머지 4종만 본다.
 * @returns 충돌한 오행 목록 (비어 있으면 정합)
 */
export function remedyConflicts(text: string, prescribed: Element): Element[] {
  const out: Element[] = [];
  for (const el of Object.keys(REMEDY_TERMS) as Element[]) {
    if (el === prescribed) continue;
    if (REMEDY_TERMS[el].test(text)) out.push(el);
  }
  return out;
}
