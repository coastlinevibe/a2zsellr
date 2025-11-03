'use client'

import React, { useState } from 'react'
import { Image, ArrowRight, Eye } from 'lucide-react'

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
}

export const BeforeAfterLayout: React.FC<BeforeAfterLayoutProps> = ({
  items,
  title,
  message,
  ctaLabel,
  ctaUrl,
  businessName
}) => {
  const [showAfter, setShowAfter] = useState(false)

  return (
    <div className="bg-white rounded-[9px] shadow-sm border border-gray-200 max-w-md mx-auto overflow-hidden">
      {/* Header */}
      <div className="bg-purple-50 border-b border-purple-200 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
            {businessName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-semibold text-gray-900">{businessName}</div>
            <div className="text-xs text-gray-500">Broadcast • before & after</div>
          </div>
        </div>
        
        <div className="mb-4">
          <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-700 text-sm leading-relaxed">{message}</p>
        </div>

        {/* Before & After Comparison */}
        <div className="bg-gray-50 rounded-[9px] p-3 mb-4">
          <div className="text-xs text-gray-500 mb-2">Before & After Comparison</div>
          {items.length >= 2 ? (
            <div className="space-y-3">
              {/* Toggle Buttons */}
              <div className="flex bg-white rounded-[6px] p-1">
                <button
                  onClick={() => setShowAfter(false)}
                  className={`flex-1 py-2 px-3 rounded-[4px] text-xs font-medium transition-colors ${
                    !showAfter 
                      ? 'bg-purple-600 text-white' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  BEFORE
                </button>
                <button
                  onClick={() => setShowAfter(true)}
                  className={`flex-1 py-2 px-3 rounded-[4px] text-xs font-medium transition-colors ${
                    showAfter 
                      ? 'bg-purple-600 text-white' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  AFTER
                </button>
              </div>

              {/* Comparison Image */}
              <div className="relative bg-white rounded-[6px] overflow-hidden">
                <div className="relative h-32">
                  {showAfter ? (
                    items[1]?.url ? (
                      <img 
                        src={items[1].url} 
                        alt={items[1].name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <Image className="w-8 h-8 text-gray-400" />
                      </div>
                    )
                  ) : (
                    items[0]?.url ? (
                      <img 
                        src={items[0].url} 
                        alt={items[0].name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <Image className="w-8 h-8 text-gray-400" />
                      </div>
                    )
                  )}
                  
                  {/* Label Overlay */}
                  <div className="absolute top-2 left-2">
                    <span className={`px-2 py-1 rounded text-xs font-bold text-white ${
                      showAfter ? 'bg-green-600' : 'bg-red-600'
                    }`}>
                      {showAfter ? 'AFTER' : 'BEFORE'}
                    </span>
                  </div>

                  {/* Transformation Arrow */}
                  <div className="absolute top-2 right-2">
                    <div className="bg-white bg-opacity-90 rounded-full p-1">
                      <ArrowRight className="w-4 h-4 text-purple-600" />
                    </div>
                  </div>
                </div>

                <div className="p-2">
                  <div className="text-xs font-medium text-gray-900">
                    {showAfter ? items[1]?.name : items[0]?.name}
                  </div>
                  <div className="text-xs text-purple-600 font-medium">
                    Transformation Result
                  </div>
                </div>
              </div>

              {/* Quick Preview */}
              <div className="flex gap-2">
                {items.slice(0, 2).map((item, index) => (
                  <div 
                    key={item.id}
                    className={`flex-1 relative cursor-pointer transition-all duration-200 ${
                      (index === 0 && !showAfter) || (index === 1 && showAfter)
                        ? 'ring-2 ring-purple-400' 
                        : 'opacity-60 hover:opacity-80'
                    }`}
                    onClick={() => setShowAfter(index === 1)}
                  >
                    {item.url ? (
                      <img 
                        src={item.url} 
                        alt={item.name}
                        className="w-full h-16 object-cover rounded-[4px]"
                      />
                    ) : (
                      <div className="w-full h-16 bg-gray-200 rounded-[4px] flex items-center justify-center">
                        <Image className="w-4 h-4 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute bottom-1 left-1">
                      <span className={`px-1 py-0.5 rounded text-xs font-bold text-white ${
                        index === 0 ? 'bg-red-600' : 'bg-green-600'
                      }`}>
                        {index === 0 ? 'B' : 'A'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 bg-white rounded-[6px] border-2 border-dashed border-gray-300">
              <div className="text-center">
                <Eye className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Add 2+ images for comparison</p>
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
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-[9px] font-medium text-sm transition-colors"
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
