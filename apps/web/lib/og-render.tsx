import { ImageResponse } from "next/og";
import {
  computeCompat,
  computeSaju,
  dayMasterByStemIdx,
  iljuHook,
  RELATION_LABEL,
} from "@lucky/core";
import { getCompat, getInput, getInvite } from "./store";

/**
 * 공유 OG 이미지 렌더 (기획서 §8, 카톡 미리보기 1순위 + 9:16 저장용).
 * X7: 한글 폰트 임베딩 — Google Fonts 서브셋(text=)을 런타임 fetch해 satori에 주입.
 *     satori 기본 폰트는 한글 미포함 → 없으면 두부(□). 실패 시 serif 폴백(무회귀).
 *     birthdate-free 요약만 사용(원칙 2).
 */

/** 이미지에 쓰인 글자만 담은 한글 폰트 서브셋 (Node UA → Google이 truetype 반환). 실패 시 null. */
async function loadKoreanFont(text: string): Promise<ArrayBuffer | null> {
  try {
    const url = `https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@700&text=${encodeURIComponent(text)}`;
    const css = await (await fetch(url)).text();
    const src = css.match(/src:\s*url\(([^)]+)\)\s*format\(['"]?(truetype|opentype|woff)['"]?\)/);
    if (!src?.[1]) return null;
    return await (await fetch(src[1])).arrayBuffer();
  } catch {
    return null;
  }
}

type Frame = { eyebrow: string; big: string; sub: string; footer: string };

/** 공통 OG 레이아웃 (paper 바탕, 브랜드 톤). 폰트는 프레임 전체 텍스트로 서브셋. */
async function renderFrame(f: Frame, w: number, h: number): Promise<ImageResponse> {
  const portrait = h > w;
  const allText = `${f.eyebrow}${f.big}${f.sub}${f.footer}`;
  const fontData = await loadKoreanFont(allText);
  const fam = fontData ? "'Noto Serif KR'" : "serif";

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
          fontFamily: fam,
        }}
      >
        <div style={{ display: "flex", color: "#C63D2F", fontSize: portrait ? 40 : 28, letterSpacing: 6 }}>
          {f.eyebrow}
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", color: "#1A1714", fontSize: portrait ? 108 : 76, fontWeight: 700 }}>
            {f.big}
          </div>
          <div
            style={{
              display: "flex",
              color: "#4A443C",
              fontSize: portrait ? 46 : 34,
              lineHeight: 1.4,
              marginTop: 24,
              maxWidth: 900,
            }}
          >
            {f.sub}
          </div>
        </div>
        <div style={{ display: "flex", color: "#8D877D", fontSize: portrait ? 32 : 24 }}>{f.footer}</div>
      </div>
    ),
    {
      width: w,
      height: h,
      ...(fontData ? { fonts: [{ name: "Noto Serif KR", data: fontData, weight: 700 as const, style: "normal" as const }] } : {}),
    },
  );
}

/** 결과 리포트 OG (/r) */
export async function renderOg(token: string, w: number, h: number): Promise<ImageResponse> {
  const input = await getInput(token);
  let big = "사주 카드";
  let sub = "당신의 여덟 글자, 한 자씩 짚어 드릴게요.";
  if (input) {
    const chart = computeSaju(input);
    big = dayMasterByStemIdx(chart.saju.pillarDetails.day.stemIdx).name;
    sub = iljuHook(chart.saju.pillars.day).hook ?? sub;
  }
  return renderFrame({ eyebrow: "겁주지 않는 사주", big, sub, footer: "내 사주 카드 리포트 · 30초" }, w, h);
}

/** 궁합 초대 OG (/c) — 수신자 클릭 유도 */
export async function renderInviteOg(inviteToken: string, w: number, h: number): Promise<ImageResponse> {
  const invite = await getInvite(inviteToken);
  const aInput = invite ? await getInput(invite.ownerToken) : null;
  let big = "우리 궁합 볼래요?";
  let sub = "생년월일만 넣으면 두 사람의 합을 보여드려요.";
  if (invite && aInput) {
    const ch = dayMasterByStemIdx(computeSaju(aInput).saju.pillarDetails.day.stemIdx);
    big = `${RELATION_LABEL[invite.relation]} 궁합`;
    sub = `'${ch.name}' 타입인 분이 당신과의 합을 궁금해해요.`;
  }
  return renderFrame({ eyebrow: "겁주지 않는 사주", big, sub, footer: "앱 설치 없이 · 30초" }, w, h);
}

/** 궁합 결과 OG (/compat) — 자랑·2차 확산 */
export async function renderCompatOg(compatToken: string, w: number, h: number): Promise<ImageResponse> {
  const data = await getCompat(compatToken);
  const aInput = data ? await getInput(data.aToken) : null;
  let big = "두 사람의 합";
  let sub = "우리 궁합, 지금 확인해요.";
  if (data && aInput) {
    const r = computeCompat(computeSaju(aInput), computeSaju(data.bInput), data.relation);
    big = r.gradeLabel;
    sub = `${r.relationLabel} 궁합 · ${r.score}점`;
  }
  return renderFrame({ eyebrow: "겁주지 않는 사주", big, sub, footer: "우리 궁합 보기 · 30초" }, w, h);
}
