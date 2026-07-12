import {
  NotoSerifKR_400Regular,
  NotoSerifKR_700Bold,
  NotoSerifKR_900Black,
} from "@expo-google-fonts/noto-serif-kr";
import {
  NotoSansKR_400Regular,
  NotoSansKR_500Medium,
  NotoSansKR_700Bold,
  useFonts,
} from "@expo-google-fonts/noto-sans-kr";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { color } from "@/lib/theme";

/** 루트 레이아웃 — 폰트 로드 + 스택 네비게이션 + 한지 배경 */
export default function RootLayout() {
  const [loaded] = useFonts({
    NotoSerifKR_400Regular,
    NotoSerifKR_700Bold,
    NotoSerifKR_900Black,
    NotoSansKR_400Regular,
    NotoSansKR_500Medium,
    NotoSansKR_700Bold,
  });

  if (!loaded) return <View style={{ flex: 1, backgroundColor: color.hanji }} />;

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: color.hanji } }} />
    </SafeAreaProvider>
  );
}
