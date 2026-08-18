"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { StoredPerson } from "@lucky/api-client";
import { listPeople } from "@/lib/people";
import { track } from "@/lib/track";

/**
 * 홈 "이어보기" — 기기 명부(localStorage)에 남은 지난 리포트로 돌아가는 길.
 * 웹은 회원가입이 없어 토큰이 유일한 열쇠라, 이 진입로가 없으면 링크를 잃는 순간
 * 결제한 리포트까지 영구 소실된다. 서버 조회 없음(원칙 5).
 * 명부가 비면 아무것도 렌더하지 않아 첫 방문 화면은 그대로 둔다.
 */
export function ResumeCard() {
  const [mine, setMine] = useState<StoredPerson | null>(null);

  // localStorage는 서버에 없다 — 마운트 후에만 읽어 하이드레이션 불일치를 피한다.
  useEffect(() => {
    setMine(listPeople().find((p) => p.self) ?? null);
  }, []);

  if (!mine) return null;

  return (
    <>
      <div style={{ height: 8 }} />
      <Link href={`/r/${mine.token}`} className="btn ghost">
        이어보기 — 지난 리포트
      </Link>
      {/* 재방문 훅(무료). 사주는 1회성이지만 꿈은 주 단위로 생긴다 — DREAM-DESIGN §0 */}
      <div style={{ height: 8 }} />
      <Link
        href={`/dream/${mine.token}`}
        onClick={() => track("dream_open", { source: "home" })}
        className="btn ghost"
      >
        어젯밤 꿈 풀어보기 — 무료
      </Link>
    </>
  );
}
