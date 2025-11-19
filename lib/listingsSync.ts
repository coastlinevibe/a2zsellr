import { supabase } from './supabaseClient'

/**
 * Manually sync current_listings count for a specific user
 */
export async function syncUserListingsCount(userId: string): Promise<boolean> {
  try {
    // Get actual count from profile_listings table
    const { count, error: countError } = await supabase
      .from('profile_listings')
      .select('*', { count: 'exact', head: true })
      .eq('profile_id', userId)

    if (countError) {
      console.error('Error counting listings:', countError)
      return false
    }

    // Update the profiles table with correct count
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        current_listings: count || 0,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (updateError) {
      console.error('Error updating current_listings:', updateError)
      return false
    }

    console.log(`✅ Synced listings count for user ${userId}: ${count} listings`)
    return true
  } catch (error) {
    console.error('Error syncing listings count:', error)
    return false
  }
}

/**
 * Sync current_listings count for all users
 */
export async function syncAllListingsCounts(): Promise<{ success: number; failed: number }> {
  try {
    // Get all profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id')

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError)
      return { success: 0, failed: 0 }
    }

    let success = 0
    let failed = 0

    // Sync each profile
    for (const profile of profiles || []) {
      const synced = await syncUserListingsCount(profile.id)
      if (synced) {
        success++
      } else {
        failed++
      }
    }

    console.log(`✅ Sync completed: ${success} success, ${failed} failed`)
    return { success, failed }
  } catch (error) {
    console.error('Error syncing all listings counts:', error)
    return { success: 0, failed: 0 }
  }
}

/**
 * Get current listings count for a user (from database)
 */
export async function getUserListingsCount(userId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('profile_listings')
      .select('*', { count: 'exact', head: true })
      .eq('profile_id', userId)

    if (error) {
      console.error('Error getting listings count:', error)
      return 0
    }

    return count || 0
  } catch (error) {
    console.error('Error getting listings count:', error)
    return 0
  }
}

/**
 * Check if current_listings is accurate for a user
 */
export async function checkListingsCountAccuracy(userId: string): Promise<{
  profileCount: number
  actualCount: number
  isAccurate: boolean
}> {
  try {
    // Get count from profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('current_listings')
      .eq('id', userId)
      .single()

    if (profileError) {
      console.error('Error fetching profile:', profileError)
      return { profileCount: 0, actualCount: 0, isAccurate: false }
    }

    // Get actual count from profile_listings table
    const actualCount = await getUserListingsCount(userId)
    const profileCount = profile.current_listings || 0

    return {
      profileCount,
      actualCount,
      isAccurate: profileCount === actualCount
    }
  } catch (error) {
    console.error('Error checking listings count accuracy:', error)
    return { profileCount: 0, actualCount: 0, isAccurate: false }
  }
}