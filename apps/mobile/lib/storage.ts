import * as SecureStore from "expo-secure-store";
import type { SajuInput } from "@lucky/core";

/**
 * 기기 기반 익명 저장 (기획서 §12: 계정 없음, 기기 birth + 결과 토큰).
 * SecureStore = iOS Keychain / Android Keystore.
 */
const BIRTH_KEY = "palja.birth";
const TOKEN_KEY = "palja.token";

export async function saveBirth(birth: SajuInput): Promise<void> {
  await SecureStore.setItemAsync(BIRTH_KEY, JSON.stringify(birth));
}
export async function loadBirth(): Promise<SajuInput | null> {
  const s = await SecureStore.getItemAsync(BIRTH_KEY);
  return s ? (JSON.parse(s) as SajuInput) : null;
}

export async function saveToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}
export async function loadToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}
