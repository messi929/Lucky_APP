/**
 * 생성물 정리·품질 판정 (사용성 테스트 2026-08-08 G14).
 * 순수 함수 — LLM/캐시 호출 없음(원칙 1).
 *
 * 두 가지를 구분해서 다룬다.
 *  1) **결정적으로 고칠 수 있는 것** → 고친다. 마크다운 잔재·따옴표 감싸기·공백.
 *     프롬프트가 "머리말·따옴표 없이"라고 지시해도 모델은 종종 `**강조**`를 섞는다.
 *  2) **뜻을 추측해야 하는 것** → 고치지 않고 반려한다. 잘린 문장, 깨진 음절.
 *     "믄고 지켜보는"을 '믿고'로 고칠지 '묻고'로 고칠지는 코드가 알 수 없다.
 *     잘못 고치면 원문보다 나쁘므로 재생성에 맡긴다.
 */

/** 관측된 깨진 음절 (재생성 트리거용). 고치지 않고 신호로만 쓴다. */
const CORRUPT_SYLLABLES = ["쯯", "쯐", "쯔음", "믄고", "쯤음"];

/** 문장 종결로 인정하는 끝문자 */
const TERMINATORS = /[.!?…"'」』\)\]]$/;

/**
 * 마크다운·따옴표 잔재 제거. 의미를 바꾸지 않는 변환만 한다.
 * 강조(**·__·`)는 우리 화면에서 렌더되지 않아 사용자에게 기호 그대로 노출됐다.
 */
export function stripMarkdown(raw: string): string {
  let t = raw.trim();
  // 코드펜스 → 내용만
  t = t.replace(/```[a-z]*\n?/gi, "");
  // 강조 기호 (짝이 맞지 않아도 제거 — 반쪽만 남은 경우가 실제로 나온다)
  t = t.replace(/\*\*/g, "").replace(/__/g, "").replace(/`/g, "");
  // 줄머리 마크다운(제목·인용·목록)
  t = t.replace(/^\s{0,3}#{1,6}\s*/gm, "").replace(/^\s{0,3}>\s?/gm, "");
  t = t.replace(/^\s{0,3}[-*+]\s+/gm, "");
  // 전체를 감싼 따옴표 (프롬프트가 금지해도 종종 붙는다)
  t = t.trim();
  const wrapped = /^["'“”‘’「『](.*)["'“”‘’」』]$/s.exec(t);
  if (wrapped?.[1]) t = wrapped[1].trim();
  // 공백 정리 — 줄바꿈은 문단 하나로, 나머지 연속 공백은 하나로
  t = t.replace(/[ \t]+/g, " ").replace(/\n{2,}/g, "\n").trim();
  return t;
}

export type QualityIssue = "truncated" | "corrupt" | "empty";

/**
 * 재생성으로만 해결되는 결함 판정. 정상이면 null.
 *
 * `truncated` — max_tokens에 걸려 문장 중간에서 끊긴 경우. 종결부호 없이 끝나거나
 * 조사·연결어미로 끝난다("…정리하는 게", "…나무 기운을 가까").
 */
export function qualityIssue(text: string): QualityIssue | null {
  const t = text.trim();
  if (t.length === 0) return "empty";
  if (CORRUPT_SYLLABLES.some((s) => t.includes(s))) return "corrupt";
  if (!TERMINATORS.test(t)) return "truncated";
  return null;
}
