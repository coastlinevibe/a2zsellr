'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Upload, User, Mail, FileText, Crown, CheckCircle2, AlertTriangle, Building2, Tag, MapPin, Phone, Globe, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

interface UserProfile {
  id: string
  display_name: string | null
  subscription_tier: 'free' | 'premium' | 'business'
  bio: string | null
  avatar_url: string | null
  phone_number: string | null
  website_url: string | null
  business_category: string | null
  business_location: string | null
  business_hours: any
  verified_seller: boolean
  early_adopter: boolean
}

const tabs = [
  { id: 'general', label: 'General Info', icon: User },
  { id: 'business', label: 'Business', icon: Building2 },
]

export default function ProfilePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [activeTab, setActiveTab] = useState('general')
  
  // Availability checking states
  const [checkingDisplayName, setCheckingDisplayName] = useState(false)
  const [displayNameAvailable, setDisplayNameAvailable] = useState<boolean | null>(null)
  const [displayNameError, setDisplayNameError] = useState('')
  const [originalDisplayName, setOriginalDisplayName] = useState('')

  // Form fields
  const [displayName, setDisplayName] = useState('')
  const [profileType, setProfileType] = useState<'free' | 'premium' | 'business'>('free')
  const [bio, setBio] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [businessCategory, setBusinessCategory] = useState('')
  const [businessLocation, setBusinessLocation] = useState('')
  const [businessHours, setBusinessHours] = useState('')

  useEffect(() => {
    if (!user) {
      router.push('/auth/login-animated')
      return
    }
    fetchProfile()
  }, [user])

  const fetchProfile = async () => {
    if (!user?.id) return

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error

      const profileData = (data || {}) as UserProfile

      setProfile(profileData)
      const currentDisplayName = profileData.display_name || ''
      setDisplayName(currentDisplayName)
      setOriginalDisplayName(currentDisplayName) // Store original for comparison
      setProfileType(profileData.subscription_tier || 'free')
      setBio(profileData.bio || '')
      setAvatarUrl(profileData.avatar_url || '')
      setPhoneNumber(profileData.phone_number || '')
      setWebsiteUrl(profileData.website_url || '')
      setBusinessCategory(profileData.business_category || '')
      setBusinessLocation(profileData.business_location || '')
      setBusinessHours(profileData.business_hours || '')
      
      // Reset availability checking when loading profile
      setDisplayNameAvailable(null)
      setDisplayNameError('')
    } catch (error) {
      console.error('Error fetching profile:', error)
      setMessage({ type: 'error', text: 'Failed to load profile' })
    } finally {
      setLoading(false)
    }
  }

  // Display name availability checking
  useEffect(() => {
    // Don't check if display name is empty or same as original
    if (!displayName.trim() || displayName === originalDisplayName) {
      setDisplayNameAvailable(null)
      setDisplayNameError('')
      return
    }

    if (displayName.length < 3) {
      setDisplayNameAvailable(false)
      setDisplayNameError('Display name must be at least 3 characters')
      return
    }

    if (displayName.length > 30) {
      setDisplayNameAvailable(false)
      setDisplayNameError('Display name must be less than 30 characters')
      return
    }

    // Check for valid characters (letters, numbers, spaces, hyphens, underscores)
    if (!/^[a-zA-Z0-9\s\-_]+$/.test(displayName)) {
      setDisplayNameAvailable(false)
      setDisplayNameError('Only letters, numbers, spaces, hyphens, and underscores allowed')
      return
    }

    const timeoutId = setTimeout(() => {
      checkDisplayNameAvailability(displayName.trim())
    }, 500) // 500ms debounce

    return () => clearTimeout(timeoutId)
  }, [displayName, originalDisplayName])

  const handleDisplayNameChange = (value: string) => {
    setDisplayNameError('')
    setDisplayNameAvailable(null)
  }

  const checkDisplayNameAvailability = async (name: string) => {
    setCheckingDisplayName(true)
    setDisplayNameError('')

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('display_name', name)
        .maybeSingle()

      if (error) {
        console.error('Error checking display name:', error)
        setDisplayNameError('Error checking availability')
        setDisplayNameAvailable(null)
        return
      }

      if (data) {
        setDisplayNameAvailable(false)
        setDisplayNameError('This display name is already taken')
      } else {
        setDisplayNameAvailable(true)
        setDisplayNameError('')
      }
    } catch (error) {
      console.error('Error checking display name availability:', error)
      setDisplayNameError('Error checking availability')
      setDisplayNameAvailable(null)
    } finally {
      setCheckingDisplayName(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const preview = URL.createObjectURL(file)
      setPreviewUrl(preview)
    }
  }

  const handleSave = async () => {
    if (!user) return

    setSaving(true)
    setMessage(null)

    // Validate display name if it has changed
    if (displayName !== originalDisplayName) {
      if (!displayName.trim()) {
        setMessage({ type: 'error', text: 'Display name is required' })
        setSaving(false)
        return
      }

      if (displayNameAvailable !== true) {
        setMessage({ type: 'error', text: 'Please choose an available display name' })
        setSaving(false)
        return
      }
    }

    try {
      const updates = {
        display_name: displayName.trim() || undefined,
        subscription_tier: profileType,
        bio: bio.trim() || undefined,
        avatar_url: avatarUrl.trim() || undefined,
        phone_number: phoneNumber.trim() || undefined,
        website_url: websiteUrl.trim() || undefined,
        business_category: profileType === 'business' ? (businessCategory.trim() || undefined) : undefined,
        business_location: profileType === 'business' ? (businessLocation.trim() || undefined) : undefined,
        business_hours: profileType === 'business' ? (businessHours.trim() || undefined) : undefined,
      }

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)

      if (error) {
        if (error.code === '23505') {
          throw new Error('Display name already taken. Please choose another one.')
        }
        throw error
      }

      setMessage({ type: 'success', text: 'Profile updated successfully!' })
      fetchProfile()
    } catch (error: any) {
      console.error('Error updating profile:', error)
      setMessage({ 
        type: 'error', 
        text: error.message || 'Failed to update profile' 
      })
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = async () => {
    if (!selectedFile || !user) return

    if (!selectedFile.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please upload an image file' })
      return
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image must be less than 5MB' })
      return
    }

    setUploading(true)
    setMessage(null)

    try {
      const fileExt = selectedFile.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('posts')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('posts')
        .getPublicUrl(filePath)

      if (previewUrl) URL.revokeObjectURL(previewUrl)

      setAvatarUrl(data.publicUrl)
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: data.publicUrl })
        .eq('id', user.id)

      if (updateError) throw updateError

      setSelectedFile(null)
      setPreviewUrl(null)
      setMessage({ type: 'success', text: 'Avatar updated successfully!' })
      
      fetchProfile()
    } catch (error: any) {
      console.error('Error uploading image:', error)
      setMessage({ 
        type: 'error', 
        text: error.message || 'Failed to upload image' 
      })
    } finally {
      setUploading(false)
    }
  }

  const getTierBadge = () => {
    const badges = {
      free: { text: 'Free', className: 'bg-gray-100 text-gray-700' },
      premium: { text: 'Premium', className: 'bg-emerald-100 text-emerald-700' },
      business: { text: 'Business', className: 'bg-blue-100 text-blue-700' }
    }
    return badges[profile?.subscription_tier || 'free']
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            {/* Business Profile Header */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg font-semibold text-emerald-900">Business Profile</h3>
              </div>
              <p className="text-sm text-emerald-700 mt-1">
                Create and manage your business profile for the A2Z directory
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Display Name */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4" />
                    Display Name - Check Availability
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => {
                        setDisplayName(e.target.value)
                        handleDisplayNameChange(e.target.value)
                      }}
                      className={`w-full px-4 py-2 pr-24 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none ${
                        displayNameAvailable === true ? 'border-green-500' :
                        displayNameAvailable === false ? 'border-red-500' :
                        'border-gray-300'
                      }`}
                    />
                    
                    {/* Availability Status */}
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                      {checkingDisplayName && (
                        <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                      )}
                      {displayNameAvailable === true && (
                        <div className="flex items-center gap-1 text-green-600 text-xs">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Available</span>
                        </div>
                      )}
                      {displayNameAvailable === false && (
                        <div className="flex items-center gap-1 text-red-600 text-xs">
                          <AlertTriangle className="w-4 h-4" />
                          <span>Taken</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Error Message */}
                  {displayNameError && (
                    <div className="mt-1 text-red-600 text-xs">
                      {displayNameError}
                    </div>
                  )}
                  
                  {/* Success Message */}
                  {displayNameAvailable === true && displayName.length > 0 && displayName !== originalDisplayName && (
                    <div className="mt-1 text-green-600 text-xs">
                      "{displayName}" is available!
                    </div>
                  )}
                  
                  {/* Info Message */}
                  {displayName === originalDisplayName && (
                    <p className="text-xs text-gray-500 mt-1">
                      This is your current display name
                    </p>
                  )}
                </div>

                {/* Bio */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <FileText className="w-4 h-4" />
                    Bio
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about yourself..."
                    rows={4}
                    maxLength={500}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {bio.length}/500 characters
                  </p>
                </div>

                {/* Contact Info */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Phone className="w-4 h-4" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+27 XX XXX XXXX"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Globe className="w-4 h-4" />
                    Website URL
                  </label>
                  <input
                    type="url"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://www.yourwebsite.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Avatar Upload */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Upload className="w-4 h-4" />
                    Profile Picture
                  </label>
                  
                  {(previewUrl || avatarUrl) && (
                    <div className="mb-3 flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <img 
                        src={previewUrl || avatarUrl} 
                        alt="Avatar preview" 
                        className="w-16 h-16 rounded-full object-cover border-2 border-emerald-500"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {previewUrl ? 'Ready to Upload' : 'Current Avatar'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {previewUrl 
                            ? 'Click "Upload" to save to your profile' 
                            : 'Your current profile picture'
                          }
                        </p>
                      </div>
                      {previewUrl && (
                        <button 
                          onClick={handleImageUpload}
                          disabled={uploading}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors disabled:opacity-50"
                        >
                          {uploading ? 'Uploading...' : 'Upload'}
                        </button>
                      )}
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="https://example.com/avatar.jpg"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    />
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileSelect}
                        disabled={uploading}
                      />
                      <div className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                        uploading 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : 'bg-emerald-600 hover:bg-emerald-700 cursor-pointer'
                      } text-white`}>
                        <Upload className="w-4 h-4" />
                        Select
                      </div>
                    </label>
                  </div>
                </div>

                {/* Email (Read-only) */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Email cannot be changed
                  </p>
                </div>
              </div>
            </div>
          </div>
        )

      case 'business':
        return (
          <div className="space-y-6">
            {/* Business Information */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-blue-900">Business Information</h3>
              </div>
              <p className="text-sm text-blue-700 mt-1">
                Add your business details to help customers find and contact you
              </p>
            </div>
            
            {/* Business Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Tag className="w-4 h-4" />
                    Business Category
                  </label>
                  <select
                    value={businessCategory}
                    onChange={(e) => setBusinessCategory(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  >
                    <option value="">Select a category</option>
                    <option value="retail">Retail & Shopping</option>
                    <option value="food">Food & Restaurants</option>
                    <option value="health">Health & Beauty</option>
                    <option value="services">Professional Services</option>
                    <option value="technology">Technology</option>
                    <option value="education">Education</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4" />
                    Business Location
                  </label>
                  <select
                    value={businessLocation}
                    onChange={(e) => setBusinessLocation(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  >
                    <option value="">Select a location</option>
                    <option value="cape-town">Cape Town</option>
                    <option value="johannesburg">Johannesburg</option>
                    <option value="durban">Durban</option>
                    <option value="pretoria">Pretoria</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Clock className="w-4 h-4" />
                    Business Hours
                  </label>
                  <textarea
                    value={businessHours}
                    onChange={(e) => setBusinessHours(e.target.value)}
                    placeholder="Mon-Fri: 9:00 AM - 5:00 PM&#10;Sat: 9:00 AM - 2:00 PM&#10;Sun: Closed"
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none"
                  />
                </div>
              </div>
            </div>
        )
        

      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading profile...</div>
      </div>
    )
  }

  const tierBadge = getTierBadge()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link 
            href="/dashboard"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-4">
            <div className="flex items-center gap-3">
              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt="Profile" 
                  className="w-16 h-16 rounded-full object-cover border-2 border-white"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-xl font-bold text-emerald-600">
                  {displayName ? displayName[0].toUpperCase() : user?.email?.[0].toUpperCase() || 'U'}
                </div>
              )}
              <div className="flex-1">
                <h1 className="text-xl font-bold text-white">
                  {displayName || user?.email?.split('@')[0] || 'User'}
                </h1>
                <p className="text-emerald-100 text-sm">
                  {user?.email}
                </p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <Badge className={`${tierBadge.className} border-0 text-xs py-0.5`}>
                    {tierBadge.text}
                  </Badge>
                  {profile?.verified_seller && (
                    <Badge className="bg-blue-100 text-blue-700 border-0 text-xs py-0.5">
                      Verified Seller
                    </Badge>
                  )}
                  {profile?.early_adopter && (
                    <Badge className="bg-amber-100 text-amber-700 border-0 text-xs py-0.5">
                      Early Adopter
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`${
                      activeTab === tab.id
                        ? 'border-emerald-500 text-emerald-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {renderTabContent()}

            {/* Feedback */}
            {message && (
              <div
                className={`mt-6 mb-2 flex items-start gap-3 rounded-lg border px-4 py-3 text-sm ${
                  message.type === 'success'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                    : 'border-red-500 bg-red-50 text-red-800'
                }`}
              >
                {message.type === 'success' ? (
                  <CheckCircle2 className="mt-0.5 h-5 w-5" />
                ) : (
                  <AlertTriangle className="mt-0.5 h-5 w-5" />
                )}
                <div>
                  <p className="font-semibold leading-snug">{message.text}</p>
                </div>
              </div>
            )}

            {/* Actions - Only show on General and Business tabs */}
            {(activeTab === 'general' || activeTab === 'business') && (
              <div className="flex items-center gap-3 pt-6 border-t border-gray-200 mt-6">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-6"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  onClick={() => router.push('/dashboard')}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            )}

            {/* Upgrade Section */}
            {profile?.subscription_tier === 'free' && activeTab === 'general' && (
              <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Crown className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-amber-900">Upgrade to Premium</h3>
                    <p className="text-sm text-amber-700 mt-1">
                      Get unlimited listings, verified seller badge, and more!
                    </p>
                    <Link href="/pricing">
                      <Button className="mt-3 bg-amber-600 hover:bg-amber-700 text-white">
                        View Plans
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
