// Activate premium subscription for jewls@gmail.com
// This script will update the profile directly

const { createClient } = require('@supabase/supabase-js')

// You'll need to set these environment variables or replace with actual values
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dcfgdlwhixdruyewywly.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY // Use your service role key

if (!supabaseServiceKey) {
  console.error('❌ Please set SUPABASE_SERVICE_ROLE_KEY environment variable')
  console.log('💡 You can find this in your Supabase dashboard under Settings > API')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function activateJewlsPremium() {
  const userEmail = 'jewls@gmail.com'
  const userId = '029e10ef-b62e-4658-9246-cd27474e8416'
  
  console.log(`🚀 Activating premium subscription for ${userEmail}...`)
  
  try {
    // Update the user's profile to premium
    const { data: updatedProfile, error: profileError } = await supabase
      .from('profiles')
      .update({
        subscription_tier: 'premium',
        subscription_status: 'active',
        trial_end_date: null, // Remove trial restrictions
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
    
    if (profileError) {
      console.error('❌ Error updating profile:', profileError)
      return
    }
    
    console.log('✅ Profile updated successfully!')
    console.log('📋 Updated profile:', updatedProfile)
    
    // Update payment records to mark as paid
    const { data: updatedPayments, error: paymentError } = await supabase
      .from('admin_payment_overview')
      .update({
        status: 'paid',
        payment_date: new Date().toISOString()
      })
      .eq('profile_id', userId)
      .eq('tier_requested', 'premium')
      .eq('status', 'pending')
      .select()
    
    if (paymentError) {
      console.warn('⚠️ Could not update payment records:', paymentError)
    } else {
      console.log('✅ Payment records updated!')
      console.log('💳 Updated payments:', updatedPayments)
    }
    
    // Verify the changes
    const { data: verifyProfile, error: verifyError } = await supabase
      .from('profiles')
      .select('display_name, email, subscription_tier, subscription_status, trial_end_date')
      .eq('id', userId)
      .single()
    
    if (verifyError) {
      console.error('❌ Error verifying changes:', verifyError)
    } else {
      console.log('\n🎉 SUCCESS! User profile verified:')
      console.log(`   Name: ${verifyProfile.display_name}`)
      console.log(`   Email: ${verifyProfile.email}`)
      console.log(`   Tier: ${verifyProfile.subscription_tier}`)
      console.log(`   Status: ${verifyProfile.subscription_status}`)
      console.log(`   Trial End: ${verifyProfile.trial_end_date || 'None (Premium active)'}`)
    }
    
  } catch (error) {
    console.error('❌ Script error:', error)
  }
}

// Run the activation
activateJewlsPremium()