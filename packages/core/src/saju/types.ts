import type { SajuResult } from "ssaju";
import type { BoundaryFlag } from "./boundary.js";
import type { CorrectionMeta } from "./corrections.js";
import type { RegionCode } from "./regions.js";

/** 달력 종류 (기획서 §3.1). ssaju는 solar/lunar만 구분 → lunarLeap는 leap 플래그로 매핑 */
export type CalendarType = "solar" | "lunar" | "lunarLeap";
export type Gender = "male" | "female";

/** 만세력 엔진 입력 (우리 도메인 표준) */
export interface SajuInput {
  /** "YYYY-MM-DD" — calendarType 기준 날짜 */
  birthDate: string;
  /** "HH:mm" — 출생지 표준시(KST) 벽시계. unknownTime=true면 무시 */
  birthTime?: string;
  gender?: Gender;
  calendarType: CalendarType;
  /** 시·도 코드. 진태양시(LMT) 경도 보정. 미선택 시 기본 -30분(§3.2 #5) */
  birthRegion?: RegionCode;
  /** 출생시 모름 → 시주 제외 3주 리포트 폴백(§3.2 #8) */
  unknownTime: boolean;
}

/**
 * 최종 산출물. ssaju 계산 결과(십성·12운성·대운·세운·월운·격국·용신·신살·오행·toCompact 등)
 * + 우리 어댑터 보정 메타 + 절입 경계 플래그.
 *
 * LLM에는 `saju.toCompact()` 결과(간지 JSON 요약)만 전달. 생년월일 원본 미전달(CLAUDE.md 원칙 2).
 */
export interface SajuChart {
  /** ssaju 원본 결과 (SajuResult) */
  saju: SajuResult;
  /** 한국 특수 보정 메타(DST·표준시변경기·LMT) */
  meta: CorrectionMeta;
  /** 절입 경계(±5분) 플래그 */
  boundary: BoundaryFlag;
}

export type { SajuResult } from "ssaju";
