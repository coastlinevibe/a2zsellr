import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const getSupabaseAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !serviceKey) {
    throw new Error('Supabase credentials are not configured')
  }

  return createClient(supabaseUrl, serviceKey)
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const adminClient = getSupabaseAdminClient()
    const username = params.username

    console.log(`🟢 [PUBLIC_PROFILE_API] Fetching profile for username: ${username}`)

    // Try multiple lookup strategies
    let profile = null

    // Strategy 1: Exact match
    const { data: exactMatch } = await adminClient
      .from('profiles')
      .select('*')
      .eq('display_name', username)
      .eq('is_active', true)
      .single()

    if (exactMatch) {
      profile = exactMatch
      console.log(`✅ [PUBLIC_PROFILE_API] Found exact match: ${profile.display_name}`)
    } else {
      // Strategy 2: Case-insensitive match
      const { data: iLikeMatch } = await adminClient
        .from('profiles')
        .select('*')
        .ilike('display_name', username)
        .eq('is_active', true)
        .single()

      if (iLikeMatch) {
        profile = iLikeMatch
        console.log(`✅ [PUBLIC_PROFILE_API] Found case-insensitive match: ${profile.display_name}`)
      }
    }

    if (!profile) {
      console.error(`❌ [PUBLIC_PROFILE_API] Profile not found for username: ${username}`)
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Fetch products
    const { data: products } = await adminClient
      .from('profile_products')
      .select('*')
      .eq('profile_id', profile.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    // Fetch gallery
    const { data: gallery } = await adminClient
      .from('profile_gallery')
      .select('*')
      .eq('profile_id', profile.id)
      .order('created_at', { ascending: false })

    // Fetch reviews
    const { data: reviews } = await adminClient
      .from('profile_reviews')
      .select('rating')
      .eq('profile_id', profile.id)
      .eq('is_active', true)

    let reviewSummary = { average: 0, count: 0 }
    if (reviews && reviews.length > 0) {
      const total = reviews.reduce((sum, review) => sum + (review?.rating ?? 0), 0)
      reviewSummary = {
        average: total / reviews.length,
        count: reviews.length
      }
    }

    console.log(`✅ [PUBLIC_PROFILE_API] Returning profile data for: ${profile.display_name}`)

    return NextResponse.json({
      profile,
      products: products || [],
      gallery: gallery || [],
      reviewSummary
    })
  } catch (error) {
    console.error('🔴 [PUBLIC_PROFILE_API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to load profile' },
      { status: 500 }
    )
  }
}
