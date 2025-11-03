'use client'

import React, { useState, useRef } from 'react'
import { 
  MessageCircle, 
  Eye,
  Calendar,
  Send,
  Save,
  Settings,
  Image,
  Link,
  Type,
  Palette,
  Layout,
  Grid,
  Layers,
  Play,
  X,
  ShoppingBag,
  Plus,
  CheckCircle2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  GalleryMosaicLayout,
  HoverCardsLayout,
  BeforeAfterLayout,
  VideoSpotlightLayout,
  HorizontalSliderLayout,
  VerticalSliderLayout,
  type MediaItem
} from '@/components/ui/campaign-layouts'

interface Product {
  id: string
  name: string
  description: string | null
  price_cents: number | null
  image_url: string | null
  category: string | null
}

interface WYSIWYGCampaignBuilderProps {
  products: Product[]
  selectedPlatforms: string[]
  businessProfile: any
}

const WYSIWYGCampaignBuilder = ({ products, selectedPlatforms, businessProfile }: WYSIWYGCampaignBuilderProps) => {
  const [campaignTitle, setCampaignTitle] = useState('Mid-Month Growth Blast')
  const [selectedLayout, setSelectedLayout] = useState('gallery-mosaic')
  const [messageTemplate, setMessageTemplate] = useState('Hey there! We just launched new services tailored for you. Tap to explore what\'s hot this week.')
  const [ctaLabel, setCtaLabel] = useState('View Offers')
  const [scheduleDate, setScheduleDate] = useState('')
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([])
  const [showMediaSelector, setShowMediaSelector] = useState(false)
  const [uploadedMedia, setUploadedMedia] = useState<{id: string, name: string, url: string, type: string}[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Auto-generate URL based on business profile and campaign title
  const generateCampaignUrl = (displayName: string, title: string) => {
    const cleanDisplayName = displayName
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
    
    const cleanTitle = title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
    
    return `https://a2z-sellr.life/${cleanDisplayName}/${cleanTitle}`
  }

  // Auto-generated URL based on current values
  const ctaUrl = generateCampaignUrl(
    businessProfile?.display_name || 'business', 
    campaignTitle
  )

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    Array.from(files).forEach((file) => {
      // Validate file type
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        alert('Please select only image or video files')
        return
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB')
        return
      }

      // Create preview URL
      const url = URL.createObjectURL(file)
      const newMedia = {
        id: `upload-${Date.now()}-${Math.random()}`,
        name: file.name,
        url: url,
        type: file.type
      }

      setUploadedMedia(prev => [...prev, newMedia])
    })

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Remove uploaded media
  const removeUploadedMedia = (id: string) => {
    setUploadedMedia(prev => {
      const mediaToRemove = prev.find(m => m.id === id)
      if (mediaToRemove) {
        URL.revokeObjectURL(mediaToRemove.url) // Clean up object URL
      }
      return prev.filter(m => m.id !== id)
    })
  }

  // Save campaign draft
  const handleSaveDraft = async () => {
    if (!campaignTitle.trim()) {
      alert('❌ Please enter a campaign title.')
      return
    }

    if (!businessProfile?.id) {
      alert('❌ Business profile not found. Please refresh and try again.')
      return
    }

    try {
      // Import supabase client
      const { supabase } = await import('@/lib/supabaseClient')
      
      // Prepare campaign data with all required fields
      const campaignData = {
        profile_id: businessProfile.id,
        title: campaignTitle.trim(),
        layout_type: selectedLayout,
        message_template: messageTemplate.trim(),
        target_platforms: selectedPlatforms,
        cta_label: ctaLabel.trim() || 'Learn More',
        cta_url: ctaUrl,
        scheduled_for: scheduleDate ? new Date(scheduleDate).toISOString() : null,
        status: 'draft' as const
        // Removed url_slug - let database handle it with DEFAULT
      }

      // Save campaign to database - try marketing_campaigns first
      const { data: campaign, error: campaignError } = await supabase
        .from('marketing_campaigns')
        .insert(campaignData)
        .select()
        .single()

      if (campaignError) {
        console.error('Database error:', campaignError)
        throw new Error(`Failed to save campaign: ${campaignError.message}`)
      }

      console.log('Campaign saved successfully:', campaign)
      
      // Show success message
      alert(`✅ Campaign "${campaignTitle}" saved to database!\n\n` +
            `ID: ${campaign.id}\n` +
            `Layout: ${selectedLayout}\n` +
            `Media Items: ${selectedProducts.length + uploadedMedia.length}\n` +
            `Platforms: ${selectedPlatforms.join(', ')}\n\n` +
            `You can view it in the Marketing > Campaigns tab!`)
      
    } catch (error: any) {
      console.error('Error saving campaign:', error)
      alert(`❌ Error saving campaign: ${error.message}\n\nCheck console for details.`)
    }
  }

  // Preview in Browser - opens campaign URL directly
  const handleBrowserPreview = () => {
    // Open the campaign URL directly in a new tab for testing
    window.open(ctaUrl, '_blank')
  }

  const layouts = [
    { id: 'gallery-mosaic', name: 'Gallery Mosaic', description: 'Grid layout with multiple images' },
    { id: 'hover-cards', name: 'Hover Cards', description: 'Interactive card layout' },
    { id: 'vertical-slider', name: 'Vertical Slider', description: 'Vertical scrolling layout' },
    { id: 'horizontal-slider', name: 'Horizontal Slider', description: 'Horizontal scrolling layout' },
    { id: 'before-after', name: 'Before & After', description: 'Comparison layout' },
    { id: 'video-spotlight', name: 'Video Spotlight', description: 'Video-focused layout' }
  ]

  const generatePreviewMessage = () => {
    const businessName = businessProfile?.display_name || 'A2Z'
    return {
      sender: businessName,
      title: campaignTitle,
      type: 'Broadcast • ' + layouts.find(l => l.id === selectedLayout)?.name.toLowerCase(),
      message: messageTemplate,
      layout: selectedLayout,
      cta: ctaLabel,
      url: ctaUrl
    }
  }

  // Convert products and uploaded media to MediaItem format
  const getMediaItems = (): MediaItem[] => {
    const productItems: MediaItem[] = selectedProducts.map(product => ({
      id: product.id,
      name: product.name,
      url: product.image_url || '',
      type: 'image/jpeg',
      price: product.price_cents ? product.price_cents / 100 : undefined
    }))

    const uploadedItems: MediaItem[] = uploadedMedia.map(media => ({
      id: media.id,
      name: media.name,
      url: media.url,
      type: media.type
    }))

    return [...productItems, ...uploadedItems]
  }

  // Render the appropriate layout component
  const renderLayoutPreview = () => {
    const mediaItems = getMediaItems()
    const businessName = businessProfile?.display_name || 'A2Z'
    
    const commonProps = {
      items: mediaItems,
      title: campaignTitle,
      message: messageTemplate,
      ctaLabel: ctaLabel,
      ctaUrl: ctaUrl,
      businessName: businessName
    }

    switch (selectedLayout) {
      case 'gallery-mosaic':
        return <GalleryMosaicLayout {...commonProps} />
      case 'hover-cards':
        return <HoverCardsLayout {...commonProps} />
      case 'before-after':
        return <BeforeAfterLayout {...commonProps} />
      case 'video-spotlight':
        return <VideoSpotlightLayout {...commonProps} />
      case 'horizontal-slider':
        return <HorizontalSliderLayout {...commonProps} />
      case 'vertical-slider':
        return <VerticalSliderLayout {...commonProps} />
      default:
        return <GalleryMosaicLayout {...commonProps} />
    }
  }

  const previewData = generatePreviewMessage()

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Panel - Campaign Builder */}
      <div className="bg-blue-600 rounded-[9px] p-6 text-white">
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2">Multi-Platform Campaign Builder</h2>
          <p className="text-blue-100 text-sm">Create campaigns for WhatsApp, Facebook, Instagram & LinkedIn in one canvas.</p>
        </div>

        <div className="space-y-6">
          {/* Campaign Title */}
          <div>
            <label className="block text-sm font-medium text-blue-100 mb-2">Campaign title</label>
            <input
              type="text"
              value={campaignTitle}
              onChange={(e) => setCampaignTitle(e.target.value)}
              className="w-full p-3 bg-blue-500 border border-blue-400 rounded-[9px] text-white placeholder-blue-200 focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
              placeholder="Enter campaign title"
            />
          </div>

          {/* Layout Selection */}
          <div>
            <label className="block text-sm font-medium text-blue-100 mb-2">Layout</label>
            <select
              value={selectedLayout}
              onChange={(e) => setSelectedLayout(e.target.value)}
              className="w-full p-3 bg-blue-500 border border-blue-400 rounded-[9px] text-white focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
            >
              {layouts.map((layout) => (
                <option key={layout.id} value={layout.id} className="bg-blue-600">
                  {layout.name}
                </option>
              ))}
            </select>
          </div>

          {/* Message Template */}
          <div>
            <label className="block text-sm font-medium text-blue-100 mb-2">Message template</label>
            <textarea
              value={messageTemplate}
              onChange={(e) => setMessageTemplate(e.target.value)}
              rows={4}
              className="w-full p-3 bg-blue-500 border border-blue-400 rounded-[9px] text-white placeholder-blue-200 focus:ring-2 focus:ring-blue-300 focus:border-blue-300 resize-none"
              placeholder="Enter your message template"
            />
          </div>

          {/* Media Selection */}
          <div>
            <label className="block text-sm font-medium text-blue-100 mb-2">Campaign Media</label>
            <div className="space-y-3">
              {/* Selected Products Display */}
              {selectedProducts.length > 0 && (
                <div className="bg-blue-500 rounded-[9px] p-3">
                  <div className="text-sm text-blue-100 mb-2">Selected Items ({selectedProducts.length})</div>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedProducts.map((product) => (
                      <div key={product.id} className="bg-blue-400 rounded-[6px] p-2 flex items-center gap-2">
                        {product.image_url ? (
                          <img src={product.image_url} alt={product.name} className="w-8 h-8 object-cover rounded" />
                        ) : (
                          <div className="w-8 h-8 bg-blue-300 rounded flex items-center justify-center">
                            <Image className="w-4 h-4 text-blue-600" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-white truncate">{product.name}</div>
                        </div>
                        <button
                          onClick={() => setSelectedProducts(prev => prev.filter(p => p.id !== product.id))}
                          className="text-blue-200 hover:text-white"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Uploaded Media Display */}
              {uploadedMedia.length > 0 && (
                <div className="bg-emerald-500 rounded-[9px] p-3">
                  <div className="text-sm text-emerald-100 mb-2">Uploaded Media ({uploadedMedia.length})</div>
                  <div className="grid grid-cols-2 gap-2">
                    {uploadedMedia.map((media) => (
                      <div key={media.id} className="bg-emerald-400 rounded-[6px] p-2 flex items-center gap-2">
                        {media.type.startsWith('image/') ? (
                          <img src={media.url} alt={media.name} className="w-8 h-8 object-cover rounded" />
                        ) : (
                          <div className="w-8 h-8 bg-emerald-300 rounded flex items-center justify-center">
                            <Play className="w-4 h-4 text-emerald-600" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-white truncate">{media.name}</div>
                        </div>
                        <button
                          onClick={() => removeUploadedMedia(media.id)}
                          className="text-emerald-200 hover:text-white"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Media Selection Buttons */}
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={() => setShowMediaSelector(!showMediaSelector)}
                  className="bg-blue-500 hover:bg-blue-400 text-white border border-blue-400 rounded-[9px] flex-1"
                >
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Select from Shop ({products.length} items)
                </Button>
                <Button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-blue-500 hover:bg-blue-400 text-white border border-blue-400 rounded-[9px] flex-1"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Upload Media
                </Button>
              </div>

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              {/* Shop Products Selector */}
              {showMediaSelector && (
                <div className="bg-blue-500 rounded-[9px] p-3 max-h-60 overflow-y-auto">
                  <div className="text-sm text-blue-100 mb-3">Select items from your shop:</div>
                  <div className="grid grid-cols-1 gap-2">
                    {products.map((product) => {
                      const isSelected = selectedProducts.some(p => p.id === product.id)
                      return (
                        <div
                          key={product.id}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedProducts(prev => prev.filter(p => p.id !== product.id))
                            } else {
                              setSelectedProducts(prev => [...prev, product])
                            }
                          }}
                          className={`flex items-center gap-3 p-2 rounded-[6px] cursor-pointer transition-colors ${
                            isSelected 
                              ? 'bg-emerald-500 text-white' 
                              : 'bg-blue-400 hover:bg-blue-300 text-white'
                          }`}
                        >
                          {product.image_url ? (
                            <img src={product.image_url} alt={product.name} className="w-10 h-10 object-cover rounded" />
                          ) : (
                            <div className="w-10 h-10 bg-blue-300 rounded flex items-center justify-center">
                              <Image className="w-5 h-5 text-blue-600" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{product.name}</div>
                            <div className="text-xs opacity-75">
                              {product.price_cents 
                                ? `R${(product.price_cents / 100).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`
                                : 'Price on request'
                              }
                            </div>
                          </div>
                          {isSelected && <CheckCircle2 className="w-5 h-5 text-white" />}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* CTA Configuration */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-blue-100 mb-2">CTA label</label>
              <input
                type="text"
                value={ctaLabel}
                onChange={(e) => setCtaLabel(e.target.value)}
                className="w-full p-3 bg-blue-500 border border-blue-400 rounded-[9px] text-white placeholder-blue-200 focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
                placeholder="Button text"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-100 mb-2">Auto-Generated URL</label>
              <div className="w-full p-3 bg-blue-700 border border-blue-500 rounded-[9px] text-blue-100 text-sm font-mono break-all">
                {ctaUrl}
              </div>
              <p className="text-xs text-blue-200 mt-1">✨ URL automatically generated from business name + campaign title</p>
            </div>
          </div>

          {/* Schedule */}
          <div>
            <label className="block text-sm font-medium text-blue-100 mb-2">Schedule (optional)</label>
            <input
              type="datetime-local"
              value={scheduleDate}
              onChange={(e) => setScheduleDate(e.target.value)}
              className="w-full p-3 bg-blue-500 border border-blue-400 rounded-[9px] text-white focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-4">
            <Button 
              onClick={handleSaveDraft}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-[9px] flex-1"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Campaign Draft
            </Button>
            <Button 
              onClick={handleBrowserPreview}
              variant="outline" 
              className="border-blue-300 text-blue-100 hover:bg-blue-500 rounded-[9px]"
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview in Browser
            </Button>
          </div>

          <p className="text-xs text-blue-200 text-center">
            Draft autosaves every few minutes.
          </p>
        </div>
      </div>

      {/* Right Panel - Live Preview */}
      <div className="bg-blue-600 rounded-[9px] p-6 text-white">
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2">Live Preview</h2>
          <p className="text-blue-100 text-sm">See how your campaign renders with the selected layout.</p>
        </div>

        {/* Layout Preview */}
        <div className="bg-white rounded-[9px] p-4">
          {renderLayoutPreview()}
          
          <div className="text-center mt-4">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-[9px] text-xs">
              <Calendar className="w-3 h-3" />
              Send instantly or add a schedule above
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WYSIWYGCampaignBuilder
