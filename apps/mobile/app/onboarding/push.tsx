import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { API_BASE, color, FONT } from "@/lib/theme";

/** 기기 저장 결과 토큰 (실제: SecureStore/AsyncStorage). 스캐폴드 플레이스홀더. */
const RESULT_TOKEN = process.env.EXPO_PUBLIC_RESULT_TOKEN ?? "";

/**
 * 푸시 옵트인 (기획서 §10.1, 디자인 APP-2). 데일리 운세 발송 동의.
 * expo-notifications 권한 요청 → Expo push token 등록(백엔드 전송은 Phase 7 배치).
 */
export default function PushOptIn() {
  const [status, setStatus] = useState<string>("");

  async function optIn() {
    const { status: perm } = await Notifications.requestPermissionsAsync();
    if (perm !== "granted") {
      setStatus("알림이 꺼져 있어요. 설정에서 켤 수 있어요.");
      return;
    }
    try {
      const { data: expoToken } = await Notifications.getExpoPushTokenAsync();
      if (RESULT_TOKEN) {
        await fetch(`${API_BASE}/api/push/register`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ expoToken, token: RESULT_TOKEN, hour: 8 }),
        });
      }
    } catch {
      // EAS projectId 없거나 오프라인 — 스캐폴드에선 무시
    }
    setStatus("좋아요! 매일 아침 8시에 보내드릴게요.");
    setTimeout(() => router.back(), 1200);
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.stamp}>
        <Text style={styles.stampText}>曉</Text>
      </View>
      <Text style={styles.title}>매일 아침 8시,{"\n"}오늘의 한 줄을 보내드려요</Text>
      <Text style={styles.sub}>당신의 일주와 그날의 일진으로 짓는{"\n"}세상에 하나뿐인 아침 문장.</Text>

      <View style={styles.preview}>
        <Text style={styles.previewLabel}>미리보기</Text>
        <Text style={styles.previewText}>&ldquo;오늘은 말이 빨라지는 날. 한 박자 늦게.&rdquo;</Text>
      </View>

      {status ? <Text style={styles.status}>{status}</Text> : null}

      <Pressable style={styles.btn} onPress={optIn}>
        <Text style={styles.btnText}>아침 한 줄 받기</Text>
      </Pressable>
      <Pressable onPress={() => router.back()}>
        <Text style={styles.later}>나중에요</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: color.hanji, alignItems: "center", justifyContent: "center", padding: 24 },
  stamp: { width: 64, height: 64, borderRadius: 14, backgroundColor: color.vermilion, alignItems: "center", justifyContent: "center", marginBottom: 24 },
  stampText: { color: color.hanji, fontFamily: FONT.serifBlack, fontWeight: "900", fontSize: 32 },
  title: { fontFamily: FONT.serifBlack, fontWeight: "900", fontSize: 26, color: color.ink, textAlign: "center", lineHeight: 38 },
  sub: { fontSize: 14, color: color.inkSoft, textAlign: "center", marginTop: 10, lineHeight: 22 },
  preview: { backgroundColor: color.white, borderRadius: 14, borderWidth: 1, borderColor: color.hanjiDeep, padding: 14, marginTop: 24, alignSelf: "stretch" },
  previewLabel: { fontSize: 11, color: color.inkMuted, marginBottom: 4 },
  previewText: { fontFamily: FONT.serifBlack, fontWeight: "700", fontSize: 14, color: color.ink },
  status: { color: color.vermilion, marginTop: 16 },
  btn: { backgroundColor: color.ink, borderRadius: 14, paddingVertical: 16, paddingHorizontal: 40, marginTop: 24, alignSelf: "stretch", alignItems: "center" },
  btnText: { color: color.hanji, fontSize: 16, fontWeight: "700" },
  later: { color: color.inkMuted, marginTop: 12 },
});
