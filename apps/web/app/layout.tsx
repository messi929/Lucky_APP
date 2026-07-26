import type { Metadata, Viewport } from "next";
import { Noto_Serif_KR, Noto_Sans_KR } from "next/font/google";
import "./globals.css";

// 한글 Noto — next/font로 self-host. 외부 render-blocking <link> 제거 + 자동 폴백 메트릭으로 CLS↓.
// CJK는 풀셋 preload가 부적절(수 MB) → preload:false. unicode-range 슬라이스는 필요분만 온디맨드 로드.
// 웨이트는 기존 사용분과 동일(Serif 400/700/900 · Sans 400/500/700).
const notoSerif = Noto_Serif_KR({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  display: "swap",
  preload: false,
  variable: "--font-noto-serif",
});

const notoSans = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  preload: false,
  variable: "--font-noto-sans",
});

export const metadata: Metadata = {
  title: "사주 카드 리포트 — 겁주지 않는 사주",
  description: "생년월일시로 보는 카드형 사주 리포트. 실제 철학관 상담의 리듬을 그대로.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#F4EFE3",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // 기본 mode=mz. 결과 화면에서 나이 기반 기본값 + 토글로 data-mode 갱신.
  return (
    <html lang="ko" data-mode="mz" className={`${notoSerif.variable} ${notoSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
