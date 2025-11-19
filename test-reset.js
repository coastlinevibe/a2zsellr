// Test script to manually trigger reset for testing
const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dcfgdlwhixdruyewywly.supabase.co'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjZmdkbHdoaXhkcnV5ZXd5d2x5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MjU1NjYsImV4cCI6MjA3NjEwMTU2Nn0.wMGq2FpoVFMnLemUP13763iodoXNu-gx8I0rRpTubG4'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function testReset() {
  console.log('🧪 Testing reset functionality...')
  
  try {
    // Call the reset function
    const { data, error } = await supabase.rpc('reset_free_tier_profiles')
    
    if (error) {
      console.error('❌ Error:', error)
      return
    }
    
    console.log('✅ Reset completed successfully!')
    console.log('📊 Results:', data)
    
    if (data && data.length > 0) {
      console.log(`🎯 Reset ${data.length} profiles:`)
      data.forEach(result => {
        console.log(`  - ${result.display_name}: ${result.products_deleted} products, ${result.listings_deleted} listings, ${result.gallery_items_deleted} gallery items`)
      })
    } else {
      console.log('ℹ️ No profiles needed reset')
    }
    
  } catch (error) {
    console.error('❌ Fatal error:', error)
  }
}

// Run the test
testReset()