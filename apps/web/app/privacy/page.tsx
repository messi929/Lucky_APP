import Link from "next/link";

export const metadata = { title: "개인정보처리방침 — 팔자 리포트" };

/** 개인정보처리방침 (§12 수집 최소화). 초안 — 런칭 전 법무 검토. */
export default function PrivacyPage() {
  return (
    <main className="max-w-md mx-auto px-6 py-12 text-ink-soft leading-relaxed">
      <h1 className="font-serif text-2xl text-ink mb-6">개인정보처리방침</h1>
      <p className="text-xs text-ink-muted mb-6">초안 — 런칭 전 법무 검토 예정.</p>

      <Section title="1. 수집 항목">
        생년월일·출생시각·성별(선택)·출생지역(시·도)·닉네임(선택), 기기 기반 익명 식별자.
        <b className="text-ink"> 이름·전화번호·주소는 수집하지 않습니다.</b> 회원가입이 없습니다.
      </Section>
      <Section title="2. 이용 목적">
        사주 리포트·궁합·택일 등 콘텐츠 생성, 결과 재열람(토큰), 데일리 운세 발송(동의 시), 서비스 개선 통계.
        생년월일 원본은 해석 AI에 전달하지 않으며, 간지·오행 등 산출값만 사용합니다.
      </Section>
      <Section title="3. 보유·파기">
        결과 열람 토큰과 산출 데이터는 서비스 제공에 필요한 기간 동안 보관 후 파기합니다. 결제 기록은
        관련 법령이 정한 기간 동안 보관합니다.
      </Section>
      <Section title="4. 제3자 제공·처리위탁">
        결제(토스페이먼츠), 호스팅(Vercel), 데이터베이스(Supabase), 해석 생성(Anthropic) 등 서비스 운영에
        필요한 범위에서만 위탁하며, 각 수탁자는 목적 외 이용이 금지됩니다.
      </Section>
      <Section title="5. 이용자 권리">
        열람·삭제 요청은 사업자정보의 이메일로 접수할 수 있습니다.
      </Section>
      <Section title="6. 궁합 상대 정보">
        궁합·가족 상대의 정보는 <b className="text-ink">본인 또는 동의를 받은 정보만</b> 입력해야 합니다.
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
