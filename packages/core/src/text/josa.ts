/**
 * 한글 조사 선택 (받침 판정). 순수 함수 — 데이터·I/O 없음.
 *
 * 문장을 코드로 조립하는 곳이면 어디서든 필요하다. season.ts 안에 사적으로 갇혀 있던 탓에
 * compat 헤드라인이 "부부**으로** 잘 맞는 편이에요"처럼 조사를 하드코딩했고, 받침 없는
 * 관계명("친구", "연인")에서 그대로 어긋났다(사용성 테스트 2026-08-08 G14).
 */

const HANGUL_FIRST = 0xac00;
const HANGUL_LAST = 0xd7a3;
const JONG_COUNT = 28;

/** 마지막 글자의 종성 인덱스. 한글 음절이 아니면 null */
function finalJong(word: string): number | null {
  if (!word) return null;
  const code = word.charCodeAt(word.length - 1);
  if (code < HANGUL_FIRST || code > HANGUL_LAST) return null;
  return (code - HANGUL_FIRST) % JONG_COUNT;
}

/** 한글 마지막 글자에 받침이 있는가 */
export function hasFinalConsonant(word: string): boolean {
  const jong = finalJong(word);
  return jong !== null && jong !== 0;
}

/** 으로/로 — 받침 없음 또는 ㄹ받침(종성 8)이면 '로' */
export function euroRo(word: string): string {
  const jong = finalJong(word);
  if (jong === null) return "로";
  return jong === 0 || jong === 8 ? "로" : "으로";
}

/** 이/가 */
export function iGa(word: string): string {
  return hasFinalConsonant(word) ? "이" : "가";
}

/** 은/는 */
export function eunNeun(word: string): string {
  return hasFinalConsonant(word) ? "은" : "는";
}

/** 을/를 */
export function eulReul(word: string): string {
  return hasFinalConsonant(word) ? "을" : "를";
}

/** 과/와 */
export function gwaWa(word: string): string {
  return hasFinalConsonant(word) ? "과" : "와";
}
