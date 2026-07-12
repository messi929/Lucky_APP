"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { SajuInput } from "@lucky/core";
import { BirthFields } from "./BirthFields";
import { track } from "@/lib/track";

export function InputForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => track("input_start"), []);

  async function submit(birth: SajuInput) {
    setBusy(true);
    setErr("");
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ birth, ctx: { season: "" } }),
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
      <BirthFields submitLabel="팔자 적으러 가기" onSubmit={submit} busy={busy} />
      {err && <p style={{ color: "var(--vermil)", fontSize: 13, marginTop: 8 }}>{err}</p>}
    </>
  );
}
