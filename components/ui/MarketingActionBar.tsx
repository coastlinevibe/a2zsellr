'use client'

import {
  Play,
  User,
  MessageCircle,
  Menu,
  Package
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

  const actions: ActionButton[] = [
    {
      id: 'video',
      label: 'Watch Video',
      sublabel: 'See it in action',
      icon: <Play className="h-5 w-5" />,
      onClick: handleVideoPopup,
      gradientClasses: 'bg-gradient-to-br from-red-400 via-red-500 to-red-600',
      ...getActionPermissions('video')
    },
    {
      id: 'profile',
      label: 'Business Profile',
      sublabel: 'Complete details',
      icon: <User className="h-5 w-5" />,
      onClick: onViewProfile,
      gradientClasses: 'bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600',
      ...getActionPermissions('profile')
    },
    {
      id: 'chat',
      label: 'Message Seller',
      sublabel: 'Get instant help',
      icon: <MessageCircle className="h-5 w-5" />,
      onClick: onChatWithSeller,
      gradientClasses: 'bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600',
      ...getActionPermissions('chat')
    },
    {
      id: 'menu',
      label: 'Browse Menu',
      sublabel: 'All offerings',
      icon: <Menu className="h-5 w-5" />,
      onClick: handleViewMenuPopup,
      gradientClasses: 'bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600',
      ...getActionPermissions('menu')
    },
    {
      id: 'products',
      label: 'Latest Items',
      sublabel: '3 new arrivals',
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

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
        {actions.map(action => (
          <button
            key={action.id}
            onClick={action.isEnabled ? action.onClick : onUpgrade}
            className={cn(
              'group relative isolate overflow-hidden rounded-xl px-4 py-3 text-left transition-transform duration-200 text-white',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900',
              'shadow-lg shadow-black/30 hover:shadow-black/40 hover:-translate-y-1',
              'sm:flex sm:flex-col sm:items-start sm:justify-between',
              action.isEnabled ? action.gradientClasses : 'bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600',
              !action.isEnabled && 'opacity-75'
            )}
          >
            <div className={cn('absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-200 bg-white')} />
            {action.requiresUpgrade && (
              <div className="absolute top-1 right-1 bg-yellow-400 text-black text-xs px-1.5 py-0.5 rounded-full font-bold">
                UPGRADE
              </div>
            )}
            <div className={cn('relative flex items-center gap-3 text-white sm:flex-col sm:items-start sm:gap-2')}>
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-lg border border-white/30 bg-white/10 backdrop-blur-sm text-white transition-transform duration-200',
                  'group-hover:scale-110 group-hover:border-white/60'
                )}
              >
                {action.icon}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm leading-tight drop-shadow-sm">{action.label}</p>
                <p className="text-xs text-white/80">
                  {action.requiresUpgrade ? 'Upgrade tier' : action.sublabel}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
