# 🎟️ 클로즈드 베타 — 초대한 고객만 (웹 + 앱)

정식 오픈 전, 초대 코드를 가진 고객만 접근하는 비공개 베타. 원칙 5(가입 없음·토큰 접근)와 동일한 결.

- **웹**: 미들웨어 게이트 + 서명 쿠키. 초대 코드 교환 시 90일 쿠키 발급.
- **앱**: TestFlight/내부테스트(초대 기기만 설치)가 1차 게이트. 앱 첫 실행 시 같은 코드로 API 자격 확보.
- **게이트는 `BETA_SECRET` 환경변수로 on/off** — 미설정이면 완전 개방(로컬 개발 기본값).

---

## 웹 (Vercel) — 지금 바로 가능

### 1. Supabase 테이블 적용 (1회)
```bash
# supabase/schema.sql 를 SQL 에디터에 붙여넣기 (beta_codes 포함)
```
> Supabase가 없거나 못 쓰는 상황이면, 아래 env `BETA_CODES` 폴백으로도 동작.

### 2. Vercel 환경변수 등록 (Settings → Environment Variables)
```
BETA_SECRET   = <랜덤 긴 문자열>      # 이 값이 있어야 게이트가 켜짐. 바꾸면 전원 재입장.
# (선택) Supabase 대신 간단히 갈 때:
BETA_CODES    = CODE1,CODE2,CODE3     # 콤마 구분 화이트리스트 (Supabase 미설정 시에만 사용)
```
→ 재배포하면 랜딩 포함 전 화면이 `/beta` 게이트로 막힘.

### 3. 초대 코드 발급 → 고객에게 링크 전달
```bash
SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
node scripts/mint-beta.mjs --count 10 --note "지인 1차" --base https://<도메인>
```
출력 예:
```
A3F9K7   →   https://<도메인>/beta?invite=A3F9K7
```
고객이 링크를 열면 **코드 자동 입력 → 입장**. 이후 90일간 재입력 불필요.
직접 코드만 알려주고 `/beta`에서 입력하게 해도 됨.

### 코드 관리 (Supabase `beta_codes`)
| 컬럼 | 의미 |
|---|---|
| `code` | 초대 코드 |
| `note` | 누구에게 줬는지 메모 |
| `max_uses` | 사용 허용 횟수 (기본 1, 1인 다기기면 상향) |
| `used_count` | 실제 교환된 횟수 |
| `revoked` | `true`로 바꾸면 즉시 무효 |
| `last_used_at` | 마지막 사용 시각 |

- **회수**: `update beta_codes set revoked = true where code = 'A3F9KY';`
- **전원 강제 로그아웃**: `BETA_SECRET` 값 교체 (기존 쿠키 전부 무효화).

### 열려 있는 경로 (초대 코드 불필요)
- 수신자 공유: `/r/*` `/c/*` `/g/*` `/compat/*` + og·gift·compat API (원칙 6 — 궁합·선물 수신자에게 설치/가입 요구 금지)
- 법적 고지: `/privacy` `/terms` `/business`
- 게이트 자체: `/beta`, `/api/beta/*`

---

## 앱 (Expo) — TestFlight / Play 내부테스트

앱은 **스토어 테스트 트랙 자체가 초대 게이트**(테스터 이메일만 설치 가능). 앱 첫 실행 화면에서
같은 초대 코드를 넣어 API 자격(`x-palja-beta` 헤더)을 확보한다 — `BETA_SECRET`이 켜진 백엔드는
자격 없는 앱 호출을 401로 막기 때문.

### iOS (TestFlight)
```bash
npm i -g eas-cli && eas login
cd apps/mobile
eas build --profile production --platform ios   # Apple Developer 계정 필요($99/년)
eas submit --profile production --platform ios   # App Store Connect 업로드
```
→ App Store Connect → TestFlight → **내부/외부 테스터 추가**(이메일 초대).

### Android (내부 테스트)
```bash
eas build --profile production --platform android
eas submit --profile production --platform android  # Google Play($25 1회)
```
→ Play Console → 테스트 → **내부 테스트** 트랙에 테스터 이메일/그룹 등록.

### 더 빠른 대안 — 스토어 없이 직접 배포 (`preview` 프로필)
```bash
eas build --profile preview --platform android   # APK 링크를 바로 공유
eas build --profile preview --platform ios       # ad-hoc, 기기 UDID 등록 필요
```

### 배포 전 체크
- `apps/mobile/eas.json`의 `EXPO_PUBLIC_API_BASE`를 실제 백엔드 URL로 (현재 `web-eight-olive-98.vercel.app`).
- `apps/mobile/app.json`의 `associatedDomains`(`applinks:paljareport.com`)·Android `intentFilters` host를
  실제 도메인으로 교체해야 초대·선물 링크가 앱을 연다.

---

## 요약 흐름
1. `supabase/schema.sql` 적용 → Vercel에 `BETA_SECRET` 등록 → 재배포 (웹 게이트 ON)
2. `node scripts/mint-beta.mjs` 로 코드 발급 → 고객에게 `/beta?invite=CODE` 링크 전달
3. 앱은 EAS 빌드 → TestFlight/내부테스트에 테스터 초대 → 첫 실행 시 같은 코드 입력
4. 오픈 시: `BETA_SECRET` 제거(또는 미들웨어 완화)로 게이트 해제
