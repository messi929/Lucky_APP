// 공유 색상 토큰 (단일 소스 = packages/ui, 원칙 8). 웹과 동일 값.
export { color, ELEMENT_COLOR } from "@lucky/ui/tokens";

/** RN 폰트 패밀리 (expo-google-fonts 로드 키, _layout에서 useFonts) */
export const FONT = {
  serifBlack: "NotoSerifKR_900Black",
  serifBold: "NotoSerifKR_700Bold",
  serif: "NotoSerifKR_400Regular",
  sans: "NotoSansKR_400Regular",
  sansMedium: "NotoSansKR_500Medium",
  sansBold: "NotoSansKR_700Bold",
} as const;

/** 백엔드(Next.js API) 베이스. EAS env로 주입, 미설정 시 Vercel 프로덕션 */
export const API_BASE =
  process.env.EXPO_PUBLIC_API_BASE ?? "https://web-eight-olive-98.vercel.app";
