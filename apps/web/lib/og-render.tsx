import { ImageResponse } from "next/og";
import { computeSaju, iljuHook, dayMasterByStemIdx } from "@lucky/core";
import { getInput } from "./store";

/**
 * 공유 OG 이미지 렌더 (기획서 §8, 카톡 미리보기 1순위 + 9:16 저장용).
 * ⚠️ 한글 폰트 임베딩은 디자인 트랙 폴리시 항목(satori 기본 폰트는 한글 미포함 → 폰트 추가 필요).
 *    구조·데이터는 완비. 여기선 birthdate-free 요약만 사용(원칙 2).
 */
export async function renderOg(token: string, w: number, h: number): Promise<ImageResponse> {
  const input = await getInput(token);
  const portrait = h > w;

  let name = "사주 카드";
  let hook = "당신의 여덟 글자, 한 자씩 짚어 드릴게요.";
  if (input) {
    const chart = computeSaju(input);
    name = dayMasterByStemIdx(chart.saju.pillarDetails.day.stemIdx).name;
    hook = iljuHook(chart.saju.pillars.day).hook ?? hook;
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#F5F0E8",
          padding: portrait ? 80 : 64,
          fontFamily: "serif",
        }}
      >
        <div style={{ display: "flex", color: "#C63D2F", fontSize: portrait ? 40 : 28, letterSpacing: 6 }}>
          겁주지 않는 사주
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", color: "#1A1714", fontSize: portrait ? 120 : 80, fontWeight: 700 }}>
            {name}
          </div>
          <div
            style={{
              display: "flex",
              color: "#4A443C",
              fontSize: portrait ? 48 : 34,
              lineHeight: 1.4,
              marginTop: 24,
              maxWidth: portrait ? 900 : 900,
            }}
          >
            {hook}
          </div>
        </div>
        <div style={{ display: "flex", color: "#8D877D", fontSize: portrait ? 32 : 24 }}>
          내 사주 카드 리포트 · 30초
        </div>
      </div>
    ),
    { width: w, height: h },
  );
}
