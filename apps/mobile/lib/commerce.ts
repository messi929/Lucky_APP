import { useSyncExternalStore } from "react";
import { API_BASE } from "./theme";

/**
 * 판매 활성 여부 — 앱 쪽 게이트 (웹 lib/commerce.ts와 같은 스위치를 서버에서 받아 온다).
 *
 * 판정을 앱에 복제하지 않는 이유: 앱 번들은 스토어에 박혀 있어 즉시 못 바꾼다.
 * 사업자등록이 끝나 판매를 켜는 날, 웹만 켜지고 앱은 구버전이 깔린 기기에서 계속 꺼져 있는
 * (혹은 그 반대의) 어긋남이 생긴다. 그래서 서버에 물어본다 — /api/config.
 *
 * 기본값은 false(=숨김)다. 실패 시 열지 않고 닫는다 —
 * 서버에 닿지 못하는 상태에서 결제 UI를 띄우면 받을 수 없는 돈을 요구하게 된다.
 */
let enabled = false;
let loaded = false;
const listeners = new Set<() => void>();

function emit(): void {
  for (const l of listeners) l();
}

function subscribe(l: () => void): () => void {
  listeners.add(l);
  return () => listeners.delete(l);
}

/** 부팅 시 1회. 실패는 삼킨다 — 닫힌 상태가 안전한 기본값이라 앱을 막을 이유가 없다. */
export async function loadCommerceFlag(): Promise<void> {
  try {
    const res = await fetch(`${API_BASE}/api/config`);
    if (!res.ok) return;
    const json = (await res.json()) as { commerce?: boolean };
    enabled = json.commerce === true;
  } catch {
    // 네트워크 실패 → 기본값(false) 유지
  } finally {
    loaded = true;
    emit();
  }
}

/** 렌더 중 읽기. 응답 전에는 false라 결제 CTA가 잠깐 늦게 나타날 뿐, 잘못 나타나지 않는다. */
export function useCommerceEnabled(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => enabled,
    () => false, // 서버 스냅샷(무의미하지만 RN 웹 대비)
  );
}

/** 렌더 밖(이벤트 핸들러·라우팅 분기)에서 읽을 때 */
export function isCommerceEnabled(): boolean {
  return enabled;
}

/** 테스트·디버그용 — 플래그를 실제로 받아왔는지 */
export function isCommerceFlagLoaded(): boolean {
  return loaded;
}
