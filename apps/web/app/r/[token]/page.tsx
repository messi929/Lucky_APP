import type { InterpretContext } from "@lucky/core";
import Link from "next/link";
import { ReportDeck } from "@/components/ReportDeck";
import { ageFromBirth, currentSeason, defaultMode } from "@/lib/age";
import { buildReport } from "@/lib/report";
import { getInput, isPaid } from "@/lib/store";

export const dynamic = "force-dynamic";

/** /r/{token} — 공유·재방문 SSR (기획서 §2.3 단일 포맷) */
export default async function ResultPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const input = await getInput(token);

  if (!input) {
    return (
      <main className="screen center text-center">
        <p className="font-serif text-2xl text-ink mb-4">결과를 찾지 못했어요.</p>
        <p className="text-ink-muted mb-6">링크가 만료되었거나 잘못된 주소예요.</p>
        <Link href="/" className="tap inline-block rounded-card bg-ink text-hanji px-6 py-3">
          내 사주 보러 가기
        </Link>
      </main>
    );
  }

  const age = ageFromBirth(input.birthDate);
  const ctx: InterpretContext = {
    season: currentSeason(),
    mode: defaultMode(age),
    ...((await isPaid(token)) ? { paid: true } : {}),
  };
  const payload = await buildReport(token, input, ctx);

  return <ReportDeck initial={payload} />;
}
