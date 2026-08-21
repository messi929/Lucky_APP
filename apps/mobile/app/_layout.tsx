import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { loadCommerceFlag } from "@/lib/commerce";
import { color } from "@/lib/theme";

/** 루트 레이아웃 — 폰트 로드 + 스택 네비게이션 + 한지 배경 */
export default function RootLayout() {
  // 굵기별 서브패스로 직접 가리킨다. 패키지 루트(index.js)는 8개 굵기 전부를
  // 최상위 require로 걸어 두어, 6개만 써도 8개가 통째로 번들된다(총 161MB).
  const [loaded] = useFonts({
    NotoSerifKR_400Regular: require("@expo-google-fonts/noto-serif-kr/400Regular/NotoSerifKR_400Regular.ttf"),
    NotoSerifKR_700Bold: require("@expo-google-fonts/noto-serif-kr/700Bold/NotoSerifKR_700Bold.ttf"),
    NotoSerifKR_900Black: require("@expo-google-fonts/noto-serif-kr/900Black/NotoSerifKR_900Black.ttf"),
    NotoSansKR_400Regular: require("@expo-google-fonts/noto-sans-kr/400Regular/NotoSansKR_400Regular.ttf"),
    NotoSansKR_500Medium: require("@expo-google-fonts/noto-sans-kr/500Medium/NotoSansKR_500Medium.ttf"),
    NotoSansKR_700Bold: require("@expo-google-fonts/noto-sans-kr/700Bold/NotoSansKR_700Bold.ttf"),
  });

  // 판매 스위치를 서버에서 받아 온다. 폰트 로딩을 막지 않는다 —
  // 기본값(숨김)이 안전하므로 늦게 도착해도 잘못된 화면이 뜨지 않는다.
  useEffect(() => {
    void loadCommerceFlag();
  }, []);

  if (!loaded) return <View style={{ flex: 1, backgroundColor: color.hanji }} />;

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: color.hanji } }} />
    </SafeAreaProvider>
  );
}
