import { createClient } from '@supabase/supabase-js'

// Performance-optimized Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dcfgdlwhixdruyewywly.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjZmdkbHdoaXhkcnV5ZXd5d2x5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MjU1NjYsImV4cCI6MjA3NjEwMTU2Nn0.wMGq2FpoVFMnLemUP13763iodoXNu-gx8I0rRpTubG4'

// Create optimized client with performance settings
export const supabaseFast = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false, // Disable for better performance
  },
  global: {
    headers: {
      'Connection': 'keep-alive',
      'Keep-Alive': 'timeout=30, max=100',
    },
  },
  db: {
    schema: 'public',
  },
  realtime: {
    params: {
      eventsPerSecond: 5 // Reduce realtime load
    }
  }
})

// In-memory cache with TTL
class PerformanceCache {
  private cache = new Map<string, { data: any, expires: number }>()
  private defaultTTL = 60000 // 1 minute

  set(key: string, data: any, ttl?: number): void {
    const expires = Date.now() + (ttl || this.defaultTTL)
    this.cache.set(key, { data, expires })
    
    // Cleanup expired entries periodically
    if (this.cache.size > 50) {
      this.cleanup()
    }
  }

  get(key: string): any | null {
    const item = this.cache.get(key)
    if (!item) return null
    
    if (Date.now() > item.expires) {
      this.cache.delete(key)
      return null
    }
    
    return item.data
  }

  clear(): void {
    this.cache.clear()
  }

  private cleanup(): void {
    const now = Date.now()
    this.cache.forEach((item, key) => {
      if (now > item.expires) {
        this.cache.delete(key)
      }
    })
  }

  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    }
  }
}

export const performanceCache = new PerformanceCache()

// Optimized query functions
export async function fastQuery<T = any>(
  table: string,
  select: string = '*',
  options: {
    filters?: Record<string, any>
    limit?: number
    orderBy?: { column: string, ascending?: boolean }[]
    cacheKey?: string
    cacheTTL?: number
    skipCache?: boolean
  } = {}
): Promise<{ data: T[] | null, error: any, fromCache?: boolean }> {
  
  const cacheKey = options.cacheKey || `${table}_${select}_${JSON.stringify(options)}`
  
  // Check cache first
  if (!options.skipCache) {
    const cached = performanceCache.get(cacheKey)
    if (cached) {
      return { data: cached, error: null, fromCache: true }
    }
  }

  try {
    let query = supabaseFast.from(table).select(select)

    // Apply filters efficiently
    if (options.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          query = query.in(key, value)
        } else if (value === null) {
          query = query.is(key, null)
        } else if (typeof value === 'string' && value.includes('%')) {
          query = query.ilike(key, value)
        } else {
          query = query.eq(key, value)
        }
      })
    }

    // Apply ordering
    if (options.orderBy) {
      options.orderBy.forEach(order => {
        query = query.order(order.column, { ascending: order.ascending ?? true })
      })
    }

    // Apply limit
    if (options.limit) {
      query = query.limit(options.limit)
    }

    const { data, error } = await query
    const typedData = (data ?? null) as T[] | null

    // Cache successful results
    if (!error && typedData && !options.skipCache) {
      performanceCache.set(cacheKey, typedData, options.cacheTTL)
    }

    return { data: typedData, error, fromCache: false }
  } catch (error) {
    console.error(`Query error for ${table}:`, error)
    return { data: null, error, fromCache: false }
  }
}

// Optimized business search with minimal joins
export async function searchBusinessesFast(
  searchQuery: string = '',
  selectedCategory: string = 'all',
  selectedLocation: string = 'all',
  limit: number = 24
) {
  const cacheKey = `biz_search_${searchQuery}_${selectedCategory}_${selectedLocation}_${limit}`
  
  const filters: Record<string, any> = {
    is_active: true,
    subscription_tier: ['free', 'premium', 'business']
  }

  if (selectedCategory && selectedCategory !== 'all') {
    filters.business_category = selectedCategory
  }

  if (selectedLocation && selectedLocation !== 'all') {
    filters.business_location = selectedLocation
  }

  // First get basic profile data (fast)
  let query = supabaseFast
    .from('profiles')
    .select(`
      id,
      display_name,
      bio,
      avatar_url,
      business_category,
      business_location,
      business_hours,
      subscription_tier,
      verified_seller,
      updated_at
    `)

  Object.entries(filters).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      query = query.in(key, value)
    } else {
      query = query.eq(key, value)
    }
  })

  query = query.not('display_name', 'is', null)

  // Apply search query filter
  if (searchQuery.trim()) {
    const searchTerm = searchQuery.trim()
    query = query.or(`display_name.ilike.%${searchTerm}%,bio.ilike.%${searchTerm}%,business_category.ilike.%${searchTerm}%,business_location.ilike.%${searchTerm}%`)
  }

  query = query
    .order('verified_seller', { ascending: false })
    .order('updated_at', { ascending: false })
    .limit(limit)

  const { data: profiles, error } = await query

  if (error || !profiles) {
    return { data: [], error }
  }

  // Then get gallery images separately (parallel)
  const profileIds = profiles.map(p => p.id)
  const { data: galleryImages } = await supabaseFast
    .from('profile_gallery')
    .select('profile_id, id, image_url, caption')
    .in('profile_id', profileIds)
    .limit(100) // Reasonable limit

  // Combine data efficiently
  const businessesWithGallery = profiles.map(profile => ({
    ...profile,
    gallery_images: galleryImages?.filter(img => img.profile_id === profile.id) || []
  }))

  return { data: businessesWithGallery, error: null }
}

// Fast categories and locations fetch
export async function getCategoriesAndLocationsFast() {
  const [categoriesResult, locationsResult] = await Promise.all([
    fastQuery('categories', 'name, slug', {
      filters: { is_active: true },
      orderBy: [{ column: 'name' }],
      cacheKey: 'categories_active',
      cacheTTL: 300000 // 5 minutes
    }),
    fastQuery('locations', 'city, slug', {
      filters: { is_active: true },
      orderBy: [{ column: 'city' }],
      cacheKey: 'locations_active',
      cacheTTL: 300000 // 5 minutes
    })
  ])

  return {
    categories: categoriesResult.data || [],
    locations: locationsResult.data || [],
    errors: {
      categories: categoriesResult.error,
      locations: locationsResult.error
    }
  }
}

// Fast recent activities with fallback
export async function getRecentActivitiesFast(limit: number = 15) {
  try {
    // Try optimized query first
    const { data, error } = await fastQuery(
      'profile_products',
      'id, name, created_at, profile_id',
      {
        orderBy: [{ column: 'created_at', ascending: false }],
        limit,
        cacheKey: 'recent_activities_simple',
        cacheTTL: 30000 // 30 seconds
      }
    )

    if (error || !data) {
      return { data: [], error }
    }

    // Get profile names separately if needed
    const profileIds = Array.from(new Set(data.map(item => item.profile_id).filter(Boolean)))
    
    if (profileIds.length > 0) {
      const { data: profiles } = await fastQuery(
        'profiles',
        'id, display_name',
        {
          filters: { id: profileIds },
          cacheKey: `profiles_names_${profileIds.join('_')}`,
          cacheTTL: 60000 // 1 minute
        }
      )

      // Combine data
      const activitiesWithNames = data.map(activity => ({
        ...activity,
        profile_name: profiles?.find(p => p.id === activity.profile_id)?.display_name || ''
      }))

      return { data: activitiesWithNames, error: null }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error fetching recent activities:', error)
    return { data: [], error }
  }
}

// Performance monitoring
export function getPerformanceMetrics() {
  return {
    cache: performanceCache.getStats(),
    timestamp: new Date().toISOString()
  }
}

// Clear all caches
export function clearAllCaches() {
  performanceCache.clear()
}

// Preload critical data
export async function preloadCriticalData() {
  console.log('🚀 Preloading critical data...')
  
  const startTime = Date.now()
  
  try {
    await Promise.all([
      getCategoriesAndLocationsFast(),
      getRecentActivitiesFast(10),
      fastQuery('profiles', 'id, display_name, verified_seller', {
        filters: { is_active: true },
        limit: 20,
        cacheKey: 'featured_profiles'
      })
    ])
    
    const loadTime = Date.now() - startTime
    console.log(`✅ Critical data preloaded in ${loadTime}ms`)
    
    return { success: true, loadTime }
  } catch (error) {
    console.error('❌ Failed to preload critical data:', error)
    return { success: false, error }
  }
}
