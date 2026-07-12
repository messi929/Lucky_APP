/**
 * Expo Push 발송 (기획서 §10.1). Expo Push API 직접 호출 — 별도 SDK 불필요.
 * https://docs.expo.dev/push-notifications/sending-notifications/
 */

export interface ExpoMessage {
  to: string;
  title: string;
  body: string;
  sound?: "default";
}

export async function sendExpoPush(messages: ExpoMessage[]): Promise<number> {
  if (messages.length === 0) return 0;
  // Expo는 요청당 최대 100개 → 청크 분할
  let sent = 0;
  for (let i = 0; i < messages.length; i += 100) {
    const chunk = messages.slice(i, i + 100);
    const res = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify(chunk),
    });
    if (res.ok) sent += chunk.length;
  }
  return sent;
}
