import { Stamp } from "@/components/ui";
import { PersonForm } from "@/components/PersonForm";

export const dynamic = "force-dynamic";

/**
 * PERSON-NEW (웹) — "누구의 사주를 볼까요?".
 * 세션 마무리 / 상담 허브에서 진입. 발급된 토큰은 내 것과 완전히 분리된 독립 상담.
 */
export default function NewPersonPage() {
  return (
    <main className="screen" style={{ paddingBottom: 40 }}>
      <div className="hstack">
        <Stamp char="命" size={36} />
        <span style={{ fontSize: 12, letterSpacing: "0.32em", color: "var(--ink-40)", fontWeight: 600 }}>
          다른 사람 사주
        </span>
      </div>

      <div style={{ height: 18 }} />
      <h1 style={{ fontFamily: "var(--serif)", fontWeight: 900, fontSize: 29, lineHeight: 1.4, color: "var(--ink)" }}>
        누구의 사주를<br />볼까요?
      </h1>
      <div style={{ height: 8 }} />
      <p className="sub">그 사람 이야기는 따로 봐요. 내 상담은 그대로 남아 있어요.</p>

      <div style={{ height: 22 }} />
      <PersonForm />
    </main>
  );
}
