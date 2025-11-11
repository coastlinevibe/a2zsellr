-- Create referrals system tables

-- Add referral_code to profiles table
ALTER TABLE profiles
ADD COLUMN referral_code VARCHAR(50) UNIQUE;

-- Create referrals table to track referrals
CREATE TABLE referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  referred_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  referral_code VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'paid')),
  earnings_cents INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE
);

-- Create index for better performance
CREATE INDEX idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX idx_referrals_referred_user_id ON referrals(referred_user_id);
CREATE INDEX idx_referrals_referral_code ON referrals(referral_code);
CREATE INDEX idx_referrals_status ON referrals(status);

-- Generate referral codes for existing users
UPDATE profiles
SET referral_code = LOWER(REPLACE(display_name, ' ', '')) || '_' || SUBSTRING(MD5(RANDOM()::text) FROM 1 FOR 6)
WHERE referral_code IS NULL AND display_name IS NOT NULL;
