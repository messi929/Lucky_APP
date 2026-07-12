import { computeCompat, computeSaju } from "@lucky/core";
import Link from "next/link";
import { getCompat, getInput } from "@/lib/store";
import { InkCircle } from "@/components/ui";

export const dynamic = "force-dynamic";

/** REL-3 궁합 결과 (A·B 공동 열람, §8.1). 나쁜 결과 없음 — 부정 프레임 금지. */
export default async function CompatPage({ params }: { params: Promise<{ compatToken: string }> }) {
  const { compatToken } = await params;
  const data = await getCompat(compatToken);
  const aInput = data ? await getInput(data.aToken) : null;

  if (!data || !aInput) {
    return (
      <main className="screen center">
        <p className="h-serif" style={{ fontSize: 24, marginBottom: 16 }}>결과를 찾지 못했어요.</p>
        <Link href="/input" className="btn ink" style={{ width: "auto", padding: "12px 24px" }}>내 사주 보러 가기</Link>
      </main>
    );
  }

  const aChart = computeSaju(aInput);
  const bChart = computeSaju(data.bInput);
  const result = computeCompat(aChart, bChart, data.relation);

  return (
    <main className="screen center">
      <div className="eyebrow">두 사람의 합</div>
      <div style={{ height: 20 }} />
      <div style={{ display: "flex" }}>
        <div style={{ border: "4px solid var(--paper)", borderRadius: "50%", zIndex: 1 }}>
          <InkCircle char={aChart.saju.dayStem} size={110} />
        </div>
        <div style={{ border: "4px solid var(--paper)", borderRadius: "50%", marginLeft: -14 }}>
          <InkCircle char={bChart.saju.dayStem} size={110} bg="var(--vermil)" />
        </div>
      </div>
      <div style={{ height: 24 }} />
      <div className="h-serif" style={{ fontSize: 34, color: "var(--vermil)" }}>{result.gradeLabel}</div>
      <div style={{ fontFamily: "var(--serif)", fontWeight: 700, fontSize: 17 }}>{result.relationLabel} 궁합 · {result.score}점</div>
      <div style={{ height: 16, width: "100%" }} />
      <div className="card" style={{ padding: 18, textAlign: "left" }}>
        <div className="sub" style={{ fontSize: 14, lineHeight: 1.7 }}>{result.headline}</div>
        <ul style={{ marginTop: 10, paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
          {result.dynamics.map((d, i) => (
            <li key={i} className="fine" style={{ fontSize: 12 }}>· {d}</li>
          ))}
        </ul>
      </div>
      <div className="grow" />
      <Link href={`/pay?token=${data.aToken}&sku=compat_detail`} className="btn ink">관계 상세 보기 · 2,900원</Link>
      <div style={{ height: 6, width: "100%" }} />
      <Link href="/input" className="btn kakao">내 사주 전체 보기</Link>
    </main>
  );
}
