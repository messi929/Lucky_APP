import { isBusinessInfoComplete } from "./business-info";

/**
 * 판매 활성 여부 — 이 한 곳이 유료 기능 전체의 스위치다.
 *
 * 전자상거래법상 통신판매를 하려면 사업자등록·정보표시가 선행돼야 하고,
 * PG 계약 자체도 사업자등록증을 요구한다. 그 전까지 이 서비스는 **전면 무료**로 운영한다.
 *
 * 판정을 사업자정보 기입 여부에 묶은 이유: 스위치를 두 개 두면 언젠가 어긋난다.
 * 사업자정보가 실제 값으로 채워지는 시점 = 판매 준비가 끝난 시점이므로 그때 자동으로 켜진다.
 *
 * 꺼져 있는 동안:
 *  - 결제 화면·CTA를 노출하지 않는다 (팔 수 없는 것을 팔려는 UI를 두지 않는다)
 *  - 유료 구간을 잠그지 않는다 (무료 베타이므로 전부 열어 준다)
 *  - /api/checkout·/api/session/unlock은 거절한다
 */
export function isCommerceEnabled(): boolean {
  return isBusinessInfoComplete();
}
