import { NextResponse, type NextRequest } from "next/server";
import { BETA_COOKIE, BETA_HEADER, verifyBetaCredential } from "@/lib/beta";

/**
 * 클로즈드 베타 게이트 (원칙 5: 가입 없음·토큰 접근).
 * BETA_SECRET 미설정 → 게이트 비활성(개방). 배포에 BETA_SECRET 등록 시 활성화.
 *
 * 열려 있는(초대 코드 불필요) 경로:
 *  - /beta, /api/beta        : 게이트 페이지·코드 교환
 *  - 수신자 공유 화면·API     : /r /c /g /compat + og·gift·compat·event·push
 *    (원칙 6 — 궁합·선물 수신자에게 설치/가입 요구 금지)
 *  - 법적 고지               : /privacy /terms /business
 * 그 외 메인 퍼널(랜딩·입력·상담·결제)과 그 API는 자격 증명(쿠키 또는 헤더) 필요.
 */

const PUBLIC_PREFIXES = [
  "/beta",
  "/api/beta",
  // 수신자 공유 화면
  "/r",
  "/c",
  "/g",
  "/compat",
  // 수신자·공용 API
  "/api/og",
  "/api/gift",
  "/api/compat",
  "/api/event",
  "/api/push",
  // 법적 고지
  "/privacy",
  "/terms",
  "/business",
];

function isPublic(path: string): boolean {
  return PUBLIC_PREFIXES.some((p) => path === p || path.startsWith(p + "/"));
}

export async function middleware(req: NextRequest): Promise<NextResponse> {
  const secret = process.env.BETA_SECRET;
  if (!secret) return NextResponse.next(); // 게이트 비활성

  const { pathname, search } = req.nextUrl;
  if (isPublic(pathname)) return NextResponse.next();

  const cred = req.cookies.get(BETA_COOKIE)?.value ?? req.headers.get(BETA_HEADER);
  if (await verifyBetaCredential(cred, secret)) return NextResponse.next();

  // API는 리다이렉트 대신 401 (앱·fetch 소비처가 처리)
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "초대 전용 베타입니다" }, { status: 401 });
  }

  const url = req.nextUrl.clone();
  url.pathname = "/beta";
  url.search = `?next=${encodeURIComponent(pathname + search)}`;
  return NextResponse.redirect(url);
}

export const config = {
  // 정적 자산 제외 전 경로
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|gif|webp|ico|txt|xml|woff2?|css|js)$).*)",
  ],
};
