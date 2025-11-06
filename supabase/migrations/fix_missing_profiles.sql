-- Fix missing profiles for authenticated users
-- This migration creates a trigger to auto-create profiles and backfills missing ones

-- First, create a function to handle new user profile creation
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
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill missing profiles for existing users
INSERT INTO public.profiles (id, display_name, subscription_tier, created_at, updated_at)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'display_name', split_part(au.email, '@', 1)) as display_name,
  COALESCE(au.raw_user_meta_data->>'selected_plan', 'free')::subscription_tier as subscription_tier,
  au.created_at,
  NOW() as updated_at
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL
  AND au.deleted_at IS NULL;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.profiles TO authenticated;

-- Update RLS policies to ensure users can access their own profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Create comprehensive RLS policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND (is_admin = true OR email IN ('admin@out.com', 'san@out.com'))
    )
  );

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_tier ON public.profiles(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_profiles_display_name ON public.profiles(display_name);

-- Add helpful comments
COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically creates a profile record when a new user signs up';
COMMENT ON TRIGGER on_auth_user_created ON auth.users IS 'Trigger to create profile for new users';
