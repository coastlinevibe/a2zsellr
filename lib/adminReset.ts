import { createClient } from '@supabase/supabase-js'

// Use your existing Supabase client
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dcfgdlwhixdruyewywly.supabase.co'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjZmdkbHdoaXhkcnV5ZXd5d2x5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MjU1NjYsImV4cCI6MjA3NjEwMTU2Nn0.wMGq2FpoVFMnLemUP13763iodoXNu-gx8I0rRpTubG4'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export interface AdminResetResult {
  success: boolean
  message: string
  data: {
    usersReset: number
    totalProductsDeleted: number
    totalListingsDeleted: number
    totalGalleryDeleted: number
    resetTime: string
    userDetails: Array<{
      id: string
      name: string
      productsDeleted: number
      listingsDeleted: number
      galleryDeleted: number
    }>
  }
}

/**
 * ADMIN RESET FUNCTION
 * Instantly deletes all products, listings, and gallery items for ALL free tier users
 * Use with caution - this action cannot be undone!
 */
export async function adminResetAllFreeUsers(): Promise<AdminResetResult> {
  const resetTime = new Date().toISOString()
  
  try {
    console.log('🚨 ADMIN RESET INITIATED - Resetting all free tier users...')
    console.log(`⏰ Reset time: ${resetTime}`)

    // Step 1: Get all free tier users
    const { data: freeUsers, error: usersError } = await supabase
      .from('profiles')
      .select('id, display_name')
      .eq('subscription_tier', 'free')

    if (usersError || !freeUsers) {
      throw new Error(`Failed to fetch free users: ${usersError?.message}`)
    }

    console.log(`👥 Found ${freeUsers.length} free tier users`)

    let totalProductsDeleted = 0
    let totalListingsDeleted = 0
    let totalGalleryDeleted = 0
    const userDetails: Array<{
      id: string
      name: string
      productsDeleted: number
      listingsDeleted: number
      galleryDeleted: number
    }> = []

    // Step 2: Process each user
    for (const user of freeUsers) {
      console.log(`🔄 Processing: ${user.display_name}`)

      // Count items before deletion
      const [productsCount, listingsCount, galleryCount] = await Promise.all([
        supabase.from('profile_products').select('id', { count: 'exact' }).eq('profile_id', user.id),
        supabase.from('profile_listings').select('id', { count: 'exact' }).eq('profile_id', user.id),
        supabase.from('profile_gallery').select('id', { count: 'exact' }).eq('profile_id', user.id)
      ])

      const productsToDelete = productsCount.count || 0
      const listingsToDelete = listingsCount.count || 0
      const galleryToDelete = galleryCount.count || 0

      // Delete all items for this user
      await Promise.all([
        supabase.from('profile_products').delete().eq('profile_id', user.id),
        supabase.from('profile_listings').delete().eq('profile_id', user.id),
        supabase.from('profile_gallery').delete().eq('profile_id', user.id)
      ])

      // Update profile tracking
      await supabase
        .from('profiles')
        .update({
          current_listings: 0,
          last_free_reset: resetTime,
          last_reset_at: resetTime
        })
        .eq('id', user.id)

      // Log to reset history
      await supabase
        .from('reset_history')
        .insert({
          profile_id: user.id,
          reset_date: resetTime,
          products_deleted: productsToDelete,
          listings_deleted: listingsToDelete,
          gallery_items_deleted: galleryToDelete,
          subscription_tier: 'free'
        })

      // Track totals
      totalProductsDeleted += productsToDelete
      totalListingsDeleted += listingsToDelete
      totalGalleryDeleted += galleryToDelete

      userDetails.push({
        id: user.id,
        name: user.display_name,
        productsDeleted: productsToDelete,
        listingsDeleted: listingsToDelete,
        galleryDeleted: galleryToDelete
      })

      console.log(`   ✅ ${user.display_name}: ${productsToDelete} products, ${listingsToDelete} listings, ${galleryToDelete} gallery items deleted`)
    }

    const successMessage = `🎯 ADMIN RESET COMPLETED! ${freeUsers.length} users reset successfully`
    console.log(successMessage)
    console.log(`📊 Total deleted: ${totalProductsDeleted} products, ${totalListingsDeleted} listings, ${totalGalleryDeleted} gallery items`)

    return {
      success: true,
      message: successMessage,
      data: {
        usersReset: freeUsers.length,
        totalProductsDeleted,
        totalListingsDeleted,
        totalGalleryDeleted,
        resetTime,
        userDetails
      }
    }

  } catch (error) {
    console.error('❌ ADMIN RESET FAILED:', error)
    return {
      success: false,
      message: `Admin reset failed: ${error}`,
      data: {
        usersReset: 0,
        totalProductsDeleted: 0,
        totalListingsDeleted: 0,
        totalGalleryDeleted: 0,
        resetTime,
        userDetails: []
      }
    }
  }
}

/**
 * Get preview of what will be reset (without actually resetting)
 */
export async function previewReset() {
  try {
    const { data: freeUsers, error } = await supabase
      .from('profiles')
      .select('id, display_name, current_listings, created_at')
      .eq('subscription_tier', 'free')

    if (error || !freeUsers) {
      throw new Error(`Failed to fetch users: ${error?.message}`)
    }

    let totalProducts = 0
    let totalListings = 0
    let totalGallery = 0

    const preview = []

    for (const user of freeUsers) {
      const [productsCount, listingsCount, galleryCount] = await Promise.all([
        supabase.from('profile_products').select('id', { count: 'exact' }).eq('profile_id', user.id),
        supabase.from('profile_listings').select('id', { count: 'exact' }).eq('profile_id', user.id),
        supabase.from('profile_gallery').select('id', { count: 'exact' }).eq('profile_id', user.id)
      ])

      const products = productsCount.count || 0
      const listings = listingsCount.count || 0
      const gallery = galleryCount.count || 0

      totalProducts += products
      totalListings += listings
      totalGallery += gallery

      preview.push({
        name: user.display_name,
        products,
        listings,
        gallery,
        total: products + listings + gallery
      })
    }

    return {
      success: true,
      totalUsers: freeUsers.length,
      totalProducts,
      totalListings,
      totalGallery,
      totalItems: totalProducts + totalListings + totalGallery,
      userBreakdown: preview
    }

  } catch (error) {
    return {
      success: false,
      error: String(error)
    }
  }
}

/**
 * Quick status check
 */
export async function getResetStatus() {
  try {
    const { data: lastReset } = await supabase
      .from('reset_history')
      .select('reset_date, products_deleted, listings_deleted, gallery_items_deleted')
      .order('reset_date', { ascending: false })
      .limit(1)
      .single()

    const { data: freeUsers } = await supabase
      .from('profiles')
      .select('id', { count: 'exact' })
      .eq('subscription_tier', 'free')

    return {
      success: true,
      totalFreeUsers: freeUsers?.length || 0,
      lastResetDate: lastReset?.reset_date || 'Never',
      lastResetStats: lastReset ? {
        products: lastReset.products_deleted,
        listings: lastReset.listings_deleted,
        gallery: lastReset.gallery_items_deleted
      } : null
    }

  } catch (error) {
    return {
      success: false,
      error: String(error)
    }
  }
}
