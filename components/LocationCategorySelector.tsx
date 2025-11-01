'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { MapPin, Tag } from 'lucide-react'

interface Location {
  id: number
  city: string
  slug: string
  province?: string
}

interface Category {
  id: number
  name: string
  slug: string
  description?: string
  icon?: string
}

interface LocationCategorySelectorProps {
  selectedLocation?: string
  selectedCategory?: string
  onLocationChange: (location: string) => void
  onCategoryChange: (category: string) => void
  className?: string
  showLabels?: boolean
}

export function LocationCategorySelector({
  selectedLocation = 'all',
  selectedCategory = 'all',
  onLocationChange,
  onCategoryChange,
  className = '',
  showLabels = true
}: LocationCategorySelectorProps) {
  const [locations, setLocations] = useState<Location[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch locations
      const { data: locationsData, error: locError } = await supabase
        .from('locations')
        .select('id, city, slug, province')
        .eq('is_active', true)
        .order('city')

      if (locError) {
        console.error('Error fetching locations:', locError)
      } else {
        setLocations(locationsData || [])
      }

      // Fetch categories
      const { data: categoriesData, error: catError } = await supabase
        .from('categories')
        .select('id, name, slug, description, icon')
        .eq('is_active', true)
        .order('name')

      if (catError) {
        console.error('Error fetching categories:', catError)
      } else {
        setCategories(categoriesData || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${className}`}>
      {/* Location Selector */}
      <div>
        {showLabels && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
        )}
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <select
            value={selectedLocation}
            onChange={(e) => onLocationChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none appearance-none bg-white"
          >
            {locations.map((location) => (
              <option key={location.id} value={location.slug}>
                {location.city}
                {location.province && location.slug !== 'all' && ` (${location.province})`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Category Selector */}
      <div>
        {showLabels && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
        )}
        <div className="relative">
          <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none appearance-none bg-white"
          >
            {categories.map((category) => (
              <option key={category.id} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}

// Hook for using locations and categories data
export function useLocationsAndCategories() {
  const [locations, setLocations] = useState<Location[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      const [locationsResponse, categoriesResponse] = await Promise.all([
        supabase
          .from('locations')
          .select('id, city, slug, province')
          .eq('is_active', true)
          .order('city'),
        supabase
          .from('categories')
          .select('id, name, slug, description, icon')
          .eq('is_active', true)
          .order('name')
      ])

      if (locationsResponse.error) {
        console.error('Error fetching locations:', locationsResponse.error)
      } else {
        setLocations(locationsResponse.data || [])
      }

      if (categoriesResponse.error) {
        console.error('Error fetching categories:', categoriesResponse.error)
      } else {
        setCategories(categoriesResponse.data || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  return { locations, categories, loading, refetch: fetchData }
}
