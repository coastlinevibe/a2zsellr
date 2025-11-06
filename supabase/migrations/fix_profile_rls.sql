-- Fix RLS policies for profiles to resolve fetching errors
-- This addresses the 406 errors and profile loading issues

-- First, drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable update access for own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert access for own profile" ON public.profiles;

-- Create simple, working RLS policies
CREATE POLICY "Enable read access for users" ON public.profiles
  FOR SELECT USING (
    auth.uid() = id OR 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND is_admin = true
    )
  );

CREATE POLICY "Enable insert access for users" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable update access for users" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Allow public read access for business directory functionality
CREATE POLICY "Enable public read for business directory" ON public.profiles
  FOR SELECT USING (true);

-- Ensure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;

-- Update the trigger function to handle potential conflicts
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, subscription_tier, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'selected_plan', 'free')::subscription_tier,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING; -- Prevent duplicate key errors
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
