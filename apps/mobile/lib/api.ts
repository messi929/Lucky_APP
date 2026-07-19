import type { ReportContextInput, ReportPayload, SessionPayload } from "@lucky/api-client";
import type {
  CompatResult,
  ConcernId,
  Mode,
  RelationType,
  SajuInput,
  TaekilPurpose,
  TaekilResult,
} from "@lucky/core";
import { API_BASE } from "./theme";
import { clearBeta, loadBeta } from "./storage";

/** 초대 전용 베타: 저장된 자격 증명을 헤더로 실어 보낸다(웹 쿠키와 동일 게이트). */
async function betaHeaders(): Promise<Record<string, string>> {
  const beta = await loadBeta();
  return { "content-type": "application/json", ...(beta ? { "x-palja-beta": beta } : {}) };
}

/** 401 = 베타 자격 없음/만료 → 저장값 비우고 재입장 유도 */
export class BetaRequiredError extends Error {
  constructor() {
    super("초대 전용 베타입니다. 초대 코드가 필요해요.");
    this.name = "BetaRequiredError";
  }
}

async function guard(res: Response): Promise<void> {
  if (res.status === 401) {
    await clearBeta();
    throw new BetaRequiredError();
  }
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: await betaHeaders(),
    body: JSON.stringify(body),
  });
  await guard(res);
  const json = (await res.json()) as T & { error?: string };
  if (!res.ok) throw new Error(json.error ?? "요청에 실패했어요.");
  return json;
}

/** 초대 코드 교환 → 자격 증명(서명값) 반환. 저장은 호출부(saveBeta). */
export async function redeemBeta(code: string): Promise<string> {
  const res = await fetch(`${API_BASE}/api/beta/redeem`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ code: code.trim() }),
  });
  const json = (await res.json()) as { ok?: boolean; token?: string; error?: string };
  if (!res.ok || !json.ok || !json.token) {
    throw new Error(json.error ?? "유효하지 않은 초대 코드예요.");
  }
  return json.token;
}

/** 백엔드(Next.js API) 호출 — 웹과 동일 서버, core·해석·가드레일 재사용(원칙 8). */

export async function createReport(birth: SajuInput): Promise<ReportPayload> {
  const res = await fetch(`${API_BASE}/api/report`, {
    method: "POST",
    headers: await betaHeaders(),
    body: JSON.stringify({ birth, ctx: { season: "" } }),
  });
  await guard(res);
  if (!res.ok) throw new Error("리포트를 만들지 못했어요.");
  return (await res.json()) as ReportPayload;
}

export async function fetchReport(
  token: string,
  ctx: Partial<ReportContextInput> = {},
): Promise<ReportPayload> {
  const res = await fetch(`${API_BASE}/api/report`, {
    method: "POST",
    headers: await betaHeaders(),
    body: JSON.stringify({ token, ctx: { season: "", ...ctx } }),
  });
  await guard(res);
  if (!res.ok) throw new Error("리포트를 불러오지 못했어요.");
  return (await res.json()) as ReportPayload;
}

export async function fetchDaily(token: string): Promise<{ line: string; todayGanji: string }> {
  return post("/api/daily", { token });
}

// ── 상담 세션 (concern 1개 집중: 진단→근거→시기→처방) ──
export async function fetchSession(
  token: string,
  concern: ConcernId,
  ctx: Partial<ReportContextInput> = {},
): Promise<SessionPayload> {
  return post<SessionPayload>("/api/session", { token, concern, ctx: { season: "", ...ctx } });
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
