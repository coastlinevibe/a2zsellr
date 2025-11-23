'use client'
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react'

interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: string) => boolean
}

interface ValidationResult {
  isValid: boolean
  message: string
  type: 'error' | 'warning' | 'success' | 'info'
}

interface FormValidationProps {
  value: string
  rules: ValidationRule
  label: string
  showValidation?: boolean
}

export function validateField(value: string, rules: ValidationRule, label: string): ValidationResult {
  // Required field validation
  if (rules.required && (!value || !value.trim())) {
    return {
      isValid: false,
      message: `${label} is required`,
      type: 'error'
    }
  }

  // If field is empty and not required, it's valid
  if (!value || !value.trim()) {
    return {
      isValid: true,
      message: '',
      type: 'info'
    }
  }

  // Min length validation
  if (rules.minLength && value.trim().length < rules.minLength) {
    return {
      isValid: false,
      message: `${label} must be at least ${rules.minLength} characters`,
      type: 'error'
    }
  }

  // Max length validation
  if (rules.maxLength && value.trim().length > rules.maxLength) {
    return {
      isValid: false,
      message: `${label} must be less than ${rules.maxLength} characters`,
      type: 'error'
    }
  }

  // Pattern validation
  if (rules.pattern && !rules.pattern.test(value.trim())) {
    return {
      isValid: false,
      message: getPatternErrorMessage(label, rules.pattern),
      type: 'error'
    }
  }

  // Custom validation
  if (rules.custom && !rules.custom(value.trim())) {
    return {
      isValid: false,
      message: `${label} format is invalid`,
      type: 'error'
    }
  }

  // All validations passed
  return {
    isValid: true,
    message: `${label} looks good!`,
    type: 'success'
  }
}

function getPatternErrorMessage(label: string, pattern: RegExp): string {
  // Common pattern error messages
  if (pattern.source.includes('@')) {
    return `${label} must be a valid email address`
  }
  if (pattern.source.includes('http')) {
    return `${label} must be a valid URL (e.g., https://example.com)`
  }
  if (pattern.source.includes('[0-9]')) {
    return `${label} must contain only numbers`
  }
  if (pattern.source.includes('[a-zA-Z0-9\\s\\-_]')) {
    return `${label} can only contain letters, numbers, spaces, hyphens, and underscores`
  }
  return `${label} format is invalid`
}

export default function FormValidation({ 
  value, 
  rules, 
  label, 
  showValidation = true 
}: FormValidationProps) {
  if (!showValidation) return null

  const validation = validateField(value, rules, label)
  
  if (!validation.message) return null

  const getIcon = () => {
    switch (validation.type) {
      case 'error':
        return <AlertTriangle className="w-4 h-4" />
      case 'success':
        return <CheckCircle2 className="w-4 h-4" />
      case 'warning':
        return <AlertTriangle className="w-4 h-4" />
      case 'info':
        return <Info className="w-4 h-4" />
      default:
        return null
    }
  }

  const getColorClasses = () => {
    switch (validation.type) {
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'success':
        return 'text-emerald-600 bg-emerald-50 border-emerald-200'
      case 'warning':
        return 'text-amber-600 bg-amber-50 border-amber-200'
      case 'info':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className={`mt-1 flex items-start gap-2 p-2 rounded-md border text-xs ${getColorClasses()}`}>
      {getIcon()}
      <span className="flex-1">{validation.message}</span>
    </div>
  )
}

// Predefined validation rules for common fields
export const validationRules = {
  displayName: {
    required: true,
    minLength: 3,
    maxLength: 50
  },
  bio: {
    required: true,
    minLength: 20,
    maxLength: 500
  },
  phoneNumber: {
    required: true,
    pattern: /^[\+]?[0-9\s\-\(\)]{10,15}$/
  },
  websiteUrl: {
    required: false,
    pattern: /^(https?:\/\/)?(www\.)?[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/
  },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  }
}

// Helper function to get input border color based on validation
export function getInputBorderColor(value: string, rules: ValidationRule, showValidation: boolean = true): string {
  if (!showValidation || !value) return 'border-gray-300'
  
  const validation = validateField(value, rules, '')
  
  if (validation.isValid && validation.type === 'success') {
    return 'border-emerald-500 focus:border-emerald-500 focus:ring-emerald-500'
  }
  if (!validation.isValid) {
    return 'border-red-500 focus:border-red-500 focus:ring-red-500'
  }
  
  return 'border-gray-300 focus:border-emerald-500 focus:ring-emerald-500'
}
