'use client'

import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'
import { checkTrialStatus, formatTimeRemaining, resetUserData, TrialStatus } from '@/lib/trialManager'

interface TrialTimerProps {
  userId: string
  compact?: boolean
  showIcon?: boolean
}

export default function TrialTimer({ 
  userId,
  compact = false,
  showIcon = true
}: TrialTimerProps) {
  const [trialStatus, setTrialStatus] = useState<TrialStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const checkStatus = async () => {
      const status = await checkTrialStatus(userId)
      setTrialStatus(status)
      setLoading(false)
    }

    checkStatus()

    // Update every second for real-time countdown
    const interval = setInterval(checkStatus, 1000)
    return () => clearInterval(interval)
  }, [userId])

  if (loading || !trialStatus || !trialStatus.trialEndDate) {
    return null
  }

  if (compact) {
    return (
      <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
        trialStatus.isExpired 
          ? 'bg-red-100 text-red-700' 
          : 'bg-yellow-100 text-yellow-700'
      }`}>
        {showIcon && <Clock className="w-3 h-3" />}
        <span>
          {trialStatus.isExpired 
            ? 'Trial Expired' 
            : formatTimeRemaining(trialStatus.timeRemaining)
          }
        </span>
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
      trialStatus.isExpired 
        ? 'bg-red-50 border-red-200 text-red-700' 
        : 'bg-yellow-50 border-yellow-200 text-yellow-700'
    }`}>
      {showIcon && <Clock className="w-4 h-4" />}
      <div>
        <p className="text-sm font-medium">
          {trialStatus.isExpired ? 'Trial Expired' : 'Trial Time'}
        </p>
        <p className="text-xs">
          {trialStatus.isExpired 
            ? 'Renew or upgrade to continue' 
            : formatTimeRemaining(trialStatus.timeRemaining)
          }
        </p>
      </div>
    </div>
  )
}