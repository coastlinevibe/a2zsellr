'use client'

import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface MovingBorderButtonProps {
  children: ReactNode
  className?: string
  containerClassName?: string
  borderClassName?: string
  duration?: number
  borderRadius?: string
  as?: React.ElementType
  [key: string]: any
}

export function MovingBorderButton({
  children,
  className,
  containerClassName,
  borderClassName,
  duration = 2000,
  borderRadius = '1.75rem',
  as: Component = 'button',
  ...otherProps
}: MovingBorderButtonProps) {
  return (
    <Component
      className={cn(
        'relative inline-flex h-12 overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50',
        containerClassName
      )}
      {...otherProps}
    >
      <span
        className={cn(
          'absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]',
          borderClassName
        )}
        style={{
          animationDuration: `${duration}ms`,
        }}
      />
      <span
        className={cn(
          'inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-3 py-1 text-sm font-medium text-white backdrop-blur-3xl',
          className
        )}
        style={{
          borderRadius: borderRadius,
        }}
      >
        {children}
      </span>
    </Component>
  )
}
