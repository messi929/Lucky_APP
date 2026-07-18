import { SessionView } from "@/components/SessionView";

/** 상담 세션 페이지 (웹 프리뷰) — /s/{token}/{concern} */
export default async function SessionPage({
  params,
}: {
  params: Promise<{ token: string; concern: string }>;
}) {
  const { token, concern } = await params;
  return <SessionView token={token} concern={concern} />;
}
