import { Metadata } from 'next'
import { supabase } from '@/lib/supabaseClient'
import {
  getProductByProfileAndSlug,
  getProductImageUrl,
  getProductMetaDescription,
} from '@/lib/productHelpers'

interface Props {
  params: { username: string; productSlug: string }
}

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  const username = decodeURIComponent(params.username)
  const productSlug = decodeURIComponent(params.productSlug)

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

  // If profile found, fetch product metadata
  if (profile) {
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

  // Default metadata
  return {
    title: 'A2Z Sellr - South Africa\'s Leading Seller Platform',
    description: 'Discover quality businesses nationwide with A2Z Sellr.',
  }
}

export default function ProductModalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
