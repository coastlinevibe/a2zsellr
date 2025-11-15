import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !anonKey) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
    }

    const client = createClient(supabaseUrl, anonKey)

    // Try to fetch from profile_listings
    console.log('🔍 Checking profile_listings table...')
    const { data: listings, error: listingsError, count: listingsCount } = await client
      .from('profile_listings')
      .select('*', { count: 'exact' })
      .limit(10)

    console.log(`profile_listings: ${listingsCount} rows, error: ${listingsError?.message}`)

    // Try to fetch from sharelinks (alternative name)
    console.log('🔍 Checking sharelinks table...')
    const { data: sharelinks, error: sharelinksError, count: sharelinksCount } = await client
      .from('sharelinks')
      .select('*', { count: 'exact' })
      .limit(10)

    console.log(`sharelinks: ${sharelinksCount} rows, error: ${sharelinksError?.message}`)

    // Try to fetch from campaigns
    console.log('🔍 Checking campaigns table...')
    const { data: campaigns, error: campaignsError, count: campaignsCount } = await client
      .from('campaigns')
      .select('*', { count: 'exact' })
      .limit(10)

    console.log(`campaigns: ${campaignsCount} rows, error: ${campaignsError?.message}`)

    // Try to fetch from marketing_campaigns
    console.log('🔍 Checking marketing_campaigns table...')
    const { data: marketingCampaigns, error: marketingError, count: marketingCount } = await client
      .from('marketing_campaigns')
      .select('*', { count: 'exact' })
      .limit(10)

    console.log(`marketing_campaigns: ${marketingCount} rows, error: ${marketingError?.message}`)

    return NextResponse.json({
      tables: {
        profile_listings: {
          count: listingsCount,
          error: listingsError?.message,
          sample: listings?.slice(0, 3)
        },
        sharelinks: {
          count: sharelinksCount,
          error: sharelinksError?.message,
          sample: sharelinks?.slice(0, 3)
        },
        campaigns: {
          count: campaignsCount,
          error: campaignsError?.message,
          sample: campaigns?.slice(0, 3)
        },
        marketing_campaigns: {
          count: marketingCount,
          error: marketingError?.message,
          sample: marketingCampaigns?.slice(0, 3)
        }
      }
    })

  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
