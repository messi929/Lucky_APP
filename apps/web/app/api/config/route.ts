import { isCommerceEnabled } from "@/lib/commerce";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/config — 클라이언트가 부팅 시 읽는 운영 스위치.
 *
 * 판매 여부의 단일 소스는 서버(lib/commerce.ts)다. 웹은 서버 렌더라 그 함수를 직접 부르지만,
 * 앱은 번들이 스토어에 박혀 있어 그럴 수 없다. 앱에 같은 판정을 복제하면 웹을 켜고 앱을 못 켜는
 * (혹은 그 반대의) 어긋남이 언젠가 생기므로, 스위치를 복제하는 대신 물어보게 한다.
 *
 * 베타 게이트 앞에 열어 둔다 — 앱은 초대 코드를 넣기 전에도 화면을 그려야 하고,
 * 여기엔 자격이 필요한 정보가 없다.
 */
export function GET(): Response {
  return Response.json(
    { commerce: isCommerceEnabled() },
    { headers: { "cache-control": "public, max-age=300" } },
  );
}
