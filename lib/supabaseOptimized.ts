import { createClient } from '@supabase/supabase-js'

// Function to normalize Unicode characters to ASCII for searching
const normalizeUnicode = (text: string): string => {
  if (!text) return ''
  
  let result = ''
  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    const code = char.charCodeAt(0)
    
    // Mathematical Alphanumeric Symbols (U+1D400–U+1D7FF)
    // These are in the supplementary multilingual plane, represented as surrogate pairs
    if (i < text.length - 1) {
      const nextChar = text[i + 1]
      const nextCode = nextChar.charCodeAt(0)
      
      // Check if this is a high surrogate followed by a low surrogate
      if (code >= 0xD800 && code <= 0xDBFF && nextCode >= 0xDC00 && nextCode <= 0xDFFF) {
        const codePoint = 0x10000 + ((code - 0xD800) << 10) + (nextCode - 0xDC00)
        
        // Mathematical Alphanumeric Symbols ranges
        // Bold: U+1D400–U+1D433 (A-Z, a-z)
        // Italic: U+1D434–U+1D467
        // Bold Italic: U+1D468–U+1D49B
        // Script: U+1D49C–U+1D4CF
        // Bold Script: U+1D4D0–U+1D503
        // Fraktur: U+1D504–U+1D537
        // Double-struck: U+1D538–U+1D56B
        // Bold Fraktur: U+1D56C–U+1D59F
        // Sans-serif: U+1D5A0–U+1D5D3
        // Sans-serif Bold: U+1D5D4–U+1D607
        // Sans-serif Italic: U+1D608–U+1D63B
        // Sans-serif Bold Italic: U+1D63C–U+1D66F
        // Monospace: U+1D670–U+1D6A3
        
        if (codePoint >= 0x1D400 && codePoint <= 0x1D419) {
          // Bold A-Z
          result += String.fromCharCode(65 + (codePoint - 0x1D400))
          i++
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
        }
      }
    }
    
    // For regular characters, just add them as-is
    result += char
  }
  
  return result.toLowerCase()
}

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

    // Apply search query filter with Unicode normalization
    if (searchQuery.trim()) {
      const searchTerm = searchQuery.trim()
      const normalizedSearchTerm = normalizeUnicode(searchTerm)
      
      // Include both original and normalized search terms
      if (normalizedSearchTerm !== searchTerm) {
        query = query.or(`display_name.ilike.%${searchTerm}%,display_name.ilike.%${normalizedSearchTerm}%,bio.ilike.%${searchTerm}%,bio.ilike.%${normalizedSearchTerm}%,business_category.ilike.%${searchTerm}%,business_location.ilike.%${searchTerm}%`)
      } else {
        query = query.or(`display_name.ilike.%${searchTerm}%,bio.ilike.%${searchTerm}%,business_category.ilike.%${searchTerm}%,business_location.ilike.%${searchTerm}%`)
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
