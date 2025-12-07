'use client'

import React, { useState } from 'react'
import { Image, Eye, GripVertical } from 'lucide-react'
import { ListingMeta } from './ListingMeta'

interface MediaItem {
  id: string
  name: string
  url: string
  type: string
  price?: number
}

interface BeforeAfterLayoutProps {
  items: MediaItem[]
  title: string
  message: string
  ctaLabel: string
  ctaUrl: string
  businessName: string
  businessCategory?: string | null
  avatarUrl?: string | null
  bannerImages?: Array<{ id: string; image_url: string; caption?: string }>
  ratingAverage?: number | null
  ratingCount?: number
  deliveryAvailable?: boolean
}

export const BeforeAfterLayout: React.FC<BeforeAfterLayoutProps> = ({
  items,
  title,
  message,
  ctaLabel,
  ctaUrl,
  businessName,
  businessCategory,
  avatarUrl,
  bannerImages,
  ratingAverage,
  ratingCount,
  deliveryAvailable
}) => {
  const [sliderPosition, setSliderPosition] = useState(50)
  const [isDragging, setIsDragging] = useState(false)

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return

    const container = e.currentTarget as HTMLElement
    const rect = container.getBoundingClientRect()
    let x = 0

    if ('touches' in e && e.touches.length > 0) {
      x = e.touches[0].clientX - rect.left
    } else if ('clientX' in e) {
      x = e.clientX - rect.left
    }

    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100))
    setSliderPosition(percentage)
  }

  return (
    <div className="bg-white rounded-[9px] shadow-sm border border-gray-200 w-full max-w-md md:max-w-2xl lg:max-w-5xl mx-auto overflow-hidden">
      {/* Header */}
      <div className="bg-green-50 border-b border-green-200 p-4 md:p-6 lg:p-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-full flex items-center justify-center text-white font-bold text-lg md:text-xl lg:text-2xl overflow-hidden border-2 border-emerald-500 bg-emerald-600">
            {avatarUrl ? (
              <img src={avatarUrl} alt={businessName} className="w-full h-full object-cover" />
            ) : (
              businessName.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <div className="font-semibold text-gray-900 text-base md:text-lg lg:text-xl">{businessName}</div>
            <div className="text-xs md:text-sm text-gray-500">{businessCategory || 'Business'}</div>
          </div>
        </div>
        
        {/* Banner Images */}
        {bannerImages && bannerImages.length > 0 && (
          <div className="mb-4 rounded-[9px] overflow-hidden">
            <img 
              src={bannerImages[0].image_url} 
              alt="Business Banner" 
              className="w-full h-48 md:h-64 object-cover"
            />
          </div>
        )}
        
        <div className="mb-4">
          <ListingMeta
            ratingAverage={ratingAverage}
            ratingCount={ratingCount}
            deliveryAvailable={deliveryAvailable}
            className="mb-2"
          />
          <h3 className="font-bold text-emerald-900 mb-2 text-lg md:text-xl lg:text-2xl">{title}</h3>
          <div 
            className="text-emerald-700 text-sm md:text-base lg:text-lg leading-relaxed"
            dangerouslySetInnerHTML={{ __html: message }}
          />
        </div>

        {/* Interactive Before & After Slider */}
        <div className="bg-emerald-50 rounded-[9px] p-3 mb-4">
          <div className="text-xs text-emerald-700 mb-2">Drag to Compare</div>
          {items.length >= 2 ? (
            <div
              className="relative aspect-video w-full overflow-hidden rounded-lg select-none cursor-ew-resize"
              onMouseMove={handleMove}
              onMouseUp={() => setIsDragging(false)}
              onMouseLeave={() => setIsDragging(false)}
              onTouchMove={handleMove}
              onTouchEnd={() => setIsDragging(false)}
            >
              {/* Slider Line */}
              <div
                className="absolute z-20 top-0 h-full w-1 bg-white shadow-lg"
                style={{ left: `${sliderPosition}%`, marginLeft: '-2px' }}
              >
                {/* Slider Handle */}
                <button
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full w-10 h-10 md:w-12 md:h-12 shadow-xl hover:scale-110 transition-transform flex items-center justify-center cursor-ew-resize z-30"
                  onTouchStart={(e) => {
                    setIsDragging(true)
                    handleMove(e)
                  }}
                  onMouseDown={(e) => {
                    setIsDragging(true)
                    handleMove(e)
                  }}
                  onTouchEnd={() => setIsDragging(false)}
                  onMouseUp={() => setIsDragging(false)}
                >
                  <GripVertical className="w-5 h-5 md:w-6 md:h-6 text-emerald-600" />
                </button>
              </div>

              {/* After Image (Top Layer) */}
              {items[1]?.url ? (
                <img
                  src={items[1].url}
                  alt={items[1].name}
                  className="absolute left-0 top-0 z-10 w-full h-full object-cover select-none"
                  style={{
                    clipPath: `inset(0 0 0 ${sliderPosition}%)`
                  }}
                  draggable={false}
                />
              ) : (
                <div className="absolute left-0 top-0 z-10 w-full h-full bg-emerald-300 flex items-center justify-center">
                  <Image className="w-12 h-12 text-emerald-700" />
                </div>
              )}

              {/* Before Image (Bottom Layer) */}
              {items[0]?.url ? (
                <img
                  src={items[0].url}
                  alt={items[0].name}
                  className="absolute left-0 top-0 w-full h-full object-cover select-none"
                  draggable={false}
                />
              ) : (
                <div className="w-full h-full bg-emerald-200 flex items-center justify-center">
                  <Image className="w-12 h-12 text-emerald-700" />
                </div>
              )}

              {/* Labels */}
              <div className="absolute top-3 left-3 z-10">
                <span className="px-3 py-1 rounded-full text-xs font-bold text-white bg-emerald-700 shadow-lg">
                  BEFORE
                </span>
              </div>
              <div className="absolute top-3 right-3 z-10">
                <span className="px-3 py-1 rounded-full text-xs font-bold text-white bg-emerald-600 shadow-lg">
                  AFTER
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 bg-white rounded-lg border-2 border-dashed border-emerald-300">
              <div className="text-center">
                <Eye className="w-12 h-12 text-emerald-600 mx-auto mb-2" />
                <p className="text-sm text-emerald-700">Add 2+ images for comparison</p>
              </div>
            </div>
          )}
        </div>

        {/* CTA Button */}
        <div className="flex items-center justify-center">
          <a 
            href={ctaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 md:px-8 md:py-3 lg:px-10 lg:py-4 rounded-[9px] font-medium text-sm md:text-base lg:text-lg transition-colors"
          >
            {ctaLabel}
          </a>
        </div>
        
        <div className="text-xs text-emerald-600 text-center mt-2 truncate">
          {ctaUrl}
        </div>
      </div>
    </div>
  )
}
