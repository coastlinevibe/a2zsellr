-- Fix Storage RLS policies for profile bucket
-- Allow authenticated users to upload and manage their profile pictures

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies for profile bucket to start fresh
DROP POLICY IF EXISTS "Users can upload their own profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Public can view profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads to profile bucket" ON storage.objects;
DROP POLICY IF EXISTS "Allow public access to profile bucket" ON storage.objects;

-- Create comprehensive storage policies for profile bucket
CREATE POLICY "Allow authenticated uploads to profile bucket" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'profile' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Allow users to view profile pictures" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'profile'
  );

CREATE POLICY "Allow users to update their own profile pictures" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'profile' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  ) WITH CHECK (
    bucket_id = 'profile' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Allow users to delete their own profile pictures" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'profile' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Also ensure the profile bucket exists and is public
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile',
  'profile',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

-- Grant necessary permissions
GRANT ALL ON storage.objects TO authenticated;
GRANT SELECT ON storage.objects TO anon;
