-- Fix Row Level Security policies for business_gallery table

-- Create the business_gallery table if it doesn't exist
CREATE TABLE IF NOT EXISTS business_gallery (
  id BIGSERIAL PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT,
  caption TEXT,
  image_url TEXT,
  media_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_business_gallery_updated_at ON business_gallery;
CREATE TRIGGER update_business_gallery_updated_at
    BEFORE UPDATE ON business_gallery
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
