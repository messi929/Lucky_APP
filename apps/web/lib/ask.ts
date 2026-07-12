import {
  applyGuardrails,
  computeSaju,
  PERSONA_CLASSIC,
  PERSONA_MZ,
  toLlmContext,
  type Mode,
  type SajuInput,
} from "@lucky/core";
import { generate } from "./generate";

/**
 * 복채 문답 (기획서 §4.2, §5 ⑤). 고민 한 줄 → 원국+흐름 기반 맞춤 답변.
 * 유료 전용, 캐시 없음, Sonnet급 풀 생성. 가드레일 L3(민감 상한)까지 검사.
 * 생년월일 원본 미전달(원칙 2) — toLlmContext만 사용.
 */
export async function buildAnswer(
  input: SajuInput,
  question: string,
  mode: Mode = "mz",
): Promise<{ answer: string; blocked: boolean }> {
  const chart = computeSaju(input);
  const system = mode === "classic" ? PERSONA_CLASSIC : PERSONA_MZ;
  const user = [
    toLlmContext(chart),
    "",
    "[사용자 질문]",
    question,
    "",
    "원국과 올해 흐름을 근거로 이 질문에 답해 주세요. 단정과 대처를 함께 3~4문장으로. 겁주지 말고 대처 위주로.",
  ].join("\n");

  const meta = { kind: "seasonal_fortune", tier: "paid" } as const;
  let answer = await generate({ system, user }, meta);
  if (!applyGuardrails(answer, 3).ok) {
    answer = await generate({ system, user }, meta);
    if (!applyGuardrails(answer, 3).ok) {
      return {
        answer: "지금은 한 템포 늦춰 살피기 좋은 시기예요. 무리한 결정만 피하면 흐름은 당신 편입니다.",
        blocked: true,
      };
    }
  }
  return { answer, blocked: false };
}
