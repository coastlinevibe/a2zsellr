'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MapPin, 
  Phone, 
  Globe, 
  Clock, 
  Star, 
  Crown,
  Sword,
  Zap,
  MessageCircle,
  Share2,
  ShoppingBag,
  Package,
  Shield,
  Truck,
  Heart,
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  X,
  FileText,
  Mail,
  Search
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface UserProfile {
  id: string
  display_name: string | null
  email: string | null
  avatar_url: string | null
  bio: string | null
  business_category: string | null
  business_location: string | null
  phone_number: string | null
  website_url: string | null
  address: string | null
  business_hours: any
  subscription_tier: 'free' | 'premium' | 'business'
  verified_seller: boolean
  early_adopter?: boolean
  facebook?: string | null
  instagram?: string | null
  twitter?: string | null
  youtube?: string | null
}

interface ProductImage {
  url: string
  alt?: string
  order: number
}

interface Product {
  id: string
  name: string
  description: string | null
  category: string | null
  image_url: string | null
  images?: ProductImage[] | string
  price_cents: number | null
  is_active: boolean
}

interface GalleryItem {
  id: string
  url: string
  title: string | null
}

interface PublicProfilePreviewProps {
  profile: UserProfile
}

const PublicProfilePreview = ({ profile }: PublicProfilePreviewProps) => {
  const [products, setProducts] = useState<Product[]>([])
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'products' | 'services' | 'food' | 'retail'>('all')
  const [todayHours, setTodayHours] = useState<string>('')
  const [showHoursModal, setShowHoursModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showTierTooltip, setShowTierTooltip] = useState(false)
  const [showClosedModal, setShowClosedModal] = useState(false)
  const [closedModalMessage, setClosedModalMessage] = useState('')
  const [deviceView, setDeviceView] = useState<'mobile' | 'laptop'>('laptop')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch products
        const { data: productsData, error: productsError } = await supabase
          .from('profile_products')
          .select('*')
          .eq('profile_id', profile.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false })

        if (productsError) throw productsError
        setProducts(productsData || [])

        // Fetch gallery items
        const { data: galleryData, error: galleryError } = await supabase
          .from('profile_gallery')
          .select('id, image_url, caption')
          .eq('profile_id', profile.id)
          .order('created_at', { ascending: false })

        if (!galleryError && galleryData) {
          const formattedGallery = galleryData.map(item => ({
            id: item.id.toString(),
            url: item.image_url,
            title: item.caption || 'Gallery Image'
          }))
          setGalleryItems(formattedGallery)
        } else {
          setGalleryItems([])
        }

        // Parse today's hours if available
        if (profile.business_hours) {
          const hours = getTodayHours(profile.business_hours)
          setTodayHours(hours)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (profile?.id) {
      fetchData()
    }
  }, [profile?.id])

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % galleryItems.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + galleryItems.length) % galleryItems.length)
  }

  const getTodayHours = (hoursString: string) => {
    if (!hoursString) return 'Hours not available'
    
    try {
      const schedule = JSON.parse(hoursString)
      const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
      const todaySchedule = schedule[today]
      
      if (!todaySchedule) return 'Hours not available'
      if (todaySchedule.closed) return 'Closed today'
      
      return `${todaySchedule.open} - ${todaySchedule.close}`
    } catch (error) {
      const todayShort = new Date().toLocaleDateString('en-US', { weekday: 'long' }).substring(0, 3)
      const lines = hoursString.split('\n')
      
      for (const line of lines) {
        const trimmedLine = line.trim()
        if (trimmedLine.toLowerCase().includes(todayShort.toLowerCase())) {
          const colonIndex = trimmedLine.indexOf(':')
          if (colonIndex !== -1) {
            return trimmedLine.substring(colonIndex + 1).trim()
          }
        }
      }
      return 'Hours not available'
    }
  }

  const isBusinessOpen = (hoursString: string) => {
    if (!hoursString) return { isOpen: false, status: 'Hours not set' }
    
    try {
      // Try to parse as JSON first (new format)
      const schedule = JSON.parse(hoursString)
      const now = new Date()
      const today = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
      const todaySchedule = schedule[today]
      
      if (!todaySchedule) return { isOpen: false, status: 'Hours not available' }
      if (todaySchedule.closed) return { isOpen: false, status: 'Closed today' }
      
      // Get current time in HH:MM format
      const currentTime = now.toTimeString().slice(0, 5)
      const openTime = todaySchedule.open
      const closeTime = todaySchedule.close
      
      // Convert times to minutes for comparison
      const timeToMinutes = (time: string) => {
        const [hours, minutes] = time.split(':').map(Number)
        return hours * 60 + minutes
      }
      
      const currentMinutes = timeToMinutes(currentTime)
      const openMinutes = timeToMinutes(openTime)
      const closeMinutes = timeToMinutes(closeTime)
      
      // Handle cases where business closes after midnight
      if (closeMinutes < openMinutes) {
        // Business is open across midnight (e.g., 22:00 - 02:00)
        const isOpen = currentMinutes >= openMinutes || currentMinutes <= closeMinutes
        return { 
          isOpen, 
          status: isOpen ? 'Open' : 'Closed',
          hours: `${openTime} - ${closeTime}`
        }
      } else {
        // Normal business hours (e.g., 09:00 - 17:00)
        const isOpen = currentMinutes >= openMinutes && currentMinutes <= closeMinutes
        return { 
          isOpen, 
          status: isOpen ? 'Open' : 'Closed',
          hours: `${openTime} - ${closeTime}`
        }
      }
    } catch (error) {
      // Fallback for old text format - just return closed since we can't parse it reliably
      return { isOpen: false, status: 'Check hours' }
    }
  }

  const getNextOpeningTime = (hoursString: string) => {
    if (!hoursString) return null
    
    try {
      const schedule = JSON.parse(hoursString)
      const now = new Date()
      const today = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
      const todaySchedule = schedule[today]
      
      // Convert time to minutes for comparison
      const timeToMinutes = (time: string) => {
        const [hours, minutes] = time.split(':').map(Number)
        return hours * 60 + minutes
      }
      
      const currentTime = now.toTimeString().slice(0, 5)
      const currentMinutes = timeToMinutes(currentTime)
      
      // Check if we can still open today
      if (todaySchedule && !todaySchedule.closed) {
        const openMinutes = timeToMinutes(todaySchedule.open)
        if (currentMinutes < openMinutes) {
          return `today at ${todaySchedule.open}`
        }
      }
      
      // Look for next opening day
      const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
      const todayIndex = days.indexOf(today)
      
      for (let i = 1; i <= 7; i++) {
        const nextDayIndex = (todayIndex + i) % 7
        const nextDay = days[nextDayIndex]
        const nextDaySchedule = schedule[nextDay]
        
        if (nextDaySchedule && !nextDaySchedule.closed) {
          const dayName = nextDay.charAt(0).toUpperCase() + nextDay.slice(1)
          if (i === 1) {
            return `tomorrow at ${nextDaySchedule.open}`
          } else {
            return `${dayName} at ${nextDaySchedule.open}`
          }
        }
      }
      
      return null
    } catch (error) {
      return null
    }
  }

  const getAllHours = (hoursString: string) => {
    if (!hoursString) return []
    
    try {
      const schedule = JSON.parse(hoursString)
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      return days.map(day => ({
        day: day.charAt(0).toUpperCase() + day.slice(1),
        hours: schedule[day]?.closed ? 'Closed' : `${schedule[day]?.open} - ${schedule[day]?.close}`
      }))
    } catch (error) {
      const lines = hoursString.split('\n')
      return lines.map(line => {
        const trimmed = line.trim()
        const colonIndex = trimmed.indexOf(':')
        if (colonIndex !== -1) {
          const day = trimmed.substring(0, colonIndex).trim()
          const hours = trimmed.substring(colonIndex + 1).trim()
          return { day, hours }
        }
        return { day: trimmed, hours: '' }
      }).filter(item => item.day && item.hours)
    }
  }

  const ensureAbsoluteUrl = (url: string | null): string => {
    if (!url) return ''
    
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url
    }
    
    if (url.startsWith('www.')) {
      return `https://${url}`
    }
    
    if (url.includes('facebook.com') || url.includes('instagram.com') || 
        url.includes('twitter.com') || url.includes('youtube.com') ||
        url.includes('x.com')) {
      return `https://${url}`
    }
    
    return `https://${url}`
  }

  const tierBadge = (() => {
    const mapping: Record<UserProfile['subscription_tier'], { text: string; className: string }> = {
      free: { text: 'Free', className: 'bg-gradient-to-r from-gray-400 via-gray-500 to-gray-600 text-white border border-gray-300 shadow-lg font-bold' },
      premium: { text: 'Premium', className: 'bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 text-white border border-amber-300 shadow-lg font-bold' },
      business: { text: 'Business', className: 'bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white border border-blue-400 shadow-lg font-bold' }
    }

    return mapping[profile.subscription_tier ?? 'free']
  })()

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter((product) => (product.category || '').toLowerCase() === selectedCategory)

  // Helper function to check business hours before actions
  const checkBusinessHoursBeforeAction = (action: () => void) => {
    if (!profile?.business_hours) {
      action()
      return
    }
    
    const businessStatus = isBusinessOpen(profile.business_hours)
    if (businessStatus.isOpen) {
      action()
    } else {
      const nextOpening = getNextOpeningTime(profile.business_hours)
      const message = nextOpening 
        ? `We're currently closed. We'll be open ${nextOpening}.`
        : "We're currently closed. Please check our business hours."
      setClosedModalMessage(message)
      setShowClosedModal(true)
    }
  }

  if (!profile) {
    return (
      <div className="bg-white rounded-[9px] border border-gray-200 p-6 text-center">
        <div className="text-center text-gray-500">
          <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No profile data available</p>
        </div>
      </div>
    )
  }

  const profileContent = (
    <div className="min-h-screen bg-white w-full" style={{ margin: '0', padding: '0', maxWidth: 'none' }}>
      {/* Hero Gallery Slider */}
      <motion.div 
        className="relative bg-gray-100 overflow-hidden" 
        style={{ height: '320px', maxWidth: '1500px', margin: '0 auto' }}
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
      >
        {galleryItems.length > 0 ? (
          <>
            <img
              src={galleryItems[currentImageIndex]?.url}
              alt={galleryItems[currentImageIndex]?.title || profile.display_name || 'Gallery'}
              className="w-full h-full object-cover"
            />
            {galleryItems.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {galleryItems.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full bg-emerald-100 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-200 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl font-bold text-emerald-700">
                  {profile.display_name?.[0]?.toUpperCase() || 'B'}
                </span>
              </div>
              <p className="text-emerald-600 font-medium">{profile.display_name || 'Business'}</p>
            </div>
          </div>
        )}
        
        {/* Back button overlay - disabled for preview */}
        <div className="absolute top-4 left-4 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center opacity-50">
          <ChevronLeft className="w-4 h-4" />
        </div>
      </motion.div>

      {/* Business Info Card - Header */}
      <div className="relative bg-white border-b border-gray-100">
        <div className="px-4 max-w-7xl mx-auto py-3">
          {/* Desktop Layout - EXACT COPY FROM PROFILE PAGE */}
          <div className="flex items-center gap-4 justify-between">
            {/* Left: Avatar + Name + Badges */}
            <div className="flex items-center gap-3 min-w-0 flex-1 max-w-xs">
              {profile.avatar_url && (
                <img 
                  src={profile.avatar_url} 
                  alt={profile.display_name || 'Business'} 
                  className="w-12 h-12 rounded-lg object-cover border border-gray-200 flex-shrink-0"
                />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-lg font-bold text-gray-900">
                    {profile.display_name}
                  </h1>
                  <div className="flex gap-1 flex-shrink-0">
                    <Badge className={`${
                      profile.subscription_tier === 'free' 
                        ? 'bg-gradient-to-r from-gray-400 via-gray-500 to-gray-600 text-white border border-gray-300 shadow-lg font-bold rounded-[9px]' 
                        : profile.subscription_tier === 'premium'
                        ? 'bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 text-white border border-amber-300 shadow-lg font-bold rounded-[9px]'
                        : 'bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white border border-blue-400 shadow-lg font-bold rounded-[9px]'
                    } text-xs`}>
                      {profile.subscription_tier === 'free' && <Zap className="h-2.5 w-2.5 mr-0.5 text-white drop-shadow-sm" />}
                      {profile.subscription_tier === 'premium' && <Sword className="h-2.5 w-2.5 mr-0.5 text-white drop-shadow-sm" />}
                      {profile.subscription_tier === 'business' && <Crown className="h-2.5 w-2.5 mr-0.5 text-white drop-shadow-sm" />}
                      {profile.subscription_tier === 'free' ? 'Free' : profile.subscription_tier === 'premium' ? 'Premium' : 'Business'}
                    </Badge>
                    {profile.verified_seller && (
                      <Badge className="bg-blue-100 text-blue-700 text-xs">
                        <Star className="h-2.5 w-2.5 mr-0.5" fill="currentColor" />
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>
                
                {/* Info Line */}
                <div className="flex items-center gap-2 flex-wrap text-gray-600 text-sm mt-1">
                  {(profile.subscription_tier === 'premium' || profile.subscription_tier === 'business') && (
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-2.5 h-2.5 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                      ))}
                      <span className="font-medium">4.5</span>
                    </div>
                  )}
                  {profile.business_category && (
                    <>
                      <span className="text-gray-400">•</span>
                      <span>{profile.business_category}</span>
                      {profile.business_hours && (
                        <>
                          <span className="text-gray-400">•</span>
                          <div className="flex items-center gap-1">
                            <div className={`w-1.5 h-1.5 rounded-full ${
                              isBusinessOpen(profile.business_hours).isOpen ? 'bg-green-500' : 'bg-red-500'
                            }`}></div>
                            <span className={`font-medium ${
                              isBusinessOpen(profile.business_hours).isOpen ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {isBusinessOpen(profile.business_hours).status}
                            </span>
                          </div>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
            
            {/* Center: Search Bar */}
            <div className="flex-1 max-w-lg mx-4">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 group-focus-within:text-emerald-600 transition-colors" />
                <input
                  type="text"
                  placeholder="Search by name, description, or details..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all text-sm bg-white hover:border-gray-400"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            
            {/* Right: Action Buttons Row */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {profile.phone_number && (
                <button 
                  className="p-2 rounded-lg transition-colors hover:bg-emerald-50"
                  title="WhatsApp"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                </button>
              )}
              
              {profile.address && (
                <button 
                  className="p-2 rounded-lg transition-colors hover:bg-emerald-50"
                  title="Directions"
                >
                  <MapPin className="w-4 h-4 text-emerald-600" />
                </button>
              )}
              
              <button 
                className="p-2 rounded-lg transition-colors hover:bg-emerald-50"
                title="Share"
              >
                <Share2 className="w-4 h-4 text-emerald-600" />
              </button>
              
              {profile.website_url && (
                <button 
                  className="p-2 rounded-lg transition-colors hover:bg-emerald-50"
                  title="Website"
                >
                  <Globe className="w-4 h-4 text-emerald-600" />
                </button>
              )}

              {(profile.subscription_tier === 'premium' || profile.subscription_tier === 'business') && (
                <button 
                  className="p-2 rounded-lg transition-colors hover:bg-emerald-50"
                  title="Leave A Review"
                >
                  <Star className="w-4 h-4 text-emerald-600" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .cat-btn-wrapper {
          flex-shrink: 0;
        }

        .cat-btn {
          background: #5cbdfd;
          color: black;
          font-family: inherit;
          padding: 0.6em 1.3em;
          font-weight: 900;
          font-size: 18px;
          border: 3px solid black;
          border-radius: 0.4em;
          box-shadow: 0.1em 0.1em;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .cat-btn:hover {
          transform: translate(-0.05em, -0.05em);
          box-shadow: 0.15em 0.15em;
        }

        .cat-btn:active {
          transform: translate(0.05em, 0.05em);
          box-shadow: 0.05em 0.05em;
        }

        .cat-btn.active {
          background: #2ee59d;
          transform: translate(-0.05em, -0.05em);
          box-shadow: 0.15em 0.15em;
        }

        .cat-btn > div {
          font-weight: 500;
          font-size: 17px;
          letter-spacing: 0.05em;
          white-space: nowrap;
        }

        .holographic-stack {
          display: flex;
          justify-content: flex-start;
          align-items: center;
          gap: 15px;
          perspective: 1000px;
        }

        .holographic-icon {
          position: relative;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          transform-style: preserve-3d;
        }

        .holographic-icon svg {
          width: 24px;
          height: 24px;
          position: relative;
          z-index: 3;
          transition: all 0.2s ease;
          filter: drop-shadow(0 0 4px currentColor);
        }

        .holographic-ring {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          border: 2px solid;
          border-top-color: transparent;
          border-bottom-color: transparent;
          animation: rotate 2s linear infinite;
          opacity: 0.6;
        }

        .holographic-particles {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: radial-gradient(
            circle,
            transparent 20%,
            currentColor 20%,
            currentColor 30%,
            transparent 30%,
            transparent 40%,
            currentColor 40%,
            currentColor 50%,
            transparent 50%
          );
          background-size: 12px 12px;
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .holographic-pulse {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          box-shadow: 0 0 20px currentColor;
          opacity: 0;
          transition: opacity 0.2s ease, transform 0.2s ease;
        }

        .holographic-icon.facebook {
          color: #1877f2;
        }

        .holographic-icon.facebook:hover {
          color: #0d5bd9;
          transform: translateY(-5px) rotateX(15deg);
        }

        .holographic-icon.instagram {
          color: #e4405f;
        }

        .holographic-icon.instagram:hover {
          color: #c13584;
          transform: translateY(-5px) rotateX(15deg);
        }

        .holographic-icon.twitter {
          color: #1da1f2;
        }

        .holographic-icon.twitter:hover {
          color: #0d8bd9;
          transform: translateY(-5px) rotateX(15deg);
        }

        .holographic-icon.youtube {
          color: #ff0000;
        }

        .holographic-icon.youtube:hover {
          color: #cc0000;
          transform: translateY(-5px) rotateX(15deg);
        }

        .holographic-icon:hover svg {
          transform: scale(1.2) rotate(10deg);
        }

        .holographic-icon:hover .holographic-particles {
          opacity: 0.3;
          animation: particles 2s linear infinite;
        }

        .holographic-icon:hover .holographic-pulse {
          opacity: 0.4;
          animation: pulse 1.5s ease-out infinite;
        }

        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes particles {
          from {
            background-position: 0 0;
          }
          to {
            background-position: 24px 24px;
          }
        }

        @keyframes pulse {
          0% {
            transform: scale(0.8);
            opacity: 0.4;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.2;
          }
          100% {
            transform: scale(1.4);
            opacity: 0;
          }
        }

        .holographic-icon::before {
          content: "";
          position: absolute;
          bottom: -5px;
          left: 20%;
          width: 60%;
          height: 20%;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 50%;
          filter: blur(5px);
          transform: rotateX(80deg) translateZ(-20px);
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .holographic-icon:hover::before {
          opacity: 0.4;
        }
      `}</style>

      {/* Products Section */}
      <motion.div className="bg-white">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">Products & Services</h2>
            <span className="text-sm text-gray-500">{products.length} items</span>
          </div>
          
          <AnimatePresence mode="wait">
            {(() => {
              return products.length > 0 ? (
              <motion.div 
                className="overflow-x-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div 
                  className="flex gap-4 pb-2 pt-5" 
                  style={{ width: 'max-content' }}
                  layout
                >
                  {products.map((product, index) => {
                    // Handle both JSON string and array formats for images
                    let imagesArray = []
                    if (product.images) {
                      if (typeof product.images === 'string') {
                        try {
                          imagesArray = JSON.parse(product.images)
                        } catch (e) {
                          imagesArray = []
                        }
                      } else if (Array.isArray(product.images)) {
                        imagesArray = product.images
                      }
                    }
                    
                    const hasImages = imagesArray && imagesArray.length > 0
                    const imageUrl = hasImages 
                      ? imagesArray[0]?.url || product.image_url
                      : product.image_url
                    
                    return (
                      <motion.div 
                        key={product.id}
                        className="w-64 bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer transition-all duration-300 flex-shrink-0 relative group flex flex-col"
                        style={{ height: '500px' }}
                        onClick={() => setSelectedProduct(product)}
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: -20 }}
                        transition={{ 
                          duration: 0.4, 
                          ease: [0.34, 1.56, 0.64, 1],
                          delay: index * 0.05
                        }}
                        whileHover={{ y: -5, boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)' }}
                      >
                        {/* Image Container - Auto-resizes to fit viewport */}
                        <div className="relative w-full h-56 overflow-hidden bg-gray-100">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={product.name}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ShoppingBag className="w-12 h-12 text-gray-300" />
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="p-4 flex-1 flex flex-col overflow-hidden">
                          {/* Category */}
                          <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                            {product.category || 'Product'}
                          </div>

                          {/* Title */}
                          <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                            {product.name}
                          </h2>

                          {/* Description */}
                          {product.description ? (
                            <div 
                              className="text-sm text-gray-600 leading-relaxed mb-3 line-clamp-3 break-words prose prose-sm max-w-none prose-headings:text-gray-800 prose-p:text-gray-600 prose-strong:text-gray-700 prose-em:text-gray-600"
                              dangerouslySetInnerHTML={{ __html: product.description }}
                            />
                          ) : (
                            <p className="text-sm text-gray-400 leading-relaxed mb-3 line-clamp-3 break-words">
                              Product description will appear here
                            </p>
                          )}

                          {/* Bottom Section */}
                          <div className="flex justify-between items-end gap-3 pt-3 border-t border-gray-100">
                            {/* Price */}
                            <div className="flex flex-col">
                              {product.price_cents ? (
                                <span className="text-2xl font-bold text-gray-900">
                                  R{(product.price_cents / 100).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                              ) : (
                                <span className="text-sm text-gray-500 font-medium">Contact for price</span>
                              )}
                            </div>

                            {/* View Button */}
                            <button 
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedProduct(product)
                              }}
                              className="bg-gradient-to-r from-gray-900 to-gray-700 hover:from-gray-800 hover:to-gray-600 text-white px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-md"
                            >
                              <span>View</span>
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Meta Info */}
                          <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                              ))}
                              <span className="text-xs text-gray-500 ml-1">128 Reviews</span>
                            </div>
                            <div className="text-xs font-semibold text-green-600">In Stock</div>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </motion.div>
              </motion.div>
              ) : (
                <motion.div 
                  className="bg-gray-50 rounded-[9px] p-8 text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
                >
                  <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-sm font-medium text-gray-900 mb-1">
                    No products available
                  </h3>
                  <p className="text-xs text-gray-500">
                    This business hasn't added any products yet.
                  </p>
                </motion.div>
              )
            })()}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Business Details */}
      <motion.div 
        className="bg-gray-50 w-full"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
      >
        <div className="px-4 md:px-4 py-6 space-y-6">
        {/* Profile Information */}
        <div className="bg-white rounded-[9px] border border-gray-200 p-4">
          <h3 className="font-medium text-gray-900 mb-3">Profile Information</h3>
          <div className="space-y-3">
            {/* Company Name */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-[9px]">
                {profile.subscription_tier === 'free' && <Zap className="h-4 w-4 text-blue-600" />}
                {profile.subscription_tier === 'premium' && <Sword className="h-4 w-4 text-orange-600" />}
                {profile.subscription_tier === 'business' && <Crown className="h-4 w-4 text-blue-600" />}
              </div>
              <span className="text-sm font-medium text-gray-900">{profile.display_name || 'Business Name'}</span>
            </div>
            
            {/* Description */}
            {profile.bio && (
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-100 rounded-[9px]">
                  <FileText className="h-4 w-4 text-green-600" />
                </div>
                <span className="text-sm text-gray-700">{profile.bio}</span>
              </div>
            )}
            
            {/* Address */}
            {profile.address && (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-[9px]">
                  <MapPin className="h-4 w-4 text-gray-600" />
                </div>
                <span className="text-sm text-gray-700">{profile.address}</span>
              </div>
            )}
            
            {/* Location */}
            {profile.business_location && (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-[9px]">
                  <MapPin className="h-4 w-4 text-orange-600" />
                </div>
                <span className="text-sm text-gray-700">{profile.business_location}</span>
              </div>
            )}
            
            {/* Phone Number */}
            {profile.phone_number && (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-[9px]">
                  <Phone className="h-4 w-4 text-blue-600" />
                </div>
                <span className="text-sm text-gray-700">{profile.phone_number}</span>
              </div>
            )}
            
            {/* Website */}
            {profile.website_url && (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-[9px]">
                  <Globe className="h-4 w-4 text-purple-600" />
                </div>
                <a href={ensureAbsoluteUrl(profile.website_url)} target="_blank" rel="noopener noreferrer" className="text-sm text-purple-600 hover:underline">
                  {ensureAbsoluteUrl(profile.website_url).replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}
            
            {/* Email */}
            {profile.email && (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-[9px]">
                  <Mail className="h-4 w-4 text-red-600" />
                </div>
                <span className="text-sm text-gray-700">{profile.email}</span>
              </div>
            )}
            
            {/* Social Media Links */}
            {(profile.facebook || profile.instagram || profile.twitter || profile.youtube) && (
              <div className="pt-3 border-t border-gray-100">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Follow Us</h4>
                <div className="holographic-stack">
                  {profile.facebook && (
                    <a
                      href={ensureAbsoluteUrl(profile.facebook)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="holographic-icon facebook"
                      title="Facebook"
                    >
                      <div className="holographic-ring"></div>
                      <div className="holographic-particles"></div>
                      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                      <div className="holographic-pulse"></div>
                    </a>
                  )}
                  
                  {profile.instagram && (
                    <a
                      href={ensureAbsoluteUrl(profile.instagram)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="holographic-icon instagram"
                      title="Instagram"
                    >
                      <div className="holographic-ring"></div>
                      <div className="holographic-particles"></div>
                      <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.9 3.9 0 0 0-1.417.923A3.9 3.9 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.9 3.9 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.9 3.9 0 0 0-.923-1.417A3.9 3.9 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599s.453.546.598.92c.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.5 2.5 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.5 2.5 0 0 1-.92-.598 2.5 2.5 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233s.008-2.388.046-3.231c.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92s.546-.453.92-.598c.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92m-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217m0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334"/>
                      </svg>
                      <div className="holographic-pulse"></div>
                    </a>
                  )}
                  
                  {profile.twitter && (
                    <a
                      href={ensureAbsoluteUrl(profile.twitter)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="holographic-icon twitter"
                      title="Twitter/X"
                    >
                      <div className="holographic-ring"></div>
                      <div className="holographic-particles"></div>
                      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                      </svg>
                      <div className="holographic-pulse"></div>
                    </a>
                  )}
                  
                  {profile.youtube && (
                    <a
                      href={ensureAbsoluteUrl(profile.youtube)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="holographic-icon youtube"
                      title="YouTube"
                    >
                      <div className="holographic-ring"></div>
                      <div className="holographic-particles"></div>
                      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                      <div className="holographic-pulse"></div>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Business Hours */}
        <div className="bg-white rounded-[9px] border border-gray-200 p-4">
          <h3 className="font-medium text-gray-900 mb-3">Business Hours</h3>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-[9px]">
              <Clock className="h-4 w-4 text-orange-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-700">Today: {todayHours || '9:00 AM - 6:00 PM'}</p>
              <button 
                onClick={() => setShowHoursModal(true)}
                className="text-xs text-emerald-600 hover:text-emerald-700 hover:underline"
              >
                See all hours
              </button>
            </div>
          </div>
        </div>
        </div>
      </motion.div>

      {/* Business Hours Modal */}
      {showHoursModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-xl font-semibold text-gray-900">Business Hours</h2>
              <button
                onClick={() => setShowHoursModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {profile?.business_hours ? (
                  getAllHours(profile?.business_hours || '').map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                      <span className="font-medium text-gray-900">{item.day}</span>
                      <span className="text-gray-600">{item.hours}</span>
                    </div>
                  ))
                ) : (
                  <div className="space-y-4">
                    <div className="text-center text-gray-500 mb-4">
                      <p>Business hours not yet set by the owner.</p>
                      <p className="text-sm">Default schedule shown below:</p>
                    </div>
                    {[
                      { day: 'Monday', hours: '9:00 AM - 6:00 PM' },
                      { day: 'Tuesday', hours: '9:00 AM - 6:00 PM' },
                      { day: 'Wednesday', hours: '9:00 AM - 6:00 PM' },
                      { day: 'Thursday', hours: '9:00 AM - 6:00 PM' },
                      { day: 'Friday', hours: '9:00 AM - 6:00 PM' },
                      { day: 'Saturday', hours: '9:00 AM - 6:00 PM' },
                      { day: 'Sunday', hours: 'Closed' }
                    ].map((item, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                        <span className="font-medium text-gray-900">{item.day}</span>
                        <span className="text-gray-600">{item.hours}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Closed Business Modal */}
      {showClosedModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-xl font-semibold text-gray-900">We're Currently Closed</h2>
              <button
                onClick={() => setShowClosedModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6">
              <div className="space-y-6">
                {/* Status Message */}
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-red-600" />
                  </div>
                  <p className="text-gray-700 mb-4">{closedModalMessage}</p>
                  <p className="text-sm text-gray-600">
                    If you want to order now, please contact us directly:
                  </p>
                </div>

                {/* Contact Options */}
                <div className="space-y-3">
                  {profile?.phone_number && (
                    <>
                      <button
                        onClick={() => {
                          const phoneNumber = profile.phone_number?.replace(/\D/g, '')
                          const message = `Hi ${profile.display_name}, I found your profile on A2Z Business Directory and would like to place an order even though you're currently closed.`
                          const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
                          window.open(whatsappUrl, '_blank')
                          setShowClosedModal(false)
                        }}
                        className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-3"
                      >
                        <MessageCircle className="w-5 h-5" />
                        <div className="text-left">
                          <div className="font-semibold">WhatsApp Us</div>
                          <div className="text-sm opacity-90">{profile.phone_number}</div>
                        </div>
                      </button>
                    </>
                  )}
                  
                  {profile?.email && (
                    <button
                      onClick={() => {
                        const subject = `Order Inquiry - ${profile.display_name}`
                        const body = `Hi ${profile.display_name},\n\nI found your profile on A2Z Business Directory and would like to place an order even though you're currently closed.\n\nPlease let me know when you're available.\n\nThank you!`
                        const mailtoUrl = `mailto:${profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
                        window.open(mailtoUrl, '_blank')
                        setShowClosedModal(false)
                      }}
                      className="w-full bg-gray-600 text-white py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-3"
                    >
                      <Mail className="w-5 h-5" />
                      <div className="text-left">
                        <div className="font-semibold">Email Us</div>
                        <div className="text-sm opacity-90">{profile.email}</div>
                      </div>
                    </button>
                  )}
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setShowClosedModal(false)}
                  className="w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen p-4 md:p-8">
      {/* Device Tabs */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex gap-4 justify-center flex-wrap">
          <button
            onClick={() => setDeviceView('laptop')}
            className={`px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 text-sm md:text-base ${
              deviceView === 'laptop'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/50'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 3H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h14l4 4V5c0-1.1-.9-2-2-2zm-2 12H4V5h14v10z"/>
            </svg>
            <span className="hidden sm:inline">Laptop</span>
          </button>
          <button
            onClick={() => setDeviceView('mobile')}
            className={`px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 text-sm md:text-base ${
              deviceView === 'mobile'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/50'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17 2H7c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-5 18c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm5-3H7V4h10v13z"/>
            </svg>
            <span className="hidden sm:inline">Mobile</span>
          </button>
        </div>
      </div>

      {/* Device Frames */}
      <div className="w-full flex justify-center px-2">
        <AnimatePresence mode="wait">
          {deviceView === 'laptop' ? (
            <motion.div
              key="laptop"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="w-full flex justify-center"
            >
              {/* Laptop Frame - Professional Design */}
              <style>{`
                .laptop-frame {
                  position: relative;
                  margin: auto;
                  max-width: 100%;
                  width: 100%;
                }
                
                .laptop-frame__screen {
                  position: relative;
                  z-index: 1;
                  padding: 3%;
                  border-radius: 2rem;
                  background: #ecf1f7;
                  background-image: linear-gradient(to bottom, #333, #111);
                  box-shadow: 0 0.1rem 0 #cfcfcf;
                  border: 2px solid #ccc;
                  overflow: hidden;
                }
                
                .laptop-frame__screen-content {
                  display: block;
                  width: 100%;
                  height: auto;
                  background: #fff;
                  border-radius: 1.5rem;
                  overflow-y: auto;
                  max-height: 80vh;
                }
                
                .laptop-frame__bottom {
                  position: relative;
                  z-index: 1;
                  margin-right: -7%;
                  margin-left: -7%;
                  height: 0.7rem;
                  background: #e9eff5;
                  background-image: linear-gradient(to right, #d2dde9 0%, #f9fcff 15%, #e5ebf2 40%, #e5ebf2 60%, #f9fcff 85%, #d2dde9 100%);
                }
                
                .laptop-frame__bottom::before {
                  display: block;
                  margin: 0 auto;
                  width: 20%;
                  height: 0.7rem;
                  border-radius: 0 0 0.2rem 0.2rem;
                  background: #f6f9fc;
                  background-image: linear-gradient(to right, #c3cfdb 0%, #f6f9fc 10%, #f6f9fc 90%, #c3cfdb 100%);
                  content: " ";
                }
                
                .laptop-frame__under {
                  position: absolute;
                  top: 100%;
                  left: 25%;
                  display: block;
                  width: 50%;
                  height: 1.5rem;
                  background: #e2e8f0;
                  background-image: linear-gradient(to bottom, #e2e8f0, #bec7d1);
                }
                
                .laptop-frame__under::before,
                .laptop-frame__under::after {
                  position: absolute;
                  top: 0%;
                  bottom: 0;
                  display: block;
                  width: 50%;
                  border-bottom-left-radius: 100%;
                  background: inherit;
                  content: " ";
                }
                
                .laptop-frame__under::before {
                  right: 100%;
                }
                
                .laptop-frame__under::after {
                  right: auto;
                  left: 100%;
                  border-bottom-right-radius: 100%;
                  border-bottom-left-radius: 0;
                }
                
                .laptop-frame__shadow {
                  position: absolute;
                  right: -10%;
                  bottom: -2.5rem;
                  left: -10%;
                  z-index: 0;
                  height: 2rem;
                  background: radial-gradient(ellipse closest-side, #000, transparent);
                  opacity: 0.5;
                }
              `}</style>
              
              <div className="laptop-frame w-full max-w-2xl md:max-w-4xl lg:max-w-5xl">
                <div className="laptop-frame__screen">
                  <div className="laptop-frame__screen-content">
                    {profileContent}
                  </div>
                </div>
                <div className="laptop-frame__bottom"></div>
                <div className="laptop-frame__under"></div>
                <div className="laptop-frame__shadow"></div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="mobile"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="w-full flex justify-center"
            >
              {/* Mobile Frame - Responsive */}
              <div className="relative w-full" style={{ maxWidth: '375px', aspectRatio: '375/812' }}>
                {/* Notch */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 z-20 w-2/3 h-1/12 bg-black rounded-b-3xl"></div>

                {/* Phone Body */}
                <div className="relative w-full h-full bg-black rounded-3xl shadow-2xl overflow-hidden border-4 md:border-8 border-black">
                  {/* Screen - Constrained to phone width */}
                  <div className="w-full h-full bg-white overflow-y-auto overflow-x-hidden text-sm md:text-base">
                    <div className="w-full scale-75 md:scale-100 origin-top">
                      {profileContent}
                    </div>
                  </div>
                </div>

                {/* Home Indicator */}
                <div className="absolute bottom-1 md:bottom-2 left-1/2 transform -translate-x-1/2 z-20 w-1/3 h-0.5 md:h-1 bg-black rounded-full"></div>

                {/* Shadow */}
                <div className="absolute -bottom-6 md:-bottom-8 left-1/2 transform -translate-x-1/2 w-full h-3 md:h-4 bg-black/30 rounded-full blur-xl"></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default PublicProfilePreview