'use client'

import { useState, useEffect } from 'react'
import { Crown, X, Star, Zap, TrendingUp, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface FreeAccountNotificationsProps {
  onUpgrade?: () => void
  onDismiss?: () => void
}

export default function FreeAccountNotifications({ 
  onUpgrade,
  onDismiss
}: FreeAccountNotificationsProps) {
  const [isDismissed, setIsDismissed] = useState(false)

  // Check session storage on mount
  useEffect(() => {
    const dismissed = sessionStorage.getItem('freeAccountNotificationDismissed')
    if (dismissed === 'true') {
      setIsDismissed(true)
    }
  }, [])

  if (isDismissed) return null

  const handleDismiss = () => {
    setIsDismissed(true)
    // Store dismissal in session storage (persists until browser tab is closed)
    sessionStorage.setItem('freeAccountNotificationDismissed', 'true')
    onDismiss?.()
  }

  const features = [
    {
      icon: Star,
      title: 'Premium Gallery',
      description: 'Unlimited images with slider showcase'
    },
    {
      icon: Zap,
      title: 'Marketing Tools',
      description: 'WhatsApp & Facebook automation'
    },
    {
      icon: TrendingUp,
      title: 'Analytics',
      description: 'Track views, clicks, and engagement'
    },
    {
      icon: Users,
      title: 'Priority Support',
      description: '24/7 customer support access'
    }
  ]

  return (
    <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-6 mb-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 rounded-full">
            <Crown className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Unlock Premium Features
            </h3>
            <p className="text-sm text-gray-600">
              You're currently on the Free plan with limited features
            </p>
          </div>
        </div>
        
        <button
          onClick={handleDismiss}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {features.map((feature, index) => {
          const IconComponent = feature.icon
          return (
            <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-orange-100">
              <div className="p-1 bg-orange-100 rounded">
                <IconComponent className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 text-sm">{feature.title}</h4>
                <p className="text-xs text-gray-600">{feature.description}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Current Limitations */}
      <div className="bg-white rounded-lg border border-orange-100 p-4 mb-6">
        <h4 className="font-medium text-gray-900 mb-2 text-sm">Current Free Plan Limits:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Only 3 gallery images</li>
          <li>• Maximum 5 products in shop</li>
          <li>• Maximum 3 marketing listings</li>
          <li>• No sharing on Wednesday, Saturday, Sunday</li>
          <li>• Profile resets every 7 days (products & listings cleared)</li>
        </ul>
      </div>

      {/* Upgrade Offer */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg font-bold text-gray-900">R149/month</span>
            <span className="text-sm text-gray-500 line-through">R299</span>
            <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-medium">
              50% OFF
            </span>
          </div>
          <p className="text-sm text-gray-600">Early Adopter Special - Limited Time</p>
        </div>
        
        {onUpgrade && (
          <Button
            onClick={onUpgrade}
            className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white flex items-center gap-2"
          >
            <Crown className="w-4 h-4" />
            Upgrade Now
          </Button>
        )}
      </div>

      {/* Trust Indicators */}
      <div className="mt-4 pt-4 border-t border-orange-200">
        <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
          <span>✓ Cancel anytime</span>
          <span>✓ 30-day money back</span>
          <span>✓ No setup fees</span>
        </div>
      </div>
    </div>
  )
}
