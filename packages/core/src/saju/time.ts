/**
 * 시간 처리 — KST 표준시, 서머타임, 진태양시 변환.
 *
 * 모델(기획서 §3.2):
 *  - 표준 자오선 135°E (KST = UTC+9) 고정.
 *  - 서머타임(1948–51, 1955–60, 1987–88): 해당 구간 벽시계는 UTC+10 → 표준시로 환산 시 -1h.
 *  - 진태양시 = 표준시(DST 제거) + 경도보정((lon-135)×4분). 균시차는 v1 생략(§3.2 #5).
 *
 * 주의(교차검증 대상): 1954-08-10~1961-08-09 한국이 UTC+8:30(127.5°E) 표준시를 쓰던 시기는
 *  본 모델(135 고정)과 다르다. 해당 시기 출생은 만세력 대조 시 별도 확인 필요(§3.3 교차검증 게이트).
 */

const HOUR = 3_600_000;
const MIN = 60_000;

/** 서머타임 구간 — KST 벽시계 기준. Date.UTC 순서값으로 비교(프레임 일관성만 필요). */
interface DstPeriod {
  start: number;
  end: number;
}

function wallOrder(y: number, mo: number, d: number, h = 0, mi = 0): number {
  return Date.UTC(y, mo - 1, d, h, mi);
}

const DST_PERIODS: readonly DstPeriod[] = [
  { start: wallOrder(1948, 6, 1), end: wallOrder(1948, 9, 13) },
  { start: wallOrder(1949, 4, 3), end: wallOrder(1949, 9, 11) },
  { start: wallOrder(1950, 4, 1), end: wallOrder(1950, 9, 10) },
  { start: wallOrder(1951, 5, 6), end: wallOrder(1951, 9, 9) },
  { start: wallOrder(1955, 5, 5), end: wallOrder(1955, 9, 9) },
  { start: wallOrder(1956, 5, 20), end: wallOrder(1956, 9, 30) },
  { start: wallOrder(1957, 5, 5), end: wallOrder(1957, 9, 22) },
  { start: wallOrder(1958, 5, 4), end: wallOrder(1958, 9, 21) },
  { start: wallOrder(1959, 5, 3), end: wallOrder(1959, 9, 20) },
  { start: wallOrder(1960, 5, 1), end: wallOrder(1960, 9, 18) },
  { start: wallOrder(1987, 5, 10, 2), end: wallOrder(1987, 10, 11, 3) },
  { start: wallOrder(1988, 5, 8, 2), end: wallOrder(1988, 10, 9, 3) },
];

/** 벽시계(KST) 시각이 서머타임 구간에 속하는가 */
export function isDst(y: number, mo: number, d: number, h: number, mi: number): boolean {
  const t = wallOrder(y, mo, d, h, mi);
  return DST_PERIODS.some((p) => t >= p.start && t < p.end);
}

/**
 * 표준시 변경기: 1954-08-10 ~ 1961-08-09 한국 표준자오선이 127.5°E(UTC+8:30)였던 기간.
 * 이 기간엔 표준시가 이미 127.5°E 기준이라 진태양시(LMT, 135°E 기준) 보정을 적용하면
 * -32분 이중 보정이 발생 → corrections.ts에서 LMT 비활성.
 * (VERIFICATION-REPORT §어댑터 3)
 */
const STD_ERA_START = wallOrder(1954, 8, 10);
const STD_ERA_END = wallOrder(1961, 8, 10);

export function isStandardTimeEra(y: number, mo: number, d: number): boolean {
  const t = wallOrder(y, mo, d);
  return t >= STD_ERA_START && t < STD_ERA_END;
}

/** DST 벽시계 → 표준시 벽시계 (-1시간, 날짜 롤백 처리) */
export function stripDst(w: WallClock): WallClock {
  const ms = Date.UTC(w.y, w.mo - 1, w.d, w.h, w.mi) - HOUR;
  const dt = new Date(ms);
  return {
    y: dt.getUTCFullYear(),
    mo: dt.getUTCMonth() + 1,
    d: dt.getUTCDate(),
    h: dt.getUTCHours(),
    mi: dt.getUTCMinutes(),
  };
}

export interface WallClock {
  y: number;
  mo: number; // 1-12
  d: number;
  h: number;
  mi: number;
}

/** 실제 물리 순간(UTC ms). 연/월주 절기 비교용. */
export function toBirthUtcMs(w: WallClock, dst: boolean): number {
  const base = Date.UTC(w.y, w.mo - 1, w.d, w.h, w.mi);
  return base - (dst ? 10 : 9) * HOUR;
}

/**
 * 진태양시 벽시계 ms (UTC 필드로 읽으면 진태양시 Y/M/D/H/M).
 * = 표준시(DST 제거) + 경도보정. 일/시주 판정용.
 */
export function toTrueSolarMs(w: WallClock, dst: boolean, correctionMin: number): number {
  const base = Date.UTC(w.y, w.mo - 1, w.d, w.h, w.mi);
  return base - (dst ? 1 : 0) * HOUR + correctionMin * MIN;
}

/** "YYYY-MM-DD" + "HH:mm" → WallClock */
export function parseWallClock(dateStr: string, timeStr: string | undefined): WallClock {
  const dm = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(dateStr);
  if (!dm) throw new Error(`birthDate 형식 오류(YYYY-MM-DD): ${dateStr}`);
  const y = Number(dm[1]);
  const mo = Number(dm[2]);
  const d = Number(dm[3]);
  let h = 12; // 시 모름 시 정오 고정(폴백에서 시주는 버림)
  let mi = 0;
  if (timeStr) {
    const tm = /^(\d{1,2}):(\d{1,2})$/.exec(timeStr);
    if (!tm) throw new Error(`birthTime 형식 오류(HH:mm): ${timeStr}`);
    h = Number(tm[1]);
    mi = Number(tm[2]);
  }
  return { y, mo, d, h, mi };
}
