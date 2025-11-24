'use client'

import { useEffect, useState } from 'react'
import { X, AlertTriangle, Clock, Crown, Sword, ArrowRight, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { calculateResetInfo } from '@/lib/resetUtils'

interface ResetNotificationModalProps {
  profileCreatedAt: string | Date
  lastResetAt?: string | Date | null
  subscriptionTier: 'free' | 'premium' | 'business'
  onUpgrade?: () => void
}

export default function ResetNotificationModal({ 
  profileCreatedAt,
  lastResetAt,
  subscriptionTier,
  onUpgrade
}: ResetNotificationModalProps) {
  const [showModal, setShowModal] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [lastShownLevel, setLastShownLevel] = useState<string | null>(null)

  useEffect(() => {
    // Don't show for premium/business users
    if (subscriptionTier !== 'free') return

    // Check if already dismissed this session
    const dismissedKey = 'reset-notification-dismissed'
    const sessionDismissed = sessionStorage.getItem(dismissedKey)
    if (sessionDismissed) {
      setDismissed(true)
      return
    }

    const baseDate = lastResetAt || profileCreatedAt
    const resetInfo = calculateResetInfo(baseDate, subscriptionTier)

    // Determine notification level - don't show "expired" notification
    let notificationLevel: string | null = null
    
    if (resetInfo.hoursRemaining <= 1) {
      notificationLevel = '1hour'
    } else if (resetInfo.daysRemaining <= 1) {
      notificationLevel = '1day'
    } else if (resetInfo.daysRemaining <= 3) {
      notificationLevel = '3days'
    }

    // Show modal if we have a notification and haven't shown this level yet
    if (notificationLevel && notificationLevel !== lastShownLevel) {
      setShowModal(true)
      setLastShownLevel(notificationLevel)
    }

    // Check every minute
    const interval = setInterval(() => {
      const updatedInfo = calculateResetInfo(baseDate, subscriptionTier)
      
      let newLevel: string | null = null
      if (updatedInfo.hoursRemaining <= 1) {
        newLevel = '1hour'
      } else if (updatedInfo.daysRemaining <= 1) {
        newLevel = '1day'
      } else if (updatedInfo.daysRemaining <= 3) {
        newLevel = '3days'
      }

      if (newLevel && newLevel !== lastShownLevel && !dismissed) {
        setShowModal(true)
        setLastShownLevel(newLevel)
      }
    }, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [profileCreatedAt, lastResetAt, subscriptionTier, lastShownLevel, dismissed])

  const handleDismiss = () => {
    setShowModal(false)
    setDismissed(true)
    sessionStorage.setItem('reset-notification-dismissed', 'true')
  }

  if (!showModal || subscriptionTier !== 'free') return null

  const baseDate = lastResetAt || profileCreatedAt
  const resetInfo = calculateResetInfo(baseDate, subscriptionTier)

  const getNotificationContent = () => {
    if (resetInfo.hoursRemaining <= 1) {
      return {
        icon: AlertTriangle,
        iconColor: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        title: '🚨 Reset in Less Than 1 Hour!',
        message: `Your free tier will reset in ${Math.floor(resetInfo.hoursRemaining * 60)} minutes. All products, listings, and gallery images will be deleted.`,
        action: 'Upgrade NOW to save your content and avoid losing your work!',
        urgency: 'critical'
      }
    } else if (resetInfo.daysRemaining <= 1) {
      // Calculate hours and minutes remaining for display
      const msRemaining = resetInfo.resetDate.getTime() - new Date().getTime()
      const hoursRemaining = Math.floor(msRemaining / (60 * 60 * 1000))
      const minutesRemaining = Math.floor((msRemaining % (60 * 60 * 1000)) / (60 * 1000))
      
      return {
        icon: Clock,
        iconColor: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        title: '⏰ Reset Tomorrow!',
        message: `Your free tier will reset in ${hoursRemaining}h ${minutesRemaining}m. All your products, listings, and gallery images will be cleared.`,
        action: 'Upgrade to Premium today to keep your content forever.',
        urgency: 'high'
      }
    } else {
      return {
        icon: Clock,
        iconColor: 'text-amber-600',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        title: '📅 Reset in 3 Days',
        message: `Your free tier will reset on ${resetInfo.resetDate.toLocaleDateString()} at ${resetInfo.resetDate.toLocaleTimeString()}. All products, listings, and gallery images will be cleared.`,
        action: 'Upgrade to Premium to keep your content permanently.',
        urgency: 'medium'
      }
    }
  }

  const content = getNotificationContent()
  const Icon = content.icon

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        {/* Modal */}
        <div className={`bg-white rounded-xl shadow-2xl max-w-md w-full border-2 ${content.borderColor} animate-in fade-in zoom-in duration-300`}>
          {/* Header */}
          <div className={`${content.bgColor} border-b ${content.borderColor} p-6 rounded-t-xl`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 bg-white rounded-full`}>
                  <Icon className={`w-6 h-6 ${content.iconColor}`} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {content.title}
                  </h3>
                  <div className="text-sm font-mono font-semibold text-gray-700 mt-1">
                    {(() => {
                      const msRemaining = resetInfo.resetDate.getTime() - new Date().getTime()
                      const hoursRemaining = Math.floor(msRemaining / (60 * 60 * 1000))
                      const minutesRemaining = Math.floor((msRemaining % (60 * 60 * 1000)) / (60 * 1000))
                      return `${hoursRemaining}h ${minutesRemaining}m remaining`
                    })()}
                  </div>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-gray-700 mb-4">
              {content.message}
            </p>

            <div className={`${content.bgColor} border ${content.borderColor} rounded-lg p-4 mb-6`}>
              <p className={`text-sm ${content.iconColor} font-medium`}>
                {content.action}
              </p>
            </div>

            {/* What will be deleted */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-gray-900 mb-2 text-sm">
                What will be deleted:
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• All products in your shop</li>
                <li>• All marketing listings</li>
                <li>• All gallery images</li>
              </ul>
              <p className="text-xs text-gray-500 mt-2">
                ✓ Your profile and settings will be preserved
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              {onUpgrade && (
                <button
                  onClick={onUpgrade}
                  className="w-full bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-black font-black py-3 px-4 rounded-lg border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.9)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,0.9)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-3"
                >
                  <Sword className="w-5 h-5" />
                  <span>UPGRADE TO PREMIUM</span>
                  <Star className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Pricing reminder */}
            {onUpgrade && (
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                  Only <span className="font-bold text-orange-600">R149/month</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
