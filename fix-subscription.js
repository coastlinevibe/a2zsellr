// Quick fix script to manually update user subscription
// Run this in browser console or Node.js

const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dcfgdlwhixdruyewywly.supabase.co'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjZmdkbHdoaXhkcnV5ZXd5d2x5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MjU1NjYsImV4cCI6MjA3NjEwMTU2Nn0.wMGq2FpoVFMnLemUP13763iodoXNu-gx8I0rRpTubG4'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function fixUserSubscription() {
  const userId = '029e10ef-b62e-4658-9246-cd27474e8416' // jewls user ID
  
  console.log('🔧 Fixing subscription for user:', userId)
  
  try {
    // Update user to premium tier
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        subscription_tier: 'premium',
        subscription_status: 'active',
        trial_end_date: null, // Remove trial for premium users
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
    
    if (updateError) {
      console.error('❌ Error updating profile:', updateError)
      return
    }
    
    // Verify the update
    const { data: updatedProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('display_name, subscription_tier, subscription_status, trial_end_date')
      .eq('id', userId)
      .single()
    
    if (fetchError) {
      console.error('❌ Error fetching updated profile:', fetchError)
      return
    }
    
    console.log('✅ Subscription fixed successfully!')
    console.log('Updated profile:', updatedProfile)
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Run the fix
fixUserSubscription()

// Instructions for browser console:
console.log('📝 To run this in browser console:')
console.log('1. Copy the fixUserSubscription function above')
console.log('2. Paste it in browser console on your site')
console.log('3. Call fixUserSubscription()')