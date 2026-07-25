import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import type { StoredPerson } from "@lucky/api-client";
import type { SajuInput } from "@lucky/core";

/**
 * 기기 기반 익명 저장 (기획서 §12: 계정 없음, 기기 birth + 결과 토큰).
 * SecureStore(Keychain/Keystore) 우선, 실패 시 AsyncStorage로 폴백 —
 * 저장이 조용히 실패해 온보딩이 반복되는 일이 없어야 한다.
 */
const BIRTH_KEY = "palja.birth";
const TOKEN_KEY = "palja.token";
const BETA_KEY = "palja.beta"; // 클로즈드 베타 자격 증명(서명값)

async function setItem(key: string, value: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch (e) {
    console.warn(`[storage] SecureStore 저장 실패(${key}) → AsyncStorage 폴백`, e);
  }
  await AsyncStorage.setItem(key, value);
}

async function getItem(key: string): Promise<string | null> {
  try {
    const v = await SecureStore.getItemAsync(key);
    if (v) return v;
  } catch (e) {
    console.warn(`[storage] SecureStore 읽기 실패(${key}) → AsyncStorage 폴백`, e);
  }
  return AsyncStorage.getItem(key);
}

async function removeItem(key: string): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch {
    /* 폴백 삭제만으로 충분 */
  }
  await AsyncStorage.removeItem(key);
}

export async function saveBirth(birth: SajuInput): Promise<void> {
  await setItem(BIRTH_KEY, JSON.stringify(birth));
}
export async function loadBirth(): Promise<SajuInput | null> {
  const s = await getItem(BIRTH_KEY);
  if (!s) return null;
  try {
    return JSON.parse(s) as SajuInput;
  } catch {
    await removeItem(BIRTH_KEY);
    return null;
  }
}

export async function saveToken(token: string): Promise<void> {
  await setItem(TOKEN_KEY, token);
}
export async function loadToken(): Promise<string | null> {
  return getItem(TOKEN_KEY);
}

/** 저장된 사주 정보 초기화 (설정 → 다시 입력). */
export async function clearBirth(): Promise<void> {
  await removeItem(BIRTH_KEY);
  await removeItem(TOKEN_KEY);
}

// ── "봐준 사람" 명부 (타인 사주) ──
// 본인 토큰(TOKEN_KEY)은 건드리지 않는다. 타인은 각자 독립 토큰이라 내 상담과 완전히 분리된다.
const PEOPLE_KEY = "palja.people";
const MAX_PEOPLE = 12;

export async function listPeople(): Promise<StoredPerson[]> {
  const raw = await getItem(PEOPLE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as StoredPerson[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((p) => typeof p?.token === "string").sort((a, b) => b.addedAt - a.addedAt);
  } catch {
    await removeItem(PEOPLE_KEY);
    return [];
  }
}

export async function rememberPerson(p: Omit<StoredPerson, "addedAt">): Promise<void> {
  const next = [
    { ...p, addedAt: Date.now() },
    ...(await listPeople()).filter((x) => x.token !== p.token),
  ].slice(0, MAX_PEOPLE);
  await setItem(PEOPLE_KEY, JSON.stringify(next));
}

export async function findPerson(token: string): Promise<StoredPerson | null> {
  return (await listPeople()).find((p) => p.token === token) ?? null;
}

export async function forgetPerson(token: string): Promise<void> {
  await setItem(PEOPLE_KEY, JSON.stringify((await listPeople()).filter((p) => p.token !== token)));
}

/** 목록 표기용 이름 — 호칭 없으면 생년으로 대체 */
export function personLabel(p: StoredPerson): string {
  return p.alias?.trim() || `${p.birthDate.slice(0, 4)}년생`;
}

// ── 과거 검증 응답 (retro 카드) ──
// 기기 로컬. 토큰별 { pivotYear: "yes"|"no" }.
type RetroAnswers = Record<number, "yes" | "no">;

export async function loadRetro(token: string): Promise<RetroAnswers> {
  const raw = await getItem(`palja.retro.${token}`);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as RetroAnswers;
  } catch {
    return {};
  }
}

export async function saveRetro(token: string, answers: RetroAnswers): Promise<void> {
  await setItem(`palja.retro.${token}`, JSON.stringify(answers));
}

// ── 클로즈드 베타 자격 (초대 코드 교환 결과) ──
export async function saveBeta(cred: string): Promise<void> {
  await setItem(BETA_KEY, cred);
}
export async function loadBeta(): Promise<string | null> {
  return getItem(BETA_KEY);
}
export async function clearBeta(): Promise<void> {
  await removeItem(BETA_KEY);
}
