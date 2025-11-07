// Debug script to check profile_products table structure and data
import { supabase } from './lib/supabaseClient.js'

async function debugProducts() {
  console.log('🔍 Debugging profile_products table...')
  
  try {
    // 1. Check table structure by fetching one record
    console.log('\n1. Checking table structure...')
    const { data: sample, error: sampleError } = await supabase
      .from('profile_products')
      .select('*')
      .limit(1)
    
    if (sampleError) {
      console.error('❌ Error fetching sample:', sampleError)
      return
    }
    
    if (sample && sample.length > 0) {
      console.log('✅ Sample record structure:', Object.keys(sample[0]))
      console.log('📄 Sample data:', sample[0])
    } else {
      console.log('⚠️ No records found in profile_products table')
    }
    
    // 2. Count total records
    console.log('\n2. Counting total records...')
    const { count, error: countError } = await supabase
      .from('profile_products')
      .select('*', { count: 'exact', head: true })
    
    if (countError) {
      console.error('❌ Error counting records:', countError)
    } else {
      console.log(`✅ Total records in profile_products: ${count}`)
    }
    
    // 3. Check active products
    console.log('\n3. Checking active products...')
    const { data: activeProducts, error: activeError } = await supabase
      .from('profile_products')
      .select('id, name, profile_id, is_active, created_at')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    
    if (activeError) {
      console.error('❌ Error fetching active products:', activeError)
    } else {
      console.log(`✅ Active products found: ${activeProducts?.length || 0}`)
      if (activeProducts && activeProducts.length > 0) {
        console.log('📋 Active products:', activeProducts.map(p => ({
          id: p.id,
          name: p.name,
          profile_id: p.profile_id
        })))
      }
    }
    
    // 4. Check for specific profile_id (you'll need to replace this)
    console.log('\n4. Checking products for specific profile...')
    // Get the first profile_id from active products
    if (activeProducts && activeProducts.length > 0) {
      const testProfileId = activeProducts[0].profile_id
      console.log(`🎯 Testing with profile_id: ${testProfileId}`)
      
      const { data: profileProducts, error: profileError } = await supabase
        .from('profile_products')
        .select('*')
        .eq('profile_id', testProfileId)
        .eq('is_active', true)
      
      if (profileError) {
        console.error('❌ Error fetching profile products:', profileError)
      } else {
        console.log(`✅ Products for profile ${testProfileId}: ${profileProducts?.length || 0}`)
        console.log('📋 Profile products:', profileProducts)
      }
    }
    
  } catch (error) {
    console.error('💥 Unexpected error:', error)
  }
}

// Run the debug function
debugProducts()
