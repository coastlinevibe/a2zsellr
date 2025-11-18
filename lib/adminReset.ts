import { createClient } from '@supabase/supabase-js'

// Use anon key for client-side operations
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
 * Calls the API endpoint to reset all free tier users
 * Use with caution - this action cannot be undone!
 */
export async function adminResetAllFreeUsers(): Promise<AdminResetResult> {
  try {
    console.log('🚨 ADMIN RESET INITIATED - Calling API endpoint...')

    const response = await fetch('/api/admin/reset-free-users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || 'Reset failed')
    }

    return result
  } catch (error) {
    console.error('❌ ADMIN RESET FAILED:', error)
    return {
      success: false,
      message: `Admin reset failed: ${error instanceof Error ? error.message : String(error)}`,
      data: {
        usersReset: 0,
        totalProductsDeleted: 0,
        totalListingsDeleted: 0,
        totalGalleryDeleted: 0,
        resetTime: new Date().toISOString(),
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
