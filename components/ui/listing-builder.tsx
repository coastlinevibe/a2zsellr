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
  Sword,
  MapPin,
  Phone,
  Globe,
  Mail,
  MessageCircle,
  MessageSquare,
  Share2,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { ConfirmationPopup } from '@/components/ui/ConfirmationPopup'
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
} from './listing-layouts'
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

interface ListingBuilderProps {
  products: Product[]
  selectedPlatforms: string[]
  businessProfile: any
  editListing?: any // Optional listing data for editing
  onRefresh?: () => void
  userTier?: 'free' | 'premium' | 'business'
  onGoToListings?: () => void // Callback to navigate to My Listings tab
  onUpgrade?: () => void // Callback to open upgrade modal
}

const ListingBuilder = ({ products, selectedPlatforms, businessProfile, editListing, onRefresh, userTier = 'free', onGoToListings, onUpgrade }: ListingBuilderProps) => {
  const [campaignTitle, setCampaignTitle] = useState(editListing?.title || 'Mid-Month Growth Blast')
  const [selectedLayout, setSelectedLayout] = useState(editListing?.layout_type || 'gallery-mosaic')
  const [messageTemplate, setMessageTemplate] = useState(editListing?.message_template || 'Hey there! We just launched new services tailored for you. Tap to explore what\'s hot this week.')
  const [ctaLabel, setCtaLabel] = useState(editListing?.cta_label || 'View Offers')
  const [whatsappInviteLink, setWhatsappInviteLink] = useState(editListing?.whatsapp_invite_link || '')
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
  
  // Video and Menu state
  const [videoUrl, setVideoUrl] = useState('')
  const [videoType, setVideoType] = useState<'youtube' | 'upload'>('youtube')
  const [menuImage, setMenuImage] = useState<{id: string, url: string, name?: string} | null>(null)
  const [useGlobalVideo, setUseGlobalVideo] = useState(false)
  const [useGlobalMenu, setUseGlobalMenu] = useState(false)
  const [uploadingVideo, setUploadingVideo] = useState(false)
  const [uploadingMenuImage, setUploadingMenuImage] = useState(false)

  // Confirmation popup state
  const [showDuplicateConfirm, setShowDuplicateConfirm] = useState(false)
  const [pendingListingData, setPendingListingData] = useState<any>(null)

  // POPI consent toggle state
  const [enableMessageConsent, setEnableMessageConsent] = useState(editListing?.enable_message_consent !== false)

  // Save as template state - default to true for custom templates
  const [saveAsTemplate, setSaveAsTemplate] = useState(editListing?.layout_type === 'custom-template' ? editListing?.is_template !== false : false)

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

      // Initialize video data
      if (editListing.video_url) {
        setVideoUrl(editListing.video_url)
        setVideoType(editListing.video_type || 'youtube')
      }

      // Initialize menu data
      if (editListing.menu_images && editListing.menu_images.length > 0) {
        setMenuImage(editListing.menu_images[0])
      }

      // Initialize template data for custom templates
      if (editListing.template_data) {
        console.log('Loading template data:', editListing.template_data)
        setSelectedTemplate(editListing.template_data)
        setIsTemplateEditMode(true)
      }
    }
  }, [editListing, products])

  // Auto-enable saveAsTemplate when custom-template layout is selected
  React.useEffect(() => {
    if (selectedLayout === 'custom-template') {
      setSaveAsTemplate(true)
    }
  }, [selectedLayout])

  // Initialize global preferences and load global content
  React.useEffect(() => {
    if (businessProfile) {
      // Set toggle states from profile preferences
      setUseGlobalVideo(businessProfile.use_global_video || false)
      setUseGlobalMenu(businessProfile.use_global_menu || false)

      // For new listings (not editing), load global content if preferences are enabled
      if (!editListing) {
        if (businessProfile.use_global_video && businessProfile.global_video_url) {
          setVideoUrl(businessProfile.global_video_url)
          setVideoType(businessProfile.global_video_type || 'youtube')
        }

        if (businessProfile.use_global_menu && businessProfile.global_menu_images) {
          const globalMenuImages = Array.isArray(businessProfile.global_menu_images) 
            ? businessProfile.global_menu_images 
            : JSON.parse(businessProfile.global_menu_images || '[]')
          if (globalMenuImages.length > 0) {
            setMenuImage(globalMenuImages[0])
          }
        }
      }
    }
  }, [businessProfile, editListing])

  // Load global preferences from business profile
  React.useEffect(() => {
    if (businessProfile) {
      setUseGlobalVideo(businessProfile.use_global_video || false)
      setUseGlobalMenu(businessProfile.use_global_menu || false)
      console.log('Loaded global preferences:', {
        video: businessProfile.use_global_video,
        menu: businessProfile.use_global_menu
      })
    }
  }, [businessProfile])
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
  // If single product is selected, link to that product
  // If multiple products are selected, link to profile
  // Generate CTA URL based on media and product selection
  const ctaUrl = (() => {
    const baseUrl = 'https://a2zsellr.life'
    const displayName = businessProfile?.display_name || 'business'
    const profileSlug = encodeURIComponent(displayName.toLowerCase().trim())
    
    // Check if there are videos
    const hasVideo = uploadedMedia.some(media => media.type?.startsWith('video/'))
    
    // Rule 1: Image only (no products, no videos) → profile view page
    if (uploadedMedia.length > 0 && !hasVideo && selectedProducts.length === 0) {
      return `${baseUrl}/profile/${profileSlug}`
    }
    
    // Rule 2: Single product → link to that product
    if (selectedProducts.length === 1) {
      const product = selectedProducts[0]
      const productSlug = product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
      return `${baseUrl}/profile/${profileSlug}?product=${encodeURIComponent(productSlug)}`
    }
    
    // Rule 3: Multiple products → profile view page
    if (selectedProducts.length > 1) {
      return `${baseUrl}/profile/${profileSlug}`
    }
    
    // Rule 4: Video or nothing → profile view page
    return `${baseUrl}/profile/${profileSlug}`
  })()

  // Handle file upload with proper storage
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    // Prevent media upload if products are selected
    if (selectedProducts.length > 0) {
      showError(
        'You cannot add media when products are selected',
        'Remove all products first to add media files'
      )
      event.target.value = ''
      return
    }

    const fileArray = Array.from(files)
    const currentMediaCount = uploadedMedia.length + selectedProducts.length
    const userTier = businessProfile?.subscription_tier || 'free'
    
    // Tier-based listing media limits
    const tierMediaLimits = {
      free: 3,
      premium: 8,
      business: 12
    }
    const LISTING_MEDIA_LIMIT = tierMediaLimits[userTier as keyof typeof tierMediaLimits] || 3

    // Check for video files and user tier
    const hasVideoFiles = fileArray.some(file => file.type.startsWith('video/'))
    if (hasVideoFiles && userTier === 'free') {
      showError(
        '🎥 Video uploads are available for Premium and Business users only',
        'Upgrade your plan to unlock video features!'
      )
      // Reset the file input
      event.target.value = ''
      return
    }

    // Check if adding these files would exceed the 5-image limit for listings
    if (currentMediaCount + fileArray.length > LISTING_MEDIA_LIMIT) {
      showError(
        `You can only have up to ${LISTING_MEDIA_LIMIT} media items in a listing`,
        `You currently have ${currentMediaCount} items.`
      )
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

  // Video upload handler
  const handleVideoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('video/')) {
      alert('Please select a video file')
      return
    }

    setUploadingVideo(true)
    try {
      const fileName = `video-${Date.now()}-${file.name}`
      const filePath = `video_uploads/${businessProfile?.id}/${fileName}`
      
      const { data, error } = await supabase.storage
        .from('sharelinks')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from('sharelinks')
        .getPublicUrl(filePath)

      setVideoUrl(publicUrl)
      setVideoType('upload')
      showSuccess('Video uploaded successfully!')
    } catch (error: any) {
      console.error('Video upload error:', error)
      showError('Failed to upload video: ' + error.message)
    } finally {
      setUploadingVideo(false)
      if (event.target) event.target.value = ''
    }
  }

  // Menu image upload handler (single image)
  const handleMenuImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    setUploadingMenuImage(true)
    try {
      const fileName = `menu-${Date.now()}-${file.name}`
      const filePath = `menu_uploads/${businessProfile?.id}/${fileName}`
      
      const { data, error } = await supabase.storage
        .from('gallery')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from('gallery')
        .getPublicUrl(filePath)

      setMenuImage({
        id: `menu-${Date.now()}`,
        url: publicUrl,
        name: file.name.replace(/\.[^/.]+$/, '') // Remove extension
      })
      
      showSuccess('Menu image uploaded successfully!')
    } catch (error: any) {
      console.error('Menu image upload error:', error)
      showError('Failed to upload menu image: ' + error.message)
    } finally {
      setUploadingMenuImage(false)
      if (event.target) event.target.value = ''
    }
  }

  // Remove menu image
  const removeMenuImage = () => {
    setMenuImage(null)
  }

  // Extract YouTube video ID from URL
  const getYouTubeVideoId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return match && match[2].length === 11 ? match[2] : null
  }

  // Handle global preference toggle
  const handleGlobalToggle = async (type: 'video' | 'menu', enabled: boolean) => {
    try {
      const updateData: any = {}
      
      if (type === 'video') {
        updateData.use_global_video = enabled
        if (enabled && videoUrl.trim()) {
          // Save current video as global when enabling
          updateData.global_video_url = videoUrl.trim()
          updateData.global_video_type = videoType
        } else if (enabled && businessProfile?.global_video_url) {
          // Load existing global video when enabling
          setVideoUrl(businessProfile.global_video_url)
          setVideoType(businessProfile.global_video_type || 'youtube')
        }
        setUseGlobalVideo(enabled)
      } else if (type === 'menu') {
        updateData.use_global_menu = enabled
        if (enabled && menuImage) {
          // Save current menu as global when enabling
          updateData.global_menu_images = [menuImage]
        } else if (enabled && businessProfile?.global_menu_images) {
          // Load existing global menu when enabling
          const globalMenuImages = Array.isArray(businessProfile.global_menu_images) 
            ? businessProfile.global_menu_images 
            : JSON.parse(businessProfile.global_menu_images || '[]')
          if (globalMenuImages.length > 0) {
            setMenuImage(globalMenuImages[0])
          }
        }
        setUseGlobalMenu(enabled)
      }

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', businessProfile?.id)

      if (error) throw error

      showSuccess(`Global ${type} ${enabled ? 'enabled' : 'disabled'}!`)
    } catch (error: any) {
      console.error(`Error updating global ${type} preference:`, error)
      showError(`Failed to update global ${type} preference: ${error.message}`)
    }
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

  // Prepare campaign data for saving
  const prepareCampaignData = () => {
    // Ensure WhatsApp link is a full URL (not relative)
    let whatsappLink = whatsappInviteLink.trim()
    if (whatsappLink && !whatsappLink.startsWith('http://') && !whatsappLink.startsWith('https://')) {
      // If it doesn't start with http, assume it's a relative path and don't save it
      console.warn('⚠️ WhatsApp link must be a full URL starting with http:// or https://')
      whatsappLink = null
    }
    
    const campaignData = {
      profile_id: businessProfile.id,
      title: campaignTitle.trim(),
      layout_type: selectedLayout,
      message_template: messageTemplate.trim(),
      target_platforms: selectedPlatforms,
      cta_label: ctaLabel.trim() || 'Learn More',
      cta_url: ctaUrl,
      whatsapp_invite_link: whatsappLink || null,
      scheduled_for: scheduleDate ? new Date(scheduleDate).toISOString() : null,
      status: scheduleDate ? 'scheduled' : 'active',
      uploaded_media: uploadedMedia.map(m => ({
        id: m.id,
        name: m.name,
        url: m.url,
        type: m.type,
        storage_path: m.storagePath
      })),
      selected_products: selectedProducts.length > 0 ? selectedProducts.map(p => p.id) : [],
      delivery_available: deliveryAvailable,
      template_data: selectedLayout === 'custom-template' && selectedTemplate ? {
        backgroundImage: selectedTemplate.backgroundImage,
        interactions: selectedTemplate.interactions || []
      } : null,
      video_url: videoUrl.trim() || null,
      video_type: videoUrl.trim() ? videoType : null,
      menu_images: menuImage ? [menuImage] : null,
      enable_message_consent: enableMessageConsent,
      is_template: saveAsTemplate
    }
    
    // Debug: Log the exact data being saved
    console.log('📊 CAMPAIGN DATA BEING SAVED:', {
      title: campaignData.title,
      whatsapp_invite_link: campaignData.whatsapp_invite_link,
      whatsappInviteLink_state: whatsappInviteLink,
      campaignTitle_state: campaignTitle,
      isFullUrl: whatsappLink ? whatsappLink.startsWith('http') : 'N/A'
    })
    
    return campaignData
  }

  // Actually save the listing to database
  const performSave = async (campaignData: any) => {
    try {
      // CRITICAL VALIDATION: Ensure WhatsApp link is not in title field
      if (campaignData.title && campaignData.title.includes('chat.whatsapp.com')) {
        console.error('❌ CRITICAL ERROR: WhatsApp link detected in title field!')
        showError(
          'Data validation error',
          'WhatsApp link was detected in the title field. This should not happen. Please contact support.'
        )
        return
      }
      
      console.log('Saving listing with:', {
        title: campaignData.title,
        layout_type: campaignData.layout_type,
        selected_products_count: selectedProducts.length,
        selected_product_ids: campaignData.selected_products,
        uploaded_media_count: uploadedMedia.length,
        template_data: campaignData.template_data,
        selectedTemplate: selectedTemplate,
        isEditing: !!editListing,
        is_template: campaignData.is_template,
        saveAsTemplate: saveAsTemplate,
        whatsapp_invite_link: campaignData.whatsapp_invite_link
      })

      if (editListing) {
        // Update existing listing
        console.log('🔄 UPDATING listing with data:', campaignData)
        const { data: listing, error: listingError } = await supabase
          .from('profile_listings')
          .update(campaignData)
          .eq('id', editListing.id)
          .eq('profile_id', businessProfile.id)
          .select('id, title, selected_products, uploaded_media, whatsapp_invite_link')
          .single()

        if (listingError) {
          console.error('Database update error:', listingError)
          throw new Error(`Failed to update listing: ${listingError.message}`)
        }

        console.log('✅ Listing updated successfully:', listing)
        console.log('📊 Saved data verification:', {
          title: listing?.title,
          whatsapp_invite_link: listing?.whatsapp_invite_link
        })
        
        showSuccess(
          `Listing "${campaignTitle}" updated successfully!`,
          `• ${uploadedMedia.length} files • ${selectedProducts.length} products • ${selectedLayout} layout • View in Marketing > My Listings tab!`
        )
        
        if (onRefresh) {
          onRefresh()
        }
      } else {
        // Create new listing
        console.log('➕ CREATING new listing with data:', campaignData)
        const { data: listing, error: listingError } = await supabase
          .from('profile_listings')
          .insert(campaignData)
          .select('id, title, selected_products, uploaded_media, whatsapp_invite_link')
          .single()

        if (listingError) {
          console.error('Database error:', listingError)
          throw new Error(`Failed to save listing: ${listingError.message}`)
        }

        console.log('✅ Listing saved successfully:', listing)
        console.log('📊 Saved data verification:', {
          title: listing?.title,
          whatsapp_invite_link: listing?.whatsapp_invite_link
        })
        
        if (saveAsTemplate) {
          showSuccess(
            `Template "${campaignTitle}" saved successfully!`,
            `✨ Your custom template has been saved and will appear in My Templates tab!`
          )
        } else {
          showSuccess(
            `Listing "${campaignTitle}" saved successfully!`,
            `• ${uploadedMedia.length} files • ${selectedProducts.length} products • ${selectedLayout} layout • View in Marketing > My Listings tab!`
          )
        }
        
        if (onRefresh) {
          onRefresh()
        }
      }
    } catch (error: any) {
      console.error('Error saving listing:', error)
      showError(
        'Error saving listing',
        `${error.message} - Check console for details.`
      )
    }
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
        premium: 8,
        business: 20
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
        setShowDuplicateConfirm(true)
        return
      }
    }

    // Prepare and save the listing
    const campaignData = prepareCampaignData()
    await performSave(campaignData)
  }

  // Go to My Listings tab
  const handleGoToListings = () => {
    if (onGoToListings) {
      onGoToListings()
    }
  }
  
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
      businessCategory: businessProfile?.business_category ?? null,
      ratingAverage: businessProfile?.average_rating ?? null,
      ratingCount: businessProfile?.review_count ?? 0,
      deliveryAvailable,
      whatsappInviteLink: whatsappInviteLink || null
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
            <button 
              onClick={onUpgrade}
              className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-black font-black py-3 px-6 rounded-lg border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.9)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,0.9)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-3"
            >
              <Sword className="w-5 h-5" />
              <span>Upgrade Now</span>
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
              {(userTier === 'business' || userTier === 'premium') && <option value="custom-template">🎨 Custom Template</option>}
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

          {/* Video Section - Premium and Business tiers only */}
          {(userTier === 'premium' || userTier === 'business') && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-blue-100">Campaign Video</label>
              <div className="flex items-center gap-3">
                <span className="text-xs text-blue-200">Optional</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-blue-200">Use Global:</span>
                  <Switch
                    checked={useGlobalVideo}
                    onCheckedChange={(checked) => handleGlobalToggle('video', checked)}
                    className="data-[state=checked]:bg-yellow-500"
                  />
                </div>
              </div>
            </div>
            
            <div className="bg-blue-500 border border-blue-400 rounded-[9px] p-4 space-y-4">
              {/* Video Type Selection */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setVideoType('youtube')}
                  className={`flex-1 p-2 rounded text-sm font-medium transition-colors ${
                    videoType === 'youtube'
                      ? 'bg-red-600 text-white'
                      : 'bg-blue-400 text-blue-100 hover:bg-blue-300'
                  }`}
                >
                  📺 YouTube Link
                </button>
                <button
                  type="button"
                  onClick={() => setVideoType('upload')}
                  className={`flex-1 p-2 rounded text-sm font-medium transition-colors ${
                    videoType === 'upload'
                      ? 'bg-green-600 text-white'
                      : 'bg-blue-400 text-blue-100 hover:bg-blue-300'
                  }`}
                >
                  📁 Upload Video
                </button>
              </div>

              {/* YouTube URL Input */}
              {videoType === 'youtube' && (
                <div>
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full p-3 bg-blue-400 border border-blue-300 rounded text-white placeholder-blue-200 focus:ring-2 focus:ring-blue-200 focus:border-blue-200"
                  />
                  <p className="text-xs text-blue-200 mt-1">Paste your YouTube video URL</p>
                </div>
              )}

              {/* Video Upload */}
              {videoType === 'upload' && (
                <div>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    disabled={uploadingVideo}
                    className="hidden"
                    id="video-upload"
                  />
                  <label
                    htmlFor="video-upload"
                    className={`w-full p-3 rounded border-2 border-dashed border-blue-300 text-center cursor-pointer transition-colors flex items-center justify-center gap-2 ${
                      uploadingVideo
                        ? 'bg-blue-400 text-blue-200 cursor-not-allowed'
                        : 'bg-blue-400 hover:bg-blue-300 text-white'
                    }`}
                  >
                    {uploadingVideo ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Uploading video...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        {videoUrl ? 'Change Video' : 'Upload Video File'}
                      </>
                    )}
                  </label>
                  {videoUrl && videoType === 'upload' && (
                    <div className="mt-2 p-2 bg-green-500 rounded text-white text-sm">
                      ✅ Video uploaded successfully
                    </div>
                  )}
                </div>
              )}

              {/* Video Preview */}
              {videoUrl && (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-100">Preview:</span>
                    <button
                      onClick={() => {
                        setVideoUrl('')
                        setVideoType('youtube')
                      }}
                      className="text-xs bg-red-500 hover:bg-red-400 text-white px-2 py-1 rounded"
                    >
                      Remove
                    </button>
                  </div>
                  {videoType === 'youtube' ? (
                    <div className="space-y-2">
                      {(() => {
                        const videoId = getYouTubeVideoId(videoUrl)
                        if (videoId) {
                          return (
                            <div className="relative w-full h-0 pb-[56.25%] bg-black rounded overflow-hidden">
                              <iframe
                                className="absolute top-0 left-0 w-full h-full"
                                src={`https://www.youtube.com/embed/${videoId}`}
                                title="YouTube video preview"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            </div>
                          )
                        } else {
                          return (
                            <div className="text-sm text-red-200 bg-red-500/50 p-2 rounded">
                              ⚠️ Invalid YouTube URL. Please check the link.
                            </div>
                          )
                        }
                      })()}
                      <div className="text-xs text-blue-200 bg-blue-400 p-2 rounded">
                        🎬 YouTube: {videoUrl}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <video
                        className="w-full h-auto max-h-48 bg-black rounded"
                        controls
                        preload="metadata"
                      >
                        <source src={videoUrl} type="video/mp4" />
                        <source src={videoUrl} type="video/webm" />
                        <source src={videoUrl} type="video/ogg" />
                        Your browser does not support the video tag.
                      </video>
                      <div className="text-xs text-blue-200 bg-blue-400 p-2 rounded">
                        📹 Uploaded video ready
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          )}

          {/* Menu Section - Business tier only */}
          {userTier === 'business' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-blue-100">Menu Image</label>
              <div className="flex items-center gap-3">
                <span className="text-xs text-blue-200">Optional</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-blue-200">Use Global:</span>
                  <Switch
                    checked={useGlobalMenu}
                    onCheckedChange={(checked) => handleGlobalToggle('menu', checked)}
                    className="data-[state=checked]:bg-yellow-500"
                  />
                </div>
              </div>
            </div>
            
            <div className="bg-blue-500 border border-blue-400 rounded-[9px] p-4 space-y-4">
              {/* Menu Upload */}
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleMenuImageUpload}
                  disabled={uploadingMenuImage}
                  className="hidden"
                  id="menu-upload"
                />
                <label
                  htmlFor="menu-upload"
                  className={`w-full p-3 rounded border-2 border-dashed border-blue-300 text-center cursor-pointer transition-colors flex items-center justify-center gap-2 ${
                    uploadingMenuImage
                      ? 'bg-blue-400 text-blue-200 cursor-not-allowed'
                      : 'bg-blue-400 hover:bg-blue-300 text-white'
                  }`}
                >
                  {uploadingMenuImage ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading menu image...
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-4 h-4" />
                      {menuImage ? 'Change Menu Image' : 'Upload Menu Image'}
                    </>
                  )}
                </label>
                <p className="text-xs text-blue-200 mt-1">Upload a single image of your menu</p>
              </div>

              {/* Menu Image Preview */}
              {menuImage && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-100">Menu Preview</span>
                    <button
                      onClick={removeMenuImage}
                      className="text-xs bg-red-500 hover:bg-red-400 text-white px-2 py-1 rounded"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="relative group">
                    <img
                      src={menuImage.url}
                      alt={menuImage.name || 'Menu'}
                      className="w-full h-32 object-cover rounded"
                    />
                    {menuImage.name && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-2 rounded-b truncate">
                        {menuImage.name}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
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
                  {(() => {
                    if (selectedProducts.length > 0) {
                      // Showing products - display product count and limit
                      const productLimits = { free: 2, premium: 3, business: 4 }
                      const maxProducts = productLimits[userTier as keyof typeof productLimits]
                      return `${selectedProducts.length}/${maxProducts} products`
                    } else {
                      // Showing images - display image count and limit
                      const tierMediaLimits = { free: 3, premium: 8, business: 12 }
                      const maxImages = tierMediaLimits[userTier as keyof typeof tierMediaLimits] || 3
                      return `${uploadedMedia.length}/${maxImages} images`
                    }
                  })()}
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
                  disabled={(() => {
                    const productLimits = { free: 2, premium: 3, business: 4 }
                    const maxProducts = productLimits[userTier as keyof typeof productLimits]
                    const mediaLimit = userTier === 'free' ? 3 : userTier === 'premium' ? 8 : 999
                    const currentMediaCount = uploadedMedia.length + selectedProducts.length
                    return selectedProducts.length >= maxProducts || currentMediaCount >= mediaLimit
                  })()}
                >
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Select from Shop ({products.length} items)
                </Button>
                <Button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingFiles.length > 0 || selectedProducts.length > 0 || (uploadedMedia.length + selectedProducts.length) >= (userTier === 'free' ? 3 : userTier === 'premium' ? 8 : 999)}
                  className="bg-blue-500 hover:bg-blue-400 text-white border border-blue-400 rounded-[9px] flex-1 disabled:opacity-50"
                  title={selectedProducts.length > 0 ? "Remove products first to add media" : ""}
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
                              // Check product limit per tier
                              const productLimits = {
                                free: 2,
                                premium: 3,
                                business: 4
                              }
                              const maxProducts = productLimits[userTier as keyof typeof productLimits]
                              
                              if (selectedProducts.length >= maxProducts) {
                                showError(
                                  `You can only add up to ${maxProducts} product${maxProducts > 1 ? 's' : ''} per listing on ${userTier === 'free' ? 'Free' : userTier === 'premium' ? 'Premium' : 'Business'} tier`,
                                  'Product Limit Reached'
                                )
                                return
                              }
                              
                              const currentMediaCount = uploadedMedia.length + selectedProducts.length
                              const LISTING_MEDIA_LIMIT = userTier === 'free' ? 3 : userTier === 'premium' ? 8 : 999
                              
                              if (currentMediaCount >= LISTING_MEDIA_LIMIT) {
                                showError(
                                  `You can only have up to ${LISTING_MEDIA_LIMIT} total media items in a listing. You currently have ${currentMediaCount} items.`,
                                  'Media Limit Reached'
                                )
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

          {/* POPI Consent Toggle */}
          <div>
            <label className="block text-sm font-medium text-blue-100 mb-2">Message consent (POPI)</label>
            <div className="flex items-center justify-between bg-blue-500/60 border border-blue-400 rounded-[9px] px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-white">Show message consent popup</p>
                <p className="text-xs text-blue-200">Display "wants to share a message with you" popup when listing is opened.</p>
              </div>
              <Switch
                checked={enableMessageConsent}
                onCheckedChange={setEnableMessageConsent}
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
            <div>
              <label className="block text-sm font-medium text-blue-100 mb-2">WhatsApp Group Invite Link (optional)</label>
              <input
                type="url"
                value={whatsappInviteLink}
                onChange={(e) => setWhatsappInviteLink(e.target.value)}
                className="w-full p-3 bg-blue-500 border border-blue-400 rounded-[9px] text-white placeholder-blue-200 focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
                placeholder="e.g., https://chat.whatsapp.com/..."
              />
              <p className="text-xs text-blue-200 mt-1">💬 Add a WhatsApp group invite link to let customers join your group directly from the listing</p>
            </div>
          </div>

          {/* Schedule */}
          {userTier === 'free' ? (
            <div className="bg-blue-500/30 border border-blue-400 rounded-[9px] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-blue-100">Listing Scheduling</p>
                  <p className="text-xs text-blue-200 mt-1">Available on Premium & Business tiers</p>
                </div>
                <button
                  onClick={onUpgrade}
                  className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-black font-black py-2 px-4 rounded-lg border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.9)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,0.9)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 text-xs"
                >
                  <Crown className="w-3 h-3" />
                  UPGRADE
                  <Star className="w-2 h-2" />
                </button>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-blue-100 mb-2">Schedule (optional)</label>
              <DateTimePicker
                value={scheduleDate}
                onChange={setScheduleDate}
                className="w-full"
              />
            </div>
          )}

          {/* Save as Template Option */}
          {selectedLayout === 'custom-template' && (
            <div className="flex items-center justify-between bg-blue-500/60 border border-blue-400 rounded-[9px] px-4 py-3 mb-4">
              <div>
                <p className="text-sm font-semibold text-white">Save as Template</p>
                <p className="text-xs text-blue-200">Save this custom template to reuse later</p>
              </div>
              <Switch
                checked={saveAsTemplate}
                onCheckedChange={setSaveAsTemplate}
                className="data-[state=checked]:bg-emerald-500"
              />
            </div>
          )}

          {/* Debug Info - Show what will be saved */}
          <div className="bg-blue-500/40 border border-blue-300 rounded-[9px] p-3 mb-4">
            <p className="text-xs font-bold text-blue-100 mb-2">📋 Data to be saved:</p>
            <div className="text-xs text-blue-200 space-y-1 font-mono">
              <div>Title: <span className="text-white">{campaignTitle || '(empty)'}</span></div>
              <div>WhatsApp Link: <span className="text-white">{whatsappInviteLink || '(empty)'}</span></div>
              <div>Layout: <span className="text-white">{selectedLayout}</span></div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-4">
            <Button
              onClick={handleSaveDraft}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-[9px] flex-1"
            >
              <Save className="w-4 h-4 mr-2" />
              {editListing ? 'Update Listing' : saveAsTemplate ? 'Save as Template' : scheduleDate ? 'Schedule Listing' : 'Post Listing'}
            </Button>
            <Button
              onClick={handleGoToListings}
              variant="outline"
              className="border-blue-300 text-blue-100 hover:bg-blue-500 rounded-[9px]"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Go to my listings
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

      {/* Duplicate Listing Confirmation Popup */}
      <ConfirmationPopup
        isOpen={showDuplicateConfirm}
        title="Duplicate Title"
        message={`"${campaignTitle}" already exists`}
        description="Please use a different title for your listing."
        confirmLabel="Got it"
        cancelLabel="Close"
        onConfirm={() => {
          setShowDuplicateConfirm(false)
        }}
        onCancel={() => {
          setShowDuplicateConfirm(false)
        }}
        isDangerous={true}
      />
    </div>
  )
}
export default ListingBuilder
