-- 사주 리포트 — Supabase 스키마 (Phase 5/인프라)
-- 적용: supabase db psql < supabase/schema.sql (또는 SQL 에디터 붙여넣기)
-- 접근은 서버(service role)만 → RLS 활성 + 정책 없음(익명 직접 접근 차단).
-- 개인정보 최소화(§12): 이름/전화 없음. 토큰은 nanoid 12+.

create table if not exists results (
  token       text primary key,
  input       jsonb not null,          -- SajuInput (생년월일시·성별·지역·달력)
  paid        boolean not null default false,
  created_at  timestamptz not null default now()
);

create table if not exists invites (
  token        text primary key,       -- 초대 토큰
  owner_token  text not null,
  relation     text not null,
  created_at   timestamptz not null default now()
);

create table if not exists compats (
  token       text primary key,        -- 궁합 결과 토큰 (A·B 공동 열람)
  a_token     text not null,
  b_input     jsonb not null,
  relation    text not null,
  created_at  timestamptz not null default now()
);

create table if not exists gifts (
  token       text primary key,        -- 선물 토큰
  sku         text not null,
  from_msg    text not null default '',
  redeemed    boolean not null default false,
  created_at  timestamptz not null default now()
);

create table if not exists interpret_cache (
  key         text primary key,        -- 유닛:값:버전:시즌:톤모드:관심사
  value       text not null,
  created_at  timestamptz not null default now()
);

create table if not exists events (
  id          bigserial primary key,   -- 퍼널 이벤트 (§8.3)
  name        text not null,
  props       jsonb,
  ts          timestamptz not null default now()
);

create table if not exists push_tokens (
  expo_token    text primary key,      -- Expo push token (기기)
  result_token  text not null,         -- 일간 계산용 결과 토큰
  hour          int not null default 8,-- 발송 시각(KST)
  created_at    timestamptz not null default now()
);

create table if not exists orders (
  order_id    text primary key,        -- 주문 id (토스 orderId)
  token       text not null,           -- 결과 토큰
  sku         text not null,
  amount      int not null,
  gift        boolean not null default false,
  from_msg    text not null default '',-- 선물 메시지
  status      text not null default 'pending', -- pending|paid|failed
  payment_key text,                    -- 토스 paymentKey (승인 후)
  created_at  timestamptz not null default now()
);

-- 서버 전용 접근: RLS 켜고 정책 없음 (service role은 RLS 우회)
alter table results         enable row level security;
alter table invites         enable row level security;
alter table compats         enable row level security;
alter table gifts           enable row level security;
alter table interpret_cache enable row level security;
alter table events          enable row level security;
alter table push_tokens     enable row level security;
alter table orders          enable row level security;
