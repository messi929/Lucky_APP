"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { SKUS, type SkuId } from "@lucky/api-client";
import { track } from "@/lib/track";

/** PAY-1 결제 (§9). 청약철회 제한 고지 + 명시적 동의 체크 필수(원칙 9, 전자상거래법). */
export function Checkout({ token, sku, giftDefault }: { token: string; sku: SkuId; giftDefault: boolean }) {
  const router = useRouter();
  const product = SKUS[sku];
  const [consent, setConsent] = useState(false);
  const [gift, setGift] = useState(giftDefault);
  const [fromMsg, setFromMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [giftUrl, setGiftUrl] = useState("");

  async function pay() {
    if (!consent) return setErr("청약철회 제한 안내에 동의해 주세요.");
    setErr("");
    setBusy(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token, sku, withdrawalConsent: consent, gift, fromMsg }),
      });
      const data = (await res.json()) as { ok?: boolean; giftToken?: string; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error ?? "결제 실패");
      if (gift && data.giftToken) setGiftUrl(`${window.location.origin}/g/${data.giftToken}`);
      else router.push(`/r/${token}`);
    } catch (e) {
      setErr((e as Error).message);
      setBusy(false);
    }
  }

  if (giftUrl) {
    return (
      <div className="card" style={{ borderRadius: 16 }}>
        <div className="h-serif" style={{ fontSize: 20, marginBottom: 8 }}>선물이 준비됐어요 🎁</div>
        <div className="sub" style={{ marginBottom: 10, wordBreak: "break-all" }}>{giftUrl}</div>
        <button
          onClick={() => { track("share_click", { channel: "kakao", kind: "gift" }); void navigator.clipboard.writeText(giftUrl); alert("선물 링크를 복사했어요!"); }}
          className="btn kakao"
        >
          카카오톡으로 선물 보내기
        </button>
      </div>
    );
  }

  return (
    <>
      <div style={{ background: "var(--ink)", borderRadius: 16, padding: 16, display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: "var(--paper)" }}>{product.label}</div>
          {product.note && <div style={{ fontSize: 11, color: "#CCC5BB" }}>{product.note}</div>}
        </div>
        <div style={{ fontFamily: "var(--serif)", fontWeight: 900, color: "var(--paper)" }}>{product.price.toLocaleString()}원</div>
      </div>

      <label className="hstack" style={{ marginTop: 16, cursor: "pointer" }}>
        <input type="checkbox" checked={gift} onChange={(e) => setGift(e.target.checked)} />
        <span className="sub">선물하기 (받는 분이 생일 넣고 열람)</span>
      </label>
      {gift && (
        <input
          value={fromMsg}
          onChange={(e) => setFromMsg(e.target.value)}
          placeholder="받는 분께 한 줄 (선택)"
          className="field"
          style={{ marginTop: 8, fontWeight: 400 }}
        />
      )}

      <div className="grow" />

      {/* 원칙 9: 청약철회 제한 고지 + 명시적 동의 */}
      <div style={{ background: "var(--white)", border: "1px solid var(--vermil)", borderRadius: 12, padding: "12px 14px", display: "flex", gap: 10, alignItems: "flex-start", marginTop: 16 }}>
        <button
          onClick={() => setConsent(!consent)}
          aria-pressed={consent}
          style={{ minWidth: 20, height: 20, borderRadius: 6, border: "none", cursor: "pointer", background: consent ? "var(--vermil)" : "var(--paper-dk)", color: "var(--paper)", fontSize: 12, fontWeight: 700 }}
        >
          {consent ? "✓" : ""}
        </button>
        <span className="fine" style={{ fontSize: 11, color: "var(--ink-70)" }}>
          디지털 콘텐츠 특성상 <b style={{ color: "var(--ink)" }}>열람 후에는 청약철회가 제한</b>됨을 확인했고 이에 동의합니다. (전자상거래법)
        </span>
      </div>

      {err && <p style={{ color: "var(--vermil)", fontSize: 13, marginTop: 8 }}>{err}</p>}
      <div style={{ height: 8 }} />
      <button onClick={pay} disabled={busy} className="btn ink">
        {busy ? "결제 중…" : gift ? `선물 결제 · ${product.price.toLocaleString()}원` : `복채 내기 · ${product.price.toLocaleString()}원`}
      </button>
      <div style={{ height: 6 }} />
      <div className="fine" style={{ textAlign: "center" }}>
        토스페이먼츠 안전결제(준비 중, 현재 데모) · <Link href="/business" style={{ color: "var(--ink-40)" }}>사업자정보</Link> · <Link href="/terms" style={{ color: "var(--ink-40)" }}>이용약관</Link>
      </div>
    </>
  );
}
