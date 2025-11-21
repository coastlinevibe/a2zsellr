import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const slugify = (value: string) =>
  value
    ?.toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const getSupabaseAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !serviceKey) {
    throw new Error('Supabase credentials are not configured')
  }

  return createClient(supabaseUrl, serviceKey)
}

const unique = <T,>(values: T[]): T[] => Array.from(new Set(values.filter(Boolean)))

export async function GET(
  _request: NextRequest,
  { params }: { params: { username: string; campaign: string } }
) {
  try {
    const adminClient = getSupabaseAdminClient()
    const usernameSlug = slugify(params.username)
    const campaignSlug = slugify(params.campaign)

    console.log(`🔍 Searching for listing: username="${params.username}" (${usernameSlug}), campaign="${params.campaign}" (${campaignSlug})`)
    console.log(`🔍 Request URL: ${_request.url}`)
    console.log(`🔍 Params:`, params)

    let foundListing: any = null

    // Step 1: Get all listings (simple query without joins first)
    console.log(`📋 Fetching all listings...`)
    const { data: allListings, error: listingsError } = await adminClient
      .from('profile_listings')
      .select(`
        *, video_url, video_type, menu_images, uploaded_media, selected_products
      `)
      .limit(1000)

    if (listingsError) {
      console.error('Error fetching listings:', listingsError)
      throw listingsError
    }

    console.log(`Found ${allListings?.length || 0} total listings`)

    if (!allListings || allListings.length === 0) {
      return NextResponse.json(
        { error: 'No listings found in database' },
        { status: 404 }
      )
    }

    // Step 2: Get all profiles
    console.log(`👥 Fetching all profiles...`)
    const { data: allProfiles, error: profilesError } = await adminClient
      .from('profiles')
      .select(`
        id, display_name, avatar_url, bio, phone_number, subscription_tier,
        global_video_url, global_video_type, global_menu_images
      `)
      .limit(1000)

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError)
      throw profilesError
    }

    console.log(`Found ${allProfiles?.length || 0} total profiles`)

    // Step 3: Match listing with profile
    for (const listing of allListings) {
      const profile = allProfiles?.find(p => p.id === listing.profile_id)
      if (!profile) continue

      const profileSlug = slugify(profile.display_name)
      const titleSlug = slugify(listing.title)
      const urlSlug = listing.url_slug ? slugify(listing.url_slug) : ''

      // Check if this is our listing
      if (profileSlug === usernameSlug && (titleSlug === campaignSlug || urlSlug === campaignSlug)) {
        console.log(`✅ Found match: "${profile.display_name}" / "${listing.title}"`)
        foundListing = { ...listing, profiles: profile }
        break
      }
    }

    if (!foundListing) {
      console.error(`❌ No matching listing found`)
      console.log(`Available listings:`)
      allListings.slice(0, 10).forEach(l => {
        const profile = allProfiles?.find(p => p.id === l.profile_id)
        console.log(`  - ${profile?.display_name || 'unknown'} / ${l.title} (url_slug: ${l.url_slug})`)
      })
      
      return NextResponse.json(
        { 
          error: 'Listing not found',
          debug: {
            searchedUsername: params.username,
            searchedCampaign: params.campaign,
            usernameSlug,
            campaignSlug,
            totalListings: allListings.length
          }
        },
        { status: 404 }
      )
    }

    const profile = foundListing.profiles
    const listing = { ...foundListing }
    delete listing.profiles

    // Fetch products if any are selected
    let products: any[] = []
    const selectedProductIds: string[] = Array.isArray(listing.selected_products)
      ? listing.selected_products
      : []

    if (selectedProductIds.length > 0) {
      const { data: profileProducts } = await adminClient
        .from('profile_products')
        .select('id, name, image_url, price_cents')
        .in('id', selectedProductIds)

      products = profileProducts || []
    }

    // Fetch reviews
    let reviewSummary: { average: number; count: number } | null = null
    const { data: reviews } = await adminClient
      .from('profile_reviews')
      .select('rating')
      .eq('profile_id', profile.id)

    if (reviews && reviews.length > 0) {
      const total = reviews.reduce((sum, review) => sum + (review?.rating ?? 0), 0)
      reviewSummary = {
        average: total / reviews.length,
        count: reviews.length
      }
    } else {
      reviewSummary = { average: 0, count: 0 }
    }

    return NextResponse.json({ listing, profile, products, reviewSummary })
  } catch (error) {
    console.error('Unexpected error loading public listing:', error)
    return NextResponse.json(
      { 
        error: 'Failed to load listing',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
