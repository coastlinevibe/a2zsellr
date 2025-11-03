'use client'

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { supabase } from '@/lib/supabaseClient'
import EmojiPicker from '@/components/ui/emoji-picker'
import { 
  ShoppingCart, 
  Plus, 
  Search,
  Package,
  Edit,
  Trash2,
  X,
  Share2
} from 'lucide-react'

interface Product {
  id: string
  profile_id: string
  name: string
  description: string | null
  price_cents: number | null
  category: string | null
  image_url: string | null
  is_active: boolean
  created_at: string
}

interface BusinessShopProps {
  businessId: string
  isOwner?: boolean
}

export default function BusinessShop({ 
  businessId, 
  isOwner = false
}: BusinessShopProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [manageMode, setManageMode] = useState(false)
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price_cents: '',
    category: '',
    image_url: ''
  })

  // Simple categories for basic businesses
  const categories = [
    { value: 'all', label: 'All Products' },
    { value: 'products', label: 'Products' },
    { value: 'services', label: 'Services' },
    { value: 'food', label: 'Food & Drinks' },
    { value: 'retail', label: 'Retail Items' }
  ]

  useEffect(() => {
    fetchProducts()
  }, [businessId])

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

  const handleAddProduct = () => {
    setProductForm({
      name: '',
      description: '',
      price_cents: '',
      category: 'products',
      image_url: ''
    })
    setEditingProduct(null)
    setShowAddProduct(true)
  }

  const handleEditProduct = (product: Product) => {
    setProductForm({
      name: product.name,
      description: product.description || '',
      price_cents: product.price_cents ? (product.price_cents / 100).toString() : '',
      category: product.category || 'products',
      image_url: product.image_url || ''
    })
    setEditingProduct(product)
    setShowAddProduct(true)
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Delete this product?')) return

    try {
      const { error } = await supabase
        .from('profile_products')
        .delete()
        .eq('id', productId)

      if (error) throw error
      fetchProducts()
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Failed to delete product')
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
      const shareUrl = `https://www.a2zsellr.life/profile/${businessName}?product=${encodeURIComponent(productSlug)}`
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
          alert('Product link copied to clipboard!')
        }).catch(() => {
          // Fallback: Show share dialog with the link
          prompt('Copy this link to share:', shareUrl)
        })
      }
    } catch (error) {
      console.error('Error sharing product:', error)
    }
  }

  const handleSaveProduct = async () => {
    if (!productForm.name.trim()) return

    try {
      const productData = {
        profile_id: businessId,
        name: productForm.name,
        description: productForm.description || null,
        price_cents: productForm.price_cents ? Math.round(parseFloat(productForm.price_cents) * 100) : null,
        category: productForm.category,
        image_url: productForm.image_url || null,
        is_active: true
      }

      if (editingProduct) {
        const { error } = await supabase
          .from('profile_products')
          .update(productData)
          .eq('id', editingProduct.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('profile_products')
          .insert([productData])
        if (error) throw error
      }

      fetchProducts()
      setShowAddProduct(false)
    } catch (error) {
      console.error('Error saving product:', error)
      alert('Failed to save product')
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Shop</h2>
          <p className="text-gray-600">{products.length} products available</p>
        </div>
        {isOwner && (
          <div className="flex gap-2">
            <Button 
              variant={manageMode ? "default" : "outline"} 
              onClick={() => setManageMode(!manageMode)}
              className={`rounded-[9px] ${manageMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}`}
            >
              <Edit className="h-4 w-4 mr-2" />
              {manageMode ? 'Done Managing' : 'Manage Shop'}
            </Button>
            <Button onClick={handleAddProduct} className="bg-emerald-600 hover:bg-emerald-700 rounded-[9px]">
              <Plus className="h-4 w-4 mr-2" />
              Add to Shop
            </Button>
          </div>
        )}
      </div>

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map(product => (
            <div key={product.id} className={`bg-white rounded-[9px] border overflow-hidden transition-all ${
              manageMode 
                ? 'border-blue-300 hover:border-blue-500 hover:shadow-lg' 
                : 'border-gray-200 hover:shadow-md'
            }`}>
              {product.image_url && (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 flex-1">{product.name}</h3>
                  {isOwner && manageMode && (
                    <div className="flex gap-1 ml-2">
                      <button
                        onClick={() => handleEditProduct(product)}
                        className="p-1.5 text-white bg-blue-600 hover:bg-blue-700 rounded-[9px]"
                        title="Edit product"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-1.5 text-white bg-red-600 hover:bg-red-700 rounded-[9px]"
                        title="Delete product"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  {isOwner && !manageMode && (
                    <button
                      onClick={() => handleShareProduct(product)}
                      className="p-1 text-gray-400 hover:text-emerald-600"
                      title="Share product"
                    >
                      <Share2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                
                {product.description && (
                  <p className="text-gray-600 text-sm mb-3">{product.description}</p>
                )}
                
                <div className="flex items-center justify-between">
                  <div>
                    {product.price_cents ? (
                      <span className="text-lg font-bold text-emerald-600">
                        R{(product.price_cents / 100).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    ) : (
                      <span className="text-gray-500">Contact for price</span>
                    )}
                  </div>
                </div>
                
                {product.category && (
                  <div className="mt-2">
                    <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-[9px]">
                      {categories.find(c => c.value === product.category)?.label || product.category}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Product Modal */}
      {showAddProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-[9px] shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">
                {editingProduct ? 'Edit Product' : 'Add to Shop'}
              </h3>
              <button onClick={() => setShowAddProduct(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-[9px] focus:ring-2 focus:ring-emerald-500"
                  placeholder="Product name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <div className="relative">
                  <textarea
                    value={productForm.description}
                    onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                    rows={2}
                    className="w-full px-3 py-2 pr-12 border border-gray-300 rounded-[9px] focus:ring-2 focus:ring-emerald-500"
                    placeholder="Brief description 😊"
                  />
                  <div className="absolute bottom-2 right-2">
                    <EmojiPicker
                      onEmojiSelect={(emoji) => {
                        const newDescription = productForm.description + emoji
                        setProductForm({...productForm, description: newDescription})
                      }}
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (R)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={productForm.price_cents}
                  onChange={(e) => setProductForm({...productForm, price_cents: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-[9px] focus:ring-2 focus:ring-emerald-500"
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={productForm.category}
                  onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-[9px] focus:ring-2 focus:ring-emerald-500"
                >
                  {categories.slice(1).map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input
                  type="url"
                  value={productForm.image_url}
                  onChange={(e) => setProductForm({...productForm, image_url: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-[9px] focus:ring-2 focus:ring-emerald-500"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>
            
            <div className="flex gap-3 p-4 border-t">
              <Button
                onClick={() => setShowAddProduct(false)}
                variant="outline"
                className="flex-1 rounded-[9px]"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveProduct}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 rounded-[9px]"
                disabled={!productForm.name.trim()}
              >
                {editingProduct ? 'Update' : 'Add'} Product
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
