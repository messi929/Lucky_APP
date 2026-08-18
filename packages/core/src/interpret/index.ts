/** 해석 레이어 공개 API (packages/core/interpret, 기획서 §4) */

export { interpret, interpretSession, interpretDream } from "./interpret.js";
export {
  decomposeUnits,
  decomposeSessionUnits,
  decomposeDreamUnits,
  deriveFacts,
  toneOf,
} from "./units.js";
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
  type PriorBeat,
} from "./persona.js";
export {
  retroProbes,
  retroPeriodLabel,
  retroSentence,
  RETRO_TEMPLATES,
  type RetroProbe,
} from "./retro.js";
export { collectMetrics, type GenerationMetrics } from "./metrics.js";
export { stripMarkdown, qualityIssue, type QualityIssue } from "./sanitize.js";
export { SESSION_BEATS } from "./types.js";
export type {
  Reaction,
  Tone,
  Mode,
  InterpretContext,
  UnitKind,
  UnitSource,
  SessionBeatKind,
  InterpretationUnit,
  ResolvedUnit,
  InterpretedReport,
  SessionReading,
  DreamReading,
  GenerateFn,
  CacheStore,
  InterpretDeps,
  ConcernId,
  GuardrailLevel,
} from "./types.js";
