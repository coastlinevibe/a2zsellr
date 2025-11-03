'use client'

import React, { useState } from 'react'
import { 
  MessageCircle, 
  Eye,
  Calendar,
  Send,
  Save,
  Settings,
  Image,
  Link,
  Type,
  Palette,
  Layout,
  Grid,
  Layers,
  Play
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Product {
  id: string
  name: string
  description: string | null
  price_cents: number | null
  image_url: string | null
  category: string | null
}

interface WYSIWYGCampaignBuilderProps {
  products: Product[]
  selectedPlatforms: string[]
  businessProfile: any
}

const WYSIWYGCampaignBuilder = ({ products, selectedPlatforms, businessProfile }: WYSIWYGCampaignBuilderProps) => {
  const [campaignTitle, setCampaignTitle] = useState('Mid-Month Growth Blast')
  const [selectedLayout, setSelectedLayout] = useState('gallery-mosaic')
  const [messageTemplate, setMessageTemplate] = useState('Hey there! We just launched new services tailored for you. Tap to explore what\'s hot this week.')
  const [ctaLabel, setCtaLabel] = useState('View Offers')
  const [ctaUrl, setCtaUrl] = useState('https://a2z-sellr.com/deals')
  const [scheduleDate, setScheduleDate] = useState('')

  const layouts = [
    { id: 'gallery-mosaic', name: 'Gallery Mosaic', description: 'Grid layout with multiple images' },
    { id: 'hover-cards', name: 'Hover Cards', description: 'Interactive card layout' },
    { id: 'vertical-slider', name: 'Vertical Slider', description: 'Vertical scrolling layout' },
    { id: 'horizontal-slider', name: 'Horizontal Slider', description: 'Horizontal scrolling layout' },
    { id: 'before-after', name: 'Before & After', description: 'Comparison layout' },
    { id: 'video-spotlight', name: 'Video Spotlight', description: 'Video-focused layout' }
  ]

  const generatePreviewMessage = () => {
    const businessName = businessProfile?.display_name || 'A2Z'
    return {
      sender: businessName,
      title: campaignTitle,
      type: 'Broadcast • ' + layouts.find(l => l.id === selectedLayout)?.name.toLowerCase(),
      message: messageTemplate,
      layout: selectedLayout,
      cta: ctaLabel,
      url: ctaUrl
    }
  }

  const previewData = generatePreviewMessage()

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Panel - Campaign Builder */}
      <div className="bg-blue-600 rounded-[9px] p-6 text-white">
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2">Ultra-Premium WhatsApp Builder</h2>
          <p className="text-blue-100 text-sm">Curate layout, copy, CTAs, and scheduling in one canvas.</p>
        </div>

        <div className="space-y-6">
          {/* Campaign Title */}
          <div>
            <label className="block text-sm font-medium text-blue-100 mb-2">Campaign title</label>
            <input
              type="text"
              value={campaignTitle}
              onChange={(e) => setCampaignTitle(e.target.value)}
              className="w-full p-3 bg-blue-500 border border-blue-400 rounded-[9px] text-white placeholder-blue-200 focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
              placeholder="Enter campaign title"
            />
          </div>

          {/* Layout Selection */}
          <div>
            <label className="block text-sm font-medium text-blue-100 mb-2">Layout</label>
            <select
              value={selectedLayout}
              onChange={(e) => setSelectedLayout(e.target.value)}
              className="w-full p-3 bg-blue-500 border border-blue-400 rounded-[9px] text-white focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
            >
              {layouts.map((layout) => (
                <option key={layout.id} value={layout.id} className="bg-blue-600">
                  {layout.name}
                </option>
              ))}
            </select>
          </div>

          {/* Message Template */}
          <div>
            <label className="block text-sm font-medium text-blue-100 mb-2">Message template</label>
            <textarea
              value={messageTemplate}
              onChange={(e) => setMessageTemplate(e.target.value)}
              rows={4}
              className="w-full p-3 bg-blue-500 border border-blue-400 rounded-[9px] text-white placeholder-blue-200 focus:ring-2 focus:ring-blue-300 focus:border-blue-300 resize-none"
              placeholder="Enter your message template"
            />
          </div>

          {/* CTA Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-blue-100 mb-2">CTA label</label>
              <input
                type="text"
                value={ctaLabel}
                onChange={(e) => setCtaLabel(e.target.value)}
                className="w-full p-3 bg-blue-500 border border-blue-400 rounded-[9px] text-white placeholder-blue-200 focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
                placeholder="Button text"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-100 mb-2">CTA destination URL</label>
              <input
                type="url"
                value={ctaUrl}
                onChange={(e) => setCtaUrl(e.target.value)}
                className="w-full p-3 bg-blue-500 border border-blue-400 rounded-[9px] text-white placeholder-blue-200 focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
                placeholder="https://example.com"
              />
            </div>
          </div>

          {/* Schedule */}
          <div>
            <label className="block text-sm font-medium text-blue-100 mb-2">Schedule (optional)</label>
            <input
              type="datetime-local"
              value={scheduleDate}
              onChange={(e) => setScheduleDate(e.target.value)}
              className="w-full p-3 bg-blue-500 border border-blue-400 rounded-[9px] text-white focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-4">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-[9px] flex-1">
              <Save className="w-4 h-4 mr-2" />
              Save Campaign Draft
            </Button>
            <Button variant="outline" className="border-blue-300 text-blue-100 hover:bg-blue-500 rounded-[9px]">
              <Eye className="w-4 h-4 mr-2" />
              Preview in WhatsApp
            </Button>
          </div>

          <p className="text-xs text-blue-200 text-center">
            Draft autosaves every few minutes.
          </p>
        </div>
      </div>

      {/* Right Panel - Live Preview */}
      <div className="bg-blue-600 rounded-[9px] p-6 text-white">
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2">Live Preview</h2>
          <p className="text-blue-100 text-sm">See how your message renders inside the WhatsApp composer.</p>
        </div>

        {/* WhatsApp Preview */}
        <div className="bg-white rounded-[9px] p-4 text-gray-900">
          <div className="bg-green-50 border border-green-200 rounded-[9px] p-4 mb-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-emerald-600 rounded-[9px] flex items-center justify-center text-white text-sm font-bold">
                {previewData.sender.charAt(0)}
              </div>
              <div>
                <div className="font-semibold text-gray-900">{previewData.sender}</div>
                <div className="text-xs text-gray-500">{previewData.type}</div>
              </div>
            </div>
            
            <div className="mb-4">
              <h3 className="font-bold text-gray-900 mb-2">{previewData.title}</h3>
              <p className="text-gray-700 text-sm leading-relaxed">{previewData.message}</p>
            </div>

            {/* Layout Preview */}
            <div className="bg-gray-100 rounded-[9px] p-4 mb-4">
              <div className="text-xs text-gray-500 mb-2">Layout preview ({previewData.layout.replace('-', ' ')})</div>
              <div className="grid grid-cols-2 gap-2">
                {products.slice(0, 4).map((product, index) => (
                  <div key={product.id} className="bg-white rounded-[9px] p-2">
                    {product.image_url ? (
                      <img 
                        src={product.image_url} 
                        alt={product.name}
                        className="w-full h-16 object-cover rounded-[9px] mb-2"
                      />
                    ) : (
                      <div className="w-full h-16 bg-gray-200 rounded-[9px] mb-2 flex items-center justify-center">
                        <Image className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                    <div className="text-xs font-medium text-gray-900 truncate">{product.name}</div>
                    <div className="text-xs text-gray-500">
                      {product.price_cents 
                        ? `R${(product.price_cents / 100).toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`
                        : 'Price on request'
                      }
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Button */}
            <div className="flex items-center justify-center">
              <div className="bg-emerald-600 text-white px-6 py-2 rounded-[9px] font-medium text-sm">
                {previewData.cta}
              </div>
            </div>
            
            <div className="text-xs text-blue-600 text-center mt-2 truncate">
              {previewData.url}
            </div>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-[9px] text-xs">
              <Calendar className="w-3 h-3" />
              Send instantly or add a schedule above
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WYSIWYGCampaignBuilder
