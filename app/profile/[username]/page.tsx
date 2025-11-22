'use client'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Head from 'next/head'
import { supabase } from '@/lib/supabaseClient'
import { Star, MapPin, Phone, Globe, Clock, Mail, Crown, Sword, Zap, Share2, ChevronLeft, ChevronRight, Package, ShoppingBag, X, Check, Truck, Shield, MessageCircle, FileText } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useCart } from '@/contexts/CartContext'
import CartButton from '@/components/CartButton'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

interface UserProfile {
  id: string
  display_name: string
  email: string | null
  avatar_url: string | null
  bio: string | null
  business_category: string | null
  business_location: string | null
  address: string | null
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
  facebook: string | null
  instagram: string | null
  twitter: string | null
  youtube: string | null
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

interface ProductTag {
  id: string
  name: string
  icon?: string
  color: string
  is_system_tag: boolean
}

interface Product {
  id: string
  name: string
  description: string | null
  product_details: string | null
  category: string | null
  image_url: string | null
  images?: ProductImage[]
  tags?: ProductTag[]
  price_cents: number | null
  is_active: boolean
}

// Helper function to create consistent profile URLs
const createProfileUrl = (displayName: string, productSlug?: string) => {
  // Convert display name to URL-friendly slug
  const profileSlug = displayName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  const baseUrl = `https://www.a2zsellr.life/profile/${profileSlug}`
  return productSlug ? `${baseUrl}?product=${encodeURIComponent(productSlug)}` : baseUrl
}

// Helper function to ensure URLs are absolute
const ensureAbsoluteUrl = (url: string | null): string => {
  if (!url) return ''
  
  // If URL already starts with http:// or https://, return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  
  // If URL starts with www., add https://
  if (url.startsWith('www.')) {
    return `https://${url}`
  }
  
  // For social media platforms, add https://
  if (url.includes('facebook.com') || url.includes('instagram.com') || 
      url.includes('twitter.com') || url.includes('youtube.com') ||
      url.includes('x.com')) {
    return `https://${url}`
  }
  
  // For other URLs, add https://
  return `https://${url}`
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
  const [showTierTooltip, setShowTierTooltip] = useState(false)

  const [reviewStats, setReviewStats] = useState({ averageRating: 0, totalReviews: 0 })

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
    if (profile?.id) {
      trackProfileClick(profile.id)
    }
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
    if (profile?.id) {
      trackProfileClick(profile.id)
    }
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
            // Strategy 4: Slug-to-name matching - get all profiles and match by generated slug
            const { data: allProfiles, error: allProfilesError } = await supabase
              .from('profiles')
              .select('*')
              .eq('is_active', true)
            
            if (allProfiles && !allProfilesError) {
              // Find profile where the generated slug matches the URL slug
              const matchingProfile = allProfiles.find(profile => {
                const profileSlug = profile.display_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
                return profileSlug === cleanUsername.toLowerCase()
              })
              
              if (matchingProfile) {
                profileData = matchingProfile
              } else {
                profileError = decodedError || iLikeError || exactError || allProfilesError
              }
            } else {
              profileError = decodedError || iLikeError || exactError || allProfilesError
            }
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

      // Fetch products with tags
      const { data: productsData, error: productsError } = await supabase
        .from('products_with_tags')
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
      free: { text: 'Free', className: 'bg-gradient-to-r from-gray-400 via-gray-500 to-gray-600 text-white border border-gray-300 shadow-lg font-bold rounded-[9px]' },
      premium: { text: 'Premium', className: 'bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 text-white border border-amber-300 shadow-lg font-bold rounded-[9px]' },
      business: { text: 'Business', className: 'bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white border border-blue-400 shadow-lg font-bold rounded-[9px]' }
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
      </motion.div>

      {/* Business Info Card - Header */}
      <div className="relative bg-white border-b border-gray-100">
        <div className="px-4 max-w-7xl mx-auto py-3">
          {/* Mobile Layout */}
          <div className="block md:hidden">
            {/* Top Row: PFP + Name + Business Tier + Reviews */}
            <div className="flex items-center gap-2 mb-2">
              {profile.avatar_url && (
                <img 
                  src={profile.avatar_url} 
                  alt={profile.display_name} 
                  className="w-10 h-10 rounded-lg object-cover border border-gray-200 flex-shrink-0"
                />
              )}
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <h1 className="text-base font-bold text-gray-900 truncate">
                  {profile.display_name}
                </h1>
                
                {/* Business Tier Badge - Mobile (icon only with tooltip) */}
                <div className="flex-shrink-0 relative">
                  <div 
                    className={`w-6 h-6 rounded-full flex items-center justify-center shadow-lg border cursor-pointer transition-transform hover:scale-110 ${
                      profile.subscription_tier === 'free' 
                        ? 'bg-gradient-to-r from-gray-400 via-gray-500 to-gray-600 border-gray-300' 
                        : profile.subscription_tier === 'premium'
                        ? 'bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 border-amber-300'
                        : 'bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 border-blue-400'
                    }`}
                    onClick={() => setShowTierTooltip(!showTierTooltip)}
                    onMouseEnter={() => setShowTierTooltip(true)}
                    onMouseLeave={() => setShowTierTooltip(false)}
                  >
                    {profile.subscription_tier === 'free' && <Zap className="h-3 w-3 text-white drop-shadow-sm" />}
                    {profile.subscription_tier === 'premium' && <Sword className="h-3 w-3 text-white drop-shadow-sm" />}
                    {profile.subscription_tier === 'business' && <Crown className="h-3 w-3 text-white drop-shadow-sm" />}
                  </div>
                  
                  {/* Tooltip */}
                  {showTierTooltip && (
                    <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                      {profile.subscription_tier === 'free' ? 'Free user' : 
                       profile.subscription_tier === 'premium' ? 'Premium user' : 'Business user'}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-black"></div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Reviews - Mobile */}
              {(profile.subscription_tier === 'premium' || profile.subscription_tier === 'business') && (
                <div className="flex items-center gap-1 flex-shrink-0">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-2.5 h-2.5 ${i < Math.round(reviewStats.averageRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                  ))}
                  <span className="font-medium text-gray-600 text-sm ml-1">{reviewStats.totalReviews > 0 ? `${reviewStats.averageRating}` : 'N/A'}</span>
                </div>
              )}
            </div>
            
            {/* Second Row: Verified Badge (if exists) */}
            {profile.verified_seller && (
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-blue-100 text-blue-700 text-xs">
                  <Star className="h-2.5 w-2.5 mr-0.5" fill="currentColor" />
                  Verified
                </Badge>
              </div>
            )}
            
            {/* Third Row: Cart + Chat + Share + Review + Open Status + Category */}
            <div className="flex items-center gap-2 text-sm">
              {/* Cart Button - Mobile */}
              {profile.subscription_tier !== 'free' && (
                <div className="flex-shrink-0">
                  <CartButton />
                </div>
              )}
              
              {profile.phone_number && (
                <button 
                  className="p-2.5 bg-emerald-50 text-emerald-700 rounded-lg transition-colors hover:bg-emerald-100"
                  onClick={() => {
                    const phoneNumber = profile.phone_number?.replace(/\D/g, '')
                    const message = `Hi ${profile.display_name}, I found your profile on A2Z Business Directory and would like to get in touch!`
                    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
                    window.open(whatsappUrl, '_blank')
                  }}
                  title="Chat"
                >
                  <MessageCircle className="w-4 h-4" />
                </button>
              )}
              
              <button 
                className="p-2.5 bg-gray-50 text-gray-700 rounded-lg transition-colors hover:bg-gray-100"
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
                title="Share"
              >
                <Share2 className="w-4 h-4" />
              </button>

              {(profile.subscription_tier === 'premium' || profile.subscription_tier === 'business') && (
                <button 
                  className="p-2.5 bg-gray-50 text-gray-700 rounded-lg transition-colors hover:bg-gray-100"
                  onClick={() => setShowReviewModal(true)}
                  title="Leave A Review"
                >
                  <Star className="w-4 h-4" />
                </button>
              )}
              
              {/* Open Status */}
              <div className="flex items-center gap-1 ml-auto text-gray-600">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                <span className="text-green-600 font-medium">Open</span>
              </div>
              
              {/* Category */}
              {profile.business_category && (
                <>
                  <span className="text-gray-400">•</span>
                  <span className="truncate text-gray-600">{profile.business_category}</span>
                </>
              )}
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:flex items-center gap-3 justify-between">
            {/* Left: Avatar + Name + Badges */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {profile.avatar_url && (
                <img 
                  src={profile.avatar_url} 
                  alt={profile.display_name} 
                  className="w-12 h-12 rounded-lg object-cover border border-gray-200 flex-shrink-0"
                />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-lg font-bold text-gray-900">
                    {profile.display_name}
                  </h1>
                  <div className="flex gap-1 flex-shrink-0">
                    <Badge className={`${tierBadge.className} text-xs`}>
                      {profile.subscription_tier === 'free' && <Zap className="h-2.5 w-2.5 mr-0.5 text-white drop-shadow-sm" />}
                      {profile.subscription_tier === 'premium' && <Sword className="h-2.5 w-2.5 mr-0.5 text-white drop-shadow-sm" />}
                      {profile.subscription_tier === 'business' && <Crown className="h-2.5 w-2.5 mr-0.5 text-white drop-shadow-sm" />}
                      {tierBadge.text}
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
                        <Star key={i} className={`w-2.5 h-2.5 ${i < Math.round(reviewStats.averageRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                      ))}
                      <span className="font-medium">{reviewStats.totalReviews > 0 ? `${reviewStats.averageRating}` : 'N/A'}</span>
                    </div>
                  )}
                  {profile.business_category && (
                    <>
                      <span className="text-gray-400">•</span>
                      <span>{profile.business_category}</span>
                    </>
                  )}
                  <span className="text-gray-400">•</span>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    <span className="text-green-600 font-medium">Open</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right: Action Buttons Row */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {profile.phone_number && (
                <button 
                  className="p-2 rounded-lg transition-colors hover:bg-emerald-50"
                  onClick={() => {
                    const phoneNumber = profile.phone_number?.replace(/\D/g, '')
                    const message = `Hi ${profile.display_name}, I found your profile on A2Z Business Directory and would like to get in touch!`
                    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
                    window.open(whatsappUrl, '_blank')
                  }}
                  title="WhatsApp"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                </button>
              )}
              
              {profile.address && (
                <button 
                  className="p-2 rounded-lg transition-colors hover:bg-emerald-50"
                  onClick={() => {
                    const addressQuery = profile.address || ''
                    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressQuery)}`
                    window.open(mapsUrl, '_blank')
                  }}
                  title="Directions"
                >
                  <MapPin className="w-4 h-4 text-emerald-600" />
                </button>
              )}
              
              <button 
                className="p-2 rounded-lg transition-colors hover:bg-emerald-50"
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
                title="Share"
              >
                <Share2 className="w-4 h-4 text-emerald-600" />
              </button>
              
              {profile.website_url && (
                <button 
                  className="p-2 rounded-lg transition-colors hover:bg-emerald-50"
                  onClick={() => window.open(ensureAbsoluteUrl(profile.website_url), '_blank')}
                  title="Website"
                >
                  <Globe className="w-4 h-4 text-emerald-600" />
                </button>
              )}

              {(profile.subscription_tier === 'premium' || profile.subscription_tier === 'business') && (
                <button 
                  className="p-2 rounded-lg transition-colors hover:bg-emerald-50"
                  onClick={() => setShowReviewModal(true)}
                  title="Leave A Review"
                >
                  <Star className="w-4 h-4 text-emerald-600" />
                </button>
              )}
              
              {/* Cart Button */}
              {profile.subscription_tier !== 'free' && (
                <div className="ml-1">
                  <CartButton />
                </div>
              )}
            </div>
          </div>
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

        /* Category buttons - Contact Button Style (From Uiverse.io by d4niz) */
        .cat-btn-wrapper {
          display: inline-block;
        }

        .cat-btn {
          background: #7079f0;
          color: white;
          font-family: inherit;
          padding: 0.45em;
          padding-left: 1em;
          font-size: 17px;
          font-weight: 500;
          border-radius: 0.9em;
          border: none;
          cursor: pointer;
          letter-spacing: 0.05em;
          display: flex;
          align-items: center;
          box-shadow: inset 0 0 1.6em -0.6em #714da6;
          overflow: hidden;
          position: relative;
          height: 2.8em;
          padding-right: 3em;
          transition: all 0.3s;
        }

        .cat-btn:hover {
          transform: translate(-0.05em, -0.05em);
          box-shadow: 0.15em 0.15em #5566c2;
        }

        .cat-btn:active,
        .cat-btn.active {
          transform: translate(0.05em, 0.05em);
          box-shadow: 0.05em 0.05em #5566c2;
        }

        .cat-btn:focus {
          transform: translate(0.05em, 0.05em);
          box-shadow: 0.05em 0.05em #5566c2;
        }

        .cat-btn > div {
          font-weight: 500;
          font-size: 17px;
          letter-spacing: 0.05em;
          white-space: nowrap;
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

        /* Custom scrollbar for product modal */
        .modal-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #d1d5db transparent;
        }

        .modal-scrollbar::-webkit-scrollbar {
          width: 8px;
        }

        .modal-scrollbar::-webkit-scrollbar-track {
          background: transparent;
          border-radius: 16px;
        }

        .modal-scrollbar::-webkit-scrollbar-thumb {
          background-color: #d1d5db;
          border-radius: 16px;
          border: 2px solid transparent;
          background-clip: content-box;
        }

        .modal-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #9ca3af;
        }

        .modal-scrollbar::-webkit-scrollbar-corner {
          background: transparent;
          border-radius: 16px;
        }
      `}</style>

      {/* Products Section */}
      <motion.div className="bg-white">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">Products & Services</h2>
            <span className="text-sm text-gray-500">{products.length} items</span>
          </div>
          
          {/* Category Filter Buttons */}
          <div className="flex gap-3 mb-4 overflow-x-auto pb-2 pt-2 scrollbar-hide">
            <motion.div className="cat-btn-wrapper">
              <motion.button
                onClick={() => setSelectedCategory('all')}
                className={`cat-btn ${selectedCategory === 'all' ? 'active' : ''}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <div>All Products</div>
              </motion.button>
            </motion.div>
            <motion.div className="cat-btn-wrapper">
              <motion.button
                onClick={() => setSelectedCategory('products')}
                className={`cat-btn ${selectedCategory === 'products' ? 'active' : ''}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 500, damping: 20 }}
              >
                <div>Products</div>
              </motion.button>
            </motion.div>
            <motion.div className="cat-btn-wrapper">
              <motion.button
                onClick={() => setSelectedCategory('services')}
                className={`cat-btn ${selectedCategory === 'services' ? 'active' : ''}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 500, damping: 20 }}
              >
                <div>Services</div>
              </motion.button>
            </motion.div>

          </div>
          
          <AnimatePresence mode="wait">
            {(selectedCategory === 'all' ? products : products.filter(p => p.category === selectedCategory)).length > 0 ? (
              <motion.div 
                className="overflow-x-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div 
                  className="flex gap-4 pb-2" 
                  style={{ width: 'max-content' }}
                  layout
                >
                  {(selectedCategory === 'all' ? products : products.filter(p => p.category === selectedCategory)).map((product, index) => (
                    <motion.div 
                      key={product.id} 
                      className="bg-white border border-gray-200 rounded-[9px] overflow-hidden cursor-pointer hover:shadow-md transition-shadow flex-shrink-0 w-48"
                      onClick={() => setSelectedProduct(product)}
                      initial={{ opacity: 0, scale: 0.8, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8, y: -20 }}
                      transition={{ 
                        duration: 0.4, 
                        ease: [0.34, 1.56, 0.64, 1],
                        delay: index * 0.05
                      }}
                      whileHover={{ y: -8, boxShadow: '0 12px 24px rgba(0, 0, 0, 0.15)' }}
                    >
                    {(() => {
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
                      
                      return (hasImages || product.image_url) ? (
                        <div className="relative">
                          <img
                            src={imageUrl}
                            alt={product.name}
                            className="w-full h-[146px] object-fill"
                          />
                          {/* Image count indicator */}
                          {(() => {
                            // Handle both JSON string and array formats for count
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
                            
                            return imagesArray && imagesArray.length > 1 && (
                              <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                <Package className="h-3 w-3" />
                                {imagesArray.length}
                              </div>
                            )
                          })()}
                        </div>
                      ) : (
                        <div className="w-full h-32 bg-gray-100 flex items-center justify-center">
                          <ShoppingBag className="w-8 h-8 text-gray-400" />
                        </div>
                      )
                    })()}
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
                  </motion.div>
                ))}
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
                <h3 className="text-sm font-medium text-gray-900 mb-1">No products available</h3>
                <p className="text-xs text-gray-500">This business hasn't added any products yet.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Business Details */}
      <motion.div 
        className="bg-gray-50 px-4 py-6 space-y-6"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
      >
        {/* Profile Information */}
        <div className="bg-white rounded-[9px] border border-gray-200 p-4">
          <h3 className="font-medium text-gray-900 mb-3">Profile Information</h3>
          <div className="space-y-3">
            {/* Company Name */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-[9px]">
                <Crown className="h-4 w-4 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-900">{profile.display_name}</span>
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
      </motion.div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto modal-scrollbar">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-xl font-semibold text-gray-900">{selectedProduct?.name}</h2>
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
                    {(() => {
                      // Handle both JSON string and array formats for main image
                      let imagesArray = []
                      if (selectedProduct?.images) {
                        if (typeof selectedProduct.images === 'string') {
                          try {
                            imagesArray = JSON.parse(selectedProduct.images)
                          } catch (e) {
                            imagesArray = []
                          }
                        } else if (Array.isArray(selectedProduct.images)) {
                          imagesArray = selectedProduct.images
                        }
                      }
                      
                      const hasImages = imagesArray && imagesArray.length > 0
                      const imageUrl = hasImages 
                        ? imagesArray[currentProductImageIndex]?.url || selectedProduct?.image_url
                        : selectedProduct?.image_url
                      
                      return (hasImages || selectedProduct?.image_url) ? (
                        <>
                          <img
                            src={imageUrl}
                            alt={selectedProduct?.name}
                            className="w-full h-full object-cover"
                          />
                        
                        {/* Navigation Arrows */}
                        {(() => {
                          // Handle both JSON string and array formats for navigation
                          let imagesArray = []
                          if (selectedProduct?.images) {
                            if (typeof selectedProduct.images === 'string') {
                              try {
                                imagesArray = JSON.parse(selectedProduct.images)
                              } catch (e) {
                                imagesArray = []
                              }
                            } else if (Array.isArray(selectedProduct.images)) {
                              imagesArray = selectedProduct.images
                            }
                          }
                          
                          return imagesArray && imagesArray.length > 1 && (
                            <>
                              <button
                                onClick={() => setCurrentProductImageIndex(prev => 
                                  prev === 0 ? imagesArray.length - 1 : prev - 1
                                )}
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-60 hover:bg-opacity-80 text-white p-2 rounded-full transition-all"
                              >
                                <ChevronLeft className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => setCurrentProductImageIndex(prev => 
                                  prev === imagesArray.length - 1 ? 0 : prev + 1
                                )}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-60 hover:bg-opacity-80 text-white p-2 rounded-full transition-all"
                              >
                                <ChevronRight className="w-5 h-5" />
                              </button>
                            </>
                          )
                        })()}
                        
                        {/* Image Counter */}
                        {(() => {
                          // Handle both JSON string and array formats for counter
                          let imagesArray = []
                          if (selectedProduct?.images) {
                            if (typeof selectedProduct.images === 'string') {
                              try {
                                imagesArray = JSON.parse(selectedProduct.images)
                              } catch (e) {
                                imagesArray = []
                              }
                            } else if (Array.isArray(selectedProduct.images)) {
                              imagesArray = selectedProduct.images
                            }
                          }
                          
                          return imagesArray && imagesArray.length > 1 && (
                            <div className="absolute bottom-3 right-3 bg-black bg-opacity-60 text-white text-sm px-3 py-1 rounded-full">
                              {currentProductImageIndex + 1} / {imagesArray.length}
                            </div>
                          )
                        })()}
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Package className="w-16 h-16" />
                        </div>
                      )
                    })()}
                  </div>

                  {/* Thumbnail Strip */}
                  {(() => {
                    // Handle both JSON string and array formats
                    let imagesArray = []
                    if (selectedProduct?.images) {
                      if (typeof selectedProduct.images === 'string') {
                        try {
                          imagesArray = JSON.parse(selectedProduct.images)
                        } catch (e) {
                          imagesArray = []
                        }
                      } else if (Array.isArray(selectedProduct.images)) {
                        imagesArray = selectedProduct.images
                      }
                    }
                    
                    return imagesArray && imagesArray.length > 1 && (
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {imagesArray.map((img: any, index: number) => (
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
                            alt={`${selectedProduct?.name} ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                        ))}
                      </div>
                    )
                  })()}
                </div>

                {/* Product Info */}
                <div>
                  <div className="mb-4">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{selectedProduct?.name}</h1>
                    {(profile?.subscription_tier === 'premium' || profile?.subscription_tier === 'business') && reviewStats.totalReviews > 0 && (
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
                    {selectedProduct?.price_cents ? (
                      <div>
                        <span className="text-3xl font-bold text-emerald-600">
                          R{(((selectedProduct?.price_cents || 0) * quantity) / 100).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        {quantity > 1 && (
                          <div className="text-sm text-gray-500 mt-1">
                            {quantity} × R{((selectedProduct?.price_cents || 0) / 100).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} each
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
                        ...(selectedProduct?.product_details ? ['details'] : []),
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

                  {/* Tab Content - Scrollable Container */}
                  <div className="mb-8 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-4 bg-gray-50">
                    {productModalTab === 'description' && (
                      <div>
                        {selectedProduct?.description ? (
                          <div 
                            className="text-gray-700 leading-relaxed prose prose-sm max-w-none prose-headings:text-gray-800 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-800"
                            dangerouslySetInnerHTML={{ __html: selectedProduct?.description || '' }}
                          />
                        ) : (
                          <p className="text-gray-500 italic">No description available.</p>
                        )}
                        <div className="mt-4 flex flex-wrap gap-2">
                          {selectedProduct?.category && (
                            <span className="inline-block bg-emerald-100 text-emerald-700 text-sm px-3 py-1 rounded-full">
                              {selectedProduct?.category}
                            </span>
                          )}
                          {/* Display product tags */}
                          {selectedProduct?.tags && selectedProduct.tags.length > 0 && (
                            selectedProduct.tags.map((tag: any) => (
                              <span
                                key={tag.id}
                                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium text-white"
                                style={{ backgroundColor: tag.color }}
                              >
                                {tag.icon && <span>{tag.icon}</span>}
                                {tag.name}
                              </span>
                            ))
                          )}
                        </div>
                      </div>
                    )}

                    {productModalTab === 'details' && (
                      <div>
                        {selectedProduct?.product_details ? (
                          <ul className="grid grid-cols-2 gap-3 text-gray-700">
                            {(selectedProduct?.product_details || '').split('\n').filter((detail: string) => detail.trim()).map((detail: string, index: number) => (
                              <li key={index} className="flex items-start">
                                <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                <span className="text-sm">{detail.trim()}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-500 italic">No additional details available.</p>
                        )}
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
                              <p className="text-sm text-gray-500">{profile?.phone_number}</p>
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
                      {isEcommerceEnabled() && selectedProduct?.price_cents ? (
                        <div className="space-y-3">
                          {/* Row: Add to Cart + Contact Seller */}
                          <div className="flex gap-3">
                            <button 
                              onClick={() => selectedProduct && handleAddToCart(selectedProduct)}
                              className="flex-1 bg-emerald-600 text-white py-3 px-6 rounded-[9px] hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 font-semibold text-sm md:text-base"
                            >
                              <ShoppingBag className="w-5 h-5" />
                              Add to Cart
                            </button>

                            {/* Secondary Contact Button for Premium/Business */}
                            <div className="relative flex-shrink-0">
                              <button 
                                onClick={handleContactSeller}
                                className="w-full bg-gray-600 text-white py-3 px-6 rounded-[9px] hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 font-semibold text-sm md:text-base"
                              >
                                <MessageCircle className="w-5 h-5" />
                                Chat
                              </button>
                              
                              {showContactOptions && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-[9px] shadow-lg z-10 overflow-hidden">
                                  <button
                                    onClick={() => selectedProduct && handleWhatsAppContact(selectedProduct)}
                                    className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 border-b border-gray-100"
                                  >
                                    <MessageCircle className="w-5 h-5 text-green-600" />
                                    <span className="text-gray-700">WhatsApp</span>
                                  </button>
                                  <button
                                    onClick={() => selectedProduct && handleEmailContact(selectedProduct)}
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
                            className="w-full bg-emerald-600 text-white py-3 px-6 rounded-[9px] hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 text-sm md:text-base"
                          >
                            <MessageCircle className="w-5 h-5" />
                            Chat
                          </button>
                          
                          {showContactOptions && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-[9px] shadow-lg z-10 overflow-hidden">
                              <button
                                onClick={() => selectedProduct && handleWhatsAppContact(selectedProduct)}
                                className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 border-b border-gray-100"
                              >
                                <MessageCircle className="w-5 h-5 text-green-600" />
                                <span className="text-gray-700">WhatsApp</span>
                              </button>
                              <button
                                onClick={() => selectedProduct && handleEmailContact(selectedProduct)}
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
                        onClick={() => selectedProduct && handleShareProduct(selectedProduct)}
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

      {/* Holographic Social Media Styles */}
      <style jsx>{`
        .holographic-stack {
          display: flex;
          justify-content: flex-start;
          align-items: center;
          gap: 20px;
          perspective: 1000px;
        }

        .holographic-icon {
          position: relative;
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          transform-style: preserve-3d;
        }

        .holographic-icon svg {
          width: 30px;
          height: 30px;
          position: relative;
          z-index: 3;
          transition: all 0.3s ease;
          filter: drop-shadow(0 0 5px currentColor);
        }

        .holographic-ring {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          border: 2px solid;
          border-top-color: transparent;
          border-bottom-color: transparent;
          animation: rotate 3s linear infinite;
          opacity: 0.7;
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
          background-size: 15px 15px;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .holographic-pulse {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          box-shadow: 0 0 15px currentColor;
          opacity: 0;
          transition: opacity 0.3s ease, transform 0.3s ease;
        }

        .holographic-icon.facebook {
          color: #1877f2;
        }

        .holographic-icon.facebook:hover {
          color: #0d5bd9;
          transform: translateY(-10px) rotateX(20deg);
        }

        .holographic-icon.facebook:hover .holographic-ring {
          border-color: #0d5bd9;
          border-top-color: transparent;
          border-bottom-color: transparent;
        }

        .holographic-icon.instagram {
          color: #e4405f;
        }

        .holographic-icon.instagram:hover {
          color: #c13584;
          transform: translateY(-10px) rotateX(20deg);
        }

        .holographic-icon.instagram:hover .holographic-ring {
          border-color: #c13584;
          border-top-color: transparent;
          border-bottom-color: transparent;
        }

        .holographic-icon.twitter {
          color: #1da1f2;
        }

        .holographic-icon.twitter:hover {
          color: #0d8bd9;
          transform: translateY(-10px) rotateX(20deg);
        }

        .holographic-icon.twitter:hover .holographic-ring {
          border-color: #0d8bd9;
          border-top-color: transparent;
          border-bottom-color: transparent;
        }

        .holographic-icon.youtube {
          color: #ff0000;
        }

        .holographic-icon.youtube:hover {
          color: #cc0000;
          transform: translateY(-10px) rotateX(20deg);
        }

        .holographic-icon.youtube:hover .holographic-ring {
          border-color: #cc0000;
          border-top-color: transparent;
          border-bottom-color: transparent;
        }

        .holographic-icon:hover svg {
          transform: scale(1.2) rotate(10deg);
        }

        .holographic-icon:hover .holographic-particles {
          opacity: 0.3;
          animation: particles 3s linear infinite;
        }

        .holographic-icon:hover .holographic-pulse {
          opacity: 0.5;
          animation: pulse 2s ease-out infinite;
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
            background-position: 30px 30px;
          }
        }

        @keyframes pulse {
          0% {
            transform: scale(0.8);
            opacity: 0.5;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.2;
          }
          100% {
            transform: scale(1.3);
            opacity: 0;
          }
        }

        .holographic-icon::before {
          content: "";
          position: absolute;
          bottom: -10px;
          left: 5%;
          width: 90%;
          height: 20%;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 50%;
          filter: blur(10px);
          transform: rotateX(80deg) translateZ(-20px);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .holographic-icon:hover::before {
          opacity: 0.5;
        }
      `}</style>
    </div>
  )
}
