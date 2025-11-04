-- Fix image upload using EXISTING database structure
-- Work with campaign_layouts.media column instead of creating new tables

-- First, let's see the current marketing_campaigns structure
-- (We'll add platform_settings if it doesn't exist)
ALTER TABLE public.marketing_campaigns 
ADD COLUMN IF NOT EXISTS platform_settings JSONB DEFAULT '{}';

-- The campaign_layouts table already has a 'media' JSONB column - perfect!
-- We'll use this structure:
-- campaign_layouts.media = {
--   "uploaded_files": [
--     {
--       "id": "upload-123",
--       "name": "image.jpg", 
--       "url": "https://storage-url",
--       "type": "image/jpeg",
--       "storage_path": "uploads/user-id/file.jpg"
--     }
--   ],
--   "selected_products": ["product-id-1", "product-id-2"]
-- }

-- Update any existing campaigns to have empty platform_settings
UPDATE public.marketing_campaigns 
SET platform_settings = '{}' 
WHERE platform_settings IS NULL;

-- No need to create new tables - we'll use:
-- 1. marketing_campaigns.platform_settings for basic campaign settings
-- 2. campaign_layouts.media for uploaded media files
-- 3. campaign_products for product associations
