// Browser console test script for reset functionality
// Copy and paste this into your browser console on the dashboard page

console.log('🧪 Starting reset test...')

// Get the current user ID from the page
const getCurrentUserId = () => {
  // Try to get from localStorage or other sources
  const authData = localStorage.getItem('supabase.auth.token')
  if (authData) {
    try {
      const parsed = JSON.parse(authData)
      return parsed.user?.id
    } catch (e) {
      console.log('Could not parse auth data')
    }
  }
  return null
}

// Test reset function
const testReset = async () => {
  const userId = getCurrentUserId()
  if (!userId) {
    console.error('❌ Could not get user ID')
    return
  }
  
  console.log(`🔄 Testing reset for user: ${userId}`)
  
  try {
    // Import the reset function (this might not work in console, but worth trying)
    const { resetUserData } = await import('/lib/trialManager.js')
    
    const success = await resetUserData(userId)
    if (success) {
      console.log('✅ Reset test successful!')
      alert('✅ Reset completed! Reloading page...')
      window.location.reload()
    } else {
      console.error('❌ Reset test failed')
    }
  } catch (error) {
    console.error('❌ Error during reset test:', error)
    
    // Alternative: trigger the reset button if it exists
    const resetButton = document.querySelector('button[title="Reset all data now"]')
    if (resetButton) {
      console.log('🔄 Triggering reset button instead...')
      resetButton.click()
    } else {
      console.log('ℹ️ No reset button found. Try refreshing the page.')
    }
  }
}

// Run the test
testReset()

console.log('📝 Test script loaded. If reset didn\'t work automatically, try:')
console.log('1. Look for the red "🔄 RESET" button next to the timer')
console.log('2. Visit /test-timer page for more testing options')
console.log('3. Check browser console for any errors')