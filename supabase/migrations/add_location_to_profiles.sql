-- Add location columns to profiles table
-- Week 8: Google Maps Integration

-- Add latitude column
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8);

-- Add longitude column
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

-- Add address column (for storing formatted address)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS address TEXT;

-- Add index for location-based queries
CREATE INDEX IF NOT EXISTS idx_profiles_location 
ON profiles (latitude, longitude) 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Add comment
COMMENT ON COLUMN profiles.latitude IS 'Business location latitude coordinate';
COMMENT ON COLUMN profiles.longitude IS 'Business location longitude coordinate';
COMMENT ON COLUMN profiles.address IS 'Formatted business address from Google Maps';
