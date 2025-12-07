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
  bannerImages?: Array<{ id: string; image_url: string; caption?: string }>
  ratingAverage?: number | null
  ratingCount?: number
  deliveryAvailable?: boolean
  whatsappInviteLink?: string | null
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
  bannerImages,
  ratingAverage,
  ratingCount,
  deliveryAvailable,
  whatsappInviteLink
}) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentVideo, setCurrentVideo] = useState(0)
  const [showAnimations, setShowAnimations] = useState(false)

  // Start animations after component mounts
  React.useEffect(() => {
    setShowAnimations(true)
  }, [])
  
  const videoItems = items.filter(item => item.type?.startsWith('video/'))
  const imageItems = items.filter(item => item.type?.startsWith('image/') || !item.type)

  return (
    <div className="bg-white rounded-[9px] shadow-sm border border-gray-200 w-full max-w-md md:max-w-2xl lg:max-w-5xl mx-auto overflow-visible">
      <style>{`
        @keyframes blurFadeIn {
          from {
            opacity: 0;
            filter: blur(10px);
          }
          to {
            opacity: 1;
            filter: blur(0);
          }
        }

        @keyframes slideUpBlur {
          from {
            opacity: 0;
            filter: blur(10px);
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            filter: blur(0);
            transform: translateY(0);
          }
        }

        @keyframes slideLeftBlur {
          from {
            opacity: 0;
            filter: blur(10px);
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            filter: blur(0);
            transform: translateX(0);
          }
        }

        @keyframes letterByLetter {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .banner-image {
          animation: blurFadeIn 0.8s ease-out forwards;
        }

        .profile-picture {
          animation: blurFadeIn 0.8s ease-out forwards;
        }

        .business-name {
          animation: letterByLetter 0.05s ease-out forwards;
        }

        .business-name-char {
          display: inline-block;
          animation: letterByLetter 0.1s ease-out forwards;
        }

        .listing-title {
          animation: slideUpBlur 0.8s ease-out 0.3s forwards;
          opacity: 0;
        }

        .listing-description {
          animation: slideLeftBlur 0.8s ease-out 0.5s forwards;
          opacity: 0;
        }
      `}</style>

      {/* Banner Image at Top */}
      {bannerImages && bannerImages.length > 0 && (
        <div className="relative w-full h-48 md:h-64 overflow-hidden rounded-t-[9px] banner-image">
          <img 
            src={bannerImages[0].image_url} 
            alt="Business Banner" 
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Header with overlapping profile picture */}
      <div className="bg-green-50 border-b border-green-200 p-4 md:p-6 lg:p-8 relative">
        {/* Profile Picture - positioned 20% down from banner */}
        <div className="absolute -top-4 md:-top-6 lg:-top-8 left-4 md:left-6 lg:left-8 profile-picture">
          <div className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full flex items-center justify-center text-white font-bold text-2xl md:text-3xl lg:text-4xl overflow-hidden border-4 border-white bg-emerald-600 shadow-lg">
            {avatarUrl ? (
              <img src={avatarUrl} alt={businessName} className="w-full h-full object-cover" />
            ) : (
              businessName.charAt(0).toUpperCase()
            )}
          </div>
        </div>
        
        {/* Business Info - positioned to the right of avatar */}
        <div className="absolute -top-6 md:-top-5 lg:-top-4 left-16 md:left-24 lg:left-32 flex flex-col justify-center h-16 md:h-20 lg:h-24 business-name">
          <div className="font-semibold text-gray-900 text-base md:text-lg lg:text-xl">
            {businessName.split('').map((char, i) => (
              <span key={i} className="business-name-char" style={{ animationDelay: `${0.8 + i * 0.05}s` }}>
                {char}
              </span>
            ))}
          </div>
          <div className="text-xs md:text-sm text-gray-500" style={{ animation: 'letterByLetter 0.3s ease-out 1.2s forwards', opacity: 0 }}>{businessCategory || 'Business'}</div>
        </div>
        
        <div className="mb-4 pt-8 md:pt-10 lg:pt-12">
          <ListingMeta
            ratingAverage={ratingAverage}
            ratingCount={ratingCount}
            deliveryAvailable={deliveryAvailable}
            className="mb-2"
          />
          <h3 className={`font-bold text-emerald-900 mb-2 text-lg md:text-xl lg:text-2xl listing-title ${!showAnimations ? 'hidden-animation' : ''}`}>{title}</h3>
          <div 
            className={`text-emerald-700 text-sm md:text-base lg:text-lg leading-relaxed listing-description ${!showAnimations ? 'hidden-animation' : ''}`}
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

        {/* WhatsApp Invite Link */}
        {whatsappInviteLink && (
          <div className="mb-4 p-3 bg-green-100 border border-green-300 rounded-[9px]">
            <a 
              href={whatsappInviteLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 text-green-700 hover:text-green-800 font-medium text-sm md:text-base transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-4.255.949c-1.238.503-2.335 1.236-3.356 2.259-1.02 1.02-1.756 2.119-2.259 3.357-.504 1.238-.749 2.565-.949 4.255-.2 1.69-.2 3.38 0 5.07.2 1.69.445 2.965.949 4.203 1.02 2.04 2.56 3.58 4.6 4.6 1.238.504 2.515.749 4.205.949 1.69.2 3.38.2 5.07 0 1.69-.2 2.965-.445 4.203-.949 2.04-1.02 3.58-2.56 4.6-4.6.504-1.238.749-2.515.949-4.205.2-1.69.2-3.38 0-5.07-.2-1.69-.445-2.965-.949-4.203-1.02-2.04-2.56-3.58-4.6-4.6-1.238-.504-2.515-.749-4.205-.949-1.69-.2-3.38-.2-5.07 0z"/>
              </svg>
              Join WhatsApp Group
            </a>
          </div>
        )}

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
