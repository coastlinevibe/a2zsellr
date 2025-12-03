'use client'

import React, { useState } from 'react'
import { Image, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { ListingMeta } from './ListingMeta'

interface MediaItem {
  id: string
  name: string
  url: string
  type: string
  price?: number
}

interface GalleryMosaicLayoutProps {
  items: MediaItem[]
  title: string
  message: string
  ctaLabel: string
  ctaUrl: string
  businessName: string
  ratingAverage?: number | null
  ratingCount?: number
  deliveryAvailable?: boolean
}

export const GalleryMosaicLayout: React.FC<GalleryMosaicLayoutProps> = ({
  items,
  title,
  message,
  ctaLabel,
  ctaUrl,
  businessName,
  ratingAverage,
  ratingCount,
  deliveryAvailable
}) => {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index)
    setLightboxOpen(true)
  }

  const closeLightbox = () => {
    setLightboxOpen(false)
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % items.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + items.length) % items.length)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') closeLightbox()
    if (e.key === 'ArrowRight') nextImage()
    if (e.key === 'ArrowLeft') prevImage()
  }

  return (
    <div className="bg-white rounded-[9px] shadow-sm border border-gray-200 w-full max-w-md md:max-w-2xl lg:max-w-5xl mx-auto overflow-hidden">
      {/* Header */}
      <div className="bg-green-50 border-b border-green-200 p-4 md:p-6 lg:p-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-lg md:text-xl lg:text-2xl">
            {businessName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-semibold text-gray-900 text-base md:text-lg lg:text-xl">{businessName}</div>
            <div className="text-xs md:text-sm text-gray-500">Broadcast • gallery</div>
          </div>
        </div>
        
        <div className="mb-4">
          <ListingMeta
            ratingAverage={ratingAverage}
            ratingCount={ratingCount}
            deliveryAvailable={deliveryAvailable}
            className="mb-2"
          />
          <h3 className="font-bold text-gray-900 mb-2 text-lg md:text-xl lg:text-2xl">{title}</h3>
          <div 
            className="text-gray-700 text-sm md:text-base lg:text-lg leading-relaxed"
            dangerouslySetInnerHTML={{ __html: message }}
          />
        </div>

        {/* Mosaic Gallery Grid */}
        <div className="bg-green-50 rounded-[9px] p-3 mb-4">
          {items.length > 0 ? (
            <div className="grid gap-2" style={{
              gridTemplateColumns: items.length === 1 ? '1fr' : 
                                 items.length === 2 ? 'repeat(2, 1fr)' :
                                 items.length === 3 ? 'repeat(2, 1fr)' :
                                 'repeat(2, 1fr)'
            }}>
              {items.map((item, index) => (
                <div 
                  key={item.id}
                  onClick={() => item.url && openLightbox(index)}
                  className={`relative bg-white rounded-lg overflow-hidden group cursor-pointer transition-transform hover:scale-105 ${
                    items.length === 3 && index === 0 ? 'row-span-2' : ''
                  }`}
                  style={{ 
                    aspectRatio: items.length === 1 ? '16/10' : 
                               items.length === 3 && index === 0 ? '1/1' : 
                               '4/3' 
                  }}
                >
                  {item.url ? (
                    <img 
                      src={item.url} 
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-green-200 flex items-center justify-center">
                      <Image className="w-8 h-8 text-green-600" />
                    </div>
                  )}
                  
                  {/* Price overlay */}
                  {item.price && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2 pointer-events-none">
                      <div className="text-white">
                        <div className="font-medium text-xs truncate">{item.name}</div>
                        <div className="text-sm font-bold text-emerald-400">
                          R{item.price.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Hover overlay with zoom indicator */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                    <div className="bg-white/90 rounded-full p-2">
                      <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Show more indicator if there are many items */}
              {items.length > 4 && (
                <div className="relative bg-emerald-700/90 rounded-lg overflow-hidden flex items-center justify-center text-white font-bold text-lg" style={{ aspectRatio: '4/3' }}>
                  +{items.length - 3} more
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 bg-white rounded-lg border-2 border-dashed border-green-300">
              <div className="text-center">
                <Image className="w-12 h-12 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-green-700">No media selected</p>
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

      {/* Lightbox Modal */}
      {lightboxOpen && items[currentImageIndex] && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={closeLightbox}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-60 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {/* Navigation buttons */}
          {items.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  prevImage()
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-60 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  nextImage()
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-60 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            </>
          )}

          {/* Main image */}
          <div 
            className="relative max-w-full max-h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={items[currentImageIndex].url}
              alt={items[currentImageIndex].name}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
            
            {/* Image info overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 rounded-b-lg">
              <div className="text-white">
                <h3 className="font-semibold text-lg">{items[currentImageIndex].name}</h3>
                {items[currentImageIndex].price && (
                  <p className="text-emerald-400 font-bold text-xl">
                    R{items[currentImageIndex].price.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                  </p>
                )}
                <p className="text-sm text-gray-300 mt-1">
                  {currentImageIndex + 1} of {items.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
