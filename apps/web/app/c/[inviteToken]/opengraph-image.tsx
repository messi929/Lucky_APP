import { renderInviteOg } from "@/lib/og-render";

export const runtime = "nodejs";
export const alt = "궁합 초대 — 겁주지 않는 사주";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** 궁합 초대 링크 미리보기(카톡) OG — 1200×630 */
export default async function Image({ params }: { params: Promise<{ inviteToken: string }> }) {
  const { inviteToken } = await params;
  return await renderInviteOg(inviteToken, size.width, size.height);
}
