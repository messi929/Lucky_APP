import type { Config } from "tailwindcss";

// packages/ui 토큰과 동기 (단일 소스는 tokens.ts, 여기선 Tailwind 유틸용 미러)
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        hanji: "#F5F0E8",
        "hanji-deep": "#EEE7DA",
        ink: "#1A1714",
        "ink-soft": "#4A443C",
        "ink-muted": "#8D877D",
        vermilion: "#C63D2F",
        "vermilion-deep": "#A6321F",
        gold: "#B08D46",
        teal: "#3D6B68",
        kakao: "#FEE500",
        wood: "#5B7B5A",
        fire: "#C63D2F",
        earth: "#B08D46",
        metal: "#8C8C88",
        water: "#3D5A73",
      },
      fontFamily: {
        serif: ['"Noto Serif KR"', "serif"],
        sans: ['"Noto Sans KR"', "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "14px",
        tile: "16px",
      },
    },
  },
  plugins: [],
} satisfies Config;
