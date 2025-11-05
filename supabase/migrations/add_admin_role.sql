-- Add admin role to profiles table
-- This allows certain users to have admin privileges

-- Add is_admin column to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Add index for admin queries
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin) WHERE is_admin = TRUE;

-- Add comment
COMMENT ON COLUMN profiles.is_admin IS 'Whether this user has admin privileges for managing other users and system settings';
