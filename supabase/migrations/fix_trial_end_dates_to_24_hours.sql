-- Fix trial_end_date for all free users to use 24 hours instead of testing intervals
-- This migration fixes users who have short trial periods from testing mode

-- Update all free users to have proper 24-hour trial periods
UPDATE profiles 
SET trial_end_date = NOW() + INTERVAL '24 hours'
WHERE subscription_tier = 'free';

-- Log the update
DO $$
DECLARE
    updated_count INTEGER;
BEGIN
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Updated % free user trial periods to 24 hours', updated_count;
END $$;