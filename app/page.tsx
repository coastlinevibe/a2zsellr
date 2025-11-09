'use client'

import Link from 'next/link'
import { ArrowRight, Smartphone, Share2, MessageCircle, Zap, Shield, Globe, Star, Crown, Users, Check, Search, MapPin, Filter, Grid, Calendar, TrendingUp, Award, Eye, ShoppingBag, CheckCircle, BarChart3, Target, Rocket, ChevronLeft, ChevronRight } from 'lucide-react'
import { BusinessCard } from '@/components/BusinessCard'
import { useAuth } from '@/lib/auth'
import { MovingBorderButton } from '@/components/ui/moving-border'
import { useState, useEffect, useRef, useMemo } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { AdminLoginModal } from '@/components/AdminLoginModal'
import { PricingContainer, type PricingPlan } from '@/components/ui/pricing-container'
import { motion } from 'framer-motion'

type RecentActivity = {
  id: string
  name: string
  created_at: string
  profile_id: string | null
  profile_name: string
}

export default function HomePage() {
  const { user, loading } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [categories, setCategories] = useState<any[]>([])
  const [locations, setLocations] = useState<any[]>([])
  const [businesses, setBusinesses] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showAdminModal, setShowAdminModal] = useState(false)
  const [showLocationDropdown, setShowLocationDropdown] = useState(false)
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [showExitIntent, setShowExitIntent] = useState(false)
  const [chatWidgetCollapsed, setChatWidgetCollapsed] = useState(false)
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
  const locationDropdownRef = useRef<HTMLDivElement>(null)
  const categoryDropdownRef = useRef<HTMLDivElement>(null)

  const fallbackTickerMessages = useMemo(
    () => [
      '🎉 Model Mania added "Dodge Black Beauty V8" to their shop • ',
      '🎉 Model Mania added "Rolls Royce Racers" to their shop • ',
      '🎉 jan stene added "baie lekke steen" to their shop • '
    ],
    []
  )

  const tickerContent = useMemo(() => {
    const messages = recentActivities.length > 0
      ? recentActivities.map((activity) => {
          const displayName = activity.profile_name || activity.profile_id || 'Someone'
          return `🎉 ${displayName} added "${activity.name}" to their shop • `
        })
      : fallbackTickerMessages

    const baseLoop = messages.join(' ')
    return `${baseLoop} ${baseLoop}` // duplicate for seamless scroll
  }, [recentActivities, fallbackTickerMessages])

  // Pricing plans data
  const pricingPlans: PricingPlan[] = [
    {
      name: "Free",
      monthlyPrice: 0,
      yearlyPrice: 0,
      features: [
        "Basic business profile",
        "3 gallery images",
        "5 products in shop",
        "Contact information",
        "Customer reviews",
        "3 marketing listings/shares"
      ],
      isPopular: false,
      accent: "bg-gray-500"
    },
    {
      name: "Premium",
      monthlyPrice: 149,
      yearlyPrice: 1192, // 20% discount
      features: [
        "Everything in Free",
        "Premium directory placement",
        "Unlimited products & images",
        "WhatsApp ad scheduling",
        "Facebook campaign tools",
        "Advanced analytics"
      ],
      isPopular: true,
      accent: "bg-green-500"
    },
    {
      name: "Business",
      monthlyPrice: 299,
      yearlyPrice: 2392, // 20% discount
      features: [
        "Everything in Premium",
        "Multi-location management",
        "Instagram ad automation",
        "Custom branding",
        "Priority support",
        "Bulk campaign management"
      ],
      isPopular: false,
      accent: "bg-blue-500"
    }
  ]

  // Fetch recent activities for success ticker
  const fetchRecentActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('profile_products')
        .select(`
          id,
          name,
          created_at,
          profile_id,
          profiles(display_name)
        `)
        .order('created_at', { ascending: false })
        .limit(15)

      if (error) {
        throw error
      }

      const normalizedActivities: RecentActivity[] = (data ?? [])
        .map((activity: any) => {
          const profileData = Array.isArray(activity.profiles)
            ? activity.profiles[0]
            : activity.profiles

          return {
            id: activity.id,
            name: activity.name ?? '',
            created_at: activity.created_at ?? '',
            profile_id: activity.profile_id ?? null,
            profile_name: profileData?.display_name ?? ''
          }
        })
        .filter((activity: RecentActivity) => activity.name.trim().length > 0)

      setRecentActivities(normalizedActivities)
    } catch (error) {
      console.error('Error fetching recent activities:', error)

      // Fallback query without join to ensure ticker still shows data
      try {
        const { data: fallbackData } = await supabase
          .from('profile_products')
          .select('id, name, created_at, profile_id')
          .order('created_at', { ascending: false })
          .limit(15)

        const fallbackActivities: RecentActivity[] = (fallbackData ?? [])
          .map((activity: any) => ({
            id: activity.id,
            name: activity.name ?? '',
            created_at: activity.created_at ?? '',
            profile_id: activity.profile_id ?? null,
            profile_name: activity.profile_id ? `User ${activity.profile_id.slice(-4)}` : ''
          }))
          .filter((activity: RecentActivity) => activity.name.trim().length > 0)

        if (fallbackActivities.length > 0) {
          setRecentActivities(fallbackActivities)
        }
      } catch (fallbackError) {
        console.error('Fallback recent activities fetch failed:', fallbackError)
      }
    }
  }

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name')

      if (error) {
        console.error('Error fetching categories:', error)
        setCategories([])
        return
      }

      setCategories(data || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
      setCategories([])
    }
  }

  // Fetch locations
  const fetchLocations = async () => {
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .order('name')

      if (error) {
        console.error('Error fetching locations:', error)
        setLocations([])
        return
      }

      setLocations(data || [])
    } catch (error) {
      console.error('Error fetching locations:', error)
      setLocations([])
    }
  }

  // Fetch businesses
  const fetchBusinesses = async () => {
    try {
      setIsSearching(true)
      
      let query = supabase
        .from('profiles')
        .select(`
          *,
          categories(name),
          locations(name)
        `)

      // Apply search filters
      if (searchQuery && searchQuery.trim() !== '') {
        query = query.or(`display_name.ilike.%${searchQuery}%,bio.ilike.%${searchQuery}%`)
      }

      if (selectedCategory && selectedCategory !== 'all') {
        query = query.eq('category_id', selectedCategory)
      }

      if (selectedLocation && selectedLocation !== 'all') {
        query = query.eq('location_id', selectedLocation)
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) {
        console.error('Error fetching businesses:', error)
        setBusinesses([])
      } else {
        setBusinesses(data || [])
      }
    } catch (error) {
      console.error('Error fetching businesses:', error)
      setBusinesses([])
    } finally {
      setIsSearching(false)
    }
  }


  // Fetch initial data
  useEffect(() => {
    fetchCategoriesAndLocations()
    fetchBusinesses()
    fetchRecentActivities()
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
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Exit intent detection
  useEffect(() => {
    let hasShownExitIntent = false
    
    function handleMouseLeave(event: MouseEvent) {
      if (event.clientY <= 0 && !hasShownExitIntent) {
        setShowExitIntent(true)
        hasShownExitIntent = true
      }
    }

    document.addEventListener('mouseleave', handleMouseLeave)
    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave)
    }
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

  // Refresh recent activities every 30 seconds to keep ticker fresh
  useEffect(() => {
    const interval = setInterval(() => {
      fetchRecentActivities()
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [])

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
        // Use the fetched data directly (includes "All Locations" from database)
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
        .select(`
          *,
          gallery_images:profile_gallery(
            id,
            image_url,
            caption
          )
        `)
        .eq('is_active', true)
        .in('subscription_tier', ['free', 'premium', 'business']) // All active profiles
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
          .select(`
            *,
            gallery_images:profile_gallery(
              id,
              image_url,
              caption
            )
          `)
          .eq('is_active', true)
          .in('subscription_tier', ['free', 'premium', 'business'])
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
      {/* Hero Section - Brutalist Style */}
      <motion.section 
        className="pt-20 pb-16 lg:pt-24 lg:pb-20 relative"
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
                Setup your profile to, display your products/services, and sell with powerful marketing tools. Everything you need to boost your sales.
              </motion.p>
              
              {/* Feature Pills */}
              <motion.div 
                className="flex flex-wrap gap-3 mb-8"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 1.0 }}
              >
              </motion.div>

              {/* Social Proof Counter */}
              <motion.div 
                className="mb-6"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 1.2 }}
              >
                <div className="bg-green-100 border-2 border-green-500 rounded-lg p-3 inline-flex items-center gap-2 shadow-[2px_2px_0px_0px_rgba(34,197,94,0.9)]">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-800 font-bold text-sm">
                    Join <motion.span 
                      key={Math.floor(Date.now() / 10000)} // Changes every 10 seconds
                      initial={{ scale: 1.2 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className="font-black"
                    >
                      1,247
                    </motion.span> members selling today
                  </span>
                </div>
              </motion.div>

              {/* Success Stories Ticker */}
              <motion.div 
                className="mb-8 overflow-hidden bg-yellow-100 border-2 border-yellow-500 rounded-lg shadow-[2px_2px_0px_0px_rgba(234,179,8,0.9)]"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 1.4 }}
              >
                <motion.div 
                  className="flex whitespace-nowrap py-2 px-4"
                  animate={{ x: ["0%", "-50%"] }}
                  transition={{ 
                    duration: 32, 
                    repeat: Infinity, 
                    ease: "linear" 
                  }}
                >
                  <span className="text-yellow-800 font-bold text-sm mr-8">
                    {tickerContent}
                  </span>
                </motion.div>
              </motion.div>

              {/* CTA Buttons */}
              <motion.div 
                className="flex flex-col sm:flex-row gap-4"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 1.4 }}
              >
                <motion.div
                  whileHover={{ 
                    scale: 1.05,
                    rotate: 2,
                    boxShadow: "10px 10px 0px 0px rgba(0,0,0,0.9)",
                    x: 3,
                    y: -3
                  }}
                  whileTap={{ 
                    scale: 0.95,
                    rotate: -2,
                    transition: { duration: 0.1 }
                  }}
                >
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
                  whileHover={{ 
                    scale: 1.05,
                    rotate: -2,
                    boxShadow: "10px 10px 0px 0px rgba(0,0,0,0.9)",
                    x: 3,
                    y: -3
                  }}
                  whileTap={{ 
                    scale: 0.95,
                    rotate: 2,
                    transition: { duration: 0.1 }
                  }}
                >
                  <Eye className="mr-2 h-5 w-5" />
                  WATCH DEMO
                </motion.button>
              </motion.div>
            </motion.div>

            {/* Right Content - Brutalist Illustration */}
            <motion.div 
              className="relative"
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="flex items-center gap-4 mb-6">
                <motion.div 
                  className="inline-flex items-center px-4 py-2 bg-green-400 border-2 border-black rounded-lg text-black text-sm font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)]"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.6, delay: 0.4, type: "spring", stiffness: 200 }}
                  whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                >
                  <motion.div 
                    className="mr-2"
                    whileHover={{ rotate: 360, transition: { duration: 0.8 } }}
                  >
                    <Rocket className="h-4 w-4" />
                  </motion.div>
                  BOOST YOUR REVENUE BY 80%
                </motion.div>
              </div>
              <div className="bg-white rounded-2xl p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.9)]">
                <div className="bg-yellow-300 rounded-xl p-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] mb-4">
                  <div className="flex items-center gap-3 mb-4">
                    <motion.div 
                      className="w-12 h-12 bg-green-500 rounded-lg border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]"
                      whileHover={{ scale: 1.1, transition: { duration: 0.2 } }}
                    >
                      <motion.div whileHover={{ rotate: 360, transition: { duration: 0.6 } }}>
                        <ShoppingBag className="h-6 w-6 text-white" />
                      </motion.div>
                    </motion.div>
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
                    <motion.button 
                      className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg text-sm font-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]"
                      whileHover={{ 
                        scale: 1.05,
                        rotate: 2,
                        boxShadow: "10px 10px 0px 0px rgba(0,0,0,0.9)",
                        x: 3,
                        y: -3
                      }}
                      whileTap={{ 
                        scale: 0.95,
                        rotate: -2,
                        transition: { duration: 0.1 }
                      }}
                    >
                      VIEW MENU
                    </motion.button>
                    <motion.button 
                      className="bg-blue-400 text-black py-2 px-4 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]"
                      whileHover={{ 
                        scale: 1.05,
                        rotate: -2,
                        boxShadow: "10px 10px 0px 0px rgba(0,0,0,0.9)",
                        x: 3,
                        y: -3
                      }}
                      whileTap={{ 
                        scale: 0.95,
                        rotate: 2,
                        transition: { duration: 0.1 }
                      }}
                    >
                      <motion.div whileHover={{ rotate: 360, transition: { duration: 0.5 } }}>
                        <Share2 className="h-4 w-4" />
                      </motion.div>
                    </motion.button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <motion.div 
                    className="bg-blue-400 rounded-lg p-4 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]"
                    whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <motion.div whileHover={{ rotate: 360, transition: { duration: 0.6 } }}>
                        <BarChart3 className="h-4 w-4 text-black" />
                      </motion.div>
                      <span className="text-sm font-black text-black">ANALYTICS</span>
                    </div>
                    <p className="text-xs text-black font-bold">TRACK PERFORMANCE</p>
                  </motion.div>
                  <motion.div 
                    className="bg-green-400 rounded-lg p-4 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]"
                    whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <motion.div whileHover={{ rotate: 360, transition: { duration: 0.7 } }}>
                        <Target className="h-4 w-4 text-black" />
                      </motion.div>
                      <span className="text-sm font-black text-black">MARKETING</span>
                    </div>
                    <p className="text-xs text-black font-bold">BOOST VISIBILITY</p>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>
      
      {/* Directory Search Section - Brutalist Style */}
      <motion.section 
        id="directory"
        className="py-16 relative"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-12"
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <motion.h2 
              className="text-3xl font-black text-black mb-4 bg-white p-4 rounded-xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.9)] inline-block"
              initial={{ scale: 0, rotate: -10 }}
              whileInView={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.6, delay: 0.4, type: "spring", stiffness: 200 }}
              viewport={{ once: true }}
            >
              FIND LOCAL BUSINESSES
            </motion.h2>
            <motion.p 
              className="text-lg text-black max-w-2xl mx-auto bg-yellow-300 p-4 rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] font-bold"
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              viewport={{ once: true }}
            >
              SEARCH OUR DIRECTORY TO DISCOVER VERIFIED BUSINESSES ACROSS SOUTH AFRICA
            </motion.p>
          </motion.div>
          
          <motion.div 
            className="max-w-4xl mx-auto"
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            viewport={{ once: true }}
          >
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
                      className="w-full pl-10 pr-4 py-3 border-2 border-black rounded-lg bg-white font-bold text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)] text-left hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)]"
                    >
                      {locations.find(l => (l.slug || l.city) === selectedLocation)?.city || 'All Locations'}
                    </button>
                    {showLocationDropdown && (
                      <div
                        className="absolute top-full left-0 right-0 mt-2 bg-white border-4 border-black rounded-lg shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)] z-20 max-h-60 overflow-y-auto"
                      >
                        {locations.map((location) => (
                          <button
                            key={location.slug || location.city}
                            onClick={() => {
                              setSelectedLocation(location.slug || location.city)
                              setShowLocationDropdown(false)
                            }}
                            className="w-full px-4 py-3 text-left font-bold text-black hover:bg-yellow-300 border-b-2 border-black last:border-b-0 transition-colors"
                          >
                            {location.city || location}
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
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-black z-10" />
                    <button
                      onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                      className="w-full pl-10 pr-4 py-3 border-2 border-black rounded-lg bg-white font-bold text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)] text-left hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)]"
                    >
                      {categories.find(c => (c.slug || c.name) === selectedCategory)?.name || 'All Categories'}
                    </button>
                    {showCategoryDropdown && (
                      <div
                        className="absolute top-full left-0 right-0 mt-2 bg-white border-4 border-black rounded-lg shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)] z-20 max-h-60 overflow-y-auto"
                      >
                        {categories
                          .slice()
                          .sort((a, b) => {
                            const aName = a.name || a
                            const bName = b.name || b
                            if (aName === 'All Categories') return -1
                            if (bName === 'All Categories') return 1
                            return aName.localeCompare(bName)
                          })
                          .map((category) => (
                          <button
                            key={(category as any).slug || (category as any).name || category}
                            onClick={() => {
                              const slug = (category as any).slug || (category as any).name || category
                              setSelectedCategory(slug)
                              setShowCategoryDropdown(false)
                            }}
                            className="w-full px-4 py-3 text-left font-bold text-black hover:bg-blue-300 border-b-2 border-black last:border-b-0 transition-colors"
                          >
                            {(category as any).name || category}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Search Button */}
                <div className="lg:col-span-1">
                  <motion.button 
                    onClick={handleSearch}
                    disabled={isSearching}
                    className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-black py-3 px-6 rounded-lg transition-colors flex items-center justify-center border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)]"
                    whileHover={{ 
                      scale: 1.05,
                      rotate: 3,
                      boxShadow: "8px 8px 0px 0px rgba(0,0,0,0.9)",
                      x: 2,
                      y: -2
                    }}
                    whileTap={{ 
                      scale: 0.95,
                      rotate: -3,
                      transition: { duration: 0.1 }
                    }}
                  >
                    {isSearching ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <motion.div whileHover={{ rotate: 360, transition: { duration: 0.5 } }}>
                        <Search className="h-5 w-5" />
                      </motion.div>
                    )}
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Search Results - Brutalist Style */}
      <section className="py-6 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Loading State */}
          {isSearching && (
            <div className="text-center py-12">
              <div className="inline-flex items-center gap-3 bg-white px-6 py-4 rounded-xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)]">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                <span className="text-black font-black">SEARCHING PROFILES...</span>
              </div>
            </div>
          )}

          {/* Business Cards Carousel */}
          {!isSearching && businesses.length > 0 && (
            <div className="relative">
              {/* Carousel Header */}
              <div className="flex items-center justify-between mb-8">
                {/* Featured Businesses - Left */}
                <motion.h3 
                  className="text-2xl font-black text-black bg-white p-4 rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] inline-block"
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.6 }}
                >
                  FEATURED BUSINESSES
                </motion.h3>
                
                {/* Premium Directory - Center (Large) */}
                <h2 className="text-4xl font-black text-black bg-white p-6 rounded-xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)]">
                  PREMIUM DIRECTORY
                </h2>
                
                {/* Found Profiles - Right */}
                <p className="text-black text-lg bg-yellow-300 p-3 rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] font-bold">
                  FOUND {businesses.length} PROFILE{businesses.length !== 1 ? 'S' : ''} 
                  {searchQuery && ` MATCHING "${searchQuery.toUpperCase()}"`}
                  {selectedCategory !== 'all' && ` IN ${categories.find(c => c.slug === selectedCategory)?.name?.toUpperCase()}`}
                  {selectedLocation !== 'all' && ` IN ${locations.find(l => l.slug === selectedLocation)?.city?.toUpperCase()}`}
                </p>
              </div>
              
              {/* Carousel Container with Side Navigation */}
              <div className="flex items-center gap-4">
                {/* Left Navigation Button */}
                <motion.button
                  onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                  disabled={currentSlide === 0}
                  className={`p-4 rounded-lg border-2 border-black font-black transition-all ${
                    currentSlide === 0 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : 'bg-blue-500 text-white hover:bg-blue-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)]'
                  }`}
                  whileHover={{ 
                    scale: currentSlide === 0 ? 1 : 1.05,
                    rotate: currentSlide === 0 ? 0 : -2,
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ChevronLeft className="h-6 w-6" />
                </motion.button>

                {/* Carousel Container */}
                <div className="flex-1 overflow-hidden rounded-xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.9)] bg-white p-6">
                <motion.div 
                  className="flex gap-6"
                  animate={{ x: -currentSlide * (320 + 24) }} // 320px card width + 24px gap
                  transition={{ 
                    type: "spring", 
                    stiffness: 300, 
                    damping: 30,
                    duration: 0.6
                  }}
                >
                  {businesses.map((business: any, index: number) => {
                    // Find category and location names from business profile data
                    const categoryName = categories.find(c => c.slug === business.business_category)?.name || business.business_category
                    const locationName = locations.find(l => l.slug === business.business_location)?.city || business.business_location
                    
                    // Format gallery images for the BusinessCard component
                    const formattedBusiness = {
                      ...business,
                      gallery_images: business.gallery_images?.map((img: any) => ({
                        id: img.id.toString(),
                        title: img.caption || 'Gallery Image',
                        url: img.image_url
                      })) || []
                    }

                    return (
                      <motion.div
                        key={business.id}
                        className="flex-shrink-0 w-80"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                      >
                        <BusinessCard
                          business={formattedBusiness}
                          categoryName={categoryName}
                          locationName={locationName}
                          index={index}
                        />
                      </motion.div>
                    )
                  })}
                </motion.div>
                
                {/* Slide Indicators */}
                <div className="flex justify-center gap-2 mt-6">
                  {Array.from({ length: Math.max(1, businesses.length - 2) }).map((_, index) => (
                    <motion.button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`w-4 h-4 rounded-full border-2 border-black transition-all ${
                        currentSlide === index 
                          ? 'bg-yellow-400 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]' 
                          : 'bg-white hover:bg-gray-200'
                      }`}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                    />
                  ))}
                </div>
                </div>

                {/* Right Navigation Button */}
                <motion.button
                  onClick={() => setCurrentSlide(Math.min(Math.max(0, businesses.length - 3), currentSlide + 1))}
                  disabled={currentSlide >= Math.max(0, businesses.length - 3)}
                  className={`p-4 rounded-lg border-2 border-black font-black transition-all ${
                    currentSlide >= Math.max(0, businesses.length - 3)
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : 'bg-blue-500 text-white hover:bg-blue-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)]'
                  }`}
                  whileHover={{ 
                    scale: currentSlide >= Math.max(0, businesses.length - 3) ? 1 : 1.05,
                    rotate: currentSlide >= Math.max(0, businesses.length - 3) ? 0 : 2,
                    transition: { duration: 0.2 }
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ChevronRight className="h-6 w-6" />
                </motion.button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!isSearching && businesses.length === 0 && (searchQuery || selectedCategory !== 'all' || selectedLocation !== 'all') && (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 bg-red-400 rounded-lg border-4 border-black flex items-center justify-center mx-auto mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)]">
                  <Search className="w-10 h-10 text-black" />
                </div>
                <h3 className="text-xl font-black text-black mb-2 bg-white p-3 rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] inline-block">NO PROFILES FOUND</h3>
                <p className="text-black mb-6 bg-yellow-300 p-3 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)] font-bold">
                  TRY ADJUSTING YOUR SEARCH CRITERIA OR BROWSE ALL PROFILES.
                </p>
                <motion.button
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCategory('all')
                    setSelectedLocation('all')
                  }}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-black transition-colors border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)]"
                  whileHover={{ 
                    scale: 1.05,
                    rotate: 2,
                    boxShadow: "10px 10px 0px 0px rgba(0,0,0,0.9)",
                    x: 3,
                    y: -3
                  }}
                  whileTap={{ 
                    scale: 0.95,
                    rotate: -2,
                    transition: { duration: 0.1 }
                  }}
                >
                  CLEAR FILTERS
                </motion.button>
              </div>
            </div>
          )}

          {/* Initial Load State */}
          {!isSearching && businesses.length === 0 && !searchQuery && selectedCategory === 'all' && selectedLocation === 'all' && (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 bg-blue-400 rounded-lg border-4 border-black flex items-center justify-center mx-auto mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)]">
                  <Award className="w-10 h-10 text-black" />
                </div>
                <h3 className="text-xl font-black text-black mb-2 bg-white p-3 rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] inline-block">DISCOVER AMAZING PEOPLE</h3>
                <p className="text-black mb-6 bg-green-300 p-3 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)] font-bold">
                  USE THE SEARCH ABOVE TO FIND TALENTED PEOPLE IN YOUR AREA.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Features Section - Brutalist Style */}
      <motion.section 
        className="py-20 relative"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div 
              className="inline-flex items-center px-4 py-2 bg-blue-400 border-2 border-black rounded-lg text-black text-sm font-black mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)]"
              whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
            >
              <motion.div 
                className="mr-2"
                whileHover={{ rotate: 360, transition: { duration: 0.6 } }}
              >
                <Star className="h-4 w-4" />
              </motion.div>
              PLATFORM FEATURES
            </motion.div>
            <h2 className="text-4xl font-black text-black mb-4 bg-white p-6 rounded-xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.9)] inline-block">
              EVERYTHING YOU NEED TO BOOST YOUR SALES
            </h2>
            <p className="text-xl text-black max-w-3xl mx-auto bg-yellow-300 p-4 rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] font-bold">
              FROM DIRECTORY LISTINGS TO MARKETING AUTOMATION - ALL THE TOOLS YOU NEED TO SUCCEED ONLINE
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-2xl border-4 border-black hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.9)] transition-all duration-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] group">
              <motion.div 
                className="w-12 h-12 bg-green-500 rounded-lg border-2 border-black flex items-center justify-center mb-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]"
                whileHover={{ 
                  scale: 1.2,
                  rotate: 15,
                  boxShadow: "4px 4px 0px 0px rgba(0,0,0,0.9)",
                  transition: { 
                    duration: 0.6,
                    ease: "easeInOut"
                  }
                }}
              >
                <motion.div
                  whileHover={{ 
                    scale: 1.1,
                    rotate: 360,
                    transition: { duration: 0.8 }
                  }}
                >
                  <Search className="h-6 w-6 text-white" />
                </motion.div>
              </motion.div>
              <h3 className="text-xl font-black text-black mb-3">SMART DIRECTORY</h3>
              <p className="text-black mb-4 leading-relaxed font-bold">
                GET DISCOVERED BY CUSTOMERS WITH OUR INTELLIGENT SEARCH AND FILTERING SYSTEM. PREMIUM PLACEMENT FOR VERIFIED BUSINESSES.
              </p>
              <ul className="space-y-2 text-sm text-black">
                <motion.li 
                  className="flex items-center gap-2 bg-green-300 p-2 rounded border-2 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,0.9)]"
                  whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                >
                  <motion.div whileHover={{ rotate: 360, transition: { duration: 0.4 } }}>
                    <CheckCircle className="h-4 w-4 text-black" />
                  </motion.div>
                  <span className="font-black">MULTI-LOCATION COVERAGE</span>
                </motion.li>
                <motion.li 
                  className="flex items-center gap-2 bg-green-300 p-2 rounded border-2 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,0.9)]"
                  whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                >
                  <motion.div whileHover={{ rotate: 360, transition: { duration: 0.4 } }}>
                    <CheckCircle className="h-4 w-4 text-black" />
                  </motion.div>
                  <span className="font-black">VERIFIED BUSINESS BADGES</span>
                </motion.li>
                <motion.li 
                  className="flex items-center gap-2 bg-green-300 p-2 rounded border-2 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,0.9)]"
                  whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                >
                  <motion.div whileHover={{ rotate: 360, transition: { duration: 0.4 } }}>
                    <CheckCircle className="h-4 w-4 text-black" />
                  </motion.div>
                  <span className="font-black">CUSTOMER REVIEWS & RATINGS</span>
                </motion.li>
              </ul>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-2xl border-4 border-black hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.9)] transition-all duration-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] group">
              <motion.div 
                className="w-12 h-12 bg-blue-500 rounded-lg border-2 border-black flex items-center justify-center mb-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]"
                whileHover={{ 
                  scale: 1.2,
                  rotate: -15,
                  y: 3,
                  boxShadow: "4px 4px 0px 0px rgba(0,0,0,0.9)",
                  transition: { 
                    duration: 0.7,
                    ease: "easeInOut"
                  }
                }}
              >
                <motion.div
                  whileHover={{ 
                    scale: 1.2,
                    rotate: -360,
                    transition: { duration: 0.9 }
                  }}
                >
                  <ShoppingBag className="h-6 w-6 text-white" />
                </motion.div>
              </motion.div>
              <h3 className="text-xl font-black text-black mb-3">PRODUCT SHOWCASE</h3>
              <p className="text-black mb-4 leading-relaxed font-bold">
                DISPLAY YOUR PRODUCTS AND SERVICES WITH BEAUTIFUL GALLERIES, DETAILED DESCRIPTIONS, AND INTEGRATED SHOPPING FEATURES.
              </p>
              <ul className="space-y-2 text-sm text-black">
                <li className="flex items-center gap-2 bg-blue-300 p-2 rounded border-2 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,0.9)]">
                  <CheckCircle className="h-4 w-4 text-black" />
                  <span className="font-black">UNLIMITED PRODUCT LISTINGS</span>
                </li>
                <li className="flex items-center gap-2 bg-blue-300 p-2 rounded border-2 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,0.9)]">
                  <CheckCircle className="h-4 w-4 text-black" />
                  <span className="font-black">HIGH-QUALITY IMAGE GALLERIES</span>
                </li>
                <li className="flex items-center gap-2 bg-blue-300 p-2 rounded border-2 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,0.9)]">
                  <CheckCircle className="h-4 w-4 text-black" />
                  <span className="font-black">DIRECT WHATSAPP INTEGRATION</span>
                </li>
              </ul>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-2xl border-4 border-black hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.9)] transition-all duration-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] group">
              <motion.div 
                className="w-12 h-12 bg-yellow-500 rounded-lg border-2 border-black flex items-center justify-center mb-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]"
                whileHover={{ 
                  scale: 1.3,
                  rotate: 20,
                  x: 4,
                  boxShadow: "6px 6px 0px 0px rgba(0,0,0,0.9)",
                  transition: { 
                    duration: 0.8,
                    ease: "easeInOut"
                  }
                }}
              >
                <motion.div
                  whileHover={{ 
                    scale: 1.3,
                    rotate: 360,
                    transition: { 
                      duration: 1.0,
                      ease: "easeInOut"
                    }
                  }}
                >
                  <Share2 className="h-6 w-6 text-black" />
                </motion.div>
              </motion.div>
              <h3 className="text-xl font-black text-black mb-3">MARKETING AUTOMATION</h3>
              <p className="text-black mb-4 leading-relaxed font-bold">
                CREATE STUNNING MARKETING CAMPAIGNS AND SHARE THEM ACROSS WHATSAPP, FACEBOOK, INSTAGRAM, AND MORE WITH ONE CLICK.
              </p>
              <ul className="space-y-2 text-sm text-black">
                <li className="flex items-center gap-2 bg-yellow-300 p-2 rounded border-2 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,0.9)]">
                  <CheckCircle className="h-4 w-4 text-black" />
                  <span className="font-black">CAMPAIGN SCHEDULING</span>
                </li>
                <li className="flex items-center gap-2 bg-yellow-300 p-2 rounded border-2 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,0.9)]">
                  <CheckCircle className="h-4 w-4 text-black" />
                  <span className="font-black">MULTI-PLATFORM SHARING</span>
                </li>
                <li className="flex items-center gap-2 bg-yellow-300 p-2 rounded border-2 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,0.9)]">
                  <CheckCircle className="h-4 w-4 text-black" />
                  <span className="font-black">PERFORMANCE ANALYTICS</span>
                </li>
              </ul>
            </div>

            {/* Feature 4 */}
            <div className="bg-white p-8 rounded-2xl border-4 border-black hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.9)] transition-all duration-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] group">
              <motion.div 
                className="w-12 h-12 bg-purple-500 rounded-lg border-2 border-black flex items-center justify-center mb-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]"
                whileHover={{ 
                  scale: 1.25,
                  rotate: -10,
                  y: 4,
                  boxShadow: "5px 5px 0px 0px rgba(0,0,0,0.9)",
                  transition: { 
                    duration: 0.6,
                    ease: "easeInOut"
                  }
                }}
              >
                <motion.div
                  whileHover={{ 
                    scale: 1.1,
                    rotate: -360,
                    transition: { 
                      duration: 1.2,
                      ease: "linear"
                    }
                  }}
                >
                  <BarChart3 className="h-6 w-6 text-white" />
                </motion.div>
              </motion.div>
              <h3 className="text-xl font-black text-black mb-3">ANALYTICS DASHBOARD</h3>
              <p className="text-black mb-4 leading-relaxed font-bold">
                TRACK YOUR BUSINESS PERFORMANCE WITH DETAILED INSIGHTS ON VIEWS, ENGAGEMENT, AND CUSTOMER INTERACTIONS.
              </p>
              <ul className="space-y-2 text-sm text-black">
                <li className="flex items-center gap-2 bg-purple-300 p-2 rounded border-2 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,0.9)]">
                  <CheckCircle className="h-4 w-4 text-black" />
                  <span className="font-black">REAL-TIME METRICS</span>
                </li>
                <li className="flex items-center gap-2 bg-purple-300 p-2 rounded border-2 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,0.9)]">
                  <CheckCircle className="h-4 w-4 text-black" />
                  <span className="font-black">CUSTOMER BEHAVIOR INSIGHTS</span>
                </li>
                <li className="flex items-center gap-2 bg-purple-300 p-2 rounded border-2 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,0.9)]">
                  <CheckCircle className="h-4 w-4 text-black" />
                  <span className="font-black">ROI TRACKING</span>
                </li>
              </ul>
            </div>

            {/* Feature 5 */}
            <div className="bg-white p-8 rounded-2xl border-4 border-black hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.9)] transition-all duration-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] group">
              <motion.div 
                className="w-12 h-12 bg-pink-500 rounded-lg border-2 border-black flex items-center justify-center mb-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]"
                whileHover={{ 
                  scale: 1.15,
                  rotate: 25,
                  x: 2,
                  y: -3,
                  boxShadow: "6px 6px 0px 0px rgba(0,0,0,0.9)",
                  transition: { 
                    duration: 0.9,
                    ease: "easeInOut"
                  }
                }}
              >
                <motion.div
                  whileHover={{ 
                    scale: 1.4,
                    rotate: 360,
                    transition: { 
                      duration: 1.5,
                      ease: "easeInOut"
                    }
                  }}
                >
                  <Smartphone className="h-6 w-6 text-white" />
                </motion.div>
              </motion.div>
              <h3 className="text-xl font-black text-black mb-3">MOBILE-FIRST DESIGN</h3>
              <p className="text-black mb-4 leading-relaxed font-bold">
                OPTIMIZED FOR MOBILE DEVICES WITH LIGHTNING-FAST LOADING AND INTUITIVE TOUCH NAVIGATION FOR THE BEST USER EXPERIENCE.
              </p>
              <ul className="space-y-2 text-sm text-black">
                <li className="flex items-center gap-2 bg-pink-300 p-2 rounded border-2 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,0.9)]">
                  <CheckCircle className="h-4 w-4 text-black" />
                  <span className="font-black">RESPONSIVE DESIGN</span>
                </li>
                <li className="flex items-center gap-2 bg-pink-300 p-2 rounded border-2 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,0.9)]">
                  <CheckCircle className="h-4 w-4 text-black" />
                  <span className="font-black">FAST LOADING TIMES</span>
                </li>
                <li className="flex items-center gap-2 bg-pink-300 p-2 rounded border-2 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,0.9)]">
                  <CheckCircle className="h-4 w-4 text-black" />
                  <span className="font-black">TOUCH-OPTIMIZED INTERFACE</span>
                </li>
              </ul>
            </div>

            {/* Feature 6 */}
            <div className="bg-white p-8 rounded-2xl border-4 border-black hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.9)] transition-all duration-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] group">
              <motion.div 
                className="w-12 h-12 bg-red-500 rounded-lg border-2 border-black flex items-center justify-center mb-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]"
                whileHover={{ 
                  scale: 1.35,
                  rotate: -30,
                  y: 5,
                  boxShadow: "8px 8px 0px 0px rgba(0,0,0,0.9)",
                  transition: { 
                    duration: 1.0,
                    ease: "easeInOut"
                  }
                }}
              >
                <motion.div
                  whileHover={{ 
                    scale: 1.2,
                    rotate: -720,
                    transition: { 
                      duration: 1.8,
                      ease: "easeInOut"
                    }
                  }}
                >
                  <Shield className="h-6 w-6 text-white" />
                </motion.div>
              </motion.div>
              <h3 className="text-xl font-black text-black mb-3">SECURE & RELIABLE</h3>
              <p className="text-black mb-4 leading-relaxed font-bold">
                ENTERPRISE-GRADE SECURITY WITH 99.9% UPTIME GUARANTEE. YOUR BUSINESS DATA IS PROTECTED WITH INDUSTRY-LEADING ENCRYPTION.
              </p>
              <ul className="space-y-2 text-sm text-black">
                <li className="flex items-center gap-2 bg-red-300 p-2 rounded border-2 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,0.9)]">
                  <CheckCircle className="h-4 w-4 text-black" />
                  <span className="font-black">SSL ENCRYPTION</span>
                </li>
                <li className="flex items-center gap-2 bg-red-300 p-2 rounded border-2 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,0.9)]">
                  <CheckCircle className="h-4 w-4 text-black" />
                  <span className="font-black">99.9% UPTIME</span>
                </li>
                <li className="flex items-center gap-2 bg-red-300 p-2 rounded border-2 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,0.9)]">
                  <CheckCircle className="h-4 w-4 text-black" />
                  <span className="font-black">REGULAR BACKUPS</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Animated Pricing Section */}
      <section id="pricing" className="py-0">
        <PricingContainer
          title="Choose Your Perfect Plan"
          plans={pricingPlans}
          className="min-h-auto"
        />
      </section>

      {/* How It Works - Brutalist Style */}
      <motion.section 
        className="py-20 relative"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-orange-400 border-2 border-black rounded-lg text-black text-sm font-black mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)]">
              <Rocket className="h-4 w-4 mr-2" />
              HOW IT WORKS
            </div>
            <h2 className="text-4xl font-black text-black mb-4 bg-white p-6 rounded-xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.9)] inline-block">
              GET STARTED IN 3 SIMPLE STEPS
            </h2>
            <p className="text-xl text-black max-w-3xl mx-auto bg-green-300 p-4 rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] font-bold">
              FROM LISTING YOUR BUSINESS TO BOOSTING YOUR SALES - WE MAKE IT EASY TO SUCCEED ONLINE
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {/* Step 1 */}
            <div className="text-center bg-white p-8 rounded-2xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)]">
              <div className="relative mb-8">
                <div className="w-16 h-16 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-4 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.9)]">
                  <Search className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-black border-2 border-white">
                  1
                </div>
              </div>
              <h3 className="text-2xl font-black text-black mb-4">
                CREATE YOUR LISTING
              </h3>
              <p className="text-black leading-relaxed mb-6 font-bold">
                SIGN UP AND CREATE YOUR BUSINESS PROFILE WITH PHOTOS, CONTACT INFORMATION, AND SERVICE DETAILS. GET VERIFIED FOR PREMIUM PLACEMENT.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 bg-green-300 p-2 rounded border-2 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,0.9)]">
                  <CheckCircle className="w-5 h-5 text-black flex-shrink-0" />
                  <span className="text-black text-sm font-black">BUSINESS PROFILE SETUP</span>
                </div>
                <div className="flex items-center gap-3 bg-green-300 p-2 rounded border-2 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,0.9)]">
                  <CheckCircle className="w-5 h-5 text-black flex-shrink-0" />
                  <span className="text-black text-sm font-black">PHOTO GALLERY UPLOAD</span>
                </div>
                <div className="flex items-center gap-3 bg-green-300 p-2 rounded border-2 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,0.9)]">
                  <CheckCircle className="w-5 h-5 text-black flex-shrink-0" />
                  <span className="text-black text-sm font-black">VERIFICATION PROCESS</span>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="text-center bg-white p-8 rounded-2xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)]">
              <div className="relative mb-8">
                <div className="w-16 h-16 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-4 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.9)]">
                  <ShoppingBag className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-black border-2 border-white">
                  2
                </div>
              </div>
              <h3 className="text-2xl font-black text-black mb-4">
                SHOWCASE PRODUCTS
              </h3>
              <p className="text-black leading-relaxed mb-6 font-bold">
                ADD YOUR PRODUCTS AND SERVICES WITH DETAILED DESCRIPTIONS, PRICING, AND HIGH-QUALITY IMAGES TO ATTRACT CUSTOMERS.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 bg-blue-300 p-2 rounded border-2 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,0.9)]">
                  <CheckCircle className="w-5 h-5 text-black flex-shrink-0" />
                  <span className="text-black text-sm font-black">PRODUCT CATALOG CREATION</span>
                </div>
                <div className="flex items-center gap-3 bg-blue-300 p-2 rounded border-2 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,0.9)]">
                  <CheckCircle className="w-5 h-5 text-black flex-shrink-0" />
                  <span className="text-black text-sm font-black">PRICING & DESCRIPTIONS</span>
                </div>
                <div className="flex items-center gap-3 bg-blue-300 p-2 rounded border-2 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,0.9)]">
                  <CheckCircle className="w-5 h-5 text-black flex-shrink-0" />
                  <span className="text-black text-sm font-black">IMAGE OPTIMIZATION</span>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="text-center bg-white p-8 rounded-2xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)]">
              <div className="relative mb-8">
                <div className="w-16 h-16 bg-yellow-500 rounded-lg flex items-center justify-center mx-auto mb-4 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.9)]">
                  <Share2 className="h-8 w-8 text-black" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-black border-2 border-white">
                  3
                </div>
              </div>
              <h3 className="text-2xl font-black text-black mb-4">
                MARKET & SELL
              </h3>
              <p className="text-black leading-relaxed mb-6 font-bold">
                USE OUR BUILT-IN MARKETING TOOLS TO CREATE CAMPAIGNS AND SHARE YOUR BUSINESS ACROSS WHATSAPP, FACEBOOK, INSTAGRAM, AND MORE.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 bg-yellow-300 p-2 rounded border-2 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,0.9)]">
                  <CheckCircle className="w-5 h-5 text-black flex-shrink-0" />
                  <span className="text-black text-sm font-black">CAMPAIGN CREATION</span>
                </div>
                <div className="flex items-center gap-3 bg-yellow-300 p-2 rounded border-2 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,0.9)]">
                  <CheckCircle className="w-5 h-5 text-black flex-shrink-0" />
                  <span className="text-black text-sm font-black">MULTI-PLATFORM SHARING</span>
                </div>
                <div className="flex items-center gap-3 bg-yellow-300 p-2 rounded border-2 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,0.9)]">
                  <CheckCircle className="w-5 h-5 text-black flex-shrink-0" />
                  <span className="text-black text-sm font-black">PERFORMANCE TRACKING</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-16">
            <div className="bg-white rounded-2xl p-8 border-4 border-black max-w-2xl mx-auto shadow-[8px_8px_0px_0px_rgba(0,0,0,0.9)]">
              <h3 className="text-2xl font-black text-black mb-4">
                READY TO BOOST YOUR SALES?
              </h3>
              <p className="text-black mb-6 font-bold">
                JOIN THOUSANDS OF MEMBERS ALREADY USING OUR PLATFORM TO REACH MORE CUSTOMERS.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/auth/signup-animated?plan=free"
                  className="inline-flex items-center justify-center px-8 py-3 bg-green-500 hover:bg-green-600 text-white font-black rounded-lg transition-colors border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)] hover:translate-x-1 hover:translate-y-1"
                >
                  START FREE TRIAL
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <a
                  href="#pricing"
                  className="inline-flex items-center justify-center px-8 py-3 bg-yellow-400 hover:bg-yellow-500 text-black font-black rounded-lg transition-colors border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)] hover:translate-x-1 hover:translate-y-1"
                >
                  VIEW PRICING
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Footer - Enhanced Brutalist Style */}
      <motion.footer 
        className="bg-gradient-to-br from-black via-gray-900 to-black py-16 relative overflow-hidden"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: "linear-gradient(45deg, #ffffff08 25%, transparent 25%), linear-gradient(-45deg, #ffffff08 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ffffff08 75%), linear-gradient(-45deg, transparent 75%, #ffffff08 75%)",
            backgroundSize: "20px 20px",
            backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px"
          }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Main Footer Content */}
          <div className="text-center mb-12">
            {/* Logo Section */}
            <motion.div 
              className="flex items-center justify-center gap-4 mb-8"
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <motion.div 
                className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-xl border-4 border-white flex items-center justify-center shadow-[6px_6px_0px_0px_rgba(255,255,255,0.9)] transform rotate-3"
                whileHover={{ 
                  rotate: [3, -3, 3],
                  scale: 1.1,
                  transition: { duration: 0.5 }
                }}
              >
                <span className="text-black font-black text-2xl">A</span>
              </motion.div>
              <div className="text-left">
                <motion.h2 
                  className="text-4xl font-black text-white mb-1"
                  whileHover={{ 
                    scale: 1.05,
                    color: "#fbbf24",
                    transition: { duration: 0.3 }
                  }}
                >
                  A2Z SELLR
                </motion.h2>
                <motion.p 
                  className="text-sm text-green-400 font-black uppercase tracking-wider bg-black px-2 py-1 rounded border border-green-400"
                  animate={{ 
                    boxShadow: ["0 0 0 0 rgba(34, 197, 94, 0.4)", "0 0 0 4px rgba(34, 197, 94, 0.4)", "0 0 0 0 rgba(34, 197, 94, 0.4)"]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  PREMIUM DIRECTORY
                </motion.p>
              </div>
            </motion.div>
            
            {/* Tagline */}
            <motion.div 
              className="mb-10"
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 text-black p-6 rounded-2xl border-4 border-white shadow-[8px_8px_0px_0px_rgba(255,255,255,0.9)] max-w-2xl mx-auto transform -rotate-1">
                <p className="text-lg font-black uppercase leading-tight">
                  🚀 SOUTH AFRICA'S LEADING SELLER DIRECTORY 🚀
                </p>
                <p className="text-sm font-bold mt-2">
                  CONNECTING PEOPLE • PRO MARKETING TOOLS • BOOSTING SALES
                </p>
              </div>
            </motion.div>
            
            {/* Navigation Buttons */}
            <motion.div 
              className="flex flex-wrap items-center justify-center gap-4 mb-12"
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <motion.button 
                onClick={() => {
                  const message = encodeURIComponent('Hi! I need support with a2z Sellr Premium Directory.')
                  window.open(`https://wa.me/27714329190?text=${message}`, '_blank')
                }}
                className="bg-green-500 hover:bg-green-600 text-black font-black px-4 py-2 rounded-lg border-2 border-white shadow-[2px_2px_0px_0px_rgba(255,255,255,0.9)] transition-all flex items-center gap-2"
                whileHover={{ 
                  scale: 1.05,
                  rotate: 2,
                  boxShadow: "6px 6px 0px 0px rgba(255,255,255,0.9)",
                  x: 3,
                  y: -3
                }}
                whileTap={{ 
                  scale: 0.95,
                  rotate: -2,
                  transition: { duration: 0.1 }
                }}
              >
                <MessageCircle className="h-4 w-4" />
                SUPPORT
              </motion.button>
              <motion.div
                whileHover={{ 
                  scale: 1.05,
                  rotate: -2,
                  x: 3,
                  y: -3
                }}
                whileTap={{ 
                  scale: 0.95,
                  rotate: 2,
                  transition: { duration: 0.1 }
                }}
              >
                <a href="#pricing" className="bg-blue-500 hover:bg-blue-600 text-white font-black px-4 py-2 rounded-lg border-2 border-white shadow-[2px_2px_0px_0px_rgba(255,255,255,0.9)] transition-all flex items-center gap-2 inline-flex">
                  <Crown className="h-4 w-4" />
                  PRICING
                </a>
              </motion.div>
              <motion.div
                whileHover={{ 
                  scale: 1.05,
                  rotate: 2,
                  x: 3,
                  y: -3
                }}
                whileTap={{ 
                  scale: 0.95,
                  rotate: -2,
                  transition: { duration: 0.1 }
                }}
              >
                <a href="#directory" className="bg-yellow-500 hover:bg-yellow-600 text-black font-black px-4 py-2 rounded-lg border-2 border-white shadow-[2px_2px_0px_0px_rgba(255,255,255,0.9)] transition-all flex items-center gap-2 inline-flex">
                  <Grid className="h-4 w-4" />
                  DIRECTORY
                </a>
              </motion.div>
              <motion.button 
                onClick={() => setShowAdminModal(true)}
                className="bg-gray-600 hover:bg-gray-700 text-white font-black px-4 py-2 rounded-lg border-2 border-white shadow-[2px_2px_0px_0px_rgba(255,255,255,0.9)] transition-all"
                whileHover={{ 
                  scale: 1.05,
                  rotate: -2,
                  boxShadow: "6px 6px 0px 0px rgba(255,255,255,0.9)",
                  x: 3,
                  y: -3
                }}
                whileTap={{ 
                  scale: 0.95,
                  rotate: 2,
                  transition: { duration: 0.1 }
                }}
              >
                ADMIN
              </motion.button>
            </motion.div>
            
            {/* Stats Section */}
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
              initial={{ y: 40, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <motion.div 
                className="bg-blue-500 p-6 rounded-xl border-4 border-white shadow-[6px_6px_0px_0px_rgba(255,255,255,0.9)] transform rotate-1"
                whileHover={{ 
                  rotate: [1, -1, 1],
                  scale: 1.05,
                  transition: { duration: 0.3 }
                }}
              >
                <div className="text-center">
                  <div className="text-3xl font-black text-white mb-2">1000+</div>
                  <div className="text-sm font-bold text-white uppercase">PROFILES LISTED</div>
                </div>
              </motion.div>
              
              <motion.div 
                className="bg-green-500 p-6 rounded-xl border-4 border-white shadow-[6px_6px_0px_0px_rgba(255,255,255,0.9)] transform -rotate-1"
                whileHover={{ 
                  rotate: [-1, 1, -1],
                  scale: 1.05,
                  transition: { duration: 0.3 }
                }}
              >
                <div className="text-center">
                  <div className="text-3xl font-black text-white mb-2">50K+</div>
                  <div className="text-sm font-bold text-white uppercase">MONTHLY VISITORS</div>
                </div>
              </motion.div>
              
              <motion.div 
                className="bg-yellow-400 p-6 rounded-xl border-4 border-white shadow-[6px_6px_0px_0px_rgba(255,255,255,0.9)] transform rotate-1"
                whileHover={{ 
                  rotate: [1, -1, 1],
                  scale: 1.05,
                  transition: { duration: 0.3 }
                }}
              >
                <div className="text-center">
                  <div className="text-3xl font-black text-black mb-2">24/7</div>
                  <div className="text-sm font-bold text-black uppercase">SUPPORT AVAILABLE</div>
                </div>
              </motion.div>
            </motion.div>

            {/* Copyright */}
            <motion.div 
              className="border-t-4 border-white pt-8"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.0 }}
            >
              <motion.div 
                className="bg-white text-black p-4 rounded-xl border-4 border-yellow-400 shadow-[6px_6px_0px_0px_rgba(251,191,36,0.9)] inline-block"
                whileHover={{ 
                  rotate: [0, 2, -2, 0],
                  scale: 1.05,
                  transition: { duration: 0.4 }
                }}
              >
                <p className="text-lg font-black uppercase">
                  © 2026 A2Z SELLR • ALL RIGHTS RESERVED
                </p>
                <p className="text-sm font-bold mt-1">
                  MADE WITH ❤️ IN SOUTH AFRICA
                </p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.footer>

      {/* Admin Login Modal */}
      <AdminLoginModal 
        isOpen={showAdminModal} 
        onClose={() => setShowAdminModal(false)} 
      />

      {/* Live Chat Widget with Success Guarantee */}
      <motion.div 
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 2, duration: 0.5 }}
      >
        <motion.div 
          className={`bg-green-500 text-white rounded-2xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)] cursor-pointer relative ${
            chatWidgetCollapsed ? 'p-3' : 'p-4 max-w-xs'
          }`}
          whileHover={{ 
            scale: 1.05,
            boxShadow: "8px 8px 0px 0px rgba(0,0,0,0.9)",
            x: 2,
            y: -2
          }}
          whileTap={{ scale: 0.95 }}
          animate={{
            y: [0, -5, 0],
          }}
          transition={{
            y: {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
          onClick={() => !chatWidgetCollapsed && setChatWidgetCollapsed(false)}
        >
          {/* Collapse/Expand Button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              setChatWidgetCollapsed(!chatWidgetCollapsed)
            }}
            className="absolute -top-2 -right-2 w-6 h-6 bg-white text-green-500 rounded-full border-2 border-black font-black text-xs hover:bg-gray-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)] flex items-center justify-center"
          >
            {chatWidgetCollapsed ? '+' : '−'}
          </button>

          {chatWidgetCollapsed ? (
            /* Collapsed State */
            <motion.div 
              className="flex items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              onClick={() => setChatWidgetCollapsed(false)}
            >
              <MessageCircle className="w-5 h-5" />
              <span className="font-black text-sm whitespace-nowrap">Free sales advice</span>
            </motion.div>
          ) : (
            /* Expanded State */
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                <span className="font-black text-sm">Talk to a Sales Success Coach</span>
              </div>
              <div className="text-xs font-bold opacity-90 mb-2">
                💬 Get personalized advice to boost your sales
              </div>
              <div className="bg-white text-green-800 p-2 rounded-lg border-2 border-black text-xs font-black text-center">
                🎯 30-day sales boost guarantee or money back!
              </div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>

      {/* Sticky Mobile CTA */}
      <motion.div 
        className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-green-500 border-t-4 border-black p-4"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.5 }}
      >
        <Link
          href="/auth/signup-animated?plan=free"
          className="block w-full bg-white text-green-800 font-black text-center py-3 rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)] active:translate-x-1 active:translate-y-1"
        >
          🚀 START SELLING TODAY - FREE!
        </Link>
      </motion.div>

      {/* Exit Intent Popup */}
      {showExitIntent && (
        <motion.div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="bg-white p-8 rounded-2xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.9)] max-w-md mx-4 relative"
            initial={{ scale: 0.5, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <button 
              onClick={() => setShowExitIntent(false)}
              className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full border-2 border-black font-black text-sm hover:bg-red-600 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]"
            >
              ×
            </button>
            
            <div className="text-center">
              <motion.div 
                className="text-4xl mb-4"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: 2 }}
              >
                🛑
              </motion.div>
              
              <h3 className="text-2xl font-black text-black mb-4">
                Wait! Don't Miss Out!
              </h3>
              
              <p className="text-black font-bold mb-6">
                Get your <span className="bg-yellow-300 px-2 py-1 rounded border-2 border-black">first month FREE</span> and start boosting your sales today!
              </p>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm font-bold text-green-800">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  30-day money-back guarantee
                </div>
                <div className="flex items-center gap-2 text-sm font-bold text-green-800">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  No setup fees or hidden costs
                </div>
                <div className="flex items-center gap-2 text-sm font-bold text-green-800">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Cancel anytime
                </div>
              </div>
              
              <Link
                href="/auth/signup-animated?plan=premium&promo=FIRSTFREE"
                className="block w-full bg-green-500 hover:bg-green-600 text-white font-black py-3 rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)] hover:translate-x-1 hover:translate-y-1 transition-all mb-3"
              >
                🎉 CLAIM YOUR FREE MONTH NOW!
              </Link>
              
              <button 
                onClick={() => setShowExitIntent(false)}
                className="text-gray-500 text-sm font-bold hover:text-gray-700"
              >
                No thanks, I'll pay full price later
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  )
}
