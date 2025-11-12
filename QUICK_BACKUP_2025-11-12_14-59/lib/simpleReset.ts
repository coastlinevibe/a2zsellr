import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dcfgdlwhixdruyewywly.supabase.co'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjZmdkbHdoaXhkcnV5ZXd5d2x5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MjU1NjYsImV4cCI6MjA3NjEwMTU2Nn0.wMGq2FpoVFMnLemUP13763iodoXNu-gx8I0rRpTubG4'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

/**
 * SIMPLE BULLETPROOF RESET - NO BULLSHIT
 * Just delete everything for free users
 */
export async function simpleResetAllFreeUsers() {
  console.log('🚨 STARTING SIMPLE RESET - DELETING ALL FREE USER DATA')
  
  try {
    // Step 1: Get all free users
    const { data: freeUsers, error: usersError } = await supabase
      .from('profiles')
      .select('id, display_name')
      .eq('subscription_tier', 'free')

    if (usersError) throw usersError
    if (!freeUsers || freeUsers.length === 0) {
      return { success: true, message: 'No free users found', deletedItems: 0 }
    }

    console.log(`Found ${freeUsers.length} free users to reset`)

    let totalDeleted = 0

    // Step 2: Delete everything for each free user
    for (const user of freeUsers) {
      console.log(`Resetting user: ${user.display_name} (${user.id})`)

      // Delete products
      const { error: productsError } = await supabase
        .from('profile_products')
        .delete()
        .eq('profile_id', user.id)

      if (productsError) {
        console.error(`Error deleting products for ${user.display_name}:`, productsError)
      } else {
        console.log(`✅ Deleted products for ${user.display_name}`)
      }

      // Delete listings
      const { error: listingsError } = await supabase
        .from('profile_listings')
        .delete()
        .eq('profile_id', user.id)

      if (listingsError) {
        console.error(`Error deleting listings for ${user.display_name}:`, listingsError)
      } else {
        console.log(`✅ Deleted listings for ${user.display_name}`)
      }

      // Delete gallery
      const { error: galleryError } = await supabase
        .from('profile_gallery')
        .delete()
        .eq('profile_id', user.id)

      if (galleryError) {
        console.error(`Error deleting gallery for ${user.display_name}:`, galleryError)
      } else {
        console.log(`✅ Deleted gallery for ${user.display_name}`)
      }

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          current_listings: 0,
          last_free_reset: new Date().toISOString()
        })
        .eq('id', user.id)

      if (updateError) {
        console.error(`Error updating profile for ${user.display_name}:`, updateError)
      } else {
        console.log(`✅ Updated profile for ${user.display_name}`)
      }

      totalDeleted++
    }

    console.log(`🎯 RESET COMPLETE! Reset ${totalDeleted} free users`)
    
    return {
      success: true,
      message: `Successfully reset ${totalDeleted} free users`,
      deletedUsers: totalDeleted,
      userNames: freeUsers.map(u => u.display_name)
    }

  } catch (error) {
    console.error('❌ RESET FAILED:', error)
    return {
      success: false,
      message: `Reset failed: ${error}`,
      deletedUsers: 0
    }
  }
}

/**
 * Preview what will be deleted
 */
export async function previewSimpleReset() {
  try {
    const { data: freeUsers, error } = await supabase
      .from('profiles')
      .select('id, display_name')
      .eq('subscription_tier', 'free')

    if (error) throw error

    console.log(`Preview: Found ${freeUsers?.length || 0} free users to reset`)
    
    return {
      success: true,
      totalUsers: freeUsers?.length || 0,
      users: freeUsers?.map(u => u.display_name) || []
    }
  } catch (error) {
    return {
      success: false,
      error: String(error)
    }
  }
}
