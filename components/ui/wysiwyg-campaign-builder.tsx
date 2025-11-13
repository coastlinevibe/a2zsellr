'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Upload, 
  X, 
  Eye, 
  Save, 
  ShoppingBag, 
  Image as ImageIcon, 
  Video, 
  FileText, 
  Grid3X3, 
  Layers, 
  Smartphone, 
  Monitor,
  Calendar,
  Clock,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  Info,
  Loader2,
  Play,
  Plus,
  CheckCircle2,
  Trash2,
  EyeOff,
  Crown,
  Star,
  MapPin,
  Phone,
  Globe,
  Mail,
  MessageCircle,
  Share2,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/lib/auth'
import { useGlobalNotifications } from '@/contexts/NotificationContext'
import { 
  GalleryMosaicLayout, 
  HoverCardsLayout, 
  BeforeAfterLayout, 
  VideoSpotlightLayout,
  HorizontalSliderLayout,
  VerticalSliderLayout,
  CustomTemplateLayout,
  type MediaItem
} from './campaign-layouts'
import DateTimePicker from '@/components/ui/date-time-picker'
import TemplateStorageManager from '@/lib/templateStorage'
import { uploadFileToStorage, type UploadResult } from '@/lib/uploadUtils'
import RichTextEditor from '@/components/ui/rich-text-editor'

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
  editListing?: any // Optional listing data for editing
}

const WYSIWYGCampaignBuilder = ({ products, selectedPlatforms, businessProfile, editListing }: WYSIWYGCampaignBuilderProps) => {
  const [campaignTitle, setCampaignTitle] = useState(editListing?.title || 'Mid-Month Growth Blast')
  const [selectedLayout, setSelectedLayout] = useState(editListing?.layout_type || 'gallery-mosaic')
  const [messageTemplate, setMessageTemplate] = useState(editListing?.message_template || 'Hey there! We just launched new services tailored for you. Tap to explore what\'s hot this week.')
  const [ctaLabel, setCtaLabel] = useState(editListing?.cta_label || 'View Offers')
  const [scheduleDate, setScheduleDate] = useState(() => {
    if (editListing?.scheduled_for) {
      const date = new Date(editListing.scheduled_for)
      // Convert to YYYY-MM-DDTHH:mm format expected by DateTimePicker
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      return `${year}-${month}-${day}T${hours}:${minutes}`
    }
    return ''
  })
  const [deliveryAvailable, setDeliveryAvailable] = useState(editListing?.delivery_available || false)
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null)
  const [isTemplateEditMode, setIsTemplateEditMode] = useState(false)

  // Handle template image upload
  const handleTemplateImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      // Use the existing sharelinks bucket with template-uploads subfolder
      const fileName = `template-${Date.now()}-${file.name}`
      const filePath = `template-uploads/${businessProfile?.id}/${fileName}`
      
      // Upload to Supabase storage using the sharelinks bucket
      const { data, error } = await supabase.storage
        .from('sharelinks')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        throw new Error(error.message)
      }

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('sharelinks')
        .getPublicUrl(filePath)

      if (publicUrl) {
        // Create template object with uploaded image
        setSelectedTemplate({
          id: `custom-${Date.now()}`,
          name: 'Custom Template',
          backgroundImage: publicUrl,
          interactions: []
        })
        
        showSuccess('Template image uploaded successfully!')
      } else {
        throw new Error('Failed to get public URL')
      }
    } catch (error: any) {
      console.error('Template image upload error:', error)
      showError('Failed to upload template image: ' + error.message)
    }
  }
  // IMPORTANT: selectedProducts should ALWAYS start empty - no auto-selection
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([])
  
  // Notification system
  const { showSuccess, showError } = useGlobalNotifications()
  
  // Force clear any auto-selected products on component mount
  React.useEffect(() => {
    if (selectedProducts.length > 0) {
      console.warn('DETECTED AUTO-SELECTED PRODUCTS - CLEARING THEM:', selectedProducts)
      setSelectedProducts([])
    }
  }, []) // Run only on mount

  // Initialize edit data when editListing is provided
  React.useEffect(() => {
    if (editListing) {
      console.log('Editing listing:', editListing)
      
      // Initialize selected products
      if (editListing.selected_products && editListing.selected_products.length > 0) {
        const selectedProductIds = editListing.selected_products
        const matchingProducts = products.filter(p => selectedProductIds.includes(p.id))
        setSelectedProducts(matchingProducts)
        console.log('Loaded selected products:', matchingProducts)
      }
      
      // Initialize uploaded media
      if (editListing.uploaded_media && editListing.uploaded_media.length > 0) {
        setUploadedMedia(editListing.uploaded_media)
        console.log('Loaded uploaded media:', editListing.uploaded_media)
      }
    }
  }, [editListing, products])
  const [showMediaSelector, setShowMediaSelector] = useState(false)
  const [uploadedMedia, setUploadedMedia] = useState<{id: string, name: string, url: string, type: string, storagePath?: string}[]>([])
  const [uploadingFiles, setUploadingFiles] = useState<string[]>([])
  
  // Debug: Log when products change to catch any auto-selection
  console.log('WYSIWYGCampaignBuilder - Available products:', products.length, 'Selected products:', selectedProducts.length)
  
  // Clean up duplicate listings function
  const cleanupDuplicateListings = async () => {
    try {
      const { data: duplicates, error } = await supabase
        .from('profile_listings')
        .select('id, title, created_at')
        .eq('profile_id', businessProfile?.id)
        .order('created_at', { ascending: false })
      
      if (error || !duplicates) return
      
      // Group by title and keep only the most recent
      const titleGroups: { [key: string]: any[] } = {}
      duplicates.forEach(listing => {
        if (!titleGroups[listing.title]) {
          titleGroups[listing.title] = []
        }
        titleGroups[listing.title].push(listing)
      })
      
      // Delete older duplicates
      for (const title in titleGroups) {
        const listings = titleGroups[title]
        if (listings.length > 1) {
          const toDelete = listings.slice(1) // Keep first (most recent), delete rest
          console.log(`Cleaning up ${toDelete.length} duplicate listings for title: ${title}`)
          
          for (const listing of toDelete) {
            await supabase
              .from('profile_listings')
              .delete()
              .eq('id', listing.id)
          }
        }
      }
    } catch (error) {
      console.error('Error cleaning up duplicates:', error)
    }
  }
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
    
    // Always use production domain for preview URLs
    const baseUrl = 'https://a2zsellr.life'
    
    return `${baseUrl}/${cleanDisplayName}/${cleanTitle}`
  }

  // Auto-generated URL based on current values
  const ctaUrl = generateCampaignUrl(
    businessProfile?.display_name || 'business', 
    campaignTitle
  )

  // Handle file upload with proper storage
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    const fileArray = Array.from(files)
    const currentMediaCount = uploadedMedia.length + selectedProducts.length
    const userTier = businessProfile?.subscription_tier || 'free'
    
    // Tier-based listing media limits
    const tierMediaLimits = {
      free: 3,
      premium: 8,
      business: 999
    }
    const LISTING_MEDIA_LIMIT = tierMediaLimits[userTier as keyof typeof tierMediaLimits] || 3

    // Check for video files and user tier
    const hasVideoFiles = fileArray.some(file => file.type.startsWith('video/'))
    if (hasVideoFiles && userTier === 'free') {
      alert('🎥 Video uploads are available for Premium and Business users only.\n\nUpgrade your plan to unlock video features!')
      // Reset the file input
      event.target.value = ''
      return
    }

    // Check if adding these files would exceed the 5-image limit for listings
    if (currentMediaCount + fileArray.length > LISTING_MEDIA_LIMIT) {
      alert(`You can only have up to ${LISTING_MEDIA_LIMIT} media items in a listing. You currently have ${currentMediaCount} items.`)
      // Reset the file input
      event.target.value = ''
      return
    }

    // Process files one by one
    for (const file of fileArray) {
      const fileId = `upload-${Date.now()}-${Math.random()}`
      
      try {
        // Add to uploading state
        setUploadingFiles(prev => [...prev, fileId])
        
        // Create temporary preview URL for immediate display
        const previewUrl = URL.createObjectURL(file)
        const tempMedia = {
          id: fileId,
          name: file.name,
          url: previewUrl,
          type: file.type
        }
        
        // Add to uploaded media with preview
        setUploadedMedia(prev => [...prev, tempMedia])
        
        // Upload to Supabase Storage
        const uploadResult: UploadResult = await uploadFileToStorage(
          file,
          'sharelinks',
          `campaign-uploads/${businessProfile?.id || 'anonymous'}`
        )
        
        if (uploadResult.success && uploadResult.url) {
          // Update media item with permanent URL
          setUploadedMedia(prev => prev.map(media => 
            media.id === fileId 
              ? { 
                  ...media, 
                  url: uploadResult.url!, 
                  storagePath: uploadResult.path 
                }
              : media
          ))
          
          // Clean up preview URL
          URL.revokeObjectURL(previewUrl)
        } else {
          // Remove failed upload
          setUploadedMedia(prev => prev.filter(media => media.id !== fileId))
          URL.revokeObjectURL(previewUrl)
          alert(`Failed to upload ${file.name}: ${uploadResult.error}`)
        }
        
      } catch (error: any) {
        console.error('Upload error:', error)
        setUploadedMedia(prev => prev.filter(media => media.id !== fileId))
        alert(`Failed to upload ${file.name}: ${error.message}`)
      } finally {
        // Remove from uploading state
        setUploadingFiles(prev => prev.filter(id => id !== fileId))
      }
    }

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
        // Clean up object URL if it's a blob URL
        if (mediaToRemove.url.startsWith('blob:')) {
          URL.revokeObjectURL(mediaToRemove.url)
        }
        // TODO: Also delete from Supabase Storage if needed
      }
      return prev.filter(m => m.id !== id)
    })
  }

  // Check for duplicate listing titles
  const checkDuplicateTitle = async (title: string): Promise<boolean> => {
    try {
      const { data: existingListings, error } = await supabase
        .from('profile_listings')
        .select('id, title, selected_products')
        .eq('profile_id', businessProfile?.id)
        .eq('title', title.trim())
      
      if (error) {
        console.error('Error checking duplicate titles:', error)
        return false // Allow save if check fails
      }
      
      if (existingListings && existingListings.length > 0) {
        console.log('Found existing listings with same title:', existingListings)
        return true
      }
      
      return false
    } catch (error) {
      console.error('Error checking duplicate titles:', error)
      return false // Allow save if check fails
    }
  }

  // Check if today is a restricted day for free tier
  const isRestrictedDay = () => {
    if (userTier !== 'free') return false
    
    const today = new Date().getDay() // 0=Sunday, 3=Wednesday, 6=Saturday
    return today === 0 || today === 3 || today === 6
  }

  const getRestrictedDayName = () => {
    const today = new Date().getDay()
    if (today === 0) return 'Sunday'
    if (today === 3) return 'Wednesday'
    if (today === 6) return 'Saturday'
    return ''
  }

  // Save listing to database
  const handleSaveDraft = async () => {
    // Check day-based restrictions for free tier
    if (isRestrictedDay()) {
      alert(`⚠️ Free tier users cannot create or share listings on ${getRestrictedDayName()}s.\n\nRestricted days: Wednesday, Saturday, Sunday\n\nPlease try again on Monday, Tuesday, Thursday, or Friday.\n\nUpgrade to Premium to share any day!`)
      return
    }

    // Validate required fields
    if (!campaignTitle.trim()) {
      alert('⚠️ Please enter a listing title')
      return
    }

    if (!messageTemplate.trim()) {
      alert('⚠️ Please enter a message template')
      return
    }

    // Enforce tier limits (only for new listings)
    if (!editListing) {
      const tierLimits = {
        free: 3,
        premium: 999, // Keep unlimited for listings
        business: 999
      }
      
      const currentLimit = tierLimits[userTier as keyof typeof tierLimits]
      
      // Check existing listings count
      const { data: existingListings, error: countError } = await supabase
        .from('profile_listings')
        .select('id')
        .eq('profile_id', businessProfile?.id)
      
      if (!countError && existingListings && existingListings.length >= currentLimit && userTier === 'free') {
        alert(`⚠️ Free tier is limited to ${currentLimit} listings.\n\nYou currently have ${existingListings.length} listings.\n\nPlease upgrade to Premium to create more listings.`)
        return
      }
    }

    // Check for duplicate title (only for new listings)
    if (!editListing) {
      const isDuplicate = await checkDuplicateTitle(campaignTitle.trim())
      if (isDuplicate) {
        const shouldContinue = confirm(
          `⚠️ A listing with the title "${campaignTitle}" already exists.\n\n` +
          `Do you want to create it anyway? This will create a duplicate listing.`
        )
        if (!shouldContinue) {
          return
        }
      }
    }

    // Prepare listing data with all required fields including media
    // IMPORTANT: Only save explicitly selected products, never auto-include any products
    const campaignData = {
        profile_id: businessProfile.id,
        title: campaignTitle.trim(),
        layout_type: selectedLayout,
        message_template: messageTemplate.trim(),
        target_platforms: selectedPlatforms,
        cta_label: ctaLabel.trim() || 'Learn More',
        cta_url: ctaUrl,
        scheduled_for: scheduleDate ? new Date(scheduleDate).toISOString() : null,
        status: scheduleDate ? 'scheduled' : 'active',
        // Fix: Use 'uploaded_media' instead of 'media_items' to match database schema
        uploaded_media: uploadedMedia.map(m => ({
          id: m.id,
          name: m.name,
          url: m.url,
          type: m.type,
          storage_path: m.storagePath
        })),
      // Only save products that were explicitly selected by user (never auto-select)
      selected_products: selectedProducts.length > 0 ? selectedProducts.map(p => p.id) : [],
      delivery_available: deliveryAvailable,
      // Save template data for custom templates
      template_data: selectedLayout === 'custom-template' && selectedTemplate ? {
        backgroundImage: selectedTemplate.backgroundImage,
        interactions: selectedTemplate.interactions || []
      } : null
    }
    
    // Debug: Log what we're saving to catch any unwanted auto-selection
    console.log('Saving listing with:', {
      title: campaignData.title,
      layout_type: campaignData.layout_type,
      selected_products_count: selectedProducts.length,
      selected_product_ids: campaignData.selected_products,
      uploaded_media_count: uploadedMedia.length,
      template_data: campaignData.template_data,
      selectedTemplate: selectedTemplate,
      isEditing: !!editListing
    })

    try {
      if (editListing) {
        // Update existing listing
        const { data: listing, error: listingError } = await supabase
          .from('profile_listings')
          .update(campaignData)
          .eq('id', editListing.id)
          .eq('profile_id', businessProfile.id)
          .select('id, title, selected_products, uploaded_media')
          .single()

        if (listingError) {
          console.error('Database update error:', listingError)
          throw new Error(`Failed to update listing: ${listingError.message}`)
        }

        console.log('Listing updated successfully:', listing)
        
        // Show success message
        showSuccess(
          `Listing "${campaignTitle}" updated successfully!`,
          `• ${uploadedMedia.length} files • ${selectedProducts.length} products • ${selectedLayout} layout • View in Marketing > My Listings tab!`
        )
      } else {
        // Create new listing
        const { data: listing, error: listingError } = await supabase
          .from('profile_listings')
          .insert(campaignData)
          .select('id, title, selected_products, uploaded_media')
          .single()

        if (listingError) {
          console.error('Database error:', listingError)
          throw new Error(`Failed to save listing: ${listingError.message}`)
        }

        console.log('Listing saved successfully:', listing)
        
        // Show success message
        showSuccess(
          `Listing "${campaignTitle}" saved successfully!`,
          `• ${uploadedMedia.length} files • ${selectedProducts.length} products • ${selectedLayout} layout • View in Marketing > My Listings tab!`
        )
      }
      
    } catch (error: any) {
      console.error('Error saving listing:', error)
      showError(
        'Error saving listing',
        `${error.message} - Check console for details.`
      )
    }
  }

  // Preview in Browser - only preview existing saved listings
  const handleBrowserPreview = async () => {
    // Check if listing already exists
    try {
      const { data: existingListing, error } = await supabase
        .from('profile_listings')
        .select('id, title')
        .eq('profile_id', businessProfile?.id)
        .eq('title', campaignTitle.trim())
        .single()
      
      if (error || !existingListing) {
        alert('⚠️ Please save your listing first using "Save Listing Draft", then try preview again.\n\nThe preview button only works for saved listings.')
        return
      }
      
      // Listing exists, open preview
      window.open(ctaUrl, '_blank')
      
    } catch (error) {
      console.error('Error checking for existing listing:', error)
      alert('⚠️ Please save your listing first using "Save Listing Draft", then try preview again.')
    }
  }

  const userTier = businessProfile?.subscription_tier || 'free'
  
  const layouts = [
    { id: 'gallery-mosaic', name: 'Gallery Mosaic', description: 'Grid layout with multiple images' },
    { id: 'hover-cards', name: 'Hover Cards', description: 'Interactive card layout' },
    { id: 'vertical-slider', name: 'Vertical Slider', description: 'Vertical scrolling layout' },
    { id: 'horizontal-slider', name: 'Horizontal Slider', description: 'Horizontal scrolling layout' },
    { 
      id: 'before-after', 
      name: userTier === 'free' ? 'Before & After (Premium Only)' : 'Before & After', 
      description: 'Comparison layout',
      disabled: userTier === 'free'
    },
    { 
      id: 'video-spotlight', 
      name: userTier === 'free' ? 'Video Spotlight (Premium Only)' : 'Video Spotlight', 
      description: 'Video-focused layout',
      disabled: userTier === 'free'
    }
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
    // CRITICAL: Only include products that were EXPLICITLY selected by user
    // Never auto-include any products from the available products list
    const productItems: MediaItem[] = selectedProducts.length > 0 ? selectedProducts.map(product => ({
      id: product.id,
      name: product.name,
      url: product.image_url || '',
      type: 'image/jpeg',
      price: product.price_cents ? product.price_cents / 100 : undefined
    })) : []

    // Only include media that was explicitly uploaded
    const uploadedItems: MediaItem[] = uploadedMedia.length > 0 ? uploadedMedia.map(media => ({
      id: media.id,
      name: media.name,
      url: media.url,
      type: media.type
    })) : []

    // Debug: Ensure we're not accidentally including unwanted items
    const totalItems = [...productItems, ...uploadedItems]
    console.log('getMediaItems result:', {
      selectedProducts: selectedProducts.length,
      uploadedMedia: uploadedMedia.length,
      totalMediaItems: totalItems.length,
      productItems: productItems.length,
      uploadedItems: uploadedItems.length
    })

    // Return only explicitly selected/uploaded items - NEVER auto-include anything
    return totalItems
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
      businessName: businessName,
      ratingAverage: businessProfile?.average_rating ?? null,
      ratingCount: businessProfile?.review_count ?? 0,
      deliveryAvailable
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
      case 'custom-template':
        console.log('Rendering CustomTemplateLayout with:', { 
          selectedTemplate, 
          backgroundImage: selectedTemplate?.backgroundImage,
          isEditMode: isTemplateEditMode 
        })
        
        // Fallback if no template
        if (!selectedTemplate) {
          return (
            <div className="w-full h-[500px] bg-red-100 flex items-center justify-center">
              <div className="text-center text-red-600">
                <p className="font-bold">No Template Selected</p>
                <p className="text-sm">Please upload a template image</p>
              </div>
            </div>
          )
        }
        
        return <CustomTemplateLayout 
          {...commonProps} 
          selectedTemplate={selectedTemplate}
          isEditMode={isTemplateEditMode}
          onInteractionAdd={(element) => {
            console.log('Adding interaction:', element)
          }}
          onInteractionEdit={(id, element) => {
            console.log('Editing interaction:', id, element)
          }}
        />
      default:
        return <GalleryMosaicLayout {...commonProps} />
    }
  }

  const previewData = generatePreviewMessage()

  return (
    <div className="space-y-4">
      {/* Day Restriction Warning for Free Tier */}
      {userTier === 'free' && isRestrictedDay() && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-red-600" />
              <div>
                <h4 className="font-semibold text-red-900">Listing Creation Restricted Today</h4>
                <p className="text-sm text-red-700 mt-1">
                  Free tier users cannot create or share listings on {getRestrictedDayName()}s. Restricted days: Wednesday, Saturday, Sunday.
                </p>
                <p className="text-sm text-red-600 mt-2 font-medium">
                  ✅ Available days: Monday, Tuesday, Thursday, Friday • Upgrade to Premium to share any day!
                </p>
              </div>
            </div>
            <button className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-black font-black py-3 px-4 rounded-lg border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.9)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,0.9)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-3 whitespace-nowrap">
              <Crown className="w-5 h-5" />
              <span>UPGRADE TO PREMIUM</span>
              <Star className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel - Listing Builder */}
        <div className="bg-blue-600 rounded-[9px] p-6 text-white">
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-2">Listing Builder</h2>
            <p className="text-blue-100 text-sm">{editListing ? 'Edit your existing listing' : 'Create beautiful listings to showcase your products and services.'}</p>
            {editListing && (
              <div className="mt-3 p-3 bg-yellow-500/20 border border-yellow-400 rounded-lg">
                <p className="text-yellow-100 text-sm font-medium">✏️ Editing: {editListing.title}</p>
              </div>
            )}
          </div>

        <div className="space-y-6">
          {/* Listing Title */}
          <div>
            <label className="block text-sm font-medium text-blue-100 mb-2">Listing title</label>
            <input
              type="text"
              value={campaignTitle}
              onChange={(e) => setCampaignTitle(e.target.value)}
              className="w-full p-3 bg-blue-500 border border-blue-400 rounded-[9px] text-white placeholder-blue-200 focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
              placeholder="e.g., Special Offer - 20% Off All Items"
            />
          </div>

          {/* Layout Selection */}
          <div>
            <label className="block text-sm font-medium text-blue-100 mb-2">Layout</label>
            <select
              value={selectedLayout}
              onChange={(e) => {
                if (e.target.value === 'video-spotlight' && userTier === 'free') {
                  alert('🎥 Video Spotlight is available for Premium and Business users only.\n\nUpgrade your plan to unlock video features!')
                  return
                }
                if (e.target.value === 'before-after' && userTier === 'free') {
                  alert('📸 Before & After layout is available for Premium and Business users only.\n\nUpgrade your plan to unlock comparison features!')
                  return
                }
                setSelectedLayout(e.target.value)
              }}
              className="w-full p-3 bg-blue-500 border border-blue-400 rounded-[9px] text-white focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
            >
              <option value="gallery-mosaic">Gallery Mosaic</option>
              <option value="hover-cards">Hover Cards</option>
              <option value="horizontal-slider">Horizontal Slider</option>
              <option value="vertical-slider">Vertical Slider</option>
              {userTier !== 'free' && <option value="before-after">Before & After</option>}
              {userTier !== 'free' && <option value="video-spotlight">Video Spotlight</option>}
              {userTier !== 'free' && <option value="custom-template">🎨 Custom Template</option>}
            </select>
          </div>

          {/* Template Image Upload - Only show when custom-template is selected */}
          {selectedLayout === 'custom-template' && (
            <div>
              <label className="block text-sm font-medium text-blue-100 mb-3">Upload Template Image</label>
              <div className="bg-blue-500 border border-blue-400 rounded-[9px] p-4">
                <div className="mb-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleTemplateImageUpload}
                    className="hidden"
                    id="template-image-upload"
                  />
                  <label
                    htmlFor="template-image-upload"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg border-2 border-blue-300 font-bold cursor-pointer transition-all flex items-center justify-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    {selectedTemplate?.backgroundImage ? 'Change Template Image' : 'Upload Template Image'}
                  </label>
                  
                  {selectedTemplate?.backgroundImage && (
                    <div className="mt-3 p-3 bg-blue-400 rounded-lg">
                      <div className="text-white text-sm font-bold mb-2">Template Image Uploaded ✓</div>
                      <img 
                        src={selectedTemplate.backgroundImage} 
                        alt="Template background"
                        className="w-full h-20 object-cover rounded"
                      />
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsTemplateEditMode(!isTemplateEditMode)}
                    disabled={!selectedTemplate?.backgroundImage}
                    className={`px-3 py-2 rounded text-xs font-bold transition-all ${
                      isTemplateEditMode
                        ? 'bg-yellow-500 text-black'
                        : selectedTemplate?.backgroundImage
                        ? 'bg-green-600 text-white hover:bg-green-500'
                        : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                    }`}
                  >
                    {isTemplateEditMode ? '✏️ Exit Edit Mode' : '✏️ Add Buttons (Click X,Y)'}
                  </button>
                  
                  {selectedTemplate?.backgroundImage && (
                    <button 
                      onClick={() => setSelectedTemplate(null)}
                      className="px-3 py-2 bg-red-600 text-white rounded text-xs font-bold hover:bg-red-500"
                    >
                      🗑️ Remove Image
                    </button>
                  )}
                </div>
                
                {isTemplateEditMode && selectedTemplate?.backgroundImage && (
                  <div className="mt-3 p-3 bg-yellow-100 text-yellow-800 rounded-lg text-xs">
                    <strong>Edit Mode Active:</strong> Click anywhere on the template image to add interactive buttons (products, contact, info)
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Message Template - Hide when using custom template */}
          {selectedLayout !== 'custom-template' && (
            <div>
              <label className="block text-sm font-medium text-blue-100 mb-3">Message template</label>
              <RichTextEditor
                value={messageTemplate}
                onChange={(value: string) => setMessageTemplate(value)}
                placeholder="Craft a compelling message with rich formatting, links, and highlights..."
                maxLength={1000}
                className="bg-blue-500/60 border border-blue-400 rounded-[9px] text-white placeholder-blue-200 focus-within:ring-2 focus-within:ring-blue-300 focus-within:border-blue-300"
              />
            </div>
          )}

          {/* Media Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-blue-100">Listing Media</label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-blue-200">
                  📐 1200×800px
                </span>
                <span className="text-xs bg-blue-400 text-blue-100 px-2 py-1 rounded-full">
                  {uploadedMedia.length + selectedProducts.length}/{userTier === 'free' ? 3 : userTier === 'premium' ? 8 : 999} items
                </span>
                {businessProfile?.subscription_tier === 'free' && (
                  <span className="text-xs bg-yellow-500 text-yellow-900 px-2 py-1 rounded-full">
                    Images only
                  </span>
                )}
              </div>
            </div>
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
                            <ImageIcon className="w-4 h-4 text-blue-600" />
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
                    {uploadedMedia.map((media) => {
                      const isUploading = uploadingFiles.includes(media.id)
                      return (
                        <div key={media.id} className="bg-emerald-400 rounded-[6px] p-2 flex items-center gap-2">
                          {isUploading ? (
                            <div className="w-8 h-8 bg-emerald-300 rounded flex items-center justify-center">
                              <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
                            </div>
                          ) : media.type.startsWith('image/') ? (
                            <img src={media.url} alt={media.name} className="w-8 h-8 object-cover rounded" />
                          ) : (
                            <div className="w-8 h-8 bg-emerald-300 rounded flex items-center justify-center">
                              <Play className="w-4 h-4 text-emerald-600" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium text-white truncate">{media.name}</div>
                            {isUploading && (
                              <div className="text-xs text-emerald-200">Uploading...</div>
                            )}
                          </div>
                          <button
                            onClick={() => removeUploadedMedia(media.id)}
                            className="text-emerald-200 hover:text-white"
                            disabled={isUploading}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
              
              {/* Media Selection Buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowMediaSelector(!showMediaSelector)}
                  variant="outline"
                  className="border-blue-300 text-blue-100 hover:bg-blue-500 rounded-[9px] flex-1"
                  disabled={(uploadedMedia.length + selectedProducts.length) >= (userTier === 'free' ? 3 : userTier === 'premium' ? 8 : 999)}
                >
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Select from Shop ({products.length} items)
                </Button>
                <Button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingFiles.length > 0 || (uploadedMedia.length + selectedProducts.length) >= (userTier === 'free' ? 3 : userTier === 'premium' ? 8 : 999)}
                  className="bg-blue-500 hover:bg-blue-400 text-white border border-blue-400 rounded-[9px] flex-1 disabled:opacity-50"
                >
                  {uploadingFiles.length > 0 ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading ({uploadingFiles.length})
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Upload Media
                    </>
                  )}
                </Button>
              </div>

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={businessProfile?.subscription_tier === 'free' ? 'image/*' : 'image/*,video/*'}
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
                              const currentMediaCount = uploadedMedia.length + selectedProducts.length
                              const LISTING_MEDIA_LIMIT = userTier === 'free' ? 3 : userTier === 'premium' ? 8 : 999
                              
                              if (currentMediaCount >= LISTING_MEDIA_LIMIT) {
                                alert(`You can only have up to ${LISTING_MEDIA_LIMIT} media items in a listing. You currently have ${currentMediaCount} items.`)
                                return
                              }
                              
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
                              <ImageIcon className="w-5 h-5 text-blue-600" />
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

          {/* Delivery Options */}
          <div>
            <label className="block text-sm font-medium text-blue-100 mb-2">Delivery options</label>
            <div className="flex items-center justify-between bg-blue-500/60 border border-blue-400 rounded-[9px] px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-white">Delivery available</p>
                <p className="text-xs text-blue-200">Highlight that customers can get this item delivered.</p>
              </div>
              <Switch
                checked={deliveryAvailable}
                onCheckedChange={setDeliveryAvailable}
                className="data-[state=checked]:bg-emerald-500"
              />
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
                placeholder="e.g., Shop Now"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-100 mb-2">Auto-Generated URL</label>
              <div className="w-full p-3 bg-blue-700 border border-blue-500 rounded-[9px] text-blue-100 text-sm font-mono break-all">
                {ctaUrl ? ctaUrl : 'https://example.com'}
              </div>
              <p className="text-xs text-blue-200 mt-1">✨ URL automatically generated from business name + listing title</p>
            </div>
          </div>

          {/* Schedule */}
          <div>
            <label className="block text-sm font-medium text-blue-100 mb-2">Schedule (optional)</label>
            <DateTimePicker
              value={scheduleDate}
              onChange={setScheduleDate}
              className="w-full"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-4">
            <Button
              onClick={handleSaveDraft}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-[9px] flex-1"
            >
              <Save className="w-4 h-4 mr-2" />
              {editListing ? 'Update Listing' : scheduleDate ? 'Schedule Listing' : 'Post Listing'}
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
            {scheduleDate ? 'Listing will be scheduled for the selected date.' : 'Listing will be posted immediately to selected platforms.'}
          </p>
        </div>
      </div>

      {/* Right Panel - Live Preview */}
      {selectedLayout === 'custom-template' ? (
        // Full template view - ABSOLUTE NO SPACING
        <div className="w-full h-full">
          {renderLayoutPreview()}
        </div>
      ) : (
        // Regular preview with header and UI elements
        <div className="bg-blue-600 rounded-[9px] p-6 text-white">
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-2">Live Preview</h2>
            <p className="text-blue-100 text-sm">See how your campaign renders with the selected layout.</p>
          </div>

          {/* Layout Preview */}
          <div className="bg-white rounded-[9px] p-4">
            <div>
              {renderLayoutPreview()}
            </div>
            
            <div className="text-center mt-4">
              <Button
                className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-[9px] text-xs"
              >
                <Calendar className="w-3 h-3" />
                Send instantly or add a schedule above
              </Button>
            </div>
            
            <p className="text-xs text-blue-200 mt-4">
              {scheduleDate ? 'Scheduled listing will be sent at the specified time.' : 'Ready to post immediately or add a schedule above.'}
            </p>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}
export default WYSIWYGCampaignBuilder
