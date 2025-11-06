// Script to fix missing profiles for authenticated users
// Run this with: node scripts/fix-missing-profiles.js

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local')
  process.exit(1)
}

// Create Supabase client with service role key (bypasses RLS)
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixMissingProfiles() {
  try {
    console.log('🔍 Checking for users missing profiles...')

    // Read and execute the migration SQL
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', 'fix_missing_profiles.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')

    console.log('📝 Executing migration...')
    
    // Execute the migration
    const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL })
    
    if (error) {
      console.error('❌ Migration failed:', error)
      return
    }

    console.log('✅ Migration executed successfully!')

    // Verify the fix by checking counts
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
    const { count: profileCount, error: profileError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    if (authError || profileError) {
      console.error('❌ Error checking counts:', authError || profileError)
      return
    }

    console.log(`📊 Results:`)
    console.log(`   Auth Users: ${authUsers.users.length}`)
    console.log(`   Profiles: ${profileCount}`)

    if (authUsers.users.length === profileCount) {
      console.log('✅ All users now have profiles!')
    } else {
      console.log('⚠️  Some users may still be missing profiles')
    }

  } catch (error) {
    console.error('❌ Script failed:', error)
  }
}

// Alternative approach: Direct profile creation
async function createMissingProfilesDirect() {
  try {
    console.log('🔍 Finding users without profiles...')

    // Get all auth users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
    if (authError) {
      console.error('❌ Failed to fetch auth users:', authError)
      return
    }

    // Get existing profiles
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id')
    
    if (profileError) {
      console.error('❌ Failed to fetch profiles:', profileError)
      return
    }

    const existingProfileIds = new Set(profiles.map(p => p.id))
    const missingUsers = authUsers.users.filter(user => !existingProfileIds.has(user.id))

    console.log(`📊 Found ${missingUsers.length} users without profiles`)

    if (missingUsers.length === 0) {
      console.log('✅ All users already have profiles!')
      return
    }

    // Create missing profiles
    const newProfiles = missingUsers.map(user => ({
      id: user.id,
      display_name: user.user_metadata?.display_name || user.email?.split('@')[0] || 'User',
      subscription_tier: user.user_metadata?.selected_plan || 'free',
      created_at: user.created_at,
      updated_at: new Date().toISOString()
    }))

    const { error: insertError } = await supabase
      .from('profiles')
      .insert(newProfiles)

    if (insertError) {
      console.error('❌ Failed to create profiles:', insertError)
      return
    }

    console.log(`✅ Created ${newProfiles.length} missing profiles!`)

    // Show the created profiles
    newProfiles.forEach(profile => {
      console.log(`   📝 ${profile.display_name} (${profile.subscription_tier})`)
    })

  } catch (error) {
    console.error('❌ Script failed:', error)
  }
}

// Run the fix
console.log('🚀 Starting profile fix...')
createMissingProfilesDirect()
  .then(() => {
    console.log('🎉 Profile fix completed!')
    process.exit(0)
  })
  .catch(error => {
    console.error('💥 Profile fix failed:', error)
    process.exit(1)
  })
