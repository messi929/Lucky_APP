"use client";

import { useEffect, useMemo, useState } from "react";
import type { RetroProbeView } from "@lucky/api-client";
import { Stamp } from "./ui";
import { track } from "@/lib/track";

/**
 * 과거 검증 카드 (PROCESS-DESIGN §5) — 신뢰 방아쇠.
 * "당신은 이런 사람" 다음에 "그때 이러지 않았어요?"로 과거를 짚는다.
 * 질문형 + [맞아요/아니요] 응답을 기기 로컬에 저장(원칙 5: 계정 없음).
 *
 * 응답은 두 가지로 쓰인다:
 *  - 즉시: "맞아요" 비율이 높으면 이 사람에게 검증이 통했다는 신호
 *  - 축적: 어떤 대운 휴리스틱이 실제로 맞는지 캘리브레이션 데이터(경쟁 우위)
 */

type Answer = "yes" | "no";

function storageKey(token: string): string {
  return `palja.retro.${token}`;
}

function loadAnswers(token: string): Record<number, Answer> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(storageKey(token));
    return raw ? (JSON.parse(raw) as Record<number, Answer>) : {};
  } catch {
    return {};
  }
}

function saveAnswer(token: string, pivotYear: number, answer: Answer): void {
  if (typeof window === "undefined") return;
  try {
    const next = { ...loadAnswers(token), [pivotYear]: answer };
    window.localStorage.setItem(storageKey(token), JSON.stringify(next));
  } catch {
    /* 프라이빗 모드 등 저장 실패는 무시 — 카드 동작 자체는 막지 않는다 */
  }
}

export function RetroCard({ token, probes }: { token: string; probes: RetroProbeView[] }) {
  // 한 화면에 하나씩 — 카드 1장=질문 1개(원칙 7). 가장 최근 전환을 먼저 보여준다.
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, Answer>>({});

  useEffect(() => {
    setAnswers(loadAnswers(token));
  }, [token]);

  const probe = probes[idx];
  const answered = probe ? answers[probe.pivotYear] : undefined;
  const hits = useMemo(
    () => probes.filter((p) => answers[p.pivotYear] === "yes").length,
    [probes, answers],
  );

  if (!probe) return null;

  function answer(a: Answer) {
    if (!probe) return;
    saveAnswer(token, probe.pivotYear, a);
    setAnswers((prev) => ({ ...prev, [probe.pivotYear]: a }));
    track("retro_answer", { pivotYear: probe.pivotYear, answer: a });
  }

  const isLast = idx >= probes.length - 1;

  return (
    <>
      <div className="hstack">
        <Stamp char="眞" size={36} />
        <span className="eyebrow" style={{ letterSpacing: "0.1em" }}>
          짚어볼게요 · {idx + 1}/{probes.length}
        </span>
      </div>

      <div style={{ height: 22 }} />
      <div
        className="h-serif"
        style={{ fontSize: 26, lineHeight: 1.5, color: "var(--ink)" }}
      >
        {probe.fromYear}년에서 {probe.toYear}년 사이,
        <br />
        {probe.question}
      </div>
      <div style={{ height: 8 }} />
      <div className="fine" style={{ fontSize: 12 }}>그때 {probe.age}살 무렵이에요.</div>

      <div style={{ height: 28 }} />

      {answered === undefined ? (
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn ink" style={{ flex: 1 }} onClick={() => answer("yes")}>
            맞아요
          </button>
          <button className="btn ghost" style={{ flex: 1 }} onClick={() => answer("no")}>
            아니요
          </button>
        </div>
      ) : (
        <>
          {/* 낙관은 화면당 1~2곳(디자인 원칙 1). "맞아요"에만 주홍을 쓴다 */}
          <div
            className="h-serif"
            style={{
              fontSize: 20,
              color: answered === "yes" ? "var(--vermil)" : "var(--ink-70)",
            }}
          >
            {answered === "yes"
              ? hits >= 2
                ? "이쯤 되면, 나머지 얘기도 한번 들어볼 만하죠."
                : "그쵸. 사주는 이렇게 지나온 자리부터 맞혀요."
              : "그럴 수도 있어요. 사람마다 결이 다르니까요."}
          </div>
          <div style={{ height: 20 }} />
          {!isLast ? (
            <button className="btn ghost" onClick={() => setIdx((i) => i + 1)}>
              하나 더 짚어볼까요
            </button>
          ) : (
            <div className="fine" style={{ fontSize: 12 }}>
              넘겨서, 이제 당신 차례예요.
            </div>
          )}
        </>
      )}
    </>
  );
}
