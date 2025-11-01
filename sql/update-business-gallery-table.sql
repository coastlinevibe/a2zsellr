-- Update business_gallery table to match our code expectations

-- Add missing columns if they don't exist
ALTER TABLE business_gallery 
ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE;

ALTER TABLE business_gallery 
ADD COLUMN IF NOT EXISTS title TEXT;

ALTER TABLE business_gallery 
ADD COLUMN IF NOT EXISTS media_url TEXT;

-- Update existing records to use profile_id (if business_id exists)
-- You may need to adjust this based on your data relationship
UPDATE business_gallery 
SET profile_id = business_id 
WHERE profile_id IS NULL AND business_id IS NOT NULL;

-- Enable RLS on the table
ALTER TABLE business_gallery ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own gallery items" ON business_gallery;
DROP POLICY IF EXISTS "Users can insert their own gallery items" ON business_gallery;
DROP POLICY IF EXISTS "Users can update their own gallery items" ON business_gallery;
DROP POLICY IF EXISTS "Users can delete their own gallery items" ON business_gallery;

-- Create RLS policies for business_gallery
CREATE POLICY "Users can view their own gallery items" ON business_gallery
  FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "Users can insert their own gallery items" ON business_gallery
  FOR INSERT WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can update their own gallery items" ON business_gallery
  FOR UPDATE USING (auth.uid() = profile_id);

CREATE POLICY "Users can delete their own gallery items" ON business_gallery
  FOR DELETE USING (auth.uid() = profile_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_business_gallery_profile_id ON business_gallery(profile_id);
CREATE INDEX IF NOT EXISTS idx_business_gallery_created_at ON business_gallery(created_at);
