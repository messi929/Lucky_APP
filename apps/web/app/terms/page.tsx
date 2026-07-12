import Link from "next/link";
import { LEGAL_NOTICE } from "@/lib/business-info";

export const metadata = { title: "이용약관 — 팔자 리포트" };

/** 이용약관 (§9 결제·청약철회). 초안 — 런칭 전 법무 검토. */
export default function TermsPage() {
  return (
    <main className="max-w-md mx-auto px-6 py-12 text-ink-soft leading-relaxed">
      <h1 className="font-serif text-2xl text-ink mb-6">이용약관</h1>
      <p className="text-xs text-ink-muted mb-6">초안 — 런칭 전 법무 검토 예정.</p>

      <Section title="1. 서비스">
        생년월일시를 바탕으로 사주 카드 리포트·궁합·택일 등 오락·자기이해용 콘텐츠를 제공합니다.
        {" "}
        {LEGAL_NOTICE}
      </Section>
      <Section title="2. 결제">
        웹 단건 결제는 토스페이먼츠를 통해 비회원으로 진행됩니다. 상품·가격은 결제 화면에 표시됩니다.
      </Section>
      <Section title="3. 청약철회">
        디지털 콘텐츠 특성상 <b className="text-ink">열람(제공 개시) 시점부터 청약철회가 제한</b>됩니다.
        결제 전 해당 내용에 대한 <b className="text-ink">명시적 동의</b>를 거치며, 동의 없이는 결제가
        진행되지 않습니다. 열람 전이라면 철회가 가능합니다.
      </Section>
      <Section title="4. 선물하기">
        선물 결제 시 발급되는 링크의 수신자는 생년월일 입력으로 리포트를 열람할 수 있습니다.
      </Section>
      <Section title="5. 책임의 한계">
        콘텐츠는 오락 목적이며, 이를 근거로 한 의사결정의 결과에 대해 서비스는 책임지지 않습니다.
      </Section>

      <Link href="/" className="mt-8 inline-block text-sm text-vermilion underline underline-offset-2">
        ← 처음으로
      </Link>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-5">
      <h2 className="font-serif text-ink mb-1">{title}</h2>
      <p className="text-sm">{children}</p>
    </section>
  );
}
