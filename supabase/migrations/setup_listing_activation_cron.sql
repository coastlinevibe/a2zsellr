-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS http;

-- Schedule the function to run every minute to activate scheduled listings
-- This will automatically:
-- 1. Find listings where scheduled_for <= NOW() and status = 'scheduled'
-- 2. Change their status to 'active'
-- 3. Send email notifications to users
SELECT cron.schedule(
  'activate_scheduled_listings_job',
  '* * * * *',  -- Every minute (cron syntax)
  'SELECT activate_scheduled_listings();'
);

-- Alternative: Run every 5 minutes (less frequent, better for performance)
-- SELECT cron.schedule(
--   'activate_scheduled_listings_job',
--   '*/5 * * * *',  -- Every 5 minutes
--   'SELECT activate_scheduled_listings();'
-- );

-- USEFUL COMMANDS:
-- View all scheduled jobs:
-- SELECT * FROM cron.job;

-- View job execution history:
-- SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;

-- Unschedule the job:
-- SELECT cron.unschedule('activate_scheduled_listings_job');

-- Manually trigger the function (for testing):
-- SELECT activate_scheduled_listings();
