-- Drop unused tables that are not referenced in the codebase

-- Drop subscription_pricing table (pricing is hardcoded in lib/subscription.ts)
DROP TABLE IF EXISTS subscription_pricing CASCADE;

-- Add any other unused tables here as we find them
-- DROP TABLE IF EXISTS other_unused_table CASCADE;