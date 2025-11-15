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
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

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

    const titleVariations = unique([
      params.campaign,
      params.campaign.replace(/-/g, ' '),
      params.campaign.replace(/-/g, ''),
      campaignSlug
    ])

    let foundListing: any = null

    for (const titleVariant of titleVariations) {
      const { data, error } = await adminClient
        .from('profile_listings')
        .select(
          `*,
          profiles:profiles!inner(id, display_name, avatar_url, bio, phone_number, subscription_tier, whatsapp_number)
        `
        )
        .ilike('title', `%${titleVariant}%`)
        .limit(25)

      if (error) {
        console.error('Error querying listings by title variation:', titleVariant, error)
        continue
      }

      if (data) {
        foundListing = data.find((listing) => {
          const profileName = listing.profiles?.display_name || ''
          return slugify(profileName) === usernameSlug && slugify(listing.title) === campaignSlug
        })
      }

      if (foundListing) break
    }

    if (!foundListing) {
      const { data, error } = await adminClient
        .from('profile_listings')
        .select(
          `*,
          profiles:profiles!inner(id, display_name, avatar_url, bio, phone_number, subscription_tier, whatsapp_number)
        `
        )
        .limit(200)

      if (error) {
        console.error('Fallback listing search failed:', error)
      }

      if (data) {
        foundListing = data.find((listing) => {
          const profileName = listing.profiles?.display_name || ''
          return slugify(profileName) === usernameSlug && slugify(listing.title) === campaignSlug
        })
      }
    }

    if (!foundListing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      )
    }

    const profile = foundListing.profiles
    if (!profile) {
      return NextResponse.json(
        { error: 'Business profile not found for listing' },
        { status: 404 }
      )
    }

    const listing = { ...foundListing }
    delete listing.profiles

    const selectedProductIds: string[] = Array.isArray(listing.selected_products)
      ? listing.selected_products
      : []

    let products: any[] = []

    if (selectedProductIds.length > 0) {
      const { data: profileProducts, error: profileProductsError } = await adminClient
        .from('profile_products')
        .select('id, name, image_url, price_cents')
        .in('id', selectedProductIds)

      if (profileProductsError) {
        console.error('Error fetching profile products:', profileProductsError)
      }

      products = profileProducts || []

      if (products.length === 0) {
        const { data: fallbackProducts, error: fallbackProductsError } = await adminClient
          .from('products')
          .select('id, name, image_url, price_cents')
          .in('id', selectedProductIds)

        if (fallbackProductsError) {
          console.error('Error fetching fallback products:', fallbackProductsError)
        }

        products = fallbackProducts || []
      }
    }

    let reviewSummary: { average: number; count: number } | null = null

    const { data: reviews, error: reviewsError } = await adminClient
      .from('profile_reviews')
      .select('rating')
      .eq('profile_id', profile.id)

    if (reviewsError) {
      console.error('Error fetching reviews:', reviewsError)
    } else if (reviews && reviews.length > 0) {
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
      { error: 'Failed to load listing' },
      { status: 500 }
    )
  }
}
