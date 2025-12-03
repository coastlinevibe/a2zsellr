'use client'

import {
  Play,
  User,
  MessageCircle,
  Menu,
  Package,
  Crown,
  Star
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface MarketingActionBarProps {
  onVideoPopup: () => void
  onViewProfile: () => void
  onChatWithSeller: () => void
  onViewMenuPopup: () => void
  onNewProductsPopup: () => void
  onUpgrade: () => void
  businessName?: string
  listingTitle?: string
  className?: string
  userTier?: 'free' | 'premium' | 'business'
}

interface ActionButton {
  id: string
  label: string
  sublabel: string
  icon: React.ReactNode
  onClick: () => void
  gradientClasses: string
  isEnabled: boolean
  requiresUpgrade: boolean
}

export function MarketingActionBar({
  onVideoPopup,
  onViewProfile,
  onChatWithSeller,
  onViewMenuPopup,
  onNewProductsPopup,
  onUpgrade,
  businessName,
  listingTitle,
  className,
  userTier = 'free'
}: MarketingActionBarProps) {
  // Button handlers
  const handleVideoPopup = () => {
    onVideoPopup()
  }

  const handleViewMenuPopup = () => {
    onViewMenuPopup()
  }

  const handleNewProductsPopup = () => {
    onNewProductsPopup()
  }

  // Determine which actions are enabled based on user tier
  const getActionPermissions = (actionId: string) => {
    switch (userTier) {
      case 'free':
        return {
          isEnabled: actionId === 'chat',
          requiresUpgrade: actionId !== 'chat'
        }
      case 'premium':
        return {
          isEnabled: !['menu', 'products'].includes(actionId),
          requiresUpgrade: ['menu', 'products'].includes(actionId)
        }
      case 'business':
        return {
          isEnabled: true,
          requiresUpgrade: false
        }
      default:
        return {
          isEnabled: false,
          requiresUpgrade: true
        }
    }
  }

  const allActions: ActionButton[] = [
    {
      id: 'video',
      label: 'View Now',
      sublabel: '',
      icon: <Play className="h-5 w-5" />,
      onClick: handleVideoPopup,
      gradientClasses: 'bg-gradient-to-br from-red-400 via-red-500 to-red-600',
      ...getActionPermissions('video')
    },
    {
      id: 'profile',
      label: 'Seller Profile',
      sublabel: '',
      icon: <User className="h-5 w-5" />,
      onClick: onViewProfile,
      gradientClasses: 'bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600',
      ...getActionPermissions('profile')
    },
    {
      id: 'chat',
      label: 'Open WhatsApp',
      sublabel: '',
      icon: <MessageCircle className="h-5 w-5" />,
      onClick: onChatWithSeller,
      gradientClasses: 'bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600',
      ...getActionPermissions('chat')
    },
    {
      id: 'menu',
      label: 'View More',
      sublabel: '',
      icon: <Menu className="h-5 w-5" />,
      onClick: handleViewMenuPopup,
      gradientClasses: 'bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600',
      ...getActionPermissions('menu')
    },
    {
      id: 'products',
      label: 'Latest products',
      sublabel: '',
      icon: <Package className="h-5 w-5" />,
      onClick: handleNewProductsPopup,
      gradientClasses: 'bg-gradient-to-br from-amber-400 via-orange-400 to-orange-500',
      ...getActionPermissions('products')
    }
  ]

  return (
    <div
      className={cn(
        'rounded-2xl bg-slate-900 p-4 sm:p-5 shadow-[0_20px_60px_-20px_rgba(15,23,42,0.6)] border border-slate-800',
        className
      )}
    >

      <div className={cn(
        'grid gap-2 sm:gap-3 justify-center',
        'grid-cols-2 sm:grid-cols-5'
      )}>
        {allActions.map(action => (
          <div key={action.id} className="relative">
            <button
              onClick={action.isEnabled ? action.onClick : undefined}
              disabled={!action.isEnabled}
              className={cn(
                'group relative isolate overflow-hidden rounded-xl px-4 py-3 text-left transition-transform duration-200 text-white w-full',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900',
                'shadow-lg shadow-black/30',
                'sm:flex sm:flex-col sm:items-start sm:justify-between',
                action.isEnabled ? [
                  'hover:shadow-black/40 hover:-translate-y-1 cursor-pointer',
                  action.gradientClasses
                ] : [
                  'opacity-50 blur-sm cursor-not-allowed',
                  action.gradientClasses
                ]
              )}
            >
              <div className={cn('absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-200 bg-white')} />
              <div className={cn('relative flex items-center gap-3 text-white sm:flex-col sm:items-start sm:gap-2')}>
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-lg border border-white/30 bg-white/10 backdrop-blur-sm text-white transition-transform duration-200',
                    action.isEnabled && 'group-hover:scale-110 group-hover:border-white/60'
                  )}
                >
                  {action.icon}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm leading-tight drop-shadow-sm">{action.label}</p>
                  <p className="text-xs text-white/80">{action.sublabel}</p>
                </div>
              </div>
            </button>

            {/* Upgrade Tier Label */}
            {action.requiresUpgrade && (
              <div className="absolute inset-0 flex items-center justify-center rounded-xl pointer-events-none">
                <div className="bg-gradient-to-r from-green-400 to-emerald-500 text-white text-xs px-3 py-1.5 rounded-lg border border-black font-black flex items-center gap-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]">
                  <Crown className="w-3 h-3" />
                  UPGRADE
                  <Star className="w-2 h-2" />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
