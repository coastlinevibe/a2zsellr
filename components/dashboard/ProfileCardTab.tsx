'use client'

import { useState, useRef } from 'react'
import { Upload, X, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import Image from 'next/image'

interface ProfileCardTabProps {
  profile: {
    id: string
    display_name: string | null
    business_card_image: string | null
    subscription_tier?: 'free' | 'premium' | 'business'
  } | null
  onRefresh: () => Promise<void>
}

export function ProfileCardTab({ profile, onRefresh }: ProfileCardTabProps) {
  const [preview, setPreview] = useState<string | null>(profile?.business_card_image || null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Tier limits for business card images
  const tierLimits = {
    free: 1,
    premium: 3,
    business: 6
  }
  const userTier = (profile?.subscription_tier || 'free') as keyof typeof tierLimits
  const imageLimit = tierLimits[userTier]

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !profile?.id) return

    setError(null)
    setUploading(true)
    try {
      // Create a preview
      const reader = new FileReader()
      reader.onload = (event) => {
        setPreview(event.target?.result as string)
      }
      reader.readAsDataURL(file)

      // Upload to Supabase Storage using gallery bucket (has proper RLS)
      const fileName = `business-cards/${profile.id}/card-${Date.now()}`
      const { data, error: uploadError } = await supabase.storage
        .from('gallery')
        .upload(fileName, file, { upsert: false })

      if (uploadError) {
        throw uploadError
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('gallery')
        .getPublicUrl(fileName)

      // Update profile with business card image URL via API
      const updateResponse = await fetch('/api/profile/update-business-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId: profile.id,
          businessCardImage: publicUrl
        })
      })

      if (!updateResponse.ok) {
        throw new Error('Failed to update business card image')
      }

      alert('✅ Business card image uploaded successfully!')
      await onRefresh()
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to upload business card image'
      setError(errorMsg)
      alert(`❌ ${errorMsg}`)
      setPreview(profile?.business_card_image || null)
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveImage = async () => {
    if (!profile?.id) return

    try {
      setUploading(true)
      const response = await fetch('/api/profile/update-business-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId: profile.id,
          businessCardImage: null
        })
      })

      if (!response.ok) {
        throw new Error('Failed to remove business card image')
      }

      setPreview(null)
      alert('✅ Business card image removed')
      await onRefresh()
    } catch (error) {
      console.error('Error removing business card:', error)
      alert('❌ Failed to remove business card image')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-[9px] shadow-sm border-2 border-gray-200 overflow-hidden">
        <div className="p-6 border-b-2 border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Profile Card</h2>
              <p className="text-gray-600 mt-1">Upload an image for your business card</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-gray-700">Tier Limit</p>
              <p className="text-2xl font-black text-blue-600">{imageLimit} Image{imageLimit !== 1 ? 's' : ''}</p>
              <p className="text-xs text-gray-500 capitalize">{userTier} Tier</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
              <p className="text-red-700 font-bold text-sm">{error}</p>
            </div>
          )}
          <div className="mb-8">
            {preview ? (
              <div className="relative">
                <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                  <Image
                    src={preview}
                    alt="Business Card Preview"
                    fill
                    className="object-cover"
                  />
                </div>
                <button
                  onClick={handleRemoveImage}
                  disabled={uploading}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)] disabled:opacity-50"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <label className="border-4 border-dashed border-black rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors block">
                <Upload className="h-12 w-12 text-black mx-auto mb-2" />
                <p className="font-black text-black">Click to upload business card image</p>
                <p className="text-xs text-gray-600 mt-1">JPG, PNG or GIF (max 5MB)</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {uploading && (
            <div className="flex items-center justify-center gap-2 text-blue-600 font-bold">
              <Loader2 className="w-5 h-5 animate-spin" />
              Uploading...
            </div>
          )}

          {preview && (
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.9)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,0.9)] transition-all disabled:opacity-50"
            >
              Change Image
            </button>
          )}
        </div>
      </div>

      {/* Business Card Preview */}
      {preview && (
        <div className="bg-white rounded-[9px] shadow-sm border-2 border-gray-200 overflow-hidden">
          <div className="p-6 border-b-2 border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Preview</h2>
          </div>

          <div className="p-6 flex justify-center">
            <div className="relative w-full max-w-md h-64 bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-300">
              <Image
                src={preview}
                alt="Business Card"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
