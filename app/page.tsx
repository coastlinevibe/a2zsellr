'use client'

import Link from 'next/link'
import { ArrowRight, Smartphone, Share2, MessageCircle, Zap, Shield, Globe, Star, Crown, Users, Check, Search, MapPin, Filter, Grid, Calendar, TrendingUp, Award, Eye, ShoppingBag, CheckCircle, BarChart3, Target, Rocket, ChevronLeft, ChevronRight, Tag, X } from 'lucide-react'
import { BusinessCard } from '@/components/BusinessCard'
import { useAuth } from '@/lib/auth'
import { MovingBorderButton } from '@/components/ui/moving-border'
import { useState, useEffect, useRef, useMemo } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { AdminLoginModal } from '@/components/AdminLoginModal'
import { PricingContainer, type PricingPlan } from '@/components/ui/pricing-container'
import { ProductShowcase } from '@/components/ProductShowcase'
import TagSearchFilters from '@/components/TagSearchFilters'
import { motion } from 'framer-motion'

// Function to normalize Unicode characters to ASCII for searching
const normalizeUnicode = (text: string): string => {
  if (!text) return ''
  
  let result = ''
  
  // Process each character
  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    const code = char.charCodeAt(0)
    
    // Mathematical Alphanumeric Symbols (U+1D400–U+1D7FF)
    // These are in the supplementary multilingual plane, represented as surrogate pairs
    if (i < text.length - 1) {
      const nextChar = text[i + 1]
      const nextCode = nextChar.charCodeAt(0)
      
      // Check for surrogate pair (high surrogate followed by low surrogate)
      if (code >= 0xD800 && code <= 0xDBFF && nextCode >= 0xDC00 && nextCode <= 0xDFFF) {
        // Decode surrogate pair to get the actual Unicode code point
        const codePoint = 0x10000 + ((code - 0xD800) << 10) + (nextCode - 0xDC00)
        
        // Mathematical Alphanumeric Symbols ranges
        // Bold: U+1D400–U+1D433 (A-Z, a-z)
        // Italic: U+1D434–U+1D467
        // Bold Italic: U+1D468–U+1D49B
        // Fraktur: U+1D504–U+1D537
        // Double-struck: U+1D538–U+1D56B
        // Script: U+1D49C–U+1D4CF
        // Sans-serif: U+1D5A0–U+1D5D3
        // Sans-serif Bold: U+1D5D4–U+1D607
        // Sans-serif Italic: U+1D608–U+1D63B
        // Sans-serif Bold Italic: U+1D63C–U+1D66F
        // Monospace: U+1D670–U+1D6A3
        
        // Map to ASCII (a=97, z=122, A=65, Z=90)
        if (codePoint >= 0x1D400 && codePoint <= 0x1D419) {
          // Bold A-Z
          result += String.fromCharCode(65 + (codePoint - 0x1D400))
          i++ // Skip next character (low surrogate)
          continue
        } else if (codePoint >= 0x1D41A && codePoint <= 0x1D433) {
          // Bold a-z
          result += String.fromCharCode(97 + (codePoint - 0x1D41A))
          i++
          continue
        } else if (codePoint >= 0x1D434 && codePoint <= 0x1D44D) {
          // Italic A-Z
          result += String.fromCharCode(65 + (codePoint - 0x1D434))
          i++
          continue
        } else if (codePoint >= 0x1D44E && codePoint <= 0x1D467) {
          // Italic a-z
          result += String.fromCharCode(97 + (codePoint - 0x1D44E))
          i++
          continue
        } else if (codePoint >= 0x1D468 && codePoint <= 0x1D481) {
          // Bold Italic A-Z
          result += String.fromCharCode(65 + (codePoint - 0x1D468))
          i++
          continue
        } else if (codePoint >= 0x1D482 && codePoint <= 0x1D49B) {
          // Bold Italic a-z
          result += String.fromCharCode(97 + (codePoint - 0x1D482))
          i++
          continue
        } else if (codePoint >= 0x1D504 && codePoint <= 0x1D51D) {
          // Fraktur A-Z
          result += String.fromCharCode(65 + (codePoint - 0x1D504))
          i++
          continue
        } else if (codePoint >= 0x1D51E && codePoint <= 0x1D537) {
          // Fraktur a-z
          result += String.fromCharCode(97 + (codePoint - 0x1D51E))
          i++
          continue
        } else if (codePoint >= 0x1D56C && codePoint <= 0x1D585) {
          // Bold Fraktur A-Z
          result += String.fromCharCode(65 + (codePoint - 0x1D56C))
          i++
          continue
        } else if (codePoint >= 0x1D586 && codePoint <= 0x1D59F) {
          // Bold Fraktur a-z
          result += String.fromCharCode(97 + (codePoint - 0x1D586))
          i++
          continue
        } else if (codePoint >= 0x1D538 && codePoint <= 0x1D551) {
          // Double-struck A-Z
          result += String.fromCharCode(65 + (codePoint - 0x1D538))
          i++
          continue
        } else if (codePoint >= 0x1D552 && codePoint <= 0x1D56B) {
          // Double-struck a-z
          result += String.fromCharCode(97 + (codePoint - 0x1D552))
          i++
          continue
        } else if (codePoint >= 0x1D5A0 && codePoint <= 0x1D5B9) {
          // Sans-serif A-Z
          result += String.fromCharCode(65 + (codePoint - 0x1D5A0))
          i++
          continue
        } else if (codePoint >= 0x1D5BA && codePoint <= 0x1D5D3) {
          // Sans-serif a-z
          result += String.fromCharCode(97 + (codePoint - 0x1D5BA))
          i++
          continue
        }
      }
    }
    
    // Regular ASCII characters
    result += char.toLowerCase()
  }
  
  return result
}

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
  const [mounted, setMounted] = useState(false)
  const [showAdminModal, setShowAdminModal] = useState(false)
  const [showLocationDropdown, setShowLocationDropdown] = useState(false)
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [showExitIntent, setShowExitIntent] = useState(false)
  const [chatWidgetCollapsed, setChatWidgetCollapsed] = useState(false)
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const [dotPage, setDotPage] = useState(0)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [searchResults, setSearchResults] = useState<{ total: number; tagMatches: number }>({ total: 0, tagMatches: 0 })
  const [isMobile, setIsMobile] = useState(false)
  const [featuresSlide, setFeaturesSlide] = useState(0)
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
        "1 image per product",
        "3 marketing listings"
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
        "8 gallery images",
        "20 products in shop",
        "8 images per product",
        "All social media link sharing",
        "Advanced analytics",
        "E-commerce features"
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
        "12 gallery images",
        "Unlimited products in shop",
        "12 images per product",
        "Instagram ad automation",
        "Bulk campaign management",
        "Priority support",
        "Business marketing listing"
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
          gallery_images:profile_gallery(
            id,
            image_url,
            caption
          )
        `)
        .eq('is_active', true) // Only active profiles
        .in('subscription_tier', ['free', 'premium', 'business']) // All subscription tiers
        .not('display_name', 'is', null) // Only profiles with display names

      // Note: We skip database search filtering for Unicode support
      // All filtering will be done client-side to handle special characters
      
      // Apply category filter
      if (selectedCategory && selectedCategory !== 'all') {
        query = query.eq('business_category', selectedCategory)
      }

      // Apply location filter
      if (selectedLocation && selectedLocation !== 'all') {
        query = query.eq('business_location', selectedLocation)
      }

      // Execute the query
      const { data: profiles, error } = await query
        .order('created_at', { ascending: false })
        .limit(500)

      if (error) {
        console.error('Error fetching businesses:', error)
        setBusinesses([])
        return
      }
      
      // If there's a search query, also do client-side filtering for better Unicode support
      if (searchQuery && searchQuery.trim() !== '' && profiles) {
        const searchTerm = searchQuery.trim().toLowerCase()
        const normalizedSearchTerm = normalizeUnicode(searchTerm)
        
        const filteredProfiles = profiles.filter(profile => {
          // Check if display name contains the search term (case-insensitive)
          if (profile.display_name?.toLowerCase().includes(searchTerm)) return true
          // Check normalized display name (for Unicode characters)
          if (normalizeUnicode(profile.display_name || '').includes(normalizedSearchTerm)) return true
          // Check if bio contains the search term
          if (profile.bio?.toLowerCase().includes(searchTerm)) return true
          // Check if category contains the search term
          if (profile.business_category?.toLowerCase().includes(searchTerm)) return true
          // Check if location contains the search term
          if (profile.business_location?.toLowerCase().includes(searchTerm)) return true
          return false
        })
        
        setBusinesses(filteredProfiles)
      } else {
        setBusinesses(profiles || [])
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
    setMounted(true)
    fetchCategoriesAndLocations()
    fetchBusinesses()
    fetchRecentActivities()
  }, [])

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
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
      let profileIds: string[] = []
      
      // If there's a search query, first search for profiles that have products with matching tags
      if (searchQuery.trim()) {
        const searchTerm = searchQuery.trim()
        
        // Split search term by commas and clean up keywords
        const keywords = searchTerm.split(',').map(keyword => keyword.trim()).filter(keyword => keyword.length > 0)
        
        // If no commas, treat as single search term
        const searchTerms = keywords.length > 1 ? keywords : [searchTerm]
        
        const allMatchingProducts: any[] = []
        
        // Search for each keyword separately
        for (const term of searchTerms) {
          // Search for products with matching names, descriptions, or product details
          const { data: matchingProducts } = await supabase
            .from('products_with_tags')
            .select('profile_id, tags, name, description, product_details')
            .or(`name.ilike.%${term}%,description.ilike.%${term}%,product_details.ilike.%${term}%`)
          
          if (matchingProducts) {
            allMatchingProducts.push(...matchingProducts)
          }
          
          // Also search for products where tags contain the search term
          const { data: tagMatchingProducts } = await supabase
            .from('products_with_tags')
            .select('profile_id, tags, name, description, product_details')
            .not('tags', 'is', null)
          
          // Filter products that have tags matching the search term
          const tagFilteredProducts = tagMatchingProducts?.filter(product => {
            if (!product.tags || !Array.isArray(product.tags)) return false
            return product.tags.some((tag: any) => 
              tag.name?.toLowerCase().includes(term.toLowerCase())
            )
          }) || []
          
          allMatchingProducts.push(...tagFilteredProducts)
        }
        
        // For comma-separated searches, require ALL keywords to match
        if (keywords.length > 1) {
          const productMatches: { [key: string]: { profileId: string, matchedKeywords: Set<string>, product: any } } = {}
          
          allMatchingProducts.forEach(product => {
            const productKey = `${product.profile_id}-${product.name || 'unnamed'}`
            if (!productMatches[productKey]) {
              productMatches[productKey] = { 
                profileId: product.profile_id, 
                matchedKeywords: new Set(), 
                product: product 
              }
            }
            
            // Check which keywords this product matches
            keywords.forEach(keyword => {
              const lowerKeyword = keyword.toLowerCase()
              let keywordMatches = false
              
              // Check product name, description, details
              if (product.name?.toLowerCase().includes(lowerKeyword) ||
                  product.description?.toLowerCase().includes(lowerKeyword) ||
                  product.product_details?.toLowerCase().includes(lowerKeyword)) {
                keywordMatches = true
              }
              
              // Check tags
              if (product.tags && Array.isArray(product.tags)) {
                product.tags.forEach((tag: any) => {
                  if (tag.name?.toLowerCase().includes(lowerKeyword)) {
                    keywordMatches = true
                  }
                })
              }
              
              if (keywordMatches) {
                productMatches[productKey].matchedKeywords.add(keyword)
              }
            })
          })
          
          // Only include products that match ALL keywords
          const validProducts = Object.values(productMatches)
            .filter(p => p.matchedKeywords.size === keywords.length)
          
          const uniqueProfileIds = new Set(validProducts.map(p => p.profileId))
          profileIds = Array.from(uniqueProfileIds)
        } else {
          // Single search term - use all matches
          const profileIdMap: { [key: string]: boolean } = {}
          allMatchingProducts.forEach(p => { profileIdMap[p.profile_id] = true })
          profileIds = Object.keys(profileIdMap)
        }
      }

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

      // Apply search query filter - enhanced to include tag matches and Unicode normalization
      if (searchQuery.trim()) {
        const searchTerm = searchQuery.trim()
        const normalizedSearchTerm = normalizeUnicode(searchTerm)
        
        // Check if this is a comma-separated product search
        const keywords = searchTerm.split(',').map(keyword => keyword.trim()).filter(keyword => keyword.length > 0)
        const isProductSearch = keywords.length > 1
        
        if (profileIds.length > 0) {
          if (isProductSearch) {
            // For comma-separated searches, ONLY show profiles with matching products
            query = query.in('id', profileIds)
          } else {
            // For single term searches, include both product matches and profile matches
            query = query.or(`display_name.ilike.%${searchTerm}%,bio.ilike.%${searchTerm}%,business_category.ilike.%${searchTerm}%,business_location.ilike.%${searchTerm}%,id.in.(${profileIds.join(',')})`)
          }
        } else {
          // No product matches found, fallback to basic profile search
          // Always include both original and normalized search terms for Unicode support
          if (normalizedSearchTerm !== searchTerm.toLowerCase()) {
            // Search for both original term and normalized term
            query = query.or(`display_name.ilike.%${searchTerm}%,display_name.ilike.%${normalizedSearchTerm}%,bio.ilike.%${searchTerm}%,business_category.ilike.%${searchTerm}%,business_location.ilike.%${searchTerm}%`)
          } else {
            // Only search for original term if normalization didn't change it
            query = query.or(`display_name.ilike.%${searchTerm}%,bio.ilike.%${searchTerm}%,business_category.ilike.%${searchTerm}%,business_location.ilike.%${searchTerm}%`)
          }
        }
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
        .limit(500) // Show all results

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
          .limit(500)
        
        const { data: fallbackData } = await fallbackQuery
        setBusinesses(fallbackData || [])
      } else {
        setBusinesses(data || [])
        
        // Update search results stats
        const tagMatches = profileIds.length
        setSearchResults({ total: data?.length || 0, tagMatches })
      }
      // Reset carousel to first slide when search results change
      setCurrentSlide(0)
    } catch (error) {
      console.error('Search error:', error)
      setBusinesses([])
      setSearchResults({ total: 0, tagMatches: 0 })
    } finally {
      setIsSearching(false)
    }
  }

  const handleTagSelect = (tagName: string) => {
    if (!selectedTags.includes(tagName)) {
      const newTags = [...selectedTags, tagName]
      setSelectedTags(newTags)
      // Add tag to search query
      const tagQuery = newTags.join(' ')
      setSearchQuery(tagQuery)
    }
  }

  const handleTagRemove = (tagName: string) => {
    const newTags = selectedTags.filter(tag => tag !== tagName)
    setSelectedTags(newTags)
    // Update search query
    const tagQuery = newTags.join(' ')
    setSearchQuery(tagQuery)
  }
  
  // Show loading state on first mount
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
      {/* Hero Section - Brutalist Style */}
      <motion.section 
        className="pt-4 pb-16 sm:pt-10 lg:pt-20 lg:pb-20 relative"
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
                className="text-4xl sm:text-5xl lg:text-6xl font-black text-black leading-tight mb-6 bg-white pt-10 px-6 pb-6 rounded-xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.9)]"
                initial={{ y: 50, opacity: 0, rotate: -5 }}
                animate={{ y: 0, opacity: 1, rotate: 0 }}
                transition={{ duration: 0.8, delay: 0.6, type: "spring", stiffness: 100 }}
              >
                <span className="block">BE SEEN.</span>
                <span className="block">SHOW & SELL.</span>
                <span className="text-green-600 block">ALL IN ONE</span>
              </motion.h1>
              
              <motion.p 
                className="text-lg text-black mb-0 leading-relaxed max-w-lg bg-white p-4 rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] font-bold"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.9 }}
              >
                The All-In-One Home for South African Sellers. Your products, your services, your brand — amplified with tools built for real South African businesses.
              </motion.p>
              
              {/* Feature Pills */}
              <motion.div 
                className="flex flex-wrap gap-3 mb-8"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 1.0 }}
              >
              </motion.div>

              {/* CTA Buttons */}
              <motion.div 
                className="flex flex-row gap-4 sm:gap-6 justify-center sm:justify-start"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 1.4 }}
              >
                <Link
                  href="/auth/signup-animated?plan=free"
                  className="inline-flex items-center justify-center"
                  style={{
                    background: '#5cbdfd',
                    fontFamily: 'inherit',
                    padding: '0.6em 1.3em',
                    fontWeight: 900,
                    fontSize: '18px',
                    border: '3px solid black',
                    borderRadius: '0.4em',
                    boxShadow: '0.1em 0.1em',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translate(-0.05em, -0.05em)';
                    e.currentTarget.style.boxShadow = '0.15em 0.15em';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translate(0, 0)';
                    e.currentTarget.style.boxShadow = '0.1em 0.1em';
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.transform = 'translate(0.05em, 0.05em)';
                    e.currentTarget.style.boxShadow = '0.05em 0.05em';
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.transform = 'translate(-0.05em, -0.05em)';
                    e.currentTarget.style.boxShadow = '0.15em 0.15em';
                  }}
                >
                  <ArrowRight className="mr-2 h-5 w-5" />
                  REGISTER
                </Link>
                <Link
                  href="/auth/signin"
                  className="inline-flex items-center justify-center"
                  style={{
                    background: '#5cbdfd',
                    fontFamily: 'inherit',
                    padding: '0.6em 1.3em',
                    fontWeight: 900,
                    fontSize: '18px',
                    border: '3px solid black',
                    borderRadius: '0.4em',
                    boxShadow: '0.1em 0.1em',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translate(-0.05em, -0.05em)';
                    e.currentTarget.style.boxShadow = '0.15em 0.15em';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translate(0, 0)';
                    e.currentTarget.style.boxShadow = '0.1em 0.1em';
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.transform = 'translate(0.05em, 0.05em)';
                    e.currentTarget.style.boxShadow = '0.05em 0.05em';
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.transform = 'translate(-0.05em, -0.05em)';
                    e.currentTarget.style.boxShadow = '0.15em 0.15em';
                  }}
                >
                  <Eye className="mr-2 h-5 w-5" />
                  LOGIN
                </Link>
              </motion.div>
            </motion.div>

            {/* Right Content - Brutalist Illustration - Hidden on Mobile */}
            <motion.div 
              className="relative hidden lg:block"
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
                  transition={{ 
                    duration: 32, 
                    repeat: Infinity, 
                    ease: "linear" 
                  }}
                >
                  <span className="text-green-800 font-bold text-sm mr-8">
                    {tickerContent}
                  </span>
                </motion.div>
              </motion.div>
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
              </div>
              <ProductShowcase />
            </motion.div>
          </div>
        </div>
      </motion.section>
      
      {/* Directory Search Section - Brutalist Style */}
      <motion.section 
        id="directory"
        className="py-8 relative"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-6"
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <motion.h2 
              className="text-2xl font-black text-black mb-2 bg-white p-4 rounded-xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.9)] inline-block"
              initial={{ scale: 0, rotate: -10 }}
              whileInView={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.6, delay: 0.4, type: "spring", stiffness: 200 }}
              viewport={{ once: true }}
            >
              FIND LOCAL BUSINESSES
            </motion.h2>

          </motion.div>
          
          <motion.div 
            className="max-w-4xl mx-auto -mt-2"
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="bg-white rounded-2xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.9)] p-6">
              {/* Tag Search Filters */}
              <TagSearchFilters
                onTagSelect={handleTagSelect}
                selectedTags={selectedTags}
                onTagRemove={handleTagRemove}
              />
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 items-end">
                {/* Search Input */}
                <div className="lg:col-span-4">
                  <label className="block text-sm font-black text-black mb-2 flex items-center justify-between">
                    <span>FIND BUSINESSES</span>
                    <span className="text-xs bg-green-300 px-2 py-1 rounded border border-black">
                      FOUND {businesses.length}
                    </span>
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-black" />
                    <input
                      type="text"
                      placeholder="Search businesses..."
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
                            className="w-full px-4 py-3 text-left font-bold text-black hover:bg-green-300 border-b-2 border-black last:border-b-0 transition-colors"
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
                
                {/* Search & Clear Buttons */}
                <div className="lg:col-span-2 flex gap-2">
                  {/* Search Button */}
                  <motion.button 
                    onClick={handleSearch}
                    disabled={isSearching}
                    className="flex-1 disabled:opacity-50 text-black font-black py-3 px-4 flex items-center justify-center transition-all"
                    style={{
                      background: '#5cbdfd',
                      fontFamily: 'inherit',
                      fontWeight: 900,
                      fontSize: '16px',
                      border: '3px solid black',
                      borderRadius: '0.4em',
                      boxShadow: '0.1em 0.1em',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSearching) {
                        e.currentTarget.style.transform = 'translate(-0.05em, -0.05em)';
                        e.currentTarget.style.boxShadow = '0.15em 0.15em';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translate(0, 0)';
                      e.currentTarget.style.boxShadow = '0.1em 0.1em';
                    }}
                    onMouseDown={(e) => {
                      if (!isSearching) {
                        e.currentTarget.style.transform = 'translate(0.05em, 0.05em)';
                        e.currentTarget.style.boxShadow = '0.05em 0.05em';
                      }
                    }}
                    onMouseUp={(e) => {
                      if (!isSearching) {
                        e.currentTarget.style.transform = 'translate(-0.05em, -0.05em)';
                        e.currentTarget.style.boxShadow = '0.15em 0.15em';
                      }
                    }}
                  >
                    {isSearching ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                    ) : (
                      <Search className="h-5 w-5" />
                    )}
                  </motion.button>

                  {/* Clear Filters Button */}
                  <motion.button 
                    onClick={() => {
                      setSearchQuery('')
                      setSelectedCategory('all')
                      setSelectedLocation('all')
                      setSelectedTags([])
                    }}
                    disabled={isSearching}
                    className="flex-1 disabled:opacity-50 text-black font-black py-3 px-4 flex items-center justify-center transition-all"
                    style={{
                      background: '#ff6b6b',
                      fontFamily: 'inherit',
                      fontWeight: 900,
                      fontSize: '16px',
                      border: '3px solid black',
                      borderRadius: '0.4em',
                      boxShadow: '0.1em 0.1em',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSearching) {
                        e.currentTarget.style.transform = 'translate(-0.05em, -0.05em)';
                        e.currentTarget.style.boxShadow = '0.15em 0.15em';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translate(0, 0)';
                      e.currentTarget.style.boxShadow = '0.1em 0.1em';
                    }}
                    onMouseDown={(e) => {
                      if (!isSearching) {
                        e.currentTarget.style.transform = 'translate(0.05em, 0.05em)';
                        e.currentTarget.style.boxShadow = '0.05em 0.05em';
                      }
                    }}
                    onMouseUp={(e) => {
                      if (!isSearching) {
                        e.currentTarget.style.transform = 'translate(-0.05em, -0.05em)';
                        e.currentTarget.style.boxShadow = '0.15em 0.15em';
                      }
                    }}
                  >
                    <X className="h-5 w-5" />
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Search Results - Brutalist Style */}
      <section className="py-3 relative">
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

              
              {/* Carousel Container with Side Navigation */}
              <div className="flex items-center gap-4">
                {/* Left Navigation Button */}
                <motion.button
                  onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                  disabled={currentSlide === 0}
                  className={`hidden md:block p-4 rounded-lg border-2 border-black font-black transition-all ${
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
                <div 
                  className="flex-1 overflow-hidden rounded-xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.9)] bg-white p-2 md:p-6"
                  onTouchStart={(e) => setTouchStart(e.targetTouches[0].clientX)}
                  onTouchEnd={(e) => {
                    setTouchEnd(e.changedTouches[0].clientX)
                    const distance = touchStart - e.changedTouches[0].clientX
                    if (distance > 50) {
                      setCurrentSlide(Math.min(Math.max(0, businesses.length - 1), currentSlide + 1))
                    } else if (distance < -50) {
                      setCurrentSlide(Math.max(0, currentSlide - 1))
                    }
                  }}
                >
                <motion.div 
                  className="flex gap-8 md:gap-6 justify-start"
                  animate={{ 
                    x: isMobile 
                      ? -currentSlide * (typeof window !== 'undefined' ? window.innerWidth - 32 : 300) + 4
                      : -currentSlide * (320 + 24) 
                  }}
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
                        className="flex-shrink-0 w-[calc(100vw-64px)] md:w-80"
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
                

                </div>

                {/* Right Navigation Button */}
                <motion.button
                  onClick={() => setCurrentSlide(Math.min(Math.max(0, businesses.length - 3), currentSlide + 1))}
                  disabled={currentSlide >= Math.max(0, businesses.length - 3)}
                  className={`hidden md:block p-4 rounded-lg border-2 border-black font-black transition-all ${
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

          {/* Mobile Carousel */}
          <div className="md:hidden">
            <div className="relative">
              <div className="overflow-hidden">
                <div 
                  className="flex transition-transform duration-300 ease-in-out"
                  style={{ transform: `translateX(-${featuresSlide * 100}%)` }}
                >
                  {/* Feature 1 - Mobile Card */}
                  <div className="w-full flex-shrink-0 px-4">
                    <div className="bg-white p-6 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)]">
                      <div className="w-12 h-12 bg-green-500 rounded-lg border-2 border-black flex items-center justify-center mb-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]">
                        <Search className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-xl font-black text-black mb-3">SMART DIRECTORY</h3>
                      <p className="text-black mb-4 leading-relaxed font-bold">
                        GET DISCOVERED BY CUSTOMERS WITH OUR INTELLIGENT SEARCH AND FILTERING SYSTEM. PREMIUM PLACEMENT FOR VERIFIED BUSINESSES.
                      </p>
                      <ul className="space-y-2 text-sm text-black">
                        <li className="flex items-center gap-2 bg-green-300 p-2 rounded border-2 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,0.9)]">
                          <CheckCircle className="h-4 w-4 text-black" />
                          <span className="font-black">MULTI-LOCATION COVERAGE</span>
                        </li>
                        <li className="flex items-center gap-2 bg-green-300 p-2 rounded border-2 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,0.9)]">
                          <CheckCircle className="h-4 w-4 text-black" />
                          <span className="font-black">VERIFIED BUSINESS BADGES</span>
                        </li>
                        <li className="flex items-center gap-2 bg-green-300 p-2 rounded border-2 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,0.9)]">
                          <CheckCircle className="h-4 w-4 text-black" />
                          <span className="font-black">CUSTOMER REVIEWS & RATINGS</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Feature 2 - Mobile Card */}
                  <div className="w-full flex-shrink-0 px-4">
                    <div className="bg-white p-6 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)]">
                      <div className="w-12 h-12 bg-blue-500 rounded-lg border-2 border-black flex items-center justify-center mb-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]">
                        <ShoppingBag className="h-6 w-6 text-white" />
                      </div>
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
                  </div>

                  {/* Feature 3 - Mobile Card */}
                  <div className="w-full flex-shrink-0 px-4">
                    <div className="bg-white p-6 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)]">
                      <div className="w-12 h-12 bg-yellow-500 rounded-lg border-2 border-black flex items-center justify-center mb-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]">
                        <Share2 className="h-6 w-6 text-black" />
                      </div>
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
                  </div>

                  {/* Feature 4 - Mobile Card */}
                  <div className="w-full flex-shrink-0 px-4">
                    <div className="bg-white p-6 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)]">
                      <div className="w-12 h-12 bg-purple-500 rounded-lg border-2 border-black flex items-center justify-center mb-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]">
                        <BarChart3 className="h-6 w-6 text-white" />
                      </div>
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
                  </div>

                  {/* Feature 5 - Mobile Card */}
                  <div className="w-full flex-shrink-0 px-4">
                    <div className="bg-white p-6 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)]">
                      <div className="w-12 h-12 bg-pink-500 rounded-lg border-2 border-black flex items-center justify-center mb-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]">
                        <Smartphone className="h-6 w-6 text-white" />
                      </div>
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
                  </div>

                  {/* Feature 6 - Mobile Card */}
                  <div className="w-full flex-shrink-0 px-4">
                    <div className="bg-white p-6 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)]">
                      <div className="w-12 h-12 bg-red-500 rounded-lg border-2 border-black flex items-center justify-center mb-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]">
                        <Shield className="h-6 w-6 text-white" />
                      </div>
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
              </div>
              
              {/* Navigation Arrows */}
              <button
                onClick={() => setFeaturesSlide(Math.max(0, featuresSlide - 1))}
                disabled={featuresSlide === 0}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white border-2 border-black rounded-full p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)] disabled:opacity-50"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => setFeaturesSlide(Math.min(5, featuresSlide + 1))}
                disabled={featuresSlide === 5}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white border-2 border-black rounded-full p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)] disabled:opacity-50"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              
              {/* Dots Indicator */}
              <div className="flex justify-center mt-6 space-x-2">
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <button
                    key={index}
                    onClick={() => setFeaturesSlide(index)}
                    className={`w-3 h-3 rounded-full border-2 border-black ${
                      featuresSlide === index ? 'bg-black' : 'bg-white'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Desktop Grid */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                  className="inline-flex items-center justify-center"
                  style={{
                    background: '#5cbdfd',
                    fontFamily: 'inherit',
                    padding: '0.6em 1.3em',
                    fontWeight: 900,
                    fontSize: '18px',
                    border: '3px solid black',
                    borderRadius: '0.4em',
                    boxShadow: '0.1em 0.1em',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translate(-0.05em, -0.05em)';
                    e.currentTarget.style.boxShadow = '0.15em 0.15em';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translate(0, 0)';
                    e.currentTarget.style.boxShadow = '0.1em 0.1em';
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.transform = 'translate(0.05em, 0.05em)';
                    e.currentTarget.style.boxShadow = '0.05em 0.05em';
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.transform = 'translate(-0.05em, -0.05em)';
                    e.currentTarget.style.boxShadow = '0.15em 0.15em';
                  }}
                >
                  REGISTER
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <a
                  href="#pricing"
                  className="inline-flex items-center justify-center"
                  style={{
                    background: '#5cbdfd',
                    fontFamily: 'inherit',
                    padding: '0.6em 1.3em',
                    fontWeight: 900,
                    fontSize: '18px',
                    border: '3px solid black',
                    borderRadius: '0.4em',
                    boxShadow: '0.1em 0.1em',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textDecoration: 'none',
                    color: 'inherit'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translate(-0.05em, -0.05em)';
                    e.currentTarget.style.boxShadow = '0.15em 0.15em';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translate(0, 0)';
                    e.currentTarget.style.boxShadow = '0.1em 0.1em';
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.transform = 'translate(0.05em, 0.05em)';
                    e.currentTarget.style.boxShadow = '0.05em 0.05em';
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.transform = 'translate(-0.05em, -0.05em)';
                    e.currentTarget.style.boxShadow = '0.15em 0.15em';
                  }}
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
                className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-xl border-4 border-white flex items-center justify-center shadow-[6px_6px_0px_0px_rgba(255,255,255,0.9)] transform rotate-3 overflow-hidden"
                whileHover={{ 
                  rotate: [3, -3, 3],
                  scale: 1.1,
                  transition: { duration: 0.5 }
                }}
              >
                <img 
                  src="/logo.png" 
                  alt="A2Z Sellr Logo" 
                  className="w-12 h-12 object-contain"
                />
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
                  SELLER PLATFORM
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
                onClick={async () => {
                  try {
                    // Auto-login with admin credentials
                    const { data, error } = await supabase.auth.signInWithPassword({
                      email: 'admin@out.com',
                      password: '123456'
                    })
                    
                    if (error) {
                      console.error('Admin login error:', error)
                      alert('Failed to login as admin')
                      return
                    }
                    
                    // Redirect to admin dashboard
                    window.location.href = '/admin'
                  } catch (error) {
                    console.error('Admin login error:', error)
                    alert('Failed to login as admin')
                  }
                }}
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

      {/* Live Chat Widget with Success Guarantee - Hidden on Mobile */}
      <motion.div 
        className="fixed bottom-6 right-6 z-50 hidden lg:block"
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
                className="block w-full text-center font-black mb-3"
                style={{
                  background: '#5cbdfd',
                  fontFamily: 'inherit',
                  padding: '0.6em 1.3em',
                  fontWeight: 900,
                  fontSize: '15px',
                  border: '3px solid black',
                  borderRadius: '0.4em',
                  boxShadow: '0.1em 0.1em',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textDecoration: 'none',
                  color: 'inherit'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translate(-0.05em, -0.05em)';
                  e.currentTarget.style.boxShadow = '0.15em 0.15em';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translate(0, 0)';
                  e.currentTarget.style.boxShadow = '0.1em 0.1em';
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.transform = 'translate(0.05em, 0.05em)';
                  e.currentTarget.style.boxShadow = '0.05em 0.05em';
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = 'translate(-0.05em, -0.05em)';
                  e.currentTarget.style.boxShadow = '0.15em 0.15em';
                }}
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
