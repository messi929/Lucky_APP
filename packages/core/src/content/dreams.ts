/**
 * 꿈 상징 사전 (DREAM-DESIGN.md). 무료 리텐션 훅의 콘텐츠 단일 소스.
 * 순수 TS — 외부 호출 없음(원칙 1). 웹·앱 공용(원칙 8).
 *
 * 설계 제약 두 가지가 이 파일의 형태를 정한다.
 *  1) **선택형**: 자유 서술을 받지 않는다. 값이 무한해지면 캐시가 무너지고
 *     (조회 1건 = LLM 1콜) 무료 기능이 바이럴을 탈수록 손해가 커진다.
 *  2) **오행 다리**: 상징마다 오행 하나를 부여해, 사용자 원국의 부족/과다와
 *     대조한다(3종). 일간 10종을 키에 넣지 않고도 개인화가 성립한다.
 *
 * `classic`은 정적이라 LLM 없이도 화면이 뜬다 — 무료 기능이 유료 경로의
 * 가용성을 갉아먹지 않게 하는 방어선이다.
 *
 * ⚠️ 해몽은 흉몽 프레임이 본질이라 카피는 전부 "예언이 아니라 지금 마음의 신호"
 *    프레임으로만 쓴다. 길흉 단정·태몽의 임신 단정·복권 유도는 가드레일에서 막지만,
 *    카피 단계에서 먼저 피한다.
 */

import type { Element } from "../saju/constants.js";
import type { GuardrailLevel } from "./concerns.js";

/** 꿈에서 받은 느낌 — 같은 상징도 감정에 따라 해석이 갈린다 */
export type DreamMood = "fear" | "relief" | "sad" | "odd";

export const DREAM_MOOD_LABEL: Record<DreamMood, string> = {
  fear: "무서웠어요",
  relief: "개운했어요",
  sad: "슬펐어요",
  odd: "이상했어요",
};

/** 상징 오행 × 내 원국의 관계 (캐시 키 축) */
export type DreamRelation = "lack" | "excess" | "neutral";

export type DreamCategory = "animal" | "nature" | "body" | "person" | "event" | "thing";

export const DREAM_CATEGORY_LABEL: Record<DreamCategory, string> = {
  animal: "동물",
  nature: "자연",
  body: "몸",
  person: "사람",
  event: "상황",
  thing: "사물·장소",
};

export type DreamSymbolId =
  | "snake" | "dragon" | "tiger" | "pig" | "dog" | "cat" | "cow" | "horse"
  | "mouse" | "bird" | "fish" | "spider" | "bug"
  | "sea" | "river" | "flood" | "rain" | "fire_burning" | "mountain" | "tree"
  | "flower" | "snow" | "wind" | "muddy_water" | "well"
  | "teeth_falling" | "hair" | "blood" | "naked" | "pregnant" | "feces" | "wound"
  | "deceased" | "ex_lover" | "stranger" | "baby" | "celebrity" | "family"
  | "chased" | "falling" | "flying" | "lost" | "exam" | "late" | "fight"
  | "death_scene" | "wedding" | "funeral" | "moving_house" | "falling_out"
  | "money" | "gold" | "shoes" | "mirror" | "knife" | "door" | "stairs"
  | "car" | "toilet" | "hospital";

export interface DreamSymbol {
  id: DreamSymbolId;
  category: DreamCategory;
  /** 선택 UI 표기 */
  label: string;
  /** 검색 보조 (동의어·구어) */
  aliases: string[];
  /** 원국과 엮는 다리 */
  element: Element;
  guardrailLevel: GuardrailLevel;
  /** 전통 통설 한 줄 — 정적. LLM 없이도 이 문장은 뜬다 */
  classic: string;
  /** LLM 해석 지시 (원국 컨텍스트는 프롬프트 빌더가 별도로 붙인다) */
  promptTemplate: string;
}

/** 상징 사전. id → 정의 */
export const DREAM_SYMBOLS: Record<DreamSymbolId, DreamSymbol> = {
  // ── 동물 ──
  snake: {
    id: "snake", category: "animal", label: "뱀", aliases: ["구렁이", "독사", "뱀이 나왔"],
    element: "water", guardrailLevel: 1,
    classic: "뱀은 예로부터 재물과 지혜를 함께 상징했어요. 똬리를 튼 자리에 무언가 쌓인다고 봤죠.",
    promptTemplate: "뱀은 '숨어 있던 것이 모습을 드러낸다'는 신호로 다루세요. 재물 단정 금지. 요즘 이 사람이 알면서 미뤄둔 것이 있는지 묻는 프레임으로.",
  },
  dragon: {
    id: "dragon", category: "animal", label: "용", aliases: ["이무기", "승천"],
    element: "wood", guardrailLevel: 1,
    classic: "용꿈은 큰 뜻이 오르는 꿈으로 쳤어요. 다만 옛말도 '승천 전에 물속 세월이 길다'고 했죠.",
    promptTemplate: "용은 '품고 있던 야심이 수면 위로 올라온다'는 신호로. 성공 예언 금지 — 준비 기간을 인정하는 톤으로.",
  },
  tiger: {
    id: "tiger", category: "animal", label: "호랑이", aliases: ["범"],
    element: "wood", guardrailLevel: 1,
    classic: "호랑이는 기세와 위압을 함께 뜻했어요. 쫓기면 부담, 마주 서면 배짱으로 봤죠.",
    promptTemplate: "호랑이는 '감당해야 할 큰 존재'로. 그게 사람일 수도 책임일 수도 있다는 열린 해석으로.",
  },
  pig: {
    id: "pig", category: "animal", label: "돼지", aliases: ["멧돼지", "새끼돼지"],
    element: "water", guardrailLevel: 2,
    classic: "돼지꿈은 복과 살림의 상징이었어요. 옛사람들은 '들어오는 꿈'이라 불렀죠.",
    promptTemplate: "돼지는 '들어오는 기운'으로. ※ 복권·투자·당첨을 절대 언급하지 마세요. 재물은 '살림이 도는 감각' 수준의 은유로만.",
  },
  dog: {
    id: "dog", category: "animal", label: "개", aliases: ["강아지", "짖는 개"],
    element: "earth", guardrailLevel: 1,
    classic: "개는 곁을 지키는 존재로 봤어요. 반가우면 인연, 짖으면 경계로 읽었죠.",
    promptTemplate: "개는 '가까운 관계의 온도'로. 지금 곁의 사람에게 쓰는 마음의 상태를 묻는 프레임으로.",
  },
  cat: {
    id: "cat", category: "animal", label: "고양이", aliases: ["길고양이", "야옹"],
    element: "metal", guardrailLevel: 1,
    classic: "고양이는 속을 다 보이지 않는 존재로 봤어요. 가깝지만 거리가 있는 관계를 뜻했죠.",
    promptTemplate: "고양이는 '읽히지 않는 상대, 또는 읽히고 싶지 않은 나'로. 어느 쪽인지 되묻는 여지를 남기세요.",
  },
  cow: {
    id: "cow", category: "animal", label: "소", aliases: ["황소", "송아지"],
    element: "earth", guardrailLevel: 1,
    classic: "소는 우직한 노동과 살림의 밑천이었어요. 꾸준함이 재산이 된다는 뜻으로 읽었죠.",
    promptTemplate: "소는 '오래 끌고 온 성실함'으로. 그 성실함이 지금 보상받고 있는지 묻는 톤으로.",
  },
  horse: {
    id: "horse", category: "animal", label: "말", aliases: ["백마", "달리는 말"],
    element: "fire", guardrailLevel: 1,
    classic: "말은 이동과 소식을 뜻했어요. 달리는 말은 곧 움직일 일이 있다는 신호로 봤죠.",
    promptTemplate: "말은 '움직이고 싶은 마음'으로. 실제 이사·이직 예언이 아니라 마음이 먼저 달리고 있다는 프레임으로.",
  },
  mouse: {
    id: "mouse", category: "animal", label: "쥐", aliases: ["생쥐", "들쥐"],
    element: "water", guardrailLevel: 1,
    classic: "쥐는 부지런히 모으는 상징이자, 모르는 새 새는 구멍의 상징이기도 했어요.",
    promptTemplate: "쥐는 '조금씩 새어 나가는 것'으로. 돈일 수도 시간·기운일 수도 있게 열어 두세요.",
  },
  bird: {
    id: "bird", category: "animal", label: "새", aliases: ["새떼", "까치", "날아가는 새"],
    element: "fire", guardrailLevel: 1,
    classic: "새는 소식을 물어 오는 존재였어요. 까치가 울면 손님이 온다고 했죠.",
    promptTemplate: "새는 '기다리는 소식'으로. 무엇을 기다리는지 스스로 알고 있을 거라는 톤으로.",
  },
  fish: {
    id: "fish", category: "animal", label: "물고기", aliases: ["잉어", "낚시", "물고기를 잡"],
    element: "water", guardrailLevel: 1,
    classic: "물고기는 손에 잡히는 결실을 뜻했어요. 크기보다 '잡았는가'를 중히 봤죠.",
    promptTemplate: "물고기는 '거의 손에 닿은 것'으로. 잡았는지 놓쳤는지에 따라 감정이 갈린다는 점을 살리세요.",
  },
  spider: {
    id: "spider", category: "animal", label: "거미", aliases: ["거미줄"],
    element: "earth", guardrailLevel: 1,
    classic: "거미는 얽힌 관계와 촘촘한 계획을 함께 뜻했어요. 줄을 치는 쪽인지 걸린 쪽인지가 달랐죠.",
    promptTemplate: "거미는 '엮여 있는 관계망'으로. 그 안에서 짜는 쪽인지 걸린 쪽인지 묻는 프레임으로.",
  },
  bug: {
    id: "bug", category: "animal", label: "벌레", aliases: ["개미", "바퀴", "징그러운 벌레"],
    element: "earth", guardrailLevel: 1,
    classic: "벌레는 작지만 신경을 갉는 것을 뜻했어요. 크기보다 성가심의 상징이었죠.",
    promptTemplate: "벌레는 '작은데 계속 거슬리는 무언가'로. 큰 문제가 아니라는 안심을 함께 주세요.",
  },

  // ── 자연 ──
  sea: {
    id: "sea", category: "nature", label: "바다", aliases: ["파도", "바닷가"],
    element: "water", guardrailLevel: 1,
    classic: "바다는 감정의 총량이었어요. 잔잔하면 평온, 거칠면 감당할 게 많다고 읽었죠.",
    promptTemplate: "바다는 '감정의 크기'로. 잔잔했는지 거칠었는지가 지금 마음 상태를 비춘다는 프레임으로.",
  },
  river: {
    id: "river", category: "nature", label: "강·시냇물", aliases: ["강물", "개울", "시내"],
    element: "water", guardrailLevel: 1,
    classic: "흐르는 물은 시간과 인연의 흐름이었어요. 건넜는지 바라만 봤는지를 중히 봤죠.",
    promptTemplate: "강은 '건널지 말지 망설이는 경계'로. 결정을 재촉하지 말고 망설임 자체를 인정하는 톤으로.",
  },
  flood: {
    id: "flood", category: "nature", label: "홍수·물난리", aliases: ["물이 넘쳐", "침수"],
    element: "water", guardrailLevel: 1,
    classic: "큰물은 옛날엔 재난이자 씻김이었어요. 쓸려간 자리에 새 흙이 온다고도 했죠.",
    promptTemplate: "홍수는 '감당보다 많이 밀려온 것'으로. 재난 예언 금지 — 지금 처리량이 넘쳤다는 신호로만.",
  },
  rain: {
    id: "rain", category: "nature", label: "비", aliases: ["소나기", "장맛비"],
    element: "water", guardrailLevel: 1,
    classic: "비는 적시고 가라앉히는 것이었어요. 마른 땅엔 은혜, 젖은 땅엔 성가심이었죠.",
    promptTemplate: "비는 '가라앉히는 시간'으로. 지금 쉬어야 하는지 묻는 부드러운 프레임으로.",
  },
  fire_burning: {
    id: "fire_burning", category: "nature", label: "불·화재", aliases: ["불이 났", "화재", "타오르"],
    element: "fire", guardrailLevel: 1,
    classic: "불은 재난이자 기세였어요. 옛말에 '불꿈은 일어서는 꿈'이라 했죠.",
    promptTemplate: "불은 '터져 나온 에너지'로. 화재 사고 예언 절대 금지 — 억눌렀던 것이 올라왔다는 프레임으로.",
  },
  mountain: {
    id: "mountain", category: "nature", label: "산", aliases: ["등산", "산을 오르"],
    element: "earth", guardrailLevel: 1,
    classic: "산은 넘어야 할 것이자 기대는 자리였어요. 오르는 중인지 바라보는 중인지가 달랐죠.",
    promptTemplate: "산은 '지금 오르고 있는 과제'로. 정상보다 어디쯤인지에 초점을 두세요.",
  },
  tree: {
    id: "tree", category: "nature", label: "나무", aliases: ["큰 나무", "고목", "숲"],
    element: "wood", guardrailLevel: 1,
    classic: "나무는 뿌리와 세월의 상징이었어요. 잎보다 뿌리를 보라고 했죠.",
    promptTemplate: "나무는 '오래 자란 것'으로. 그동안 쌓인 것을 스스로 과소평가하고 있지 않은지 묻는 톤으로.",
  },
  flower: {
    id: "flower", category: "nature", label: "꽃", aliases: ["꽃밭", "꽃이 피"],
    element: "wood", guardrailLevel: 1,
    classic: "꽃은 때가 왔다는 표시였어요. 피는 시기가 저마다 다르다는 뜻도 함께였죠.",
    promptTemplate: "꽃은 '드디어 드러난 결과'로. 남과 시기를 비교하지 않게 하는 톤으로.",
  },
  snow: {
    id: "snow", category: "nature", label: "눈", aliases: ["눈이 내려", "설경", "폭설"],
    element: "water", guardrailLevel: 1,
    classic: "눈은 덮어 고르게 하는 것이었어요. 잠시 멈춘 시간을 뜻했죠.",
    promptTemplate: "눈은 '잠시 멈춘 시간'으로. 정지가 손해가 아니라는 위로를 담아.",
  },
  wind: {
    id: "wind", category: "nature", label: "바람", aliases: ["강풍", "바람이 불"],
    element: "wood", guardrailLevel: 1,
    classic: "바람은 눈에 안 보이나 방향을 바꾸는 힘이었어요. 순풍인지 맞바람인지를 봤죠.",
    promptTemplate: "바람은 '보이지 않게 밀고 있는 흐름'으로. 등지는 중인지 맞서는 중인지 묻는 프레임으로.",
  },
  muddy_water: {
    id: "muddy_water", category: "nature", label: "흙탕물", aliases: ["탁한 물", "진흙"],
    element: "earth", guardrailLevel: 1,
    classic: "탁한 물은 가라앉기를 기다리는 것이었어요. 저으면 더 흐려진다고 했죠.",
    promptTemplate: "흙탕물은 '지금 판단하기엔 흐린 상태'로. 결정을 미루라는 조언이 아니라 흐림을 인정하는 톤으로.",
  },
  well: {
    id: "well", category: "nature", label: "우물", aliases: ["샘", "우물물"],
    element: "water", guardrailLevel: 1,
    classic: "우물은 마르지 않는 밑천이었어요. 깊이는 안 보여도 있다고 믿는 것이었죠.",
    promptTemplate: "우물은 '아직 안 쓴 내 자원'으로. 스스로 없다고 여기는 것이 사실은 있다는 프레임으로.",
  },

  // ── 몸 ──
  teeth_falling: {
    id: "teeth_falling", category: "body", label: "이빨이 빠졌다", aliases: ["치아", "이가 빠지"],
    element: "metal", guardrailLevel: 1,
    classic: "이 빠지는 꿈은 가장 많이 꾸는 꿈이에요. 옛 해석은 무거웠지만, 실제로는 '힘이 빠진 느낌'을 자주 비춥니다.",
    promptTemplate: "이 빠짐은 '기력·자신감이 새는 느낌'으로. ※ 가족의 우환·사고를 절대 암시하지 마세요. 옛 해석의 무서움을 먼저 걷어내 주세요.",
  },
  hair: {
    id: "hair", category: "body", label: "머리카락", aliases: ["머리를 자르", "탈모", "긴 머리"],
    element: "wood", guardrailLevel: 1,
    classic: "머리카락은 자라는 시간의 표시였어요. 자르는 건 매듭을 뜻했죠.",
    promptTemplate: "머리카락은 '정리하고 싶은 마음'으로. 무엇을 끊고 싶은지 스스로 알 거라는 톤으로.",
  },
  blood: {
    id: "blood", category: "body", label: "피", aliases: ["피가 나", "출혈"],
    element: "fire", guardrailLevel: 3,
    classic: "피는 놀라운 꿈이지만, 옛 해석에서는 오히려 기운이 도는 표시로도 봤어요.",
    promptTemplate: "피는 '놀랐지만 나쁜 신호가 아니다'를 먼저 말하세요. ※ 질병·수술·사고 암시 절대 금지. 감정이 격했던 하루를 비추는 정도로만.",
  },
  naked: {
    id: "naked", category: "body", label: "벌거벗었다", aliases: ["옷이 없", "알몸"],
    element: "metal", guardrailLevel: 1,
    classic: "벗은 꿈은 감추고 싶은 것이 있다는 표시로 봤어요. 부끄러움의 크기가 곧 신경 쓰는 크기였죠.",
    promptTemplate: "벌거벗음은 '들킬까 봐 신경 쓰는 부분'으로. 결함이 아니라 애쓰는 증거라는 프레임으로.",
  },
  pregnant: {
    id: "pregnant", category: "body", label: "임신·태몽", aliases: ["아이를 가지", "태몽"],
    element: "water", guardrailLevel: 3,
    classic: "태몽은 오래된 이야기지만, 꿈만으로 무엇이 정해지지는 않아요. 시작을 앞둔 마음에서도 자주 나옵니다.",
    promptTemplate: "※ 임신을 절대 단정하지 마세요('태몽이다', '아이가 생긴다' 금지). '새로 시작하려는 것이 마음에 자리 잡았다'는 프레임으로만 쓰세요.",
  },
  feces: {
    id: "feces", category: "body", label: "대변", aliases: ["똥", "화장실에서"],
    element: "earth", guardrailLevel: 2,
    classic: "예로부터 복이 붙는 꿈으로 웃으며 이야기했어요. 더러움보다 '내보냄'을 봤죠.",
    promptTemplate: "대변은 '묵은 것을 내보냄'으로. ※ 재물·복권 언급 금지. 후련함의 은유로만.",
  },
  wound: {
    id: "wound", category: "body", label: "다쳤다", aliases: ["상처", "부상", "피가 났"],
    element: "metal", guardrailLevel: 3,
    classic: "다치는 꿈은 놀랍지만, 실제로는 마음이 쓰라린 자리를 비추는 경우가 많아요.",
    promptTemplate: "※ 사고·부상 예언 절대 금지. '마음이 쓸린 자리'로만 다루고, 요즘 어디가 아팠는지 묻는 대신 스스로 돌보라는 톤으로.",
  },

  // ── 사람 ──
  deceased: {
    id: "deceased", category: "person", label: "돌아가신 분", aliases: ["조상", "돌아가신 아버지", "고인"],
    element: "earth", guardrailLevel: 3,
    classic: "돌아가신 분 꿈은 그리움이 만드는 꿈이에요. 옛사람들도 '보고 싶어 오신다'고 했죠.",
    promptTemplate: "※ '부른다', '따라간다', 조상의 경고 같은 표현 절대 금지. 그리움과 미처 못 한 말에 초점을 두고, 따뜻하게 마무리하세요.",
  },
  ex_lover: {
    id: "ex_lover", category: "person", label: "옛 연인", aliases: ["전 남친", "전 여친", "헤어진 사람"],
    element: "fire", guardrailLevel: 1,
    classic: "옛 사람 꿈은 그 사람보다 그때의 나를 부르는 꿈이라고 했어요.",
    promptTemplate: "옛 연인은 '그 사람이 아니라 그 시절의 나'로. 재회 예언 금지. 미련이 아니라 회복 중이라는 프레임으로.",
  },
  stranger: {
    id: "stranger", category: "person", label: "낯선 사람", aliases: ["모르는 사람", "얼굴이 안 보이는"],
    element: "metal", guardrailLevel: 1,
    classic: "낯선 얼굴은 아직 모르는 내 모습이라고 봤어요.",
    promptTemplate: "낯선 사람은 '아직 안 꺼낸 내 일면'으로. 새 인연 예언이 아니라 자기 발견 프레임으로.",
  },
  baby: {
    id: "baby", category: "person", label: "아기", aliases: ["갓난아기", "아이를 안"],
    element: "water", guardrailLevel: 3,
    classic: "아기는 시작의 상징이에요. 손이 많이 가는 시작이라는 뜻도 함께였죠.",
    promptTemplate: "※ 임신·출산을 절대 암시하지 마세요. '이제 막 시작한 무언가, 아직 손이 많이 가는 것'으로만.",
  },
  celebrity: {
    id: "celebrity", category: "person", label: "유명인", aliases: ["연예인", "아이돌", "스타"],
    element: "fire", guardrailLevel: 1,
    classic: "유명한 이의 꿈은 인정받고 싶은 마음이 비친 것으로 봤어요.",
    promptTemplate: "유명인은 '인정받고 싶은 마음'으로. 부끄러운 욕심이 아니라 자연스러운 것이라고 짚어 주세요.",
  },
  family: {
    id: "family", category: "person", label: "가족", aliases: ["엄마", "아빠", "형제", "부모님"],
    element: "earth", guardrailLevel: 1,
    classic: "가족 꿈은 뿌리를 확인하는 꿈이에요. 편안했는지 불편했는지가 곧 지금의 거리였죠.",
    promptTemplate: "가족은 '지금의 거리감'으로. 화목/불화 단정 금지. 감정에 따라 갈리게 쓰세요.",
  },

  // ── 상황 ──
  chased: {
    id: "chased", category: "event", label: "쫓겼다", aliases: ["도망", "누가 쫓아와"],
    element: "metal", guardrailLevel: 1,
    classic: "쫓기는 꿈은 가장 흔한 불안의 꿈이에요. 쫓는 것의 정체보다 도망친 방향이 중요했죠.",
    promptTemplate: "쫓김은 '미뤄 둔 것이 따라붙는 감각'으로. 무엇으로부터인지 단정하지 말고 되묻는 여지를 남기세요.",
  },
  falling: {
    id: "falling", category: "event", label: "떨어졌다", aliases: ["추락", "낭떠러지", "밑으로 떨어"],
    element: "earth", guardrailLevel: 1,
    classic: "떨어지는 꿈은 딛고 선 자리가 흔들릴 때 자주 꿔요. 몸이 놀라 깨는 것도 흔한 일이죠.",
    promptTemplate: "추락은 '발밑이 불안한 감각'으로. 실패 예언 절대 금지 — 지지대를 확인하고 싶은 마음으로.",
  },
  flying: {
    id: "flying", category: "event", label: "날았다", aliases: ["하늘을 날", "떠올랐"],
    element: "wood", guardrailLevel: 1,
    classic: "나는 꿈은 벗어나고 싶은 마음이자 자신감의 표시로 봤어요.",
    promptTemplate: "날기는 '벗어나고 싶은 마음, 혹은 올라선 자신감'으로. 감정에 따라 어느 쪽인지 갈리게.",
  },
  lost: {
    id: "lost", category: "event", label: "길을 잃었다", aliases: ["헤맸", "못 찾"],
    element: "earth", guardrailLevel: 1,
    classic: "길 잃는 꿈은 선택지가 많을 때 자주 꿔요. 방향이 없어서가 아니라 너무 많아서였죠.",
    promptTemplate: "길 잃음은 '선택지가 많아 생긴 혼란'으로. 무능이 아니라는 점을 분명히.",
  },
  exam: {
    id: "exam", category: "event", label: "시험", aliases: ["시험을 보", "답을 못 쓰"],
    element: "wood", guardrailLevel: 1,
    classic: "시험 꿈은 평가받는 자리에 있을 때 옵니다. 학생이 아니어도 꾸는 이유죠.",
    promptTemplate: "시험은 '평가받는 자리의 긴장'으로. 실제 시험 결과 예언 금지.",
  },
  late: {
    id: "late", category: "event", label: "지각·놓쳤다", aliases: ["늦었", "차를 놓쳤", "기차를 놓"],
    element: "fire", guardrailLevel: 1,
    classic: "놓치는 꿈은 시간에 쫓기는 마음의 표시였어요.",
    promptTemplate: "놓침은 '때를 놓칠까 봐 조급한 마음'으로. 실제로 늦지 않았다는 안심을 함께.",
  },
  fight: {
    id: "fight", category: "event", label: "싸웠다", aliases: ["다퉜", "말다툼", "주먹"],
    element: "fire", guardrailLevel: 1,
    classic: "싸우는 꿈은 참았던 말이 나오는 자리로 봤어요. 꿈에서라도 해야 풀린다고 했죠.",
    promptTemplate: "싸움은 '참아 둔 말'로. 실제 갈등 예언 금지. 참는 게 길지 않았는지 묻는 톤으로.",
  },
  death_scene: {
    id: "death_scene", category: "event", label: "죽는 꿈", aliases: ["내가 죽", "누가 죽"],
    element: "earth", guardrailLevel: 3,
    classic: "죽는 꿈은 옛부터 '끝이 아니라 바뀜'으로 읽었어요. 놀랄 꿈이지만 흉몽으로 치지 않았죠.",
    promptTemplate: "※ 사망·사고·수명 암시 절대 금지. 첫 문장에서 무섭지 않다고 분명히 하고, '한 시기가 닫히고 다른 시기가 열리는 전환'으로만 다루세요.",
  },
  wedding: {
    id: "wedding", category: "event", label: "결혼식", aliases: ["혼례", "예식장"],
    element: "fire", guardrailLevel: 1,
    classic: "결혼식 꿈은 맺음의 상징이에요. 꼭 혼인만을 뜻하진 않았죠.",
    promptTemplate: "결혼식은 '무언가를 정식으로 맺는 일'로. 실제 결혼 예언 금지.",
  },
  funeral: {
    id: "funeral", category: "event", label: "장례식", aliases: ["상갓집", "빈소"],
    element: "earth", guardrailLevel: 3,
    classic: "장례 꿈은 보내는 의식이에요. 옛 해석에서도 마무리와 정리의 뜻이 컸습니다.",
    promptTemplate: "※ 가족·지인의 죽음을 절대 암시하지 마세요. '보내야 할 것을 보내는 마음'으로만 다루고 따뜻하게 닫으세요.",
  },
  moving_house: {
    id: "moving_house", category: "event", label: "이사", aliases: ["집을 옮", "이삿짐"],
    element: "earth", guardrailLevel: 1,
    classic: "이사 꿈은 자리를 바꾸고 싶은 마음이었어요. 짐의 무게가 곧 미련이었죠.",
    promptTemplate: "이사는 '자리를 바꾸고 싶은 마음'으로. 실제 이사·이직 시기 단정 금지.",
  },
  falling_out: {
    id: "falling_out", category: "event", label: "헤어졌다", aliases: ["이별", "떠나보냈"],
    element: "metal", guardrailLevel: 1,
    classic: "헤어지는 꿈은 오히려 붙잡고 있을 때 자주 꿉니다.",
    promptTemplate: "이별은 '아직 놓지 못한 것'으로. ※ 실제 이별·이혼 암시 금지.",
  },

  // ── 사물·장소 ──
  money: {
    id: "money", category: "thing", label: "돈", aliases: ["지폐", "돈을 주웠", "현금"],
    element: "metal", guardrailLevel: 2,
    classic: "돈 꿈은 액수보다 '들어왔나 나갔나'를 봤어요. 셈이 밝아지는 시기의 꿈이라고도 했죠.",
    promptTemplate: "돈은 '가치의 저울'로. ※ 재물운 단정·복권·투자 언급 절대 금지. 무엇에 값을 매기고 있는지 묻는 프레임으로.",
  },
  gold: {
    id: "gold", category: "thing", label: "금·보석", aliases: ["금반지", "보석", "귀금속"],
    element: "metal", guardrailLevel: 2,
    classic: "금은 변하지 않는 것을 뜻했어요. 그래서 약속의 상징이기도 했죠.",
    promptTemplate: "금은 '변하지 않았으면 하는 것'으로. ※ 재물·당첨 언급 금지.",
  },
  shoes: {
    id: "shoes", category: "thing", label: "신발", aliases: ["구두", "신발을 잃"],
    element: "earth", guardrailLevel: 1,
    classic: "신발은 갈 길과 처지를 뜻했어요. 잃으면 방향을, 새것이면 시작을 봤죠.",
    promptTemplate: "신발은 '지금 서 있는 자리와 갈 길'로. 잃음/새것에 따라 갈리게.",
  },
  mirror: {
    id: "mirror", category: "thing", label: "거울", aliases: ["거울을 보", "깨진 거울"],
    element: "metal", guardrailLevel: 1,
    classic: "거울은 남이 보는 나를 뜻했어요. 깨져도 흉으로만 보지 않았죠.",
    promptTemplate: "거울은 '남이 보는 나와 내가 아는 나의 차이'로. 깨짐을 흉조로 다루지 마세요.",
  },
  knife: {
    id: "knife", category: "thing", label: "칼", aliases: ["가위", "날붙이"],
    element: "metal", guardrailLevel: 1,
    classic: "칼은 자르는 도구였어요. 해치는 것보다 '끊는 것'의 상징으로 봤죠.",
    promptTemplate: "칼은 '끊어 내야 할 것'으로. ※ 폭력·상해 암시 금지. 결단의 은유로만.",
  },
  door: {
    id: "door", category: "thing", label: "문", aliases: ["대문", "문이 안 열려"],
    element: "wood", guardrailLevel: 1,
    classic: "문은 기회의 표시였어요. 열렸는지 잠겼는지가 곧 지금의 감각이었죠.",
    promptTemplate: "문은 '기회 앞의 감각'으로. 열림/잠김을 감정에 맞춰 해석하세요.",
  },
  stairs: {
    id: "stairs", category: "thing", label: "계단", aliases: ["층계", "계단을 오르"],
    element: "earth", guardrailLevel: 1,
    classic: "계단은 한 번에 못 오르는 길이었어요. 오르내림 모두 과정으로 봤죠.",
    promptTemplate: "계단은 '한 번에 안 되는 과정'으로. 속도를 재촉하지 않는 톤으로.",
  },
  car: {
    id: "car", category: "thing", label: "자동차", aliases: ["운전", "차가 안 가", "사고 날 뻔"],
    element: "metal", guardrailLevel: 1,
    classic: "차는 내 삶의 운전대였어요. 누가 몰고 있었는지가 중요했죠.",
    promptTemplate: "자동차는 '내 삶의 운전대를 누가 쥐고 있나'로. ※ 교통사고 암시 절대 금지.",
  },
  toilet: {
    id: "toilet", category: "thing", label: "화장실", aliases: ["변기", "화장실을 찾"],
    element: "water", guardrailLevel: 1,
    classic: "화장실 꿈은 참았던 것을 비우는 자리로 봤어요.",
    promptTemplate: "화장실은 '비우고 싶은데 자리를 못 찾는 감각'으로. 참고 있는 것이 있는지 묻는 톤으로.",
  },
  hospital: {
    id: "hospital", category: "thing", label: "병원", aliases: ["진료", "입원", "의사"],
    element: "metal", guardrailLevel: 3,
    classic: "병원 꿈은 돌봄이 필요한 마음의 표시예요. 몸의 예고로 보지 않았습니다.",
    promptTemplate: "※ 질병·진단·수술 암시 절대 금지. '돌봄이 필요하다는 신호'로만 다루고, 검진을 권하는 말도 하지 마세요(의료 조언 금지).",
  },
};

/** 카테고리별 상징 목록 (선택 UI 탭 구성용) */
export function dreamSymbolsByCategory(category: DreamCategory): DreamSymbol[] {
  return Object.values(DREAM_SYMBOLS).filter((s) => s.category === category);
}

/** 상징 조회 */
export function dreamSymbolById(id: DreamSymbolId): DreamSymbol {
  return DREAM_SYMBOLS[id];
}

/** 문자열이 유효한 상징 id인지 (URL·요청 본문 검증용) */
export function isDreamSymbolId(v: string): v is DreamSymbolId {
  return Object.prototype.hasOwnProperty.call(DREAM_SYMBOLS, v);
}

/** 문자열이 유효한 감정인지 */
export function isDreamMood(v: string): v is DreamMood {
  return v === "fear" || v === "relief" || v === "sad" || v === "odd";
}

/**
 * 상징 오행 × 원국 → 관계 3종. 캐시 키의 개인화 축이자 해석 방향.
 * 일간(10종)을 키에 넣지 않고도 "내 사주와 엮인" 해석이 되게 하는 다리다.
 */
export function dreamRelation(
  symbolElement: Element,
  weakestElement: Element,
  strongestElement: Element,
): DreamRelation {
  if (symbolElement === weakestElement) return "lack";
  if (symbolElement === strongestElement) return "excess";
  return "neutral";
}

/** 관계별 해석 방향 지시 (프롬프트 삽입용) */
export const DREAM_RELATION_DIRECTIVE: Record<DreamRelation, string> = {
  lack: "이 상징의 오행은 이 사람 원국에서 가장 비어 있는 자리입니다. '없던 자리를 건드렸다'는 방향으로 해석하세요.",
  excess: "이 상징의 오행은 이 사람 원국에서 이미 가장 넘치는 기운입니다. '넘치는 것이 또 나왔다'는 방향으로, 과열을 부드럽게 짚으세요.",
  neutral: "이 상징의 오행은 이 사람 원국에서 특별히 치우치지 않았습니다. 상징 자체의 결에 집중하세요.",
};
