'use client'

import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Image, Dot, X } from 'lucide-react'
import { ListingMeta } from './ListingMeta'

interface MediaItem {
  id: string
  name: string
  url: string
  type: string
  price?: number
}

interface HorizontalSliderLayoutProps {
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

export const HorizontalSliderLayout: React.FC<HorizontalSliderLayoutProps> = ({
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
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index)
    setLightboxOpen(true)
    setIsAutoPlaying(false) // Stop auto-play when lightbox opens
  }

  const closeLightbox = () => {
    setLightboxOpen(false)
    setIsAutoPlaying(true) // Resume auto-play when lightbox closes
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

  // Auto-advance slides
  useEffect(() => {
    if (!isAutoPlaying || items.length <= 1) return

    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % items.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [isAutoPlaying, items.length])

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % items.length)
    setIsAutoPlaying(false)
  }

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + items.length) % items.length)
    setIsAutoPlaying(false)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
    setIsAutoPlaying(false)
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
            <div className="font-semibold text-emerald-900 text-base md:text-lg lg:text-xl">{businessName}</div>
            <div className="text-xs md:text-sm text-emerald-700">Broadcast • horizontal slider</div>
          </div>
        </div>
        
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

        {/* Horizontal Slider */}
        <div className="bg-green-50 rounded-[9px] p-3 mb-4">
          <div className="text-xs text-green-700 mb-2 flex items-center justify-between">
            <span>Horizontal Slider</span>
            {isAutoPlaying && (
              <span className="text-emerald-600 flex items-center gap-1">
                <Dot className="w-3 h-3 animate-pulse" />
                Auto-play
              </span>
            )}
          </div>
          
          {items.length > 0 ? (
            <div className="relative">
              {/* Main Slider */}
              <div className="relative bg-white rounded-[8px] overflow-hidden">
                <div 
                  className="relative h-64 md:h-96 lg:h-[500px] cursor-pointer group"
                  onClick={() => items[currentSlide]?.url && openLightbox(currentSlide)}
                >
                  {items[currentSlide]?.url ? (
                    <img 
                      src={items[currentSlide].url} 
                      alt={items[currentSlide].name}
                      className="w-full h-full object-cover transition-opacity duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-green-200 flex items-center justify-center">
                      <Image className="w-8 h-8 text-green-600" />
                    </div>
                  )}
                  
                  {/* Hover overlay with zoom indicator */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                    <div className="bg-white/90 rounded-full p-2">
                      <svg className="w-6 h-6 text-emerald-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                    </div>
                  </div>

                  {/* Navigation Arrows */}
                  {items.length > 1 && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          prevSlide()
                        }}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-1 rounded-full transition-all duration-200 z-10"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          nextSlide()
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-1 rounded-full transition-all duration-200 z-10"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </>
                  )}

                  {/* Slide Counter */}
                  <div className="absolute top-2 right-2">
                    <span className="bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs">
                      {currentSlide + 1} / {items.length}
                    </span>
                  </div>

                  {/* Auto-play Indicator */}
                  {isAutoPlaying && (
                    <div className="absolute top-2 left-2">
                      <div className="bg-emerald-600 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        LIVE
                      </div>
                    </div>
                  )}
                </div>

                {/* Slide Info */}
                <div className="p-3">
                  <div className="text-sm font-medium text-emerald-900 truncate">
                    {items[currentSlide]?.name}
                  </div>
                  {items[currentSlide]?.price && (
                    <div className="text-sm text-emerald-600 font-medium">
                      R{items[currentSlide].price.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                    </div>
                  )}
                </div>
              </div>

              {/* Slide Indicators */}
              {items.length > 1 && (
                <div className="flex justify-center gap-1 mt-3">
                  {items.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-200 ${
                        currentSlide === index 
                          ? 'bg-emerald-600 w-6' 
                          : 'bg-emerald-300 hover:bg-emerald-400'
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Thumbnail Strip */}
              {items.length > 1 && (
                <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                  {items.map((item, index) => (
                    <button
                      key={item.id}
                      onClick={() => goToSlide(index)}
                      className={`flex-shrink-0 w-12 h-8 rounded-[4px] overflow-hidden transition-all duration-200 ${
                        currentSlide === index 
                          ? 'ring-2 ring-orange-400 scale-110' 
                          : 'opacity-60 hover:opacity-80'
                      }`}
                    >
                      {item.url ? (
                        <img 
                          src={item.url} 
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-green-200 flex items-center justify-center">
                          <Image className="w-3 h-3 text-green-600" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 bg-white rounded-[6px] border-2 border-dashed border-green-300">
              <div className="text-center">
                <ChevronRight className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-green-700">Add media for slider</p>
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
                <p className="text-sm text-green-300 mt-1">
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
