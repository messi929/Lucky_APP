/**
 * 택일 모듈 (기획서 v1.2 §3, §7.4 SKU). 순수 계산, LLM 비용 0.
 * 목적 + 기간 → 해당 기간 일진 스캔 → 본인 일간·일지와의 관계(합·충·공망)로
 * "좋은 날 N + 피할 날" 산출. 결과 문구만 캐시 유닛.
 *
 * 규칙 감수 필요(§12.3): 택일 규칙 테이블은 사람이 감수.
 */

import { BRANCHES, STEMS, ganjiHangul } from "./constants.js";
import {
  dayGanziIndex,
  isBranchChung,
  isBranchSamhap,
  isBranchYukhap,
  isStemChung,
  isStemHap,
} from "./ganzi.js";
import type { SajuChart } from "./types.js";

export type TaekilPurpose = "move" | "open" | "contract" | "event";

const PURPOSE_KO: Record<TaekilPurpose, string> = {
  move: "이사",
  open: "개업",
  contract: "계약",
  event: "행사",
};

export interface TaekilDay {
  /** "YYYY-MM-DD" */
  date: string;
  ganziIndex: number;
  ganjiHangul: string;
  score: number;
  reasons: string[];
}

export interface TaekilResult {
  purpose: TaekilPurpose;
  purposeKo: string;
  goodDays: TaekilDay[];
  avoidDays: TaekilDay[];
  /** 스캔한 총 일수 */
  scannedDays: number;
}

export interface TaekilRequest {
  chart: SajuChart;
  purpose: TaekilPurpose;
  /** "YYYY-MM-DD" 포함 시작·끝 */
  startDate: string;
  endDate: string;
  /** 반환할 좋은 날 최대 개수 (기본 3) */
  goodLimit?: number;
}

const MAX_SCAN_DAYS = 366;

/** 택일 계산 */
export function computeTaekil(req: TaekilRequest): TaekilResult {
  const me = extractSelf(req.chart);
  const start = parseYmd(req.startDate);
  const end = parseYmd(req.endDate);
  const goodLimit = req.goodLimit ?? 3;

  const startMs = Date.UTC(start.y, start.m - 1, start.d);
  const endMs = Date.UTC(end.y, end.m - 1, end.d);
  if (endMs < startMs) throw new Error("종료일이 시작일보다 빠릅니다.");

  const days: TaekilDay[] = [];
  let scanned = 0;
  for (let ms = startMs; ms <= endMs && scanned < MAX_SCAN_DAYS; ms += 86_400_000, scanned++) {
    const dt = new Date(ms);
    const y = dt.getUTCFullYear();
    const m = dt.getUTCMonth() + 1;
    const d = dt.getUTCDate();
    const g = dayGanziIndex(y, m, d);
    const evalDay = scoreDay(g, me);
    days.push({
      date: `${y}-${pad(m)}-${pad(d)}`,
      ganziIndex: g,
      ganjiHangul: ganjiHangul(g),
      score: evalDay.score,
      reasons: evalDay.reasons,
    });
  }

  const goodDays = days
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.date.localeCompare(b.date))
    .slice(0, goodLimit);
  const avoidDays = days
    .filter((x) => x.score < 0)
    .sort((a, b) => a.score - b.score || a.date.localeCompare(b.date))
    .slice(0, goodLimit);

  return {
    purpose: req.purpose,
    purposeKo: PURPOSE_KO[req.purpose],
    goodDays,
    avoidDays,
    scannedDays: scanned,
  };
}

interface Self {
  stemIdx: number; // 일간
  branchIdx: number; // 일지
  gongmang: number[]; // 공망 지지 index
}

function extractSelf(chart: SajuChart): Self {
  const pd = chart.saju.pillarDetails.day;
  const gongmangHanja = chart.saju.gongmang.branches;
  const gongmang = gongmangHanja
    .map((h) => BRANCHES.findIndex((b) => b.hanja === h))
    .filter((i) => i >= 0);
  return { stemIdx: pd.stemIdx, branchIdx: pd.branchIdx, gongmang };
}

function scoreDay(ganzi: number, me: Self): { score: number; reasons: string[] } {
  const stem = ganzi % 10;
  const branch = ganzi % 12;
  let score = 0;
  const reasons: string[] = [];

  if (isStemHap(me.stemIdx, stem)) {
    score += 3;
    reasons.push(`일간과 ${STEMS[stem]!.hangul} 천간합 — 기운이 순조로움`);
  }
  if (isBranchSamhap(me.branchIdx, branch)) {
    score += 2;
    reasons.push(`일지와 삼합 — 일이 모임`);
  }
  if (isBranchYukhap(me.branchIdx, branch)) {
    score += 2;
    reasons.push(`일지와 육합 — 화합`);
  }
  if (me.gongmang.includes(branch)) {
    score -= 5;
    reasons.push(`공망일 — 결실이 비기 쉬움`);
  }
  if (isBranchChung(me.branchIdx, branch)) {
    score -= 4;
    reasons.push(`일지와 충 — 충돌·변동`);
  }
  if (isStemChung(me.stemIdx, stem)) {
    score -= 2;
    reasons.push(`일간과 극 — 마찰`);
  }
  return { score, reasons };
}

function parseYmd(s: string): { y: number; m: number; d: number } {
  const dm = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(s);
  if (!dm) throw new Error(`날짜 형식 오류(YYYY-MM-DD): ${s}`);
  return { y: Number(dm[1]), m: Number(dm[2]), d: Number(dm[3]) };
}

const pad = (n: number): string => String(n).padStart(2, "0");
