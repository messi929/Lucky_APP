# core/saju — 만세력 엔진

## 구조 (VERIFICATION-REPORT 아키텍처)

```
computeSaju(SajuInput)
  └─ corrections.ts  우리입력 → 한국 보정 → ssaju 입력(SsajuInput)
       · 서머타임(1948–51,55–60,87–88) -1h      [time.ts: isDst/stripDst]
       · 표준시 변경기(1954-08~1961-08) LMT 비활성 [time.ts: isStandardTimeEra]
       · 진태양시(LMT) 경도 보정 → ssaju에 위임     [regions.ts: 시·도 경도]
  └─ ssaju.calculateSaju()   [외부 코어 · 버전 pin · 직접 수정 금지]
       · 연월일시 4주, 십성, 12운성, 대운/세운/월운, 격국/용신/신살, 오행, toCompact()
  └─ boundary.ts   절입 ±5분 경계 플래그 [astro.ts 자체 천문계산]
  └─ SajuChart { saju, meta, boundary }
```

## 계약(불변)
- `packages/core`는 순수 TS. 외부 API·DB 호출 없음. ssaju/자체 astro만으로 결정론적 계산.
- LLM에는 `SajuChart.saju.toCompact()`만 전달. 생년월일 원본 미전달.
- ssaju 버전 변경 시 `tests/saju-engine.test.ts` 전체 통과 필수.

## 검증 (`tests/saju-engine.test.ts`)
- **A. 계산 코어 회귀**: ssaju(raw) vs lunar-javascript vs 60갑자 앵커 산술 3자 교차 (경계 케이스 13종)
- **B. 어댑터**: DST 보정, 표준시 변경기 LMT 비활성, 진태양시 flip, 절입 경계 플래그, 음력/윤달, 출생시 모름 폴백

## 알려진 한계 (교차검증 TODO, REPORT)
- 절입 시각 ±2분 근사 → v1은 경계 플래그로 안내(리포트 문구). 추후 KASI 절기 테이블 오버라이드.
- 표준시 변경기 출생: LMT 비활성으로 근사 처리(문서화). 정밀화는 후속.
- 야자시 시간(干): ssaju 당일 일간 기준 채택(조자시설). 유파 차이이며 버그 아님.
- 대운수(순행/역행·시작나이) 표본 3건 수동 검증 예정.

## astro.ts (자체 천문계산)
경계 플래그·검증용 24절기 절입 시각. Meeus 태양황경 급수. 외부 API 제로. ±1~2분.
