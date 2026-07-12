"use client";

import { useState } from "react";
import { RELATIONS } from "@/lib/relations";
import { track } from "@/lib/track";

/** REL-1 궁합 초대 (관계 grid → 초대 링크 → 공유). §8.1 */
export function CompatInvite({ token }: { token: string }) {
  const [open, setOpen] = useState(false);
  const [inviteUrl, setInviteUrl] = useState("");
  const [busy, setBusy] = useState(false);

  async function pick(relation: string) {
    setBusy(true);
    try {
      const res = await fetch("/api/compat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "invite", token, relation }),
      });
      const data = (await res.json()) as { inviteToken: string };
      setInviteUrl(`${window.location.origin}/c/${data.inviteToken}`);
    } finally {
      setBusy(false);
    }
  }

  async function share() {
    track("share_click", { channel: "kakao", kind: "compat_invite" });
    if (navigator.share) {
      try {
        await navigator.share({ title: "우리 궁합 볼래요?", url: inviteUrl });
        return;
      } catch {
        /* copy */
      }
    }
    await navigator.clipboard.writeText(inviteUrl);
    alert("초대 링크를 복사했어요. 붙여넣어 보내세요!");
  }

  if (inviteUrl) {
    return (
      <div className="card" style={{ borderRadius: 16 }}>
        <div className="sub" style={{ marginBottom: 8, wordBreak: "break-all" }}>{inviteUrl}</div>
        <button onClick={share} className="btn kakao">카카오톡으로 초대 보내기</button>
      </div>
    );
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="card" style={{ borderRadius: 16, padding: 18, textAlign: "left" }}>
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>궁합 · 가족 보기</div>
        <div className="fine" style={{ fontSize: 12 }}>그 사람과 나, 부모님과 나</div>
      </button>
    );
  }

  return (
    <div className="card" style={{ borderRadius: 16 }}>
      <div className="sub" style={{ marginBottom: 10 }}>누구와의 사이가 궁금해요?</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        {RELATIONS.map((r) => (
          <button
            key={r.code}
            disabled={busy}
            onClick={() => pick(r.code)}
            className="tile"
            style={{ textAlign: "center" }}
          >
            <div style={{ fontSize: 22, marginBottom: 6 }}>{r.emoji}</div>
            <div style={{ fontWeight: 700, fontSize: 13 }}>{r.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
