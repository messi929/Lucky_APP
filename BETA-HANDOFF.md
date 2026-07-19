# 📋 클로즈드 베타 — 작업 핸드오프 (2026-07-19)

정식 오픈 전, 초대 코드를 가진 고객만 접근하는 비공개 베타. 웹은 **라이브**, 앱은 준비 단계.
운영 방법(발급·회수·오픈)은 → [`BETA.md`](./BETA.md). 이 문서는 **현재 상태 + 다음 할 일**.

---

## ✅ 완료된 작업

### 1. 초대 게이트 구현 (커밋 `5660fee`)
원칙 5(가입 없음·토큰 접근) 결. `BETA_SECRET` 있을 때만 활성 → 없으면 완전 개방(로컬 기본).

**웹 (`apps/web`)**
| 파일 | 역할 |
|---|---|
| `middleware.ts` | 메인 퍼널 게이트. 미인증 페이지→`/beta`(307), 미인증 API→401. 수신자 공유·법적고지 개방 |
| `app/beta/page.tsx` + `components/BetaGate.tsx` | 코드 입력 화면, `?invite=CODE` 자동 입장 |
| `app/api/beta/redeem/route.ts` | 코드 검증(Supabase 우선, `BETA_CODES` env 폴백) → HMAC 서명 쿠키 90일 |
| `lib/beta.ts` | HMAC 서명/검증 (edge+node 공용) |

**앱 (`apps/mobile`)**
| 파일 | 역할 |
|---|---|
| `lib/api.ts` | 전 호출 `x-palja-beta` 헤더, 401→`BetaRequiredError` |
| `app/beta.tsx` + `app/index.tsx` | 첫 실행 코드 입력 게이트 (하드 게이트는 TestFlight/내부테스트) |
| `lib/storage.ts` | 자격 증명 SecureStore 저장 |
| `eas.json` | internal/preview/production 빌드 프로필 |

**인프라**
- `supabase/schema.sql` — `beta_codes` 테이블
- `scripts/mint-beta.mjs` — 코드 발급 + 초대 링크 출력
- `BETA.md` — 운영 가이드

### 2. 프로덕션 배포 (라이브)
- ✅ main 머지 (`5660fee`)
- ✅ Supabase `beta_codes` 테이블 생성 (SQL 에디터 수동 적용)
- ✅ 초대 코드 **10개 발급** (note="베타 1차", 1회용) — 값은 Supabase `beta_codes` 조회
- ✅ Vercel Production env `BETA_SECRET` 등록 → 게이트 활성
- ✅ E2E 검증 7종 통과 (리다이렉트/코드교환/쿠키/공개경로)

### 3. Vercel Git 자동배포 재연결 (커밋 `d330b12`, `c0c43bc`)
- 원인: Vercel 계정에 GitHub 로그인 연결이 풀려 있어 자동배포 꺼져 있었음
- 대시보드 GitHub 승인 → `vercel git connect` 성공 → 테스트 push로 자동배포 확인
- **이제 main push → 자동 프로덕션 배포**, 브랜치 → 프리뷰

### 4. (부수) `/r/[token]` 500 원인 규명
- 로컬 dev의 **stale `@lucky/core` dist** 문제. 프로덕션은 매 배포 core 재빌드라 무관.
- core 소스 수정 후엔 `pnpm --filter @lucky/core build` 필요.

---

## 🌐 현재 라이브 상태

| 항목 | 값 |
|---|---|
| 프로덕션 URL | `https://web-eight-olive-98.vercel.app` |
| 게이트 | **활성** (BETA_SECRET 설정됨) |
| 초대 코드 | 10개 발급, 0개 사용 |
| 자동배포 | **ON** (main push) |
| 커밋 HEAD | `c0c43bc` (main == expo-sdk54-ux) |

초대 링크 형식: `https://web-eight-olive-98.vercel.app/beta?invite=<CODE>`

---

## 🔜 다음 필요 작업

### A. 모바일 앱 베타 배포 (우선순위 높음)
1. **개발자 계정 발급** (베타는 개인 계정 권장 — D-U-N-S 대기 없음)
   - Apple Developer Program $99/년 (Individual)
   - Google Play Console $25/1회 (Personal) — ⚠️ 내부테스트는 "20인×14일" 규칙 면제
2. `apps/mobile/eas.json`의 `EXPO_PUBLIC_API_BASE` 확인 (현재 `web-eight-olive-98.vercel.app`)
3. `eas login` → `eas build --profile production --platform ios|android`
4. `eas submit` → TestFlight / Play 내부테스트 업로드 → 테스터 이메일 초대
5. 앱 첫 실행 시 초대 코드 입력 → API 자격(`x-palja-beta`) 확보되는지 실기기 확인

### B. 커스텀 도메인 (선택)
- 현재 `web-eight-olive-98.vercel.app`. `apps/mobile/app.json`은 이미 `paljareport.com` 참조(associatedDomains/intentFilters).
- 도메인 붙이면: Vercel 프로젝트에 도메인 추가 → DNS 설정 → 초대 코드 **재발급**(--base 새 도메인) → 앱 딥링크 host 일치 확인.

### C. 정식 오픈 전환 (런칭 시점)
- Vercel Production에서 `BETA_SECRET` **제거** → `git push`(자동배포) 또는 `vercel --prod` → 게이트 해제.
- 필요 시 앱 게이트도 완화(현재 첫 실행 코드 요구).

### D. 운영 중 상시
- 코드 추가: `node scripts/mint-beta.mjs --count N --note ".." --base <URL>` (Supabase 키는 `apps/web/.env.local`)
- 코드 회수: Supabase `update beta_codes set revoked=true where code='..'`
- 전원 강제 재입장: `BETA_SECRET` 값 교체 후 재배포

### E. 미해결/미착수 (기존 백로그)
- 결제 실연동(토스) — Phase 5, 청약철회 동의 UI는 이미 있음(원칙 9)
- 데일리 푸시 cron — `supabase/cron.sql`, 앱 출시 후
- OG 이미지 한글 폰트 임베딩 — `lib/og-render.tsx` 폴리시 항목
- Phase 8 폴리시: 통신판매업 신고·사업자정보(런칭 게이트)

---

## ⚠️ 주의사항 (다음 세션/작업자용)
- **프로덕션은 Supabase 경로만 사용** — `consume()`은 Supabase 있으면 `beta_codes`만 조회, env `BETA_CODES` 폴백은 Supabase 없을 때만. 즉 코드 활성화 전 **테이블+코드가 먼저** 있어야 잠금 사고 없음.
- Turbo 빌드 시 "env missing from turbo.json" 경고는 무해(BETA_SECRET은 런타임 사용).
- core 소스 수정 시 로컬 dev는 `@lucky/core` 재빌드 필요.
- 커밋/배포는 main push = 자동 프로덕션 배포임을 유의(문서 변경도 배포 트리거).
