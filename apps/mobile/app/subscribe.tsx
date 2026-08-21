import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useCommerceEnabled } from "@/lib/commerce";
import { color, FONT } from "@/lib/theme";

/**
 * 구독 페이월 (기획서 §9, 디자인 APP-3). 앱은 구독만(IAP), 단건은 웹(스토어 정책).
 * ※ 실결제는 RevenueCat + StoreKit/Play Billing 연동 필요(react-native-purchases).
 *   네이티브 모듈이라 스캐폴드에선 UI만. EAS 빌드에서 연결.
 *
 * 판매가 꺼져 있는 동안(무료 베타)에는 이 화면을 페이월로 쓰지 않는다.
 * 진입로는 전부 막아 뒀지만, 딥링크(palja://subscribe)나 놓친 분기로 들어올 수 있다.
 * 누르면 아무 일도 없는 "구독 시작하기" 버튼은 그 자체로 스토어 심사 반려 사유이고,
 * 무엇보다 받을 수 없는 돈을 요구하는 화면이다. 그래서 여기서 마지막으로 한 번 더 막는다.
 */
const BENEFITS = [
  { stamp: "曉", title: "매일 아침, 오늘의 한 줄", sub: "일주 × 일진 맞춤 푸시" },
  { stamp: "問", title: "문답 월 3회", sub: "복채 없이 하나씩 물어보기" },
  { stamp: "緣", title: "궁합 무제한", sub: "가족·친구·직장 전부" },
];

export default function Subscribe() {
  const commerce = useCommerceEnabled();

  if (!commerce) return <FreeBetaNotice />;

  function subscribe() {
    // TODO(Phase 6 인프라): RevenueCat Purchases.purchasePackage(...)
    router.back();
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>매일 보는 사주는{"\n"}구독이 낫습니다</Text>

      <View style={{ gap: 8, marginTop: 20 }}>
        {BENEFITS.map((b) => (
          <View key={b.stamp} style={styles.row}>
            <View style={styles.stamp}>
              <Text style={styles.stampText}>{b.stamp}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>{b.title}</Text>
              <Text style={styles.rowSub}>{b.sub}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={{ flex: 1 }} />

      <View style={styles.priceBar}>
        <View>
          <Text style={styles.priceTitle}>월 구독</Text>
          <Text style={styles.priceSub}>언제든 해지</Text>
        </View>
        <Text style={styles.price}>4,900원</Text>
      </View>
      <Pressable style={styles.cta} onPress={subscribe}>
        <Text style={styles.ctaText}>구독 시작하기</Text>
      </Pressable>
      <Text style={styles.fine}>스토어 결제 · 구독 관리는 스토어 설정에서</Text>
    </View>
  );
}

/** 무료 베타 안내 — 팔지 않는 동안 이 화면이 보여 줄 유일한 내용. */
function FreeBetaNotice() {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>지금은{"\n"}전부 무료입니다</Text>
      <View style={{ height: 16 }} />
      <Text style={styles.notice}>
        정식 판매를 준비하는 동안 모든 상담과 문답을 무료로 열어 두었어요.{"\n"}
        결제를 받지 않으니 그냥 편하게 보세요.
      </Text>
      <View style={{ flex: 1 }} />
      <Pressable style={[styles.cta, { backgroundColor: color.ink }]} onPress={() => router.back()}>
        <Text style={[styles.ctaText, { color: color.hanji }]}>돌아가기</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: color.hanji, padding: 24, paddingTop: 64 },
  title: { fontFamily: FONT.serifBlack, fontWeight: "900", fontSize: 26, color: color.ink, lineHeight: 38 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: color.white, borderRadius: 14, borderWidth: 1, borderColor: color.hanjiDeep, padding: 16 },
  stamp: { width: 36, height: 36, borderRadius: 6, backgroundColor: color.vermilion, alignItems: "center", justifyContent: "center" },
  stampText: { color: color.hanji, fontFamily: FONT.serifBlack, fontWeight: "900", fontSize: 18 },
  rowTitle: { fontSize: 14, fontWeight: "700", color: color.ink },
  rowSub: { fontSize: 12, color: color.inkMuted },
  priceBar: { backgroundColor: color.ink, borderRadius: 16, padding: 18, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  priceTitle: { fontWeight: "700", fontSize: 16, color: color.hanji },
  priceSub: { fontSize: 12, color: "#CCC5BB" },
  price: { fontFamily: FONT.serifBlack, fontWeight: "900", fontSize: 20, color: color.hanji },
  cta: { backgroundColor: color.kakao, borderRadius: 14, paddingVertical: 16, alignItems: "center", marginTop: 8 },
  ctaText: { color: color.ink, fontSize: 16, fontWeight: "700" },
  fine: { fontSize: 11, color: color.inkMuted, textAlign: "center", marginTop: 6 },
  notice: { fontFamily: FONT.sans, fontSize: 15, lineHeight: 26, color: color.inkMuted },
});
