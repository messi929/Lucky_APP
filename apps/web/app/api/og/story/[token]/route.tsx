import { renderOg } from "@/lib/og-render";

export const runtime = "nodejs";

/** 인스타 스토리·저장용 9:16 OG — 1080×1920 (기획서 §6 카드7 저장 버튼) */
export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return await renderOg(token, 1080, 1920);
}
