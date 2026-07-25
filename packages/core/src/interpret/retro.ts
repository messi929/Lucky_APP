/**
 * 과거 검증 프로브 (PROCESS-DESIGN §5) — 신뢰 방아쇠.
 *
 * 철학관의 순서는 "손님이 고민을 말하기 _전에_ 도사가 먼저 맞힌다"이다.
 * 미래는 검증이 불가능하니 신뢰의 근거가 못 된다. 검증되는 건 과거뿐이다.
 *
 * 설계 원칙
 *  1. **질문형만.** "…있었죠"(단정) 금지, "…않았어요?"(질문). 틀려도 손상이 없어야 한다.
 *     틀린 단정은 신뢰 즉사이자 역방향 전파를 만든다.
 *  2. **LLM 0.** 템플릿 기반 결정론. 가드레일이 확실하고, 재현성이 보장되고, 비용이 없다.
 *     (같은 사람이 다시 봤을 때 다른 말이 나오면 그게 신뢰 붕괴의 1순위다)
 *  3. **표시 전용.** 연도가 들어 있으므로 절대 LLM 프롬프트에 넣지 않는다(원칙 2).
 *  4. 건강·사망·법적 사건 단정 금지 — 전 템플릿이 가드레일 L3를 통과해야 한다.
 */

import type { SajuChart } from "./types.js";

/** 과거 검증 한 건 */
export interface RetroProbe {
  /** 대운이 바뀐 해 */
  pivotYear: number;
  /** 질문에 쓰는 구간 (pivotYear ±1) */
  fromYear: number;
  toYear: number;
  /** 그때 나이 */
  age: number;
  /** 근거가 된 대운 천간 십신 */
  tenGod: string;
  /** 질문형 문장 */
  question: string;
}

/**
 * 십신별 질문 템플릿. 전부 질문형·관망 언어.
 * 건강/질병/사망/법적 사건은 어휘에서 배제(가드레일 L3 대상).
 */
const PROBE_BY_TEN_GOD: Record<string, string> = {
  비견: "사람은 늘었는데 정작 기댈 데는 줄지 않았어요?",
  겁재: "믿었던 쪽에서 한 번 크게 어긋나지 않았어요?",
  식신: "하고 싶던 걸 처음으로 밀어붙여 보지 않았어요?",
  상관: "참다가 결국 한마디 하고, 판을 흔들지 않았어요?",
  편재: "돈이 크게 들어왔다가 크게 나가지 않았어요?",
  정재: "버는 방식이나 자리가 한 번 정리되지 않았어요?",
  편관: "감당하기 벅찬 책임이 갑자기 얹히지 않았어요?",
  정관: "자리나 직함이 한 번 바뀌지 않았어요?",
  편인: "혼자 있고 싶어서 사람을 줄이지 않았어요?",
  정인: "다시 배우거나, 기대는 쪽으로 방향을 틀지 않았어요?",
};

/** 십신을 못 읽었을 때 (유파·표기 차이 방어) */
const PROBE_FALLBACK = "자리나 사람이 한 번 크게 바뀌지 않았어요?";

/** 기억이 남을 만한 최소 나이 — 이보다 어린 대운 전환은 검증 가치가 없다 */
const MIN_AGE = 17;
/** 한 화면에 얹을 최대 개수 */
const MAX_PROBES = 3;

/**
 * 대운 전환 시점으로 과거 검증 후보를 만든다.
 * 최근 것부터 — 가까운 과거일수록 기억이 선명해 검증률이 높다.
 */
export function retroProbes(chart: SajuChart, limit = MAX_PROBES): RetroProbe[] {
  const s = chart.saju;
  const list = s.daeun?.list;
  if (!Array.isArray(list) || list.length === 0) return [];

  const currentYear = s.currentYear;
  const out: RetroProbe[] = [];

  for (const d of list) {
    const startYear = Number(d.startYear);
    const age = Number(d.startAge);
    if (!Number.isFinite(startYear) || !Number.isFinite(age)) continue;
    // 미래 대운은 검증 대상이 아니다. 너무 어린 시절도 제외.
    if (startYear > currentYear || age < MIN_AGE) continue;

    const tenGod = String(d.stemTenGod ?? "");
    out.push({
      pivotYear: startYear,
      fromYear: startYear - 1,
      toYear: startYear + 1,
      age,
      tenGod,
      question: PROBE_BY_TEN_GOD[tenGod] ?? PROBE_FALLBACK,
    });
  }

  // 최근 전환부터
  out.sort((a, b) => b.pivotYear - a.pivotYear);
  return out.slice(0, limit);
}

/** "2016년에서 2018년 사이," — 질문 앞에 붙는 구간 표현 */
export function retroPeriodLabel(p: RetroProbe): string {
  return `${p.fromYear}년에서 ${p.toYear}년 사이,`;
}

/** 구간 + 질문을 이은 완성 문장 */
export function retroSentence(p: RetroProbe): string {
  return `${retroPeriodLabel(p)} ${p.question}`;
}

/** 템플릿 전량 (테스트·감수용) */
export const RETRO_TEMPLATES = { ...PROBE_BY_TEN_GOD, _fallback: PROBE_FALLBACK } as const;
