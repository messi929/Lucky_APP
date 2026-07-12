/** 만세력 엔진 공개 API (packages/core/saju) */

export { computeSaju, toLlmContext } from "./engine.js";
export type { SajuInput, SajuChart, CalendarType, Gender, SajuResult } from "./types.js";
export type { CorrectionMeta } from "./corrections.js";
export { buildSsajuInput } from "./corrections.js";
export type { BoundaryFlag } from "./boundary.js";
export { detectBoundary } from "./boundary.js";

// 지역 경도 테이블(진태양시 UI 입력)
export {
  REGIONS,
  regionLongitude,
  longitudeToCorrectionMin,
  DEFAULT_LONGITUDE,
  KST_STANDARD_MERIDIAN,
  type RegionCode,
  type RegionDef,
} from "./regions.js";

// 절기 천문 계산(경계 플래그·검증용). 자체 계산, 외부 API 제로.
export {
  ipchunInstant,
  solarLongitudeInstant,
  sunApparentLongitude,
  findEnclosingMajorTerms,
  MAJOR_TERMS,
} from "./astro.js";

// 도메인 상수(UI 오행 색상 등). ssaju 결과와 병행 사용 가능.
export {
  STEMS,
  BRANCHES,
  ELEMENT_KO,
  ganjiHangul,
  ganjiHanja,
  type Element,
  type YinYang,
  type TenGod,
  type TwelveStage,
} from "./constants.js";

// 택일 모듈 (v1.2 §3) — 순수 계산
export {
  computeTaekil,
  type TaekilPurpose,
  type TaekilRequest,
  type TaekilResult,
  type TaekilDay,
} from "./taekil.js";
export {
  dayGanziIndex,
  gregorianToJDN,
  isStemHap,
  isStemChung,
  isBranchYukhap,
  isBranchSamhap,
  isBranchChung,
} from "./ganzi.js";

// 오늘의 한 줄 (v1.2 §10.1) — 순수 계산, 웹/앱 푸시 공용
export { dailyLine, type DailyLine } from "./daily.js";

// ssaju 순수 변환 유틸 재노출(검증·유틸)
export { lunarToSolar, solarToLunar } from "ssaju";
