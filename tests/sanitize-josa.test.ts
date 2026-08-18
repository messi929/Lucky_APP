/**
 * 생성물 정리·품질 판정 + 조사 선택 검증 (사용성 테스트 2026-08-08 G14).
 * 실제로 사용자에게 노출됐던 문자열을 그대로 회귀 케이스로 쓴다.
 */

import { describe, expect, it } from "vitest";
import {
  computeCompat,
  computeSaju,
  euroRo,
  eulReul,
  eunNeun,
  gwaWa,
  hasFinalConsonant,
  iGa,
  qualityIssue,
  stripMarkdown,
} from "@lucky/core";

describe("stripMarkdown — 결정적으로 제거 가능한 잔재", () => {
  it("강조 기호를 지운다 (화면에 렌더되지 않아 기호가 그대로 보였다)", () => {
    expect(stripMarkdown("하반기에 **감정 표현이 과해지는** 시기")).toBe(
      "하반기에 감정 표현이 과해지는 시기",
    );
    expect(stripMarkdown("__굵게__ 그리고 `코드`")).toBe("굵게 그리고 코드");
  });

  it("짝이 맞지 않는 강조 기호도 지운다", () => {
    expect(stripMarkdown("시기가 **열립니다")).toBe("시기가 열립니다");
  });

  it("전체를 감싼 따옴표를 벗긴다 (프롬프트가 금지해도 종종 붙는다)", () => {
    expect(stripMarkdown('"올해는 쉬어가는 해예요."')).toBe("올해는 쉬어가는 해예요.");
    expect(stripMarkdown("「조급함만 내려놓으세요.」")).toBe("조급함만 내려놓으세요.");
  });

  it("문장 안의 따옴표는 건드리지 않는다", () => {
    const t = stripMarkdown("남들은 '괜찮다'고 하지만 속은 다르죠.");
    expect(t).toBe("남들은 '괜찮다'고 하지만 속은 다르죠.");
  });

  it("줄머리 마크다운과 연속 공백을 정리한다", () => {
    expect(stripMarkdown("## 제목\n- 항목  하나")).toBe("제목\n항목 하나");
  });
});

describe("qualityIssue — 재생성으로만 해결되는 결함", () => {
  it("종결부호 없이 끝나면 잘림으로 본다", () => {
    // 실제 노출 사례(p3·p6·p8)
    expect(qualityIssue("올해는 관계를 정리하는 게")).toBe("truncated");
    expect(qualityIssue("주변에 나무 기운을 가까")).toBe("truncated");
  });

  it("정상 종결 문장은 통과", () => {
    expect(qualityIssue("올해는 쉬어가는 해예요.")).toBeNull();
    expect(qualityIssue("정말 그럴까요?")).toBeNull();
    expect(qualityIssue("한 걸음씩 가면 좋아요…")).toBeNull();
  });

  it("깨진 음절은 고치지 않고 반려한다 (뜻을 추측할 수 없다)", () => {
    expect(qualityIssue("2025~2026년쯔음 흐름이 열려요.")).toBe("corrupt");
    expect(qualityIssue("믄고 지켜보는 자세가 좋아요.")).toBe("corrupt");
  });

  it("빈 문자열", () => {
    expect(qualityIssue("   ")).toBe("empty");
  });
});

describe("조사 선택", () => {
  it("받침 판정", () => {
    expect(hasFinalConsonant("부부")).toBe(false);
    expect(hasFinalConsonant("형제")).toBe(false);
    expect(hasFinalConsonant("직장")).toBe(true);
    expect(hasFinalConsonant("한글아님!")).toBe(false);
  });

  it("으로/로 — ㄹ받침은 '로'", () => {
    expect(euroRo("부부")).toBe("로"); // 받침 없음
    expect(euroRo("직장")).toBe("으로"); // 받침 있음
    expect(euroRo("가을")).toBe("로"); // ㄹ받침
  });

  it("이/가 · 은/는 · 을/를 · 과/와", () => {
    expect(iGa("입춘")).toBe("이");
    expect(iGa("소서")).toBe("가");
    expect(eunNeun("입춘")).toBe("은");
    expect(eunNeun("소서")).toBe("는");
    expect(eulReul("직장")).toBe("을");
    expect(eulReul("부부")).toBe("를");
    expect(gwaWa("직장")).toBe("과");
    expect(gwaWa("부부")).toBe("와");
  });
});

describe("궁합 헤드라인 조사 (회귀: '부부으로 잘 맞는')", () => {
  const A = computeSaju({
    birthDate: "1990-03-15",
    birthTime: "14:20",
    gender: "male",
    calendarType: "solar",
    birthRegion: "SEOUL",
    unknownTime: false,
  });
  const B = computeSaju({
    birthDate: "1992-08-02",
    birthTime: "07:10",
    gender: "female",
    calendarType: "solar",
    birthRegion: "SEOUL",
    unknownTime: false,
  });

  it("받침 없는 관계명에 '으로'가 붙지 않는다", () => {
    // 부부·친구·형제는 받침이 없어 '로'. (연인·직장은 받침이 있어 '으로'가 맞다)
    for (const rel of ["couple", "friend", "sibling"] as const) {
      const { headline } = computeCompat(A, B, rel);
      expect(headline).not.toContain("부부으로");
      expect(headline).not.toContain("친구으로");
      expect(headline).not.toContain("형제으로");
    }
  });

  it("받침 있는 관계명에는 '으로'가 붙는다", () => {
    for (const [rel, word] of [
      ["work", "직장"],
      ["lover", "연인"],
    ] as const) {
      const { headline } = computeCompat(A, B, rel);
      // 불꽃형 헤드라인은 조사를 쓰지 않는 문형이라 그 경우는 제외
      if (headline.startsWith(word)) expect(headline).toContain(`${word}으로`);
    }
  });
});
