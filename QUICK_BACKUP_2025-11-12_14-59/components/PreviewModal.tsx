'use client'

import { X, Eye, MapPin, Phone, Globe, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PreviewModalProps {
  isOpen: boolean
  onClose: () => void
  business?: {
    name: string
    category: string
    location: string
    description?: string
    phone?: string
    website?: string
    rating?: number
    images?: string[]
  }
}

export function PreviewModal({ isOpen, onClose, business }: PreviewModalProps) {
  if (!isOpen || !business) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Business Preview
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Business Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{business.name}</h2>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                {business.category}
              </span>
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {business.location}
              </div>
              {business.rating && (
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500" fill="currentColor" />
                  {business.rating}
                </div>
              )}
            </div>
          </div>

          {/* Images Gallery */}
          {business.images && business.images.length > 0 && (
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">Gallery</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {business.images.slice(0, 6).map((image, index) => (
                  <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={image}
                      alt={`${business.name} - Image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {business.description && (
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-2">About</h4>
              <p className="text-gray-600 leading-relaxed">{business.description}</p>
            </div>
          )}

          {/* Contact Information */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-3">Contact Information</h4>
            <div className="space-y-2">
              {business.phone && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{business.phone}</span>
                </div>
              )}
              {business.website && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Globe className="w-4 h-4" />
                  <a 
                    href={business.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-emerald-600 hover:text-emerald-700"
                  >
                    {business.website}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700">
              Contact Business
            </Button>
            <Button variant="outline" className="flex-1">
              Get Directions
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
