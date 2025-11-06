// Script to fix RLS policies for profiles
// Run this with: node scripts/fix-profile-rls.js

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixProfileRLS() {
  try {
    console.log('🔧 Fixing profile RLS policies...')

    // Read the RLS fix SQL
    const rlsFixPath = path.join(__dirname, '..', 'supabase', 'migrations', 'fix_profile_rls.sql')
    const rlsFixSQL = fs.readFileSync(rlsFixPath, 'utf8')

    // Split into individual statements and execute them
    const statements = rlsFixSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))

    for (const statement of statements) {
      console.log(`📝 Executing: ${statement.substring(0, 50)}...`)
      
      const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' })
      
      if (error) {
        console.error('❌ Statement failed:', error)
        console.log('Statement was:', statement)
      } else {
        console.log('✅ Statement executed successfully')
      }
    }

    console.log('🎉 RLS policies updated!')

    // Test profile access
    console.log('🧪 Testing profile access...')
    
    const { data: profiles, error: testError } = await supabase
      .from('profiles')
      .select('id, display_name, subscription_tier')
      .limit(5)

    if (testError) {
      console.error('❌ Profile access test failed:', testError)
    } else {
      console.log(`✅ Profile access test passed! Found ${profiles.length} profiles`)
      profiles.forEach(profile => {
        console.log(`   📝 ${profile.display_name} (${profile.subscription_tier})`)
      })
    }

  } catch (error) {
    console.error('💥 Script failed:', error)
  }
}

console.log('🚀 Starting RLS fix...')
fixProfileRLS()
  .then(() => {
    console.log('✅ RLS fix completed!')
    process.exit(0)
  })
  .catch(error => {
    console.error('💥 RLS fix failed:', error)
    process.exit(1)
  })
