/**
 * 60갑자 산술 유틸 (일진 계산·간지 관계). 순수 함수.
 * 일주 앵커: ganziIndex = (JDN - 11) mod 60. 교차검증(1901-01-01=기묘, 2000-01-11=무진).
 * ssaju 일주와 일치 확인됨(tests A 회귀). 택일 등 날짜별 일진 스캔에 사용.
 */

/** 그레고리(proleptic) Y/M/D → 정오 기준 Julian Day Number(정수) */
export function gregorianToJDN(y: number, m: number, d: number): number {
  const a = Math.floor((14 - m) / 12);
  const yy = y + 4800 - a;
  const mm = m + 12 * a - 3;
  return (
    d +
    Math.floor((153 * mm + 2) / 5) +
    365 * yy +
    Math.floor(yy / 4) -
    Math.floor(yy / 100) +
    Math.floor(yy / 400) -
    32045
  );
}

const ANCHOR_JDN_MOD60 = 11;

/** 일주 60갑자 index (0=갑자) */
export function dayGanziIndex(y: number, m: number, d: number): number {
  const jdn = gregorianToJDN(y, m, d);
  return (((jdn - ANCHOR_JDN_MOD60) % 60) + 60) % 60;
}

// ── 간지 관계 규칙 (택일·궁합 공용) ──

/** 천간합(天干合): (a+5)%10==b — 甲己·乙庚·丙辛·丁壬·戊癸 */
export function isStemHap(a: number, b: number): boolean {
  return (a + 5) % 10 === b % 10;
}

/** 천간충(七沖): (a+6)%10==b — 甲庚·乙辛·丙壬·丁癸 계열 */
export function isStemChung(a: number, b: number): boolean {
  return (a + 6) % 10 === b % 10;
}

/** 지지육합(六合): 子丑·寅亥·卯戌·辰酉·巳申·午未 */
const YUKHAP: ReadonlyArray<readonly [number, number]> = [
  [0, 1],
  [2, 11],
  [3, 10],
  [4, 9],
  [5, 8],
  [6, 7],
];
export function isBranchYukhap(a: number, b: number): boolean {
  return YUKHAP.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
}

/** 지지삼합(三合): 申子辰(수)·寅午戌(화)·巳酉丑(금)·亥卯未(목) */
const SAMHAP: ReadonlyArray<readonly number[]> = [
  [8, 0, 4],
  [2, 6, 10],
  [5, 9, 1],
  [11, 3, 7],
];
export function isBranchSamhap(a: number, b: number): boolean {
  if (a === b) return false;
  return SAMHAP.some((g) => g.includes(a) && g.includes(b));
}

/** 지지충(沖): (a+6)%12==b — 子午·丑未·寅申·卯酉·辰戌·巳亥 */
export function isBranchChung(a: number, b: number): boolean {
  return (a + 6) % 12 === b % 12;
}
