import { supabase } from './supabaseClient'

export interface TrialStatus {
  isExpired: boolean
  timeRemaining: number // in milliseconds
  trialEndDate: string | null
}

/**
 * Check if a user's trial has expired
 */
export async function checkTrialStatus(userId: string): Promise<TrialStatus> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('trial_end_date, subscription_tier')
      .eq('id', userId)
      .single()

    if (error) {
      throw error
    }

    // Non-free users don't have trials
    if (data.subscription_tier !== 'free') {
      return {
        isExpired: false,
        timeRemaining: 0,
        trialEndDate: null
      }
    }

    const now = new Date()
    const trialEndDate = data.trial_end_date ? new Date(data.trial_end_date) : null

    if (!trialEndDate) {
      // No trial end date set, create one (24 hours from now)
      const newTrialEnd = new Date(now.getTime() + 24 * 60 * 60 * 1000)
      
      await supabase
        .from('profiles')
        .update({ trial_end_date: newTrialEnd.toISOString() })
        .eq('id', userId)

      return {
        isExpired: false,
        timeRemaining: 24 * 60 * 60 * 1000, // 24 hours
        trialEndDate: newTrialEnd.toISOString()
      }
    }

    const timeRemaining = trialEndDate.getTime() - now.getTime()
    const isExpired = timeRemaining <= 0

    return {
      isExpired,
      timeRemaining: Math.max(0, timeRemaining),
      trialEndDate: data.trial_end_date
    }
  } catch (error) {
    console.error('Error checking trial status:', error)
    return {
      isExpired: false,
      timeRemaining: 0,
      trialEndDate: null
    }
  }
}

/**
 * Renew trial for a free user (extends by 24 hours)
 */
export async function renewTrial(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', userId)
      .single()

    if (error || data.subscription_tier !== 'free') {
      return false
    }

    const newTrialEnd = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        trial_end_date: newTrialEnd.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    return !updateError
  } catch (error) {
    console.error('Error renewing trial:', error)
    return false
  }
}

/**
 * Get all expired free users
 */
export async function getExpiredFreeUsers() {
  try {
    const now = new Date().toISOString()
    
    const { data, error } = await supabase
      .from('profiles')
      .select('id, display_name, email, trial_end_date')
      .eq('subscription_tier', 'free')
      .lt('trial_end_date', now)

    if (error) {
      throw error
    }

    return data || []
  } catch (error) {
    console.error('Error getting expired free users:', error)
    return []
  }
}

/**
 * Reset user data when trial expires
 */
export async function resetUserData(userId: string): Promise<boolean> {
  try {
    console.log(`🔄 Starting reset for user: ${userId}`)

    // First, count items before deletion for logging
    const [productsCount, listingsCount, galleryCount] = await Promise.all([
      supabase.from('profile_products').select('id', { count: 'exact' }).eq('profile_id', userId),
      supabase.from('profile_listings').select('id', { count: 'exact' }).eq('profile_id', userId),
      supabase.from('profile_gallery').select('id', { count: 'exact' }).eq('profile_id', userId)
    ])

    const productsToDelete = productsCount.count || 0
    const listingsToDelete = listingsCount.count || 0
    const galleryToDelete = galleryCount.count || 0

    console.log(`📊 Items to delete: ${productsToDelete} products, ${listingsToDelete} listings, ${galleryToDelete} gallery items`)

    // Delete all user content (but preserve profile)
    console.log('🗑️ Deleting products...')
    const productsResult = await supabase.from('profile_products').delete().eq('profile_id', userId)
    
    console.log('🗑️ Deleting listings...')
    const listingsResult = await supabase.from('profile_listings').delete().eq('profile_id', userId)
    
    console.log('🗑️ Deleting gallery...')
    const galleryResult = await supabase.from('profile_gallery').delete().eq('profile_id', userId)
    
    console.log('🗑️ Deleting analytics...')
    const analyticsResult = await supabase.from('profile_analytics').delete().eq('profile_id', userId)

    // Check for errors
    const errors = []
    if (productsResult.error) {
      console.error('❌ Products deletion error:', productsResult.error)
      errors.push(`Products: ${productsResult.error.message}`)
    } else {
      console.log(`✅ Deleted ${productsToDelete} products`)
    }
    
    if (listingsResult.error) {
      console.error('❌ Listings deletion error:', listingsResult.error)
      errors.push(`Listings: ${listingsResult.error.message}`)
    } else {
      console.log(`✅ Deleted ${listingsToDelete} listings`)
    }
    
    if (galleryResult.error) {
      console.error('❌ Gallery deletion error:', galleryResult.error)
      errors.push(`Gallery: ${galleryResult.error.message}`)
    } else {
      console.log(`✅ Deleted ${galleryToDelete} gallery items`)
    }
    
    if (analyticsResult.error) {
      console.error('❌ Analytics deletion error:', analyticsResult.error)
      errors.push(`Analytics: ${analyticsResult.error.message}`)
    } else {
      console.log(`✅ Deleted analytics data`)
    }

    // Extend trial by 24 hours and update last_free_reset timestamp
    console.log('🔄 Extending trial by 24 hours...')
    const now = new Date().toISOString()
    const newTrialEnd = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        trial_end_date: newTrialEnd,
        last_free_reset: now
      })
      .eq('id', userId)

    if (updateError) {
      console.error('❌ Error updating profile trial_end_date:', updateError)
      return false
    } else {
      console.log(`✅ Trial extended to: ${newTrialEnd}`)
      console.log(`✅ Last reset timestamp recorded: ${now}`)
    }

    // Try to log to reset history (optional - table might not exist)
    try {
      await supabase
        .from('reset_history')
        .insert({
          profile_id: userId,
          reset_date: new Date().toISOString(),
          products_deleted: productsToDelete,
          listings_deleted: listingsToDelete,
          gallery_items_deleted: galleryToDelete,
          subscription_tier: 'free'
        })
      console.log('📝 Reset logged to history')
    } catch (historyError) {
      console.warn('⚠️ Could not log reset history (table might not exist):', historyError)
    }

    console.log(`✅ Reset completed: ${productsToDelete} products, ${listingsToDelete} listings, ${galleryToDelete} gallery items deleted`)
    return true
  } catch (error) {
    console.error('❌ Error resetting user data:', error)
    return false
  }
}

/**
 * Format time remaining in a human-readable format
 */
export function formatTimeRemaining(milliseconds: number): string {
  if (milliseconds <= 0) return 'Expired'
  
  const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24))
  const hours = Math.floor((milliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000)
  
  // If more than 20 hours remaining, always show as "1 day"
  if (milliseconds > 20 * 60 * 60 * 1000) {
    return '1 day'
  }
  
  // If less than 20 hours but more than 1 hour, show hours and minutes
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  
  // If less than 1 hour but more than 1 minute, show minutes and seconds
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`
  }
  
  // If less than 1 minute, show just seconds
  return `${seconds}s`
}