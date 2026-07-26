import { renderCompatOg } from "@/lib/og-render";

export const runtime = "nodejs";
export const alt = "궁합 결과 — 겁주지 않는 사주";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** 궁합 결과 링크 미리보기(카톡) OG — 1200×630 */
export default async function Image({ params }: { params: Promise<{ compatToken: string }> }) {
  const { compatToken } = await params;
  return await renderCompatOg(compatToken, size.width, size.height);
}
