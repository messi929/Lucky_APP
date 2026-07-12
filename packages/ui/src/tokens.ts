/**
 * 공유 디자인 토큰 — 웹(Tailwind)·앱(RN)이 동일 값을 import.
 * 비주얼 언어(기획서 §5): 한지 질감, 먹빛 + 주홍 낙관 포인트, 세리프(명조계) 헤드라인.
 * "신비주의를 미니멀로" — 여백 많은 모던 레이아웃 위 전통 요소는 포인트로만.
 */

// 값은 design/design-spec-v1.2.html :root 단일 소스와 1:1 (CLAUDE.md 디자인 섹션).
export const color = {
  /** 한지 바탕 */
  hanji: "#F5F0E8",
  hanjiDeep: "#EEE7DA",
  white: "#FFFFFF",
  /** 먹빛 (본문·헤드라인) */
  ink: "#1A1714",
  inkSoft: "#4A443C", // ink70
  inkMuted: "#8D877D", // ink40
  /** 주홍 낙관 포인트 (화면당 1~2곳: 낙관·꺾는 문장) */
  vermilion: "#C63D2F",
  vermilionDeep: "#A6321F",
  /** 금박 · 청록 · 카카오 */
  gold: "#B08D46",
  teal: "#3D6B68",
  kakao: "#FEE500",
  /** 오행 색상 (차트·처방전) */
  wood: "#5B7B5A", // 木
  fire: "#C63D2F", // 火
  earth: "#B08D46", // 土
  metal: "#8C8C88", // 金
  water: "#3D5A73", // 水
} as const;

export const font = {
  serifHead: '"Noto Serif KR", serif', // 헤드라인 Black(900)
  sansBody: '"Noto Sans KR", system-ui, sans-serif',
} as const;

export const space = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 40,
  xxl: 64,
} as const;

export const radius = {
  card: 14,
  tile: 16,
  pill: 100,
  screen: 24,
} as const;

/** 카드 1장 = 뷰포트 1화면 (CLAUDE.md 원칙 7). 스와이프 전환 타이밍 */
export const motion = {
  brushStrokeMs: 2600, // 붓글씨 1자 연출(뜸=노동 착시)
  typingCharMs: 45, // 단정형 훅 타이핑
  cardTransitionMs: 320,
} as const;

export type ColorToken = keyof typeof color;

/** 오행 → 색상 토큰 (SVG 차트·처방전 공용) */
export const ELEMENT_COLOR = {
  wood: color.wood,
  fire: color.fire,
  earth: color.earth,
  metal: color.metal,
  water: color.water,
} as const;

/**
 * 세대 톤/UI 모드 2세트 (기획서 v1.2 §4.2, §5).
 * 톤/UI는 이 mode 축으로만 분기(원칙 7). 값은 CSS 변수로 노출된다.
 */
export type Mode = "mz" | "classic";

export interface ModeTheme {
  /** 본문 기준 폰트 px */
  baseFontPx: number;
  /** 헤드라인 배율 */
  headScale: number;
  /** 최소 탭 타깃 px (클래식은 크게) */
  minTapPx: number;
  /** 카드 정보 밀도 */
  density: "comfortable" | "roomy";
  /** CTA 버튼: 클래식은 큼직한 [다음] 버튼 병행 */
  bigNextButton: boolean;
  /** 자간 */
  letterSpacing: string;
  /** 라인 높이 */
  lineHeight: number;
}

export const MODE_THEME: Record<Mode, ModeTheme> = {
  mz: {
    baseFontPx: 16,
    headScale: 1.7,
    minTapPx: 44,
    density: "comfortable",
    bigNextButton: false,
    letterSpacing: "-0.01em",
    lineHeight: 1.6,
  },
  classic: {
    // 본문 16px+·행간 1.8·버튼 20px 패딩·필드값 20px (design HTML .classic 오버라이드)
    baseFontPx: 18,
    headScale: 1.5,
    minTapPx: 56,
    density: "roomy",
    bigNextButton: true,
    letterSpacing: "0",
    lineHeight: 1.8,
  },
};

/** 모드 테마 → CSS 변수 맵 (globals.css / 인라인 스타일에 주입) */
export function modeCssVars(mode: Mode): Record<string, string> {
  const t = MODE_THEME[mode];
  return {
    "--base-font": `${t.baseFontPx}px`,
    "--head-scale": String(t.headScale),
    "--min-tap": `${t.minTapPx}px`,
    "--letter-spacing": t.letterSpacing,
    "--line-height": String(t.lineHeight),
  };
}
