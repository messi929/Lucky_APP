"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import type { SajuInput } from "@lucky/core";
import { BirthFields } from "./BirthFields";
import { InkCircle } from "./ui";

/** REL-2 궁합 초대 수신자 랜딩 (§8.1). A 타입 먼저 노출 → B 입력. 무조건 웹(설치 요구 금지). */
export function InviteLanding({
  ownerType,
  ownerHanja,
  relationLabel,
  inviteToken,
}: {
  ownerType: string;
  ownerHanja: string;
  relationLabel: string;
  inviteToken: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function solve(birth: SajuInput) {
    setBusy(true);
    setErr("");
    try {
      const res = await fetch("/api/compat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "solve", inviteToken, birth }),
      });
      if (!res.ok) throw new Error();
      const data = (await res.json()) as { compatToken: string };
      router.push(`/compat/${data.compatToken}`);
    } catch {
      setErr("잠시 문제가 생겼어요. 다시 시도해 주세요.");
      setBusy(false);
    }
  }

  return (
    <main className="screen center">
      <div className="grow" />
      <InkCircle char={ownerHanja} size={120} />
      <div style={{ height: 20 }} />
      <div className="h-serif" style={{ fontSize: 24 }}>
        &lsquo;{ownerType}&rsquo; 타입인 분이
        <br />
        {relationLabel} 궁합을 요청했어요
      </div>
      <div style={{ height: 8 }} />
      <p className="sub">
        생년월일만 넣으면 두 사람의 합을 보여드려요.
        <br />
        앱 설치 없이 바로.
      </p>
      <div style={{ height: 24, width: "100%" }} />
      <div style={{ width: "100%", textAlign: "left" }}>
        <BirthFields submitLabel="우리 궁합 보기" onSubmit={solve} busy={busy} />
      </div>
      {err && <p style={{ color: "var(--vermil)", fontSize: 13, marginTop: 8 }}>{err}</p>}
      <div style={{ height: 12 }} />
      <Link href="/input" style={{ fontSize: 12, fontWeight: 500, color: "var(--vermil)" }}>
        내 팔자 전체가 궁금하다면 → 내 리포트 만들기
      </Link>
    </main>
  );
}
