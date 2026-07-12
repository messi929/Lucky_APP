import Link from "next/link";
import { BUSINESS_INFO } from "@/lib/business-info";

export const metadata = { title: "사업자정보 — 팔자 리포트" };

/** 사업자정보 표시 (전자상거래법 의무, §12.2) */
export default function BusinessPage() {
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
      <p className="mt-8 text-xs text-ink-muted">
        ※ 위 정보는 런칭 전 실제 값으로 교체됩니다(현재 준비 중).
      </p>
      <Link href="/" className="mt-8 inline-block text-sm text-vermilion underline underline-offset-2">
        ← 처음으로
      </Link>
    </main>
  );
}
