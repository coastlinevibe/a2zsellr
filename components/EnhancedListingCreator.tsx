'use client'

import { useState, useRef } from 'react'
import { Upload, X, Play, Pause, Volume2, VolumeX, Image as ImageIcon, Video, FileText, Link, Calendar, MapPin, Tag, Users, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { GallerySlider } from '@/components/ui/gallery-slider'
import Image from 'next/image'

interface MediaItem {
  id: string
  type: 'image' | 'video'
  url: string
  thumbnail?: string
  title?: string
  description?: string
}

interface EnhancedListingData {
  title: string
  description: string
  category: string
  location: string
  tags: string[]
  media: MediaItem[]
  price?: number
  currency: string
  availability: 'available' | 'limited' | 'sold_out'
  contact_info: {
    phone?: string
    email?: string
    website?: string
  }
  scheduling: {
    start_date?: string
    end_date?: string
    time_slots?: string[]
  }
  sharing_options: {
    platforms: string[]
    auto_share: boolean
    share_immediately: boolean
  }
}

interface EnhancedListingCreatorProps {
  onSave: (listing: EnhancedListingData) => void
  onCancel: () => void
  initialData?: Partial<EnhancedListingData>
  isEditing?: boolean
}

export function EnhancedListingCreator({ 
  onSave, 
  onCancel, 
  initialData = {}, 
  isEditing = false 
}: EnhancedListingCreatorProps) {
  const [listingData, setListingData] = useState<EnhancedListingData>({
    title: initialData.title || '',
    description: initialData.description || '',
    category: initialData.category || '',
    location: initialData.location || '',
    tags: initialData.tags || [],
    media: initialData.media || [],
    price: initialData.price,
    currency: initialData.currency || 'ZAR',
    availability: initialData.availability || 'available',
    contact_info: initialData.contact_info || {},
    scheduling: initialData.scheduling || {},
    sharing_options: initialData.sharing_options || {
      platforms: ['whatsapp', 'facebook'],
      auto_share: false,
      share_immediately: false
    }
  })

  const [currentTag, setCurrentTag] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  const handleMediaUpload = async (files: FileList, type: 'image' | 'video') => {
    const newMedia: MediaItem[] = []
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const mediaId = `${type}_${Date.now()}_${i}`
      
      // Simulate upload progress
      setUploadProgress(prev => ({ ...prev, [mediaId]: 0 }))
      
      // Create object URL for preview
      const url = URL.createObjectURL(file)
      
      // For videos, create thumbnail
      let thumbnail = undefined
      if (type === 'video') {
        thumbnail = await generateVideoThumbnail(file)
      }
      
      const mediaItem: MediaItem = {
        id: mediaId,
        type,
        url,
        thumbnail,
        title: file.name,
        description: ''
      }
      
      newMedia.push(mediaItem)
      
      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          const current = prev[mediaId] || 0
          if (current >= 100) {
            clearInterval(interval)
            return { ...prev, [mediaId]: 100 }
          }
          return { ...prev, [mediaId]: current + 10 }
        })
      }, 200)
    }
    
    setListingData(prev => ({
      ...prev,
      media: [...prev.media, ...newMedia]
    }))
  }

  const generateVideoThumbnail = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const video = document.createElement('video')
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      video.addEventListener('loadedmetadata', () => {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        video.currentTime = 1 // Get frame at 1 second
      })
      
      video.addEventListener('seeked', () => {
        if (ctx) {
          ctx.drawImage(video, 0, 0)
          const thumbnail = canvas.toDataURL('image/jpeg', 0.8)
          resolve(thumbnail)
        }
      })
      
      video.src = URL.createObjectURL(file)
    })
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    
    const files = e.dataTransfer.files
    const imageFiles: File[] = []
    const videoFiles: File[] = []
    
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        imageFiles.push(file)
      } else if (file.type.startsWith('video/')) {
        videoFiles.push(file)
      }
    })
    
    if (imageFiles.length > 0) {
      const fileList = new DataTransfer()
      imageFiles.forEach(file => fileList.items.add(file))
      handleMediaUpload(fileList.files, 'image')
    }
    
    if (videoFiles.length > 0) {
      const fileList = new DataTransfer()
      videoFiles.forEach(file => fileList.items.add(file))
      handleMediaUpload(fileList.files, 'video')
    }
  }

  const removeMedia = (id: string) => {
    setListingData(prev => ({
      ...prev,
      media: prev.media.filter(item => item.id !== id)
    }))
    
    // Clean up object URLs
    const mediaItem = listingData.media.find(item => item.id === id)
    if (mediaItem) {
      URL.revokeObjectURL(mediaItem.url)
      if (mediaItem.thumbnail) {
        URL.revokeObjectURL(mediaItem.thumbnail)
      }
    }
  }

  const addTag = () => {
    if (currentTag.trim() && !listingData.tags.includes(currentTag.trim())) {
      setListingData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }))
      setCurrentTag('')
    }
  }

  const removeTag = (tag: string) => {
    setListingData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }))
  }

  const togglePlatform = (platform: string) => {
    setListingData(prev => ({
      ...prev,
      sharing_options: {
        ...prev.sharing_options,
        platforms: prev.sharing_options.platforms.includes(platform)
          ? prev.sharing_options.platforms.filter(p => p !== platform)
          : [...prev.sharing_options.platforms, platform]
      }
    }))
  }

  const handleSave = () => {
    if (!listingData.title.trim() || !listingData.description.trim()) {
      alert('Please fill in required fields')
      return
    }
    
    onSave(listingData)
  }

  const categories = [
    'Restaurants', 'Retail', 'Services', 'Healthcare', 'Technology',
    'Automotive', 'Beauty & Wellness', 'Education', 'Entertainment',
    'Real Estate', 'Finance', 'Construction', 'Agriculture', 'Tourism'
  ]

  const locations = [
    'Johannesburg', 'Cape Town', 'Durban', 'Pretoria', 'Port Elizabeth',
    'Bloemfontein', 'East London', 'Nelspruit', 'Polokwane', 'Kimberley'
  ]

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Edit Enhanced Listing' : 'Create Enhanced Listing'}
        </h2>
        <Badge className="bg-emerald-100 text-emerald-800">Premium Feature</Badge>
      </div>

      <div className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              value={listingData.title}
              onChange={(e) => setListingData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Enter listing title..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={listingData.category}
              onChange={(e) => setListingData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">Select category...</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            value={listingData.description}
            onChange={(e) => setListingData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            rows={4}
            placeholder="Describe your listing in detail..."
          />
        </div>

        {/* Media Upload Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Media (Images & Videos)
          </label>
          
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              dragOver 
                ? 'border-emerald-500 bg-emerald-50' 
                : 'border-gray-300 hover:border-emerald-400'
            }`}
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault()
              setDragOver(true)
            }}
            onDragLeave={() => setDragOver(false)}
          >
            <div className="flex justify-center gap-4 mb-4">
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="flex items-center gap-2"
              >
                <ImageIcon className="w-4 h-4" />
                Upload Images
              </Button>
              <Button
                onClick={() => videoInputRef.current?.click()}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Video className="w-4 h-4" />
                Upload Videos
              </Button>
            </div>
            <p className="text-gray-500">
              Drag and drop files here, or click to browse
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Supports: JPG, PNG, GIF, MP4, MOV, AVI
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => e.target.files && handleMediaUpload(e.target.files, 'image')}
            className="hidden"
          />
          <input
            ref={videoInputRef}
            type="file"
            multiple
            accept="video/*"
            onChange={(e) => e.target.files && handleMediaUpload(e.target.files, 'video')}
            className="hidden"
          />
        </div>

        {/* Media Preview */}
        {listingData.media.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Media Preview</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {listingData.media.map((item) => (
                <div key={item.id} className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                    {item.type === 'image' ? (
                      <Image
                        src={item.url}
                        alt={item.title || 'Media'}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="relative w-full h-full">
                        {item.thumbnail ? (
                          <Image
                            src={item.thumbnail}
                            alt={item.title || 'Video thumbnail'}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <Video className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                          <Play className="w-8 h-8 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Upload Progress */}
                  {uploadProgress[item.id] !== undefined && uploadProgress[item.id] < 100 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="text-white text-sm">
                        {uploadProgress[item.id]}%
                      </div>
                    </div>
                  )}
                  
                  {/* Remove Button */}
                  <Button
                    onClick={() => removeMedia(item.id)}
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 hover:bg-white"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                  
                  {/* Media Type Badge */}
                  <Badge 
                    className={`absolute bottom-2 left-2 ${
                      item.type === 'video' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {item.type}
                  </Badge>
                </div>
              ))}
            </div>
            
            {/* Gallery Slider Preview */}
            {listingData.media.filter(m => m.type === 'image').length > 0 && (
              <div className="mt-6">
                <h4 className="text-md font-medium text-gray-900 mb-2">Gallery Preview</h4>
                <div className="max-w-md">
                  <GallerySlider
                    images={listingData.media.filter(m => m.type === 'image').map(m => m.url)}
                    showThumbnails={true}
                    autoPlay={false}
                    showControls={true}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={currentTag}
              onChange={(e) => setCurrentTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTag()}
              className="flex-1 p-2 border border-gray-300 rounded-lg"
              placeholder="Add tags..."
            />
            <Button onClick={addTag} variant="outline">
              <Tag className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {listingData.tags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="flex items-center gap-1"
              >
                {tag}
                <button onClick={() => removeTag(tag)}>
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>

        {/* Pricing & Availability */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price (Optional)
            </label>
            <div className="flex">
              <select
                value={listingData.currency}
                onChange={(e) => setListingData(prev => ({ ...prev, currency: e.target.value }))}
                className="p-3 border border-gray-300 rounded-l-lg border-r-0"
              >
                <option value="ZAR">ZAR</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
              <input
                type="number"
                value={listingData.price || ''}
                onChange={(e) => setListingData(prev => ({ ...prev, price: parseFloat(e.target.value) || undefined }))}
                className="flex-1 p-3 border border-gray-300 rounded-r-lg"
                placeholder="0.00"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <select
              value={listingData.location}
              onChange={(e) => setListingData(prev => ({ ...prev, location: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg"
            >
              <option value="">Select location...</option>
              {locations.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Availability
            </label>
            <select
              value={listingData.availability}
              onChange={(e) => setListingData(prev => ({ ...prev, availability: e.target.value as any }))}
              className="w-full p-3 border border-gray-300 rounded-lg"
            >
              <option value="available">Available</option>
              <option value="limited">Limited Stock</option>
              <option value="sold_out">Sold Out</option>
            </select>
          </div>
        </div>

        {/* Sharing Options */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Advanced Sharing Options
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Share to Platforms
              </label>
              <div className="flex gap-2 flex-wrap">
                {['whatsapp', 'facebook', 'instagram', 'twitter', 'linkedin'].map((platform) => (
                  <Button
                    key={platform}
                    onClick={() => togglePlatform(platform)}
                    variant={listingData.sharing_options.platforms.includes(platform) ? 'default' : 'outline'}
                    size="sm"
                    className={listingData.sharing_options.platforms.includes(platform) ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                  >
                    {platform.charAt(0).toUpperCase() + platform.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={listingData.sharing_options.auto_share}
                  onChange={(e) => setListingData(prev => ({
                    ...prev,
                    sharing_options: { ...prev.sharing_options, auto_share: e.target.checked }
                  }))}
                />
                <span className="text-sm text-gray-700">Auto-share on schedule</span>
              </label>
              
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={listingData.sharing_options.share_immediately}
                  onChange={(e) => setListingData(prev => ({
                    ...prev,
                    sharing_options: { ...prev.sharing_options, share_immediately: e.target.checked }
                  }))}
                />
                <span className="text-sm text-gray-700">Share immediately</span>
              </label>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-6 border-t">
          <Button
            onClick={handleSave}
            className="bg-emerald-600 hover:bg-emerald-700 flex-1"
          >
            {isEditing ? 'Update Listing' : 'Create Listing'}
          </Button>
          <Button
            onClick={onCancel}
            variant="outline"
            className="px-8"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}
