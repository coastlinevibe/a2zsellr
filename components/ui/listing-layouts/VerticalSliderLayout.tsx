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
  businessCategory?: string | null
  avatarUrl?: string | null
  bannerImages?: Array<{ id: string; image_url: string; caption?: string }>
  ratingAverage?: number | null
  ratingCount?: number
  deliveryAvailable?: boolean
  whatsappInviteLink?: string | null
}

export const VerticalSliderLayout: React.FC<VerticalSliderLayoutProps> = ({
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
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [showAnimations, setShowAnimations] = useState(false)

  // Start animations after component mounts
  React.useEffect(() => {
    setShowAnimations(true)
  }, [])

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
    <div className="bg-white rounded-[9px] shadow-sm border border-gray-200 w-full max-w-md md:max-w-2xl lg:max-w-4xl mx-auto overflow-visible">
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
                        className="absolute top-3 left-1/2 -translate-x-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all duration-200"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={nextSlide}
                        className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all duration-200"
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
