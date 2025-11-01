'use client'

import { useState } from 'react'
import { Grid, List, Eye, Edit, Trash2, Share2, MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface Listing {
  id: string
  title: string
  category: string
  price?: number
  image?: string
  status: 'active' | 'inactive' | 'pending'
  views: number
  createdAt: string
}

interface ListingCardGridProps {
  listings?: Listing[]
  viewMode?: 'grid' | 'list'
  onViewModeChange?: (mode: 'grid' | 'list') => void
  onEdit?: (listing: Listing) => void
  onDelete?: (listing: Listing) => void
  onShare?: (listing: Listing) => void
  onView?: (listing: Listing) => void
}

export function ListingCardGrid({
  listings = [],
  viewMode = 'grid',
  onViewModeChange,
  onEdit,
  onDelete,
  onShare,
  onView
}: ListingCardGridProps) {
  const [selectedListing, setSelectedListing] = useState<string | null>(null)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700'
      case 'inactive':
        return 'bg-gray-100 text-gray-700'
      case 'pending':
        return 'bg-yellow-100 text-yellow-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const formatPrice = (price?: number) => {
    if (!price) return 'Free'
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
    }).format(price)
  }

  if (listings.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Grid className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No listings yet</h3>
        <p className="text-gray-600 mb-4">Create your first listing to get started</p>
        <Button className="bg-emerald-600 hover:bg-emerald-700">
          Create Listing
        </Button>
      </div>
    )
  }

  return (
    <div>
      {/* View Mode Toggle */}
      {onViewModeChange && (
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Your Listings ({listings.length})
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-emerald-100 text-emerald-600'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-emerald-100 text-emerald-600'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <div key={listing.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              {/* Image */}
              <div className="aspect-video bg-gray-100 relative">
                {listing.image ? (
                  <img
                    src={listing.image}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-gray-400">No image</div>
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(listing.status)}`}>
                    {listing.status}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h4 className="font-medium text-gray-900 mb-1 line-clamp-1">{listing.title}</h4>
                <p className="text-sm text-gray-600 mb-2">{listing.category}</p>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-emerald-600">{formatPrice(listing.price)}</span>
                  <span className="text-sm text-gray-500">{listing.views} views</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {onView && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onView(listing)}
                      className="flex-1"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </Button>
                  )}
                  {onEdit && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEdit(listing)}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                  )}
                  {onShare && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onShare(listing)}
                    >
                      <Share2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {listings.map((listing) => (
            <div key={listing.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center gap-4">
                {/* Image */}
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                  {listing.image ? (
                    <img
                      src={listing.image}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-gray-400 text-xs">No image</div>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">{listing.title}</h4>
                      <p className="text-sm text-gray-600">{listing.category}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-emerald-600 mb-1">{formatPrice(listing.price)}</div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(listing.status)}`}>
                        {listing.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {onView && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onView(listing)}
                    >
                      <Eye className="w-3 h-3" />
                    </Button>
                  )}
                  {onEdit && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEdit(listing)}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                  )}
                  {onShare && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onShare(listing)}
                    >
                      <Share2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
