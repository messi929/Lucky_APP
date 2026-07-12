# 디자인 핸드오프 — 팔자 리포트 v1.2 (Claude Code용)

> 이 문서 + `design-spec-v1.2.html`이 디자인의 단일 소스.
> HTML의 `:root` CSS 변수 = `packages/ui` 토큰과 1:1. 브라우저로 열어 시각 확인, 코드로 파싱해 값 추출.
> 보조 자료: Figma (P0 온보딩 4장 + P1 코어 7장 시각 시안) — https://www.figma.com/design/ZI8kpNF1GdfbuJ53lqe7MF

## 1. 토큰 (packages/ui/tokens.ts 로 이식)
```
색:   paper #F5F0E8 · paperDk #EEE7DA · white #FFF · ink #1A1714 · ink70 #4A443C · ink40 #8D877D
      vermil #C63D2F (낙관·강조) · gold #B08D46 · teal #3D6B68 · kakao #FEE500
오행: wood #5B7B5A · fire #C63D2F · earth #B08D46 · metal #8C8C88 · water #3D5A73
서체: 헤드라인 Noto Serif KR 900 / 본문 Noto Sans KR 400·500·700
      (RN: expo-google-fonts 동일 패밀리. 대체 시 세리프 계열 유지 필수)
반경: card 14 · tile 16 · pill 100 · screen 24
모드: mz(기본) / classic — HTML .classic 오버라이드 참조 (본문 16px+·행간 1.8·버튼 20px 패딩·필드값 20px)
```

## 2. 화면 인벤토리 → 라우트/컴포넌트 매핑 (26장)
| 화면 ID | 라우트(웹) / 스크린(앱) | 핵심 컴포넌트 | Phase |
|---|---|---|---|
| P0 토큰 | — | tokens.ts | 3 |
| ON-1 입력 | `/` → `/input` | ConversationalForm, Field | 3 |
| ON-2 훅 | `/r/[token]` 카드1 | HookCard(60종 카피), TypingText | 3 |
| ON-3 타입 | 카드3 | TypeCard(일간10 IP), InkCircle | 3 |
| ON-4 처방전 | 카드7 | RemedyCard(=OG 공유 디자인) | 3·4 |
| R0 연출 | 카드0 | BrushStrokeIntro(SVG 패스 애니, skip) | 3 |
| R2 원국·오행 | 카드2 | PillarTable, ElementBars(SVG 자체구현) | 3 |
| R-반응 | 카드3.5 | ReactionCheck → 톤 분기 상태 | 3 |
| R-고민 | 카드4.5 | ConcernPicker(concerns.ts ageWeights) | 3 |
| R5 하반기 | 카드5 | SeasonCard(월 키워드 리스트) | 3 |
| R6 티저 | 카드6 | BlurTeaser + PaywallCTA | 3·5 |
| R8 허브 | 카드8 | CTAHub(4메뉴) | 3 |
| PAY-1 시트 | `/pay` 바텀시트 | SkuList, **WithdrawalConsent(법률 필수)** | 5 |
| PAY-2 문답 | `/pay/ask` | QuestionInput(연령 플레이스홀더) | 5 |
| PAY-3 자녀운 | `/pay/child` | ChildForm, GuardrailNote(L3) | 5 |
| PAY-4 택일 | `/pay/taekil` | GoodDaysList, AvoidDays, CalendarSave | 5 |
| REL-1 관계 | `/compat/new` | RelationGrid(6유형+가족) | 4 |
| REL-2 수신자 | `/c/[token]` | InviteeLanding(**웹 전용, 설치요구 금지**) | 4 |
| REL-3 결과 | `/c/[token]/result` | CompatResult(등급4, 부정 프레임 금지) | 4 |
| GIFT-1 수신 | `/g/[token]` | GiftUnbox(福 박스), SenderMessage | 5 |
| APP-1 홈 | app `/` | TodayLine(먹 카드), MonthRemedy, VaultEntry | 6 |
| APP-2 옵트인 | app onboarding | PushOptIn(미리보기 카드) | 6 |
| APP-3 구독 | app paywall | SubBenefits(3), PriceBar, RevenueCat | 6 |
| APP-4 보관함 | app `/vault` | ReportList, FamilyUpsell(점선 카드) | 6 |
| CL-1·2 클래식 | mode='classic' | 동일 컴포넌트 + classic 토큰 | 3 |
| WEB-1 랜딩 | `/` (미입력 상태) | Hero(팔자 타이포), TrustLine | 3 |

## 3. 불변 디자인 규칙 (CLAUDE.md에 병합)
1. 주홍(vermil)은 화면당 1~2곳 — 낙관 스탬프 또는 "꺾는 문장"에만. 버튼 기본색 아님(기본은 ink).
2. 카드 1장 = 뷰포트 1화면. 스와이프(mz) / 큰 [다음] 버튼 병행(classic).
3. classic은 `.classic` 오버라이드 축으로만 — 화면 중복 구현 금지.
4. 낙관 스탬프 한자 어휘: 命(브랜드) 眞(훅) 問(질문) 答(고민) 運(처방) 緣(궁합) 福(선물) 吉(택일) 曉(아침푸시) — 화면당 하나.
5. REL-2, GIFT-1(수신자 화면)에 앱 설치 요구 UI 금지.
6. PAY-1의 청약철회 동의 체크 = 전자상거래법 요건. 제거·기본체크해제 불가(사용자가 직접 체크).
7. 오행 차트·붓글씨 연출은 SVG 자체 구현 — 차트/애니 라이브러리 금지(번들 최소화).
8. 모든 해석 예시 문구는 플레이스홀더 — 실문구는 core/content + guardrails 통과본만.

## 4. Claude Code 투입 방법
- Phase 3 세션 시작 시 이 문서와 HTML을 리포지토리 `docs/design/`에 넣고 CLAUDE.md에 참조 추가:
  "UI 구현 전 docs/design/design-spec-v1.2.html의 해당 화면 섹션과 DESIGN-HANDOFF.md 매핑표를 확인할 것."
- 지시문 예: "R2 화면을 packages/ui 토큰으로 구현. HTML의 P1 섹션 R2 마크업을 시각 기준으로 삼되, 오행 바는 SVG로, 값은 SajuChart에서 바인딩."
- Figma는 P0·P1 시각 레퍼런스로만 (MCP 호출 한도로 P2~P5는 HTML이 유일 소스).

## 5. 남은 디자인 TO-DO
- 일간 10종 일러스트 (현재 타이포 대체 — IP 확정 후 교체)
- 붓글씨 애니메이션 모션 스펙 (자당 0.25s, 총 2~3s, ease-out, prefers-reduced-motion 시 즉시 표시)
- OG 이미지 2종(1:1/9:16) 상세 — ON-4 디자인 기반
- 다크모드: v1 미지원(한지 무드가 아이덴티티), 앱 시스템 다크에서도 paper 고정
