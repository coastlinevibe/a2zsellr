-- Create locations and categories tables for A2Z Business Directory
-- Run this SQL in your Supabase SQL Editor

-- Create locations table
CREATE TABLE IF NOT EXISTS public.locations (
  id SERIAL PRIMARY KEY,
  city VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  province VARCHAR(100),
  country VARCHAR(100) DEFAULT 'South Africa',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert starter locations
INSERT INTO public.locations (city, slug, province) VALUES
  ('All Locations', 'all', 'National'),
  ('Johannesburg', 'johannesburg', 'Gauteng'),
  ('Cape Town', 'cape-town', 'Western Cape'),
  ('Durban', 'durban', 'KwaZulu-Natal'),
  ('Pretoria', 'pretoria', 'Gauteng'),
  ('Pietermaritzburg', 'pietermaritzburg', 'KwaZulu-Natal'),
  ('Port Elizabeth', 'port-elizabeth', 'Eastern Cape'),
  ('Bloemfontein', 'bloemfontein', 'Free State'),
  ('East London', 'east-london', 'Eastern Cape'),
  ('Polokwane', 'polokwane', 'Limpopo'),
  ('Nelspruit', 'nelspruit', 'Mpumalanga'),
  ('Kimberley', 'kimberley', 'Northern Cape'),
  ('Rustenburg', 'rustenburg', 'North West')
ON CONFLICT (slug) DO NOTHING;

-- Insert starter categories
INSERT INTO public.categories (name, slug, description, icon) VALUES
  ('All Categories', 'all', 'Browse all business categories', 'grid'),
  ('Restaurants', 'restaurants', 'Dining, cafes, food delivery, catering services', 'utensils'),
  ('Retail', 'retail', 'Shopping, clothing, electronics, home goods', 'shopping-bag'),
  ('Services', 'services', 'Professional services, consulting, repairs', 'briefcase'),
  ('Healthcare', 'healthcare', 'Medical, dental, wellness, fitness centers', 'heart'),
  ('Technology', 'technology', 'IT services, software, web development', 'laptop'),
  ('Construction', 'construction', 'Building, renovation, contractors, architecture', 'hammer'),
  ('Beauty & Wellness', 'beauty-wellness', 'Salons, spas, beauty treatments, wellness', 'sparkles'),
  ('Automotive', 'automotive', 'Car sales, repairs, parts, automotive services', 'car'),
  ('Education', 'education', 'Schools, training, tutoring, educational services', 'graduation-cap'),
  ('Finance', 'finance', 'Banking, insurance, accounting, financial planning', 'dollar-sign'),
  ('Real Estate', 'real-estate', 'Property sales, rentals, property management', 'home'),
  ('Entertainment', 'entertainment', 'Events, venues, entertainment services', 'music'),
  ('Travel & Tourism', 'travel-tourism', 'Hotels, travel agencies, tour operators', 'plane'),
  ('Legal', 'legal', 'Law firms, legal services, attorneys', 'scale')
ON CONFLICT (slug) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_locations_slug ON public.locations(slug);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_locations_active ON public.locations(is_active);
CREATE INDEX IF NOT EXISTS idx_categories_active ON public.categories(is_active);

-- Enable RLS on new tables
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Create policies for locations (read-only for all users)
CREATE POLICY "locations_select_all" ON public.locations
  FOR SELECT USING (true);

-- Create policies for categories (read-only for all users)  
CREATE POLICY "categories_select_all" ON public.categories
  FOR SELECT USING (true);

-- Update trigger function for timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add update triggers
DROP TRIGGER IF EXISTS update_locations_updated_at ON public.locations;
CREATE TRIGGER update_locations_updated_at 
  BEFORE UPDATE ON public.locations 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_categories_updated_at ON public.categories;
CREATE TRIGGER update_categories_updated_at 
  BEFORE UPDATE ON public.categories 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
