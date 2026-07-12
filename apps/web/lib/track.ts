/**
 * 클라이언트 퍼널 트래킹 (기획서 §8.3). 실패해도 UX 방해 없음(fire-and-forget).
 * 채널 구분: share_click은 channel prop(kakao/insta/save).
 */
export function track(name: string, props?: Record<string, unknown>): void {
  try {
    void fetch("/api/event", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, props }),
      keepalive: true,
    });
  } catch {
    /* noop */
  }
}
