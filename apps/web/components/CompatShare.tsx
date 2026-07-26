"use client";

import { track } from "@/lib/track";

/**
 * REL-3 궁합 결과 재공유(자랑) — 2차 확산 훅.
 * me 파라미터 없는 깨끗한 결과 URL만 공유(수신자 토큰 누수 방지).
 */
export function CompatShare({ path }: { path: string }) {
  async function share() {
    const url = `${window.location.origin}${path}`;
    track("share_click", { channel: "kakao", kind: "compat_result" });
    if (navigator.share) {
      try {
        await navigator.share({ title: "우리 궁합 나왔어요", url });
        return;
      } catch {
        /* copy */
      }
    }
    await navigator.clipboard.writeText(url);
    alert("결과 링크를 복사했어요. 붙여넣어 자랑해 보세요!");
  }

  return (
    <button onClick={share} className="btn kakao">
      카카오톡으로 자랑하기
    </button>
  );
}
