/**
 * 일간 10종 캐릭터 (기획서 §6 카드3 "나는 ○○ 타입", §4.2 정적 콘텐츠).
 * 성격: 정적, content/에 선작성. 카드 카피 골격(draft) — 최종 확정은 사람(§13.4).
 * 화법(§4.3): 단정 먼저·위로 나중, 상담체 존댓말.
 */

import type { Element } from "../saju/constants.js";

export interface DayMasterCharacter {
  /** 천간 index 0..9 (ssaju pillarDetails.day.stemIdx와 일치) */
  stemIdx: number;
  stemHanja: string;
  stemHangul: string;
  element: Element;
  /** 캐릭터 라벨 ("나는 ○○ 타입") */
  name: string;
  /** 단정형 한 줄 (카드 헤드라인 골격) */
  tagline: string;
  /** 저장·공유 유발 키워드 태그 */
  keywords: string[];
  /** 카피 상태: draft(초안, 사람 감수 대기) */
  status: "draft" | "final";
}

export const DAY_MASTER_CHARACTERS: Record<number, DayMasterCharacter> = {
  0: {
    stemIdx: 0,
    stemHanja: "甲",
    stemHangul: "갑",
    element: "wood",
    name: "거목",
    tagline: "한번 방향을 정하면 안 꺾이는 사람이에요. 그래서 휘어야 할 때 제일 아파하죠.",
    keywords: ["추진력", "우직함", "리더", "고집"],
    status: "draft",
  },
  1: {
    stemIdx: 1,
    stemHanja: "乙",
    stemHangul: "을",
    element: "wood",
    name: "덩굴",
    tagline: "어디에 놓여도 기어이 살아남는 유연함이 있어요. 대신 혼자 서는 건 늘 미뤄두죠.",
    keywords: ["유연함", "생활력", "적응", "의존"],
    status: "draft",
  },
  2: {
    stemIdx: 2,
    stemHanja: "丙",
    stemHangul: "병",
    element: "fire",
    name: "한낮의 태양",
    tagline: "있으면 자리가 환해지는 사람이에요. 그 밝기를 스스로는 잘 못 쉬게 하고요.",
    keywords: ["열정", "표현력", "낙천", "번아웃"],
    status: "draft",
  },
  3: {
    stemIdx: 3,
    stemHanja: "丁",
    stemHangul: "정",
    element: "fire",
    name: "등불",
    tagline: "요란하지 않게 곁을 데워주는 온기가 있어요. 정작 당신 어둠은 혼자 견디고요.",
    keywords: ["섬세함", "배려", "집중", "예민"],
    status: "draft",
  },
  4: {
    stemIdx: 4,
    stemHanja: "戊",
    stemHangul: "무",
    element: "earth",
    name: "큰 산",
    tagline: "사람들이 당신한테 기대죠. 근데 정작 당신이 기댈 데는 잘 안 만들어요.",
    keywords: ["신뢰", "중심", "묵직함", "속내감춤"],
    status: "draft",
  },
  5: {
    stemIdx: 5,
    stemHanja: "己",
    stemHangul: "기",
    element: "earth",
    name: "옥토",
    tagline: "받아서 키워내는 힘이 좋은 사람이에요. 그 품이 넓어서 손해도 조용히 삼키죠.",
    keywords: ["포용", "성실", "실속", "인내"],
    status: "draft",
  },
  6: {
    stemIdx: 6,
    stemHanja: "庚",
    stemHangul: "경",
    element: "metal",
    name: "무쇠",
    tagline: "맺고 끊는 게 분명한 사람이에요. 그 단호함이 가끔 당신부터 베고요.",
    keywords: ["결단", "의리", "강단", "직설"],
    status: "draft",
  },
  7: {
    stemIdx: 7,
    stemHanja: "辛",
    stemHangul: "신",
    element: "metal",
    name: "보석",
    tagline: "다듬을수록 빛나는 사람이에요. 그래서 남의 시선에 제일 먼저 흔들리죠.",
    keywords: ["예리함", "자존심", "미감", "완벽주의"],
    status: "draft",
  },
  8: {
    stemIdx: 8,
    stemHanja: "壬",
    stemHangul: "임",
    element: "water",
    name: "바다",
    tagline: "생각의 폭이 넓은 사람이에요. 그 깊이를 남들이 다 못 봐서 오해도 사고요.",
    keywords: ["지혜", "포용", "역동", "속모름"],
    status: "draft",
  },
  9: {
    stemIdx: 9,
    stemHanja: "癸",
    stemHangul: "계",
    element: "water",
    name: "이슬",
    tagline: "조용히 스며서 바꾸는 사람이에요. 그 섬세함이 당신을 자주 지치게 하죠.",
    keywords: ["감수성", "직관", "온화", "소진"],
    status: "draft",
  },
};

export function dayMasterByStemIdx(stemIdx: number): DayMasterCharacter {
  const c = DAY_MASTER_CHARACTERS[stemIdx];
  if (!c) throw new Error(`일간 캐릭터 없음: stemIdx=${stemIdx}`);
  return c;
}
