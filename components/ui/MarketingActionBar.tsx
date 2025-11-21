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
  businessName?: string
  listingTitle?: string
  className?: string
}

interface ActionButton {
  id: string
  label: string
  sublabel: string
  icon: React.ReactNode
  onClick: () => void
  gradientClasses: string
}

export function MarketingActionBar({
  onVideoPopup,
  onViewProfile,
  onChatWithSeller,
  onViewMenuPopup,
  onNewProductsPopup,
  businessName,
  listingTitle,
  className
}: MarketingActionBarProps) {
  // Placeholder functions for the new buttons (not activated yet)
  const handleVideoPopup = () => {
    console.log('Video popup - not activated yet')
    onVideoPopup()
  }

  const handleViewMenuPopup = () => {
    console.log('View menu popup - not activated yet')
    onViewMenuPopup()
  }

  const handleNewProductsPopup = () => {
    console.log('New products popup - not activated yet')
    onNewProductsPopup()
  }

  const actions: ActionButton[] = [
    {
      id: 'video',
      label: 'Watch Video',
      sublabel: 'See it in action',
      icon: <Play className="h-5 w-5" />,
      onClick: handleVideoPopup,
      gradientClasses: 'bg-gradient-to-br from-red-400 via-red-500 to-red-600'
    },
    {
      id: 'profile',
      label: 'Business Profile',
      sublabel: 'Complete details',
      icon: <User className="h-5 w-5" />,
      onClick: onViewProfile,
      gradientClasses: 'bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600'
    },
    {
      id: 'chat',
      label: 'Message Seller',
      sublabel: 'Get instant help',
      icon: <MessageCircle className="h-5 w-5" />,
      onClick: onChatWithSeller,
      gradientClasses: 'bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600'
    },
    {
      id: 'menu',
      label: 'Browse Menu',
      sublabel: 'All offerings',
      icon: <Menu className="h-5 w-5" />,
      onClick: handleViewMenuPopup,
      gradientClasses: 'bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600'
    },
    {
      id: 'products',
      label: 'Latest Items',
      sublabel: '3 new arrivals',
      icon: <Package className="h-5 w-5" />,
      onClick: handleNewProductsPopup,
      gradientClasses: 'bg-gradient-to-br from-amber-400 via-orange-400 to-orange-500'
    }
  ]

  return (
    <div
      className={cn(
        'rounded-2xl bg-slate-900 p-4 sm:p-5 shadow-[0_20px_60px_-20px_rgba(15,23,42,0.6)] border border-slate-800',
        className
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">Marketing actions</p>
          <h3 className="text-sm font-semibold text-white">
            {listingTitle || 'Campaign'} · {businessName || 'Your brand'}
          </h3>
        </div>
        <div className="hidden sm:flex flex-col items-end text-right text-[10px] uppercase tracking-[0.2em] text-slate-500">
          <span>Premium grade</span>
          <span>Footer toolkit</span>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
        {actions.map(action => (
          <button
            key={action.id}
            onClick={action.onClick}
            className={cn(
              'group relative isolate overflow-hidden rounded-xl px-4 py-3 text-left transition-transform duration-200 text-white',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900',
              'shadow-lg shadow-black/30 hover:shadow-black/40 hover:-translate-y-1',
              'sm:flex sm:flex-col sm:items-start sm:justify-between',
              action.gradientClasses
            )}
          >
            <div className={cn('absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-200 bg-white')} />
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
                <p className="text-xs text-white/80">{action.sublabel}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
