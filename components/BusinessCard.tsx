'use client'

import { Star, MapPin, Phone, Globe, Crown } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

interface BusinessCardProps {
  business: {
    id: string
    display_name: string
    bio?: string
    business_category?: string
    business_location?: string
    verified_seller: boolean
    subscription_tier: 'free' | 'premium' | 'business'
    avatar_url?: string
    phone_number?: string
    website_url?: string
  }
  categoryName?: string
  locationName?: string
}

export function BusinessCard({ business, categoryName, locationName }: BusinessCardProps) {
  const getTierBadge = () => {
    const badges = {
      free: { text: 'Free', className: 'bg-gray-100 text-gray-700' },
      premium: { text: 'Premium', className: 'bg-orange-100 text-orange-700' },
      business: { text: 'Business', className: 'bg-blue-100 text-blue-700' }
    }
    return badges[business.subscription_tier] || badges.free
  }

  const tierBadge = getTierBadge()
  const username = `@${business.display_name?.toLowerCase().replace(/\s+/g, '') || 'business'}`

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
      {/* Header with gradient based on tier */}
      <div className={`h-32 relative ${
        business.subscription_tier === 'business' ? 'bg-gradient-to-br from-blue-400 to-blue-600' :
        business.subscription_tier === 'premium' ? 'bg-gradient-to-br from-orange-400 to-red-500' :
        'bg-gradient-to-br from-emerald-400 to-emerald-600'
      }`}>
        <div className="absolute top-3 left-3">
          <Badge className={`${tierBadge.className} text-xs font-bold flex items-center gap-1`}>
            {business.subscription_tier !== 'free' && <Crown className="h-3 w-3" />}
            {tierBadge.text}
          </Badge>
        </div>
        
        {business.verified_seller && (
          <div className="absolute top-3 right-3">
            <div className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
              <Star className="h-3 w-3" fill="currentColor" />
              Verified
            </div>
          </div>
        )}

        <div className="absolute bottom-3 left-3 text-white">
          <h3 className="text-lg font-bold">{business.display_name}</h3>
          <p className="text-sm opacity-90">
            {categoryName || business.business_category || 'Business'}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
          <MapPin className="h-4 w-4" />
          <span>{locationName || business.business_location || 'South Africa'}</span>
        </div>

        {business.bio && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {business.bio}
          </p>
        )}

        {/* Contact Info */}
        <div className="space-y-2 mb-4">
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

        {/* Action Button */}
        <Link
          href={`/directory/${username}/${business.subscription_tier}`}
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
