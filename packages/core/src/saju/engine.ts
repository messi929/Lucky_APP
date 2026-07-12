/**
 * 만세력 엔진 (VERIFICATION-REPORT §아키텍처: engine.ts).
 * 파이프라인: 우리 입력 → corrections(한국 보정) → ssaju 계산 → 경계 플래그 → SajuChart.
 *
 * 계산 코어는 ssaju(외부, MIT, 버전 pin). 여기선 보정·매핑·경계만 담당(CLAUDE.md 원칙 8).
 */

import { calculateSaju } from "ssaju";
import { detectBoundary } from "./boundary.js";
import { buildSsajuInput } from "./corrections.js";
import type { SajuChart, SajuInput } from "./types.js";

export function computeSaju(input: SajuInput): SajuChart {
  const { ssajuInput, meta } = buildSsajuInput(input);
  const saju = calculateSaju(ssajuInput);
  const boundary = detectBoundary(meta);
  return { saju, meta, boundary };
}

/**
 * LLM 해석 파이프라인 입력용 압축 문자열.
 * ⚠️ ssaju.toCompact()는 생년월일 원본을 포함하므로 사용 금지(원칙 2 위반).
 * 여기서는 간지·오행·십신·격국만 담은 birthdate-free 요약을 직접 조립한다.
 */
export function toLlmContext(chart: SajuChart): string {
  const s = chart.saju;
  const p = s.pillars;
  const fe = s.fiveElements;
  const tg = s.tenGods;
  const unknown = chart.meta.unknownTime;
  const hourPillar = unknown ? "미상" : p.hour;

  const lines = [
    `[원국] 시 ${hourPillar} · 일 ${p.day} · 월 ${p.month} · 연 ${p.year}`,
    `[일간] ${s.dayStem} (강약: ${s.advanced.dayStrength.strength})`,
    `[오행] 목${fe["목"] ?? 0} 화${fe["화"] ?? 0} 토${fe["토"] ?? 0} 금${fe["금"] ?? 0} 수${fe["수"] ?? 0}`,
    `[십신] 연 ${tg.year.stem}/${tg.year.branch} · 월 ${tg.month.stem}/${tg.month.branch} · 일지 ${tg.day.branch}${
      unknown ? "" : ` · 시 ${tg.hour.stem}/${tg.hour.branch}`
    }`,
    `[격국] ${s.advanced.geukguk} · 용신 ${s.advanced.yongsin.join(",")}`,
  ];
  return lines.join("\n");
}
