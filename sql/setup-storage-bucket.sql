-- Setup Supabase Storage bucket for campaign media
-- Run this in your Supabase SQL editor

-- Create the storage bucket for campaign media
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'campaign-media',
  'campaign-media', 
  true,
  10485760, -- 10MB limit
  ARRAY[
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp',
    'image/gif',
    'video/mp4',
    'video/webm'
  ]
) ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for the storage bucket
-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload campaign media" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'campaign-media' AND
    auth.role() = 'authenticated'
  );

-- Allow authenticated users to view files
CREATE POLICY "Anyone can view campaign media" ON storage.objects
  FOR SELECT USING (bucket_id = 'campaign-media');

-- Allow users to update their own files
CREATE POLICY "Users can update their own campaign media" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'campaign-media' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to delete their own files
CREATE POLICY "Users can delete their own campaign media" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'campaign-media' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create function to get file owner from path
CREATE OR REPLACE FUNCTION storage.get_file_owner(file_path text)
RETURNS uuid AS $$
BEGIN
  -- Extract user ID from file path like 'uploads/user-id/filename.jpg'
  RETURN (string_to_array(file_path, '/'))[2]::uuid;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
