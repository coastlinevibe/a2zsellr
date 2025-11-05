'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { MapPin, Search, Loader2, Navigation } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { 
  loadGoogleMapsScript, 
  isGoogleMapsAvailable,
  getGoogleMapsApiKey,
  getCurrentLocation,
  DEFAULT_COORDINATES,
  type Coordinates 
} from '@/lib/googleMapsUtils'

interface GoogleMapPickerProps {
  initialCoordinates?: Coordinates
  initialAddress?: string
  onLocationSelect: (coordinates: Coordinates, address: string) => void
  height?: string
  className?: string
}

export default function GoogleMapPicker({
  initialCoordinates = DEFAULT_COORDINATES,
  initialAddress = '',
  onLocationSelect,
  height = '400px',
  className = ''
}: GoogleMapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const markerRef = useRef<google.maps.Marker | null>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchValue, setSearchValue] = useState(initialAddress)
  const [currentCoordinates, setCurrentCoordinates] = useState<Coordinates>(initialCoordinates)
  const [loadingLocation, setLoadingLocation] = useState(false)

  // Initialize Google Maps
  useEffect(() => {
    const initMap = async () => {
      try {
        setLoading(true)
        setError(null)

        const apiKey = getGoogleMapsApiKey()
        if (!apiKey) {
          setError('Google Maps API key not configured. Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env file.')
          setLoading(false)
          return
        }

        // Load Google Maps script
        await loadGoogleMapsScript(apiKey)

        if (!mapRef.current || !isGoogleMapsAvailable()) {
          setError('Failed to load Google Maps')
          setLoading(false)
          return
        }

        // Create map
        const map = new google.maps.Map(mapRef.current, {
          center: initialCoordinates,
          zoom: 15,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
          zoomControl: true,
        })

        mapInstanceRef.current = map

        // Create marker
        const marker = new google.maps.Marker({
          position: initialCoordinates,
          map: map,
          draggable: true,
          title: 'Your Business Location',
          animation: google.maps.Animation.DROP,
        })

        markerRef.current = marker

        // Handle marker drag
        marker.addListener('dragend', async () => {
          const position = marker.getPosition()
          if (position) {
            const coords = {
              lat: position.lat(),
              lng: position.lng()
            }
            setCurrentCoordinates(coords)
            await updateAddress(coords)
          }
        })

        // Handle map click
        map.addListener('click', async (e: google.maps.MapMouseEvent) => {
          if (e.latLng) {
            const coords = {
              lat: e.latLng.lat(),
              lng: e.latLng.lng()
            }
            marker.setPosition(e.latLng)
            setCurrentCoordinates(coords)
            await updateAddress(coords)
          }
        })

        // Setup autocomplete
        if (searchInputRef.current) {
          const autocomplete = new google.maps.places.Autocomplete(searchInputRef.current, {
            componentRestrictions: { country: 'za' }, // Restrict to South Africa
            fields: ['formatted_address', 'geometry', 'name']
          })

          autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace()
            
            if (place.geometry && place.geometry.location) {
              const coords = {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng()
              }
              
              map.setCenter(coords)
              marker.setPosition(coords)
              setCurrentCoordinates(coords)
              setSearchValue(place.formatted_address || place.name || '')
              
              onLocationSelect(coords, place.formatted_address || place.name || '')
            }
          })

          autocompleteRef.current = autocomplete
        }

        setLoading(false)
      } catch (err) {
        console.error('Error initializing map:', err)
        setError('Failed to initialize Google Maps. Please check your API key and internet connection.')
        setLoading(false)
      }
    }

    initMap()
  }, []) // Only run once on mount

  // Update address from coordinates
  const updateAddress = async (coords: Coordinates) => {
    if (!isGoogleMapsAvailable()) return

    try {
      const geocoder = new google.maps.Geocoder()
      const result = await geocoder.geocode({ location: coords })
      
      if (result.results && result.results.length > 0) {
        const address = result.results[0].formatted_address
        setSearchValue(address)
        onLocationSelect(coords, address)
      }
    } catch (err) {
      console.error('Error geocoding:', err)
    }
  }

  // Get current location
  const handleGetCurrentLocation = async () => {
    try {
      setLoadingLocation(true)
      const coords = await getCurrentLocation()
      
      if (mapInstanceRef.current && markerRef.current) {
        mapInstanceRef.current.setCenter(coords)
        markerRef.current.setPosition(coords)
        setCurrentCoordinates(coords)
        await updateAddress(coords)
      }
    } catch (err) {
      console.error('Error getting location:', err)
      alert('Unable to get your current location. Please ensure location permissions are enabled.')
    } finally {
      setLoadingLocation(false)
    }
  }

  if (error) {
    return (
      <div className={`rounded-lg border border-red-200 bg-red-50 p-6 ${className}`}>
        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 text-red-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900 mb-1">Map Error</h3>
            <p className="text-sm text-red-700">{error}</p>
            <p className="text-xs text-red-600 mt-2">
              To enable maps, add your Google Maps API key to the .env file.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search for your business address..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <Button
          onClick={handleGetCurrentLocation}
          disabled={loadingLocation}
          variant="outline"
          className="flex items-center gap-2"
        >
          {loadingLocation ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Navigation className="w-4 h-4" />
          )}
          <span className="hidden sm:inline">Current Location</span>
        </Button>
      </div>

      {/* Map Container */}
      <div className="relative rounded-lg overflow-hidden border border-gray-300 shadow-sm">
        {loading && (
          <div 
            className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10"
            style={{ height }}
          >
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Loading map...</p>
            </div>
          </div>
        )}
        <div 
          ref={mapRef} 
          style={{ height, width: '100%' }}
          className="bg-gray-100"
        />
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-blue-800">
            <p className="font-medium mb-1">How to set your location:</p>
            <ul className="space-y-0.5 list-disc list-inside">
              <li>Search for your address in the search bar</li>
              <li>Click on the map to place a marker</li>
              <li>Drag the marker to fine-tune your location</li>
              <li>Use "Current Location" to auto-detect your position</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Coordinates Display */}
      <div className="text-xs text-gray-500 text-center">
        Selected: {currentCoordinates.lat.toFixed(6)}, {currentCoordinates.lng.toFixed(6)}
      </div>
    </div>
  )
}
