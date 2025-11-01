'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Eye, ShoppingBag, TrendingUp, Plus, Edit, Trash2, Share2, Camera, Video, Star, MapPin, Phone, Mail, Globe, ChevronLeft, ChevronRight, Calendar, Send, Filter, Search, Gift, Settings, Package, DollarSign, Users, BarChart3, Crown } from 'lucide-react'
import { useAuth } from '@/lib/auth'

export default function PremiumBusinessProfilePage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const username = params?.username as string
  
  // Get active tab from URL or default to 'gallery'
  const activeTab = searchParams?.get('tab') || 'gallery'
  const [activeSection, setActiveSection] = useState(activeTab)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isEditing, setIsEditing] = useState(false)

  // Update activeSection when URL changes
  useEffect(() => {
    setActiveSection(activeTab)
  }, [activeTab])

  // Handle tab change and update URL
  const handleTabChange = (tab: string) => {
    setActiveSection(tab)
    const newUrl = `${window.location.pathname}?tab=${tab}`
    router.push(newUrl, { scroll: false })
  }

  // Business data using actual user info
  const displayName = user?.user_metadata?.display_name || username?.replace('@', '') || "Business Profile"
  const businessData = {
    name: displayName,
    category: "Business",
    location: "South Africa",
    rating: 4.8,
    reviews: 0,
    phone: "+27 XX XXX XXXX",
    email: user?.email || "contact@business.com",
    website: "www.yourbusiness.com",
    description: `${displayName}'s premium business directory profile. Advanced gallery, shop, and marketing tools.`,
    tier: "premium",
    handle: username // Store the @handle for display
  }

  const galleryItems = [
    { id: 1, type: 'image', url: '/api/placeholder/600/400', title: 'Restaurant Interior', description: 'Modern dining area with harbor views' },
    { id: 2, type: 'image', url: '/api/placeholder/600/400', title: 'Signature Seafood Platter', description: 'Fresh catch of the day' },
    { id: 3, type: 'video', url: '/api/placeholder/600/400', title: 'Chef Preparation', description: 'Watch our chefs in action' },
    { id: 4, type: 'image', url: '/api/placeholder/600/400', title: 'Outdoor Terrace', description: 'Al fresco dining with ocean breeze' },
    { id: 5, type: 'image', url: '/api/placeholder/600/400', title: 'Wine Selection', description: 'Premium wine collection' }
  ]

  const products = [
    { id: 1, name: "Seafood Platter for Two", price: 450, category: "Main Course", image: "/api/placeholder/300/200", stock: 25, status: "active", rating: 4.8, orders: 156 },
    { id: 2, name: "Private Dining Experience", price: 1200, category: "Experience", image: "/api/placeholder/300/200", stock: null, status: "active", rating: 4.9, orders: 23 },
    { id: 3, name: "Fresh Oysters (dozen)", price: 180, category: "Appetizer", image: "/api/placeholder/300/200", stock: 12, status: "low_stock", rating: 4.7, orders: 89 },
    { id: 4, name: "Chef's Special Tasting Menu", price: 850, category: "Experience", image: "/api/placeholder/300/200", stock: null, status: "active", rating: 4.9, orders: 45 }
  ]

  const campaigns = [
    { id: 1, name: "Weekend Seafood Special", type: "whatsapp", status: "scheduled", scheduledFor: "2024-10-30 18:00", reach: 245, engagement: 18 },
    { id: 2, name: "New Menu Launch", type: "facebook", status: "sent", sentAt: "2024-10-28 12:00", reach: 1250, engagement: 89 },
    { id: 3, name: "Happy Hour Promotion", type: "whatsapp", status: "active", reach: 450, engagement: 32 }
  ]

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % galleryItems.length)
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + galleryItems.length) % galleryItems.length)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Section Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => handleTabChange('gallery')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                  activeSection === 'gallery'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Eye className="h-4 w-4" />
                Profile Gallery
              </button>
              <button
                onClick={() => handleTabChange('shop')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                  activeSection === 'shop'
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <ShoppingBag className="h-4 w-4" />
                Shop/Service
              </button>
              <button
                onClick={() => handleTabChange('marketing')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                  activeSection === 'marketing'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <TrendingUp className="h-4 w-4" />
                Marketing
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Gallery Section */}
            {activeSection === 'gallery' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Premium Gallery Showcase</h3>
                    <p className="text-sm text-gray-600">Advanced slider with video support and premium features</p>
                  </div>
                  {isEditing && (
                    <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
                      <Plus className="h-4 w-4" />
                      Add Media (8 images + videos)
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Premium Slider */}
                  <div className="lg:col-span-2">
                    <div className="relative">
                      <div className="aspect-video bg-gray-100 relative overflow-hidden rounded-xl">
                        <img
                          src={galleryItems[currentSlide].url}
                          alt={galleryItems[currentSlide].title}
                          className="w-full h-full object-cover"
                        />
                        {galleryItems[currentSlide].type === 'video' && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-black/50 rounded-full p-4">
                              <Video className="h-8 w-8 text-white" />
                            </div>
                          </div>
                        )}
                        
                        <button
                          onClick={prevSlide}
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                        >
                          <ChevronLeft className="h-6 w-6" />
                        </button>
                        <button
                          onClick={nextSlide}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                        >
                          <ChevronRight className="h-6 w-6" />
                        </button>

                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                          {galleryItems.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentSlide(index)}
                              className={`w-3 h-3 rounded-full transition-colors ${
                                index === currentSlide ? 'bg-white' : 'bg-white/50'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="mt-4">
                        <h4 className="text-xl font-bold text-gray-900 mb-2">{galleryItems[currentSlide].title}</h4>
                        <p className="text-gray-600">{galleryItems[currentSlide].description}</p>
                      </div>
                    </div>

                    {/* Thumbnails */}
                    <div className="grid grid-cols-6 gap-4 mt-6">
                      {galleryItems.map((item, index) => (
                        <div
                          key={item.id}
                          className={`relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                            index === currentSlide ? 'border-purple-500' : 'border-transparent hover:border-gray-300'
                          }`}
                          onClick={() => setCurrentSlide(index)}
                        >
                          <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
                          {item.type === 'video' && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Video className="h-6 w-6 text-white drop-shadow-lg" />
                            </div>
                          )}
                          {isEditing && (
                            <div className="absolute top-1 right-1">
                              <button className="bg-red-500 hover:bg-red-600 text-white p-1 rounded transition-colors">
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Business Info Sidebar */}
                  <div className="lg:col-span-1">
                    <div className="bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-xl p-6 sticky top-8">
                      <h4 className="font-semibold text-gray-900 mb-4">Premium Contact Information</h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Phone className="h-5 w-5 text-orange-500" />
                          <span className="text-gray-900">{businessData.phone}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Mail className="h-5 w-5 text-orange-500" />
                          <span className="text-gray-900">{businessData.email}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Globe className="h-5 w-5 text-orange-500" />
                          <span className="text-gray-900">{businessData.website}</span>
                        </div>
                      </div>
                      <div className="mt-4 p-3 bg-orange-100 rounded-lg">
                        <p className="text-xs text-orange-800">
                          <Crown className="h-3 w-3 inline mr-1" />
                          Premium directory placement with enhanced visibility
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Shop Section */}
            {activeSection === 'shop' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Premium Shop & Products</h3>
                    <p className="text-sm text-gray-600">Advanced shop integration with premium features</p>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors">
                    <Plus className="h-4 w-4" />
                    Add Product (Unlimited)
                  </button>
                </div>

                {/* Premium Shop Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Products</p>
                        <p className="text-2xl font-bold text-gray-900">24</p>
                      </div>
                      <Package className="h-6 w-6 text-emerald-600" />
                    </div>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Monthly Sales</p>
                        <p className="text-2xl font-bold text-gray-900">R12,450</p>
                      </div>
                      <DollarSign className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Orders</p>
                        <p className="text-2xl font-bold text-gray-900">268</p>
                      </div>
                      <ShoppingBag className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                        <p className="text-2xl font-bold text-gray-900">4.8</p>
                      </div>
                      <Star className="h-6 w-6 text-yellow-600" />
                    </div>
                  </div>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <div key={product.id} className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-all">
                      <div className="relative mb-4">
                        <img src={product.image} alt={product.name} className="w-full h-40 object-cover rounded-lg" />
                        <div className="absolute top-2 right-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            product.status === 'active' ? 'bg-green-100 text-green-800' :
                            product.status === 'low_stock' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {product.status === 'active' ? 'Active' :
                             product.status === 'low_stock' ? 'Low Stock' : 'Out of Stock'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">{product.name}</h4>
                          <p className="text-sm text-gray-600">{product.category}</p>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-lg font-bold text-emerald-600">R{product.price}</p>
                            {product.stock && <p className="text-xs text-gray-500">Stock: {product.stock}</p>}
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-400" fill="currentColor" />
                            <span className="text-sm text-gray-600">{product.rating}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 pt-2">
                          <button className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors text-sm">
                            <Edit className="h-3 w-3" />
                            Edit
                          </button>
                          <button className="flex items-center justify-center gap-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm">
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Marketing Section */}
            {activeSection === 'marketing' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Premium Marketing Tools</h3>
                    <p className="text-gray-600">Advanced WhatsApp & Facebook campaign management</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Link
                      href="/create"
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      Create Listing
                    </Link>
                    <button className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors">
                      <Calendar className="h-4 w-4" />
                      Schedule Campaign
                    </button>
                  </div>
                </div>

                {/* Premium Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-emerald-600 mb-2">1,245</div>
                      <p className="text-sm text-gray-600">Total Views</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-blue-600 mb-2">89</div>
                      <p className="text-sm text-gray-600">Total Clicks</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-purple-600 mb-2">15</div>
                      <p className="text-sm text-gray-600">Active Campaigns</p>
                    </div>
                  </div>
                </div>

                {/* Premium Marketing Campaigns */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-lg font-semibold text-gray-900">Premium Marketing Campaigns</h4>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>WhatsApp & Facebook Integration</span>
                      <span>Advanced Scheduling</span>
                      <span>Premium Analytics</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {campaigns.map((campaign) => (
                      <div key={campaign.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                            <Send className="h-5 w-5 text-orange-600" />
                          </div>
                          <div>
                            <h5 className="font-medium text-gray-900">{campaign.name}</h5>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <span className="capitalize">{campaign.type}</span>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                campaign.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                                campaign.status === 'sent' ? 'bg-green-100 text-green-800' :
                                'bg-orange-100 text-orange-800'
                              }`}>
                                {campaign.status}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <div className="text-lg font-bold text-gray-900">{campaign.reach}</div>
                            <div className="text-xs text-gray-600">Reach</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-gray-900">{campaign.engagement}</div>
                            <div className="text-xs text-gray-600">Engagement</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                              <Calendar className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 bg-orange-50 rounded-lg">
                    <p className="text-sm text-orange-800">
                      <strong>Premium Marketing Listing:</strong> Enhanced visibility with WhatsApp ad scheduling and Facebook campaign tools.
                    </p>
                    <Link
                      href="/choose-plan"
                      className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      <Users className="h-4 w-4" />
                      Upgrade to Business for Instagram Automation
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
