import { computeSaju, dailyLine, type DailyLine, type SajuInput } from "@lucky/core";

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
