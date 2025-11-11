'use client'

import { Crown, Sparkles, Zap } from 'lucide-react'

interface PremiumBadgeProps {
  tier: 'free' | 'premium' | 'business'
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  className?: string
}

export function PremiumBadge({ 
  tier, 
  size = 'md', 
  showIcon = true,
  className = '' 
}: PremiumBadgeProps) {
  if (tier === 'free') return null

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5'
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  if (tier === 'premium') {
    return (
      <div className={`inline-flex items-center gap-1.5 bg-orange-100 text-orange-700 rounded-[9px] font-semibold ${sizeClasses[size]} ${className}`}>
        {showIcon && <Sparkles className={`${iconSizes[size]} text-orange-600`} />}
        <span>Premium</span>
      </div>
    )
  }

  if (tier === 'business') {
    return (
      <div className={`inline-flex items-center gap-1.5 bg-blue-100 text-blue-700 rounded-[9px] font-semibold ${sizeClasses[size]} ${className}`}>
        {showIcon && <Crown className={`${iconSizes[size]} text-blue-600`} />}
        <span>Business</span>
      </div>
    )
  }

  return null
}

interface UnlimitedBadgeProps {
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  className?: string
}

export function UnlimitedBadge({ 
  size = 'md', 
  showIcon = true,
  className = '' 
}: UnlimitedBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4'
  }

  return (
    <div className={`inline-flex items-center gap-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full font-bold ${sizeClasses[size]} ${className}`}>
      {showIcon && <Zap className={iconSizes[size]} />}
      <span>Unlimited</span>
    </div>
  )
}

interface TierLimitDisplayProps {
  current: number
  limit: number
  tier: 'free' | 'premium' | 'business'
  itemName: string
  size?: 'sm' | 'md' | 'lg'
}

export function TierLimitDisplay({ 
  current, 
  limit, 
  tier, 
  itemName,
  size = 'md' 
}: TierLimitDisplayProps) {
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }

  // Premium/business users see "Unlimited"
  if (tier !== 'free') {
    return (
      <div className={`flex items-center gap-2 ${sizeClasses[size]}`}>
        <span className="text-gray-600 font-medium">{current} {itemName}</span>
        <UnlimitedBadge size={size === 'lg' ? 'md' : 'sm'} />
      </div>
    )
  }

  // Free tier users see count
  const isAtLimit = current >= limit
  const percentage = (current / limit) * 100

  return (
    <div className={`flex items-center gap-2 ${sizeClasses[size]}`}>
      <span className={`font-semibold ${isAtLimit ? 'text-red-600' : 'text-gray-700'}`}>
        {current}/{limit} {itemName}
      </span>
      {isAtLimit && (
        <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
          Limit Reached
        </span>
      )}
      {!isAtLimit && percentage >= 80 && (
        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
          {limit - current} left
        </span>
      )}
    </div>
  )
}
