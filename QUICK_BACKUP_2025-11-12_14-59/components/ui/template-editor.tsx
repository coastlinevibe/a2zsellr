'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Save, 
  Share2, 
  Eye, 
  Edit3, 
  Phone, 
  Mail, 
  Globe, 
  MapPin,
  Copy,
  Check,
  ExternalLink
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import TemplateLivePreview from '@/components/ui/template-live-preview'
// Using inline input styles instead of separate components for now
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabaseClient'

interface TemplateEditorProps {
  templateId: string
  onSave?: (templateData: any) => void
  onShare?: (shareUrl: string) => void
}

export default function TemplateEditor({ templateId, onSave, onShare }: TemplateEditorProps) {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setSaving] = useState(false)
  const [shareUrl, setShareUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit')
  
  // Template data state
  const [templateData, setTemplateData] = useState({
    businessName: 'OnePlan Health Insurance',
    businessDescription: 'Insurance innovators for over a decade. Affordable insurance with PREPAID Dentistry Claims in minutes with the OnePlan Claim Card & App.',
    contactPhone: '+27 11 123 4567',
    contactEmail: 'info@oneplan.co.za',
    contactWebsite: 'https://oneplan.co.za',
    businessAddress: 'Cape Town, South Africa',
    heroHeadline: 'Health Insurance and Having a Doctor\'s Visit: Am I Covered?',
    heroSubheadline: 'Professional healthcare coverage for South African families',
    heroLayout: 'split', // 'full-width' or 'split'
    headerStyle: 'gradient', // 'gradient' or 'simple'
    footerStyle: 'detailed', // 'detailed' or 'simple'
    ctaPrimary: 'Get Free Quote',
    ctaSecondary: 'Call Now',
    plans: [
      {
        name: 'Core Plan',
        price: 'FROM R480',
        features: ['Basic medical cover', 'Emergency services', 'GP consultations', 'Basic dentistry'],
        popular: false
      },
      {
        name: 'Silver Plan', 
        price: 'FROM R850',
        features: ['Extended medical cover', 'Specialist consultations', 'Advanced dentistry', 'Optical benefits'],
        popular: true
      },
      {
        name: 'Gold Plan',
        price: 'FROM R1200',
        features: ['Comprehensive cover', 'Private hospital', 'Full dentistry', 'Optical & wellness'],
        popular: false
      },
      {
        name: 'Executive Plan',
        price: 'FROM R1975', 
        features: ['Premium cover', 'International travel', 'Concierge services', 'Full wellness program'],
        popular: false
      }
    ],
    testimonials: [
      {
        name: 'Sarah M.',
        comment: 'OnePlan saved my family thousands on medical bills. The claim process is so simple!',
        rating: 5
      },
      {
        name: 'David K.',
        comment: 'Best health insurance decision we ever made. Highly recommend to all families.',
        rating: 5
      }
    ]
  })

  const handleSave = async () => {
    if (!user) return
    
    setSaving(true)
    try {
      // Create or update user template
      const { data, error } = await supabase
        .from('user_templates')
        .upsert({
          profile_id: user.id,
          template_id: templateId,
          name: `${templateData.businessName} Template`,
          customized_data: templateData,
          last_used_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error

      // Generate shareable URL
      const url = `${window.location.origin}/template/${data.id}`
      setShareUrl(url)
      
      onSave?.(templateData)
      setIsEditing(false)
    } catch (error) {
      console.error('Error saving template:', error)
      alert('Failed to save template')
    } finally {
      setSaving(false)
    }
  }

  const handleShare = async () => {
    if (!shareUrl) {
      await handleSave()
      return
    }
    
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      onShare?.(shareUrl)
    } catch (error) {
      console.error('Failed to copy URL:', error)
    }
  }

  const updateTemplateData = (field: string, value: any) => {
    setTemplateData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const updatePlan = (index: number, field: string, value: any) => {
    setTemplateData(prev => ({
      ...prev,
      plans: prev.plans.map((plan, i) => 
        i === index ? { ...plan, [field]: value } : plan
      )
    }))
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            Template Editor
            {isEditing && (
              <span className="bg-green-100 text-green-800 text-sm px-2 py-1 rounded-full font-normal">
                Edit Mode
              </span>
            )}
          </h1>
          <p className="text-gray-600">
            {isEditing ? 'Click fields to edit them, then save your changes' : 'Customize your health insurance template'}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setViewMode(viewMode === 'edit' ? 'preview' : 'edit')}
            className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-[9px] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)] font-bold hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] transition-all"
          >
            {viewMode === 'edit' ? <Eye className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
            {viewMode === 'edit' ? 'Preview' : 'Edit'}
          </button>
          {viewMode === 'edit' && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2 bg-yellow-100 text-yellow-700 px-4 py-2 rounded-[9px] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)] font-bold hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] hover:bg-yellow-200 transition-all"
            >
              <Edit3 className="w-4 h-4" />
              {isEditing ? 'View Mode' : 'Edit Mode'}
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`flex items-center gap-2 px-4 py-2 rounded-[9px] border-2 border-black font-bold transition-all ${
              isSaving 
                ? 'bg-gray-300 text-gray-600 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)] cursor-not-allowed'
                : 'bg-blue-500 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] hover:bg-blue-600'
            }`}
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Template'}
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-[9px] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)] font-bold hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] hover:bg-green-600 transition-all"
          >
            {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Share'}
          </button>
        </div>
      </div>


      {/* Conditional Content */}
      {viewMode === 'edit' ? (
        // Edit Mode - Show all the editing controls
        <div className="space-y-6">
          {/* Business Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Business Information</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={templateData.businessName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateTemplateData('businessName', e.target.value)}
                    placeholder="Your Business Name"
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900 font-medium">{templateData.businessName}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-1" />
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={templateData.contactPhone}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateTemplateData('contactPhone', e.target.value)}
                    placeholder="+27 11 123 4567"
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{templateData.contactPhone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-1" />
                  Email Address
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={templateData.contactEmail}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateTemplateData('contactEmail', e.target.value)}
                    placeholder="info@yourbusiness.com"
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{templateData.contactEmail}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Globe className="w-4 h-4 inline mr-1" />
                  Website
                </label>
                {isEditing ? (
                  <input
                    type="url"
                    value={templateData.contactWebsite}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateTemplateData('contactWebsite', e.target.value)}
                    placeholder="https://yourbusiness.com"
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900">{templateData.contactWebsite}</p>
                )}
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Business Description</label>
              {isEditing ? (
                <textarea
                  value={templateData.businessDescription}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateTemplateData('businessDescription', e.target.value)}
                  placeholder="Describe your business..."
                  rows={3}
                  className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-700">{templateData.businessDescription}</p>
              )}
            </div>
          </div>

          {/* Layout Options */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Layout Options</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hero Layout</label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="heroLayout"
                      value="full-width"
                      checked={templateData.heroLayout === 'full-width'}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateTemplateData('heroLayout', e.target.value)}
                      className="mr-2"
                    />
                    Full-width Banner
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="heroLayout"
                      value="split"
                      checked={templateData.heroLayout === 'split'}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateTemplateData('heroLayout', e.target.value)}
                      className="mr-2"
                    />
                    50/50 Split
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Header Style</label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="headerStyle"
                      value="gradient"
                      checked={templateData.headerStyle === 'gradient'}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateTemplateData('headerStyle', e.target.value)}
                      className="mr-2"
                    />
                    Gradient Header
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="headerStyle"
                      value="simple"
                      checked={templateData.headerStyle === 'simple'}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateTemplateData('headerStyle', e.target.value)}
                      className="mr-2"
                    />
                    Simple Header
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Footer Style</label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="footerStyle"
                      value="detailed"
                      checked={templateData.footerStyle === 'detailed'}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateTemplateData('footerStyle', e.target.value)}
                      className="mr-2"
                    />
                    Detailed Footer
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="footerStyle"
                      value="simple"
                      checked={templateData.footerStyle === 'simple'}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateTemplateData('footerStyle', e.target.value)}
                      className="mr-2"
                    />
                    Simple Footer
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Preview Mode - Show the live preview
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <TemplateLivePreview templateData={templateData} scale={1} />
          <div className="p-4 bg-gray-50 text-center">
            <button
              onClick={() => window.open(`/template-preview/health-insurance?data=${encodeURIComponent(JSON.stringify(templateData))}`, '_blank')}
              className="bg-blue-500 text-white px-6 py-3 rounded-[9px] border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] font-bold hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)] hover:bg-blue-600 transition-all"
            >
              <ExternalLink className="w-4 h-4 mr-2 inline" />
              Open Full Preview
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
