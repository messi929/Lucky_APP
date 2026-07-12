/**
 * 일주 60종 단정형 훅 (기획서 §6 카드1, §4.2 "정적, 사람이 직접 작성 — 최우선 카피 작업").
 *
 * ⚠️ 카피는 사람이 채운다. 여기서는 60갑자 전 항목의 구조만 생성하고 TODO로 표기.
 *    OVERRIDES에 사람이 확정 카피를 채워 넣는다(주당 15종 × 4주 계획, §13.4).
 * 화법(§4.3): "어떻게 알았지" 순간을 만드는 단정 한 줄. 공포 소구 금지(§4.4).
 */

import { BRANCHES, STEMS } from "../saju/constants.js";

export interface IljuHook {
  /** 일주 간지(한자) — ssaju pillars.day와 일치 (예: "甲子") */
  ganji: string;
  ganjiHangul: string;
  /** 단정형 훅 한 줄. status가 todo면 null */
  hook: string | null;
  status: "todo" | "draft" | "final";
}

/** 사람이 확정한 카피만 여기에 채운다 (나머지는 자동 TODO) */
const OVERRIDES: Record<string, { hook: string; status: "draft" | "final" }> = {
  甲子: {
    hook: "머리는 늘 앞서가는데, 마음이 그 속도를 못 따라와서 혼자 조급하죠.",
    status: "draft",
  },
  丙午: {
    hook: "타오를 땐 누구보다 뜨거운데, 식고 나면 그만큼 차갑다는 말 들어봤을 거예요.",
    status: "draft",
  },
  庚辰: {
    hook: "겉은 단단해 보여도, 정작 당신을 지켜주는 사람은 없다고 느낄 때가 많죠.",
    status: "draft",
  },
};

/** 60갑자 전체 훅 맵 (미작성분은 status=todo, hook=null) */
export const ILJU_HOOKS: Record<string, IljuHook> = buildIljuHooks();

function buildIljuHooks(): Record<string, IljuHook> {
  const map: Record<string, IljuHook> = {};
  for (let i = 0; i < 60; i++) {
    const stem = STEMS[i % 10]!;
    const branch = BRANCHES[i % 12]!;
    const ganji = stem.hanja + branch.hanja;
    const ganjiHangul = stem.hangul + branch.hangul;
    const override = OVERRIDES[ganji];
    map[ganji] = override
      ? { ganji, ganjiHangul, hook: override.hook, status: override.status }
      : { ganji, ganjiHangul, hook: null, status: "todo" };
  }
  return map;
}

export function iljuHook(ganjiHanja: string): IljuHook {
  const h = ILJU_HOOKS[ganjiHanja];
  if (!h) throw new Error(`일주 훅 항목 없음: ${ganjiHanja}`);
  return h;
}

/** 카피 작성 진척 (운영 지표) */
export function iljuHookProgress(): { total: number; written: number; todo: number } {
  const all = Object.values(ILJU_HOOKS);
  const written = all.filter((h) => h.status !== "todo").length;
  return { total: all.length, written, todo: all.length - written };
}
