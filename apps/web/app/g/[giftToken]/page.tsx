import Link from "next/link";
import { GiftRedeem } from "@/components/GiftRedeem";
import { getGift } from "@/lib/store";

export const dynamic = "force-dynamic";

/** GIFT-1 선물 수신 — 언박싱 (§8.2 유료 바이럴 루프) */
export default async function GiftPage({ params }: { params: Promise<{ giftToken: string }> }) {
  const { giftToken } = await params;
  const gift = await getGift(giftToken);

  if (!gift) {
    return (
      <main className="screen center">
        <p className="h-serif" style={{ fontSize: 24, marginBottom: 16 }}>선물을 찾지 못했어요.</p>
        <Link href="/input" className="btn ink" style={{ width: "auto", padding: "12px 24px" }}>내 사주 보러 가기</Link>
      </main>
    );
  }

  return (
    <main className="screen center">
      <div className="grow" />
      <div
        style={{
          width: 180,
          height: 180,
          borderRadius: 20,
          background: "var(--vermil)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span style={{ fontFamily: "var(--serif)", fontWeight: 900, fontSize: 84, color: "var(--paper)" }}>福</span>
      </div>
      <div style={{ height: 24 }} />
      <div className="h-serif" style={{ fontSize: 24 }}>사주 리포트를<br />선물받았어요</div>
      {gift.fromMsg && (
        <div className="card" style={{ padding: 14, marginTop: 10 }}>
          <div className="sub" style={{ fontSize: 13 }}>&ldquo;{gift.fromMsg}&rdquo;</div>
        </div>
      )}
      <div style={{ height: 12 }} />
      <p className="fine">생년월일 입력 후 바로 열람 · 앱 설치 불필요 · 복채는 이미 냈답니다</p>
      <div className="grow" />
      <div style={{ width: "100%", textAlign: "left" }}>
        <GiftRedeem giftToken={giftToken} />
      </div>
    </main>
  );
}
