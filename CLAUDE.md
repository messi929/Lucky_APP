# 프로젝트: 사주 카드 리포트 (모노레포: web + mobile + core)

## 불변 원칙 (기획서 v1.2 §12.1)
1. packages/core 는 순수 TS만. React/Next/RN import 금지, 외부 API·DB 호출 금지.
2. LLM 호출부에 생년월일 원본 전달 금지. SajuChart JSON만.
3. ssaju는 버전 고정·직접 수정 금지 — 모든 보정은 corrections.ts/boundary.ts에서. core/saju 변경 시 tests/ 전체 통과 필수(회귀 케이스 포함). 실패 상태 커밋 금지.
4. 해석 생성물은 guardrails 3단계(L1 공통 / L2 관망 언어 / L3 민감 카테고리) 필터 통과 필수.
5. 회원가입 기능 금지. 접근은 토큰(웹)·기기ID(앱).
6. 공유 URL은 /r/{token} 단일 포맷. 궁합·선물 수신자에게 앱 설치 요구 UI 금지.
7. 톤/UI는 mode('mz'|'classic') 축으로만 분기. 별도 화면 중복 구현 금지. (카드 1장=뷰포트 1화면, 모바일 퍼스트)
8. 동일 로직은 core에 구현 후 양쪽 import. 중복 구현 금지.
9. 결제 UI에는 청약철회 제한 고지 + 명시적 동의 체크 단계가 반드시 포함되어야 함.

## 스타일
- TS strict, 함수형 우선, 매직넘버는 constants.
- 간지·오행·지역경도 데이터는 core 내 단일 소스(enum+테이블).
- 커밋 단위 = 기능 단위. 각 Phase 종료 시 태그.

## 워크스페이스
- 패키지 매니저: pnpm (workspace) + Turborepo
- 테스트: Vitest. 엔진 검증은 `tests/` 패키지 (`@lucky/tests`)에서 `@lucky/core` import.
- 패키지 스코프: `@lucky/core`, `@lucky/ui`, `@lucky/api-client`

## 만세력 계산 코어 (VERIFICATION-REPORT 2026-07-12 결정)
- 계산 코어는 **ssaju**(npm, MIT, zero-dep) 채택. 삼중 교차검증(ssaju vs lunar-javascript vs 60갑자 앵커 산술) 통과.
- ssaju는 **직접 수정 금지·버전 pin**. 업데이트 시 회귀 테스트(`tests/`) 전체 재실행이 CI 조건.
- 한국 특수 보정은 라이브러리 밖 **어댑터**가 책임 (core/saju):
  - `corrections.ts`: 서머타임(-1h), 표준시 변경기(1954-08~1961-08 UTC+8:30) LMT 비활성, 진태양시(LMT) 경도 보정 → ssaju 입력 생성
  - `boundary.ts`: 절입 ±5분 경계 플래그(자체 astro.ts, 추후 KASI 테이블 교체)
  - `engine.ts`: 우리입력 → corrections → ssaju → SajuChart 매핑
- **야자시(23:00~24:00) 시간(干) 유파 차이**: ssaju=당일 일간 기준(조자시설 정합). lunar-js sect2와 다르나 버그 아님.
- `taekil.ts`(택일): 목적+기간 → 일진 스캔 → 일간 관계(합·충·공망) 규칙 → 좋은날/피할날. 순수계산, LLM 0.
- LLM 컨텍스트는 `toLlmContext()`(간지·오행·십신·격국만, birthdate-free). ssaju.toCompact()는 생년월일 포함 → 직접 전달 금지.

## 해석 레이어 (v1.2)
- 캐시 키 = `유닛:값:프롬프트버전:시즌:톤모드:관심사`. 프롬프트 버전으로 자연 무효화.
- 톤 축 = mode('mz' 힙한 직설 / 'classic' 정중 상담체) × 반응(deep/counter) = 4종. 유닛 단위 캐시라 조합 폭발 아님.
- mode 기본값: 생년 기준 만 40세 경계 자동 + 화면 토글.
- 고민 카탈로그(concerns.ts): 전 세대 taxonomy, 연령 적응 노출. 각 concern은 guardrailLevel(1/2/3) 보유.

## 디자인 (design/ 단일 소스)
- UI 구현 전 `design/design-spec-v1.2.html`의 해당 화면 섹션 + `design/DESIGN-HANDOFF.md` 매핑표를 확인할 것.
- HTML `:root` CSS 변수 = `packages/ui` 토큰의 단일 소스. 값 불일치 시 HTML 기준으로 이식.
- 불변 디자인 규칙:
  1. 주홍(vermil #C63D2F)은 화면당 1~2곳 — 낙관 스탬프 또는 "꺾는 문장"에만. 버튼 기본색은 ink.
  2. 카드 1장 = 뷰포트 1화면. 스와이프(mz) / 큰 [다음] 버튼 병행(classic).
  3. classic은 `.classic` 오버라이드 축으로만 — 화면 중복 구현 금지(원칙 7).
  4. 낙관 스탬프 한자 1개/화면: 命(브랜드) 眞(훅) 問(질문) 答(고민) 運(처방) 緣(궁합) 福(선물) 吉(택일) 曉(아침푸시).
  5. 궁합·선물 수신자 화면(REL-2, GIFT-1)에 앱 설치 요구 UI 금지(원칙 6).
  6. 결제 청약철회 동의 체크 = 전자상거래법 요건. 제거·기본체크 금지(원칙 9).
  7. 오행 차트·붓글씨는 SVG 자체 구현 — 차트/애니 라이브러리 금지.
  8. 해석 문구는 core/content + guardrails 통과본만(플레이스홀더는 예시).
- 토큰(HTML 기준): paper #F5F0E8 · ink #1A1714 · vermil #C63D2F · gold #B08D46 · teal #3D6B68 · kakao #FEE500 / 오행 목#5B7B5A 화#C63D2F 토#B08D46 금#8C8C88 수#3D5A73 / 서체 Noto Serif KR 900 · Noto Sans KR / 반경 card14 tile16 pill100 screen24.

## 개발 단계 (기획서 v1.2 §12.2)
- Phase 0: 셋업 + 레퍼런스 / **Phase 1: 엔진 어댑터 ★게이트 (완료)** / **Phase 2: 해석 레이어 (완료, v1.2 반영)**
- Phase 3: 웹 리포트(mode 토글·연령 적응) / Phase 4: 공유·궁합·가족 / Phase 5: 결제·선물(청약철회 동의)
- Phase 6: 앱 / Phase 7: 데일리 푸시 / Phase 8: 폴리시·런칭(통신판매업·사업자정보)
