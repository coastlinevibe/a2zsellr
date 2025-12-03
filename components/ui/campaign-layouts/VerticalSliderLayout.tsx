'use client'

import React, { useState, useEffect } from 'react'
import { ChevronUp, ChevronDown, Image, MoreVertical } from 'lucide-react'
import { ListingMeta } from './ListingMeta'

interface MediaItem {
  id: string
  name: string
  url: string
  type: string
  price?: number
}

interface VerticalSliderLayoutProps {
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

export const VerticalSliderLayout: React.FC<VerticalSliderLayoutProps> = ({
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

  // Auto-advance slides
  useEffect(() => {
    if (!isAutoPlaying || items.length <= 1) return

    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % items.length)
    }, 4000) // Slightly slower for vertical

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
    <div className="bg-white rounded-[9px] shadow-sm border border-gray-200 w-full max-w-md md:max-w-2xl lg:max-w-4xl mx-auto overflow-hidden">
      {/* Header */}
      <div className="bg-green-50 border-b border-green-200 p-4 md:p-6 lg:p-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-lg md:text-xl lg:text-2xl">
            {businessName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-semibold text-emerald-900 text-base md:text-lg lg:text-xl">{businessName}</div>
            <div className="text-xs md:text-sm text-emerald-700">Broadcast • vertical slider</div>
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

        {/* Vertical Slider */}
        <div className="bg-green-50 rounded-[9px] p-3 mb-4">
          <div className="text-xs text-green-700 mb-2 flex items-center justify-between">
            <span>Vertical Story Layout</span>
            {isAutoPlaying && (
              <span className="text-emerald-600 flex items-center gap-1">
                <MoreVertical className="w-3 h-3 animate-bounce" />
                Stories
              </span>
            )}
          </div>
          
          {items.length > 0 ? (
            <div className="relative">
              {/* Main Story Container */}
              <div className="relative bg-white rounded-[12px] overflow-hidden mx-auto w-full md:w-auto" style={{ aspectRatio: '9/16', height: 'auto', maxHeight: '600px', minHeight: '400px' }}>
                {/* Story Content */}
                <div className="relative h-full">
                  {items[currentSlide]?.url ? (
                    <img 
                      src={items[currentSlide].url} 
                      alt={items[currentSlide].name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-b from-gray-200 to-gray-300 flex items-center justify-center">
                      <Image className="w-12 h-12 text-green-600" />
                    </div>
                  )}

                  {/* Story Progress Bars */}
                  <div className="absolute top-3 left-3 right-3 flex gap-1">
                    {items.map((_, index) => (
                      <div key={index} className="flex-1 h-1 bg-black bg-opacity-30 rounded-full overflow-hidden">
                        <div 
                          className={`h-full bg-white transition-all duration-300 ${
                            index < currentSlide ? 'w-full' : 
                            index === currentSlide ? 'w-1/2 animate-pulse' : 'w-0'
                          }`}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Navigation Arrows */}
                  {items.length > 1 && (
                    <>
                      <button
                        onClick={prevSlide}
                        className="absolute left-3 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all duration-200"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={nextSlide}
                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all duration-200"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </>
                  )}

                  {/* Story Info Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/70 to-transparent p-4">
                    <div className="text-white">
                      <div className="text-sm font-bold mb-1">
                        {items[currentSlide]?.name}
                      </div>
                      {items[currentSlide]?.price && (
                        <div className="text-lg font-bold text-yellow-400">
                          R{items[currentSlide].price.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Story Counter */}
                  <div className="absolute top-12 right-3">
                    <div className="bg-black bg-opacity-60 text-white px-2 py-1 rounded-full text-xs">
                      {currentSlide + 1}/{items.length}
                    </div>
                  </div>
                </div>
              </div>

              {/* Story Thumbnails Sidebar */}
              {items.length > 1 && (
                <div className="absolute right-[-25px] bottom-0 top-1/2 w-12 flex flex-col gap-2 justify-start pt-4">
                  {items.map((item, index) => (
                    <button
                      key={item.id}
                      onClick={() => goToSlide(index)}
                      className={`w-8 h-8 rounded-full overflow-hidden transition-all duration-200 ${
                        currentSlide === index 
                          ? 'ring-2 ring-indigo-400 scale-110' 
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
                          <Image className="w-2 h-2 text-green-600" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Vertical Dots Indicator */}
              <div className="absolute left-[-20px] top-1/2 -translate-y-1/2 flex flex-col gap-2">
                {items.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-200 ${
                      currentSlide === index 
                        ? 'bg-emerald-600 h-6' 
                        : 'bg-emerald-300 hover:bg-emerald-400'
                    }`}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-60 bg-white rounded-[12px] border-2 border-dashed border-green-300">
              <div className="text-center">
                <MoreVertical className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-green-700">Add media for stories</p>
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
