'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { 
  MapPin, 
  Phone, 
  Globe, 
  Clock, 
  Star, 
  Crown,
  MessageCircle,
  Share2,
  ShoppingBag,
  Package,
  Shield,
  Truck,
  Heart,
  Check,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FramerThumbnailCarousel } from '@/components/ui/framer-thumbnail-carousel'
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
  subscription_tier: 'free' | 'premium' | 'business'
  verified_seller: boolean
  early_adopter: boolean
}

interface Product {
  id: string
  name: string
  description: string | null
  category: string | null
  image_url: string | null
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch products (matching profile page exactly)
        console.log('🛍️ Fetching products for profile ID:', profile.id)
        const { data: productsData, error: productsError } = await supabase
          .from('profile_products')
          .select('*')
          .eq('profile_id', profile.id)
          .eq('is_active', true)

        console.log('📦 Products data:', productsData)
        console.log('❌ Products error:', productsError)

        if (productsError) throw productsError
        setProducts(productsData || [])

        // Fetch gallery items from database (matching profile page exactly)
        console.log('🔍 Fetching gallery for profile ID:', profile.id)
        const { data: galleryData, error: galleryError } = await supabase
          .from('profile_gallery')
          .select('id, image_url, caption')
          .eq('profile_id', profile.id)
          .order('created_at', { ascending: false })

        console.log('📸 Gallery data:', galleryData)
        console.log('❌ Gallery error:', galleryError)

        if (!galleryError && galleryData) {
          const formattedGallery = galleryData.map(item => ({
            id: item.id.toString(),
            url: item.image_url,
            title: item.caption || 'Gallery Image'
          }))
          console.log('✅ Formatted gallery:', formattedGallery)
          setGalleryItems(formattedGallery)
        } else {
          console.log('⚠️ No gallery data found or error occurred')
          setGalleryItems([])
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

  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter((product) => (product.category || '').toLowerCase() === selectedCategory)

  const tierBadge = (() => {
    const mapping: Record<UserProfile['subscription_tier'], { text: string; className: string }> = {
      free: { text: 'Free', className: 'bg-gray-100 text-gray-700' },
      premium: { text: 'Premium', className: 'bg-orange-100 text-orange-700' },
      business: { text: 'Pro', className: 'bg-blue-100 text-blue-700' }
    }

    return mapping[profile.subscription_tier ?? 'free']
  })()

  return (
    <div className="bg-white rounded-[9px] border border-gray-200 overflow-hidden">
      {/* Hero Gallery Slider */}
      {galleryItems.length > 0 ? (
        <FramerThumbnailCarousel items={galleryItems} />
      ) : (
        <div className="relative h-80 bg-emerald-100 overflow-hidden rounded-[9px] flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-200 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl font-bold text-emerald-700">
                {profile.display_name?.charAt(0)?.toUpperCase() || '?'}
              </span>
            </div>
            <p className="text-emerald-600 font-medium">{profile.display_name}</p>
          </div>
        </div>
      )}

      {/* Business Info Card */}
      <div className="bg-white p-4 border-b border-gray-100">
        <div className="flex items-start gap-3">
          {profile.avatar_url && (
            <img 
              src={profile.avatar_url} 
              alt={profile.display_name} 
              className="w-12 h-12 rounded-[9px] object-cover border border-gray-200"
            />
          )}
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{profile.display_name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">4.8 (124)</span>
                </div>
                {profile.business_category && (
                  <p className="text-sm text-gray-600 mt-1">{profile.business_category}</p>
                )}
              </div>
              <div className="flex gap-1">
                <Badge className={`${tierBadge.className} text-xs`}>
                  {profile.subscription_tier !== 'free' && <Crown className="h-3 w-3 mr-1" />}
                  {tierBadge.text}
                </Badge>
                {profile.verified_seller && (
                  <Badge className="bg-blue-100 text-blue-700 text-xs">
                    <Star className="h-3 w-3 mr-1" fill="currentColor" />
                    Verified
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Business Hours Status */}
            <div className="flex items-center gap-2 mt-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-green-600 font-medium">Open until 9:00 PM</span>
            </div>
            
            {profile.bio && (
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">{profile.bio}</p>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white px-4 py-3 border-b border-gray-100">
        <div className="grid grid-cols-4 gap-3">
          {profile.phone_number && (
            <Button 
              className="bg-green-500 hover:bg-green-600 text-white flex-col h-auto py-3 px-2 rounded-[9px]"
            >
              <MessageCircle className="h-5 w-5 mb-1" />
              <span className="text-xs">WhatsApp</span>
            </Button>
          )}
          
          {profile.business_location && (
            <Button 
              variant="outline" 
              className="flex-col h-auto py-3 px-2 rounded-[9px] border-gray-200"
            >
              <MapPin className="h-5 w-5 mb-1 text-blue-600" />
              <span className="text-xs text-gray-700">Directions</span>
            </Button>
          )}
          
          <Button 
            variant="outline" 
            className="flex-col h-auto py-3 px-2 rounded-[9px] border-gray-200"
          >
            <Share2 className="h-5 w-5 mb-1 text-gray-600" />
            <span className="text-xs text-gray-700">Share</span>
          </Button>
          
          {profile.website_url && (
            <Button 
              variant="outline" 
              className="flex-col h-auto py-3 px-2 rounded-[9px] border-gray-200"
            >
              <Globe className="h-5 w-5 mb-1 text-purple-600" />
              <span className="text-xs text-gray-700">Website</span>
            </Button>
          )}
        </div>
      </div>

      {/* Products Section */}
      <div className="bg-white">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">Products & Services</h2>
            <span className="text-sm text-gray-500">{filteredProducts.length} items</span>
          </div>

          {/* Category Filters */}
          {products.length > 0 && (
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
              {[
                { value: 'all', label: 'All Products' },
                { value: 'products', label: 'Products' },
                { value: 'services', label: 'Services' },
                { value: 'food', label: 'Food & Drinks' },
                { value: 'retail', label: 'Retail Items' },
              ].map((category) => (
                <button
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value as typeof selectedCategory)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-[9px] whitespace-nowrap transition-colors ${
                    selectedCategory === category.value
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          )}

          {filteredProducts.length > 0 ? (
            <div className="overflow-x-auto">
              <div className="flex gap-4 pb-2" style={{ width: 'max-content' }}>
                {filteredProducts.slice(0, 4).map((product) => (
                  <div 
                    key={product.id} 
                    className="bg-white border border-gray-200 rounded-[9px] overflow-hidden cursor-pointer hover:shadow-md transition-shadow flex-shrink-0 w-40"
                  >
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-24 object-cover"
                      />
                    ) : (
                      <div className="w-full h-24 bg-gray-100 flex items-center justify-center">
                        <ShoppingBag className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                    <div className="p-3">
                      <h3 className="font-medium text-gray-900 mb-1 text-xs truncate">{product.name}</h3>
                      {product.price_cents ? (
                        <span className="text-xs font-semibold text-emerald-600">
                          R{(product.price_cents / 100).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500">Contact for price</span>
                      )}
                    </div>
                  </div>
                ))}
                
                {/* View All Card */}
                <div className="bg-gray-50 border border-gray-200 rounded-[9px] flex-shrink-0 w-40 flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors">
                  <div className="text-center p-3">
                    <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-1">
                      <span className="text-xs text-gray-600">+</span>
                    </div>
                    <span className="text-xs text-gray-600 font-medium">View All</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-[9px] p-6 text-center">
              <ShoppingBag className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <h3 className="text-xs font-medium text-gray-900 mb-1">No products available</h3>
              <p className="text-xs text-gray-500">This business hasn't added any products yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Business Details */}
      <div className="bg-gray-50 px-4 py-4 space-y-4">
        {/* Contact Information */}
        <div className="bg-white rounded-[9px] border border-gray-200 p-3">
          <h3 className="font-medium text-gray-900 mb-2 text-sm">Contact Information</h3>
          <div className="space-y-2">
            {profile.business_location && (
              <div className="flex items-center gap-2">
                <div className="p-1 bg-emerald-100 rounded-[6px]">
                  <MapPin className="h-3 w-3 text-emerald-600" />
                </div>
                <span className="text-xs text-gray-700">{profile.business_location}</span>
              </div>
            )}
            {profile.phone_number && (
              <div className="flex items-center gap-2">
                <div className="p-1 bg-blue-100 rounded-[6px]">
                  <Phone className="h-3 w-3 text-blue-600" />
                </div>
                <span className="text-xs text-gray-700">{profile.phone_number}</span>
              </div>
            )}
          </div>
        </div>

        {/* Business Hours */}
        <div className="bg-white rounded-[9px] border border-gray-200 p-3">
          <h3 className="font-medium text-gray-900 mb-2 text-sm">Business Hours</h3>
          <div className="flex items-center gap-2">
            <div className="p-1 bg-orange-100 rounded-[6px]">
              <Clock className="h-3 w-3 text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-gray-700">Today: 9:00 AM - 6:00 PM</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PublicProfilePreview
