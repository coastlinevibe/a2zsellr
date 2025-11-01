'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Eye, ShoppingBag, TrendingUp, Plus, Edit, Trash2, Share2, Camera, Video, Star, MapPin, Phone, Mail, Globe, ChevronLeft, ChevronRight, Calendar, Send, Filter, Search, Gift, Settings, Package, DollarSign, Users, BarChart3, Crown, MousePointer, ExternalLink, X } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabaseClient'
import { formatPrice } from '@/lib/utils'
import { ShareModal } from '@/components/ShareModal'
import { PreviewModal } from '@/components/PreviewModal'
import { DeleteConfirmModal } from '@/components/DeleteConfirmModal'
import { MediaExpirationWarning } from '@/components/MediaExpirationWarning'
import FreeAccountNotifications from '@/components/FreeAccountNotifications'
import { ListingCardGrid } from '@/components/ListingCardGrid'
import { GridBackground } from '@/components/ui/glowing-card'
import { Grid, List } from 'lucide-react'

export default function FreeBusinessProfilePage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const username = params?.username as string
  
  // Get active tab from URL or default to 'gallery'
  const activeTab = searchParams?.get('tab') || 'gallery'
  const [activeSection, setActiveSection] = useState(activeTab)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isEditing, setIsEditing] = useState(false)
  
  // Dashboard functionality
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [sharePost, setSharePost] = useState<any>(null)
  const [previewPost, setPreviewPost] = useState<any>(null)
  const [deletePostId, setDeletePostId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Business data using actual user info
  const displayName = user?.user_metadata?.display_name || username?.replace('@', '') || "Business Profile"
  const businessData = {
    name: displayName,
    category: "Business",
    location: "South Africa",
    rating: 4.8,
    reviews: 0,
    phone: "+27 XX XXX XXXX",
    email: user?.email || "contact@business.com",
    website: "www.yourbusiness.com",
    description: `${displayName}'s business directory profile. Manage your gallery, products, and marketing tools.`,
    tier: "free",
    handle: username // Store the @handle for display
  }

  // Gallery state
  const [galleryItems, setGalleryItems] = useState<any[]>([])
  const [selectedGalleryFiles, setSelectedGalleryFiles] = useState<File[]>([])
  const [uploadingGallery, setUploadingGallery] = useState(false)
  const [newGalleryItem, setNewGalleryItem] = useState({
    url: '',
    title: '',
    description: '',
    type: 'image' as 'image' | 'video',
    is_featured: false
  })
  const [fileMetadata, setFileMetadata] = useState<{[key: number]: {title: string, description: string}}>({})
  const [businessId, setBusinessId] = useState<string | null>(null)
  const [businessSlug, setBusinessSlug] = useState<string | null>(null)

  // Products state
  const [products, setProducts] = useState<any[]>([])
  const [showProductModal, setShowProductModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price_cents: 0,
    category: '',
    type: 'product',
    image_url: '',
    stock_quantity: 0
  })
  const [uploadingProduct, setUploadingProduct] = useState(false)
  const [selectedProductImage, setSelectedProductImage] = useState<File | null>(null)
  const [productImagePreview, setProductImagePreview] = useState<string>('')

  const campaigns = [
    { id: 1, name: "Weekend Special", type: "whatsapp", status: "draft", reach: 0, engagement: 0 }
  ]

  // Update activeSection when URL changes
  useEffect(() => {
    setActiveSection(activeTab)
  }, [activeTab])

  // Handle tab change and update URL
  const handleTabChange = (tab: string) => {
    setActiveSection(tab)
    const newUrl = `${window.location.pathname}?tab=${tab}`
    router.push(newUrl, { scroll: false })
  }

  // Gallery and Products management
  useEffect(() => {
    if (businessId) {
      fetchGalleryItems()
      fetchProducts()
    }
  }, [businessId])

  const fetchBusinessProfile = async () => {
    if (!user?.id) return

    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('id, slug')
        .eq('user_id', user.id)
        .maybeSingle()

      if (error) throw error

      if (data) {
        console.log('Gallery management: Found business with ID:', (data as any).id, 'slug:', (data as any).slug)
        
        // Check if slug contains @ and fix it
        const currentSlug = (data as any).slug
        if (currentSlug && currentSlug.includes('@')) {
          console.log('Fixing business slug that contains @:', currentSlug)
          const cleanSlug = await fixBusinessSlug((data as any).id, currentSlug)
          setBusinessSlug(cleanSlug)
        } else {
          setBusinessSlug(currentSlug)
        }
        
        setBusinessId((data as any).id)
      } else {
        console.log('Gallery management: No business found for user:', user.id, 'Creating one...')
        // Create a business profile if it doesn't exist
        await createBusinessProfile()
      }
    } catch (error) {
      console.error('Error fetching business profile:', error)
    }
  }

  const fixBusinessSlug = async (businessId: string, currentSlug: string) => {
    try {
      const cleanSlug = currentSlug.replace('@', '')
      console.log('Updating business slug from', currentSlug, 'to', cleanSlug)
      
      const { error } = await supabase
        .from('businesses')
        .update({ slug: cleanSlug } as any)
        .eq('id', businessId)

      if (error) {
        console.error('Error fixing business slug:', error)
        return currentSlug
      } else {
        console.log('Successfully updated business slug to:', cleanSlug)
        return cleanSlug
      }
    } catch (error) {
      console.error('Error in fixBusinessSlug:', error)
      return currentSlug
    }
  }

  const createBusinessProfile = async () => {
    if (!user?.id) return

    try {
      const businessSlug = username?.replace('@', '') || `user-${user.id.slice(0, 8)}`
      const businessName = user.user_metadata?.display_name || businessSlug
      
      console.log('Creating business profile with slug:', businessSlug, 'from username:', username)

      const { data, error } = await supabase
        .from('businesses')
        .insert([{
          user_id: user.id,
          name: businessName,
          slug: businessSlug,
          description: `${businessName}'s business profile`,
          is_active: true,
          is_verified: false,
          created_at: new Date().toISOString()
        }] as any)
        .select('id')
        .single()

      if (error) throw error

      if (data) {
        console.log('Gallery management: Created business with ID:', (data as any).id)
        setBusinessId((data as any).id)
        setBusinessSlug(businessSlug)
      }
    } catch (error) {
      console.error('Error creating business profile:', error)
    }
  }

  const fetchProducts = async () => {
    if (!businessId) return

    try {
      const { data, error } = await supabase
        .from('business_products')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const fetchGalleryItems = async () => {
    if (!businessId) return

    try {
      const { data, error } = await supabase
        .from('business_gallery')
        .select('*')
        .eq('business_id', businessId)
        .eq('is_active', true)
        .order('sort_order', { ascending: true })

      if (error) throw error

      setGalleryItems(data || [])
    } catch (error) {
      console.error('Error fetching gallery items:', error)
      // Set fallback mock data for free tier
      setGalleryItems([
        { id: 1, type: 'image', url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=400&fit=crop', title: 'Restaurant Interior', description: 'Modern dining area with harbor views' },
        { id: 2, type: 'image', url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=400&fit=crop', title: 'Outdoor Terrace', description: 'Al fresco dining with ocean breeze' }
      ])
    }
  }

  const handleGalleryFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const remainingSlots = 3 - galleryItems.length
    
    if (files.length > remainingSlots) {
      alert(`You can only add ${remainingSlots} more images (Free plan limit: 3 total)`)
      return
    }

    // Validate file types and sizes
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} is not an image file`)
        return false
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert(`${file.name} is too large (max 5MB)`)
        return false
      }
      return true
    })

    setSelectedGalleryFiles(validFiles)
    
    // Initialize metadata for each file
    const newMetadata: {[key: number]: {title: string, description: string}} = {}
    validFiles.forEach((file, index) => {
      newMetadata[index] = {
        title: file.name.split('.')[0], // Use filename without extension as default title
        description: ''
      }
    })
    setFileMetadata(newMetadata)
  }

  const updateFileMetadata = (index: number, field: 'title' | 'description', value: string) => {
    setFileMetadata(prev => ({
      ...prev,
      [index]: {
        ...prev[index],
        [field]: value
      }
    }))
  }

  const handleAddGalleryItem = async () => {
    if (!businessId || (selectedGalleryFiles.length === 0 && !newGalleryItem.url.trim())) {
      alert('Please select files or provide an image URL')
      return
    }

    if (galleryItems.length >= 3) {
      alert('Free plan allows maximum 3 images. Upgrade to add more.')
      return
    }

    setUploadingGallery(true)

    try {
      const itemsToAdd: any[] = []

      // Handle URL input
      if (newGalleryItem.url.trim()) {
        itemsToAdd.push({
          business_id: businessId,
          type: newGalleryItem.type,
          url: newGalleryItem.url.trim(),
          title: newGalleryItem.title.trim() || null,
          description: newGalleryItem.description.trim() || null,
          sort_order: galleryItems.length + 1,
          is_active: true,
          is_featured: false,
          view_count: 0
        })
      }

      // Handle file uploads
      for (let i = 0; i < selectedGalleryFiles.length; i++) {
        const file = selectedGalleryFiles[i]
        
        // Upload file to Supabase Storage
        const fileExt = file.name.split('.').pop()
        const fileName = `gallery-${businessId}-${Date.now()}-${i}.${fileExt}`
        const filePath = `business-gallery/${fileName}`

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('posts')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) {
          console.error('Upload error:', uploadError)
          continue
        }

        // Get public URL
        const { data } = supabase.storage
          .from('posts')
          .getPublicUrl(filePath)

        const metadata = fileMetadata[i] || { title: file.name.split('.')[0], description: '' }
        itemsToAdd.push({
          business_id: businessId,
          type: 'image',
          url: data.publicUrl,
          title: metadata.title.trim() || file.name.split('.')[0],
          description: metadata.description.trim() || null,
          sort_order: galleryItems.length + i + 1,
          is_active: true,
          is_featured: false,
          view_count: 0
        })
      }

      // Insert gallery items
      if (itemsToAdd.length > 0) {
        const { error } = await supabase
          .from('business_gallery')
          .insert(itemsToAdd as any)

        if (error) throw error

        // Reset form
        setNewGalleryItem({
          url: '',
          title: '',
          description: '',
          type: 'image',
          is_featured: false
        })
        setSelectedGalleryFiles([])
        setFileMetadata({})
        
        // Refresh gallery
        fetchGalleryItems()
        
        alert(`Successfully added ${itemsToAdd.length} image${itemsToAdd.length > 1 ? 's' : ''}!`)
      }
    } catch (error: any) {
      console.error('Error adding gallery items:', error)
      alert(error.message || 'Failed to add gallery items')
    } finally {
      setUploadingGallery(false)
    }
  }

  const handleRemoveGalleryItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('business_gallery')
        .update({ is_active: false } as any)
        .eq('id', itemId)

      if (error) throw error

      fetchGalleryItems()
    } catch (error: any) {
      console.error('Error removing gallery item:', error)
      alert(error.message || 'Failed to remove gallery item')
    }
  }

  const handleProductImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB')
      return
    }

    setSelectedProductImage(file)
    
    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setProductImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const uploadProductImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${businessId}/products/${Date.now()}.${fileExt}`
      
      const { data, error } = await supabase.storage
        .from('business-media')
        .upload(fileName, file)

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from('business-media')
        .getPublicUrl(fileName)

      return publicUrl
    } catch (error) {
      console.error('Error uploading product image:', error)
      return null
    }
  }

  const handleSaveProduct = async () => {
    if (!businessId) return
    if (!productForm.name || productForm.price_cents <= 0) {
      alert('Please fill in product name and price')
      return
    }

    // Check free tier limit
    if (products.length >= 5 && !editingProduct) {
      alert('Free plan limit: 5 products maximum. Upgrade to add more!')
      return
    }

    try {
      setUploadingProduct(true)

      let imageUrl = productForm.image_url

      // Upload new image if selected
      if (selectedProductImage) {
        const uploadedUrl = await uploadProductImage(selectedProductImage)
        if (uploadedUrl) {
          imageUrl = uploadedUrl
        }
      }

      if (editingProduct) {
        // Update existing product
        const { error } = await supabase
          .from('business_products')
          .update({
            name: productForm.name,
            description: productForm.description,
            price_cents: productForm.price_cents,
            category: productForm.category,
            type: productForm.type,
            image_url: imageUrl,
            stock_quantity: productForm.stock_quantity,
            updated_at: new Date().toISOString()
          } as any)
          .eq('id', editingProduct.id)

        if (error) throw error
      } else {
        // Create new product
        const { error } = await supabase
          .from('business_products')
          .insert([{
            business_id: businessId,
            name: productForm.name,
            description: productForm.description,
            price_cents: productForm.price_cents,
            category: productForm.category,
            type: productForm.type,
            image_url: imageUrl,
            stock_quantity: productForm.stock_quantity,
            currency: 'ZAR',
            is_active: true
          }] as any)

        if (error) throw error
      }

      // Refresh products
      await fetchProducts()
      
      // Reset form
      setShowProductModal(false)
      setEditingProduct(null)
      setProductForm({
        name: '',
        description: '',
        price_cents: 0,
        category: '',
        type: 'product',
        image_url: '',
        stock_quantity: 0
      })
      setSelectedProductImage(null)
      setProductImagePreview('')
    } catch (error) {
      console.error('Error saving product:', error)
      alert('Failed to save product')
    } finally {
      setUploadingProduct(false)
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      const { error } = await supabase
        .from('business_products')
        .delete()
        .eq('id', productId)

      if (error) throw error
      await fetchProducts()
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Failed to delete product')
    }
  }

  const fetchPosts = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const url = `/api/posts?owner=${user.id}`
      const response = await fetch(url, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      })
      const result = await response.json()
      
      if (result.ok) {
        setPosts(result.data)
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const deletePost = async (postId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
        },
      })

      if (response.ok) {
        setPosts(prevPosts => prevPosts.filter(post => post.id !== postId))
        setDeletePostId(null)
        alert('Listing deleted successfully!')
      } else {
        const error = await response.json()
        alert(`Failed to delete: ${error.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error deleting post:', error)
      alert('Failed to delete post. Please try again.')
    }
  }

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % galleryItems.length)
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + galleryItems.length) % galleryItems.length)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Section Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => handleTabChange('gallery')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                  activeSection === 'gallery'
                    ? 'border-gray-500 text-gray-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Eye className="h-4 w-4" />
                Profile Gallery
              </button>
              <button
                onClick={() => handleTabChange('shop')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                  activeSection === 'shop'
                    ? 'border-gray-500 text-gray-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <ShoppingBag className="h-4 w-4" />
                Shop/Service
              </button>
              <button
                onClick={() => handleTabChange('marketing')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                  activeSection === 'marketing'
                    ? 'border-gray-500 text-gray-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <TrendingUp className="h-4 w-4" />
                Marketing
              </button>
              <button
                onClick={() => handleTabChange('profile')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                  activeSection === 'profile'
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Settings className="h-4 w-4" />
                Your Profile
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Gallery Section */}
            {activeSection === 'gallery' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Free Gallery Showcase</h3>
                    <p className="text-sm text-gray-600">Basic image gallery with limited features</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setIsEditing(!isEditing)}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                      {isEditing ? 'Done Editing' : 'Manage Gallery'}
                    </button>
                    <Link 
                      href={`/b/${businessSlug || 'business'}`}
                      target="_blank"
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                      onClick={() => console.log('Gallery View Profile URL:', `/b/${businessSlug || 'business'}`, 'businessSlug:', businessSlug)}
                    >
                      <ExternalLink className="h-4 w-4" />
                      View Profile
                    </Link>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Basic Gallery */}
                  <div className="lg:col-span-2">
                    <div className="grid grid-cols-3 gap-4">
                      {galleryItems.map((item, index) => (
                        <div key={item.id} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                          <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
                          {isEditing && (
                            <div className="absolute top-1 right-1">
                              <button 
                                onClick={() => handleRemoveGalleryItem(item.id)}
                                className="bg-red-500 hover:bg-red-600 text-white p-1 rounded transition-colors"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Add Gallery Item Form */}
                    {isEditing && galleryItems.length < 3 && (
                      <div className="mt-6 p-4 bg-white border border-gray-200 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-4">Add New Images</h4>
                        <div className="space-y-4">
                          
                          {/* File Upload Section */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Upload Images
                            </label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-emerald-400 transition-colors">
                              <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleGalleryFileSelect}
                                className="hidden"
                                id="gallery-upload"
                              />
                              <label htmlFor="gallery-upload" className="cursor-pointer">
                                <Camera className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                                <p className="text-sm text-gray-600 mb-1">
                                  Click to upload images or drag and drop
                                </p>
                                <p className="text-xs text-gray-500">
                                  PNG, JPG up to 5MB each (Max {3 - galleryItems.length} images)
                                </p>
                              </label>
                            </div>
                          </div>

                          {/* Selected Files Preview with Individual Metadata */}
                          {selectedGalleryFiles.length > 0 && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-4">
                                Selected Images ({selectedGalleryFiles.length}) - Add Details for Each
                              </label>
                              <div className="space-y-6">
                                {selectedGalleryFiles.map((file, index) => (
                                  <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                    <div className="flex gap-4">
                                      {/* Thumbnail */}
                                      <div className="relative group flex-shrink-0">
                                        <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                                          <img
                                            src={URL.createObjectURL(file)}
                                            alt={`Preview ${index + 1}`}
                                            className="w-full h-full object-cover"
                                          />
                                        </div>
                                        <button
                                          onClick={() => {
                                            const newFiles = selectedGalleryFiles.filter((_, i) => i !== index)
                                            setSelectedGalleryFiles(newFiles)
                                            // Remove metadata for this file
                                            const newMetadata = { ...fileMetadata }
                                            delete newMetadata[index]
                                            setFileMetadata(newMetadata)
                                          }}
                                          className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                          <X className="h-3 w-3" />
                                        </button>
                                      </div>
                                      
                                      {/* Metadata Fields */}
                                      <div className="flex-1 space-y-3">
                                        <div className="text-sm text-gray-600 font-medium truncate">
                                          {file.name}
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                          <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                              Title
                                            </label>
                                            <input
                                              type="text"
                                              value={fileMetadata[index]?.title || ''}
                                              onChange={(e) => updateFileMetadata(index, 'title', e.target.value)}
                                              placeholder="Image title"
                                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                            />
                                          </div>
                                          <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                              Description
                                            </label>
                                            <input
                                              type="text"
                                              value={fileMetadata[index]?.description || ''}
                                              onChange={(e) => updateFileMetadata(index, 'description', e.target.value)}
                                              placeholder="Image description"
                                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* OR Divider */}
                          <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                              <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                              <span className="px-2 bg-white text-gray-500">OR</span>
                            </div>
                          </div>

                          {/* URL Input Section */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Image URL
                            </label>
                            <input
                              type="url"
                              value={newGalleryItem.url}
                              onChange={(e) => setNewGalleryItem({...newGalleryItem, url: e.target.value})}
                              placeholder="https://example.com/image.jpg"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            />
                          </div>

                          {/* Metadata Section */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Title (Optional)
                              </label>
                              <input
                                type="text"
                                value={newGalleryItem.title}
                                onChange={(e) => setNewGalleryItem({...newGalleryItem, title: e.target.value})}
                                placeholder="Image title"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description (Optional)
                              </label>
                              <input
                                type="text"
                                value={newGalleryItem.description}
                                onChange={(e) => setNewGalleryItem({...newGalleryItem, description: e.target.value})}
                                placeholder="Image description"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                              />
                            </div>
                          </div>

                          {/* Upload Button */}
                          <button
                            onClick={handleAddGalleryItem}
                            disabled={uploadingGallery || (selectedGalleryFiles.length === 0 && !newGalleryItem.url.trim())}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                          >
                            <Plus className="h-4 w-4" />
                            {uploadingGallery ? 'Uploading...' : `Add ${selectedGalleryFiles.length > 0 ? selectedGalleryFiles.length + ' Images' : 'Image'}`}
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">
                        <strong>Free Plan:</strong> Basic gallery with up to 3 images. 
                        <Link href="/choose-plan" className="text-blue-600 hover:underline ml-1">
                          Upgrade for slider showcase and video support.
                        </Link>
                      </p>
                    </div>
                  </div>

                  {/* Business Info Sidebar */}
                  <div className="lg:col-span-1">
                    <div className="bg-gray-50 rounded-xl p-6 sticky top-8">
                      <h4 className="font-semibold text-gray-900 mb-4">Contact Information</h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Phone className="h-5 w-5 text-gray-400" />
                          <span className="text-gray-900">{businessData.phone}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Mail className="h-5 w-5 text-gray-400" />
                          <span className="text-gray-900">{businessData.email}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Globe className="h-5 w-5 text-gray-400" />
                          <span className="text-gray-900">{businessData.website}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Shop Section */}
            {activeSection === 'shop' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Free Shop & Products</h3>
                    <p className="text-sm text-gray-600">Basic product listings with limited features</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => {
                        setEditingProduct(null)
                        setProductForm({
                          name: '',
                          description: '',
                          price_cents: 0,
                          category: '',
                          type: 'product',
                          image_url: '',
                          stock_quantity: 0
                        })
                        setSelectedProductImage(null)
                        setProductImagePreview('')
                        setShowProductModal(true)
                      }}
                      disabled={products.length >= 5}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      Add Product ({products.length}/5)
                    </button>
                    <Link 
                      href={`/b/${businessSlug || 'business'}`}
                      target="_blank"
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                      View Profile
                    </Link>
                  </div>
                </div>

                {/* Basic Shop Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Products</p>
                        <p className="text-2xl font-bold text-gray-900">{products.length}</p>
                      </div>
                      <Package className="h-6 w-6 text-gray-600" />
                    </div>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Basic Listing</p>
                        <p className="text-2xl font-bold text-gray-900">Free</p>
                      </div>
                      <Star className="h-6 w-6 text-gray-600" />
                    </div>
                  </div>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {products.length === 0 ? (
                    <div className="col-span-2 text-center py-12 bg-gray-50 rounded-xl">
                      <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Products Yet</h3>
                      <p className="text-gray-600 mb-4">Start adding products to your shop</p>
                      <button 
                        onClick={() => setShowProductModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                        Add Your First Product
                      </button>
                    </div>
                  ) : (
                    products.map((product) => (
                      <div key={product.id} className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-all">
                        {/* Product Image */}
                        {product.image_url && (
                          <div className="mb-3">
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                          </div>
                        )}
                        
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-semibold text-gray-900">{product.name}</h4>
                            <p className="text-sm text-gray-600">{product.category || 'Uncategorized'}</p>
                            {product.description && (
                              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{product.description}</p>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <p className="text-lg font-bold text-emerald-600">R{(product.price_cents / 100).toFixed(2)}</p>
                            {product.stock_quantity !== null && (
                              <span className="text-xs text-gray-500">Stock: {product.stock_quantity}</span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 pt-2">
                            <button 
                              onClick={() => {
                                setEditingProduct(product)
                                setProductForm({
                                  name: product.name,
                                  description: product.description || '',
                                  price_cents: product.price_cents,
                                  category: product.category || '',
                                  type: product.type,
                                  image_url: product.image_url || '',
                                  stock_quantity: product.stock_quantity || 0
                                })
                                setSelectedProductImage(null)
                                setProductImagePreview(product.image_url || '')
                                setShowProductModal(true)
                              }}
                              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                            >
                              <Edit className="h-3 w-3" />
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteProduct(product.id)}
                              className="flex items-center justify-center gap-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <strong>Free Plan:</strong> Basic product listings with up to 5 products. 
                    <Link href="/choose-plan" className="text-blue-600 hover:underline ml-1">
                      Upgrade for advanced shop features and unlimited products.
                    </Link>
                  </p>
                </div>
              </div>
            )}

            {/* Marketing Section - Original Dashboard */}
            {activeSection === 'marketing' && (
              <div className="py-8" style={{
                backgroundImage: 'linear-gradient(rgba(236, 253, 245, 0.9), rgba(236, 253, 245, 0.9)), url(/images/hero/bg3.png)',
                backgroundSize: 'auto, 150px 150px',
                backgroundRepeat: 'no-repeat, repeat',
                backgroundColor: '#f9fafb'
              }}>
                <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
                  {/* Media Expiration Warning */}
                  <div className="mb-4 sm:mb-6">
                    <MediaExpirationWarning />
                  </div>

                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900">My Listings</h1>
                      <p className="text-gray-600 mt-1">
                        Manage your products and track performance
                      </p>
                    </div>
                    <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-0">
                      {/* View Toggle - Hidden on mobile, shown on desktop only */}
                      <div className="hidden md:flex bg-white rounded-lg shadow-sm border border-gray-200">
                        <button
                          onClick={() => setViewMode('grid')}
                          className={`px-3 sm:px-4 py-2 text-sm font-medium rounded-l-lg ${
                            viewMode === 'grid' 
                              ? 'bg-emerald-600 text-white' 
                              : 'text-gray-600 hover:text-emerald-600'
                          }`}
                        >
                          <Grid className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setViewMode('list')}
                          className={`px-3 sm:px-4 py-2 text-sm font-medium rounded-r-lg ${
                            viewMode === 'list' 
                              ? 'bg-emerald-600 text-white' 
                              : 'text-gray-600 hover:text-emerald-600'
                          }`}
                        >
                          <List className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <Link
                        href="/create"
                        className="bg-emerald-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center shadow-sm text-sm sm:text-base"
                      >
                        <Plus className="h-4 w-4 mr-1 sm:mr-2" />
                        <span className="hidden xs:inline sm:inline">Create Listing</span>
                        <span className="xs:hidden sm:hidden">Create</span>
                      </Link>
                      
                      <Link 
                        href={`/b/${businessSlug || 'business'}`}
                        target="_blank"
                        className="bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center shadow-sm text-sm sm:text-base"
                      >
                        <ExternalLink className="h-4 w-4 mr-1 sm:mr-2" />
                        <span className="hidden xs:inline sm:inline">View Profile</span>
                        <span className="xs:hidden sm:hidden">View</span>
                      </Link>
                    </div>
                  </div>

                  {/* Free Account Notifications */}
                  <FreeAccountNotifications />

                  {/* Stats Overview */}
                  {posts.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 sm:gap-6 mb-6 sm:mb-8">
                      <GridBackground
                        title={posts.reduce((sum, post) => sum + post.views, 0).toString()}
                        description="Total Views"
                        showAvailability={false}
                      />
                      <GridBackground
                        title={posts.reduce((sum, post) => sum + post.clicks, 0).toString()}
                        description="Total Clicks"
                        showAvailability={false}
                      />
                      <GridBackground
                        title={posts.filter(post => post.is_active).length.toString()}
                        description="Active Listings"
                        showAvailability={false}
                      />
                    </div>
                  )}

                  {/* Posts List */}
                  {posts.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Plus className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No listings yet
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Create your first listing and share it anywhere to start selling.
                      </p>
                      <Link
                        href="/create"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-lg transition-colors inline-flex items-center"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Listing
                      </Link>
                    </div>
                  ) : (
                    <>
                      {/* Desktop view - Grid/List toggle */}
                      <div className="hidden md:block">
                        {viewMode === 'grid' ? (
                          <ListingCardGrid
                            posts={posts}
                            onShare={(post) => setSharePost(post)}
                            onPreview={(post) => setPreviewPost(post)}
                            onDelete={(postId) => setDeletePostId(postId)}
                          />
                        ) : (
                          <div className="space-y-6">
                            {posts.map((post) => (
                              <div key={post.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                                <div className="p-6">
                                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                                    {/* Post Info */}
                                    <div className="flex items-start space-x-4 flex-1">
                                      {/* Media Preview */}
                                      <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                        {post.media_urls?.length > 0 && (
                                          post.media_urls[0].includes('.mp4') || post.media_urls[0].includes('.webm') ? (
                                            <video
                                              src={post.media_urls[0]}
                                              className="w-full h-full object-cover"
                                            />
                                          ) : (
                                            <img
                                              src={post.media_urls[0]}
                                              alt={post.title}
                                              className="w-full h-full object-cover"
                                            />
                                          )
                                        )}
                                      </div>

                                      {/* Details */}
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center space-x-2 mb-1">
                                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                                            {post.title}
                                          </h3>
                                          <span className="text-lg font-bold text-emerald-600">
                                            {formatPrice(post.price_cents, post.currency)}
                                          </span>
                                        </div>
                                        
                                        {post.emoji_tags?.length > 0 && (
                                          <div className="flex flex-wrap gap-1 mb-2">
                                            {post.emoji_tags.slice(0, 3).map((tag: string, index: number) => (
                                              <span
                                                key={index}
                                                className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                                              >
                                                {tag}
                                              </span>
                                            ))}
                                            {post.emoji_tags.length > 3 && (
                                              <span className="text-xs text-gray-500">
                                                +{post.emoji_tags.length - 3} more
                                              </span>
                                            )}
                                          </div>
                                        )}

                                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                                          <div className="flex items-center">
                                            <Eye className="h-4 w-4 mr-1" />
                                            {post.views} views
                                          </div>
                                          <div className="flex items-center">
                                            <MousePointer className="h-4 w-4 mr-1" />
                                            {post.clicks} clicks
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center space-x-2 mt-4 lg:mt-0">
                                      <button
                                        onClick={() => setSharePost(post)}
                                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                                        title="Share"
                                      >
                                        <Share2 className="h-4 w-4" />
                                      </button>

                                      <button
                                        onClick={() => setPreviewPost(post)}
                                        className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                                        title="Preview"
                                      >
                                        <Eye className="h-4 w-4" />
                                      </button>

                                      <button
                                        onClick={() => setDeletePostId(post.id)}
                                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 hover:scale-110 transition-all duration-200 active:scale-95"
                                        title="Delete"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Mobile view - Always list mode */}
                      <div className="md:hidden">
                        <div className="space-y-6">
                          {posts.map((post) => (
                            <div key={post.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                              <div className="p-6">
                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                                  {/* Post Info */}
                                  <div className="flex items-start space-x-4 flex-1">
                                    {/* Media Preview */}
                                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                      {post.media_urls?.length > 0 && (
                                        post.media_urls[0].includes('.mp4') || post.media_urls[0].includes('.webm') ? (
                                          <video
                                            src={post.media_urls[0]}
                                            className="w-full h-full object-cover"
                                          />
                                        ) : (
                                          <img
                                            src={post.media_urls[0]}
                                            alt={post.title}
                                            className="w-full h-full object-cover"
                                          />
                                        )
                                      )}
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center space-x-2 mb-1">
                                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                                          {post.title}
                                        </h3>
                                        <span className="text-lg font-bold text-emerald-600">
                                          {formatPrice(post.price_cents, post.currency)}
                                        </span>
                                      </div>
                                      
                                      {post.emoji_tags?.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mb-2">
                                          {post.emoji_tags.slice(0, 3).map((tag: string, index: number) => (
                                            <span
                                              key={index}
                                              className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                                            >
                                              {tag}
                                            </span>
                                          ))}
                                          {post.emoji_tags.length > 3 && (
                                            <span className="text-xs text-gray-500">
                                              +{post.emoji_tags.length - 3} more
                                            </span>
                                          )}
                                        </div>
                                      )}

                                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                                        <div className="flex items-center">
                                          <Eye className="h-4 w-4 mr-1" />
                                          {post.views} views
                                        </div>
                                        <div className="flex items-center">
                                          <MousePointer className="h-4 w-4 mr-1" />
                                          {post.clicks} clicks
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Actions */}
                                  <div className="flex items-center space-x-2 mt-4 lg:mt-0">
                                    <button
                                      onClick={() => setSharePost(post)}
                                      className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                                      title="Share"
                                    >
                                      <Share2 className="h-4 w-4" />
                                    </button>

                                    <button
                                      onClick={() => setPreviewPost(post)}
                                      className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                                      title="Preview"
                                    >
                                      <Eye className="h-4 w-4" />
                                    </button>

                                    <button
                                      onClick={() => setDeletePostId(post.id)}
                                      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 hover:scale-110 transition-all duration-200 active:scale-95"
                                      title="Delete"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {sharePost && (
        <ShareModal
          isOpen={!!sharePost}
          onClose={() => setSharePost(null)}
          post={sharePost}
          username={username}
        />
      )}

      {/* Preview Modal */}
      {previewPost && (
        <PreviewModal
          isOpen={!!previewPost}
          onClose={() => setPreviewPost(null)}
          post={previewPost}
          onShare={() => {
            setSharePost(previewPost)
            setPreviewPost(null)
          }}
          onDelete={() => {
            setDeletePostId(previewPost.id)
            setPreviewPost(null)
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletePostId}
        onClose={() => setDeletePostId(null)}
        onConfirm={() => deletePostId && deletePost(deletePostId)}
        itemName={posts.find(p => p.id === deletePostId)?.title}
        message="This action cannot be undone. All data associated with this listing will be permanently deleted."
      />

      {/* Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <button
                  onClick={() => {
                    setShowProductModal(false)
                    setEditingProduct(null)
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={productForm.name}
                    onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="e.g., Premium Leather Shoes"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={productForm.description}
                    onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Describe your product..."
                  />
                </div>

                {/* Product Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Image
                  </label>
                  
                  {/* Image Preview */}
                  {productImagePreview && (
                    <div className="mb-4">
                      <img
                        src={productImagePreview}
                        alt="Product preview"
                        className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                      />
                    </div>
                  )}
                  
                  {/* File Input */}
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProductImageSelect}
                      className="hidden"
                      id="product-image-upload"
                    />
                    <label
                      htmlFor="product-image-upload"
                      className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {selectedProductImage ? 'Change Image' : 'Select Image'}
                    </label>
                    {selectedProductImage && (
                      <span className="text-sm text-gray-600">
                        {selectedProductImage.name}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Maximum file size: 5MB. Supported formats: JPG, PNG, GIF
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price (ZAR) *
                    </label>
                    <input
                      type="number"
                      value={productForm.price_cents / 100}
                      onChange={(e) => setProductForm({...productForm, price_cents: Math.round(parseFloat(e.target.value) * 100)})}
                      step="0.01"
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stock Quantity
                    </label>
                    <input
                      type="number"
                      value={productForm.stock_quantity}
                      onChange={(e) => setProductForm({...productForm, stock_quantity: parseInt(e.target.value) || 0})}
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <input
                    type="text"
                    value={productForm.category}
                    onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="e.g., Footwear, Electronics, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type
                  </label>
                  <select
                    value={productForm.type}
                    onChange={(e) => setProductForm({...productForm, type: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="product">Product</option>
                    <option value="service">Service</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-6">
                <button
                  onClick={handleSaveProduct}
                  disabled={uploadingProduct}
                  className="flex-1 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
                >
                  {uploadingProduct ? 'Saving...' : editingProduct ? 'Update Product' : 'Add Product'}
                </button>
                <button
                  onClick={() => {
                    setShowProductModal(false)
                    setEditingProduct(null)
                  }}
                  className="px-6 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
