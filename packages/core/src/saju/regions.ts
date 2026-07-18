/**
 * 출생 시·도 → 대표 경도 테이블 (진태양시 보정, 기획서 §3.2 #5).
 * 한국표준시(KST) 기준 자오선 = 135°E. 보정분 = (경도 - 135) × 4분.
 * 예) 서울 126.98°E → (126.98-135)×4 ≈ -32분, 부산 129.08°E → ≈ -24분.
 * 미선택(기본): -30분 = 경도 127.5°E 상당.
 */

export const KST_STANDARD_MERIDIAN = 135;
/** 미선택 시 기본 경도 (→ -30분 보정) */
export const DEFAULT_LONGITUDE = 127.5;

export type RegionCode =
  | "SEOUL"
  | "BUSAN"
  | "DAEGU"
  | "INCHEON"
  | "GWANGJU"
  | "DAEJEON"
  | "ULSAN"
  | "SEJONG"
  | "GYEONGGI"
  | "GANGWON"
  | "CHUNGBUK"
  | "CHUNGNAM"
  | "JEONBUK"
  | "JEONNAM"
  | "GYEONGBUK"
  | "GYEONGNAM"
  | "JEJU";

export interface RegionDef {
  code: RegionCode;
  name: string;
  /** 대표 도시 경도(°E) */
  longitude: number;
}

export const REGIONS: Record<RegionCode, RegionDef> = {
  SEOUL: { code: "SEOUL", name: "서울", longitude: 126.98 },
  BUSAN: { code: "BUSAN", name: "부산", longitude: 129.08 },
  DAEGU: { code: "DAEGU", name: "대구", longitude: 128.6 },
  INCHEON: { code: "INCHEON", name: "인천", longitude: 126.71 },
  GWANGJU: { code: "GWANGJU", name: "광주", longitude: 126.85 },
  DAEJEON: { code: "DAEJEON", name: "대전", longitude: 127.38 },
  ULSAN: { code: "ULSAN", name: "울산", longitude: 129.31 },
  SEJONG: { code: "SEJONG", name: "세종", longitude: 127.29 },
  GYEONGGI: { code: "GYEONGGI", name: "경기", longitude: 127.02 },
  GANGWON: { code: "GANGWON", name: "강원", longitude: 127.73 },
  CHUNGBUK: { code: "CHUNGBUK", name: "충북", longitude: 127.49 },
  CHUNGNAM: { code: "CHUNGNAM", name: "충남", longitude: 126.8 },
  JEONBUK: { code: "JEONBUK", name: "전북", longitude: 127.14 },
  JEONNAM: { code: "JEONNAM", name: "전남", longitude: 126.46 },
  GYEONGBUK: { code: "GYEONGBUK", name: "경북", longitude: 128.73 },
  GYEONGNAM: { code: "GYEONGNAM", name: "경남", longitude: 128.69 },
  JEJU: { code: "JEJU", name: "제주", longitude: 126.53 },
};

/** 경도(°E) → 진태양시 보정 분 (음수 = 표준시보다 늦음) */
export function longitudeToCorrectionMin(longitude: number): number {
  return (longitude - KST_STANDARD_MERIDIAN) * 4;
}

/** 지역 코드 → 경도. 미지정·미지의 코드 시 기본 경도 (fallback으로 crash 방지) */
export function regionLongitude(region?: RegionCode): number {
  return REGIONS[region as RegionCode]?.longitude ?? DEFAULT_LONGITUDE;
}
