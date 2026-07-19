#!/usr/bin/env node
/**
 * 클로즈드 베타 초대 코드 발급기.
 * Supabase `beta_codes` 에 코드를 넣고, 고객에게 보낼 초대 링크를 출력한다.
 *
 * 사용:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
 *   node scripts/mint-beta.mjs --count 10 --note "지인 배치1" --base https://palja.app
 *
 * 옵션:
 *   --count N      발급 개수 (기본 5)
 *   --note "..."   메모 (누구에게 줬는지)
 *   --uses N       코드당 최대 사용 횟수 (기본 1)
 *   --base URL     초대 링크 베이스 (기본 http://localhost:3000)
 */

const args = process.argv.slice(2);
function opt(name, def) {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : def;
}

const count = parseInt(opt("count", "5"), 10);
const note = opt("note", "");
const uses = parseInt(opt("uses", "1"), 10);
const base = opt("base", "http://localhost:3000").replace(/\/$/, "");

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("환경변수 SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 가 필요합니다.");
  process.exit(1);
}

// 헷갈리는 문자(0/O/1/I) 제외한 코드 생성
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function gen(len = 6) {
  const b = new Uint8Array(len);
  crypto.getRandomValues(b);
  return [...b].map((n) => ALPHABET[n % ALPHABET.length]).join("");
}

const rows = Array.from({ length: count }, () => ({
  code: gen(),
  note,
  max_uses: uses,
}));

const res = await fetch(`${url}/rest/v1/beta_codes`, {
  method: "POST",
  headers: {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "content-type": "application/json",
    Prefer: "return=representation",
  },
  body: JSON.stringify(rows),
});

if (!res.ok) {
  console.error(`발급 실패 (${res.status}):`, await res.text());
  process.exit(1);
}

console.log(`\n✅ 베타 코드 ${count}개 발급${note ? ` — ${note}` : ""}\n`);
for (const { code } of rows) {
  console.log(`  ${code}   →   ${base}/beta?invite=${code}`);
}
console.log("");
