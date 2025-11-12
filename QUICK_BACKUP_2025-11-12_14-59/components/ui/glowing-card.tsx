'use client'

import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface GridBackgroundProps {
  children: ReactNode
  className?: string
}

export function GridBackground({ children, className }: GridBackgroundProps) {
  return (
    <div
      className={cn(
        'relative bg-slate-50 dark:bg-slate-900',
        'bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)]',
        'bg-[size:24px_24px]',
        className
      )}
    >
      {children}
    </div>
  )
}

interface GlowingCardProps {
  children: ReactNode
  className?: string
  glowColor?: string
}

export function GlowingCard({ 
  children, 
  className,
  glowColor = 'emerald'
}: GlowingCardProps) {
  const glowClasses = {
    emerald: 'shadow-emerald-500/25 border-emerald-200 hover:shadow-emerald-500/40',
    blue: 'shadow-blue-500/25 border-blue-200 hover:shadow-blue-500/40',
    purple: 'shadow-purple-500/25 border-purple-200 hover:shadow-purple-500/40',
    orange: 'shadow-orange-500/25 border-orange-200 hover:shadow-orange-500/40'
  }

  return (
    <div
      className={cn(
        'relative rounded-xl border bg-white/80 backdrop-blur-sm',
        'shadow-lg transition-all duration-300 hover:shadow-xl',
        glowClasses[glowColor as keyof typeof glowClasses] || glowClasses.emerald,
        className
      )}
    >
      {children}
    </div>
  )
}
