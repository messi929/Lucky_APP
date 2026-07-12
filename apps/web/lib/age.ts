import type { Mode } from "@lucky/core";

/** 생년월일("YYYY-MM-DD") → 만 나이 근사 (기준: 현재 연도) */
export function ageFromBirth(birthDate: string, now = new Date()): number {
  const y = Number(birthDate.slice(0, 4));
  const m = Number(birthDate.slice(5, 7));
  const d = Number(birthDate.slice(8, 10));
  let age = now.getFullYear() - y;
  const beforeBirthday =
    now.getMonth() + 1 < m || (now.getMonth() + 1 === m && now.getDate() < d);
  if (beforeBirthday) age -= 1;
  return age;
}

/** 세대 톤 기본값: 만 40세 경계 (v1.2 §4.2) */
export function defaultMode(age: number): Mode {
  return age >= 40 ? "classic" : "mz";
}

/** 현재 시즌 태그 (하반기/상반기) */
export function currentSeason(now = new Date()): string {
  const half = now.getMonth() + 1 >= 7 ? "H2" : "H1";
  return `${now.getFullYear()}${half}`;
}
