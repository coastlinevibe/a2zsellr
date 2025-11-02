'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { Star, MapPin, Phone, Globe, Clock, Mail, Crown, Share2, ChevronLeft, ChevronRight, Package, ShoppingBag, X, Heart, Check, Truck, Shield, MessageCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface UserProfile {
  id: string
  display_name: string
  bio: string | null
  business_category: string | null
  business_location: string | null
  business_hours: string | null
  verified_seller: boolean
  subscription_tier: 'free' | 'premium' | 'business'
  avatar_url: string | null
  phone_number: string | null
  website_url: string | null
  early_adopter: boolean
}

interface GalleryItem {
  id: string
  url: string
  title: string | null
  description: string | null
  type: 'image' | 'video'
}

interface Product {
  id: string
  name: string
  description: string | null
  price_cents: number | null
  category: string | null
  image_url: string | null
  is_active: boolean
}

export default function PublicProfilePage() {
  const params = useParams()
  const username = params?.username as string
  
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [activeTab, setActiveTab] = useState('shop')
  const [todayHours, setTodayHours] = useState<string>('')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [productModalTab, setProductModalTab] = useState('description')
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)

  useEffect(() => {
    if (username) {
      fetchProfile()
    }
  }, [username])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      
      // Clean username (remove @ if present)
      const cleanUsername = username.replace('@', '')
      
      // Fetch profile by display_name
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('display_name', cleanUsername)
        .eq('is_active', true)
        .single()

      if (profileError) throw profileError

      setProfile(profileData)
      
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
      }

    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
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

  const getTierBadge = () => {
    if (!profile) return { text: 'Member', className: 'bg-gray-100 text-gray-700' }
    
    const badges = {
      free: { text: 'Member', className: 'bg-gray-100 text-gray-700' },
      premium: { text: 'Premium', className: 'bg-orange-100 text-orange-700' },
      business: { text: 'Pro', className: 'bg-blue-100 text-blue-700' }
    }
    return badges[profile.subscription_tier] || badges.free
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
    setIsWishlisted(false)
    setProductModalTab('description')
  }

  const increaseQuantity = () => {
    setQuantity(quantity + 1)
  }

  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1)
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

  const tierBadge = getTierBadge()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Directory
          </Link>
        </div>
      </div>

      {/* Profile Header */}
      <div className="relative bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 py-12 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-400/10 to-emerald-400/10 rounded-full blur-3xl animate-spin-slow"></div>
        </div>

        <div className="relative max-w-6xl mx-auto px-4">
          <div className="bg-white/80 backdrop-blur-lg rounded-[9px] shadow-2xl border border-white/20 p-8 hover:shadow-3xl transition-all duration-500 hover:scale-[1.02]">
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              {/* Avatar Section */}
              <div className="flex-shrink-0 mx-auto lg:mx-0 relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-full blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
                {profile.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt={profile.display_name} 
                    className="relative w-36 h-36 rounded-full object-cover border-4 border-white shadow-2xl group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="relative w-36 h-36 rounded-full bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center text-4xl font-bold text-white shadow-2xl group-hover:scale-105 transition-transform duration-300">
                    {profile.display_name[0].toUpperCase()}
                  </div>
                )}
                {/* Status Indicator */}
                <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-white shadow-lg animate-bounce"></div>
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center lg:text-left space-y-6">
                {/* Name and Badges Section */}
                <div className="space-y-4">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    <h1 className="text-4xl font-bold text-gray-900">
                      {profile.display_name}
                    </h1>
                    <div className="flex flex-wrap justify-center lg:justify-start gap-2">
                      <Badge className={`${tierBadge.className} border-0 shadow-lg hover:scale-105 transition-transform duration-200 animate-slide-in`}>
                        {profile.subscription_tier !== 'free' && <Crown className="h-3 w-3 mr-1 animate-pulse" />}
                        {tierBadge.text}
                      </Badge>
                      {profile.verified_seller && (
                        <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 shadow-lg hover:scale-105 transition-transform duration-200 animate-slide-in delay-100">
                          <Star className="h-3 w-3 mr-1 animate-spin-slow" fill="currentColor" />
                          Verified
                        </Badge>
                      )}
                      {profile.early_adopter && (
                        <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shadow-lg hover:scale-105 transition-transform duration-200 animate-slide-in delay-200">
                          Early Adopter
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Business Category */}
                  {profile.business_category && (
                    <div className="bg-white/50 backdrop-blur-sm rounded-[9px] p-4 border border-white/30 shadow-sm">
                      <p className="text-lg font-medium text-gray-600">{profile.business_category}</p>
                    </div>
                  )}
                </div>

                {/* Bio */}
                {profile.bio && (
                  <div className="bg-white/50 backdrop-blur-sm rounded-[9px] p-4 border border-white/30 shadow-sm">
                    <p className="text-gray-700 leading-relaxed italic">{profile.bio}</p>
                  </div>
                )}

                {/* Contact Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.business_location && (
                    <div className="flex items-center justify-center lg:justify-start gap-3 p-3 bg-white/60 backdrop-blur-sm rounded-[9px] border border-white/30 shadow-sm hover:shadow-md transition-shadow duration-200 group">
                      <div className="p-2 bg-emerald-100 rounded-[9px] group-hover:bg-emerald-200 transition-colors duration-200">
                        <MapPin className="h-4 w-4 text-emerald-600" />
                      </div>
                      <span className="text-gray-700 font-medium">{profile.business_location}</span>
                    </div>
                  )}
                  {profile.phone_number && (
                    <div className="flex items-center justify-center lg:justify-start gap-3 p-3 bg-white/60 backdrop-blur-sm rounded-[9px] border border-white/30 shadow-sm hover:shadow-md transition-shadow duration-200 group">
                      <div className="p-2 bg-blue-100 rounded-[9px] group-hover:bg-blue-200 transition-colors duration-200">
                        <Phone className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="text-gray-700 font-medium">{profile.phone_number}</span>
                    </div>
                  )}
                  {profile.website_url && (
                    <div className="flex items-center justify-center lg:justify-start gap-3 p-3 bg-white/60 backdrop-blur-sm rounded-[9px] border border-white/30 shadow-sm hover:shadow-md transition-shadow duration-200 group">
                      <div className="p-2 bg-purple-100 rounded-[9px] group-hover:bg-purple-200 transition-colors duration-200">
                        <Globe className="h-4 w-4 text-purple-600" />
                      </div>
                      <a href={profile.website_url} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-700 hover:underline font-medium truncate">
                        {profile.website_url}
                      </a>
                    </div>
                  )}
                  {todayHours && (
                    <div className="flex items-center justify-center lg:justify-start gap-3 p-3 bg-white/60 backdrop-blur-sm rounded-[9px] border border-white/30 shadow-sm hover:shadow-md transition-shadow duration-200 group">
                      <div className="p-2 bg-orange-100 rounded-[9px] group-hover:bg-orange-200 transition-colors duration-200">
                        <Clock className="h-4 w-4 text-orange-600" />
                      </div>
                      <span className="text-gray-700 font-medium">Today: {todayHours}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                  <Button className="bg-emerald-600 hover:bg-emerald-700 border-2 border-emerald-600 hover:border-emerald-700 text-white px-8 py-3 rounded-[9px] shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                    <Mail className="h-4 w-4 mr-2" />
                    Contact
                  </Button>
                  <Button variant="outline" className="bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 px-8 py-3 rounded-[9px] shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 hover:bg-gray-50">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  {profile.phone_number && (
                    <Button 
                      className="bg-green-500 hover:bg-green-600 border-2 border-green-500 hover:border-green-600 text-white px-8 py-3 rounded-[9px] shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                      onClick={() => {
                        const phoneNumber = profile.phone_number?.replace(/\D/g, '') // Remove non-digits
                        const message = `Hi ${profile.display_name}, I found your profile on A2Z Business Directory and would like to get in touch!`
                        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
                        window.open(whatsappUrl, '_blank')
                      }}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      WhatsApp
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('shop')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'shop'
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <ShoppingBag className="h-4 w-4 mr-1 inline" />
              Shop ({products.length})
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {activeTab === 'shop' && (
          <div>
            {products.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <div 
                    key={product.id} 
                    className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedProduct(product)}
                  >
                    {product.image_url && (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">{product.name}</h3>
                      {product.description && (
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                      )}
                      <div className="flex items-center justify-between">
                        {product.price_cents ? (
                          <span className="text-lg font-bold text-emerald-600">
                            R{(product.price_cents / 100).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        ) : (
                          <span className="text-gray-500">Contact for price</span>
                        )}
                        <button className="text-emerald-600 hover:text-emerald-700 text-sm font-medium">
                          View Details
                        </button>
                      </div>
                      {product.category && (
                        <div className="mt-2">
                          <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                            {product.category}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products available</h3>
                <p className="text-gray-500">This profile hasn't added any products yet.</p>
              </div>
            )}
          </div>
        )}
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
                {/* Product Image */}
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  {selectedProduct.image_url ? (
                    <img
                      src={selectedProduct.image_url}
                      alt={selectedProduct.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Package className="w-16 h-16" />
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div>
                  <div className="mb-4">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{selectedProduct.name}</h1>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex items-center">
                        {renderStars(4.5)}
                      </div>
                      <span className="text-sm text-gray-600">4.5 (24 reviews)</span>
                    </div>
                  </div>

                  <div className="mb-6">
                    {selectedProduct.price_cents ? (
                      <span className="text-3xl font-bold text-emerald-600">
                        R{(selectedProduct.price_cents / 100).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    ) : (
                      <span className="text-2xl text-gray-500">Contact for price</span>
                    )}
                    <span className="ml-2 text-sm text-green-600">In stock</span>
                  </div>

                  {/* Tabs */}
                  <div className="mb-6 border-b border-gray-200">
                    <nav className="flex space-x-8">
                      {['description', 'details', 'contact'].map((tab) => (
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
                          <p className="text-gray-700 leading-relaxed">{selectedProduct.description}</p>
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
                          <ul className="space-y-2 text-gray-700">
                            <li className="flex items-center">
                              <Check className="w-4 h-4 text-green-500 mr-2" />
                              High quality materials
                            </li>
                            <li className="flex items-center">
                              <Check className="w-4 h-4 text-green-500 mr-2" />
                              Carefully crafted
                            </li>
                            <li className="flex items-center">
                              <Check className="w-4 h-4 text-green-500 mr-2" />
                              Satisfaction guaranteed
                            </li>
                          </ul>
                        </div>
                      </div>
                    )}

                    {productModalTab === 'contact' && (
                      <div className="space-y-4">
                        <div className="flex items-center">
                          <Mail className="w-5 h-5 text-gray-500 mr-3" />
                          <div>
                            <h3 className="font-medium text-gray-900">Contact Seller</h3>
                            <p className="text-sm text-gray-500">Get in touch for more information</p>
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
                      <button
                        onClick={() => setIsWishlisted(!isWishlisted)}
                        className={`p-2 rounded-full transition-colors ${
                          isWishlisted 
                            ? 'text-red-500 bg-red-50' 
                            : 'text-gray-400 hover:text-red-500'
                        }`}
                      >
                        <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    <div className="space-y-3">
                      <button className="w-full bg-emerald-600 text-white py-3 px-6 rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2">
                        <ShoppingBag className="w-5 h-5" />
                        Contact Seller
                      </button>
                      <button className="w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors">
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
    </div>
  )
}
