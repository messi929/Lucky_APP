# 🚀 백엔드 배포 (Vercel) — 앱 온리

> 웹 화면은 사용자에게 노출 안 함. `apps/web`을 **API 백엔드**로만 배포한다.
> 앱(`apps/mobile`)이 이 백엔드를 호출해 해석·저장·궁합·문답·택일·푸시를 처리.

## 1. GitHub에 푸시
```bash
git init && git add . && git commit -m "init"   # (이미 repo면 생략)
git remote add origin <your-repo> && git push -u origin main
```
※ `.env.local`, `SETUP-KEYS.md`는 .gitignore 처리됨 — 커밋 안 됨(정상).

## 2. Vercel 프로젝트 생성
1. vercel.com → **New Project** → GitHub 저장소 import
2. **Root Directory** = `apps/web` 로 지정 (중요)
3. Framework: Next.js (자동 감지)
4. Build/Output은 `apps/web/vercel.json`이 자동 적용
   (`turbo run build --filter=@lucky/web` → @lucky/core 먼저 빌드 후 web)

## 3. 환경변수 등록 (Vercel → Settings → Environment Variables)
`.env.local`의 값을 그대로 입력 (앱 온리라 토스는 불필요):
```
ANTHROPIC_API_KEY
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
CRON_SECRET
```
→ **Deploy**. 완료되면 `https://<project>.vercel.app` 발급.

## 4. 앱을 백엔드에 연결
- 개발: `EXPO_PUBLIC_API_BASE=https://<project>.vercel.app npx expo start`
- 배포(EAS): EAS Secret 또는 `eas.json`의 env에 `EXPO_PUBLIC_API_BASE` 설정
- `apps/mobile/app.json`의 `associatedDomains`/`intentFilters` host를 실제 도메인으로 교체
  (Universal/App Links로 초대·선물 링크가 앱을 열도록)

## 5. 데일리 푸시 cron (앱 출시 후)
- Supabase → Extensions에서 `pg_cron`, `pg_net` 활성
- `supabase/cron.sql`의 `<WEB_BASE>`=Vercel URL, `<CRON_SECRET>`=env 값으로 치환 후 실행

## 참고
- API 라우트는 Vercel 서버리스 함수로 자동 배포됨(`runtime = "nodejs"`).
- 공유/초대/선물 링크(`/c/…`, `/g/…`)는 앱 온리에선 **앱을 여는 유니버설 링크**로 동작.
  앱 미설치자용 "요약 미리보기 + 설치 유도" 랜딩은 별도(스마트링크/최소 페이지) — 추후.
