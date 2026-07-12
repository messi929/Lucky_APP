/**
 * 사업자정보 (전자상거래법 표시 의무, 기획서 §9, §12.2).
 * ⚠️ 값은 플레이스홀더 — 런칭 전 실제 사업자 정보로 교체하고 통신판매업 신고번호 기입.
 */
export const BUSINESS_INFO = {
  serviceName: "팔자 리포트",
  company: "TODO 상호",
  ceo: "TODO 대표자명",
  address: "TODO 사업장 주소",
  bizRegNo: "TODO 사업자등록번호",
  mailOrderNo: "TODO 통신판매업 신고번호", // 미신고 시 런칭 불가(§12.2 체크리스트)
  email: "TODO help@paljareport.com",
  hosting: "Vercel Inc.",
  paymentProvider: "토스페이먼츠(주)",
} as const;

/** 오락 목적 고지문 (모든 화면 상시, §4.4). 클래식 강화판은 core DISCLAIMER_CLASSIC */
export const LEGAL_NOTICE =
  "본 서비스의 콘텐츠는 오락·자기이해 목적이며 의학·법률·투자 조언이 아닙니다. 중요한 결정은 전문가와 상의하세요.";
