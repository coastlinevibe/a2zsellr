'use client'

import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut, RotateCw, Download, Share2, Play, Pause } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

interface GallerySliderProps {
  images: string[]
  className?: string
  showThumbnails?: boolean
  autoPlay?: boolean
  autoPlayInterval?: number
  showControls?: boolean
  showFullscreenButton?: boolean
  aspectRatio?: 'square' | 'video' | 'auto'
  onImageClick?: (index: number) => void
}

interface FullscreenViewerProps {
  images: string[]
  currentIndex: number
  isOpen: boolean
  onClose: () => void
  onIndexChange: (index: number) => void
}

// Full-screen image viewer with zoom and controls
function FullscreenViewer({ images, currentIndex, isOpen, onClose, onIndexChange }: FullscreenViewerProps) {
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const imageRef = useRef<HTMLImageElement>(null)

  const resetTransform = () => {
    setZoom(1)
    setRotation(0)
    setPosition({ x: 0, y: 0 })
  }

  const handleZoomIn = () => setZoom(prev => Math.min(prev * 1.5, 5))
  const handleZoomOut = () => setZoom(prev => Math.max(prev / 1.5, 0.5))
  const handleRotate = () => setRotation(prev => (prev + 90) % 360)

  const handleDownload = async () => {
    try {
      const response = await fetch(images[currentIndex])
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `image-${currentIndex + 1}.jpg`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Shared Image',
          url: images[currentIndex]
        })
      } catch (error) {
        console.error('Share failed:', error)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(images[currentIndex])
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true)
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isOpen) return
    
    switch (e.key) {
      case 'Escape':
        onClose()
        break
      case 'ArrowLeft':
        onIndexChange(currentIndex > 0 ? currentIndex - 1 : images.length - 1)
        resetTransform()
        break
      case 'ArrowRight':
        onIndexChange(currentIndex < images.length - 1 ? currentIndex + 1 : 0)
        resetTransform()
        break
      case '+':
      case '=':
        handleZoomIn()
        break
      case '-':
        handleZoomOut()
        break
      case 'r':
      case 'R':
        handleRotate()
        break
    }
  }

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    } else {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, currentIndex, images.length])

  useEffect(() => {
    resetTransform()
  }, [currentIndex])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center">
      {/* Controls Bar */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
          <span className="text-white text-sm">
            {currentIndex + 1} / {images.length}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={handleZoomOut}
            variant="outline"
            size="sm"
            className="bg-black/50 border-white/20 text-white hover:bg-white/10"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button
            onClick={handleZoomIn}
            variant="outline"
            size="sm"
            className="bg-black/50 border-white/20 text-white hover:bg-white/10"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button
            onClick={handleRotate}
            variant="outline"
            size="sm"
            className="bg-black/50 border-white/20 text-white hover:bg-white/10"
          >
            <RotateCw className="w-4 h-4" />
          </Button>
          <Button
            onClick={handleDownload}
            variant="outline"
            size="sm"
            className="bg-black/50 border-white/20 text-white hover:bg-white/10"
          >
            <Download className="w-4 h-4" />
          </Button>
          <Button
            onClick={handleShare}
            variant="outline"
            size="sm"
            className="bg-black/50 border-white/20 text-white hover:bg-white/10"
          >
            <Share2 className="w-4 h-4" />
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            size="sm"
            className="bg-black/50 border-white/20 text-white hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <Button
            onClick={() => {
              onIndexChange(currentIndex > 0 ? currentIndex - 1 : images.length - 1)
              resetTransform()
            }}
            variant="outline"
            size="sm"
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 border-white/20 text-white hover:bg-white/10 z-10"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <Button
            onClick={() => {
              onIndexChange(currentIndex < images.length - 1 ? currentIndex + 1 : 0)
              resetTransform()
            }}
            variant="outline"
            size="sm"
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 border-white/20 text-white hover:bg-white/10 z-10"
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        </>
      )}

      {/* Main Image */}
      <div className="flex-1 flex items-center justify-center p-16">
        <div
          className="relative max-w-full max-h-full cursor-move"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <Image
            ref={imageRef}
            src={images[currentIndex]}
            alt={`Image ${currentIndex + 1}`}
            width={1200}
            height={800}
            className="max-w-full max-h-full object-contain select-none"
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg) translate(${position.x}px, ${position.y}px)`,
              transition: isDragging ? 'none' : 'transform 0.2s ease-out'
            }}
            draggable={false}
          />
        </div>
      </div>

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 bg-black/50 p-2 rounded-lg max-w-full overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => {
                onIndexChange(index)
                resetTransform()
              }}
              className={`relative w-16 h-16 rounded overflow-hidden flex-shrink-0 ${
                index === currentIndex ? 'ring-2 ring-white' : 'opacity-60 hover:opacity-100'
              }`}
            >
              <Image
                src={image}
                alt={`Thumbnail ${index + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function GallerySlider({
  images,
  className = '',
  showThumbnails = true,
  autoPlay = false,
  autoPlayInterval = 5000,
  showControls = true,
  showFullscreenButton = true,
  aspectRatio = 'auto',
  onImageClick
}: GallerySliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(autoPlay)
  const [showFullscreen, setShowFullscreen] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const nextImage = () => {
    setCurrentIndex(prev => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentIndex(prev => (prev - 1 + images.length) % images.length)
  }

  const goToImage = (index: number) => {
    setCurrentIndex(index)
  }

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const openFullscreen = (index?: number) => {
    if (index !== undefined) {
      setCurrentIndex(index)
    }
    setShowFullscreen(true)
    if (onImageClick) {
      onImageClick(index || currentIndex)
    }
  }

  // Auto-play functionality
  useEffect(() => {
    if (isPlaying && images.length > 1) {
      intervalRef.current = setInterval(nextImage, autoPlayInterval)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isPlaying, autoPlayInterval, images.length])

  if (!images || images.length === 0) {
    return (
      <div className={`bg-gray-200 rounded-lg flex items-center justify-center h-64 ${className}`}>
        <p className="text-gray-500">No images to display</p>
      </div>
    )
  }

  const aspectRatioClass = {
    square: 'aspect-square',
    video: 'aspect-video',
    auto: ''
  }[aspectRatio]

  return (
    <div className={`relative group ${className}`}>
      {/* Main Image Display */}
      <div className={`relative overflow-hidden rounded-lg bg-gray-100 ${aspectRatioClass}`}>
        <Image
          src={images[currentIndex]}
          alt={`Gallery image ${currentIndex + 1}`}
          fill
          className="object-cover cursor-pointer transition-transform duration-300 group-hover:scale-105"
          onClick={() => openFullscreen()}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Overlay Controls */}
        {showControls && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300">
            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <Button
                  onClick={(e) => {
                    e.stopPropagation()
                    prevImage()
                  }}
                  variant="outline"
                  size="sm"
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 hover:bg-white"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  onClick={(e) => {
                    e.stopPropagation()
                    nextImage()
                  }}
                  variant="outline"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 hover:bg-white"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </>
            )}

            {/* Top Controls */}
            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {autoPlay && images.length > 1 && (
                <Button
                  onClick={(e) => {
                    e.stopPropagation()
                    togglePlayPause()
                  }}
                  variant="outline"
                  size="sm"
                  className="bg-white/80 hover:bg-white"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
              )}
              {showFullscreenButton && (
                <Button
                  onClick={(e) => {
                    e.stopPropagation()
                    openFullscreen()
                  }}
                  variant="outline"
                  size="sm"
                  className="bg-white/80 hover:bg-white"
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Image Counter */}
            {images.length > 1 && (
              <div className="absolute bottom-2 left-2 bg-black/60 text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                {currentIndex + 1} / {images.length}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Thumbnail Navigation */}
      {showThumbnails && images.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => goToImage(index)}
              className={`relative w-16 h-16 rounded overflow-hidden flex-shrink-0 transition-all ${
                index === currentIndex
                  ? 'ring-2 ring-emerald-500 opacity-100'
                  : 'opacity-60 hover:opacity-100'
              }`}
            >
              <Image
                src={image}
                alt={`Thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Viewer */}
      <FullscreenViewer
        images={images}
        currentIndex={currentIndex}
        isOpen={showFullscreen}
        onClose={() => setShowFullscreen(false)}
        onIndexChange={setCurrentIndex}
      />
    </div>
  )
}
