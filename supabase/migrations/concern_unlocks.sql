-- concern_unlocks — 주제 단위 해금 원장 (프로덕션 Supabase 미적용분, 2026-07-25)
-- Supabase 대시보드 → SQL Editor 에 그대로 붙여넣고 Run.
-- 서비스 롤 키로는 REST에서 DDL 실행 불가라 수동 적용 필요.
-- schema.sql의 해당 CREATE + RLS 발췌 (idempotent — 이미 있으면 무해).

create table if not exists concern_unlocks (
  token       text not null,           -- 결과 토큰
  concern     text not null,           -- concerns.ts ConcernId
  created_at  timestamptz not null default now(),
  primary key (token, concern)
);

-- 서버 전용 접근: RLS 켜고 정책 없음 (service role은 RLS 우회)
alter table concern_unlocks enable row level security;
