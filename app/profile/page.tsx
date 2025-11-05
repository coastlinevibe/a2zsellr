'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Star, MapPin, Phone, Globe, Clock, Mail, Crown, Share2, ChevronLeft, ChevronRight, Package, ShoppingBag, X, Heart, Check, Truck, Shield, FileText, User, CheckCircle2, AlertTriangle, Building2, Tag, Upload, ArrowLeft, HelpCircle, Image as ImageIcon } from 'lucide-react'
import EmojiPicker from '@/components/ui/emoji-picker'
import { Badge } from '@/components/ui/badge'
import ProfileCompletenessIndicator from '@/components/ProfileCompletenessIndicator'
import ProfileCompletionWizard from '@/components/ProfileCompletionWizard'
import FormValidation, { validateField, validationRules, getInputBorderColor } from '@/components/FormValidation'
import CompactWeeklySchedule from '@/components/CompactWeeklySchedule'
import AnimatedProfilePicture from '@/components/AnimatedProfilePicture'
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
  { id: 'basic', label: 'Profile', icon: User },
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
  const [activeTab, setActiveTab] = useState('basic')
  
  // Profile completion states
  const [showWizard, setShowWizard] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [fieldValidations, setFieldValidations] = useState<Record<string, any>>({})
  
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
  const [todayHours, setTodayHours] = useState('')
  const [weeklySchedule, setWeeklySchedule] = useState({
    monday: { open: '09:00', close: '17:00', closed: false },
    tuesday: { open: '09:00', close: '17:00', closed: false },
    wednesday: { open: '09:00', close: '17:00', closed: false },
    thursday: { open: '09:00', close: '17:00', closed: false },
    friday: { open: '09:00', close: '17:00', closed: false },
    saturday: { open: '09:00', close: '14:00', closed: false },
    sunday: { open: '09:00', close: '17:00', closed: true }
  })

  useEffect(() => {
    if (!user) {
      router.push('/auth/login-animated')
      return
    }
    fetchProfile()
  }, [user])

  // Check if we should show the wizard for new users
  useEffect(() => {
    if (profile && !profile.display_name && !showWizard) {
      // Show wizard for new users who haven't completed basic info
      const timer = setTimeout(() => setShowWizard(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [profile, showWizard])

  // Real-time field validation
  useEffect(() => {
    const validations = {
      display_name: validateField(displayName, validationRules.displayName, 'Display Name'),
      bio: validateField(bio, validationRules.bio, 'Bio'),
      phone_number: validateField(phoneNumber, validationRules.phoneNumber, 'Phone Number'),
      website_url: validateField(websiteUrl, validationRules.websiteUrl, 'Website URL')
    }
    setFieldValidations(validations)
  }, [displayName, bio, phoneNumber, websiteUrl])

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
      
      // Parse existing schedule if available
      if (profileData.business_hours) {
        try {
          const parsedSchedule = JSON.parse(profileData.business_hours)
          if (parsedSchedule && typeof parsedSchedule === 'object') {
            setWeeklySchedule(parsedSchedule)
          }
        } catch (error) {
          // If it's not JSON, try to parse the old text format
          console.log('Using legacy text format for business hours')
        }
        const todayHours = getTodayHours(profileData.business_hours)
        setTodayHours(todayHours)
      }
      
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

    // Comprehensive validation before saving
    const validationErrors = []
    
    // Validate display name if it has changed
    if (displayName !== originalDisplayName) {
      if (!fieldValidations.display_name?.isValid) {
        validationErrors.push('Display name: ' + fieldValidations.display_name?.message)
      }
      if (displayNameAvailable !== true) {
        validationErrors.push('Display name is not available')
      }
    }
    
    // Validate other required fields
    if (!fieldValidations.bio?.isValid && bio.trim()) {
      validationErrors.push('Bio: ' + fieldValidations.bio?.message)
    }
    if (!fieldValidations.phone_number?.isValid && phoneNumber.trim()) {
      validationErrors.push('Phone: ' + fieldValidations.phone_number?.message)
    }
    if (!fieldValidations.website_url?.isValid && websiteUrl.trim()) {
      validationErrors.push('Website: ' + fieldValidations.website_url?.message)
    }
    
    if (validationErrors.length > 0) {
      setMessage({ type: 'error', text: validationErrors.join(', ') })
      setSaving(false)
      return
    }

    try {
      const updates = {
        display_name: displayName.trim() || undefined,
        subscription_tier: profileType,
        bio: bio.trim() || undefined,
        avatar_url: avatarUrl.trim() || undefined,
        phone_number: phoneNumber.trim() || undefined,
        website_url: websiteUrl.trim() || undefined,
        business_category: businessCategory.trim() || undefined,
        business_location: businessLocation.trim() || undefined,
        business_hours: businessHours.trim() || undefined,
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

  // Function to get today's operating hours
  const getTodayHours = (hoursString: string) => {
    if (!hoursString) return 'Hours not set'
    
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })
    const todayShort = today.substring(0, 3) // Mon, Tue, etc.
    
    // Try to parse the hours string to find today's hours
    const lines = hoursString.split('\n')
    for (const line of lines) {
      const trimmedLine = line.trim()
      if (trimmedLine.toLowerCase().includes(today.toLowerCase()) || 
          trimmedLine.toLowerCase().includes(todayShort.toLowerCase())) {
        // Extract the hours part after the colon
        const colonIndex = trimmedLine.indexOf(':')
        if (colonIndex !== -1) {
          return trimmedLine.substring(colonIndex + 1).trim()
        }
      }
    }
    
    // If no specific day found, return a generic message
    return 'Check full schedule'
  }

  // Update today's hours when business hours change
  const handleBusinessHoursChange = (value: string) => {
    setBusinessHours(value)
    const todayHours = getTodayHours(value)
    setTodayHours(todayHours)
  }

  // Update schedule for a specific day
  const updateDaySchedule = (day: string, field: string, value: string | boolean) => {
    const newSchedule = {
      ...weeklySchedule,
      [day]: {
        ...weeklySchedule[day as keyof typeof weeklySchedule],
        [field]: value
      }
    }
    setWeeklySchedule(newSchedule)
    
    // Update business hours with JSON format
    const scheduleJson = JSON.stringify(newSchedule)
    setBusinessHours(scheduleJson)
    
    // Update today's hours display
    const todayHours = getTodayHoursFromSchedule(newSchedule)
    setTodayHours(todayHours)
  }

  // Get today's hours from schedule object
  const getTodayHoursFromSchedule = (schedule: typeof weeklySchedule) => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
    const todaySchedule = schedule[today as keyof typeof schedule]
    
    if (!todaySchedule) return 'Hours not set'
    if (todaySchedule.closed) return 'Closed'
    
    return `${todaySchedule.open} - ${todaySchedule.close}`
  }

  const daysOfWeek = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' }
  ]

  const handleFieldFocus = (fieldId: string) => {
    setFocusedField(fieldId)
    // Close wizard when user starts editing
    if (showWizard) {
      setShowWizard(false)
    }
  }

  const handleWizardClose = () => {
    setShowWizard(false)
  }

  const renderTabContent = () => {
    return (
      <div className="space-y-6">
        {/* Profile Completeness Indicator */}
        <ProfileCompletenessIndicator 
          profile={profile} 
          userEmail={user?.email}
        />
        
        {/* Tab Content */}
        {activeTab === 'basic' && (
          <div className="space-y-8">
            {/* Top Section - Two Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - All Form Fields */}
              <div className="space-y-6">
                {/* Basic Information Section */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Basic Information
                  </h4>
                
                {/* Display Name */}
                <div id="display_name">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    Display Name
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => {
                        setDisplayName(e.target.value)
                        handleDisplayNameChange(e.target.value)
                        handleFieldFocus('display_name')
                      }}
                      className={`w-full px-3 py-2 pr-20 border rounded-lg focus:ring-2 outline-none text-sm ${
                        displayNameAvailable === true ? 'border-green-500 focus:border-green-500 focus:ring-green-500' :
                        displayNameAvailable === false ? 'border-red-500 focus:border-red-500 focus:ring-red-500' :
                        getInputBorderColor(displayName, validationRules.displayName, true)
                      }`}
                      placeholder="e.g., Alf's Burger Joint"
                    />
                    
                    {/* Availability Status */}
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                      {checkingDisplayName && (
                        <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                      )}
                      {displayNameAvailable === true && (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      )}
                      {displayNameAvailable === false && (
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                  </div>
                  
                  {displayNameError && (
                    <div className="mt-1 text-red-600 text-xs">{displayNameError}</div>
                  )}
                </div>

                {/* Bio */}
                <div id="bio">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <FileText className="w-4 h-4" />
                    Business Description
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <textarea
                      value={bio}
                      onChange={(e) => {
                        setBio(e.target.value)
                        handleFieldFocus('bio')
                      }}
                      placeholder="Describe your business..."
                      rows={3}
                      maxLength={500}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 outline-none resize-none text-sm ${
                        getInputBorderColor(bio, validationRules.bio, true)
                      }`}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {bio.length}/500 characters {bio.length < 20 && `(${20 - bio.length} more needed)`}
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed text-sm"
                  />
                </div>
              </div>

              {/* Business Information Section */}
              <div className="space-y-4 pt-4 border-t border-gray-200">
                <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Business Information
                </h4>
                
                {/* Phone Number */}
                <div id="phone_number">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Phone className="w-4 h-4" />
                    Phone Number
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => {
                      setPhoneNumber(e.target.value)
                      handleFieldFocus('phone_number')
                    }}
                    placeholder="+27 XX XXX XXXX"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 outline-none text-sm ${
                      getInputBorderColor(phoneNumber, validationRules.phoneNumber, true)
                    }`}
                  />
                </div>

                {/* Website URL */}
                <div id="website_url">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Globe className="w-4 h-4" />
                    Website URL
                    <span className="text-gray-400 text-xs">(Optional)</span>
                  </label>
                  <input
                    type="url"
                    value={websiteUrl}
                    onChange={(e) => {
                      setWebsiteUrl(e.target.value)
                      handleFieldFocus('website_url')
                    }}
                    placeholder="https://www.yourwebsite.com"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 outline-none text-sm ${
                      getInputBorderColor(websiteUrl, validationRules.websiteUrl, true)
                    }`}
                  />
                </div>

                {/* Business Category */}
                <div id="business_category">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Tag className="w-4 h-4" />
                    Business Category
                    <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={businessCategory}
                    onChange={(e) => {
                      setBusinessCategory(e.target.value)
                      handleFieldFocus('business_category')
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 outline-none text-sm ${
                      businessCategory ? 'border-emerald-500 focus:border-emerald-500 focus:ring-emerald-500' : 'border-gray-300 focus:border-emerald-500 focus:ring-emerald-500'
                    }`}
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

                {/* Business Location */}
                <div id="business_location">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4" />
                    Business Location
                    <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={businessLocation}
                    onChange={(e) => {
                      setBusinessLocation(e.target.value)
                      handleFieldFocus('business_location')
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 outline-none text-sm ${
                      businessLocation ? 'border-emerald-500 focus:border-emerald-500 focus:ring-emerald-500' : 'border-gray-300 focus:border-emerald-500 focus:ring-emerald-500'
                    }`}
                  >
                    <option value="">Select a location</option>
                    <option value="cape-town">Cape Town</option>
                    <option value="johannesburg">Johannesburg</option>
                    <option value="durban">Durban</option>
                    <option value="pretoria">Pretoria</option>
                  </select>
                </div>
              </div>
            </div>

              {/* Right Column - Profile Picture */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Profile Picture
                </h4>
                <AnimatedProfilePicture
                  avatarUrl={avatarUrl}
                  previewUrl={previewUrl}
                  uploading={uploading}
                  onFileSelect={handleFileSelect}
                  onImageUpload={handleImageUpload}
                  onAvatarUrlChange={setAvatarUrl}
                  selectedFile={selectedFile}
                />
              </div>
            </div>

            {/* Bottom Section - Operating Hours */}
            <div className="pt-6 border-t border-gray-200">
              <div id="business_hours">
                <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5" />
                  Operating Hours
                  <span className="text-red-500">*</span>
                </h4>
                <CompactWeeklySchedule
                  weeklySchedule={weeklySchedule}
                  updateDaySchedule={updateDaySchedule}
                  getTodayHoursFromSchedule={getTodayHoursFromSchedule}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Show wizard if requested
  const shouldShowWizard = showWizard && profile

  if (shouldShowWizard) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Main Content (blurred background) */}
        <div className="filter blur-sm pointer-events-none">
          {/* Your existing profile content here */}
        </div>
        
        {/* Wizard Overlay */}
        <ProfileCompletionWizard
          profile={profile}
          onClose={handleWizardClose}
          onFieldFocus={handleFieldFocus}
        />
      </div>
    )
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

          {/* Header - No tabs needed since everything is in one view */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-emerald-600" />
              <h2 className="text-xl font-semibold text-gray-900">Complete Your Profile</h2>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Fill out your business information to get discovered by customers
            </p>
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

            {/* Actions */}
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

            {/* Upgrade Section */}
            {profile?.subscription_tier === 'free' && (
              <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Crown className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-amber-900">Ready for the Next Step?</h3>
                    <p className="text-sm text-amber-700 mt-1">
                      Complete your profile, then upgrade to Premium for unlimited products, gallery images, and marketing tools!
                    </p>
                    <div className="flex gap-2 mt-3">
                      <Button 
                        onClick={() => setShowWizard(true)}
                        variant="outline"
                        className="border-amber-600 text-amber-700 hover:bg-amber-100"
                      >
                        Complete Profile
                      </Button>
                      <Link href="/pricing">
                        <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                          View Plans
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Wizard Modal */}
      {showWizard && profile && (
        <ProfileCompletionWizard
          profile={profile}
          onClose={handleWizardClose}
          onFieldFocus={handleFieldFocus}
        />
      )}
    </div>
  )
}
