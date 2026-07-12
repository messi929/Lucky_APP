/** 해석 레이어 공개 API (packages/core/interpret, 기획서 §4) */

export { interpret } from "./interpret.js";
export { decomposeUnits, deriveFacts, toneOf } from "./units.js";
export { cacheKeyOf } from "./cache-key.js";
export {
  applyGuardrails,
  DISCLAIMER,
  DISCLAIMER_CLASSIC,
  type GuardrailCategory,
  type Violation,
} from "./guardrails.js";
export {
  buildPrompt,
  modeOf,
  PERSONA_MZ,
  PERSONA_CLASSIC,
  PROMPT_VERSION,
  MODELS,
} from "./persona.js";
export type {
  Reaction,
  Tone,
  Mode,
  InterpretContext,
  UnitKind,
  UnitSource,
  InterpretationUnit,
  ResolvedUnit,
  InterpretedReport,
  GenerateFn,
  CacheStore,
  InterpretDeps,
  ConcernId,
  GuardrailLevel,
} from "./types.js";
