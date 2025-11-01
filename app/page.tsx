'use client'

import Link from 'next/link'
import { ArrowRight, Smartphone, Share2, MessageCircle, Zap, Shield, Globe, Star, Crown, Users, Check, Search, MapPin, Filter, Grid, Calendar, TrendingUp, Award, Eye, ShoppingBag } from 'lucide-react'
import { BusinessCard } from '@/components/BusinessCard'
import { useAuth } from '@/lib/auth'
import { MovingBorderButton } from '@/components/ui/moving-border'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function HomePage() {
  const { user, loading } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [categories, setCategories] = useState<any[]>([])
  const [locations, setLocations] = useState<any[]>([])
  const [businesses, setBusinesses] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)

  // Fetch categories and locations from database
  useEffect(() => {
    fetchCategoriesAndLocations()
    // Auto-search on page load to show some businesses
    handleSearch()
  }, [])

  // Auto-search when filters change
  useEffect(() => {
    if (categories.length > 0 && locations.length > 0) {
      const timeoutId = setTimeout(() => {
        handleSearch()
      }, 500) // Debounce search
      
      return () => clearTimeout(timeoutId)
    }
  }, [searchQuery, selectedCategory, selectedLocation])

  // Fetch categories and locations from database
  const fetchCategoriesAndLocations = async () => {
    try {
      // Fetch categories from the new categories table
      const { data: categoriesData, error: catError } = await supabase
        .from('categories')
        .select('name, slug')
        .eq('is_active', true)
        .order('name')
      
      if (catError) {
        console.error('Error fetching categories:', catError)
        // Fallback to hardcoded categories
        setCategories([
          { name: 'All Categories', slug: 'all' },
          { name: 'Restaurants', slug: 'restaurants' },
          { name: 'Retail', slug: 'retail' },
          { name: 'Services', slug: 'services' },
          { name: 'Healthcare', slug: 'healthcare' },
          { name: 'Technology', slug: 'technology' }
        ])
      } else {
        setCategories(categoriesData || [])
      }

      // Fetch locations from the new locations table
      const { data: locationsData, error: locError } = await supabase
        .from('locations')
        .select('city, slug')
        .eq('is_active', true)
        .order('city')
      
      if (locError) {
        console.error('Error fetching locations:', locError)
        // Fallback to hardcoded locations
        setLocations([
          { city: 'All Locations', slug: 'all' },
          { city: 'Johannesburg', slug: 'johannesburg' },
          { city: 'Cape Town', slug: 'cape-town' },
          { city: 'Durban', slug: 'durban' },
          { city: 'Pretoria', slug: 'pretoria' }
        ])
      } else {
        setLocations(locationsData || [])
      }
    } catch (error) {
      console.error('Error setting up categories and locations:', error)
      // Set fallback data
      setCategories([
        { name: 'All Categories', slug: 'all' },
        { name: 'Restaurants', slug: 'restaurants' },
        { name: 'Retail', slug: 'retail' },
        { name: 'Services', slug: 'services' }
      ])
      setLocations([
        { city: 'All Locations', slug: 'all' },
        { city: 'Johannesburg', slug: 'johannesburg' },
        { city: 'Cape Town', slug: 'cape-town' },
        { city: 'Durban', slug: 'durban' }
      ])
    }
  }

  // Search function
  const handleSearch = async () => {
    setIsSearching(true)
    try {
      let query = supabase
        .from('profiles')
        .select('*')
        .eq('is_active', true)
        .eq('profile_type', 'business') // Only business profiles
        .not('display_name', 'is', null) // Only profiles with display names

      // Apply search query filter
      if (searchQuery.trim()) {
        const searchTerm = searchQuery.trim()
        query = query.or(`display_name.ilike.%${searchTerm}%,bio.ilike.%${searchTerm}%,business_category.ilike.%${searchTerm}%,business_location.ilike.%${searchTerm}%`)
      }

      // Apply category filter
      if (selectedCategory && selectedCategory !== 'all') {
        query = query.eq('business_category', selectedCategory)
      }

      // Apply location filter
      if (selectedLocation && selectedLocation !== 'all') {
        query = query.eq('business_location', selectedLocation)
      }

      // Order by priority: verified first, then by recent updates
      query = query
        .order('verified_seller', { ascending: false })
        .order('updated_at', { ascending: false })
        .limit(24) // Show more results

      const { data, error } = await query

      if (error) {
        console.error('Search error:', error)
        // Fallback to simpler query if join fails
        const fallbackQuery = supabase
          .from('profiles')
          .select('*')
          .eq('is_active', true)
          .eq('profile_type', 'business')
          .not('display_name', 'is', null)
          .order('verified_seller', { ascending: false })
          .order('updated_at', { ascending: false })
          .limit(12)
        
        const { data: fallbackData } = await fallbackQuery
        setBusinesses(fallbackData || [])
      } else {
        setBusinesses(data || [])
      }
    } catch (error) {
      console.error('Search error:', error)
      setBusinesses([])
    } finally {
      setIsSearching(false)
    }
  }
  return (
    <div className="min-h-screen">
      {/* Hero Section - Business Directory */}
      <section className="relative bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-[52px] pb-20 sm:pb-32 md:pt-[68px] md:pb-40 lg:pt-[100px] lg:pb-48">
        <div className="absolute inset-0 bg-[url('/images/hero/bg2.jpg')] bg-center bg-cover opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/50"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Award className="h-10 w-10 text-yellow-400" />
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-white drop-shadow-lg leading-tight">
                South Africa's
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 block">
                  Premium Directory
                </span>
              </h1>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl text-gray-300 mb-6 max-w-4xl mx-auto leading-relaxed">
              Discover quality businesses nationwide • Mobile-first • Award-winning design
            </h2>
            <div className="text-gray-400 mb-12 max-w-3xl mx-auto">
              <div className="flex flex-wrap justify-center gap-4 sm:gap-8 text-sm sm:text-base">
                <span className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Multi-Location</span>
                <span className="flex items-center gap-2"><Award className="h-4 w-4" /> Premium Quality</span>
                <span className="flex items-center gap-2"><Smartphone className="h-4 w-4" /> Mobile First</span>
                <span className="flex items-center gap-2"><Zap className="h-4 w-4" /> Fast Navigation</span>
              </div>
            </div>
            
            {/* Quick Access for Logged-in Users */}
            {user && (
              <div className="mb-8">
                <Link
                  href="/directory/profile"
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 hover:border-white/30 text-white px-6 py-3 rounded-xl transition-all"
                >
                  <Eye className="h-4 w-4" />
                  <span>Manage Your Directory Profile</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
          
          {/* Directory Search - Always Visible */}
          <div className="max-w-6xl mx-auto">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 sm:p-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
                {/* Search Input */}
                <div className="lg:col-span-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Find Businesses</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search restaurants, services, shops..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                {/* Location Filter */}
                <div className="lg:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <select
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white"
                    >
                      {locations.map((location) => (
                        <option key={location.slug || location.city} value={location.slug || location.city}>
                          {location.city || location}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {/* Category Filter */}
                <div className="lg:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white"
                    >
                      {categories.map((category) => (
                        <option key={category.slug || category.name} value={category.slug || category.name}>
                          {category.name || category}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {/* Search Button */}
                <div className="lg:col-span-1">
                  <button 
                    onClick={handleSearch}
                    disabled={isSearching}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-xl transition-all transform hover:scale-105 flex items-center justify-center"
                  >
                    {isSearching ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <Search className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search Results */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Loading State */}
          {isSearching && (
            <div className="text-center py-12">
              <div className="inline-flex items-center gap-3 bg-white px-6 py-4 rounded-xl shadow-sm border border-gray-200">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
                <span className="text-gray-700 font-medium">Searching premium businesses...</span>
              </div>
            </div>
          )}

          {/* Results Header */}
          {!isSearching && businesses.length > 0 && (
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Premium Business Directory
              </h2>
              <p className="text-gray-600 text-lg">
                Found {businesses.length} premium business{businesses.length !== 1 ? 'es' : ''} 
                {searchQuery && ` matching "${searchQuery}"`}
                {selectedCategory !== 'all' && ` in ${categories.find(c => c.slug === selectedCategory)?.name}`}
                {selectedLocation !== 'all' && ` in ${locations.find(l => l.slug === selectedLocation)?.city}`}
              </p>
            </div>
          )}
          
          {/* Business Cards Grid */}
          {!isSearching && businesses.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {businesses.map((business: any) => {
                // Find category and location names from business profile data
                const categoryName = categories.find(c => c.slug === business.business_category)?.name || business.business_category
                const locationName = locations.find(l => l.slug === business.business_location)?.city || business.business_location
                
                return (
                  <BusinessCard
                    key={business.id}
                    business={business}
                    categoryName={categoryName}
                    locationName={locationName}
                  />
                )
              })}
            </div>
          )}

          {/* Empty State */}
          {!isSearching && businesses.length === 0 && (searchQuery || selectedCategory !== 'all' || selectedLocation !== 'all') && (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No businesses found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search criteria or browse all businesses.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCategory('all')
                    setSelectedLocation('all')
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}

          {/* Initial Load State */}
          {!isSearching && businesses.length === 0 && !searchQuery && selectedCategory === 'all' && selectedLocation === 'all' && (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Award className="w-10 h-10 text-emerald-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Discover Premium Businesses</h3>
                <p className="text-gray-600 mb-6">
                  Use the search above to find quality businesses in your area.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Business Listings by Location */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-2 mb-4">
              <MapPin className="h-6 w-6 text-purple-600" />
              <h2 className="text-3xl font-bold text-gray-900">
                Business Listings by Location
              </h2>
              <MapPin className="h-6 w-6 text-purple-600" />
            </div>
            <p className="text-lg text-gray-600">
              Premium businesses across South Africa's major cities
            </p>
          </div>

          {/* Location Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {locations.slice(1).map((location) => (
              <button
                key={location.slug || location.city}
                onClick={() => setSelectedLocation(location.slug || location.city)}
                className={`px-4 py-2 bg-white border border-gray-300 rounded-lg hover:border-purple-500 hover:text-purple-600 transition-colors text-sm font-medium ${
                  selectedLocation === (location.slug || location.city) ? 'border-purple-500 text-purple-600 bg-purple-50' : ''
                }`}
              >
                {location.city || location}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Featured Business Cards */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="h-48 bg-gradient-to-br from-emerald-400 to-emerald-600 relative">
                <div className="absolute top-4 left-4">
                  <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                    <Award className="h-4 w-4" /> Premium
                  </span>
                </div>
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-xl font-bold">Ocean Basket</h3>
                  <p className="text-emerald-100">V&A Waterfront, Cape Town</p>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4" fill="currentColor" />
                    ))}
                  </div>
                  <span className="text-gray-600 text-sm">(4.8) • 1.2k reviews</span>
                </div>
                <p className="text-gray-600 mb-4">Fresh seafood restaurant with stunning harbor views. Premium dining experience.</p>
                <div className="flex gap-2">
                  <button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-lg transition-colors">
                    View Menu
                  </button>
                  <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg transition-colors">
                    <Share2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600 relative">
                <div className="absolute top-4 left-4">
                  <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                    <Award className="h-4 w-4" /> Premium
                  </span>
                </div>
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-xl font-bold">TechHub JHB</h3>
                  <p className="text-blue-100">Sandton, Johannesburg</p>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4" fill="currentColor" />
                    ))}
                  </div>
                  <span className="text-gray-600 text-sm">(4.9) • 856 reviews</span>
                </div>
                <p className="text-gray-600 mb-4">Leading IT services and digital transformation solutions for businesses.</p>
                <div className="flex gap-2">
                  <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors">
                    Get Quote
                  </button>
                  <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg transition-colors">
                    <Share2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="h-48 bg-gradient-to-br from-purple-400 to-purple-600 relative">
                <div className="absolute top-4 left-4">
                  <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                    <Award className="h-4 w-4" /> Premium
                  </span>
                </div>
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-xl font-bold">Wellness Spa</h3>
                  <p className="text-purple-100">Umhlanga, Durban</p>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4" fill="currentColor" />
                    ))}
                  </div>
                  <span className="text-gray-600 text-sm">(4.7) • 643 reviews</span>
                </div>
                <p className="text-gray-600 mb-4">Luxury spa treatments and wellness services in a tranquil beachside setting.</p>
                <div className="flex gap-2">
                  <button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition-colors">
                    Book Now
                  </button>
                  <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg transition-colors">
                    <Share2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link
              href="/directory"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-4 px-8 rounded-xl transition-all transform hover:scale-105"
            >
              <Grid className="h-5 w-5" />
              Browse All Businesses
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* a2z Sellr Marketing Tools */}
      <section className="py-20 bg-gradient-to-br from-slate-900 to-purple-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-6">
              <TrendingUp className="h-8 w-8 text-orange-400" />
              <h2 className="text-3xl font-bold text-white">
                a2z Sellr Marketing Tools
              </h2>
            </div>
            <p className="text-xl text-gray-300 mb-4">
              Premium & Business plans with advanced marketing capabilities
            </p>
            <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-xl p-6 max-w-3xl mx-auto mb-8">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Calendar className="h-6 w-6 text-orange-400" />
                <p className="text-orange-300 font-bold text-lg">
                  🚀 Advanced Ad Scheduling Now Available
                </p>
              </div>
              <p className="text-orange-200 text-center">
                Schedule and automate your WhatsApp, Facebook, and Instagram marketing campaigns with our new premium tools.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto px-4 sm:px-0">
            {/* Free Directory Listing */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl border-2 border-gray-600 p-4 sm:p-6 text-center">
              <h3 className="text-xl font-bold text-white mb-2">Free Directory Listing</h3>
              <div className="text-3xl font-bold text-white mb-4">R0</div>
              <div className="space-y-3 mb-6 text-sm text-gray-300">
                <div className="flex items-center justify-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Basic business profile</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>3 gallery images</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>5 products in shop</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Contact information</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Location mapping</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Customer reviews</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>3 marketing listings</span>
                </div>
              </div>
              <div className="space-y-2">
                <Link
                  href="/auth/signup-animated?plan=free"
                  className="w-full py-3 px-4 border-2 border-emerald-400 text-emerald-300 bg-emerald-900/20 rounded-xl hover:bg-emerald-800/30 transition-colors inline-block font-medium"
                >
                  List Your Business
                </Link>
              </div>
            </div>

            {/* Premium Plan */}
            <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-sm rounded-2xl border-2 border-orange-500 p-4 sm:p-6 text-center relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-1 rounded-full text-xs font-bold">
                  Most Popular
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <Crown className="w-5 h-5 text-orange-400" />
                <h3 className="text-xl font-bold text-white">Premium</h3>
              </div>
              <div className="mb-4">
                <div className="text-3xl font-bold text-white">R149</div>
                <div className="text-sm text-orange-300 font-medium">
                  /month • Advanced marketing tools
                </div>
              </div>
              <div className="space-y-3 mb-6 text-sm text-gray-200">
                <div className="flex items-center justify-center gap-2">
                  <Check className="w-4 h-4 text-orange-400" />
                  <span>Premium directory placement</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Check className="w-4 h-4 text-orange-400" />
                  <span>Gallery slider showcase</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Check className="w-4 h-4 text-orange-400" />
                  <span>Shop integration</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Check className="w-4 h-4 text-orange-400" />
                  <span>WhatsApp ad scheduling</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Check className="w-4 h-4 text-orange-400" />
                  <span>Facebook campaign tools</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Check className="w-4 h-4 text-orange-400" />
                  <span>Premium marketing listing</span>
                </div>
              </div>
              <div className="space-y-2">
                <Link
                  href="/choose-plan?plan=premium"
                  className="w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl transition-all transform hover:scale-105 inline-block font-bold"
                >
                  Start Premium
                </Link>
              </div>
            </div>

            {/* Business Plan */}
            <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm rounded-2xl border-2 border-blue-500 p-4 sm:p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Users className="w-5 h-5 text-blue-400" />
                <h3 className="text-xl font-bold text-white">Business</h3>
              </div>
              <div className="mb-4">
                <div className="text-3xl font-bold text-white">R299</div>
                <div className="text-sm text-blue-300 font-medium">
                  /month • Enterprise marketing suite
                </div>
              </div>
              <div className="space-y-3 mb-6 text-sm text-gray-200">
                <div className="flex items-center justify-center gap-2">
                  <Check className="w-4 h-4 text-blue-400" />
                  <span>Everything in Premium</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Check className="w-4 h-4 text-blue-400" />
                  <span>Multi-location management</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Check className="w-4 h-4 text-blue-400" />
                  <span>Advanced analytics</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Check className="w-4 h-4 text-blue-400" />
                  <span>Instagram ad automation</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Check className="w-4 h-4 text-blue-400" />
                  <span>Custom branding</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Check className="w-4 h-4 text-blue-400" />
                  <span>Priority support</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Check className="w-4 h-4 text-blue-400" />
                  <span>Business marketing listing</span>
                </div>
              </div>
              <div className="space-y-2">
                <Link
                  href="/choose-plan?plan=business"
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl transition-all transform hover:scale-105 inline-block font-bold"
                >
                  Start Business
                </Link>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl p-6 max-w-2xl mx-auto mb-8">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Calendar className="h-5 w-5 text-yellow-400" />
                <p className="text-yellow-300 font-bold">
                  📱 WhatsApp & Facebook Ad Scheduling
                </p>
              </div>
              <p className="text-yellow-200 text-sm">
                Automate your marketing campaigns across all major platforms with our advanced scheduling tools.
              </p>
            </div>
            <Link
              href="/choose-plan"
              className="inline-flex items-center gap-2 text-orange-300 hover:text-orange-200 font-medium transition-colors"
            >
              View all marketing features →
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Directory Features */}
      <section className="py-20 bg-gradient-to-br from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Award className="h-6 w-6 text-purple-600" />
              <h2 className="text-3xl font-bold text-gray-900">
                Why Choose a2z Sellr Directory?
              </h2>
            </div>
            <p className="text-lg text-gray-600">
              South Africa's most comprehensive business directory with premium features
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="bg-gradient-to-br from-purple-100 to-purple-200 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <MapPin className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Multi-Location Coverage
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Comprehensive coverage across all major South African cities with precise location mapping and local insights.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="bg-gradient-to-br from-emerald-100 to-emerald-200 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <Award className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Premium Quality
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Verified businesses with authentic reviews, professional photos, and detailed service information.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="bg-gradient-to-br from-blue-100 to-blue-200 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <Smartphone className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Mobile-First Design
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Award-winning mobile interface optimized for touch navigation and lightning-fast performance.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="bg-gradient-to-br from-orange-100 to-orange-200 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <Eye className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Gallery Showcase
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Beautiful image galleries and video content that showcase businesses at their best.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="bg-gradient-to-br from-red-100 to-red-200 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <ShoppingBag className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Integrated Shopping
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Direct product and service purchasing with secure payment processing and delivery tracking.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="bg-gradient-to-br from-green-100 to-green-200 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <Share2 className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Smart Sharing
              </h3>
              <p className="text-gray-600 leading-relaxed">
                One-click sharing to WhatsApp, Facebook, Instagram, and SMS with optimized previews.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-purple-900 via-blue-900 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/hero/bg2.jpg')] bg-center bg-cover opacity-5"></div>
        <div className="relative z-10 max-w-5xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center mb-8">
            <MovingBorderButton
              borderRadius="1rem"
              duration={3000}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-8 py-4"
              containerClassName="inline-block"
            >
              <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 sm:w-6 sm:h-6" fill="white" />
                  <span className="font-bold text-base sm:text-lg text-center sm:text-left">🏆 Join South Africa's Premium Business Directory</span>
                </div>
                <Link href="/auth/signup-animated?plan=free" className="inline-flex items-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-bold transition-all shadow-lg hover:shadow-xl hover:scale-105 border border-purple-400 whitespace-nowrap">
                  List Your Business Free
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={3} />
                </Link>
              </div>
            </MovingBorderButton>
          </div>
          <div className="flex items-center justify-center gap-3 mb-6">
            <Star className="h-8 w-8 text-yellow-400" fill="currentColor" />
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
              Ready to Go Premium?
            </h2>
            <Star className="h-8 w-8 text-yellow-400" fill="currentColor" />
          </div>
          <p className="text-xl sm:text-2xl text-gray-300 mb-8 leading-relaxed max-w-3xl mx-auto">
            Join thousands of premium businesses showcasing their services with award-winning design and advanced marketing tools.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto mb-10">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center justify-center gap-2 text-emerald-300 mb-2">
                <Eye className="h-5 w-5" />
                <span className="font-semibold">Gallery View</span>
              </div>
              <p className="text-gray-400 text-sm">Showcase with stunning visuals</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center justify-center gap-2 text-orange-300 mb-2">
                <ShoppingBag className="h-5 w-5" />
                <span className="font-semibold">Shop Integration</span>
              </div>
              <p className="text-gray-400 text-sm">Sell directly from your listing</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center justify-center gap-2 text-blue-300 mb-2">
                <TrendingUp className="h-5 w-5" />
                <span className="font-semibold">Marketing Tools</span>
              </div>
              <p className="text-gray-400 text-sm">Automate your campaigns</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center px-4 sm:px-0">
            <Link
              href="/auth/signup-animated?plan=free"
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold py-4 px-8 rounded-xl transition-all transform hover:scale-105 inline-flex items-center justify-center text-base sm:text-lg shadow-lg"
            >
              <Award className="mr-2 h-5 w-5" />
              Start Free Directory Listing
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/choose-plan"
              className="border-2 border-white/30 text-white hover:bg-white/10 font-semibold py-4 px-8 rounded-xl transition-all inline-flex items-center justify-center text-base sm:text-lg backdrop-blur-sm"
            >
              <TrendingUp className="mr-2 h-5 w-5" />
              View Premium Plans
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-slate-900 to-black text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-blue-500 to-emerald-500 rounded-2xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">a2z Sellr</span>
                <p className="text-xs text-gray-400 -mt-1">Premium Directory</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 mb-4">
              <Award className="h-5 w-5 text-yellow-400" />
              <p className="text-lg text-gray-300 font-medium">
                South Africa's Award-Winning Business Directory
              </p>
              <Award className="h-5 w-5 text-yellow-400" />
            </div>
            <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
              Connecting premium businesses with customers nationwide through mobile-first design and advanced marketing tools.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 mb-8">
              <button 
                onClick={() => {
                  const message = encodeURIComponent('Hi! I need support with a2z Sellr Premium Directory.')
                  window.open(`https://wa.me/27714329190?text=${message}`, '_blank')
                }}
                className="text-sm text-gray-400 hover:text-emerald-300 transition-colors flex items-center gap-1"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp Support
              </button>
              <span className="text-gray-600">•</span>
              <Link href="/choose-plan" className="text-sm text-gray-400 hover:text-purple-300 transition-colors flex items-center gap-1">
                <Crown className="h-4 w-4" />
                Premium Plans
              </Link>
              <span className="text-gray-600">•</span>
              <Link href="/directory" className="text-sm text-gray-400 hover:text-blue-300 transition-colors flex items-center gap-1">
                <Grid className="h-4 w-4" />
                Browse Directory
              </Link>
              <span className="text-gray-600">•</span>
              <Link href="/admin" className="text-sm text-gray-600 hover:text-gray-400 transition-colors">
                Admin
              </Link>
            </div>
            <div className="border-t border-gray-800 pt-6">
              <p className="text-sm text-gray-500 mb-2">
                © 2024 a2z Sellr Premium Directory. Made with ❤️ for South African businesses.
              </p>
              <div className="flex items-center justify-center gap-4 text-xs text-gray-600">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> Multi-Location
                </span>
                <span className="flex items-center gap-1">
                  <Smartphone className="h-3 w-3" /> Mobile-First
                </span>
                <span className="flex items-center gap-1">
                  <Award className="h-3 w-3" /> Award-Winning
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
