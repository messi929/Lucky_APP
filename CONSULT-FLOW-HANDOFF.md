# 상담 세션 플로우 — 작업 핸드오프

> 2026-07-18 작업 기록. "8카드 한 번에" → **"한 주제씩 상담(허브&세션)"** 재설계.
> 다음 세션에 이 문서만 읽고 이어서 진행할 수 있게 정리함.
> 관련 기획: `saju-service-spec-v1.2.md` · 원칙: `CLAUDE.md` · 시안 아티팩트: https://claude.ai/code/artifact/74ba6658-bfb5-4485-a741-dd25ee9233c6

## 0. 한눈에

- 브랜치 `expo-sdk54-ux`, **커밋 3건** 완료: `e2c7057`(입력 수정) · `90f5006`(세션 플로우) · `5be98ed`(주제 단위 해금). **아직 main 미병합.**
- 검증: **typecheck 7/7 · 68 tests · 웹 빌드 · 세션 백엔드 curl end-to-end** 모두 그린.
- 남은 건 대부분 **배포/결제/UI 시각검증** 단계 (아래 §4). 코드 로직은 검증됨.

## 1. 새 플로우 개념

실제 철학관처럼 **주제 1개씩 상담하고 마무리→다음**.

```
오프닝(도사 인사, 무료)  = 기존 리포트 덱의 앞부분
        ↓
고민 허브 "오늘 뭐가 궁금해요?"  = 고민 1개 선택
        ↓
집중 세션[결혼운 등]  진단(무료) → 근거 → 시기 → 처방   ← 여기서 주제 단위 해금
        ↓
마무리  낙관 스탬프(緣) + 주홍 "꺾는 문장"
        ↓
다음 안내  도사가 다음 주제 추천 (결혼운→택일)
```

**과금 결정**: 전체 해금(3,900) → **주제 단위 해금(990원)**. 무료=진단 1비트, 결제 시 그 주제만 근거·시기·처방.

## 2. 구현된 것 (파일 지도)

### core (`packages/core/src/interpret/`)
- `types.ts` — `UnitKind`에 세션 비트 4종 추가(`session_diagnosis|reason|timing|remedy`), `SessionBeatKind`·`SESSION_BEATS`·`SessionReading` 타입
- `units.ts` — `decomposeSessionUnits(chart, concern, ctx)`: 무료=진단만, 유료=4비트, 나머지 locked 반환
- `persona.ts` — 세션 비트별 프롬프트 지시문(`unitInstruction`) + `concernFor` 헬퍼
- `interpret.ts` — **`interpretSession(chart, concern, ctx, deps)`** 신규 + SAFE_FALLBACK 4종
- `index.ts` — `interpretSession`·`decomposeSessionUnits`·`SESSION_BEATS`·타입 export
- `saju/regions.ts` — `regionLongitude` 미지 코드 fallback(방어코딩)

### api-client (`packages/api-client/src/index.ts`)
- `SessionRequest` · `SessionPayload`(concern·beats·lockedBeats·paid·chart·next·disclaimer)

### 웹 (`apps/web/`)
- `lib/report.ts` — `buildChartSummary()` 추출(리포트·세션 공용)
- `lib/session.ts` — `buildSession()` + 다음 주제 추천 맵(`NEXT`)
- `app/api/session/route.ts` — POST 세션 리딩. `isSessionUnlocked`로 paid 판정
- `app/api/session/unlock/route.ts` — POST 주제 해금(청약철회 동의 필수, 원칙 9)
- `app/s/[token]/[concern]/page.tsx` + `components/SessionView.tsx` — 세션 화면(웹 프리뷰). 해금 버튼→unlock→4비트 재조회
- `components/BirthFields.tsx` — 생년월일 **8자리 직접입력 재설계**(네이티브 피커 제거, 모바일과 통일)
- `components/ReportDeck.tsx` — 고민 카드 → 세션(`/s/...`)으로 이동
- `lib/storage/{adapter,memory,supabase,index}.ts` — `isConcernUnlocked`/`unlockConcern` + storage globalThis 캐시
- `lib/store.ts` — `unlockConcern`·`isSessionUnlocked`
- `supabase/schema.sql` — `concern_unlocks` 테이블 추가

### 모바일 (`apps/mobile/`)  ※ 앱 온리 전략의 본진
- `app/consult.tsx` — 상담 허브(연령 적응 고민 타일, 네트워크 0 로컬 계산)
- `app/session/[concern].tsx` — 세션 화면(진단→근거→시기→처방→마무리→다음)
- `lib/api.ts` — `fetchSession()`
- `app/index.tsx` — 홈에 "오늘의 상담" 진입
- `components/ReportDeck.tsx` — 고민 카드 → `/session/[concern]`
- `components/ui.tsx` — `Btn`에 `gold` variant(해금 버튼)

## 3. ⚠️ 짚어둘 점 (다음에 헷갈리지 않게)

1. **로컬 웹은 실 Supabase에 붙어 있다.** `apps/web/.env.local`에 `SUPABASE_URL`+`SERVICE_ROLE`이 있어 dev도 supabaseAdapter 사용(memory 아님). → **`concern_unlocks` 테이블이 DB에 없어서 3111에서 해금이 반영 안 됐음**(코드 버그 아님, graceful fallback으로 crash 없이 "미해제"). 코드 로직은 memory 모드(supabase env 비우고 실행)로 검증 완료: 무료 1비트 → 해금 → 4비트, 타 주제 격리.

2. **주제 단위 해금은 아직 "전역 isPaid"와 공존.** `isSessionUnlocked = isPaid(토큰전역) OR isConcernUnlocked(주제)`. 진짜 IAP 전환 시 unlock 호출을 **결제 confirm 뒤로** 옮겨야 함(현재 `/api/session/unlock`은 동의만 받고 바로 해금 = 프리뷰용).

3. **마무리 "꺾는 문장"은 진단문 재사용 중.** concern별 authored pivot 카피가 아직 없음(사람 트랙).

4. **웹 허브 페이지 없음.** 웹은 리포트 덱 고민 카드로만 세션 진입. 모바일은 `consult.tsx` 허브 있음.

5. **개발 서버 재시작 시 `taskkill //IM node.exe` 쓰지 말 것** — chrome-devtools 등 MCP 서버(node 기반)까지 죽는다. 포트 지정 kill 사용:
   `netstat -ano | grep ":3111" | grep LISTENING` → 그 PID만 `taskkill //F //PID <pid>`.

6. **`apps/web/tsconfig.tsbuildinfo`가 추적됨(빌드 산출물).** 커밋에서 계속 제외 중. gitignore에 추가하면 깔끔(별도 작업).

7. **기존 8카드 덱은 "오프닝"으로 흡수 예정.** 현재는 덱 뒤쪽(seasonal/caution/remedy)이 세션과 일부 중복. 오프닝 범위 확정 필요.

## 4. 남은 할 일 (우선순위 순)

**배포/결제 트랙**
- [ ] 배포 Supabase에 `concern_unlocks` 마이그레이션 적용 (`supabase/schema.sql`의 해당 CREATE 실행)
- [ ] 과금/회원정책 확정 → IAP 전환 여부. 확정 시: `/api/session/unlock` 호출을 실결제 confirm 뒤로, CLAUDE.md 원칙 5/9 개정 (README '열린 결정' 참고)
- [ ] 유료 4비트 **UI** 시각검증(백엔드는 curl로 검증됨). MCP 브라우저 복구 후 또는 실기기

**UX 완성**
- [ ] 웹 허브 페이지 신설(또는 리포트 덱을 "오프닝"으로 재정의하고 허브 분리)
- [ ] concern별 authored "꺾는 문장" 카피(사람 트랙) — 마무리 임팩트
- [ ] 나머지 concern의 "다음 주제 추천" 매핑 확장(`apps/web/lib/session.ts`의 `NEXT`)
- [ ] 모바일 세션 화면 실기기 UX 점검(작은 폰 넘침, 붓글씨 타이밍 등)

**정리**
- [ ] `expo-sdk54-ux` → main 병합 시점 결정
- [ ] `tsconfig.tsbuildinfo` gitignore

## 5. 다음에 검증하는 법 (명령어)

```bash
# 전체 검증
pnpm typecheck && pnpm test         # 7/7 · 68 tests

# 세션 백엔드 end-to-end (memory 모드 = supabase env 비우고 실행)
cd apps/web && SUPABASE_URL="" SUPABASE_SERVICE_ROLE_KEY="" npx next dev -p 3112
#  → POST /api/report 로 토큰 발급
#  → POST /api/session {token, concern, ctx}          # 무료: 진단 1비트 + locked 3
#  → POST /api/session/unlock {token, concern, withdrawalConsent:true}
#  → POST /api/session (재조회)                         # 유료: 4비트 전체
#  → 다른 concern 은 여전히 잠김(주제별 격리)

# 실 Supabase 모드로 쓰려면 먼저 concern_unlocks 테이블 적용 필요
```
