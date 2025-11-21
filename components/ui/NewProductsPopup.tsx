'use client'

import { useState, useEffect } from 'react'
import { X, Package, Star, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabaseClient'
import { motion } from 'framer-motion'

interface Product {
  id: string
  name: string
  description?: string
  price_cents?: number
  image_url?: string
  created_at: string
}

interface NewProductsPopupProps {
  isOpen: boolean
  onClose: () => void
  profileId?: string
  businessName?: string
}

export function NewProductsPopup({ 
  isOpen, 
  onClose, 
  profileId,
  businessName 
}: NewProductsPopupProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && profileId) {
      fetchNewProducts()
    }
  }, [isOpen, profileId])

  const fetchNewProducts = async () => {
    if (!profileId) {
      console.log('No profileId provided to NewProductsPopup')
      return
    }

    console.log('Fetching products for profileId:', profileId)
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('profile_products')
        .select('id, name, description, price_cents, image_url, created_at')
        .eq('profile_id', profileId)
        .order('created_at', { ascending: false })
        .limit(3)

      if (error) {
        console.error('Error fetching products:', error)
        return
      }

      console.log('Fetched products for profile:', profileId, 'Found:', data?.length || 0, 'products')
      setProducts(data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const renderProductContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )
    }

    if (!products || products.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64 bg-gray-100 rounded-lg">
          <Package className="w-16 h-16 text-gray-400 mb-4" />
          <p className="text-gray-500">No new products available</p>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product, index) => (
          <motion.div
            key={product.id}
            className="relative rounded-2xl border-4 border-black overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] bg-green-50"
            initial={{ 
              opacity: 0, 
              y: 50,
              rotate: -5,
              scale: 0.8
            }}
            animate={{ 
              opacity: 1, 
              y: 0,
              rotate: 0,
              scale: 1
            }}
            transition={{ 
              duration: 0.6,
              delay: index * 0.1,
              type: "spring",
              stiffness: 100,
              damping: 15
            }}
            whileHover={{
              scale: 1.02,
              rotate: 1,
              x: 2,
              y: -2,
              boxShadow: "8px 8px 0px 0px rgba(0,0,0,0.9)",
              transition: { duration: 0.2 }
            }}
            whileTap={{
              scale: 0.98,
              rotate: -1,
              transition: { duration: 0.1 }
            }}
          >
            {/* NEW Badge - Positioned at top right corner */}
            <motion.div 
              className="absolute top-2 right-2 z-10"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: index * 0.1 + 0.3, type: "spring", stiffness: 200 }}
            >
              <div className="bg-green-500 text-white border-2 border-black px-3 py-1 rounded-lg text-xs font-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.9)]">
                <Star className="h-3 w-3 mr-1 inline" />
                NEW
              </div>
            </motion.div>

            {/* Header with product name */}
            <div className="h-20 relative bg-green-400 border-b-4 border-black">
              {/* Product Icon in Header - Top Left */}
              <motion.div 
                className="absolute top-3 left-3"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: index * 0.1 + 0.2, type: "spring", stiffness: 150 }}
              >
                <div className="w-12 h-12 rounded-lg bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)] flex items-center justify-center">
                  <Package className="w-6 h-6 text-black" />
                </div>
              </motion.div>

              {/* Product Name and Category */}
              <motion.div 
                className="absolute top-3 left-16 right-3 text-black"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 + 0.4, duration: 0.5 }}
              >
                <h3 className="text-sm font-black leading-tight uppercase truncate pr-2">
                  {product.name}
                </h3>
                <p className="text-xs font-bold leading-tight uppercase truncate pr-2">
                  PRODUCT
                </p>
                <p className="text-xs font-bold mt-0.5 leading-tight truncate pr-2">
                  Added {new Date(product.created_at).toLocaleDateString()}
                </p>
              </motion.div>
            </div>

            {/* Product Image Showcase */}
            <div className="overflow-hidden">
              {product.image_url ? (
                <div className="min-h-[170px] max-h-[170px] h-[170px] w-full overflow-hidden border-b-4 border-black">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              ) : (
                <div className="min-h-[170px] max-h-[170px] h-[170px] w-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border-b-4 border-black relative overflow-hidden">
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <svg width="100%" height="100%" viewBox="0 0 100 100" className="w-full h-full">
                      <defs>
                        <pattern id={`grid-${product.id}`} width="20" height="20" patternUnits="userSpaceOnUse">
                          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="1"/>
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill={`url(#grid-${product.id})`} />
                    </svg>
                  </div>
                  
                  {/* Main Icon */}
                  <div className="relative z-10 text-center">
                    <Package className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                      No Product Image
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Content */}
            <motion.div 
              className="p-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 + 0.5, duration: 0.5 }}
            >
              {/* Description */}
              {product.description && (
                <motion.div 
                  className="flex items-start gap-2 mb-3 bg-blue-300 p-2 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 + 0.6, duration: 0.4 }}
                  whileHover={{ scale: 1.02, x: 2, transition: { duration: 0.2 } }}
                >
                  <div className="text-sm font-black text-black overflow-hidden" style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical'
                  }}>
                    {product.description}
                  </div>
                </motion.div>
              )}

              {/* Price Info */}
              {product.price_cents && (
                <motion.div 
                  className="flex items-center justify-center gap-2 mb-4 bg-yellow-300 p-3 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 + 0.7, duration: 0.4 }}
                  whileHover={{ scale: 1.02, x: 2, transition: { duration: 0.2 } }}
                >
                  <span className="text-lg font-black text-black">
                    R{(product.price_cents / 100).toFixed(2)}
                  </span>
                </motion.div>
              )}

              {/* Action Button */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 + 0.8, duration: 0.4 }}
                whileTap={{ 
                  scale: 0.95,
                  rotate: -1,
                  transition: { duration: 0.1 }
                }}
              >
                <button
                  className="w-full text-center text-sm font-black transition-all block bg-green-500 text-white border-3 border-black rounded-lg shadow-[0.1em_0.1em] hover:shadow-[0.15em_0.15em] hover:translate-x-[-0.05em] hover:translate-y-[-0.05em] active:shadow-[0.05em_0.05em] active:translate-x-[0.05em] active:translate-y-[0.05em]"
                  style={{
                    padding: '0.6em 1.3em',
                    fontWeight: 900,
                    fontSize: '14px',
                    border: '3px solid black',
                    borderRadius: '0.4em',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  VIEW PRODUCT
                </button>
              </motion.div>
            </motion.div>
          </motion.div>
        ))}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75">
      <div className="relative w-full max-w-6xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {businessName ? `${businessName} - Latest Products` : 'Latest Products'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {products.length > 0 ? `${products.length} newest items` : 'Recently added products'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Products Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {renderProductContent()}
        </div>

        {/* Footer */}
        {products.length > 0 && (
          <div className="border-t bg-gray-50 p-4 text-center">
            <p className="text-sm text-gray-600">
              Want to see more? Visit our full product catalog
            </p>
          </div>
        )}
      </div>
    </div>
  )
}