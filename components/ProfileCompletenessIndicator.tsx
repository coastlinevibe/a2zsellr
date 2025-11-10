'use client'
import { useState, useEffect } from 'react'
import { CheckCircle2, AlertCircle, User, Building2, Clock, Upload, Target } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface UserProfile {
  display_name: string | null
  bio: string | null
  avatar_url: string | null
  phone_number: string | null
  website_url: string | null
  business_category: string | null
  business_location: string | null
  business_hours: any
  subscription_tier: 'free' | 'premium' | 'business'
}

interface ProfileCompletenessProps {
  profile: UserProfile | null
  userEmail?: string
}

interface CompletionItem {
  id: string
  label: string
  completed: boolean
  required: boolean
  icon: React.ComponentType<any>
  description: string
}

export default function ProfileCompletenessIndicator({ profile, userEmail }: ProfileCompletenessProps) {
  const [completionItems, setCompletionItems] = useState<CompletionItem[]>([])
  const [completionPercentage, setCompletionPercentage] = useState(0)

  useEffect(() => {
    if (!profile) return

    const items: CompletionItem[] = [
      {
        id: 'display_name',
        label: 'Display Name',
        completed: !!profile.display_name?.trim(),
        required: true,
        icon: User,
        description: 'Your business name as it appears to customers'
      },
      {
        id: 'bio',
        label: 'Business Description',
        completed: !!profile.bio?.trim() && profile.bio.trim().length >= 20,
        required: true,
        icon: Building2,
        description: 'Tell customers about your business (minimum 20 characters)'
      },
      {
        id: 'phone_number',
        label: 'Phone Number',
        completed: !!profile.phone_number?.trim(),
        required: true,
        icon: Building2,
        description: 'Contact number for customer inquiries'
      },
      {
        id: 'business_category',
        label: 'Business Category',
        completed: !!profile.business_category?.trim(),
        required: true,
        icon: Building2,
        description: 'Help customers find you in the right category'
      },
      {
        id: 'business_location',
        label: 'Business Location',
        completed: !!profile.business_location?.trim(),
        required: true,
        icon: Building2,
        description: 'Your city or area for local discovery'
      },
      {
        id: 'business_hours',
        label: 'Operating Hours',
        completed: !!profile.business_hours,
        required: true,
        icon: Clock,
        description: 'When customers can visit or contact you'
      },
      {
        id: 'avatar_url',
        label: 'Profile Picture',
        completed: !!profile.avatar_url?.trim(),
        required: false,
        icon: Upload,
        description: 'A professional photo builds trust with customers'
      },
      {
        id: 'website_url',
        label: 'Website URL',
        completed: !!profile.website_url?.trim(),
        required: false,
        icon: Building2,
        description: 'Link to your website for more information'
      }
    ]

    setCompletionItems(items)

    // Calculate completion percentage
    const requiredItems = items.filter(item => item.required)
    const completedRequired = requiredItems.filter(item => item.completed)
    const optionalItems = items.filter(item => !item.required)
    const completedOptional = optionalItems.filter(item => item.completed)
    
    // Required items count for 80%, optional for 20%
    const requiredWeight = 80
    const optionalWeight = 20
    
    const requiredPercentage = (completedRequired.length / requiredItems.length) * requiredWeight
    const optionalPercentage = (completedOptional.length / optionalItems.length) * optionalWeight
    
    const totalPercentage = Math.round(requiredPercentage + optionalPercentage)
    setCompletionPercentage(totalPercentage)
  }, [profile])

  const getCompletionColor = () => {
    if (completionPercentage >= 80) return 'text-emerald-600'
    if (completionPercentage >= 60) return 'text-amber-600'
    return 'text-red-600'
  }

  const getProgressBarColor = () => {
    if (completionPercentage >= 80) return 'bg-emerald-500'
    if (completionPercentage >= 60) return 'bg-amber-500'
    return 'bg-red-500'
  }

  const getCompletionMessage = () => {
    if (completionPercentage === 100) {
      return {
        title: "🎉 Profile Complete!",
        description: "Your business profile is now optimized for maximum customer engagement",
        icon: CheckCircle2,
        color: "text-emerald-600"
      }
    }
    if (completionPercentage >= 80) {
      return {
        title: "Great job! Your profile is nearly complete",
        description: "Complete the remaining items to maximize your visibility",
        icon: CheckCircle2,
        color: "text-emerald-600"
      }
    }
    if (completionPercentage >= 60) {
      return {
        title: "You're making good progress",
        description: "Complete more fields to improve your business visibility",
        icon: Target,
        color: "text-amber-600"
      }
    }
    return {
      title: "Let's complete your profile",
      description: "A complete profile gets 3x more customer inquiries",
      icon: AlertCircle,
      color: "text-red-600"
    }
  }

  const requiredIncomplete = completionItems.filter(item => item.required && !item.completed)
  const optionalIncomplete = completionItems.filter(item => !item.required && !item.completed)
  const message = getCompletionMessage()
  const MessageIcon = message.icon

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <MessageIcon className={`w-6 h-6 ${message.color}`} />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{message.title}</h3>
            <p className="text-sm text-gray-600">{message.description}</p>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-bold ${getCompletionColor()}`}>
            {completionPercentage}%
          </div>
          <div className="text-xs text-gray-500">Complete</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-500 ${getProgressBarColor()}`}
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Getting started</span>
          <span>Professional profile</span>
        </div>
      </div>

      {/* Completion Items */}
      {(requiredIncomplete.length > 0 || optionalIncomplete.length > 0) && (
        <div className="space-y-4">
          {/* Required Items */}
          {requiredIncomplete.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                Required ({requiredIncomplete.length} remaining)
              </h4>
              <div className="space-y-2">
                {requiredIncomplete.map((item) => {
                  const Icon = item.icon
                  return (
                    <div key={item.id} className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <Icon className="w-4 h-4 text-red-600 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-red-900">{item.label}</span>
                          <Badge className="bg-red-100 text-red-700 text-xs border-0">Required</Badge>
                        </div>
                        <p className="text-xs text-red-700 mt-1">{item.description}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Optional Items */}
          {optionalIncomplete.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-amber-500" />
                Recommended ({optionalIncomplete.length} remaining)
              </h4>
              <div className="space-y-2">
                {optionalIncomplete.map((item) => {
                  const Icon = item.icon
                  return (
                    <div key={item.id} className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <Icon className="w-4 h-4 text-amber-600 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-amber-900">{item.label}</span>
                          <Badge className="bg-amber-100 text-amber-700 text-xs border-0">Optional</Badge>
                        </div>
                        <p className="text-xs text-amber-700 mt-1">{item.description}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}


      {/* Free Tier Reminder */}
      {profile?.subscription_tier === 'free' && completionPercentage >= 80 && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 text-blue-900 text-sm">
            <Target className="w-4 h-4" />
            <span className="font-medium">Next Step:</span>
            <span>Add your first products and gallery images to showcase your business!</span>
          </div>
        </div>
      )}
    </div>
  )
}
