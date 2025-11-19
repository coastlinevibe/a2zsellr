// Fix Mokopets business subscription
// Run this in browser console where supabase is available

async function fixMokopetsBusiness() {
  const userId = '2c229aa5-a0e4-46e0-8928-ab947747cf65'
  const paymentId = '641654da-7c28-4a2b-8f21-c025d1ba1621'
  
  console.log('🚀 Fixing Mokopets business subscription...')
  
  try {
    // 1. Update profile to business tier
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        subscription_tier: 'business',
        subscription_status: 'active',
        trial_end_date: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
    
    if (profileError) {
      console.error('❌ Profile update failed:', profileError)
      return
    }
    
    console.log('✅ Profile updated to business tier!')
    
    // 2. Update payment status to paid
    const { error: paymentError } = await supabase
      .from('payment_transactions')
      .update({
        status: 'paid',
        payment_date: new Date().toISOString(),
        payfast_payment_id: 'MANUAL_FIX_' + Date.now(),
        updated_at: new Date().toISOString()
      })
      .eq('id', paymentId)
    
    if (paymentError) {
      console.warn('⚠️ Payment update warning:', paymentError)
    } else {
      console.log('✅ Payment marked as paid!')
    }
    
    // 3. Verify the changes
    const { data: updatedProfile } = await supabase
      .from('profiles')
      .select('display_name, email, subscription_tier, subscription_status, trial_end_date')
      .eq('id', userId)
      .single()
    
    console.log('🎉 SUCCESS! Updated profile:', updatedProfile)
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Run the fix
fixMokopetsBusiness()

console.log('🔧 Mokopets business fix script loaded')
console.log('📝 This will upgrade Mokopets to business tier and mark payment as paid')