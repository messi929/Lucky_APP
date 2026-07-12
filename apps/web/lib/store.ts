import { nanoid } from "nanoid";
import type { RelationType, SajuInput } from "@lucky/core";
import { storage } from "./storage";

/**
 * 토큰·궁합·결제·선물 저장 (비동기). 실제 저장은 StorageAdapter(memory↔supabase).
 * 토큰은 nanoid 12자(추측 불가, §12).
 */

// ── 출생 입력 ──
export async function createToken(input: SajuInput): Promise<string> {
  const token = nanoid(12);
  await storage.putInput(token, input);
  return token;
}
export function getInput(token: string): Promise<SajuInput | null> {
  return storage.getInput(token);
}

// ── 결제 unlock (Phase 5) ──
export function markPaid(token: string): Promise<void> {
  return storage.setPaid(token);
}
export function isPaid(token: string): Promise<boolean> {
  return storage.isPaid(token);
}

// ── 궁합 초대 루프 (§8.1) ──
export async function createInvite(ownerToken: string, relation: RelationType): Promise<string> {
  const inviteToken = nanoid(12);
  await storage.putInvite(inviteToken, { ownerToken, relation });
  return inviteToken;
}
export function getInvite(inviteToken: string) {
  return storage.getInvite(inviteToken);
}

export async function createCompat(
  aToken: string,
  bInput: SajuInput,
  relation: RelationType,
): Promise<string> {
  const compatToken = nanoid(12);
  await storage.putCompat(compatToken, { aToken, bInput, relation });
  return compatToken;
}
export function getCompat(compatToken: string) {
  return storage.getCompat(compatToken);
}

// ── 선물 (Phase 5) ──
export async function createGift(sku: string, fromMsg: string): Promise<string> {
  const giftToken = nanoid(12);
  await storage.putGift(giftToken, { sku, fromMsg, redeemed: false });
  return giftToken;
}
export function getGift(giftToken: string) {
  return storage.getGift(giftToken);
}
export function markGiftRedeemed(giftToken: string): Promise<void> {
  return storage.setGiftRedeemed(giftToken);
}

// ── 데일리 푸시 토큰 (Phase 7) ──
export function registerPush(expoToken: string, resultToken: string, hour = 8): Promise<void> {
  return storage.putPushToken({ expoToken, resultToken, hour });
}
export function listPush() {
  return storage.listPushTokens();
}
