/**
 * 클로즈드 베타 초대 게이트 — 공용 유틸.
 * 쿠키(웹)·헤더(앱)에 담기는 값은 "유효한 초대 코드를 교환했다"는 서명값이다.
 * Web Crypto(HMAC-SHA256)만 사용 → 미들웨어(edge)·redeem 라우트(node) 모두에서 동작.
 * BETA_SECRET 미설정 시 게이트는 비활성(개방) — 각 소비처가 판단.
 */

export const BETA_COOKIE = "palja_beta";
/** 앱은 쿠키 대신 이 헤더로 자격 증명을 전달 */
export const BETA_HEADER = "x-palja-beta";
const PAYLOAD = "beta-ok:v1";

function toHex(buf: ArrayBuffer): string {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function hmac(secret: string, msg: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(msg));
  return toHex(sig);
}

/** 발급: 쿠키/헤더에 넣을 서명값 */
export function betaCredential(secret: string): Promise<string> {
  return hmac(secret, PAYLOAD);
}

/** 검증: 값이 시크릿 서명과 일치하는가 (상수시간 비교) */
export async function verifyBetaCredential(
  value: string | undefined | null,
  secret: string,
): Promise<boolean> {
  if (!value) return false;
  const expected = await hmac(secret, PAYLOAD);
  if (value.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < value.length; i++) diff |= value.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}
