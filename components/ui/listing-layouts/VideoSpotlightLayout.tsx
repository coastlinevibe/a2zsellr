'use client'

import React, { useState } from 'react'
import { Play, Pause, Volume2, Maximize, Image } from 'lucide-react'
import { ListingMeta } from './ListingMeta'

interface MediaItem {
  id: string
  name: string
  url: string
  type: string
  price?: number
}

interface VideoSpotlightLayoutProps {
  items: MediaItem[]
  title: string
  message: string
  ctaLabel: string
  ctaUrl: string
  businessName: string
  businessCategory?: string | null
  avatarUrl?: string | null
  ratingAverage?: number | null
  ratingCount?: number
  deliveryAvailable?: boolean
}

export const VideoSpotlightLayout: React.FC<VideoSpotlightLayoutProps> = ({
  items,
  title,
  message,
  ctaLabel,
  ctaUrl,
  businessName,
  businessCategory,
  avatarUrl,
  ratingAverage,
  ratingCount,
  deliveryAvailable
}) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentVideo, setCurrentVideo] = useState(0)
  
  const videoItems = items.filter(item => item.type?.startsWith('video/'))
  const imageItems = items.filter(item => item.type?.startsWith('image/') || !item.type)

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

        {/* Video Spotlight */}
        <div className="bg-emerald-50 rounded-[9px] p-3 mb-4">
          <div className="text-xs text-emerald-700 mb-2">Video Spotlight</div>
          
          {videoItems.length > 0 ? (
            <div className="space-y-3">
              {/* Main Video Player */}
              <div className="relative bg-black rounded-[8px] overflow-hidden">
                <div className="relative aspect-video">
                  <video
                    src={videoItems[currentVideo]?.url}
                    className="w-full h-full object-cover"
                    poster={imageItems[0]?.url}
                  />
                  
                  {/* Video Controls Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-3 transition-all duration-200 hover:scale-110"
                    >
                      {isPlaying ? (
                        <Pause className="w-6 h-6 text-gray-800" />
                      ) : (
                        <Play className="w-6 h-6 text-gray-800 ml-1" />
                      )}
                    </button>
                  </div>

                  {/* Video Info Overlay */}
                  <div className="absolute bottom-2 left-2 right-2">
                    <div className="bg-black bg-opacity-60 rounded px-2 py-1">
                      <div className="text-white text-xs font-medium truncate">
                        {videoItems[currentVideo]?.name}
                      </div>
                    </div>
                  </div>

                  {/* Video Controls */}
                  <div className="absolute top-2 right-2 flex gap-1">
                    <button className="bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-1 rounded">
                      <Volume2 className="w-3 h-3" />
                    </button>
                    <button className="bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-1 rounded">
                      <Maximize className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Duration Badge */}
                  <div className="absolute top-2 left-2">
                    <span className="bg-emerald-600 text-white px-2 py-1 rounded text-xs font-bold">
                      ● LIVE
                    </span>
                  </div>
                </div>
              </div>

              {/* Video Thumbnails */}
              {videoItems.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {videoItems.map((video, index) => (
                    <button
                      key={video.id}
                      onClick={() => setCurrentVideo(index)}
                      className={`flex-shrink-0 relative rounded-[4px] overflow-hidden transition-all duration-200 ${
                        currentVideo === index 
                          ? 'ring-2 ring-emerald-400 scale-105' 
                          : 'opacity-70 hover:opacity-90'
                      }`}
                    >
                      <div className="w-16 h-12 bg-emerald-800 flex items-center justify-center">
                        <Play className="w-4 h-4 text-white" />
                      </div>
                      <div className="absolute inset-0 bg-black bg-opacity-20" />
                    </button>
                  ))}
                </div>
              )}

              {/* Supporting Images */}
              {imageItems.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {imageItems.slice(0, 3).map((image, index) => (
                    <div key={image.id} className="relative">
                      <img 
                        src={image.url} 
                        alt={image.name}
                        className="w-full h-16 object-cover rounded-[4px]"
                      />
                      <div className="absolute bottom-1 right-1">
                        <span className="bg-black bg-opacity-60 text-white px-1 py-0.5 rounded text-xs">
                          {index + 1}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 bg-emerald-900 rounded-[6px]">
              <div className="text-center text-white">
                <Play className="w-8 h-8 mx-auto mb-2 opacity-60" />
                <p className="text-sm opacity-80">Upload videos for spotlight</p>
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
