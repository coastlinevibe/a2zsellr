'use client'

import React, { useState } from 'react'
import { Image, ShoppingCart } from 'lucide-react'

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

  return (
    <div className="bg-white rounded-[9px] shadow-sm border border-gray-200 max-w-md mx-auto overflow-hidden">
      {/* Header */}
      <div className="bg-blue-50 border-b border-blue-200 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
            {businessName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-semibold text-gray-900">{businessName}</div>
            <div className="text-xs text-gray-500">Broadcast • hover cards</div>
          </div>
        </div>
        
        <div className="mb-4">
          <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-700 text-sm leading-relaxed">{message}</p>
        </div>

        {/* Interactive Hover Cards */}
        <div className="bg-gray-50 rounded-[9px] p-3 mb-4">
          <div className="text-xs text-gray-500 mb-2">Interactive Hover Cards</div>
          {items.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {items.slice(0, 4).map((item, index) => (
                <div 
                  key={item.id}
                  className="relative bg-white rounded-[8px] overflow-hidden shadow-sm transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer"
                  onMouseEnter={() => setHoveredCard(item.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  {/* Card Image */}
                  <div className="relative">
                    {item.type?.startsWith('image/') || item.url ? (
                      <img 
                        src={item.url} 
                        alt={item.name}
                        className="w-full h-20 object-cover"
                      />
                    ) : (
                      <div className="w-full h-20 bg-gray-200 flex items-center justify-center">
                        <Image className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                    
                    {/* Hover Overlay */}
                    {hoveredCard === item.id && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center transition-opacity duration-300">
                        <div className="text-center text-white">
                          <ShoppingCart className="w-6 h-6 mx-auto mb-1" />
                          <div className="text-xs font-medium">View Details</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="p-2">
                    <div className="text-xs font-medium text-gray-900 truncate">{item.name}</div>
                    {item.price && (
                      <div className="text-xs text-blue-600 font-medium">
                        R{item.price.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                      </div>
                    )}
                  </div>

                  {/* Animated Border */}
                  <div className={`absolute inset-0 border-2 rounded-[8px] transition-colors duration-300 ${
                    hoveredCard === item.id ? 'border-blue-400' : 'border-transparent'
                  }`} />
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
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-[9px] font-medium text-sm transition-colors"
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
