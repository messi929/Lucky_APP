import {
  computeSaju,
  concernById,
  concernsForAge,
  dailyLine,
  type ConcernId,
  type DailyLine,
  type SajuInput,
} from "@lucky/core";

/** KST 기준 오늘 날짜 (서버 TZ 무관) */
export function kstToday(now = new Date()): { y: number; m: number; d: number } {
  const kst = new Date(now.getTime() + 9 * 3_600_000);
  return { y: kst.getUTCFullYear(), m: kst.getUTCMonth() + 1, d: kst.getUTCDate() };
}

/** 출생 입력 → 오늘의 한 줄 (내 일간 기준). 앱 데일리 푸시 배치도 이 계약 재사용. */
export function dailyFor(input: SajuInput): DailyLine {
  const chart = computeSaju(input);
  const { y, m, d } = kstToday();
  return dailyLine(chart.saju.pillarDetails.day.stemIdx, y, m, d);
}

/** 오늘의 십신 → 어울리는 상담 주제 (연령대 가용 주제 우선순위 매칭, 폴백=가중치 1위). 데일리→단건 퍼널. */
const TEN_GOD_CONCERN: Record<string, ConcernId[]> = {
  비견: ["relationship", "love_dating"],
  겁재: ["money_timing", "relationship"],
  식신: ["career_path", "love_dating"],
  상관: ["relationship", "career_path"],
  편재: ["money_timing", "business"],
  정재: ["money_timing", "retirement_finance"],
  편관: ["job", "career_path"],
  정관: ["career_path", "job"],
  편인: ["stability", "health_year"],
  정인: ["stability", "exam"],
};

/** 오늘의 한 줄과 결이 맞는 상담 주제 1개 (없으면 null). */
export function dailyConcernFor(tenGod: string, age: number): { id: ConcernId; label: string } | null {
  const available = concernsForAge(age, 20);
  if (available.length === 0) return null;
  const availIds = new Set<ConcernId>(available.map((c) => c.id));
  const pref = TEN_GOD_CONCERN[tenGod] ?? [];
  const pickId = pref.find((id) => availIds.has(id)) ?? available[0].id;
  const c = concernById(pickId);
  return { id: c.id, label: c.label };
}
