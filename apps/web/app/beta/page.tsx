import { Suspense } from "react";
import { BetaGate } from "@/components/BetaGate";

export const metadata = {
  title: "초대 전용 베타 — 팔자 리포트",
  robots: { index: false, follow: false },
};

/** 클로즈드 베타 게이트 화면. ?invite=CODE 로 자동 입장, 아니면 코드 입력. */
export default function BetaPage() {
  return (
    <Suspense>
      <BetaGate />
    </Suspense>
  );
}
