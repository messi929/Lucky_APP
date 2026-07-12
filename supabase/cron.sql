-- 데일리 푸시 스케줄 (기획서 §10.1). pg_cron + pg_net으로 웹 dispatch 호출.
-- 계산·발송 로직은 웹 /api/push/dispatch에 있음(core 재사용, 원칙 8) → cron은 트리거만.
--
-- 사전: Supabase 대시보드 Database → Extensions에서 pg_cron, pg_net 활성.
-- 매시 정각 호출 → dispatch가 유저별 hour==현재시각(KST)만 발송.
-- 아래 <WEB_BASE>, <CRON_SECRET>를 실제 값으로 치환.

select cron.schedule(
  'daily-push-hourly',
  '0 * * * *',                                   -- 매시 정각(UTC). dispatch가 KST 시각 필터
  $$
  select net.http_post(
    url     := '<WEB_BASE>/api/push/dispatch',
    headers := jsonb_build_object(
      'content-type', 'application/json',
      'x-cron-secret', '<CRON_SECRET>'
    ),
    body    := '{}'::jsonb
  );
  $$
);

-- 해제: select cron.unschedule('daily-push-hourly');
