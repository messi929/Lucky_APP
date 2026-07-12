import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { Stamp } from "@/components/ui";

/** WEB-1 랜딩 히어로 (design-spec §P5). 팔자 타이포 + 무료 진입 + 신뢰 라인. */
export default function Home() {
  const hanja = [
    { c: "癸", o: 0.15 },
    { c: "庚", o: 1 },
    { c: "戊", o: 0.4 },
    { c: "辛", o: 0.15 },
  ];
  return (
    <main className="screen">
      <div className="hstack">
        <Stamp char="命" />
        <span style={{ fontFamily: "var(--serif)", fontWeight: 700, letterSpacing: "0.1em" }}>
          팔자 리포트
        </span>
      </div>

      <div className="grow" />

      <div style={{ display: "flex", gap: 14, justifyContent: "center", width: "100%" }}>
        {hanja.map((h, i) => (
          <span
            key={i}
            style={{ fontFamily: "var(--serif)", fontWeight: 900, fontSize: 64, opacity: h.o }}
          >
            {h.c}
          </span>
        ))}
      </div>

      <div style={{ height: 24 }} />
      <h1 className="h-serif" style={{ fontSize: 32, textAlign: "center" }}>
        겁주지 않는 사주,
        <br />
        여덟 글자로
        <br />
        당신을 읽습니다
      </h1>
      <div style={{ height: 12 }} />
      <p className="sub" style={{ textAlign: "center" }}>
        출생지 경도까지 반영한 정밀 만세력 위에,
        <br />
        철학관의 첫 마디를 얹었습니다.
      </p>

      <div style={{ height: 24 }} />
      <Link href="/input" className="btn ink">
        30초 만에 내 팔자 보기 — 무료
      </Link>
      <div style={{ height: 8 }} />
      <p className="fine" style={{ textAlign: "center" }}>
        회원가입 없음 · 이름/전화번호 안 물어봄
      </p>

      <div className="grow" />
      <SiteFooter />
    </main>
  );
}
