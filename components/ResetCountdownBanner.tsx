'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, Clock, Info } from 'lucide-react'
import { calculateResetInfo, getResetMessage, shouldShowResetWarning, getWarningSeverity, type ResetInfo } from '@/lib/resetUtils'

interface ResetCountdownBannerProps {
  profileCreatedAt: string | Date
  subscriptionTier: 'free' | 'premium' | 'business'
  onUpgradeClick?: () => void
}

export default function ResetCountdownBanner({ 
  profileCreatedAt, 
  subscriptionTier,
  onUpgradeClick 
}: ResetCountdownBannerProps) {
  const [resetInfo, setResetInfo] = useState<ResetInfo | null>(null)
  const [message, setMessage] = useState<string>('')

  useEffect(() => {
    // Calculate reset info
    const info = calculateResetInfo(profileCreatedAt, subscriptionTier)
    setResetInfo(info)
    setMessage(getResetMessage(info))

    // Update every 10 seconds to keep timer fresh
    const interval = setInterval(() => {
      const updatedInfo = calculateResetInfo(profileCreatedAt, subscriptionTier)
      setResetInfo(updatedInfo)
      setMessage(getResetMessage(updatedInfo))
    }, 10000) // Update every 10 seconds

    return () => clearInterval(interval)
  }, [profileCreatedAt, subscriptionTier])

  // Don't show for premium/business users
  if (subscriptionTier !== 'free' || !resetInfo) return null

  // Don't show if not close to reset
  if (!shouldShowResetWarning(resetInfo)) return null

  const severity = getWarningSeverity(resetInfo)

  const severityStyles = {
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-900',
      subtext: 'text-blue-700',
      icon: Info,
      iconColor: 'text-blue-600'
    },
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-900',
      subtext: 'text-amber-700',
      icon: Clock,
      iconColor: 'text-amber-600'
    },
    danger: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-900',
      subtext: 'text-red-700',
      icon: AlertTriangle,
      iconColor: 'text-red-600'
    }
  }

  const style = severityStyles[severity]
  const Icon = style.icon

  return (
    <div className={`${style.bg} border ${style.border} rounded-lg p-4 mb-6`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 ${style.iconColor} flex-shrink-0 mt-0.5`} />
        <div className="flex-1">
          <h4 className={`font-semibold ${style.text}`}>
            {resetInfo.shouldReset ? '✅ Reset Done' : `⏰ ${message || 'Calculating...'}`}
          </h4>
          <p className={`text-sm ${style.subtext} mt-1`}>
            {resetInfo.shouldReset ? (
              <>
                Your free tier content has been reset. All products and listings have been cleared. 
                Create new content or upgrade to Premium to keep your data permanently.
              </>
            ) : (
              <>
                Free tier accounts reset every 24 hours. All products and listings will be cleared at{' '}
                <strong>{resetInfo.resetDate.toLocaleTimeString()}</strong>.
              </>
            )}
          </p>
          {onUpgradeClick && (
            <button
              onClick={onUpgradeClick}
              className={`mt-3 text-sm font-medium ${style.text} underline hover:no-underline`}
            >
              Upgrade to Premium to keep your content forever →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
