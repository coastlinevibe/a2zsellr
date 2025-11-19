// Simple reset test - run this in Node.js or browser console
// This tests the reset functionality step by step

const testReset = async () => {
  console.log('🧪 Testing reset functionality...')
  
  // You'll need to replace this with your actual user ID
  const userId = 'd13c2075-a95f-4961-b733-27fabc826d04' // Replace with your user ID
  
  try {
    // Test 1: Check current trial status
    console.log('1️⃣ Checking trial status...')
    
    // Test 2: Count current items
    console.log('2️⃣ Counting current items...')
    
    // Test 3: Try the reset
    console.log('3️⃣ Attempting reset...')
    
    // If you're running this in the browser on your site, you can use:
    // const { resetUserData } = await import('./lib/trialManager.js')
    // const success = await resetUserData(userId)
    
    console.log('✅ Test script ready. To run actual reset:')
    console.log('1. Go to your dashboard')
    console.log('2. Click the red "🔄 RESET" button')
    console.log('3. Or go to /test-timer and use the force reset button')
    
  } catch (error) {
    console.error('❌ Test error:', error)
  }
}

// Instructions for manual testing
console.log('🔧 MANUAL RESET INSTRUCTIONS:')
console.log('')
console.log('METHOD 1 - Dashboard Button:')
console.log('• Go to your dashboard')
console.log('• Look for red "🔄 RESET" button next to timer')
console.log('• Click it and confirm')
console.log('')
console.log('METHOD 2 - Test Page:')
console.log('• Go to /test-timer')
console.log('• Click "🚨 FORCE RESET NOW"')
console.log('')
console.log('METHOD 3 - Browser Console:')
console.log('• Open browser console (F12)')
console.log('• Find the reset button and click it programmatically:')
console.log('  document.querySelector(\'button[title="Reset all data now"]\')?.click()')

testReset()