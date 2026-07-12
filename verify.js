// 교차검증: ssaju vs lunar-javascript vs 독립 일주 산술
const { calculateSaju } = require('ssaju');
const { Solar } = require('lunar-javascript');

// ── 독립 일주 계산 (60갑자 앵커 산술: 1900-01-01 = 甲戌 = index 10)
const STEMS = '甲乙丙丁戊己庚辛壬癸';
const BRANCHES = '子丑寅卯辰巳午未申酉戌亥';
function dayPillarByAnchor(y, m, d) {
  const anchor = Date.UTC(1900, 0, 1);
  const target = Date.UTC(y, m - 1, d);
  const days = Math.round((target - anchor) / 86400000);
  const idx = ((10 + days) % 60 + 60) % 60;
  return STEMS[idx % 10] + BRANCHES[idx % 12];
}

// ── lunar-javascript (중국 표준시 UTC+8 기준 절기 → KST 입력은 -1h 변환해 비교)
function lunarJs(y, m, d, h, mi, kst2cst = true) {
  let date = new Date(Date.UTC(y, m - 1, d, h, mi));
  if (kst2cst) date = new Date(date.getTime() - 3600000); // KST → CST
  const s = Solar.fromYmdHms(
    date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate(),
    date.getUTCHours(), date.getUTCMinutes(), 0
  );
  const ec = s.getLunar().getEightChar();
  ec.setSect(2); // 자정 기준 일주 변경 (조자시설) — 기획서 v1.1 기본과 동일
  return { year: ec.getYear(), month: ec.getMonth(), day: ec.getDay(), hour: ec.getTime() };
}

// ── ssaju (보정 없음 모드: 순수 KST 입력 비교)
function ssajuRaw(y, m, d, h, mi) {
  const r = calculateSaju({ year: y, month: m, day: d, hour: h, minute: mi,
    gender: '남', applyLocalMeanTime: false, timezone: 'Asia/Seoul' });
  const p = r.pillars;
  const cn = (x) => (x.hanja || x.cn || x); // 구조 대응
  return {
    year: p.year.hanja ?? p.year, month: p.month.hanja ?? p.month,
    day: p.day.hanja ?? p.day, hour: p.hour.hanja ?? p.hour, raw: p
  };
}

// ── 테스트 케이스 (경계 케이스 중심)
const CASES = [
  // [설명, y, m, d, h, mi]
  ['평범-1990s', 1990, 5, 15, 14, 30],
  ['평범-README', 2001, 11, 3, 14, 20],
  ['평범-1975', 1975, 9, 23, 10, 0],
  ['평범-2010', 2010, 3, 8, 21, 15],
  ['평범-1962', 1962, 12, 25, 6, 40],
  ['입춘경계-직전', 1990, 2, 4, 5, 0],   // 1990 입춘 절입 전후
  ['입춘경계-직후', 1990, 2, 4, 15, 0],
  ['입춘경계-2000직전', 2000, 2, 4, 10, 0],
  ['입춘경계-2000직후', 2000, 2, 4, 22, 0],
  ['절기경계-입동전', 2001, 11, 7, 6, 0],  // 월주 갈림 확인
  ['절기경계-입동후', 2001, 11, 7, 20, 0],
  ['자시-2330', 1995, 8, 10, 23, 30],
  ['자시-0030', 1995, 8, 11, 0, 30],
  ['자시-0100직전', 1995, 8, 11, 0, 59],
  ['서머타임-1988', 1988, 7, 15, 14, 0],  // 한국 DST 기간
  ['서머타임-1957', 1957, 6, 20, 10, 0],
];

console.log('설명 | ssaju(원국) | lunar-js(KST→CST) | 앵커일주 | 일치?');
console.log('-'.repeat(100));
let mismatches = [];
for (const [desc, y, m, d, h, mi] of CASES) {
  let sj, lj;
  try { sj = ssajuRaw(y, m, d, h, mi); } catch (e) { sj = { err: e.message }; }
  try { lj = lunarJs(y, m, d, h, mi); } catch (e) { lj = { err: e.message }; }
  const anchor = dayPillarByAnchor(y, m, d);
  const sjStr = sj.err ? 'ERR:' + sj.err : `${sj.year} ${sj.month} ${sj.day} ${sj.hour}`;
  const ljStr = lj.err ? 'ERR:' + lj.err : `${lj.year} ${lj.month} ${lj.day} ${lj.hour}`;
  const match = !sj.err && !lj.err &&
    sj.year === lj.year && sj.month === lj.month && sj.day === lj.day && sj.hour === lj.hour;
  if (!match) mismatches.push({ desc, y, m, d, h, mi, sj: sjStr, lj: ljStr, anchor });
  console.log(`${desc} | ${sjStr} | ${ljStr} | ${anchor} | ${match ? 'OK' : '★불일치'}`);
}
console.log('\n불일치 건수:', mismatches.length);
if (mismatches.length) console.log(JSON.stringify(mismatches, null, 1));
