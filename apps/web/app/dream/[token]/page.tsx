import Link from "next/link";
import { DreamDeck } from "@/components/DreamDeck";
import { getInput } from "@/lib/store";

export const dynamic = "force-dynamic";

/**
 * 꿈 해석 (무료 훅) — /dream/{token}.
 * 토큰이 있어야 원국과 엮인다. 없으면 입력으로 유도 — 이것도 유입 경로다.
 */
export default async function DreamPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const input = await getInput(token);

  if (!input) {
    return (
      <main className="screen center text-center">
        <p className="font-serif text-2xl text-ink mb-4">먼저 사주를 봐야 해요.</p>
        <p className="text-ink-muted mb-6">꿈은 당신 원국과 엮어서 풀어드리거든요.</p>
        <Link href="/input" className="btn ink" style={{ display: "inline-block" }}>
          30초 만에 내 팔자 보기 — 무료
        </Link>
      </main>
    );
  }

  return <DreamDeck token={token} />;
}
