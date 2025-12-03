/**
 * Google Maps Utilities
 * Helpers for working with Google Maps API
 */

export interface Coordinates {
  lat: number
  lng: number
}

export interface PlaceResult {
  address: string
  coordinates: Coordinates
  placeId?: string
  formattedAddress?: string
}

/**
 * Get Google Maps API key from environment
 */
export const getGoogleMapsApiKey = (): string => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  if (!apiKey) {
    console.warn('Google Maps API key not found in environment variables')
  }
  return apiKey || ''
}

/**
 * Check if Google Maps API is available
 */
export const isGoogleMapsAvailable = (): boolean => {
  return typeof window !== 'undefined' && 
         typeof (window as any).google !== 'undefined' && 
         typeof (window as any).google.maps !== 'undefined'
}

/**
 * Load Google Maps script dynamically
 */
export const loadGoogleMapsScript = (apiKey: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (isGoogleMapsAvailable()) {
      resolve()
      return
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve())
      existingScript.addEventListener('error', () => reject(new Error('Failed to load Google Maps')))
      return
    }

    // Create and load script
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
    script.async = true
    script.defer = true
    
    script.addEventListener('load', () => resolve())
    script.addEventListener('error', () => reject(new Error('Failed to load Google Maps')))
    
    document.head.appendChild(script)
  })
}

/**
 * Geocode an address to coordinates
 */
export const geocodeAddress = async (address: string): Promise<Coordinates | null> => {
  if (!isGoogleMapsAvailable()) {
    console.error('Google Maps not available')
    return null
  }

  const geocoder = new (window as any).google.maps.Geocoder()
  
  try {
    const result = await geocoder.geocode({ address })
    
    if (result.results && result.results.length > 0) {
      const location = result.results[0].geometry.location
      return {
        lat: location.lat(),
        lng: location.lng()
      }
    }
    
    return null
  } catch (error) {
    console.error('Geocoding error:', error)
    return null
  }
}

/**
 * Reverse geocode coordinates to address
 */
export const reverseGeocode = async (coordinates: Coordinates): Promise<string | null> => {
  if (!isGoogleMapsAvailable()) {
    console.error('Google Maps not available')
    return null
  }

  const geocoder = new (window as any).google.maps.Geocoder()
  
  try {
    const result = await geocoder.geocode({ location: coordinates })
    
    if (result.results && result.results.length > 0) {
      return result.results[0].formatted_address
    }
    
    return null
  } catch (error) {
    console.error('Reverse geocoding error:', error)
    return null
  }
}

/**
 * Get directions URL for Google Maps
 */
export const getDirectionsUrl = (coordinates: Coordinates, address?: string): string => {
  const destination = address 
    ? encodeURIComponent(address)
    : `${coordinates.lat},${coordinates.lng}`
  
  return `https://www.google.com/maps/dir/?api=1&destination=${destination}`
}

/**
 * Get static map image URL
 */
export const getStaticMapUrl = (
  coordinates: Coordinates, 
  options: {
    width?: number
    height?: number
    zoom?: number
    markerColor?: string
  } = {}
): string => {
  const {
    width = 600,
    height = 400,
    zoom = 15,
    markerColor = 'red'
  } = options

  const apiKey = getGoogleMapsApiKey()
  const { lat, lng } = coordinates

  return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=${width}x${height}&markers=color:${markerColor}%7C${lat},${lng}&key=${apiKey}`
}

/**
 * Calculate distance between two coordinates (in kilometers)
 */
export const calculateDistance = (coord1: Coordinates, coord2: Coordinates): number => {
  const R = 6371 // Earth's radius in kilometers
  const dLat = toRad(coord2.lat - coord1.lat)
  const dLng = toRad(coord2.lng - coord1.lng)
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(coord1.lat)) * Math.cos(toRad(coord2.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c
  
  return Math.round(distance * 10) / 10 // Round to 1 decimal
}

const toRad = (degrees: number): number => {
  return degrees * (Math.PI / 180)
}

/**
 * Format distance for display
 */
export const formatDistance = (kilometers: number): string => {
  if (kilometers < 1) {
    return `${Math.round(kilometers * 1000)}m`
  }
  return `${kilometers}km`
}

/**
 * Get user's current location
 */
export const getCurrentLocation = (): Promise<Coordinates> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        })
      },
      (error) => {
        reject(error)
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    )
  })
}

/**
 * Default coordinates (South Africa - Johannesburg)
 */
export const DEFAULT_COORDINATES: Coordinates = {
  lat: -26.2041,
  lng: 28.0473
}
