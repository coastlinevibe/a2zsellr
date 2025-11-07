'use client'

import React, { useState } from 'react'
import { Image, X, ChevronLeft, ChevronRight } from 'lucide-react'

interface MediaItem {
  id: string
  name: string
  url: string
  type: string
  price?: number
}

interface HoverCardsLayoutProps {
  items: MediaItem[]
  title: string
  message: string
  ctaLabel: string
  ctaUrl: string
  businessName: string
}

export const HoverCardsLayout: React.FC<HoverCardsLayoutProps> = ({
  items,
  title,
  message,
  ctaLabel,
  ctaUrl,
  businessName
}) => {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
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
    <>
    <div className="bg-white rounded-[9px] shadow-sm border border-gray-200 w-full max-w-md md:max-w-2xl lg:max-w-5xl mx-auto overflow-hidden relative">
      {/* Header */}
      <div className="bg-blue-50 border-b border-blue-200 p-4 md:p-6 lg:p-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg md:text-xl lg:text-2xl">
            {businessName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-semibold text-gray-900 text-base md:text-lg lg:text-xl">{businessName}</div>
            <div className="text-xs md:text-sm text-gray-500">Broadcast • hover gallery</div>
          </div>
        </div>
        
        <div className="mb-4">
          <h3 className="font-bold text-gray-900 mb-2 text-lg md:text-xl lg:text-2xl">{title}</h3>
          <p className="text-gray-700 text-sm md:text-base lg:text-lg leading-relaxed">{message}</p>
        </div>

        {/* Expanding Hover Gallery */}
        <div className="bg-gray-50 rounded-[9px] p-3 mb-4">
          {items.length > 0 ? (
            <div className="flex items-center gap-2 h-[300px] md:h-[400px] lg:h-[500px] w-full overflow-hidden rounded-lg">
              {items.map((item, index) => {
                const isHovered = hoveredCard === item.id
                const hoveredIndex = items.findIndex(i => i.id === hoveredCard)
                const totalItems = items.length
                
                // Calculate flex properties for better distribution
                let flexBasis
                let flexGrow = 0
                let flexShrink = 1
                
                if (isHovered) {
                  // Hovered image takes ALL the space
                  flexBasis = '100%'
                  flexGrow = 1
                  flexShrink = 0
                } else if (hoveredCard) {
                  // Non-hovered images get pushed completely out
                  flexBasis = '0%'
                  flexGrow = 0
                  flexShrink = 1
                } else {
                  // Default state - all images share space equally
                  flexBasis = `${100 / totalItems}%`
                  flexGrow = 1
                  flexShrink = 1
                }
                
                return (
                  <div
                    key={item.id}
                    className="relative group transition-all duration-500 ease-in-out rounded-lg overflow-hidden h-full cursor-pointer"
                    style={{ 
                      flexBasis,
                      flexGrow,
                      flexShrink,
                      width: isHovered ? '100%' : hoveredCard ? '0%' : 'auto',
                      overflow: 'hidden',
                      transition: 'all 0.5s ease-in-out'
                    }}
                    onMouseEnter={() => setHoveredCard(item.id)}
                    onMouseLeave={() => setHoveredCard(null)}
                    onClick={() => item.url && openLightbox(index)}
                  >
                  {item.url ? (
                    <img
                      className="h-full w-full object-cover object-center"
                      src={item.url}
                      alt={item.name}
                    />
                  ) : (
                    <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                      <Image className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Gradient overlay with info */}
                  <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-all duration-300 ${
                    hoveredCard === item.id ? 'opacity-100' : 'opacity-0'
                  }`}>
                    <div className="absolute inset-0 flex flex-col justify-end p-4 md:p-6">
                      <div className="text-white w-full">
                        <h4 className="font-bold text-lg md:text-xl lg:text-2xl mb-2 break-words">{item.name}</h4>
                        {item.price && (
                          <div className="text-2xl md:text-3xl font-bold text-emerald-400">
                            R{item.price.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                )
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 bg-white rounded-lg border-2 border-dashed border-gray-300">
              <div className="text-center">
                <Image className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No media selected</p>
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
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 md:px-8 md:py-3 lg:px-10 lg:py-4 rounded-[9px] font-medium text-sm md:text-base lg:text-lg transition-colors"
          >
            {ctaLabel}
          </a>
        </div>
        
        <div className="text-xs text-blue-600 text-center mt-2 truncate">
          {ctaUrl}
        </div>
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
                <p className="text-blue-400 font-bold text-xl">
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
    </>
  )
}
