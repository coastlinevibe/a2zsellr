import { createClient } from '@supabase/supabase-js'

// Optimized Supabase configuration with connection pooling
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dcfgdlwhixdruyewywly.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjZmdkbHdoaXhkcnV5ZXd5d2x5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MjU1NjYsImV4cCI6MjA3NjEwMTU2Nn0.wMGq2FpoVFMnLemUP13763iodoXNu-gx8I0rRpTubG4'

// Create optimized Supabase client with performance settings
export const supabaseOptimized = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'x-my-custom-header': 'a2z-business-directory',
    },
  },
  db: {
    schema: 'public',
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Connection pool management
class ConnectionPool {
  private connections: Map<string, any> = new Map()
  private maxConnections = 10
  private connectionTimeout = 30000 // 30 seconds

  getConnection(key: string) {
    if (this.connections.has(key)) {
      return this.connections.get(key)
    }

    if (this.connections.size >= this.maxConnections) {
      // Remove oldest connection
      const firstKey = this.connections.keys().next().value as string | undefined
      if (firstKey !== undefined) {
        this.connections.delete(firstKey)
      }
    }

    const connection = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
      global: {
        headers: { 'Connection': 'keep-alive' }
      }
    })

    this.connections.set(key, connection)
    
    // Auto-cleanup after timeout
    setTimeout(() => {
      this.connections.delete(key)
    }, this.connectionTimeout)

    return connection
  }

  clearAll() {
    this.connections.clear()
  }
}

export const connectionPool = new ConnectionPool()

// Optimized query functions with caching
const queryCache = new Map<string, { data: any, timestamp: number }>()
const CACHE_DURATION = 60000 // 1 minute

export async function cachedQuery(
  table: string, 
  select: string = '*', 
  filters: Record<string, any> = {},
  options: { 
    limit?: number, 
    orderBy?: { column: string, ascending?: boolean },
    cacheKey?: string,
    cacheDuration?: number 
  } = {}
) {
  const cacheKey = options.cacheKey || `${table}_${select}_${JSON.stringify(filters)}_${JSON.stringify(options)}`
  const cacheDuration = options.cacheDuration || CACHE_DURATION
  
  // Check cache first
  const cached = queryCache.get(cacheKey)
  if (cached && (Date.now() - cached.timestamp) < cacheDuration) {
    return { data: cached.data, error: null, fromCache: true }
  }

  try {
    let query = supabaseOptimized.from(table).select(select)

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        query = query.in(key, value)
      } else if (typeof value === 'string' && value.includes('%')) {
        query = query.ilike(key, value)
      } else {
        query = query.eq(key, value)
      }
    })

    // Apply ordering
    if (options.orderBy) {
      query = query.order(options.orderBy.column, { ascending: options.orderBy.ascending ?? true })
    }

    // Apply limit
    if (options.limit) {
      query = query.limit(options.limit)
    }

    const { data, error } = await query

    if (!error && data) {
      // Cache successful results
      queryCache.set(cacheKey, { data, timestamp: Date.now() })
      
      // Cleanup old cache entries
      if (queryCache.size > 100) {
        const oldestKey = queryCache.keys().next().value as string | undefined
        if (oldestKey !== undefined) {
          queryCache.delete(oldestKey)
        }
      }
    }

    return { data, error, fromCache: false }
  } catch (error) {
    return { data: null, error, fromCache: false }
  }
}

// Batch query function for multiple queries
export async function batchQueries(queries: Array<{
  table: string,
  select?: string,
  filters?: Record<string, any>,
  options?: any
}>) {
  const promises = queries.map(query => 
    cachedQuery(
      query.table, 
      query.select || '*', 
      query.filters || {}, 
      query.options || {}
    )
  )

  return Promise.all(promises)
}

// Optimized business search function
export async function searchBusinesses(
  searchQuery: string = '',
  selectedCategory: string = 'all',
  selectedLocation: string = 'all',
  limit: number = 24
) {
  const cacheKey = `businesses_${searchQuery}_${selectedCategory}_${selectedLocation}_${limit}`
  
  try {
    const filters: Record<string, any> = {
      is_active: true,
      subscription_tier: ['free', 'premium', 'business']
    }

    // Add search filters
    if (selectedCategory && selectedCategory !== 'all') {
      filters.business_category = selectedCategory
    }

    if (selectedLocation && selectedLocation !== 'all') {
      filters.business_location = selectedLocation
    }

    let query = supabaseOptimized
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
        created_at,
        updated_at,
        gallery_images:profile_gallery(
          id,
          image_url,
          caption
        )
      `)
      .eq('is_active', true)
      .in('subscription_tier', ['free', 'premium', 'business'])
      .not('display_name', 'is', null)

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
      .limit(limit)

    const { data, error } = await query

    return { data: data || [], error }
  } catch (error) {
    console.error('Search error:', error)
    return { data: [], error }
  }
}

// Optimized recent activities fetch
export async function getRecentActivities(limit: number = 15) {
  return cachedQuery(
    'profile_products',
    `
      id,
      name,
      created_at,
      profile_id,
      profiles!inner(display_name)
    `,
    {},
    {
      limit,
      orderBy: { column: 'created_at', ascending: false },
      cacheKey: 'recent_activities',
      cacheDuration: 30000 // 30 seconds cache for activities
    }
  )
}

// Clear cache function
export function clearQueryCache() {
  queryCache.clear()
}

// Performance monitoring
export function getPerformanceStats() {
  return {
    cacheSize: queryCache.size,
    connectionPoolSize: connectionPool['connections'].size,
    cacheHitRate: queryCache.size > 0 ? 'Available' : 'Empty'
  }
}
