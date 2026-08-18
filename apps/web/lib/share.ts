"use client";

/**
 * 공유 폴백 — 네이티브 공유시트(모바일) → 클립보드 복사(데스크톱) → 수동 안내.
 * 카카오 SDK가 없는 환경에서도 버튼이 "아무 일도 안 하는" 상태로 남지 않게 하는 것이 목적이다.
 * (계측만 붙고 동작이 없던 버튼들 — 사용성 테스트 2026-08-08)
 */
export async function shareLink(url: string, title: string, copiedMsg: string): Promise<void> {
  if (navigator.share) {
    try {
      await navigator.share({ title, url });
      return;
    } catch {
      /* 사용자가 취소했거나 미지원 → 복사로 폴백 */
    }
  }
  try {
    await navigator.clipboard.writeText(url);
    alert(copiedMsg);
  } catch {
    // 비보안 컨텍스트·권한 거부 등 클립보드 실패 — 최소한 주소는 보여준다.
    alert(`${copiedMsg}\n\n${url}`);
  }
}
