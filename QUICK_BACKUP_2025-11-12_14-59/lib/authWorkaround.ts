import { supabase } from './supabaseClient'

export interface SignUpData {
  email: string
  password: string
  displayName?: string
  selectedPlan?: 'free' | 'premium' | 'business'
}

export async function signUpWithProfile(userData: SignUpData) {
  try {
    console.log('🔄 Starting sign up process...')
    
    // Step 1: Create the user account
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          display_name: userData.displayName,
          selected_plan: userData.selectedPlan || 'free'
        }
      }
    })
    
    if (authError) {
      console.log('❌ Auth error:', authError.message)
      
      // If it's the database error, try manual approach
      if (authError.message.includes('Database error saving new user')) {
        console.log('🔄 Trying alternative sign up method...')
        
        // Try signing up without metadata first
        const { data: simpleAuthData, error: simpleAuthError } = await supabase.auth.signUp({
          email: userData.email,
          password: userData.password
        })
        
        if (simpleAuthError) {
          return { success: false, error: simpleAuthError }
        }
        
        // If successful, manually create profile
        if (simpleAuthData.user) {
          console.log('✅ User created, now creating profile...')
          await createProfileManually(simpleAuthData.user.id, userData)
          return { success: true, data: simpleAuthData }
        }
      }
      
      return { success: false, error: authError }
    }
    
    console.log('✅ User created successfully!')
    
    // Step 2: Check if profile was created automatically
    if (authData.user) {
      console.log('🔄 Checking for profile creation...')
      
      // Wait a moment for potential trigger
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single()
      
      if (profileError || !profile) {
        console.log('⚠️ Profile not created automatically, creating manually...')
        await createProfileManually(authData.user.id, userData)
      } else {
        console.log('✅ Profile created automatically!')
      }
    }
    
    return { success: true, data: authData }
    
  } catch (error) {
    console.error('❌ Sign up failed:', error)
    return { success: false, error }
  }
}

async function createProfileManually(userId: string, userData: SignUpData) {
  try {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
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
      console.error('❌ Manual profile creation failed:', profileError.message)
      throw profileError
    }
    
    console.log('✅ Profile created manually!')
    return profile
    
  } catch (error) {
    console.error('❌ Manual profile creation error:', error)
    throw error
  }
}

export async function signInUser(email: string, password: string) {
  try {
    console.log('🔄 Signing in user...')
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) {
      console.log('❌ Sign in failed:', error.message)
      return { success: false, error }
    }
    
    console.log('✅ Sign in successful!')
    
    // Verify profile exists
    if (data.user) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()
      
      if (profileError) {
        console.log('⚠️ Profile not found, this might cause issues')
      } else {
        console.log('✅ Profile verified!')
      }
    }
    
    return { success: true, data }
    
  } catch (error) {
    console.error('❌ Sign in error:', error)
    return { success: false, error }
  }
}

export async function getCurrentUser() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      return { success: false, error }
    }
    
    if (!session?.user) {
      return { success: true, user: null, profile: null }
    }
    
    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()
    
    if (profileError) {
      console.log('⚠️ Profile not found for user:', session.user.id)
      return { success: true, user: session.user, profile: null }
    }
    
    return { success: true, user: session.user, profile }
    
  } catch (error) {
    return { success: false, error }
  }
}

export async function updateUserProfile(updates: Partial<UserProfile>) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: new Error('Not authenticated') }
    }
    
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single()
    
    if (error) {
      return { success: false, error }
    }
    
    return { success: true, data }
    
  } catch (error) {
    return { success: false, error }
  }
}

// Type for profile updates
interface UserProfile {
  display_name?: string
  bio?: string
  phone_number?: string
  website_url?: string
  business_category?: string
  business_location?: string
  business_hours?: string
}
