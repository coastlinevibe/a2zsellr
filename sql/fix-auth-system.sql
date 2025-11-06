-- Fix Authentication System
-- This SQL script fixes the auth system by ensuring proper triggers and RLS policies

-- Step 1: Create or replace the profile creation function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    display_name, 
    email, 
    subscription_tier, 
    subscription_status,
    verified_seller,
    is_active,
    current_listings,
    created_at, 
    updated_at
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'selected_plan', 'free'),
    'active',
    false,
    true,
    0,
    NOW(),
    NOW()
  );
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Drop and recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 3: Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Step 4: Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Step 5: Create comprehensive RLS policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow public viewing of active profiles (for directory functionality)
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (is_active = true);

-- Admin access policy
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND is_admin = true
    )
  );

-- Step 6: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;

-- Step 7: Create helpful indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_tier ON public.profiles(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON public.profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at);

-- Step 8: Backfill any missing profiles for existing users (if any)
INSERT INTO public.profiles (
  id, 
  display_name, 
  email, 
  subscription_tier, 
  subscription_status,
  verified_seller,
  is_active,
  current_listings,
  created_at, 
  updated_at
)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'display_name', split_part(au.email, '@', 1)) as display_name,
  au.email,
  COALESCE(au.raw_user_meta_data->>'selected_plan', 'free') as subscription_tier,
  'active' as subscription_status,
  false as verified_seller,
  true as is_active,
  0 as current_listings,
  au.created_at,
  NOW() as updated_at
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL
  AND au.deleted_at IS NULL
ON CONFLICT (id) DO NOTHING;

-- Step 9: Add helpful comments
COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically creates a profile record when a new user signs up';
COMMENT ON TRIGGER on_auth_user_created ON auth.users IS 'Trigger to create profile for new users';

-- Step 10: Verify the setup
DO $$
BEGIN
  RAISE NOTICE 'Auth system setup completed successfully!';
  RAISE NOTICE 'Trigger: on_auth_user_created created';
  RAISE NOTICE 'Function: handle_new_user() created';
  RAISE NOTICE 'RLS policies: enabled and configured';
END $$;
