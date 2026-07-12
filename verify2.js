const { calculateSaju } = require('ssaju');
const { Solar } = require('lunar-javascript');

const STEMS = '甲乙丙丁戊己庚辛壬癸';
const BRANCHES = '子丑寅卯辰巳午未申酉戌亥';
function dayPillarByAnchor(y, m, d) {
  const days = Math.round((Date.UTC(y, m - 1, d) - Date.UTC(1900, 0, 1)) / 86400000);
  const idx = ((10 + days) % 60 + 60) % 60;
  return STEMS[idx % 10] + BRANCHES[idx % 12];
}
function lunarJsAt(y, m, d, h, mi, shiftHours = 0) {
  let date = new Date(Date.UTC(y, m - 1, d, h, mi) + shiftHours * 3600000);
  const s = Solar.fromYmdHms(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate(),
    date.getUTCHours(), date.getUTCMinutes(), 0);
  const ec = s.getLunar().getEightChar();
  ec.setSect(2);
  return { year: ec.getYear(), month: ec.getMonth(), day: ec.getDay(), hour: ec.getTime() };
}
function sj(y, m, d, h, mi, opts = {}) {
  const r = calculateSaju({ year: y, month: m, day: d, hour: h, minute: mi, gender: '남',
    applyLocalMeanTime: false, timezone: 'Asia/Seoul', ...opts });
  return r.pillars;
}

const CASES = [
  ['평범-1990s', 1990, 5, 15, 14, 30], ['평범-README', 2001, 11, 3, 14, 20],
  ['평범-1975', 1975, 9, 23, 10, 0], ['평범-2010', 2010, 3, 8, 21, 15],
  ['평범-1962', 1962, 12, 25, 6, 40],
  ['입춘경계-1990직전', 1990, 2, 4, 5, 0], ['입춘경계-1990직후', 1990, 2, 4, 15, 0],
  ['입춘경계-2000직전', 2000, 2, 4, 10, 0], ['입춘경계-2000직후', 2000, 2, 4, 22, 0],
  ['절기경계-입동전', 2001, 11, 7, 6, 0], ['절기경계-입동후', 2001, 11, 7, 20, 0],
  ['자시-2330', 1995, 8, 10, 23, 30], ['자시-0030', 1995, 8, 11, 0, 30],
];

console.log('══ 1) 연·월주 비교 (lunar-js는 KST→CST -1h: 절기시각 기준 통일) / 일·시주 비교 (원시각) ══');
let fails = 0;
for (const [desc, y, m, d, h, mi] of CASES) {
  const p = sj(y, m, d, h, mi);
  const ljYM = lunarJsAt(y, m, d, h, mi, -1);   // 절기 경계용
  const ljDH = lunarJsAt(y, m, d, h, mi, 0);    // 일·시주용 (동일 벽시계)
  const anchor = dayPillarByAnchor(y, m, d);
  const ymOK = p.year === ljYM.year && p.month === ljYM.month;
  const dOK = p.day === ljDH.day;
  const hOK = p.hour === ljDH.hour;
  const flag = ymOK && dOK && hOK ? 'OK' : '★확인';
  if (flag !== 'OK') fails++;
  console.log(`${desc}: ssaju[${p.year} ${p.month} ${p.day} ${p.hour}] YM:${ymOK ? 'ok' : '≠' + ljYM.year + ljYM.month} D:${dOK ? 'ok' : '≠' + ljDH.day} H:${hOK ? 'ok' : '≠' + ljDH.hour} 앵커:${p.day === anchor || desc.startsWith('자시-2330') ? 'ok' : '≠' + anchor} ${flag}`);
}
console.log('연월일시 불일치:', fails);

console.log('\n══ 2) 서머타임 실제 보정 여부 (시지가 갈리는 시각으로 판정) ══');
// 1988-07-15 15:30 (DST 벽시계) → 표준시 14:30. DST 보정하면 未시, 안 하면 申시
const dst1 = sj(1988, 7, 15, 15, 30);
console.log('1988-07-15 15:30 →', dst1.hour, '| 未=보정함 / 申=보정안함');
const dst2 = sj(1957, 6, 20, 15, 30);
console.log('1957-06-20 15:30 →', dst2.hour, '| 未=보정함 / 申=보정안함');
// 비교: DST 아닌 해 같은 시각
const nodst = sj(1990, 7, 15, 15, 30);
console.log('1990-07-15 15:30 (DST아님) →', nodst.hour, '| 申이 정상');

console.log('\n══ 3) 진태양시 보정 (서울, applyLocalMeanTime) ══');
const r1 = calculateSaju({ year: 1990, month: 5, day: 15, hour: 14, minute: 30, gender: '남',
  applyLocalMeanTime: true, longitude: 126.9784 });
console.log('1990-05-15 14:30 서울, LMT적용 → 시주:', r1.pillars.hour, '(manseryeok-js 주장: 보정 13:58 → 未시 유지)');
// 시지 경계가 갈리는 케이스: 15:10 서울 → -32분 → 14:38 → 申→未 로 바뀌어야 보정 작동
const r2 = calculateSaju({ year: 1990, month: 5, day: 15, hour: 15, minute: 10, gender: '남',
  applyLocalMeanTime: true, longitude: 126.9784 });
const r2n = sj(1990, 5, 15, 15, 10);
console.log('1990-05-15 15:10 서울: LMT적용', r2.pillars.hour, '/ 미적용', r2n.hour, '| 적용시 未로 바뀌면 정상');

console.log('\n══ 4) 절입 "시각" 정밀도: 1990 입춘 절입시각 근방 스캔 ══');
for (const [h, mi] of [[9, 0], [10, 0], [10, 15], [10, 30], [11, 0], [12, 0]]) {
  const p = sj(1990, 2, 4, h, mi);
  const lj = lunarJsAt(1990, 2, 4, h, mi, -1);
  console.log(`1990-02-04 ${String(h).padStart(2,'0')}:${String(mi).padStart(2,'0')} → ssaju 연주:${p.year} 월주:${p.month} | lunar-js 연주:${lj.year} 월주:${lj.month}`);
}
