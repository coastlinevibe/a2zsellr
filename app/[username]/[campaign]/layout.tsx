import { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const getSupabaseClient = () => {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase credentials are not configured')
  }
  return createClient(supabaseUrl, supabaseKey)
}

const slugify = (value: string) =>
  value
    ?.toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

type Props = {
  params: { username: string; campaign: string }
  children: React.ReactNode
}

export async function generateMetadata({ params }: Omit<Props, 'children'>): Promise<Metadata> {
  try {
    const client = getSupabaseClient()
    const usernameSlug = slugify(params.username)
    const campaignSlug = slugify(params.campaign)

    // Fetch listing and profile data
    const { data: allListings } = await client
      .from('profile_listings')
      .select('*, uploaded_media, selected_products')
      .limit(1000)

    const { data: allProfiles } = await client
      .from('profiles')
      .select('id, display_name, avatar_url, bio')
      .limit(1000)

    if (!allListings || !allProfiles) {
      throw new Error('Failed to fetch data')
    }

    // Find matching listing
    let foundListing: any = null
    for (const listing of allListings) {
      const profile = allProfiles.find(p => p.id === listing.profile_id)
      if (!profile) continue

      const profileSlug = slugify(profile.display_name)
      const titleSlug = slugify(listing.title)
      const urlSlug = listing.url_slug ? slugify(listing.url_slug) : ''

      if (profileSlug === usernameSlug && (titleSlug === campaignSlug || urlSlug === campaignSlug)) {
        foundListing = { ...listing, profile }
        break
      }
    }

    if (!foundListing) {
      return {
        title: 'A2Z Sellr - Listing',
        description: 'Discover this listing on A2Z Sellr'
      }
    }

    const listing = foundListing
    const profile = foundListing.profile

    // Get first image from uploaded media or products
    let ogImage = 'https://www.a2zsellr.life/default-listing-og.png'
    
    if (listing.uploaded_media && Array.isArray(listing.uploaded_media)) {
      const uploadedMedia = listing.uploaded_media
      if (uploadedMedia.length > 0 && uploadedMedia[0].url) {
        ogImage = uploadedMedia[0].url
      }
    }

    // Fallback to profile avatar if no listing image
    if (ogImage === 'https://www.a2zsellr.life/default-listing-og.png' && profile?.avatar_url) {
      ogImage = profile.avatar_url
    }

    const title = `${listing.title} – ${profile.display_name} on A2Z Sellr`
    const description = listing.message_template?.slice(0, 160) || `Check out this listing from ${profile.display_name} on A2Z Sellr`
    const url = `https://www.a2zsellr.life/${params.username}/${params.campaign}`

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url,
        type: 'website',
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: title
          }
        ]
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [ogImage]
      }
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'A2Z Sellr - Listing',
      description: 'Discover this listing on A2Z Sellr'
    }
  }
}

export default function Layout({ children }: Props) {
  return <>{children}</>
}
