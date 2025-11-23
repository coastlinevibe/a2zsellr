'use client'

import Link from 'next/link'
import { ArrowRight, Search, MapPin, Eye, ShoppingBag, Star, Share2, BarChart3, Target, Rocket } from 'lucide-react'
import { BusinessCard } from '@/components/BusinessCard'
import { useAuth } from '@/lib/auth'
import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { 
  searchBusinessesFast, 
  getCategoriesAndLocationsFast, 
  getRecentActivitiesFast,
  preloadCriticalData,
  performanceCache 
} from '@/lib/performanceOptimizations'

type RecentActivity = {
  id: string
  name: string
  created_at: string
  profile_id: string | null
  profile_name: string
}

export default function OptimizedHomePage() {
  const { user, loading } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [categories, setCategories] = useState<any[]>([])
  const [locations, setLocations] = useState<any[]>([])
  const [businesses, setBusinesses] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
  const [showLocationDropdown, setShowLocationDropdown] = useState(false)
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  
  const locationDropdownRef = useRef<HTMLDivElement>(null)
  const categoryDropdownRef = useRef<HTMLDivElement>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout>()

  // Memoized ticker content
  const tickerContent = useMemo(() => {
    const fallbackMessages = [
      '🎉 Model Mania added "Dodge Black Beauty V8" to their shop • ',
      '🎉 Model Mania added "Rolls Royce Racers" to their shop • ',
      '🎉 jan stene added "baie lekke steen" to their shop • '
    ]

    const messages = recentActivities.length > 0
      ? recentActivities.map((activity) => {
          const displayName = activity.profile_name || activity.profile_id || 'Someone'
          return `🎉 ${displayName} added "${activity.name}" to their shop • `
        })
      : fallbackMessages

    const baseLoop = messages.join(' ')
    return `${baseLoop} ${baseLoop}`
  }, [recentActivities])

  // Optimized search function with debouncing
  const handleSearch = useCallback(async () => {
    if (isSearching) return
    
    setIsSearching(true)
    try {
      const { data, error } = await searchBusinessesFast(
        searchQuery,
        selectedCategory,
        selectedLocation,
        24
      )

      if (error) {
        console.error('Search error:', error)
        setBusinesses([])
      } else {
        setBusinesses(data || [])
      }
    } catch (error) {
      console.error('Search error:', error)
      setBusinesses([])
    } finally {
      setIsSearching(false)
    }
  }, [searchQuery, selectedCategory, selectedLocation, isSearching])

  // Debounced search effect
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(() => {
      if (categories.length > 0 && locations.length > 0) {
        handleSearch()
      }
    }, 300) // Reduced debounce time

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchQuery, selectedCategory, selectedLocation, handleSearch, categories.length, locations.length])

  // Load initial data with preloading
  useEffect(() => {
    const loadInitialData = async () => {
      setMounted(true)
      
      try {
        // Preload critical data
        await preloadCriticalData()
        
        // Load categories and locations
        const { categories: cats, locations: locs } = await getCategoriesAndLocationsFast()
        setCategories(cats)
        setLocations(locs)
        
        // Load recent activities
        const { data: activities } = await getRecentActivitiesFast(15)
        setRecentActivities(activities || [])
        
        // Initial business search
        const { data: initialBusinesses } = await searchBusinessesFast('', 'all', 'all', 24)
        setBusinesses(initialBusinesses || [])
        
      } catch (error) {
        console.error('Error loading initial data:', error)
      }
    }

    loadInitialData()
  }, [])

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [])

  // Handle clicking outside dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (locationDropdownRef.current && !locationDropdownRef.current.contains(event.target as Node)) {
        setShowLocationDropdown(false)
      }
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setShowCategoryDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Refresh activities periodically
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const { data } = await getRecentActivitiesFast(15)
        if (data) setRecentActivities(data)
      } catch (error) {
        console.error('Error refreshing activities:', error)
      }
    }, 60000) // Every minute

    return () => clearInterval(interval)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#f0f0f0] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div 
      className="min-h-screen bg-[#f0f0f0] relative overflow-hidden" 
      style={{
        backgroundImage: "linear-gradient(#00000008 1px, transparent 1px), linear-gradient(90deg, #00000008 1px, transparent 1px)",
        backgroundSize: "16px 16px"
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Hero Section */}
      <motion.section 
        className="pt-10 pb-16 lg:pt-20 lg:pb-20 relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <motion.div 
              className="text-left"
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <motion.h1 
                className="text-4xl sm:text-5xl lg:text-6xl font-black text-black leading-tight mb-6 bg-white p-6 rounded-xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.9)]"
                initial={{ y: 50, opacity: 0, rotate: -5 }}
                animate={{ y: 0, opacity: 1, rotate: 0 }}
                transition={{ duration: 0.8, delay: 0.6, type: "spring", stiffness: 100 }}
              >
                <span className="block">BE SEEN.</span>
                <span className="block">SHOW & SELL.</span>
                <span className="text-green-600 block">ALL IN ONE</span>
              </motion.h1>
              
              <motion.p 
                className="text-lg text-black mb-8 leading-relaxed max-w-lg bg-white p-4 rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] font-bold"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                Setup your profile, display your products/services, and sell with powerful marketing tools. Everything you need to boost your sales.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div 
                className="flex flex-col sm:flex-row gap-4"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 1.4 }}
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/auth/signup-animated?plan=free"
                    className="inline-flex items-center justify-center px-8 py-4 bg-green-500 hover:bg-green-600 text-white font-black rounded-lg transition-colors border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)]"
                  >
                    START FREE TRIAL
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </motion.div>
                <motion.button 
                  className="inline-flex items-center justify-center px-8 py-4 bg-white hover:bg-gray-100 text-black font-black rounded-lg transition-colors border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)]"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Eye className="mr-2 h-5 w-5" />
                  WATCH DEMO
                </motion.button>
              </motion.div>
            </motion.div>

            {/* Right Content */}
            <motion.div 
              className="relative"
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              {/* Success Stories Ticker */}
              <motion.div 
                className="mb-6 overflow-hidden bg-green-100 border-2 border-green-500 rounded-lg shadow-[2px_2px_0px_0px_rgba(34,197,94,0.9)]"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 1.4 }}
              >
                <motion.div 
                  className="flex whitespace-nowrap py-2 px-4"
                  animate={{ x: ["0%", "-50%"] }}
                  transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
                >
                  <span className="text-green-800 font-bold text-sm mr-8">
                    {tickerContent}
                  </span>
                </motion.div>
              </motion.div>

              {/* Demo Card */}
              <div className="bg-white rounded-2xl p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.9)]">
                <div className="bg-green-300 rounded-xl p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] mb-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-green-500 rounded-lg border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]">
                      <ShoppingBag className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-black text-black">OCEAN BASKET</h3>
                      <p className="text-sm text-black font-bold">V&A WATERFRONT</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-black fill-current" />
                    ))}
                    <span className="text-sm text-black ml-2 font-bold">(4.8) • 1.2K REVIEWS</span>
                  </div>
                  <p className="text-black text-sm mb-4 font-bold">FRESH SEAFOOD WITH HARBOR VIEWS</p>
                  <div className="flex gap-2">
                    <button className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg text-sm font-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]">
                      VIEW MENU
                    </button>
                    <button className="bg-blue-400 text-black py-2 px-4 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]">
                      <Share2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-400 rounded-lg p-4 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="h-4 w-4 text-black" />
                      <span className="text-sm font-black text-black">ANALYTICS</span>
                    </div>
                    <p className="text-xs text-black font-bold">TRACK PERFORMANCE</p>
                  </div>
                  <div className="bg-green-400 rounded-lg p-4 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-4 w-4 text-black" />
                      <span className="text-sm font-black text-black">MARKETING</span>
                    </div>
                    <p className="text-xs text-black font-bold">BOOST VISIBILITY</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>
      
      {/* Directory Search Section */}
      <motion.section 
        id="directory"
        className="py-16 relative"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-12">
            <h2 className="text-3xl font-black text-black mb-4 bg-white p-4 rounded-xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.9)] inline-block">
              FIND LOCAL BUSINESSES
            </h2>

          </motion.div>
          
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.9)] p-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
                {/* Search Input */}
                <div className="lg:col-span-5">
                  <label className="block text-sm font-black text-black mb-2">FIND BUSINESSES</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-black" />
                    <input
                      type="text"
                      placeholder="Search businesses, products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border-2 border-black rounded-lg focus:ring-0 focus:border-green-500 bg-white font-bold text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]"
                    />
                  </div>
                </div>
                
                {/* Location Filter */}
                <div className="lg:col-span-3" ref={locationDropdownRef}>
                  <label className="block text-sm font-black text-black mb-2">LOCATION</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-black z-10" />
                    <button
                      onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                      className="w-full pl-10 pr-4 py-3 border-2 border-black rounded-lg bg-white font-bold text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)] text-left"
                    >
                      {locations.find(l => (l.slug || l.city) === selectedLocation)?.city || 'All Locations'}
                    </button>
                    {showLocationDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white border-4 border-black rounded-lg shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)] z-20 max-h-60 overflow-y-auto">
                        {locations.map((location) => (
                          <button
                            key={location.slug || location.city}
                            onClick={() => {
                              setSelectedLocation(location.slug || location.city)
                              setShowLocationDropdown(false)
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-green-100 font-bold text-black border-b border-gray-200 last:border-b-0"
                          >
                            {location.city}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Category Filter */}
                <div className="lg:col-span-3" ref={categoryDropdownRef}>
                  <label className="block text-sm font-black text-black mb-2">CATEGORY</label>
                  <div className="relative">
                    <button
                      onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                      className="w-full px-4 py-3 border-2 border-black rounded-lg bg-white font-bold text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)] text-left"
                    >
                      {categories.find(c => (c.slug || c.name) === selectedCategory)?.name || 'All Categories'}
                    </button>
                    {showCategoryDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white border-4 border-black rounded-lg shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)] z-20 max-h-60 overflow-y-auto">
                        {categories.map((category) => (
                          <button
                            key={category.slug || category.name}
                            onClick={() => {
                              setSelectedCategory(category.slug || category.name)
                              setShowCategoryDropdown(false)
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-green-100 font-bold text-black border-b border-gray-200 last:border-b-0"
                          >
                            {category.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Search Button */}
                <div className="lg:col-span-1">
                  <button
                    onClick={handleSearch}
                    disabled={isSearching}
                    className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-black py-3 px-4 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)] transition-colors"
                  >
                    {isSearching ? '...' : 'GO'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Search Results */}
          <div className="mt-12">
            {isSearching ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
                <p className="text-black font-bold">SEARCHING...</p>
              </div>
            ) : businesses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {businesses.map((business) => (
                  <BusinessCard key={business.id} business={business} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-black font-bold text-lg">NO BUSINESSES FOUND</p>
                <p className="text-gray-600 mt-2">Try adjusting your search criteria</p>
              </div>
            )}
          </div>
        </div>
      </motion.section>
    </motion.div>
  )
}
