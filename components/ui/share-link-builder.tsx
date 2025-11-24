'use client'

import React, { useState } from 'react'
import { 
  MessageCircle, 
  Facebook, 
  Instagram, 
  Twitter, 
  Linkedin,
  Palette
} from 'lucide-react'
import WYSIWYGCampaignBuilder from './wysiwyg-campaign-builder'

interface Product {
  id: string
  name: string
  description: string | null
  price_cents: number | null
  image_url: string | null
  category: string | null
}

const ShareLinkBuilder = ({ products = [], businessProfile, editListing, onRefresh, onGoToListings }: { products: Product[], businessProfile: any, editListing?: any, onRefresh?: () => void, onGoToListings?: () => void }) => {
  const [activeTab, setActiveTab] = useState('create')
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['whatsapp'])

  const platforms = [
    { id: 'whatsapp', name: 'WhatsApp', icon: MessageCircle, color: 'text-green-600', bg: 'bg-green-50' },
    { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'text-pink-600', bg: 'bg-pink-50' },
    { id: 'twitter', name: 'Twitter', icon: Twitter, color: 'text-sky-600', bg: 'bg-sky-50' },
    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'text-blue-700', bg: 'bg-blue-50' }
  ]

  const tabs = [
    { id: 'create', name: 'Create', icon: Palette }
  ]

  const handlePlatformToggle = (platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId) 
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Create Tab Content */}
        {activeTab === 'create' && (
          <div className="space-y-6">
            {/* WYSIWYG Listing Builder - Full width */}
            <div className="bg-white rounded-[9px] shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Palette className="w-5 h-5 text-emerald-600" />
                Listing Builder
              </h3>
              <WYSIWYGCampaignBuilder 
                products={products}
                selectedPlatforms={selectedPlatforms}
                businessProfile={businessProfile}
                editListing={editListing}
                onRefresh={onRefresh}
                userTier={businessProfile?.subscription_tier || 'free'}
                onGoToListings={onGoToListings}
              />
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default ShareLinkBuilder
