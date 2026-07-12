import { InputForm } from "@/components/InputForm";
import { Stamp } from "@/components/ui";

/** ON-1 입력 — 대화체 폼 (design-spec §P0) */
export default function InputPage() {
  return (
    <main className="screen">
      <div className="hstack">
        <Stamp char="命" />
        <span style={{ fontFamily: "var(--serif)", fontWeight: 700, letterSpacing: "0.1em" }}>
          팔자 리포트
        </span>
      </div>

      <div style={{ height: 28 }} />
      <h1 className="h-serif" style={{ fontSize: 32 }}>
        먼저,
        <br />
        태어난 날부터
        <br />
        들어볼까요.
      </h1>
      <div style={{ height: 8 }} />
      <p className="sub">
        사주는 태어난 순간의 하늘을 읽는 일이라
        <br />
        정확할수록 좋아요.
      </p>

      <div style={{ height: 24 }} />
      <InputForm />
    </main>
  );
}
