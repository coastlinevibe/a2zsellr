import { createClient } from '@supabase/supabase-js'

// Use your existing Supabase client or create one
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dcfgdlwhixdruyewywly.supabase.co'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjZmdkbHdoaXhkcnV5ZXd5d2x5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MjU1NjYsImV4cCI6MjA3NjEwMTU2Nn0.wMGq2FpoVFMnLemUP13763iodoXNu-gx8I0rRpTubG4'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export interface ResetResult {
  success: boolean
  message: string
  data?: {
    profilesReset: number
    totalProductsDeleted: number
    totalListingsDeleted: number
    totalGalleryDeleted: number
    errors: string[]
  }
}

// Manual reset function for specific user
export async function resetSingleUser(profileId: string): Promise<ResetResult> {
  try {
    console.log(`🔄 Starting reset for profile: ${profileId}`)

    // Get user info first
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('display_name, subscription_tier, current_listings')
      .eq('id', profileId)
      .eq('subscription_tier', 'free')
      .single()

    if (profileError || !profile) {
      return {
        success: false,
        message: `Profile not found or not on free tier: ${profileError?.message}`
      }
    }

    // Count items before deletion
    const [productsCount, listingsCount, galleryCount] = await Promise.all([
      supabase.from('profile_products').select('id', { count: 'exact' }).eq('profile_id', profileId),
      supabase.from('profile_listings').select('id', { count: 'exact' }).eq('profile_id', profileId),
      supabase.from('profile_gallery').select('id', { count: 'exact' }).eq('profile_id', profileId)
    ])

    const productsToDelete = productsCount.count || 0
    const listingsToDelete = listingsCount.count || 0
    const galleryToDelete = galleryCount.count || 0

    // Delete products, listings, gallery items, and analytics
    const [productsResult, listingsResult, galleryResult, analyticsResult] = await Promise.all([
      supabase.from('profile_products').delete().eq('profile_id', profileId),
      supabase.from('profile_listings').delete().eq('profile_id', profileId),
      supabase.from('profile_gallery').delete().eq('profile_id', profileId),
      supabase.from('profile_analytics').delete().eq('profile_id', profileId)
    ])

    const errors: string[] = []
    if (productsResult.error) errors.push(`Products: ${productsResult.error.message}`)
    if (listingsResult.error) errors.push(`Listings: ${listingsResult.error.message}`)
    if (galleryResult.error) errors.push(`Gallery: ${galleryResult.error.message}`)
    if (analyticsResult.error) errors.push(`Analytics: ${analyticsResult.error.message}`)

    // Update profile reset tracking and reset view count
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        current_listings: 0,
        profile_views: 0,
        last_view_reset: new Date().toISOString(),
        last_free_reset: new Date().toISOString(),
        last_reset_at: new Date().toISOString()
      })
      .eq('id', profileId)

    if (updateError) errors.push(`Profile update: ${updateError.message}`)

    // Log to reset history
    const { error: historyError } = await supabase
      .from('reset_history')
      .insert({
        profile_id: profileId,
        reset_date: new Date().toISOString(),
        products_deleted: productsToDelete,
        listings_deleted: listingsToDelete,
        gallery_items_deleted: galleryToDelete,
        subscription_tier: 'free'
      })

    if (historyError) errors.push(`History log: ${historyError.message}`)

    console.log(`✅ Reset completed for ${profile.display_name}`)
    console.log(`   Products deleted: ${productsToDelete}`)
    console.log(`   Listings deleted: ${listingsToDelete}`)
    console.log(`   Gallery items deleted: ${galleryToDelete}`)

    return {
      success: errors.length === 0,
      message: errors.length === 0 
        ? `Successfully reset ${profile.display_name}` 
        : `Reset completed with errors: ${errors.join(', ')}`,
      data: {
        profilesReset: 1,
        totalProductsDeleted: productsToDelete,
        totalListingsDeleted: listingsToDelete,
        totalGalleryDeleted: galleryToDelete,
        errors
      }
    }

  } catch (error) {
    console.error('❌ Reset failed:', error)
    return {
      success: false,
      message: `Reset failed: ${error}`
    }
  }
}

// Bulk reset for all free users
export async function resetAllFreeUsers(): Promise<ResetResult> {
  try {
    console.log('🚀 Starting bulk reset for all free tier users...')

    // Get all free tier users
    const { data: freeUsers, error: usersError } = await supabase
      .from('profiles')
      .select('id, display_name')
      .eq('subscription_tier', 'free')

    if (usersError || !freeUsers) {
      return {
        success: false,
        message: `Failed to fetch free users: ${usersError?.message}`
      }
    }

    console.log(`📋 Found ${freeUsers.length} free tier users to reset`)

    let totalProductsDeleted = 0
    let totalListingsDeleted = 0
    let totalGalleryDeleted = 0
    let profilesReset = 0
    const errors: string[] = []

    // Reset each user
    for (const user of freeUsers) {
      const result = await resetSingleUser(user.id)
      
      if (result.success && result.data) {
        profilesReset++
        totalProductsDeleted += result.data.totalProductsDeleted
        totalListingsDeleted += result.data.totalListingsDeleted
        totalGalleryDeleted += result.data.totalGalleryDeleted
      } else {
        errors.push(`${user.display_name}: ${result.message}`)
      }

      // Small delay to avoid overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    const message = `Bulk reset completed: ${profilesReset}/${freeUsers.length} users reset successfully`
    console.log(`✅ ${message}`)

    return {
      success: errors.length === 0,
      message: errors.length === 0 ? message : `${message}. Errors: ${errors.join('; ')}`,
      data: {
        profilesReset,
        totalProductsDeleted,
        totalListingsDeleted,
        totalGalleryDeleted,
        errors
      }
    }

  } catch (error) {
    console.error('❌ Bulk reset failed:', error)
    return {
      success: false,
      message: `Bulk reset failed: ${error}`
    }
  }
}

// Get users eligible for reset (based on last reset date)
export async function getUsersEligibleForReset(daysSinceLastReset: number = 7) {
  try {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysSinceLastReset)

    const { data: users, error } = await supabase
      .from('profiles')
      .select('id, display_name, last_free_reset, created_at')
      .eq('subscription_tier', 'free')
      .or(`last_free_reset.is.null,last_free_reset.lt.${cutoffDate.toISOString()}`)

    if (error) {
      console.error('Error fetching eligible users:', error)
      return { success: false, users: [], error: error.message }
    }

    return { success: true, users: users || [], error: null }
  } catch (error) {
    console.error('Error in getUsersEligibleForReset:', error)
    return { success: false, users: [], error: String(error) }
  }
}

// Reset users who haven't been reset in X days
export async function resetEligibleUsers(daysSinceLastReset: number = 7): Promise<ResetResult> {
  try {
    const eligibleResult = await getUsersEligibleForReset(daysSinceLastReset)
    
    if (!eligibleResult.success) {
      return {
        success: false,
        message: `Failed to get eligible users: ${eligibleResult.error}`
      }
    }

    if (eligibleResult.users.length === 0) {
      return {
        success: true,
        message: 'No users eligible for reset',
        data: {
          profilesReset: 0,
          totalProductsDeleted: 0,
          totalListingsDeleted: 0,
          totalGalleryDeleted: 0,
          errors: []
        }
      }
    }

    console.log(`🎯 Found ${eligibleResult.users.length} users eligible for reset`)

    let totalProductsDeleted = 0
    let totalListingsDeleted = 0
    let totalGalleryDeleted = 0
    let profilesReset = 0
    const errors: string[] = []

    for (const user of eligibleResult.users) {
      const result = await resetSingleUser(user.id)
      
      if (result.success && result.data) {
        profilesReset++
        totalProductsDeleted += result.data.totalProductsDeleted
        totalListingsDeleted += result.data.totalListingsDeleted
        totalGalleryDeleted += result.data.totalGalleryDeleted
      } else {
        errors.push(`${user.display_name}: ${result.message}`)
      }

      await new Promise(resolve => setTimeout(resolve, 100))
    }

    return {
      success: errors.length === 0,
      message: `Reset ${profilesReset}/${eligibleResult.users.length} eligible users`,
      data: {
        profilesReset,
        totalProductsDeleted,
        totalListingsDeleted,
        totalGalleryDeleted,
        errors
      }
    }

  } catch (error) {
    return {
      success: false,
      message: `Reset eligible users failed: ${error}`
    }
  }
}
