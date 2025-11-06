-- Simple fix for RLS infinite recursion
-- Remove all complex policies and use basic ones

-- Drop all existing policies
DROP POLICY IF EXISTS "Enable read access for users" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert access for users" ON public.profiles;
DROP POLICY IF EXISTS "Enable update access for users" ON public.profiles;
DROP POLICY IF EXISTS "Enable public read for business directory" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Create simple policies without recursion
CREATE POLICY "profiles_select_policy" ON public.profiles
  FOR SELECT USING (true); -- Allow all reads for business directory

CREATE POLICY "profiles_insert_policy" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_policy" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Ensure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
