-- Add images array column to profile_products table
-- This allows products to have multiple images instead of just one image_url

-- Add images column (JSONB array of image objects)
ALTER TABLE profile_products
ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;

-- Add comment
COMMENT ON COLUMN profile_products.images IS 'Array of product images with url, alt text, and order. Format: [{"url": "...", "alt": "...", "order": 0}]';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_profile_products_images ON profile_products USING GIN (images);

-- Note: Keep image_url column for backward compatibility
-- New products will use images array, old products can still use image_url
-- UI will check images array first, then fall back to image_url
