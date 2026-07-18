/**
 * concern별 마무리 "꺾는 문장" (기획서 §4.3 화법 · 디자인 §불변 1 "주홍은 꺾는 문장에만").
 *
 * 세션 마무리 화면에서 주홍(vermil)으로 렌더되는 단 한 줄. 진단문 재사용이 아니라
 * concern마다 authored 카피 — 상담을 한 문장으로 매듭짓는 임팩트.
 *
 * ⚠️ 카피는 사람이 최종 확정(§13.4). 여기 초안은 status="draft".
 * 화법(§4.3): 다독인 뒤 한 번 꺾는 단정 한 줄. 공포 소구 금지(§4.4).
 * guardrail: level 2(관망 언어)·3(민감)은 단정·불안 자극 금지 — 아래 카피는 그 선을 지킴.
 */

import type { ConcernId } from "./concerns.js";

export interface Pivot {
  /** 주홍으로 렌더될 마무리 한 줄 */
  line: string;
  status: "draft" | "final";
}

/**
 * concern → 꺾는 문장. 미작성 concern은 맵에 없음 → pivotFor가 null 반환(클라이언트가 진단문 fallback).
 * 화법: "~한 게 아니라 ~" / "이제 ~할 때" 처럼 다독인 뒤 방향을 트는 구조.
 */
export const PIVOTS: Partial<Record<ConcernId, Pivot>> = {
  love_dating: {
    line: "당신은 밀당을 못 하는 게 아니라, 안 하는 사람이에요. 그 솔직함을 알아보는 사람이 결국 남아요.",
    status: "draft",
  },
  marriage_timing: {
    line: "조급한 건 마음이지 때가 아니에요. 당신의 인연은 늦는 게 아니라, 제 속도로 오는 중이에요.",
    status: "draft",
  },
  marital: {
    line: "맞춰주다 지친 쪽은 늘 당신이었죠. 이제 참는 대신, 말하는 법을 익힐 때예요.",
    status: "draft",
  },
  relationship: {
    line: "모두에게 좋은 사람일 필요 없어요. 당신을 아는 몇 명이면, 그걸로 충분한 사람이에요.",
    status: "draft",
  },
  career_path: {
    line: "남들 가는 길이 불안한 게 아니라, 그게 당신 길이 아니라서 그래요. 당신은 당신 방식으로 도착해요.",
    status: "draft",
  },
  job: {
    line: "지금 자리가 답답한 건 능력이 남아서예요. 움직일 때를 아는 것도 실력이에요.",
    status: "draft",
  },
  business: {
    line: "벌이는 담대함은 있는데, 지키는 신중함이 한 발 늦죠. 이번엔 서두르지 말고 먼저 살펴봐요.",
    status: "draft",
  },
  retirement_finance: {
    line: "쌓아온 게 적지 않아요. 이제는 불리기보다, 지키고 누리는 쪽으로 마음을 돌릴 때예요.",
    status: "draft",
  },
  money_timing: {
    line: "돈이 안 모이는 게 아니라, 나가는 때를 몰랐던 거예요. 열리고 닫히는 때를 알면 흐름이 바뀌어요.",
    status: "draft",
  },
  real_estate: {
    line: "서두른 결정이 늘 마음에 걸렸죠. 이번엔 좋은 자리보다 좋은 때를 먼저 봐요.",
    status: "draft",
  },
  stability: {
    line: "비우는 건 잃는 게 아니에요. 당신은 지금, 덜어낼수록 단단해지는 시기예요.",
    status: "draft",
  },
  parent_worry: {
    line: "당신이 짊어진 걱정, 부모님은 이미 아세요. 자주 안부를 묻는 것만으로 충분히 곁이에요.",
    status: "draft",
  },
  child_fortune: {
    line: "그 아이는 당신 걱정보다 훨씬 단단해요. 믿고 기다려주는 게, 지금 할 수 있는 가장 큰 응원이에요.",
    status: "draft",
  },
  descendants: {
    line: "내리사랑은 돌려받는 게 아니라 흘려보내는 거죠. 당신 곁의 온기는 이미 넉넉해요.",
    status: "draft",
  },
  exam: {
    line: "운이 아니라 준비가 당신을 데려가요. 흔들리지 말고, 해온 만큼만 믿어요.",
    status: "draft",
  },
  contract_timing: {
    line: "결정을 못 하는 게 아니라, 확신이 올 때를 기다리는 사람이에요. 그 때는 곧 와요 — 서두르지 말아요.",
    status: "draft",
  },
  taekil: {
    line: "좋은 날은 이미 정해져 있어요. 서두른 하루보다, 고른 하루가 당신을 지켜줘요.",
    status: "draft",
  },
  health_year: {
    line: "몸이 보내는 신호는 경고가 아니라, 쉬어가라는 안내예요. 올해는 당신을 조금 더 아껴줘요.",
    status: "draft",
  },
};

/** concern → 꺾는 문장 (미작성이면 null → 클라이언트가 진단문 fallback) */
export function pivotFor(concern: ConcernId): string | null {
  return PIVOTS[concern]?.line ?? null;
}

/** 카피 작성 진척 (운영 지표) */
export function pivotProgress(): { total: number; written: number } {
  const written = Object.keys(PIVOTS).length;
  return { total: 18, written };
}
