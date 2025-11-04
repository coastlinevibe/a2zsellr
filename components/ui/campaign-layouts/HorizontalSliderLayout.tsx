'use client'

import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Image, Dot } from 'lucide-react'

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
}

export const HorizontalSliderLayout: React.FC<HorizontalSliderLayoutProps> = ({
  items,
  title,
  message,
  ctaLabel,
  ctaUrl,
  businessName
}) => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

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
      <div className="bg-orange-50 border-b border-orange-200 p-4 md:p-6 lg:p-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold text-lg md:text-xl lg:text-2xl">
            {businessName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-semibold text-gray-900 text-base md:text-lg lg:text-xl">{businessName}</div>
            <div className="text-xs md:text-sm text-gray-500">Broadcast • horizontal slider</div>
          </div>
        </div>
        
        <div className="mb-4">
          <h3 className="font-bold text-gray-900 mb-2 text-lg md:text-xl lg:text-2xl">{title}</h3>
          <p className="text-gray-700 text-sm md:text-base lg:text-lg leading-relaxed">{message}</p>
        </div>

        {/* Horizontal Slider */}
        <div className="bg-gray-50 rounded-[9px] p-3 mb-4">
          <div className="text-xs text-gray-500 mb-2 flex items-center justify-between">
            <span>Horizontal Slider</span>
            {isAutoPlaying && (
              <span className="text-orange-600 flex items-center gap-1">
                <Dot className="w-3 h-3 animate-pulse" />
                Auto-play
              </span>
            )}
          </div>
          
          {items.length > 0 ? (
            <div className="relative">
              {/* Main Slider */}
              <div className="relative bg-white rounded-[8px] overflow-hidden">
                <div className="relative h-64 md:h-96 lg:h-[500px]">
                  {items[currentSlide]?.url ? (
                    <img 
                      src={items[currentSlide].url} 
                      alt={items[currentSlide].name}
                      className="w-full h-full object-cover transition-opacity duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <Image className="w-8 h-8 text-gray-400" />
                    </div>
                  )}

                  {/* Navigation Arrows */}
                  {items.length > 1 && (
                    <>
                      <button
                        onClick={prevSlide}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-1 rounded-full transition-all duration-200"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={nextSlide}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-1 rounded-full transition-all duration-200"
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
                      <div className="bg-orange-600 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        LIVE
                      </div>
                    </div>
                  )}
                </div>

                {/* Slide Info */}
                <div className="p-3">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {items[currentSlide]?.name}
                  </div>
                  {items[currentSlide]?.price && (
                    <div className="text-sm text-orange-600 font-medium">
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
                          ? 'bg-orange-600 w-6' 
                          : 'bg-gray-300 hover:bg-gray-400'
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
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <Image className="w-3 h-3 text-gray-400" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 bg-white rounded-[6px] border-2 border-dashed border-gray-300">
              <div className="text-center">
                <ChevronRight className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Add media for slider</p>
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
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 md:px-8 md:py-3 lg:px-10 lg:py-4 rounded-[9px] font-medium text-sm md:text-base lg:text-lg transition-colors"
          >
            {ctaLabel}
          </a>
        </div>
        
        <div className="text-xs text-blue-600 text-center mt-2 truncate">
          {ctaUrl}
        </div>
      </div>
    </div>
  )
}
