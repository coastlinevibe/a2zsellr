/**
 * Cleanup Script for Duplicate Profiles
 * 
 * This script helps clean up profiles that were created without proper auth users.
 * Run this to delete profiles that don't have matching auth users.
 * 
 * Usage: node cleanup-duplicate-profiles.js
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function cleanupDuplicateProfiles() {
  console.log('🔍 Starting cleanup of duplicate profiles...\n')

  try {
    // Step 1: Get all profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, display_name, email, created_at')
      .order('created_at', { ascending: false })

    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError)
      return
    }

    console.log(`📊 Found ${profiles.length} total profiles\n`)

    // Step 2: Check which profiles have matching auth users
    const profilesWithoutAuth = []
    const profilesWithAuth = []

    for (const profile of profiles) {
      try {
        const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(profile.id)
        
        if (authError || !authUser.user) {
          profilesWithoutAuth.push(profile)
          console.log(`❌ No auth user for: ${profile.display_name} (${profile.email})`)
        } else {
          profilesWithAuth.push(profile)
          console.log(`✅ Has auth user: ${profile.display_name} (${profile.email})`)
        }
      } catch (err) {
        profilesWithoutAuth.push(profile)
        console.log(`❌ No auth user for: ${profile.display_name} (${profile.email})`)
      }
    }

    console.log(`\n📊 Summary:`)
    console.log(`   ✅ Profiles with auth: ${profilesWithAuth.length}`)
    console.log(`   ❌ Profiles without auth: ${profilesWithoutAuth.length}\n`)

    if (profilesWithoutAuth.length === 0) {
      console.log('✅ No cleanup needed - all profiles have matching auth users!')
      return
    }

    // Step 3: Ask for confirmation
    console.log('⚠️  The following profiles will be DELETED:\n')
    profilesWithoutAuth.forEach(p => {
      console.log(`   - ${p.display_name} (${p.email}) - Created: ${new Date(p.created_at).toLocaleString()}`)
    })

    console.log('\n⚠️  This will also delete:')
    console.log('   - All products associated with these profiles')
    console.log('   - All gallery images')
    console.log('   - All listings')
    console.log('   - All orders and order items\n')

    // In Node.js, we need to use readline for user input
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    })

    readline.question('Type "DELETE" to confirm deletion: ', async (answer) => {
      if (answer !== 'DELETE') {
        console.log('\n❌ Cleanup cancelled')
        readline.close()
        return
      }

      console.log('\n🗑️  Deleting profiles without auth users...\n')

      let deletedCount = 0
      let errorCount = 0

      for (const profile of profilesWithoutAuth) {
        try {
          // Delete products first (due to foreign key constraints)
          const { error: productsError } = await supabase
            .from('profile_products')
            .delete()
            .eq('profile_id', profile.id)

          if (productsError) {
            console.log(`⚠️  Warning: Could not delete products for ${profile.display_name}:`, productsError.message)
          }

          // Delete gallery items
          const { error: galleryError } = await supabase
            .from('profile_gallery')
            .delete()
            .eq('profile_id', profile.id)

          if (galleryError) {
            console.log(`⚠️  Warning: Could not delete gallery for ${profile.display_name}:`, galleryError.message)
          }

          // Delete listings
          const { error: listingsError } = await supabase
            .from('profile_listings')
            .delete()
            .eq('profile_id', profile.id)

          if (listingsError) {
            console.log(`⚠️  Warning: Could not delete listings for ${profile.display_name}:`, listingsError.message)
          }

          // Delete the profile
          const { error: profileError } = await supabase
            .from('profiles')
            .delete()
            .eq('id', profile.id)

          if (profileError) {
            console.log(`❌ Failed to delete profile ${profile.display_name}:`, profileError.message)
            errorCount++
          } else {
            console.log(`✅ Deleted: ${profile.display_name}`)
            deletedCount++
          }
        } catch (err) {
          console.log(`❌ Error deleting ${profile.display_name}:`, err.message)
          errorCount++
        }
      }

      console.log(`\n✅ Cleanup complete!`)
      console.log(`   Deleted: ${deletedCount} profiles`)
      console.log(`   Errors: ${errorCount}`)
      console.log(`\n💡 You can now re-upload your CSV file with the fixed bulk upload system.`)
      
      readline.close()
    })

  } catch (error) {
    console.error('❌ Cleanup error:', error)
  }
}

cleanupDuplicateProfiles()
