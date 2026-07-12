import type { ReportContextInput, ReportPayload } from "@lucky/api-client";
import type {
  CompatResult,
  Mode,
  RelationType,
  SajuInput,
  TaekilPurpose,
  TaekilResult,
} from "@lucky/core";
import { API_BASE } from "./theme";

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = (await res.json()) as T & { error?: string };
  if (!res.ok) throw new Error(json.error ?? "요청에 실패했어요.");
  return json;
}

/** 백엔드(Next.js API) 호출 — 웹과 동일 서버, core·해석·가드레일 재사용(원칙 8). */

export async function createReport(birth: SajuInput): Promise<ReportPayload> {
  const res = await fetch(`${API_BASE}/api/report`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ birth, ctx: { season: "" } }),
  });
  if (!res.ok) throw new Error("리포트를 만들지 못했어요.");
  return (await res.json()) as ReportPayload;
}

export async function fetchReport(
  token: string,
  ctx: Partial<ReportContextInput> = {},
): Promise<ReportPayload> {
  const res = await fetch(`${API_BASE}/api/report`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ token, ctx: { season: "", ...ctx } }),
  });
  if (!res.ok) throw new Error("리포트를 불러오지 못했어요.");
  return (await res.json()) as ReportPayload;
}

export async function fetchDaily(token: string): Promise<{ line: string; todayGanji: string }> {
  return post("/api/daily", { token });
}

// ── 궁합 (§8.1) ──
export const createInvite = (token: string, relation: RelationType) =>
  post<{ inviteToken: string }>("/api/compat", { action: "invite", token, relation });

export const inviteInfo = (inviteToken: string) =>
  post<{ ownerType: string; ownerHanja: string; relationLabel: string }>("/api/compat", {
    action: "invite_info",
    inviteToken,
  });

export const solveCompat = (inviteToken: string, birth: SajuInput) =>
  post<{ compatToken: string; result: CompatResult }>("/api/compat", {
    action: "solve",
    inviteToken,
    birth,
  });

export const compatResult = (compatToken: string) =>
  post<{ result: CompatResult; aHanja: string; bHanja: string }>("/api/compat", {
    action: "result",
    compatToken,
  });

// ── 복채 문답 (§5 ⑤) ──
export const ask = (token: string, question: string, mode: Mode) =>
  post<{ answer: string }>("/api/ask", { token, question, mode });

// ── 택일 (§3, §7.4) ──
export const taekil = (token: string, purpose: TaekilPurpose, startDate: string, endDate: string) =>
  post<TaekilResult>("/api/taekil", { token, purpose, startDate, endDate });

// ── 선물 (§8.2) ──
export const giftInfo = (giftToken: string) =>
  post<{ sku: string; fromMsg: string }>("/api/gift/info", { giftToken });

export const redeemGift = (giftToken: string, birth: SajuInput) =>
  post<{ token: string }>("/api/gift/redeem", { giftToken, birth });
