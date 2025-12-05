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
  discounted_price?: string | null
  image_url: string | null
  profile_id: string
  created_at: string
  profiles?: {
    display_name: string
    avatar_url: string | null
    business_location: string | null
    verified_seller: boolean
    twitter: string | null
    youtube: string | null
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

// Helper function to ensure URLs are absolute
const ensureAbsoluteUrl = (url: string | null): string => {
  if (!url) return ''
  
  // If URL already starts with http:// or https://, return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  
  // If URL starts with www., add https://
  if (url.startsWith('www.')) {
    return `https://${url}`
  }
  
  // For social media platforms, add https://
  if (url.includes('twitter.com') || url.includes('youtube.com') ||
      url.includes('x.com')) {
    return `https://${url}`
  }
  
  // For other URLs, add https://
  return `https://${url}`
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
          discounted_price,
          image_url,
          profile_id,
          created_at,
          profiles!inner(
            display_name,
            avatar_url,
            business_location,
            verified_seller,
            twitter,
            youtube
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
            <div className="w-24 h-24 bg-white rounded-lg border-2 border-black overflow-hidden shadow-[1px_1px_0px_0px_rgba(0,0,0,0.9)] relative">
              {currentProduct.image_url && currentProduct.image_url.trim() !== '' ? (
                <Image
                  src={currentProduct.image_url}
                  alt={currentProduct.name}
                  width={96}
                  height={96}
                  className="object-cover w-full h-full"
                  sizes="96px"
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
              <div className={`absolute -top-1 -right-1 px-2 py-0.5 rounded border-2 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,0.9)] font-black text-xs ${
                currentProduct.discounted_price ? 'bg-red-400' : 'bg-green-400'
              } text-black`}>
                {currentProduct.discounted_price ? (
                  <>
                    <div className="text-xs line-through opacity-70">R{(currentProduct.price_cents / 100).toFixed(0)}</div>
                    <div>R{parseFloat(currentProduct.discounted_price).toFixed(0)}</div>
                  </>
                ) : (
                  `R${(currentProduct.price_cents / 100).toFixed(0)}`
                )}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex-1 min-w-0">
            {/* Product Name with Social Icons */}
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-black text-black text-sm truncate flex-1 mr-2">
                {currentProduct.name || 'Untitled Product'}
              </h4>
              
              {/* Social Media Icons - Right of Product Name */}
              {(profile?.twitter || profile?.youtube) && (
                <div className="holographic-stack-mini flex-shrink-0">
                  {profile?.twitter && (
                    <a
                      href={ensureAbsoluteUrl(profile.twitter)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="holographic-icon-mini twitter"
                      title="Twitter/X"
                    >
                      <div className="holographic-ring-mini"></div>
                      <div className="holographic-particles-mini"></div>
                      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                      </svg>
                      <div className="holographic-pulse-mini"></div>
                    </a>
                  )}
                  
                  {profile?.youtube && (
                    <a
                      href={ensureAbsoluteUrl(profile.youtube)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="holographic-icon-mini youtube"
                      title="YouTube"
                    >
                      <div className="holographic-ring-mini"></div>
                      <div className="holographic-particles-mini"></div>
                      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                      <div className="holographic-pulse-mini"></div>
                    </a>
                  )}
                </div>
              )}
            </div>
            
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
              <div className="w-4 h-4 flex-shrink-0 rounded-full border border-black overflow-hidden bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center">
                {profile?.avatar_url && profile.avatar_url.trim() !== '' ? (
                  <Image
                    src={profile.avatar_url}
                    alt={profile.display_name || 'Seller'}
                    width={16}
                    height={16}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                ) : (
                  <span className="text-white text-xs font-black">
                    {(profile?.display_name || 'U').charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <span className="text-black font-bold text-xs truncate">
                {profile?.display_name || 'Unknown Seller'}
              </span>
              {profile?.verified_seller && (
                <div className="w-3 h-3 bg-blue-500 rounded-full border border-black flex items-center justify-center flex-shrink-0">
                  <div className="w-1 h-1 bg-white rounded-full"></div>
                </div>
              )}
            </div>

            {/* Action Buttons - Two buttons side by side */}
            <div className="flex gap-1">
              <Link
                href={profile?.display_name 
                  ? `https://www.a2zsellr.life/profile/${encodeURIComponent(profile.display_name.toLowerCase().trim())}`
                  : '#'
                }
                className="flex-1 inline-flex items-center justify-center"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: '#5cbdfd',
                  fontFamily: 'inherit',
                  padding: '0.4em 0.8em',
                  fontWeight: 900,
                  fontSize: '11px',
                  border: '2px solid black',
                  borderRadius: '0.3em',
                  boxShadow: '0.08em 0.08em',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  color: 'black'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translate(-0.04em, -0.04em)';
                  e.currentTarget.style.boxShadow = '0.12em 0.12em';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translate(0, 0)';
                  e.currentTarget.style.boxShadow = '0.08em 0.08em';
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.transform = 'translate(0.04em, 0.04em)';
                  e.currentTarget.style.boxShadow = '0.04em 0.04em';
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = 'translate(-0.04em, -0.04em)';
                  e.currentTarget.style.boxShadow = '0.12em 0.12em';
                }}
              >
                <Eye className="h-3 w-3 inline mr-1" />
                View Shop
              </Link>
              
              <Link
                href={profile?.display_name 
                  ? `https://www.a2zsellr.life/profile/${encodeURIComponent(profile.display_name.toLowerCase().trim())}?product=${currentProduct.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`
                  : '#'
                }
                className="flex-1 inline-flex items-center justify-center"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: '#22c55e',
                  fontFamily: 'inherit',
                  padding: '0.4em 0.8em',
                  fontWeight: 900,
                  fontSize: '11px',
                  border: '2px solid black',
                  borderRadius: '0.3em',
                  boxShadow: '0.08em 0.08em',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  color: 'black'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translate(-0.04em, -0.04em)';
                  e.currentTarget.style.boxShadow = '0.12em 0.12em';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translate(0, 0)';
                  e.currentTarget.style.boxShadow = '0.08em 0.08em';
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.transform = 'translate(0.04em, 0.04em)';
                  e.currentTarget.style.boxShadow = '0.04em 0.04em';
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = 'translate(-0.04em, -0.04em)';
                  e.currentTarget.style.boxShadow = '0.12em 0.12em';
                }}
              >
                <ShoppingBag className="h-3 w-3 inline mr-1" />
                Purchase
              </Link>
            </div>
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

      {/* Mini Holographic Social Media Styles */}
      <style jsx>{`
        .holographic-stack-mini {
          display: flex;
          justify-content: flex-start;
          align-items: center;
          gap: 10px;
          perspective: 1000px;
        }

        .holographic-icon-mini {
          position: relative;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          transform-style: preserve-3d;
        }

        .holographic-icon-mini svg {
          width: 14px;
          height: 14px;
          position: relative;
          z-index: 3;
          transition: all 0.2s ease;
          filter: drop-shadow(0 0 2px currentColor);
        }

        .holographic-ring-mini {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          border: 1px solid;
          border-top-color: transparent;
          border-bottom-color: transparent;
          animation: rotate-mini 2s linear infinite;
          opacity: 0.6;
        }

        .holographic-particles-mini {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: radial-gradient(
            circle,
            transparent 20%,
            currentColor 20%,
            currentColor 30%,
            transparent 30%,
            transparent 40%,
            currentColor 40%,
            currentColor 50%,
            transparent 50%
          );
          background-size: 8px 8px;
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .holographic-pulse-mini {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          box-shadow: 0 0 8px currentColor;
          opacity: 0;
          transition: opacity 0.2s ease, transform 0.2s ease;
        }

        .holographic-icon-mini.twitter {
          color: #1da1f2;
        }

        .holographic-icon-mini.twitter:hover {
          color: #0d8bd9;
          transform: translateY(-3px) rotateX(15deg);
        }

        .holographic-icon-mini.youtube {
          color: #ff0000;
        }

        .holographic-icon-mini.youtube:hover {
          color: #cc0000;
          transform: translateY(-3px) rotateX(15deg);
        }

        .holographic-icon-mini:hover svg {
          transform: scale(1.1) rotate(5deg);
        }

        .holographic-icon-mini:hover .holographic-particles-mini {
          opacity: 0.2;
          animation: particles-mini 2s linear infinite;
        }

        .holographic-icon-mini:hover .holographic-pulse-mini {
          opacity: 0.3;
          animation: pulse-mini 1.5s ease-out infinite;
        }

        @keyframes rotate-mini {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes particles-mini {
          from {
            background-position: 0 0;
          }
          to {
            background-position: 16px 16px;
          }
        }

        @keyframes pulse-mini {
          0% {
            transform: scale(0.8);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.1;
          }
          100% {
            transform: scale(1.2);
            opacity: 0;
          }
        }

        .holographic-icon-mini::before {
          content: "";
          position: absolute;
          bottom: -3px;
          left: 10%;
          width: 80%;
          height: 15%;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 50%;
          filter: blur(3px);
          transform: rotateX(80deg) translateZ(-10px);
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .holographic-icon-mini:hover::before {
          opacity: 0.3;
        }
      `}</style>
    </div>
  )
}