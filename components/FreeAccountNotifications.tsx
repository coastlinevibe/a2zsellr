'use client'

import { useState, useEffect } from 'react'
import { Crown, Sword, X, Star, Zap, TrendingUp, Users } from 'lucide-react'
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
            <Sword className="w-6 h-6 text-orange-600" />
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
          <li>• Profile resets every Sunday (products & listings cleared)</li>
        </ul>
      </div>

      {/* Upgrade Offer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sword className="w-5 h-5 text-amber-500" />
          <div className="text-xl font-black text-gray-900 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
            R149/month
          </div>
          <Star className="w-4 h-4 text-orange-500" />
        </div>
        
        {onUpgrade && (
          <button
            onClick={onUpgrade}
            className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-black font-black py-3 px-6 rounded-lg border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.9)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,0.9)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-3"
          >
            <Sword className="w-5 h-5" />
            <span>Upgrade Now</span>
            <Star className="w-4 h-4" />
          </button>
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
