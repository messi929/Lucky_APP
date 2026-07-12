/**
 * 오늘의 한 줄 (기획서 §10.1 데일리 푸시 코어).
 *  내 일간 × 오늘 일진(일간 기준 십신 + 오행 겹침) → 겁주지 않는 한 줄.
 *  일간(10) × 오늘 천간(10) = 100 조합 → 캐시 키로 생성 비용 미미(바이럴 비용 디커플링).
 *  순수 계산. 웹 노출 + 앱 데일리 푸시가 공유(원칙 8).
 *  카피는 골격(draft), 최종 확정은 사람(§12.3).
 */

import { BRANCHES, ELEMENT_KO, STEMS, type Element, type TenGod } from "./constants.js";
import { dayGanziIndex } from "./ganzi.js";

/** 일간 기준 대상 천간의 십신 (self-contained) */
function tenGodOf(dayStemIdx: number, targetStemIdx: number): TenGod {
  const day = STEMS[dayStemIdx]!;
  const t = STEMS[targetStemIdx]!;
  const same = day.yinYang === t.yinYang;
  const de = day.element;
  const te = t.element;
  const gen: Record<Element, Element> = {
    wood: "fire",
    fire: "earth",
    earth: "metal",
    metal: "water",
    water: "wood",
  };
  const ctrl: Record<Element, Element> = {
    wood: "earth",
    earth: "water",
    water: "fire",
    fire: "metal",
    metal: "wood",
  };
  if (te === de) return same ? "비견" : "겁재";
  if (gen[de] === te) return same ? "식신" : "상관";
  if (ctrl[de] === te) return same ? "편재" : "정재";
  if (ctrl[te] === de) return same ? "편관" : "정관";
  return same ? "편인" : "정인";
}

/** 십신별 데일리 한 줄 골격 (겁주지 않는 톤, 대처 위주) */
const DAILY_LINES: Record<TenGod, string> = {
  비견: "내 편이 되어줄 사람이 눈에 띄는 날. 혼자 안고 있던 걸 나눠 보세요.",
  겁재: "욕심이 앞설 수 있는 날. 남과 비교만 접어두면 하루가 편해져요.",
  식신: "표현이 술술 풀리는 날. 미뤄둔 말 한마디, 오늘 꺼내기 좋아요.",
  상관: "재치가 도는 날. 다만 한마디가 세게 나갈 수 있으니 톤만 낮추면 완벽.",
  편재: "기회가 스치는 날. 크게 벌이기보다 흐름만 잘 살펴 두세요.",
  정재: "차곡차곡이 어울리는 날. 작은 마무리가 오늘의 이득이에요.",
  편관: "압박이 느껴질 수 있는 날. 큰 결정은 한 박자 늦춰도 늦지 않아요.",
  정관: "책임이 어울리는 날. 정공법으로 가면 신뢰가 쌓여요.",
  편인: "생각이 깊어지는 날. 혼자만의 시간을 조금 챙기면 회복돼요.",
  정인: "쉬어가도 좋은 날. 배우고 기대는 게 흉이 아니에요.",
};

export interface DailyLine {
  /** "YYYY-MM-DD" (KST 기준 날짜) */
  date: string;
  /** 오늘 일진 간지(한글) */
  todayGanji: string;
  /** 내 일간 기준 오늘 천간의 십신 */
  tenGod: TenGod;
  /** 오행 겹침 여부 (내 일간 오행 == 오늘 천간 오행) */
  elementOverlap: boolean;
  line: string;
  /** 캐시 키: daily:내일간:오늘천간 (100 조합) */
  cacheKey: string;
}

/**
 * 오늘의 한 줄. myDayStemIdx = 내 일간 index(0..9), 날짜는 KST 기준.
 * 배치(앱 푸시)는 유저별 myDayStemIdx만 알면 되고, 원본 생년월일 불필요(원칙 2).
 */
export function dailyLine(
  myDayStemIdx: number,
  y: number,
  m: number,
  d: number,
): DailyLine {
  const ganzi = dayGanziIndex(y, m, d);
  const todayStemIdx = ganzi % 10;
  const todayBranchIdx = ganzi % 12;
  const tg = tenGodOf(myDayStemIdx, todayStemIdx);
  const overlap = STEMS[myDayStemIdx]!.element === STEMS[todayStemIdx]!.element;

  const base = DAILY_LINES[tg];
  const line = overlap
    ? `${base} (${ELEMENT_KO[STEMS[myDayStemIdx]!.element]}기가 겹치는 날)`
    : base;

  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    date: `${y}-${pad(m)}-${pad(d)}`,
    todayGanji: STEMS[todayStemIdx]!.hangul + branchHangul(todayBranchIdx),
    tenGod: tg,
    elementOverlap: overlap,
    line,
    cacheKey: `daily:${myDayStemIdx}:${todayStemIdx}`,
  };
}

function branchHangul(idx: number): string {
  return BRANCHES[idx]!.hangul;
}
