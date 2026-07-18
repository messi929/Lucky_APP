import type { RelationType, SajuInput } from "@lucky/core";

/**
 * 저장소 추상화 (비동기). memory(개발) ↔ supabase(프로덕션) 교체 가능.
 * 결과·토큰·결제 unlock·궁합 초대·선물의 단일 계약. 웹·앱 공용 개념.
 */

export interface InviteRecord {
  ownerToken: string;
  relation: RelationType;
}
export interface CompatRecord {
  aToken: string;
  bInput: SajuInput;
  relation: RelationType;
}
export interface GiftRecord {
  sku: string;
  fromMsg: string;
  redeemed: boolean;
}
export interface PushTokenRecord {
  expoToken: string;
  resultToken: string; // 일간 계산용 결과 토큰
  hour: number; // 발송 시각(KST, 기본 8)
}
export interface OrderRecord {
  orderId: string;
  token: string;
  sku: string;
  amount: number;
  gift: boolean;
  fromMsg?: string;
  status: "pending" | "paid" | "failed";
  paymentKey?: string;
}

export interface StorageAdapter {
  // 출생 입력 (결과 토큰)
  getInput(token: string): Promise<SajuInput | null>;
  putInput(token: string, input: SajuInput): Promise<void>;
  // 결제 unlock (토큰 전역)
  isPaid(token: string): Promise<boolean>;
  setPaid(token: string): Promise<void>;
  // 주제 단위 해금 (상담 세션 — 고민 1개씩 결제)
  isConcernUnlocked(token: string, concern: string): Promise<boolean>;
  unlockConcern(token: string, concern: string): Promise<void>;
  // 궁합 초대
  getInvite(token: string): Promise<InviteRecord | null>;
  putInvite(token: string, rec: InviteRecord): Promise<void>;
  // 궁합 결과
  getCompat(token: string): Promise<CompatRecord | null>;
  putCompat(token: string, rec: CompatRecord): Promise<void>;
  // 선물
  getGift(token: string): Promise<GiftRecord | null>;
  putGift(token: string, rec: GiftRecord): Promise<void>;
  setGiftRedeemed(token: string): Promise<void>;
  // 데일리 푸시 토큰 (§10.1)
  putPushToken(rec: PushTokenRecord): Promise<void>;
  listPushTokens(): Promise<PushTokenRecord[]>;
  // 결제 주문 (§9)
  putOrder(rec: OrderRecord): Promise<void>;
  getOrder(orderId: string): Promise<OrderRecord | null>;
  setOrderPaid(orderId: string, paymentKey: string): Promise<void>;
}
