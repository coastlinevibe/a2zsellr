// Test PayFast webhook manually
// Run this in your browser console or as a fetch request

async function testPayFastWebhook() {
  console.log('🧪 Testing PayFast webhook...')
  
  // Simulate PayFast webhook data
  const testData = new FormData()
  testData.append('payment_status', 'COMPLETE')
  testData.append('m_payment_id', 'TEST_PAYMENT_123')
  testData.append('pf_payment_id', 'PF_TEST_456')
  testData.append('amount_gross', '149.00')
  testData.append('custom_str1', '029e10ef-b62e-4658-9246-cd27474e8416') // jewls profile ID
  testData.append('custom_str2', 'premium') // tier requested
  testData.append('custom_str3', 'test_transaction_id')
  testData.append('custom_str4', 'monthly')
  testData.append('signature', 'test_signature') // This will fail validation but we'll see the logs
  
  try {
    const response = await fetch('/api/payfast/webhook', {
      method: 'POST',
      body: testData
    })
    
    const result = await response.text()
    console.log('📋 Webhook response:', response.status, result)
    
    if (response.ok) {
      console.log('✅ Webhook test successful!')
    } else {
      console.log('❌ Webhook test failed')
    }
    
  } catch (error) {
    console.error('❌ Network error:', error)
  }
}

// Test the webhook
testPayFastWebhook()

// Alternative: Test with GET request to see if endpoint is accessible
async function testWebhookEndpoint() {
  try {
    const response = await fetch('/api/payfast/webhook')
    const result = await response.json()
    console.log('🔍 Webhook endpoint test:', result)
  } catch (error) {
    console.error('❌ Endpoint test failed:', error)
  }
}

console.log('🔧 PayFast webhook test loaded')
console.log('📝 Usage:')
console.log('  testPayFastWebhook() - Test webhook with simulated PayFast data')
console.log('  testWebhookEndpoint() - Test if webhook endpoint is accessible')