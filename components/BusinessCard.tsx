'use client'
import Link from 'next/link'
import { Star, MapPin, Phone, Globe, Crown, Sword, Zap, User, Image } from 'lucide-react'
import { ImageGallery } from '@/components/ui/carousel-circular-image-gallery'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'

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
  index?: number
}

export function BusinessCard({ business, categoryName, locationName, index = 0 }: ProfileCardProps) {
  const getTierBadge = () => {
    const badges = {
      free: { text: 'FREE', className: 'bg-gray-500 text-white border-2 border-black' },
      premium: { text: 'PREMIUM', className: 'bg-orange-500 text-white border-2 border-black' },
      business: { text: 'BUSINESS', className: 'bg-blue-500 text-white border-2 border-black' }
    }
    return badges[business.subscription_tier] || badges.free
  }

  const tierBadge = getTierBadge()
  const username = business.display_name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'business'

  return (
    <motion.div 
      className={`relative rounded-2xl border-4 border-black overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] ${
        business.subscription_tier === 'premium' ? 'bg-orange-50' :
        business.subscription_tier === 'business' ? 'bg-blue-50' :
        'bg-gray-50'
      }`}
      initial={{ 
        opacity: 0, 
        y: 50,
        rotate: -5,
        scale: 0.8
      }}
      animate={{ 
        opacity: 1, 
        y: 0,
        rotate: 0,
        scale: 1
      }}
      transition={{ 
        duration: 0.6,
        delay: index * 0.1,
        type: "spring",
        stiffness: 100,
        damping: 15
      }}
      whileHover={{
        scale: 1.02,
        rotate: 1,
        x: 2,
        y: -2,
        boxShadow: "8px 8px 0px 0px rgba(0,0,0,0.9)",
        transition: { duration: 0.2 }
      }}
      whileTap={{
        scale: 0.98,
        rotate: -1,
        transition: { duration: 0.1 }
      }}
    >
      {/* Tier Badge - Positioned at top right corner */}
      <motion.div 
        className="absolute top-2 right-2 z-10"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: index * 0.1 + 0.3, type: "spring", stiffness: 200 }}
      >
        <div className={`${tierBadge.className} px-3 py-1 rounded-lg text-xs font-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.9)]`}>
          {business.subscription_tier === 'free' && <Zap className="h-3 w-3 mr-1 inline" />}
          {business.subscription_tier === 'premium' && <Sword className="h-3 w-3 mr-1 inline" />}
          {business.subscription_tier === 'business' && <Crown className="h-3 w-3 mr-1 inline" />}
          {tierBadge.text}
        </div>
      </motion.div>
      {/* Header with solid colors based on tier */}
      <div className={`h-20 relative ${
        business.subscription_tier === 'premium' ? 'bg-orange-400' :
        business.subscription_tier === 'business' ? 'bg-blue-400' :
        'bg-gray-400'
      } border-b-4 border-black`}>
        

        {/* Profile Picture in Header - Top Left */}
        <motion.div 
          className="absolute top-3 left-3"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: index * 0.1 + 0.2, type: "spring", stiffness: 150 }}
        >
          {business.avatar_url ? (
            <img 
              src={business.avatar_url} 
              alt={business.display_name}
              className="w-12 h-12 rounded-lg object-cover border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]"
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)] flex items-center justify-center">
              <User className="w-6 h-6 text-black" />
            </div>
          )}
        </motion.div>

        {/* Name and Description next to Profile Picture */}
        <motion.div 
          className="absolute top-3 left-16 right-3 text-black"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: index * 0.1 + 0.4, duration: 0.5 }}
        >
          <h3 className="text-sm font-black leading-tight uppercase truncate pr-2">
            {business.display_name}
          </h3>
          <p className="text-xs font-bold leading-tight uppercase truncate pr-2">
            {categoryName || business.business_category || 'PROFESSIONAL'}
          </p>
          {business.bio && (
            <p className="text-xs font-bold mt-0.5 line-clamp-1 leading-tight truncate pr-2">
              {business.bio}
            </p>
          )}
        </motion.div>
      </div>

      {/* Gallery Showcase - Touching header */}
      <div className="overflow-hidden">
        {business.gallery_images && business.gallery_images.length > 0 ? (
          <ImageGallery 
            images={business.gallery_images}
            className="rounded-b-[9px] !min-h-[170px] !max-h-[170px] !h-[170px] !w-full overflow-hidden"
          />
        ) : (
          <div className="min-h-[170px] max-h-[170px] h-[170px] w-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border-b-4 border-black relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <svg width="100%" height="100%" viewBox="0 0 100 100" className="w-full h-full">
                <defs>
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="1"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>
            
            {/* Main Icon */}
            <div className="relative z-10 text-center">
              <svg 
                className="w-16 h-16 text-gray-400 mx-auto mb-2" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1.5} 
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                />
              </svg>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                No Gallery Images
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <motion.div 
        className="p-4"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: index * 0.1 + 0.5, duration: 0.5 }}
      >

        {/* Location Info */}
        <motion.div 
          className="flex items-center gap-2 mb-3 bg-yellow-300 p-2 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: index * 0.1 + 0.6, duration: 0.4 }}
          whileHover={{ scale: 1.02, x: 2, transition: { duration: 0.2 } }}
        >
          <MapPin className="h-4 w-4 text-black" />
          <span className="text-sm font-black text-black uppercase">{locationName || business.business_location || 'SOUTH AFRICA'}</span>
        </motion.div>

        {/* Contact Info */}
        {(business.phone_number || business.website_url) && (
          <div className="space-y-2 mb-4">
            {business.phone_number && (
              <motion.div 
                className="flex items-center gap-2 bg-blue-300 p-2 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 + 0.7, duration: 0.4 }}
                whileHover={{ scale: 1.02, x: 2, transition: { duration: 0.2 } }}
              >
                <Phone className="h-4 w-4 text-black" />
                <span className="text-sm font-black text-black">{business.phone_number}</span>
              </motion.div>
            )}
            {business.website_url && (
              <motion.div 
                className="flex items-center gap-2 bg-green-300 p-2 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 + 0.8, duration: 0.4 }}
                whileHover={{ scale: 1.02, x: 2, transition: { duration: 0.2 } }}
              >
                <Globe className="h-4 w-4 text-black" />
                <span className="text-sm font-black text-black truncate">{business.website_url}</span>
              </motion.div>
            )}
          </div>
        )}

        {/* Action Button */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: index * 0.1 + 0.9, duration: 0.4 }}
          whileTap={{ 
            scale: 0.95,
            rotate: -1,
            transition: { duration: 0.1 }
          }}
        >
          <Link
            href={`https://www.a2zsellr.life/profile/${username}`}
            className="w-full text-center text-sm font-black transition-all block"
            style={{
              background: business.subscription_tier === 'business' ? '#3b82f6' :
                         business.subscription_tier === 'premium' ? '#f97316' :
                         '#6b7280',
              fontFamily: 'inherit',
              padding: '0.6em 1.3em',
              fontWeight: 900,
              fontSize: '16px',
              border: '3px solid black',
              borderRadius: '0.4em',
              boxShadow: '0.1em 0.1em',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'block',
              color: '#FFFFFF'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translate(-0.05em, -0.05em)';
              e.currentTarget.style.boxShadow = '0.15em 0.15em';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translate(0, 0)';
              e.currentTarget.style.boxShadow = '0.1em 0.1em';
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'translate(0.05em, 0.05em)';
              e.currentTarget.style.boxShadow = '0.05em 0.05em';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'translate(-0.05em, -0.05em)';
              e.currentTarget.style.boxShadow = '0.15em 0.15em';
            }}
          >
            VIEW PROFILE
          </Link>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
