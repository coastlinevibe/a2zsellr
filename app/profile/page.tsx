'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Star, MapPin, Phone, Globe, Clock, Mail, Crown, Share2, ChevronLeft, ChevronRight, Package, ShoppingBag, X, Heart, Check, Truck, Shield, FileText, User, CheckCircle2, AlertTriangle, Building2, Tag, Upload, ArrowLeft } from 'lucide-react'
import EmojiPicker from '@/components/ui/emoji-picker'
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
  { id: 'profile', label: 'Profile', icon: User },
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
  const [activeTab, setActiveTab] = useState('profile')
  
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

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-8">
            {/* Profile Header */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg font-semibold text-emerald-900">Complete Profile</h3>
              </div>
              <p className="text-sm text-emerald-700 mt-1">
                Manage your personal and business information for the A2Z directory
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Personal Info */}
              <div className="space-y-6">
                <h4 className="text-md font-semibold text-gray-900 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Personal Information
                </h4>
                
                {/* Display Name */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
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
                  <div className="relative">
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell us about yourself... 😊"
                      rows={4}
                      maxLength={500}
                      className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none"
                    />
                    <div className="absolute bottom-2 right-2">
                      <EmojiPicker
                        onEmojiSelect={(emoji) => {
                          if (bio.length < 500) {
                            setBio(bio + emoji)
                          }
                        }}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {bio.length}/500 characters
                  </p>
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

              {/* Middle Column - Contact & Business */}
              <div className="space-y-6">
                <h4 className="text-md font-semibold text-gray-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Business Information
                </h4>
                
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

                {/* Business Category */}
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

                {/* Business Location */}
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

                {/* Operating Hours Schedule Picker */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                    <Clock className="w-4 h-4" />
                    Operating Hours
                  </label>
                  
                  {/* Today's Hours Display */}
                  {businessHours && (
                    <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm font-medium text-emerald-900">
                          Today ({new Date().toLocaleDateString('en-US', { weekday: 'long' })})
                        </span>
                      </div>
                      <p className="text-emerald-700 font-medium">
                        {getTodayHoursFromSchedule(weeklySchedule)}
                      </p>
                    </div>
                  )}
                  
                  {/* Weekly Schedule Picker */}
                  <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Weekly Schedule</h4>
                    
                    {daysOfWeek.map((day) => {
                      const daySchedule = weeklySchedule[day.key as keyof typeof weeklySchedule]
                      return (
                        <div key={day.key} className="flex items-center gap-3 py-2">
                          <div className="w-20 text-sm font-medium text-gray-700">
                            {day.label}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={!daySchedule.closed}
                              onChange={(e) => updateDaySchedule(day.key, 'closed', !e.target.checked)}
                              className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                            />
                            <span className="text-xs text-gray-600">Open</span>
                          </div>
                          
                          {!daySchedule.closed && (
                            <>
                              <div className="flex items-center gap-2">
                                <label className="text-xs text-gray-600">From:</label>
                                <input
                                  type="time"
                                  value={daySchedule.open}
                                  onChange={(e) => updateDaySchedule(day.key, 'open', e.target.value)}
                                  className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                />
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <label className="text-xs text-gray-600">To:</label>
                                <input
                                  type="time"
                                  value={daySchedule.close}
                                  onChange={(e) => updateDaySchedule(day.key, 'close', e.target.value)}
                                  className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                />
                              </div>
                            </>
                          )}
                          
                          {daySchedule.closed && (
                            <span className="text-sm text-gray-500 italic">Closed</span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-2">
                    Set your operating hours for each day of the week
                  </p>
                </div>
              </div>

              {/* Right Column - Profile Picture */}
              <div className="space-y-6">
                <h4 className="text-md font-semibold text-gray-900 flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Profile Picture
                </h4>
                
                {/* Avatar Upload */}
                <div>
                  {(previewUrl || avatarUrl) && (
                    <div className="mb-4 flex flex-col items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <img 
                        src={previewUrl || avatarUrl} 
                        alt="Avatar preview" 
                        className="w-24 h-24 rounded-full object-cover border-2 border-emerald-500"
                      />
                      <div className="text-center">
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
                  
                  <div className="space-y-3">
                    <input
                      type="url"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="https://example.com/avatar.jpg"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    />
                    <label className="cursor-pointer block">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileSelect}
                        disabled={uploading}
                      />
                      <div className={`w-full px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                        uploading 
                          ? 'bg-gray-400 cursor-not-allowed' 
                          : 'bg-emerald-600 hover:bg-emerald-700 cursor-pointer'
                      } text-white`}>
                        <Upload className="w-4 h-4" />
                        Select Image
                      </div>
                    </label>
                  </div>
                </div>
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

            {/* Actions - Only show on Profile tab */}
            {activeTab === 'profile' && (
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
            {profile?.subscription_tier === 'free' && activeTab === 'profile' && (
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
