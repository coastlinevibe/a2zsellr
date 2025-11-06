-- Storage policies for payment-proofs bucket
-- Run this in Supabase SQL editor after creating the payment-proofs bucket

-- Enable RLS on the payment-proofs bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-proofs', 'payment-proofs', true)
ON CONFLICT (id) DO NOTHING;

-- Allow users to upload their own payment proofs
CREATE POLICY "Users can upload payment proofs" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'payment-proofs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to view their own payment proofs
CREATE POLICY "Users can view own payment proofs" ON storage.objects
FOR SELECT USING (
  bucket_id = 'payment-proofs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow admins to view all payment proofs
CREATE POLICY "Admins can view all payment proofs" ON storage.objects
FOR SELECT USING (
  bucket_id = 'payment-proofs' 
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND is_admin = TRUE
  )
);

-- Allow admins to delete payment proofs if needed
CREATE POLICY "Admins can delete payment proofs" ON storage.objects
FOR DELETE USING (
  bucket_id = 'payment-proofs' 
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND is_admin = TRUE
  )
);

-- Set bucket to allow file uploads up to 10MB
UPDATE storage.buckets 
SET file_size_limit = 10485760 -- 10MB in bytes
WHERE id = 'payment-proofs';
