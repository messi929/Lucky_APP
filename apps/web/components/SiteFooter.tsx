import Link from "next/link";
import { LEGAL_NOTICE } from "@/lib/business-info";

/** 상시 고지 + 법정 링크 (§4.4, §12.2). WEB-1 랜딩 등 하단. */
export function SiteFooter() {
  return (
    <footer className="mt-10 border-t border-hanji-deep pt-6 text-center">
      <p className="text-xs text-ink-muted leading-relaxed mb-3">{LEGAL_NOTICE}</p>
      <p className="text-xs text-ink-muted mb-2">회원가입 없음 · 이름/전화번호 미수집</p>
      <nav className="flex justify-center gap-4 text-xs text-ink-muted">
        <Link href="/terms" className="underline underline-offset-2">
          이용약관
        </Link>
        <Link href="/privacy" className="underline underline-offset-2">
          개인정보처리방침
        </Link>
        <Link href="/business" className="underline underline-offset-2">
          사업자정보
        </Link>
      </nav>
    </footer>
  );
}
