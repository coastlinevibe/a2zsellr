'use client'

import React from 'react'
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
            <div className="text-xs md:text-sm text-gray-500">Broadcast • gallery mosaic</div>
          </div>
        </div>
        
        <div className="mb-4">
          <h3 className="font-bold text-gray-900 mb-2 text-lg md:text-xl lg:text-2xl">{title}</h3>
          <p className="text-gray-700 text-sm md:text-base lg:text-lg leading-relaxed">{message}</p>
        </div>

        {/* Gallery Mosaic Grid */}
        <div className="bg-gray-50 rounded-[9px] p-3 mb-4">
          <div className="text-xs text-gray-500 mb-2">Gallery Mosaic Layout</div>
          {items.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {items.slice(0, 4).map((item, index) => (
                <div key={item.id} className="bg-white rounded-[6px] overflow-hidden shadow-sm">
                  {item.type?.startsWith('image/') || item.url ? (
                    <img 
                      src={item.url} 
                      alt={item.name}
                      className="w-full h-32 md:h-40 lg:h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-24 bg-gray-200 flex items-center justify-center">
                      <Image className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                  <div className="p-2">
                    <div className="text-xs font-medium text-gray-900 truncate">{item.name}</div>
                    {item.price && (
                      <div className="text-xs text-emerald-600 font-medium">
                        R{item.price.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 bg-white rounded-[6px] border-2 border-dashed border-gray-300">
              <div className="text-center">
                <Image className="w-8 h-8 text-gray-400 mx-auto mb-2" />
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
