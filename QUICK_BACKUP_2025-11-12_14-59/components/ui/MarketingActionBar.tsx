'use client'

import { useState } from 'react'
import {
  MessageCircle,
  Share2,
  Megaphone,
  Copy,
  ExternalLink
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface MarketingActionBarProps {
  onContactShop: () => void
  onWhatsAppShare: () => void
  onShare: () => void
  onViewProfile: () => void
  shareUrl: string
  businessName?: string
  listingTitle?: string
  onCopyLink?: () => Promise<void> | void
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
  onContactShop,
  onWhatsAppShare,
  onShare,
  onViewProfile,
  shareUrl,
  businessName,
  listingTitle,
  onCopyLink,
  className
}: MarketingActionBarProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      if (onCopyLink) {
        await onCopyLink()
      } else if (shareUrl) {
        await navigator.clipboard.writeText(shareUrl)
      }
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy link', error)
      setCopied(false)
    }
  }

  const actions: ActionButton[] = [
    {
      id: 'chat',
      label: 'Direct Chat',
      sublabel: 'Reply now',
      icon: <MessageCircle className="h-5 w-5" />,
      onClick: onContactShop,
      gradientClasses: 'bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600'
    },
    {
      id: 'broadcast',
      label: 'Status Share',
      sublabel: 'WhatsApp blast',
      icon: <Megaphone className="h-5 w-5" />,
      onClick: onWhatsAppShare,
      gradientClasses: 'bg-gradient-to-br from-amber-400 via-orange-400 to-orange-500'
    },
    {
      id: 'share',
      label: 'Quick Share',
      sublabel: 'Send anywhere',
      icon: <Share2 className="h-5 w-5" />,
      onClick: onShare,
      gradientClasses: 'bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-500'
    },
    {
      id: 'copy',
      label: copied ? 'Link Copied' : 'Copy Link',
      sublabel: copied ? 'Ready to paste' : 'For later',
      icon: <Copy className="h-5 w-5" />,
      onClick: handleCopy,
      gradientClasses: copied
        ? 'bg-gradient-to-br from-lime-400 via-emerald-500 to-lime-500'
        : 'bg-gradient-to-br from-purple-400 via-fuchsia-500 to-purple-600'
    },
    {
      id: 'profile',
      label: 'View Profile',
      sublabel: 'Full catalog',
      icon: <ExternalLink className="h-5 w-5" />,
      onClick: onViewProfile,
      gradientClasses: 'bg-gradient-to-br from-rose-400 via-red-500 to-rose-600'
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
