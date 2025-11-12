import { supabase } from './supabaseClient'

// Client-side profile creation for new users
export async function signUpWithClientProfile(email: string, password: string, displayName?: string) {
  try {
    console.log('🔄 Starting client-side signup...')
    
    // Step 1: Create the user account
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName
        }
      }
    })
    
    if (authError) {
      console.log('❌ Auth signup failed:', authError.message)
      return { success: false, error: authError }
    }
    
    console.log('✅ User account created!')
    
    // Step 2: Create profile manually (client-side)
    if (authData.user) {
      console.log('🔄 Creating profile client-side...')
      
      // Wait a moment to ensure user is fully created
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          display_name: displayName || email.split('@')[0],
          email: email,
          subscription_tier: 'free',
          subscription_status: 'active',
          verified_seller: false,
          is_active: true,
          current_listings: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()
      
      if (profileError) {
        console.log('❌ Profile creation failed:', profileError.message)
        return { 
          success: true, 
          data: authData, 
          profileError,
          message: 'User created but profile creation failed - can be fixed later'
        }
      }
      
      console.log('✅ Profile created successfully!')
      return { success: true, data: authData, profile }
    }
    
    return { success: true, data: authData }
    
  } catch (error) {
    console.error('❌ Signup process failed:', error)
    return { success: false, error }
  }
}

// Enhanced auth context that handles profile creation
export async function ensureUserHasProfile(user: any) {
  if (!user) return null
  
  try {
    // Check if profile exists
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    
    if (error && error.code === 'PGRST116') {
      // Profile doesn't exist, create it
      console.log('🔄 Creating missing profile for existing user...')
      
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          display_name: user.user_metadata?.display_name || user.email?.split('@')[0] || 'User',
          email: user.email,
          subscription_tier: 'free',
          subscription_status: 'active',
          verified_seller: false,
          is_active: true,
          current_listings: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()
      
      if (createError) {
        console.error('❌ Failed to create profile:', createError.message)
        return null
      }
      
      console.log('✅ Profile created for existing user!')
      return newProfile
    }
    
    return profile
    
  } catch (error) {
    console.error('❌ Error ensuring profile exists:', error)
    return null
  }
}
