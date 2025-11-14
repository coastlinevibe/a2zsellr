-- Add missing columns for bulk upload functionality
-- This migration adds the required columns for CSV bulk upload

-- Add missing address and location columns
DO $$ 
BEGIN
  -- Add address column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'address') THEN
    ALTER TABLE public.profiles ADD COLUMN address TEXT;
  END IF;
  
  -- Add city column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'city') THEN
    ALTER TABLE public.profiles ADD COLUMN city VARCHAR(100);
  END IF;
  
  -- Add province column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'province') THEN
    ALTER TABLE public.profiles ADD COLUMN province VARCHAR(100);
  END IF;
  
  -- Add postal_code column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'postal_code') THEN
    ALTER TABLE public.profiles ADD COLUMN postal_code VARCHAR(20);
  END IF;
  
  -- Add country column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'country') THEN
    ALTER TABLE public.profiles ADD COLUMN country VARCHAR(100) DEFAULT 'South Africa';
  END IF;
  
  -- Add facebook_connection column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'facebook_connection') THEN
    ALTER TABLE public.profiles ADD COLUMN facebook_connection VARCHAR(500);
  END IF;
  
  -- Add google_my_business_connection column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'google_my_business_connection') THEN
    ALTER TABLE public.profiles ADD COLUMN google_my_business_connection VARCHAR(500);
  END IF;
END $$;

-- Create indexes for better performance on new columns
CREATE INDEX IF NOT EXISTS idx_profiles_city ON public.profiles(city);
CREATE INDEX IF NOT EXISTS idx_profiles_province ON public.profiles(province);
CREATE INDEX IF NOT EXISTS idx_profiles_country ON public.profiles(country);

-- Update existing profiles to have default country
UPDATE public.profiles 
SET country = 'South Africa' 
WHERE country IS NULL;

-- Add comments to document the new columns
COMMENT ON COLUMN public.profiles.address IS 'Full business address for bulk upload';
COMMENT ON COLUMN public.profiles.city IS 'City name for location filtering';
COMMENT ON COLUMN public.profiles.province IS 'Province/state for regional filtering';
COMMENT ON COLUMN public.profiles.postal_code IS 'Postal/ZIP code';
COMMENT ON COLUMN public.profiles.country IS 'Country name, defaults to South Africa';
COMMENT ON COLUMN public.profiles.facebook_connection IS 'Facebook page URL';
COMMENT ON COLUMN public.profiles.google_my_business_connection IS 'Google My Business URL';
