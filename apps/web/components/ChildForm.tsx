"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { SajuInput } from "@lucky/core";
import { BirthFields } from "./BirthFields";

/** 자녀 생년월일 입력 → 자녀 리포트 (가족 루프, §8.1) */
export function ChildForm({ parentToken }: { parentToken: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function submit(birth: SajuInput) {
    setBusy(true);
    setErr("");
    try {
      const res = await fetch("/api/child", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ parentToken, birth }),
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
      <BirthFields submitLabel="자녀 사주 보기" onSubmit={submit} busy={busy} />
      {err && <p className="text-vermilion text-sm mt-3">{err}</p>}
    </>
  );
}
