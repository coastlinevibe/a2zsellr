'use client'

import { useEffect, useState } from 'react'
import { Clock, AlertTriangle, Info, Zap } from 'lucide-react'
import { calculateResetInfo, type ResetInfo } from '@/lib/resetUtils'

interface ResetTimerProps {
  profileCreatedAt: string | Date
  lastResetAt?: string | Date | null
  subscriptionTier: 'free' | 'premium' | 'business'
  compact?: boolean
  showIcon?: boolean
}

export default function ResetTimer({ 
  profileCreatedAt, 
  lastResetAt,
  subscriptionTier,
  compact = false,
  showIcon = true
}: ResetTimerProps) {
  const [resetInfo, setResetInfo] = useState<ResetInfo | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    // Calculate reset info based on last reset or creation date
    const baseDate = lastResetAt || profileCreatedAt
    const info = calculateResetInfo(baseDate, subscriptionTier)
    setResetInfo(info)

    // Update every second for real-time countdown
    const interval = setInterval(() => {
      setCurrentTime(new Date())
      const updatedInfo = calculateResetInfo(baseDate, subscriptionTier)
      setResetInfo(updatedInfo)
    }, 1000) // Update every second

    return () => clearInterval(interval)
  }, [profileCreatedAt, lastResetAt, subscriptionTier])

  // Don't show for premium/business users
  if (subscriptionTier !== 'free' || !resetInfo) return null

  // Always show for free users since reset is every 24 hours

  const getTimeDisplay = () => {
    if (resetInfo.shouldReset) {
      return { text: 'RESET DONE', color: 'text-green-600', bgColor: 'bg-green-100' }
    }

    const msRemaining = resetInfo.resetDate.getTime() - currentTime.getTime()
    const minutes = Math.floor(msRemaining / (60 * 1000))
    const seconds = Math.floor((msRemaining % (60 * 1000)) / 1000)

    let text = ''
    let color = 'text-gray-700'
    let bgColor = 'bg-gray-100'

    if (minutes > 3) {
      text = `${minutes}m ${seconds}s`
      color = 'text-blue-700'
      bgColor = 'bg-blue-100'
    } else if (minutes > 1) {
      text = `${minutes}m ${seconds}s`
      color = 'text-amber-700'
      bgColor = 'bg-amber-100'
    } else if (minutes === 1) {
      text = `${minutes}m ${seconds}s`
      color = 'text-orange-700'
      bgColor = 'bg-orange-100'
    } else {
      text = `${seconds}s`
      color = 'text-red-700'
      bgColor = 'bg-red-100'
    }

    return { text, color, bgColor }
  }

  const getIcon = () => {
    if (resetInfo.shouldReset) return AlertTriangle
    const msRemaining = resetInfo.resetDate.getTime() - currentTime.getTime()
    const minutes = Math.floor(msRemaining / (60 * 1000))
    
    if (minutes <= 1) return Zap
    if (minutes <= 2) return AlertTriangle
    return Clock
  }

  const display = getTimeDisplay()
  const Icon = getIcon()

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full ${display.bgColor}`}>
        {showIcon && <Icon className={`w-3 h-3 ${display.color}`} />}
        <span className={`text-xs font-mono font-semibold ${display.color}`}>
          {display.text}
        </span>
      </div>
    )
  }

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${display.bgColor} border border-${display.color.replace('text-', '')}`}>
      {showIcon && <Icon className={`w-4 h-4 ${display.color}`} />}
      <div>
        <div className={`text-sm font-mono font-bold ${display.color}`}>
          {display.text}
        </div>
        <div className={`text-xs ${display.color} opacity-75`}>
          {resetInfo.shouldReset ? 'Reset required' : 'until reset'}
        </div>
      </div>
    </div>
  )
}
