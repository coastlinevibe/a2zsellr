'use client'
import Link from 'next/link'
import { Star, MapPin, Phone, Globe, Crown, User } from 'lucide-react'
import { ImageGallery } from '@/components/ui/carousel-circular-image-gallery'
import { Badge } from '@/components/ui/badge'

interface ProfileCardProps {
  business: {
    display_name: string
    bio?: string
    business_category?: string
    business_location?: string
    verified_seller: boolean
    subscription_tier: 'free' | 'premium' | 'business'
    avatar_url?: string
    phone_number?: string
    website_url?: string
    gallery_images?: Array<{
      id: string
      title: string
      url: string
    }>
  }
  categoryName?: string
  locationName?: string
}

export function BusinessCard({ business, categoryName, locationName }: ProfileCardProps) {
  const getTierBadge = () => {
    const badges = {
      free: { text: 'Free', className: 'bg-gray-100 text-gray-700' },
      premium: { text: 'Premium', className: 'bg-orange-100 text-orange-700' },
      business: { text: 'Business', className: 'bg-blue-100 text-blue-700' }
    }
    return badges[business.subscription_tier] || badges.free
  }

  const tierBadge = getTierBadge()
  const username = business.display_name?.toLowerCase().replace(/\s+/g, '') || 'business'

  return (
    <div className="relative bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
      {/* Tier Badge - Positioned at top right corner */}
      <div className="absolute top-2 right-2 z-10">
        <div className={`${tierBadge.className} px-3 py-1 rounded-full text-xs font-medium border border-white shadow-sm`}>
          {business.subscription_tier !== 'free' && <Crown className="h-3 w-3 mr-1 inline" />}
          {tierBadge.text}
        </div>
      </div>
      {/* Header with gradient based on tier */}
      <div className={`h-20 relative ${
        business.subscription_tier === 'business' ? 'bg-gradient-to-br from-blue-400 to-blue-600' :
        business.subscription_tier === 'premium' ? 'bg-gradient-to-br from-orange-400 to-red-500' :
        'bg-gradient-to-br from-emerald-400 to-emerald-600'
      }`}>
        

        {/* Profile Picture in Header - Top Left */}
        <div className="absolute top-3 left-3">
          {business.avatar_url ? (
            <img 
              src={business.avatar_url} 
              alt={business.display_name}
              className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-white/20 border-2 border-white shadow-sm flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
          )}
        </div>

        {/* Name and Description next to Profile Picture */}
        <div className="absolute top-3 left-16 text-white">
          <h3 className="text-sm font-bold leading-tight">{business.display_name}</h3>
          <p className="text-xs opacity-90 leading-tight">
            {categoryName || business.business_category || 'Professional'}
          </p>
          {business.bio && (
            <p className="text-xs opacity-75 mt-0.5 line-clamp-1 max-w-[180px] leading-tight">
              {business.bio}
            </p>
          )}
        </div>
      </div>

      {/* Gallery Showcase - Touching header */}
      {business.gallery_images && business.gallery_images.length > 0 && (
        <div className="overflow-hidden">
          <ImageGallery 
            images={business.gallery_images}
            className="rounded-b-[9px] !min-h-[170px] !max-h-[170px] !h-[170px] !w-full overflow-hidden"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-4">

        {/* Location Info */}
        <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
          <MapPin className="h-4 w-4" />
          <span>{locationName || business.business_location || 'South Africa'}</span>
        </div>

        {/* Contact Info */}
        {(business.phone_number || business.website_url) && (
          <div className="space-y-1 mb-4">
            {business.phone_number && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="h-4 w-4" />
                <span>{business.phone_number}</span>
              </div>
            )}
            {business.website_url && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Globe className="h-4 w-4" />
                <span className="truncate">{business.website_url}</span>
              </div>
            )}
          </div>
        )}

        {/* Action Button */}
        <Link
          href={`/profile/${username}`}
          className={`w-full py-2 px-4 rounded-lg text-center text-sm font-medium transition-colors block ${
            business.subscription_tier === 'business' ? 'bg-blue-600 hover:bg-blue-700 text-white' :
            business.subscription_tier === 'premium' ? 'bg-orange-600 hover:bg-orange-700 text-white' :
            'bg-emerald-600 hover:bg-emerald-700 text-white'
          }`}
        >
          View Profile
        </Link>
      </div>
    </div>
  )
}
