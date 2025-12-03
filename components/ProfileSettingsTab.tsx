'use client'

import Link from 'next/link'
import { MessageCircle, CreditCard, AlertCircle, CheckCircle, Edit } from 'lucide-react'

interface ProfileSettingsTabProps {
  profile: {
    id: string
    display_name: string | null
    email: string | null
    phone_number: string | null
    website_url: string | null
    business_category: string | null
    business_location: string | null
    bio: string | null
    subscription_tier: 'free' | 'premium' | 'business'
  }
}

export function ProfileSettingsTab({ profile }: ProfileSettingsTabProps) {
  const handleWhatsAppClick = () => {
    const message = encodeURIComponent(
      `Hi! I'd like to setup payment for my A2Z Sellr account. My profile name is: ${profile.display_name || 'My Profile'}`
    )
    window.open(`https://wa.me/27714329190?text=${message}`, '_blank')
  }

  return (
    <div className="space-y-8">
      {/* Profile tab content */}
    </div>
  )
}
