import { supabase } from '@/lib/supabaseClient'

export interface ProductImage {
  url: string
  alt?: string
  order: number
}

export interface Product {
  id: string
  name: string
  description: string | null
  product_details: string | null
  category: string | null
  image_url: string | null
  images?: ProductImage[] | string
  price_cents: number | null
  discounted_price?: string | null
  is_active: boolean
  profile_id: string
}

/**
 * Fetch a product by ID
 */
export async function getProductById(productId: string): Promise<Product | null> {
  try {
    const { data, error } = await supabase
      .from('profile_products')
      .select('*')
      .eq('id', productId)
      .eq('is_active', true)
      .single()

    if (error) {
      console.error('Error fetching product:', error)
      return null
    }

    return data as Product
  } catch (error) {
    console.error('Error fetching product:', error)
    return null
  }
}

/**
 * Fetch a product by profile ID and product slug
 */
export async function getProductByProfileAndSlug(
  profileId: string,
  productSlug: string
): Promise<Product | null> {
  try {
    const { data, error } = await supabase
      .from('profile_products')
      .select('*')
      .eq('profile_id', profileId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching products:', error)
      return null
    }

    // Find product by matching slug
    const product = (data as Product[]).find((p) => {
      const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
      return slug === decodeURIComponent(productSlug)
    })

    return product || null
  } catch (error) {
    console.error('Error fetching product:', error)
    return null
  }
}

/**
 * Get the first image URL from a product
 */
export function getProductImageUrl(product: Product): string {
  // Handle images array
  if (product.images) {
    let imagesArray: ProductImage[] = []
    
    if (typeof product.images === 'string') {
      try {
        imagesArray = JSON.parse(product.images)
      } catch (e) {
        imagesArray = []
      }
    } else if (Array.isArray(product.images)) {
      imagesArray = product.images
    }

    if (imagesArray.length > 0) {
      return imagesArray[0].url
    }
  }

  // Fallback to image_url
  if (product.image_url) {
    return product.image_url
  }

  // Default fallback
  return 'https://www.a2zsellr.life/default-product.png'
}

/**
 * Get clean description for meta tags (strip HTML, limit to 150 chars)
 */
export function getProductMetaDescription(product: Product): string {
  if (!product.description) {
    return 'Discover this product on A2Z Sellr.'
  }

  // Strip HTML tags
  const cleanDescription = product.description
    .replace(/<[^>]*>/g, '')
    .trim()

  // Limit to 150 characters
  if (cleanDescription.length > 150) {
    return cleanDescription.slice(0, 150).trim() + '...'
  }

  return cleanDescription || 'Discover this product on A2Z Sellr.'
}

/**
 * Format product price for display
 */
export function formatProductPrice(priceCents: number | null): string {
  if (!priceCents) {
    return 'Contact for price'
  }

  return `R${(priceCents / 100).toLocaleString('en-ZA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}
