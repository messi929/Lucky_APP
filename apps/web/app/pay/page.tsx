import { SKUS, type SkuId } from "@lucky/api-client";
import Link from "next/link";
import { Checkout } from "@/components/Checkout";

export const dynamic = "force-dynamic";

/** PAY-1 결제 화면 (§9). /pay?token=&sku=&gift= */
export default async function PayPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; sku?: string; gift?: string }>;
}) {
  const sp = await searchParams;
  const sku = (sp.sku as SkuId) ?? "full_report";

  if (!sp.token || !SKUS[sku]) {
    return (
      <main className="screen center">
        <p className="h-serif" style={{ fontSize: 24, marginBottom: 16 }}>결제 정보를 찾지 못했어요.</p>
        <Link href="/input" className="btn ink" style={{ width: "auto", padding: "12px 24px" }}>처음으로</Link>
      </main>
    );
  }

  return (
    <main className="screen">
      <h1 className="h-serif" style={{ fontSize: 24 }}>복채</h1>
      <p className="sub" style={{ fontSize: 13, marginTop: 4 }}>궁금한 만큼만 내세요</p>
      <div style={{ height: 16 }} />
      <Checkout token={sp.token} sku={sku} giftDefault={sp.gift === "1"} />
    </main>
  );
}
