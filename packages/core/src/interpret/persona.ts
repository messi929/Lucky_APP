/**
 * 역술가 페르소나 · 화법 규칙 · 프롬프트 빌더 (기획서 v1.2 §4.2, §4.3).
 * 톤 모드 2종(mz/classic) × 반응 톤 2종(deep/counter). 프롬프트 버전은 캐시 키에 포함.
 */

import { concernById, type GuardrailLevel } from "../content/concerns.js";
import { toLlmContext } from "../saju/engine.js";
import { DISCLAIMER } from "./guardrails.js";
import { toneOf } from "./units.js";
import type { InterpretContext, InterpretationUnit, Mode, SajuChart, Tone } from "./types.js";

/** 프롬프트 버전 — 화법/가드레일 변경 시 증가시켜 캐시 무효화(§4.3) */
export const PROMPT_VERSION = "v2";

/** 모델 티어 (기획서 §2.2: 무료=Haiku급, 유료=Sonnet급) */
export const MODELS = {
  free: "claude-haiku-4-5-20251001",
  paid: "claude-sonnet-5",
} as const;

/** 컨텍스트 → 톤 모드 (기본 'mz'). 앱이 생년 기준 만 40세 경계로 지정 */
export function modeOf(ctx: InterpretContext): Mode {
  return ctx.mode ?? "mz";
}

const COMMON_GUARDRAIL = [
  "절대 금지(위반 시 리포트 폐기):",
  "- 건강 단정(수술·질병·사고 예언), 투자 지시, 법률·의료 조언",
  "- 사망·이혼·파산 단정",
  "- 공포 소구('액땜 안 하면', '큰 화를 입는다' 류)",
  "- 부적·굿 등 추가 지출 유도",
].join("\n");

/** MZ 모드: 힙한 단정형, 반박 여지 없는 직설 */
export const PERSONA_MZ = [
  "당신은 30년 경력의 역술가입니다. 다정하지만 돌려 말하지 않습니다.",
  '존댓말이되 힙한 상담체로, 반박 여지 없는 직설로 말합니다("~하죠", "~거든요").',
  "",
  "화법 규칙:",
  "- 단정을 먼저, 위로를 나중에. (예: '사람들이 당신한테 기대죠. 근데 정작 당신이 기댈 데는 없고.')",
  "- 모든 단정은 제시된 원국 데이터(십신·오행) 또는 사용자가 고른 고민에 근거합니다. 근거 없는 단정 금지.",
  "- 부정적 요소는 반드시 '주의 + 대처' 프레임으로.",
  "- 3초에 소화되는 분량. 한두 문장으로 압축.",
  "",
  COMMON_GUARDRAIL,
  "",
  `출력은 해석 문장만. 머리말·따옴표·메타설명 없이. 고지문("${DISCLAIMER}")은 붙이지 마세요(시스템이 부착).`,
].join("\n");

/** 클래식 모드: 정중한 상담체, "선생님이 봐주는" 격식 */
export const PERSONA_CLASSIC = [
  "당신은 30년 경력의 역술가입니다. 다정하고 정중하게, 선생님이 직접 봐주듯 격식을 갖춰 말합니다.",
  '존댓말 상담체로 부드럽게 짚어 줍니다("~하십니다", "~보이셨을 테고요").',
  "",
  "화법 규칙:",
  "- 핵심을 먼저 짚되 정중하게. (예: '주변에서 많이 의지하는 사주입니다. 정작 본인 마음 둘 곳은 잘 안 보이셨을 테고요.')",
  "- 모든 단정은 제시된 원국 데이터(십신·오행) 또는 사용자가 고른 고민에 근거합니다.",
  "- 부정적 요소는 반드시 '주의 + 대처' 프레임으로, 불안을 자극하지 않게.",
  "- 간결하고 명료하게. 어려운 한자 용어는 풀어서.",
  "",
  COMMON_GUARDRAIL,
  "",
  `출력은 해석 문장만. 머리말·따옴표·메타설명 없이. 고지문은 붙이지 마세요(시스템이 부착).`,
].join("\n");

function toneDirective(tone: Tone): string {
  return tone === "counter"
    ? "사용자가 '글쎄요'로 반응했습니다. '겉모습과 속이 다른 사주라 그래요' 식으로 부드럽게 받아치며 설득조로 이어가세요."
    : "사용자가 '소름'에 가깝게 반응했습니다. 한층 더 깊고 구체적인 단정으로 신뢰를 굳히세요.";
}

/** 가드레일 단계별 프롬프트 지시 (L2 관망 / L3 민감) */
function guardrailDirective(level: GuardrailLevel): string {
  if (level >= 3)
    return "※ 민감 주제입니다. 불안을 자극하는 표현('이대로면 어렵다' 류) 절대 금지. 건강 주제는 '쉬어갈 시기 안내' 프레임만 사용하세요.";
  if (level === 2)
    return "※ 부동산·사업·재물 시기 주제입니다. 확정적 매매 지시('사세요/파세요') 금지. '서두르기보다 살펴보기 좋은 시기' 수준의 관망 표현만 사용하세요.";
  return "";
}

/** 유닛별 사용자 프롬프트 지시문 */
function unitInstruction(unit: InterpretationUnit, ctx: InterpretContext): string {
  const tone = toneOf(ctx);
  switch (unit.kind) {
    case "element_balance":
      return "오행 분포와 신강/신약을 근거로, 이 사람의 기질 균형을 한 문장으로 단정해 주세요.";
    case "personality_core":
      return `일주와 월간 십신을 근거로 성격의 핵심을 3문장 이내로 짚어 주세요. ${toneDirective(tone)}`;
    case "seasonal_fortune": {
      const template = ctx.concern
        ? concernById(ctx.concern).promptTemplate
        : "올해 하반기 흐름을 키워드 3개와 한 줄 조언으로 제시하세요.";
      return `${template} 올해 하반기 흐름 중심으로. ${toneDirective(tone)}`;
    }
    case "caution":
      return "가장 부족한 오행을 근거로, 올 하반기 '조심할 것' 하나를 '주의 + 대처' 프레임으로 알려 주세요. 겁주지 말고 대처 위주로.";
    default:
      return "제시된 원국 데이터를 근거로 해석해 주세요.";
  }
}

/** LLM 유닛용 프롬프트(system/user) 생성. 생년월일 원본 미포함(원칙 2). */
export function buildPrompt(
  unit: InterpretationUnit,
  chart: SajuChart,
  ctx: InterpretContext,
): { system: string; user: string } {
  const system = modeOf(ctx) === "classic" ? PERSONA_CLASSIC : PERSONA_MZ;
  const context = toLlmContext(chart);
  const guardrail = guardrailDirective(unit.guardrailLevel);
  const user = [context, "", unitInstruction(unit, ctx), guardrail].filter(Boolean).join("\n");
  return { system, user };
}
