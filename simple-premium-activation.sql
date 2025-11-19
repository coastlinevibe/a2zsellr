-- Simple SQL to activate premium subscription for jewls@gmail.com
-- Run this in Supabase SQL Editor

-- Update the user profile to premium
UPDATE profiles 
SET 
  subscription_tier = 'premium',
  subscription_status = 'active',
  trial_end_date = NULL,
  updated_at = NOW()
WHERE id = '029e10ef-b62e-4658-9246-cd27474e8416';

-- Verify the update
SELECT 
  display_name,
  email,
  subscription_tier,
  subscription_status,
  trial_end_date,
  updated_at
FROM profiles 
WHERE id = '029e10ef-b62e-4658-9246-cd27474e8416';