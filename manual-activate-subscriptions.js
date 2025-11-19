// Manual subscription activation script
// Run this in your browser console or as a Node.js script

// For browser console (run this in your Supabase dashboard or app):
async function activateSubscriptionsManually() {
  console.log('🚀 Starting manual subscription activation...')
  
  try {
    // Get all pending premium/business payments
    const { data: pendingPayments, error: paymentsError } = await supabase
      .from('admin_payment_overview')
      .select('*')
      .eq('status', 'pending')
      .in('tier_requested', ['premium', 'business'])
    
    if (paymentsError) {
      console.error('❌ Error fetching payments:', paymentsError)
      return
    }
    
    console.log(`📋 Found ${pendingPayments?.length || 0} pending payments`)
    
    if (!pendingPayments || pendingPayments.length === 0) {
      console.log('✅ No pending payments found')
      return
    }
    
    // Process each payment
    for (const payment of pendingPayments) {
      console.log(`\n🔄 Processing: ${payment.display_name} (${payment.email})`)
      console.log(`   Upgrading to: ${payment.tier_requested}`)
      
      try {
        // Update profile directly
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
        
        console.log(`   ✅ Profile updated to ${payment.tier_requested}`)
        
        // Update payment status
        const { error: paymentError } = await supabase
          .from('admin_payment_overview')
          .update({
            status: 'paid',
            payment_date: new Date().toISOString()
          })
          .eq('id', payment.id)
        
        if (paymentError) {
          console.error(`   ⚠️ Payment status update failed:`, paymentError)
        } else {
          console.log(`   ✅ Payment marked as paid`)
        }
        
        console.log(`   🎉 Successfully activated ${payment.tier_requested} for ${payment.display_name}`)
        
      } catch (error) {
        console.error(`   ❌ Error processing ${payment.display_name}:`, error)
      }
    }
    
    console.log('\n🎯 Manual activation complete!')
    
  } catch (error) {
    console.error('❌ Script error:', error)
  }
}

// Alternative: Activate specific user by email
async function activateUserByEmail(email, tier = 'premium') {
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
    
    console.log(`📋 Found user: ${profile.display_name} (current tier: ${profile.subscription_tier})`)
    
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
    
    console.log(`✅ Successfully upgraded ${profile.display_name} to ${tier}!`)
    
    // Also update any pending payments for this user
    const { error: paymentError } = await supabase
      .from('admin_payment_overview')
      .update({
        status: 'paid',
        payment_date: new Date().toISOString()
      })
      .eq('profile_id', profile.id)
      .eq('tier_requested', tier)
      .eq('status', 'pending')
    
    if (!paymentError) {
      console.log('✅ Payment records updated')
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Run the main function
console.log('🔧 Manual subscription activation script loaded')
console.log('📝 Usage:')
console.log('   activateSubscriptionsManually() - Activate all pending subscriptions')
console.log('   activateUserByEmail("user@email.com", "premium") - Activate specific user')

// Uncomment to run automatically:
// activateSubscriptionsManually()