import Link from "next/link";
import { TaekilForm } from "@/components/TaekilForm";
import { getInput, isPaid } from "@/lib/store";

export const dynamic = "force-dynamic";

/** PAY-4 택일 리포트 (유료 SKU, §7.4). /vertical/taekil?token= */
export default async function TaekilPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
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
        <div className="h-serif" style={{ fontSize: 26 }}>택일 리포트</div>
        <p className="sub" style={{ marginTop: 8 }}>이사·개업·계약, 당신의 일간에 맞는 좋은 날을 골라 드려요.</p>
        <div className="grow" />
        <Link href={`/pay?token=${token}&sku=taekil`} className="btn ink">6,900원 · 택일 열기</Link>
      </main>
    );
  }

  return (
    <main className="screen">
      <h1 className="h-serif" style={{ fontSize: 24 }}>택일 · 좋은 날 찾기</h1>
      <p className="sub" style={{ marginTop: 4 }}>당신의 일간 기준으로 골라 드려요.</p>
      <div style={{ height: 16 }} />
      <TaekilForm token={token} />
    </main>
  );
}
