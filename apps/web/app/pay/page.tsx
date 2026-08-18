import { SKUS, type SkuId } from "@lucky/api-client";
import Link from "next/link";
import { Checkout } from "@/components/Checkout";
import { isCommerceEnabled } from "@/lib/commerce";

export const dynamic = "force-dynamic";

/** PAY-1 결제 화면 (§9). /pay?token=&sku=&gift= */
export default async function PayPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; compat?: string; sku?: string; gift?: string }>;
}) {
  const sp = await searchParams;
  const sku = (sp.sku as SkuId) ?? "full_report";

  // 판매를 하지 않는 동안에는 결제 화면 자체를 열지 않는다.
  // CTA를 숨기는 것만으로는 부족하다 — 링크를 아는 사람이 직접 들어올 수 있다.
  if (!isCommerceEnabled()) {
    return (
      <main className="screen center">
        <p className="h-serif" style={{ fontSize: 24, marginBottom: 12 }}>지금은 전부 무료예요.</p>
        <p className="sub" style={{ marginBottom: 20, textAlign: "center", lineHeight: 1.6 }}>
          무료 베타 기간이라 결제 없이 모든 상담을 보실 수 있어요.
        </p>
        <Link href="/" className="btn ink" style={{ width: "auto", padding: "12px 24px" }}>
          처음으로
        </Link>
      </main>
    );
  }

  if ((!sp.token && !sp.compat) || !SKUS[sku]) {
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
      <Checkout token={sp.token} compat={sp.compat} sku={sku} giftDefault={sp.gift === "1"} />
    </main>
  );
}
