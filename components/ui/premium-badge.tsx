'use client'

import { Crown, Sparkles, Sword, Zap } from 'lucide-react'

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
      <div className={`inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 text-white rounded-[9px] font-bold shadow-lg border border-amber-300 ${sizeClasses[size]} ${className}`} 
           style={{ 
             boxShadow: '0 4px 14px 0 rgba(245, 158, 11, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)' 
           }}>
        {showIcon && <Sword className={`${iconSizes[size]} text-white drop-shadow-sm`} />}
        <span className="drop-shadow-sm">Premium</span>
      </div>
    )
  }

  if (tier === 'business') {
    return (
      <div className={`inline-flex items-center gap-1.5 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white rounded-[9px] font-bold shadow-lg border border-blue-400 ${sizeClasses[size]} ${className}`}
           style={{ 
             boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)' 
           }}>
        {showIcon && <Crown className={`${iconSizes[size]} text-white drop-shadow-sm`} />}
        <span className="drop-shadow-sm">Business</span>
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

  // Business users see "Unlimited", Premium users see limits for products/gallery
  if (tier === 'business') {
    return (
      <div className={`flex items-center gap-2 ${sizeClasses[size]}`}>
        <span className="text-gray-600 font-medium">{current} {itemName}</span>
        <UnlimitedBadge size={size === 'lg' ? 'md' : 'sm'} />
      </div>
    )
  }
  
  // Premium users see "Unlimited" only for listings
  if (tier === 'premium' && itemName === 'listings') {
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
