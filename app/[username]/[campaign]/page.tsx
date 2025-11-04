'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import {
  GalleryMosaicLayout,
  HoverCardsLayout,
  BeforeAfterLayout,
  VideoSpotlightLayout,
  HorizontalSliderLayout,
  VerticalSliderLayout,
  type MediaItem
} from '@/components/ui/campaign-layouts'
import { MessageCircle, Share2, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CampaignPageProps {
  params: {
    username: string
    campaign: string
  }
}

interface Listing {
  id: string
  profile_id: string
  title: string
  layout_type: string
  message_template: string
  target_platforms: string[]
  cta_label: string
  cta_url: string
  status: string
  created_at: string
  uploaded_media?: Array<{
    id: string
    name: string
    url: string
    type: string
    storage_path?: string
  }>
  selected_products?: string[]
}

interface Profile {
  id: string
  display_name: string
  avatar_url: string | null
  bio: string | null
}

interface Product {
  id: string
  name: string
  image_url: string | null
  price_cents: number | null
}

export default function CampaignPage({ params }: CampaignPageProps) {
  const router = useRouter()
  const [listing, setListing] = useState<Listing | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchListingData()
  }, [params.username, params.campaign])

  const fetchListingData = async () => {
    try {
      setLoading(true)
      
      // Get profile by display name (username) - try multiple variations
      const usernameVariations = [
        params.username.replace(/-/g, ' '),  // "alf-burger" -> "alf burger"
        params.username.replace(/-/g, ''),   // "alf-burger" -> "alfburger"
        params.username,                      // "alf-burger" as is
      ]
      
      let profileData = null
      for (const variation of usernameVariations) {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, display_name, avatar_url, bio')
          .ilike('display_name', `%${variation}%`)
          .limit(1)
        
        console.log(`Trying profile variation: "${variation}"`, { data, error })
        
        if (data && data.length > 0) {
          profileData = Array.isArray(data) ? data[0] : data
          console.log('Found profile:', profileData)
          break
        }
      }

      if (!profileData) {
        console.error('Profile not found. Tried variations:', usernameVariations)
        throw new Error('Business not found')
      }
      setProfile(profileData)

      // Get listing by profile and title/slug - try multiple matches
      const listingVariations = [
        params.campaign.replace(/-/g, ' '),  // "bh6" -> "bh6"
        params.campaign.replace(/-/g, ''),   // Just in case
        params.campaign,                      // As is
      ]
      
      let listingData = null
      for (const variation of listingVariations) {
        const { data, error } = await supabase
          .from('profile_listings')
          .select('*')
          .eq('profile_id', profileData.id)
          .ilike('title', `%${variation}%`)
          .limit(1)
        
        if (data && data.length > 0) {
          listingData = data[0]
          break
        }
      }

      if (!listingData) throw new Error('Listing not found')
      setListing(listingData)

      // Get products that were specifically selected for this listing
      const selectedProductIds = listingData.selected_products || []
      console.log('🔍 Selected product IDs from listing:', selectedProductIds)
      
      if (selectedProductIds.length > 0) {
        // Try profile_products table first
        let { data: productsData, error: productsError } = await supabase
          .from('profile_products')
          .select('id, name, image_url, price_cents')
          .in('id', selectedProductIds)
        
        console.log('🔍 Products from profile_products:', productsData, productsError)
        
        // If profile_products doesn't work, try products table
        if (!productsData || productsData.length === 0) {
          const result = await supabase
            .from('products')
            .select('id, name, image_url, price_cents')
            .in('id', selectedProductIds)
          productsData = result.data
          console.log('🔍 Products from products table:', productsData)
        }
        
        setProducts(productsData || [])
      } else {
        // Fallback: show some products from this business
        let { data: productsData } = await supabase
          .from('profile_products')
          .select('id, name, image_url, price_cents')
          .eq('profile_id', profileData.id)
          .limit(6)
        
        if (!productsData || productsData.length === 0) {
          const result = await supabase
            .from('products')
            .select('id, name, image_url, price_cents')
            .eq('profile_id', profileData.id)
            .limit(6)
          productsData = result.data
        }

        setProducts(productsData || [])
      }

    } catch (err: any) {
      console.error('Error fetching campaign:', err)
      
      // Fallback: Try to find campaign by URL pattern and then get profile
      try {
        console.log('Trying fallback: search all listings...')
        const { data: allListings } = await supabase
          .from('profile_listings')
          .select('*, profiles!inner(id, display_name, avatar_url, bio)')
          .limit(100)
        
        console.log('All listings:', allListings)
        
        // Find matching listing
        const matchingListing = allListings?.find(c => {
          const titleSlug = c.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
          const profileSlug = c.profiles.display_name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
          return titleSlug === params.campaign && profileSlug === params.username
        })
        
        if (matchingListing) {
          console.log('Found matching listing via fallback:', matchingListing)
          setListing(matchingListing)
          setProfile(matchingListing.profiles)
          
          // Get products that were specifically selected for this listing
          const selectedProductIds = matchingListing.selected_products || []
          
          if (selectedProductIds.length > 0) {
            let { data: productsData } = await supabase
              .from('profile_products')
              .select('id, name, image_url, price_cents')
              .in('id', selectedProductIds)
            
            if (!productsData || productsData.length === 0) {
              const result = await supabase
                .from('products')
                .select('id, name, image_url, price_cents')
                .in('id', selectedProductIds)
              productsData = result.data
            }
            setProducts(productsData || [])
          } else {
            // Fallback: show some products from this business
            let { data: productsData } = await supabase
              .from('profile_products')
              .select('id, name, image_url, price_cents')
              .eq('profile_id', matchingListing.profile_id)
              .limit(6)
            
            if (!productsData || productsData.length === 0) {
              const result = await supabase
                .from('products')
                .select('id, name, image_url, price_cents')
                .eq('profile_id', matchingListing.profile_id)
                .limit(6)
              productsData = result.data
            }
            setProducts(productsData || [])
          }
          
          setError(null) // Clear error
          return
        }
      } catch (fallbackErr) {
        console.error('Fallback also failed:', fallbackErr)
      }
      
      setError(err.message || 'Failed to load listing')
    } finally {
      setLoading(false)
    }
  }

  const getMediaItems = (): MediaItem[] => {
    // Get uploaded media from listing
    const uploadedMedia = listing?.uploaded_media || []
    console.log('🔍 Debug - listing:', listing)
    console.log('🔍 Debug - uploadedMedia:', uploadedMedia)
    console.log('🔍 Debug - products:', products)
    
    const uploadedItems: MediaItem[] = uploadedMedia.map((media: any) => ({
      id: media.id,
      name: media.name,
      url: media.url,
      type: media.type
    }))

    // Get products
    const productItems: MediaItem[] = products.map(product => ({
      id: product.id,
      name: product.name,
      url: product.image_url || '',
      type: 'image/jpeg',
      price: product.price_cents ? product.price_cents / 100 : undefined
    }))

    const allItems = [...uploadedItems, ...productItems]
    console.log('🔍 Debug - final mediaItems:', allItems)
    
    // Combine both
    return allItems
  }

  const renderLayout = () => {
    if (!listing || !profile) return null

    const mediaItems = getMediaItems()
    const commonProps = {
      items: mediaItems,
      title: listing.title,
      message: listing.message_template,
      ctaLabel: listing.cta_label || 'Learn More',
      ctaUrl: listing.cta_url,
      businessName: profile.display_name
    }

    switch (listing.layout_type) {
      case 'gallery-mosaic':
        return <GalleryMosaicLayout {...commonProps} />
      case 'hover-cards':
        return <HoverCardsLayout {...commonProps} />
      case 'before-after':
        return <BeforeAfterLayout {...commonProps} />
      case 'video-spotlight':
        return <VideoSpotlightLayout {...commonProps} />
      case 'horizontal-slider':
        return <HorizontalSliderLayout {...commonProps} />
      case 'vertical-slider':
        return <VerticalSliderLayout {...commonProps} />
      default:
        return <GalleryMosaicLayout {...commonProps} />
    }
  }

  const handleShare = async () => {
    const shareUrl = window.location.href
    const shareText = `Check out ${listing?.title} from ${profile?.display_name}!`

    if (navigator.share) {
      try {
        await navigator.share({
          title: listing?.title,
          text: shareText,
          url: shareUrl
        })
      } catch (err) {
        console.log('Share cancelled')
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareUrl)
      alert('Link copied to clipboard!')
    }
  }

  const handleWhatsAppShare = () => {
    const message = encodeURIComponent(
      `${listing?.message_template}\n\n${listing?.cta_label}: ${window.location.href}`
    )
    window.open(`https://wa.me/?text=${message}`, '_blank')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading listing...</p>
        </div>
      </div>
    )
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Listing Not Found</h1>
          <p className="text-gray-600 mb-6">
            {error || 'This listing may have been removed or the link is incorrect.'}
          </p>
          <Button 
            onClick={() => router.push('/')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Go to Home
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {profile?.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt={profile.display_name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  {profile?.display_name?.charAt(0).toUpperCase() || 'A'}
                </div>
              )}
              <div>
                <h1 className="font-bold text-gray-900">{profile?.display_name || 'Business'}</h1>
                <p className="text-xs text-gray-500">Marketing Campaign</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                onClick={handleWhatsAppShare}
                size="sm"
                variant="outline"
                className="text-green-600 border-green-200 hover:bg-green-50"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                WhatsApp
              </Button>
              <Button
                onClick={handleShare}
                size="sm"
                variant="outline"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Campaign Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderLayout()}

        {/* Footer Actions */}
        <div className="mt-8 text-center">
          <Button
            onClick={() => router.push(`/profile/${params.username}`)}
            variant="outline"
            className="mb-4"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View Full Business Profile
          </Button>
          
          <p className="text-sm text-gray-500">
            Powered by <span className="font-semibold text-blue-600">A2Z Business Directory</span>
          </p>
        </div>
      </main>
    </div>
  )
}
