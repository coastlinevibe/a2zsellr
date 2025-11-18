'use client'

import { ReactNode, HTMLAttributes, useState } from 'react'
import { cn } from '@/lib/utils'
import { Eye, EyeOff } from 'lucide-react'

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

interface AnimatedPasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  error?: string
}

export function AnimatedPasswordInput({ 
  label, 
  error, 
  className, 
  ...props 
}: AnimatedPasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          className={cn(
            'w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl',
            'focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500',
            'outline-none transition-all duration-200',
            'placeholder:text-gray-400',
            error && 'border-red-300 focus:border-red-500 focus:ring-red-500',
            className
          )}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none focus:text-gray-700 transition-colors"
        >
          {showPassword ? (
            <EyeOff className="h-5 w-5" />
          ) : (
            <Eye className="h-5 w-5" />
          )}
        </button>
      </div>
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
  return (
    <button
      style={{
        background: '#5cbdfd',
        fontFamily: 'inherit',
        padding: '0.6em 1.3em',
        fontWeight: 900,
        fontSize: '18px',
        border: '3px solid black',
        borderRadius: '0.4em',
        boxShadow: '0.1em 0.1em',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
        opacity: disabled || loading ? 0.5 : 1,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5em'
      }}
      disabled={disabled || loading}
      onMouseEnter={(e) => {
        if (!disabled && !loading) {
          e.currentTarget.style.transform = 'translate(-0.05em, -0.05em)';
          e.currentTarget.style.boxShadow = '0.15em 0.15em';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translate(0, 0)';
        e.currentTarget.style.boxShadow = '0.1em 0.1em';
      }}
      onMouseDown={(e) => {
        if (!disabled && !loading) {
          e.currentTarget.style.transform = 'translate(0.05em, 0.05em)';
          e.currentTarget.style.boxShadow = '0.05em 0.05em';
        }
      }}
      onMouseUp={(e) => {
        if (!disabled && !loading) {
          e.currentTarget.style.transform = 'translate(-0.05em, -0.05em)';
          e.currentTarget.style.boxShadow = '0.15em 0.15em';
        }
      }}
      {...props}
    >
      {loading ? (
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-2" />
      ) : null}
      {children}
    </button>
  )
}
