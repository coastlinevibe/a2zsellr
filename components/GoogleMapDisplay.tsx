'use client'

import { useState, useEffect, useRef } from 'react'
import { MapPin, ExternalLink, Navigation, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { 
  loadGoogleMapsScript, 
  isGoogleMapsAvailable,
  getGoogleMapsApiKey,
  getDirectionsUrl,
  type Coordinates 
} from '@/lib/googleMapsUtils'

// Import types
import '@/types/google-maps'

interface GoogleMapDisplayProps {
  coordinates: Coordinates
  address?: string
  businessName?: string
  height?: string
  showDirectionsButton?: boolean
  className?: string
}

export default function GoogleMapDisplay({
  coordinates,
  address,
  businessName = 'Business Location',
  height = '300px',
  showDirectionsButton = true,
  className = ''
}: GoogleMapDisplayProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initMap = async () => {
      try {
        setLoading(true)
        setError(null)

        const apiKey = getGoogleMapsApiKey()
        if (!apiKey) {
          setError('Google Maps not configured')
          setLoading(false)
          return
        }

        await loadGoogleMapsScript(apiKey)

        if (!mapRef.current || !isGoogleMapsAvailable()) {
          setError('Failed to load map')
          setLoading(false)
          return
        }

        // Create map
        const map = new (window as any).google.maps.Map(mapRef.current, {
          center: coordinates,
          zoom: 15,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          zoomControl: true,
          gestureHandling: 'cooperative',
        })

        // Create marker
        new (window as any).google.maps.Marker({
          position: coordinates,
          map: map,
          title: businessName,
          animation: (window as any).google.maps.Animation.DROP,
        })

        // Add info window if address is provided
        if (address) {
          const infoWindow = new (window as any).google.maps.InfoWindow({
            content: `
              <div style="padding: 8px; max-width: 200px;">
                <h3 style="font-weight: 600; margin-bottom: 4px;">${businessName}</h3>
                <p style="font-size: 12px; color: #666;">${address}</p>
              </div>
            `
          })

          const marker = new (window as any).google.maps.Marker({
            position: coordinates,
            map: map,
            title: businessName,
          })

          marker.addListener('click', () => {
            infoWindow.open(map, marker)
          })
        }

        setLoading(false)
      } catch (err) {
        console.error('Error initializing map:', err)
        setError('Failed to load map')
        setLoading(false)
      }
    }

    initMap()
  }, [coordinates, businessName, address])

  const handleGetDirections = () => {
    const url = getDirectionsUrl(coordinates, address)
    window.open(url, '_blank')
  }

  if (error) {
    return (
      <div className={`rounded-lg border border-gray-200 bg-gray-50 p-6 ${className}`}>
        <div className="flex items-center gap-3 text-gray-600">
          <MapPin className="w-5 h-5" />
          <div>
            <p className="font-medium">Map unavailable</p>
            {address && <p className="text-sm text-gray-500 mt-1">{address}</p>}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Map Container */}
      <div className="relative rounded-lg overflow-hidden border border-gray-300 shadow-sm">
        {loading && (
          <div 
            className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10"
            style={{ height }}
          >
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        )}
        <div 
          ref={mapRef} 
          style={{ height, width: '100%' }}
          className="bg-gray-100"
        />
      </div>

      {/* Address and Directions */}
      {(address || showDirectionsButton) && (
        <div className="flex items-start justify-between gap-3">
          {address && (
            <div className="flex items-start gap-2 flex-1">
              <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-700">{address}</p>
            </div>
          )}
          {showDirectionsButton && (
            <Button
              onClick={handleGetDirections}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 flex-shrink-0"
            >
              <Navigation className="w-4 h-4" />
              Get Directions
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
