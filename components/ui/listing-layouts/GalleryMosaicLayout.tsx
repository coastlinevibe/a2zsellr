'use client'

import React, { useState, useEffect } from 'react'
import { Image, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { ListingMeta } from './ListingMeta'

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
  businessCategory?: string | null
  avatarUrl?: string | null
  bannerImages?: Array<{ id: string; image_url: string; caption?: string }>
  ratingAverage?: number | null
  ratingCount?: number
  deliveryAvailable?: boolean
  whatsappInviteLink?: string | null
}

export const GalleryMosaicLayout: React.FC<GalleryMosaicLayoutProps> = ({
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
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showAnimations, setShowAnimations] = useState(false)

  // Start animations after lightbox is closed
  React.useEffect(() => {
    if (!lightboxOpen) {
      setShowAnimations(true)
    }
  }, [lightboxOpen])

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
          animation: ${showAnimations ? 'blurFadeIn 0.8s ease-out forwards' : 'none'};
        }

        .profile-picture {
          animation: ${showAnimations ? 'blurFadeIn 0.8s ease-out forwards' : 'none'};
        }

        .business-name {
          animation: ${showAnimations ? 'letterByLetter 0.05s ease-out forwards' : 'none'};
        }

        .business-name-char {
          display: inline-block;
          animation: ${showAnimations ? 'letterByLetter 0.1s ease-out forwards' : 'none'};
        }

        .listing-title {
          animation: ${showAnimations ? 'slideUpBlur 0.8s ease-out 0.3s forwards' : 'none'};
          opacity: ${showAnimations ? '0' : '1'};
        }

        .listing-description {
          animation: ${showAnimations ? 'slideLeftBlur 0.8s ease-out 0.5s forwards' : 'none'};
          opacity: ${showAnimations ? '0' : '1'};
        }

        .gallery-item {
          animation: ${showAnimations ? 'blurFadeIn 0.6s ease-out forwards' : 'none'};
        }

        .gallery-item:nth-child(1) { animation-delay: ${showAnimations ? '0.7s' : '0s'}; }
        .gallery-item:nth-child(2) { animation-delay: ${showAnimations ? '0.8s' : '0s'}; }
        .gallery-item:nth-child(3) { animation-delay: ${showAnimations ? '0.9s' : '0s'}; }
        .gallery-item:nth-child(4) { animation-delay: ${showAnimations ? '1s' : '0s'}; }
        .gallery-item:nth-child(5) { animation-delay: ${showAnimations ? '1.1s' : '0s'}; }
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
          <h3 className="font-bold text-gray-900 mb-2 text-lg md:text-xl lg:text-2xl listing-title">{title}</h3>
          <div 
            className="text-gray-700 text-sm md:text-base lg:text-lg leading-relaxed listing-description"
            dangerouslySetInnerHTML={{ __html: message }}
          />
        </div>

        {/* Mosaic Gallery Grid */}
        <div className="bg-green-50 rounded-[9px] p-3 mb-4">
          {items.length > 0 ? (
            <div className="grid gap-2" style={{
              gridTemplateColumns: items.length === 1 ? '1fr' : 
                                 items.length === 2 ? 'repeat(2, 1fr)' :
                                 items.length === 3 ? 'repeat(2, 1fr)' :
                                 'repeat(2, 1fr)'
            }}>
              {items.map((item, index) => (
                <div 
                  key={item.id}
                  onClick={() => item.url && openLightbox(index)}
                  className={`relative bg-white rounded-lg overflow-hidden group cursor-pointer transition-transform hover:scale-105 gallery-item ${
                    items.length === 3 && index === 0 ? 'row-span-2' : ''
                  }`}
                  style={{ 
                    aspectRatio: items.length === 1 ? '16/10' : 
                               items.length === 3 && index === 0 ? '1/1' : 
                               '4/3' 
                  }}
                >
                  {item.url ? (
                    <img 
                      src={item.url} 
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-green-200 flex items-center justify-center">
                      <Image className="w-8 h-8 text-green-600" />
                    </div>
                  )}
                  
                  {/* Price overlay */}
                  {item.price && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2 pointer-events-none">
                      <div className="text-white">
                        <div className="font-medium text-xs truncate">{item.name}</div>
                        <div className="text-sm font-bold text-emerald-400">
                          R{item.price.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Hover overlay with zoom indicator */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                    <div className="bg-white/90 rounded-full p-2">
                      <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Show more indicator if there are many items */}
              {items.length > 4 && (
                <div className="relative bg-emerald-700/90 rounded-lg overflow-hidden flex items-center justify-center text-white font-bold text-lg" style={{ aspectRatio: '4/3' }}>
                  +{items.length - 3} more
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 bg-white rounded-lg border-2 border-dashed border-green-300">
              <div className="text-center">
                <Image className="w-12 h-12 text-green-600 mx-auto mb-2" />
                <p className="text-sm text-green-700">No media selected</p>
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
              onClick={(e) => {
                // Ensure the link opens in a new tab
                if (!whatsappInviteLink.startsWith('http')) {
                  e.preventDefault()
                  window.open(`https://${whatsappInviteLink}`, '_blank')
                }
              }}
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
          {ctaUrl ? new URL(ctaUrl).hostname : ''}
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
                  <p className="text-emerald-400 font-bold text-xl">
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
    </div>
  )
}
