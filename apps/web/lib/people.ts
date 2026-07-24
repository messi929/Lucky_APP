"use client";

import type { StoredPerson } from "@lucky/api-client";

/**
 * "봐준 사람" 명부 — 기기 로컬(localStorage)만. 서버 저장 없음(원칙 5: 회원가입 금지).
 * 타인 사주는 각자 독립 토큰이라 내 토큰과 자연히 분리된다. 여기 목록은 "다시 찾아가기"용.
 */
const KEY = "palja.people";
const MAX = 12;

export function listPeople(): StoredPerson[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredPerson[];
    if (!Array.isArray(parsed)) return [];
    // 본인 먼저, 그다음 최근 추가 순
    return parsed
      .filter((p) => typeof p?.token === "string")
      .sort((a, b) => Number(b.self ?? false) - Number(a.self ?? false) || b.addedAt - a.addedAt);
  } catch {
    return [];
  }
}

export function rememberPerson(p: Omit<StoredPerson, "addedAt">): void {
  if (typeof window === "undefined") return;
  try {
    const next = [
      { ...p, addedAt: Date.now() },
      ...listPeople().filter((x) => x.token !== p.token),
    ].slice(0, MAX);
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* 사파리 프라이빗 등 저장 실패는 무시 — 명부는 편의 기능이지 정합성 소스가 아니다 */
  }
}

export function forgetPerson(token: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(listPeople().filter((p) => p.token !== token)));
  } catch {
    /* 위와 동일 */
  }
}

/** 목록 표기용 이름 — 호칭 없으면 생년으로 대체 */
export function personLabel(p: StoredPerson): string {
  if (p.self) return p.alias?.trim() || "나";
  return p.alias?.trim() || `${p.birthDate.slice(0, 4)}년생`;
}
