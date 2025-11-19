// Test webhook activation in browser console
// Run this in your app where you have access to fetch

async function testWebhookActivation() {
  const profileId = '029e10ef-b62e-4658-9246-cd27474e8416'
  const tierRequested = 'premium'
  
  console.log('🧪 Testing webhook activation...')
  
  try {
    const response = await fetch('/api/test-webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        profileId,
        tierRequested
      })
    })
    
    const result = await response.json()
    
    if (response.ok) {
      console.log('✅ Test successful!', result)
      console.log('👤 Before:', result.before)
      console.log('🎉 After:', result.after)
    } else {
      console.error('❌ Test failed:', result)
    }
    
  } catch (error) {
    console.error('❌ Network error:', error)
  }
}

// Run the test
testWebhookActivation()

// Alternative: Direct profile update test
async function testDirectUpdate() {
  console.log('🔄 Testing direct profile update...')
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        subscription_tier: 'premium',
        subscription_status: 'active',
        trial_end_date: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', '029e10ef-b62e-4658-9246-cd27474e8416')
      .select()
    
    if (error) {
      console.error('❌ Direct update failed:', error)
    } else {
      console.log('✅ Direct update successful:', data)
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

console.log('🔧 Test functions loaded:')
console.log('  testWebhookActivation() - Test via API endpoint')
console.log('  testDirectUpdate() - Test direct Supabase update')