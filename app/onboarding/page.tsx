'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import {
  WelcomeScreen,
  BusinessBasicsStep,
  LocationContactStep,
  OperatingHoursStep,
  BrandingStep,
  GalleryUploadStep,
  SocialLinksStep,
  SuccessScreen
} from './steps'

type OnboardingStep = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7

interface OnboardingData {
  displayName: string
  description: string
  category: string
  phoneNumber: string
  city: string
  address: string
  hours: Record<string, { open: boolean; start: string; end: string }>
  profileImage: string | null
  website: string
  twitter: string
  youtube: string
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<OnboardingStep>(0)
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isReturning, setIsReturning] = useState(false)
  const [galleryImages, setGalleryImages] = useState<string[]>([])
  const [data, setData] = useState<OnboardingData>({
    displayName: '',
    description: '',
    category: '',
    phoneNumber: '',
    city: '',
    address: '',
    hours: DAYS.reduce((acc, day) => ({
      ...acc,
      [day]: { open: true, start: '08:00', end: '17:00' }
    }), {}),
    profileImage: null,
    website: '',
    twitter: '',
    youtube: ''
  })

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login-animated')
        return
      }
      setUser(user)
      
      // Fetch existing profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (profile) {
        // If onboarding is already completed, show returning welcome screen then redirect
        if (profile.onboarding_completed) {
          setIsReturning(true)
          // Redirect after 2 seconds
          setTimeout(() => {
            router.push('/dashboard')
          }, 2000)
          return
        }

        setData(prev => ({
          ...prev,
          displayName: profile.display_name || '',
          description: profile.bio || '',
          category: profile.business_category || '',
          phoneNumber: profile.phone_number || '',
          city: profile.business_location || '',
          address: profile.address || '',
          profileImage: profile.avatar_url || null,
          website: profile.website_url || '',
          twitter: profile.twitter || '',
          youtube: profile.youtube || ''
        }))
      }
    }
    checkAuth()
  }, [router])

  const validateStep = (): boolean => {
    switch (step) {
      case 1: // Business Basics
        if (!data.displayName.trim()) {
          alert('Business Display Name is required')
          return false
        }
        if (!data.description.trim() || data.description.length < 20) {
          alert('Business Description is required (minimum 20 characters)')
          return false
        }
        if (!data.category) {
          alert('Business Category is required')
          return false
        }
        return true
      case 2: // Location & Contact
        if (!data.phoneNumber.trim()) {
          alert('Phone Number is required')
          return false
        }
        if (!data.city.trim()) {
          alert('City / Area is required')
          return false
        }
        return true
      case 3: // Operating Hours
        // At least one day should be open
        const hasOpenDay = Object.values(data.hours).some(h => h.open)
        if (!hasOpenDay) {
          alert('At least one day must be marked as open')
          return false
        }
        return true
      case 4: // Branding
        if (!data.profileImage) {
          alert('Profile image is required')
          return false
        }
        return true
      case 5: // Gallery
        if (galleryImages.length === 0) {
          alert('At least one gallery image is required')
          return false
        }
        return true
      case 6: // Social Links
        // Social links are optional, always allow to continue
        return true
      default:
        return true
    }
  }

  const handleNext = () => {
    if (validateStep() && step < 6) {
      setStep((step + 1) as OnboardingStep)
    }
  }

  const handleBack = () => {
    if (step > 0) setStep((step - 1) as OnboardingStep)
  }

  const handleSkip = () => {
    router.push('/dashboard')
  }

  const handleFinish = async () => {
    setLoading(true)
    try {
      let profileImageUrl = data.profileImage
      let galleryImageUrls: string[] = []

      // Upload profile image if it's a new base64 image
      if (data.profileImage && data.profileImage.startsWith('data:')) {
        try {
          const base64Data = data.profileImage.split(',')[1]
          const binaryString = atob(base64Data)
          const bytes = new Uint8Array(binaryString.length)
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i)
          }
          
          const fileName = `profile-${user.id}-${Date.now()}.jpg`
          const { error: uploadError } = await supabase.storage
            .from('profile')
            .upload(`avatars/${fileName}`, bytes, {
              contentType: 'image/jpeg'
            })

          if (uploadError) throw uploadError
          
          const { data: publicUrlData } = supabase.storage
            .from('profile')
            .getPublicUrl(`avatars/${fileName}`)
          
          profileImageUrl = publicUrlData.publicUrl
        } catch (error) {
          console.error('Error uploading profile image:', error)
        }
      }

      // Upload gallery images if they're new base64 images
      if (galleryImages.length > 0) {
        for (const image of galleryImages) {
          if (image.startsWith('data:')) {
            try {
              const base64Data = image.split(',')[1]
              const binaryString = atob(base64Data)
              const bytes = new Uint8Array(binaryString.length)
              for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i)
              }
              
              const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.jpg`
              const { error: uploadError } = await supabase.storage
                .from('gallery')
                .upload(fileName, bytes, {
                  contentType: 'image/jpeg'
                })

              if (uploadError) throw uploadError
              
              const { data: { publicUrl } } = supabase.storage
                .from('gallery')
                .getPublicUrl(fileName)
              
              galleryImageUrls.push(publicUrl)
            } catch (error) {
              console.error('Error uploading gallery image:', error)
            }
          } else {
            galleryImageUrls.push(image)
          }
        }
      }

      // Convert hours format from { Monday: { open, start, end } } to { monday: { open, close, closed } }
      const formattedHours: Record<string, any> = {}
      Object.entries(data.hours).forEach(([day, hours]) => {
        const dayLower = day.toLowerCase()
        formattedHours[dayLower] = {
          open: hours.start,
          close: hours.end,
          closed: !hours.open
        }
      })

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          display_name: data.displayName,
          bio: data.description,
          business_category: data.category,
          phone_number: data.phoneNumber,
          business_location: data.city,
          address: data.address,
          business_hours: JSON.stringify(formattedHours),
          website_url: data.website,
          twitter: data.twitter,
          youtube: data.youtube,
          avatar_url: profileImageUrl,
          global_menu_images: JSON.stringify(galleryImageUrls)
        })
        .eq('id', user.id)

      if (updateError) throw updateError

      // Save gallery images to profile_gallery table
      if (galleryImageUrls.length > 0) {
        const galleryEntries = galleryImageUrls.map((url, index) => ({
          profile_id: user.id,
          image_url: url,
          caption: `Gallery Image ${index + 1}`
        }))

        const { error: galleryError } = await supabase
          .from('profile_gallery')
          .insert(galleryEntries)

        if (galleryError) {
          console.error('Error saving gallery images:', galleryError)
        }
      }
      
      // Move to success screen
      setStep(7)
    } catch (error) {
      console.error('Error saving profile:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f0f0f0] p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        {step === 0 && <WelcomeScreen username={user?.email?.split('@')[0] || 'there'} onStart={handleNext} onSkip={handleSkip} isReturning={isReturning} />}
        {step === 1 && <BusinessBasicsStep data={data} setData={setData} onNext={handleNext} onBack={handleBack} />}
        {step === 2 && <LocationContactStep data={data} setData={setData} onNext={handleNext} onBack={handleBack} />}
        {step === 3 && <OperatingHoursStep data={data} setData={setData} onNext={handleNext} onBack={handleBack} />}
        {step === 4 && <BrandingStep data={data} setData={setData} onNext={handleNext} onBack={handleBack} />}
        {step === 5 && <GalleryUploadStep galleryImages={galleryImages} setGalleryImages={setGalleryImages} onNext={handleNext} onBack={handleBack} />}
        {step === 6 && <SocialLinksStep data={data} setData={setData} onFinish={handleFinish} onBack={handleBack} />}
        {step === 7 && <SuccessScreen onDashboard={() => router.push('/dashboard')} onAddProduct={() => router.push('/dashboard?modal=product-creation')} onViewProfile={() => router.push(`/profile/${user?.email?.split('@')[0]}`)} />}
      </div>
    </div>
  )
}
