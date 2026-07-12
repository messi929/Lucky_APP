import Anthropic from "@anthropic-ai/sdk";
import { MODELS, type GenerateFn } from "@lucky/core";

/**
 * LLM 생성 함수 (core interpret에 주입).
 * ANTHROPIC_API_KEY 있으면 실제 호출(무료=Haiku급/유료=Sonnet급), 없으면 안전 stub.
 * → 키 없이도 앱이 end-to-end 렌더(개발/미리보기). 생년월일 원본은 프롬프트에 미포함(원칙 2).
 */

const STUB: Record<string, string> = {
  element_balance: "기질의 균형이 한쪽으로 살짝 기울어 있어요. 그 방향을 알면 오히려 힘이 됩니다.",
  personality_core:
    "겉으로 드러나는 모습과 속마음의 결이 조금 다른 분이에요. 그래서 오해도 사고, 그만큼 깊기도 하죠.",
  seasonal_fortune:
    "하반기엔 서두르기보다 흐름을 살피며 한 걸음씩 가면 좋아요. 기회는 준비된 쪽으로 옵니다.",
  caution: "무리한 결정은 한 템포만 늦춰 보세요. 그게 올해의 대처법이에요.",
};

export const generate: GenerateFn = async (prompt, meta) => {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return STUB[meta.kind] ?? "지금은 준비의 시기예요. 한 걸음씩 가세요.";

  const client = new Anthropic({ apiKey: key });
  const model = meta.tier === "paid" ? MODELS.paid : MODELS.free;
  const res = await client.messages.create({
    model,
    max_tokens: 320,
    system: prompt.system,
    messages: [{ role: "user", content: prompt.user }],
  });
  return res.content
    .map((b) => (b.type === "text" ? b.text : ""))
    .join("")
    .trim();
};
