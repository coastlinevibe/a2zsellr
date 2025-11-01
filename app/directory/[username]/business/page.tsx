'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Eye, ShoppingBag, TrendingUp, Plus, Edit, Trash2, Share2, Video, Star, MapPin, Phone, Mail, Globe, ChevronLeft, ChevronRight, Calendar, Send, Package, DollarSign, Users, BarChart3, Crown, Settings, Zap } from 'lucide-react'
import { useAuth } from '@/lib/auth'

export default function BusinessProfilePage() {
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
    description: `${displayName}'s enterprise business directory profile. Complete marketing suite with advanced automation.`,
    tier: "business",
    handle: username // Store the @handle for display
  }

  const galleryItems = [
    { id: 1, type: 'image', url: '/api/placeholder/600/400', title: 'Restaurant Interior', description: 'Modern dining area with harbor views' },
    { id: 2, type: 'image', url: '/api/placeholder/600/400', title: 'Signature Seafood Platter', description: 'Fresh catch of the day' },
    { id: 3, type: 'video', url: '/api/placeholder/600/400', title: 'Chef Preparation', description: 'Watch our chefs in action' },
    { id: 4, type: 'image', url: '/api/placeholder/600/400', title: 'Outdoor Terrace', description: 'Al fresco dining with ocean breeze' },
    { id: 5, type: 'image', url: '/api/placeholder/600/400', title: 'Wine Selection', description: 'Premium wine collection' },
    { id: 6, type: 'video', url: '/api/placeholder/600/400', title: 'Live Music', description: 'Evening entertainment' }
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
                    ? 'border-blue-500 text-blue-600'
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
                    <h3 className="text-lg font-semibold text-gray-900">Enterprise Gallery Showcase</h3>
                    <p className="text-sm text-gray-600">Premium slider with unlimited media and custom branding</p>
                  </div>
                  {isEditing && (
                    <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
                      <Plus className="h-4 w-4" />
                      Add Media (Unlimited + Custom Branding)
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2">
                    <div className="relative">
                      <div className="aspect-video bg-gray-100 relative overflow-hidden rounded-xl border-2 border-blue-200">
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
                        
                        <button onClick={prevSlide} className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors">
                          <ChevronLeft className="h-6 w-6" />
                        </button>
                        <button onClick={nextSlide} className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors">
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
                  </div>

                  <div className="lg:col-span-1">
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6 sticky top-8">
                      <h4 className="font-semibold text-gray-900 mb-4">Enterprise Contact Information</h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Phone className="h-5 w-5 text-blue-500" />
                          <span className="text-gray-900">{businessData.phone}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Mail className="h-5 w-5 text-blue-500" />
                          <span className="text-gray-900">{businessData.email}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Globe className="h-5 w-5 text-blue-500" />
                          <span className="text-gray-900">{businessData.website}</span>
                        </div>
                      </div>
                      <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                        <p className="text-xs text-blue-800">
                          <Users className="h-3 w-3 inline mr-1" />
                          Business marketing listing with enterprise suite access
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Marketing Section */}
            {activeSection === 'marketing' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Business Marketing Suite</h3>
                    <p className="text-gray-600">Complete enterprise marketing automation with Instagram, multi-location management & advanced analytics</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors">
                      <Plus className="h-4 w-4" />
                      Create Campaign
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                      <BarChart3 className="h-4 w-4" />
                      Advanced Analytics
                    </button>
                  </div>
                </div>

                {/* Enterprise Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-blue-600 mb-2">5,420</div>
                      <p className="text-sm text-gray-600">Total Reach</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-purple-600 mb-2">342</div>
                      <p className="text-sm text-gray-600">Conversions</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-emerald-600 mb-2">25</div>
                      <p className="text-sm text-gray-600">Active Campaigns</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-orange-600 mb-2">8.4%</div>
                      <p className="text-sm text-gray-600">Engagement Rate</p>
                    </div>
                  </div>
                </div>

                {/* Business Marketing Features */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <h4 className="text-lg font-semibold text-gray-900 mb-6">Business Marketing Listing Features</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-3 mb-3">
                        <Zap className="h-6 w-6 text-blue-600" />
                        <h5 className="font-semibold text-gray-900">Instagram Automation</h5>
                      </div>
                      <p className="text-sm text-gray-600">Automated Instagram campaigns with advanced targeting and scheduling</p>
                    </div>
                    
                    <div className="p-4 bg-gradient-to-br from-emerald-50 to-blue-50 border border-emerald-200 rounded-lg">
                      <div className="flex items-center gap-3 mb-3">
                        <MapPin className="h-6 w-6 text-emerald-600" />
                        <h5 className="font-semibold text-gray-900">Multi-Location Management</h5>
                      </div>
                      <p className="text-sm text-gray-600">Manage multiple business locations from a single dashboard</p>
                    </div>
                    
                    <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
                      <div className="flex items-center gap-3 mb-3">
                        <BarChart3 className="h-6 w-6 text-purple-600" />
                        <h5 className="font-semibold text-gray-900">Advanced Analytics</h5>
                      </div>
                      <p className="text-sm text-gray-600">Detailed performance metrics and ROI tracking across all channels</p>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Business Marketing Listing:</strong> Complete enterprise marketing suite with Instagram ad automation, multi-location management, advanced analytics, custom branding, and priority support.
                    </p>
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
