// Run this in your browser console while logged into Supabase dashboard
// or in your app where supabase client is available

async function activateJewlsPremium() {
  const userId = '029e10ef-b62e-4658-9246-cd27474e8416'
  const userEmail = 'jewls@gmail.com'
  
  console.log(`🚀 Activating premium for ${userEmail}...`)
  
  try {
    // Update profile to premium
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .update({
        subscription_tier: 'premium',
        subscription_status: 'active',
        trial_end_date: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
    
    if (profileError) {
      console.error('❌ Profile update failed:', profileError)
      return
    }
    
    console.log('✅ Profile updated to premium!')
    
    // Note: admin_payment_overview is a view, payment status will be reflected automatically
    console.log('ℹ️ Payment status will be updated in the underlying payment table')
    
    console.log('🎉 Premium activation complete!')
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Call the function
activateJewlsPremium()

// Alternative: Run this single command to activate premium
/*
supabase
  .from('profiles')
  .update({
    subscription_tier: 'premium',
    subscription_status: 'active', 
    trial_end_date: null,
    updated_at: new Date().toISOString()
  })
  .eq('id', '029e10ef-b62e-4658-9246-cd27474e8416')
  .then(result => console.log('✅ Premium activated!', result))
  .catch(error => console.error('❌ Error:', error))
*/