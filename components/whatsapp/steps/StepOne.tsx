'use client'

import { useState } from 'react'
import { ShoppingBag, MessageSquare, Clipboard, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

type ContentType = 'product' | 'listing' | 'custom'
type SubscriptionTier = 'free' | 'premium' | 'business'

interface StepOneProps {
  state: any
  setState: (state: any) => void
  tier: SubscriptionTier
}

// Mock data - will be replaced with real API calls
const MOCK_PRODUCTS = [
  { id: '1', name: 'Premium Laptop', price: 'R 15,999', image: '💻' },
  { id: '2', name: 'Wireless Headphones', price: 'R 2,499', image: '🎧' },
  { id: '3', name: 'USB-C Cable', price: 'R 299', image: '🔌' },
  { id: '4', name: 'Phone Case', price: 'R 199', image: '📱' },
  { id: '5', name: 'Screen Protector', price: 'R 99', image: '🛡️' },
  { id: '6', name: 'Power Bank', price: 'R 599', image: '🔋' }
]

const MOCK_LISTINGS = [
  { id: 'l1', name: 'Summer Sale Campaign', description: 'All products 30% off', image: '🏷️' },
  { id: 'l2', name: 'New Arrivals', description: 'Check out our latest products', image: '✨' },
  { id: 'l3', name: 'Flash Deal', description: 'Limited time offer', image: '⚡' }
]

const TIER_LIMITS = {
  premium: { products: 8, listings: 8 },
  business: { products: Infinity, listings: Infinity }
}

export default function StepOne({ state, setState, tier }: StepOneProps) {
  const [showProductList, setShowProductList] = useState(false)
  const [showListingList, setShowListingList] = useState(false)

  const handleContentTypeSelect = (type: ContentType) => {
    setState({
      ...state,
      contentType: type,
      selectedItems: [],
      customMessage: ''
    })
  }

  const handleItemToggle = (itemId: string) => {
    const limits = TIER_LIMITS[tier]
    const currentLimit = state.contentType === 'product' ? limits.products : limits.listings

    if (state.selectedItems.includes(itemId)) {
      setState({
        ...state,
        selectedItems: state.selectedItems.filter((id: string) => id !== itemId)
      })
    } else {
      if (state.selectedItems.length < currentLimit) {
        setState({
          ...state,
          selectedItems: [...state.selectedItems, itemId]
        })
      }
    }
  }

  const handleCustomMessageChange = (message: string) => {
    setState({
      ...state,
      customMessage: message
    })
  }

  const handleRemoveItem = (itemId: string) => {
    setState({
      ...state,
      selectedItems: state.selectedItems.filter((id: string) => id !== itemId)
    })
  }

  const limits = TIER_LIMITS[tier]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Step 1: What do you want to send?</h2>
        <p className="text-gray-600">Choose the content type for your WhatsApp campaign</p>
      </div>

      {/* Content type selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Product option */}
        <button
          onClick={() => handleContentTypeSelect('product')}
          className={`p-6 rounded-lg border-2 transition-all text-left ${
            state.contentType === 'product'
              ? 'border-emerald-600 bg-emerald-50'
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <div className="flex items-center gap-3 mb-3">
            <ShoppingBag className={`w-6 h-6 ${state.contentType === 'product' ? 'text-emerald-600' : 'text-gray-600'}`} />
            <h3 className="font-bold text-gray-900">Product</h3>
          </div>
          <p className="text-sm text-gray-600">Send individual products from your catalog</p>
          <p className="text-xs text-gray-500 mt-2">Max {limits.products === Infinity ? 'unlimited' : limits.products} products</p>
        </button>

        {/* Listing option */}
        <button
          onClick={() => handleContentTypeSelect('listing')}
          className={`p-6 rounded-lg border-2 transition-all text-left ${
            state.contentType === 'listing'
              ? 'border-emerald-600 bg-emerald-50'
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <div className="flex items-center gap-3 mb-3">
            <Clipboard className={`w-6 h-6 ${state.contentType === 'listing' ? 'text-emerald-600' : 'text-gray-600'}`} />
            <h3 className="font-bold text-gray-900">Listing</h3>
          </div>
          <p className="text-sm text-gray-600">Send pre-made marketing campaigns</p>
          <p className="text-xs text-gray-500 mt-2">Max {limits.listings === Infinity ? 'unlimited' : limits.listings} listings</p>
        </button>

        {/* Custom message option */}
        <button
          onClick={() => handleContentTypeSelect('custom')}
          className={`p-6 rounded-lg border-2 transition-all text-left ${
            state.contentType === 'custom'
              ? 'border-emerald-600 bg-emerald-50'
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <div className="flex items-center gap-3 mb-3">
            <MessageSquare className={`w-6 h-6 ${state.contentType === 'custom' ? 'text-emerald-600' : 'text-gray-600'}`} />
            <h3 className="font-bold text-gray-900">Custom Message</h3>
          </div>
          <p className="text-sm text-gray-600">Send your own custom text message</p>
          <p className="text-xs text-gray-500 mt-2">Unlimited characters</p>
        </button>
      </div>

      {/* Content selection area */}
      {state.contentType === 'product' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-900">Select Products</h3>
            <span className="text-sm text-gray-600">
              {state.selectedItems.length} / {limits.products === Infinity ? '∞' : limits.products}
            </span>
          </div>

          {/* Selected items */}
          {state.selectedItems.length > 0 && (
            <div className="mb-6 p-4 bg-emerald-50 rounded-lg border-2 border-emerald-200">
              <p className="text-sm font-semibold text-emerald-900 mb-3">Selected Products:</p>
              <div className="flex flex-wrap gap-2">
                {state.selectedItems.map((itemId: string) => {
                  const product = MOCK_PRODUCTS.find((p) => p.id === itemId)
                  return (
                    <div
                      key={itemId}
                      className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-emerald-300"
                    >
                      <span>{product?.image}</span>
                      <span className="text-sm font-medium text-gray-900">{product?.name}</span>
                      <button
                        onClick={() => handleRemoveItem(itemId)}
                        className="ml-1 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Product list */}
          <button
  