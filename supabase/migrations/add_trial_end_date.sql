-- Add trial_end_date column back to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trial_end_date TIMESTAMPTZ;

-- Create index for trial_end_date for efficient queries
CREATE INDEX IF NOT EXISTS idx_profiles_trial_end_date ON profiles(trial_end_date);

-- Update existing free users to have trial_end_date set to 24 hours from now
UPDATE profiles 
SET trial_end_date = NOW() + INTERVAL '24 hours'
WHERE subscription_tier = 'free' AND trial_end_date IS NULL;