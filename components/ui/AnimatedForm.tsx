'use client'

import { ReactNode, HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface AnimatedFormProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export function AnimatedForm({ children, className, ...props }: AnimatedFormProps) {
  return (
    <div
      className={cn(
        'animate-in fade-in-0 slide-in-from-bottom-4 duration-500',
        'bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl',
        'w-full max-w-sm mx-auto',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

interface AnimatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function AnimatedInput({ 
  label, 
  error, 
  className, 
  ...props 
}: AnimatedInputProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        className={cn(
          'w-full px-4 py-3 border border-gray-300 rounded-xl',
          'focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500',
          'outline-none transition-all duration-200',
          'placeholder:text-gray-400',
          error && 'border-red-300 focus:border-red-500 focus:ring-red-500',
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}

interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export function AnimatedButton({ 
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  className,
  disabled,
  ...props 
}: AnimatedButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2'
  
  const variants = {
    primary: 'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500 active:scale-95',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500 active:scale-95',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-emerald-500 active:scale-95'
  }
  
  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg'
  }

  return (
    <button
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        (disabled || loading) && 'opacity-50 cursor-not-allowed',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-2" />
      ) : null}
      {children}
    </button>
  )
}
