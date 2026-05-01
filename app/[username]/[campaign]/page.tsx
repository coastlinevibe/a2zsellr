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
} from '@/components/ui/listing-layouts'
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
  enable_message_consent?: boolean
}

interface Profile {
  id: string
  display_name: string
  avatar_url: string | null
  bio: string | null
  phone_number: string | null
  subscription_tier?: string | null
  business_category?: string | null
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
  const [bannerImages, setBannerImages] = useState<any[]>([])
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
    // If campaign is empty or undefined, this is actually a profile request
    if (!params.campaign || params.campaign === '') {
      router.push(`/shop/${params.username}`)
      return
    }
    
    fetchListingData()
  }, [params.username, params.campaign])

  const fetchListingData = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/public-listings/${params.username}/${params.campaign}`)
      
      const payload = await response.json().catch(() => null)

      if (!response.ok || !payload) {
        console.error('🔴 [CAMPAIGN_PAGE] Response not ok or no payload')
        throw new Error(payload?.error || 'Failed to load listing')
      }

      if (!payload.listing || !payload.profile) {
        console.error('🔴 [CAMPAIGN_PAGE] Missing listing or profile in payload')
        throw new Error(payload.error || 'Listing not found')
      }

      setListing(payload.listing)
      setProfile(payload.profile)
      setProducts(Array.isArray(payload.products) ? payload.products : [])
      setBannerImages(Array.isArray(payload.bannerImages) ? payload.bannerImages : [])
      setReviewSummary(payload.reviewSummary ?? null)
    } catch (err: any) {
      console.error('🔴 [CAMPAIGN_PAGE] Error fetching campaign:', err)
      setError(err.message || 'Failed to load listing')
    } finally {
      setLoading(false)
    }
  }

  const getMediaItems = (): MediaItem[] => {
    const uploadedMedia = listing?.uploaded_media || []
    
    const uploadedItems: MediaItem[] = uploadedMedia.map((media: any) => ({
      id: media.id,
      name: media.name,
      url: media.url,
      type: media.type
    }))

    const productItems: MediaItem[] = products.map(product => ({
      id: product.id,
      name: product.name,
      url: product.image_url || '',
      type: 'image/jpeg',
      price: product.price_cents ? product.price_cents / 100 : undefined
    }))

    return [...uploadedItems, ...productItems]
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
      businessCategory: profile.business_category,
      avatarUrl: profile.avatar_url,
      bannerImages: bannerImages,
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
        // Share cancelled
      }
    } else {
      navigator.clipboard.writeText(shareUrl)
      alert('Link copied to clipboard!')
    }
  }

  const handleContactShop = () => {
    const whatsappNumber = profile?.phone_number
    
    if (!whatsappNumber) {
      alert('Contact information not available for this business.')
      return
    }
    
    let cleanNumber = whatsappNumber.replace(/[^0-9+]/g, '')
    
    if (cleanNumber.startsWith('0')) {
      cleanNumber = '27' + cleanNumber.substring(1)
    }
    else if (cleanNumber.startsWith('+')) {
      cleanNumber = cleanNumber.substring(1)
    }
    else if (!cleanNumber.startsWith('27') && cleanNumber.length === 9) {
      cleanNumber = '27' + cleanNumber
    }
    
    const message = `Hi! I'm interested in "${listing?.title}". Can you tell me more?`
    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`
    
    window.open(whatsappUrl, '_blank')
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

  const ogImage = 'https://www.a2zsellr.life/thumbnail.png'
  const pageUrl = typeof window !== 'undefined' ? window.location.href : `https://www.a2zsellr.life/${params.username}/${params.campaign}`
  const ogDescription = listing.message_template.length > 160 
    ? `${listing.message_template.substring(0, 157)}...` 
    : listing.message_template
  const ogTitle = `${listing.title} | ${profile?.display_name || 'Business'} - A2Z Sellr`

  return (
    <>
      <Head>
        <title>{ogTitle}</title>
        <meta name="description" content={ogDescription} />
        <link rel="canonical" href={pageUrl} />
        
        <meta property="og:type" content="website" />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:title" content={ogTitle} />
        <meta property="og:description" content={ogDescription} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:site_name" content="A2Z Sellr" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={ogTitle} />
        <meta name="twitter:description" content={ogDescription} />
        <meta name="twitter:image" content={ogImage} />
      </Head>
      
      <div className="min-h-screen bg-white">
        <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-full border-2 border-emerald-500 shadow-md overflow-hidden bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  {profile?.avatar_url ? (
                    <img 
                      src={profile.avatar_url} 
                      alt={profile.display_name}
                      className="w-full h-full object-cover"
                      loading="eager"
                    />
                  ) : (
                    <span className="text-sm font-bold text-emerald-700">
                      {profile?.display_name?.[0]?.toUpperCase() || 'B'}
                    </span>
                  )}
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">{profile?.display_name}</h1>
                  <p className="text-xs text-emerald-600 font-medium">{profile?.business_category || 'Business'}</p>
                </div>
              </div>
              <button
                onClick={handleShare}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-all duration-300"
                title="Share"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {renderLayout()}

          <div className="mt-12 space-y-6">
            {profile && listing && (
              <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl p-6 border border-emerald-200 shadow-lg">
                <MarketingActionBar
                  onVideoPopup={() => setVideoPopupOpen(true)}
                  onViewProfile={() => router.push(`/profile/${params.username}`)}
                  onChatWithSeller={handleContactShop}
                  onViewMenuPopup={() => setMenuPopupOpen(true)}
                  onNewProductsPopup={() => setProductsPopupOpen(true)}
                  onUpgrade={() => {}}
                  businessName={profile.display_name}
                  listingTitle={listing.title}
                  userTier={(profile.subscription_tier as 'free' | 'premium' | 'business') || 'free'}
                />
              </div>
            )}

            <div className="text-center py-6">
              <p className="text-sm text-gray-600">
                Powered by <span className="font-semibold text-emerald-600">A2Z Business Directory</span>
              </p>
            </div>
          </div>
        </main>

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
          isOpen={messageConsent.isOpen && listing?.enable_message_consent !== false}
          onClose={messageConsent.handleClose}
          onAccept={messageConsent.handleAccept}
          onDecline={messageConsent.handleDecline}
          businessName={profile?.display_name || 'Business'}
          businessAvatar={profile?.avatar_url || undefined}
        />
      </div>
    </>
  )
}
