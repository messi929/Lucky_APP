"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { SKUS, type SkuId } from "@lucky/api-client";
import { track } from "@/lib/track";

/** 비교 문구의 기준 주제 수. 990원 × 이 값이 3,900원을 넘는 최소 개수(4). */
const COMPARE_TOPICS = 4;

/**
 * PAY-1 결제 (§9). 청약철회 제한 고지 + 명시적 동의 체크 필수(원칙 9, 전자상거래법).
 * `compat`이 오면 소유자 토큰 대신 궁합 토큰만 들고 있는다 — 토큰=열람 열쇠라
 * 상대 화면에 실리면 리포트 전체가 열린다(사용성 테스트 2026-08-08).
 */
export function Checkout({
  token,
  compat,
  sku,
  giftDefault,
}: {
  token?: string;
  compat?: string;
  sku: SkuId;
  giftDefault: boolean;
}) {
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
        body: JSON.stringify({ token, compat, sku, withdrawalConsent: consent, gift, fromMsg }),
      });
      const data = (await res.json()) as { ok?: boolean; giftToken?: string; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error ?? "결제 실패");
      if (gift && data.giftToken) setGiftUrl(`${window.location.origin}/g/${data.giftToken}`);
      // 궁합 결제자는 소유자 리포트로 보내지 않는다(열람 권한이 없다) — 보던 궁합 결과로 복귀.
      else router.push(compat ? `/compat/${compat}` : `/r/${token}`);
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

      {/* 기간제·무갱신 고지 (전자상거래법). 7일 패스는 구매 전후 안내가 0글자였다. */}
      {product.notice && (
        <p style={{ fontSize: 12, color: "var(--ink-70)", lineHeight: 1.55, marginTop: 10 }}>{product.notice}</p>
      )}

      {/* 세 가격의 관계를 여기서 처음 보여 준다. 990원 구매자 2명 모두 이 비교 때문이었는데
          정작 이 문구는 세션 페이월에만 있었다(사용성 테스트 2026-08-08). */}
      <div className="card" style={{ marginTop: 12 }}>
        <div style={{ fontSize: 11, letterSpacing: "0.2em", color: "var(--ink-40)", marginBottom: 8 }}>세 가지 중에서</div>
        {(["session_unlock", "season_pass", "full_report"] as SkuId[]).map((id) => {
          const s = SKUS[id];
          const here = s.id === sku;
          return (
            <div
              key={id}
              style={{ display: "flex", gap: 8, alignItems: "baseline", padding: "5px 0", fontSize: 13, color: here ? "var(--ink)" : "var(--ink-70)", fontWeight: here ? 700 : 400 }}
            >
              <span style={{ flex: 1 }}>{here ? "지금 보는 것 · " : ""}{s.label}</span>
              <span style={{ fontFamily: "var(--serif)", fontWeight: 700 }}>{s.price.toLocaleString()}원</span>
            </div>
          );
        })}
        <div style={{ height: 6 }} />
        <p style={{ fontSize: 12, color: "var(--ink-70)", lineHeight: 1.55 }}>
          주제 {COMPARE_TOPICS}개를 따로 열면 {(SKUS.session_unlock.price * COMPARE_TOPICS).toLocaleString()}원 —{" "}
          <b style={{ color: "var(--ink)" }}>전체 {SKUS.full_report.price.toLocaleString()}원</b>이 더 쌉니다.
        </p>
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
