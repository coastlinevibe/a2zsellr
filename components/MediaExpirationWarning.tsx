'use client'

import { useState } from 'react'
import { Clock, AlertTriangle, X, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MediaExpirationWarningProps {
  expirationDate?: Date
  mediaCount?: number
  onUpgrade?: () => void
  onDismiss?: () => void
}

export function MediaExpirationWarning({ 
  expirationDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
  mediaCount = 3,
  onUpgrade,
  onDismiss
}: MediaExpirationWarningProps) {
  const [isDismissed, setIsDismissed] = useState(false)

  if (isDismissed) return null

  const daysUntilExpiration = Math.ceil((expirationDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  const isExpiringSoon = daysUntilExpiration <= 7
  const isExpired = daysUntilExpiration <= 0

  const handleDismiss = () => {
    setIsDismissed(true)
    onDismiss?.()
  }

  if (!isExpiringSoon && !isExpired) return null

  return (
    <div className={`rounded-lg border p-4 mb-6 ${
      isExpired 
        ? 'bg-red-50 border-red-200' 
        : 'bg-yellow-50 border-yellow-200'
    }`}>
      <div className="flex items-start gap-3">
        <div className={`p-1 rounded-full ${
          isExpired ? 'bg-red-100' : 'bg-yellow-100'
        }`}>
          {isExpired ? (
            <AlertTriangle className="w-5 h-5 text-red-600" />
          ) : (
            <Clock className="w-5 h-5 text-yellow-600" />
          )}
        </div>
        
        <div className="flex-1">
          <h4 className={`font-medium mb-1 ${
            isExpired ? 'text-red-900' : 'text-yellow-900'
          }`}>
            {isExpired ? 'Media Files Expired' : 'Media Files Expiring Soon'}
          </h4>
          
          <p className={`text-sm mb-3 ${
            isExpired ? 'text-red-700' : 'text-yellow-700'
          }`}>
            {isExpired ? (
              <>Your {mediaCount} media files have expired and are no longer visible to customers.</>
            ) : (
              <>Your {mediaCount} media files will expire in {daysUntilExpiration} day{daysUntilExpiration !== 1 ? 's' : ''}.</>
            )}
          </p>

          <div className="flex items-center gap-3">
            {onUpgrade && (
              <Button
                onClick={onUpgrade}
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Upgrade to Premium
              </Button>
            )}
            
            <button
              onClick={handleDismiss}
              className={`text-sm font-medium ${
                isExpired 
                  ? 'text-red-600 hover:text-red-700' 
                  : 'text-yellow-600 hover:text-yellow-700'
              }`}
            >
              Dismiss
            </button>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className={`p-1 rounded-full hover:bg-opacity-20 ${
            isExpired 
              ? 'text-red-400 hover:bg-red-500' 
              : 'text-yellow-400 hover:bg-yellow-500'
          }`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress Bar */}
      {!isExpired && (
        <div className="mt-3">
          <div className="flex justify-between text-xs text-yellow-600 mb-1">
            <span>Time remaining</span>
            <span>{daysUntilExpiration} days</span>
          </div>
          <div className="w-full bg-yellow-200 rounded-full h-2">
            <div 
              className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.max(0, Math.min(100, (daysUntilExpiration / 30) * 100))}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  )
}
