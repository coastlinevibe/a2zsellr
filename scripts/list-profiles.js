const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl)
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function listProfiles() {
  try {
    console.log('🔍 Fetching all profiles from the database...\n')
    
    const { data, error, count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Error fetching profiles:', error)
      return
    }

    console.log(`📊 Total profiles found: ${count}\n`)

    if (!data || data.length === 0) {
      console.log('📭 No profiles found in the database')
      return
    }

    console.log('👥 PROFILES LIST:')
    console.log('=' .repeat(80))

    data.forEach((profile, index) => {
      console.log(`\n${index + 1}. Profile ID: ${profile.id}`)
      console.log(`   Display Name: ${profile.display_name || 'Not set'}`)
      console.log(`   Email: ${profile.email || 'Not set'}`)
      console.log(`   Bio: ${profile.bio || 'Not set'}`)
      console.log(`   Avatar URL: ${profile.avatar_url || 'Not set'}`)
      console.log(`   Phone: ${profile.phone_number || 'Not set'}`)
      console.log(`   Website: ${profile.website_url || 'Not set'}`)
      console.log(`   Business Category: ${profile.business_category || 'Not set'}`)
      console.log(`   Business Location: ${profile.business_location || 'Not set'}`)
      console.log(`   Business Hours: ${profile.business_hours || 'Not set'}`)
      console.log(`   Subscription Tier: ${profile.subscription_tier || 'free'}`)
      console.log(`   Subscription Status: ${profile.subscription_status || 'Not set'}`)
      console.log(`   Verified Seller: ${profile.verified_seller ? 'Yes' : 'No'}`)
      console.log(`   Early Adopter: ${profile.early_adopter ? 'Yes' : 'No'}`)
      console.log(`   Active: ${profile.is_active ? 'Yes' : 'No'}`)
      console.log(`   Current Listings: ${profile.current_listings || 0}`)
      console.log(`   Created: ${new Date(profile.created_at).toLocaleString()}`)
      console.log(`   Updated: ${new Date(profile.updated_at).toLocaleString()}`)
      console.log('-'.repeat(40))
    })

    // Summary statistics
    console.log('\n📈 SUMMARY STATISTICS:')
    console.log('=' .repeat(40))
    console.log(`Total Profiles: ${data.length}`)
    console.log(`Active Profiles: ${data.filter(p => p.is_active).length}`)
    console.log(`Verified Sellers: ${data.filter(p => p.verified_seller).length}`)
    console.log(`Early Adopters: ${data.filter(p => p.early_adopter).length}`)
    
    const tierCounts = data.reduce((acc, p) => {
      const tier = p.subscription_tier || 'free'
      acc[tier] = (acc[tier] || 0) + 1
      return acc
    }, {})
    
    console.log('\nSubscription Tiers:')
    Object.entries(tierCounts).forEach(([tier, count]) => {
      console.log(`  ${tier}: ${count}`)
    })

    const categoryCounts = data.reduce((acc, p) => {
      const category = p.business_category || 'Not set'
      acc[category] = (acc[category] || 0) + 1
      return acc
    }, {})
    
    console.log('\nBusiness Categories:')
    Object.entries(categoryCounts).forEach(([category, count]) => {
      console.log(`  ${category}: ${count}`)
    })

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

// Run the script
listProfiles()
