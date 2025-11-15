'use client'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Head from 'next/head'
import { supabase } from '@/lib/supabaseClient'
import { Star, MapPin, Phone, Globe, Clock, Mail, Crown, Share2, ChevronLeft, ChevronRight, Package, ShoppingBag, X, Check, Truck, Shield, MessageCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useCart } from '@/contexts/CartContext'
import CartButton from '@/components/CartButton'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface UserProfile {
  id: string
  display_name: string
  email: string | null
  avatar_url: string | null
  bio: string | null
  business_category: string | null
  business_location: string | null
  phone_number: string | null
  website_url: string | null
  business_hours: string | null
  subscription_tier: string | null
  verified_seller: boolean | null
  is_active: boolean
  created_at: string
  updated_at: string
  title: string | null
  description: string | null
  type: 'image' | 'video'
}

interface GalleryItem {
  id: string
  url: string
  title: string
  description: string
  type: 'image' | 'video'
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
  product_details: string | null
  category: string | null
  image_url: string | null
  images?: ProductImage[]
  price_cents: number | null
  is_active: boolean
}

// Helper function to create consistent profile URLs
const createProfileUrl = (displayName: string, productSlug?: string) => {
  // Use the display_name as-is for URLs to maintain compatibility
  const baseUrl = `https://www.a2zsellr.life/profile/${encodeURIComponent(displayName)}`
  return productSlug ? `${baseUrl}?product=${encodeURIComponent(productSlug)}` : baseUrl
}

export default function ProfilePage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const username = params?.username as string
  const productParam = searchParams?.get('product')
  
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [activeTab, setActiveTab] = useState('shop')
  const [todayHours, setTodayHours] = useState<string>('')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [productModalTab, setProductModalTab] = useState('description')
  const [quantity, setQuantity] = useState(1)
  const [showContactOptions, setShowContactOptions] = useState(false)
  const [currentProductImageIndex, setCurrentProductImageIndex] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [tierBadge, setTierBadge] = useState({ text: '', className: '' })
  const [metaTags, setMetaTags] = useState({
    title: '',
    description: '',
    image: '',
    url: ''
  })
  const [showHoursModal, setShowHoursModal] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviews, setReviews] = useState<any[]>([])
  const [reviewStats, setReviewStats] = useState({ averageRating: 0, totalReviews: 0 })
  const [scrollY, setScrollY] = useState(0)

  // Cart functionality
  const { addItem, isInCart, getCartItem } = useCart()

  const updateMetaTags = (product?: Product) => {
    if (typeof document === 'undefined') return // Skip on server-side
    
    let title: string = 'A2Z Business Directory'
    let description: string = 'South Africa\'s premier business directory'
    let image: string = 'https://www.a2zsellr.life/default-image.jpg'
    let url: string = 'https://www.a2zsellr.life'
    
    if (product && profile) {
      // Product-specific meta tags
      const priceText = product.price_cents 
        ? `R${(product.price_cents / 100).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : 'Contact for price'
      
      title = `${product.name} - ${profile.display_name} | A2Z Business Directory`
      description = `${product.description || product.name} - ${priceText}. Available from ${profile.display_name} on A2Z Business Directory.`
      image = product.image_url || 'https://www.a2zsellr.life/default-product-image.jpg'
      const productSlug = product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
      url = createProfileUrl(profile.display_name, productSlug)
    } else if (profile) {
      // Profile-specific meta tags
      title = `${profile.display_name} | A2Z Business Directory`
      description = `${profile.bio || `Check out ${profile.display_name}'s business profile`} - ${profile.business_category || 'Business'} in ${profile.business_location || 'South Africa'}`
      image = profile.avatar_url || 'https://www.a2zsellr.life/default-avatar.jpg'
      url = createProfileUrl(profile.display_name)
    }
    
    // Update document title
    document.title = title
    
    // Update or create meta tags
    const updateMetaTag = (property: string, content: string) => {
      let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement
      if (!meta) {
        meta = document.createElement('meta')
        meta.setAttribute('property', property)
        document.head.appendChild(meta)
      }
      meta.setAttribute('content', content)
    }
    
    const updateMetaName = (name: string, content: string) => {
      let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement
      if (!meta) {
        meta = document.createElement('meta')
        meta.setAttribute('name', name)
        document.head.appendChild(meta)
      }
      meta.setAttribute('content', content)
    }
    
    // Update meta tags
    updateMetaName('description', description)
    
    // Open Graph tags
    updateMetaTag('og:type', 'website')
    updateMetaTag('og:url', url)
    updateMetaTag('og:title', title)
    updateMetaTag('og:description', description)
    updateMetaTag('og:image', image)
    updateMetaTag('og:site_name', 'A2Z Business Directory')
    
    // Twitter tags
    updateMetaTag('twitter:card', 'summary_large_image')
    updateMetaTag('twitter:url', url)
    updateMetaTag('twitter:title', title)
    updateMetaTag('twitter:description', description)
    updateMetaTag('twitter:image', image)
    
    setMetaTags({ title, description, image, url })
  }

  const handleShareProduct = (product: Product) => {
    if (!profile) return
    
    // Create URL with product parameter to open the product modal
    const productSlug = product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    const shareUrl = createProfileUrl(profile.display_name, productSlug)
    const shareText = `Check out "${product.name}" from ${profile.display_name} on A2Z Business Directory!`
    
    if (navigator.share) {
      // Use native sharing if available (mobile)
      navigator.share({
        title: `${product.name} - ${profile.display_name}`,
        text: shareText,
        url: shareUrl,
      }).catch(console.error)
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(`${shareText}\n${shareUrl}`).then(() => {
        alert('Product link copied to clipboard!')
      }).catch(() => {
        // Fallback: Show share dialog with the link
        prompt('Copy this link to share:', shareUrl)
      })
    }
  }

  const handleContactSeller = () => {
    setShowContactOptions(!showContactOptions)
    trackProfileClick(profile.id)
  }

  const handleWhatsAppContact = (product: Product) => {
    if (!profile?.phone_number) {
      alert('Phone number not available for this business.')
      return
    }

    const phoneNumber = profile.phone_number.replace(/\D/g, '') // Remove non-digits
    const priceText = product.price_cents 
      ? `R${(product.price_cents / 100).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : 'Contact for price'
    
    const message = `Hi ${profile.display_name}! 

I'm interested in this product from your A2Z Business Directory profile:

📦 Product: ${product.name}
💰 Price: ${priceText}
${product.description ? `📝 Description: ${product.description}` : ''}

❓ I want this product - is it still available?

Thank you!`

    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
    trackProfileClick(profile.id)
    setShowContactOptions(false)
  }

  const handleEmailContact = (product: Product) => {
    if (!profile?.email) {
      alert('Email not available for this business.')
      return
    }

    const priceText = product.price_cents 
      ? `R${(product.price_cents / 100).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : 'Contact for price'

    const subject = `Inquiry about ${product.name} - A2Z Business Directory`
    const body = `Hi ${profile.display_name},

I'm interested in this product from your A2Z Business Directory profile:

Product: ${product.name}
Price: ${priceText}
${product.description ? `Description: ${product.description}` : ''}

I want this product - is it still available?

Thank you!

Best regards`

    const mailtoUrl = `mailto:${profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.open(mailtoUrl, '_blank')
    trackProfileClick(profile.id)
    setShowContactOptions(false)
  }

  const handleAddToCart = (product: Product) => {
    if (!profile || !product.price_cents) {
      alert('Product price not available')
      return
    }

    addItem({
      productId: product.id,
      name: product.name,
      price: product.price_cents,
      image: product.image_url || undefined,
      businessId: profile.id,
      businessName: profile.display_name,
      quantity: quantity
    })

    alert(`✅ ${product.name} added to cart!`)
    trackProfileClick(profile.id)
    setQuantity(1) // Reset quantity
  }

  // Check if profile owner has Premium or Business tier (enables e-commerce)
  const isEcommerceEnabled = () => {
    return profile?.subscription_tier === 'premium' || profile?.subscription_tier === 'business'
  }

  // Fetch reviews for the profile
  const fetchReviews = async (profileId: string) => {
    try {
      const { data: reviewsData, error } = await supabase
        .from('profile_reviews')
        .select('*')
        .eq('profile_id', profileId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error

      setReviews(reviewsData || [])
      
      // Calculate review statistics
      if (reviewsData && reviewsData.length > 0) {
        const totalRating = reviewsData.reduce((sum, review) => sum + review.rating, 0)
        const averageRating = totalRating / reviewsData.length
        setReviewStats({
          averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
          totalReviews: reviewsData.length
        })
      } else {
        setReviewStats({ averageRating: 0, totalReviews: 0 })
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
    }
  }

  // Handle review submission
  const handleSubmitReview = async () => {
    if (!profile || reviewRating === 0) {
      alert('Please select a rating')
      return
    }

    setSubmittingReview(true)
    try {
      const { error } = await supabase
        .from('profile_reviews')
        .insert({
          profile_id: profile.id,
          customer_id: null, // For now, anonymous reviews
          rating: reviewRating,
          review_text: reviewText.trim() || null,
          is_verified: false,
          is_active: true
        })

      if (error) throw error

      alert('✅ Review submitted successfully!')
      setShowReviewModal(false)
      setReviewRating(0)
      setReviewText('')
      
      // Refresh reviews display
      await fetchReviews(profile.id)
    } catch (error) {
      console.error('Error submitting review:', error)
      alert('❌ Failed to submit review. Please try again.')
    } finally {
      setSubmittingReview(false)
    }
  }

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (username) {
      fetchProfile()
    }
  }, [username])

  useEffect(() => {
    if (profile) {
      setTierBadge(getTierBadge())
    }
  }, [profile])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      
      // Clean username (remove @ if present and normalize)
      const cleanUsername = username.replace('@', '').trim()
      
      // Try multiple lookup strategies to handle different display_name formats
      let profileData = null
      let profileError = null
      
      // Strategy 1: Exact match (for backward compatibility)
      const { data: exactMatch, error: exactError } = await supabase
        .from('profiles')
        .select('*')
        .eq('display_name', cleanUsername)
        .eq('is_active', true)
        .single()
      
      if (exactMatch && !exactError) {
        profileData = exactMatch
      } else {
        // Strategy 2: Case-insensitive match
        const { data: iLikeMatch, error: iLikeError } = await supabase
          .from('profiles')
          .select('*')
          .ilike('display_name', cleanUsername)
          .eq('is_active', true)
          .single()
        
        if (iLikeMatch && !iLikeError) {
          profileData = iLikeMatch
        } else {
          // Strategy 3: Handle URL-encoded spaces and special characters
          const decodedUsername = decodeURIComponent(cleanUsername).replace(/[-_]/g, ' ')
          const { data: decodedMatch, error: decodedError } = await supabase
            .from('profiles')
            .select('*')
            .ilike('display_name', decodedUsername)
            .eq('is_active', true)
            .single()
          
          if (decodedMatch && !decodedError) {
            profileData = decodedMatch
          } else {
            profileError = decodedError || iLikeError || exactError
          }
        }
      }

      if (profileError) throw profileError

      setProfile(profileData)
      
      // Track profile view
      await trackProfileView(profileData.id)
      
      // Parse today's hours if available
      if (profileData.business_hours) {
        const hours = getTodayHours(profileData.business_hours)
        setTodayHours(hours)
      }

      // Fetch gallery items from database
      const { data: galleryData, error: galleryError } = await supabase
        .from('profile_gallery')
        .select('id, image_url, caption')
        .eq('profile_id', profileData.id)
        .order('created_at', { ascending: false })

      if (!galleryError && galleryData) {
        const formattedGallery = galleryData.map(item => ({
          id: item.id.toString(),
          url: item.image_url,
          title: item.caption || 'Gallery Image',
          description: item.caption || '',
          type: 'image' as const
        }))
        setGalleryItems(formattedGallery)
      }

      // Fetch products
      const { data: productsData, error: productsError } = await supabase
        .from('profile_products')
        .select('*')
        .eq('profile_id', profileData.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (!productsError && productsData) {
        setProducts(productsData)
        
        // Check if there's a product parameter in the URL to auto-open
        const productParam = searchParams.get('product')
        if (productParam) {
          // Find the product by matching the slug
          const targetProduct = productsData.find(product => {
            const productSlug = product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
            return productSlug === decodeURIComponent(productParam)
          })
          
          if (targetProduct) {
            setSelectedProduct(targetProduct)
            setActiveTab('shop') // Make sure we're on the shop tab
            updateMetaTags(targetProduct) // Update meta tags for the specific product
          }
        } else {
          updateMetaTags() // Update meta tags for the profile
        }
      } else {
        updateMetaTags() // Update meta tags for the profile even if no products
      }

      // Fetch reviews for the profile
      await fetchReviews(profileData.id)

    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const trackProfileView = async (profileId: string) => {
    try {
      // Check if we've already tracked a view for this profile in this session
      const sessionKey = `profile_view_${profileId}`
      const lastViewTime = sessionStorage.getItem(sessionKey)
      const now = Date.now()
      
      // Only track if we haven't viewed this profile in the last 30 minutes
      if (lastViewTime && (now - parseInt(lastViewTime)) < 30 * 60 * 1000) {
        return
      }

      // Track the view via API endpoint (works for anonymous users)
      const response = await fetch('/api/track-view', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profileId,
          type: 'view'
        })
      })

      if (response.ok) {
        // Store the view time in session storage
        sessionStorage.setItem(sessionKey, now.toString())
        console.log('✅ Profile view tracked successfully')
      } else {
        console.error('Failed to track profile view:', await response.text())
      }
    } catch (error) {
      console.error('Error tracking profile view:', error)
    }
  }

  const trackProfileClick = async (profileId: string) => {
    try {
      const response = await fetch('/api/track-view', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profileId,
          type: 'click'
        })
      })

      if (response.ok) {
        console.log('✅ Profile click tracked successfully')
      } else {
        console.error('Failed to track profile click:', await response.text())
      }
    } catch (error) {
      console.error('Error tracking profile click:', error)
    }
  }

  const getTodayHours = (hoursString: string) => {
    if (!hoursString) return 'Hours not available'
    
    try {
      // Try to parse as JSON first (new format)
      const schedule = JSON.parse(hoursString)
      const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
      const todaySchedule = schedule[today]
      
      if (!todaySchedule) return 'Hours not available'
      if (todaySchedule.closed) return 'Closed today'
      
      return `${todaySchedule.open} - ${todaySchedule.close}`
    } catch (error) {
      // Fallback to old text format parsing
      const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })
      const todayShort = today.substring(0, 3)
      
      const lines = hoursString.split('\n')
      for (const line of lines) {
        const trimmedLine = line.trim()
        if (trimmedLine.toLowerCase().includes(today.toLowerCase()) || 
            trimmedLine.toLowerCase().includes(todayShort.toLowerCase())) {
          const colonIndex = trimmedLine.indexOf(':')
          if (colonIndex !== -1) {
            return trimmedLine.substring(colonIndex + 1).trim()
          }
        }
      }
      
      return 'Check full schedule'
    }
  }

  const getAllHours = (hoursString: string) => {
    if (!hoursString) return []
    
    try {
      // Try to parse as JSON first (new format)
      const schedule = JSON.parse(hoursString)
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      return days.map(day => ({
        day: day.charAt(0).toUpperCase() + day.slice(1),
        hours: schedule[day]?.closed ? 'Closed' : `${schedule[day]?.open} - ${schedule[day]?.close}`
      }))
    } catch (error) {
      // Fallback to old text format parsing
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

  const getTierBadge = () => {
    if (!profile) return { text: 'Free', className: 'bg-gray-100 text-gray-700 rounded-[9px]' }
    
    const badges = {
      free: { text: 'Free', className: 'bg-gray-100 text-gray-700 rounded-[9px]' },
      premium: { text: 'Premium', className: 'bg-orange-100 text-orange-700 rounded-[9px]' },
      business: { text: 'Business', className: 'bg-blue-100 text-blue-700 rounded-[9px]' }
    }
    const tier = (profile.subscription_tier || 'free') as keyof typeof badges
    return badges[tier]
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % galleryItems.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + galleryItems.length) % galleryItems.length)
  }

  const closeProductModal = () => {
    setSelectedProduct(null)
    setQuantity(1)
    setProductModalTab('description')
    setCurrentProductImageIndex(0)
  }

  const increaseQuantity = () => {
    setQuantity(prev => prev + 1)
  }

  const decreaseQuantity = () => {
    setQuantity(prev => prev > 1 ? prev - 1 : 1)
  }

  const renderStars = (rating: number) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star key={i} className={`w-4 h-4 ${i <= Math.round(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
      )
    }
    return stars
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h1>
          <p className="text-gray-600 mb-4">The profile you're looking for doesn't exist.</p>
          <Link href="/" className="text-emerald-600 hover:text-emerald-700">
            Back to Directory
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Gallery Slider */}
      <div className="relative bg-gray-100 overflow-hidden" style={{ height: '320px', maxWidth: '1500px', margin: '0 auto' }}>
        {galleryItems.length > 0 ? (
          <>
            <img
              src={galleryItems[currentImageIndex]?.url}
              alt={galleryItems[currentImageIndex]?.title || profile.display_name}
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
                  {profile.display_name[0]?.toUpperCase()}
                </span>
              </div>
              <p className="text-emerald-600 font-medium">{profile.display_name}</p>
            </div>
          </div>
        )}
        
        {/* Back button overlay */}
        <Link 
          href="/"
          className="absolute top-4 left-4 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center"
        >
          <ChevronLeft className="w-4 h-4" />
        </Link>
      </div>

      {/* Business Info Card - Compact Layout */}
      <div className="bg-white px-4 py-4 border-b border-gray-100">
        {/* Top Row: Avatar, Name, Badges, Cart */}
        <div className="flex items-start gap-3 mb-3">
          {profile.avatar_url && (
            <img 
              src={profile.avatar_url} 
              alt={profile.display_name} 
              className="w-14 h-14 rounded-lg object-cover border border-gray-200 flex-shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-lg font-bold text-gray-900">{profile.display_name}</h1>
              <div className="flex gap-1">
                <Badge className={`${tierBadge.className} text-xs flex-shrink-0`}>
                  {profile.subscription_tier !== 'free' && <Crown className="h-3 w-3 mr-1" />}
                  {tierBadge.text}
                </Badge>
                {profile.verified_seller && (
                  <Badge className="bg-blue-100 text-blue-700 text-xs flex-shrink-0">
                    <Star className="h-3 w-3 mr-1" fill="currentColor" />
                    Verified
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Rating, Category, Hours in one line */}
            <div className="flex items-center gap-2 text-sm flex-wrap mb-3">
              {(profile.subscription_tier === 'premium' || profile.subscription_tier === 'business') && (
                <div className="flex items-center gap-1">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3 h-3 ${i < Math.round(reviewStats.averageRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <span className="text-gray-600 font-medium">
                    {reviewStats.totalReviews > 0 ? `${reviewStats.averageRating} (${reviewStats.totalReviews})` : 'No reviews'}
                  </span>
                </div>
              )}
              {profile.business_category && (
                <>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-600">{profile.business_category}</span>
                </>
              )}
              <span className="text-gray-400">•</span>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-green-600 font-medium">
                  Open until {todayHours.split(' - ')[1] || '9:00 PM'}
                </span>
              </div>
            </div>
            
            {/* Bio */}
            {profile.bio && (
              <p className="text-sm text-gray-600 mb-3">{profile.bio}</p>
            )}
            
            {/* Action Buttons Row */}
            <div className="flex justify-start items-center gap-6 flex-wrap">
              {profile.phone_number && (
                <button 
                  className="action-btn"
                  onClick={() => {
                    const phoneNumber = profile.phone_number?.replace(/\D/g, '')
                    const message = `Hi ${profile.display_name}, I found your profile on A2Z Business Directory and would like to get in touch!`
                    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
                    window.open(whatsappUrl, '_blank')
                  }}
                >
                  <div>WhatsApp</div>
                  <svg xmlns="http://www.w3.org/2000/svg" width="25px" height="25px" viewBox="0 0 24 24" fill="none">
                    <path d="M11.6801 14.62L14.2401 12.06L11.6801 9.5" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"></path>
                    <path d="M4 12.0601H14.17" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"></path>
                    <path d="M12 4C16.42 4 20 7 20 12C20 17 16.42 20 12 20" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                </button>
              )}
              
              {profile.business_location && (
                <button 
                  className="action-btn"
                  onClick={() => {
                    const locationQuery = profile.business_location || ''
                    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationQuery)}`
                    window.open(mapsUrl, '_blank')
                  }}
                >
                  <div>Directions</div>
                  <svg xmlns="http://www.w3.org/2000/svg" width="25px" height="25px" viewBox="0 0 24 24" fill="none">
                    <path d="M11.6801 14.62L14.2401 12.06L11.6801 9.5" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"></path>
                    <path d="M4 12.0601H14.17" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"></path>
                    <path d="M12 4C16.42 4 20 7 20 12C20 17 16.42 20 12 20" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                </button>
              )}
              
              <button 
                className="action-btn"
                onClick={() => {
                  const shareUrl = createProfileUrl(profile.display_name)
                  const shareText = `Check out ${profile.display_name}'s business profile on A2Z Business Directory!`
                  
                  if (navigator.share) {
                    navigator.share({
                      title: `${profile.display_name} - A2Z Business Directory`,
                      text: shareText,
                      url: shareUrl,
                    }).catch(console.error)
                  } else {
                    navigator.clipboard.writeText(`${shareText}\n${shareUrl}`).then(() => {
                      alert('Profile link copied to clipboard!')
                    }).catch(() => {
                      prompt('Copy this link to share:', shareUrl)
                    })
                  }
                }}
              >
                <div>Share</div>
                <svg xmlns="http://www.w3.org/2000/svg" width="25px" height="25px" viewBox="0 0 24 24" fill="none">
                  <path d="M11.6801 14.62L14.2401 12.06L11.6801 9.5" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"></path>
                  <path d="M4 12.0601H14.17" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"></path>
                  <path d="M12 4C16.42 4 20 7 20 12C20 17 16.42 20 12 20" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
              </button>
              
              {profile.website_url && (
                <button 
                  className="action-btn"
                  onClick={() => window.open(profile.website_url || '', '_blank')}
                >
                  <div>Website</div>
                  <svg xmlns="http://www.w3.org/2000/svg" width="25px" height="25px" viewBox="0 0 24 24" fill="none">
                    <path d="M11.6801 14.62L14.2401 12.06L11.6801 9.5" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"></path>
                    <path d="M4 12.0601H14.17" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"></path>
                    <path d="M12 4C16.42 4 20 7 20 12C20 17 16.42 20 12 20" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                </button>
              )}

              {(profile.subscription_tier === 'premium' || profile.subscription_tier === 'business') && (
                <button 
                  className="action-btn"
                  onClick={() => setShowReviewModal(true)}
                >
                  <div>Leave A Review</div>
                  <svg xmlns="http://www.w3.org/2000/svg" width="25px" height="25px" viewBox="0 0 24 24" fill="none">
                    <path d="M11.6801 14.62L14.2401 12.06L11.6801 9.5" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"></path>
                    <path d="M4 12.0601H14.17" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"></path>
                    <path d="M12 4C16.42 4 20 7 20 12C20 17 16.42 20 12 20" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                </button>
              )}
            </div>
          </div>
          
          {/* Cart Button */}
          {profile.subscription_tier !== 'free' && (
            <div className="flex-shrink-0">
              <CartButton />
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .styled-action-button {
          padding: 15px 30px;
          font-size: 18px;
          text-transform: uppercase;
          letter-spacing: 2px;
          font-weight: 500;
          color: #ffffff;
          background-color: #4a4a4a;
          border: none;
          border-radius: 9px;
          box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease 0s;
          cursor: pointer;
          outline: none;
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: auto;
          min-height: 80px;
        }

        .styled-action-button::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: linear-gradient(
              45deg,
              #ffffff 25%,
              transparent 25%,
              transparent 75%,
              #ffffff 75%,
              #ffffff
            ),
            linear-gradient(
              45deg,
              #ffffff 25%,
              transparent 25%,
              transparent 75%,
              #ffffff 75%,
              #ffffff
            );
          background-size: 10px 10px;
          background-position:
            0 0,
            5px 5px;
          opacity: 0.1;
          transition: opacity 0.3s ease;
        }

        .styled-action-button:before {
          content: "";
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: rgba(255, 255, 255, 0.2);
          transform: rotate(45deg);
          transition: all 0.5s ease;
          opacity: 0;
        }

        .styled-action-button:hover {
          background-color: #2ee59d;
          box-shadow: 0 15px 20px rgba(46, 229, 157, 0.4);
          color: #fff;
          transform: translateY(-7px);
        }

        .styled-action-button:hover::after {
          opacity: 0.2;
        }

        .styled-action-button:hover:before {
          opacity: 1;
          top: -75%;
          left: -75%;
        }

        .styled-action-button:active {
          transform: translateY(-3px);
        }

        .styled-action-button.active {
          background-color: #2ee59d;
          box-shadow: 0 15px 20px rgba(46, 229, 157, 0.4);
          transform: translateY(-7px);
        }

        .styled-action-button.active::after {
          opacity: 0.2;
        }

        .styled-action-button.active::before {
          opacity: 1;
          top: -75%;
          left: -75%;
        }

        .styled-category-button {
          padding: 8px 16px;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 500;
          color: #ffffff;
          background-color: #4a4a4a;
          border: none;
          border-radius: 9px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease 0s;
          cursor: pointer;
          outline: none;
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: auto;
          min-height: 40px;
        }

        .styled-category-button::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: linear-gradient(
              45deg,
              #ffffff 25%,
              transparent 25%,
              transparent 75%,
              #ffffff 75%,
              #ffffff
            ),
            linear-gradient(
              45deg,
              #ffffff 25%,
              transparent 25%,
              transparent 75%,
              #ffffff 75%,
              #ffffff
            );
          background-size: 10px 10px;
          background-position:
            0 0,
            5px 5px;
          opacity: 0.1;
          transition: opacity 0.3s ease;
        }

        .styled-category-button:before {
          content: "";
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: rgba(255, 255, 255, 0.2);
          transform: rotate(45deg);
          transition: all 0.5s ease;
          opacity: 0;
        }

        .styled-category-button:hover {
          background-color: #2ee59d;
          box-shadow: 0 8px 12px rgba(46, 229, 157, 0.4);
          color: #fff;
          transform: translateY(-4px);
        }

        /* Category buttons - Simple text color change */
        .cat-btn-wrapper {
          display: inline-block;
        }

        .cat-btn {
          padding: 0.6em 1.2em;
          border: none;
          border-radius: 8px;
          background: transparent;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
        }

        .cat-btn:active {
          transform: scale(0.98);
        }

        .cat-btn > div {
          font-weight: 600;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #6b7280;
          white-space: nowrap;
          transition: color 0.3s ease;
        }

        .cat-btn:hover > div {
          color: #37aa87;
        }

        .cat-btn.active > div {
          color: #37aa87;
          font-weight: 700;
        }

        /* Smaller variant for action buttons */
        .cat-btn-sm {
          padding: 0.4em 0.8em;
          font-size: 11px;
          letter-spacing: 0.5px;
        }

        .cat-btn-sm svg {
          width: 16px;
          height: 16px;
        }

        .cat-btn-sm span {
          font-size: 10px;
        }

        /* Action buttons (UIverse style by catraco) */
        .action-btn {
          --color: #37aa87;
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
          transition: all 0.5s;
          border: none;
          background-color: transparent;
          cursor: pointer;
          gap: 0.5rem;
        }

        .action-btn > div {
          letter-spacing: 1px;
          font-weight: bold;
          background: var(--color);
          border-radius: 9px;
          color: white;
          padding: 0.75rem 1.25rem;
          font-size: 13px;
          text-transform: uppercase;
        }

        .action-btn::before {
          content: '';
          z-index: -1;
          background-color: var(--color);
          border: 2px solid var(--color);
          border-radius: 9px;
          width: 110%;
          height: 100%;
          position: absolute;
          transform: rotate(10deg);
          transition: 0.5s;
          opacity: 0.2;
        }

        .action-btn:hover {
          filter: brightness(1.2);
          transform: scale(1.08);
        }

        .action-btn:hover::before {
          transform: rotate(0deg);
          opacity: 1;
        }

        .action-btn svg {
          transform: translateX(-200%);
          transition: 0.5s;
          width: 0;
          opacity: 0;
          stroke: white;
        }

        .action-btn:hover svg {
          width: 20px;
          transform: translateX(0%);
          opacity: 1;
        }

        .action-btn:active {
          filter: brightness(1.3);
        }

        /* Mini action buttons for sticky header */
        .action-btn-mini {
          padding: 0.4rem 0.8rem;
          background: #37aa87;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          white-space: nowrap;
        }

        .action-btn-mini:hover {
          background: #2d8a6f;
          transform: scale(1.05);
        }

        .action-btn-mini:active {
          transform: scale(0.98);
        }
      `}</style>

      {/* Products Section */}
      <div className="bg-white">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">Products & Services</h2>
            <span className="text-sm text-gray-500">{products.length} items</span>
          </div>
          
          {/* Category Filter Buttons */}
          <div className="flex gap-3 mb-4 overflow-x-auto pb-2 pt-2 scrollbar-hide">
            <div className="cat-btn-wrapper">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`cat-btn ${selectedCategory === 'all' ? 'active' : ''}`}
              >
                <div>All Products</div>
              </button>
            </div>
            <div className="cat-btn-wrapper">
              <button
                onClick={() => setSelectedCategory('products')}
                className={`cat-btn ${selectedCategory === 'products' ? 'active' : ''}`}
              >
                <div>Products</div>
              </button>
            </div>
            <div className="cat-btn-wrapper">
              <button
                onClick={() => setSelectedCategory('services')}
                className={`cat-btn ${selectedCategory === 'services' ? 'active' : ''}`}
              >
                <div>Services</div>
              </button>
            </div>
            <div className="cat-btn-wrapper">
              <button
                onClick={() => setSelectedCategory('food')}
                className={`cat-btn ${selectedCategory === 'food' ? 'active' : ''}`}
              >
                <div>Food & Drinks</div>
              </button>
            </div>
            <div className="cat-btn-wrapper">
              <button
                onClick={() => setSelectedCategory('retail')}
                className={`cat-btn ${selectedCategory === 'retail' ? 'active' : ''}`}
              >
                <div>Retail Items</div>
              </button>
            </div>
          </div>
          
          {(selectedCategory === 'all' ? products : products.filter(p => p.category === selectedCategory)).length > 0 ? (
            <div className="overflow-x-auto">
              <div className="flex gap-4 pb-2" style={{ width: 'max-content' }}>
                {(selectedCategory === 'all' ? products : products.filter(p => p.category === selectedCategory)).map((product) => (
                  <div 
                    key={product.id} 
                    className="bg-white border border-gray-200 rounded-[9px] overflow-hidden cursor-pointer hover:shadow-md transition-shadow flex-shrink-0 w-48"
                    onClick={() => setSelectedProduct(product)}
                  >
                    {((product.images && product.images.length > 0) || product.image_url) ? (
                      <div className="relative">
                        <img
                          src={product.images && product.images.length > 0 ? product.images[0].url : product.image_url!}
                          alt={product.name}
                          className="w-full h-[146px] object-fill"
                        />
                        {/* Image count indicator */}
                        {product.images && product.images.length > 1 && (
                          <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                            <Package className="h-3 w-3" />
                            {product.images.length}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-full h-32 bg-gray-100 flex items-center justify-center">
                        <ShoppingBag className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <div className="p-3">
                      <h3 className="font-medium text-gray-900 mb-1 text-sm truncate">{product.name}</h3>
                      {product.price_cents ? (
                        <span className="text-sm font-semibold text-emerald-600">
                          R{(product.price_cents / 100).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500">Contact for price</span>
                      )}
                      {product.category && (
                        <div className="mt-1">
                          <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                            {product.category}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {/* View All Card */}
                <div className="bg-gray-50 border border-gray-200 rounded-[9px] flex-shrink-0 w-48 flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors">
                  <div className="text-center p-4">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2">
                      <ChevronRight className="w-4 h-4 text-gray-600" />
                    </div>
                    <span className="text-sm text-gray-600 font-medium">View All</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-[9px] p-8 text-center">
              <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-sm font-medium text-gray-900 mb-1">No products available</h3>
              <p className="text-xs text-gray-500">This business hasn't added any products yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Business Details */}
      <div className="bg-gray-50 px-4 py-6 space-y-6">
        {/* Contact Information */}
        <div className="bg-white rounded-[9px] border border-gray-200 p-4">
          <h3 className="font-medium text-gray-900 mb-3">Contact Information</h3>
          <div className="space-y-3">
            {profile.email && (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-[9px]">
                  <Mail className="h-4 w-4 text-red-600" />
                </div>
                <span className="text-sm text-gray-700">{profile.email}</span>
              </div>
            )}
            {profile.business_location && (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-[9px]">
                  <MapPin className="h-4 w-4 text-emerald-600" />
                </div>
                <span className="text-sm text-gray-700">{profile.business_location}</span>
              </div>
            )}
            {profile.phone_number && (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-[9px]">
                  <Phone className="h-4 w-4 text-blue-600" />
                </div>
                <span className="text-sm text-gray-700">{profile.phone_number}</span>
              </div>
            )}
            {profile.website_url && (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-[9px]">
                  <Globe className="h-4 w-4 text-purple-600" />
                </div>
                <a href={profile.website_url} target="_blank" rel="noopener noreferrer" className="text-sm text-purple-600 hover:underline">
                  {profile.website_url.replace(/^https?:\/\//, '')}
                </a>
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

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">{selectedProduct.name}</h2>
              <button
                onClick={closeProductModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Product Image Gallery */}
                <div className="space-y-4">
                  {/* Main Image */}
                  <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    {((selectedProduct.images && selectedProduct.images.length > 0) || selectedProduct.image_url) ? (
                      <>
                        <img
                          src={
                            selectedProduct.images && selectedProduct.images.length > 0
                              ? selectedProduct.images[currentProductImageIndex]?.url || selectedProduct.image_url!
                              : selectedProduct.image_url!
                          }
                          alt={selectedProduct.name}
                          className="w-full h-full object-cover"
                        />
                        
                        {/* Navigation Arrows */}
                        {selectedProduct.images && selectedProduct.images.length > 1 && (
                          <>
                            <button
                              onClick={() => setCurrentProductImageIndex(prev => 
                                prev === 0 ? selectedProduct.images!.length - 1 : prev - 1
                              )}
                              className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-60 hover:bg-opacity-80 text-white p-2 rounded-full transition-all"
                            >
                              <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => setCurrentProductImageIndex(prev => 
                                prev === selectedProduct.images!.length - 1 ? 0 : prev + 1
                              )}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-60 hover:bg-opacity-80 text-white p-2 rounded-full transition-all"
                            >
                              <ChevronRight className="w-5 h-5" />
                            </button>
                          </>
                        )}
                        
                        {/* Image Counter */}
                        {selectedProduct.images && selectedProduct.images.length > 1 && (
                          <div className="absolute bottom-3 right-3 bg-black bg-opacity-60 text-white text-sm px-3 py-1 rounded-full">
                            {currentProductImageIndex + 1} / {selectedProduct.images.length}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Package className="w-16 h-16" />
                      </div>
                    )}
                  </div>

                  {/* Thumbnail Strip */}
                  {selectedProduct.images && selectedProduct.images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {selectedProduct.images.map((img, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentProductImageIndex(index)}
                          className={`flex-shrink-0 w-20 h-20 rounded border-2 overflow-hidden transition-all ${
                            currentProductImageIndex === index
                              ? 'border-emerald-500 ring-2 ring-emerald-200'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <img
                            src={img.url}
                            alt={`${selectedProduct.name} ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div>
                  <div className="mb-4">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{selectedProduct.name}</h1>
                    {(profile.subscription_tier === 'premium' || profile.subscription_tier === 'business') && reviewStats.totalReviews > 0 && (
                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex items-center">
                          {renderStars(reviewStats.averageRating)}
                        </div>
                        <span className="text-sm text-gray-600">
                          {reviewStats.averageRating} ({reviewStats.totalReviews} review{reviewStats.totalReviews !== 1 ? 's' : ''})
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mb-6">
                    {selectedProduct.price_cents ? (
                      <div>
                        <span className="text-3xl font-bold text-emerald-600">
                          R{((selectedProduct.price_cents * quantity) / 100).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        {quantity > 1 && (
                          <div className="text-sm text-gray-500 mt-1">
                            {quantity} × R{(selectedProduct.price_cents / 100).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} each
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-2xl text-gray-500">Contact for price</span>
                    )}
                    <span className="ml-2 text-sm text-green-600">In stock</span>
                  </div>

                  {/* Tabs */}
                  <div className="mb-6 border-b border-gray-200">
                    <nav className="flex space-x-8">
                      {[
                        'description',
                        ...(selectedProduct.product_details ? ['details'] : []),
                        'contact'
                      ].map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setProductModalTab(tab)}
                          className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                            productModalTab === tab
                              ? 'border-emerald-500 text-emerald-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                      ))}
                    </nav>
                  </div>

                  {/* Tab Content */}
                  <div className="mb-8">
                    {productModalTab === 'description' && (
                      <div>
                        {selectedProduct.description ? (
                          <div 
                            className="text-gray-700 leading-relaxed prose prose-sm max-w-none prose-headings:text-gray-800 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-800"
                            dangerouslySetInnerHTML={{ __html: selectedProduct.description }}
                          />
                        ) : (
                          <p className="text-gray-500 italic">No description available.</p>
                        )}
                        {selectedProduct.category && (
                          <div className="mt-4">
                            <span className="inline-block bg-emerald-100 text-emerald-700 text-sm px-3 py-1 rounded-full">
                              {selectedProduct.category}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {productModalTab === 'details' && (
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-medium text-gray-900 mb-2">Product Details</h3>
                          {selectedProduct.product_details ? (
                            <ul className="space-y-2 text-gray-700">
                              {selectedProduct.product_details.split('\n').filter((detail: string) => detail.trim()).map((detail: string, index: number) => (
                                <li key={index} className="flex items-start">
                                  <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                  <span>{detail.trim()}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-gray-500 italic">No additional details available.</p>
                          )}
                        </div>
                      </div>
                    )}

                    {productModalTab === 'contact' && (
                      <div className="space-y-4">
                        <div className="flex items-center">
                          <Mail className="w-5 h-5 text-gray-500 mr-3" />
                          <div>
                            <h3 className="font-medium text-gray-900">Email</h3>
                            <p className="text-sm text-gray-500">{profile?.email || 'Email not available'}</p>
                          </div>
                        </div>
                        {profile?.phone_number && (
                          <div className="flex items-center">
                            <Phone className="w-5 h-5 text-gray-500 mr-3" />
                            <div>
                              <h3 className="font-medium text-gray-900">Phone</h3>
                              <p className="text-sm text-gray-500">{profile.phone_number}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Quantity and Actions */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center border border-gray-300 rounded-md">
                        <button
                          onClick={decreaseQuantity}
                          className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50"
                          disabled={quantity <= 1}
                        >
                          <span className="sr-only">Decrease quantity</span>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                          </svg>
                        </button>
                        <input
                          type="text"
                          value={quantity}
                          readOnly
                          className="w-12 text-center border-0 focus:ring-0 bg-transparent text-gray-900"
                        />
                        <button
                          onClick={increaseQuantity}
                          className="p-2 text-gray-600 hover:text-gray-900"
                        >
                          <span className="sr-only">Increase quantity</span>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {/* E-commerce enabled for Premium/Business tiers */}
                      {isEcommerceEnabled() && selectedProduct.price_cents ? (
                        <div className="space-y-3">
                          {/* Row: Add to Cart + Contact Seller */}
                          <div className="flex gap-3">
                            <button 
                              onClick={() => handleAddToCart(selectedProduct)}
                              className="w-1/2 bg-emerald-600 text-white py-3 px-6 rounded-[9px] hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 font-semibold"
                            >
                              <ShoppingBag className="w-5 h-5" />
                              Add to Cart
                            </button>

                            {/* Secondary Contact Button for Premium/Business */}
                            <div className="relative w-1/2">
                              <button 
                                onClick={handleContactSeller}
                                className="w-full bg-gray-600 text-white py-3 px-6 rounded-[9px] hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 font-semibold"
                              >
                                <MessageCircle className="w-5 h-5" />
                                Contact Seller
                              </button>
                              
                              {showContactOptions && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-[9px] shadow-lg z-10 overflow-hidden">
                                  <button
                                    onClick={() => handleWhatsAppContact(selectedProduct!)}
                                    className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 border-b border-gray-100"
                                  >
                                    <MessageCircle className="w-5 h-5 text-green-600" />
                                    <span className="text-gray-700">WhatsApp</span>
                                  </button>
                                  <button
                                    onClick={() => handleEmailContact(selectedProduct!)}
                                    className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3"
                                  >
                                    <Mail className="w-5 h-5 text-blue-600" />
                                    <span className="text-gray-700">Email</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Contact Seller only for Free tier or products without price */
                        <div className="relative">
                          <button 
                            onClick={handleContactSeller}
                            className="w-full bg-emerald-600 text-white py-3 px-6 rounded-[9px] hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                          >
                            <MessageCircle className="w-5 h-5" />
                            Contact Seller
                          </button>
                          
                          {showContactOptions && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-[9px] shadow-lg z-10 overflow-hidden">
                              <button
                                onClick={() => handleWhatsAppContact(selectedProduct!)}
                                className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 border-b border-gray-100"
                              >
                                <MessageCircle className="w-5 h-5 text-green-600" />
                                <span className="text-gray-700">WhatsApp</span>
                              </button>
                              <button
                                onClick={() => handleEmailContact(selectedProduct!)}
                                className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3"
                              >
                                <Mail className="w-5 h-5 text-blue-600" />
                                <span className="text-gray-700">Email</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <button 
                        onClick={() => handleShareProduct(selectedProduct!)}
                        className="w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-[9px] hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                      >
                        <Share2 className="w-5 h-5" />
                        Share Product
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
                  getAllHours(profile.business_hours).map((item, index) => (
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

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-xl font-semibold text-gray-900">Leave a Review</h2>
              <button
                onClick={() => {
                  setShowReviewModal(false)
                  setReviewRating(0)
                  setReviewText('')
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6">
              <div className="space-y-6">
                {/* Rating Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Rate your experience *
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setReviewRating(star)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star 
                          className={`w-8 h-8 ${
                            star <= reviewRating 
                              ? 'text-yellow-400 fill-current' 
                              : 'text-gray-300 hover:text-yellow-200'
                          }`} 
                        />
                      </button>
                    ))}
                    {reviewRating > 0 && (
                      <span className="ml-2 text-sm text-gray-600">
                        {reviewRating}/5 stars
                      </span>
                    )}
                  </div>
                </div>

                {/* Review Text Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Write a review (optional)
                  </label>
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Share your experience with this business..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                    rows={4}
                    maxLength={500}
                  />
                  <div className="text-right text-xs text-gray-500 mt-1">
                    {reviewText.length}/500 characters
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-3">
                  <Button
                    onClick={() => {
                      setShowReviewModal(false)
                      setReviewRating(0)
                      setReviewText('')
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmitReview}
                    disabled={reviewRating === 0 || submittingReview}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                  >
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
