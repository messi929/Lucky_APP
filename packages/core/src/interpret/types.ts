/**
 * 해석 레이어 타입 (기획서 §4).
 * core는 순수 TS(원칙 1) → 실제 LLM 호출·캐시 I/O는 DI로 앱이 주입.
 */

import type { ConcernId, GuardrailLevel } from "../content/concerns.js";
import type { SajuChart } from "../saju/types.js";

/** 반응 체크 원탭 (소름/반/글쎄요) — 후반 화법 톤 분기 */
export type Reaction = "soul" | "half" | "skeptic";

/** 톤 변형 2종(조합 폭발 방지, §5): deep(더 깊은 단정) / counter(받아침) */
export type Tone = "deep" | "counter";

/** 세대 적응 톤/UI 모드 (v1.2 §4.2): mz(힙한 직설) / classic(정중 상담체) */
export type Mode = "mz" | "classic";

export interface InterpretContext {
  /** 선택 고민 (없으면 seasonal_fortune 생략). concerns.ts 카탈로그 id */
  concern?: ConcernId;
  /** 반응 체크 결과 (없으면 deep 기본) */
  reaction?: Reaction;
  /** 세대 톤 모드 (없으면 'mz'). 앱이 생년 기준 만 40세 경계로 기본값 결정 */
  mode?: Mode;
  /** 시즌 태그 (예: "2026H2") — 캐시 키·시즌 콘텐츠용 */
  season: string;
  /** 유료 여부 (모델 티어·조심할것 상세 해제) */
  paid?: boolean;
}

/** 해석 유닛 종류 (§4.2) */
export type UnitKind =
  | "ilju_hook" // 일주 단정형 훅 (정적)
  | "daymaster_type" // 일간 캐릭터 (정적)
  | "element_balance" // 오행 밸런스 코멘트 (LLM)
  | "personality_core" // 성격 코어 일주+십신 (LLM)
  | "seasonal_fortune" // 관심사×일간 하반기 운 (LLM, 시즌)
  | "caution" // 조심할 것 (LLM)
  | "remedy" // 개운 처방 (규칙)
  // 상담 세션 비트 (concern 1개 집중 리딩, v1.2 상담 플로우) — 진단→근거→시기→처방
  | "session_diagnosis" // 진단: 고민에 대한 핵심 단정 (무료 티저)
  | "session_reason" // 근거: 원국의 특정 글자로 진단을 뒷받침
  | "session_timing" // 시기: 흐름이 열리고 닫히는 때 (관망 언어)
  | "session_remedy"; // 처방: 그때까지의 태도 + 개운 한 가지

/** 상담 세션 비트 순서 (진단→근거→시기→처방) */
export type SessionBeatKind =
  | "session_diagnosis"
  | "session_reason"
  | "session_timing"
  | "session_remedy";

export const SESSION_BEATS: SessionBeatKind[] = [
  "session_diagnosis",
  "session_reason",
  "session_timing",
  "session_remedy",
];

export type UnitSource = "static" | "llm" | "rule";

export interface InterpretationUnit {
  kind: UnitKind;
  source: UnitSource;
  /** 캐시 키 구성용 유닛값 (이 유닛을 결정하는 최소 입력. 톤 민감분은 여기 포함) */
  value: string;
  /** 시즌 태그가 캐시 키에 반영되는가 */
  seasonal: boolean;
  /** 가드레일 단계 (concern 유래, 기본 1) */
  guardrailLevel: GuardrailLevel;
  /** 캐시 키의 관심사 축 (해당 없으면 undefined → '-') */
  concern?: ConcernId;
}

export type { ConcernId, GuardrailLevel } from "../content/concerns.js";

/** 조립된 유닛 결과 */
export interface ResolvedUnit {
  kind: UnitKind;
  source: UnitSource;
  cacheKey: string | null; // static은 null (콘텐츠 직참조)
  text: string;
  /** LLM 결과가 캐시 히트였는지 (계측용) */
  cacheHit?: boolean;
  /** 가드레일 위반으로 폴백 대체되었는지 */
  guardrailFallback?: boolean;
}

/** 최종 리포트 (카드 조립 입력) */
export interface InterpretedReport {
  units: ResolvedUnit[];
  disclaimer: string;
  promptVersion: string;
}

/** 상담 세션 리딩 (concern 1개 집중, 진단→근거→시기→처방) */
export interface SessionReading {
  concern: ConcernId;
  /** 생성된 비트 (무료=진단만, 유료=4비트 전체). SESSION_BEATS 순서 유지 */
  beats: ResolvedUnit[];
  /** 미해제 비트 (무료 시 근거·시기·처방). 결제 유도용 */
  lockedBeats: SessionBeatKind[];
  disclaimer: string;
  promptVersion: string;
}

/** LLM 생성 함수 (앱이 Anthropic 호출을 주입) */
export type GenerateFn = (
  prompt: { system: string; user: string },
  meta: { kind: UnitKind; tier: "free" | "paid" },
) => Promise<string>;

/** 캐시 저장소 (앱이 Supabase 등을 주입). 미주입 시 캐시 없이 동작 */
export interface CacheStore {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
}

export interface InterpretDeps {
  generate: GenerateFn;
  cache?: CacheStore;
}

export type { SajuChart };
