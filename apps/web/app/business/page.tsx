import Link from "next/link";
import { BUSINESS_INFO } from "@/lib/business-info";
import { isCommerceEnabled } from "@/lib/commerce";

export const metadata = { title: "사업자정보 — 팔자 리포트" };

/**
 * 사업자정보 표시 (전자상거래법 의무, §12.2).
 *
 * 판매를 시작하기 전까지는 표시할 사업자정보가 없다. 플레이스홀더("TODO 상호")를
 * 그대로 보여주면 사용자에겐 미완성으로 읽히고, 없는 사업자를 있는 것처럼 흉내 내는
 * 모양새가 된다. 그래서 판매 전에는 **현재 상태를 그대로 밝힌다**.
 */
export default function BusinessPage() {
  if (!isCommerceEnabled()) {
    return (
      <main className="max-w-md mx-auto px-6 py-12">
        <h1 className="font-serif text-2xl text-ink mb-6">서비스 정보</h1>
        <p className="text-sm text-ink-soft leading-relaxed mb-4">
          {BUSINESS_INFO.serviceName}는 현재 <b>무료 베타</b>로 운영 중입니다. 유료 판매를 하지 않으며,
          결제 수단을 연결하고 있지 않습니다.
        </p>
        <p className="text-sm text-ink-soft leading-relaxed mb-4">
          유료 서비스를 시작하게 되면 전자상거래법에 따라 상호·대표자·사업장 주소·사업자등록번호·
          통신판매업 신고번호를 이 페이지에 표시한 뒤 판매를 개시합니다.
        </p>
        <dl className="space-y-3 mt-8">
          {([
            ["서비스명", BUSINESS_INFO.serviceName],
            ["운영 형태", "무료 베타 (유료 판매 없음)"],
            ["호스팅", BUSINESS_INFO.hosting],
          ] as [string, string][]).map(([k, v]) => (
            <div key={k} className="flex gap-3 text-sm">
              <dt className="w-28 shrink-0 text-ink-muted">{k}</dt>
              <dd className="text-ink-soft">{v}</dd>
            </div>
          ))}
        </dl>
        <Link href="/" className="mt-8 inline-block text-sm text-vermilion underline underline-offset-2">
          ← 처음으로
        </Link>
      </main>
    );
  }

  const rows: [string, string][] = [
    ["서비스명", BUSINESS_INFO.serviceName],
    ["상호", BUSINESS_INFO.company],
    ["대표자", BUSINESS_INFO.ceo],
    ["사업장 주소", BUSINESS_INFO.address],
    ["사업자등록번호", BUSINESS_INFO.bizRegNo],
    ["통신판매업 신고번호", BUSINESS_INFO.mailOrderNo],
    ["이메일", BUSINESS_INFO.email],
    ["결제대행", BUSINESS_INFO.paymentProvider],
    ["호스팅", BUSINESS_INFO.hosting],
  ];
  return (
    <main className="max-w-md mx-auto px-6 py-12">
      <h1 className="font-serif text-2xl text-ink mb-6">사업자정보</h1>
      <dl className="space-y-3">
        {rows.map(([k, v]) => (
          <div key={k} className="flex gap-3 text-sm">
            <dt className="w-28 shrink-0 text-ink-muted">{k}</dt>
            <dd className="text-ink-soft">{v}</dd>
          </div>
        ))}
      </dl>
      <Link href="/" className="mt-8 inline-block text-sm text-vermilion underline underline-offset-2">
        ← 처음으로
      </Link>
    </main>
  );
}
