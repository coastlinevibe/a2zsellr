import { supabase } from './supabaseClient'

export interface SignUpData {
  email: string
  password: string
  displayName?: string
  selectedPlan?: 'free' | 'premium' | 'business'
}

export async function signUpWithManualProfile(userData: SignUpData) {
  try {
    console.log('🔄 Starting sign up with manual profile creation...')
    
    // Step 1: Sign up the user (this should work without triggers)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    })
    
    if (authError) {
      console.log('❌ Auth signup failed:', authError.message)
      return { success: false, error: authError }
    }
    
    console.log('✅ User signup successful!')
    
    // Step 2: Create profile manually after successful signup
    if (authData.user) {
      console.log('🔄 Creating profile manually...')
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          display_name: userData.displayName || userData.email.split('@')[0],
          email: userData.email,
          subscription_tier: userData.selectedPlan || 'free',
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
        // User was created but profile failed - this is recoverable
        return { 
          success: true, 
          data: authData, 
          profileError,
          needsProfileCreation: true 
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

export async function ensureProfileExists(userId: string, email: string, displayName?: string) {
  try {
    // Check if profile already exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (existingProfile) {
      console.log('✅ Profile already exists')
      return { success: true, profile: existingProfile }
    }
    
    // Create profile if it doesn't exist
    console.log('🔄 Creating missing profile...')
    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
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
    
    if (createError) {
      console.log('❌ Profile creation failed:', createError.message)
      return { success: false, error: createError }
    }
    
    console.log('✅ Profile created successfully!')
    return { success: true, profile: newProfile }
    
  } catch (error) {
    console.error('❌ Profile check/creation failed:', error)
    return { success: false, error }
  }
}

export async function signInAndEnsureProfile(email: string, password: string) {
  try {
    console.log('🔄 Signing in user...')
    
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (signInError) {
      console.log('❌ Sign in failed:', signInError.message)
      return { success: false, error: signInError }
    }
    
    console.log('✅ Sign in successful!')
    
    // Ensure profile exists
    if (signInData.user) {
      const profileResult = await ensureProfileExists(
        signInData.user.id, 
        signInData.user.email || email
      )
      
      return { 
        success: true, 
        data: signInData, 
        profile: profileResult.profile,
        profileError: profileResult.error 
      }
    }
    
    return { success: true, data: signInData }
    
  } catch (error) {
    console.error('❌ Sign in process failed:', error)
    return { success: false, error }
  }
}
