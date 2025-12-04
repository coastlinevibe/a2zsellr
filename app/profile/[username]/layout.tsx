import { Metadata } from 'next'
import { supabase } from '@/lib/supabaseClient'
import {
  getProductByProfileAndSlug,
  getProductImageUrl,
  getProductMetaDescription,
} from '@/lib/productHelpers'

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: { username: string }
  searchParams: { [key: string]: string | string[] | undefined }
}): Promise<Metadata> {
  const username = decodeURIComponent(params.username)
  const productSlug = typeof searchParams?.product === 'string' ? searchParams.product : undefined

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

  // If product slug is provided, fetch product metadata
  if (productSlug && profile) {
    try {
      const product = await getProductByProfileAndSlug(profile.id, productSlug)

      if (product) {
        const title = `${product.name} – Available on A2Z Sellr`
        const description = getProductMetaDescription(product)
        const image = getProductImageUrl(product)
        const url = `https://www.a2zsellr.life/profile/${encodeURIComponent(username)}?product=${encodeURIComponent(productSlug)}`

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
    } catch (error) {
      console.error('Error fetching product for metadata:', error)
    }
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
  modal,
}: {
  children: React.ReactNode
  modal: React.ReactNode
}) {
  return (
    <>
      {children}
      {modal}
    </>
  )
}
