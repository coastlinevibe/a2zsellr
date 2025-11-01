-- Fix ALL Row Level Security policies for profile tables

-- Enable RLS on all profile tables
ALTER TABLE profile_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_listings ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Users can view their own gallery items" ON profile_gallery;
DROP POLICY IF EXISTS "Users can insert their own gallery items" ON profile_gallery;
DROP POLICY IF EXISTS "Users can update their own gallery items" ON profile_gallery;
DROP POLICY IF EXISTS "Users can delete their own gallery items" ON profile_gallery;

DROP POLICY IF EXISTS "Users can view their own products" ON profile_products;
DROP POLICY IF EXISTS "Users can insert their own products" ON profile_products;
DROP POLICY IF EXISTS "Users can update their own products" ON profile_products;
DROP POLICY IF EXISTS "Users can delete their own products" ON profile_products;

DROP POLICY IF EXISTS "Users can view their own listings" ON profile_listings;
DROP POLICY IF EXISTS "Users can insert their own listings" ON profile_listings;
DROP POLICY IF EXISTS "Users can update their own listings" ON profile_listings;
DROP POLICY IF EXISTS "Users can delete their own listings" ON profile_listings;

-- Create NEW RLS policies for profile_gallery
CREATE POLICY "Users can view their own gallery items" ON profile_gallery
  FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "Users can insert their own gallery items" ON profile_gallery
  FOR INSERT WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can update their own gallery items" ON profile_gallery
  FOR UPDATE USING (auth.uid() = profile_id);

CREATE POLICY "Users can delete their own gallery items" ON profile_gallery
  FOR DELETE USING (auth.uid() = profile_id);

-- Create NEW RLS policies for profile_products
CREATE POLICY "Users can view their own products" ON profile_products
  FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "Users can insert their own products" ON profile_products
  FOR INSERT WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can update their own products" ON profile_products
  FOR UPDATE USING (auth.uid() = profile_id);

CREATE POLICY "Users can delete their own products" ON profile_products
  FOR DELETE USING (auth.uid() = profile_id);

-- Create NEW RLS policies for profile_listings
CREATE POLICY "Users can view their own listings" ON profile_listings
  FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "Users can insert their own listings" ON profile_listings
  FOR INSERT WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can update their own listings" ON profile_listings
  FOR UPDATE USING (auth.uid() = profile_id);

CREATE POLICY "Users can delete their own listings" ON profile_listings
  FOR DELETE USING (auth.uid() = profile_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profile_gallery_profile_id ON profile_gallery(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_gallery_created_at ON profile_gallery(created_at);
CREATE INDEX IF NOT EXISTS idx_profile_products_profile_id ON profile_products(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_products_created_at ON profile_products(created_at);
CREATE INDEX IF NOT EXISTS idx_profile_listings_profile_id ON profile_listings(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_listings_created_at ON profile_listings(created_at);
