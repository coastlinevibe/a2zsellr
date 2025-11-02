"use client"

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ImageIcon, UploadCloud, Eye, Edit, Trash2, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ImageGallery } from '@/components/ui/carousel-circular-image-gallery'
import { ImageUploadGallery } from '@/components/ui/image-upload-gallery'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/lib/auth'

interface GalleryImage {
  id: string
  title: string
  url: string
  created_at?: string
}

interface UploadedImage {
  id: string
  file: File
  preview: string
  title: string
}

interface GalleryTabProps {
  galleryItems: any[]
  galleryLoading: boolean
  userTier: 'free' | 'premium' | 'business'
  onRefresh: () => void
}

export function GalleryTab({ galleryItems, galleryLoading, userTier, onRefresh }: GalleryTabProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [viewMode, setViewMode] = useState<'showcase' | 'upload' | 'manage'>('showcase')
  const [images, setImages] = useState<GalleryImage[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  // Convert gallery items to our format
  useEffect(() => {
    const convertedImages: GalleryImage[] = galleryItems.map((item, index) => ({
      id: item.id?.toString() || index.toString(),
      title: item.title || item.caption || `Image ${index + 1}`,
      url: item.image_url || item.media_url || '',
      created_at: item.created_at
    })).filter(img => img.url) // Only include items with valid URLs

    setImages(convertedImages)
  }, [galleryItems])

  const handleImageUpload = useCallback(async (uploadedImages: UploadedImage[]) => {
    if (!user?.id) return

    setUploading(true)
    setUploadError(null)

    try {
      const uploadPromises = uploadedImages.map(async (uploadedImage) => {
        // Upload file to Supabase Storage
        const fileExt = uploadedImage.file.name.split('.').pop()
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('gallery')
          .upload(fileName, uploadedImage.file)

        if (uploadError) throw uploadError

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('gallery')
          .getPublicUrl(fileName)

        // Save to database
        const { data: dbData, error: dbError } = await supabase
          .from('profile_gallery')
          .insert({
            profile_id: user.id,
            image_url: publicUrl,
            caption: uploadedImage.title
          })
          .select()
          .single()

        if (dbError) throw dbError

        return {
          id: dbData.id.toString(),
          title: uploadedImage.title,
          url: publicUrl,
          created_at: dbData.created_at
        }
      })

      const newImages = await Promise.all(uploadPromises)
      setImages(prev => [...prev, ...newImages])
      onRefresh() // Refresh the parent dashboard data
      setViewMode('showcase') // Switch back to showcase view
      
    } catch (error: any) {
      console.error('Error uploading images:', error)
      setUploadError(error.message || 'Failed to upload images')
    } finally {
      setUploading(false)
    }
  }, [user?.id, onRefresh])

  const handleDeleteImage = useCallback(async (imageId: string) => {
    if (!user?.id) return

    try {
      const { error } = await supabase
        .from('profile_gallery')
        .delete()
        .eq('id', imageId)
        .eq('profile_id', user.id)

      if (error) throw error

      setImages(prev => prev.filter(img => img.id !== imageId))
      onRefresh()
    } catch (error: any) {
      console.error('Error deleting image:', error)
    }
  }, [user?.id, onRefresh])

  if (galleryLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  const renderShowcaseView = () => {
    if (images.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <ImageIcon className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No gallery items yet</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Spotlight your services or portfolio. Upload high-impact visuals to convert visitors faster.
          </p>
          <Button 
            onClick={() => setViewMode('upload')} 
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <UploadCloud className="w-4 h-4 mr-2" />
            Upload Images
          </Button>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        {/* Gallery Showcase */}
        <ImageGallery images={images} className="rounded-xl" />
        
        {/* Gallery Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-medium text-gray-600">Total Images</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">{images.length}</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-600">Gallery Views</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">1,234</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-gray-600">Plan</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1 capitalize">{userTier}</p>
          </div>
        </div>
      </div>
    )
  }

  const renderUploadView = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Upload Images</h3>
            <p className="text-sm text-gray-600">Add new images to your gallery showcase</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => setViewMode('showcase')}
          >
            Back to Gallery
          </Button>
        </div>

        {uploadError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">{uploadError}</p>
          </div>
        )}

        <ImageUploadGallery
          tier={userTier}
          onImagesChange={handleImageUpload}
          disabled={uploading}
        />
        
        {uploading && (
          <div className="text-center py-8">
            <div className="inline-flex items-center gap-3 text-emerald-600">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
              <span className="text-lg font-medium">Uploading images to gallery...</span>
            </div>
            <p className="text-gray-500 mt-2">Please wait while we process your images</p>
          </div>
        )}
      </div>
    )
  }

  const renderManageView = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Manage Gallery</h3>
            <p className="text-sm text-gray-600">Edit titles and organize your images</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => setViewMode('showcase')}
          >
            Back to Gallery
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image) => (
            <div key={image.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="aspect-square bg-gray-100">
                <img
                  src={image.url}
                  alt={image.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <input
                  type="text"
                  value={image.title}
                  onChange={(e) => {
                    const newTitle = e.target.value
                    setImages(prev => prev.map(img => 
                      img.id === image.id ? { ...img, title: newTitle } : img
                    ))
                  }}
                  className="w-full text-sm border border-gray-200 rounded px-2 py-1 mb-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDeleteImage(image.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Gallery Showcase</h2>
          <p className="text-sm text-gray-600">Your visual portfolio powering your storefront and marketing campaigns.</p>
        </div>
        
        {images.length > 0 && viewMode === 'showcase' && (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setViewMode('manage')}
            >
              <Settings className="w-4 h-4 mr-2" />
              Manage
            </Button>
            <Button 
              onClick={() => setViewMode('upload')} 
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <UploadCloud className="w-4 h-4 mr-2" />
              Add Images
            </Button>
          </div>
        )}
      </div>

      {/* Content */}
      {viewMode === 'showcase' && renderShowcaseView()}
      {viewMode === 'upload' && renderUploadView()}
      {viewMode === 'manage' && renderManageView()}
    </div>
  )
}
