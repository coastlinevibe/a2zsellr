'use client'

import { useEffect, useState } from 'react'
import { MessageSquare, Package, FileText, Loader2, X, Image as ImageIcon, Bold, Italic, Code, Plus, Trash2, Sparkles, Edit2, Check } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/lib/auth'

interface MessageButton {
  id: string
  text: string
  url?: string
}

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

interface Recipient {
  id: string
  name: string
  phone?: string
}

export default function StepWhat({ state, onUpdate }: StepWhatProps) {
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [listings, setListings] = useState<Listing[]>([])
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [loadingListings, setLoadingListings] = useState(false)
  
  // AI Ad Generator States
  const [showAiAdModal, setShowAiAdModal] = useState(false)
  const [generatingAds, setGeneratingAds] = useState(false)
  const [generatedAds, setGeneratedAds] = useState<Array<{id: string, content: string, selected: boolean}>>([])
  const [editingAdId, setEditingAdId] = useState<string | null>(null)
  const [editingAdContent, setEditingAdContent] = useState('')
  
  // AI Ad Form Data
  const [aiAdForm, setAiAdForm] = useState({
    provider: 'openai',
    productName: '',
    productDescription: '',
    targetAudience: '',
    keyFeatures: '',
    priceInfo: '',
    callToAction: '',
    numberOfAds: 3,
    tone: 'professional',
    adLength: 'medium',
    includeEmojis: true,
    language: 'english',
  })

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
      id: 'ai-ads',
      label: 'AI Generated Ads',
      description: 'Create professional ads with AI',
      icon: Sparkles,
      color: 'indigo',
    },
    {
      id: 'custom',
      label: 'Custom Message',
      description: 'Send a custom text message',
      icon: MessageSquare,
      color: 'green',
    },
  ]

  // Generate AI Ads
  const generateAds = async () => {
    // Check if API key is available based on selected provider
    const provider = aiAdForm.provider
    const apiKey = provider === 'openai' 
      ? sessionStorage.getItem('openai_api_key')
      : sessionStorage.getItem('groq_api_key')
    
    if (!apiKey) {
      const providerName = provider === 'openai' ? 'OpenAI' : 'Groq'
      alert(`⚠️ Please add your ${providerName} API key in Settings first!`)
      setShowAiAdModal(false)
      return
    }

    setGeneratingAds(true)
    try {
      const response = await fetch('/api/openai/generate-ads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey,
          ...aiAdForm
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to generate ads')
      }

      const data = await response.json()
      
      // Convert generated ads to our format
      const generatedAdsArray = data.ads.map((content: string, index: number) => ({
        id: `ad_${Date.now()}_${index}`,
        content: content.trim(),
        selected: false
      }))
      
      setGeneratedAds(generatedAdsArray)
    } catch (error) {
      console.error('Error generating ads:', error)
      alert(`Failed to generate ads: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setGeneratingAds(false)
    }
  }

  // Save edited ad
  const saveEditedAd = (adId: string) => {
    setGeneratedAds(prev => prev.map(ad => 
      ad.id === adId ? { ...ad, content: editingAdContent } : ad
    ))
    setEditingAdId(null)
    setEditingAdContent('')
  }

  // Select ads and proceed
  const selectAdsAndProceed = () => {
    const selectedAds = generatedAds.filter(ad => ad.selected)
    if (selectedAds.length === 0) {
      alert('Please select at least one ad')
      return
    }
    
    // Store selected ads in state
    onUpdate({ 
      contentType: 'ai-ads',
      generatedAds: selectedAds 
    })
    
    setShowAiAdModal(false)
  }

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
            indigo: 'border-indigo-300 bg-indigo-50 hover:bg-indigo-100',
            green: 'border-green-300 bg-green-50 hover:bg-green-100',
          }

          return (
            <button
              key={option.id}
              onClick={() => {
                if (option.id === 'ai-ads') {
                  setShowAiAdModal(true)
                } else {
                  onUpdate({ contentType: option.id })
                  // Reset selections when changing content type
                  onUpdate({
                    selectedProducts: [],
                    selectedListings: [],
                    customMessage: '',
                  })
                }
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
                      <span className="text-sm font-medium text-gray-900">{listing?.title}</span>
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

      {state.contentType === 'ai-ads' && state.generatedAds && state.generatedAds.length > 0 && (
        <div className="space-y-4 p-6 bg-indigo-50 rounded-lg border-2 border-indigo-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">AI Generated Ads</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {state.generatedAds.length} ad{state.generatedAds.length !== 1 ? 's' : ''} ready
              </span>
              <button
                onClick={() => setShowAiAdModal(true)}
                className="px-3 py-1 text-sm bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
              >
                Edit Ads
              </button>
            </div>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {state.generatedAds.map((ad: any, index: number) => (
              <div
                key={ad.id}
                className="p-4 bg-white rounded-lg border-2 border-indigo-300"
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-sm font-bold text-indigo-600">Ad {index + 1}</span>
                  <div className="flex items-center gap-1">
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                    <span className="text-xs text-gray-600">AI Generated</span>
                  </div>
                </div>
                <div className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded border border-gray-200">
                  {ad.content}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {state.contentType === 'custom' && (
        <div className="space-y-4 p-6 bg-green-50 rounded-lg border-2 border-green-200">
          <h3 className="font-bold text-gray-900">Compose Message</h3>
          
          {/* Tab Selection */}
          <div className="flex gap-2 bg-white rounded-lg p-1 border border-green-300">
            <button
              onClick={() => onUpdate({ customMessageTab: 'text' })}
              className={`flex-1 py-2 px-4 rounded font-medium transition-all ${
                (state.customMessageTab || 'text') === 'text'
                  ? 'bg-green-500 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              📝 Text Only
            </button>
            <button
              onClick={() => onUpdate({ customMessageTab: 'image' })}
              className={`flex-1 py-2 px-4 rounded font-medium transition-all ${
                state.customMessageTab === 'image'
                  ? 'bg-green-500 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              📷 Image Only
            </button>
            <button
              onClick={() => onUpdate({ customMessageTab: 'forward' })}
              className={`flex-1 py-2 px-4 rounded font-medium transition-all ${
                state.customMessageTab === 'forward'
                  ? 'bg-green-500 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              ↪️ Forward
            </button>
          </div>

          {/* Text Only Tab */}
          {(state.customMessageTab || 'text') === 'text' && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700">Message Text</label>
                <textarea
                  value={state.customMessage}
                  onChange={(e) => onUpdate({ customMessage: e.target.value })}
                  placeholder="Type your message here... Use {name} for personalization"
                  maxLength={4096}
                  className="w-full px-4 py-3 border-2 border-green-300 rounded-lg focus:border-green-500 focus:outline-none resize-none h-40"
                />
                <div className="flex justify-between text-xs text-gray-600 mt-1">
                  <span>Character count: {state.customMessage.length} / 4096</span>
                  {state.customMessage.length > 0 && (
                    <span className="text-green-600 font-medium">✓ Ready to send</span>
                  )}
                </div>
              </div>

              {/* Personalization Variables */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-blue-900">🎯 Personalization Variables</h4>
                  <div className="flex gap-2">
                    <label className="text-xs bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded cursor-pointer">
                      📁 Upload .txt
                      <input
                        type="file"
                        accept=".txt,text/plain"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (!file) return

                          const reader = new FileReader()
                          reader.onload = (e) => {
                            const content = e.target?.result as string
                            if (content) {
                              // Parse CSV-like format: Name,Phone
                              const lines = content.split('\n').filter(line => line.trim())
                              const parsedRecipients: Recipient[] = []

                              lines.forEach((line, index) => {
                                const parts = line.split(',')
                                if (parts.length >= 1) {
                                  const name = parts[0].trim()
                                  const phone = parts[1]?.trim() || ''

                                  parsedRecipients.push({
                                    id: `recipient_${Date.now()}_${index}`,
                                    name,
                                    phone
                                  })
                                }
                              })

                              if (parsedRecipients.length > 0) {
                                if (confirm(`Found ${parsedRecipients.length} recipients. Replace current list?`)) {
                                  onUpdate({ customRecipients: parsedRecipients })
                                }
                              }
                            }
                          }
                          reader.readAsText(file)
                          e.target.value = ''
                        }}
                        className="hidden"
                      />
                    </label>
                    <button
                      onClick={() => {
                        const newRecipients = state.customRecipients || []
                        const newRecipient: Recipient = {
                          id: `recipient_${Date.now()}`,
                          name: '',
                          phone: ''
                        }
                        onUpdate({ customRecipients: [...newRecipients, newRecipient] })
                      }}
                      className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded"
                    >
                      + Add Recipient
                    </button>
                  </div>
                </div>

                {/* Available Variables */}
                <div className="mb-3">
                  <p className="text-xs text-blue-800 mb-2">Available variables in your message:</p>
                  <div className="flex flex-wrap gap-1 mb-2">
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-mono">{`{name}`}</span>
                  </div>
                  <p className="text-xs text-blue-700">
                    💡 <strong>Example:</strong> {`"Hi {name}, check out our new product!" → "Hi Nadine, check out our new product!"`}
                  </p>
                </div>

                {/* Recipients List */}
                {state.customRecipients && state.customRecipients.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-blue-900">Recipients:</p>
                    {state.customRecipients.map((recipient: Recipient, index: number) => (
                      <div key={recipient.id} className="flex gap-2 items-center bg-white p-2 rounded border border-blue-200">
                        <input
                          type="text"
                          value={recipient.name}
                          onChange={(e) => {
                            const newRecipients = [...state.customRecipients]
                            newRecipients[index] = { ...recipient, name: e.target.value }
                            onUpdate({ customRecipients: newRecipients })
                          }}
                          placeholder="Recipient name"
                          className="flex-1 text-xs px-2 py-1 border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                        />
                        <input
                          type="tel"
                          value={recipient.phone || ''}
                          onChange={(e) => {
                            const newRecipients = [...state.customRecipients]
                            newRecipients[index] = { ...recipient, phone: e.target.value }
                            onUpdate({ customRecipients: newRecipients })
                          }}
                          placeholder="Phone number"
                          className="flex-1 text-xs px-2 py-1 border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                        />
                        <button
                          onClick={() => {
                            const newRecipients = state.customRecipients.filter((_, i) => i !== index)
                            onUpdate({ customRecipients: newRecipients })
                          }}
                          className="text-red-500 hover:text-red-700 text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* File Format Help */}
                <div className="text-xs text-blue-700 bg-blue-50 p-2 rounded">
                  📄 <strong>File format:</strong> Each line should be "Name,Phone" (e.g., "John Smith,+1234567890")
                </div>

                {/* Preview */}
                {state.customMessage && state.customRecipients && state.customRecipients.length > 0 && (
                  <div className="mt-3 p-3 bg-white rounded border border-blue-200">
                    <p className="text-xs font-medium text-blue-900 mb-2">Preview with personalization:</p>
                    <div className="text-xs text-gray-700 bg-gray-50 p-2 rounded">
                      {state.customMessage.replace(/\{name\}/g, state.customRecipients[0]?.name || '[Name]')}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Image Only Tab */}
          {state.customMessageTab === 'image' && (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Upload Image</label>
              <div className="flex items-center gap-3">
                <label className="flex-1 flex items-center justify-center px-4 py-6 border-2 border-dashed border-green-300 rounded-lg hover:border-green-500 hover:bg-green-100 cursor-pointer transition-all">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-700">
                      {state.customImage ? 'Change Image' : 'Upload Image'}
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        const reader = new FileReader()
                        reader.onload = (event) => {
                          const img = new Image()
                          img.onload = () => {
                            const canvas = document.createElement('canvas')
                            let width = img.width
                            let height = img.height
                            
                            if (width > 1200 || height > 1200) {
                              const ratio = Math.min(1200 / width, 1200 / height)
                              width = Math.round(width * ratio)
                              height = Math.round(height * ratio)
                            }
                            
                            canvas.width = width
                            canvas.height = height
                            const ctx = canvas.getContext('2d')
                            ctx?.drawImage(img, 0, 0, width, height)
                            
                            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7)
                            onUpdate({ customImage: compressedBase64 })
                          }
                          img.src = event.target?.result as string
                        }
                        reader.readAsDataURL(file)
                      }
                    }}
                    className="hidden"
                  />
                </label>
                {state.customImage && (
                  <button
                    onClick={() => onUpdate({ customImage: null })}
                    className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                  >
                    Remove
                  </button>
                )}
              </div>
              {state.customImage && (
                <div className="p-3 bg-white rounded-lg border border-green-300">
                  <img src={state.customImage} alt="Preview" className="w-full max-h-48 object-cover rounded" />
                  <p className="text-xs text-green-600 font-medium mt-2">✓ Image ready to send</p>
                </div>
              )}
            </div>
          )}

          {/* Forward Tab */}
          {state.customMessageTab === 'forward' && (
            <div className="p-4 bg-white rounded-lg border-2 border-green-300 text-center">
              <p className="text-gray-600">Forward message feature coming soon...</p>
            </div>
          )}
        </div>
      )}

      {/* AI Ad Generator Modal */}
      {showAiAdModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full my-8">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-100 p-2 rounded-lg">
                    <Sparkles className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">AI Ad Generator</h2>
                    <p className="text-sm text-gray-600">Create professional ads with AI assistance</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowAiAdModal(false)
                    setGeneratedAds([])
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {generatedAds.length === 0 ? (
                // Ad Creation Form
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* AI Provider Selection */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        AI Provider *
                      </label>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setAiAdForm({...aiAdForm, provider: 'openai'})}
                          className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                            aiAdForm.provider === 'openai'
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-gray-300 bg-white hover:border-purple-300'
                          }`}
                        >
                          <div className="text-center">
                            <div className="text-2xl mb-1">🤖</div>
                            <div className="font-semibold text-gray-900">OpenAI</div>
                            <div className="text-xs text-gray-600">GPT-4o-mini</div>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setAiAdForm({...aiAdForm, provider: 'groq'})}
                          className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                            aiAdForm.provider === 'groq'
                              ? 'border-orange-500 bg-orange-50'
                              : 'border-gray-300 bg-white hover:border-orange-300'
                          }`}
                        >
                          <div className="text-center">
                            <div className="text-2xl mb-1">⚡</div>
                            <div className="font-semibold text-gray-900">Groq</div>
                            <div className="text-xs text-gray-600">Lightning Fast</div>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Product Name */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Product/Service Name *
                      </label>
                      <input
                        type="text"
                        value={aiAdForm.productName}
                        onChange={(e) => setAiAdForm({...aiAdForm, productName: e.target.value})}
                        placeholder="e.g., Premium Wireless Headphones"
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                      />
                    </div>

                    {/* Product Description */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Product Description *
                      </label>
                      <textarea
                        value={aiAdForm.productDescription}
                        onChange={(e) => setAiAdForm({...aiAdForm, productDescription: e.target.value})}
                        placeholder="Describe what you're selling, its benefits, and what makes it special..."
                        rows={4}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none resize-none"
                      />
                    </div>

                    {/* Target Audience */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Target Audience
                      </label>
                      <input
                        type="text"
                        value={aiAdForm.targetAudience}
                        onChange={(e) => setAiAdForm({...aiAdForm, targetAudience: e.target.value})}
                        placeholder="e.g., Young professionals, Music lovers"
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                      />
                    </div>

                    {/* Price Info */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Price Information
                      </label>
                      <input
                        type="text"
                        value={aiAdForm.priceInfo}
                        onChange={(e) => setAiAdForm({...aiAdForm, priceInfo: e.target.value})}
                        placeholder="e.g., R1,299 or Special offer: 20% off"
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                      />
                    </div>

                    {/* Key Features */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Key Features (one per line)
                      </label>
                      <textarea
                        value={aiAdForm.keyFeatures}
                        onChange={(e) => setAiAdForm({...aiAdForm, keyFeatures: e.target.value})}
                        placeholder="- Noise cancellation&#10;- 30-hour battery life&#10;- Premium sound quality"
                        rows={3}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none resize-none"
                      />
                    </div>

                    {/* Call to Action */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Call to Action
                      </label>
                      <input
                        type="text"
                        value={aiAdForm.callToAction}
                        onChange={(e) => setAiAdForm({...aiAdForm, callToAction: e.target.value})}
                        placeholder="e.g., Order now!, Limited stock available!"
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                      />
                    </div>

                    {/* Number of Ads */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Number of Ads
                      </label>
                      <select
                        value={aiAdForm.numberOfAds}
                        onChange={(e) => setAiAdForm({...aiAdForm, numberOfAds: parseInt(e.target.value)})}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                      >
                        <option value={1}>1 Ad</option>
                        <option value={2}>2 Ads</option>
                        <option value={3}>3 Ads</option>
                        <option value={5}>5 Ads</option>
                        <option value={10}>10 Ads</option>
                      </select>
                    </div>

                    {/* Tone */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Tone
                      </label>
                      <select
                        value={aiAdForm.tone}
                        onChange={(e) => setAiAdForm({...aiAdForm, tone: e.target.value})}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                      >
                        <option value="professional">Professional</option>
                        <option value="casual">Casual & Friendly</option>
                        <option value="enthusiastic">Enthusiastic</option>
                        <option value="luxury">Luxury & Premium</option>
                        <option value="urgent">Urgent & Action-Driven</option>
                        <option value="informative">Informative</option>
                      </select>
                    </div>

                    {/* Ad Length */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Ad Length
                      </label>
                      <select
                        value={aiAdForm.adLength}
                        onChange={(e) => setAiAdForm({...aiAdForm, adLength: e.target.value})}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                      >
                        <option value="short">Short (50-100 words)</option>
                        <option value="medium">Medium (100-200 words)</option>
                        <option value="long">Long (200-300 words)</option>
                      </select>
                    </div>

                    {/* Language */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Language
                      </label>
                      <select
                        value={aiAdForm.language}
                        onChange={(e) => setAiAdForm({...aiAdForm, language: e.target.value})}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                      >
                        <option value="english">English</option>
                        <option value="afrikaans">Afrikaans</option>
                        <option value="zulu">Zulu</option>
                        <option value="xhosa">Xhosa</option>
                      </select>
                    </div>

                    {/* Include Emojis */}
                    <div className="md:col-span-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={aiAdForm.includeEmojis}
                          onChange={(e) => setAiAdForm({...aiAdForm, includeEmojis: e.target.checked})}
                          className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <span className="text-sm font-semibold text-gray-900">
                          Include emojis in ads 😊
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Generate Button */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => setShowAiAdModal(false)}
                      className="px-6 py-2 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={generateAds}
                      disabled={generatingAds || !aiAdForm.productName || !aiAdForm.productDescription}
                      className="px-6 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-all flex items-center gap-2"
                    >
                      {generatingAds ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Generate Ads
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                // Generated Ads Display & Edit
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Generated Ads</h3>
                      <p className="text-sm text-gray-600">
                        Select ads to use and edit if needed
                      </p>
                    </div>
                    <button
                      onClick={() => setGeneratedAds([])}
                      className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Start Over
                    </button>
                  </div>

                  {/* Ads List */}
                  <div className="space-y-3">
                    {generatedAds.map((ad, index) => (
                      <div
                        key={ad.id}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          ad.selected
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 bg-white'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Checkbox */}
                          <input
                            type="checkbox"
                            checked={ad.selected}
                            onChange={(e) => {
                              setGeneratedAds(prev => prev.map(a => 
                                a.id === ad.id ? { ...a, selected: e.target.checked } : a
                              ))
                            }}
                            className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 mt-1"
                          />

                          {/* Ad Content */}
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-bold text-gray-900">Ad {index + 1}</span>
                              <button
                                onClick={() => {
                                  if (editingAdId === ad.id) {
                                    saveEditedAd(ad.id)
                                  } else {
                                    setEditingAdId(ad.id)
                                    setEditingAdContent(ad.content)
                                  }
                                }}
                                className="p-1 hover:bg-indigo-100 rounded transition-colors"
                              >
                                {editingAdId === ad.id ? (
                                  <Check className="w-4 h-4 text-green-600" />
                                ) : (
                                  <Edit2 className="w-4 h-4 text-indigo-600" />
                                )}
                              </button>
                            </div>

                            {editingAdId === ad.id ? (
                              <textarea
                                value={editingAdContent}
                                onChange={(e) => setEditingAdContent(e.target.value)}
                                rows={8}
                                className="w-full px-3 py-2 border-2 border-indigo-300 rounded-lg focus:border-indigo-500 focus:outline-none resize-none text-sm"
                              />
                            ) : (
                              <div className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded border border-gray-200">
                                {ad.content}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      {generatedAds.filter(ad => ad.selected).length} of {generatedAds.length} ads selected
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowAiAdModal(false)}
                        className="px-6 py-2 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={selectAdsAndProceed}
                        disabled={generatedAds.filter(ad => ad.selected).length === 0}
                        className="px-6 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-all flex items-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        Use Selected Ads
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
