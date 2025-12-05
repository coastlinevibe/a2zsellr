'use client'

import React, { useState } from 'react'
import { Palette } from 'lucide-react'
import ListingBuilder from './listing-builder'

interface Product {
  id: string
  name: string
  description: string | null
  price_cents: number | null
  image_url: string | null
  category: string | null
}

const ListingEditor = ({ products = [], businessProfile, editListing, onRefresh, onGoToListings, onUpgrade }: { products: Product[], businessProfile: any, editListing?: any, onRefresh?: () => void, onGoToListings?: () => void, onUpgrade?: () => void }) => {
  const [activeTab, setActiveTab] = useState('create')
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['whatsapp'])

  const tabs = [
    { id: 'create', name: 'Create', icon: Palette }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Create Tab Content */}
        {activeTab === 'create' && (
          <div className="space-y-6">
            {/* Listing Builder - Full width */}
            <div className="bg-white rounded-[9px] shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Palette className="w-5 h-5 text-emerald-600" />
                Listing Builder
              </h3>
              <ListingBuilder 
                products={products}
                selectedPlatforms={selectedPlatforms}
                businessProfile={businessProfile}
                editListing={editListing}
                onRefresh={onRefresh}
                userTier={businessProfile?.subscription_tier || 'free'}
                onGoToListings={onGoToListings}
                onUpgrade={onUpgrade}
              />
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default ListingEditor
