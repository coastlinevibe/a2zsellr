import { Metadata } from 'next'
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

// Generate static params for known listings (helps with metadata generation)
export async function generateStaticParams() {
  try {
    const adminClient = getSupabaseAdminClient()
    
    // Fetch all listings and profiles
    const { data: listings } = await adminClient
      .from('profile_listings')
      .select('title, profile_id')
      .limit(100)
    
    const { data: profiles } = await adminClient
      .from('profiles')
      .select('id, display_name')
      .limit(100)
    
    if (!listings || !profiles) return []
    
    // Generate params for each listing
    return listings.map(listing => {
      const profile = profiles.find(p => p.id === listing.profile_id)
      if (!profile) return null
      
      return {
        username: profile.display_name.toLowerCase().replace(/\s+/g, '-'),
        campaign: listing.title.toLowerCase().replace(/\s+/g, '-')
      }
    }).filter(Boolean)
  } catch (error) {
    console.error('Error generating static params:', error)
    return []
  }
}

export async function generateMetadata(
  { params }: { params: Promise<{ username: string; campaign: string }> }
): Promise<Metadata> {
  try {
    // Await params in Next.js 15+
    const resolvedParams = await params
    const adminClient = getSupabaseAdminClient()
    const usernameSlug = slugify(resolvedParams.username)
    const campaignSlug = slugify(resolvedParams.campaign)

    console.log('🔍 [METADATA] Searching for listing:', {
      username: resolvedParams.username,
      campaign: resolvedParams.campaign,
      usernameSlug,
      campaignSlug
    })

    // Fetch all listings with all fields
    const { data: allListings, error: listingsError } = await adminClient
      .from('profile_listings')
      .select('*')
      .limit(1000)

    if (listingsError) {
      console.error('Error fetching listings:', listingsError)
      throw listingsError
    }

    console.log(`📋 [METADATA] Found ${allListings?.length || 0} total listings`)

    // Fetch all profiles
    const { data: allProfiles, error: profilesError } = await adminClient
      .from('profiles')
      .select('id, display_name')
      .limit(1000)

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError)
      throw profilesError
    }

    console.log(`👥 [METADATA] Found ${allProfiles?.length || 0} total profiles`)

    // Find matching listing
    let foundListing: any = null
    for (const listing of allListings || []) {
      const profile = allProfiles?.find(p => p.id === listing.profile_id)
      if (!profile) continue

      const profileSlug = slugify(profile.display_name)
      const titleSlug = slugify(listing.title)
      const urlSlug = listing.url_slug ? slugify(listing.url_slug) : ''

      console.log(`🔎 [METADATA] Checking: "${profile.display_name}" (${profileSlug}) / "${listing.title}" (${titleSlug}, url_slug: ${urlSlug})`)

      if (profileSlug === usernameSlug && (titleSlug === campaignSlug || urlSlug === campaignSlug)) {
        console.log(`✅ [METADATA] FOUND MATCH!`)
        foundListing = { ...listing, profile }
        break
      }
    }

    if (!foundListing) {
      console.error(`❌ [METADATA] No matching listing found for ${usernameSlug}/${campaignSlug}`)
      console.log(`📋 [METADATA] Available listings (first 5):`)
      allListings?.slice(0, 5).forEach(l => {
        const profile = allProfiles?.find(p => p.id === l.profile_id)
        console.log(`  - ${profile?.display_name || 'unknown'} / ${l.title}`)
      })
      return {
        title: `${resolvedParams.username}'s Listing - A2Z Sellr`,
        description: 'Check out this listing on A2Z Sellr',
      }
    }

    const listing = foundListing
    const profile = foundListing.profile

    // EXACT RULE: Use listing image ONLY (NOT product image)
    let imageUrl = ''
    
    // Handle uploaded_media - might be JSON string or array
    let uploadedMedia = listing.uploaded_media
    if (typeof uploadedMedia === 'string') {
      try {
        uploadedMedia = JSON.parse(uploadedMedia)
      } catch (e) {
        uploadedMedia = []
      }
    }
    
    console.log('🖼️ Metadata generation - uploaded_media:', {
      raw: listing.uploaded_media,
      parsed: uploadedMedia,
      isArray: Array.isArray(uploadedMedia),
      length: uploadedMedia?.length
    })
    
    if (uploadedMedia && Array.isArray(uploadedMedia) && uploadedMedia.length > 0) {
      const firstMedia = uploadedMedia[0]
      console.log('🖼️ First media item:', firstMedia)
      if (firstMedia && firstMedia.url) {
        imageUrl = firstMedia.url
        console.log('🖼️ Selected image URL:', imageUrl)
      }
    }
    
    // NO FALLBACK TO PRODUCT IMAGE - if no listing image, use default
    if (!imageUrl) {
      console.log('⚠️ No image found, using default')
      imageUrl = 'https://www.a2zsellr.life/default-listing.png'
    }

    // Ensure absolute URL for image
    if (imageUrl) {
      if (!imageUrl.startsWith('http')) {
        // If it's a relative path, make it absolute
        if (imageUrl.startsWith('/')) {
          imageUrl = `https://www.a2zsellr.life${imageUrl}`
        } else {
          // Otherwise assume it needs the domain prefix
          imageUrl = `https://www.a2zsellr.life/${imageUrl}`
        }
      }
      // Ensure it's HTTPS
      imageUrl = imageUrl.replace(/^http:/, 'https:')
    }
    
    console.log('✅ Final image URL for metadata:', imageUrl)

    // EXACT RULE: Title format: ${listing.title} – ${owner_name} on A2Z Sellr
    const title = `${listing.title} – ${profile.display_name} on A2Z Sellr`
    
    // EXACT RULE: Description: slice(0, 150) or fallback - strip HTML tags
    const stripHtml = (html: string) => {
      return html.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').trim()
    }
    const description = listing.message_template 
      ? stripHtml(listing.message_template).slice(0, 150)
      : 'Discover local listings on A2Z Sellr.'
    
    // EXACT RULE: URL format
    const url = `https://www.a2zsellr.life/${resolvedParams.username}/${resolvedParams.campaign}`

    console.log('✅ [METADATA] Returning metadata:', {
      title,
      description: description.substring(0, 50) + '...',
      imageUrl,
      url
    })

    return {
      title: title,
      description: description,
      metadataBase: new URL('https://www.a2zsellr.life'),
      openGraph: {
        title: title,
        description: description,
        url: url,
        type: 'website',
        siteName: 'A2Z Sellr',
        locale: 'en_ZA',
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: title,
            type: 'image/jpeg',
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: title,
        description: description,
        images: [imageUrl],
        creator: `@${profile.display_name?.replace(/\s+/g, '')}`,
      },
      robots: 'index, follow',
      alternates: {
        canonical: url,
      },
    } as Metadata
  } catch (error) {
    console.error('❌ Error generating metadata:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    })
    
    // Return a safe fallback with the listing info we can extract from params
    const resolvedParams = await params
    return {
      title: `${resolvedParams.username}'s Listing - A2Z Sellr`,
      description: `Check out ${resolvedParams.campaign} from ${resolvedParams.username} on A2Z Sellr`,
      openGraph: {
        title: `${resolvedParams.username}'s Listing - A2Z Sellr`,
        description: `Check out ${resolvedParams.campaign} from ${resolvedParams.username} on A2Z Sellr`,
        url: `https://www.a2zsellr.life/${resolvedParams.username}/${resolvedParams.campaign}`,
        type: 'website',
      },
    }
  }
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
