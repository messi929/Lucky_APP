/**
 * 꿈 상징 사전 불변식 검증 (DREAM-DESIGN.md).
 * 콘텐츠가 60종씩 늘어나는 파일이라, 사람이 눈으로 못 지키는 규칙을 여기서 잡는다.
 */

import { describe, expect, it } from "vitest";
import {
  applyGuardrails,
  cacheKeyOf,
  computeSaju,
  decomposeDreamUnits,
  DREAM_RELATION_DIRECTIVE,
  DREAM_SYMBOLS,
  dreamRelation,
  dreamSymbolById,
  dreamSymbolsByCategory,
  isDreamMood,
  isDreamSymbolId,
  type DreamSymbol,
} from "@lucky/core";

const ALL: DreamSymbol[] = Object.values(DREAM_SYMBOLS);

/** 캐시 상한 = 상징 × 감정4 × 관계3 × 톤2 × 모드2 (DREAM-DESIGN §2) */
const MOODS = 4;
const RELATIONS = 3;
const TONES = 2;
const MODES = 2;

describe("사전 구조", () => {
  it("1차 60종", () => {
    expect(ALL.length).toBe(60);
  });

  it("키와 id가 일치한다 (복사·붙여넣기 사고 방지)", () => {
    for (const [key, sym] of Object.entries(DREAM_SYMBOLS)) {
      expect(sym.id).toBe(key);
    }
  });

  it("라벨·별칭·카피가 비어 있지 않다", () => {
    for (const s of ALL) {
      expect(s.label.length).toBeGreaterThan(0);
      expect(s.aliases.length).toBeGreaterThan(0);
      expect(s.classic.length).toBeGreaterThan(10);
      expect(s.promptTemplate.length).toBeGreaterThan(10);
    }
  });

  it("오행은 5행 중 하나", () => {
    const ok = new Set(["wood", "fire", "earth", "metal", "water"]);
    for (const s of ALL) expect(ok.has(s.element)).toBe(true);
  });

  it("카테고리 분해가 전체를 덮는다", () => {
    const cats = ["animal", "nature", "body", "person", "event", "thing"] as const;
    const sum = cats.reduce((n, c) => n + dreamSymbolsByCategory(c).length, 0);
    expect(sum).toBe(ALL.length);
  });

  it("캐시 키 상한이 설계값(2,880)을 넘지 않는다", () => {
    // 이 상한이 무너지면 무료 기능의 비용 전제가 무너진다(DREAM-DESIGN §0).
    expect(ALL.length * MOODS * RELATIONS * TONES * MODES).toBe(2880);
  });
});

describe("가드레일 배정", () => {
  it("임신·죽음·장례·피·상처·병원·아기·고인은 L3(민감)", () => {
    for (const id of [
      "pregnant", "death_scene", "funeral", "blood", "wound", "hospital", "baby", "deceased",
    ] as const) {
      expect(dreamSymbolById(id).guardrailLevel).toBe(3);
    }
  });

  it("재물로 오독되기 쉬운 상징은 최소 L2", () => {
    for (const id of ["money", "gold", "pig", "feces"] as const) {
      expect(dreamSymbolById(id).guardrailLevel).toBeGreaterThanOrEqual(2);
    }
  });

  it("L3 상징의 지시문에는 금지 조항이 명시돼 있다", () => {
    for (const s of ALL.filter((x) => x.guardrailLevel === 3)) {
      // 표현은 "금지"·"절대 …하지 마세요" 둘 다 쓴다. 의도로 판정한다.
      expect(/금지|하지 마세요/.test(s.promptTemplate)).toBe(true);
    }
  });

  it("재물 오독 상징의 지시문은 복권·투자를 명시적으로 막는다", () => {
    for (const id of ["money", "gold", "pig", "feces"] as const) {
      const t = dreamSymbolById(id).promptTemplate;
      expect(/복권|투자|당첨|재물/.test(t)).toBe(true);
      expect(/금지|하지 마세요/.test(t)).toBe(true);
    }
  });
});

describe("카피 품질 — 사용자에게 그대로 노출되는 문장", () => {
  it("classic은 문장 종결부호로 끝난다 (잘린 문장 방지)", () => {
    for (const s of ALL) {
      expect(s.classic.trim()).toMatch(/[.!?…]$/);
    }
  });

  it("classic에 마크다운 기호가 없다", () => {
    for (const s of ALL) {
      expect(s.classic).not.toMatch(/\*\*|__|`/);
    }
  });

  it("classic이 길흉을 단정하지 않는다 (겁주지 않는 사주)", () => {
    for (const s of ALL) {
      // "흉몽으로 치지 않았죠"처럼 겁을 걷어내는 문장은 정상이므로 단정형만 막는다.
      expect(s.classic).not.toMatch(/재앙|죽는다|사망하|불길한 징조|흉몽이(다|에요|니)/);
    }
  });
});

describe("검증 함수", () => {
  it("isDreamSymbolId — 카탈로그에 있는 것만", () => {
    expect(isDreamSymbolId("snake")).toBe(true);
    expect(isDreamSymbolId("unicorn")).toBe(false);
    expect(isDreamSymbolId("toString")).toBe(false); // prototype 상속 키
  });

  it("isDreamMood", () => {
    expect(isDreamMood("fear")).toBe(true);
    expect(isDreamMood("happy")).toBe(false);
  });
});

describe("오행 다리 — 개인화 축", () => {
  it("부족·과다·그외 3종으로 분해된다", () => {
    expect(dreamRelation("water", "water", "earth")).toBe("lack");
    expect(dreamRelation("earth", "water", "earth")).toBe("excess");
    expect(dreamRelation("fire", "water", "earth")).toBe("neutral");
  });

  it("부족과 과다가 같은 오행이면 부족이 우선한다", () => {
    // 한쪽으로만 치우친 원국에서 생기는 경계. 보완 방향을 우선한다.
    expect(dreamRelation("wood", "wood", "wood")).toBe("lack");
  });

  it("관계마다 해석 방향 지시가 있다", () => {
    for (const r of ["lack", "excess", "neutral"] as const) {
      expect(DREAM_RELATION_DIRECTIVE[r].length).toBeGreaterThan(10);
    }
  });
});

describe("꿈 유닛 분해 · 캐시 키 (DREAM-DESIGN §2)", () => {
  const chart = computeSaju({
    birthDate: "1990-03-15",
    birthTime: "14:20",
    gender: "male",
    calendarType: "solar",
    birthRegion: "SEOUL",
    unknownTime: false,
  });
  const ctx = { season: "2026H2" } as const;

  it("통설(static) + 내 해석(LLM) 2장", () => {
    const { units } = decomposeDreamUnits(chart, "snake", "fear", ctx);
    expect(units.map((u) => u.kind)).toEqual(["dream_classic", "dream_reading"]);
    expect(units[0]!.source).toBe("static");
    expect(units[1]!.source).toBe("llm");
  });

  it("통설은 캐시 대상이 아니다 (정적 콘텐츠 직참조)", () => {
    const { units } = decomposeDreamUnits(chart, "snake", "fear", ctx);
    expect(cacheKeyOf(units[0]!, ctx, "v4")).toBeNull();
  });

  it("캐시 키는 상징·감정·관계·톤만 담는다 — 일간은 들어가지 않는다", () => {
    const { units } = decomposeDreamUnits(chart, "snake", "fear", ctx);
    const key = cacheKeyOf(units[1]!, ctx, "v4")!;
    expect(key.startsWith("dream_reading:snake|fear|")).toBe(true);
    // 일간 한자가 키에 새어 들어가면 조합이 10배가 된다
    expect(key).not.toContain(chart.saju.dayStem);
  });

  it("시즌 축을 쓰지 않는다 (절기를 타지 않는데 반기마다 무효화되면 손해)", () => {
    const { units } = decomposeDreamUnits(chart, "snake", "fear", ctx);
    const a = cacheKeyOf(units[1]!, { season: "2026H1" }, "v4");
    const b = cacheKeyOf(units[1]!, { season: "2026H2" }, "v4");
    expect(a).toBe(b);
  });

  it("감정이 다르면 키가 갈린다 (같은 상징도 해석이 달라야 한다)", () => {
    const fear = decomposeDreamUnits(chart, "snake", "fear", ctx).units[1]!;
    const relief = decomposeDreamUnits(chart, "snake", "relief", ctx).units[1]!;
    expect(cacheKeyOf(fear, ctx, "v4")).not.toBe(cacheKeyOf(relief, ctx, "v4"));
  });

  it("가드레일 단계는 상징에서 상속한다", () => {
    const { units } = decomposeDreamUnits(chart, "pregnant", "odd", ctx);
    expect(units[1]!.guardrailLevel).toBe(3);
  });
});

describe("해몽 전용 가드레일 (DREAM-DESIGN §5)", () => {
  it("태몽을 임신 단정으로 말하면 L3에서 걸린다", () => {
    expect(applyGuardrails("이건 태몽이에요. 곧 아이가 생기겠네요.", 3).ok).toBe(false);
    expect(applyGuardrails("임신하게 될 거예요.", 3).ok).toBe(false);
  });

  it("복권·당첨 유도는 L2에서 걸린다 (investment 규칙은 주식·코인만 잡는다)", () => {
    expect(applyGuardrails("돼지꿈이니 복권을 사보세요.", 2).ok).toBe(false);
    expect(applyGuardrails("당첨 운이 들어옵니다.", 2).ok).toBe(false);
  });

  it("흉몽 단정·조상이 부른다 류는 L3에서 걸린다", () => {
    expect(applyGuardrails("흉몽입니다. 조심하세요.", 3).ok).toBe(false);
    expect(applyGuardrails("조상이 부르는 꿈이에요.", 3).ok).toBe(false);
  });

  it("정상 해몽 문장은 통과한다", () => {
    const ok = "요즘 마음이 무거우셨나 봐요. 꿈은 그 무게를 비추는 거울일 뿐이에요.";
    expect(applyGuardrails(ok, 3).ok).toBe(true);
  });

  it("겁을 걷어내는 문장은 막지 않는다 (흉몽으로 치지 않았다는 설명)", () => {
    const ok = "놀라셨겠지만 옛 해석에서도 흉몽으로 치지 않았어요.";
    expect(applyGuardrails(ok, 3).ok).toBe(true);
  });
});
