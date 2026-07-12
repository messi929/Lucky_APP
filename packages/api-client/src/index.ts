/**
 * 웹·앱 공용 API 타입·클라이언트 (기획서 §2.1).
 * 공유 URL 단일 포맷: /r/{token} (CLAUDE.md 원칙 6).
 */

import type {
  ConcernId,
  Mode,
  Reaction,
  ResolvedUnit,
  SajuInput,
} from "@lucky/core";

/** 결과 접근 토큰: nanoid 12+ (추측 불가) */
export type ResultToken = string;

export const shareUrl = (domain: string, token: ResultToken): string =>
  `https://${domain}/r/${token}`;

/** 리포트 요청 컨텍스트 (반응·고민·모드 등 화면 상호작용 결과) */
export interface ReportContextInput {
  reaction?: Reaction;
  concern?: ConcernId;
  mode?: Mode;
  season: string;
  paid?: boolean;
}

/** 리포트 생성/조회 요청 */
export interface ReportRequest {
  /** 기존 토큰(재조회). 없으면 birth로 신규 생성 */
  token?: ResultToken;
  birth?: SajuInput;
  ctx: ReportContextInput;
}

/** 카드 렌더용 원국 요약 (생년월일 원본 미포함) */
export interface PillarView {
  position: "year" | "month" | "day" | "hour";
  stemHanja: string;
  stemKo: string;
  branchHanja: string;
  branchKo: string;
}

export interface ChartSummary {
  pillars: PillarView[];
  fiveElements: Record<string, number>;
  dayStemIdx: number;
  character: { name: string; tagline: string; keywords: string[] };
  remedy: { element: string; colors: string[]; direction: string; oneThing: string };
  boundary: { isBoundary: boolean; note?: string };
  unknownTime: boolean;
}

/** 연령 적응 노출 데이터 */
export interface AdaptiveInfo {
  age: number;
  defaultMode: Mode;
  concerns: { id: ConcernId; label: string; guardrailLevel: 1 | 2 | 3 }[];
}

/** 리포트 응답 페이로드 (클라이언트 카드 렌더 입력) */
export interface ReportPayload {
  token: ResultToken;
  units: ResolvedUnit[];
  disclaimer: string;
  promptVersion: string;
  chart: ChartSummary;
  adaptive: AdaptiveInfo;
  /** 결제 unlock 여부 (유료 섹션·문답 해제) */
  paid: boolean;
  /** 오늘의 한 줄 (§10.1) */
  daily: { line: string; todayGanji: string };
}

// ── 수익화 SKU (기획서 §7.4, §9) ──
export type SkuId =
  | "full_report" // 복채 풀 리포트 + 문답 1회
  | "compat_detail" // 궁합 상세
  | "timing" // 이직/결혼 타이밍
  | "child_fortune" // 자녀운(수능/취업/혼사)
  | "taekil" // 택일(이사/개업/계약)
  | "exam" // 시험운
  | "newyear"; // 신년 대운 리포트

export interface Sku {
  id: SkuId;
  label: string;
  /** 원(KRW) */
  price: number;
  /** LLM 티어 */
  tier: "free" | "paid";
  /** 자녀 생년월일 입력 필요(가족 루프) */
  requiresChildBirth?: boolean;
  /** 목적+기간 입력 필요(택일) */
  requiresPeriod?: boolean;
  note?: string;
}

export const SKUS: Record<SkuId, Sku> = {
  full_report: { id: "full_report", label: "복채 풀 리포트 + 문답 1회", price: 3900, tier: "paid" },
  compat_detail: { id: "compat_detail", label: "궁합 상세 + 기념일 카드", price: 2900, tier: "paid" },
  timing: { id: "timing", label: "이직/결혼 타이밍", price: 6900, tier: "paid" },
  child_fortune: {
    id: "child_fortune",
    label: "자녀운 (수능/취업/혼사)",
    price: 9900,
    tier: "paid",
    requiresChildBirth: true,
    note: "자녀 생년월일 입력",
  },
  taekil: {
    id: "taekil",
    label: "택일 리포트 (이사/개업/계약)",
    price: 6900,
    tier: "paid",
    requiresPeriod: true,
  },
  exam: { id: "exam", label: "시험운", price: 4900, tier: "paid" },
  newyear: { id: "newyear", label: "신년 대운 리포트", price: 9900, tier: "paid" },
};

/** 결제 요청 (mock provider). 청약철회 동의는 필수(원칙 9) */
export interface CheckoutRequest {
  token: string;
  sku: SkuId;
  /** 청약철회 제한 명시적 동의 (원칙 9). false면 결제 거부 */
  withdrawalConsent: boolean;
  /** 선물하기 */
  gift?: boolean;
  fromMsg?: string;
}

export type { SajuInput };
