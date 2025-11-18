import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const getSupabaseAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceKey) {
    throw new Error('Supabase credentials are not configured')
  }

  return createClient(supabaseUrl, serviceKey)
}

export async function POST(request: NextRequest) {
  try {
    const adminClient = getSupabaseAdminClient()
    const resetTime = new Date().toISOString()

    console.log('🚨 ADMIN RESET INITIATED - Resetting all free tier users...')
    console.log(`⏰ Reset time: ${resetTime}`)

    // Step 1: Get all free tier users
    const { data: freeUsers, error: usersError } = await adminClient
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
        adminClient.from('profile_products').select('id', { count: 'exact' }).eq('profile_id', user.id),
        adminClient.from('profile_listings').select('id', { count: 'exact' }).eq('profile_id', user.id),
        adminClient.from('profile_gallery').select('id', { count: 'exact' }).eq('profile_id', user.id)
      ])

      const productsToDelete = productsCount.count || 0
      const listingsToDelete = listingsCount.count || 0
      const galleryToDelete = galleryCount.count || 0

      // Delete all items for this user
      await Promise.all([
        adminClient.from('profile_products').delete().eq('profile_id', user.id),
        adminClient.from('profile_listings').delete().eq('profile_id', user.id),
        adminClient.from('profile_gallery').delete().eq('profile_id', user.id),
        adminClient.from('profile_analytics').delete().eq('profile_id', user.id)
      ])

      // Update profile tracking and reset view count
      await adminClient
        .from('profiles')
        .update({
          current_listings: 0,
          profile_views: 0,
          last_view_reset: resetTime,
          last_free_reset: resetTime,
          last_reset_at: resetTime
        })
        .eq('id', user.id)

      // Log to reset history
      await adminClient
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

    return NextResponse.json({
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
    })

  } catch (error) {
    console.error('❌ ADMIN RESET FAILED:', error)
    return NextResponse.json(
      {
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
      },
      { status: 500 }
    )
  }
}
