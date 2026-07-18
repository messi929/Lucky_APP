# 팔자 리포트 (사주 카드 리포트)

생년월일시로 실제 철학관 상담의 리듬(훅→문답→처방)을 재현한 **카드형 사주 리포트**.
계산은 결정론적 코드, 서사는 LLM. **전략: 앱 온리** (웹은 백엔드 API + 개발 미리보기).

- **라이브 백엔드/미리보기**: https://web-eight-olive-98.vercel.app
- **저장소**: https://github.com/messi929/Lucky_APP
- **기준 기획서**: `saju-service-spec-v1.2.md` · **디자인**: `design/`

---

## 현황 요약 (2026-07)

| 영역 | 상태 |
|---|---|
| 만세력 엔진 · 해석 · 궁합 · 택일 · 데일리 | ✅ 완료 (61 테스트) |
| 웹 백엔드(API) + 리포트 UI | ✅ 완료 · **Vercel 배포** |
| Expo 앱 전체 UX (입력→붓글씨→8카드→궁합·문답·택일·선물·구독) | ✅ 완료 · **SDK 54 · 실기기 구동** |
| 인프라: Supabase(DB) · Anthropic(LLM) | ✅ 연결·라이브 검증 |
| 디자인 재스킨(26화면 시안) | ✅ 완료 |
| 검증: typecheck 7/7 · 61 tests · web build · expo-doctor 18/18 | ✅ 그린 |
| **과금·회원정책** | 🚧 **결정 대기** (아래 [열린 결정](#열린-결정)) |

**남은 것**: 과금 방식 결정 → EAS 앱 빌드·스토어 제출·폰트 서브셋·커스텀 도메인·pg_cron 활성 (아래 [남은 작업](#남은-작업)).

### 2026-07-14 변경 (실기기 첫 구동)
- **Expo SDK 52 → 54** (React 19.1 · RN 0.81 · expo-router 6). App Store의 Expo Go는 최신 SDK만 지원 → 실기기 테스트 불가 상태였음. 웹도 React 19로 정렬(중복 react 제거, Next 15는 React 19 지원).
- **리포트 = 가로 페이저**로 교체. 세로 스크롤(ScrollView+snap) → 가로 FlatList 페이징. classic 모드에 큰 [다음] 버튼 병행(디자인 원칙 2 충족).
- **출생 입력 재설계**: 네이티브 휠 피커 제거 → 숫자 8자리(`1990.03.15`) / 4자리(`14:30`) 직접 입력 + 실시간 검증 + 자동 포커스 이동. 택일 기간도 프리셋(1/3/6개월)으로. `@react-native-community/datetimepicker` 의존성 제거.
- **기기 저장 이중화**: SecureStore 단독 → SecureStore + AsyncStorage 폴백(`lib/storage.ts`). 저장이 조용히 실패해 온보딩이 반복되는 경로를 차단.

---

## 아키텍처 (모노레포)

pnpm workspace + Turborepo. `nodeLinker: hoisted` (Expo/Metro 요구).

```
packages/
  core/         순수 TS (웹·앱 공유). 외부 API·DB 호출 없음
    saju/       만세력: ssaju(외부 코어) + 어댑터(corrections·boundary·engine·taekil·daily·ganzi·astro)
    interpret/  해석 유닛·캐시키·페르소나(mz/classic)·가드레일 3단계 (DI로 LLM/캐시 주입)
    compat/     궁합 (관계 7종, 등급 4종, 나쁜 결과 없음)
    content/    일간10·일주60 훅·고민 카탈로그(concerns)·개운 처방
  ui/           디자인 토큰 (색·서체·mode 테마) — 웹/앱 단일 소스
  api-client/   웹·앱 공용 API 타입 (ReportPayload·SKU 등)
apps/
  web/          Next.js 15 (React 19.1) — API 백엔드 + 리포트 UI. Vercel 배포
  mobile/       Expo SDK 54 (expo-router 6, React 19.1 / RN 0.81) — iOS/AOS 앱 전체 UX
tests/          Vitest 회귀 (엔진 삼중 교차검증 + 어댑터 + 해석 + 궁합 + 택일 + 데일리)
supabase/       schema.sql (테이블 8종) · cron.sql (데일리 푸시)
```

### 핵심 기술 결정
- **만세력 = ssaju(npm, MIT) + 어댑터**. 삼중 교차검증(vs lunar-javascript vs 60갑자 앵커) 통과. DST·표준시변경기·진태양시·절입경계·야자시는 우리 어댑터가 처리. (`VERIFICATION-REPORT.md`)
- **LLM에 생년월일 원본 미전달** — 간지·오행·십신 요약(`toLlmContext`)만.
- **해석 캐시** — `유닛:값:버전:시즌:톤모드:관심사` 키로 90%+ 적중 → 비용 디커플링.
- **앱 온리** — 결제는 앱 구독(IAP) 예정, 웹 화면은 미노출(백엔드+미리보기).
- **React 19.1 정렬** (웹·앱) — hoisted 링커에서 중복 네이티브 모듈 방지(expo-doctor 조건).

---

## 열린 결정

### 과금 · 회원정책 (착수 전 반드시 결정)
현재 결제는 **웹 PG(토스)** 기준으로 구현돼 있다 (`api/payments/confirm` → `orders` → 리포트 unlock).
앱 온리 전략이면 스토어 정책상 **IAP로 재설계**해야 하고, 그때 원칙 5(회원가입 금지)와 충돌 지점이 생긴다.

**사실관계**
- 결제 자체는 계정 없이 가능하다. 구독은 Apple ID·Google 계정에 귀속되고, 기기 변경 시 "구매 복원"으로 살아난다.
- 분석 자료(`results` · `compats` · `gifts`)는 **이미 서버에 토큰 PK로 저장**돼 있다. 기기 교체로 사라지는 것은 자료가 아니라 **"그 토큰이 내 것"이라는 연결고리**(기기 로컬)뿐이다.
- 즉 필요한 것은 회원가입이 아니라 **복구 수단** 하나다.

**선택지**
| 방식 | 이탈률 | 복구 신뢰도 | 원칙 5 |
|---|---|---|---|
| A. 복원 코드 6자리 | 낮음 | 낮음 (코드를 저장하지 않음) | 유지 |
| B. 결제 시점에만 1탭 소셜 로그인(Apple/Google) | 낮음 | 높음 | **완화 필요** |
| C. 이메일 가입 폼 | 높음 | 높음 | 위반 |

권장은 **B (무료는 익명 · 결제할 때만 계정 연결)** — 잃어버리면 곤란한 사용자는 결제자뿐이고, 가입 폼이 없어 원칙 5의 취지(첫 경험에 장벽 금지)는 지켜진다. 단 이는 CLAUDE.md 원칙 5 개정이 필요하다.

**연쇄 영향**: IAP로 가면 원칙 9(청약철회 동의 체크)는 웹 PG 결제에만 적용된다 — 앱 내 자체 결제 UI는 스토어 리젝 사유이므로 기획서 §9를 함께 손봐야 한다.

---

## 개발 단계 (기획서 v1.2)

| Phase | 내용 | 상태 |
|---|---|---|
| 1 | 엔진 어댑터 (★게이트) | ✅ |
| 2 | 해석 레이어 (가드레일 3단계·mode 축) | ✅ |
| 3 | 웹 리포트 (8카드·붓글씨·오행 SVG) | ✅ |
| 4 | 공유·궁합·가족·OG·이벤트 | ✅ |
| 5 | 결제·선물·버티컬(자녀운·택일·시험운) | ✅ (구조; IAP 재설계 예정) |
| 6 | 앱 (Expo) — 전체 UX 이식 | ✅ |
| 7 | 데일리 푸시 백엔드 (register·dispatch·cron) | ✅ |
| 8 | 폴리시·런칭 (약관·개인정보·사업자정보·에러) | ✅ |

---

## 실행 방법

```bash
pnpm install          # 최초 1회 (hoisted)
pnpm typecheck        # 전체 타입체크 (7/7)
pnpm test             # 엔진·해석 회귀 (61 tests)
pnpm build            # turbo 빌드

# 웹(백엔드+미리보기) 로컬
cd apps/web && npx next dev        # http://localhost:3000

# 앱 로컬 (Expo Go, 폰 필요)
cd apps/mobile && npx expo start   # QR 스캔
```

환경변수는 `apps/web/.env.local` (미설정 시 stub·인메모리로 무설정 구동). 값 관리: `SETUP-KEYS.md`(gitignore).

---

## 배포

- **백엔드**: Vercel 프로젝트 `web` (Root Directory=`apps/web`, `turbo run build --filter=@lucky/web`). env 4종(ANTHROPIC·SUPABASE_URL·SERVICE_ROLE·CRON_SECRET) 등록됨. 재배포: 루트에서 `npx vercel --prod`.
- **DB**: Supabase — `supabase/schema.sql` 적용됨.
- 상세: `DEPLOY.md`

---

## 남은 작업

**0. 먼저 정할 것 (이게 아래 순서를 바꾼다)**
- [ ] **과금 방식 + 회원정책 결정** → [열린 결정](#열린-결정) 참고. IAP 전환 여부 · 복구 수단(복원 코드 vs 1탭 로그인)

**출시 트랙 (외부 계정 필요)**
- [ ] EAS 앱 빌드 (`eas build`) → TestFlight / Play 내부 트랙
- [ ] Apple Developer($99/년) · Google Play($25) · Universal/App Links(.well-known)
- [ ] RevenueCat + 구독 상품(IAP) — `react-native-purchases` 연동 *(과금 결정 이후)*
- [ ] Vercel ↔ GitHub 자동배포 연결 (대시보드 Settings→Git)
- [ ] Supabase `pg_cron`·`pg_net` 활성 → `supabase/cron.sql` 실행 (데일리 푸시)
- [ ] 커스텀 도메인 → `app.json` 링크 host 교체

**최적화 / 폴리시**
- [ ] 폰트 서브셋 (Noto KR 전체 ~14MB/개 → 한글 subset)
- [ ] 단건 상품 IAP 재설계 (앱 온리 스토어 정책) *(과금 결정 이후)*
- [ ] 궁합·선물 공유 링크 "요약 미리보기 + 설치 유도" 랜딩
- [ ] KASI 절기 테이블로 boundary 정밀화, 대운수 표본 검증
- [ ] 실기기 UX 점검 잔여: 붓글씨 인트로 타이밍 · 카드별 넘침(작은 폰) · 문답/궁합 화면 입력 UX

**사람 트랙 (코드 밖)**
- [ ] 일주 60종 단정형 훅 카피 × 2모드 (`content/hooks.ts`) — 서비스의 심장
- [ ] 일간 10종 캐릭터 IP·일러스트
- [ ] 검증 케이스 30건 만세력 교차확인 / 택일 규칙 감수
- [ ] 사업자등록·통신판매업 신고 → `apps/web/lib/business-info.ts`

---

## 문서 색인
- `CONSULT-FLOW-HANDOFF.md` — **상담 세션 플로우 재설계 작업 핸드오프** (진행 중, `expo-sdk54-ux`): 한 주제씩 상담(허브&세션) + 주제 단위 해금. 남은 할 일·짚어둘 점 정리
- `CLAUDE.md` — 불변 원칙·계산 코어·해석·디자인 규칙 (개발 가이드)
- `saju-service-spec-v1.2.md` — 기준 기획서
- `VERIFICATION-REPORT.md` — 엔진(ssaju) 교차검증 결과
- `design/` — 디자인 핸드오프 + 26화면 시안(HTML)
- `DEPLOY.md` — Vercel 배포 절차
- `SETUP-KEYS.md` — 키 관리 (gitignore)
