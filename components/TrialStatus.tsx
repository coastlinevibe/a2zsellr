'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { checkTrialStatus, renewTrial, formatTimeRemaining, TrialStatus } from '@/lib/trialManager'
import { Clock, RefreshCw } from 'lucide-react'

export function TrialStatusBanner() {
  const { user } = useAuth()
  const [trialStatus, setTrialStatus] = useState<TrialStatus | null>(null)
  const [isRenewing, setIsRenewing] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    const checkStatus = async () => {
      const status = await checkTrialStatus(user.id)
      setTrialStatus(status)
      setLoading(false)
    }

    checkStatus()

    // Check every minute
    const interval = setInterval(checkStatus, 60000)
    return () => clearInterval(interval)
  }, [user])

  const handleRenewTrial = async () => {
    if (!user || isRenewing) return

    setIsRenewing(true)
    const success = await renewTrial(user.id)
    
    if (success) {
      // Refresh trial status
      const newStatus = await checkTrialStatus(user.id)
      setTrialStatus(newStatus)
    }
    
    setIsRenewing(false)
  }

  if (loading || !trialStatus || !trialStatus.trialEndDate) {
    return null
  }

  return (
    <div className={`fixed top-16 left-0 right-0 z-40 p-3 border-b-2 border-black ${
      trialStatus.isExpired ? 'bg-red-400' : 'bg-yellow-300'
    }`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-black" />
          <div>
            <p className="font-black text-black text-sm">
              {trialStatus.isExpired ? 'FREE TRIAL EXPIRED' : 'FREE TRIAL'}
            </p>
            <p className="text-xs font-bold text-black">
              {trialStatus.isExpired 
                ? 'Renew your trial to continue using A2Z Sellr' 
                : formatTimeRemaining(trialStatus.timeRemaining)
              }
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {trialStatus.isExpired && (
            <button
              onClick={handleRenewTrial}
              disabled={isRenewing}
              className="bg-green-500 hover:bg-green-600 text-black font-black px-4 py-2 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)] transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isRenewing ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              {isRenewing ? 'RENEWING...' : 'RENEW TRIAL'}
            </button>
          )}
          
          <button
            onClick={() => window.location.href = '/pricing'}
            className="bg-blue-500 hover:bg-blue-600 text-white font-black px-4 py-2 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)] transition-all"
          >
            UPGRADE
          </button>
        </div>
      </div>
    </div>
  )
}