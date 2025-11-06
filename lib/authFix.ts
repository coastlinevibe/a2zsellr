import { createClient } from '@supabase/supabase-js'

// Your Supabase credentials
const SUPABASE_URL = 'https://dcfgdlwhixdruyewywly.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjZmdkbHdoaXhkcnV5ZXd5d2x5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MjU1NjYsImV4cCI6MjA3NjEwMTU2Nn0.wMGq2FpoVFMnLemUP13763iodoXNu-gx8I0rRpTubG4'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export async function setupAuthSystem() {
  console.log('🔧 Setting up Authentication System...\n')
  
  try {
    // Step 1: Create the profile creation function
    console.log('1. Creating profile creation function...')
    const { error: functionError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Create function to handle new user profile creation
        CREATE OR REPLACE FUNCTION public.handle_new_user()
        RETURNS trigger AS $$
        BEGIN
          INSERT INTO public.profiles (id, display_name, email, subscription_tier, created_at, updated_at)
          VALUES (
            NEW.id,
            COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'selected_plan', 'free')::text,
            NOW(),
            NOW()
          );
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
      `
    })
    
    if (functionError) {
      console.log('❌ Function creation failed:', functionError.message)
    } else {
      console.log('✅ Function created successfully')
    }
    
    // Step 2: Create the trigger
    console.log('2. Creating trigger...')
    const { error: triggerError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Create trigger to automatically create profile when user signs up
        DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
        CREATE TRIGGER on_auth_user_created
          AFTER INSERT ON auth.users
          FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
      `
    })
    
    if (triggerError) {
      console.log('❌ Trigger creation failed:', triggerError.message)
    } else {
      console.log('✅ Trigger created successfully')
    }
    
    // Step 3: Setup RLS policies
    console.log('3. Setting up RLS policies...')
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Enable RLS on profiles table
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
        
        -- Drop existing policies
        DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
        DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
        DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
        
        -- Create new policies
        CREATE POLICY "Users can view own profile" ON public.profiles
          FOR SELECT USING (auth.uid() = id);
          
        CREATE POLICY "Users can update own profile" ON public.profiles
          FOR UPDATE USING (auth.uid() = id);
          
        CREATE POLICY "Users can insert own profile" ON public.profiles
          FOR INSERT WITH CHECK (auth.uid() = id);
      `
    })
    
    if (rlsError) {
      console.log('❌ RLS setup failed:', rlsError.message)
    } else {
      console.log('✅ RLS policies created successfully')
    }
    
    return { success: true }
    
  } catch (error) {
    console.error('❌ Setup failed:', error)
    return { success: false, error }
  }
}

export async function testAuthFlow() {
  console.log('🧪 Testing Authentication Flow...\n')
  
  try {
    // Test 1: Sign up a new user
    const testEmail = `test${Date.now()}@example.com`
    const testPassword = 'testpassword123'
    
    console.log('1. Testing sign up...')
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          display_name: 'Test User'
        }
      }
    })
    
    if (signUpError) {
      console.log('❌ Sign up failed:', signUpError.message)
      return { success: false, error: signUpError }
    }
    
    console.log('✅ Sign up successful!')
    console.log('User ID:', signUpData.user?.id)
    
    // Test 2: Check if profile was created
    if (signUpData.user) {
      console.log('2. Checking profile creation...')
      
      // Wait a moment for trigger to execute
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', signUpData.user.id)
        .single()
      
      if (profileError) {
        console.log('❌ Profile not found:', profileError.message)
      } else {
        console.log('✅ Profile created successfully!')
        console.log('Profile data:', {
          id: profile.id,
          display_name: profile.display_name,
          email: profile.email,
          subscription_tier: profile.subscription_tier
        })
      }
    }
    
    return { success: true, user: signUpData.user }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    return { success: false, error }
  }
}

export async function checkExistingProfiles() {
  console.log('📊 Checking existing profiles...\n')
  
  try {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, display_name, email, subscription_tier, created_at')
      .limit(5)
    
    if (error) {
      console.log('❌ Error fetching profiles:', error.message)
      return { success: false, error }
    }
    
    console.log(`✅ Found ${profiles.length} existing profiles:`)
    profiles.forEach((profile, index) => {
      console.log(`${index + 1}. ${profile.display_name || 'No name'} (${profile.email || 'No email'}) - ${profile.subscription_tier}`)
    })
    
    return { success: true, profiles }
    
  } catch (error) {
    console.error('❌ Check failed:', error)
    return { success: false, error }
  }
}
