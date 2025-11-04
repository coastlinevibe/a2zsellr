'use client'

import React, { useState } from 'react'
import { Image } from 'lucide-react'

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
}

export const GalleryMosaicLayout: React.FC<GalleryMosaicLayoutProps> = ({
  items,
  title,
  message,
  ctaLabel,
  ctaUrl,
  businessName
}) => {
  const [selectedImage, setSelectedImage] = useState(0)

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
          <h3 className="font-bold text-gray-900 mb-2 text-lg md:text-xl lg:text-2xl">{title}</h3>
          <p className="text-gray-700 text-sm md:text-base lg:text-lg leading-relaxed">{message}</p>
        </div>

        {/* Image Gallery with Thumbnails */}
        <div className="bg-gray-50 rounded-[9px] p-3 mb-4">
          {items.length > 0 ? (
            <div className="space-y-3">
              {/* Main Image Display */}
              <div className="relative bg-white rounded-lg overflow-hidden" style={{ paddingTop: '66.67%' }}>
                <div className="absolute inset-0">
                  {items[selectedImage]?.url ? (
                    <img 
                      src={items[selectedImage].url} 
                      alt={items[selectedImage].name}
                      className="w-full h-full object-cover transition-opacity duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <Image className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Price overlay if available */}
                  {items[selectedImage]?.price && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                      <div className="text-white">
                        <div className="font-medium text-sm">{items[selectedImage].name}</div>
                        <div className="text-lg font-bold text-emerald-400">
                          R{items[selectedImage].price.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Thumbnail Navigation */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {items.map((item, index) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 rounded-md overflow-hidden transition-all ${
                      selectedImage === index 
                        ? 'ring-3 ring-cyan-400 shadow-lg scale-105' 
                        : 'ring-1 ring-gray-300 hover:ring-gray-400'
                    }`}
                    style={{ width: '80px', height: '60px' }}
                  >
                    {item.url ? (
                      <img 
                        src={item.url} 
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <Image className="w-4 h-4 text-gray-400" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
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
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 md:px-8 md:py-3 lg:px-10 lg:py-4 rounded-[9px] font-medium text-sm md:text-base lg:text-lg transition-colors"
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
