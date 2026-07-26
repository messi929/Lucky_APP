import { CONCERN_HUB, CONSULTANT, concernsForAge, seasonHook, seasonPhase } from "@lucky/core";
import Link from "next/link";
import { Stamp } from "@/components/ui";
import { ageFromBirth } from "@/lib/age";
import { getInput } from "@/lib/store";

export const dynamic = "force-dynamic";

/**
 * 상담 허브 (CONSULT-HUB, 웹) — /s/{token} "오늘 뭐가 궁금해요?".
 * 도사 인사 → 고민 1개 선택 → 집중 세션(/s/{token}/{concern}). 연령 적응 노출은 core 로컬 계산.
 * 모바일 app/consult.tsx와 동일 개념, CONCERN_HUB 단일 소스 공유(원칙 8).
 */
export default async function ConsultHubPage({
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
        <Link href="/" className="btn ink" style={{ display: "inline-block" }}>
          내 사주 보러 가기
        </Link>
      </main>
    );
  }

  const concerns = concernsForAge(ageFromBirth(input.birthDate), 6);
  // 절기 전환 재방문 훅 (A5) — 전환 직후·임박일 때만 노출. 스탬프는 問 하나(화면당 1개 원칙).
  const phase = seasonPhase(new Date());
  const showSeason = phase.justTurned || phase.turningSoon;

  return (
    <main className="screen" style={{ paddingBottom: 40 }}>
      <div className="hstack">
        <Stamp char="問" size={36} />
        <span style={{ fontSize: 12, letterSpacing: "0.32em", color: "var(--ink-40)", fontWeight: 600 }}>
          오늘의 상담
        </span>
      </div>

      <div style={{ height: 10 }} />
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
        <span style={{ fontFamily: "var(--serif)", fontWeight: 900, fontSize: 16, color: "var(--ink)" }}>
          {CONSULTANT.name} {CONSULTANT.title}
        </span>
        <span style={{ fontSize: 12, color: "var(--ink-40)" }}>{CONSULTANT.tagline}</span>
      </div>

      {showSeason && (
        <>
          <div style={{ height: 14 }} />
          <div
            style={{
              border: "1px solid var(--paper-dk)",
              borderLeft: "3px solid var(--gold)",
              borderRadius: 12,
              padding: "12px 14px",
              background: "var(--white, #fff)",
            }}
          >
            <div style={{ fontSize: 11, letterSpacing: "0.2em", color: "var(--gold)", fontWeight: 600, marginBottom: 4 }}>
              절기 · {phase.currentTerm}
            </div>
            <div style={{ fontFamily: "var(--sans)", fontSize: 13.5, color: "var(--ink-70)", lineHeight: 1.5 }}>
              {seasonHook(phase)}
            </div>
          </div>
        </>
      )}

      <div style={{ height: 18 }} />
      <h1 style={{ fontFamily: "var(--serif)", fontWeight: 900, fontSize: 29, lineHeight: 1.4, color: "var(--ink)" }}>
        그래서 — 오늘,<br />뭐가 제일 궁금해요?
      </h1>
      <div style={{ height: 8 }} />
      <p className="sub">하나만 골라요. 그 주제로 끝까지 봐줄게요.</p>

      <div style={{ height: 22 }} />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {concerns.map((c) => (
          <Link
            key={c.id}
            href={`/s/${token}/${c.id}`}
            style={{
              width: "calc(50% - 5px)",
              boxSizing: "border-box",
              background: "var(--white, #fff)",
              border: "1px solid var(--paper-dk)",
              borderRadius: 16,
              padding: 15,
              display: "flex",
              flexDirection: "column",
              gap: 5,
              textDecoration: "none",
            }}
          >
            <span style={{ fontFamily: "var(--serif)", fontWeight: 900, fontSize: 16, color: "var(--gold)" }}>
              {CONCERN_HUB[c.id].hanja}
            </span>
            <span style={{ fontFamily: "var(--sans)", fontWeight: 700, fontSize: 16, color: "var(--ink)" }}>
              {c.label}
            </span>
            <span style={{ fontFamily: "var(--sans)", fontSize: 12, color: "var(--ink-70)" }}>
              {CONCERN_HUB[c.id].sub}
            </span>
          </Link>
        ))}
      </div>

      <div style={{ height: 18 }} />
      <p style={{ fontFamily: "var(--sans)", fontSize: 12, color: "var(--ink-40)", textAlign: "center", lineHeight: 1.5 }}>
        한 번에 다 안 봐도 괜찮아요. 궁금할 때 하나씩 — 그게 상담이에요.
      </p>

      <div style={{ height: 18 }} />
      <div style={{ borderTop: "1px solid var(--paper-dk)", paddingTop: 14, textAlign: "center" }}>
        <Link
          href="/p/new"
          style={{ fontFamily: "var(--sans)", fontSize: 13.5, fontWeight: 600, color: "var(--ink-70)", textDecoration: "none" }}
        >
          다른 사람 사주 보기 →
        </Link>
      </div>
    </main>
  );
}
