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

  // Don't show if more than 7 days remaining
  if (resetInfo.daysRemaining > 7) return null

  const getTimeDisplay = () => {
    if (resetInfo.shouldReset) {
      return { text: 'RESET DONE', color: 'text-green-600', bgColor: 'bg-green-100' }
    }

    const days = resetInfo.daysRemaining
    const hours = resetInfo.hoursRemaining % 24
    const minutes = Math.floor((resetInfo.hoursRemaining * 60) % 60)
    const seconds = Math.floor(((resetInfo.resetDate.getTime() - currentTime.getTime()) / 1000) % 60)

    let text = ''
    let color = 'text-gray-700'
    let bgColor = 'bg-gray-100'

    if (days > 3) {
      text = `${days}d ${hours}h`
      color = 'text-blue-700'
      bgColor = 'bg-blue-100'
    } else if (days > 1) {
      text = `${days}d ${hours}h ${minutes}m`
      color = 'text-amber-700'
      bgColor = 'bg-amber-100'
    } else if (days === 1) {
      text = `${days}d ${hours}h ${minutes}m`
      color = 'text-orange-700'
      bgColor = 'bg-orange-100'
    } else if (hours > 1) {
      text = `${hours}h ${minutes}m ${seconds}s`
      color = 'text-red-700'
      bgColor = 'bg-red-100'
    } else {
      text = `${minutes}m ${seconds}s`
      color = 'text-red-700'
      bgColor = 'bg-red-100'
    }

    return { text, color, bgColor }
  }

  const getIcon = () => {
    if (resetInfo.shouldReset) return AlertTriangle
    if (resetInfo.daysRemaining <= 1) return Zap
    if (resetInfo.daysRemaining <= 3) return AlertTriangle
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
