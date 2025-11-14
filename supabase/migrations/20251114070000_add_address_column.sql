-- Add address column to profiles table for bulk upload
-- Only adding address since other fields come from existing tables

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.address IS 'Full business address for bulk upload functionality';

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_address ON public.profiles USING gin(to_tsvector('english', address));
