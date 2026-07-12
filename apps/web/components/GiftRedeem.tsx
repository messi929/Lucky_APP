"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { SajuInput } from "@lucky/core";
import { BirthFields } from "./BirthFields";

/** 선물 수신자 언락 폼 (§8.2). 생일 입력 → 유료 리포트 열람. */
export function GiftRedeem({ giftToken }: { giftToken: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function redeem(birth: SajuInput) {
    setBusy(true);
    setErr("");
    try {
      const res = await fetch("/api/gift/redeem", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ giftToken, birth }),
      });
      if (!res.ok) throw new Error();
      const data = (await res.json()) as { token: string };
      router.push(`/r/${data.token}`);
    } catch {
      setErr("잠시 문제가 생겼어요. 다시 시도해 주세요.");
      setBusy(false);
    }
  }

  return (
    <>
      <BirthFields submitLabel="선물 열어보기" onSubmit={redeem} busy={busy} />
      {err && <p className="text-vermilion text-sm mt-3">{err}</p>}
    </>
  );
}
