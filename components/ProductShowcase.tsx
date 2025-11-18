'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ShoppingBag, Eye, ChevronLeft, ChevronRight } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import Image from 'next/image'
import Link from 'next/link'

interface Product {
  id: string
  name: string
  description: string | null
  price_cents: number | null
  image_url: string | null
  profile_id: string
  created_at: string
  profiles?: {
    display_name: string
    avatar_url: string | null
    business_location: string | null
    verified_seller: boolean
  }
}

// Utility function to clean HTML content
const cleanHtmlContent = (html: string): string => {
  if (!html || typeof html !== 'string') return ''
  
  return html
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&quot;/g, '"') // Decode quotes
    .replace(/&amp;/g, '&') // Decode ampersands
    .replace(/&lt;/g, '<') // Decode less than
    .replace(/&gt;/g, '>') // Decode greater than
    .replace(/&nbsp;/g, ' ') // Replace non-breaking spaces
    .replace(/&hellip;/g, '...') // Replace ellipsis
    .replace(/&mdash;/g, '—') // Replace em dash
    .replace(/&ndash;/g, '–') // Replace en dash
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim()
}

export function ProductShowcase() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    fetchFeaturedProducts()
  }, [])

  const fetchFeaturedProducts = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('profile_products')
        .select(`
          id,
          name,
          description,
          price_cents,
          image_url,
          profile_id,
          created_at,
          profiles!inner(
            display_name,
            avatar_url,
            business_location,
            verified_seller
          )
        `)
        .not('name', 'is', null) // Only products with names
        .neq('name', '') // Not empty names
        .order('created_at', { ascending: false })
        .limit(15)

      if (error) {
        console.error('Error fetching products:', error)
        return
      }

      // Fix the profiles property - it comes as an array but we need a single object
      const fixedData = (data || []).map(product => ({
        ...product,
        profiles: Array.isArray(product.profiles) ? product.profiles[0] : product.profiles
      }))
      
      setProducts(fixedData)
    } catch (error) {
      console.error('Error fetching featured products:', error)
    } finally {
      setLoading(false)
    }
  }

  const nextProduct = () => {
    setCurrentIndex((prev) => (prev + 1) % products.length)
  }

  const prevProduct = () => {
    setCurrentIndex((prev) => (prev - 1 + products.length) % products.length)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-4 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.9)]">
        <div className="animate-pulse">
          <div className="flex gap-2 mb-3">
            <div className="w-8 h-8 bg-gray-300 rounded"></div>
            <div className="flex-1">
              <div className="h-3 bg-gray-300 rounded mb-1"></div>
              <div className="h-2 bg-gray-300 rounded w-2/3"></div>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-20 h-20 bg-gray-300 rounded-lg"></div>
            <div className="flex-1">
              <div className="h-3 bg-gray-300 rounded mb-2"></div>
              <div className="h-2 bg-gray-300 rounded mb-2"></div>
              <div className="h-6 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-4 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.9)]">
        <div className="text-center py-4">
          <div className="w-12 h-12 bg-gray-300 rounded-lg border-2 border-black flex items-center justify-center mx-auto mb-3">
            <ShoppingBag className="h-6 w-6 text-gray-600" />
          </div>
          <h3 className="font-black text-black text-sm mb-1">NO PRODUCTS YET</h3>
          <p className="text-gray-600 text-xs">Products will appear here as businesses add them</p>
        </div>
      </div>
    )
  }

  const currentProduct = products[currentIndex]
  const profile = currentProduct.profiles

  return (
    <div className="bg-white rounded-2xl p-4 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.9)]">
      {/* Compact Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <motion.div 
            className="w-8 h-8 bg-blue-500 rounded-lg border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]"
            whileHover={{ scale: 1.1, transition: { duration: 0.2 } }}
          >
            <ShoppingBag className="h-4 w-4 text-white" />
          </motion.div>
          <div>
            <h3 className="font-black text-black text-sm">FEATURED PRODUCTS</h3>
            <p className="text-xs text-gray-600 font-bold">Fresh from our community</p>
          </div>
        </div>
        
        {/* Navigation */}
        {products.length > 1 && (
          <div className="flex gap-1">
            <motion.button
              onClick={prevProduct}
              className="p-1 bg-gray-200 border-2 border-black rounded shadow-[1px_1px_0px_0px_rgba(0,0,0,0.9)]"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronLeft className="h-3 w-3 text-black" />
            </motion.button>
            <motion.button
              onClick={nextProduct}
              className="p-1 bg-gray-200 border-2 border-black rounded shadow-[1px_1px_0px_0px_rgba(0,0,0,0.9)]"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChevronRight className="h-3 w-3 text-black" />
            </motion.button>
          </div>
        )}
      </div>

      {/* Compact Product Card */}
      <motion.div 
        key={currentProduct.id}
        className="bg-gradient-to-br from-green-100 to-blue-100 rounded-lg p-3 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex gap-3">
          {/* Compact Product Image */}
          <div className="relative flex-shrink-0">
            <div className="w-24 h-24 bg-white rounded-lg border-2 border-black overflow-hidden shadow-[1px_1px_0px_0px_rgba(0,0,0,0.9)]">
              {currentProduct.image_url && currentProduct.image_url.trim() !== '' ? (
                <Image
                  src={currentProduct.image_url}
                  alt={currentProduct.name}
                  fill
                  className="object-cover"
                  sizes="80px"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                  <ShoppingBag className="h-6 w-6 text-gray-400" />
                </div>
              )}
            </div>
            
            {/* Price Badge */}
            {currentProduct.price_cents && (
              <div className="absolute -top-1 -right-1 bg-green-400 text-black px-2 py-0.5 rounded border-2 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,0.9)] font-black text-xs">
                R{(currentProduct.price_cents / 100).toFixed(0)}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <h4 className="font-black text-black text-sm mb-1 truncate">
              {currentProduct.name || 'Untitled Product'}
            </h4>
            
            {currentProduct.description && currentProduct.description.trim() !== '' && (
              <p className="text-black text-xs mb-2 font-bold leading-tight" style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {(() => {
                  const cleanText = cleanHtmlContent(currentProduct.description)
                  return cleanText.length > 80 ? cleanText.substring(0, 80) + '...' : cleanText
                })()}
              </p>
            )}

            {/* Seller Info */}
            <div className="flex items-center gap-2 mb-2">
              {profile?.avatar_url && profile.avatar_url.trim() !== '' ? (
                <Image
                  src={profile.avatar_url}
                  alt={profile.display_name || 'Seller'}
                  width={16}
                  height={16}
                  className="rounded-full border border-black"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              ) : (
                <div className="w-4 h-4 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full border border-black flex items-center justify-center">
                  <span className="text-white text-xs font-black">
                    {(profile?.display_name || 'U').charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <span className="text-black font-bold text-xs truncate">
                {profile?.display_name || 'Unknown Seller'}
              </span>
              {profile?.verified_seller && (
                <div className="w-3 h-3 bg-blue-500 rounded-full border border-black flex items-center justify-center">
                  <div className="w-1 h-1 bg-white rounded-full"></div>
                </div>
              )}
            </div>

            {/* Action Button */}
            <Link
              href={profile?.display_name 
                ? `https://a2zsellr.life/profile/${profile.display_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`
                : '#'
              }
              className="block"
              target="_blank"
              rel="noopener noreferrer"
            >
              <motion.button 
                className="w-full bg-blue-500 text-white py-1.5 px-3 rounded text-xs font-black border-2 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,0.9)]"
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: "2px 2px 0px 0px rgba(0,0,0,0.9)"
                }}
                whileTap={{ scale: 0.98 }}
              >
                <Eye className="h-3 w-3 inline mr-1" />
                VIEW SHOP
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.div>
      
      {/* Compact Product Counter */}
      {products.length > 1 && (
        <div className="flex justify-center gap-1 mt-2">
          {products.slice(0, 8).map((_, index) => (
            <motion.button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full border border-black transition-all ${
                index === currentIndex 
                  ? 'bg-blue-400 shadow-[1px_1px_0px_0px_rgba(0,0,0,0.9)]' 
                  : 'bg-white hover:bg-gray-200'
              }`}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            />
          ))}
          {products.length > 8 && (
            <span className="text-xs text-gray-500 ml-1">+{products.length - 8}</span>
          )}
        </div>
      )}
    </div>
  )
}