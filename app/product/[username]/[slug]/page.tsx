import { Metadata } from 'next'
import { supabase } from '@/lib/supabaseClient'
import {
  getProductByProfileAndSlug,
  getProductImageUrl,
  getProductMetaDescription,
} from '@/lib/productHelpers'
import { redirect } from 'next/navigation'

interface Props {
  params: Promise<{ username: string; slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username, slug } = await params
  const decodedUsername = decodeURIComponent(username)

  try {
    // Fetch profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, display_name')
      .ilike('display_name', decodedUsername)
      .eq('is_active', true)
      .single()

    if (!profile) {
      return {
        title: 'Product not found - A2Z Sellr',
        description: 'This product could not be found on A2Z Sellr.',
      }
    }

    // Fetch product
    const product = await getProductByProfileAndSlug(profile.id, slug)

    if (!product) {
      return {
        title: 'Product not found - A2Z Sellr',
        description: 'This product could not be found on A2Z Sellr.',
      }
    }

    const title = `${product.name} – Available on A2Z Sellr`
    const description = getProductMetaDescription(product)
    const image = getProductImageUrl(product)
    const url = `https://www.a2zsellr.life/product/${encodeURIComponent(decodedUsername)}/${encodeURIComponent(slug)}`

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
  } catch (error) {
    console.error('Error generating product metadata:', error)
    return {
      title: 'Product - A2Z Sellr',
      description: 'View this product on A2Z Sellr.',
    }
  }
}

export default async function ProductPage({ params }: Props) {
  const { username, slug } = await params

  // Redirect to the profile page with product query parameter
  redirect(`/profile/${username}?product=${slug}`)
}
