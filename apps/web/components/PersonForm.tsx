"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { SajuInput } from "@lucky/core";
import { BirthFields } from "./BirthFields";
import { listPeople, personLabel, rememberPerson } from "@/lib/people";
import type { StoredPerson } from "@lucky/api-client";

/**
 * 타인 사주 입력 (PERSON-NEW). 호칭(선택) + 생년월일 → 독립 토큰 발급 → 그 사람의 상담 허브로.
 * 궁합이 아니라 "그 사람 단독 리포트" — 내 토큰과 분리 보관(명부는 기기 로컬).
 */
export function PersonForm() {
  const router = useRouter();
  const [alias, setAlias] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [people, setPeople] = useState<StoredPerson[]>([]);

  useEffect(() => setPeople(listPeople()), []);

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
      rememberPerson({ token: data.token, alias: alias.trim() || undefined, birthDate: birth.birthDate });
      router.push(`/s/${data.token}`);
    } catch {
      setErr("잠시 문제가 생겼어요. 다시 시도해 주세요.");
      setBusy(false);
    }
  }

  const others = people.filter((p) => !p.self);

  return (
    <>
      <label className="field" style={{ display: "block", marginBottom: 10 }}>
        <span className="fl">호칭 · 선택</span>
        <input
          value={alias}
          onChange={(e) => setAlias(e.target.value.slice(0, 12))}
          placeholder="엄마, 동생, 친구…"
          className="fv"
          style={{ width: "100%", border: 0, outline: "none", background: "transparent", padding: 0 }}
        />
      </label>
      <p style={{ fontSize: 12, color: "var(--ink-40)", marginBottom: 14, lineHeight: 1.5 }}>
        이름은 안 물어봐요. 호칭은 이 기기에서 목록을 알아보기 위한 것이고, 비워도 됩니다.
      </p>

      <BirthFields submitLabel="이 사람 사주 보기" onSubmit={submit} busy={busy} />
      {err && <p style={{ color: "var(--vermil)", fontSize: 13, marginTop: 8 }}>{err}</p>}

      {others.length > 0 && (
        <>
          <div style={{ height: 26 }} />
          <div style={{ fontSize: 12, color: "var(--ink-40)", letterSpacing: "0.05em", marginBottom: 8 }}>
            전에 봐준 사람
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {others.map((p) => (
              <button
                key={p.token}
                className="chip"
                onClick={() => router.push(`/s/${p.token}`)}
                style={{ border: 0, cursor: "pointer" }}
              >
                {personLabel(p)}
              </button>
            ))}
          </div>
        </>
      )}
    </>
  );
}
