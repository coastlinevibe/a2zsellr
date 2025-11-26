'use client'

import { useEffect, useState } from 'react'
import { MessageSquare, Package, FileText, Loader2, X } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/lib/auth'

interface StepWhatProps {
  state: any
  onUpdate: (updates: any) => void
}

interface Product {
  id: string
  name: string
  price_cents?: number
  image_url?: string
  description?: string
}

interface Listing {
  id: string
  title: string
  message_template?: string
  layout_type?: string
  status?: string
  created_at: string
  uploaded_media?: Array<{
    id: string
    name: string
    url: string
    type: string
  }>
}

export default function StepWhat({ state, onUpdate }: StepWhatProps) {
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [listings, setListings] = useState<Listing[]>([])
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [loadingListings, setLoadingListings] = useState(false)

  const contentOptions = [
    {
      id: 'product',
      label: 'Product',
      description: 'Send individual products from your catalog',
      icon: Package,
      color: 'blue',
    },
    {
      id: 'listing',
      label: 'Listing',
      description: 'Send a complete listing/campaign',
      icon: FileText,
      color: 'purple',
    },
    {
      id: 'custom',
      label: 'Custom Message',
      description: 'Send a custom text message',
      icon: MessageSquare,
      color: 'green',
    },
  ]

  // Fetch products
  useEffect(() => {
    if (!user?.id) return

    const fetchProducts = async () => {
      setLoadingProducts(true)
      try {
        const { data, error } = await supabase
          .from('profile_products')
          .select('*')
          .eq('profile_id', user.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false })

        if (error) throw error
        setProducts(data || [])
      } catch (error) {
        console.error('Error fetching products:', error)
        setProducts([])
      } finally {
        setLoadingProducts(false)
      }
    }

    fetchProducts()
  }, [user?.id])

  // Fetch listings
  useEffect(() => {
    if (!user?.id) return

    const fetchListings = async () => {
      setLoadingListings(true)
      try {
        const { data, error } = await supabase
          .from('profile_listings')
          .select('*')
          .eq('profile_id', user.id)
          .order('created_at', { ascending: false })

        if (error) throw error
        setListings(data || [])
      } catch (error) {
        console.error('Error fetching listings:', error)
        setListings([])
      } finally {
        setLoadingListings(false)
      }
    }

    fetchListings()
  }, [user?.id])

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">📱 What's your message?</h2>
        <p className="text-gray-600">Pick what you want to share</p>
      </div>

      {/* Content Type Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {contentOptions.map((option) => {
          const Icon = option.icon
          const isSelected = state.contentType === option.id
          const colorClasses = {
            blue: 'border-blue-300 bg-blue-50 hover:bg-blue-100',
            purple: 'border-purple-300 bg-purple-50 hover:bg-purple-100',
            green: 'border-green-300 bg-green-50 hover:bg-green-100',
          }

          return (
            <button
              key={option.id}
              onClick={() => {
                onUpdate({ contentType: option.id })
                // Reset selections when changing content type
                onUpdate({
                  selectedProducts: [],
                  selectedListings: [],
                  customMessage: '',
                })
              }}
              className={`p-6 rounded-lg border-2 transition-all text-left ${
                isSelected
                  ? `border-${option.color}-500 bg-${option.color}-100 shadow-lg`
                  : `border-gray-200 bg-white hover:border-gray-300`
              } ${colorClasses[option.color as keyof typeof colorClasses]}`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${
                  isSelected
                    ? `bg-${option.color}-200`
                    : 'bg-gray-100'
                }`}>
                  <Icon className={`w-6 h-6 ${
                    isSelected
                      ? `text-${option.color}-600`
                      : 'text-gray-600'
                  }`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-1">{option.label}</h3>
                  <p className="text-sm text-gray-600">{option.description}</p>
                </div>
                {isSelected && (
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* Content Selection Based on Type */}
      {state.contentType === 'product' && (
        <div className="space-y-4 p-6 bg-blue-50 rounded-lg border-2 border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Select Products</h3>
            <span className="text-sm text-gray-600">
              {state.selectedProducts.length} selected
            </span>
          </div>
          <p className="text-sm text-gray-600">
            Choose up to 8 products (Premium) or 12 products (Business)
          </p>

          {/* Selected Products */}
          {state.selectedProducts.length > 0 && (
            <div className="mb-4 p-4 bg-white rounded-lg border-2 border-blue-300">
              <p className="text-xs font-semibold text-gray-700 mb-3">Selected Products:</p>
              <div className="flex flex-wrap gap-2">
                {state.selectedProducts.map((productId: string) => {
                  const product = products.find(p => p.id === productId)
                  return (
                    <div
                      key={productId}
                      className="flex items-center gap-2 bg-blue-100 px-3 py-2 rounded-lg border border-blue-300"
                    >
                      <span className="text-sm font-medium text-gray-900">{product?.name}</span>
                      <button
                        onClick={() => onUpdate({
                          selectedProducts: state.selectedProducts.filter((id: string) => id !== productId)
                        })}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Product List */}
          {loadingProducts ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
              {products.map((product) => (
                <button
                  key={product.id}
                  onClick={() => {
                    if (state.selectedProducts.includes(product.id)) {
                      onUpdate({
                        selectedProducts: state.selectedProducts.filter((id: string) => id !== product.id)
                      })
                    } else {
                      onUpdate({
                        selectedProducts: [...state.selectedProducts, product.id]
                      })
                    }
                  }}
                  className={`p-4 rounded-lg border-2 transition-all text-left flex gap-3 ${
                    state.selectedProducts.includes(product.id)
                      ? 'border-blue-500 bg-blue-100'
                      : 'border-gray-200 bg-white hover:border-blue-300'
                  }`}
                >
                  {/* Product Image */}
                  <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg border border-gray-300 overflow-hidden flex items-center justify-center">
                    {product.image_url && product.image_url.trim() !== '' ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    ) : (
                      <Package className="w-6 h-6 text-gray-400" />
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 mb-1 line-clamp-2">{product.name}</h4>
                    <p className="text-sm font-bold text-blue-600 mb-2">
                      R {product.price_cents ? (product.price_cents / 100).toFixed(2) : '0.00'}
                    </p>
                    {product.description && (
                      <p className="text-xs text-gray-600 line-clamp-2">{product.description}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="bg-white border-2 border-dashed border-blue-300 rounded-lg p-8 text-center">
              <Package className="w-12 h-12 text-blue-300 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">No products found</p>
              <p className="text-sm text-gray-500 mt-1">Create products in your catalog to send them via WhatsApp</p>
            </div>
          )}
        </div>
      )}

      {state.contentType === 'listing' && (
        <div className="space-y-4 p-6 bg-purple-50 rounded-lg border-2 border-purple-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Select Listings</h3>
            <span className="text-sm text-gray-600">
              {state.selectedListings.length} selected
            </span>
          </div>
          <p className="text-sm text-gray-600">
            Choose up to 8 listings (Premium) or unlimited listings (Business)
          </p>

          {/* Selected Listings */}
          {state.selectedListings.length > 0 && (
            <div className="mb-4 p-4 bg-white rounded-lg border-2 border-purple-300">
              <p className="text-xs font-semibold text-gray-700 mb-3">Selected Listings:</p>
              <div className="flex flex-wrap gap-2">
                {state.selectedListings.map((listingId: string) => {
                  const listing = listings.find(l => l.id === listingId)
                  return (
                    <div
                      key={listingId}
                      className="flex items-center gap-2 bg-purple-100 px-3 py-2 rounded-lg border border-purple-300"
                    >
                      <span className="text-sm font-medium text-gray-900">{listing?.name}</span>
                      <button
                        onClick={() => onUpdate({
                          selectedListings: state.selectedListings.filter((id: string) => id !== listingId)
                        })}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Listing List */}
          {loadingListings ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
            </div>
          ) : listings.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {listings.map((listing) => {
                // Get first image from uploaded_media if available
                const firstImage = listing.uploaded_media?.[0]?.url
                
                return (
                  <button
                    key={listing.id}
                    onClick={() => {
                      if (state.selectedListings.includes(listing.id)) {
                        onUpdate({
                          selectedListings: state.selectedListings.filter((id: string) => id !== listing.id)
                        })
                      } else {
                        onUpdate({
                          selectedListings: [...state.selectedListings, listing.id]
                        })
                      }
                    }}
                    className={`w-full p-4 rounded-lg border-2 transition-all text-left flex gap-3 ${
                      state.selectedListings.includes(listing.id)
                        ? 'border-purple-500 bg-purple-100'
                        : 'border-gray-200 bg-white hover:border-purple-300'
                    }`}
                  >
                    {/* Listing Image */}
                    <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg border border-gray-300 overflow-hidden flex items-center justify-center">
                      {firstImage ? (
                        <img
                          src={firstImage}
                          alt={listing.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      ) : (
                        <FileText className="w-6 h-6 text-gray-400" />
                      )}
                    </div>

                    {/* Listing Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 mb-1 line-clamp-2">{listing.title}</h4>
                      
                      {/* Message Preview */}
                      {listing.message_template && (
                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                          {listing.message_template.replace(/<[^>]*>/g, '')}
                        </p>
                      )}

                      {/* Layout Type & Media Count */}
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        {listing.layout_type && (
                          <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                            {listing.layout_type.replace('-', ' ')}
                          </span>
                        )}
                        {listing.uploaded_media && listing.uploaded_media.length > 0 && (
                          <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                            {listing.uploaded_media.length} media
                          </span>
                        )}
                        <span>
                          {new Date(listing.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="bg-white border-2 border-dashed border-purple-300 rounded-lg p-8 text-center">
              <FileText className="w-12 h-12 text-purple-300 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">No listings found</p>
              <p className="text-sm text-gray-500 mt-1">Create listings in your dashboard to send them via WhatsApp</p>
            </div>
          )}
        </div>
      )}

      {state.contentType === 'custom' && (
        <div className="space-y-4 p-6 bg-green-50 rounded-lg border-2 border-green-200">
          <h3 className="font-bold text-gray-900">Compose Message</h3>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Your Message</label>
            <textarea
              value={state.customMessage}
              onChange={(e) => onUpdate({ customMessage: e.target.value })}
              placeholder="Type your message here... (max 4096 characters)"
              maxLength={4096}
              className="w-full px-4 py-3 border-2 border-green-300 rounded-lg focus:border-green-500 focus:outline-none resize-none h-32"
            />
            <div className="flex justify-between text-xs text-gray-600">
              <span>Character count: {state.customMessage.length} / 4096</span>
              {state.customMessage.length > 0 && (
                <span className="text-green-600 font-medium">✓ Ready to send</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
