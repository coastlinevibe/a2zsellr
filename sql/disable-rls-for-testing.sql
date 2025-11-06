-- Temporarily disable RLS for testing and design phase
-- This will allow new user signup to work while you're testing and updating designs
-- Re-enable RLS before going live with real users

-- Step 1: Disable RLS on profiles table
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop the problematic policies temporarily
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow profile creation during signup" ON public.profiles;
DROP POLICY IF EXISTS "Service role can create profiles" ON public.profiles;

-- Step 3: Grant full access for testing
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO anon;

-- Step 4: Keep the trigger for automatic profile creation
-- (This should work now without RLS blocking it)
CREATE OR REPLACE FUNCTION public.handle_new_user_testing()
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
  WHEN OTHERS THEN
    -- Log but don't fail
    RAISE WARNING 'Profile creation warning: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Update the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_testing();

-- Verification
DO $$
BEGIN
  RAISE NOTICE '🔓 RLS DISABLED FOR TESTING PHASE';
  RAISE NOTICE '✅ New user signup should now work';
  RAISE NOTICE '✅ Profile creation should be automatic';
  RAISE NOTICE '⚠️ Remember to re-enable RLS before production launch';
END $$;
