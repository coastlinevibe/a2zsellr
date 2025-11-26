-- Add is_template column to profile_listings table
ALTER TABLE profile_listings
ADD COLUMN is_template BOOLEAN DEFAULT FALSE;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_profile_listings_is_template ON profile_listings(profile_id, is_template);
