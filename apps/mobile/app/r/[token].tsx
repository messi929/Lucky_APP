import type { ReportPayload } from "@lucky/api-client";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { fetchReport } from "@/lib/api";
import { ReportDeck } from "@/components/ReportDeck";
import { color, FONT } from "@/lib/theme";

/** 리포트 열람 (딥링크 /r/{token} 진입점, §2.3). 웹과 동일 백엔드 호출. */
export default function ReportScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const [data, setData] = useState<ReportPayload | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;
    fetchReport(token)
      .then((d) => alive && setData(d))
      .catch(() => alive && setErr("결과를 불러오지 못했어요."));
    return () => {
      alive = false;
    };
  }, [token]);

  if (err) {
    return (
      <View style={center}>
        <Text style={{ fontFamily: FONT.serifBold, color: color.ink }}>{err}</Text>
      </View>
    );
  }
  if (!data) {
    return (
      <View style={center}>
        <ActivityIndicator color={color.ink} />
      </View>
    );
  }
  return <ReportDeck initial={data} />;
}

const center = { flex: 1, backgroundColor: color.hanji, alignItems: "center", justifyContent: "center" } as const;
