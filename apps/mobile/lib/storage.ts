import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
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
