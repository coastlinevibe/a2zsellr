'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Badge } from '@/components/ui/badge'
import { TierLimitDisplay } from '@/components/ui/premium-badge'
import { useCart } from '@/contexts/CartContext'
import { supabase } from '@/lib/supabaseClient'
import { usePopup } from '@/components/providers/PopupProvider'
import { ConfirmationPopup } from '@/components/ui/ConfirmationPopup'
import EmojiPicker from '@/components/ui/emoji-picker'
import RichTextEditor from '@/components/ui/rich-text-editor'
import { 
  ShoppingCart, 
  ShoppingBag,
  Plus, 
  Search,
  Package,
  Edit,
  Trash2,
  X,
  Share2,
  Upload,
  Image as ImageIcon,
  Loader2,
  Eye,
  Filter,
  Grid,
  List,
  Star,
  Heart,
  MessageCircle,
  Check
} from 'lucide-react'

interface ProductImage {
  url: string
  alt?: string
  order: number
}

interface Product {
  id: string
  profile_id: string
  name: string
  description: string | null
  product_details: string | null
  price_cents: number | null
  discounted_price?: string | null
  category: string | null
  image_url: string | null
  images?: ProductImage[]
  is_active: boolean
  created_at: string
}

interface BusinessShopProps {
  businessId: string
  isOwner?: boolean
  userTier?: 'free' | 'premium' | 'business'
  onRefresh?: () => void
}

// Tier limits constant
const TIER_LIMITS = {
  free: 5,
  premium: 20,
  business: 999
}

export default function BusinessShop({ 
  businessId, 
  isOwner = false,
  userTier = 'free',
  onRefresh
}: BusinessShopProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { addItem } = useCart()
  const { showError, showWarning, showSuccess } = usePopup()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddProduct, setShowAddProduct] = useState(searchParams.get('modal') === 'product-creation')
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [manageMode, setManageMode] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [businessName, setBusinessName] = useState<string>('')
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    product_details: '',
    price_cents: '',
    discounted_price: '',
    category: '',
    image_url: ''
  })
  const [productImages, setProductImages] = useState<ProductImage[]>([])
  const [uploadingImages, setUploadingImages] = useState(false)
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)

  // Simple categories for basic businesses
  const categories = [
    { value: 'all', label: 'All Products' },
    { value: 'products', label: 'Products' },
    { value: 'services', label: 'Services' }
  ]

  useEffect(() => {
    fetchProducts()
    fetchBusinessName()
  }, [businessId])

  useEffect(() => {
    // Watch for URL changes to open/close product modal
    const isProductCreationModal = searchParams.get('modal') === 'product-creation'
    setShowAddProduct(isProductCreationModal)
  }, [searchParams])

  const fetchBusinessName = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', businessId)
        .single()

      if (error) throw error
      setBusinessName(data?.display_name || 'Business')
    } catch (error) {
      console.error('Error fetching business name:', error)
      setBusinessName('Business')
    }
  }

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('profile_products')
        .select('*')
        .eq('profile_id', businessId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }



  const handleAddToCart = (product: Product) => {
    if (!product.price_cents) {
      showError('This product does not have a price set', 'No Price Available')
      return
    }

    addItem({
      productId: product.id,
      name: product.name,
      price: product.price_cents,
      image: product.image_url || undefined,
      businessId: businessId,
      businessName: businessName
    })

    showSuccess(`${product.name} added to cart!`, 'Added to Cart')
  }

  const closeProductModal = () => {
    setShowAddProduct(false)
    router.push('?', { scroll: false })
  }

  const handleAddProduct = () => {
    // Enforce tier limits
    const currentLimit = TIER_LIMITS[userTier]
    
    if (products.length >= currentLimit && (userTier === 'free' || userTier === 'premium')) {
      const upgradeMessage = userTier === 'free' 
        ? 'Please upgrade to Premium to add more products.'
        : 'Please upgrade to Business tier for unlimited products.'
      setError(`${userTier === 'free' ? 'Free' : 'Premium'} tier is limited to ${currentLimit} products. You currently have ${products.length}. ${upgradeMessage}`)
      return
    }
    
    setError(null)
    setProductForm({
      name: '',
      description: '',
      product_details: '',
      price_cents: '',
      discounted_price: '',
      category: 'products',
      image_url: ''
    })
    setProductImages([])
    setImageFiles([])
    setEditingProduct(null)
    setShowAddProduct(true)
    router.push('?modal=product-creation', { scroll: false })
  }

  const handleViewProduct = (product: Product) => {
    setViewingProduct(product)
    setCurrentImageIndex(0)
  }

  const handleEditProduct = (product: Product) => {
    setProductForm({
      name: product.name,
      description: product.description || '',
      product_details: product.product_details || '',
      price_cents: product.price_cents ? (product.price_cents / 100).toString() : '',
      discounted_price: product.discounted_price || '',
      category: product.category || 'products',
      image_url: product.image_url || ''
    })
    // Load existing images - handle different data types
    let parsedImages: ProductImage[] = []
    if (product.images) {
      if (Array.isArray(product.images)) {
        parsedImages = product.images
      } else if (typeof product.images === 'string') {
        try {
          const parsed = JSON.parse(product.images)
          parsedImages = Array.isArray(parsed) ? parsed : []
        } catch (e) {
          console.warn('Could not parse product images JSON:', e)
          parsedImages = []
        }
      }
    }
    setProductImages(parsedImages)
    setImageFiles([])
    setEditingProduct(product)
    setShowAddProduct(true)
  }

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product)
    setShowDeleteConfirm(true)
  }

  const performDeleteProduct = async () => {
    if (!productToDelete) return

    try {
      const { error } = await supabase
        .from('profile_products')
        .delete()
        .eq('id', productToDelete.id)

      if (error) throw error
      fetchProducts()
      
      // Notify parent component to refresh metrics
      if (onRefresh) {
        onRefresh()
      }
      
      showSuccess('Product deleted successfully', 'Product Removed')
      setShowDeleteConfirm(false)
      setProductToDelete(null)
    } catch (error) {
      console.error('Error deleting product:', error)
      showError('Failed to delete product. Please try again.', 'Delete Failed')
    }
  }

  const handleShareProduct = async (product: Product) => {
    // Get the business profile to get display_name
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', businessId)
        .single()

      const businessName = profile?.display_name || 'Business'
      // Create URL with product parameter to open the product modal
      const productSlug = product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
      const businessSlug = encodeURIComponent(businessName.toLowerCase().trim())
      const shareUrl = `https://www.a2zsellr.life/profile/${businessSlug}?product=${encodeURIComponent(productSlug)}`
      const shareText = `Check out "${product.name}" from ${businessName} on A2Z Business Directory!`
      
      if (navigator.share) {
        // Use native sharing if available (mobile)
        navigator.share({
          title: `${product.name} - ${businessName}`,
          text: shareText,
          url: shareUrl,
        }).catch(console.error)
      } else {
        // Fallback: Copy to clipboard
        navigator.clipboard.writeText(`${shareText}\n${shareUrl}`).then(() => {
          showSuccess('Product link copied to clipboard!', 'Link Copied')
        }).catch(() => {
          // Fallback: Show share dialog with the link
          prompt('Copy this link to share:', shareUrl)
        })
      }
    } catch (error) {
      console.error('Error sharing product:', error)
    }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Tier-based image limits per product
    const tierImageLimits = {
      free: 1,
      premium: 8,
      business: 50
    }
    
    const maxImagesPerProduct = tierImageLimits[userTier]
    const currentTotalImages = productImages.length + imageFiles.length
    const remainingSlots = maxImagesPerProduct - currentTotalImages
    
    if (files.length > remainingSlots) {
      showWarning(
        `You can only add ${remainingSlots} more image(s).\n\nMaximum ${maxImagesPerProduct} images per product for ${userTier} tier.`,
        'Image Limit Reached'
      )
      return
    }
    
    if (currentTotalImages + files.length > maxImagesPerProduct) {
      showWarning(
        `Maximum ${maxImagesPerProduct} images per product for ${userTier} tier.\n\nYou currently have ${currentTotalImages} images.`,
        'Image Limit Exceeded'
      )
      return
    }

    setImageFiles(prev => [...prev, ...files.slice(0, remainingSlots)])
  }

  const handleRemoveImageFile = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleRemoveExistingImage = (index: number) => {
    setProductImages(prev => prev.filter((_, i) => i !== index))
  }

  const uploadProductImages = async (): Promise<ProductImage[]> => {
    if (imageFiles.length === 0) return productImages

    setUploadingImages(true)
    const uploadedImages: ProductImage[] = []

    try {
      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i]
        const fileExt = file.name.split('.').pop()
        const fileName = `${businessId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

        const { data, error } = await supabase.storage
          .from('product-images')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          })

        if (error) throw error

        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName)

        uploadedImages.push({
          url: publicUrl,
          alt: productForm.name,
          order: productImages.length + i
        })
      }

      return [...productImages, ...uploadedImages]
    } catch (error) {
      console.error('Error uploading images:', error)
      showError('Failed to upload some images. Please try again.', 'Upload Failed')
      return productImages
    } finally {
      setUploadingImages(false)
    }
  }





  const handleSaveProduct = async () => {
    // Validate required fields
    const missingFields: string[] = []
    
    if (!productForm.name.trim()) {
      missingFields.push('Product Name')
    }
    if (!productForm.category.trim()) {
      missingFields.push('Category')
    }
    
    if (missingFields.length > 0) {
      showError(
        `Missing required field${missingFields.length > 1 ? 's' : ''}: ${missingFields.join(', ')}`,
        'Incomplete Form'
      )
      return
    }

    // Check for duplicate product name (only for new products)
    if (!editingProduct) {
      const isDuplicate = products.some(p => 
        p.name.toLowerCase().trim() === productForm.name.toLowerCase().trim()
      )
      
      if (isDuplicate) {
        showError(
          `A product named "${productForm.name}" already exists`,
          'Duplicate Product Name'
        )
        return
      }
    }

    // Enforce tier limits on save (server-side validation)
    const tierLimits = {
      free: 5,
      premium: 20,
      business: 999
    }
    
    const currentLimit = tierLimits[userTier]
    
    if (!editingProduct && products.length >= currentLimit && (userTier === 'free' || userTier === 'premium')) {
      const upgradeMessage = userTier === 'free' 
        ? 'Please upgrade to Premium to add more products.'
        : 'Please upgrade to Business tier for unlimited products.'
      showWarning(
        `${userTier === 'free' ? 'Free' : 'Premium'} tier is limited to ${currentLimit} products.\n\n${upgradeMessage}`,
        'Product Limit Reached'
      )
      return
    }

    try {
      // Upload new images first
      const allImages = await uploadProductImages()

      const productData = {
        profile_id: businessId,
        name: productForm.name,
        description: productForm.description || null,
        product_details: productForm.product_details || null,
        price_cents: productForm.price_cents ? Math.round(parseFloat(productForm.price_cents) * 100) : null,
        discounted_price: productForm.discounted_price || null,
        category: productForm.category,
        image_url: productForm.image_url || (allImages.length > 0 ? allImages[0].url : null),
        images: allImages,
        is_active: true
      }

      let productId: string

      if (editingProduct) {
        const { error } = await supabase
          .from('profile_products')
          .update(productData)
          .eq('id', editingProduct.id)
        if (error) throw error
        productId = editingProduct.id
      } else {
        const { data, error } = await supabase
          .from('profile_products')
          .insert([productData])
          .select('id')
          .single()
        if (error) throw error
        productId = data.id
      }

      fetchProducts()
      closeProductModal()
      setImageFiles([])
      setProductImages([])
      
      // Notify parent component to refresh metrics
      if (onRefresh) {
        onRefresh()
      }
    } catch (error) {
      console.error('Error saving product:', error)
      showError('Failed to save product. Please try again.', 'Save Failed')
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Shop</h2>
          <TierLimitDisplay 
            current={products.length}
            limit={TIER_LIMITS[userTier]}
            tier={userTier}
            itemName="products"
            size="md"
          />
        </div>
        {isOwner && (
          <div className="flex gap-2">
            <div>
              <Button 
                variant={manageMode ? "default" : "outline"} 
                onClick={() => setManageMode(!manageMode)}
                className={`rounded-[9px] ${manageMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}`}
              >
                <Edit className="h-4 w-4 mr-2" />
                {manageMode ? 'Done Managing' : 'Manage Shop'}
              </Button>
            </div>
            <div>
              <Button 
                onClick={handleAddProduct} 
                className="bg-emerald-600 hover:bg-emerald-700 rounded-[9px]"
                disabled={userTier === 'free' && products.length >= 5}
              >
                <Plus className="h-4 w-4 mr-2" />
                {userTier === 'free' && products.length >= 5 ? 'Limit Reached' : 'Add to Shop'}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-[9px] p-4">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-red-600" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Free Tier Limit Warning */}
      {userTier === 'free' && products.length >= 5 && (
        <div className="bg-amber-50 border border-amber-200 rounded-[9px] p-4">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-amber-600" />
            <div>
              <h4 className="font-semibold text-amber-900">Shop Limit Reached</h4>
              <p className="text-sm text-amber-700 mt-1">
                You've reached the 5-product limit for free accounts. Upgrade to Premium for unlimited products.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Manage Mode Indicator */}
      {manageMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-[9px] p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-semibold text-blue-900">Manage Mode Active</p>
                <p className="text-xs text-blue-700">Click Edit or Delete buttons on products to manage your shop</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setManageMode(false)}
              className="rounded-[9px] border-blue-300 text-blue-700 hover:bg-blue-100"
            >
              Exit
            </Button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-[9px] focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-[9px] focus:ring-2 focus:ring-emerald-500"
        >
          {categories.map(cat => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {products.length === 0 ? 'No products yet' : 'No products found'}
          </h3>
          <p className="text-gray-500 mb-4">
            {products.length === 0 ? 'Add your first product to get started' : 'Try a different search or category'}
          </p>
          {products.length === 0 && isOwner && (
            <Button onClick={handleAddProduct} className="bg-emerald-600 hover:bg-emerald-700 rounded-[9px]">
              <Plus className="h-4 w-4 mr-2" />
              Add to Shop
            </Button>
          )}
        </div>
      ) : (
        <div className="flex gap-4 pb-2 pt-5 overflow-x-auto" style={{ width: 'max-content', minWidth: '100%' }}>
          {filteredProducts.map((product, index) => {
            // Handle both JSON string and array formats for images
            let imagesArray = []
            if (product.images) {
              if (typeof product.images === 'string') {
                try {
                  imagesArray = JSON.parse(product.images)
                } catch (e) {
                  imagesArray = []
                }
              } else if (Array.isArray(product.images)) {
                imagesArray = product.images
              }
            }
            
            const hasImages = imagesArray && imagesArray.length > 0
            const imageUrl = hasImages 
              ? imagesArray[0]?.url || product.image_url
              : product.image_url
            
            return (
              <div 
                key={product.id}
                className="w-64 bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer transition-all duration-300 flex-shrink-0 relative group flex flex-col"
                style={{ height: '500px' }}
              >
                {/* Badge - Only show if discounted price exists */}
                {product.discounted_price && (
                  <div className="absolute top-3 right-3 bg-gradient-to-r from-red-700 via-red-600 to-red-800 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider z-10 shadow-lg">
                    HOT SALE
                  </div>
                )}

                {/* Image Container - Auto-resizes to fit viewport */}
                <div className="relative w-full h-56 overflow-hidden bg-gray-100">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag className="w-12 h-12 text-gray-300" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col overflow-hidden">
                  {/* Category */}
                  <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                    {product.category || 'Product'}
                  </div>

                  {/* Title */}
                  <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                    {product.name}
                  </h2>

                  {/* Description */}
                  {product.description ? (
                    <p className="text-sm text-gray-600 leading-relaxed mb-3 line-clamp-3 break-words">
                      {product.description.replace(/<[^>]*>/g, '')}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-400 leading-relaxed mb-3 line-clamp-3 break-words">
                      Product description will appear here
                    </p>
                  )}

                  {/* Product Details - 2 Columns (Max 2 Details) */}
                  {product.product_details ? (
                    <div className="mb-4 pb-3 border-b border-gray-100">
                      <div className="grid grid-cols-2 gap-2">
                        {product.product_details.split('\n').filter(d => d.trim()).slice(0, 2).map((detail, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="text-xs text-gray-700 leading-tight">
                              {detail.trim()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {/* Bottom Section */}
                  <div className="flex justify-between items-end gap-3 pt-3 border-t border-gray-100 mt-auto">
                    {/* Price */}
                    <div className="flex flex-col">
                      {product.price_cents ? (
                        <>
                          {product.discounted_price ? (
                            <>
                              <span className="text-xs text-gray-400 line-through">
                                R{(product.price_cents / 100).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                              <span className="text-2xl font-bold text-red-600">
                                R{parseFloat(product.discounted_price).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </>
                          ) : (
                            <span className="text-2xl font-bold text-gray-900">
                              R{(product.price_cents / 100).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-sm text-gray-500 font-medium">Contact for price</span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    {isOwner && manageMode ? (
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleViewProduct(product)}
                          className="p-2 text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="p-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(product)}
                          className="p-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleShareProduct(product)}
                        className="p-2 text-gray-400 hover:text-emerald-600 transition-colors"
                        title="Share"
                      >
                        <Share2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* Meta Info */}
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      ))}
                      <span className="text-xs text-gray-500 ml-1">128 Reviews</span>
                    </div>
                    <div className="text-xs font-semibold text-green-600">In Stock</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add/Edit Product Modal */}
      {showAddProduct && (
        <div className="z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 overflow-y-auto" style={{ position: 'fixed', top: '0', left: '0', right: '0', bottom: '0', margin: '0', padding: '1rem' }}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full my-8 max-h-[95vh] flex flex-col border border-gray-200">
            {/* Enhanced Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Package className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">
                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                  </h3>
                  <p className="text-sm text-emerald-100">
                    {editingProduct ? 'Update your product details' : 'Create a new product for your shop'}
                  </p>
                </div>
              </div>
              <button 
                onClick={closeProductModal} 
                className="hover:bg-white/20 rounded-lg p-2 transition-colors text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Enhanced Content - 2 Column Layout */}
            <div className="flex flex-1 overflow-hidden bg-white">
              {/* Left Column - Form */}
              <div className="flex-1 p-6 space-y-5 overflow-y-auto bg-white border-r border-gray-200">
              {/* Section 1: Basic Info */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Basic Information</h4>
                
                {/* Product Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={productForm.name}
                    onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    placeholder="e.g., Premium Leather Jacket"
                  />
                </div>
                
                {/* Rich Text Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Description
                  </label>
                  <RichTextEditor
                    value={productForm.description}
                    onChange={(value) => setProductForm({...productForm, description: value})}
                    placeholder="Describe your product with rich formatting..."
                    maxLength={1000}
                    className="border-gray-300 focus-within:ring-2 focus-within:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200"></div>

              {/* Section 2: Details & Pricing */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Details & Pricing</h4>
                
                {/* Product Details */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Product Details <span className="text-xs text-gray-500 font-normal">(Optional)</span>
                  </label>
                  <textarea
                    value={productForm.product_details}
                    onChange={(e) => setProductForm({...productForm, product_details: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors resize-vertical"
                    placeholder="High quality materials&#10;Carefully crafted&#10;Satisfaction guaranteed"
                    rows={3}
                  />
                </div>
                
                {/* Pricing Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Original Price */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Original Price (R) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={productForm.price_cents}
                      onChange={(e) => setProductForm({...productForm, price_cents: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                      placeholder="0.00"
                    />
                  </div>
                  
                  {/* Discounted Price */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Discounted Price (R) <span className="text-xs text-gray-500 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={productForm.discounted_price}
                      onChange={(e) => setProductForm({...productForm, discounted_price: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                      placeholder="Leave empty for no discount"
                    />
                    <p className="text-xs text-gray-500 mt-1">Shows HOT SALE badge when set</p>
                  </div>
                  
                  {/* Category */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Category *
                    </label>
                    <select
                      value={productForm.category}
                      onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    >
                      {categories.slice(1).map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200"></div>

              {/* Section 3: Product Images */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                    Product Images
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-medium">
                      {(Array.isArray(productImages) ? productImages.length : 0) + imageFiles.length}/{userTier === 'free' ? 1 : userTier === 'premium' ? 8 : 12}
                    </span>
                    <Badge variant={userTier === 'free' ? 'destructive' : 'default'} className="text-xs">
                      {userTier} tier
                    </Badge>
                  </div>
                </div>
                <p className="text-xs text-gray-600">📐 Recommended: 800×800px square images</p>
                
                {/* Combined Images Grid - Compact */}
                {(Array.isArray(productImages) && productImages.length > 0 || imageFiles.length > 0) && (
                  <div className="grid grid-cols-5 gap-1.5 mb-2">
                    {/* Existing Images */}
                    {Array.isArray(productImages) && productImages.map((img, index) => (
                      <div key={`existing-${index}`} className="relative group aspect-square">
                        <img
                          src={img.url}
                          alt={img.alt || 'Product'}
                          className="w-full h-full object-cover rounded border-2 border-emerald-500"
                        />
                        <button
                          onClick={() => handleRemoveExistingImage(index)}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        >
                          <X className="h-3 w-3" />
                        </button>
                        <div className="absolute bottom-0.5 left-0.5 bg-emerald-500 text-white text-[10px] px-1 rounded">
                          {index + 1}
                        </div>
                      </div>
                    ))}
                    {/* New Image Files */}
                    {imageFiles.map((file, index) => (
                      <div key={`new-${index}`} className="relative group aspect-square">
                        <img
                          src={URL.createObjectURL(file)}
                          alt="Preview"
                          className="w-full h-full object-cover rounded border-2 border-blue-500"
                        />
                        <button
                          onClick={() => handleRemoveImageFile(index)}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        >
                          <X className="h-3 w-3" />
                        </button>
                        <div className="absolute bottom-0.5 left-0.5 bg-blue-500 text-white text-[10px] px-1 rounded">
                          New
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload Button - Compact */}
                {(productImages.length + imageFiles.length) < (userTier === 'free' ? 1 : userTier === 'premium' ? 8 : 12) && (
                  <label className="flex items-center justify-center gap-2 w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-colors">
                    <Upload className="h-4 w-4 text-gray-400" />
                    <span className="text-xs text-gray-600">
                      Add Images
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                  </label>
                )}

              </div>
            </div>

              {/* Right Column - Live Preview (Desktop Only) */}
              <div className="hidden lg:flex flex-col w-80 bg-gray-50 p-6 overflow-y-auto flex-shrink-0 border-l border-gray-200">
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">Live Preview</h4>
                
                {/* Preview Product Card - EXACT SAME as profile page */}
                <div 
                  className="w-64 bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer transition-all duration-300 flex-shrink-0 relative group flex flex-col"
                  style={{ height: '550px' }}
                >
                  {/* Badge - Only show if discounted price exists */}
                  {productForm.discounted_price && (
                    <div className="absolute top-3 right-3 bg-gradient-to-r from-red-700 via-red-600 to-red-800 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider z-10 shadow-lg">
                      HOT SALE
                    </div>
                  )}

                  {/* Image Container - Auto-resizes to fit viewport */}
                  <div className="relative w-full h-56 overflow-hidden bg-gray-100">
                    {(() => {
                      const imagesArray: ProductImage[] = productImages && productImages.length > 0 ? productImages : []
                      
                      if (imageFiles && imageFiles.length > 0) {
                        return (
                          <img
                            src={URL.createObjectURL(imageFiles[0])}
                            alt="Preview"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        )
                      }
                      
                      if (imagesArray.length > 0) {
                        return (
                          <img
                            src={imagesArray[0]?.url}
                            alt="Preview"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        )
                      }
                      
                      return (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="w-12 h-12 text-gray-300" />
                        </div>
                      )
                    })()}
                  </div>

                  {/* Content */}
                  <div className="p-4 flex-1 flex flex-col overflow-hidden">
                    {/* Category */}
                    <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                      {productForm.category || 'Product'}
                    </div>

                    {/* Title */}
                    <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                      {productForm.name || 'Product Name'}
                    </h2>

                    {/* Description */}
                    {productForm.description ? (
                      <p className="text-sm text-gray-600 leading-relaxed mb-3 line-clamp-3 break-words">
                        {productForm.description.replace(/<[^>]*>/g, '')}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-400 leading-relaxed mb-3 line-clamp-3 break-words">
                        Product description will appear here
                      </p>
                    )}

                    {/* Product Details - 2 Columns (Max 2 Details) */}
                    {productForm.product_details ? (
                      <div className="mb-4 pb-3 border-b border-gray-100">
                        <div className="grid grid-cols-2 gap-2">
                          {productForm.product_details.split('\n').filter(d => d.trim()).slice(0, 2).map((detail, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                              <span className="text-xs text-gray-700 leading-tight">
                                {detail.trim()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="mb-4 pb-3 border-b border-gray-100">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-gray-300 flex-shrink-0 mt-0.5" />
                            <span className="text-xs text-gray-400 leading-tight">Detail 1</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-gray-300 flex-shrink-0 mt-0.5" />
                            <span className="text-xs text-gray-400 leading-tight">Detail 2</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Bottom Section */}
                    <div className="flex justify-between items-end gap-3 pt-3 border-t border-gray-100">
                      {/* Price */}
                      <div className="flex flex-col">
                        {productForm.price_cents ? (
                          <>
                            {productForm.discounted_price ? (
                              <>
                                <span className="text-xs text-gray-400 line-through">
                                  R{(parseFloat(productForm.price_cents) || 0).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                                <span className="text-2xl font-bold text-red-600">
                                  R{(parseFloat(productForm.discounted_price) || 0).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                              </>
                            ) : (
                              <span className="text-2xl font-bold text-gray-900">
                                R{(parseFloat(productForm.price_cents) || 0).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-sm text-gray-500 font-medium">Contact for price</span>
                        )}
                      </div>

                      {/* Add to Cart Button */}
                      <button 
                        className="bg-gradient-to-r from-gray-900 to-gray-700 hover:from-gray-800 hover:to-gray-600 text-white px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-md"
                      >
                        <span>Add</span>
                        <ShoppingBag className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Meta Info */}
                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        ))}
                        <span className="text-xs text-gray-500 ml-1">128 Reviews</span>
                      </div>
                      <div className="text-xs font-semibold text-green-600">In Stock</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Enhanced Footer */}
            <div className="flex gap-3 p-6 border-t border-gray-200 flex-shrink-0 bg-gray-50">
              <Button
                onClick={closeProductModal}
                variant="outline"
                className="flex-1 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors py-3 font-medium"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveProduct}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all py-3 font-medium"
                disabled={!productForm.name.trim() || uploadingImages}
              >
                {uploadingImages ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Package className="h-4 w-4 mr-2" />
                    {editingProduct ? 'Update Product' : 'Add Product'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Product Preview Modal */}
      {viewingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-xl font-bold text-gray-900">{viewingProduct.name}</h3>
              <button 
                onClick={() => setViewingProduct(null)}
                className="hover:bg-gray-100 rounded-full p-2"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto flex-1 p-6">
              {/* Image Gallery */}
              {((viewingProduct.images && viewingProduct.images.length > 0) || viewingProduct.image_url) && (
                <div className="mb-6">
                  {/* Main Image */}
                  <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden mb-3">
                    <img
                      src={
                        viewingProduct.images && viewingProduct.images.length > 0
                          ? viewingProduct.images[currentImageIndex].url
                          : viewingProduct.image_url!
                      }
                      alt={viewingProduct.name}
                      className="w-full h-full object-contain"
                    />
                    {/* Image Counter */}
                    {viewingProduct.images && viewingProduct.images.length > 1 && (
                      <div className="absolute bottom-3 right-3 bg-black bg-opacity-60 text-white text-sm px-3 py-1 rounded-full">
                        {currentImageIndex + 1} / {viewingProduct.images.length}
                      </div>
                    )}
                  </div>

                  {/* Thumbnail Strip */}
                  {viewingProduct.images && viewingProduct.images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {viewingProduct.images.map((img, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`flex-shrink-0 w-20 h-20 rounded border-2 overflow-hidden ${
                            currentImageIndex === index
                              ? 'border-emerald-500'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <img
                            src={img.url}
                            alt={`${viewingProduct.name} ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Product Details */}
              <div className="space-y-4">
                {/* Price */}
                <div>
                  <label className="text-sm font-medium text-gray-500">Price</label>
                  <p className="text-2xl font-bold text-emerald-600">
                    {viewingProduct.price_cents
                      ? `R${(viewingProduct.price_cents / 100).toLocaleString('en-ZA', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}`
                      : 'Contact for price'}
                  </p>
                </div>

                {/* Description */}
                {viewingProduct.description && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Description</label>
                    <div 
                      className="text-gray-700 mt-1 prose prose-sm max-w-none prose-headings:text-gray-800 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-800"
                      dangerouslySetInnerHTML={{ __html: viewingProduct.description }}
                    />
                  </div>
                )}

                {/* Category */}
                {viewingProduct.category && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Category</label>
                    <p className="text-gray-700 mt-1">
                      {categories.find(c => c.value === viewingProduct.category)?.label || viewingProduct.category}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-4 border-t bg-gray-50">
              <Button
                onClick={() => {
                  setViewingProduct(null)
                  handleEditProduct(viewingProduct)
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Product
              </Button>
              <Button
                onClick={() => setViewingProduct(null)}
                variant="outline"
                className="flex-1"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Popup */}
      <ConfirmationPopup
        isOpen={showDeleteConfirm}
        isDangerous={true}
        title="Delete Product"
        message={`"${productToDelete?.name}" will be permanently deleted`}
        description="This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={performDeleteProduct}
        onCancel={() => {
          setShowDeleteConfirm(false)
          setProductToDelete(null)
        }}
      />
    </div>
  )
}
