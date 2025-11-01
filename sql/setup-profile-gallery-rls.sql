-- Setup Row Level Security for profile_gallery table

-- Enable RLS on the table
ALTER TABLE profile_gallery ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own gallery items" ON profile_gallery;
DROP POLICY IF EXISTS "Users can insert their own gallery items" ON profile_gallery;
DROP POLICY IF EXISTS "Users can update their own gallery items" ON profile_gallery;
DROP POLICY IF EXISTS "Users can delete their own gallery items" ON profile_gallery;

-- Create RLS policies for profile_gallery
CREATE POLICY "Users can view their own gallery items" ON profile_gallery
  FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "Users can insert their own gallery items" ON profile_gallery
  FOR INSERT WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can update their own gallery items" ON profile_gallery
  FOR UPDATE USING (auth.uid() = profile_id);

CREATE POLICY "Users can delete their own gallery items" ON profile_gallery
  FOR DELETE USING (auth.uid() = profile_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profile_gallery_profile_id ON profile_gallery(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_gallery_created_at ON profile_gallery(created_at);
