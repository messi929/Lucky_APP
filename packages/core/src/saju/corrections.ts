/**
 * 보정 어댑터 (VERIFICATION-REPORT §아키텍처: corrections.ts).
 *
 * ssaju는 순수 만세력 계산 코어. 아래 한국 특수 보정은 라이브러리 밖에서 우리가 책임진다:
 *  1) 서머타임(1948–51, 1955–60, 1987–88): ssaju 미보정 → 입력에서 -1시간.
 *  2) 표준시 변경기(1954-08~1961-08, UTC+8:30): LMT 이중 보정 위험 → LMT 비활성.
 *  3) 진태양시(LMT): 출생지 경도 기준. ssaju applyLocalMeanTime + longitude에 위임.
 *
 * ssaju는 직접 수정 금지·버전 pin. 여기서 '보정된 입력'만 만들어 넘긴다.
 */

import { lunarToSolar as ssajuLunarToSolar, type SajuInput as SsajuInput } from "ssaju";
import { regionLongitude } from "./regions.js";
import { isDst, isStandardTimeEra, parseWallClock, stripDst } from "./time.js";
import type { SajuInput } from "./types.js";

export interface CorrectionMeta {
  /** 서머타임 보정(-1h) 적용 여부 */
  dstApplied: boolean;
  /** 표준시 변경기(UTC+8:30) 출생 여부 → LMT 비활성 */
  standardTimeEra: boolean;
  /** 진태양시(LMT) 보정 적용 여부 */
  localMeanTimeApplied: boolean;
  /** 사용 경도(°E) */
  longitude: number;
  /** 출생시 모름 폴백 */
  unknownTime: boolean;
  /** ssaju에 전달된 (보정 전) 양력 계산 날짜·시각 */
  correctedInput: { year: number; month: number; day: number; hour: number; minute: number };
}

export interface BuiltInput {
  ssajuInput: SsajuInput;
  meta: CorrectionMeta;
}

/** 우리 SajuInput → 보정 적용된 ssaju 입력 + 메타 */
export function buildSsajuInput(input: SajuInput): BuiltInput {
  // 1) 음력이면 먼저 양력으로(ssaju 변환) → 이후 보정은 모두 양력 기준
  let { y, mo, d } = parseSolarDate(input);
  const wall = parseWallClock(
    `${y}-${pad(mo)}-${pad(d)}`,
    input.unknownTime ? undefined : input.birthTime,
  );
  y = wall.y;
  mo = wall.mo;
  d = wall.d;
  let h = wall.h;
  let mi = wall.mi;

  // 2) 서머타임: 표준시로 환산(-1h)
  const dstApplied = isDst(y, mo, d, h, mi);
  if (dstApplied) {
    const s = stripDst({ y, mo, d, h, mi });
    y = s.y;
    mo = s.mo;
    d = s.d;
    h = s.h;
    mi = s.mi;
  }

  // 3) 표준시 변경기 → LMT 비활성
  const standardTimeEra = isStandardTimeEra(y, mo, d);
  const longitude = regionLongitude(input.birthRegion);
  const localMeanTimeApplied = !standardTimeEra;

  const ssajuInput: SsajuInput = {
    year: y,
    month: mo,
    day: d,
    hour: h,
    minute: mi,
    gender: input.gender === "female" ? "여" : "남",
    calendar: "solar",
    applyLocalMeanTime: localMeanTimeApplied,
    ...(localMeanTimeApplied ? { longitude } : {}),
    timezone: "Asia/Seoul",
  };

  return {
    ssajuInput,
    meta: {
      dstApplied,
      standardTimeEra,
      localMeanTimeApplied,
      longitude,
      unknownTime: input.unknownTime,
      correctedInput: { year: y, month: mo, day: d, hour: h, minute: mi },
    },
  };
}

function parseSolarDate(input: SajuInput): { y: number; mo: number; d: number } {
  const dm = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(input.birthDate);
  if (!dm) throw new Error(`birthDate 형식 오류(YYYY-MM-DD): ${input.birthDate}`);
  const y = Number(dm[1]);
  const mo = Number(dm[2]);
  const d = Number(dm[3]);
  if (input.calendarType === "solar") return { y, mo, d };
  // 음력 → 양력 (ssaju)
  const s = ssajuLunarToSolar(y, mo, d, input.calendarType === "lunarLeap");
  return { y: s.year, mo: s.month, d: s.day };
}

const pad = (n: number): string => String(n).padStart(2, "0");
