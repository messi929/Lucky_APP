import { renderOg } from "@/lib/og-render";

export const runtime = "nodejs";
export const alt = "사주 카드 리포트";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** 링크 미리보기(카톡) OG — 1200×630 */
export default async function Image({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return await renderOg(token, size.width, size.height);
}
