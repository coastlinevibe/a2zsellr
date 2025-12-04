import { Metadata } from 'next'
import { supabase } from '@/lib/supabaseClient'

interface Props {
  params: { username: string }
}

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  const username = decodeURIComponent(params.username)

  // Fetch profile
  let profile = null
  try {
    const { data } = await supabase
      .from('profiles')
      .select('id, display_name, bio, business_category, business_location, avatar_url')
      .ilike('display_name', username)
      .eq('is_active', true)
      .single()

    profile = data
  } catch (error) {
    console.error('Error fetching profile for metadata:', error)
  }

  // Profile metadata
  if (profile) {
    const title = `${profile.display_name} | A2Z Sellr`
    const description =
      profile.bio ||
      `Check out ${profile.display_name}'s business profile on A2Z Sellr. ${profile.business_category || 'Business'} in ${profile.business_location || 'South Africa'}`
    const image = profile.avatar_url || 'https://www.a2zsellr.life/default-avatar.jpg'
    const url = `https://www.a2zsellr.life/profile/${encodeURIComponent(username)}`

    return {
      title,
      description,
      metadataBase: new URL('https://a2zsellr.life'),
      openGraph: {
        title,
        description,
        url,
        type: 'website',
        images: [
          {
            url: image,
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
        siteName: 'A2Z Sellr',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [image],
      },
    }
  }

  // Default metadata
  return {
    title: 'A2Z Sellr - South Africa\'s Leading Seller Platform',
    description: 'Discover quality businesses nationwide with A2Z Sellr.',
  }
}

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
