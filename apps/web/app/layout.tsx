import type { Metadata, Viewport } from "next";
import "./globals.css";

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
    <html lang="ko" data-mode="mz">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;700;900&family=Noto+Sans+KR:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
