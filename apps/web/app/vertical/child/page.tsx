import Link from "next/link";
import { ChildForm } from "@/components/ChildForm";
import { getInput, isPaid } from "@/lib/store";

export const dynamic = "force-dynamic";

/** PAY-3 자녀운 — 가족 루프 (§7.4). /vertical/child?token= */
export default async function ChildPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  const input = token ? await getInput(token) : null;

  if (!token || !input) {
    return (
      <main className="screen center">
        <p className="h-serif" style={{ fontSize: 24, marginBottom: 16 }}>먼저 사주를 봐야 해요.</p>
        <Link href="/input" className="btn ink" style={{ width: "auto", padding: "12px 24px" }}>내 사주 보러 가기</Link>
      </main>
    );
  }

  if (!(await isPaid(token))) {
    return (
      <main className="screen center">
        <div className="grow" />
        <div className="h-serif" style={{ fontSize: 26 }}>자녀운 리포트</div>
        <p className="sub" style={{ marginTop: 8 }}>수능·취업·혼사, 아이의 흐름을 부모의 눈으로.</p>
        <div className="grow" />
        <Link href={`/pay?token=${token}&sku=child_fortune`} className="btn ink">9,900원 · 자녀운 열기</Link>
      </main>
    );
  }

  return (
    <main className="screen">
      <h1 className="h-serif" style={{ fontSize: 24 }}>자녀운 리포트</h1>
      <p className="sub" style={{ marginTop: 4 }}>아이의 팔자로 봐드립니다 — 부모님 것과 함께.</p>
      <div className="hstack" style={{ gap: 8, marginTop: 16 }}>
        <span className="chip" style={{ background: "var(--ink)", color: "var(--paper)", fontWeight: 700 }}>수능운</span>
        <span className="chip">취업운</span>
        <span className="chip">혼사운</span>
      </div>
      <div style={{ height: 16 }} />
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: "var(--vermil)", marginBottom: 4 }}>불안을 팔지 않습니다</div>
        <div className="sub" style={{ fontSize: 12 }}>아이를 겁주는 말 대신, 힘이 되는 시기와 페이스를 알려드려요. (가드레일 L3)</div>
      </div>
      <ChildForm parentToken={token} />
    </main>
  );
}
