/**
 * 간지·오행·십신·12운성·지장간 단일 소스 (CLAUDE.md: core 내 단일 enum+테이블).
 * index는 60갑자·시두법·월두법 계산의 기준이므로 순서 변경 금지.
 */

export type Element = "wood" | "fire" | "earth" | "metal" | "water";
export type YinYang = "yin" | "yang";

export const ELEMENT_KO: Record<Element, string> = {
  wood: "목",
  fire: "화",
  earth: "토",
  metal: "금",
  water: "수",
};

/** 천간 10 (甲乙丙丁戊己庚辛壬癸) */
export interface StemDef {
  index: number;
  hanja: string;
  hangul: string;
  element: Element;
  yinYang: YinYang;
}

export const STEMS: readonly StemDef[] = [
  { index: 0, hanja: "甲", hangul: "갑", element: "wood", yinYang: "yang" },
  { index: 1, hanja: "乙", hangul: "을", element: "wood", yinYang: "yin" },
  { index: 2, hanja: "丙", hangul: "병", element: "fire", yinYang: "yang" },
  { index: 3, hanja: "丁", hangul: "정", element: "fire", yinYang: "yin" },
  { index: 4, hanja: "戊", hangul: "무", element: "earth", yinYang: "yang" },
  { index: 5, hanja: "己", hangul: "기", element: "earth", yinYang: "yin" },
  { index: 6, hanja: "庚", hangul: "경", element: "metal", yinYang: "yang" },
  { index: 7, hanja: "辛", hangul: "신", element: "metal", yinYang: "yin" },
  { index: 8, hanja: "壬", hangul: "임", element: "water", yinYang: "yang" },
  { index: 9, hanja: "癸", hangul: "계", element: "water", yinYang: "yin" },
] as const;

/**
 * 지지 12 (子丑寅卯辰巳午未申酉戌亥).
 * hiddenStems: 지장간(여기·중기·정기 순, 천간 index 배열. 정기가 마지막).
 */
export interface BranchDef {
  index: number;
  hanja: string;
  hangul: string;
  element: Element;
  yinYang: YinYang;
  hiddenStems: readonly number[];
}

export const BRANCHES: readonly BranchDef[] = [
  { index: 0, hanja: "子", hangul: "자", element: "water", yinYang: "yang", hiddenStems: [8, 9] },
  { index: 1, hanja: "丑", hangul: "축", element: "earth", yinYang: "yin", hiddenStems: [9, 7, 5] },
  { index: 2, hanja: "寅", hangul: "인", element: "wood", yinYang: "yang", hiddenStems: [4, 2, 0] },
  { index: 3, hanja: "卯", hangul: "묘", element: "wood", yinYang: "yin", hiddenStems: [0, 1] },
  { index: 4, hanja: "辰", hangul: "진", element: "earth", yinYang: "yang", hiddenStems: [1, 9, 4] },
  { index: 5, hanja: "巳", hangul: "사", element: "fire", yinYang: "yin", hiddenStems: [4, 6, 2] },
  { index: 6, hanja: "午", hangul: "오", element: "fire", yinYang: "yang", hiddenStems: [2, 5, 3] },
  { index: 7, hanja: "未", hangul: "미", element: "earth", yinYang: "yin", hiddenStems: [3, 1, 5] },
  { index: 8, hanja: "申", hangul: "신", element: "metal", yinYang: "yang", hiddenStems: [4, 8, 6] },
  { index: 9, hanja: "酉", hangul: "유", element: "metal", yinYang: "yin", hiddenStems: [6, 7] },
  { index: 10, hanja: "戌", hangul: "술", element: "earth", yinYang: "yang", hiddenStems: [7, 3, 4] },
  { index: 11, hanja: "亥", hangul: "해", element: "water", yinYang: "yin", hiddenStems: [4, 0, 8] },
] as const;

/** 지지별 대표 시간대 라벨 (자시 23:00~01:00 …) */
export const BRANCH_HOURS: readonly string[] = [
  "23:00–01:00",
  "01:00–03:00",
  "03:00–05:00",
  "05:00–07:00",
  "07:00–09:00",
  "09:00–11:00",
  "11:00–13:00",
  "13:00–15:00",
  "15:00–17:00",
  "17:00–19:00",
  "19:00–21:00",
  "21:00–23:00",
];

/** 십신 10종 */
export type TenGod =
  | "비견"
  | "겁재"
  | "식신"
  | "상관"
  | "편재"
  | "정재"
  | "편관"
  | "정관"
  | "편인"
  | "정인";

/** 12운성 */
export type TwelveStage =
  | "장생"
  | "목욕"
  | "관대"
  | "건록"
  | "제왕"
  | "쇠"
  | "병"
  | "사"
  | "묘"
  | "절"
  | "태"
  | "양";

/** 오행 상생 순환 (목→화→토→금→수→목) */
export const ELEMENT_ORDER: readonly Element[] = ["wood", "fire", "earth", "metal", "water"];

/** 오행 상생: key를 생하는(낳는) 오행 */
export const GENERATES: Record<Element, Element> = {
  wood: "fire",
  fire: "earth",
  earth: "metal",
  metal: "water",
  water: "wood",
};

/** 오행 상극: key가 극하는(이기는) 오행 */
export const CONTROLS: Record<Element, Element> = {
  wood: "earth",
  earth: "water",
  water: "fire",
  fire: "metal",
  metal: "wood",
};

/** 60갑자 index → 간지 문자열 (한글) */
export function ganjiHangul(ganziIndex: number): string {
  const g = ((ganziIndex % 60) + 60) % 60;
  return STEMS[g % 10]!.hangul + BRANCHES[g % 12]!.hangul;
}

export function ganjiHanja(ganziIndex: number): string {
  const g = ((ganziIndex % 60) + 60) % 60;
  return STEMS[g % 10]!.hanja + BRANCHES[g % 12]!.hanja;
}
