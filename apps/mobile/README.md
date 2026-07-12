# @lucky/mobile

Expo (React Native) + expo-router — iOS/AOS 단일 코드베이스 (기획서 Phase 6).

## 구조 (스캐폴드)
- `app/index.tsx` — 홈(오늘의 한 줄·처방·보관함·구독) [APP-1]
- `app/onboarding/push.tsx` — 데일리 푸시 옵트인 [APP-2]
- `app/subscribe.tsx` — 구독 페이월(RevenueCat 자리) [APP-3]
- `app/vault.tsx` — 보관함 + 가족 업셀 [APP-4]
- `app/r/[token].tsx` — 리포트(딥링크 진입, 웹 API 재사용)

## 원칙
- 계산·해석은 `@lucky/core`, 디자인 토큰은 `@lucky/ui`, API 타입은 `@lucky/api-client` 재사용(중복 구현 금지).
- 앱은 **구독만**(IAP), 단건 결제는 웹(스토어 정책). Universal/App Links로 설치자→앱 분기.

## 모노레포 빌드 설정 (중요)
- **pnpm `nodeLinker: hoisted`** (pnpm-workspace.yaml) — Metro는 flat node_modules 기대. 필수.
- **웹·앱 React 버전 정렬 = 18.3.1** — hoisted에서 React 중복 방지(Expo 52 = React 18).
- `metro.config.js`: watchFolders(워크스페이스 루트) + `unstable_enablePackageExports`(@lucky/* 서브패스).
- 검증: `npx expo export --platform ios` 로 전체 번들 성공 확인(@lucky/core·ui·svg·폰트 포함).

## 개발 중 API 연결
- `EXPO_PUBLIC_API_BASE` = 백엔드 URL. 로컬 개발 시 웹(`apps/web`)을 띄우고 머신 LAN IP 지정
  (예: `EXPO_PUBLIC_API_BASE=http://192.168.x.x:3000 npx expo start`).

## 폰트 최적화 TODO
- 현재 Noto Serif/Sans KR 전체 웨이트 = 폰트당 ~14MB → 앱 용량 큼. **한글 서브셋(subset)** 필요.

## 남은 작업 (런타임 필요)
- 시뮬레이터/EAS 실행 검증 (`expo start`, `eas build`)
- 기기 저장 birth(익명 §12) → 홈/리포트 실데이터 바인딩
- expo-notifications 푸시 토큰 등록 + Phase 7 발송 배치 연결
- RevenueCat(react-native-purchases) 구독 실연동
- 디자인 세션: 카드 스와이프·붓글씨 연출·클래식 모드
