'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Head from 'next/head'
import {
  GalleryMosaicLayout,
  HoverCardsLayout,
  BeforeAfterLayout,
  VideoSpotlightLayout,
  HorizontalSliderLayout,
  VerticalSliderLayout,
  CustomTemplateLayout,
  type MediaItem
} from '@/components/ui/campaign-layouts'
import { MessageCircle, Share2, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MarketingActionBar } from '@/components/ui/MarketingActionBar'
import { VideoPopup } from '@/components/ui/VideoPopup'
import { MenuPopup } from '@/components/ui/MenuPopup'
import { NewProductsPopup } from '@/components/ui/NewProductsPopup'
import { MessageConsentPopup } from '@/components/ui/MessageConsentPopup'
import { useMessageConsent } from '@/hooks/useMessageConsent'

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
  delivery_available?: boolean | null
  video_url?: string
  video_type?: 'youtube' | 'upload'
  menu_images?: Array<{
    id: string
    url: string
    name?: string
    order?: number
  }>
  template_data?: {
    backgroundImage?: string
    interactions?: Array<{
      id: string
      x: number
      y: number
      type: string
      action: string
      data?: any
      width?: number
      height?: number
    }>
  }
}

interface Profile {
  id: string
  display_name: string
  avatar_url: string | null
  bio: string | null
  phone_number: string | null
  global_video_url?: string
  global_video_type?: 'youtube' | 'upload'
  global_menu_images?: Array<{
    id: string
    url: string
    name?: string
    order?: number
  }>
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
  const [reviewSummary, setReviewSummary] = useState<{ average: number; count: number } | null>(null)
  
  // Popup states
  const [videoPopupOpen, setVideoPopupOpen] = useState(false)
  const [menuPopupOpen, setMenuPopupOpen] = useState(false)
  const [productsPopupOpen, setProductsPopupOpen] = useState(false)

  // Message consent popup
  const messageConsent = useMessageConsent(
    profile?.display_name || 'Business',
    listing?.id || 'unknown'
  )

  useEffect(() => {
    fetchListingData()
  }, [params.username, params.campaign])

  const fetchListingData = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/public-listings/${params.username}/${params.campaign}`)
      const payload = await response.json().catch(() => null)

      if (!response.ok || !payload) {
        throw new Error(payload?.error || 'Failed to load listing')
      }

      if (!payload.listing || !payload.profile) {
        throw new Error(payload.error || 'Listing not found')
      }

      setListing(payload.listing)
      setProfile(payload.profile)
      setProducts(Array.isArray(payload.products) ? payload.products : [])
      setReviewSummary(payload.reviewSummary ?? null)
    } catch (err: any) {
      console.error('Error fetching campaign:', err)
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
      businessName: profile.display_name,
      ratingAverage: reviewSummary && reviewSummary.count > 0 ? reviewSummary.average : null,
      ratingCount: reviewSummary?.count ?? 0,
      deliveryAvailable: Boolean(listing.delivery_available)
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
      case 'custom-template':
        // For custom template, we need to get the template data from the listing
        const customTemplate = listing.template_data ? {
          id: `custom-${listing.id}`,
          name: 'Custom Template',
          category: 'custom',
          backgroundImage: listing.template_data.backgroundImage,
          interactions: listing.template_data.interactions || []
        } : undefined
        
        return <CustomTemplateLayout 
          {...commonProps} 
          selectedTemplate={customTemplate as any}
          isEditMode={false}
        />
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
          title: listing?.title || 'Check this out!',
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

  const handleContactShop = () => {
    // Get phone number from profile
    const whatsappNumber = profile?.phone_number
    
    if (!whatsappNumber) {
      alert('Contact information not available for this business.')
      return
    }
    
    // Clean the phone number (remove spaces, dashes, parentheses, etc.)
    let cleanNumber = whatsappNumber.replace(/[^0-9+]/g, '')
    
    // Convert local format to international format
    // If number starts with 0 (local SA format), convert to +27
    if (cleanNumber.startsWith('0')) {
      cleanNumber = '27' + cleanNumber.substring(1)
    }
    // If number starts with +, remove the + (WhatsApp API doesn't need it)
    else if (cleanNumber.startsWith('+')) {
      cleanNumber = cleanNumber.substring(1)
    }
    // If number doesn't start with country code, assume SA and add 27
    else if (!cleanNumber.startsWith('27') && cleanNumber.length === 9) {
      cleanNumber = '27' + cleanNumber
    }
    
    // Pre-filled message
    const message = `Hi! I'm interested in "${listing?.title}". Can you tell me more?`
    
    // WhatsApp URL with pre-filled message
    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`
    
    // Open WhatsApp
    window.open(whatsappUrl, '_blank')
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

  // Get the first media item for OG image - ensure it's a full URL
  const getFullImageUrl = () => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://www.a2zsellr.life'
    
    // COMPREHENSIVE DEBUG - Let's see exactly what data we have
    console.log('🚨 DEBUGGING OG IMAGE SELECTION:')
    console.log('📋 Raw listing object:', listing)
    console.log('📋 listing.uploaded_media type:', typeof listing.uploaded_media)
    console.log('📋 listing.uploaded_media value:', listing.uploaded_media)
    console.log('📋 listing.uploaded_media length:', listing.uploaded_media?.length)
    console.log('🛍️ Raw products array:', products)
    console.log('🛍️ Products length:', products?.length)
    console.log('👤 Profile avatar:', profile?.avatar_url)
    
    // Helper function to validate and format image URL
    const formatImageUrl = (url: string) => {
      if (!url || url.trim() === '') return null
      
      const cleanUrl = url.trim()
      
      // If it's already a full URL (Supabase storage, etc.), use it
      if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
        console.log('📎 Using full URL:', cleanUrl)
        return cleanUrl
      }
      
      // If it starts with /, make it absolute
      if (cleanUrl.startsWith('/')) {
        const fullUrl = `${baseUrl}${cleanUrl}`
        console.log('📎 Converting absolute path:', cleanUrl, '→', fullUrl)
        return fullUrl
      }
      
      // Otherwise, assume it needs baseUrl prefix
      const fullUrl = `${baseUrl}/${cleanUrl}`
      console.log('📎 Converting relative path:', cleanUrl, '→', fullUrl)
      return fullUrl
    }
    
    // Priority 1: Try uploaded media first (campaign images)
    let uploadedMedia = listing.uploaded_media
    
    // Handle case where uploaded_media might be a JSON string
    if (typeof uploadedMedia === 'string') {
      try {
        uploadedMedia = JSON.parse(uploadedMedia)
        console.log('📋 Parsed uploaded_media from string:', uploadedMedia)
      } catch (e) {
        console.log('❌ Failed to parse uploaded_media string:', e)
        uploadedMedia = []
      }
    }
    
    if (uploadedMedia && Array.isArray(uploadedMedia) && uploadedMedia.length > 0) {
      console.log('🔍 Checking uploaded media:', uploadedMedia)
      for (const media of uploadedMedia) {
        console.log('📎 Media item:', media)
        if (media && media.url) {
          // Check if it's an image by URL extension or type field
          const isImage = media.type?.startsWith('image/') || 
                         media.url.match(/\.(jpg|jpeg|png|gif|webp|bmp)(\?|$)/i) ||
                         media.name?.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/i)
          
          console.log('🖼️ Is image check:', { url: media.url, type: media.type, isImage })
          
          if (isImage) {
            const formattedUrl = formatImageUrl(media.url)
            console.log('✅ Selected uploaded media image:', formattedUrl)
            if (formattedUrl) return formattedUrl
          }
        }
      }
    } else {
      console.log('❌ No uploaded media found or invalid format')
      console.log('🔍 Raw uploaded_media value:', listing.uploaded_media)
      console.log('🔍 Type check:', typeof listing.uploaded_media)
      
      // Try alternative approaches if standard method fails
      if (listing.uploaded_media) {
        // Maybe it's stored as a different structure
        console.log('🔄 Trying alternative parsing...')
        
        // Check if it has a different property structure
        if (listing.uploaded_media[0] && listing.uploaded_media[0].url) {
          const firstMedia = listing.uploaded_media[0]
          console.log('🎯 Found media via alternative method:', firstMedia)
          const formattedUrl = formatImageUrl(firstMedia.url)
          if (formattedUrl) return formattedUrl
        }
      }
    }
    
    // Priority 2: Try selected products (product images)
    if (products && Array.isArray(products) && products.length > 0) {
      console.log('🔍 Checking product images:', products)
      for (const product of products) {
        console.log('🛍️ Product item:', { id: product.id, name: product.name, image_url: product.image_url })
        if (product && product.image_url && product.image_url.trim() !== '') {
          const formattedUrl = formatImageUrl(product.image_url)
          console.log('✅ Selected product image:', formattedUrl)
          if (formattedUrl) return formattedUrl
        }
      }
    } else {
      console.log('❌ No products found or invalid format')
    }
    
    // Priority 3: Try profile avatar
    if (profile?.avatar_url) {
      const formattedUrl = formatImageUrl(profile.avatar_url)
      console.log('✅ Selected profile avatar:', formattedUrl)
      if (formattedUrl) return formattedUrl
    }
    
    // Priority 4: A2Z Sellr branded fallback - use a proper image
    console.log('⚠️ No images found, using fallback')
    return `${baseUrl}/thumbnail.png`
  }
  
  const ogImage = getFullImageUrl()
  const pageUrl = typeof window !== 'undefined' ? window.location.href : `https://www.a2zsellr.life/${params.username}/${params.campaign}`
  
  // Debug: Log the selected OG image and available data
  console.log('🖼️ FINAL OG Image selected:', ogImage)
  console.log('📋 Listing data:', {
    title: listing.title,
    uploaded_media: listing.uploaded_media,
    selected_products: listing.selected_products
  })
  console.log('🛍️ Products data:', products.map(p => ({ 
    id: p.id, 
    name: p.name, 
    image_url: p.image_url 
  })))
  console.log('👤 Profile data:', {
    display_name: profile?.display_name,
    avatar_url: profile?.avatar_url
  })

  // Visual debug info for troubleshooting
  const debugInfo = {
    selectedOgImage: ogImage,
    uploadedMediaType: typeof listing.uploaded_media,
    uploadedMediaLength: listing.uploaded_media?.length || 0,
    productsLength: products?.length || 0,
    hasProfileAvatar: !!profile?.avatar_url
  }
  
  // Create a better description for the listing
  const ogDescription = listing.message_template.length > 160 
    ? `${listing.message_template.substring(0, 157)}...` 
    : listing.message_template
  
  // Better title for sharing
  const ogTitle = `${listing.title} | ${profile?.display_name || 'Business'} - A2Z Sellr`

  return (
    <>
      <Head>
        <title>{ogTitle}</title>
        <meta name="description" content={ogDescription} />
        <link rel="canonical" href={pageUrl} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:title" content={ogTitle} />
        <meta property="og:description" content={ogDescription} />
        <meta property="og:image" content={`${ogImage}?v=${Date.now()}`} />
        <meta property="og:image:secure_url" content={`${ogImage}?v=${Date.now()}`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={`${listing.title} - ${profile?.display_name}`} />
        <meta property="og:site_name" content="A2Z Sellr" />
        <meta property="og:locale" content="en_ZA" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@A2ZSellr" />
        <meta name="twitter:creator" content={`@${profile?.display_name?.replace(/\s+/g, '')}`} />
        <meta name="twitter:url" content={pageUrl} />
        <meta name="twitter:title" content={ogTitle} />
        <meta name="twitter:description" content={ogDescription} />
        <meta name="twitter:image" content={`${ogImage}?v=${Date.now()}`} />
        <meta name="twitter:image:alt" content={`${listing.title} - ${profile?.display_name}`} />
        
        {/* WhatsApp specific */}
        <meta property="og:image:type" content="image/jpeg" />
        <meta name="theme-color" content="#10B981" />
        
        {/* Additional meta for better sharing */}
        <meta name="author" content={profile?.display_name || 'Business Owner'} />
        <meta name="robots" content="index, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">



      {/* Campaign Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderLayout()}

        {/* Footer Actions */}
        <div className="mt-10 space-y-6">
          {profile && listing && (
            <MarketingActionBar
              onVideoPopup={() => setVideoPopupOpen(true)}
              onViewProfile={() => router.push(`/profile/${params.username}`)}
              onChatWithSeller={handleContactShop}
              onViewMenuPopup={() => setMenuPopupOpen(true)}
              onNewProductsPopup={() => setProductsPopupOpen(true)}
              businessName={profile.display_name}
              listingTitle={listing.title}
            />
          )}

          <div className="text-center">
            <p className="text-sm text-gray-500">
              Powered by <span className="font-semibold text-blue-600">A2Z Business Directory</span>
            </p>
          </div>
        </div>
      </main>

      {/* Popup Components */}
      <VideoPopup
        isOpen={videoPopupOpen}
        onClose={() => setVideoPopupOpen(false)}
        videoUrl={listing?.video_url || profile?.global_video_url}
        videoType={listing?.video_type || profile?.global_video_type}
        businessName={profile?.display_name}
      />

      <MenuPopup
        isOpen={menuPopupOpen}
        onClose={() => setMenuPopupOpen(false)}
        menuImages={listing?.menu_images || profile?.global_menu_images}
        businessName={profile?.display_name}
      />

      <NewProductsPopup
        isOpen={productsPopupOpen}
        onClose={() => setProductsPopupOpen(false)}
        profileId={profile?.id}
        businessName={profile?.display_name}
      />

      <MessageConsentPopup
        isOpen={messageConsent.isOpen}
        onClose={messageConsent.handleClose}
        onAccept={messageConsent.handleAccept}
        onDecline={messageConsent.handleDecline}
        businessName={profile?.display_name || 'Business'}
      />
    </div>
    </>
  )
}
