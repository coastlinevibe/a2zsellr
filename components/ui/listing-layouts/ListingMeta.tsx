'use client'

import { Star, Truck } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ListingMetaProps {
  ratingAverage?: number | null
  ratingCount?: number
  deliveryAvailable?: boolean
  className?: string
}

export function ListingMeta({
  ratingAverage,
  ratingCount,
  deliveryAvailable,
  className
}: ListingMetaProps) {
  const hasRatings = typeof ratingAverage === 'number' && ratingCount !== undefined && ratingCount > 0
  const clampedRating = hasRatings ? Math.min(Math.max(ratingAverage ?? 0, 0), 5) : 0
  const roundedRating = Math.round(clampedRating)

  if (!hasRatings && !deliveryAvailable) {
    return null
  }

  return (
    <div className={cn('flex flex-wrap items-center gap-3 text-sm', className)}>
      {hasRatings ? (
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={index}
                className={cn(
                  'h-4 w-4',
                  index < roundedRating ? 'text-amber-400 fill-current' : 'text-gray-300'
                )}
              />
            ))}
          </div>
          <span className="font-semibold text-gray-900">
            {clampedRating.toFixed(1)}
          </span>
          <span className="text-gray-500">
            ({ratingCount} {ratingCount === 1 ? 'review' : 'reviews'})
          </span>
        </div>
      ) : (
        <span className="text-gray-500">No ratings yet</span>
      )}

      {deliveryAvailable && (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
          <Truck className="h-3 w-3" />
          Delivery available
        </span>
      )}
    </div>
  )
}
