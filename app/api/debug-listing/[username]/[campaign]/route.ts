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

export async function GET(
  _request: NextRequest,
  { params }: { params: { username: string; campaign: string } }
) {
  try {
    const adminClient = getSupabaseAdminClient()
    const usernameSlug = slugify(params.username)
    const campaignSlug = slugify(params.campaign)

    // Get all listings and profiles
    const [listingsResult, profilesResult] = await Promise.all([
      adminClient.from('profile_listings').select('*').limit(100),
      adminClient.from('profiles').select('id, display_name, avatar_url, bio, phone_number').limit(100)
    ])

    const allListings = listingsResult.data || []
    const allProfiles = profilesResult.data || []

    // Find matches and near-matches
    const matches = []
    const nearMatches = []

    for (const listing of allListings) {
      const profile = allProfiles.find(p => p.id === listing.profile_id)
      if (!profile) continue

      const profileSlug = slugify(profile.display_name)
      const titleSlug = slugify(listing.title)
      const urlSlug = listing.url_slug ? slugify(listing.url_slug) : ''

      const profileMatches = profileSlug === usernameSlug
      const campaignMatches = titleSlug === campaignSlug || (urlSlug && urlSlug === campaignSlug)

      const item = {
        listing_id: listing.id,
        profile_name: profile.display_name,
        profile_slug: profileSlug,
        listing_title: listing.title,
        title_slug: titleSlug,
        url_slug: urlSlug,
        status: listing.status,
        profile_matches: profileMatches,
        campaign_matches: campaignMatches,
        exact_match: profileMatches && campaignMatches
      }

      if (profileMatches && campaignMatches) {
        matches.push(item)
      } else if (profileMatches || campaignMatches) {
        nearMatches.push(item)
      }
    }

    return NextResponse.json({
      search: {
        username: params.username,
        campaign: params.campaign,
        username_slug: usernameSlug,
        campaign_slug: campaignSlug
      },
      results: {
        exact_matches: matches,
        near_matches: nearMatches,
        total_listings: allListings.length,
        total_profiles: allProfiles.length
      },
      debug: {
        message: matches.length > 0 
          ? `Found ${matches.length} exact match(es)` 
          : `No exact matches found. ${nearMatches.length} near match(es) available.`,
        suggestions: nearMatches.length > 0 
          ? nearMatches.map(m => ({
              url: `/${m.profile_slug}/${m.url_slug || m.title_slug}`,
              reason: !m.profile_matches ? 'Username mismatch' : 'Campaign name mismatch'
            }))
          : []
      }
    })
  } catch (error) {
    console.error('Debug API error:', error)
    return NextResponse.json(
      { 
        error: 'Debug failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}