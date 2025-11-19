// Manually activate pending PayFast payments
// Run this in browser console where supabase is available

async function activatePendingPayFastPayments() {
  console.log('🚀 Activating pending PayFast payments...')
  
  try {
    // Get all pending PayFast payments
    const { data: pendingPayments, error: paymentsError } = await supabase
      .from('admin_payment_overview')
      .select('*')
      .eq('payment_method', 'payfast')
      .eq('status', 'pending')
    
    if (paymentsError) {
      console.error('❌ Error fetching payments:', paymentsError)
      return
    }
    
    console.log(`📋 Found ${pendingPayments?.length || 0} pending PayFast payments`)
    
    if (!pendingPayments || pendingPayments.length === 0) {
      console.log('✅ No pending PayFast payments to activate')
      return
    }
    
    // Show payments
    console.table(pendingPayments.map(p => ({
      name: p.display_name,
      email: p.email,
      tier: p.tier_requested,
      amount: `R${p.amount_cents / 100}`,
      date: new Date(p.created_at).toLocaleDateString()
    })))
    
    // Activate each payment
    for (const payment of pendingPayments) {
      console.log(`\n🔄 Activating ${payment.tier_requested} for ${payment.display_name}...`)
      
      try {
        // Update profile to premium/business
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            subscription_tier: payment.tier_requested,
            subscription_status: 'active',
            trial_end_date: null,
            updated_at: new Date().toISOString()
          })
          .eq('id', payment.profile_id)
        
        if (profileError) {
          console.error(`   ❌ Profile update failed:`, profileError)
          continue
        }
        
        console.log(`   ✅ ${payment.display_name} upgraded to ${payment.tier_requested}!`)
        
      } catch (error) {
        console.error(`   ❌ Error processing ${payment.display_name}:`, error)
      }
    }
    
    console.log('\n🎉 PayFast payment activation complete!')
    
    // Verify the changes
    const userIds = pendingPayments.map(p => p.profile_id)
    const { data: updatedProfiles } = await supabase
      .from('profiles')
      .select('display_name, email, subscription_tier, subscription_status')
      .in('id', userIds)
    
    console.log('\n📊 Updated user profiles:')
    console.table(updatedProfiles)
    
  } catch (error) {
    console.error('❌ Script error:', error)
  }
}

// Activate specific user by email
async function activateUserPayFast(email, tier = 'premium') {
  console.log(`🔄 Activating ${tier} for ${email}...`)
  
  try {
    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single()
    
    if (profileError || !profile) {
      console.error('❌ User not found:', profileError)
      return
    }
    
    // Update to premium/business
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        subscription_tier: tier,
        subscription_status: 'active',
        trial_end_date: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', profile.id)
    
    if (updateError) {
      console.error('❌ Update failed:', updateError)
      return
    }
    
    console.log(`✅ ${profile.display_name} upgraded to ${tier}!`)
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

console.log('🔧 PayFast activation script loaded')
console.log('📝 Usage:')
console.log('  activatePendingPayFastPayments() - Activate all pending PayFast payments')
console.log('  activateUserPayFast("jewls@gmail.com", "premium") - Activate specific user')

// Quick activation for the users you mentioned
console.log('\n🎯 Quick activation commands:')
console.log('  activateUserPayFast("jewls@gmail.com", "premium")')
console.log('  activateUserPayFast("mokopet@gmail.com", "premium")')