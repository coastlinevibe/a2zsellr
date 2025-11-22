"use client"

import { useState, useRef, useCallback, memo } from 'react'
import { Upload, X, Image as ImageIcon, AlertCircle, Crown, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface UploadedImage {
  id: string
  file: File
  preview: string
  title: string
}

interface ImageUploadGalleryProps {
  maxImages?: number
  onImagesChange: (images: UploadedImage[]) => void
  existingImages?: UploadedImage[]
  existingImagesCount?: number
  disabled?: boolean
  tier: 'free' | 'premium' | 'business'
  onUpgrade?: () => void
}

// Tier limits based on A2Z_DATA_MODELS.md
const TIER_LIMITS = {
  free: 3,
  premium: 8,
  business: 999 // Effectively unlimited
}

const TIER_FEATURES = {
  free: {
    name: 'Free',
    limit: 3,
    description: 'Basic gallery with up to 3 images'
  },
  premium: {
    name: 'Premium',
    limit: 8,
    description: 'Gallery slider showcase with up to 8 images'
  },
  business: {
    name: 'Business',
    limit: 12,
    description: 'Professional gallery with up to 12 images'
  }
}

// Beautiful overlay text box component
const ImageItem = memo(({ image, onRemove, onTitleChange, disabled }: {
  image: UploadedImage
  onRemove: (id: string) => void
  onTitleChange: (id: string, title: string) => void
  disabled: boolean
}) => {
  const [localTitle, setLocalTitle] = useState(image.title)
  const [isEditing, setIsEditing] = useState(false)

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value
    setLocalTitle(newTitle)
    onTitleChange(image.id, newTitle)
  }, [image.id, onTitleChange])

  const handleTitleSubmit = useCallback(() => {
    setIsEditing(false)
  }, [])

  return (
    <div className="relative group">
      <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 shadow-lg">
        <img
          src={image.preview}
          alt={image.title}
          className="w-full h-full object-cover"
        />
        
        {/* Beautiful Overlay Text Box */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent">
          <div className="absolute bottom-0 left-0 right-0 p-4">
            {isEditing ? (
              <input
                value={localTitle}
                onChange={handleTitleChange}
                onBlur={handleTitleSubmit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleTitleSubmit()
                  if (e.key === 'Escape') {
                    setLocalTitle(image.title)
                    setIsEditing(false)
                  }
                }}
                className="w-full bg-white/90 backdrop-blur-sm text-gray-900 px-3 py-2 rounded-lg border-0 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm font-medium placeholder-gray-500"
                placeholder="Enter image title..."
                disabled={disabled}
                autoFocus
              />
            ) : (
              <div
                onClick={() => !disabled && setIsEditing(true)}
                className={`text-white font-medium text-sm cursor-pointer bg-black/30 backdrop-blur-sm px-3 py-2 rounded-lg transition-all duration-200 ${
                  disabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-black/50'
                }`}
              >
                {localTitle || 'Click to add title...'}
              </div>
            )}
          </div>
        </div>

        {/* Remove Button */}
        <div className="absolute top-2 right-2">
          <Button
            onClick={() => onRemove(image.id)}
            variant="destructive"
            size="sm"
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 h-8 w-8 p-0 rounded-full bg-red-500 hover:bg-red-600 shadow-lg"
            disabled={disabled}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
})

ImageItem.displayName = 'ImageItem'

export function ImageUploadGallery({ 
  onImagesChange, 
  existingImages = [], 
  existingImagesCount = 0,
  disabled = false,
  tier = 'free',
  onUpgrade = () => {}
}: ImageUploadGalleryProps) {
  const [images, setImages] = useState<UploadedImage[]>(existingImages)
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const tierLimit = TIER_LIMITS[tier]
  const tierInfo = TIER_FEATURES[tier]

  const handleFiles = useCallback((files: FileList | File[]) => {
    setError(null)
    const fileArray = Array.from(files)
    
    // Calculate total images including existing ones in the gallery
    const totalExistingImages = existingImagesCount + images.length
    
    // Check if adding these files would exceed the limit
    if (totalExistingImages + fileArray.length > tierLimit) {
      setError(`You can only upload up to ${tierLimit} images with your ${tierInfo.name} plan. You currently have ${totalExistingImages} images.`)
      return
    }

    const newImages: UploadedImage[] = []
    
    fileArray.forEach((file) => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please only upload image files')
        return
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError('Images must be less than 5MB')
        return
      }

      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const preview = URL.createObjectURL(file)
      const title = file.name.split('.')[0]

      newImages.push({
        id,
        file,
        preview,
        title
      })
    })

    if (newImages.length > 0) {
      const updatedImages = [...images, ...newImages]
      setImages(updatedImages)
    }
  }, [images, tierLimit, tierInfo.name, existingImagesCount])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (disabled) return
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }, [disabled, handleFiles])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files)
    }
  }, [handleFiles])

  const removeImage = useCallback((id: string) => {
    setImages(prevImages => {
      const updatedImages = prevImages.filter(img => {
        if (img.id === id) {
          URL.revokeObjectURL(img.preview)
          return false
        }
        return true
      })
      return updatedImages
    })
  }, [])

  const updateImageTitle = useCallback((id: string, title: string) => {
    setImages(prevImages => 
      prevImages.map(img => 
        img.id === id ? { ...img, title } : img
      )
    )
  }, [])

  const openFileDialog = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const totalImages = existingImagesCount + images.length
  const canAddMore = totalImages < tierLimit && !disabled

  return (
    <div className="space-y-6">
      {/* Tier Information */}
      <div className="bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <ImageIcon className="w-5 h-5 text-emerald-600" />
          <h3 className="font-semibold text-emerald-900">{tierInfo.name} Gallery</h3>
          <span className="text-sm bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
            {totalImages}/{tierLimit} images
          </span>
        </div>
        <p className="text-sm text-emerald-700">{tierInfo.description}</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Upload Area */}
      {canAddMore && (
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-emerald-400 bg-emerald-50'
              : 'border-gray-300 hover:border-emerald-400 hover:bg-emerald-50'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={openFileDialog}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
            disabled={disabled}
          />
          
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
              <Upload className="w-8 h-8 text-emerald-600" />
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900">
                Drop images here or click to upload
              </p>
              <p className="text-sm text-gray-500 mt-1">
                PNG, JPG, GIF up to 5MB each • {tierLimit - totalImages} remaining
              </p>
              <p className="text-xs text-emerald-600 font-medium mt-2">
                📐 Recommended: 1500×400px
              </p>
            </div>
            <Button 
              type="button" 
              className="bg-emerald-600 hover:bg-emerald-700"
              disabled={disabled}
            >
              Choose Images
            </Button>
          </div>
        </div>
      )}

      {/* Image Thumbnails Grid */}
      {images.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900">Uploaded Images ({images.length})</h4>
            <Button 
              onClick={() => onImagesChange(images)}
              className="bg-emerald-600 hover:bg-emerald-700"
              disabled={disabled || images.length === 0}
            >
              Save Images
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image) => (
              <ImageItem
                key={image.id}
                image={image}
                onRemove={removeImage}
                onTitleChange={updateImageTitle}
                disabled={disabled}
              />
            ))}
          </div>
        </div>
      )}

      {/* Upgrade Prompt for Free Tier */}
      {tier === 'free' && totalImages >= tierLimit && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <ImageIcon className="w-5 h-5 text-blue-600" />
            <h4 className="font-semibold text-blue-900">Upgrade for More Images</h4>
          </div>
          <p className="text-sm text-blue-700 mb-3">
            You've reached the limit for free accounts. Upgrade to Premium or Business for unlimited gallery images.
          </p>
          <button onClick={onUpgrade} className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-black font-black py-3 px-4 rounded-lg border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.9)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,0.9)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-3">
            <Crown className="w-5 h-5" />
            <span>UPGRADE TO PREMIUM</span>
            <Star className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
